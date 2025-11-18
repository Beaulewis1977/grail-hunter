# Agent Prompt: Phase 3.x – Advanced Filters, Monitoring, and UX Hardening

## Mission Overview

Phase 3 is complete and production-ready (Grailed + eBay + StockX intelligence). Phase 3.x focuses
on **hardening the existing platforms before adding any new ones**. Your mission is to:

- Add advanced filters (authentication, OG All, auctions, seller quality) end-to-end.
- Improve monitoring/observability via `last_run_stats`.
- Provide sample input presets for collectors/resellers.
- Preserve or improve the current test coverage and stability.

No new platforms are introduced in Phase 3.x.

## Objectives & Success Criteria

1. Implement advanced filters in the input schema, normalization layer, and `ListingFilter`.
2. Ensure all current platforms (Grailed, eBay, StockX) populate the fields required by these
   filters.
3. Extend `last_run_stats` KV entries with per-platform and dedupe metrics.
4. Add 2–3 documented input presets for typical user personas.
5. Maintain or improve overall coverage (≥ current ~83%) and keep tests green.

## Required Reading (complete before implementation)

1. `IMPLEMENTATION_STATUS.md`
   - Phase 3 status and coverage numbers.
   - Any notes on remaining filter/normalization gaps.
2. `audit/COVERAGE_ROADMAP.md`
   - Section: **Phase 3.x – Near-Term Hardening & UX Wins (No New Platforms)**.
3. `technical_architecture.md`
   - Sections describing filters, deduplication, monitoring/metrics, and performance.
4. `agile_project_breakdown.md`
   - Phase 3/4 objectives and relevant epics/stories for filters, UX, and monitoring.
5. `component_specifications_complete.md`
   - Data schema for `listing`, `seller`, `source`, and filter-related fields.
6. `WORKSPACE_FILE_AUDIT.md`
   - Agent reading order and design principles.

Document completion of this checklist in your PR description.

## GitHub Issue Tracking

- Work under issues labeled **`phase-3x`**, especially:
  - **Phase 3.x: Advanced Filters & Monitoring (No New Platforms)**
- Link your PR(s) to the relevant `phase-3x` issue and the Phase 4 epic issue.

## Implementation Guidance

### 3.x.1 Advanced Filters

- Extend `.actor/input_schema.json` and `validators.js` to include:
  - `authenticatedOnly` (boolean)
  - `requireOGAll` (boolean)
  - `excludeAuctions` (boolean)
  - `minSellerRating` (number)
  - `minSellerReviewCount` (number)
- Ensure `DataNormalizer` for each existing platform populates:
  - `listing.type` (e.g., `"auction"`, `"buy_it_now"`)
  - `listing.tags` for `og_all`, `no_box`, `replacement_box`, `authenticated`
  - `seller.rating` and `seller.reviewCount`
- Add corresponding methods to `ListingFilter` and integrate them into the main filter pipeline:
  - `filterByAuthentication`
  - `filterByOGAll`
  - `filterByListingType`
  - `filterBySellerQuality`
- Add focused unit tests for each filter and combinations of filters.

### 3.x.2 Monitoring & Docs

- Extend `last_run_stats` KV entry to include:
  - Per-platform counts: scraped, normalized, filtered, new, priceDrops
  - Deduplication utilization percentage
  - Per-platform scrape error/failure counts
- Update or add documentation sections (likely in `README.md` and/or a dedicated doc) that cover:
  - How to inspect `last_run_stats`
  - How to interpret dedupe utilization
  - Recommended schedules and `maxResults` combinations

### 3.x.3 Sample Configurations

- Add 2–3 **preset input examples** (e.g., in README or an `/examples` directory):
  - Collector preset: few grails, single size, conservative thresholds
  - Reseller preset: more models, stricter deal thresholds
  - Price-drop watcher: focus on `priceDropThreshold`, smaller `maxResults`, frequent schedule
- Ensure these presets are consistent with Phase 3 features and new 3.x filters.

## Testing Requirements

1. **Unit Tests**
   - New tests for advanced filters in `ListingFilter`.
   - Normalizer tests to confirm required fields are populated for all platforms.
2. **Integration Tests**
   - Multi-platform runs (Grailed + eBay + StockX) exercising advanced filters.
   - Verify `last_run_stats` is populated as expected.
3. **End-to-End Tests**
   - At least one end-to-end test that turns filters on/off and validates observable behavior.
4. Maintain ≥80% overall coverage and keep `npm test` passing.

## Documentation Updates

- Update `README.md` to document advanced filter options and example inputs.
- Update `IMPLEMENTATION_STATUS.md` with Phase 3.x achievements and new metrics.
- Ensure `.actor/INPUT.json` (or equivalent examples) reflect the new filter fields.

## Definition of Done (Phase 3.x)

- `npm test` and `npm run lint` pass.
- Advanced filters behave as documented across all existing platforms.
- `last_run_stats` exposes the new metrics, and docs explain how to use them.
- Example presets are provided and validated.
- Implementation details are recorded in `IMPLEMENTATION_STATUS.md` and linked issues are closed.
