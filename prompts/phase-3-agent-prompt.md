# Agent Prompt: Phase 3 – StockX Integration & Advanced Intelligence

## Mission Overview

You are responsible for Phase 3 of the Grail Hunter project. With Grailed and eBay operational, your
focus is to introduce StockX integration and deliver advanced intelligence features that
differentiate the actor.

## Objectives & Success Criteria

1. Integrate StockX (high-risk) scraping via controlled automation or fallback API; handle failure
   gracefully.
2. Implement market value benchmarking and deal scoring to compare peer-to-peer prices vs
   authenticated platforms.
3. Add price drop alerts and historical price tracking using persistent storage.
4. Extend notifications to highlight deal quality and price movement.
5. Maintain/enhance AI & regex parsing accuracy (target ≥85%).
6. Update tests, documentation, and operational runbooks to reflect new intelligence features.

## Required Reading (complete before coding)

1. `IMPLEMENTATION_STATUS.md` – Phase 3 checklist & challenges (@IMPLEMENTATION_STATUS.md#560-591)
2. `technical_architecture.md`
   - Section 5.9 StockX (risks, implementation strategy, fallback logic)
     (@technical_architecture.md#2154-2239)
   - Data model sections covering deal scoring & price tracking (fields under `dealScore`, storage
     strategy).
3. `agile_project_breakdown.md`
   - Phase 3 objectives/deliverables (@agile_project_breakdown.md#232-265)
   - Relevant epics: EPIC-009 through EPIC-013 (AI parsing, dedupe, release calendar, deal scoring,
     premium tiers).
   - User stories US-027 to US-042 (advanced features, price tracking, notifications).
4. `component_specifications_complete.md`
   - Deal scoring fields, notification payload expectations, dataset schema extensions (search for
     “Deal scoring”, `dealScore`, `priceHistory`).
5. `sneaker_actor_analysis.md` / `sneaker_actor_design_docs.md` (sections on price intelligence) as
   needed.
6. `WORKSPACE_FILE_AUDIT.md` – design principles and required docs
   (@WORKSPACE_FILE_AUDIT.md#180-229)

## GitHub Issue Tracking

- Review **Phase 3 Issue**:
  [#3 – Phase 3: StockX Integration & Advanced Intelligence](https://github.com/Beaulewis1977/grail-hunter/issues/3)

## Implementation Guidance

- **StockX Scraper:**
  - Implement `src/scrapers/stockx.js` following minimal fallback pattern. Use Playwright or API
    attempts with robust error handling. Respect high risk: skip platform gracefully upon repeated
    failures.
  - Log warnings for 403/anti-bot responses and continue processing other platforms.

- **Scraper Manager & Config:**
  - Register StockX in `ScraperManager` and `PLATFORM_CONFIGS`. Include proxy requirements,
    concurrency caps, and risk annotations.

- **Market Value Benchmarking:**
  - Create a module (e.g., `src/modules/deal-scorer.js`) that compares each peer-to-peer listing
    against StockX market data (last sale, lowest ask). Cache StockX market values (KV store) for 1
    hour to control API usage.
  - Populate normalized listing schema `metadata.dealScore` object with real values:
    - `isBelowMarket` (boolean): Set to true when listing price < marketValue
    - `marketValue` (number|null): Estimated market price from StockX/GOAT last sale or lowest ask
    - `savingsPercentage` (number|null): Calculate as
      `((marketValue - currentPrice) / marketValue) * 100`
    - `savingsAmount` (number|null): Calculate as `marketValue - currentPrice`
    - `dealQuality` (string|null): Assign based on thresholds:
      - `"excellent"`: savingsPercentage > 30%
      - `"good"`: savingsPercentage 20-30%
      - `"fair"`: savingsPercentage 10-20%
      - `"market"`: savingsPercentage < 10%
      - `null`: if marketValue unavailable
  - NOTE: Phase 2.5 has scaffolded these fields with null/false defaults; Phase 3 must populate with
    real data.

- **Price Tracking & Alerts:**
  - Persist price history per listing hash (`price_<hash>` in KV store). Re-use
    `DeduplicationEngine` or create separate `PriceTracker` helper.
  - Detect price drops (≥10% default) and populate `metadata.priceChange` object:
    - `hasDrop` (boolean): Set to true when dropPercent >= threshold (e.g., 10%)
    - `previousPrice` (number|null): Fetch from stored price history or KV store
    - `currentPrice` (number): Current listing price (same as listing.price)
    - `dropPercent` (number|null): Calculate as
      `((previousPrice - currentPrice) / previousPrice) * 100`
  - Update dataset output and notification payloads to include price history snapshots or deal
    highlights.
  - NOTE: Phase 2.5 has scaffolded priceChange with null/false defaults; Phase 3 must compute real
    values.

- **Notification Enhancements:**
  - Modify `NotificationManager` to add deal highlight sections (e.g., top savings, price drops).
  - Use `metadata.dealScore.dealQuality` for prioritization in notifications.
  - Include `metadata.priceChange.hasDrop` in alert conditions.
  - Update webhook/email templates per design docs.

- **Release Calendar (if included in sprint):**
  - Build `release-calendar` module scraping sources like The Drop Date & Sole Retriever; integrate
    into dataset / notifications as separate sections.

## Testing Requirements

1. **Unit Tests:**
   - Add tests for deal scoring logic, price tracking, and StockX normalizer.
   - Expand parser/normalizer tests for new fields (`dealScore`, `priceHistory`).

2. **Integration Tests:**
   - Mock StockX responses; verify actor gracefully skips when blocked.
   - Validate multi-platform aggregation now includes StockX data, and dedupe still works.

3. **End-to-End:**
   - Update `tests/integration/end-to-end.test.js` to cover StockX inclusion, price drop detection,
     and enhanced notifications.

4. Maintain ≥80% coverage; ensure new modules meet DoD for logging and error handling.

## Documentation Updates

- `README.md`: List StockX as supported (with risk disclaimer); document deal scoring & price
  tracking features; add usage examples for deal alerts.
- `IMPLEMENTATION_STATUS.md`: Mark Phase 3 objectives complete with notes on accuracy metrics and
  coverage.
- `technical_architecture.md`: Update sections if implementation details differ; ensure disclaimers
  are accurate.
- `PR_DESCRIPTION.md`: Capture Phase 3 deliverables and risks.
- Update `.actor/INPUT.json` & schema to expose configurable thresholds (deal score %, price drop
  alert %).

## Risk Management

- **High ToS risk:** Keep StockX optional; include prominent warnings in docs & in-app logs.
- **API/anti-bot:** Implement exponential backoff and limit concurrency. Respect previous guidance
  on proxies.
- **Cost control:** Cache market values; avoid excessive API hits; log usage.
- **Data integrity:** Ensure dedupe/price tracker stores remain bounded (trim history).

## Deliverables Checklist

- [ ] StockX scraper module with graceful failure strategy.
- [ ] Deal scoring & price tracking modules integrated into pipeline.
- [ ] Enhanced notifications & dataset schema (deal highlights, price drops).
- [ ] Updated input schema for deal thresholds & StockX toggle.
- [ ] Unit, integration, E2E tests updated/passing.
- [ ] Documentation & status files refreshed.

## Definition of Done

- `npm test`, `npm run lint`, and `apify run --purge` pass with StockX enabled & disabled.
- Deal scoring logic verified with representative fixtures (include market value > listing price
  cases).
- Price drop alerts triggered correctly for multiple runs (simulate by re-running with lower
  prices).
- Documentation clearly states StockX risk and usage instructions.
- Metrics recorded in `IMPLEMENTATION_STATUS.md` (parsing accuracy, dedupe rate, coverage).

Proceed only after completing all required readings and confirming comprehension of risk areas.
