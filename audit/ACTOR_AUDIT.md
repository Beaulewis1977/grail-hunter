# Grail Hunter Actor Audit (Codebase, Security, UX, Phase 4 Prompt)

**Repo:** `grail-hunter`  
**Date:** 2025-11-13  
**Scope:** Full actor implementation (through Phase 3), docs, prompts, and especially
`prompts/phase-4-agent-prompt.md`.

---

## 1. What the Actor Actually Does Today

### 1.1 Platforms and Pipeline

**Implemented platforms (runtime reality):**

- **Grailed** via orchestrated actor `vmscrapers/grailed`
- **eBay** via custom `EbayScraper` using `dtrungtin/ebay-items-scraper` (per docs/tests; code not
  shown above but wired through `ScraperManager` and `PLATFORM_CONFIGS`)
- **StockX (optional, high-risk)** via minimal HTTP API-based `StockXScraper`

**Pipeline (from `src/index.js`):**

1. **Input validation + normalization**
   - `validateInput` enforces:
     - `keywords`: 1–20 non-empty strings
     - `platforms` or `platform` in supported set (`grailed`, `ebay`, `stockx`)
     - Valid `size`, `priceRange`, `condition`, `maxResults`, notification/webhook URL, thresholds,
       `marketValueOverrides`, `enableStockX`/`disableStockX` types.
   - `normalizeInput` sets defaults and builds `platforms` array, proxy config, thresholds.

2. **Platform configuration**
   - Clones `PLATFORM_CONFIGS` and dynamically disables `stockx` unless `enableStockX === true` and
     `disableStockX !== true`.

3. **Scraping** (`ScraperManager`)
   - Builds `scrapers` for:
     - `grailed` → `GrailedScraper`
     - `ebay` → `EbayScraper` (if configured)
     - `stockx` → `StockXScraper` (only when enabled)
   - `scrape(platform, searchParams)`:
     - Calls `validate` on the scraper.
     - Invokes `scraper.scrape()` with exponential backoff (`retryWithBackoff`).
     - On **recoverable error** (`error.recoverable === true`), logs and returns `[]` (graceful
       degradation).
     - On non-recoverable error, bubbles up.
   - `GrailedScraper`:
     - Calls `vmscrapers/grailed` actor with keyword-generated search URLs.
     - Paginates dataset results to avoid truncation.
   - `StockXScraper` (if enabled):
     - Uses `https://stockx.com/api/browse?_search=` with browser-like headers.
     - Minimal mapping into a generic product object.
     - Tracks `failureCount` and auto-disables after 3 failures (returns `[]`).

4. **Normalization** (`DataNormalizer`)
   - Converts platform-specific records into unified schema matching `.actor/OUTPUT_SCHEMA.json`.
   - Platform-specific logic:
     - **Grailed**: maps title/brand/model, price, condition (`mapGrailedCondition`), tags
       (`extractTags`), seller stats, image URL.
     - **eBay**: infers ID from `itemNumber` or URL (or deterministic hash), tags
       authenticity/auction/BIN, marks `is_authenticated` when eBay Authenticity Guarantee present.
     - **StockX**: maps basic product attributes, uses `market.lastSale`/`lowestAsk`/`lastSale` for
       price and `marketValue`.
   - Generic fallback for unknown platforms.
   - Populates **Phase 2.5/3 metadata** structures:
     - `metadata.dealScore`: correct shape but pre-Phase-3 values are defaulted; Phase 3
       `DealScorer` fills them.
     - `metadata.priceChange`: default structure; `DeduplicationEngine` updates this during runtime.

5. **Parsing** (`SneakerParser`)
   - Regex-based parsing of:
     - **Condition** from slang (`DS`, `VNDS`, `NDS`, etc.).
     - **Size** (US men’s, including decimals) from title/description.
     - **Tags** such as `og_all`, `pe`, `sample`, `promo`, `no_box`, `replacement_box`, plus
       `ds`/`vnds`/`nds` from text.

6. **Deal scoring** (`DealScorer` – Phase 3)
   - Uses `src/data/market-values.json` (152 curated sneaker models) + `marketValueOverrides`.
   - Calculates `savingsPercentage`, `savingsAmount`, `isBelowMarket`, and `dealQuality` based on
     `dealScoreThreshold` and `excellentDealThreshold`.

7. **Filtering** (`ListingFilter`)
   - Filters by:
     - Size (`size_us_mens`).
     - Price range.
     - Minimum condition (ordered scale).
   - Removes invalid listings (missing name, invalid price, missing URL).

8. **Deduplication + price tracking** (`DeduplicationEngine`)
   - KV store state:
     - `seen_listing_hashes` map.
     - `price_history_<hash>` arrays.
   - Hash: SHA-256 over `platform:id`.
   - Migrates legacy MD5 by **dropping** them and repopulating under SHA-256.
   - `findNewListings`:
     - Marks `listing.scrape.isNew`.
     - Calls `trackPriceChange(listing, hash)` to populate `metadata.priceChange` and keep bounded
       price history:
       - Max 50 entries per item (`maxHistoryEntriesPerItem`).
       - Cleanup of histories with last entry older than 30 days (`historyRetentionDays`).
   - Enforces capacity of 10,000 hashes and trims oldest.

9. **Notifications** (`NotificationManager`)
   - Always pushes to Apify dataset via `DatasetNotifier` (critical; failure rethrows).
   - Optionally sends webhook via `WebhookNotifier`:
     - HMAC-SHA256 signature header (`X-Grail-Hunter-Signature`) if secret configured.
     - Payload includes:
       - `summary.platformBreakdown`, `averagePrice`, `bestDeal`, `dealHighlights` (top deals by
         savings), `priceDrops` (top drops).
       - Full `listings` array.
   - Webhook failures are non-critical and logged.

**Bottom line:**

- For sneaker users, **today’s actor is a solid, production-ready multi-platform Grailed+eBay+StockX
  (optional) deal finder** with dedupe, deal scoring, and price drop tracking.
- GOAT, Mercari, OfferUp, Vinted, etc. are **design-time concepts only** (tech docs and prompts) and
  are not yet implemented in code.

---

## 2. Strengths (Code, Reliability, and UX for Sneaker Users)

### 2.1 Engineering Quality

- **Testing & coverage:**
  - ~122 tests, ~83% coverage (Phase 3) across unit + integration (per `IMPLEMENTATION_STATUS.md`).
  - ES modules correctly wired for Jest with `NODE_OPTIONS=--experimental-vm-modules`.
- **Error handling:**
  - Custom error types (`ValidationError`, `PlatformScrapingError`, `NotificationError`,
    `ActorCallError`) with `recoverable` flags.
  - Scraper manager degrades only on explicitly recoverable errors.
  - Dataset failures treated as critical; webhook failures are soft.
- **Logging:**
  - Pino-based `logger`, with consistent usage across modules.
  - Rich logs for new listings, price drops, platform failures, and statistics.
- **Input/output schemas:**
  - `.actor/input_schema.json` and `.actor/OUTPUT_SCHEMA.json` are detailed and user-friendly.
  - Validation logic in `validators.js` mirrors schema constraints closely (e.g., thresholds
    relationships, URL validation).

### 2.2 Utility for Sneaker Collectors/Resellers

- **Core value:**
  - Removes the need to poll Grailed and eBay manually.
  - Standardizes data so that users can plug this into automation (webhooks) or dashboards.
  - Deduplication across runs + price-change tracking directly address real buyer pain points (alert
    fatigue and missing price drops).
- **Deal intelligence:**
  - Market-value-based scoring with 152 sneaker entries + overrides lets resellers tune to their own
    margin expectations.
- **Webhook payload structure:**
  - Already exposes the key summary metrics a buyer/builder would need for alerts/automation.
- **Apify-native experience:**
  - Uses KV and dataset idiomatically.
  - Reasonable defaults (50 results, residential proxies, thresholds) and high but bounded
    `maxOutputDatasetItems`.

---

## 3. Weaknesses, Risks, and Security Considerations

### 3.1 StockX Scraping Risk

**What’s implemented:**

- `StockXScraper` calls `https://stockx.com/api/browse` with a static UA and no proxy logic in this
  file.
- Error handling is defensive (403/429 detection, failure counts, graceful empty arrays).
- Docs and input schema label StockX as **HIGH RISK** and default it to off.

**Risks:**

- **ToS & legal:** StockX has aggressive anti-bot and ToS enforcement. Even with warnings, running
  this on Apify may:
  - Reduce run success rate.
  - Risk IP blocks or other platform-level enforcement.
- **Operational:**
  - If many users enable StockX, you could see more failed runs and support load.

**Mitigation suggestions (without changing behavior, but for future work):**

- Consider a **clear recommendation** in README and Apify Store description that StockX should
  remain disabled for most users and is “experimental / best-effort only”.
- If you implement GOAT later, you may want to pivot StockX away from direct scraping toward
  user-provided exports, partnerships, or a data-source abstraction.

### 3.2 Webhook and Data Security

- **Positives:**
  - HMAC signing is available and well implemented.
  - URL validation prevents obviously malformed webhook URLs.
- **Remaining concerns:**
  - Users can supply arbitrary webhook URLs; the actor will POST JSON payloads there. That’s
    expected, but consider emphasizing in docs:
    - Webhook endpoints must be HTTPS and stable.
    - Payload can be large if many listings are found.
- **No obvious secret leakage:**
  - You’re not logging webhook secrets or other sensitive values.
  - `.env.local` is gitignored, so local secrets aren’t checked in.

### 3.3 KV Store and Price History

- **Implementation is careful:**
  - Uses `price_history_<hash>` with timestamped entries.
  - Cleans entries older than `historyRetentionDays`.
  - Trims history length per listing.
- **Potential performance edge case:**
  - `cleanupOldHistory()` calls `kvStore.getKeys()` and scans all keys; in large Apify KV stores
    this can be slow.
  - However, this actor uses its own KV namespace by default, so the practical risk is low.

### 3.4 Documentation Reality Gap

There’s a consistent **tension between the vision and what’s running now**:

- Docs and tech architecture discuss **GOAT, Mercari, OfferUp, Vinted, release calendars,
  email/Slack notifications, AI parsing**, etc.
- Code implements **Grailed + eBay + optional StockX**, webhook + dataset notifications, and regex
  parsing with some AI-inspired scaffolding but no actual OpenAI calls.

This is not wrong, but for Apify Store users you should **avoid overselling**. Actor listing should:

- Clearly state that **current version** is Grailed + eBay + optional StockX.
- Move broader vision to a “Roadmap” section.

---

## 4. Phase 4 Agent Prompt Review (`prompts/phase-4-agent-prompt.md`)

### 4.1 Strengths of the Prompt

- **Clear mission:** Final polish, GOAT integration, beta platforms, advanced filters, performance,
  QA, and launch assets.
- **Excellent cross-referencing:**
  - Points to `IMPLEMENTATION_STATUS.md`, `technical_architecture.md`, `agile_project_breakdown.md`,
    `component_specifications_complete.md`, `WORKSPACE_FILE_AUDIT.md`, README / PR docs, challenge
    rules.
- **Concrete feature list:**
  - GOAT scraping via `ecomscrape/goat-product-search-scraper` (or similar orchestrated actor).
  - Beta platforms (Mercari, OfferUp, Vinted) with graceful degradation and warnings.
  - Advanced filters: `authenticatedOnly`, `requireOGAll`, `excludeAuctions`, `minSellerRating`.
  - Performance targets (<5 min runtime), AutoscaledPool tuning, caching, monitoring.
  - Coverage and metrics requirements.
- **Risk awareness:**
  - Platform blocking and ToS concerns flagged.
  - Suggests disabling high-risk platforms by default and tracking failure rates.

### 4.2 Weaknesses / Ambiguities for an Agent

1. **Mismatch with current code reality:**
   - Prompt assumes **GOAT and beta platforms are already partially designed and ready to plug in**,
     but the current code only supports `grailed`, `ebay`, `stockx`.
   - `PLATFORM_CONFIGS`, scrapers, normalizers, and filters do not yet include
     GOAT/Mercari/OfferUp/Vinted.
   - Without explicit “start from current state” constraints, an LLM agent might hallucinate new
     modules instead of following existing patterns.

2. **Scope may be too broad for a single phase:**
   - GOAT + three beta platforms + advanced filters + load tests + marketing collateral +
     monetization wiring + store metadata is a lot for a single automated phase.
   - For human or LLM-based work, this increases the risk of unfinished or shallow implementations.

3. **Some implementation details are only vaguely referenced:**
   - References to caching, AutoscaledPool, and incremental scraping exist in tech docs but the
     prompt doesn’t clearly instruct where to implement them (which file, which function, what
     logging expectations).
   - For beta platforms, the prompt says “follow strategies from technical architecture” but doesn’t
     bound the risk level or minimum viable behavior (e.g., limited search, strict rate limits, time
     budget per platform).

4. **Risk controls not fully actionable:**
   - It mentions monitoring failure rates (>50% over 24h) but doesn’t specify where to write these
     metrics (KV, dataset, logs) or how to expose them to users.
   - It doesn’t reinforce that high-risk platforms should be disabled by default in the input schema
     (StockX is, GOAT/betas would need similar treatment).

### 4.3 Suggestions to Tighten the Prompt (Future Work)

Without changing the file now, here’s how you could improve it later:

- **Clarify current implementation baseline** at the top:
  - “The current actor implements Grailed + eBay + optional StockX; you are extending this to GOAT
    and beta platforms.”
- **Split platform work into tiers:**
  - Tier 1: GOAT via orchestrated actor; ensure full test coverage and normalization.
  - Tier 2: One beta platform (e.g., Mercari) to reference pattern.
  - Tier 3: Additional betas if time remains.
- **Make risk/ToS guidelines more operational:**
  - Specify that high-risk platforms must be disabled by default in `input_schema.json` and
    explicitly toggled by user.
  - Require clear logging tags (e.g., `risk:high`, `platform:GOAT`) for observability.
- **Specify artifact locations:**
  - Where to write performance benchmarks, e.g., `audit/PERFORMANCE_NOTES.md`.
  - Where to record failure-rate monitoring decisions.

Overall, the Phase 4 prompt is **excellent as a design directive**, but it is ambitious and assumes
an agent that’s both code-aware and risk-aware. Tightening grounding and scoping will make it safer
and more executable.

---

## 5. UX & Product Suggestions for Sneaker Users (Low Overhead)

These are **non–over-engineered improvements** that would give real value to sneaker
buyers/collectors and Apify reviewers, based on the current feature set.

### 5.1 Make the Current Platforms and Risks Crystal Clear in Store Listing

- In the Apify Store description and README:
  - Explicitly state: **“Currently supports Grailed and eBay. StockX integration is experimental and
    disabled by default due to ToS risk.”**
  - Move GOAT and other platforms to a **“Roadmap / Coming soon”** section.

### 5.2 Provide 2–3 Concrete Preset Inputs

- Add or document **sample configs** tailored to:
  - **Collector preset:** 1–3 grails (e.g., `Air Jordan 1 Bred`, size 10.5, price cap),
    `platforms: ["grailed", "ebay"]`, conservative maxResults.
  - **Reseller preset:** 10–15 models, smaller price range, `dealScoreThreshold` at 20%,
    `excellentDealThreshold` 35–40.
  - **Price-drop watcher:** Focus on priceDropThreshold = 5–10, smaller maxResults but more frequent
    schedules.

### 5.3 Tighten Webhook Documentation for Real Integrations

- In README / Apify listing, add:
  - Example payload snippet showing `summary.dealHighlights` and `priceDrops`.
  - HMAC verification example in Node/Python.
  - Guidance on using Zapier/Make or a simple server to fan out to Slack/Discord.

### 5.4 Sneaker-Specific Enhancements (Using Existing Data)

- **Market values:**
  - Surface a brief description of the 152-sneaker catalog in README (already referenced in docs,
    but highlight a few specific SKUs/models collectors care about).
- **Tags & conditions:**
  - Document how tags like `ds`, `vnds`, `og_all` show up in `listing.tags`, so users can build
    filters or dashboards around them.

### 5.5 Monitoring & Troubleshooting Section

- Add a short “Monitoring” section in README:
  - How to check `last_run_stats` in KV store.
  - How to interpret `deduplication.utilizationPercent` (e.g., warn if >90%).
  - Notes on how often to rotate proxies or adjust `maxResults` to keep runs under 5 minutes.

---

## 6. Security & Compliance Recommendations (Future Hardening)

### 6.1 StockX and Future High-Risk Platforms

- **Default behavior:** Keep StockX disabled by default (already done). Do the same for any
  GOAT/beta platform you implement.
- **Config surface:**
  - Consider a top-level `riskTolerance` flag (e.g., `"low" | "medium" | "high"`) if you expand to
    more high-risk integrations.
- **Docs:**
  - Make ToS/anti-bot warnings prominent in the Apify listing; link to a section about responsible
    scraping.

### 6.2 Data Minimization and Privacy

- Actor currently processes **public listings**. There’s no handling of user PII other than webhook
  URLs and any secrets in `.env.local` (ignored by git).
- Recommendations:
  - Avoid logging webhook URLs or secrets.
  - If you later add email/Slack/Discord, treat API keys and tokens as Apify secrets only.

### 6.3 KV Store Hygiene

- Current 30-day history retention + capacity trimming is good.
- If you scale to more platforms or higher `maxResults`, consider:
  - Partitioning price history keys by platform.
  - Exposing history summary (e.g., number of keys cleaned) in `last_run_stats`.

---

## 7. How Well This Positions You for the Apify Challenge

### 7.1 Against Challenge Criteria

- **Utility & Market Demand:**
  - Direct hit: sneaker collectors and resellers are a proven, underserved audience on Apify.
  - Multi-platform aggregation + deal scoring is unique compared to current Store actors.
- **Technical Excellence:**
  - Well-structured, modular code with custom error types, good logging, and strong testing.
  - Sensible use of Apify SDK and storage.
- **User Experience:**
  - Schemas are well-documented, README is detailed, and there are design docs and research reports.
  - The main risk is **over-promising platforms** not yet implemented; tuning narrative solves this.
- **Innovation:**
  - Deal scoring and price-drop alerts using curated market values are strong differentiators.
- **Monetization Potential:**
  - Market research and monetization strategy docs are thorough.
  - Once you stabilize the core actor, you can safely introduce tiering.

### 7.2 Key Gaps to Close Before Launch

1. **Align docs and Store listing with real feature set.**
2. **Decide how hard you lean into StockX:**
   - Either embrace it as an experimental feature with clear disclaimers and success metrics, or
   - Gate it more strongly or move it behind a separate “StockX experiment” actor.
3. **Plan incremental Phase 4:**
   - Implement GOAT via orchestrated actor first, then beta platforms one by one.
   - Keep filters and performance features scoped to what you can test thoroughly.

---

## 8. Summary

- **For users (sneaker buyers/collectors/resellers):**
  - Today, Grail Hunter is already a **useful, production-grade Grailed+eBay sneaker deal watcher**
    with dedupe, deal scoring, and price-drop alerts.
  - It’s well-suited for people running hourly/daily monitors who want structured JSON + webhooks.

- **For Apify challenge reviewers:**
  - The actor demonstrates strong engineering discipline, documentation, and a clear path to
    expansion.
  - The main work left is GOAT + selected “beta” platforms and some narrative tightening to ensure
    promises match runtime behavior.

- **For future work on `prompts/phase-4-agent-prompt.md`:**
  - The prompt is strategically sound but very ambitious; narrowing scope and grounding it more
    explicitly in current code modules will make it safer and more reliably executable by agents
    while keeping the actor genuinely “super useful” and not over-engineered.
