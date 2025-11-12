# Agent Prompt: Phase 2 – eBay Integration & Multi-Platform Aggregation

## Mission Overview

You are taking over Phase 2 of the Grail Hunter project. Phase 1 (Grailed-only MVP) is live and
production-ready. Your mission is to expand the actor to support eBay and multi-platform aggregation
while preserving stability and Apify Challenge readiness.

## Goals & Success Criteria

1. Integrate eBay scraping via the recommended actor-based approach or direct Finding API fallback.
2. Normalize eBay results into the shared schema and merge with existing Grailed pipeline.
3. Support auction vs. buy-it-now handling and surface authenticity information.
4. Update deduplication logic to work across multiple platforms.
5. Extend input schema to allow selecting platforms (Grailed + eBay) and advanced filters relevant
   to Phase 2.
6. Achieve automated test coverage for new code paths and update documentation.

## Required Reading (in order)

1. `IMPLEMENTATION_STATUS.md` – Phase 2 checklist & challenges (@IMPLEMENTATION_STATUS.md#532-559)
2. `technical_architecture.md` – Section 5.1 eBay integration, orchestration patterns, rate limiting
   (@technical_architecture.md#1619-1731)
3. `agile_project_breakdown.md` – Phase 2 objectives, deliverables, risks; EPIC-006/007/008 &
   related user stories (@agile_project_breakdown.md#200-332, @agile_project_breakdown.md#1485-1518)
4. `component_specifications_complete.md` – Data schema expectations (source.platform enum,
   listing.type, authenticity flags) (see `source` model + listing examples around eBay sample)
5. `WORKSPACE_FILE_AUDIT.md` – Agent reading order & design principles
   (@WORKSPACE_FILE_AUDIT.md#180-229)

Confirm you've reviewed these before making changes.

## GitHub Issue Tracking

- Review **Phase 2 Issue**:
  [#2 – Phase 2: eBay Integration & Multi-Platform Aggregation](https://github.com/Beaulewis1977/grail-hunter/issues/2)

## Implementation Guidance

- **Scraper Manager:** Extend `src/scrapers/manager.js` to register an `EbayScraper`. Follow the
  placeholder pattern already present (@src/scrapers/manager.js#20-31).
- **Scraper Implementation:** Create `src/scrapers/ebay.js` using the orchestrated actor approach
  outlined in `technical_architecture.md`. Prefer calling `getdataforme/ebay-scraper` with
  constructed URLs. Implement fallback to direct API if necessary.
- **Platform Config:** Update `src/config/platforms.js` with eBay-specific settings (rate limits,
  authentication flags, request batching hints).
- **Normalizer:** Add eBay-specific normalization in `src/core/normalizer.js` or a dedicated helper
  to populate fields such as `listing.type`, `listing.tags` (for authenticity guarantee), seller
  info, and ensure size/condition parsing flows through the parser.
- **Auction Handling:** Ensure auctions are either filtered or marked appropriately
  (`listing.type: "auction"`). Respect user preference (Phase 2 objective mentions buy-it-now vs.
  auction filters).
- **Deduplication:** Confirm `DeduplicationEngine` remains platform-agnostic; add tests to ensure
  cross-platform hashes stay unique (platform + ID).
- **Input Schema:** Update `.actor/INPUT_SCHEMA.json` to allow multi-select platform array (see
  Phase 2 note) and expose advanced filters (size, condition, price) if not already present. Keep
  schema docstrings consistent.
- **Aggregation:** In `src/index.js`, adjust orchestration to iterate over selected platforms, merge
  normalized listings, and re-use existing parser/filter/deduper pipeline.

## Testing Requirements

1. **Unit Tests:**
   - Add coverage for new normalizer logic and any helper utilities.
   - Extend parser/filter tests if new tags or condition mappings are introduced.
2. **Integration Tests:**
   - Create tests validating multi-platform aggregation (mock Grailed + eBay results) and dedupe
     behavior.
   - Add fixtures representing typical eBay responses (include auction & buy-it-now scenarios).
3. **End-to-End:**
   - Update `tests/integration/end-to-end.test.js` to include eBay in the platform list and assert
     combined output shape.
4. Maintain ≥80% coverage (Phase 1 benchmark) and ensure `npm test` passes locally before shipping.

## Documentation Updates

- `README.md`: update supported platforms, usage examples, and limitations.
- `IMPLEMENTATION_STATUS.md`: mark Phase 2 items complete and record test coverage stats.
- `PR_DESCRIPTION.md`: log Phase 2 deliverables under "Completed" once work is done.
- Any schema or configuration changes must be reflected in `.actor/INPUT.json` sample and documented
  in README.

## Risks & Mitigations

- **Auction pricing variability**: clearly document how auctions are handled; consider optional
  filtering.
- **Rate limits**: implement exponential backoff & logging for HTTP 429 per technical architecture
  guidance.
- **Data consistency**: ensure parser and filters receive uniform objects regardless of platform.

## Deliverables Checklist

- [ ] eBay scraper module with orchestration + fallback.
- [ ] Platform config & manager wiring.
- [ ] Normalized multi-platform pipeline + dedup updates.
- [ ] Enhanced input schema + sample input.
- [ ] Comprehensive tests (unit/integration/e2e).
- [ ] Documentation refreshed (README, Implementation Status, PR description).

## Definition of Done

- Tests (`npm test`) and linters (`npm run lint`) pass locally.
- Actor runs successfully via `apify run --purge` exercising both platforms.
- Documentation and samples accurately reflect new capabilities.
- No regressions to Grailed flow; verify by running existing fixtures.
- All code follows existing style guidelines (ESLint, Prettier, Husky hooks).

Complete these steps before handing off to the next phase team.
