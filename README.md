# TaskFlow – Personal Task Management System

> **Plan less. Accomplish more.**
>
> A modern, polished, production-quality personal task management system engineered with React, Vite, Express, and PostgreSQL. Built to demonstrate clean architecture, robust data validation, responsive SaaS aesthetics, comprehensive automated testing, and CI/CD deployment readiness.

---

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [REST API Documentation](#rest-api-documentation)
8. [Environment Variables](#environment-variables)
9. [Local Development Setup](#local-development-setup)
10. [Automated Testing](#automated-testing)
11. [CI/CD Pipeline](#cicd-pipeline)
12. [Deployment Guide](#deployment-guide)
13. [Verification & Quality Checklist](#verification--quality-checklist)

---

## Overview

TaskFlow is designed from the ground up as a professional productivity SaaS application rather than a toy todo app. It features a layered backend architecture (Controllers, Services, Middlewares, Database Abstraction), robust SQL parameterization, a component-driven React frontend with custom hooks, fluid responsive layouts across desktop, tablet, and mobile devices, and an accessible design system supporting both Light and Dark modes.

---

## Key Features

- **Dynamic Productivity Dashboard**: Real-time greeting tailored to the time of day, live date indicator, and dynamic statistic cards (*Total Tasks*, *Pending*, *Completed*, with calculated completion percentage).
- **Task Creation & Editing**: Clean modal dialogues with title validation (whitespace and character bounds check), optional descriptions, and duplicate submission locks.
- **Interactive Status Management**: Toggle tasks between `Pending` and `Completed` with instant optimistic feedback, badge state updates, and title strikethrough.
- **Safe Task Deletion**: Custom confirmation modal preventing accidental deletions with warning messaging and undo prevention notes.
- **Live Search & Status Filters**: Filter by *All*, *Pending*, or *Completed* tasks with badge counts, coupled with real-time text search querying task titles and descriptions simultaneously without page reloads.
- **Sleek Light & Dark Themes**: Curated color palettes with high-contrast WCAG compliance, persistent across sessions via `localStorage`.
- **Lightweight Toast Notifications**: Non-intrusive feedback for every create, edit, delete, and status toggle action, along with server connectivity alerts.
- **Optimized Loading States**: Skeleton placeholders for initial data retrieval and action-specific spinners preventing duplicate API invocations.
- **Responsive Layout**: Designed for 1440px/1280px desktops, 1024px/768px tablets, and 480px/375px mobile screens with zero horizontal overflow.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, JavaScript (ES2022), Vanilla CSS Design System |
| **Backend** | Node.js (LTS), Express 4, CORS, Dotenv |
| **Database** | PostgreSQL, `pg` (Node-Postgres Connection Pool) |
| **Testing** | Jest, Supertest, pg-mem (in-memory PostgreSQL compatibility engine) |
| **Version Control** | Git, GitHub |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) |
| **Hosting** | Vercel (Frontend), Hosted PostgreSQL (Neon / Supabase / Render) |

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    React Client (Vite SPA)                      │
│   • DashboardGreeting  • StatsOverview  • TaskToolbar           │
│   • TaskList / TaskCard  • TaskModal  • DeleteConfirmModal      │
│   • useTheme (localStorage)  • useTasks  • useToast             │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON REST Requests
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js REST API                          │
│   ├── Middleware: CORS, JSON Parser, Validator, ErrorHandler    │
│   ├── Routes: /api/tasks, /api/tasks/:id, /api/tasks/stats      │
│   ├── Controller: TaskController (HTTP req/res translation)     │
│   └── Service: TaskService (Business logic & SQL abstraction)   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Parameterized SQL ($1, $2, ...)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│   • Table: tasks (id, title, description, status, created_at)   │
│   • Constraints: CHECK status IN ('Pending', 'Completed')       │
│   • Indexes: idx_tasks_status, idx_tasks_created_at             │
└─────────────────────────────────────────────────────────────────┘
```

> **Security Note**: The frontend never connects directly to the PostgreSQL database. Database credentials (`DATABASE_URL`) are isolated on the server.

---

## Project Structure

```text
taskflow/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI matrix
├── backend/
│   ├── database/
│   │   └── schema.sql         # PostgreSQL schema definition
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # PostgreSQL pool & fallback initialization
│   │   ├── controllers/
│   │   │   └── taskController.js # Request handlers
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # 404 and 500 error sanitizers
│   │   │   └── validator.js      # Strict payload validation
│   │   ├── routes/
│   │   │   └── taskRoutes.js     # Route mappings
│   │   ├── services/
│   │   │   └── taskService.js    # SQL queries and business logic
│   │   ├── app.js             # Express application setup
│   │   └── server.js          # Server listener entry
│   ├── tests/
│   │   ├── apiIntegrationTest.js # Standalone test runner
│   │   ├── dbTest.js             # Database test script
│   │   └── taskApi.test.js       # Jest & Supertest test suite
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg        # Custom branded SVG favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardGreeting.jsx
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── StatsOverview.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── TaskToolbar.jsx
│   │   │   └── ToastContainer.jsx
│   │   ├── hooks/
│   │   │   ├── useTasks.js
│   │   │   ├── useTheme.js
│   │   │   └── useToast.js
│   │   ├── services/
│   │   │   └── taskService.js # API client abstraction
│   │   ├── styles/
│   │   │   └── index.css      # SaaS design system & theme variables
│   │   ├── utils/
│   │   │   └── dateUtils.js   # Date formatting utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json            # Vercel SPA routing
│   └── vite.config.js
├── .env.example
├── .gitignore
├── README.md
└── package.json               # Root scripts
```

---

## Database Schema

Defined in [`backend/database/schema.sql`](backend/database/schema.sql):

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_task_status CHECK (status IN ('Pending', 'Completed')),
  CONSTRAINT chk_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
```

### Fields Overview

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique task identifier |
| `title` | `VARCHAR(255)` | `NOT NULL`, Non-empty | Descriptive title of the task |
| `description` | `TEXT` | Optional | Context, details, or notes |
| `status` | `VARCHAR(50)` | `NOT NULL`, Default: `'Pending'` | Status: `'Pending'` or `'Completed'` |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default: `CURRENT_TIMESTAMP` | Server timestamp of creation |

---

## REST API Documentation

Base URL: `http://localhost:5000/api`

### 1. Get All Tasks
- **Route**: `GET /api/tasks`
- **Query Parameters**:
  - `status` (optional): Filter by `'Pending'` or `'Completed'`
  - `search` (optional): Substring search against `title` and `description`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": 1,
        "title": "Review System Architecture",
        "description": "Check clean REST API and database schema",
        "status": "Pending",
        "created_at": "2026-09-07T05:21:48.855Z"
      }
    ]
  }
  ```

### 2. Get Task Statistics
- **Route**: `GET /api/tasks/stats`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "total": 12,
      "pending": 7,
      "completed": 5
    }
  }
  ```

### 3. Get Task By ID
- **Route**: `GET /api/tasks/:id`
- **Response** (`200 OK`): Single task object
- **Error Responses**:
  - `400 Bad Request`: Non-numeric ID
  - `404 Not Found`: Task does not exist

### 4. Create Task
- **Route**: `POST /api/tasks`
- **Request Body**:
  ```json
  {
    "title": "Configure production database",
    "description": "Provision managed PostgreSQL on Supabase or Neon",
    "status": "Pending"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Task created successfully.",
    "data": {
      "id": 15,
      "title": "Configure production database",
      "description": "Provision managed PostgreSQL on Supabase or Neon",
      "status": "Pending",
      "created_at": "2026-09-07T05:35:10.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing or whitespace-only title

### 5. Update Task
- **Route**: `PUT /api/tasks/:id`
- **Request Body**:
  ```json
  {
    "title": "Configure production database (Updated)",
    "description": "Finished schema migrations",
    "status": "Completed"
  }
  ```
- **Response** (`200 OK`): Updated task object
- **Error Responses**:
  - `400 Bad Request`: Invalid payload or invalid status
  - `404 Not Found`: Task not found

### 6. Toggle Status
- **Route**: `PATCH /api/tasks/:id/status`
- **Request Body**:
  ```json
  {
    "status": "Completed"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Task status updated successfully.",
    "data": {
      "id": 15,
      "status": "Completed"
    }
  }
  ```

### 7. Delete Task
- **Route**: `DELETE /api/tasks/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Task deleted successfully.",
    "data": { "id": 15 }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Task not found

---

## Environment Variables

Copy `.env.example` to `.env` in the backend or root folder:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow

# Frontend Client URL (for CORS)
CORS_ORIGIN=http://localhost:5173

# Frontend API URL (for Vite)
VITE_API_URL=http://localhost:5000/api
```

> **Note on Database Portability**: If `DATABASE_URL` is omitted or an external PostgreSQL instance is unreachable during local evaluation, TaskFlow will seamlessly initialize an in-memory PostgreSQL engine (`pg-mem`) loaded with the exact schema so you can run the full system instantly with zero configuration!

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+ (LTS)
- **npm**: v9+
- **PostgreSQL**: (Optional for local testing; automatic fallback provided)

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow

# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install
```

### 3. Running the Backend
```bash
# Development mode with auto-reload
npm --prefix backend run dev

# Or standard start
npm --prefix backend start
```
The API server will listen on `http://localhost:5000`.

### 4. Running the Frontend
In a separate terminal:
```bash
npm --prefix frontend run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## Automated Testing

TaskFlow includes comprehensive automated tests covering all CRUD endpoints, status toggles, edge cases, and validation rules.

### Running Jest Test Suite
```bash
npm --prefix backend test
```

### Running Standalone Integration Runner
```bash
node backend/tests/apiIntegrationTest.js
```

Both test suites execute all 14+ test cases and verify proper HTTP status codes (`200`, `201`, `400`, `404`).

---

## CI/CD Pipeline

Continuous Integration is managed via GitHub Actions in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). On every push or pull request to `main`, the workflow:
1. Provisions an `ubuntu-latest` runner with Node.js 20 LTS.
2. Caches and installs backend dependencies.
3. Executes the full backend test suite (`npm test`).
4. Caches and installs frontend dependencies.
5. Builds the production frontend bundle (`npm run build`).

---

## Deployment Guide

### 1. Database (Hosted PostgreSQL)
Create a managed PostgreSQL database on any cloud provider:
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Render](https://render.com)

Obtain your `DATABASE_URL` (e.g. `postgresql://user:pass@ep-cool-xyz.us-east-2.aws.neon.tech/taskflow?sslmode=require`).

Run the schema migration:
```bash
psql $DATABASE_URL -f backend/database/schema.sql
```

### 2. Backend Deployment (Render / Railway / Fly.io)
1. Deploy the `backend/` directory as a Node.js web service.
2. Set Environment Variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your_postgres_url>`
   - `CORS_ORIGIN=https://your-taskflow-frontend.vercel.app`
3. Set start command to `node src/server.js`.

### 3. Frontend Deployment (Vercel)
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set Root Directory to `frontend` (or keep root with `frontend/dist` output).
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Configure Environment Variable:
   - `VITE_API_URL=https://your-backend-api.onrender.com/api`
5. Deploy! Vercel handles SSL, CDN edge caching, and SPA routing via `vercel.json`.

---

## Verification & Quality Checklist

- [x] Application starts and compiles cleanly
- [x] Frontend builds with zero bundle errors
- [x] Backend REST API runs with structured status codes
- [x] PostgreSQL schema with constraints (`chk_task_status`, `chk_title_not_empty`)
- [x] Task creation with validation
- [x] Task viewing and dynamic count statistics
- [x] Task editing with modal UI
- [x] Safe deletion with confirmation dialog
- [x] Interactive status toggle (Pending ↔ Completed)
- [x] Real-time title and description search
- [x] Status filter tabs (All, Pending, Completed)
- [x] Dark Mode and Light Mode with `localStorage` persistence
- [x] Responsive layout (Desktop, Tablet, Mobile) without horizontal overflow
- [x] Toast notification system
- [x] Accessible keyboard navigation (Escape modal dismissal, focus states)
- [x] Automated Jest & Supertest test suite passing 100%
- [x] GitHub Actions CI pipeline configured
- [x] Clean Git commit history and `.gitignore` protecting secrets
