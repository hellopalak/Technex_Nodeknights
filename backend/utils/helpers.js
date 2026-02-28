function safeParseJSON(text) {
  if (!text) return null;
  const withoutFences = text.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(withoutFences);
  } catch {
    return null;
  }
}

function normalizeCategory(raw) {
  const value = (raw || "").toLowerCase().trim();
  if (value.includes("bio")) return "biodegradable";
  if (value.includes("haz")) return "hazardous";
  if (value.includes("reuse") || value.includes("recycl")) return "reusable";
  return "reusable";
}

module.exports = {
  safeParseJSON,
  normalizeCategory,
};
