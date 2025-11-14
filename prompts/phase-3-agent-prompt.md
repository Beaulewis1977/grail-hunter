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

## Supplementary Implementation Notes

Based on architectural review, consider these enhancements to improve robustness and coverage:

- **Market Value Database Coverage**: Expand static JSON DB from 100+ to 200-300 sneakers to improve
  deal scoring accuracy across more models. Focus on high-volume sneakers (Jordan 1-13, Yeezy
  350/700, Dunks) and recent releases.

- **Configurable Deal Score Thresholds**: Add `dealScoreThreshold` (default: 10%) and
  `excellentDealThreshold` (default: 30%) to `.actor/INPUT_SCHEMA.json` to allow users to customize
  what constitutes a "good" vs "excellent" deal based on their flipping margins.

- **Price History Storage Management**: Implement automatic cleanup in `src/core/deduplicator.js` to
  prevent KV store bloat. Add `cleanupOldHistory()` method called on init that removes price history
  entries older than 30 days. Consider adding a `maxHistoryEntriesPerItem` (e.g., 50) to bound
  memory usage for frequently updated listings.

- **StockX Fallback Monitoring**: Add metrics logging in `src/scrapers/stockx.js` to track fallback
  rate (403 responses vs successful scrapes). Log warning if fallback rate exceeds 50% over a
  24-hour period to alert users when proxies may be needed.

- **Enhanced Market Value Overrides**: Extend `input.marketValues` to support SKU-based overrides in
  addition to name-based, enabling more precise market value mapping for colorway-specific pricing.

These enhancements are optional but recommended for production readiness. They do not change core
Phase 3 objectives but improve scalability and user experience.

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

---

## Implementation Plan

The following plan was created after thorough exploration and analysis of the codebase. Follow the
below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan.
Explore only when absolutely necessary. First implement all the proposed file changes and then I'll
review all the changes together at the end.

## Observations

**Current State:** Phase 1 complete with Grailed scraper, normalization, filtering, deduplication,
and notifications (webhook/dataset). Codebase uses modular structure: src/scrapers, src/core,
src/notifications. KV store for dedup. OUTPUT_SCHEMA includes dealScore fields. Tests at 80%
coverage.

**Phase 3 Scope:** Add StockX (high-risk, fallback-only), market value DB for deal scoring, price
history in KV, enhanced notifications. Docs need StockX warnings.

**Constraints:** StockX ToS risks; use static DB over scraping for values. Maintain graceful
degradation.

## Approach

**Core Implementation:**

- StockX: Minimal API fetch with 403 fallback, log warnings, return [].
- MarketValue: Static JSON DB (200-300 sneakers) + user overrides (name and SKU-based); calculate
  savings/deal quality post-normalization.
- Price Tracking: Extend deduplicator KV for history (30-day TTL, max 50 entries per item), detect
  drops >10%.
- Notifications: Add deal highlights to webhook payload, price drop badges.
- Integration: Pipeline: scrape → normalize → score → dedup/track → notify.
- Testing: 80% coverage for new code; integration tests for pipeline.
- Docs: Add risks, usage examples.

## Reasoning

Reviewed GitHub ticket #3 for Phase 3 requirements. Examined IMPLEMENTATION_STATUS.md confirming
Phase 1 done, Phase 3 pending. Analyzed technical_architecture.md for StockX fallback strategy and
deal scoring logic. Studied agile_project_breakdown.md for EPIC-012 (deal scoring) and EPIC-010
(deduplication extensions). Inspected component_specifications_complete.md for output schema with
dealScore fields and notification enhancements. Explored codebase structure via directory listing,
focusing on scrapers/base.js, core/normalizer.js, deduplicator.js, notifications/webhook.js.

## Proposed File Changes

### src/scrapers/stockx.js(NEW)

References:

- src/scrapers/base.js
- src/scrapers/grailed.js

Implement StockXScraper extending BaseScraper from `src/scrapers/base.js`. Use fetch to hit
`https://stockx.com/api/browse?_search=${keywords}` with User-Agent header. On 403/Cloudflare, log
warning and return []. Normalize response Products array mapping to standard schema: extract name,
brand (from brand_name), model, colorway, sku (style_id), price (lowest_ask),
condition='new_in_box', tags=['authenticated','stockx'], url=`https://stockx.com/${slug}`, imageUrl
from media. Add buildSearchUrls() returning API endpoint. Include validate() checking config. Set
recoverable=true on errors. Follow `src/scrapers/grailed.js` patterns. Export class.

### src/config/platforms.js(MODIFY)

Update PLATFORM_CONFIGS.stockx: set enabled=true, type='custom', rateLimit=50, cacheTimeout=60,
isAuthenticated=true, requiresProxy=true, baseUrl='https://stockx.com', riskLevel='very_high',
disclaimer='HIGH RISK: StockX enforces ToS strictly. Use fallback only.'. Ensure SUPPORTED_PLATFORMS
includes 'stockx' when enabled.

### src/scrapers/manager.js(MODIFY)

References:

- src/config/platforms.js(MODIFY)

In initializeScrapers(), import StockXScraper and add
`this.scrapers.stockx = new StockXScraper(PLATFORM_CONFIGS.stockx);` after grailed. In scrape(),
loop includes 'stockx' if enabled; existing try-catch with recoverable errors handles fallback. Add
logging for high-risk platforms:
`if (config.riskLevel === 'very_high') Actor.log.warn('Scraping high-risk platform: ${platform}');`.

### src/core/normalizer.js(MODIFY)

References:

- .actor/OUTPUT_SCHEMA.json

In normalize() switch, add case 'stockx': return this.normalizeStockX(rawListing);. Implement
normalizeStockX(): map raw to schema - product.name=raw.name, brand=raw.brand_name,
model=extractModel(raw.name), colorway=raw.colorway, sku=raw.style_id,
listing.price=raw.market?.lowestAsk || raw.last_sale, condition='new_in_box',
tags=['authenticated','stockx_verified'], source.platform='StockX', is_authenticated=true,
url=`https://stockx.com/${raw.slug}`, imageUrl=raw.media?.image_url. Use helpers like extractModel
from existing normalizeGrailed. Handle missing fields with defaults/null.

### src/core/market-value.js(NEW)

References:

- agile_project_breakdown.md
- .actor/OUTPUT_SCHEMA.json

Create MarketValueService class. Static MARKET_VALUES JSON with 200-300 sneakers: { 'Air Jordan 1
Bred': {marketValue:950, lastUpdated:'2025-11-10', source:'public_guides', sku:'555088-610'} , ... }
covering Jordans, Yeezys, Dunks, etc. Methods: getMarketValue(name, sku, overrides) - prioritize
overrides (support both name and SKU keys) > DB match (fuzzy on name or exact SKU) > null;
calculateDealScore(price, marketValue) - if price < marketValue: savings=(marketValue-price),
percent=(savings/marketValue)\*100,
quality=percent>=30?'EXCELLENT':percent>=20?'GOOD':percent>=10?'FAIR':'MARKET';
enrichListing(listing, overrides) - add metadata.dealScore {isBelowMarket, marketValue,
savingsAmount, savingsPercent, dealQuality}. updateMarketValue(sku, value) for runtime changes.
Export singleton. Validate inputs, log misses.

### src/core/deduplicator.js(MODIFY)

References:

- component_specifications_complete.md

Extend for price history. Add PRICE*HISTORY_KEY='price_history', RETENTION_DAYS=30,
MAX_HISTORY_ENTRIES=50. New method trackPriceHistory(listing): key=`price*${platform}_${id}`, get
existing history or [], append {price, timestamp, condition}, trim >30 days and enforce max 50
entries per item, setValue. detectPriceDrop(listing, threshold=10): get history, if len>=2,
dropPercent=((prevPrice - price)/prevPrice)\*100, return {hasDrop: dropPercent>=threshold,
prevPrice, price, dropPercent, dropAmount}. In findNewListings(), after dedup: if new or existing,
trackPriceHistory; if existing && detectPriceDrop, add metadata.priceChange=details, log 'PRICE
DROP: ${name} ${dropPercent}%'. Add cleanupOldHistory() on init. Update getStats() with
priceHistoryCount, dropsDetected.

### src/index.js(MODIFY)

References:

- src/core/market-value.js(NEW)
- src/core/deduplicator.js(MODIFY)

Import MarketValueService. Init `const marketValueService = new MarketValueService();`. After
parsing (line ~80): // Deal Scoring: const enriched = parsedListings.map(l =>
marketValueService.enrichListingWithDealScore(l, input.marketValues || {})); log
`${enriched.filter(l => l.metadata.dealScore).length} with scores`. Use enriched for
filtering/dedup. In dedup, pass enablePriceTracking=input.enablePriceTracking || true. Update stats:
add dealScoresFound, priceDrops from dedup stats. Handle input.marketValues object for overrides.

### src/notifications/webhook.js(MODIFY)

References:

- component_specifications_complete.md

In buildPayload(), add to summary: dealHighlights={excellent:0, good:0, fair:0, priceDrops:0}; loop
listings, if dealScore?.isBelowMarket: increment by quality, if priceChange?.hasDrop: ++priceDrops.
Update bestDeal: sort by savingsPercent desc or price asc, include dealScore fields. Add
findDealHighlights(listings): return counts/top deals. In payload.listings, ensure include full
metadata.dealScore, priceChange. Add formatDealMessage(listing): e.g. '🔥
${quality}: Save ${savingsPercent}% (${savingsAmount}) on
${name} ${priceChange ? '📉 Dropped
${dropPercent}%' : ''}'. Use in summary or attachments.

### src/notifications/dataset.js(MODIFY)

References:

- .actor/OUTPUT_SCHEMA.json

In send(), before pushData: validate listings have metadata.dealScore (log count with scores),
scrape.priceHistory if tracked. Ensure OUTPUT_SCHEMA compliance: dealScore fields present (null if
no value). Add log 'Saved ${listings.length} listings, ${withScores} with deal scores,
${withHistory}
with price history'. No major changes needed as pushData handles all fields.

### src/utils/errors.js(MODIFY)

Add StockXScrapingError extends Error: constructor(blockType='unknown', message, originalError):
super(`StockX blocked (${blockType}): ${message}`), this.platform='StockX', riskLevel='very_high',
recoverable=true, blockType, originalError, suggestion=getSuggestion(blockType) e.g. 'Use proxies'
for 'cloudflare'. Export class. Use in stockx.js for specific errors.

### .actor/INPUT_SCHEMA.json(MODIFY)

Update title/description to 'Phase 3: StockX + Deal Scoring'. Add to platforms enum: 'stockx',
enumTitles include 'StockX (⚠️ HIGH RISK)'. Add marketValues: type=object, title='Custom Market
Values', description='Overrides: {"Air Jordan 1 Bred":950} or {"SKU123":950}', editor='json'. Add
dealScoreThreshold: number, default=10, min=0,max=50, title='Deal Threshold %'. Add
excellentDealThreshold: number, default=30, min=10,max=50, title='Excellent Deal Threshold %'. Add
enablePriceTracking: boolean, default=true. Add priceDropThreshold: number, default=10,
min=5,max=50. Section for Phase 3 features.

### README.md(MODIFY)

References:

- technical_architecture.md

Update overview to Phase 3. Add Platforms table row for StockX: status=✅ (with ⚠️), note='High
risk, fallback only'. New section '⚠️ StockX Risks': warn ToS, anti-bot, graceful fallback,
recommend exclude for prod. Key Features: add '💰 Deal Scoring (30%+ Excellent)', '📈 Price Tracking
& Drops'. Phase Status: mark Phase 3 COMPLETE. Usage: examples with marketValues,
priceDropThreshold. Troubleshooting: 'StockX blocked' - enable proxies; 'No deal scores' - add
marketValues.

### IMPLEMENTATION_STATUS.md(MODIFY)

Update header: title='Phase 3 Complete', date=2025-11-11, version=0.3.0, branch='feature/phase-3',
status=✅ PRODUCTION READY. Executive Summary: add Phase 3 achievements - StockX fallback, market DB
(200-300), deal scoring, price history (30d, max 50 entries), enhanced notifs. New section 'Phase 3
Implemented': detail each feature, test coverage. Update 'Working Features': add StockX (fallback),
deal scoring, price drops. Phase 3: ✅ COMPLETE, actual time=~4h. Known Limitations: add StockX
risks, static DB needs updates. Testing: new files stockx.test.js (80%), market-value.test.js (90%).

### tests/unit/stockx-scraper.test.js(NEW)

References:

- tests/unit/scraper-manager.test.js

Import StockXScraper, mock fetch/Actor.log. Tests: extends BaseScraper; buildSearchUrls returns API
URL; successful scrape maps data correctly; 403 returns [], logs warning; invalid JSON returns [];
network error returns []; normalizeStockX matches schema; all listings authenticated=true;
validate() checks config; error.recoverable=true. Mock sample StockX response. Assertions: empty on
failure, proper structure on success, no thrown errors. Coverage 80%+.

### tests/unit/market-value.test.js(NEW)

References:

- tests/unit/normalizer.test.js

Import MarketValueService. Tests: getMarketValue from DB; override priority (SKU and name); null for
unknown; calculateDealScore math (e.g. 950-750=200,21.05%,GOOD); null if no market/price>=market;
getDealQuality thresholds/boundaries; enrichListing adds metadata.dealScore, preserves data;
updateMarketValue works. Edge: 0/neg prices, empty strings. Mixed listings. Coverage 90%+.

### tests/unit/deduplicator.test.js(MODIFY)

Add describe('Price History'): trackPriceHistory appends/trims; detectPriceDrop calc/hasDrop;
cleanup removes old; enforces max entries. Update findNewListings: tracks history, adds priceChange
on drop, logs. getStats includes counts. Mock KV for history keys. Ensure no break existing dedup.
New cases: first-time, multiple drops, increases (no flag).

### tests/unit/webhook.test.js(MODIFY)

References:

- component_specifications_complete.md

Add to buildPayload: dealHighlights counts, bestDeal by savings, includes dealScore/priceChange. New
describe('Deal Highlights'): findDealHighlights counts/top; formatDealMessage emojis/text. Update
payloads: verify metadata fields, summary sections. Mock listings with/without scores/drops.
Integration: full payload Phase 3 features, backward compat.

### tests/integration/end-to-end.test.js(MODIFY)

Add test 'Phase 3: StockX + Deal Scoring': input with stockx, marketValues; verify fallback [],
dealScore added; price tracking on runs. 'Multi-platform with StockX': aggregate, fallback doesn't
break. 'Deal Scoring': custom values, quality calc. 'Price Drops': simulate drop, metadata added,
webhook highlights. Validate output schema new fields. Mock StockX 403, KV history. Error: graceful
on StockX fail.
