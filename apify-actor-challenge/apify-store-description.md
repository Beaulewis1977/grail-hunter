# Apify Store Description – Grail Hunter

**Title:** Grail Hunter – Multi-Platform Sneaker Deals & Alerts (8 Platforms, Advanced Filters)

## Short Summary

Grail Hunter is a multi-platform sneaker monitor that watches **8 marketplaces** (Grailed, eBay,
StockX, GOAT, Depop, Poshmark, Mercari, OfferUp) and surfaces the best deals in your size. It
normalizes listings into a unified schema, scores deals against market values, tracks price drops,
and lets you filter aggressively by condition, authentication, box status, and seller quality.

Use it to stop refreshing tabs and start getting structured, de-duplicated sneaker leads delivered
to your workflow.

---

## What the Actor Does

- **Aggregates listings** from 8 platforms:
  - **Core peer-to-peer:** Grailed, eBay, Depop, Poshmark
  - **Beta platforms (opt-in):** Mercari, OfferUp
  - **High-risk intelligence layers (opt-in):** StockX, GOAT
- **Normalizes data** into a consistent JSON schema (product, listing, seller, source, metadata
  fields).
- **Parses sneakerhead terminology** (DS, VNDS, OG All, etc.) using a dedicated parser.
- **Scores deals** using a market value database (plus your overrides) and configurable thresholds.
- **Tracks price history** and flags significant price drops between runs.
- **Applies advanced filters**, including:
  - `authenticatedOnly` (e.g., eBay Authenticity Guarantee, authenticated platforms)
  - `requireOGAll` (original box/accessories only)
  - `excludeAuctions` (skip eBay auctions)
  - `minSellerRating` and `minSellerReviewCount`
- **De-duplicates across runs** so you see new listings and price changes without alert fatigue.
- **Outputs results** to:
  - An Apify dataset (always)
  - An optional HTTP webhook for downstream automations (Zapier, Make.com, custom APIs)

---

## Key Features

- **8-platform coverage**
  - Grailed, eBay, StockX, GOAT, Depop, Poshmark, Mercari (BETA), OfferUp (BETA).
- **Advanced filters for serious buyers:**
  - Only authenticated listings (StockX, GOAT, eBay Authenticity Guarantee, and tagged listings).
  - Only listings with original box/accessories (OG All).
  - Seller quality filters on rating and review count.
  - Auction exclusion for eBay when you only care about Buy It Now.
- **Deal scoring & market intelligence:**
  - Uses a curated market value database plus **your overrides** (by name or SKU).
  - Computes savings %, savings amount, and a `dealQuality` label (`excellent`, `good`, `fair`,
    `market`).
- **Price-drop detection:**
  - Tracks price history in Apify KV store.
  - Flags listings that have dropped by a configurable percentage since last seen.
- **Risk-aware platform strategy:**
  - GOAT and StockX scraping are **disabled by default** and clearly marked as **HIGH RISK**.
  - Mercari and OfferUp are **BETA** with conservative limits and robust failure handling.
  - Supports **dataset ingestion (Pattern C)** for GOAT/StockX-like data, which is the recommended
    path for these platforms.
- **Rich run statistics:**
  - Writes detailed `last_run_stats` into KV, including per-platform counts, beta failure rates,
    filter usage, dedupe utilization, and deal statistics.

---

## Typical Use Cases

- **Collectors:**
  - Watch a few specific grails across multiple platforms.
  - Filter for OG All, authenticated pairs, and trusted sellers.
  - Get notified when a listing is significantly below market.

- **Part-time resellers:**
  - Monitor multiple models and sizes.
  - Use deal scoring and seller quality filters to prioritize flips with strong margins.
  - Ignore auctions and noisy low-feedback sellers.

- **Full-time resellers / tools builders:**
  - Pipe results into your own system via webhook.
  - Ingest your own GOAT/StockX-like datasets and use Grail Hunter for cross-platform intelligence.
  - Analyze `last_run_stats` for platform health, beta performance, and filter efficiency.

---

## Input Configuration Overview

Key input fields (simplified – see in-app schema for full details):

- **Search & filters**
  - `keywords` (array of sneaker keywords/models)
  - `size` (US Men's size, e.g. `"10.5"`)
  - `priceRange.min` / `priceRange.max`
  - `condition` (minimum condition: `new_in_box`, `used_like_new`, etc.)

- **Platforms**
  - `platforms`: multi-select from
    - `grailed`, `ebay`, `stockx`, `depop`, `poshmark`, `mercari`, `offerup`, `goat`
  - `platform` (legacy single-platform, primarily for backward compatibility; `grailed` by default)

- **Advanced filters**
  - `excludeAuctions` (boolean)
  - `authenticatedOnly` (boolean)
  - `requireOGAll` (boolean)
  - `minSellerRating` (0–5)
  - `minSellerReviewCount` (0–100000)

- **Deal & price thresholds**
  - `dealScoreThreshold` (e.g., 10% savings)
  - `excellentDealThreshold` (e.g., 30%+ savings)
  - `priceDropThreshold` (e.g., 10% drop vs previous run)

- **Market value overrides**
  - `marketValueOverrides` (object): override market values by sneaker name or SKU.

- **High-risk + beta toggles**
  - `enableStockX` (default `false`)
  - `enableGOAT` (default `false`)
  - `betaPlatformsEnabled` (default `false`)
  - `enableMercari`, `enableOfferUp` (default `false`)
  - `zipCode` (required when enabling OfferUp)
  - `ingestionDatasets` (array of `{ datasetId, platform: "goat"|"stockx", platformLabel? }`)

- **Notification & proxy config**
  - `notificationConfig.webhookUrl` + optional `webhookSecret` for HMAC signatures.
  - `proxyConfig` – strongly recommended to use Apify residential proxies for reliability.

---

## Output

- **Dataset items:**
  - Each item includes:
    - `product`: name, brand, model, colorway, SKU, etc.
    - `listing`: price, currency, sizes, condition, tags, type (`sell` or `auction`).
    - `seller`: name, rating (0–5), reviewCount.
    - `source`: platform, URL, ID, `is_authenticated`, image URL.
    - `scrape`: run metadata (timestamp, runId, version).
    - `metadata.dealScore`: market value, savings %, savings amount, deal quality.
    - `metadata.priceChange`: price history snapshot (previous vs current, drop %).

- **Key-value store:**
  - `last_run_stats`: per-platform counts, aggregated stats, filter + dedupe metrics, beta health.
  - `last_error`: last failure details (if any).

---

## Safety, Risk, and ToS Notes

- **GOAT and StockX:**
  - Scraping is **disabled by default** and marked as **HIGH RISK**.
  - These platforms actively enforce Terms of Service and anti-bot protections.
  - For many users, the **recommended approach** is to:
    - Keep `enableGOAT` and `enableStockX` set to `false`.
    - Use `ingestionDatasets` with your own GOAT/StockX-like data instead.

- **Beta platforms (Mercari, OfferUp):**
  - Disabled by default behind `betaPlatformsEnabled` and per-platform toggles.
  - May experience higher failure rates due to aggressive anti-bot measures.
  - The actor logs beta platform failures, monitors beta failure rates, and recommends disabling
    them if failure rates are high.

Always use this actor in compliance with Apify platform rules, target-site Terms of Service, and
applicable laws.

---

## Pricing & Limits

During the Apify Actor Challenge period, you can run this actor within your Apify account limits.
After the challenge, you can adjust pricing or usage patterns based on your plan and expected
volume.

Runtime and memory use depend on:

- Number of platforms enabled
- `maxResults` and filtering configuration
- Whether beta/high-risk platforms are turned on

See the README and Implementation Status docs in the linked GitHub repository for up-to-date
performance notes and coverage metrics.
