# Grail Hunter Implementation Audit (v0.4.2)

This document summarizes how the current `grail-hunter` actor implementation aligns with the Phase 3
/ 3.x / 4.0 / 4.1 / 4.2 plans and the technical architecture.

## 1. High-Level Status

- **Actor name:** `grail-hunter`
- **Actor version:** `0.4.2` (per `.actor/actor.json` and `IMPLEMENTATION_STATUS.md`)
- **Runtime:** Apify actor (Node.js 20)
- **Core scope delivered:**
  - Multi-platform sneaker monitor across **8 platforms**: Grailed, eBay, StockX, GOAT, Depop,
    Poshmark, Mercari, OfferUp.
  - Unified normalization (`DataNormalizer`) and AI-style parsing via regex (`SneakerParser`).
  - Advanced filters (authentication, OG All, auctions, seller quality).
  - Deal scoring (`DealScorer`) and price tracking (`DeduplicationEngine`).
  - Risk-aware platform toggles (beta and high-risk platforms disabled by default).
  - Dataset + webhook notifications and rich run statistics in KV.

Overall, the implementation is **functionally complete** for Phases 3, 3.x, 4.0, 4.1, and 4.2 as
specified in the roadmap.

---

## 2. Phase-by-Phase Alignment

### 2.1 Phase 3 – StockX Integration & Advanced Intelligence

**Planned:**

- Introduce StockX as a high-risk platform with graceful failure.
- Implement market value benchmarking and deal scoring.
- Add price history tracking and price-drop alerts.
- Enhance notifications to surface deal quality and price changes.

**Implemented:**

- **StockX Scraper**
  - `src/scrapers/stockx.js` implements `StockXScraper` with appropriate error handling.
  - `src/config/platforms.js` defines a StockX config marked as high-risk and requiring proxies.
  - StockX is **opt-in** via the `enableStockX` flag in `.actor/input_schema.json` and is disabled
    by default.
  - Tests: `tests/unit/stockx-scraper.test.js`, `tests/integration/stockx_hybrid.test.js`.

- **Deal Scoring**
  - `src/modules/deal-scorer.js`:
    - Loads a static market value database from `src/data/market-values.json`.
    - Supports user-provided `marketValueOverrides` (by name or SKU).
    - For each listing, computes:
      - `metadata.dealScore.isBelowMarket`
      - `metadata.dealScore.marketValue`
      - `metadata.dealScore.savingsAmount`
      - `metadata.dealScore.savingsPercentage`
      - `metadata.dealScore.dealQuality` (`excellent`, `good`, `fair`, `market`).
    - Exposes `getStatistics()` to provide aggregate deal metrics.

- **Price Tracking & Price-Drop Alerts**
  - `src/core/deduplicator.js`:
    - Uses a KV store and SHA-256 hashes to track seen listings.
    - `trackPriceChange()` maintains per-listing price history keyed by `price_history_<hash>`.
    - Enforces bounds:
      - `maxHistoryEntriesPerItem` (default 50 entries per item).
      - `historyRetentionDays` (default 30 days) via `cleanupOldHistory()`.
    - Computes `metadata.priceChange` with:
      - `hasDrop`
      - `previousPrice`
      - `currentPrice`
      - `dropPercent` (compared against `priceDropThreshold`).

- **Pipeline Integration**
  - `src/index.js` wires together:
    - Scrapers → `DataNormalizer` → `SneakerParser` → `DealScorer` → `ListingFilter` →
      `DeduplicationEngine` → `NotificationManager`.
  - Deal scoring and price tracking are both executed before notifications and statistics
    persistence.

**Conclusion:** Phase 3 features are **implemented and integrated** end-to-end.

---

### 2.2 Phase 3.x – Advanced Filters, Monitoring, and UX Hardening

**Planned:**

- Add advanced filters (authentication, OG All, auctions, seller quality) in schema, normalizers,
  and `ListingFilter`.
- Extend monitoring via `last_run_stats` with per-platform metrics and dedupe utilization.
- Provide sample presets for common personas (collector, reseller, price-drop watcher).

**Implemented:**

- **Input Schema & Validation**
  - `.actor/input_schema.json` includes:
    - `authenticatedOnly`
    - `requireOGAll`
    - `excludeAuctions`
    - `minSellerRating`
    - `minSellerReviewCount`
    - `dealScoreThreshold`, `excellentDealThreshold`, `priceDropThreshold`
  - `src/utils/validators.js` validates these fields and enforces constraints (e.g.,
    `excellentDealThreshold >= dealScoreThreshold`).

- **Listing Filter Implementation**
  - `src/core/filter.js` provides:
    - Base filters: size, price range, condition.
    - Advanced filters:
      - `filterByAuthentication()`
      - `filterByOGAll()`
      - `filterByListingType()` (supports `excludeAuctions`)
      - `filterBySellerQuality()` (uses `minSellerRating` and `minSellerReviewCount`).
    - A data-quality filter that removes listings with missing name, invalid price, or missing URL.

- **Normalizer Enhancements**
  - `src/core/normalizer.js` ensures:
    - eBay listings include:
      - `listing.type` (`auction` vs `sell`).
      - Tags reflecting `authenticity_guarantee`, auction vs buy-it-now.
      - `seller.rating` and `seller.reviewCount` derived from feedback metrics.
    - Grailed and other platforms expose tags for OG box, no box, replacement box, and
      authentication hints.

- **Monitoring & Metrics (`last_run_stats`)**
  - `src/index.js` computes:
    - Per-platform stats: `scraped`, `normalized`, `filtered`, `new`, `priceDrops`, `errors`,
      `isBeta`, `riskLevel`, `failed`.
    - Aggregate stats: total scraped, normalized, filtered, new, priceDrops, errors.
    - Beta health metrics: beta platforms used/failed, failure rate, recommendations.
    - Filtering metrics: which filters were applied and the counts before/after filtering.
    - Deduplication metrics: utilization and new hashes added.
  - These stats are stored in KV under the `last_run_stats` key.

- **Presets & Documentation**
  - `/examples` directory contains:
    - `collector-preset.json`
    - `reseller-preset.json`
    - `price-drop-watcher.json`
  - `IMPLEMENTATION_STATUS.md` documents Phase 3.x completion and test coverage.

**Conclusion:** Phase 3.x objectives are **met** and integrated across schema, code, and tests.

---

### 2.3 Phase 4.0 – Safer Marketplaces (Depop + Poshmark)

**Planned:**

- Add Depop and Poshmark as safer peer-to-peer marketplaces via orchestrated actors.
- Normalize their data into the shared schema.
- Integrate with advanced filters and pipeline.

**Implemented:**

- **Scrapers**
  - `src/scrapers/depop.js` and `src/scrapers/poshmark.js` implement orchestrated scrapers using
    Apify actors.

- **Platform Configuration**
  - `src/config/platforms.js` defines `depop` and `poshmark` with:
    - `type: 'orchestrated'`
    - Actor IDs
    - Conservative `rateLimit` and `cacheTimeout`
    - `riskLevel: 'low'`
    - `enabled: true` by default.

- **Normalizers**
  - `normalizeDepop()` and `normalizePoshmark()` in `DataNormalizer` map raw Depop/Poshmark
    structures into the unified schema, including seller rating and review count for filter
    compatibility.

- **Tests**
  - Integration tests: `tests/integration/depop_scraper.test.js`,
    `tests/integration/poshmark_scraper.test.js`.
  - Normalizer tests: added coverage in `tests/unit/normalizer.test.js`.

**Conclusion:** Phase 4.0 features (Depop + Poshmark) are **implemented and stable**.

---

### 2.4 Phase 4.1 – Risk-Managed Beta Platforms (Mercari + OfferUp)

**Planned:**

- Add Mercari and OfferUp as **beta** platforms.
- Use a global `betaPlatformsEnabled` flag plus per-platform toggles.
- Apply strict limits and monitoring; ensure graceful degradation.

**Implemented:**

- **Input Schema & Toggles**
  - `.actor/input_schema.json` defines:
    - `betaPlatformsEnabled`
    - `enableMercari`
    - `enableOfferUp`
    - `zipCode` (required for OfferUp location-based search when enabled).

- **Scrapers & Configs**
  - `src/scrapers/mercari.js`, `src/scrapers/offerup.js` implement platform-specific scraping with
    conservative settings.
  - `src/config/platforms.js` marks Mercari and OfferUp as:
    - `enabled: false` by default.
    - `isBeta: true` with elevated risk levels.
    - Strict `maxResults`, timeouts, and retry defaults.

- **ScraperManager Integration**
  - `src/scrapers/manager.js` only registers Mercari/OfferUp scrapers when:
    - `betaPlatformsEnabled === true` **and**
    - `enableMercari` / `enableOfferUp` are individually set to `true`.
  - Logs explicit beta warnings when these platforms are enabled.

- **Beta Health Monitoring**
  - `src/index.js` tracks:
    - Number of beta platforms used vs failed.
    - `betaFailureRate` and a health `warning` message.
    - A list of failed beta platforms with error messages and risk levels.
    - Recommendations when failure rate exceeds configured thresholds (e.g., disable beta, verify
      proxies, check actor health).

- **Tests**
  - Integration tests: `tests/integration/mercari_scraper.test.js`,
    `tests/integration/offerup_scraper.test.js`.
  - Additional coverage via multi-platform E2E tests.

**Conclusion:** Phase 4.1 beta platforms and risk controls are **fully implemented**.

---

### 2.5 Phase 4.2 – GOAT & StockX Hybrid Intelligence

**Planned:**

- GOAT and StockX as optional intelligence layers, not core required platforms.
- Hybrid integration:
  - Orchestrated scrapers where viable (Pattern A).
  - Dataset ingestion for GOAT/StockX-like datasets (Pattern C).
- Strong risk controls and logging; disabled by default.

**Implemented:**

- **GOAT Integration**
  - Scraper: `src/scrapers/goat.js`.
  - Config: `goat` in `src/config/platforms.js`:
    - Marked as high-risk and disabled by default.
  - Enabled only when `enableGOAT === true` in input.

- **Dataset Ingestion (Pattern C)**
  - `src/scrapers/dataset-ingestion.js` implements `DatasetIngestionScraper`.
  - `.actor/input_schema.json` defines `ingestionDatasets[]`:
    - Each entry includes `datasetId`, `platform` (`goat` or `stockx`), and optional
      `platformLabel`.
  - `ScraperManager` dynamically registers ingestion-based scrapers (e.g.,
    `goat_ingestion_<datasetId>`) and logs their registration.

- **Hybrid StockX Strategy**
  - StockX scraping via `StockXScraper` plus dataset ingestion from `ingestionDatasets`.
  - Tests (`stockx_hybrid.test.js`) verify hybrid scenarios and graceful degradation.

- **Risk & Optionality**
  - High-risk platforms (GOAT, StockX) are disabled by default and clearly labeled as such in:
    - `.actor/input_schema.json`.
    - `.actor/actor.json`.
    - Implementation status and phase prompts.

**Conclusion:** Phase 4.2 GOAT & StockX hybrid intelligence is **implemented as designed**.

---

## 3. Gaps vs Early Architectural Ambitions

These are features present in early design docs but intentionally out of scope for the current 0.4.2
implementation:

- **Additional Notification Channels**
  - Design docs mention Email, Slack, and Discord notifiers.
  - Current implementation:
    - Always writes listings to a dataset.
    - Supports a generic HTTP webhook via `notificationConfig.webhookUrl` and `WebhookNotifier`.
  - There are **no dedicated Email/Slack/Discord notifier classes** yet.

- **AI-Based Parsing via OpenAI**
  - Specs reference `useAIParsing`, `openAIKey`, and GPT-based parsing.
  - Current code:
    - `SneakerParser` is purely regex-based.
    - There is **no OpenAI integration** or schema fields for API keys.

- **Release Calendar & External Watchlists**
  - Architecture describes scraping release calendars (The Drop Date, Sole Retriever, etc.).
  - There is **no `release-calendar` module** or tests for this feature in `src/`.

- **Extended Platform Set (12+ platforms)**
  - Some docs list additional platforms (Flight Club, Stadium Goods, Kixify, Craigslist, Vinted,
    etc.).
  - Current implementation supports **8 platforms**, plus ingestion-based sources.

These items should be framed as **future roadmap**, not current features, in public-facing
documentation.

---

## 4. Minor Consistency & Labeling Issues

- **Version and Phase Labels**
  - `.actor/actor.json` and `IMPLEMENTATION_STATUS.md` identify the project as **Phase 4.2,
    v0.4.2**.
  - `src/index.js` still logs a startup banner mentioning Phase 4.1 and sets `runMetadata.version`
    to `0.4.1`.

- **Platform Count Text**
  - Some text in `IMPLEMENTATION_STATUS.md` references "7 platforms" while the actual config and
    code support **8**: Grailed, eBay, StockX, GOAT, Depop, Poshmark, Mercari, OfferUp.

- **Legacy TODO Comments**
  - `DataNormalizer` still contains comments like `TODO Phase 3: populate dealScore...` even though
    deal scoring is now handled by `DealScorer` and price tracking by `DeduplicationEngine`.

These are cosmetic and documentation-level issues rather than functional bugs but are worth updating
for clarity before public release.

---

## 5. Overall Assessment

- The `grail-hunter` actor is **implementation-complete** for the planned Phase 3 → 4.2 roadmap.
- Core functionality (multi-platform scraping, normalization, advanced filters, deal scoring, price
  tracking, beta/high-risk controls, run statistics) is robust and covered by unit + integration
  tests.
- Remaining work for launch is primarily:
  - Cleaning up version/phase labels and platform counts.
  - Ensuring documentation accurately reflects what is implemented vs future roadmap.
  - Running final test and performance passes on Apify.
