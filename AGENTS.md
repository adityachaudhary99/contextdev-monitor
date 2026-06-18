# contextdev

Open-source tools for context.dev (web scraping + intelligence API).
Goal: attributable OSS demos that drive signups via UTM-tagged CTAs.

## Lead build: Context.dev Intelligence Monitor

Track competitors/domains → extract pricing/products/positioning → evidence-linked diffs + scheduled reports.
Consolidates Projects A, B, C, F from the original 7-project plan.

### Build-shape catalog (decided 2026-06-19)
All three share one framework-free `core/` (context.dev client + pluggable trackers + content-hash cache + diff + credit ledger + eval harness).
- **A — Web-app vertical slice** → **V1 (in progress).** Thin Next.js + TS + Tailwind UI over `core/`. First tracker = **pricing** (pluggable, on a content-hash gate).
- **B — Agent-skill / MCP workflow** → fast-follow; reuses `core/`. Differentiated, founder-facing.
- **C — CLI / library** → fast-follow; thin wrapper over `core/`.

Frontend tooling (global rule): `ui-ux-pro-max` skill + 21st.dev community components + getdesign.md DESIGN.md refs.

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
