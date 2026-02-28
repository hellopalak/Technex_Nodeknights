const { safeParseJSON } = require("./helpers");

const API_KEY = String(process.env.GEMINI_API_KEY || "").trim();
const API_BASE = (process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com").replace(/\/+$/, "");
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 20000);

const TEXT_MODELS = [
  process.env.GEMINI_TEXT_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean);

const VISION_MODELS = [
  process.env.GEMINI_VISION_MODEL,
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
].filter(Boolean);

const EMBEDDING_MODELS = [
  process.env.GEMINI_EMBEDDING_MODEL,
  "text-embedding-004",
  "embedding-001",
].filter(Boolean);

function hasApiKey() {
  return Boolean(API_KEY);
}

function extractJsonObject(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function endpointUrls(model, action) {
  return [
    `${API_BASE}/v1beta/models/${model}:${action}?key=${API_KEY}`,
    `${API_BASE}/v1/models/${model}:${action}?key=${API_KEY}`,
  ];
}

async function generateContent(parts, models) {
  if (!hasApiKey()) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  let lastError = "Unknown Gemini error.";
  for (const model of models) {
    const urls = endpointUrls(model, "generateContent");
    for (const url of urls) {
      try {
        const response = await fetchWithTimeout(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = `${model}: ${response.status} ${errText}`;
          continue;
        }

        const data = await response.json();
        const output = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
        if (output.trim()) return output.trim();
        lastError = `${model}: Empty response content.`;
      } catch (error) {
        lastError = `${model}: ${error.message}`;
      }
    }
  }

  throw new Error(lastError);
}

function fallbackAnalyzeInsights(category, dashboardSnapshot, reason) {
  const d = dashboardSnapshot || {};
  let recommendation = "";
  if (category === "biodegradable") {
    recommendation = "Put this in wet waste.\nCompost if possible.\nKeep it separate from dry plastic waste.";
  } else if (category === "hazardous") {
    recommendation = "Keep this in a separate hazardous bin.\nDo not mix with household waste.\nSend it to an authorized hazardous or e-waste center.";
  } else {
    recommendation = "Clean and dry this item.\nPut it in the dry recyclable bin.\nPrefer reuse if it is still usable.";
  }

  return {
    recommendedAction: recommendation,
    alternativeActions: [
      "Use separate bins for wet, dry, and hazardous waste",
      "Avoid contamination while segregating",
      "Follow local municipal collection rules",
    ],
    estimatedCarbonSavedKg: null,
    reason,
    dashboardSummary: `Current totals: ${Number(d.totalItemsManaged || 0)} items managed, ${Number(d.totalAnalyses || 0)} analyses, ${Number(d.totalCarbonSavedKg || 0).toFixed(2)} kg CO2e saved.`,
  };
}

async function generateAnalyzeInsightsWithGemini({
  imageBase64,
  mimeType,
  predictedCategory,
  confidence,
  itemType,
  estimatedWeightKg,
  dashboardSnapshot,
}) {
  if (!hasApiKey()) {
    return fallbackAnalyzeInsights(predictedCategory, dashboardSnapshot, "Gemini key missing. Local fallback used.");
  }

  const prompt = `
You are helping a waste segregation app.
An image is already classified by local ML.
Use this category as primary truth and provide simple user guidance.

Predicted category: ${predictedCategory}
Confidence: ${confidence}
Item label: ${itemType}
Estimated weight: ${estimatedWeightKg} kg
Dashboard snapshot: ${JSON.stringify(dashboardSnapshot || {})}

Return strict JSON only:
{
  "recommendedAction": "2-3 short lines, simple and practical.",
  "alternativeActions": ["short action 1", "short action 2", "short action 3"],
  "estimatedCarbonSavedKg": 0.0,
  "reason": "short reason",
  "dashboardSummary": "1-2 line summary using dashboard snapshot"
}
`.trim();

  try {
    const output = await generateContent(
      [
        { text: prompt },
        { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
      ],
      VISION_MODELS
    );

    const parsed = safeParseJSON(output) || extractJsonObject(output);
    if (!parsed || typeof parsed !== "object") {
      return {
        ...fallbackAnalyzeInsights(
          predictedCategory,
          dashboardSnapshot,
          "Gemini returned non-JSON response. Text fallback used."
        ),
        recommendedAction: output.split("\n").slice(0, 3).join("\n"),
      };
    }

    return {
      recommendedAction: String(parsed.recommendedAction || "").trim(),
      alternativeActions: Array.isArray(parsed.alternativeActions)
        ? parsed.alternativeActions.map((v) => String(v)).slice(0, 3)
        : [],
      estimatedCarbonSavedKg: Number(parsed.estimatedCarbonSavedKg),
      reason: String(parsed.reason || "").trim(),
      dashboardSummary: String(parsed.dashboardSummary || "").trim(),
    };
  } catch (error) {
    return fallbackAnalyzeInsights(
      predictedCategory,
      dashboardSnapshot,
      `Gemini request failed: ${error.message}`
    );
  }
}

async function createTextEmbedding(text) {
  if (!hasApiKey()) return [];

  for (const model of EMBEDDING_MODELS) {
    const urls = endpointUrls(model, "embedContent");
    for (const url of urls) {
      try {
        const response = await fetchWithTimeout(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${model}`,
            content: { parts: [{ text }] },
          }),
        });
        if (!response.ok) continue;
        const data = await response.json();
        const values = data?.embedding?.values || [];
        if (values.length) return values;
      } catch {
        // Try next url/model.
      }
    }
  }
  return [];
}

async function generateEcoReply({ userMessage, contextTexts }) {
  const hasContext = Array.isArray(contextTexts) && contextTexts.length > 0;
  const contextBlock = hasContext
    ? contextTexts.map((text, idx) => `Context ${idx + 1}: ${text}`).join("\n")
    : "No context found.";

  const prompt = `
You are ECO, an English-only sustainability chatbot.
- Reply in clear, concise English.
- Use context when relevant.
- If context is missing, state what is missing and still offer useful guidance.

Context:
${contextBlock}

User:
${userMessage}
`.trim();

  try {
    return await generateContent([{ text: prompt }], TEXT_MODELS);
  } catch {
    return hasContext
      ? "I could not reach the AI service right now. Please retry in a moment."
      : "I could not read saved context right now. General guidance: separate wet, dry, and hazardous waste and follow local disposal rules.";
  }
}

module.exports = {
  createTextEmbedding,
  generateEcoReply,
  generateAnalyzeInsightsWithGemini,
};
