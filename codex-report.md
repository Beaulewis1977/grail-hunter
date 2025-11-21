# Grail Hunter Audit (scoped for Apify Challenge)

## Scope & Method

- Reviewed core actor flow (`src/index.js`), platform configs (`src/config/platforms.js`), scrapers,
  validators, dedupe, notifications, and `.actor` metadata/input schema.
- Ran automated checks: `npm test -- --runInBand` (26/26 suites pass, coverage 82.65% overall; major
  gaps in `src/core/deduplicator.js` and `src/utils/validators.js`), `npm audit --production` (0
  vulnerabilities).
- Checked Apify actor settings and defaults for proxying, dataset/KV usage, and platform toggles. No
  code modified.

## Notable Strengths

- Clear modular architecture (scraper manager, normalizer/parser/filter, dedupe, deal scorer,
  notifications).
- High automated test coverage for happy paths and scraper failure modes; hybrid StockX/GOAT paths
  unit-tested.
- Defensive input validation (bounds on thresholds, platform allow-list, beta feature gating) and
  HMAC signing for webhook payloads.
- Dataset-ingestion path provides a safer “bring your own data” alternative for high-risk platforms.

## Key Issues & Risks (ordered by severity)

- **Critical — StockX direct API scraping bypasses proxy & ToS**: `src/scrapers/stockx.js` issues
  raw `fetch` calls to `https://stockx.com/api/browse` without proxyConfig, robot/ToS checks, or
  auth, and treats StockX as enabled once `enableStockX` is true. High legal/blocking risk and
  likely disallowed by StockX ToS; also weak IP hygiene -> fast blocks.
- **Critical — Deduplication/price history are run-scoped, not persistent**:
  `src/core/deduplicator.js` uses `Actor.openKeyValueStore()` without a named store, so Apify
  creates a new KV per run. “Seen” hashes and price history never persist across runs → duplicate
  alerts and useless price-drop tracking. Also `cleanupOldHistory()` calls `getKeys()` on the whole
  store, which will not scale in production.
- **High — Data loss on orchestrated actors due to single-page reads**: eBay/Depop/Poshmark scrapers
  only call `dataset.listItems()` once (default limit 100/999) with no pagination
  (`src/scrapers/ebay.js` etc.). Large result sets will be silently truncated, hurting alert
  coverage and competitiveness.
- **High — Compliance posture weak for multiple platforms**: GOAT/StockX intentionally high risk,
  but Grailed/Depop/Poshmark/Mercari/OfferUp ToS also restrict automated access. No robots.txt
  awareness, throttling, or AUP notes in code; proxies default to RESIDENTIAL but not enforced
  everywhere (StockX API ignores proxy). Challenge judges will flag this.
- **High — Input schema/version drift**: `.actor/input_schema.json` is labeled “Phase 4.1” while
  `actor.json` advertises 0.4.2 (GOAT hybrid). The schema still defaults `maxResults` doc to
  “Grailed (1-500)” and doesn’t expose ingestion datasets. This mismatch can cause rejected runs or
  confused users in the Apify console.
- **Medium — Rate limiting/backoff not platform-aware**: Manager retry uses 2/4/8s backoff, ignores
  per-platform rate limits/timeouts in `config`, and does not propagate robots/crawl-delay.
  OfferUp/Mercari actors marked high-risk but still subject to rapid retries -> higher block risk.
- **Medium — Proxy handling inconsistent**: StockX API path and dataset ingestion do not respect
  `proxyConfig`; OfferUp defaults to NYC ZIP silently; there’s no guard against unsafe proxy groups
  (e.g., datacenter) on Cloudflare-heavy sites.
- **Medium — Webhook hard failure bubbles**: `notifications/webhook.js` throws on any non-2xx; a
  transient webhook outage will crash the whole run after scraping finishes (data saved but run
  status fails). No retry/timeout tuning per channel.
- **Medium — Observability gaps**: `runMetadata.duration` is always null and there’s no per-platform
  latency/error classification; KV stats are saved but not exported to dataset/log for user-friendly
  inspection. Beta failure warnings rely on `PLATFORM_CONFIGS` instead of runtime-enabled set, so
  mismatches under ingestion scrapers can mislead.
- **Low — External actor dependencies unpinned**: Grailed/eBay/Depop/Poshmark/Mercari/OfferUp/GOAT
  actors are referenced by ID without build tags; upstream changes or unpublishing will break runs
  unpredictably.
- **Low — Validation coverage gaps**: Branch coverage only ~69% in `src/utils/validators.js`; edge
  cases (e.g., malformed `marketValueOverrides`, proxy objects) could slip through unnoticed.

## Platform Compliance Snapshot (non-legal opinion; verify with counsel)

- **StockX / GOAT**: Explicitly high risk; both block bots and ToS prohibit scraping. Current direct
  StockX API path is likely non-compliant. Recommendation: disable scraping by default (keep
  opt-in), prefer dataset ingestion only, add mandatory proxy + rate limits, and present legal
  notice inline in input schema.
- **Grailed / Depop / Poshmark / Mercari / OfferUp**: ToS generally disallow automated scraping;
  reliance on third-party actors pushes risk to you. Mitigate by honoring robots.txt, slowing crawl,
  limiting item counts, and adding a “Comply with site terms” acknowledgment toggle.
- **eBay**: Public HTML scraping may violate eBay terms; safer path is to offer an official Browse
  API integration for authenticated users (clearly best for challenge judges).
- **Dataset Ingestion**: Safest path when users bring TOU-compliant data (consignment feeds,
  internal inventory, StockX Market data partners). Keep emphasizing this as primary for high-risk
  platforms.

## Data Quality & Product Fit for Sneaker Buyers

- Normalization/parse logic is solid, but deal scoring relies on static overrides and limited market
  baselines (152 sneakers noted in README). No live market feeds -> risk of stale prices and false
  “deal” labels.
- Auctions/condition filtering present, but seller trust/safety signals are minimal (no fraud
  heuristics, no counterfeits detection, no shipping/fees normalization).
- Alert fatigue risk because dedupe is not persistent and truncation on datasets can miss or spam
  alerts.

## Security & Privacy Notes

- Webhooks: outbound-only; HMAC signing is good, but there’s no allowlist/timeout config per user.
  Add retries with jitter and non-fatal error handling.
- Data retention: KV store may accumulate price histories without enforcement beyond a map size;
  `getKeys()` sweep will struggle on large stores. Consider TTL-based KV keys or per-platform
  namespace with capped size.
- Secrets: No secret management surfaced; ensure Apify tokens/proxy passwords pulled from env only
  (avoid embedding in input).

## Quick Wins Before Submitting

1. **Kill or quarantine StockX direct API path**: Default to dataset ingestion; if scraping remains,
   force proxyConfig + aggressive rate limiting and disclaimers. Consider setting
   `PLATFORM_CONFIGS.stockx.enabled=false` until user opts in.
2. **Persist dedupe/price history across runs**: Name the KV store (e.g., `grail-hunter-state`) or
   allow `stateStoreId` input; add pruning by timestamp without `getKeys()` full scan.
3. **Paginate orchestrated actor datasets**: Use `fetchAllDatasetItems` everywhere (as done for
   Grailed/GOAT/StockX actor path) to avoid silent truncation.
4. **Tighten input schema & docs**: Update `.actor/input_schema.json` to Phase 4.2, add
   ingestionDatasets, compliance toggles (“I have rights to scrape these sites”), and proxy
   requirements; surface beta/high-risk warnings inline.
5. **Resilience**: Make webhooks failure-tolerant (retry + non-fatal mode) and record summaries to
   dataset for users who disable webhooks.
6. **Compliance-first defaults for beta/high-risk sites**: Require `betaPlatformsEnabled` +
   per-platform toggle + proxy group `RESIDENTIAL` check, and auto-cap `maxResults` for them.
7. **Product value**: Add live market data adapters (eBay API, Kixify/GOAT/StockX public market data
   via ingestion), size-fee normalization, and “profit after fees” scoring to help resellers.

## Path to a Winning Actor (proposed implementation plan)

1. **Compliance hardening**: Default all high/medium-risk platforms to ingestion-only; add explicit
   ToS acknowledgment + proxy enforcement + robots-aware throttling (crawl-delay, per-domain rate
   limiter). Offer official APIs where possible (eBay Browse API) to score compliance points.
2. **Reliability & data completeness**: Fix dataset pagination for all orchestrated actors; add
   per-platform health metrics (latency, failure reason) and expose in dataset + log. Bake in
   circuit breakers for repeatedly failing platforms.
3. **Stateful intelligence**: Persist dedupe/price histories across runs with TTL; add alert
   suppression/backoff to prevent spam; compute multi-run trends (price delta over 7/30 days).
4. **Market-aware deal scoring**: Integrate live market baselines (StockX/GOAT low-ask/high-bid via
   ingestion feeds, eBay sold listings API) and shipping/fee normalization; show “estimated profit”
   for resellers and “below market %” for collectors.
5. **User experience & safety**: Surface safe defaults in input schema, include sample webhook
   payloads, and provide presets (“Collector quality mode”, “Reseller flip mode”). Make webhook
   failures non-fatal with retries and a dataset summary of skipped deliveries.
6. **Operational readiness**: Pin external actor versions (or fork minimal wrappers), add synthetic
   monitoring on Apify (scheduled small runs), and publish transparent limits (max results per
   platform, recommended proxy groups).

If you want, I can implement the above hardening (proxy-enforced hybrid mode, persistent dedupe,
pagination fixes, schema refresh, compliance toggles, and market data enhancements) to make the
actor competition-ready.
