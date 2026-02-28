const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/analyze", async (req, res) => {
  const { category } = req.body;

  // Default average weights (kg)
  const defaultWeights = {
    Biodegradable: 0.3,
    Recyclable: 0.2,
    Hazardous: 0.1
  };

  const weight = defaultWeights[category] || 0.2;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
The detected waste category is: ${category}.
Assume weight is ${weight} kg.

1. Estimate carbon footprint reduction potential in kg CO2.
2. Explain briefly how proper disposal reduces emissions.
3. Give a short sustainability suggestion.
                `
              }
            ]
          }
        ]
      }
    );

    const result =
      response.data.candidates[0].content.parts[0].text;

    res.json({ result });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Gemini API error" });
  }
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});