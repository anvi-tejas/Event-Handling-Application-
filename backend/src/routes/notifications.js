const router = require("express").Router();
const { Notifications } = require("../config/database");

// GET /notifications/:email  – list all for a user
router.get("/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const list  = Notifications.findAll(n => n.userEmail === email)
                              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// GET /notifications/count/:email  – unread count
router.get("/count/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const count = Notifications.count(n => n.userEmail === email && !n.read);
  res.json(count);
});

// PUT /notifications/read/:id  – mark one as read
router.put("/read/:id", (req, res) => {
  const updated = Notifications.update(req.params.id, { read: true });
  if (!updated) return res.status(404).json({ message: "Notification not found" });
  res.json(updated);
});

// PUT /notifications/read-all/:email  – mark all as read
router.put("/read-all/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  Notifications.updateWhere(n => n.userEmail === email, { read: true });
  res.json({ message: "All marked as read" });
});

module.exports = router;
