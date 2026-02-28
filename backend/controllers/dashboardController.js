const { WasteClassification } = require("../models/WasteClassification");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.summary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const user = await User.findById(req.user.userId).select(
      "name email totalCarbonSavedKg totalItemsManaged totalAnalyses totalClassifications categoryCounts"
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    const categoryAggregation = await WasteClassification.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          co2SavedKg: { $sum: "$carbonSavedKg" },
        },
      },
    ]);

    const dailyAggregation = await WasteClassification.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalItems: { $sum: 1 },
          totalCo2SavedKg: { $sum: "$carbonSavedKg" },
          biodegradable: {
            $sum: { $cond: [{ $eq: ["$category", "biodegradable"] }, 1, 0] },
          },
          hazardous: {
            $sum: { $cond: [{ $eq: ["$category", "hazardous"] }, 1, 0] },
          },
          reusable: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$category", "reusable"] },
                    { $eq: ["$category", "recyclable"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.day": -1 } },
      { $limit: 60 },
    ]);

    const categoryStats = {
      biodegradable: { count: 0, co2SavedKg: 0 },
      hazardous: { count: 0, co2SavedKg: 0 },
      reusable: { count: 0, co2SavedKg: 0 },
    };

    categoryAggregation.forEach((row) => {
      const sourceKey = row._id === "recyclable" ? "reusable" : row._id;
      if (!categoryStats[sourceKey]) return;
      categoryStats[sourceKey].count += Number(row.count || 0);
      categoryStats[sourceKey].co2SavedKg += Number((row.co2SavedKg || 0).toFixed(2));
    });

    Object.keys(categoryStats).forEach((key) => {
      categoryStats[key].co2SavedKg = Number(categoryStats[key].co2SavedKg.toFixed(2));
    });

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
      categoryStats,
      dailyStats: dailyAggregation.map((row) => ({
        day: row._id.day,
        totalItems: row.totalItems,
        totalCo2SavedKg: Number((row.totalCo2SavedKg || 0).toFixed(2)),
        biodegradable: row.biodegradable,
        hazardous: row.hazardous,
        reusable: row.reusable,
      })),
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
