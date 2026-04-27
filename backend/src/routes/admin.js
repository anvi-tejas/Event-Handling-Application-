const router = require("express").Router();
const { Users } = require("../config/database");

const safeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

// GET /admin/users/all
router.get("/users/all", (req, res) => {
  res.json(Users.findAll().map(safeUser));
});

// GET /admin/users/:email
router.get("/users/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const user  = Users.findOne(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(safeUser(user));
});

module.exports = router;
