const express = require("express");
const router = express.Router();
const { summary, history } = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/auth");

router.get("/summary", authMiddleware, summary);
router.get("/history", authMiddleware, history);

module.exports = router;
