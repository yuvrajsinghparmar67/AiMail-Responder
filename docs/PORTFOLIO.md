# Portfolio & Marketing Copy

## Portfolio project description

**AI Email Responder** — a production-ready SaaS for generating polished, on-tone email replies with AI.

Built end-to-end: Next.js 15 + TypeScript frontend, FastAPI backend, JWT authentication, and Google's Gemini API for generation. The core interaction — paste an email, pick a tone, watch the reply stream in token-by-token — is backed by a full product surface: 8 tones × 3 lengths × 5 languages, reusable prompt templates, searchable history, a drafts workflow with favorites, and a usage analytics dashboard.

Technically, the project demonstrates:
- **Real-time streaming UX** — Server-Sent Events from FastAPI to a hand-rolled fetch-stream parser on the frontend (not just a wrapped chat widget)
- **Thoughtful engineering tradeoffs, documented in code** — e.g. the "variations" feature deliberately trades streaming for concurrency (`asyncio.gather`) rather than over-engineering a multiplexed stream protocol for marginal UX gain
- **Auth done correctly for the framework** — JWT in a cookie specifically so Next.js edge middleware can gate protected routes server-side, with a separate profile cache for instant client hydration
- **Full CRUD across three resources** (drafts, templates, history) with search, filtering, and favoriting
- **A real design system**, not ad-hoc Tailwind — CSS-variable-driven theming, a consistent glassmorphism treatment, Framer Motion respecting `prefers-reduced-motion` globally, and full keyboard/screen-reader accessibility passes
- **Dockerized for one-command deployment**, with a documented path to Postgres if SQLite is outgrown

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · FastAPI · SQLAlchemy · SQLite · Google Gemini API · Docker

---

## LinkedIn post

🚀 Just shipped a project I'm genuinely proud of: **AI Email Responder** — a full SaaS app that turns any incoming email into a polished, on-tone reply in seconds.

The idea is simple — paste an email, pick a tone (professional, friendly, executive, and 5 more), and watch a reply stream in live, powered by Google's Gemini API. But building it "for real" meant going well past the demo:

✅ JWT auth with proper route protection (Next.js edge middleware, not just a client-side check)
✅ Streaming AI responses over Server-Sent Events
✅ Reusable prompt templates, searchable history, a full drafts workflow
✅ A usage analytics dashboard with zero-filled charts (no broken UI on a new account)
✅ Full accessibility pass — keyboard nav, screen-reader labels, reduced-motion support
✅ Dockerized, documented, deployment-ready

Stack: Next.js 15, TypeScript, Tailwind, shadcn/ui, Framer Motion, FastAPI, SQLAlchemy, Gemini API.

The most fun part was the streaming architecture — since native `EventSource` can't send a POST body or auth headers, I hand-rolled an SSE parser over a `fetch` `ReadableStream` to get real token-by-token streaming with proper auth. Happy to talk through the details if you're curious.

#buildinpublic #nextjs #fastapi #ai #saas

---

## Resume bullet points

- Architected and built a full-stack AI SaaS (Next.js 15/TypeScript + FastAPI) delivering real-time streaming AI responses via Server-Sent Events, JWT-secured auth with edge-middleware route protection, and full CRUD across three resources with search and filtering
- Designed a token-by-token streaming pipeline from a Python async generator through FastAPI SSE to a hand-rolled frontend stream parser, eliminating the need for a third-party chat SDK
- Implemented a cookie-based JWT auth flow specifically compatible with Next.js edge middleware, enabling server-side route protection before any client JS executes
- Built a reusable design system (CSS-variable theming, shadcn/ui-pattern components, Framer Motion with global reduced-motion support) achieving a consistent premium UI across 10+ pages
- Containerized the full stack with Docker Compose for one-command deployment; documented a config-only migration path from SQLite to PostgreSQL for scale

---

## Client proposal template

> Subject: AI Email Responder — Ready-to-Deploy SaaS for [Client/Company Name]

Hi [Name],

I've built **AI Email Responder**, a production-ready SaaS application that lets your team generate polished, on-brand email replies in seconds using AI — and I'd like to walk you through how it could work for [Company Name].

**What it does:** paste any incoming email, choose a tone that matches your brand voice (professional, friendly, formal, and 5 more), and get a fully drafted reply — streamed live, editable, and ready to send. Teams can save reusable templates for common scenarios (support tickets, sales outreach, HR correspondence) so replies stay consistent across the whole team, not just accurate.

**Why it's a good fit for [Company Name]:**
- Cuts time spent on routine email drafting without sacrificing your team's voice
- Multi-language support (English, Hindi, Spanish, French, German) if you handle international correspondence
- Built-in usage analytics so you can see actual time/volume impact
- Runs entirely on your own infrastructure (Docker, one command to deploy) — your email content never has to go through a third-party SaaS beyond the AI provider itself

**What's included:**
- Full source code, documented and ready to extend
- Deployment guide for Docker or manual hosting
- API documentation if you want to integrate it with your existing tools (e.g. a Gmail add-on, a support ticket system)

I'd love to set up a short demo and talk through what customization or integration would make sense for your workflow. Let me know a time that works.

Best,
[Your name]

---

## Future improvements

- **Gmail/Outlook integration** — direct inbox connection instead of copy-paste (mentioned as a "later" feature in the original brief)
- **Team workspaces** — shared templates and drafts across a team, not just per-user
- **Streaming variations** — multiplex N concurrent Gemini streams into the side-by-side comparison view (currently non-streamed by design; see `docs/ARCHITECTURE.md`)
- **Postgres migration path** — already documented, not yet implemented; needed before multi-instance/high-write-concurrency deployment
- **Fine-grained rate limiting per user** (currently per-IP via slowapi) — matters once behind a shared corporate NAT/proxy
- **Automated test suite** — the project was verified via compile checks, manual code review, and import-resolution checks throughout; no pytest/Playwright suite exists yet
- **Light theme** — the current design system is intentionally dark-only per the given palette; a light theme would need its own color spec
