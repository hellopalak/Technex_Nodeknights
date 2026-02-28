const fs = require("fs/promises");
const path = require("path");
const tf = require("@tensorflow/tfjs");
const Jimp = require("jimp");
const { normalizeCategory } = require("./helpers");

const ENV_MODEL_DIR = String(process.env.TFJS_MODEL_DIR || "").trim().replace(/^['"]|['"]$/g, "");
const CWD = process.cwd();
const MODULE_DIR = path.resolve(__dirname, "..");
const DEFAULT_MODEL_DIR_CANDIDATES = [
  ENV_MODEL_DIR,
  path.resolve(CWD, "../My image model"),
  path.resolve(CWD, "../my image model"),
  path.resolve(CWD, "My image model"),
  path.resolve(CWD, "my image model"),
  path.resolve(MODULE_DIR, "../My image model"),
  path.resolve(MODULE_DIR, "../my image model"),
  path.resolve(MODULE_DIR, "../../My image model"),
  path.resolve(MODULE_DIR, "../../my image model"),
].filter(Boolean);

let cached = null;
let loadingPromise = null;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function fixModelLabelTypos(labels) {
  return labels.map(label => {
    const normalized = String(label || "").toLowerCase().trim();
    if (normalized.includes("biodi") || normalized.includes("bio")) return "biodegradable";
    if (normalized.includes("recy") || normalized.includes("reuse")) return "recyclable";
    if (normalized.includes("haz")) return "hazardous";
    return label;
  });
}

function defaultLabels() {
  return ["biodegradable", "recyclable", "hazardous"];
}


function getActionPreset(category) {
  const categoryMap = {
    "biodegradable": {
      recommendedAction: "Send for composting or municipal wet-waste collection.",
      alternativeActions: [
        "Keep wet waste separate from dry waste",
        "Use a home compost bin if possible",
        "Avoid plastic contamination in the bin",
      ],
    },
    "hazardous": {
      recommendedAction: "Dispose via an authorized hazardous or e-waste collection point.",
      alternativeActions: [
        "Never mix with regular household waste",
        "Store in a sealed container temporarily",
        "Use certified local hazardous collection drives",
      ],
    },
    "recyclable": {
      recommendedAction: "Clean and route to a dry-waste recycling stream.",
      alternativeActions: [
        "Rinse and dry before disposal",
        "Segregate by material type where possible",
        "Prefer reuse before recycling",
      ],
    },
  };

  const action = categoryMap[category] || categoryMap["recyclable"];
  return action;
}

function toArrayBuffer(buf) {
  if (!buf) throw new Error("Cannot convert null/undefined Buffer to ArrayBuffer");
  const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  if (!arrayBuf || arrayBuf.byteLength === 0) {
    throw new Error("Failed to create ArrayBuffer from weights");
  }
  return arrayBuf;
}

async function loadMetadata(modelDir) {
  const metadataPath = path.join(modelDir, "metadata.json");
  try {
    const raw = await fs.readFile(metadataPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[TensorFlow Model] Warning: Could not load metadata from ${metadataPath}:`, err.message);
    return null;
  }
}

async function resolveModelDir() {
  for (const rawDir of DEFAULT_MODEL_DIR_CANDIDATES) {
    const dir = path.resolve(rawDir);
    const modelPath = path.join(dir, "model.json");
    if (await fileExists(modelPath)) {
      console.log(`[TensorFlow Model] Found model at: ${dir}`);
      return dir;
    }
  }

  throw new Error(
    `TensorFlow.js model not found. Searched paths:\n${DEFAULT_MODEL_DIR_CANDIDATES.join("\n")}\n\nSet TFJS_MODEL_DIR in backend/.env or place model in one of the above directories.`
  );
}

async function loadModelArtifactsFromFs(modelDir) {
  try {
    const modelPath = path.join(modelDir, "model.json");
    const modelJsonRaw = await fs.readFile(modelPath, "utf8");
    const modelJson = JSON.parse(modelJsonRaw);

    const weightsManifest = modelJson.weightsManifest || [];
    if (!weightsManifest.length) {
      throw new Error("No weightsManifest found in model.json");
    }

    const weightSpecs = weightsManifest.flatMap((group) => group.weights || []);
    const weightPaths = weightsManifest.flatMap((group) => group.paths || []);

    if (!weightSpecs.length || !weightPaths.length) {
      throw new Error("No weight specifications or paths found in weightsManifest");
    }

    const weightBuffers = [];
    for (const relPath of weightPaths) {
      const absPath = path.join(modelDir, relPath);
      const exists = await fileExists(absPath);
      if (!exists) {
        throw new Error(`Weight file not found: ${absPath}`);
      }
      const bin = await fs.readFile(absPath);
      if (!bin || bin.length === 0) {
        throw new Error(`Weight file is empty: ${absPath}`);
      }
      weightBuffers.push(bin);
    }

    if (!weightBuffers.length) {
      throw new Error("No weight buffers were loaded");
    }

    const weightDataBuffer = Buffer.concat(weightBuffers);
    if (!weightDataBuffer || weightDataBuffer.length === 0) {
      throw new Error("Failed to concatenate weight buffers");
    }

    return {
      modelTopology: modelJson.modelTopology,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
      weightSpecs,
      weightData: toArrayBuffer(weightDataBuffer),
    };
  } catch (error) {
    throw new Error(`Failed to load model artifacts from ${modelDir}: ${error.message}`);
  }
}

async function ensureModelLoaded() {
  if (cached) return cached;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      console.log("[TensorFlow Model] Starting model load...");
      
      const modelDir = await resolveModelDir();
      console.log(`[TensorFlow Model] Loading artifacts from ${modelDir}`);
      
      const artifacts = await loadModelArtifactsFromFs(modelDir);
      console.log("[TensorFlow Model] Creating TensorFlow.js model...");
      
      const model = await tf.loadLayersModel(tf.io.fromMemory(artifacts));
      console.log("[TensorFlow Model] Model loaded successfully");
      
      const metadata = await loadMetadata(modelDir);

      // Get labels from metadata, with typo fixes
      let rawLabels = metadata?.labels || metadata?.classes || metadata?.class_names || null;
      
      if (Array.isArray(rawLabels) && rawLabels.length > 0) {
        // Fix typos in model labels
        rawLabels = fixModelLabelTypos(rawLabels);
        console.log(`[TensorFlow Model] Using labels from metadata: ${rawLabels.join(", ")}`);
      } else {
        rawLabels = defaultLabels();
        console.log(`[TensorFlow Model] Using default labels: ${rawLabels.join(", ")}`);
      }

      // Validate input shape
      const inputShape = model?.inputs?.[0]?.shape || [];
      const inputHeight = Math.max(Number(inputShape[1]) || 224, 1);
      const inputWidth = Math.max(Number(inputShape[2]) || 224, 1);

      console.log(`[TensorFlow Model] Input shape: [${inputHeight}, ${inputWidth}]`);
      console.log(`[TensorFlow Model] Output classes: ${rawLabels.length}`);

      cached = { 
        model, 
        metadata, 
        labels: rawLabels, 
        inputHeight, 
        inputWidth, 
        modelDir 
      };

      console.log("[TensorFlow Model] Model ready for inference");
      return cached;
    } catch (error) {
      console.error("[TensorFlow Model] Failed to load model:", error);
      throw error;
    }
  })();

  try {
    return await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    cached = null;
    throw err;
  }
}

async function imageToInputTensor(imageBuffer, width, height) {
  let image = null;
  try {
    image = await Jimp.read(imageBuffer);
    
    // Resize while maintaining aspect ratio, then crop/pad to exact size
    image.cover(width, height);

    const { data } = image.bitmap;
    if (!data || data.length < width * height * 4) {
      throw new Error(`Image data is corrupted or too small: expected at least ${width * height * 4} bytes, got ${data.length}`);
    }

    // Convert RGBA to RGB and normalize to [0, 1]
    const rgb = new Float32Array(width * height * 3);
    let outIdx = 0;

    for (let i = 0; i < data.length; i += 4) {
      rgb[outIdx] = data[i] / 255;        // R
      rgb[outIdx + 1] = data[i + 1] / 255; // G
      rgb[outIdx + 2] = data[i + 2] / 255; // B
      outIdx += 3;
    }

    const tensor = tf.tensor4d(rgb, [1, height, width, 3], "float32");
    return tensor;
  } catch (error) {
    throw new Error(`Failed to convert image to tensor: ${error.message}`);
  }
}

async function classifyWasteWithLocalModel(imageBase64, mimeType) {
  const base64 = String(imageBase64 || "").replace(/^data:.*;base64,/, "").trim();
  if (!base64) {
    throw new Error("imageBase64 is required for local model inference.");
  }

  let modelData = null;
  let inputTensor = null;
  let output = null;

  try {
    // Load model
    modelData = await ensureModelLoaded();
    const { model, labels, inputHeight, inputWidth, modelDir } = modelData;

    // Decode base64 to buffer
    let imageBuffer;
    try {
      imageBuffer = Buffer.from(base64, "base64");
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("Decoded image buffer is empty");
      }
    } catch (err) {
      throw new Error(`Failed to decode base64 image: ${err.message}`);
    }

    // Convert image to tensor
    console.log(`[TensorFlow Model] Processing image (${imageBuffer.length} bytes) for inference...`);
    inputTensor = await imageToInputTensor(imageBuffer, inputWidth, inputHeight);

    if (!inputTensor) {
      throw new Error("Failed to create input tensor from image");
    }

    // Run inference
    console.log("[TensorFlow Model] Running inference...");
    output = model.predict(inputTensor);

    if (!output) {
      throw new Error("Model prediction returned null/undefined");
    }

    // Extract scores from output
    const scoresTensor = Array.isArray(output) ? output[0] : output;
    if (!scoresTensor) {
      throw new Error("Could not extract scores tensor from model output");
    }

    let scores = Array.from(await scoresTensor.data());
    if (!scores || scores.length === 0) {
      throw new Error("Model output scores are empty");
    }

    console.log(`[TensorFlow Model] Raw scores: ${scores.map((s) => s.toFixed(4)).join(", ")}`);

    // Auto-detect if output is logits or probabilities
    const sum = scores.reduce((a, b) => a + b, 0);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    
    // If sum is ~1.0 and all values are [0, 1], it's already probabilities
    const looksLikeProbabilities = sum > 0.95 && sum < 1.05 && minScore >= 0 && maxScore <= 1;

    if (!looksLikeProbabilities) {
      console.log("[TensorFlow Model] Converting logits to probabilities (softmax)...");
      // Apply softmax: e^x / sum(e^x)
      const shifted = scores.map((v) => v - Math.max(...scores)); // Numerical stability
      const exp = shifted.map((v) => Math.exp(v));
      const expSum = exp.reduce((a, b) => a + b, 0) || 1;
      scores = exp.map((v) => v / expSum);
    }

    // Map labels
    const safeLabels =
      labels.length === scores.length
        ? labels.map((v) => String(v || "unknown"))
        : Array.from({ length: scores.length }, (_, i) => labels[i] || `class_${i}`);

    // Find top prediction
    let topIndex = 0;
    let topScore = -Infinity;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > topScore) {
        topScore = scores[i];
        topIndex = i;
      }
    }

    const rawLabel = String(safeLabels[topIndex] || "unknown");
    const category = normalizeCategory(rawLabel);
    const confidence = Number(Math.max(0, Math.min(1, topScore || 0)).toFixed(4));

    // Build class probabilities object
    const classProbabilities = {};
    safeLabels.forEach((label, index) => {
      const score = Math.max(0, Math.min(1, scores[index] || 0));
      classProbabilities[label] = Number(score.toFixed(4));
    });

    const actions = getActionPreset(category);

    console.log(`[TensorFlow Model] Classified as: ${rawLabel} (${category}) with confidence ${confidence}`);

    return {
      itemType: rawLabel,
      modelLabel: rawLabel,
      category,
      confidence,
      estimatedWeightKg: 0.2,
      recommendedAction: actions.recommendedAction,
      alternativeActions: actions.alternativeActions,
      reason: `Predicted by local TensorFlow.js model (${mimeType || "image"}) with confidence ${(confidence * 100).toFixed(1)}%. Model architecture: MobileNetV2. Location: ${modelDir}`,
      classProbabilities,
    };
  } catch (error) {
    console.error("[TensorFlow Model] Inference error:", error);
    throw new Error(`TensorFlow model inference failed: ${error.message}`);
  } finally {
    // Cleanup tensors to prevent memory leaks
    if (inputTensor) {
      try {
        inputTensor.dispose();
      } catch (err) {
        console.warn("[TensorFlow Model] Warning: Failed to dispose input tensor:", err.message);
      }
    }

    if (output) {
      try {
        if (Array.isArray(output)) {
          output.forEach((t) => {
            if (t && typeof t.dispose === "function") {
              t.dispose();
            }
          });
        } else if (output && typeof output.dispose === "function") {
          output.dispose();
        }
      } catch (err) {
        console.warn("[TensorFlow Model] Warning: Failed to dispose output tensors:", err.message);
      }
    }
  }
}

module.exports = {
  classifyWasteWithLocalModel,
  ensureModelLoaded,
};
