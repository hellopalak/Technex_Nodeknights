const mongoose = require("mongoose");

const WASTE_CATEGORIES = ["biodegradable", "hazardous", "reusable", "recyclable"];

const wasteClassificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    imageName: { type: String, default: "waste-image" },
    itemType: { type: String, default: "Unknown item" },
    category: { type: String, enum: WASTE_CATEGORIES, required: true, index: true },
    confidence: { type: Number, min: 0, max: 1, default: 0.7 },
    estimatedWeightKg: { type: Number, min: 0, default: 0.2 },
    recommendedAction: { type: String, required: true },
    alternativeActions: [{ type: String }],
    carbonSavedKg: { type: Number, min: 0, default: 0 },
    carbonEquivalent: { type: String, default: "" },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

const WasteClassification = mongoose.model("WasteClassification", wasteClassificationSchema);

module.exports = {
  WasteClassification,
  WASTE_CATEGORIES,
};
