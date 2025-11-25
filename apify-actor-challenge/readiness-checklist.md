# Grail Hunter – Apify Actor Challenge Readiness Checklist

This checklist tracks the work required to ship `grail-hunter` v0.4.2 as a polished submission for
the Apify Actor Challenge.

---

## 1. Code, Tests, and Linting

- [ ] **Install dependencies on a clean environment**
  - `npm ci`
- [ ] **Run unit + integration tests**
  - `npm test`
- [ ] **Run linting**
  - `npm run lint`
- [ ] (Optional) **Refresh coverage metrics**
  - Run coverage command (if configured) and update coverage numbers in `IMPLEMENTATION_STATUS.md`.
- [ ] **Smoke-test the actor locally or on Apify** with a safe configuration:
  - Platforms: `grailed`, `ebay` (no beta, no GOAT, no StockX scraping).
  - Verify:
    - Listings appear in the default dataset.
    - `last_run_stats` in KV has sane counts and metadata.

---

## 2. Scenario Runs for Key Configurations

Run the actor with several representative configurations to validate behavior and collect sample
runs/logs.

- [ ] **Core P2P run** (Grailed + eBay only)
  - Confirm normalization, parsing, filters, dedupe, and notifications (webhook/dataset) function
    correctly.

- [ ] **Safer marketplaces run** (Depop + Poshmark)
  - Confirm:
    - New platforms are scraped successfully.
    - Advanced filters work (size, price, condition, authentication where applicable).

- [ ] **Beta platforms run** (Mercari + OfferUp)
  - Configure:
    - `betaPlatformsEnabled: true`
    - `enableMercari: true` and/or `enableOfferUp: true`
    - Valid `zipCode` for OfferUp.
  - Verify:
    - Failures are logged but do not crash the run.
    - Beta stats (`betaFailureRate`, failed platforms list) are populated in `last_run_stats`.

- [ ] **GOAT/StockX ingestion run** (Pattern C)
  - Configure:
    - `enableGOAT: false`, `enableStockX: false` (scraping off).
    - Provide one or more `ingestionDatasets` with `platform` set to `goat` or `stockx`.
  - Verify:
    - Ingested listings flow through normalization, parsing, scoring, filtering, dedupe, and
      notifications.

- [ ] **High-risk scraping smoke test** (optional, risk-aware)
  - For StockX/GOAT scraping, only if acceptable within challenge guidelines and ToS.
  - Validate that failures are clearly logged and do not crash the actor.

---

## 3. Documentation & Metadata Alignment

- [ ] **Implementation Status** (`IMPLEMENTATION_STATUS.md`)
  - Confirm version is `0.4.2` and status is "Phase 4.2 Complete".
  - Fix any platform count mismatches (ensure it states **8 platforms**).
  - Refresh test and coverage metrics to match current `npm test` results.

- [ ] **README & grail-hunter README** (`README.md`, `grail-hunter-README.md`)
  - Ensure they describe:
    - Supported platforms: Grailed, eBay, StockX, GOAT, Depop, Poshmark, Mercari, OfferUp.
    - Advanced filters: `authenticatedOnly`, `requireOGAll`, `excludeAuctions`, `minSellerRating`,
      `minSellerReviewCount`.
    - Deal scoring (`dealScoreThreshold`, `excellentDealThreshold`) and price-drop alerts
      (`priceDropThreshold`).
    - Beta and high-risk toggles:
      - `betaPlatformsEnabled`, `enableMercari`, `enableOfferUp`, `zipCode`.
      - `enableStockX` and `enableGOAT`.
      - `ingestionDatasets` for GOAT/StockX-like datasets (Pattern C).
    - Clear risk guidance: GOAT/StockX scraping and beta platforms are **optional** and **disabled
      by default**.

- [ ] **Actor metadata** (`.actor/actor.json`)
  - Confirm:
    - `version` = `0.4.2`.
    - `title` and `description` match the final story and risk posture.
    - `categories`, `dockerImage`, `memoryMbytes`, and `timeout` are correct.
  - Ensure description references:
    - 8 supported platforms.
    - Advanced filters.
    - Deal scoring and price tracking.
    - GOAT/StockX hybrid + ingestion and risk disclaimers.

- [ ] **Input schema** (`.actor/input_schema.json`)
  - Confirm field names, enums, and descriptions are accurate and match the implementation.
  - Ensure high-risk toggles and beta flags are clearly labeled and default to `false`.
  - Provide a reasonable default `prefill` for safe, low-risk usage (e.g., Grailed + eBay only).

- [ ] **Index log/version alignment** (`src/index.js`)
  - Update the startup log banner to mention **Phase 4.2**.
  - Set `runMetadata.version` to `0.4.2`.

- [ ] **Cross-doc coherence**
  - Skim `technical_architecture.md`, `audit/COVERAGE_ROADMAP.md`,
    `component_specifications_complete.md`, and `agile_project_breakdown.md`.
  - For any mention of unimplemented features (Email/Slack/Discord notifications, AI parsing,
    release calendar, 12+ platforms), ensure they are clearly framed as **future roadmap**, not
    current functionality.

---

## 4. Risk & Compliance Messaging

- [ ] **High-risk platforms clearly marked**
  - GOAT and StockX scraping:
    - Disabled by default in input schema.
    - Labeled as "⚠️ HIGH RISK" with notes about ToS and recommended use of dataset ingestion.
  - Beta platforms (Mercari, OfferUp):
    - Disabled by default.
    - Labeled as "🧪 BETA" with notes about higher failure rates and anti-bot protections.

- [ ] **Docs emphasize ingestion-first strategy**
  - README, Implementation Status, and Apify Store description should:
    - Recommend `ingestionDatasets` for GOAT/StockX as the primary, lower-risk path.
    - Present scraping as optional and best-effort.

---

## 5. Marketing & Submission Assets

- [ ] **Apify Store description**
  - Prepare a polished description that covers:
    - Value proposition and target users (collectors, resellers).
    - Supported platforms and risk tiers.
    - Advanced filtering, deal scoring, and price tracking.
    - Beta/high-risk controls and ingestion strategy.
  - (You can use `apify-store-description.md` from this folder as the canonical source.)

- [ ] **How-to guide**
  - Ensure there is a concise "How to run" section:
    - In README.
    - In the Apify actor description or linked docs.
  - (You can use `how-to-run-grail-hunter.md` from this folder.)

- [ ] **Examples & screenshots**
  - At minimum:
    - Link the `/examples` presets from README.
    - Optionally add 1–2 screenshots (Apify console run, dataset preview) for the Store listing.

- [ ] **Monetization & pricing**
  - Confirm the intended pricing strategy for post-challenge use (even if kept free during the
    challenge timeframe), and ensure docs are consistent.

---

## 6. Apify Platform Steps

Once the repo is ready and tests are passing:

- [ ] **Push or link code to Apify**
  - Use Apify CLI or GitHub integration to build/push the actor from this repository.

- [ ] **Configure actor on Apify**
  - Set memory and timeout consistent with `.actor/actor.json`.
  - Configure a safe default input (e.g., Grailed + eBay only).
  - Verify dataset and KV outputs.

- [ ] **Final live runs**
  - Run the actor a few times from Apify UI with different presets to collect logs, metrics, and
    example datasets.

- [ ] **Publish & submit**
  - Make the actor public (or as required by the challenge).
  - Fill out any challenge submission forms, linking to:
    - The Apify actor URL.
    - The GitHub repository.
    - Key documentation (README, Implementation Status, marketing materials).

When all items above are checked, `grail-hunter` should be ready for a high-quality Apify Actor
Challenge submission.
