# VolunteerHub – Node.js Backend

A complete REST API for the VolunteerHub volunteer management platform.

---

## Quick Start

```bash
cd volunteerhub-backend
cp .env.example .env        # edit JWT_SECRET
npm install
npm start                   # http://localhost:8080
```

For auto-reload during development:
```bash
npm install -D nodemon
npm run dev
```

---

## Architecture

```
src/
├── server.js            # Express app + startup
├── config/
│   └── database.js      # JSON file-based DB (swap for real DB in prod)
├── middleware/
│   └── auth.js          # JWT auth helpers
└── routes/
    ├── users.js          # Auth + profile management
    ├── events.js         # Event CRUD + admin approval
    ├── participations.js # Join / approve / attendance / feedback
    ├── notifications.js  # In-app notifications
    ├── complaints.js     # Complaint raise & resolve
    └── admin.js          # Admin user management
```

Data is stored in `data/db.json` (auto-created on first run).

---

## Default Admin Credentials

| Field    | Value                     |
|----------|---------------------------|
| Email    | admin@volunteerhub.com    |
| Password | admin123                  |

---

## API Reference

### Auth / Users  (`/users`)

| Method | Path                              | Description                         |
|--------|-----------------------------------|-------------------------------------|
| POST   | `/users/register`                 | Register (VOLUNTEER or ORGANIZER)   |
| POST   | `/users/login`                    | Login → returns user object + token |
| GET    | `/users/email/:email`             | Get user profile                    |
| PUT    | `/users/update/:email`            | Update profile fields               |
| PUT    | `/users/upload-document/:email`   | Upload ID doc (base64)              |
| DELETE | `/users/delete?email=`            | Delete user (admin)                 |

**Register body:**
```json
{ "name": "John", "email": "john@example.com", "password": "pass123", "role": "VOLUNTEER" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "pass123" }
```

---

### Events  (`/events`)

| Method | Path                                      | Description                     |
|--------|-------------------------------------------|---------------------------------|
| POST   | `/events/create`                          | Create event (ORGANIZER)        |
| GET    | `/events/all`                             | All events                      |
| GET    | `/events/organizer/:email`               | Events by organizer             |
| GET    | `/events/:id`                             | Single event                    |
| PUT    | `/events/update/:id`                      | Update event                    |
| PUT    | `/events/admin/update-status/:id?status=` | Approve / Reject (ADMIN)        |
| DELETE | `/events/delete/:id`                      | Delete event                    |

Event statuses: `PENDING` → `APPROVED` | `REJECTED`

---

### Participations  (`/participations`)

| Method | Path                                    | Description                        |
|--------|-----------------------------------------|------------------------------------|
| POST   | `/participations/join`                  | Volunteer joins event              |
| GET    | `/participations/event/:eventId`        | All requests for an event          |
| GET    | `/participations/volunteer/:email`      | All participations for a volunteer |
| PUT    | `/participations/update-status/:id?status=` | Approve / Reject request      |
| DELETE | `/participations/cancel/:eventId/:email` | Cancel PENDING request            |
| PUT    | `/participations/feedback/:id`          | Submit rating & feedback           |
| PUT    | `/participations/attendance/mark`       | Mark attendance for a date         |
| GET    | `/participations/attendance/list`       | Get attendance for event+date      |
| GET    | `/participations/attendance/summary`    | Summary % per volunteer            |

**Attendance mark query params:**  
`?eventId=1&volunteerEmail=vol@x.com&date=2025-01-15&attended=true`

---

### Notifications  (`/notifications`)

| Method | Path                              | Description               |
|--------|-----------------------------------|---------------------------|
| GET    | `/notifications/:email`           | List all (newest first)   |
| GET    | `/notifications/count/:email`     | Unread count              |
| PUT    | `/notifications/read/:id`         | Mark one read             |
| PUT    | `/notifications/read-all/:email`  | Mark all read             |

---

### Complaints  (`/complaints`)

| Method | Path                           | Description                 |
|--------|--------------------------------|-----------------------------|
| POST   | `/complaints/raise`            | Raise a complaint           |
| GET    | `/complaints/admin/all`        | All complaints (admin)      |
| GET    | `/complaints/user/:email`      | User's own complaints       |
| PUT    | `/complaints/admin/resolve/:id`| Resolve a complaint (admin) |

---

### Admin  (`/admin`)

| Method | Path                   | Description          |
|--------|------------------------|----------------------|
| GET    | `/admin/users/all`     | All users (no passwords) |
| GET    | `/admin/users/:email`  | Single user by email |

---

## Migrating to a Real Database

The `src/config/database.js` file exposes a simple `Table(name)` helper.  
To switch to MySQL / PostgreSQL / MongoDB:

1. Replace `Table` implementations with your ORM queries (Sequelize, Prisma, Mongoose, etc.)
2. Keep the same method names: `findAll`, `findOne`, `findById`, `insert`, `update`, `delete`
3. All route files stay unchanged

---

## Production Checklist

- [ ] Set a strong `JWT_SECRET` in `.env`
- [ ] Replace JSON-file DB with PostgreSQL / MySQL
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Add input validation (`express-validator` or `zod`)
- [ ] Add helmet for security headers
- [ ] Store base64 documents in S3 / Cloudinary instead of the DB
- [ ] Use HTTPS in production
