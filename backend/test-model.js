/**
 * Quick test script to verify TensorFlow model loading
 * Run with: node test-model.js
 */

const path = require("path");
const { ensureModelLoaded } = require("./utils/localWasteModel");

async function testModel() {
  console.log("=".repeat(60));
  console.log("TensorFlow Model Test");
  console.log("=".repeat(60));
  console.log("");

  try {
    console.log("[Test] Loading TensorFlow model...");
    const modelData = await ensureModelLoaded();

    console.log("");
    console.log("[Test] ✓ Model loaded successfully!");
    console.log("");
    console.log("Model Details:");
    console.log("  • Directory:", modelData.modelDir);
    console.log("  • Input Size:", `${modelData.inputHeight}x${modelData.inputWidth}`);
    console.log("  • Classes:", modelData.labels.length);
    console.log("  • Labels:", modelData.labels.join(", "));
    console.log("");
    console.log("[Test] ✓ All checks passed!");
    console.log("=".repeat(60));
    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("[Test] ✗ FAILED:", error.message);
    console.error("");
    console.error("Troubleshooting:");
    console.error("  1. Ensure model files exist in: c:\\Users\\Shreyansh Thakur\\Downloads\\My image model");
    console.error("  2. Required files: model.json, weights.bin, metadata.json");
    console.error("  3. Set TFJS_MODEL_DIR in .env if using custom location");
    console.error("");
    console.error("Full error:");
    console.error(error);
    console.error("=".repeat(60));
    process.exit(1);
  }
}

testModel();
