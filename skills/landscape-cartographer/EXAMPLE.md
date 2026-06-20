# Worked example + honest evaluation

A real run of the Landscape Cartographer over **"web scraping APIs"** (8 players, ~108 credits,
~18s), via the CLI fallback:

```bash
CONTEXTDEV_API_KEY=… npm -w @contextdev/core run cartographer -- "web scraping APIs"
```

## Output (real)

```
# web scraping APIs — 8 players mapped

Mapped 8 players in "web scraping APIs". Most common capabilities: web scraping, api, data extraction. Players: Google Shopping Scraper API, Firecrawl, ScrapingBee, Apify, Oxylabs, Scrape.do, Scrapfly, Proxyway.

Capabilities: web scraping, api, data extraction, proxy rotation, anti-bot bypass, automation

1. Google Shopping Scraper API  (scraperapi.com)
   Retrieve product details like names, prices, ranking positions, URLs, sources, and more from Google Shopping in structured JSON format.
   tags: web scraping, api, google shopping, ecommerce data, structured data, data collection
   [1] https://scraperapi.com
2. Firecrawl  (firecrawl.dev)
   The context API to search, scrape, and interact with the web at scale.
   tags: web scraping, web search, ai agents, data extraction, web automation, open source
   [2] https://firecrawl.dev
3. ScrapingBee  (scrapingbee.com)
   The Best Web Scraping API to Avoid Getting Blocked
   tags: web scraping, api, data extraction, proxy rotation, javascript rendering, ai data extraction
   [3] https://scrapingbee.com
4. Apify  (docs.apify.com)
   A platform for large-scale web scraping, automation, and integration with AI agents and workflows.
   tags: web scraping, automation, api, sdk, actors, ai integration
   [4] https://docs.apify.com
5. Oxylabs  (oxylabs.io)
   High Quality Proxy Service to Gather Data at Scale
   tags: proxy service, web scraping, data extraction, ai data, web automation, residential proxies
   [5] https://oxylabs.io
6. Scrape.do  (scrape.do)
   Powerful Toolkit for Hassle-Free and Scalable Web Scraping
   tags: web scraping, data extraction, api, proxies, anti-bot bypass, headless browser
   [6] https://scrape.do
7. Scrapfly  (scrapfly.io)
   Scrape any site, drive any browser, power any agent with one API key and a full-stack web scraping platform.
   tags: web scraping, api, cloud browser, anti-bot bypass, proxy rotation, javascript rendering
   [7] https://scrapfly.io
8. Proxyway  (proxyway.com)
   Your Trusted Guide to All Things Proxy
   tags: proxy reviews, proxy providers, web scraping, proxy types, proxy guides, scraping services
   [8] https://proxyway.com

108 credits · 17.8s
```

With `--json out.json` the same run writes the full typed `Landscape` (used as-is to render the
[web landscape page](../../apps/web/data/landscapes/web-scraping-apis.json)).

## Honest evaluation of context.dev for this workflow

Measured against a hand-checked corpus (see [`core/REPORT-CARD.md`](../../core/REPORT-CARD.md)):

**What it does well**
- **Company name + links: ~100% correct.** The structured extract reliably pulls the brand name
  and site/docs/pricing links.
- **One-liner / positioning: captures the gist (~50% token recall).** Good enough for a readable
  card; phrasing is the site's own marketing copy.
- **Discovery finds the real players.** For "web scraping APIs" it surfaced ScraperAPI,
  Firecrawl, ScrapingBee, Apify, Oxylabs, Scrape.do, Scrapfly, Proxyway — the genuine field.

**What's weak (be honest in the output)**
- **Free-form tags/features diverge from a curated vocabulary** (tags F1 ~6%, features fuzzy-F1
  ~41% vs hand-curated truth). The comparison matrix is therefore *indicative*, not
  authoritative — present it as "shared capabilities", not a precise scorecard.
- **Extraction can mislabel the entity.** Here "ScraperAPI" came back as "Google Shopping Scraper
  API" (a product-page title) and Apify resolved to its `docs.` subdomain — minor artifacts of
  scraping whatever page ranked.
- **Confidence is coarse.** It's the fraction of three fields present, which is ~always 1.0 on
  real sites — don't lean on it to rank players.
- **Discovery is keyword-based, not semantically relevance-checked.** Adjacent categories pull
  false positives (e.g. "AI code review tools" surfaced DigitalOcean / IBM Planning Analytics).
  The off-category filter (workflow step 3) trims the worst of it; review the result.

**Cost / latency:** ~100–110 credits and ~18–60s per 8-player map (1 search + per-player scrape +
extract). Cap `--max` to trade breadth for cost.

## API contract findings (surfaced while integrating)

`/web/` path prefix required · scrape is `GET …?url=` · extract result under `.data` ·
no `null` inside a JSON-schema enum (500s) · web search bills per result (~10 credits) and
rejects `limit`. All handled in `@contextdev/core`.
