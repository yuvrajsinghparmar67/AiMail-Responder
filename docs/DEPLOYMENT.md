# Deployment Guide

## Option A — Docker Compose (recommended)

This is the path the project is built for: two containers (`backend`, `frontend`) behind `docker-compose.yml`, with the SQLite database persisted in a named volume.

```bash
git clone <your-repo-url>
cd ai-email-responder
cp .env.example .env
```

Edit `.env` and set, at minimum:
- `GEMINI_API_KEY` — from https://aistudio.google.com/apikey
- `JWT_SECRET` — generate with `openssl rand -hex 32`
- `CORS_ORIGINS` — your frontend's real origin in production (not `localhost`)
- `NEXT_PUBLIC_API_URL` — your backend's public URL (must be set **before** `docker compose build`, since Next.js inlines `NEXT_PUBLIC_*` vars at build time, not runtime)

```bash
docker compose up --build -d
docker compose logs -f      # watch both services start
```

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8000/health`

To rebuild after a code change: `docker compose up --build -d`. The SQLite file persists in the `backend_data` volume across rebuilds — `docker compose down -v` would wipe it, `docker compose down` (no `-v`) keeps it.

## Option B — Manual (no Docker)

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in values
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run build
NEXT_PUBLIC_API_URL=https://your-api.example.com npm run start
```

Run each behind a process manager (systemd, pm2, supervisor) in production rather than a bare terminal.

## Reverse proxy / TLS

Neither container terminates TLS. Put both behind a reverse proxy (nginx, Caddy, or your cloud provider's load balancer) that handles HTTPS and forwards to `:3000` (frontend) and `:8000` (backend). A minimal nginx sketch:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    location /api/ { proxy_pass http://localhost:8000; }
    location /health { proxy_pass http://localhost:8000; }
    location / { proxy_pass http://localhost:3000; }
}
```

The `/api/emails/generate` and `/regenerate` endpoints stream via SSE — make sure your proxy doesn't buffer responses (`proxy_buffering off;` on nginx) or the stream will arrive in one chunk instead of live.

## Database

SQLite is fine for a single-instance deployment and everything up to moderate traffic. If you outgrow it (multiple backend replicas, high write concurrency), swap `DATABASE_URL` for a Postgres connection string — the SQLAlchemy models have no SQLite-specific code, so this is a config change, not a code change. You'd also want to move off the `check_same_thread`/single-file-volume setup in `docker-compose.yml`.

## Production checklist

- [ ] `JWT_SECRET` is a real random value, not the `.env.example` placeholder
- [ ] `ENVIRONMENT=production` set (currently informational — wire it to disable `/docs` if you don't want Swagger public)
- [ ] `CORS_ORIGINS` locked to your real frontend origin(s), not `*` or `localhost`
- [ ] `GEMINI_API_KEY` is a production-tier key with appropriate quota for expected traffic
- [ ] `backend_data` volume is included in your backup strategy (it's the entire database)
- [ ] Reverse proxy has SSE buffering disabled for `/api/emails/generate` and `/regenerate`
- [ ] Rate limits (`RATE_LIMIT_GENERATE`, `RATE_LIMIT_AUTH`) reviewed for your expected traffic — defaults are conservative for a demo, not tuned for scale
