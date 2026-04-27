/**
 * Lightweight in-process database using a JSON file.
 * Swap this out for a real DB (MySQL, PostgreSQL, MongoDB) in production.
 * All data is stored in ./data/db.json and loaded on startup.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

let db = {
  users: [],
  events: [],
  participations: [],
  notifications: [],
  complaints: [],
  attendance: [],
};

let idCounters = {
  users: 1,
  events: 1,
  participations: 1,
  notifications: 1,
  complaints: 1,
  attendance: 1,
};

// ─── Persist ─────────────────────────────────────────────────────────────────
function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ db, idCounters }, null, 2));
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function initDB() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      db = raw.db || db;
      idCounters = raw.idCounters || idCounters;
      // Ensure all tables exist (for schema upgrades)
      for (const key of Object.keys(db)) {
        if (!Array.isArray(db[key])) db[key] = [];
      }
    } catch {
      console.warn("⚠️  DB file corrupted – starting fresh");
    }
  }
  console.log("✅ Database ready");
}

// ─── Generic helpers ─────────────────────────────────────────────────────────
const Table = (name) => ({
  findAll: (pred) => (pred ? db[name].filter(pred) : [...db[name]]),
  findOne: (pred) => db[name].find(pred) || null,
  findById: (id) => db[name].find((r) => r.id === Number(id)) || null,
  insert: (data) => {
    const record = {
      id: idCounters[name]++,
      ...data,
      createdAt: new Date().toISOString(),
    };
    db[name].push(record);
    save();
    return record;
  },
  update: (id, patch) => {
    const idx = db[name].findIndex((r) => r.id === Number(id));
    if (idx === -1) return null;
    db[name][idx] = {
      ...db[name][idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    save();
    return db[name][idx];
  },
  updateWhere: (pred, patch) => {
    db[name] = db[name].map((r) =>
      pred(r) ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r,
    );
    save();
  },
  delete: (id) => {
    const before = db[name].length;
    db[name] = db[name].filter((r) => r.id !== Number(id));
    save();
    return db[name].length < before;
  },
  deleteWhere: (pred) => {
    const before = db[name].length;
    db[name] = db[name].filter((r) => !pred(r));
    save();
    return before - db[name].length;
  },
  count: (pred) => (pred ? db[name].filter(pred).length : db[name].length),
});

module.exports = {
  initDB,
  save,
  Users: Table("users"),
  Events: Table("events"),
  Participations: Table("participations"),
  Notifications: Table("notifications"),
  Complaints: Table("complaints"),
  Attendance: Table("attendance"),
};
