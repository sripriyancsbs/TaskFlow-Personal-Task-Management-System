<div align="center">

# 🗂️ TaskFlow

### A sleek, modern Personal Task Management System

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pg--mem-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**[🚀 Live Demo](#)** • **[📖 API Docs](#rest-api-documentation)** • **[🛠️ Setup](#local-development-setup)**

</div>

---

## ✨ Features

- **📋 List View** — Clean, scannable task list with inline status toggles
- **🗓️ Calendar View** — Monthly schedule to visualize tasks by due date
- **⊞ Grid View** — Card gallery for a visual overview of all tasks
- **⚡ Command Palette** — `Ctrl+K` to quickly create, search, and switch views
- **🌙 Dark / Light Mode** — Persisted preference via `localStorage`
- **🔍 Real-time Search** — Instant filter across title and description
- **📊 Stats Dashboard** — Live counts of pending vs completed tasks
- **🔔 Toast Notifications** — Subtle feedback on every action
- **📱 Responsive Design** — Mobile-optimized with bottom navigation
- **⌨️ Keyboard Shortcuts** — Full keyboard navigation support
- **💾 Persistent Storage** — Tasks survive server restarts via JSON-backed store

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Vanilla CSS |
| **Backend** | Node.js 20, Express 4 |
| **Database** | PostgreSQL (prod) / pg-mem (dev fallback) |
| **Testing** | Jest, Supertest |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** v18+ (LTS)
- **npm** v9+
- **PostgreSQL** (optional — auto-fallback to in-memory DB)

### 1. Clone & Install

```bash
git clone https://github.com/sripriyancsbs/TaskFlow-Personal-Task-Management-System.git
cd TaskFlow-Personal-Task-Management-System

# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install
```

### 2. Configure Environment

```bash
# Copy example env files
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow
CORS_ORIGIN=http://localhost:5173
```

Edit `.env` (frontend):
```env
VITE_API_URL=http://localhost:5000/api
```

> **Zero-config mode**: Omit `DATABASE_URL` to run with the built-in in-memory database — no PostgreSQL install needed!

### 3. Start the Servers

**Terminal 1 — Backend:**
```bash
npm --prefix backend start
# API available at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
npm --prefix frontend run dev
# App available at http://localhost:5173
```

---

## 🧪 Testing

```bash
# Run full Jest + Supertest suite
npm --prefix backend test

# Run standalone integration tests
node backend/tests/apiIntegrationTest.js
```

All 14+ test cases cover CRUD operations, validation, edge cases, and HTTP status codes.

---

## 📡 REST API Documentation

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | List all tasks (filter by `status`, `search`) |
| `GET` | `/tasks/stats` | Get task statistics (total, pending, completed) |
| `GET` | `/tasks/:id` | Get a single task |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update a task |
| `PATCH` | `/tasks/:id/status` | Toggle task status |
| `DELETE` | `/tasks/:id` | Delete a task |

<details>
<summary><b>Example: Create Task</b></summary>

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Review pull requests",
  "description": "Check open PRs before the release",
  "status": "Pending"
}
```

Response `201 Created`:
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "id": 5,
    "title": "Review pull requests",
    "description": "Check open PRs before the release",
    "status": "Pending",
    "created_at": "2026-09-07T10:00:00.000Z"
  }
}
```
</details>

---

## ☁️ Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import this repo
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
6. Click **Deploy** ✅

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service** → Connect this repo
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `node src/server.js`
4. Add environment variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = your PostgreSQL connection string
   - `CORS_ORIGIN` = `https://your-app.vercel.app`
5. Click **Deploy** ✅

### Database → Neon (Free)

1. Go to [neon.tech](https://neon.tech) → create a free database
2. Copy the connection string → paste as `DATABASE_URL` in Render
3. Run the schema: `psql $DATABASE_URL -f backend/database/schema.sql`

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open Command Palette |
| `N` | New Task |
| `L` | List View |
| `G` | Grid View |
| `C` | Calendar View |
| `Escape` | Close modal / panel |

---

## 📄 License

MIT © [sripriyancsbs](https://github.com/sripriyancsbs)