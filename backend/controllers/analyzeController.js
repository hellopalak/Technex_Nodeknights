const User = require("../models/User");
const { WasteClassification } = require("../models/WasteClassification");
const { classifyWasteWithLocalModel } = require("../utils/localWasteModel");
const { estimateCarbonSaved, getCarbonEquivalent } = require("../utils/carbon");

exports.analyze = async (req, res) => {
  try {
    const { imageBase64, mimeType, imageName } = req.body;
    
    // Validate input
    const cleanedImageBase64 = String(imageBase64 || "").replace(/^data:.*;base64,/, "").trim();
    if (!cleanedImageBase64) {
      return res.status(400).json({ 
        message: "imageBase64 is required (send as base64 string without data: prefix)." 
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    console.log(`[Analyze] Processing image from user ${req.user.userId}`);

    // Run TensorFlow model inference
    let aiResult;
    try {
      aiResult = await classifyWasteWithLocalModel(cleanedImageBase64, mimeType);
    } catch (modelErr) {
      console.error("[Analyze] Model error:", modelErr);
      return res.status(500).json({ 
        message: "Model inference failed.",
        error: modelErr.message 
      });
    }

    if (!aiResult) {
      return res.status(500).json({ message: "Model returned no result." });
    }

    // Validate and fix category
    let category = String(aiResult.category || "recyclable").toLowerCase().trim();
    
    // Normalize to valid categories
    if (category.includes("biodegradable") || category.includes("bio")) {
      category = "biodegradable";
    } else if (category.includes("hazard") || category.includes("haz")) {
      category = "hazardous";
    } else {
      category = "recyclable"; // Default to recyclable
    }

    // Calculate carbon metrics
    const carbonSavedKg = estimateCarbonSaved(
      category,
      aiResult.estimatedWeightKg,
      aiResult.recommendedAction
    );
    
    if (isNaN(carbonSavedKg) || carbonSavedKg < 0) {
      console.warn("[Analyze] Invalid carbon calculation, defaulting to 0.5kg");
      var validCarbonSaved = 0.5;
    } else {
      var validCarbonSaved = carbonSavedKg;
    }

    const carbonEquivalent = getCarbonEquivalent(validCarbonSaved);

    // Prepare analysis record
    const analysisPayload = {
      user: req.user.userId,
      imageName: imageName || "waste-image",
      itemType: String(aiResult.itemType || "Unknown"),
      category,
      confidence: Number(aiResult.confidence || 0),
      estimatedWeightKg: Number(aiResult.estimatedWeightKg || 0.2),
      recommendedAction: String(aiResult.recommendedAction || "Segregate for appropriate disposal."),
      alternativeActions: Array.isArray(aiResult.alternativeActions) 
        ? aiResult.alternativeActions.map(String) 
        : [],
      carbonSavedKg: validCarbonSaved,
      carbonEquivalent,
      reason: String(aiResult.reason || "Classified by local TensorFlow model."),
      modelLabel: String(aiResult.modelLabel || aiResult.itemType || "Unknown"),
      classProbabilities: aiResult.classProbabilities || {},
    };

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Save analysis to database
    let analysis;
    try {
      analysis = await WasteClassification.create(analysisPayload);
    } catch (dbErr) {
      console.error("[Analyze] Database error:", dbErr);
      return res.status(500).json({ 
        message: "Failed to save analysis to database.",
        error: dbErr.message 
      });
    }

    // Update user statistics
    try {
      user.totalCarbonSavedKg = Number((user.totalCarbonSavedKg + validCarbonSaved).toFixed(2));
      user.totalItemsManaged = Number(user.totalItemsManaged || 0) + 1;
      user.totalAnalyses = Number(user.totalAnalyses || 0) + 1;
      user.totalClassifications = Number(user.totalClassifications || 0) + 1;

      // Update category counts
      if (category === "biodegradable") {
        user.categoryCounts.biodegradable = Number(user.categoryCounts.biodegradable || 0) + 1;
      } else if (category === "hazardous") {
        user.categoryCounts.hazardous = Number(user.categoryCounts.hazardous || 0) + 1;
      } else if (category === "recyclable") {
        user.categoryCounts.recyclable = Number(user.categoryCounts.recyclable || 0) + 1;
      }

      await user.save();
    } catch (updateErr) {
      console.error("[Analyze] Error updating user stats:", updateErr);
      // Don't fail the request if stats update fails, the analysis is already saved
    }

    console.log(`[Analyze] Success: ${aiResult.itemType} (${category}) - Carbon: ${validCarbonSaved}kg`);

    return res.json({
      success: true,
      analysis: {
        ...analysis.toObject(),
        category, // Ensure correct category is returned
      },
    });
  } catch (error) {
    console.error("[Analyze] Unexpected error:", error);
    return res.status(500).json({ 
      message: "Failed to analyze image.",
      error: error.message 
    });
  }
};
