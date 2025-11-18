# Grail Hunter Coverage & Feature Roadmap

**Purpose:** Expand beyond Grailed + eBay while keeping the actor safe, reliable, and focused on
sneaker collectors/resellers. This roadmap maps ideas from the design docs and Phase 4 prompt onto
concrete phases that fit the existing architecture.

---

## Guiding Principles

- **User first:** Every new platform or feature should materially help sneaker buyers/collectors
  (better coverage, better alerts, less noise).
- **Risk-aware:** Prefer low-risk integrations (orchestrated Apify actors, official APIs,
  user-provided datasets) over aggressive scraping of high-risk sites.
- **Incremental:** Ship in small, testable phases rather than “all platforms at once.”
- **Reuse architecture:** Always plug into the existing pipeline:
  - `ScraperManager` → platform-specific `*Scraper` classes
  - `DataNormalizer` → `normalizeXxx()` per platform
  - `SneakerParser` → parsing updates, not rewrites
  - `ListingFilter` → advanced filters
  - `DeduplicationEngine` → unchanged, but benefits from more platforms
  - `NotificationManager` → new channels share the existing payload shape

---

## Phase 3.x – Near-Term Hardening & UX Wins (No New Platforms)

**Goal:** Make current Grailed + eBay (+ optional StockX) actor feel mature and polished before
adding more integrations.

### 3.x.1 Advanced Filters

- [ ] Extend `.actor/input_schema.json` and `validators.js` with:
  - [ ] `authenticatedOnly` (boolean)
  - [ ] `requireOGAll` (boolean)
  - [ ] `excludeAuctions` (boolean)
  - [ ] `minSellerRating` (number)
  - [ ] `minSellerReviewCount` (number)
- [ ] Ensure `DataNormalizer` for each platform populates:
  - [ ] `listing.type` (e.g., `auction`, `buy_it_now`)
  - [ ] `listing.tags` for `og_all`, `no_box`, `replacement_box`, `authenticated`
  - [ ] `seller.rating` and `seller.reviewCount`
- [ ] Add corresponding methods to `ListingFilter`:
  - [ ] `filterByAuthentication`
  - [ ] `filterByOGAll`
  - [ ] `filterByListingType`
  - [ ] `filterBySellerQuality`
- [ ] Update README / Apify listing to document advanced filter behavior and examples.

### 3.x.2 Monitoring & Docs

- [ ] Extend `last_run_stats` KV entry to include:
  - [ ] Per-platform counts (scraped, normalized, filtered, new, priceDrops)
  - [ ] Deduplication utilization percentage
  - [ ] Per-platform scrape error/failure counts
- [ ] Add README section:
  - [ ] How to inspect `last_run_stats`
  - [ ] How to interpret dedupe utilization
  - [ ] Recommended schedules and `maxResults` combinations

### 3.x.3 Sample Configurations

- [ ] Add 2–3 **preset input examples** (in README or `/examples` folder):
  - [ ] Collector preset (few grails, single size, conservative thresholds)
  - [ ] Reseller preset (more models, stricter deal thresholds)
  - [ ] Price-drop watcher (focus on `priceDropThreshold`, smaller maxResults, frequent schedule)

---

## Phase 4.0 – Safer Marketplace Breadth (Depop, Vinted/Poshmark)

**Goal:** Expand coverage to additional, relatively safer sneaker marketplaces using low-risk
integration patterns.

### 4.0.1 Integration Pattern

Preferred approaches:

- **Pattern A – Orchestrated Apify actors**
  - Use existing, stable Apify actors (similar to `vmscrapers/grailed`).
  - `XxxScraper` calls `Actor.call()`, then reads results from that actor’s dataset.
- **Pattern B – Official/partner APIs**
  - Where available and realistic, use public APIs or partner feeds instead of HTML scraping.

### 4.0.2 Depop

- [ ] Research Depop actors/APIs and select integration pattern (A or B).
- [ ] Implement `DepopScraper`:
  - [ ] `validate()` ensures required config (e.g., keywords, region)
  - [ ] `scrape(searchParams)` calls external actor/API and returns raw items array
  - [ ] Conform to `ScraperManager` error-handling expectations (`PlatformScrapingError`,
        `recoverable` flag)
- [ ] Extend `ScraperManager` and `PLATFORM_CONFIGS`:
  - [ ] Register `depop` platform with sensible defaults (maxResults, concurrency, timeouts)
- [ ] Extend `DataNormalizer`:
  - [ ] Implement `normalizeDepop(rawItem)` → unified schema
  - [ ] Map Depop-specific fields to `product`, `listing`, `seller`, `source`, and `metadata`
- [ ] Update `SneakerParser` if Depop titles show new slang patterns.
- [ ] Tests:
  - [ ] Unit tests for `DepopScraper`
  - [ ] Normalization tests against sample Depop listings
  - [ ] Integration test covering Grailed + eBay + Depop combined run
- [ ] Docs:
  - [ ] Update README and Implementation Status to reflect Depop support
  - [ ] Add Depop examples to input docs if any platform-specific fields exist

### 4.0.3 Vinted or Poshmark (Pick One First)

- [ ] Choose Vinted or Poshmark as the second “safer” platform based on:
  - [ ] Actor availability and stability on Apify
  - [ ] Regional coverage and sneaker relevance
- [ ] Mirror Depop steps:
  - [ ] `VintedScraper` or `PoshmarkScraper` using Pattern A/B
  - [ ] `normalizeVinted()` / `normalizePoshmark()` in `DataNormalizer`
  - [ ] Parser updates if needed
  - [ ] Tests and docs

**Deliverable:** A stable **Grailed + eBay + Depop + (Vinted/Poshmark)** actor, with clear docs and
tests.

---

## Phase 4.1 – Risk-Managed Beta Platforms (Mercari, OfferUp)

**Goal:** Carefully add higher-risk platforms as **beta options**, disabled by default, with strict
safeguards.

### 4.1.1 Beta Design

- [ ] Update `.actor/input_schema.json` with:
  - [ ] `mercari` and `offerup` in `platforms` enum
  - [ ] Clear descriptions: `BETA`, higher ToS/anti-bot risk, may fail or be blocked
  - [ ] `betaPlatformsEnabled` or individual `enableMercari`/`enableOfferUp` toggles (default
        `false`)
- [ ] Implement **strict limits** for beta platforms:
  - [ ] Maximum per-platform `maxResults` capped
  - [ ] Global time budget for each beta platform
  - [ ] Conservative retry strategy; no aggressive concurrency

### 4.1.2 Mercari

- [ ] Select integration pattern (prefer Pattern A through existing actors if possible).
- [ ] Implement `MercariScraper` with:
  - [ ] Strong error handling and meaningful error messages when blocked/limited
  - [ ] Logging of risk context (e.g., `riskLevel: "medium-high"`)
- [ ] Extend `DataNormalizer` with `normalizeMercari()`.
- [ ] Tests for scraper and normalizer.
- [ ] Docs with explicit warnings and guidance.

### 4.1.3 OfferUp

- [ ] Similar to Mercari:
  - [ ] `OfferUpScraper` (Pattern A preferred)
  - [ ] `normalizeOfferUp()`
  - [ ] Beta controls and limits
  - [ ] Tests and docs

### 4.1.4 Failure Monitoring

- [ ] Extend KV and `last_run_stats` to include:
  - [ ] Per-platform failure counts and failure rates
  - [ ] Flags when failure rate exceeds thresholds (e.g., >50% over 24 hours)
- [ ] Logging and docs:
  - [ ] Recommendations to disable beta platforms if failure rates are high

**Deliverable:** Mercari and OfferUp available as **beta opt-ins**, safe by default, with explicit
monitoring.

---

## Phase 4.2 – High-Risk Intelligence Layers (GOAT & StockX)

**Goal:** Provide value from GOAT/StockX without relying solely on fragile, high-risk scraping.

### 4.2.1 Strategy Options

- **Option 1 – Orchestrated actors (Pattern A)**
  - Use existing GOAT/StockX actors if they are maintained and stable.
  - Treat them as **best-effort** with strong disclaimers and default `off` toggles.
- **Option 2 – Bring-your-own-data (Pattern C)**
  - Accept user-provided datasets for GOAT/StockX prices or watchlists.
  - Ingest datasets via a generic `DatasetIngestionScraper`:
    - [ ] Input provides dataset ID and platform name
    - [ ] Scraper reads dataset and treats entries as listings

### 4.2.2 GOAT

- [ ] Decide on integration pattern (A vs C vs a hybrid).
- [ ] If Pattern A:
  - [ ] Implement `GoatScraper` orchestrating an Apify GOAT actor
  - [ ] Mark GOAT as `HIGH RISK` and disabled by default
- [ ] If Pattern C:
  - [ ] Document how users can supply GOAT-like data via datasets
- [ ] Extend `DataNormalizer` with `normalizeGoat()`.
- [ ] Tests focusing on normalization and graceful failure.
- [ ] Docs emphasizing risk, default settings, and recommended usage.

### 4.2.3 StockX Revisit

- [ ] Review existing `StockXScraper` behavior and failure patterns.
- [ ] Decide whether to:
  - [ ] Keep current minimal integration as experimental, or
  - [ ] Migrate to a Pattern C ingestion approach.
- [ ] Ensure input schema and docs clearly mark StockX as experimental.

**Deliverable:** GOAT/StockX integrated as **intelligence layers** or ingestion sources with strong,
explicit risk controls, not as mandatory core platforms.

---

## Cross-Cutting Feature Roadmap (Applies Across Phases)

### A. Notifications & Channels

- [ ] Extend input schema with `notificationConfig` for:
  - [ ] `email`
  - [ ] `slack`
  - [ ] `discord`
- [ ] Implement new notifier classes:
  - [ ] `EmailNotifier`
  - [ ] `SlackNotifier`
  - [ ] `DiscordNotifier`
- [ ] Keep payload shape consistent with existing webhook payload.
- [ ] Apply channel-specific rules:
  - [ ] Only send `excellent` deals to Slack/Discord by default
  - [ ] Only send price drops to certain channels

### B. Pricing Intelligence & Market Values

- [ ] Expand static `market-values.json` to cover more popular models/SKUs.
- [ ] Improve docs for `marketValueOverrides` with concrete examples.
- [ ] Optionally allow ingestion of external price datasets (Pattern C) to override or enrich market
      values.

### C. Release Calendars & Watchlists

- [ ] Accept `watchlist` in actor input:
  - [ ] List of SKUs/models, or
  - [ ] Dataset ID containing watchlist entries
- [ ] Ingest release calendar data (via dataset or external actor):
  - [ ] Store in separate dataset or KV
  - [ ] Cross-reference with scraped listings to:
    - [ ] Highlight under-retail offers on upcoming releases
- [ ] Portfolio support (optional future):
  - [ ] Accept holdings dataset
  - [ ] Compute potential flips based on current market values and scraped prices

### D. Performance & Caching

- [ ] Per-platform tuning:
  - [ ] Max pages/items, concurrency, and timeouts
  - [ ] AutoscaledPool configuration where applicable
- [ ] Incremental scraping where supported:
  - [ ] Store and use `lastSuccessfulScrapeTimestamp` / `lastSeenId` per platform in KV
  - [ ] Prefer platform features that support “new since X” queries
- [ ] Performance benchmarks:
  - [ ] Representative workloads recorded and documented
  - [ ] Keep typical runs <5 minutes and within memory limits

---

## Summary

This roadmap aims to:

- Gradually expand coverage beyond Grailed and eBay in a **risk-aware, testable** way.
- Implement the most impactful “missing” ideas from the design docs and Phase 4 prompt.
- Keep the actor focused on **real-world value for sneaker collectors and resellers**, not just
  checklists.

You can treat each phase (3.x, 4.0, 4.1, 4.2) as a discrete milestone for implementation, testing,
and documentation updates, ensuring the actor remains stable and competitive for the Apify Challenge
at every step.
