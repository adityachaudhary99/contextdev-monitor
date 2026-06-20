---
name: landscape-cartographer
description: >-
  Use when the user wants a competitive market landscape — "map the <category> market",
  "who are the players in <category>", "build a competitive landscape / market map of
  <category>", "<category> alternatives compared". Produces an auto-built, cited, structured
  Landscape (the players in a market, each with a typed profile, a shared-capability
  comparison, and a brief) over the context.dev API — via context.dev's MCP server when
  available, otherwise the cartographer CLI fallback.
---

# Landscape Cartographer

Turn a market **category** into an auto-built, **cited, structured competitive landscape**:
the players in that market, each with a small typed profile, a shared-capability comparison,
and a short brief — every player evidence-cited to its source page.

This skill runs over the **context.dev** web-intelligence API. Prefer context.dev's official
**MCP server** when its tools are available; otherwise use the **CLI fallback** — both emit the
identical typed `Landscape`.

## When to use

The user asks to map / survey / list the players in a market, or to build a competitive
landscape / market map for a category. Examples:
- "map the headless CMS market"
- "who are the web-scraping API players?"
- "competitive landscape of AI code-review tools"

## The typed output — `Landscape`

```ts
type PlayerProfile = {
  name: string; domain: string; oneLiner: string; tagline: string | null;
  tags: string[]; features: string[]; positioning: string;
  links: { site: string | null; docs: string | null; pricing: string | null };
  sourceUrl: string; confidence: number;
};
type Landscape = {
  category: string;
  players: PlayerProfile[];
  failures: { url: string; domain: string; reason: string }[];
  comparison: { dimensions: string[] };   // shared capabilities (tags in ≥2 players)
  brief: string;                           // templated, derived from the structured data
  citations: { n: number; title: string; url: string }[];
  creditsUsed: number; latencyMs: number;
};
```

## Workflow

### Path A — over context.dev's MCP server (preferred)

If context.dev's MCP tools (web search, scrape markdown, structured extract) are available:

1. **Discover.** Run a few web searches (`"<category>"`, `"best <category> tools"`,
   `"<category> alternatives"`). Normalize results to **root domains**, dedupe, and drop
   aggregators/blogs (g2, capterra, reddit, medium, dev.to, substack, news/blog/compare/
   `-vs-` hosts, etc.). Cap at ~8 players.
2. **Profile each player.** Scrape the site to markdown (evidence), then run a **structured
   extract** against a small fixed schema → `{ name, oneLiner, tagline, tags, features,
   positioning, links }`. Never block on one player — a failed extract becomes a `failure`.
3. **Filter off-category players.** Keep only players whose profile (name + one-liner + tags +
   positioning) shares at least one **content word** with the category (drop generic words like
   "tools"/"platform"/"api"). Off-category players go to `failures` (`reason: "off_category"`),
   not the player list.
4. **Synthesize.** Comparison `dimensions` = the most common normalized **tags shared by ≥2
   players** (fall back to top tags if none are shared). Build a short templated `brief` from
   the structured data. Attach a citation per player (its `sourceUrl`).
5. **Emit** the typed `Landscape`.

**Budget:** ~100 credits per map = 1 search (10) + ~8 × (scrape 1 + extract 10). Cap players to
control cost. Re-running a category reuses unchanged snapshots if a cache is wired.

### Path B — CLI fallback (always works)

When MCP tools aren't available, run the proven `core/` pipeline:

```bash
CONTEXTDEV_API_KEY=… npm -w @contextdev/core run cartographer -- "<category>" [--max N] [--json out.json]
```

It prints a cited, human-readable summary (see [EXAMPLE.md](./EXAMPLE.md)) and, with `--json`,
writes the full typed `Landscape` to disk. This is the reliable path and the reference
implementation of the workflow above.

## context.dev API contract — gotchas to respect

These were surfaced while building the pipeline (now handled in `core/`):
- Paths need a **`/web/`** prefix (e.g. `/web/scrape/markdown`) — without it every call 403s.
- **Scrape is `GET /web/scrape/markdown?url=`**, not POST.
- The **extract result is wrapped under `.data`** — unwrap it.
- **No `null` inside a JSON-schema enum** — it 500s the validator; use null-safe
  `{ type: ["string", "null"] }`.
- **Web search bills per result** (~10 credits for the default 10) and rejects a `limit` param.

## What to expect (honest)

From a reproducible evaluation (`core/REPORT-CARD.md`): context.dev extracts **name and links
very reliably** and captures the gist of one-liners; its **free-form tags/features diverge from
a curated vocabulary** (so the comparison matrix is indicative, not authoritative). Discovery is
keyword-based, so the off-category filter (step 3) matters. See [EXAMPLE.md](./EXAMPLE.md) for a
real run + a fuller evaluation.

## Install

`.claude/` is git-ignored in this repo, so this skill ships as a plain committed folder. To use
it, copy `skills/landscape-cartographer/` into your `~/.claude/skills/` (or your agent's skills
directory), or point your agent at this file. The portable, paste-in version is
[PROMPT.md](./PROMPT.md).
