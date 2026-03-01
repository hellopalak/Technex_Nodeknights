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
    contextKey: { type: String, index: true },
  },
  { timestamps: true }
);

botContextSchema.index({ user: 1, sessionId: 1, createdAt: -1 });
botContextSchema.index(
  { user: 1, sessionId: 1, contextKey: 1 },
  {
    name: "user_1_sessionId_1_contextKey_1",
    unique: true,
    partialFilterExpression: {
      role: "knowledge",
      contextKey: { $type: "string" },
    },
  }
);

const BotContext = mongoose.model("BotContext", botContextSchema);

async function ensureBotContextIndexes() {
  const collection = BotContext.collection;
  const indexes = await collection.indexes();

  const contextKeyIndex = indexes.find((idx) => idx.name === "user_1_sessionId_1_contextKey_1");
  const isExpectedPartialIndex = Boolean(
    contextKeyIndex?.partialFilterExpression
      && contextKeyIndex.partialFilterExpression.role === "knowledge"
  );

  if (contextKeyIndex && !isExpectedPartialIndex) {
    await collection.dropIndex("user_1_sessionId_1_contextKey_1");
  }

  await collection.createIndex(
    { user: 1, sessionId: 1, contextKey: 1 },
    {
      name: "user_1_sessionId_1_contextKey_1",
      unique: true,
      partialFilterExpression: {
        role: "knowledge",
        contextKey: { $type: "string" },
      },
    }
  );

  await collection.createIndex(
    { user: 1, sessionId: 1, createdAt: -1 },
    { name: "user_1_sessionId_1_createdAt_-1" }
  );
}

BotContext.ensureBotContextIndexes = ensureBotContextIndexes;

module.exports = BotContext;
