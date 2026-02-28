const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const { WasteClassification } = require("./models/WasteClassification");
const { createPasswordRecord, verifyPassword, signToken, verifyToken } = require("./utils/crypto");
const { analyzeWasteWithGemini } = require("./utils/gemini");
const { estimateCarbonSaved, getCarbonEquivalent } = require("./utils/carbon");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const DEMO_USER_NAME = process.env.DEMO_USER_NAME || "";
const DEMO_USER_EMAIL = (process.env.DEMO_USER_EMAIL || "").toLowerCase();
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || "";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Missing auth token" });

  const payload = verifyToken(token);
  if (!payload?.userId) return res.status(401).json({ message: "Invalid or expired token" });

  req.user = payload;
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const { salt, passwordHash } = createPasswordRecord(password);
    const user = await User.create({ name, email, salt, passwordHash });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user.", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login.", error: error.message });
  }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
});

app.post("/api/analyze", authRequired, async (req, res) => {
  try {
    const imageBase64 = req.body.imageBase64;
    const mimeType = req.body.mimeType;
    const imageName = req.body.imageName;

    if (!imageBase64) {
      return res.status(400).json({ message: "imageBase64 is required." });
    }

    const ai = await analyzeWasteWithGemini(imageBase64, mimeType);
    const carbonSavedKg = estimateCarbonSaved(ai.category, ai.estimatedWeightKg, ai.recommendedAction);
    const carbonEquivalent = getCarbonEquivalent(carbonSavedKg);

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const analysis = await WasteClassification.create({
      user: req.user.userId,
      imageName: imageName || "waste-image",
      itemType: ai.itemType,
      category: ai.category,
      confidence: ai.confidence,
      estimatedWeightKg: ai.estimatedWeightKg,
      recommendedAction: ai.recommendedAction,
      alternativeActions: ai.alternativeActions,
      carbonSavedKg,
      carbonEquivalent,
      reason: ai.reason,
    });

    user.totalCarbonSavedKg = Number((user.totalCarbonSavedKg + carbonSavedKg).toFixed(2));
    user.totalItemsManaged += 1;
    user.totalAnalyses += 1;
    user.totalClassifications += 1;

    if (ai.category === "biodegradable") user.categoryCounts.biodegradable += 1;
    if (ai.category === "hazardous") user.categoryCounts.hazardous += 1;
    if (ai.category === "reusable" || ai.category === "recyclable") user.categoryCounts.recyclable += 1;

    await user.save();

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: "Failed to analyze image.", error: error.message });
  }
});

app.get("/api/dashboard/summary", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "totalCarbonSavedKg totalItemsManaged totalAnalyses totalClassifications categoryCounts"
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({
      totals: {
        totalCarbonSavedKg: user.totalCarbonSavedKg,
        totalItemsManaged: user.totalItemsManaged,
        totalAnalyses: user.totalAnalyses,
        totalClassifications: user.totalClassifications,
        categoryCounts: user.categoryCounts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard.", error: error.message });
  }
});

app.get("/api/dashboard/history", authRequired, async (req, res) => {
  try {
    const analyses = await WasteClassification.find({ user: req.user.userId }).sort({ createdAt: -1 }).lean();
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ message: "Failed to load history.", error: error.message });
  }
});

async function ensureDemoUser() {
  if (!DEMO_USER_NAME || !DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) return;
  if (DEMO_USER_PASSWORD.length < 6) return;

  const user = await User.findOne({ email: DEMO_USER_EMAIL });
  if (user) return;

  const { salt, passwordHash } = createPasswordRecord(DEMO_USER_PASSWORD);
  await User.create({
    name: DEMO_USER_NAME,
    email: DEMO_USER_EMAIL,
    salt,
    passwordHash,
  });
}

async function startServer() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is missing. Please set it in backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    await ensureDemoUser();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
