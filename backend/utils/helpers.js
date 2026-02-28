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
  
  // Match biodegradable (including typos)
  if (value.includes("biodi") || value.includes("bio")) return "biodegradable";
  
  // Match hazardous  
  if (value.includes("haz")) return "hazardous";
  
  // Match recyclable/reusable
  if (value.includes("recy") || value.includes("reuse")) return "recyclable";
  
  // Default
  return "recyclable";
}

module.exports = {
  safeParseJSON,
  normalizeCategory,
};
