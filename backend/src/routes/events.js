const router = require("express").Router();
const { Events, Participations, Notifications, Users } = require("../config/database");

// ─── POST /events/create ─────────────────────────────────────────────────────
router.post("/create", (req, res) => {
  try {
    const {
      title, category, description, organizerEmail,
      startDate, endDate, startTime, endTime, registrationDeadline,
      locationName, address, city, area, mapLink,
      requiredVolunteers, skills, minAge, genderPreference,
    } = req.body;

    if (!title || !organizerEmail)
      return res.status(400).json({ message: "title and organizerEmail are required" });

    const event = Events.insert({
      title, category, description, organizerEmail,
      startDate, endDate, startTime, endTime, registrationDeadline,
      locationName, address, city: city || "", area, mapLink,
      requiredVolunteers: Number(requiredVolunteers) || 0,
      skills, minAge: minAge ? Number(minAge) : null, genderPreference,
      status: "PENDING",
    });

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// ─── GET /events/all ─────────────────────────────────────────────────────────
router.get("/all", (req, res) => {
  res.json(Events.findAll());
});

// ─── GET /events/organizer/:email ────────────────────────────────────────────
router.get("/organizer/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  res.json(Events.findAll(e => e.organizerEmail === email));
});

// ─── GET /events/:id ─────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const event = Events.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

// ─── PUT /events/update/:id ──────────────────────────────────────────────────
router.put("/update/:id", (req, res) => {
  const event = Events.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  const allowed = [
    "title","category","description","startDate","endDate","startTime","endTime",
    "registrationDeadline","locationName","address","city","area","mapLink",
    "requiredVolunteers","skills","minAge","genderPreference",
  ];
  const patch = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });

  const updated = Events.update(req.params.id, patch);
  res.json(updated);
});

// ─── PUT /events/admin/update-status/:id?status= ─────────────────────────────
router.put("/admin/update-status/:id", (req, res) => {
  const status = (req.query.status || req.body.status || "").toUpperCase();
  if (!["APPROVED","REJECTED","PENDING"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const event = Events.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  const updated = Events.update(req.params.id, { status });

  // Notify organizer
  Notifications.insert({
    userEmail: event.organizerEmail,
    title:     `Event ${status === "APPROVED" ? "Approved ✅" : "Rejected ❌"}`,
    message:   `Your event "${event.title}" has been ${status.toLowerCase()} by admin.`,
    type:      status === "APPROVED" ? "success" : "error",
    read:      false,
  });

  res.json(updated);
});

// ─── DELETE /events/delete/:id ───────────────────────────────────────────────
router.delete("/delete/:id", (req, res) => {
  const deleted = Events.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Event not found" });

  // Clean up participations
  Participations.deleteWhere(p => p.eventId === Number(req.params.id));

  res.json({ message: "Event deleted" });
});

module.exports = router;
