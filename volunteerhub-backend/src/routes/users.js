const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { Users, Notifications } = require("../config/database");

const SECRET = process.env.JWT_SECRET || "volunteerhub_secret_key";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

// ─── POST /users/register ────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "VOLUNTEER" } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "name, email and password are required" });

    if (Users.findOne(u => u.email === email))
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = Users.insert({
      name,
      email,
      password:           hashed,
      role:               role.toUpperCase(),
      verified:           false,
      verificationStatus: "PENDING",
      contact:            "",
      gender:             "",
      skills:             "",
      city:               "",
      bio:                "",
      profilePicture:     "",
      documentUrl:        "",
      documentName:       "",
      organizationName:   "",
      occupation:         "",
      age:                null,
      availability:       "",
    });

    // Welcome notification
    Notifications.insert({
      userEmail: email,
      title:     "Welcome to VolunteerHub! 🎉",
      message:   "Thank you for joining. Complete your profile and get verified to start volunteering.",
      type:      "success",
      read:      false,
    });

    return res.status(201).json(safeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ─── POST /users/login ───────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = Users.findOne(u => u.email === email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)  return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });

    return res.json({
      ...safeUser(user),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ─── GET /users/email/:email ─────────────────────────────────────────────────
router.get("/email/:email", (req, res) => {
  const user = Users.findOne(u => u.email === decodeURIComponent(req.params.email));
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(safeUser(user));
});

// ─── PUT /users/update/:email ────────────────────────────────────────────────
router.put("/update/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const user  = Users.findOne(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Allowed fields (password change excluded — add separate endpoint if needed)
  const allowed = [
    "name","contact","gender","skills","city","bio","profilePicture",
    "organizationName","occupation","age","availability",
    "documentUrl","documentName","verificationStatus","verified",
  ];
  const patch = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });

  // If verificationStatus set, sync verified flag
  if (patch.verificationStatus === "VERIFIED") patch.verified = true;
  if (patch.verificationStatus === "REJECTED")  patch.verified = false;

  const updated = Users.update(user.id, patch);
  res.json(safeUser(updated));
});

// ─── PUT /users/upload-document/:email ───────────────────────────────────────
router.put("/upload-document/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const user  = Users.findOne(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { documentUrl, documentName } = req.body;
  const updated = Users.update(user.id, {
    documentUrl,
    documentName,
    verificationStatus: "PENDING",
    verified:           false,
  });

  // Notify user
  Notifications.insert({
    userEmail: email,
    title:     "Document Uploaded",
    message:   "Your document has been uploaded and is pending admin verification.",
    type:      "info",
    read:      false,
  });

  res.json(safeUser(updated));
});

// ─── DELETE /users/delete?email= ─────────────────────────────────────────────
router.delete("/delete", (req, res) => {
  const email = req.query.email;
  const user  = Users.findOne(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot delete admin" });
  Users.delete(user.id);
  res.json({ message: "User deleted" });
});

module.exports = router;
