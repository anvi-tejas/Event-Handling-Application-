const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "volunteerhub_secret_key";

/**
 * Attach req.user if a valid Bearer token is present.
 * Routes that require auth should call requireAuth or requireRole after this.
 */
function attachUser(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch { /* ignore */ }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user)                    return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

module.exports = { attachUser, requireAuth, requireRole };
