# How to Run Grail Hunter

This guide explains how to run the `grail-hunter` actor both **on Apify** and **locally during
development**.

---

## 1. Running on Apify

### 1.1 Add the Actor to Your Apify Account

1. Open the actor page in the Apify Store (search for **"Grail Hunter"**).
2. Click **"Try actor"** or **"Add to my actors"**.

After that, you can configure and run the actor from the Apify console.

### 1.2 Configure a Safe Starter Run

For your first run, start with a conservative, low-risk configuration:

- **Keywords:**
  - Example: `"Air Jordan 1"`, `"Nike Dunk Low"`
- **Size:**
  - Example: `"10"` or `"10.5"` (or leave blank to see all sizes).
- **Platforms:**
  - Select only: `grailed`, `ebay`.
  - Leave all beta platforms **disabled**.
  - Leave GOAT/StockX scraping **disabled**.
- **Price range:**
  - Example: `{ "min": 50, "max": 500 }`.
- **Advanced filters:**
  - Start with defaults (all off) or:
    - `excludeAuctions`: `true` (if you only want Buy It Now on eBay).
- **Deal thresholds:**
  - Keep defaults (e.g., `dealScoreThreshold: 10`, `excellentDealThreshold: 30`,
    `priceDropThreshold: 10`).
- **Notification config:**
  - Leave `webhookUrl` empty for your first run, or set it to a test endpoint if you want
    notifications.
- **Proxy configuration:**
  - Use Apify residential proxies (recommended) if you plan to run frequently.

Run the actor and wait for completion. Then:

1. Open the **Dataset** tab to inspect normalized results.
2. Check **Key-value store** for `last_run_stats` and (if present) `last_error`.
3. Review **Logs** for per-platform counts, filter usage, dedupe stats, and deal scoring output.

### 1.3 Enabling Additional Platforms

Once the basics are working:

- **Safer marketplaces (Depop, Poshmark):**
  - Add `depop` and/or `poshmark` to the `platforms` array.
  - Keep high-risk and beta platforms disabled until you are comfortable.

- **Beta platforms (Mercari, OfferUp):**
  - Set `betaPlatformsEnabled: true`.
  - Set `enableMercari` and/or `enableOfferUp` to `true`.
  - Provide a valid US `zipCode` when using OfferUp.
  - Monitor logs and `last_run_stats.betaPlatformHealth` for failure rates; if they are high,
    consider disabling beta platforms.

- **GOAT & StockX:**
  - Recommended approach: **use dataset ingestion** instead of scraping.
  - Keep `enableGOAT` and `enableStockX` set to `false`.
  - Provide `ingestionDatasets` entries for GOAT/StockX-like data (see below).

### 1.4 Using Dataset Ingestion (Pattern C)

If you have your own GOAT/StockX-like datasets on Apify:

1. Create datasets with standardized records (at minimum: product name, price, SKU, and URL).
2. In the actor input, set `ingestionDatasets` to an array like:

```json
[
  {
    "datasetId": "YOUR_GOAT_DATASET_ID",
    "platform": "goat",
    "platformLabel": "GOAT Market Data Q4"
  },
  {
    "datasetId": "YOUR_STOCKX_DATASET_ID",
    "platform": "stockx",
    "platformLabel": "StockX Market Snapshots"
  }
]
```

3. Leave `enableGOAT` and `enableStockX` as `false` to avoid live scraping.

The actor will treat ingested data as if it came from GOAT/StockX, normalizing and scoring it
alongside other platform listings.

---

## 2. Running Locally (Development)

You can run the actor locally for development using Node.js and the Apify CLI.

### 2.1 Prerequisites

- Node.js (version compatible with `apify/actor-nodejs-20` image, e.g., Node 20).
- npm.
- Apify CLI installed globally (optional but recommended):

```bash
npm install -g apify-cli
```

### 2.2 Install Dependencies

From the repository root:

```bash
npm install
```

(or `npm ci` if you want a clean, lockfile-driven install.)

### 2.3 Prepare Local Input

Edit `.actor/INPUT.json` in the repo (or create one if needed) with a configuration similar to the
safe starter run, for example:

```json
{
  "keywords": ["Air Jordan 1", "Nike Dunk Low"],
  "size": "10",
  "priceRange": { "min": 50, "max": 500 },
  "platforms": ["grailed", "ebay"],
  "excludeAuctions": false,
  "authenticatedOnly": false,
  "requireOGAll": false,
  "minSellerRating": 0,
  "minSellerReviewCount": 0,
  "dealScoreThreshold": 10,
  "excellentDealThreshold": 30,
  "priceDropThreshold": 10,
  "marketValueOverrides": {},
  "enableStockX": false,
  "enableGOAT": false,
  "betaPlatformsEnabled": false,
  "enableMercari": false,
  "enableOfferUp": false,
  "ingestionDatasets": [],
  "notificationConfig": {
    "webhookUrl": ""
  },
  "proxyConfig": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

### 2.4 Run the Actor Locally

From the repo root:

```bash
npm test        # Optional: run tests first
apify run       # Uses .actor/INPUT.json as input
```

This will execute `src/index.js` as the actor entrypoint, write output to a local dataset, and use
local KV store directories. Inspect `storage/datasets` and `storage/key_value_stores` to review
results.

---

## 3. Interpreting Results

- **Datasets:**
  - Open the dataset in Apify (or local `storage/datasets`) to inspect standardized listing objects.

- **Key-Value Store:**
  - `last_run_stats` contains:
    - Per-platform counts (`scraped`, `normalized`, `filtered`, `new`, `priceDrops`, `errors`).
    - Aggregate stats.
    - Beta platform health (`betaFailureRate`, failed platforms, recommendations).
    - Filter usage and dedupe metrics.
  - `last_error` (if present) holds information about the last failure.

- **Logs:**
  - Show per-platform scrape outcomes, normalization warnings, which filters were applied, how many
    listings passed filters, deal scoring stats, and notifications summary.

Use these to tune your configuration (filters, platforms, thresholds) and to decide whether to
enable beta or high-risk options for your specific use case.
