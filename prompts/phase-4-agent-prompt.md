# Agent Prompt: Phase 4 – GOAT Integration, Final Polish, and Launch

## Mission Overview

Phase 4 is the final push: deliver a polished, launch-ready multi-platform actor with GOAT support,
advanced filters, comprehensive QA, and go-to-market assets. Prior phases produced Grailed + eBay
functionality and advanced intelligence; you are responsible for completing the remaining platform
work, hardening the product, and preparing launch materials.

## Objectives & Success Criteria

1. Integrate GOAT scraping/orchestration and ensure all four core platforms (Grailed, eBay, StockX,
   GOAT) operate together.
2. Add “beta” integrations for Mercari, OfferUp, and Vinted with graceful degradation and risk
   disclaimers.
3. Implement advanced filters (authenticated only, OG All requirement, auction exclusion, min seller
   rating) across input schema, filtering logic, and tests.
4. Deliver full-system hardening: performance optimization, parallel scraping tuning, load testing,
   and comprehensive automated tests (unit/integration/E2E).
5. Finalize documentation, marketing assets, monetization plumbing, and Apify Store readiness.
6. Achieve success metrics: ≥85% run success across all platforms (≥80% for beta), zero P0/P1 bugs,
   80%+ coverage, pricing tiers live, launch collateral complete.

## Required Reading (complete before implementation)

1. `IMPLEMENTATION_STATUS.md` – Phase 4 feature list, advanced filters, performance targets
   (@IMPLEMENTATION_STATUS.md#592-616)
2. `technical_architecture.md`
   - Section 5.2 GOAT implementation (+ fallback strategies) (@technical_architecture.md#1734-1758)
   - Platform comparison table & strategy notes for Mercari/OfferUp/Vinted (search “Platform
     integration batch 3”).
   - Sections on advanced filters, release calendar, performance optimization, scheduling,
     marketing/monetization (e.g., caching, AutoscaledPool config, marketing roadmap, monetization
     strategy).
3. `agile_project_breakdown.md`
   - Phase 4 objectives/success criteria (@agile_project_breakdown.md#267-300)
   - Epics EPIC-014 – EPIC-017 and user stories US-043 to US-054 (platform batch 3, QA, marketing,
     monetization, launch checklists).
4. `component_specifications_complete.md` – Schema expectations for `source`, advanced filters,
   notification payloads, and examples referencing GOAT/authenticated platforms.
5. `WORKSPACE_FILE_AUDIT.md` – Agent reading order, design principles, doc requirements
   (@WORKSPACE_FILE_AUDIT.md#180-229)
6. `README.md`, `PR_DESCRIPTION.md`, `SETUP_COMPLETE.md` – Ensure final docs/launch notes align with
   project narrative and Apify Challenge guidelines.
7. `apify_challenge_rules.md` – Confirm submission and quality requirements for final deliverable.

Document completion of the reading checklist before coding.

## GitHub Issue Tracking

- Review **Phase 4 Issue**:
  [#4 – Phase 4: GOAT Integration & Launch Readiness](https://github.com/Beaulewis1977/grail-hunter/issues/4)

## Implementation Guidance

### Platform Integrations

- **GOAT Scraper**
  - Implement/enable `GoatScraper` leveraging recommended orchestrated actor
    (`ecomscrape/goat-product-search-scraper`) with proxy requirements and risk handling
    (@technical_architecture.md#1734-1758).
  - Normalize GOAT data (authenticated platform fields) and ensure parser recognizes GOAT-specific
    attributes (auth status, slug URLs).
- **Beta Platforms (Mercari, OfferUp, Vinted)**
  - Follow strategies from technical architecture & agile doc (custom scrapers or orchestrated
    actors where available).
  - Mark beta platforms clearly in configuration, skip gracefully on failure, and surface warnings
    in logs/output.
  - Limit concurrent requests and enforce platform-specific rate limits.

### Advanced Filters & Input Schema

- Update `.actor/input_schema.json` and sample input to include:
  - `authenticatedOnly`, `requireOGAll`, `excludeAuctions`, `minSellerRating`, and any additional
    advanced filters specified in Implementation Status.
  - **Configurable Deal Score Thresholds**: `dealScoreThreshold` (default: 10%) and
    `excellentDealThreshold` (default: 30%) to allow users to customize deal quality classifications
    based on their flipping margins.
  - **Enhanced Market Value Overrides**: Extend `input.marketValues` to support SKU-based overrides
    in addition to name-based for more precise market value mapping (e.g., `{"SKU123": 950}`).
  - Platform multi-select including new beta platforms; allow toggling StockX/GOAT if risk-averse
    users opt out.
- Extend filtering logic in `src/core/filter.js` (or new helpers) to respect all advanced filter
  selections; add tests for each condition.

### Performance & Reliability

- Tune `ScraperManager` for parallel execution (AutoscaledPool settings, concurrency caps per
  platform).
- Implement caching/incremental scraping strategies per technical architecture guidance (e.g., reuse
  last scrape timestamps, cache authenticated platform data for 1h).
- **Price History Storage Management**: Ensure `src/core/deduplicator.js` implements automatic
  cleanup of price history entries older than 30 days and enforces `maxHistoryEntriesPerItem`
  (e.g., 50) to prevent KV store bloat for frequently updated listings.
- Add health checks and failure notifications when a platform repeatedly fails; update dedupe and
  price trackers to handle expanded platform set.
- **Platform Monitoring**: Track fallback rates for high-risk platforms (StockX, GOAT) and alert if
  failure rate exceeds 50% over 24-hour periods.

### Quality Assurance & Testing

- **Unit Tests:** Cover new scrapers, normalizers, advanced filters, notification changes, caching
  utilities.
- **Integration Tests:** Multi-platform E2E coverage including GOAT and beta platforms (use
  fixtures/mocks), verify advanced filters and dedupe across all.
- **Load/Performance Tests:** Simulate large watchlists to validate runtime <5 minutes target (per
  agile doc success criteria).
- Ensure total coverage ≥80% and explicitly record metrics in `IMPLEMENTATION_STATUS.md`.

### Notifications & Output

- Update notification templates (email/webhook) to surface platform badges (authenticated vs
  peer-to-peer), advanced filter context, deal highlights, price drops, and release calendar
  insights where applicable.
- Update dataset schema to include filter metadata (e.g., whether listing passed authenticated-only
  filter) and mark beta platform results.

### Documentation & Launch Assets

- Refresh `README.md` with:
  - Final feature list, supported platforms (clearly note beta status and risk disclaimers),
    advanced filter descriptions, deployment instructions, and troubleshooting updates.
- Update `IMPLEMENTATION_STATUS.md`, `PR_DESCRIPTION.md`, `SETUP_COMPLETE.md`, and
  `DOCUMENT_SUMMARY.md` (if needed) with final state and metrics.
- Produce marketing collateral per agile doc: landing page copy, social posts, video scripts
  (reference user stories US-049 to US-054).
- Ensure Apify Store metadata (actor.json description, categories, pricing, images) reflects final
  offering.
- Confirm monetization setup (pricing tiers, gating logic, onboarding messaging) matches agile plan
  and README.

## Risk Management

- **Platform Blocking:** Provide beta flag toggles, implement exponential backoff, and add
  monitoring alerts when failure rate >50%.
- **Performance/Memory:** Monitor AutoscaledPool metrics; trim datasets, caches, and dedupe history
  as needed.
- **Legal/ToS:** Reinforce disclaimers in docs for GOAT/StockX/OfferUp; optionally provide
  configuration to disable high-risk platforms by default.
- **Marketing timeline:** Coordinate release calendar scraping & notifications with marketing
  schedule; ensure assets meet deadlines for Apify Challenge submission.

## Deliverables Checklist

- [ ] GOAT integration live with normalization, tests, and documentation.
- [ ] Beta platforms (Mercari, OfferUp, Vinted) implemented with graceful degradation & warnings.
- [ ] Advanced filters wired through schema, filtering, and UI documentation.
- [ ] Performance optimizations (parallel scraping, caching) validated via benchmarks.
- [ ] Comprehensive automated test suite + load test artifacts.
- [ ] Updated documentation set (README, Implementation Status, PR description, marketing
      collateral, actor metadata).
- [ ] Monetization and launch assets ready (pricing tiers, landing page, video/demo outline).

## Definition of Done

- `npm test`, `npm run lint`, and `apify run --purge` pass across multiple configurations (core
  platforms only, full platform set, beta disabled, advanced filters toggled).
- Load/performance testing demonstrates <5 min runtime and memory within limits for representative
  workloads.
- Documentation reflects final architecture, filters, platform statuses, and launch instructions
  (double-check cross-references and links).
- Marketing materials and monetization settings are ready for Apify Store listing and submission per
  challenge timeline.
- All risks addressed with logging, user-facing messaging, or configuration toggles; zero critical
  bugs outstanding.

Complete each item and record outcomes in the relevant documentation before handing off for
launch/deployment.
