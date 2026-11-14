# 📄 Career Match

A full-stack web application that extracts and scores technical skills from uploaded resumes (TXT or PDF) using keyword matching — inspired by real-world ATS (Applicant Tracking System) logic.

**Stack:** React 18 (Vite, React Router, Chart.js) · Node.js + Express · MongoDB · Docker

---

## 📁 Project Structure

```
career-match/
├── backend/                     Node.js / Express API (unchanged business logic)
│   ├── server.js                Auth, resume analysis, serves the built React app
│   ├── package.json
│   ├── .env.example             Backend environment template
│   └── users.json               Legacy flat-file store (not used by the server)
│
├── frontend/                    React application (replaces the old HTML pages)
│   ├── index.html               Vite entry (mounts <div id="root">)
│   ├── vite.config.js           Dev server + /api proxy to the backend
│   ├── package.json
│   └── src/
│       ├── main.jsx             React entry (Router + AuthProvider)
│       ├── App.jsx              Routes: /login, /register, /dashboard
│       ├── App.css              Global design system (from style.css)
│       ├── api.js               fetch wrapper for the REST API
│       ├── auth.jsx             Auth context (token/user, logout, expiry check)
│       ├── constants.js         Skill dictionary, categories, storage keys
│       ├── pages/
│       │   ├── Login.jsx        (was login.html)
│       │   ├── Register.jsx     (was register.html)
│       │   └── Dashboard.jsx    (was dashboard.html)
│       ├── components/
│       │   ├── Alert.jsx, SubmitButton.jsx, Wordmark.jsx, RouteGuards.jsx
│       │   └── dashboard/       Sidebar, Topbar, OverviewTab, AnalyzerTab,
│       │                        HistoryTab, Charts, SkillBadges, Icons
│       └── styles/dashboard.css (from dashboard.css)
│
├── Dockerfile                   Multi-stage: builds React, runs Express
├── docker-compose.yml           MongoDB + app
├── .env.example                 Compose environment template
└── README.md
```

---

## 🚀 Run Locally (development)

**Prerequisites:** Node.js 18+ and a running MongoDB (`mongodb://localhost:27017`).

**1. Backend** (terminal 1)

```bash
cd backend
cp .env.example .env        # optional — sensible defaults exist; set JWT_SECRET
npm install
npm start                   # API on http://localhost:3000
```

**2. Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev                 # React app on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` to the backend
(change the target with `VITE_PROXY_TARGET` in `frontend/.env`).

## 🏗️ Run Locally (production build, single server)

```bash
cd frontend && npm install && npm run build      # creates frontend/dist
cd ../backend && npm install && npm start
```

Open **http://localhost:3000** — Express serves the React build and the API together.

---

## 🐳 Run with Docker

```bash
cp .env.example .env                 # then edit JWT_SECRET (openssl rand -hex 32)
docker compose up --build            # add -d to run in the background
```

Open **http://localhost:3000**.

| Command | Purpose |
|---|---|
| `docker compose up --build -d` | Build and start MongoDB + app |
| `docker compose logs -f app` | Follow app logs |
| `docker compose ps` | See status (both services report *healthy*) |
| `docker compose down` | Stop containers (data kept in the `mongo-data` volume) |
| `docker compose down -v` | Stop **and delete** the database volume |

Build/run the image on its own (needs an external MongoDB):

```bash
docker build -t career-match .
docker run -p 3000:3000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017 \
  -e JWT_SECRET=<your-secret> \
  career-match
```

Notes
- MongoDB is **not** published to the host — only the app container can reach it.
- `.env` files are excluded from the image and from git; secrets are injected at runtime.
- The container runs as the unprivileged `node` user and exposes `GET /api/health`
  (used by the Docker `HEALTHCHECK`).

### Kubernetes
The original project did not include Kubernetes manifests, so none were changed. The image
above is stateless and configured purely by environment variables (`MONGO_URI`, `DB_NAME`,
`JWT_SECRET`, `PORT`) and exposes `/api/health`, so it can be used in a Deployment with
`readinessProbe`/`livenessProbe` on that path and a Service targeting container port 3000.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Authentication** | Register / Login with bcrypt-hashed passwords + JWT tokens (2 h expiry) |
| **Protected routes** | React Router guards: `/dashboard` requires login; logged-in users skip Login/Register |
| **Resume Upload** | Drag-and-drop or file picker — TXT and PDF supported (≤ 5 MB) |
| **Skill Extraction** | Case-insensitive keyword matching against a 30-skill dictionary |
| **Skill Score** | `detected / total` with donut, gauge, bar and radar charts |
| **Tier System** | Beginner → Intermediate → Advanced → Expert |
| **History** | Session-based list of analyses; view or clear any time |
| **Responsive** | Collapsible sidebar and fluid layouts on tablets and phones |

## 🔑 API Endpoints (unchanged)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | ✗ | Create new account |
| POST | `/api/login` | ✗ | Authenticate → returns JWT |
| POST | `/api/analyze` | ✓ Bearer | Upload resume (`resume` field) → skill analysis |
| GET | `/api/health` | ✗ | Liveness check (new, used by Docker) |

## ⚙️ Environment Variables

| Variable | Default | Where |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | backend |
| `DB_NAME` | `career_match` | backend / compose |
| `JWT_SECRET` | *(dev fallback in code — always set your own)* | backend / compose |
| `PORT` | `3000` | backend |
| `FRONTEND_DIST` | `../frontend/dist` | backend (optional) |
| `VITE_API_URL` | *(same origin)* | frontend (optional) |

## 🧠 Skill Dictionary (30 skills)

`Python` `Java` `C++` `JavaScript` `TypeScript` `React` `Node.js` `MongoDB` `SQL` `PostgreSQL` `MySQL` `AWS` `Docker` `Kubernetes` `Machine Learning` `Deep Learning` `Data Analysis` `HTML` `CSS` `Git` `Django` `Flask` `Spring` `TensorFlow` `PyTorch` `Redis` `GraphQL` `REST API` `Linux` `Azure`

## 📝 Notes

- JWT tokens expire after **2 hours**; an expired token sends you back to the login page.
- Users are stored in MongoDB (`users` collection, unique index on `email`).
- Analysis history lives in `sessionStorage` (per browser tab session), as in the original app.
