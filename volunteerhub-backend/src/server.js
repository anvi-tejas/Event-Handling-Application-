const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { initDB } = require("./config/database");

dotenv.config();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));        // large base64 docs/images
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/users",          require("./routes/users"));
app.use("/events",         require("./routes/events"));
app.use("/participations", require("./routes/participations"));
app.use("/notifications",  require("./routes/notifications"));
app.use("/complaints",     require("./routes/complaints"));
app.use("/admin",          require("./routes/admin"));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "VolunteerHub API running ✅" }));

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize DB:", err);
  process.exit(1);
});
