# Context.dev Intelligence Monitor

Track a competitor's pricing page — get evidence-linked diffs, on demand.

![screenshot](docs/screenshot.png)
<!-- TODO: add a real screenshot once the app is deployed -->

---

## What it does

Enter a competitor domain. The app:

1. Locates the pricing page via web search.
2. Extracts a **typed pricing snapshot** (tiers, prices, feature bullets) through the [context.dev](https://context.dev?utm_source=contextdev-monitor&utm_medium=readme&utm_campaign=oss) API.
3. Content-hashes the snapshot and diffs it against the prior one stored in-session.
4. Shows the **full extracted pricing table** — captured as a *baseline* on the first run, then an evidence-cited **diff** ("what changed since last check", price moves flagged) on later runs — plus a panel showing credits used, latency, confidence, and any extraction failures.

Clean dashboard UI with a **light / dark theme toggle** (light by default). No accounts. No scrapers to maintain. No cron jobs.

---

## How it works

```
Web Search / Scrape
      ↓
Extract Structured  (context.dev API — server-side only)
      ↓
Content-hash gate  (skip report if nothing changed)
      ↓
Typed diff  (@contextdev/core engine)
      ↓
Evidence-cited report  (apps/web — Next.js 15 thin UI)
```

`packages/core` (`@contextdev/core`) holds the diff engine and types. `apps/web` is a thin Next.js 15 UI that calls a server route — the API key never leaves the server.

---

## Demo vs BYO-key

| Mode | How |
|------|-----|
| **Demo** | Uses the maintainer's context.dev key. Subject to daily caps — when hit, the UI shows a CTA to bring your own key. |
| **BYO-key** | Paste your own [context.dev](https://context.dev?utm_source=contextdev-monitor&utm_medium=readme&utm_campaign=oss) key in the UI. It is sent to the server route on each request and is **never stored** (not in localStorage, not in a database). |

---

## Run locally

```bash
npm install
```

Copy the env example and add your key:

```bash
cp apps/web/.env.example apps/web/.env.local
# then edit apps/web/.env.local and set CONTEXTDEV_API_KEY
```

Start the dev server:

```bash
npm -w web dev
```

Open [http://localhost:3000](http://localhost:3000).

**Deploy to Vercel:** Import the repo, set `CONTEXTDEV_API_KEY` as an environment variable (server-only — do NOT prefix with `NEXT_PUBLIC_`), and deploy. The monorepo root is the project root; Vercel auto-detects the Next.js app under `apps/web`.

---

## Powered by context.dev

This project is built on the [context.dev](https://context.dev?utm_source=contextdev-monitor&utm_medium=readme&utm_campaign=oss) API for structured web extraction. Get your own key at **context.dev** to run unlimited reports.

---

## License

[MIT](LICENSE) — 2026 Aditya Chaudhary
