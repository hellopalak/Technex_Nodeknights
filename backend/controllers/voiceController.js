const BotContext = require("../models/botContext");
const User = require("../models/User");
const { WasteClassification } = require("../models/WasteClassification");
const { createTextEmbedding, generateEcoReply } = require("../utils/gemini");

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) return 0;
  if (a.length !== b.length) return 0;

  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aNorm += a[i] * a[i];
    bNorm += b[i] * b[i];
  }

  const denominator = Math.sqrt(aNorm) * Math.sqrt(bNorm);
  if (!denominator) return 0;
  return dot / denominator;
}

function buildWasteContextText(entry) {
  const alternatives = Array.isArray(entry.alternativeActions) ? entry.alternativeActions.join(", ") : "";
  return [
    `Waste item: ${entry.itemType || "Unknown item"}.`,
    `Category: ${entry.category || "unknown"}.`,
    `Recommended action: ${entry.recommendedAction || "n/a"}.`,
    `Carbon saved: ${entry.carbonSavedKg || 0} kg CO2e.`,
    `Reason: ${entry.reason || "n/a"}.`,
    alternatives ? `Alternative actions: ${alternatives}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildDashboardSummaryText(user) {
  const categoryCounts = user?.categoryCounts || {};
  return [
    `Dashboard totals for ${user?.name || "user"}.`,
    `Total CO2 saved till now: ${user?.totalCarbonSavedKg || 0} kg CO2e.`,
    `Total items managed: ${user?.totalItemsManaged || 0}.`,
    `Total analyses: ${user?.totalAnalyses || 0}.`,
    `Total classifications: ${user?.totalClassifications || 0}.`,
    `Category counts - biodegradable: ${categoryCounts.biodegradable || 0}, hazardous: ${categoryCounts.hazardous || 0}, recyclable: ${categoryCounts.recyclable || 0}.`,
  ].join(" ");
}

async function syncWasteContexts(userId, sessionId) {
  const user = await User.findById(userId).lean();
  if (user) {
    const summaryText = buildDashboardSummaryText(user);
    const summaryEmbedding = await createTextEmbedding(summaryText);
    if (summaryEmbedding.length) {
      await BotContext.findOneAndUpdate(
        {
          user: userId,
          sessionId,
          contextKey: "dashboard:summary",
        },
        {
          $set: {
            role: "knowledge",
            text: summaryText,
            embedding: summaryEmbedding,
            language: "en",
            source: "dashboard-summary",
            contextKey: "dashboard:summary",
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  const wasteRows = await WasteClassification.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  for (const row of wasteRows) {
    const text = buildWasteContextText(row);
    const embedding = await createTextEmbedding(text);
    if (!embedding.length) continue;

    await BotContext.findOneAndUpdate(
      {
        user: userId,
        sessionId,
        contextKey: `waste:${row._id.toString()}`,
      },
      {
        $set: {
          role: "knowledge",
          text,
          embedding,
          language: "en",
          source: "waste-record",
          contextKey: `waste:${row._id.toString()}`,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function getAllWasteContextTexts(userId) {
  const rows = await WasteClassification.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  return rows.map(buildWasteContextText);
}

async function getKnowledgeContextsFromDb(userId, sessionId, limit = 300) {
  return BotContext.find({
    user: userId,
    sessionId,
    language: "en",
    role: "knowledge",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

exports.chat = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();
    const sessionId = String(req.body.sessionId || "eco-default").trim();
    const topK = Number(req.body.topK || 4);

    if (!message) {
      return res.status(400).json({ message: "message is required." });
    }

    const user = await User.findById(req.user.userId).lean();
    const summaryText = user ? buildDashboardSummaryText(user) : "";


    try {
      await syncWasteContexts(req.user.userId, sessionId);
    } catch (error) {
      console.warn("ECO context sync skipped:", error.message);
    }

    const queryEmbedding = await createTextEmbedding(message);

    let contextTexts = [];
    const allContexts = await getKnowledgeContextsFromDb(req.user.userId, sessionId, 300);
    if (queryEmbedding.length && allContexts.length) {

      const rankedContexts = allContexts
        .map((item) => ({
          text: item.text,
          score: cosineSimilarity(queryEmbedding, item.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(1, topK))
        .filter((item) => item.score > 0);

      contextTexts = rankedContexts.map((item) => item.text).filter(Boolean);
      if (summaryText && !contextTexts.includes(summaryText)) {
        contextTexts.unshift(summaryText);
      }

      
      if (contextTexts.length < Math.max(2, topK)) {
        const fallbackTexts = allContexts
          .map((item) => item.text)
          .filter(Boolean)
          .slice(0, Math.max(2, topK));
        const merged = [...contextTexts, ...fallbackTexts];
        contextTexts = [...new Set(merged)];
      }
    } else if (allContexts.length) {

      contextTexts = allContexts
        .map((item) => item.text)
        .filter(Boolean)
        .slice(0, Math.max(4, topK));
      if (summaryText && !contextTexts.includes(summaryText)) {
        contextTexts.unshift(summaryText);
      }
    }

    
    if (!contextTexts.length) {
      const allWasteTexts = await getAllWasteContextTexts(req.user.userId);
      contextTexts = [summaryText, ...allWasteTexts].filter(Boolean);
    }

    const reply = await generateEcoReply({ userMessage: message, contextTexts });

    let userTurn = null;
    let assistantTurn = null;
    const userEmbedding = queryEmbedding.length ? queryEmbedding : [0];
    const generatedReplyEmbedding = await createTextEmbedding(reply);
    const replyEmbedding = generatedReplyEmbedding.length ? generatedReplyEmbedding : [0];

    try {
      userTurn = await BotContext.create({
        user: req.user.userId,
        sessionId,
        role: "user",
        text: message,
        embedding: userEmbedding,
        language: "en",
        source: "chat",
        contextKey: "",
      });

      assistantTurn = await BotContext.create({
        user: req.user.userId,
        sessionId,
        role: "assistant",
        text: reply,
        embedding: replyEmbedding,
        language: "en",
        source: "chat",
        contextKey: "",
      });
    } catch (error) {
      console.warn("ECO chat turn save skipped:", error.message);
    }

    return res.json({
      botName: "ECO",
      reply,
      contextUsed: contextTexts,
      messageSaved: userTurn?._id || null,
      replySaved: assistantTurn?._id || null,
      usedWasteContext: contextTexts.length > 0,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate ECO response.", error: error.message });
  }
};

exports.listContexts = async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId || "eco-default").trim();

    const contexts = await BotContext.find({
      user: req.user.userId,
      sessionId,
      language: "en",
      role: "knowledge",
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("text source createdAt")
      .lean();

    return res.json({ contexts });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load contexts.", error: error.message });
  }
};
