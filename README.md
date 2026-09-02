# ShortLink — URL Shortener with Analytics Dashboard

A full-stack URL shortener that goes beyond simple redirects. Every shortened link comes with a real-time analytics dashboard — click counts, referrer sources, browser breakdown, and geographic data — visualized with interactive charts.

<p align = "center"> <b> 
    <a href="https://pages.dev">Live Demo</a>
</b>
</p>

---

## Overview

Most link shorteners just redirect. This one tracks. Every click on a shortened link is logged and surfaced back to the user through a dashboard, so a link isn't just a link — it's a small analytics product.

The app ships with two interchangeable backends: a local **Express + SQLite** server for development, and a **Hono + Supabase** API deployed as a serverless **Cloudflare Worker** for production. Same routes, same frontend, two runtimes.

## Features

- 🔐 **Authentication** — register and log in with username or email
- 🔗 **Custom short links** — name each link and generate a unique short code (base62-encoded)
- 📊 **Per-link analytics dashboard** — powered by ECharts:
  - Total click count
  - Clicks over time (line chart)
  - Browser / user-agent breakdown (pie chart)
  - Referrer source breakdown (pie chart)
  - Geographic breakdown by country (pie chart)
- 📋 **One-click copy** for sharing short links
- 🗑️ **Link management** — view and delete links from a personal dashboard
- ⚡ **Serverless-ready** — deploys to Cloudflare Workers with Supabase as the database

## Tech Stack

**Frontend**
- React 19 + Vite
- ECharts (`echarts-for-react`) for data visualization
- Context API for auth state

**Backend** (dual implementation)
- Production: [Hono](https://hono.dev/) running on Cloudflare Workers, with [Supabase](https://supabase.com/) (Postgres) as the database
- Local development: Express + `better-sqlite3`

**Tooling & Deployment**
- Vite for bundling and dev server
- Wrangler for Cloudflare Workers deployment
- ESLint for code quality

## Architecture

```
┌─────────────┐        ┌──────────────────────┐        ┌────────────┐
│   React SPA │  --->  │  Hono API (Worker)    │  --->  │  Supabase  │
│  (Vite)     │        │  or Express (local)   │        │ (Postgres) │
└─────────────┘        └──────────────────────┘        └────────────┘
                                  │
                                  ▼
                         Click Analytics logged
                    (browser, referrer, country, time)
```

When a short link is visited, the API logs the request metadata before redirecting the user, then aggregates that data on demand for the analytics dashboard.

## Getting Started

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com/) project (for the production/Cloudflare backend) — or just run the local Express + SQLite backend for development

### Installation

```bash
# Clone the repository
git clone https://github.com/YousefMohamed101/ShortenLinkWebsite.git
cd ShortenLinkWebsite

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
```

### Running Locally

```bash
# Start the frontend (Vite dev server)
npm run dev

# Start the local Express/SQLite API (in a separate terminal)
node src/API/Server.js
```

### Deploying to Cloudflare

```bash
npm run build
npm run deploy
```

This builds the frontend and deploys the Hono API as a Cloudflare Worker via Wrangler, using the Supabase-backed routes in `src/API/SupabaseAdapter.js`.

## Current Roadmap

- [x] ~~Password hashing and token-based session auth~~
- [ ] Custom short-code aliases
- [X] ~~QR code generation~~
- [ ] CSV export for analytics

## License

This project is available under the MIT License.
