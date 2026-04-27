const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const auth = require("../middleware/authMiddleware");

// Create Event (Only ORGANIZER)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "ORGANIZER") {
    return res.status(403).json({ message: "Access denied" });
  }

  const event = await Event.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.json(event);
});

// Get All Events
router.get("/", async (req, res) => {
  const events = await Event.find().populate("createdBy", "name email");
  res.json(events);
});

module.exports = router;
