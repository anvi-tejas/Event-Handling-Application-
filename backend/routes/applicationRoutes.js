const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const auth = require("../middleware/authMiddleware");

// Apply to Event (Only VOLUNTEER)
router.post("/:eventId", auth, async (req, res) => {
  if (req.user.role !== "VOLUNTEER") {
    return res.status(403).json({ message: "Access denied" });
  }

  const application = await Application.create({
    volunteer: req.user.id,
    event: req.params.eventId,
  });

  res.json(application);
});

// Get Applications
router.get("/", auth, async (req, res) => {
  const applications = await Application.find()
    .populate("volunteer", "name email")
    .populate("event", "title");

  res.json(applications);
});

module.exports = router;
