# Part 13: Relational Databases with Sequelize

This project is a Node.js backend for a blog application built with Sequelize and PostgreSQL, deployed on Fly.io. It fulfills Exercises 13.1-13.4 from the course, implementing a REST API with CRUD operations for blog posts.

## Features
- **Database:** PostgreSQL hosted on Fly.io (`part13-blog-db`).
- **API Endpoints:**
  - `GET /api/blogs`: List all blogs.
  - `POST /api/blogs`: Create a new blog.
  - `DELETE /api/blogs/:id`: Delete a blog by ID.
- **CLI Tool:** `cli.js` prints blogs to the console in the format `Author: 'Title', Likes`.

## Prerequisites
- Node.js (v18+)
- Fly.io account and CLI (`flyctl`)
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Thanakorn-AI/Part13.git
cd Part13
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a .env file in the root:
```bash
DATABASE_URL=postgres://postgres:<your-fly-db-password>@localhost:5432/postgres
PORT=3000
```
Replace `<your-fly-db-password>` with the password from flyctl postgres create.

### 4. Set Up Fly.io Database
Create the App and Database:
```bash
flyctl launch --name part13-blog
flyctl postgres create --name part13-blog-db
```

Set Database Secret for Deployment:
```bash
flyctl secrets set DATABASE_URL="postgres://postgres:<your-fly-db-password>@part13-blog-db.internal:5432/postgres" --app part13-blog
```

### 5. Initialize the Database
Run the SQL commands in commands.sql using:
```bash
flyctl postgres connect -a part13-blog-db
```

Then paste:
```sql
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title) VALUES ('Dan Abramov', 'https://overreacted.io/on-let-vs-const/', 'On let vs const');
INSERT INTO blogs (author, url, title) VALUES ('Laurenz Albe', 'https://www.cybertec-postgresql.com/en/gaps-in-sequences-in-postgresql/', 'Gaps in sequences in PostgreSQL');
```

### 6. Run Locally
Start the Fly.io proxy in one terminal:
```bash
flyctl proxy 5432:5432 -a part13-blog-db
```

Run the app in another terminal:
```bash
npm run dev
```

Test endpoints:
```bash
curl http://localhost:3000/api/blogs
curl -X POST -H "Content-Type: application/json" -d '{"author":"Me","url":"http://test.com","title":"Test"}' http://localhost:3000/api/blogs
curl -X DELETE http://localhost:3000/api/blogs/1
```

Run the CLI tool:
```bash
node cli.js
```

### 7. Deploy to Fly.io
```bash
fly deploy
```
Visit: https://part13-blog.fly.dev/

## Why node cli.js Initially Failed
When I first ran node cli.js, it failed with:
```
Unable to connect to the database: ConnectionRefusedError [SequelizeConnectionRefusedError]: connect ECONNREFUSED ::1:5432
```

Cause: The Fly.io database is remote, and DATABASE_URL pointed to localhost:5432, but no proxy was running to tunnel the connection. Sequelize defaulted to IPv6 (::1) for localhost, and since nothing was listening on that address without the proxy, it failed.

Solution: Running flyctl proxy 5432:5432 -a part13-blog-db in a separate terminal bridged the local port to Fly.io's database. Once the proxy was active, localhost:5432 resolved correctly to the tunneled connection (typically 127.0.0.1:5432 on macOS), fixing the issue. Explicitly setting 127.0.0.1 in .env wasn't necessary in this case but could prevent IPv6-related issues in other environments.

## Files
- index.js: Web server with Sequelize model and API.
- cli.js: Command-line blog printer.
- commands.sql: Database schema and initial data.
- Dockerfile: Container configuration for Fly.io.
- fly.toml: Fly.io deployment config.

## Author
Thanakorn Kitviriya