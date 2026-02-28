const mongoose = require("mongoose");

const botContextSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionId: { type: String, default: "eco-default", index: true },
    role: {
      type: String,
      enum: ["knowledge", "user", "assistant"],
      required: true,
    },
    text: { type: String, required: true, trim: true },
    embedding: [{ type: Number, required: true }],
    language: { type: String, default: "en", index: true },
    source: { type: String, default: "manual" },
    contextKey: { type: String, default: "", index: true },
  },
  { timestamps: true }
);

botContextSchema.index({ user: 1, sessionId: 1, createdAt: -1 });
botContextSchema.index({ user: 1, sessionId: 1, contextKey: 1 }, { unique: true, sparse: true });

const BotContext = mongoose.model("BotContext", botContextSchema);

module.exports = BotContext;
