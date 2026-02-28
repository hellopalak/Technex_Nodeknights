const express = require("express");
const router = express.Router();
const { analyze } = require("../controllers/analyzeController");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, analyze);

module.exports = router;
