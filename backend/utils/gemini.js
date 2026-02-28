const { safeParseJSON, normalizeCategory } = require("./helpers");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const outputText =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
  const parsed = safeParseJSON(outputText);

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
}

module.exports = { analyzeWasteWithGemini };
