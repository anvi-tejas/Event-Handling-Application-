const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const fs = require("fs");
const path = require("path");

const { initDB, Users } = require("./src/config/database");

dotenv.config();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ─── ENV PATH (ROOT .ENV) ────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, ".env");

// ─── SAFE JWT SECRET SETUP ──────────────────────────────────────────────────
function ensureJWTSecret() {
  if (process.env.JWT_SECRET) {
    console.log("🔐 JWT_SECRET loaded from .env");
    return;
  }

  const secret = crypto.randomBytes(32).toString("hex");
  process.env.JWT_SECRET = secret;

  // Prevent duplicate writes
  const envFile = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  if (!envFile.includes("JWT_SECRET=")) {
    fs.appendFileSync(envPath, `\nJWT_SECRET=${secret}`);
    console.log("🔐 JWT_SECRET auto-generated and saved to .env");
  } else {
    console.log("🔐 JWT_SECRET already exists in .env file");
  }
}

ensureJWTSecret();

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/users", require("./src/routes/users"));
app.use("/events", require("./src/routes/events"));
app.use("/participations", require("./src/routes/participations"));
app.use("/notifications", require("./src/routes/notifications"));
app.use("/complaints", require("./src/routes/complaints"));
app.use("/admin", require("./src/routes/admin"));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "VolunteerHub API running ✅" });
});

// ─── ADMIN INITIALIZATION ───────────────────────────────────────────────────
const initAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
    process.exit(1);
  }

  const existingAdmin = Users.findOne((u) => u.role === "ADMIN");

  if (existingAdmin) {
    console.log("✅ Admin already exists →", existingAdmin.email);
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);

  Users.insert({
    name: "System Admin",
    email: adminEmail,
    password: hashed,
    role: "ADMIN",
    verified: true,
    verificationStatus: "VERIFIED",
  });

  console.log("✅ Admin created successfully →", adminEmail);
};

// ─── START SERVER ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

initDB()
  .then(async () => {
    await initAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    console.log("JWT SYSTEM INITIALIZED");
  })
  .catch((err) => {
    console.error("Failed to initialize DB:", err.message);
    process.exit(1);
  });
