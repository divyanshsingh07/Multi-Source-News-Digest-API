# Multi-Source News Digest API

**Assignment 4 — API Integration + Automation**

A full-stack news digest application that ingests **multiple RSS feeds**, generates **two-line summaries** (OpenAI with a deterministic fallback), **clusters** related stories using TF–IDF and cosine similarity, exposes a **REST API** with **Swagger** documentation, and presents everything in a **React** frontend.

---

## Table of contents

1. [For markers (quick review)](#for-markers-quick-review)
2. [Live demo URLs](#live-demo-urls)
3. [What this project does](#what-this-project-does)
4. [Tech stack](#tech-stack)
5. [Submission checklist](#submission-checklist)
6. [Repository layout](#repository-layout)
7. [Quick start — Docker (recommended)](#quick-start--docker-recommended)
8. [Local development (hot reload)](#local-development-hot-reload)
9. [Assignment 4 coverage](#assignment-4-coverage)
10. [How it works (pipeline)](#how-it-works-pipeline)
11. [Frontend](#frontend)
12. [API reference](#api-reference)
13. [Authentication, rate limits, and CORS](#authentication-rate-limits-and-cors)
14. [Environment variables](#environment-variables)
15. [Git — commit and push safely](#git--commit-and-push-safely)
16. [Production deployment (AWS EC2 + Render)](#production-deployment-aws-ec2--render)
17. [Screenshots](#screenshots)
18. [Troubleshooting](#troubleshooting)
19. [License](#license)

---

## For markers (quick review)

| What to review | Where / how |
|----------------|-------------|
| Requirement ↔ implementation | [Assignment 4 coverage](#assignment-4-coverage) |
| Interactive API docs | **Swagger UI:** `http://localhost:8000/api-docs` (backend must be running) |
| Primary API resource | `GET http://localhost:8000/digest` |
| Health check | `GET http://localhost:8000/health` |
| React UI | `http://localhost:5173` after [Docker](#quick-start--docker-recommended) or [local dev](#local-development-hot-reload) |
| Screenshots | [Screenshots](#screenshots) — files live in `docs/screenshots/` on your machine (large images are gitignored) |

**Suggested review order**

1. Start the stack ([Docker](#quick-start--docker-recommended) is fastest).
2. Wait for the first ingest to finish (backend logs).
3. Open Swagger → try `GET /digest`.
4. Open the frontend → digest, topics, article detail, topic subscriptions.
5. Skim the [coverage table](#assignment-4-coverage).

**One-line summary for submission forms**

> Node/Express + MongoDB; scheduled RSS ingest from BBC and Guardian; OpenAI two-line summaries with fallback; TF–IDF clustering; React/Vite/Tailwind UI; Swagger at `/api-docs`; optional API key, rate limiting, and sentiment labels.

---

## Live demo URLs

Fill these in after you deploy. Until then, use local URLs from [Quick start](#quick-start--docker-recommended).

| Service | URL |
|---------|-----|
| **Frontend (Render)** | `https://your-app-name.onrender.com` |
| **API (EC2 + HTTPS)** | `https://api.yourdomain.com` |
| **Swagger** | `https://api.yourdomain.com/api-docs` |

**Important:** Render serves the UI over **HTTPS**. The API must also be **HTTPS** (e.g. Caddy on EC2 with a domain). If `VITE_API_URL` points to `http://EC2-IP:8000`, the browser blocks requests (mixed content).

---

## What this project does

| Step | Description |
|------|-------------|
| **Fetch** | Pulls articles from BBC and Guardian RSS feeds ([`backend/src/config/feeds.js`](backend/src/config/feeds.js)). |
| **Summarise** | For **new URLs only**, generates a strict two-line summary via OpenAI, or a sentence-based fallback if no API key ([`backend/src/summarizer/index.js`](backend/src/summarizer/index.js)). |
| **Cluster** | Groups similar stories with TF–IDF + cosine similarity ([`backend/src/clustering/index.js`](backend/src/clustering/index.js)). |
| **Store** | Persists articles in MongoDB ([`backend/src/models/Article.js`](backend/src/models/Article.js)). |
| **Schedule** | Re-ingests every **30 minutes** via `node-cron` ([`backend/src/cron/ingest.js`](backend/src/cron/ingest.js)). |
| **Serve** | REST API + Swagger; React app consumes `/digest`, `/topics`, `/topic/:name`, `/article/:id`. |

Summaries use the LLM only for **new article URLs**. Clustering is **algorithmic**, not “ask the model to group everything.”

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Backend** | Node.js 18+, Express, Mongoose, `node-cron`, `rss-parser`, OpenAI SDK, `natural` (TF–IDF), `sentiment`, Swagger |
| **Database** | MongoDB 7 (Docker locally) or [MongoDB Atlas](https://www.mongodb.com/atlas) (production) |
| **Frontend** | React 19, Vite 8, React Router, Tailwind CSS 4, Axios |
| **Containers** | Docker Compose (local full stack); EC2 uses `docker-compose.prod.yml` + Caddy |
| **Frontend hosting** | [Render](https://render.com) static site ([`render.yaml`](render.yaml) blueprint, gitignored — copy settings from [Production](#production-deployment-aws-ec2--render)) |

---

## Submission checklist

| Deliverable | Status / how to verify |
|-------------|------------------------|
| **GitHub repository** | Init at repo root; push `backend/`, `frontend/`, `README.md`, `docker-compose.prod.yml` (see [Git](#git--commit-and-push-safely)) |
| **README** | This file |
| **Working API** | `curl http://localhost:8000/digest` or Swagger |
| **Working frontend** | `http://localhost:5173` |
| **API documentation** | Swagger at `/api-docs` + sections below |
| **Screenshots** | Add PNGs under `docs/screenshots/` and embed in reports (folder gitignored due to size) |
| **Live deployment (optional)** | EC2 backend + Render frontend — [Production](#production-deployment-aws-ec2--render) |

---

## Repository layout

```
Multi-Source News Digest API/
├── backend/                 # Express API, ingest, clustering, Swagger, Dockerfile
│   ├── src/
│   │   ├── clustering/      # TF–IDF + cosine similarity
│   │   ├── config/          # env, db, feeds, swagger
│   │   ├── controllers/     # route handlers
│   │   ├── cron/            # 30-minute ingest schedule
│   │   ├── middleware/      # API key, errors
│   │   ├── models/          # Article schema
│   │   ├── routes/          # /digest, /topics, …
│   │   ├── scripts/         # ingestOnce (manual / Docker entrypoint)
│   │   ├── services/        # RSS + ingest orchestration
│   │   ├── summarizer/      # OpenAI + fallback
│   │   └── swagger/         # OpenAPI path definitions
│   ├── .env.example         # copy to .env — never commit .env
│   └── Dockerfile
├── frontend/                # React + Vite UI
│   ├── src/
│   │   ├── pages/           # Home, Topic, ArticleDetail
│   │   ├── components/      # cards, layout, icons
│   │   ├── hooks/           # async fetch, topic subscriptions
│   │   └── services/        # Axios API client
│   ├── .env.example
│   └── Dockerfile           # nginx serves production build
├── docker-compose.yml       # local: mongo + backend + frontend (gitignored — keep locally)
├── docker-compose.prod.yml  # EC2: backend + Caddy (MongoDB = Atlas)
├── .env.docker.example      # root env template for Docker Compose (gitignored)
├── render.yaml              # Render static site blueprint (gitignored)
├── docs/screenshots/        # UI screenshots for submission (gitignored)
└── README.md
```

### What is tracked in Git vs kept local

| Path | In Git? | Why |
|------|---------|-----|
| `backend/`, `frontend/` | Yes | Application source |
| `docker-compose.prod.yml` | Yes | EC2 production compose |
| `README.md` | Yes | Documentation |
| `backend/.env`, `frontend/.env` | **No** | Secrets — use `.env.example` |
| `docker-compose.yml`, `.env.docker.example` | **No** | Local Docker only ([`.gitignore`](.gitignore)) |
| `render.yaml` | **No** | Render dashboard can mirror it; file kept locally |
| `docs/screenshots/` | **No** | Large binary assets for LMS/reports |

`docker-compose.yml` and `.env.docker.example` exist on disk for local development even though they are not pushed.

---

## Quick start — Docker (recommended)

Runs **MongoDB**, **backend**, and **frontend** (nginx serving the Vite build) with one command.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)

### Start the full stack

From the **repository root**:

```bash
cp .env.docker.example .env    # optional: set OPENAI_API_KEY, API_KEY, etc.
docker compose up --build
```

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API** | http://localhost:8000 |
| **Swagger** | http://localhost:8000/api-docs |
| **MongoDB** | `localhost:27017` (for Compass / CLI) |

On first start the backend container runs **`ingest-once`** automatically (`RUN_INGEST_ON_START=true` in [`backend/docker-entrypoint.sh`](backend/docker-entrypoint.sh)). The first boot can take several minutes if many articles are new and OpenAI is enabled.

### Useful Docker commands

```bash
docker compose up --build -d          # detached
docker compose logs -f backend        # follow API / ingest logs
docker compose exec backend node src/scripts/ingestOnce.js   # manual re-ingest
docker compose down                   # stop containers
docker compose down -v                # stop and delete MongoDB volume
```

### Compose services (`docker-compose.yml`)

| Service | Image / build | Host port |
|---------|---------------|-----------|
| `mongo` | `mongo:7` | `27017` |
| `backend` | [`backend/Dockerfile`](backend/Dockerfile) | `8000` |
| `frontend` | [`frontend/Dockerfile`](frontend/Dockerfile) + nginx | `5173` → container `80` |

**`VITE_API_URL`:** baked in at **frontend build** time. It must be reachable from your **browser** (default `http://localhost:8000`), not an internal Docker hostname like `http://backend:8000`.

Root Docker env template: [`.env.docker.example`](.env.docker.example) → copy to `.env` at repo root.

---

## Local development (hot reload)

Use this when editing code with live reload instead of rebuilding Docker images.

### Prerequisites

- **Node.js 18+**
- **MongoDB** — `docker compose up mongo -d` from repo root, or MongoDB Atlas
- **Optional:** [OpenAI API key](https://platform.openai.com/) for GPT summaries

### 1. MongoDB

**Option A — Docker (from repo root):**

```bash
docker compose up mongo -d
```

**Option B — Atlas:** create a free cluster and copy the connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: MONGO_URI, optional OPENAI_API_KEY
npm install
npm run ingest-once    # first-time data load
npm run dev            # http://localhost:8000
```

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Express with `--watch` |
| One-shot ingest | `npm run ingest-once` | Fetch RSS, summarise, cluster |
| Production start | `npm start` | `node src/server.js` |

Swagger: **http://localhost:8000/api-docs**

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:8000
npm install
npm run dev            # http://localhost:5173
```

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Vite HMR |
| Production build | `npm run build` | Output in `frontend/dist` |
| Lint | `npm run lint` | ESLint |

---

## Assignment 4 coverage

### Mandatory requirements

| Requirement | Implementation |
|-------------|----------------|
| ≥ 2 news sources | [`backend/src/config/feeds.js`](backend/src/config/feeds.js) — BBC + Guardian (Reuters RSS is retired) |
| Scheduled fetch | [`backend/src/cron/ingest.js`](backend/src/cron/ingest.js) — every 30 min; set `DISABLE_CRON=true` to turn off |
| 2-line summaries | [`backend/src/summarizer/index.js`](backend/src/summarizer/index.js) |
| Cluster similar articles | [`backend/src/clustering/index.js`](backend/src/clustering/index.js) |
| `GET /digest` | [`backend/src/controllers/newsController.js`](backend/src/controllers/newsController.js) |
| `GET /topic/:name` | Case-insensitive topic filter |
| Frontend consumes API | [`frontend/src/services/api.js`](frontend/src/services/api.js) |
| Headlines, summaries, grouped UI | [`frontend/src/pages/Home.jsx`](frontend/src/pages/Home.jsx), [`ArticleCard.jsx`](frontend/src/components/ArticleCard.jsx) |

### Bonus features (implemented)

| Bonus | Where |
|-------|--------|
| Sentiment labels | [`backend/src/utils/sentimentLabel.js`](backend/src/utils/sentimentLabel.js) |
| Topic subscriptions (localStorage) | [`frontend/src/hooks/useTopicSubscriptions.js`](frontend/src/hooks/useTopicSubscriptions.js) |
| API key (`X-API-Key`) | [`backend/src/middleware/apiKey.js`](backend/src/middleware/apiKey.js) |
| Rate limiting | [`backend/src/server.js`](backend/src/server.js) — 300 requests / 15 min |
| OpenAPI / Swagger | `/api-docs` — [`backend/src/swagger/paths.js`](backend/src/swagger/paths.js) |

### Rubric guide

| Criterion (~%) | What to inspect |
|----------------|-----------------|
| **API design (30%)** | REST routes, JSON shapes, `400`/`404`/`401`, optional API key, rate limit, Swagger |
| **LLM summarisation (25%)** | Two-line GPT prompt; fallback without key; summaries only on **new** URLs |
| **Frontend UI (25%)** | Digest clusters, topics, subscriptions, loading/error states, screenshots |
| **Code quality (20%)** | Controllers/services split, `.env.example` files, no secrets in Git, ESLint on frontend |

---

## How it works (pipeline)

```mermaid
flowchart TB
  RSS[BBC + Guardian RSS] --> Cron[node-cron every 30m]
  Cron --> Ingest[ingestService]
  Ingest --> New{New URL?}
  New -->|yes| LLM[OpenAI 2-line summary or fallback]
  New -->|no| Skip[Reuse stored summary]
  LLM --> Store[(MongoDB)]
  Skip --> Store
  Ingest --> Cluster[TF-IDF + cosine clustering]
  Cluster --> Store
  Store --> API[Express REST API]
  API --> UI[React frontend]
```

**Ingest entry points**

- Automatic: cron job + Docker entrypoint (`ingestOnce.js`)
- Manual: `npm run ingest-once` in `backend/` or `docker compose exec backend node src/scripts/ingestOnce.js`

---

## Frontend

| Route | Page | API used |
|-------|------|----------|
| `/` | Digest home — clustered sections, top headlines | `GET /digest` |
| `/topic/:name` | Articles for one topic | `GET /topic/:name` |
| `/article/:id` | Full article detail | `GET /article/:id` |

**UI features**

- Clustered digest sections (multi-article clusters show a section label; single-article clusters use the headline as the label)
- Source, topic, sentiment badges on cards
- Topic list and **subscribe** button (persisted in `localStorage`)
- Loading and error states via [`useAsync`](frontend/src/hooks/useAsync.js)

**Env:** `VITE_API_URL` must point at the backend origin (no trailing slash). Optional `VITE_API_KEY` if the backend enforces `API_KEY`.

---

## API reference

Base URL (local): `http://localhost:8000`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service + MongoDB connection status |
| `GET` | `/` | JSON index with route hints |
| `GET` | `/digest` | **Primary resource** — clustered recent articles |
| `GET` | `/topics` | Sorted list of distinct topic names |
| `GET` | `/topic/:name` | Articles for a topic (case-insensitive) |
| `GET` | `/article/:id` | Single article by MongoDB `_id` |
| — | `/api-docs` | Swagger UI |

### Example: `GET /digest`

Returns an array of **clusters** (not wrapped in an object):

```json
[
  {
    "topic": "Politics",
    "label": "Politics",
    "articles": [
      {
        "id": "664a1b2c3d4e5f6789012345",
        "title": "Example headline",
        "summary": "First line of summary.\nSecond line of summary.",
        "source": "BBC",
        "sentiment": "neutral",
        "topic": "Politics",
        "url": "https://www.bbc.co.uk/news/example",
        "publishedAt": "2026-05-15T12:00:00.000Z"
      }
    ]
  },
  {
    "topic": "General",
    "label": "Single-story headline becomes the label",
    "articles": [
      {
        "id": "664a1b2c3d4e5f6789012346",
        "title": "Single-story headline becomes the label",
        "summary": "…",
        "source": "Guardian",
        "sentiment": "positive",
        "topic": "General",
        "url": "https://www.theguardian.com/…",
        "publishedAt": "2026-05-14T08:30:00.000Z"
      }
    ]
  }
]
```

- **`label`:** for a one-article cluster, equals that article’s title; for multi-article clusters, equals `topic`.
- **`clusterId` is not exposed** on `/digest` (internal grouping only).

### Example: `GET /article/:id`

Returns full public fields including `content`, `clusterId`, and `createdAt` when present.

### HTTP status codes

| Code | When |
|------|------|
| `200` | Success |
| `400` | Invalid MongoDB id on `/article/:id` |
| `401` | Missing or wrong `X-API-Key` when `API_KEY` is set and route is protected |
| `404` | Unknown article or unknown route |
| `429` | Rate limit exceeded (300 requests / 15 minutes per IP on protected routes) |

### Quick `curl` smoke test

```bash
curl -s http://localhost:8000/health | jq .
curl -s http://localhost:8000/digest | jq '.[0]'
curl -s http://localhost:8000/topics | jq .
```

With API key:

```bash
curl -s -H "X-API-Key: your-key" http://localhost:8000/digest
```

---

## Authentication, rate limits, and CORS

### API key (`API_KEY`)

- If `API_KEY` is **empty**, all routes are open (simplest local dev).
- If set, clients must send header **`X-API-Key: <value>`** (or query `?apiKey=`).
- Frontend: set `VITE_API_KEY` in `frontend/.env`.

**Read-route exceptions** (see [`backend/src/server.js`](backend/src/server.js)):

| Environment | Behaviour |
|-------------|-----------|
| **Development** (`NODE_ENV` ≠ `production`) | `GET /digest`, `/topics`, `/topic/*`, `/article/*` are public unless `FORCE_API_KEY_ON_READS=true` |
| **Production** | Same GET routes are public only if `SKIP_API_KEY_ON_GETS=true` |
| Always public | `GET /`, `/health`, `/api-docs` |

### Rate limiting

- **300 requests per 15 minutes** per IP on routes that are not skipped as “public” above.
- `OPTIONS` preflight requests are not counted.

### CORS

- Allowed origins from `FRONTEND_URL` (comma-separated list supported).
- Also allows `localhost`, `127.0.0.1`, Docker hostname `frontend`, and `*.onrender.com`.
- Set `FRONTEND_URL` on EC2 to your Render URL after deploy.

---

## Environment variables

Never commit `.env` files. Copy from the `.env.example` templates.

### Backend — `backend/.env`

Template: [`backend/.env.example`](backend/.env.example)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | **Yes** | MongoDB connection string including database name, e.g. `mongodb://127.0.0.1:27017/news-digest` or Atlas URI |
| `PORT` | No | Default `8000` |
| `OPENAI_API_KEY` | No | GPT two-line summaries; omit for sentence fallback |
| `FRONTEND_URL` | No | CORS origin(s); comma-separated for multiple, e.g. `https://app.onrender.com,http://localhost:5173` |
| `API_KEY` | No | If set, enforces `X-API-Key` on protected routes |
| `SKIP_API_KEY_ON_GETS` | No | Production: `true` = public GET on digest/topics/article |
| `FORCE_API_KEY_ON_READS` | No | Development: `true` = require key on GET reads |
| `DISABLE_CRON` | No | `true` disables the 30-minute RSS job |
| `RUN_INGEST_ON_START` | No | Docker only: `false` skips ingest on container start |

### Frontend — `frontend/.env`

Template: [`frontend/.env.example`](frontend/.env.example)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend origin, e.g. `http://localhost:8000` (no trailing slash) |
| `VITE_API_KEY` | Optional; sent as `X-API-Key` when backend `API_KEY` is set |

### Docker Compose — repo root `.env`

Template: [`.env.docker.example`](.env.docker.example) → copy to `.env` at repo root.

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Passed to frontend **build** (browser-visible API URL) |
| `FRONTEND_URL` | Backend CORS |
| `OPENAI_API_KEY` | Summaries in backend container |
| `API_KEY` | Optional API protection |
| `RUN_INGEST_ON_START` | Default `true` |
| `DISABLE_CRON` | Default `false` |
| `BACKEND_PORT`, `FRONTEND_PORT`, `MONGO_PORT` | Host port mappings |

---

## Git — commit and push safely

```bash
git add .
git status
```

**Before committing, confirm these are NOT staged:**

- `backend/.env`
- `frontend/.env`
- `node_modules/`
- Any file containing real API keys or Atlas passwords

```bash
git commit -m "Assignment 4: Multi-Source News Digest API"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

If you previously ignored `frontend/` in `.gitignore`, remove that line so the UI is included in the repository.

---

## Production deployment (AWS EC2 + Render)

Typical split:

| Component | Where |
|-----------|--------|
| **MongoDB** | [MongoDB Atlas](https://www.mongodb.com/atlas) free tier |
| **Backend API** | AWS EC2 — `docker compose -f docker-compose.prod.yml` + Caddy HTTPS |
| **Frontend** | Render static site — build `frontend/` with `VITE_API_URL` pointing at HTTPS API |

[`docker-compose.prod.yml`](docker-compose.prod.yml) expects a **`deploy/`** directory on the EC2 instance (not in this repo by default). Create it before starting production:

### 1. MongoDB Atlas

1. Create a cluster and database user.
2. **Network Access:** allow EC2 public IP (or `0.0.0.0/0` for a class demo only).
3. Copy connection string → `MONGO_URI` in `deploy/.env`.

### 2. EC2 — `deploy/.env`

Create `deploy/.env` on the server (never commit):

```env
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/news-digest
OPENAI_API_KEY=sk-...
FRONTEND_URL=https://your-app-name.onrender.com
API_KEY=
SKIP_API_KEY_ON_GETS=true
DISABLE_CRON=false
NODE_ENV=production
PORT=8000
```

For Caddy TLS, also set on the host or in a `.env` next to compose:

```env
API_DOMAIN=api.yourdomain.com
CADDY_EMAIL=you@example.com
```

### 3. EC2 — `deploy/Caddyfile`

Example (replace domain):

```caddyfile
{$API_DOMAIN} {
    email {$CADDY_EMAIL}
    reverse_proxy backend:8000
}
```

### 4. Start on EC2

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO
# create deploy/.env and deploy/Caddyfile as above
docker compose -f docker-compose.prod.yml up -d --build
```

Open security group: **22**, **80**, **443**. Point DNS **A record** for `api.yourdomain.com` to the EC2 Elastic IP.

Verify:

```bash
curl https://api.yourdomain.com/health
```

### 5. Render — frontend

**Option A — Dashboard**

- New **Static Site**, root directory `frontend`
- Build: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_URL=https://api.yourdomain.com` (must rebuild after changing)

**Option B — Blueprint**

Use [`render.yaml`](render.yaml) locally as reference (file is gitignored; create the service manually or copy the file into the repo if you want it on GitHub).

### 5b. Vercel — frontend (HTTP EC2 API)

Vercel serves the UI over **HTTPS**. Browsers block `https://your-app.vercel.app` → `http://EC2-IP:8000` (mixed content). This repo includes a **serverless proxy** at [`frontend/api/[...path].js`](frontend/api/[...path].js).

**Vercel project settings**

- Root directory: `frontend`
- Framework: Vite

**Environment variables (Production + Preview)**

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `/api` | Browser calls same-origin `/api/digest` |
| `BACKEND_URL` | `http://44.192.246.119:8000` | Proxy target (include **:8000**) |
| `VITE_API_KEY` | (optional) | Forwarded as `X-API-Key` if EC2 `API_KEY` is set |

Redeploy after changing env vars. Test proxy:

```bash
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/digest
```

On EC2, set `FRONTEND_URL=https://your-app.vercel.app` if you call the API directly (without the proxy). With `/api` proxy, CORS is not required for the UI.

### 6. Post-deploy checklist

1. Atlas IP whitelist includes EC2.
2. `FRONTEND_URL` on backend matches Render URL.
3. `VITE_API_URL` on Render is **HTTPS** API URL.
4. Trigger Render **manual deploy** after any `VITE_*` change.
5. Run ingest once if the database is empty:  
   `docker compose -f docker-compose.prod.yml exec backend node src/scripts/ingestOnce.js`

---

## Screenshots

Store PNGs in `docs/screenshots/` for your report or LMS. The folder is **gitignored** to keep the repository small; keep screenshots on your machine or attach them separately to submission portals.

### 1. Landing and hero

`http://localhost:5173/` — navigation, hero, calls to action.

![News Digest landing page and hero section](docs/screenshots/01-landing-hero.png)

### 2. Digest — top headlines

`http://localhost:5173/#digest` — headlines, summaries, source, topic, sentiment.

![Top headlines grid on the digest section](docs/screenshots/02-digest-top-headlines.png)

### 3. API vs frontend URL

The UI is served by **Vite** on port **5173** (HTML). For raw **JSON**, call the API on port **8000** or use Swagger.

![REST client showing 200 HTML response from Vite dev server](docs/screenshots/03-rest-client-vite-root.png)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED` on `127.0.0.1:27017` | Start Mongo: `docker compose up mongo -d` or fix Atlas `MONGO_URI` |
| Atlas “IP not whitelisted” | Add your IP (or EC2 IP) in Atlas → Network Access |
| Empty `/digest` | Run `npm run ingest-once` or wait for cron / Docker entrypoint ingest |
| Frontend cannot reach API | Check `VITE_API_URL`; rebuild frontend after changing it |
| Mixed content on Render | API must be `https://…`, not `http://EC2-IP:8000` |
| `git add frontend/` ignored | Remove `frontend/` from [`.gitignore`](.gitignore) |
| Shell overrides `.env` | `unset MONGO_URI` and restart the backend |
| Docker frontend build fails | Ensure `frontend/package-lock.json` exists; Dockerfile uses `npm install` |

---

## License

Educational / portfolio use. Respect publisher RSS terms and robots policies for any public deployment.
