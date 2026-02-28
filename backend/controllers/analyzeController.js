const User = require("../models/User");
const { WasteClassification } = require("../models/WasteClassification");
const { classifyWasteWithLocalModel } = require("../utils/localWasteModel");
const { generateAnalyzeInsightsWithGemini } = require("../utils/gemini");
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

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Gemini insight step (after local classification).
    const dashboardSnapshot = {
      totalCarbonSavedKg: user.totalCarbonSavedKg || 0,
      totalItemsManaged: user.totalItemsManaged || 0,
      totalAnalyses: user.totalAnalyses || 0,
      categoryCounts: user.categoryCounts || {},
    };

    const geminiInsights = await generateAnalyzeInsightsWithGemini({
      imageBase64: cleanedImageBase64,
      mimeType,
      predictedCategory: category === "recyclable" ? "reusable" : category,
      confidence: Number(aiResult.confidence || 0),
      itemType: String(aiResult.itemType || "Unknown"),
      estimatedWeightKg: Number(aiResult.estimatedWeightKg || 0.2),
      dashboardSnapshot,
    });

    const geminiReason = String(geminiInsights?.reason || "");
    const geminiUsed = geminiReason && !geminiReason.toLowerCase().includes("fallback");
    if (!geminiUsed) {
      console.warn(`[Analyze] Gemini fallback used. Reason: ${geminiReason || "Unknown"}`);
    }

    const recommendedAction = String(
      geminiInsights?.recommendedAction || aiResult.recommendedAction || "Segregate for appropriate disposal."
    );
    const alternativeActions = Array.isArray(geminiInsights?.alternativeActions)
      ? geminiInsights.alternativeActions.map((v) => String(v)).slice(0, 3)
      : Array.isArray(aiResult.alternativeActions)
        ? aiResult.alternativeActions.map(String).slice(0, 3)
        : [];

    // Calculate carbon metrics (Gemini estimate first, deterministic fallback next).
    const geminiCarbon = Number(geminiInsights?.estimatedCarbonSavedKg);
    const ruleBasedCarbon = estimateCarbonSaved(
      category,
      aiResult.estimatedWeightKg,
      recommendedAction
    );
    let validCarbonSaved = Number.isFinite(geminiCarbon) && geminiCarbon > 0
      ? Number(geminiCarbon.toFixed(2))
      : ruleBasedCarbon;

    if (isNaN(validCarbonSaved) || validCarbonSaved < 0) {
      console.warn("[Analyze] Invalid carbon calculation, defaulting to 0.5kg");
      validCarbonSaved = 0.5;
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
      recommendedAction,
      alternativeActions,
      carbonSavedKg: validCarbonSaved,
      carbonEquivalent,
      reason: String(
        geminiInsights?.reason || aiResult.reason || "Classified by local TensorFlow model."
      ),
      modelLabel: String(aiResult.modelLabel || aiResult.itemType || "Unknown"),
      classProbabilities: aiResult.classProbabilities || {},
    };

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
      dashboardData: {
        totalCarbonSavedKg: user.totalCarbonSavedKg,
        totalItemsManaged: user.totalItemsManaged,
        totalAnalyses: user.totalAnalyses,
        categoryCounts: user.categoryCounts,
      },
      geminiSummary: String(geminiInsights?.dashboardSummary || ""),
      geminiStatus: {
        used: geminiUsed,
        reason: geminiReason || "No reason provided.",
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
