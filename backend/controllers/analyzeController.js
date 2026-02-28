const User = require("../models/User");
const { WasteClassification } = require("../models/WasteClassification");
const { analyzeWasteWithGemini } = require("../utils/gemini");
const { estimateCarbonSaved, getCarbonEquivalent } = require("../utils/carbon");
const { normalizeCategory } = require("../utils/helpers");

exports.analyze = async (req, res) => {
  try {
    const { imageBase64, mimeType, imageName } = req.body;
    const cleanedImageBase64 = String(imageBase64 || "").replace(/^data:.*;base64,/, "").trim();
    if (!cleanedImageBase64) {
      return res.status(400).json({ message: "imageBase64 is required." });
    }

    const aiResult = await analyzeWasteWithGemini(cleanedImageBase64, mimeType);
    const carbonSavedKg = estimateCarbonSaved(
      aiResult.category,
      aiResult.estimatedWeightKg,
      aiResult.recommendedAction
    );
    const carbonEquivalent = getCarbonEquivalent(carbonSavedKg);

    const normalizedCategory = aiResult.category === "reusable" ? "recyclable" : aiResult.category;
    const analysisPayload = {
      user: req.user.userId,
      imageName: imageName || "waste-image",
      itemType: aiResult.itemType,
      category: normalizedCategory,
      confidence: aiResult.confidence,
      estimatedWeightKg: aiResult.estimatedWeightKg,
      recommendedAction: aiResult.recommendedAction,
      alternativeActions: aiResult.alternativeActions,
      carbonSavedKg,
      carbonEquivalent,
      reason: aiResult.reason,
    };

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const analysis = await WasteClassification.create(analysisPayload);

    user.totalCarbonSavedKg = Number((user.totalCarbonSavedKg + carbonSavedKg).toFixed(2));
    user.totalItemsManaged += 1;
    user.totalAnalyses += 1;
    user.totalClassifications += 1;
    if (normalizedCategory === "biodegradable") user.categoryCounts.biodegradable += 1;
    if (normalizedCategory === "hazardous") user.categoryCounts.hazardous += 1;
    if (normalizedCategory === "recyclable") user.categoryCounts.recyclable += 1;
    await user.save();

    return res.json({
      analysis: {
        ...analysis.toObject(),
        category: normalizedCategory === "recyclable" ? "reusable" : normalizedCategory,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to analyze image.", error: error.message });
  }
};
