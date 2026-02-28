const { WasteClassification } = require("../models/WasteClassification");
const User = require("../models/User");

exports.summary = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email totalCarbonSavedKg totalItemsManaged totalAnalyses totalClassifications categoryCounts"
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    const recentAnalyses = await WasteClassification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json({
      totals: {
        totalCarbonSavedKg: user.totalCarbonSavedKg,
        totalItemsManaged: user.totalItemsManaged,
        totalAnalyses: user.totalAnalyses,
        totalClassifications: user.totalClassifications,
        categoryCounts: user.categoryCounts,
      },
      recentAnalyses,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard.", error: error.message });
  }
};

exports.history = async (req, res) => {
  try {
    const analyses = await WasteClassification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({
      analyses: analyses.map((entry) => ({
        ...entry,
        category: entry.category === "recyclable" ? "reusable" : entry.category,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load history.", error: error.message });
  }
};
