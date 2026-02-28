const { verifyToken } = require("../utils/crypto");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing auth token" });

  const payload = verifyToken(token);
  if (!payload?.userId) return res.status(401).json({ message: "Invalid or expired token" });
  req.user = payload;
  next();
}

module.exports = { authMiddleware };
