const router = require("express").Router();
const { Participations, Events, Notifications, Attendance } = require("../config/database");

// ─── POST /participations/join ───────────────────────────────────────────────
router.post("/join", (req, res) => {
  try {
    const { eventId, volunteerEmail } = req.body;
    if (!eventId || !volunteerEmail)
      return res.status(400).json({ message: "eventId and volunteerEmail required" });

    const event = Events.findById(eventId);
    if (!event) return res.status(404).send("Event not found");

    if (event.status !== "APPROVED")
      return res.status(400).send("This event is not yet approved");

    const existing = Participations.findOne(
      p => p.eventId === Number(eventId) && p.volunteerEmail === volunteerEmail
    );
    if (existing) return res.status(400).send("You have already applied for this event");

    // Check capacity
    const approvedCount = Participations.count(
      p => p.eventId === Number(eventId) && p.status === "APPROVED"
    );
    if (event.requiredVolunteers > 0 && approvedCount >= event.requiredVolunteers)
      return res.status(400).send("This event is full");

    Participations.insert({
      eventId:        Number(eventId),
      volunteerEmail,
      status:         "PENDING",
      attended:       null,
      rating:         null,
      feedback:       "",
    });

    // Notify organizer
    Notifications.insert({
      userEmail: event.organizerEmail,
      title:     "New Volunteer Request 👋",
      message:   `${volunteerEmail} has requested to join "${event.title}".`,
      type:      "info",
      read:      false,
    });

    res.send("Join request sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to join event");
  }
});

// ─── GET /participations/event/:eventId ──────────────────────────────────────
router.get("/event/:eventId", (req, res) => {
  res.json(Participations.findAll(p => p.eventId === Number(req.params.eventId)));
});

// ─── GET /participations/volunteer/:email ─────────────────────────────────────
router.get("/volunteer/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  res.json(Participations.findAll(p => p.volunteerEmail === email));
});

// ─── PUT /participations/update-status/:id?status= ───────────────────────────
router.put("/update-status/:id", (req, res) => {
  const status = (req.query.status || req.body.status || "").toUpperCase();
  if (!["APPROVED","REJECTED","PENDING"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const part = Participations.findById(req.params.id);
  if (!part) return res.status(404).json({ message: "Participation not found" });

  // Capacity check on approve
  if (status === "APPROVED") {
    const event = Events.findById(part.eventId);
    if (event && event.requiredVolunteers > 0) {
      const approvedCount = Participations.count(
        p => p.eventId === part.eventId && p.status === "APPROVED" && p.id !== part.id
      );
      if (approvedCount >= event.requiredVolunteers)
        return res.status(400).send("Volunteer limit reached for this event");
    }
  }

  const updated = Participations.update(req.params.id, { status });

  // Notify volunteer
  const event = Events.findById(part.eventId);
  Notifications.insert({
    userEmail: part.volunteerEmail,
    title:     `Request ${status === "APPROVED" ? "Approved ✅" : "Updated"}`,
    message:   `Your request for "${event?.title || "event"}" has been ${status.toLowerCase()}.`,
    type:      status === "APPROVED" ? "success" : "info",
    read:      false,
  });

  res.json(updated);
});

// ─── DELETE /participations/cancel/:eventId/:email ───────────────────────────
router.delete("/cancel/:eventId/:email", (req, res) => {
  const { eventId, email } = req.params;
  const part = Participations.findOne(
    p => p.eventId === Number(eventId) && p.volunteerEmail === decodeURIComponent(email)
  );
  if (!part)             return res.status(404).send("Participation not found");
  if (part.status !== "PENDING")
    return res.status(400).send("Only pending requests can be cancelled");

  Participations.delete(part.id);
  res.send("Request cancelled successfully");
});

// ─── PUT /participations/feedback/:id ────────────────────────────────────────
router.put("/feedback/:id", (req, res) => {
  const { rating, feedback } = req.body;
  const part = Participations.findById(req.params.id);
  if (!part) return res.status(404).json({ message: "Participation not found" });

  const updated = Participations.update(req.params.id, {
    rating:   Number(rating),
    feedback: feedback || "",
  });
  res.json(updated);
});

// ─────────────────────────────────────────────────────────────────────────────
//  ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PUT /participations/attendance/mark
 * ?eventId=&volunteerEmail=&date=YYYY-MM-DD&attended=true|false
 */
router.put("/attendance/mark", (req, res) => {
  const { eventId, volunteerEmail, date, attended } = req.query;
  if (!eventId || !volunteerEmail || !date)
    return res.status(400).send("eventId, volunteerEmail and date are required");

  const attendedBool = attended === "true";

  const existing = Attendance.findOne(
    a => a.eventId === Number(eventId) && a.volunteerEmail === volunteerEmail && a.date === date
  );

  if (existing) {
    Attendance.update(existing.id, { attended: attendedBool });
  } else {
    Attendance.insert({ eventId: Number(eventId), volunteerEmail, date, attended: attendedBool });
  }

  res.send("Attendance marked");
});

/**
 * GET /participations/attendance/list
 * ?eventId=&date=YYYY-MM-DD
 */
router.get("/attendance/list", (req, res) => {
  const { eventId, date } = req.query;
  const records = Attendance.findAll(
    a => a.eventId === Number(eventId) && a.date === date
  );
  res.json(records);
});

/**
 * GET /participations/attendance/summary
 * ?eventId=&volunteerEmail=
 * Returns { presentDays, absentDays, percentage, records }
 */
router.get("/attendance/summary", (req, res) => {
  const { eventId, volunteerEmail } = req.query;
  const records = Attendance.findAll(
    a => a.eventId === Number(eventId) && a.volunteerEmail === volunteerEmail
  );

  const presentDays = records.filter(r => r.attended === true).length;
  const absentDays  = records.filter(r => r.attended === false).length;
  const total       = records.length;
  const percentage  = total === 0 ? 0 : Math.round((presentDays / total) * 100);

  res.json({ presentDays, absentDays, total, percentage, records });
});

module.exports = router;
