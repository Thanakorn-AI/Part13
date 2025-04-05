# Part 13: Blog App with Sequelize and Migrations

This repository contains a Node.js blog application built with Express v5, Sequelize, and PostgreSQL, hosted on Fly.io. It completes Exercises 13.17-13.24 from the course, focusing on database migrations, many-to-many relationships, and session management.

- **Repo**: `https://github.com/Thanakorn-AI/Part13.git`
- **Database**: Fly.io Postgres (`part13-blog-db`), proxied locally via `flyctl proxy 5432:5432 -a part13-blog-db`
- **Fly.io App**: `part13-blog` (optional deployment)
- **Completed**: April 05, 2025

## Setup

### Prerequisites
- Node.js 18+
- Fly.io CLI (`flyctl`)
- PostgreSQL client (`psql`)
- `jq` for JSON formatting (optional)

### Environment
`.env` file:
```
DATABASE_URL=postgres://postgres:[PASSWORD]@127.0.0.1:5432/postgres
PORT=3000
SECRET=duke123
```
Replace `[PASSWORD]` with your Fly.io Postgres password.

### Commands
```bash
# Proxy database
flyctl proxy 5432:5432 -a part13-blog-db

# Install dependencies
npm install

# Run app
npm start
```

## Exercises Summary

### Exercise 13.17: Database Initialization with Timestamps
**Goal**: Drop tables, use migrations to recreate users and blogs with `created_at` and `updated_at`, remove sync.

**SQL:**
```sql
-- Connect to database
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres
-- Drop tables
DROP TABLE blogs;
DROP TABLE users;
DROP TABLE migrations;
-- Check tables after migration
\dt
\d users
\d blogs
-- Test timestamps
INSERT INTO users (username, name, created_at, updated_at) VALUES ('test@example.com', 'Test User', NOW(), NOW());
SELECT * FROM users;
```
**Notes**: Migration `20250404_00_initialize_database.js` applied via `npm start`.

---

### Exercise 13.18: Add Year to Blogs
**Goal**: Add `year` to blogs (1991-2025), validate with error.

**Migration**: `20250404_01_add_year_to_blogs.js`

**Curl:**
```bash
# Login
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"username": "test@example.com", "password": "secret"}' | jq

# Valid year
curl -X POST http://localhost:3000/api/blogs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Test Blog", "url": "http://example.com", "year": 2023}' | jq

# Invalid years
curl -X POST http://localhost:3000/api/blogs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Old Blog", "url": "http://example.com", "year": 1990}' | jq
curl -X POST http://localhost:3000/api/blogs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Future Blog", "url": "http://example.com", "year": 2026}' | jq
```

---

### Exercise 13.19: Reading List with Connection Table
**Goal**: Create `reading_lists` table with `read` defaulting to false.

**Migration**: `20250404_02_add_reading_lists.js`

**SQL:**
```sql
\d reading_lists
INSERT INTO blogs (title, url, user_id, created_at, updated_at) VALUES ('Manual Blog', 'http://test.com', 1, NOW(), NOW());
INSERT INTO reading_lists (user_id, blog_id) VALUES (1, 1);
SELECT * FROM reading_lists;
```

---

### Exercise 13.20: Reading List Functionality
**Goal**: Add via `POST /api/readinglists`, show in `GET /api/users/:id`

**Curl:**
```bash
curl -X POST http://localhost:3000/api/readinglists -H "Content-Type: application/json" -d '{"userId": 1, "blogId": 1}' | jq
curl http://localhost:3000/api/users/1 | jq
```

---

### Exercise 13.21: Enhance Reading List Details
**Goal**: Include `read` and `id` in `GET /api/users/:id`

**Curl:**
```bash
curl http://localhost:3000/api/users/1 | jq
```

---

### Exercise 13.22: Mark Blog as Read
**Goal**: `PUT /api/readinglists/:id` updates `read`, restricted to user.

**Curl:**
```bash
curl -X PUT http://localhost:3000/api/readinglists/1 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"read": true}' | jq

# Create new user and test restriction
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"username": "other@example.com", "name": "Other User"}' | jq
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"username": "other@example.com", "password": "secret"}' | jq
curl -X PUT http://localhost:3000/api/readinglists/1 -H "Authorization: Bearer $TOKEN2" -H "Content-Type: application/json" -d '{"read": false}' | jq
```

---

### Exercise 13.23: Filter Reading List
**Goal**: Filter `GET /api/users/:id?read=true|false`

**SQL:**
```sql
INSERT INTO blogs (title, url, user_id, created_at, updated_at) VALUES ('Unread Blog', 'http://unread.com', 1, NOW(), NOW()) RETURNING id;
INSERT INTO reading_lists (user_id, blog_id) VALUES (1, [NEW_BLOG_ID]);
```

**Curl:**
```bash
curl http://localhost:3000/api/users/1 | jq
curl "http://localhost:3000/api/users/1?read=true" | jq
curl "http://localhost:3000/api/users/1?read=false" | jq
```

---

### Exercise 13.24: Server-Side Sessions
**Goal**: Store sessions, block disabled users, logout removes sessions.

**Migration**: `20250404_03_add_sessions_and_disabled.js`

**SQL:**
```sql
SELECT * FROM sessions;
UPDATE users SET disabled = true WHERE id = 1;
UPDATE users SET disabled = false WHERE id = 1;
```

**Curl:**
```bash
# Login
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"username": "test@example.com", "password": "secret"}' | jq

# Before disabling
curl -X POST http://localhost:3000/api/blogs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Before Disable", "url": "http://before.com"}' | jq

# After disable
curl -X POST http://localhost:3000/api/blogs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "After Disable", "url": "http://after.com"}' | jq

# After re-enable
curl -X POST http://localhost:3000/api/blogs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Re-enabled", "url": "http://reenabled.com"}' | jq

# Logout
curl -X DELETE http://localhost:3000/api/logout -H "Authorization: Bearer $TOKEN"

# Try expired session
curl -X POST http://localhost:3000/api/blogs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Expired", "url": "http://expired.com"}' | jq
```

---

## Bonus: Uniqueness Constraint on Reading List
**Goal**: Prevent duplicate `user_id`, `blog_id` pairs in `reading_lists`.

**Migration**: `20250405_04_add_unique_reading_list.js`

**SQL:**
```sql
\d reading_lists
SELECT * FROM reading_lists;
```

**Curl:**
```bash
# Duplicate (fails)
curl -X POST http://localhost:3000/api/readinglists -H "Content-Type: application/json" -d '{"userId": 1, "blogId": 1}' | jq

# Unique (succeeds)
curl -X POST http://localhost:3000/api/readinglists -H "Content-Type: application/json" -d '{"userId": 1, "blogId": 7}' | jq

# Verify no duplicates
curl http://localhost:3000/api/users/1 | jq
```

---

## Notes
- All exercises tested locally with Fly.io proxy.
- Full code in repo, including migrations, models, and controllers.

## Submission
Completed 13.17-13.24.
Repo: https://github.com/Thanakorn-AI/Part13.git