const router = require("express").Router();
const { Complaints, Notifications } = require("../config/database");

// POST /complaints/raise
router.post("/raise", (req, res) => {
  const { userEmail, userRole, subject, message } = req.body;
  if (!userEmail || !subject || !message)
    return res.status(400).json({ message: "userEmail, subject and message are required" });

  const complaint = Complaints.insert({
    userEmail,
    userRole: userRole || "VOLUNTEER",
    subject,
    message,
    status: "OPEN",
  });

  res.status(201).json(complaint);
});

// GET /complaints/admin/all  – all complaints (admin)
router.get("/admin/all", (req, res) => {
  res.json(Complaints.findAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// GET /complaints/user/:email  – complaints by a user
router.get("/user/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  res.json(Complaints.findAll(c => c.userEmail === email));
});

// PUT /complaints/admin/resolve/:id
router.put("/admin/resolve/:id", (req, res) => {
  const complaint = Complaints.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });

  const updated = Complaints.update(req.params.id, { status: "RESOLVED" });

  // Notify user
  Notifications.insert({
    userEmail: complaint.userEmail,
    title:     "Complaint Resolved ✅",
    message:   `Your complaint "${complaint.subject}" has been resolved by admin.`,
    type:      "success",
    read:      false,
  });

  res.json(updated);
});

module.exports = router;
