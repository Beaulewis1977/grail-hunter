# Scraper Build Plan (In-House Playwright)

## Scope & Order

1. Grailed (first-party Playwright/Crawlee) — replace rented actor.
2. eBay (first-party Playwright/Crawlee) — replace rented actor.
3. Depop + Poshmark (same pattern, safer marketplaces).
4. Optional later: Mercari/OfferUp (beta, Cloudflare/location heavy).
5. StockX/GOAT stay ingestion-first (scraping high-risk; keep optional API fallback toggle).

## Must-Haves (each scraper)

- Residential proxy enforcement; rotate UA/device; backoff on 429/503; optional per-domain rate cap.
- Playwright navigation with adaptive waits; retry w/ jitter; graceful degrade to empty on
  recoverable.
- Pagination until maxResults; cap for beta/high-risk if enabled.
- Fields: title/name, price, currency, size(s), condition, seller name/rating/reviewCount, listing
  URL, images, tags (OG box/authenticity), auction vs BIN (where relevant), shipping/fees if
  surfaced.
- Normalization hooks into existing pipeline; consistent `source.platform/id`, `listing.type`,
  `metadata.authenticated`, `seller.*`.
- Dedup/state reuse with existing KV store.
- Observability: per-platform stats (success/error reason), request timing, retry counts; debug logs
  for anti-bot blocks.

## Nice-to-Haves (differentiators)

- Fee-aware price output (price + shipping when available).
- Basic counterfeit/quality heuristics: flag zero-feedback sellers, extreme price deltas.
- Saved search presets (size/price filters) for user input.

## Tests (per scraper)

- Unit: normalize output shape; auction vs BIN; condition/size parsing.
- Integration (mocked HTTP/fixtures): pagination, filters applied, retries on 429/403, proxy
  required check.
- Manager wiring: platform availability and validation.

## Pricing Notes (to decide per actor)

- Proposed: Grailed $15/mo plan, eBay $50/mo plan; Depop/Poshmark TBD. Keep free/low-usage test tier
  with strict caps.

## Deliverables

- New scraper modules (Playwright/Crawlee) + config entries.
- Updated platform config input schema (if needed for site-specific options).
- Docs: short usage note + publish steps (pricing config in Apify console).
