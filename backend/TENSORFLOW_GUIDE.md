# TensorFlow Model Setup Guide

## Overview

This project uses a **local TensorFlow.js model** (MobileNetV2 architecture trained with Teachable Machine) for waste classification. The model runs entirely on the server without requiring cloud API calls.

## Model Details

- **Architecture**: MobileNetV2
- **Framework**: TensorFlow.js (tfjs)
- **Training**: Google Teachable Machine
- **Input Size**: 224x224 pixels (RGB)
- **Output Classes**: 3 (biodegradable, recyclable, hazardous)
- **Format**: TensorFlow.js Layers Model

## Required Files

The model requires these files to be present:

```
My image model/
├── model.json          # Model architecture and metadata
├── weights.bin         # Pre-trained weights
└── metadata.json       # Label and training metadata
```

## Model Location

The model can be placed in any of these locations (checked in order):

1. **Custom location** via `TFJS_MODEL_DIR` environment variable
2. `../../My image model` (relative to backend directory)
3. `../My image model` (relative to backend directory)
4. `My image model` (in backend root)
5. `c:\Users\Shreyansh Thakur\Downloads\My image model` (default)

### Current Status

The model is expected at:
```
c:\Users\Shreyansh Thakur\Downloads\My image model
```

## Setup Instructions

### 1. Verify Model Files

Ensure your model directory contains:
```bash
# Check if model files exist
ls "c:\Users\Shreyansh Thakur\Downloads\My image model"
```

Expected output:
```
metadata.json
model.json
weights.bin
```

### 2. Install Dependencies

Required npm packages:
```bash
cd backend
npm install @tensorflow/tfjs jimp
```

Currently installed:
- `@tensorflow/tfjs@^4.22.0` ✓
- `jimp@^0.22.12` ✓

### 3. Create Environment Configuration

Create or update `.env` file in `backend/` directory:

```env
# Optional: Custom model directory (if not using defaults)
TFJS_MODEL_DIR=/path/to/model

# Other config
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wastewise
```

### 4. Test Model Loading

Run the test script to verify model loads correctly:

```bash
cd backend
node test-model.js
```

Expected output:
```
============================================================
TensorFlow Model Test
============================================================

[Test] Loading TensorFlow model...

[Test] ✓ Model loaded successfully!

Model Details:
  • Directory: c:\Users\Shreyansh Thakur\Downloads\My image model
  • Input Size: 224x224
  • Classes: 3
  • Labels: biodegradable, recyclable, hazardous

[Test] ✓ All checks passed!
============================================================
```

## How It Works

### Image Classification Pipeline

1. **Image Reception**: Frontend sends base64-encoded image
2. **Base64 Decoding**: Convert string to Buffer
3. **Image Processing**: 
   - Decode with Jimp
   - Resize to 224x224
   - Normalize RGB values to [0, 1]
   - Convert to TensorFlow tensor
4. **Model Inference**: Run through TensorFlow.js model
5. **Output Processing**:
   - Extract class probabilities
   - Auto-detect logits vs probabilities
   - Apply softmax if needed
   - Find top prediction
6. **Post-Processing**:
   - Normalize category name (handle typos)
   - Calculate carbon metrics
   - Save to database

### API Endpoint

**POST** `/api/analyze`

Request:
```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAA...",
  "mimeType": "image/jpeg",
  "imageName": "waste-item.jpg"
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "_id": "507f1f77bcf86cd799439011",
    "itemType": "Plastic Bottle",
    "category": "recyclable",
    "confidence": 0.9832,
    "carbonSavedKg": 2.5,
    "carbonEquivalent": "Approx. 41 tree-days...",
    "recommendedAction": "Clean and route to recycling...",
    "classProbabilities": {
      "biodegradable": 0.0123,
      "recyclable": 0.9832,
      "hazardous": 0.0045
    },
    "createdAt": "2026-03-01T10:30:00Z"
  }
}
```

## Troubleshooting

### Issue: Model not found

**Error**:
```
TensorFlow model not found. Searched paths: ...
```

**Solution**:
1. Verify model files exist in the correct directory
2. Check directory name is case-sensitive: "My image model" (not "my image model")
3. Ensure all three files are present: model.json, weights.bin, metadata.json
4. Set `TFJS_MODEL_DIR` environment variable if using custom location

### Issue: Failed to load model artifacts

**Error**:
```
Failed to load model artifacts from ...: ENOENT: ...
```

**Solution**:
1. Verify weights.bin file is not corrupted (check file size > 1MB)
2. Check model.json weightsManifest paths are correct
3. Ensure no file permission issues
4. Try moving model directory to `backend/My image model`

### Issue: Model returns wrong predictions

**Problem**: Model consistently misclassifies items

**Solution**:
1. Verify metadata.json has correct labels
2. Check that model was trained on similar waste images
3. Ensure image is in good lighting condition
4. Try training a new model with more representative images

### Issue: Memory leak or out of memory

**Error**:
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
```

**Solution**:
1. Ensure tensors are properly disposed (auto-handled in new code)
2. Increase Node.js memory: `node --max-old-space-size=4096 server.js`
3. Monitor with: `npm install -g clinic` then `clinic doctor -- node server.js`

## Model Training

To train your own model:

1. Go to [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Select "Image Project"
3. Create 3 classes: biodegradable, recyclable, hazardous
4. Upload training images (50+ per class recommended)
5. Train the model
6. Export as "TensorFlow.js" format
7. Replace files in model directory

## Performance Notes

- **First inference**: ~2-3 seconds (model loading + inference)
- **Subsequent inferences**: ~0.5-1 second
- **Memory usage**: ~100-200MB (model loaded in memory)
- **Tensor memory**: Automatically cleaned up after each inference

## Security Considerations

- Model inference happens server-side (no external API calls)
- No data sent to third parties
- Base64 image decoded only in memory
- Temporary tensors immediately disposed
- No model files exposed to client

## Future Enhancements

- [ ] TensorFlow.js Node backend for faster inference
- [ ] Model quantization for reduced size
- [ ] Batch processing for multiple images
- [ ] Model ensemble for higher accuracy
- [ ] Real-time model updates/retraining
