const { safeParseJSON, normalizeCategory } = require("./helpers");

const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || "").trim();
const DEFAULT_TEXT_MODELS = [
  process.env.GEMINI_TEXT_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean);
const DEFAULT_EMBEDDING_MODELS = [
  process.env.GEMINI_EMBEDDING_MODEL,
  "text-embedding-004",
  "embedding-001",
].filter(Boolean);
const GEMINI_API_BASE = (process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com").replace(/\/+$/, "");
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 15000);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeoutMs = GEMINI_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
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

function buildGeminiUrls(model, action) {
  return [
    `${GEMINI_API_BASE}/v1beta/models/${model}:${action}?key=${GEMINI_API_KEY}`,
    `${GEMINI_API_BASE}/v1/models/${model}:${action}?key=${GEMINI_API_KEY}`,
  ];
}

async function callGeminiGenerateContent(parts, models = DEFAULT_TEXT_MODELS) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  let lastError = "Unknown Gemini error.";

  for (const model of models) {
    const urls = buildGeminiUrls(model, "generateContent");
    for (const url of urls) {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const response = await fetchWithTimeout(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts }] }),
          });

          if (!response.ok) {
            const errText = await response.text();
            lastError = `${model}: ${response.status} ${errText}`;
            // Retry only likely transient failures.
            if ((response.status === 429 || response.status >= 500) && attempt < 2) {
              await delay(350);
              continue;
            }
            break;
          }

          const data = await response.json();
          const output = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
          if (output.trim()) return output;

          lastError = `${model}: Empty response content.`;
          break;
        } catch (error) {
          lastError = `${model}: ${error.message}`;
          if (attempt < 2) {
            await delay(350);
            continue;
          }
        }
      }
    }
  }

  if (lastError.includes("PERMISSION_DENIED") || lastError.includes("API key not valid")) {
    throw new Error("Gemini auth failed. Check GEMINI_API_KEY and API access permissions.");
  }

  throw new Error(`Gemini request failed. ${lastError}. Check internet/firewall and Gemini API availability.`);
}

async function analyzeWasteWithGemini(imageBase64, mimeType) {
  if (!GEMINI_API_KEY) {
    return {
      itemType: "Unknown item",
      category: "reusable",
      confidence: 0.55,
      estimatedWeightKg: 0.2,
      recommendedAction:
        "Gemini API key missing. Set GEMINI_API_KEY, then retry for AI-based classification.",
      alternativeActions: [
        "Keep dry waste separate from wet waste",
        "Check local recycling guidelines",
        "Avoid mixed disposal to improve recovery rate",
      ],
      reason: "Fallback response was used because API key is not configured.",
    };
  }

  const prompt = `
You are a waste segregation and climate impact assistant.
Classify the waste item in this image into exactly one category:
- biodegradable
- hazardous
- reusable

Reply strictly in JSON with this schema:
{
  "itemType": "short item name",
  "category": "biodegradable|hazardous|reusable",
  "confidence": 0.0 to 1.0,
  "estimatedWeightKg": number,
  "recommendedAction": "single best action to reduce maximum carbon footprint",
  "alternativeActions": ["action 1", "action 2", "action 3"],
  "reason": "why this category and action were chosen"
}
No markdown, no extra text.
`.trim();

  try {
    const outputText = await callGeminiGenerateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64,
        },
      },
    ]);
    const parsed = safeParseJSON(outputText) || extractJsonObject(outputText);

    return {
      itemType: parsed?.itemType || "Unknown item",
      category: normalizeCategory(parsed?.category),
      confidence: Number(parsed?.confidence) >= 0 ? Number(parsed.confidence) : 0.7,
      estimatedWeightKg:
        Number(parsed?.estimatedWeightKg) > 0 ? Number(parsed.estimatedWeightKg) : 0.2,
      recommendedAction:
        parsed?.recommendedAction ||
        "Segregate this item and route it through an approved recycling center.",
      alternativeActions: Array.isArray(parsed?.alternativeActions)
        ? parsed.alternativeActions.slice(0, 3)
        : [],
      reason: parsed?.reason || "Model returned an incomplete response.",
    };
  } catch (error) {
    return {
      itemType: "Unknown item",
      category: "reusable",
      confidence: 0.5,
      estimatedWeightKg: 0.2,
      recommendedAction:
        "Image analysis failed. Try a clearer image (jpg/png/webp) and ensure stable internet.",
      alternativeActions: [
        "Use bright lighting and a close-up image",
        "Avoid blurry or multiple-item images",
        "Retry after a few seconds",
      ],
      reason: `Fallback response used because AI image analysis failed: ${error.message}`,
    };
  }
}

async function createTextEmbedding(text) {
  if (!GEMINI_API_KEY) {
    return [];
  }

  for (const model of DEFAULT_EMBEDDING_MODELS) {
    const urls = buildGeminiUrls(model, "embedContent");
    for (const url of urls) {
      try {
        const response = await fetchWithTimeout(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${model}`,
            content: {
              parts: [{ text }],
            },
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const values = data?.embedding?.values || [];
        if (values.length) return values;
      } catch {
        // Try next endpoint/model.
      }
    }
  }

  return [];
}

async function generateEcoReply({ userMessage, contextTexts }) {
  const hasContext = contextTexts.length > 0;
  const contextBlock = hasContext
    ? contextTexts.map((text, idx) => `Context ${idx + 1}: ${text}`).join("\n")
    : "No context found.";

  const prompt = `
You are ECO, an English-only voice chatbot that can answer both:
1) General user questions
2) Sustainability/dashboard questions

Rules:
- Reply only in English.
- Keep responses concise, clear, and practical.
- If the user asks about waste, carbon, dashboard totals, or past analyses, use the provided context.
- If the question is general (not related to waste/dashboard), answer normally using your general knowledge.
- Do not force dashboard context into unrelated answers.
- If information is missing for a data-specific request, say what is missing.
- If no context is available but user asks about waste segregation, still provide accurate best-practice guidance from your own knowledge.

Context:
${contextBlock}

User:
${userMessage}
`.trim();

  try {
    return await callGeminiGenerateContent([{ text: prompt }]);
  } catch {
    if (!hasContext) {
      return "I could not read your saved context right now, but here is general guidance: separate wet/biodegradable waste, dry recyclables, and hazardous waste (batteries, chemicals, e-waste) into different bins and follow local collection rules.";
    }
    return "I could not reach the AI service right now. Please retry in a moment.";
  }
}

module.exports = { analyzeWasteWithGemini, createTextEmbedding, generateEcoReply };
