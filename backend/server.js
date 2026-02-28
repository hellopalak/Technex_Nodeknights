const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const { createPasswordRecord } = require("./utils/crypto");

const authRoutes = require("./routes/auth");
const analyzeRoutes = require("./routes/analyze");
const dashboardRoutes = require("./routes/dashboard");
const healthRoutes = require("./routes/health");
const voiceRoutes = require("./routes/voice");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const DEMO_USER_NAME = process.env.DEMO_USER_NAME || "";
const DEMO_USER_EMAIL = (process.env.DEMO_USER_EMAIL || "").toLowerCase();
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || "";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "25mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/voice", voiceRoutes);

async function ensureDemoUser() {
  if (!DEMO_USER_NAME || !DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) return;
  if (DEMO_USER_PASSWORD.length < 6) {
    console.warn("DEMO_USER_PASSWORD must be at least 6 characters. Skipping demo user seed.");
    return;
  }

  const existingUser = await User.findOne({ email: DEMO_USER_EMAIL });
  if (existingUser) return;

  const { salt, passwordHash } = createPasswordRecord(DEMO_USER_PASSWORD);
  await User.create({
    name: DEMO_USER_NAME,
    email: DEMO_USER_EMAIL,
    salt,
    passwordHash,
  });
  console.log(`Demo user created: ${DEMO_USER_EMAIL}`);
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
