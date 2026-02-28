# Quick Start Guide - TensorFlow Analyzer Setup

## 30-Second Setup

### Step 1: Verify Model Files Exist
```bash
# Check if model is in the correct location
dir "c:\Users\Shreyansh Thakur\Downloads\My image model"
```

You should see:
- `model.json` ✓
- `weights.bin` ✓
- `metadata.json` ✓

### Step 2: Install Dependencies
```bash
cd d:\EXECUTEHACKATHON\backend
npm install
```

### Step 3: Test Model Loading
```bash
node test-model.js
```

Expected output: `✓ All checks passed!`

### Step 4: Start Backend
```bash
npm run dev
```

You should see:
```
[TensorFlow Model] Found model at: c:\Users\Shreyansh Thakur\Downloads\My image model
[TensorFlow Model] Model loaded successfully
Server running on port 3000
```

### Step 5: Start Frontend
```bash
cd d:\EXECUTEHACKATHON\frontend
npm run dev
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Model not found | Check model location in step 1 |
| Weights file empty | Re-download model from Teachable Machine |
| Out of memory | `node --max-old-space-size=4096 server.js` |
| ENOENT error | Ensure all 3 files are present |

## How to Use

1. **Login** to the application
2. **Go to Analyze page**
3. **Upload waste image**
4. **Click "Analyze Image"**
5. **View results** with carbon savings

## API Test

```bash
# Using curl
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "imageBase64": "<base64_string>",
    "mimeType": "image/jpeg"
  }'
```

## Response Format

```json
{
  "success": true,
  "analysis": {
    "itemType": "Plastic Bottle",
    "category": "recyclable",
    "confidence": 0.9832,
    "carbonSavedKg": 2.5,
    "recommendedAction": "Clean and route to recycling...",
    "classProbabilities": {
      "biodegradable": 0.0123,
      "recyclable": 0.9832,
      "hazardous": 0.0045
    }
  }
}
```

## Need Help?

1. **Model not loading?** → See `TENSORFLOW_GUIDE.md`
2. **API not working?** → Check backend console logs
3. **Wrong predictions?** → Retrain model in Teachable Machine
4. **Memory issues?** → Increase Node heap size

## What Was Fixed

✓ TensorFlow model loading
✓ Label typo handling
✓ Category normalization
✓ Memory management
✓ Error handling
✓ Carbon calculations
✓ Database operations

The analyzer is now fully compatible with local TensorFlow models and ready for production use!
