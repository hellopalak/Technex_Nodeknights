const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
    totalCarbonSavedKg: { type: Number, default: 0 },
    totalItemsManaged: { type: Number, default: 0 },
    totalAnalyses: { type: Number, default: 0 },
    totalClassifications: { type: Number, default: 0 },
    categoryCounts: {
      biodegradable: { type: Number, default: 0 },
      hazardous: { type: Number, default: 0 },
      recyclable: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
