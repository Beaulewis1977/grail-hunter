# Grail Hunter - Example Configurations

This directory contains sample input configurations for common use cases. Copy and customize these
presets to fit your sneaker hunting needs.

## 📋 Available Presets

### 1. Collector Preset (`collector-preset.json`)

**Best for:** Sneaker collectors looking for specific grails in excellent condition

**Features:**

- Specific size filtering (10.5 US Men's)
- Requires original box and accessories (`requireOGAll: true`)
- High seller rating requirement (4.5+)
- Conservative deal threshold (20% below market)
- Limited platforms (Grailed + eBay only)
- Lower maxResults (30) for focused searches

**Use when:** You're hunting for a specific pair in your size and want only quality listings from
trusted sellers.

---

### 2. Reseller Preset (`reseller-preset.json`)

**Best for:** Resellers looking for profitable deals across multiple models

**Features:**

- Broader keyword search (multiple models)
- No size filter (all sizes)
- Excludes auctions (`excludeAuctions: true`)
- Stricter deal thresholds (25% minimum, 40% for excellent)
- Higher maxResults (100) for more opportunities
- Price drop alerts for flips (15% threshold)

**Use when:** You're looking for underpriced sneakers to flip, regardless of size or specific model.

---

### 3. Price Drop Watcher (`price-drop-watcher.json`)

**Best for:** Monitoring price changes on specific models

**Features:**

- Focused on price drop detection (10% threshold)
- No authentication or seller quality filters
- Moderate maxResults (50)
- Minimal deal threshold (10%)
- All sizes and conditions

**Use when:** You're tracking specific sneakers and want to be notified when prices drop
significantly.

---

## 🚀 How to Use

### Option 1: Apify Console

1. Go to your Grail Hunter actor in [Apify Console](https://console.apify.com)
2. Click "Run"
3. Copy the contents of your desired preset
4. Paste into the input editor
5. Customize values (keywords, size, webhook URL, etc.)
6. Click "Start"

### Option 2: Apify API

```bash
curl -X POST https://api.apify.com/v2/acts/YOUR-ACTOR-ID/runs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-API-TOKEN" \
  -d @examples/collector-preset.json
```

### Option 3: Apify CLI

```bash
apify call YOUR-ACTOR-ID --input-file examples/collector-preset.json
```

---

## ⚙️ Customization Guide

### Essential Fields to Change

Before using any preset, **always update these fields**:

1. **`keywords`**: Replace with your target sneakers

   ```json
   "keywords": ["Your Sneaker Model", "Another Model"]
   ```

2. **`size`**: Set your US Men's size (or remove for all sizes)

   ```json
   "size": "11"
   ```

3. **`notificationConfig.webhookUrl`**: Add your webhook endpoint

   ```json
   "notificationConfig": {
     "webhookUrl": "https://your-actual-webhook.com/endpoint"
   }
   ```

### Advanced Filter Options (Phase 3.x)

All presets support these advanced filters:

- **`authenticatedOnly`** (boolean): Only show authenticated/verified listings

  ```json
  "authenticatedOnly": true
  ```

- **`requireOGAll`** (boolean): Require original box and accessories

  ```json
  "requireOGAll": true
  ```

- **`excludeAuctions`** (boolean): Filter out auction-style listings

  ```json
  "excludeAuctions": true
  ```

- **`minSellerRating`** (number, 0-5): Minimum seller rating

  ```json
  "minSellerRating": 4.5
  ```

- **`minSellerReviewCount`** (number): Minimum number of seller reviews

  ```json
  "minSellerReviewCount": 50
  ```

---

## 💡 Tips

### For Collectors

- Use `requireOGAll: true` to avoid listings with missing boxes
- Set `minSellerRating: 4.5` to reduce scam risk
- Keep `maxResults` low (30-50) for cleaner alerts

### For Resellers

- Set `excludeAuctions: true` to focus on Buy It Now listings
- Use higher `maxResults` (100-200) to catch more opportunities
- Adjust `dealScoreThreshold` based on your profit margins

### For Price Watchers

- Lower `priceDropThreshold` to 5-10% for all significant drops
- Run on a schedule (hourly or daily) for consistent monitoring
- Consider using multiple monitors for different price ranges

---

## 📊 Scheduling Recommendations

Configure recurring runs in Apify Console:

- **Collector searches**: 2-4x daily (6-hour intervals)
- **Reseller deals**: Hourly (for maximum coverage)
- **Price monitoring**: Every 2 hours

---

## 🔗 Related Documentation

- [Main README](../README.md) - Full actor documentation
- [Input Schema](.actor/input_schema.json) - Complete field reference
- [Component Specifications](../component_specifications_complete.md) - Technical details

---

## 📝 Notes

- All webhook URLs in these presets are placeholders - replace with your actual endpoint
- StockX scraping is disabled by default due to high risk (add `"enableStockX": true` to enable)
- For email notifications, add `emailTo` to `notificationConfig`
- Adjust thresholds based on your market knowledge and goals
