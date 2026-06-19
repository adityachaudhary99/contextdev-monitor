# Context.dev Intelligence Monitor — Design System

> Design source of truth for `apps/web`. All UI tasks read this first.

## Pattern

**Real-time ops dashboard.** This is a professional tool for engineers and operators — not a marketing page. The aesthetic is dark-OLED, high-contrast, data-dense but scannable. Every element earns its place by carrying information.

## Theme

**Dark-OLED only (v1).** No light mode. Background is near-black (#0A0E14) for OLED efficiency and focus. Surface elevation is achieved with subtle fills, never large drop-shadows.

## Typography

| Role | Font | Weights |
|------|------|---------|
| Body / UI labels / prose | **Fira Sans** | 300, 400, 500, 600, 700 |
| Headings / data / metrics / code | **Fira Code** | 400, 500, 600, 700 |

- Fira Code is used for ALL numbers, diffs, domain names, credits, latency, confidence scores — anything that benefits from monospace tabular alignment.
- Min body size: **16px**.
- All numeric data: **tabular figures** (`font-variant-numeric: tabular-nums` or Tailwind `tabular-nums` utility).
- Loaded via Google Fonts (`display=swap`).

## Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0E14` | Page background (near-black OLED) |
| `surface` | `#121821` | Cards, panels, inputs |
| `border` | `#1F2A37` | Borders, dividers |
| `fg` | `#E6EDF3` | Primary text |
| `muted` | `#8B97A6` | Secondary / placeholder text |
| `primary` | `#3B82F6` | CTAs, links, focus rings, active state |
| `primary-strong` | `#1E40AF` | Primary hover/pressed |
| `accent` | `#D97706` | Amber highlight — changes, diffs, attention |
| `success` | `#16A34A` | Positive delta, stable status |
| `warn` | `#D97706` | Warning, degraded, rate-limited |
| `danger` | `#DC2626` | Error, failure, scrape blocked |

## Status Color Rule

**Status colors ALWAYS carry an icon AND a text label.** Never rely on color alone (accessibility). Use Lucide SVG icons — never emoji.

Examples:
- Success: `<CheckCircle>` + "Stable" in `text-success`
- Warn: `<AlertTriangle>` + "Degraded" in `text-warn`
- Danger: `<XCircle>` + "Failed" in `text-danger`

## Icons

Lucide React (`lucide-react`). SVG only. No emoji in UI.

## Motion

- Transitions: **150–300ms** ease.
- Respect `prefers-reduced-motion`: all transitions/animations disabled when set.
- Use CSS class `transition-colors duration-200` as default interactive state.

## Spacing & Layout

- Container: `max-w-5xl mx-auto px-6`.
- Vertical rhythm: multiples of 4px (Tailwind default scale).
- Panel/card: `bg-surface rounded-lg border border-border p-6`.

## Focus & Accessibility

- Visible focus rings on all interactive elements: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`.
- Color contrast: all text meets WCAG AA against respective backgrounds.
- Status = icon + label (not color alone).

## Component Inventory

These are the planned components for v1. Each maps to a later task in Plan 2.

| Component | Purpose |
|-----------|---------|
| `DomainForm` | Input for competitor domain URL; submit triggers tracker run; BYO-key disclosure |
| `ReportView` | Top-level report container; routes to sub-panels; shows latency/credits/confidence header |
| `ChangeList` | Ordered list of detected pricing changes, each with evidence citations (URLs + snippets) |
| `DiffBlock` | Syntax-highlighted before/after diff for a single pricing field; monospace Fira Code |
| `MetricsPanel` | Credits used · latency · confidence score · failure list — all in Fira Code tabular figures |
| `ModeToggle` | Switch between Demo mode (capped) and BYO-key mode; shows key disclosure banner |
| `Footer` | "Powered by context.dev" link + OSS attribution + UTM link to context.dev |

## Attribution

- Every "get your own key" CTA: `https://context.dev?utm_source=contextdev-monitor&utm_medium=app&utm_campaign=oss`
- Footer: "Powered by context.dev" → same URL.
- Repo: MIT license at root.

## Key Safety (non-negotiable)

- `CONTEXTDEV_API_KEY` read ONLY in server code (route handlers / server actions). Never in client components.
- BYO key: React state in memory only. Never `localStorage`, never cookies.
- UI discloses: "Your key is sent to our server to proxy the call and is not stored."
- Keys never appear in logs, returned JSON, or client bundle.
