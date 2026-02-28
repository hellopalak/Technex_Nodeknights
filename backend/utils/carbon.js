function estimateCarbonSaved(category, weightKg, actionText) {
  const factorByCategory = {
    reusable: 2.6,
    biodegradable: 0.9,
    hazardous: 1.8,
  };
  let multiplier = 1;
  const action = (actionText || "").toLowerCase();
  if (action.includes("reuse") || action.includes("repair")) multiplier = 1.2;
  if (action.includes("recycle")) multiplier = 1.05;
  if (action.includes("compost")) multiplier = 0.85;
  if (action.includes("certified hazardous") || action.includes("authorized")) multiplier = 1.1;
  const base = factorByCategory[category] || 1.2;
  return Number((Math.max(weightKg, 0.05) * base * multiplier).toFixed(2));
}

function getCarbonEquivalent(carbonSavedKg) {
  const treesPerYearKg = 21;
  const carPerKmKg = 0.192;
  const treeDays = Math.round((carbonSavedKg / treesPerYearKg) * 365);
  const carKm = Math.round(carbonSavedKg / carPerKmKg);
  return `Approx. ${treeDays} tree-days of CO2 absorption or ${carKm} km avoided by a petrol car.`;
}

module.exports = {
  estimateCarbonSaved,
  getCarbonEquivalent,
};
