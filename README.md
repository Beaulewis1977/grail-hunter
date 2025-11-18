# Grail Hunter 👟

> **"Never miss your grail again"**

Multi-platform sneaker monitoring and alert system built for sneaker collectors and resellers. Your
24/7 sneaker scout.

[![Apify Challenge 2024-2025](https://img.shields.io/badge/Apify-Challenge%202024--2025-blue)](https://apify.com/challenge)
[![Built with Apify](https://img.shields.io/badge/Built%20with-Apify-orange)](https://apify.com)

---

## 🎯 Overview

**Grail Hunter** is a sophisticated Apify actor that aggregates sneaker listings from 4 major
marketplaces and delivers real-time alerts when your target sneakers appear. Stop manually checking
multiple tabs—let Grail Hunter find the deals for you.

This project is developed as part of the **Apify Challenge 2024-2025**.

---

## ✨ What It Does

Grail Hunter monitors sneaker listings across multiple platforms in real-time:

- 🔍 **Searches** for your desired sneakers across 4 major marketplaces simultaneously
- 📊 **Normalizes** disparate data into a unified, easy-to-use format
- 🤖 **Parses** sneakerhead terminology (DS, VNDS, OG All, etc.) automatically
- 🔔 **Alerts** you instantly via email, Slack, Discord, or webhooks when matches are found
- 💰 **Tracks** pricing and identifies deals below market value
- 🚫 **Deduplicates** listings to prevent alert fatigue

---

## 🎯 Target Platforms

Grail Hunter monitors these major sneaker marketplaces:

| Platform                  | Type          | Status       | Description                                   |
| ------------------------- | ------------- | ------------ | --------------------------------------------- |
| **eBay**                  | Marketplace   | ✅ Available | World's largest P2P marketplace               |
| **Grailed**               | Marketplace   | ✅ Available | Premium streetwear and sneaker marketplace    |
| **StockX (⚠️ HIGH RISK)** | Authenticated | ⚠️ Optional  | Stock market for sneakers with authentication |
| **GOAT (Planned)**        | Authenticated | 🚧 Phase 4   | Premium authenticated sneaker platform        |

> **⚠️ StockX WARNING**: StockX actively enforces their Terms of Service and uses advanced anti-bot
> protection. Scraping may result in IP blocks or legal action. Use at your own risk and consider
> disabling StockX scraping (enabled via `enableStockX` configuration option).

---

## 🛠️ Tech Stack

- **Platform**: [Apify](https://apify.com) - Web scraping and automation platform
- **Runtime**: Node.js 18+
- **Framework**: Apify SDK 3.x
- **Crawling**: Crawlee 3.x (Puppeteer, Playwright, Cheerio)
- **Parsing**: AI-powered (OpenAI) + Regex for terminology extraction
- **Storage**: Apify Dataset & Key-Value Store
- **Notifications**: Multi-channel (Email, Slack, Discord, Webhooks)

---

## 🚀 Key Features

### 🔍 Smart Search

- Flexible search criteria (brand, model, colorway, size)
- Support for multiple search terms in a single run
- Price range filtering

### 🤖 Intelligent Parsing

- Automatically understands sneakerhead slang (VNDS, DS, OG All)
- Extracts condition, size, and special tags
- AI-powered fallback for ambiguous listings

### 📊 Data Normalization

- Unified schema across all platforms
- Standardized condition ratings
- Consistent pricing and sizing information

### 🔔 Multi-Channel Alerts

- Email notifications with rich HTML formatting
- Slack/Discord webhooks with embed cards
- Custom webhook integration for automation tools
- Real-time alerts for new listings

### 💰 Deal Scoring & Intelligence

- **Market Value Benchmarking**: Compares peer-to-peer prices against market data from 152 sneakers
- **Deal Quality Rating**: Automatically categorizes deals as excellent (30%+ savings), good
  (20-30%), fair (10-20%), or market rate
- **Price Drop Alerts**: Tracks price changes over time and alerts on significant drops
  (configurable threshold, default 10%)
- **Historical Tracking**: Maintains price history for up to 30 days per listing
- **Custom Overrides**: Set your own market values for specific sneakers or SKUs

### 🔔 Enhanced Notifications

- **Deal Highlights**: Webhook payloads include top deals sorted by savings percentage
- **Price Drop Summary**: Get notified about the biggest price drops
- **Rich Analytics**: Detailed breakdown of deal quality distribution
- **Multi-Channel Support**: Email, Slack, Discord webhooks with custom formatting

### 🎯 Deduplication

- Tracks seen listings across multiple runs
- Prevents duplicate alerts
- Persistent state management

### 🔧 Advanced Filters (Phase 3.x)

- **Authentication Filtering**: Only show authenticated listings from verified platforms (StockX, GOAT) or eBay's Authenticity Guarantee
- **Original Box Requirement**: Filter for listings that include original box and all accessories (OG All)
- **Auction Exclusion**: Remove auction-style listings, focus on Buy It Now only
- **Seller Quality**: Set minimum seller rating (0-5 scale) and review count requirements
- **Flexible Combinations**: Apply multiple filters together for precise targeting

**Example Use Cases:**
- Collectors: `requireOGAll: true` + `minSellerRating: 4.5` for quality grails
- Resellers: `excludeAuctions: true` + `minSellerReviewCount: 50` for fast flips
- Authenticated Only: `authenticatedOnly: true` to avoid fakes

---

## 📋 Use Cases

### For Collectors

Set alerts for your "grail" sneakers and get notified the moment they appear in your size at your
target price.

### For Resellers

Monitor multiple models across all platforms to identify underpriced listings before the
competition.

### For Deal Hunters

Track release calendars and get alerts for upcoming drops and price drops on existing listings.

---

## 🏆 Apify Challenge

This actor is submitted for the **Apify $1M Challenge (2024-2025)**. It demonstrates:

- ✅ Novel multi-platform orchestration architecture
- ✅ Advanced data normalization and AI parsing
- ✅ Production-ready error handling and monitoring
- ✅ Compliance with platform eligibility requirements
- ✅ Real-world market validation and user demand

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 9+** (comes with Node.js)
- **Apify account** ([Sign up free](https://console.apify.com/sign-up))
- **Apify CLI** (optional, for local development)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/grail-hunter.git
cd grail-hunter

# 2. Install dependencies
npm install

# 3. Run tests to verify setup
npm test

# Expected output:
# ✅ Test Suites: 11 passed
# ✅ Tests: 75 passed
# ✅ Coverage: 80%+

# 4. Check code quality
npm run lint
```

### Local Development Setup

```bash
# Install Apify CLI globally
npm install -g apify-cli

# Login to your Apify account
apify login

# Run actor locally (uses .actor/INPUT.json)
apify run
```

---

## 🎮 Usage

### Basic Example

**Input (`.actor/INPUT.json`):**

```json
{
  "keywords": ["Air Jordan 1", "Nike Dunk Low"],
  "size": "10.5",
  "priceRange": {
    "min": 50,
    "max": 300
  },
  "condition": "used_good",
  "platforms": ["grailed", "ebay"],
  "excludeAuctions": false,
  "maxResults": 50,
  "dealScoreThreshold": 10,
  "excellentDealThreshold": 30,
  "priceDropThreshold": 10,
  "enableStockX": false,
  "marketValueOverrides": {
    "Air Jordan 1 Retro High OG Chicago": 2500
  },
  "notificationConfig": {
    "webhookUrl": "https://webhook.site/your-unique-id",
    "saveToDataset": true
  }
}
```

**Output:**

```json
[
  {
    "product": {
      "name": "Air Jordan 1 Retro High OG 'Bred'",
      "brand": "Air Jordan",
      "model": "Air Jordan 1",
      "colorway": "Bred"
    },
    "listing": {
      "price": 250,
      "currency": "USD",
      "size_us_mens": "10.5",
      "condition": "used_like_new",
      "tags": ["vnds", "og_all"]
    },
    "source": {
      "platform": "Grailed",
      "url": "https://grailed.com/listings/12345678",
      "id": "12345678"
    },
    "scrape": {
      "timestamp": "2025-11-10T19:45:00Z",
      "version": "0.1.0"
    },
    "metadata": {
      "dealScore": {
        "isBelowMarket": true,
        "marketValue": 950,
        "savingsPercentage": 21.1,
        "savingsAmount": 200,
        "dealQuality": "good"
      },
      "priceChange": {
        "hasDrop": false,
        "previousPrice": null,
        "currentPrice": 250,
        "dropPercent": null
      }
    }
  }
]
```

### Phase 3: Advanced Intelligence Features

**Deal Scoring & Market Value Comparison:**

- **Static Market Value Database**: 152 popular sneakers with curated market values
- **Deal Quality Ratings**:
  - **Excellent**: 30%+ below market value
  - **Good**: 20-30% below market
  - **Fair**: 10-20% below market
  - **Market**: Less than 10% discount
- **Custom Overrides**: Set your own market values via `marketValueOverrides` configuration

**Price Tracking:**

- Automatically tracks price changes for all listings
- Stores up to 50 price history entries per listing
- Cleans up history older than 30 days
- Triggers alerts when prices drop by 10% or more (configurable)

**Enhanced Notifications:**

Webhook payloads now include:

```json
{
  "summary": {
    "dealHighlights": {
      "totalDeals": 5,
      "excellentDeals": 2,
      "goodDeals": 2,
      "fairDeals": 1,
      "topDeals": [...]
    },
    "priceDrops": {
      "totalPriceDrops": 3,
      "drops": [...]
    }
  }
}
```

**Configuration Options:**

```json
{
  "dealScoreThreshold": 10,
  "excellentDealThreshold": 30,
  "priceDropThreshold": 10,
  "enableStockX": false,
  "marketValueOverrides": {
    "Air Jordan 1 Chicago": 2500,
    "555088-101": 2200
  }
}
```

### Phase 2.5: Schema Alignment (DEPRECATED)

**New Metadata Objects** (scaffolded for Phase 3):

- **`metadata.dealScore`** - Deal quality analysis comparing listing price to market value:
  - `isBelowMarket` (boolean): Indicates if price is below market
  - `marketValue` (number|null): Estimated market price from StockX/GOAT
  - `savingsPercentage` (number|null): Percentage savings (e.g., 21.1 for 21.1%)
  - `savingsAmount` (number|null): Dollar amount saved
  - `dealQuality` (string|null): Rating based on savings ('excellent', 'good', 'fair', 'market')

- **`metadata.priceChange`** - Quick price drop detection (full history in `scrape.priceHistory`):
  - `hasDrop` (boolean): True if price dropped since last check
  - `previousPrice` (number|null): Price from previous observation
  - `currentPrice` (number): Current listing price
  - `dropPercent` (number|null): Percentage drop

**Note:** These fields are currently populated with default/null values. Phase 3 will activate real
market data comparison and price tracking.

### Advanced Examples

#### 1. Multiple Keywords Search

```json
{
  "keywords": ["Air Jordan 1 Bred", "Yeezy 350 Zebra", "Travis Scott Jordan 1"],
  "size": "10.5",
  "maxResults": 20
}
```

#### 2. Price Range Filter

```json
{
  "keywords": ["Nike Dunk Low"],
  "priceRange": {
    "min": 100,
    "max": 250
  },
  "condition": "new_in_box"
}
```

#### 3. Webhook Notifications

```json
{
  "keywords": ["Air Jordan 1"],
  "notificationConfig": {
    "webhookUrl": "https://your-app.com/webhook",
    "webhookSecret": "your_secret_key"
  }
}
```

### Supported Conditions

- `new_in_box` - Deadstock (DS), BNIB, Brand New
- `used_like_new` - Very Near Deadstock (VNDS)
- `used_good` - Near Deadstock (NDS)
- `used_fair` - Worn, Used
- `used_poor` - Beat, Beaters
- `unspecified` - Any condition

### Supported Tags

- `og_all` - Original box included
- `ds` / `vnds` / `nds` - Condition indicators
- `player_edition` - Player Edition (PE) sneakers
- `sample` - Sample pairs
- `no_box` - No original box
- `replacement_box` - Replacement box included

---

## 🧪 Testing

### Run All Tests

```bash
# Run full test suite with coverage
npm test

# Expected output:
# Test Suites: 11 passed, 11 total
# Tests:       75 passed, 75 total
# Coverage:    80.34% statements, 80.66% lines
```

### Run Specific Tests

```bash
# Run only unit tests
npm test -- tests/unit/

# Run specific test file
npm test -- parser.test.js

# Run tests in watch mode (development)
npm run test:watch
```

### Test Coverage Report

```bash
# Generate detailed HTML coverage report
npm test -- --coverage

# Open coverage/lcov-report/index.html in browser
```

### Manual Testing

To test the actor without making real API calls:

```bash
# 1. Update .actor/INPUT.json with your search criteria
# 2. Use webhook.site for testing notifications
# 3. Run locally
npm start
```

### Testing Webhooks

1. Go to [webhook.site](https://webhook.site)
2. Copy your unique webhook URL
3. Add to `.actor/INPUT.json`:

   ```json
   {
     "notificationConfig": {
       "webhookUrl": "https://webhook.site/your-id"
     }
   }
   ```

4. Run the actor and check webhook.site for notifications

---

## 🚀 Deployment

### Deploy to Apify Platform

#### Option 1: Using Apify CLI (Recommended)

```bash
# 1. Ensure you're logged in
apify login

# 2. Initialize actor (first time only)
apify init

# 3. Push to Apify platform
apify push

# Your actor will be deployed to:
# https://console.apify.com/actors/<your-actor-id>
```

#### Option 2: Using Apify Console

1. **Create New Actor**
   - Go to [Apify Console](https://console.apify.com)
   - Click "Actors" → "Create new"
   - Choose "Import from Git"

2. **Configure Git Repository**
   - Repository URL: Your GitHub repo
   - Branch: `main`
   - Build tag: `latest`

3. **Set Actor Configuration**
   - Memory: 4096 MB
   - Timeout: 3600 seconds
   - Enable residential proxies

4. **Deploy**
   - Click "Build" to deploy

### Configure Scheduled Runs

Set up recurring searches (e.g., hourly monitoring):

1. Go to your actor in Apify Console
2. Navigate to "Schedules" tab
3. Click "Create new schedule"
4. Configure:

   ```
   Name: Grail Hunter Hourly
   Cron: 0 * * * *  (every hour)
   Input: Your search criteria
   Notifications: Email on failure
   ```

5. Save and activate

### Environment Variables

Optional configuration via environment variables:

```bash
# Apify API token (required for local development)
export APIFY_TOKEN="your_token_here"

# Log level (default: info)
export LOG_LEVEL="debug"
```

---

## 🏗️ Project Structure

```
grail-hunter/
├── .actor/                      # Apify actor configuration
│   ├── actor.json              # Actor metadata
│   ├── input_schema.json       # Input validation schema
│   ├── OUTPUT_SCHEMA.json      # Output data schema
│   └── INPUT.json              # Sample input
├── src/
│   ├── index.js                # Main entry point
│   ├── config/
│   │   └── platforms.js        # Platform configurations
│   ├── core/
│   │   ├── normalizer.js       # Data standardization
│   │   ├── parser.js           # Size/condition extraction
│   │   ├── filter.js           # User filter application
│   │   └── deduplicator.js     # Seen listing tracking
│   ├── scrapers/
│   │   ├── base.js             # Base scraper interface
│   │   ├── manager.js          # Scraper orchestration
│   │   └── grailed.js          # Grailed scraper (Phase 1)
│   ├── notifications/
│   │   ├── manager.js          # Notification orchestrator
│   │   ├── webhook.js          # Webhook sender
│   │   └── dataset.js          # Apify dataset pusher
│   └── utils/
│       ├── logger.js           # Structured logging
│       ├── errors.js           # Custom error classes
│       └── validators.js       # Input validation
├── tests/
│   ├── unit/                   # 10 unit test files
│   └── integration/            # Integration tests
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .husky/                     # Git hooks
├── jest.config.js              # Jest test configuration
├── package.json
├── README.md
├── IMPLEMENTATION_STATUS.md    # Detailed implementation status
└── DEVELOPMENT_PHASES.md       # Development roadmap
```

---

## 📊 Phase 1 Status

**✅ COMPLETE AND PRODUCTION READY**

### What's Implemented (Phase 1)

- ✅ Grailed scraping integration
- ✅ Data normalization and parsing
- ✅ Size and condition extraction
- ✅ Price and size filtering
- ✅ Deduplication across runs
- ✅ Webhook notifications
- ✅ Dataset storage
- ✅ Comprehensive test suite (75 tests, 80%+ coverage)
- ✅ Code quality tools (ESLint, Prettier, Husky)
- ✅ Full documentation

### Coming in Future Phases

- ✅ **Phase 2:** eBay integration (Complete)
- ⏳ **Phase 3:** StockX integration + market value benchmarking
- ⏳ **Phase 4:** GOAT integration + advanced features

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed status and
[DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) for the complete roadmap.

---

## Troubleshooting

### Common Issues

**Issue: Tests fail with "Apify is not defined"**

```bash
# Solution: Ensure you're using Node.js 18+
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue: Webhook not delivering**

```bash
# Solution: Test with webhook.site first
# Check logs for error details
npm start

# Verify webhook URL is accessible
curl -X POST https://your-webhook-url
```

**Issue: No listings found**

```bash
# Solution: Try broader search terms
# Check if platform is actually Grailed
# Increase maxResults
```

**Issue: Coverage threshold not met**

```bash
# Solution: Run tests to generate coverage report
npm test

# Coverage should be 80%+ for Phase 1
```

---

## 📖 Documentation

### For Users

- [README.md](./README.md) - This file
- [input_schema.json](./.actor/input_schema.json) - Input documentation
- [OUTPUT_SCHEMA.json](./.actor/OUTPUT_SCHEMA.json) - Output documentation

### For Developers

- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Detailed implementation status
- [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) - Development roadmap
- [technical_architecture.md](./technical_architecture.md) - Technical architecture

### Code Documentation

All functions are documented with JSDoc comments. Example:

```javascript
/**
 * Parse all fields from a listing
 * @param {object} listing - Normalized listing
 * @returns {object} Enhanced listing with parsed data
 */
parse(listing) { ... }
```

---

## 🤝 Contributing

This is an Apify Challenge submission project. While direct contributions are not accepted during
the challenge period, feedback and suggestions are welcome!

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and write tests
npm test

# 3. Run linters
npm run lint:fix

# 4. Commit (pre-commit hooks will run)
git commit -m "feat: your feature"

# 5. Push and create PR
git push origin feature/your-feature
```

### Code Quality Standards

- ✅ All tests must pass
- ✅ 80%+ test coverage required
- ✅ ESLint must pass with no errors
- ✅ Prettier formatting enforced
- ✅ Pre-commit hooks must pass

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details.

This project is developed for the **Apify $1M Challenge (2024-2025)**.

---

## 🙏 Acknowledgments

- **Apify** - For the amazing platform and challenge opportunity
- **Sneaker community** - For the inspiration and use case validation
- **Open source community** - For the incredible tools and libraries

---

## 🔗 Links

- [Apify Platform](https://apify.com)
- [Apify Challenge](https://apify.com/challenge)
- [Actor on Apify Store](https://apify.com/actors)
- [Project Repository](https://github.com/Beaulewis1977/grail-hunter)

---

## 📞 Support

For technical issues or questions:

1. Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed documentation
2. Review [Troubleshooting](#troubleshooting) section above
3. Open an issue on GitHub
4. Contact via Apify Challenge support

---

**Made with ❤️ for the sneaker community**

**Status:** ✅ Phase 2 Complete | ⏳ Phase 3-4 In Progress
