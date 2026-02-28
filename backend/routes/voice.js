const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { chat, listContexts } = require("../controllers/voiceController");

const router = express.Router();

router.get("/context", authMiddleware, listContexts);
router.post("/chat", authMiddleware, chat);

module.exports = router;
