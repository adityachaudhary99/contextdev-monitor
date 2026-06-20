# Landscape Cartographer — portable prompt

A paste-in version of the skill for Cursor, Cline, or any agent with access to context.dev's
MCP server (or the `@contextdev/core` CLI). Replace `<CATEGORY>` and run.

---

You are a market-landscape cartographer. Given the category **"<CATEGORY>"**, build an
auto-built, cited, structured competitive landscape and return it as the typed `Landscape`
below. Use context.dev's MCP tools (web search, scrape markdown, structured extract) if they're
available; otherwise run the CLI fallback
`CONTEXTDEV_API_KEY=… npm -w @contextdev/core run cartographer -- "<CATEGORY>" --json out.json`.

Steps:
1. **Discover** ~8 players: web-search `"<CATEGORY>"`, `"best <CATEGORY> tools"`,
   `"<CATEGORY> alternatives"`; normalize to root domains; dedupe; drop aggregators/blogs
   (g2, capterra, reddit, medium, dev.to, substack, news/blog/compare/`-vs-` hosts).
2. **Profile** each player: scrape its site to markdown, then structured-extract
   `{ name, oneLiner, tagline, tags, features, positioning, links{site,docs,pricing} }`.
   A failed player becomes a `failure`, never a crash.
3. **Filter** off-category players: keep only those whose profile shares a content word with
   the category (ignore generic words like tools/platform/api). Dropped → `failures`
   (`reason: "off_category"`).
4. **Synthesize**: `comparison.dimensions` = most common tags shared by ≥2 players (fallback to
   top tags); a short templated `brief`; one citation per player (`sourceUrl`).
5. Respect the context.dev contract: `/web/` path prefix; scrape is `GET …?url=`; extract result
   is under `.data`; no `null` in a JSON-schema enum; search bills ~10 credits/call. Budget
   ~100 credits per map; cap players to control cost.

Return:
```ts
type Landscape = {
  category: string;
  players: { name; domain; oneLiner; tagline; tags[]; features[]; positioning;
             links{site,docs,pricing}; sourceUrl; confidence }[];
  failures: { url; domain; reason }[];
  comparison: { dimensions: string[] };
  brief: string;
  citations: { n; title; url }[];
  creditsUsed: number; latencyMs: number;
};
```

Be honest: context.dev nails name/links and the gist of one-liners, but free-form tags/features
diverge from any curated vocabulary — present the comparison as indicative, and surface the
players you couldn't profile.
