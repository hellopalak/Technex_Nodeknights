function estimateCarbonSaved(category, weightKg, actionText) {
  const factorByCategory = {
    "recyclable": 2.6,
    "biodegradable": 0.9,
    "hazardous": 1.8,
  };

  // Normalize category
  const normalizedCategory = String(category || "recyclable").toLowerCase().trim();
  const factor = factorByCategory[normalizedCategory] || 1.2;

  // Determine action multiplier
  let multiplier = 1;
  const action = (actionText || "").toLowerCase();
  if (action.includes("reuse") || action.includes("repair")) multiplier = 1.2;
  if (action.includes("recycle")) multiplier = 1.05;
  if (action.includes("compost")) multiplier = 0.85;
  if (action.includes("certified") || action.includes("authorized")) multiplier = 1.1;

  // Calculate with safe defaults
  const weight = Math.max(Number(weightKg) || 0.2, 0.05);
  const result = weight * factor * multiplier;
  const rounded = Number(Math.max(0, result).toFixed(2));

  return rounded;
}

function getCarbonEquivalent(carbonSavedKg) {
  const treesPerYearKg = 21;
  const carPerKmKg = 0.192;
  
  const kg = Number(carbonSavedKg) || 0;
  const treeDays = Math.round((kg / treesPerYearKg) * 365);
  const carKm = Math.round(kg / carPerKmKg);

  return `Approx. ${treeDays} tree-days of CO2 absorption or ${carKm} km avoided by a petrol car.`;
}

module.exports = {
  estimateCarbonSaved,
  getCarbonEquivalent,
};
