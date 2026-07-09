# contextdev

Open-source tools for context.dev (web scraping + intelligence API).
Goal: attributable OSS demos that drive signups via UTM-tagged CTAs.

## Lead build: Context.dev Intelligence Monitor

Track competitors/domains → extract pricing/products/positioning → evidence-linked diffs + scheduled reports.
Consolidates Projects A, B, C, F from the original 7-project plan.

### Build history + pivot
The shipped foundation is one framework-free `core/` (context.dev client + pluggable trackers + content-hash cache + diff + credit ledger + eval harness).
- **A — Web app (pricing Monitor)** → **SHIPPED + MERGED 2026-06-19/20.** Next.js UI over `core/` + a report redesign (pricing table, light/dark, status states). Live-verified.
- **B — Agent-skill / MCP workflow** + **C — CLI** → **SUPERSEDED 2026-06-20.** A CLI duplicates context.dev's own first-party CLI (low signal); the agent-skill folds into the new direction's v2. Dropped as standalone fast-follows.

### NEXT DIRECTION (pivot, 2026-06-20): Landscape Cartographer
Category in → an **auto-built, cited, structured competitive landscape** out (the players in a market, each typed + confidence-scored + evidence-cited; a comparison table + brief). Novel (market maps are hand-built/expensive — no open auto-cartographer with cited structured data), distinctive (not a first-party clone), reuses `core/` (each player = a tracked entity), and is the spectacular answer to "what do you DO with this beyond scraping". Specs: `.project/specs/2026-06-20-landscape-cartographer-v1-design.md` (focused slice) + `-v2-design.md` (full vision: over-time diffs, rich dimensions, the agent-skill on context.dev's MCP, the extraction report-card, visual + SEO landscape pages).

Frontend tooling (global rule): `ui-ux-pro-max` skill + 21st.dev community components + getdesign.md DESIGN.md refs.

### v2 shipped (2026-06-20)
- **Report-card** — reproducible, honest eval of context.dev extraction → `core/REPORT-CARD.md` (`npm -w @contextdev/core run report-card`; `--collect` for a live run).
- **Public landscape pages + visual map** — static curated + on-demand `/landscape/<slug>` pages with a positioning map; `apps/web/scripts/gen-landscapes.ts` adds curated snapshots.
- On-demand landscape results are persisted under shareable `/landscape/<slug>` URLs; KV is optional and the web app falls back to session-lifetime memory.
- **Agent skill** — see below.

## Agent skill: Landscape Cartographer

`skills/landscape-cartographer/` — a Claude-Code skill (+ portable prompt) that maps a market
**category** → a cited, structured `Landscape`, over context.dev's MCP server when available,
with the `cartographer` CLI as the proven fallback (`npm -w @contextdev/core run cartographer -- "<category>"`).
`SKILL.md` = the skill; `PROMPT.md` = paste-in for Cursor/Cline; `EXAMPLE.md` = a real run +
honest evaluation. (`.claude/` is git-ignored here, so the skill ships as a plain folder — copy
it into `~/.claude/skills/` to use.)

## Stack

Next.js (App Router) · TypeScript · Tailwind · Vercel · Anthropic SDK (default LLM)

## Plan

Full 7-project brief + strategic review (2026-06-12): `.project/proj.md` (local-only)
v1 design spec: `.project/specs/2026-06-19-intelligence-monitor-v1-design.md` (local-only)
Recommended execution order:
1. Thin vertical slice — one competitor, one tracked question
2. Typed extraction + evidence-linked diffs + credit accounting
3. Fixtures + evaluation harness (extraction quality + failure modes)
4. Publish worked example with honest API observations

## Notes

- Pre-flight before building: fetch `https://docs.context.dev/llms.txt`
- Verify `ai_query` endpoint still exists; may need web search + schema extraction instead
- Projects D, E, G deprioritized/killed per strategic review

## Tracking

`.project/status.md`
