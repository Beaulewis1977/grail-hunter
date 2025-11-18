# Agent Prompt: Phase 4.0 – Depop & Poshmark Safer Marketplaces

## Mission Overview

Phase 4.0 expands Grail Hunter beyond Grailed/eBay/StockX into **safer third-party marketplaces**.
Based on the coverage roadmap, the initial safer marketplaces are:

- **Depop**
- **Poshmark**

Your mission is to integrate these platforms using risk-aware patterns while reusing the existing
pipeline (scrapers → normalizer → parser → filters → dedupe → notifications).

## Objectives & Success Criteria

1. Integrate Depop and Poshmark as first-class platforms using orchestrated actors or approved APIs.
2. Normalize both platforms into the existing unified schema.
3. Ensure advanced filters, deal scoring, deduplication, and notifications work seamlessly across
   all platforms (Grailed, eBay, StockX, Depop, Poshmark).
4. Maintain or improve reliability (success rates) and performance targets.
5. Preserve coverage and add tests for new platforms.

## Required Reading (complete before implementation)

1. `IMPLEMENTATION_STATUS.md`
   - Phase 3 summary and any notes about multi-platform behavior.
2. `audit/COVERAGE_ROADMAP.md`
   - Section: **Phase 4.0 – Safer Marketplace Breadth (Depop, Vinted/Poshmark)**.
   - Note: For this phase, the chosen pair is **Depop + Poshmark**.
3. `technical_architecture.md`
   - Platform integration strategies (orchestrated actors, APIs, rate limiting).
   - Any platform comparison notes relevant to Depop/Poshmark.
4. `agile_project_breakdown.md`
   - Phase 4 objectives and epics related to additional marketplaces.
5. `component_specifications_complete.md`
   - Normalized schema expectations for new platforms.
6. `WORKSPACE_FILE_AUDIT.md`
   - Agent reading order and architectural principles.

## GitHub Issue Tracking

- Work under issues labeled **`phase-40`**, especially:
  - **Phase 4.0: Safer Marketplaces (Depop + Poshmark)**
- Link your PR(s) to the relevant `phase-40` issue and the Phase 4 epic issue.

## Implementation Guidance

### Integration Pattern

- Prefer **Pattern A – Orchestrated Apify actors** for Depop and Poshmark, where reliable actors
  exist.
- Use **Pattern B – Official/partner APIs** only where appropriate and maintainable.
- Encapsulate platform-specific logic in `DepopScraper` / `PoshmarkScraper` classes that conform to
  the existing `ScraperManager` expectations (including error handling and `PlatformScrapingError`).

### Depop

- Implement `DepopScraper` with:
  - `validate()` to ensure required config (e.g., keywords, region).
  - `scrape(searchParams)` that calls the orchestrated actor/API and returns raw items.
- Register `depop` in:
  - `ScraperManager` (or equivalent orchestrator).
  - `PLATFORM_CONFIGS` with sensible defaults (maxResults, concurrency, timeouts).
- Implement `normalizeDepop(rawItem)` in `DataNormalizer` and map fields into:
  - `product`, `listing`, `seller`, `source`, `metadata`.
- Update `SneakerParser` only if Depop titles introduce new slang/patterns.

### Poshmark

- Implement `PoshmarkScraper` following the same patterns as Depop:
  - Orchestrated actor/API wrapper.
  - Validation + scrape methods.
- Register `poshmark` in `ScraperManager` and `PLATFORM_CONFIGS`.
- Implement `normalizePoshmark(rawItem)` in `DataNormalizer`.
- Update parser if Poshmark introduces new patterns.

### Cross-Platform Behavior

- Ensure existing advanced filters (Phase 3.x) and deal scoring apply uniformly to Depop/Poshmark
  listings.
- Confirm deduplication uses stable, platform-aware keys so new platforms do not break dedupe.
- Update any platform lists in configuration, notifications, and docs to include Depop/Poshmark.

## Testing Requirements

1. **Unit Tests**
   - Scraper tests for Depop/Poshmark (mocking orchestrated actors/APIs).
   - Normalizer tests for `normalizeDepop` and `normalizePoshmark`.
2. **Integration Tests**
   - Mixed runs across Grailed + eBay + StockX + Depop + Poshmark.
   - Validate filters, dedupe, and notifications across all platforms.
3. **End-to-End Tests**
   - End-to-end scenario including at least one new platform in the platform list.
4. Maintain coverage thresholds and keep `npm test` passing.

## Documentation Updates

- Update `README.md` and `IMPLEMENTATION_STATUS.md` to:
  - List Depop and Poshmark as supported platforms.
  - Document any platform-specific input examples or caveats.
- Update `.actor/input_schema.json` and sample inputs to include Depop/Poshmark in platform
  selection.

## Definition of Done (Phase 4.0)

- Depop and Poshmark are fully wired through the pipeline with tests and docs.
- Multi-platform runs including Depop/Poshmark meet performance targets.
- No regressions to existing Grailed/eBay/StockX behavior.
- Issues labeled `phase-40` are closed and Phase 4 epic updated accordingly.
