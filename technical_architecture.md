# SneakerMeta: Technical Architecture Documentation

### Multi-Platform Sneaker Alert & Aggregation System

**Version:** 1.1 **Date:** November 10, 2025 **Project Type:** Apify Actor Challenge Submission
**Target Market:** Sneaker collectors, resellers, and enthusiasts **Business Model:** FREE during
challenge (through Jan 31, 2026), then tiered pricing **Tagline:** "Never miss your grail again" |
"Your 24/7 sneaker scout"

---

## Table of Contents

1. [Project Overview & Requirements](#1-project-overview--requirements)
2. [Technical Architecture & System Design](#2-technical-architecture--system-design)
3. [Data Models & Schemas](#3-data-models--schemas)
4. [API Specifications](#4-api-specifications)
5. [Platform-Specific Scraping Strategies](#5-platform-specific-scraping-strategies)
6. [Authentication & Security](#6-authentication--security)
7. [Deployment & Infrastructure](#7-deployment--infrastructure)
8. [Monetization Strategy](#8-monetization-strategy)
9. [Apify Challenge Compliance](#9-apify-challenge-compliance)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Project Overview & Requirements

### 1.1 Executive Summary

**SneakerMeta** is a sophisticated Apify actor that aggregates collectible sneaker listings from 4
major marketplaces and delivers real-time alerts when matching listings appear. Unlike
single-platform scrapers, SneakerMeta acts as an intelligent orchestrator that:

- **Aggregates** data from authenticated platforms (StockX, GOAT) and peer-to-peer marketplaces
  (eBay, Grailed)
- **Normalizes** disparate data structures into a unified schema
- **Parses** unstructured sneakerhead terminology (DS, VNDS, OG All, etc.) using AI and regex
- **Deduplicates** across platforms and tracks new listings to prevent alert fatigue
- **Monitors** release calendars proactively for upcoming drops
- **Alerts** users via email, Slack, Discord, or webhooks when deals appear

**Unique Value Proposition:**  
_"One Actor, All Platforms. Stop opening 4 tabs—get deduplicated, real-time sneaker deals in your
size delivered instantly."_

### 1.2 Business Goals and Success Metrics

#### Primary Goals

1. **Win Apify Challenge** - Achieve Grand Prize recognition through technical excellence, novelty,
   and user adoption
2. **Revenue Generation** - Reach $1,000+ MRR within 6 months
3. **User Acquisition** - Achieve 200+ monthly active users (MAUs) within 3 months
4. **Platform Reliability** - Maintain 95%+ uptime and successful scraping rate

#### Success Metrics

| Metric                    | Target (3 months) | Target (6 months) | Measurement             |
| ------------------------- | ----------------- | ----------------- | ----------------------- |
| Monthly Active Users      | 100+              | 200+              | Apify Analytics         |
| Monthly Recurring Revenue | $500              | $1,000+           | Subscription tracking   |
| Actor Quality Score       | 75+               | 85+               | Apify Store metrics     |
| Average Run Success Rate  | 85%               | 90%               | Error rate tracking     |
| User Retention            | 60%               | 70%               | Monthly cohort analysis |
| Alert Accuracy            | 90%               | 95%               | False positive rate     |

### 1.3 Technical Requirements

#### Functional Requirements

- **FR-1**: Support 4 major marketplace platforms: eBay, Grailed, StockX, and GOAT
- **FR-2**: Accept flexible search criteria (keywords, sizes, price ranges, conditions)
- **FR-3**: Parse unstructured sneakerhead terminology automatically
- **FR-4**: Deduplicate listings across platforms and scraping runs
- **FR-5**: Deliver multi-channel notifications (email, webhook, Slack, Discord)
- **FR-6**: Monitor sneaker release calendars for upcoming drops
- **FR-7**: Support scheduled runs (hourly, daily, etc.)
- **FR-8**: Provide standardized JSON output dataset

#### Non-Functional Requirements

- **NFR-1**: Complete scraping run in under 5 minutes for 50 listings per platform
- **NFR-2**: Handle platform failures gracefully without failing entire run
- **NFR-3**: Support up to 500 results per platform per run
- **NFR-4**: Maintain persistent state for deduplication across runs
- **NFR-5**: Comply with all platform rate limits
- **NFR-6**: Achieve 65+ Actor Quality Score for Apify Challenge eligibility

#### Constraints

- **C-1**: **CRITICAL**: Must comply with Apify Challenge platform eligibility requirements
- **C-2**: Must respect robots.txt and platform Terms of Service where possible
- **C-3**: Must use Apify residential proxies for anti-scraping bypass
- **C-4**: Must implement rate limiting (10-200 requests/hour per platform)
- **C-5**: Maximum memory allocation: 4GB RAM
- **C-6**: Maximum execution time: 1 hour per run

### 1.4 Target Users and Use Cases

#### Primary User Personas

**1. The Casual Collector ("The Enthusiast")**

- **Profile**: 25-35 years old, buys 2-4 pairs/year, budget-conscious
- **Pain Point**: Manually checks multiple sites daily, misses deals
- **Use Case**: Set alerts for 2-3 "grail" sneakers in their size, receives instant notifications
- **Pricing Tier**: Hobby ($4.99/month)

**2. The Part-Time Reseller ("The Side Hustler")**

- **Profile**: 20-30 years old, flips 5-10 pairs/month, seeks profit margins
- **Pain Point**: Needs to find underpriced listings before competition
- **Use Case**: Monitors 10+ models across all platforms, filters by price threshold (20% below
  market)
- **Pricing Tier**: Pro ($9.99/month)

**3. The Full-Time Reseller ("The Professional")**

- **Profile**: 25-40 years old, flips 20+ pairs/month, runs as business
- **Pain Point**: Needs automation to scale operations and monitor release calendars
- **Use Case**: Integrates actor via webhooks to their inventory system, monitors upcoming drops
- **Pricing Tier**: Business ($29.99/month) with API access

#### Use Case Scenarios

**UC-1: Find Deal on Specific Sneaker**

```
Actor: User sets search term "Air Jordan 1 Bred", size "10", max price "$800"
System: Scrapes 12 platforms, finds listing on Grailed for $750
Result: Immediate Slack notification with direct link
Outcome: User purchases within minutes before listing expires
```

**UC-2: Monitor Multiple Models for Resale**

```
Actor: User inputs ["Yeezy 350", "Travis Scott Jordan", "Off-White"], sizes [9-12]
System: Runs every hour, deduplicates against previous runs
Result: Daily digest email with 5-10 new listings below market value
Outcome: User identifies profitable flips, purchases 2-3 pairs/week
```

**UC-3: Upcoming Release Alerts**

```
Actor: User enables release calendar monitoring
System: Scrapes The Drop Date, Sole Retriever, Finish Line calendars daily
Result: Discord notification 7 days before "Jordan 4 Military Blue" release with raffle links
Outcome: User enters raffles, secures pair at retail before resale spike
```

---

## 2. Technical Architecture & System Design

### 2.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         APIFY ACTOR: SneakerMeta                        │
│                         Runtime Environment                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MAIN ORCHESTRATOR                                │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  1. Input Validation & Configuration Loading                      │ │
│  │  2. Platform Selection & Search Term Expansion                    │ │
│  │  3. Parallel Scraping Orchestration (AutoscaledPool)              │ │
│  │  4. Data Normalization & AI/Regex Parsing                         │ │
│  │  5. Deduplication Engine (KV Store)                               │ │
│  │  6. Alert Generation & Multi-Channel Notification                 │ │
│  │  7. Dataset Output & State Persistence                            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  ORCHESTRATION      │  │  CUSTOM SCRAPING    │  │  SUPPORT MODULES    │
│  MODULE             │  │  MODULE             │  │                     │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ Calls Existing      │  │ Puppeteer/Playwright│  │ Notification Service│
│ Apify Actors:       │  │ HTTP Clients        │  │ - Email (SendGrid)  │
│                     │  │ API Reverse Eng.    │  │ - Webhook Sender    │
│ • GOAT Scraper      │  │                     │  │ - Discord/Slack     │
│ • eBay Scraper      │  │ Targets:            │  │                     │
│ • Grailed Scraper   │  │ • Flight Club       │  │ AI Parser Service   │
│ • Vinted Scraper    │  │ • Stadium Goods     │  │ - OpenAI API        │
│ • Craigslist        │  │ • Depop             │  │ - Regex Engine      │
│ • OfferUp           │  │ • Poshmark          │  │                     │
│                     │  │ • Kixify            │  │ Release Calendar    │
│                     │  │ • StockX (fallback) │  │ - The Drop Date     │
│                     │  │                     │  │ - Sole Retriever    │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
            │                       │                       │
            └───────────────────────┴───────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA PROCESSING PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Raw Data → Normalization → Parsing → Filtering → Deduplication         │
│                                                       ↓                  │
│                          ┌────────────────────────────────────────────┐ │
│                          │  APIFY STORAGE SERVICES                    │ │
│                          ├────────────────────────────────────────────┤ │
│                          │  • Dataset (Standardized Listings)         │ │
│                          │  • Key-Value Store (Seen Hashes, State)    │ │
│                          │  • Request Queue (Craigslist URLs)         │ │
│                          └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      OUTPUT & NOTIFICATION LAYER                         │
├─────────────────────────────────────────────────────────────────────────┤
│  • JSON Dataset API                                                      │
│  • Email Alerts (SendGrid/Mailgun)                                       │
│  • Webhook POST (User endpoints, Zapier, Make)                           │
│  • Discord/Slack Rich Embeds                                             │
│  • (Future) Push Notifications (OneSignal)                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Breakdown and Responsibilities

#### 2.2.1 Main Orchestrator (`src/main.js`)

**Responsibility**: Central coordinator and execution flow manager

**Key Functions:**

```javascript
async function main() {
  // 1. Initialization
  const input = await Actor.getInput();
  await validateInput(input);
  const kvStore = await Actor.openKeyValueStore();

  // 2. Orchestration
  const allListings = await scrapeAllPlatforms(input);

  // 3. Processing Pipeline
  const normalized = await normalizeData(allListings);
  const parsed = await parseListings(normalized);
  const filtered = await applyFilters(parsed, input);
  const newAlerts = await findNewListings(filtered, kvStore);

  // 4. Output & Notifications
  await Actor.pushData(newAlerts);
  await sendNotifications(newAlerts, input.notificationConfig);

  // 5. Cleanup & Logging
  await logRunStatistics();
}
```

**Dependencies:**

- `apify` SDK v3+
- `crawlee` for advanced crawling
- Custom modules (scrapers, parsers, notifiers)

#### 2.2.2 Platform Scraper Manager (`src/scrapers/manager.js`)

**Responsibility**: Routes scraping tasks to appropriate handlers

**Architecture Pattern**: Strategy Pattern + Factory Pattern

```javascript
class ScraperManager {
  constructor(proxyConfig) {
    this.scrapers = {
      // Orchestrated (calls existing Actors)
      goat: new GOATOrchestrator(),
      ebay: new EbayOrchestrator(),
      grailed: new GrailedOrchestrator(),
      vinted: new VintedOrchestrator(),

      // Custom Built
      flightclub: new FlightClubScraper(proxyConfig),
      stadiumgoods: new StadiumGoodsScraper(proxyConfig),
      depop: new DepopScraper(proxyConfig),
      poshmark: new PoshmarkScraper(proxyConfig),
      kixify: new KixifyScraper(proxyConfig),
      craigslist: new CraigslistScraper(proxyConfig),
      offerup: new OfferUpScraper(proxyConfig),
      stockx: new StockXScraper(proxyConfig), // Fallback
    };
  }

  async scrape(platform, searchParams) {
    const scraper = this.scrapers[platform];
    if (!scraper) throw new Error(`Unknown platform: ${platform}`);

    try {
      return await retryWithBackoff(() => scraper.scrape(searchParams));
    } catch (error) {
      Actor.log.error(`${platform} scraping failed`, { error });
      await this.notifyPlatformFailure(platform, error);
      return []; // Graceful degradation
    }
  }
}
```

#### 2.2.3 Data Normalization Engine (`src/utils/normalizer.js`)

**Responsibility**: Convert platform-specific data to standardized schema

```javascript
class DataNormalizer {
  normalize(rawListing, platformName) {
    const normalizer = this.getNormalizerForPlatform(platformName);
    return normalizer(rawListing);
  }

  // Example: GOAT normalizer
  normalizeGOAT(raw) {
    return {
      product: {
        name: raw.name || raw.product_name,
        brand: this.extractBrand(raw.name),
        model: this.extractModel(raw.name),
        colorway: raw.colorway || this.parseColorway(raw.name),
        sku: raw.sku || raw.style_id,
      },
      listing: {
        price: raw.lowest_price_cents / 100,
        size_us_mens: raw.size,
        condition: 'new_in_box', // GOAT authenticates
        tags: ['authenticated'],
        type: 'sell',
      },
      source: {
        platform: 'GOAT',
        url: `https://goat.com/sneakers/${raw.slug}`,
        id: raw.id.toString(),
        is_authenticated: true,
      },
      scrape: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
```

#### 2.2.4 AI & Regex Parsing Engine (`src/utils/parser.js`)

**Responsibility**: Extract structured data from unstructured text

**Parsing Priorities:**

1. **Condition** - Maps sneakerhead slang to standardized enum
2. **Size** - Extracts US Men's sizing from various formats
3. **Colorway** - Identifies common nicknames (Bred, Chicago, etc.)
4. **Tags** - Flags special attributes (OG All, Player Edition, etc.)

```javascript
class SneakerParser {
  constructor() {
    this.conditionPatterns = [
      { regex: /\b(ds|deadstock|bnib|brand new)\b/i, value: 'new_in_box' },
      { regex: /\b(vnds|very near deadstock)\b/i, value: 'used_like_new' },
      { regex: /\b(nds|near deadstock)\b/i, value: 'used_good' },
      { regex: /\b(worn|used)\b/i, value: 'used_fair' },
      { regex: /\b(beat|beaters|thrashed)\b/i, value: 'used_poor' },
    ];

    this.tagPatterns = [
      { regex: /\b(og all|og box)\b/i, tag: 'og_all' },
      { regex: /\b(pe|player edition)\b/i, tag: 'player_edition' },
      { regex: /\b(sample)\b/i, tag: 'sample' },
      { regex: /\b(promo)\b/i, tag: 'promo' },
    ];

    this.sizePatterns = [
      /\b(?:size|sz)[:\s]*([1-9]|1[0-5])(?:\.5)?\b/i,
      /\b(?:us\s*m(?:en's)?)[:\s]*([1-9]|1[0-5])(?:\.5)?\b/i,
      /\b([1-9]|1[0-5])(?:\.5)?\s*(?:US|M)\b/i,
    ];
  }

  parseCondition(text) {
    for (const pattern of this.conditionPatterns) {
      if (pattern.regex.test(text)) {
        return pattern.value;
      }
    }
    return 'unspecified';
  }

  parseSize(text) {
    for (const regex of this.sizePatterns) {
      const match = text.match(regex);
      if (match) return match[1];
    }
    return null;
  }

  parseTags(text) {
    const tags = [];
    for (const pattern of this.tagPatterns) {
      if (pattern.regex.test(text)) {
        tags.push(pattern.tag);
      }
    }
    return tags;
  }

  // AI Fallback for complex cases
  async parseWithAI(listing) {
    const prompt = `Extract sneaker information from this listing:
Title: "${listing.title}"
Description: "${listing.description}"

Return JSON with: { "size": "10.5", "condition": "used_like_new", "colorway": "Bred", "tags": ["og_all"] }`;

    // Call OpenAI API or local LLM
    const response = await this.callLLM(prompt);
    return JSON.parse(response);
  }
}
```

#### 2.2.5 Deduplication Engine (`src/utils/deduplicator.js`)

**Responsibility**: Track seen listings and identify new alerts

**Strategy**: Hash-based with persistent state

```javascript
class DeduplicationEngine {
  constructor(kvStore) {
    this.kvStore = kvStore;
    this.seenHashesKey = 'seen_listing_hashes';
  }

  async initialize() {
    this.seenHashes = (await this.kvStore.getValue(this.seenHashesKey)) || new Set();
    Actor.log.info(`Loaded ${this.seenHashes.size} seen listings from previous runs`);
  }

  generateHash(listing) {
    // Create unique identifier from platform + ID
    const hashString = `${listing.source.platform}:${listing.source.id}`;
    return crypto.createHash('md5').update(hashString).digest('hex');
  }

  async findNewListings(listings) {
    const newListings = [];
    const newHashes = new Set(this.seenHashes);

    for (const listing of listings) {
      const hash = this.generateHash(listing);

      if (!this.seenHashes.has(hash)) {
        newListings.push(listing);
        newHashes.add(hash);
        Actor.log.info(`NEW LISTING: ${listing.product.name} - $${listing.listing.price}`);
      }
    }

    // Persist updated state
    await this.kvStore.setValue(this.seenHashesKey, Array.from(newHashes));

    return newListings;
  }

  // Advanced: Detect price drops
  async detectPriceDrops(listings) {
    const priceDrops = [];

    for (const listing of listings) {
      const hash = this.generateHash(listing);
      const previousPrice = await this.kvStore.getValue(`price_${hash}`);

      if (previousPrice && listing.listing.price < previousPrice * 0.9) {
        priceDrops.push({
          ...listing,
          previousPrice,
          dropPercentage: (((previousPrice - listing.listing.price) / previousPrice) * 100).toFixed(
            1
          ),
        });
      }

      await this.kvStore.setValue(`price_${hash}`, listing.listing.price);
    }

    return priceDrops;
  }
}
```

#### 2.2.6 Notification Manager (`src/utils/notifier.js`)

**Responsibility**: Multi-channel alert delivery

```javascript
class NotificationManager {
  async send(listings, config) {
    const promises = [];

    if (config.emailTo) {
      promises.push(this.sendEmail(listings, config.emailTo));
    }

    if (config.slackWebhookUrl) {
      promises.push(this.sendSlackMessage(listings, config.slackWebhookUrl));
    }

    if (config.webhookUrl) {
      promises.push(this.sendWebhook(listings, config.webhookUrl));
    }

    await Promise.allSettled(promises);
  }

  async sendEmail(listings, emailTo) {
    const html = this.generateEmailHTML(listings);

    await Actor.call('apify/send-email', {
      to: emailTo,
      subject: `🔔 ${listings.length} New Sneaker Deals Found`,
      html: html,
    });
  }

  generateEmailHTML(listings) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .listing { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .listing img { max-width: 200px; }
            .price { font-size: 24px; color: #28a745; font-weight: bold; }
            .cta { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>🔔 New Sneaker Alerts</h1>
          <p>Found <strong>${listings.length}</strong> new listings matching your criteria:</p>
          ${listings
            .map(
              (l) => `
            <div class="listing">
              <h2>${l.product.name}</h2>
              <img src="${l.source.imageUrl || ''}" alt="${l.product.name}">
              <p class="price">$${l.listing.price} USD</p>
              <p><strong>Size:</strong> ${l.listing.size_us_mens} US Men's | <strong>Condition:</strong> ${l.listing.condition}</p>
              <p><strong>Platform:</strong> ${l.source.platform}</p>
              <a href="${l.source.url}" class="cta">View Listing →</a>
            </div>
          `
            )
            .join('')}
          <hr>
          <p style="color: #666; font-size: 12px;">Powered by SneakerMeta Actor | <a href="https://apify.com">Apify</a></p>
        </body>
      </html>
    `;
  }

  async sendSlackMessage(listings, webhookUrl) {
    const embed = {
      text: `🔔 *${listings.length} New Sneaker Deals Found*`,
      attachments: listings.slice(0, 5).map((l) => ({
        title: l.product.name,
        title_link: l.source.url,
        text: `*$${l.listing.price}* | Size ${l.listing.size_us_mens} | ${l.listing.condition}`,
        color: '#36a64f',
        footer: l.source.platform,
      })),
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed),
    });
  }
}
```

### 2.3 Data Flow Diagram (Text-Based)

```
┌────────────────┐
│  User Input    │
│  (JSON Schema) │
└────────┬───────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Input Validation & Expansion          │
│  - Validate required fields            │
│  - Expand search terms (AI suggestions)│
│  - Load proxy configuration            │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Platform Selection & Routing          │
│  IF platform has Apify Actor:          │
│    → Orchestration Module              │
│  ELSE:                                 │
│    → Custom Scraping Module            │
└────────┬───────────────────────────────┘
         │
         ├─────────────────┬──────────────┬──────────────┐
         ▼                 ▼              ▼              ▼
    ┌─────────┐      ┌─────────┐   ┌─────────┐   ┌──────────┐
    │  GOAT   │      │  eBay   │   │ Flight  │   │Craigslist│
    │ (Actor) │      │ (Actor) │   │  Club   │   │ (Actor)  │
    │         │      │         │   │(Custom) │   │          │
    └────┬────┘      └────┬────┘   └────┬────┘   └────┬─────┘
         │                │              │             │
         └────────────────┴──────────────┴─────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Raw Data Collection          │
         │  (Platform-specific schemas)  │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  Data Normalization           │
         │  → Standardized schema        │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  AI & Regex Parsing           │
         │  → Extract condition, size    │
         │  → Parse tags & colorways     │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  Filtering                    │
         │  → Price range                │
         │  → Size matching              │
         │  → Condition preferences      │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  Deduplication Engine         │
         │  → Load seen hashes (KV Store)│
         │  → Identify new listings      │
         │  → Update seen hashes         │
         └───────────┬───────────────────┘
                     │
                     ├──────────────────┬────────────────┐
                     ▼                  ▼                ▼
         ┌─────────────────┐  ┌─────────────┐  ┌──────────────┐
         │  Dataset Output │  │ Notifications│  │  KV Store    │
         │  (JSON API)     │  │ (Multi-chan) │  │  (State)     │
         └─────────────────┘  └─────────────┘  └──────────────┘
```

### 2.4 Technology Stack

| Layer                  | Technology       | Version | Purpose                                            |
| ---------------------- | ---------------- | ------- | -------------------------------------------------- |
| **Runtime**            | Node.js          | 18+ LTS | Execution environment                              |
| **Framework**          | Apify SDK        | 3.x     | Actor development framework                        |
| **Crawling**           | Crawlee          | 3.x     | Advanced scraping (Puppeteer, Playwright, Cheerio) |
| **HTTP Client**        | Axios            | 1.x     | REST API calls                                     |
| **HTML Parsing**       | Cheerio          | 1.x     | Lightweight DOM manipulation                       |
| **Browser Automation** | Playwright       | 1.x     | Complex JS rendering sites                         |
| **Data Parsing**       | Natural          | 2.x     | NLP for sneaker terminology (optional)             |
| **AI Integration**     | OpenAI API       | 4.x     | Fallback parsing for ambiguous listings            |
| **Email**              | SendGrid         | 7.x     | Transactional emails                               |
| **Proxy**              | Apify Proxy      | N/A     | Residential proxy rotation                         |
| **Storage**            | Apify Dataset/KV | N/A     | Persistent data storage                            |

**Dependencies (`package.json` excerpt):**

```json
{
  "dependencies": {
    "apify": "^3.1.0",
    "crawlee": "^3.5.0",
    "playwright": "^1.40.0",
    "cheerio": "^1.0.0-rc.12",
    "axios": "^1.6.0",
    "@sendgrid/mail": "^7.7.0",
    "natural": "^6.7.0",
    "crypto": "^1.0.1"
  }
}
```

### 2.5 Scalability Considerations

#### Horizontal Scaling

- **AutoscaledPool**: Automatically adjusts concurrency based on system load
- **Platform Parallelization**: Scrape 5-10 platforms simultaneously
- **Distributed State**: Use Apify Key-Value Store (cloud-synced) instead of local memory

#### Performance Optimization

1. **Caching Strategy**
   - Cache authenticated platform data (GOAT, StockX) for 1 hour
   - Cache P2P platform data (Grailed, Depop) for 30 minutes
   - Invalidate cache on price changes

2. **Incremental Scraping**
   - Track last scrape timestamp per platform
   - Only fetch listings after last scrape time
   - Reduces API calls by 70-80% after initial run

3. **Request Batching**
   - Group Craigslist searches by region
   - Batch eBay API calls (up to 100 items per request)

4. **Resource Management**
   ```javascript
   const pool = new AutoscaledPool({
     maxConcurrency: 10, // Max 10 parallel scrapers
     minConcurrency: 2, // Keep at least 2 active
     desiredConcurrency: 5, // Target 5 concurrent
     systemStatusOptions: {
       maxUsedMemoryRatio: 0.8, // Throttle at 80% RAM
     },
   });
   ```

#### Rate Limiting Implementation

```javascript
class RateLimiter {
  constructor(requestsPerHour) {
    this.limit = requestsPerHour;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // Remove old requests
    this.requests = this.requests.filter((t) => t > oneHourAgo);

    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + 3600000 - now;
      Actor.log.warning(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}
```

---

## 3. Data Models & Schemas

### 3.1 Input Schema (INPUT_SCHEMA.json)

**Complete specification for `.actor/input_schema.json`:**

```json
{
  "title": "SneakerMeta Orchestrator Input",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "searchTerms": {
      "title": "Search Terms",
      "type": "array",
      "description": "Sneaker models or keywords to search (e.g., 'Air Jordan 1 Bred', 'Yeezy 350 Zebra'). Can include brand, model, and colorway.",
      "editor": "stringList",
      "prefill": ["Air Jordan 1", "Yeezy 350"],
      "minItems": 1,
      "maxItems": 20
    },
    "sizes": {
      "title": "Desired Sizes (US Men's)",
      "type": "array",
      "description": "US Men's shoe sizes to filter (e.g., '10', '10.5', '11'). Leave empty to include all sizes.",
      "editor": "stringList",
      "prefill": ["10", "10.5", "11"],
      "items": {
        "type": "string",
        "pattern": "^([1-9]|1[0-5])(\\.5)?$"
      }
    },
    "minPrice": {
      "title": "Minimum Price (USD)",
      "type": "number",
      "description": "Minimum price filter in US dollars. Default: 0",
      "default": 0,
      "minimum": 0
    },
    "maxPrice": {
      "title": "Maximum Price (USD)",
      "type": "number",
      "description": "Maximum price filter in US dollars. Leave empty for no limit.",
      "minimum": 1,
      "maximum": 50000
    },
    "conditions": {
      "title": "Condition Filters",
      "type": "array",
      "description": "Filter by sneaker condition. Leave empty to include all conditions.",
      "editor": "select",
      "items": {
        "type": "string",
        "enum": [
          "new_in_box",
          "used_like_new",
          "used_good",
          "used_fair",
          "used_poor",
          "unspecified"
        ]
      },
      "uniqueItems": true
    },
    "targetPlatforms": {
      "title": "Platforms to Search",
      "type": "array",
      "description": "Select which marketplaces to scrape. More platforms = longer runtime but better coverage.",
      "editor": "select",
      "items": {
        "type": "string",
        "enum": [
          "goat",
          "stockx",
          "ebay",
          "grailed",
          "depop",
          "vinted",
          "poshmark",
          "flightclub",
          "stadiumgoods",
          "craigslist",
          "offerup",
          "kixify"
        ]
      },
      "default": ["goat", "ebay", "grailed", "flightclub"],
      "minItems": 1,
      "uniqueItems": true
    },
    "craigslistLocations": {
      "title": "Craigslist Search URLs",
      "type": "array",
      "description": "Required if 'craigslist' is selected. Provide full search URLs (e.g., 'https://newyork.craigslist.org/search/sss?query=jordan+1').",
      "editor": "stringList",
      "items": {
        "type": "string",
        "pattern": "^https?://.*\\.craigslist\\.org.*"
      }
    },
    "maxResultsPerPlatform": {
      "title": "Max Results per Platform",
      "type": "number",
      "description": "Maximum number of listings to scrape from each platform. Higher values increase runtime.",
      "default": 50,
      "minimum": 10,
      "maximum": 500
    },
    "enableReleaseCalendar": {
      "title": "Enable Release Calendar Monitoring",
      "type": "boolean",
      "description": "Monitor upcoming sneaker releases from The Drop Date, Sole Retriever, etc.",
      "default": false
    },
    "dealThresholdPercentage": {
      "title": "Deal Alert Threshold (%)",
      "type": "number",
      "description": "Alert when P2P listings are X% below authenticated platform market value. Example: 20 = alert if 20% below StockX price.",
      "default": 15,
      "minimum": 5,
      "maximum": 50
    },
    "notificationConfig": {
      "title": "Notification Settings",
      "type": "object",
      "description": "Configure how you want to receive alerts",
      "editor": "json",
      "properties": {
        "emailTo": {
          "type": "string",
          "title": "Email Address",
          "description": "Email address for alerts",
          "format": "email"
        },
        "slackWebhookUrl": {
          "type": "string",
          "title": "Slack Webhook URL",
          "description": "Slack/Discord incoming webhook URL",
          "pattern": "^https://hooks\\.slack\\.com/.*"
        },
        "webhookUrl": {
          "type": "string",
          "title": "Custom Webhook URL",
          "description": "Your custom webhook endpoint for JSON POST notifications",
          "pattern": "^https?://.*"
        },
        "webhookSecret": {
          "type": "string",
          "title": "Webhook Secret (Optional)",
          "description": "Secret for HMAC signature verification",
          "isSecret": true
        }
      }
    },
    "proxyConfiguration": {
      "title": "Proxy Configuration",
      "type": "object",
      "description": "Recommended: Apify residential proxies for anti-bot bypass",
      "editor": "proxy",
      "prefill": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
      }
    },
    "advancedOptions": {
      "title": "Advanced Options",
      "type": "object",
      "description": "Advanced scraping configuration",
      "editor": "json",
      "properties": {
        "useAI Parsing": {
          "type": "boolean",
          "title": "Enable AI Parsing",
          "description": "Use OpenAI to parse ambiguous listings (requires API key)",
          "default": false
        },
        "openAIKey": {
          "type": "string",
          "title": "OpenAI API Key",
          "description": "Required if AI parsing is enabled",
          "isSecret": true
        },
        "cacheTimeout": {
          "type": "number",
          "title": "Cache Timeout (minutes)",
          "description": "How long to cache platform data before refreshing",
          "default": 60,
          "minimum": 5,
          "maximum": 1440
        },
        "enablePriceDropAlerts": {
          "type": "boolean",
          "title": "Price Drop Alerts",
          "description": "Alert when previously seen listings drop in price",
          "default": false
        }
      }
    }
  },
  "required": ["searchTerms", "targetPlatforms"]
}
```

**Input Validation Logic:**

```javascript
async function validateInput(input) {
  // Required fields
  if (!input.searchTerms || input.searchTerms.length === 0) {
    throw new Error('At least one search term is required');
  }

  if (!input.targetPlatforms || input.targetPlatforms.length === 0) {
    throw new Error('At least one target platform is required');
  }

  // Conditional requirements
  if (input.targetPlatforms.includes('craigslist')) {
    if (!input.craigslistLocations || input.craigslistLocations.length === 0) {
      throw new Error('craigslistLocations is required when craigslist is selected');
    }
  }

  // Notification validation
  if (input.notificationConfig) {
    const hasAnyNotification =
      input.notificationConfig.emailTo ||
      input.notificationConfig.slackWebhookUrl ||
      input.notificationConfig.webhookUrl;
    if (!hasAnyNotification) {
      Actor.log.warning(
        'No notification channels configured - results will only be saved to dataset'
      );
    }
  }

  // AI parsing validation
  if (input.advancedOptions?.useAIParsing && !input.advancedOptions?.openAIKey) {
    throw new Error('OpenAI API key is required when AI parsing is enabled');
  }
}
```

### 3.2 Standardized Output Schema

**Complete specification for dataset output:**

```javascript
/**
 * SneakerMeta Standardized Listing Schema
 * Version: 1.0
 * All listings are normalized to this structure regardless of source platform
 */
const ListingSchema = {
  // Product information
  product: {
    name: String, // Full sneaker name (e.g., "Air Jordan 1 Retro High OG 'Bred' (2016)")
    brand: String, // Primary brand (e.g., "Nike", "Adidas", "Air Jordan")
    model: String, // Base model (e.g., "Air Jordan 1", "Yeezy 350")
    colorway: String, // Colorway nickname (e.g., "Bred", "Chicago", "Zebra")
    sku: String, // Manufacturer SKU (e.g., "555088-001")
    releaseYear: Number, // Year of release (e.g., 2016)
  },

  // Listing details
  listing: {
    price: Number, // Price in USD
    currency: String, // Currency code (e.g., "USD", "EUR")
    size_us_mens: String, // US Men's size (e.g., "10.5")
    size_us_womens: String, // US Women's size if applicable
    size_eu: String, // EU size if available
    condition: String, // Enum: "new_in_box", "used_like_new", "used_good", "used_fair", "used_poor", "unspecified"
    tags: Array, // Array of strings (e.g., ["og_all", "authenticated", "player_edition"])
    type: String, // Enum: "sell", "buy", "auction"
    description: String, // Full description text (may be truncated to 500 chars)
  },

  // Source information
  source: {
    platform: String, // Platform name (e.g., "GOAT", "Grailed", "eBay")
    url: String, // Direct URL to listing
    id: String, // Platform-specific listing ID
    is_authenticated: Boolean, // True if platform authenticates (GOAT, StockX, Flight Club)
    imageUrl: String, // Primary product image URL
  },

  // Seller information (when available)
  seller: {
    name: String, // Seller username
    rating: Number, // Seller rating (0-5 scale)
    reviewCount: Number, // Number of reviews
    verified: Boolean, // Verified seller status
  },

  // Scraping metadata
  scrape: {
    timestamp: String, // ISO 8601 timestamp (e.g., "2025-11-10T14:30:00Z")
    runId: String, // Apify actor run ID
    version: String, // Actor version number
  },

  // Deal scoring (optional)
  dealScore: {
    isAboveMarket: Boolean, // True if price is above market value
    marketValue: Number, // Estimated market value from authenticated platforms
    savingsPercentage: Number, // Percentage below market (e.g., 25.5)
    savingsAmount: Number, // Dollar amount saved (e.g., 150.00)
  },
};
```

**Example Output:**

```json
[
  {
    "product": {
      "name": "Air Jordan 1 Retro High OG 'Bred' (2016)",
      "brand": "Air Jordan",
      "model": "Air Jordan 1",
      "colorway": "Bred",
      "sku": "555088-001",
      "releaseYear": 2016
    },
    "listing": {
      "price": 750,
      "currency": "USD",
      "size_us_mens": "10.5",
      "size_us_womens": null,
      "size_eu": "44.5",
      "condition": "used_like_new",
      "tags": ["og_all", "vnds"],
      "type": "sell",
      "description": "VNDS condition, worn once. Includes OG box, laces, and receipt. No flaws."
    },
    "source": {
      "platform": "Grailed",
      "url": "https://grailed.com/listings/12345678",
      "id": "12345678",
      "is_authenticated": false,
      "imageUrl": "https://i.ytimg.com/vi/MwgyIms9R54/sddefault.jpg"
    },
    "seller": {
      "name": "sneakerhead_nyc",
      "rating": 4.9,
      "reviewCount": 127,
      "verified": true
    },
    "scrape": {
      "timestamp": "2025-11-10T14:30:00Z",
      "runId": "abc123xyz",
      "version": "1.0.0"
    },
    "dealScore": {
      "isBelowMarket": true,
      "marketValue": 950,
      "savingsPercentage": 21.1,
      "savingsAmount": 200
    }
  }
]
```

### 3.3 Internal Data Structures

#### Platform Configuration

```javascript
const PLATFORM_CONFIGS = {
  goat: {
    name: 'GOAT',
    type: 'orchestrated',
    actorId: 'ecomscrape/goat-product-search-scraper',
    rateLimit: 200, // requests per hour
    cacheTimeout: 60, // minutes
    isAuthenticated: true,
    requiresProxy: true,
  },
  flightclub: {
    name: 'Flight Club',
    type: 'custom',
    scraperClass: 'FlightClubScraper',
    rateLimit: 100,
    cacheTimeout: 30,
    isAuthenticated: true,
    requiresProxy: true,
    baseUrl: 'https://www.flightclub.com',
  },
  // ... more platforms
};
```

#### Sneaker Terminology Dictionary

```javascript
const SNEAKER_LEXICON = {
  conditions: {
    ds: 'new_in_box',
    deadstock: 'new_in_box',
    bnib: 'new_in_box',
    'brand new': 'new_in_box',
    vnds: 'used_like_new',
    'very near deadstock': 'used_like_new',
    nds: 'used_good',
    'near deadstock': 'used_good',
    worn: 'used_fair',
    used: 'used_fair',
    beat: 'used_poor',
    beaters: 'used_poor',
  },

  tags: {
    'og all': 'og_all',
    'og box': 'og_box',
    'og laces': 'og_laces',
    'no box': 'no_box',
    'replacement box': 'replacement_box',
    pe: 'player_edition',
    'player edition': 'player_edition',
    sample: 'sample',
    promo: 'promo',
  },

  colorways: {
    bred: 'Black/Red',
    chicago: 'Chicago',
    royal: 'Royal Blue',
    unc: 'University Blue',
    'shattered backboard': 'Shattered Backboard',
    shadow: 'Shadow',
  },
};
```

### 3.4 Database Schema (Key-Value Store)

**State Management Structure:**

```javascript
// Key: 'seen_listing_hashes'
// Value: Array of MD5 hashes
{
  type: 'Set',
  value: [
    'a1b2c3d4e5f6...',  // Hash of platform:listing_id
    'f6e5d4c3b2a1...',
    // ... up to 10,000 hashes (rolling window)
  ]
}

// Key: 'price_<listing_hash>'
// Value: Price tracking object
{
  currentPrice: 750,
  previousPrice: 800,
  priceHistory: [
    { price: 850, timestamp: '2025-11-01T10:00:00Z' },
    { price: 800, timestamp: '2025-11-05T10:00:00Z' },
    { price: 750, timestamp: '2025-11-10T10:00:00Z' },
  ],
  firstSeen: '2025-11-01T10:00:00Z',
  lastUpdated: '2025-11-10T10:00:00Z',
}

// Key: 'platform_state_<platform_name>'
// Value: Platform scraping state
{
  lastScrapeTimestamp: '2025-11-10T14:00:00Z',
  lastScrapeSuccess: true,
  consecutiveFailures: 0,
  listingsFound: 45,
  averageResponseTime: 2500, // milliseconds
  lastError: null,
}

// Key: 'market_values_<sku>'
// Value: Market value benchmarks
{
  sku: '555088-001',
  productName: 'Air Jordan 1 Bred (2016)',
  goatPrice: 950,
  stockxPrice: 970,
  averageMarketValue: 960,
  lastUpdated: '2025-11-10T12:00:00Z',
}
```

---

## 4. API Specifications

### 4.1 Actor Input API

**Endpoint**: Apify Actor Input  
**Method**: POST (via Apify Console or API)  
**Content-Type**: application/json

**Complete Input Example:**

```json
{
  "searchTerms": ["Air Jordan 1 Bred", "Yeezy 350 Zebra", "Travis Scott Jordan 1"],
  "sizes": ["10", "10.5", "11"],
  "minPrice": 100,
  "maxPrice": 1000,
  "conditions": ["new_in_box", "used_like_new"],
  "targetPlatforms": ["goat", "ebay", "grailed", "flightclub"],
  "maxResultsPerPlatform": 50,
  "enableReleaseCalendar": true,
  "dealThresholdPercentage": 20,
  "notificationConfig": {
    "emailTo": "collector@example.com",
    "slackWebhookUrl": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"
  },
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"],
    "apifyProxyCountry": "US"
  },
  "advancedOptions": {
    "useAIParsing": true,
    "openAIKey": "sk-...",
    "cacheTimeout": 60,
    "enablePriceDropAlerts": true
  }
}
```

### 4.2 Actor Output API

**Endpoint**: Apify Dataset API  
**Method**: GET  
**URL**: `https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=json`

**Response Format:**

```json
{
  "data": [
    {
      "product": { ... },
      "listing": { ... },
      "source": { ... },
      "seller": { ... },
      "scrape": { ... },
      "dealScore": { ... }
    }
  ],
  "count": 45,
  "offset": 0,
  "limit": 1000,
  "total": 45
}
```

**Filtering Examples:**

```bash
# Get only GOAT listings
curl "https://api.apify.com/v2/datasets/{DATASET_ID}/items?fields=product,listing,source&omit=scrape&format=json&clean=true"

# Get listings under $500
# (Note: Apify doesn't support query filtering, must filter client-side)
```

### 4.3 Webhook Payload Format

**Event**: `new_listings_found`  
**Method**: POST  
**Content-Type**: application/json  
**Headers**:

- `X-SneakerMeta-Signature`: HMAC-SHA256 signature of payload
- `X-SneakerMeta-Event`: Event type (e.g., "new_listings")
- `X-SneakerMeta-Timestamp`: Unix timestamp

**Payload Structure:**

```json
{
  "event": "new_listings_found",
  "timestamp": "2025-11-10T14:30:00Z",
  "runId": "abc123xyz",
  "summary": {
    "totalNewListings": 12,
    "platformBreakdown": {
      "goat": 3,
      "grailed": 5,
      "flightclub": 4
    },
    "averagePrice": 625.50,
    "bestDeal": {
      "productName": "Air Jordan 1 Bred",
      "price": 750,
      "marketValue": 950,
      "savingsPercentage": 21.1,
      "url": "https://grailed.com/listings/12345678"
    }
  },
  "listings": [
    {
      "product": { ... },
      "listing": { ... },
      "source": { ... },
      "dealScore": { ... }
    }
  ]
}
```

**Signature Verification (Recipient):**

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

### 4.4 Notification Message Formats

#### Email Template Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background: #f4f4f4;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 10px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .listing {
        border-bottom: 1px solid #eee;
        padding: 20px;
      }
      .listing:last-child {
        border-bottom: none;
      }
      .price {
        font-size: 28px;
        color: #28a745;
        font-weight: bold;
      }
      .deal-badge {
        background: #ff4757;
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
      }
      .cta {
        background: #667eea;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        margin-top: 15px;
      }
      .footer {
        background: #f8f9fa;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #6c757d;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔥 ${count} New Sneaker Deals</h1>
        <p>Found matching your criteria</p>
      </div>

      ${listings.map(listing => `
      <div class="listing">
        <h2>${listing.product.name}</h2>
        ${listing.dealScore?.isBelowMarket ? `<span class="deal-badge"
          >SAVE ${listing.dealScore.savingsPercentage}%</span
        >` : ''}
        <img
          src="${listing.source.imageUrl}"
          style="max-width: 100%; height: auto; margin: 15px 0;"
          alt="${listing.product.name}"
        />
        <p class="price">$${listing.listing.price}</p>
        <p>
          <strong>Size:</strong> ${listing.listing.size_us_mens} US |
          <strong>Condition:</strong> ${listing.listing.condition.replace(/_/g, ' ')}
        </p>
        <p><strong>Platform:</strong> ${listing.source.platform}</p>
        <a href="${listing.source.url}" class="cta">View Listing →</a>
      </div>
      `).join('')}

      <div class="footer">
        <p>Powered by <strong>SneakerMeta</strong> | <a href="https://apify.com">Apify</a></p>
        <p>Want to update your alerts? <a href="#">Manage Settings</a></p>
      </div>
    </div>
  </body>
</html>
```

#### Slack/Discord Embed Format

```javascript
// Slack Rich Message
{
  "text": "🔥 *12 New Sneaker Deals Found*",
  "attachments": [
    {
      "color": "#36a64f",
      "author_name": "SneakerMeta Alert",
      "author_icon": "https://...",
      "title": "Air Jordan 1 Retro High OG 'Bred'",
      "title_link": "https://grailed.com/listings/12345678",
      "text": "*$750* (21% below market) | Size 10.5 | Used Like New",
      "fields": [
        {
          "title": "Platform",
          "value": "Grailed",
          "short": true
        },
        {
          "title": "Condition",
          "value": "VNDS",
          "short": true
        }
      ],
      "image_url": "https://i.ytimg.com/vi/vxSrRWTpB_A/maxresdefault.jpg",
      "footer": "SneakerMeta",
      "footer_icon": "https://images.unsplash.com/opengraph/1x1.png?auto=format&fit=crop&q=60&mark=https%3A%2F%2Fimages.unsplash.com%2Fopengraph%2Flogo.png&mark-w=64&mark-align=top%2Cleft&mark-pad=50&h=630&w=1200&blend=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1608667508764-33cf0726b13a%3Fixid%3DM3wxMjA3fDB8MXxzZWFyY2h8Nnx8c25lYWtlcnN8ZW58MHx8fHwxNzYyNDI1NDQyfDA%26ixlib%3Drb-4.1.0%26auto%3Dformat%26fit%3Dcrop%26q%3D60%26crop%3Dfaces%252Cedges%26h%3D630%26w%3D1200%26blend%3D000000%26blend-mode%3Dnormal%26blend-alpha%3D10%26mark-w%3D750%26mark-align%3Dmiddle%252Ccenter%26mark%3Dhttps%253A%252F%252Fimages.unsplash.com%252Fopengraph%252Fsearch-input.png%253Fauto%253Dformat%2526fit%253Dcrop%2526q%253D60%2526w%253D750%2526h%253D84%2526txt%253Dsneakers%2526txt-pad%253D80%2526txt-align%253Dmiddle%25252Cleft%2526txt-color%253D%252523000000%2526txt-size%253D40%2526txt-width%253D660%2526txt-clip%253Dellipsis&blend-w=1",
      "ts": 1699632000
    }
  ]
}
```

### 4.5 Error Response Formats

**Actor Execution Errors:**

```json
{
  "error": {
    "type": "PLATFORM_SCRAPING_FAILED",
    "message": "Failed to scrape Flight Club: Cloudflare protection detected",
    "platform": "flightclub",
    "timestamp": "2025-11-10T14:30:00Z",
    "severity": "warning",
    "recoverable": true,
    "suggestion": "Enable residential proxies or try again later"
  },
  "partialResults": {
    "successfulPlatforms": ["goat", "ebay", "grailed"],
    "failedPlatforms": ["flightclub"],
    "listingsFound": 38
  }
}
```

**Input Validation Errors:**

```json
{
  "error": {
    "type": "INVALID_INPUT",
    "message": "Validation failed",
    "validationErrors": [
      {
        "field": "craigslistLocations",
        "error": "Required when 'craigslist' is in targetPlatforms"
      },
      {
        "field": "maxPrice",
        "error": "Must be greater than minPrice"
      }
    ]
  }
}
```

---

## 5. Platform-Specific Scraping Strategies

_[Due to length, this section will be continued in a separate message. Would you like me to continue
with the remaining sections?]_

### Summary of Remaining Sections:

5. **Platform-Specific Scraping Strategies** (12 platforms detailed)
6. **Authentication & Security**
7. **Deployment & Infrastructure**
8. **Monetization Strategy**
9. **Apify Challenge Compliance**
10. **Implementation Roadmap**

This document is approximately 50% complete. Shall I continue with the remaining sections?

## 5. Platform-Specific Scraping Strategies

### Platform Risk & Eligibility Matrix

| Platform      | Eligible? | API    | Existing Actor | Approach         | Risk            | Priority |
| ------------- | --------- | ------ | -------------- | ---------------- | --------------- | -------- |
| eBay          | ✅ Yes    | ✅ Yes | ✅ Yes         | Orchestrate      | ⭐ Low          | High     |
| GOAT          | ✅ Yes    | ❌ No  | ✅ Yes         | Orchestrate      | ⭐⭐ Med        | High     |
| Grailed       | ✅ Yes    | ❌ No  | ✅ Yes         | Orchestrate      | ⭐⭐ Med        | High     |
| Vinted        | ✅ Yes    | ❌ No  | ✅ Yes         | Orchestrate      | ⭐⭐ Med        | Medium   |
| Flight Club   | ✅ Yes    | ❌ No  | ❌ **No**      | **Build Custom** | ⭐⭐ Med        | **High** |
| Stadium Goods | ✅ Yes    | ❌ No  | ❌ **No**      | **Build Custom** | ⭐⭐ Med        | **High** |
| Depop         | ✅ Yes    | ❌ No  | ❌ **No**      | **Build Custom** | ⭐⭐ Med        | Medium   |
| Poshmark      | ✅ Yes    | ❌ No  | ❌ **No**      | **Build Custom** | ⭐⭐⭐ High     | Medium   |
| Kixify        | ✅ Yes    | ❌ No  | ❌ **No**      | **Build Custom** | ⭐ Low          | Low      |
| Craigslist    | ✅ Yes    | ❌ No  | ✅ Yes         | Orchestrate      | ⭐⭐ Med        | Medium   |
| OfferUp       | ✅ Yes    | ❌ No  | ✅ Yes         | Orchestrate      | ⭐⭐⭐ High     | Low      |
| StockX        | ✅ Yes    | ❌ No  | ⚠️ Partial     | Build Custom     | ⭐⭐⭐⭐ V.High | Medium   |

**NOTE**: This actor focuses on 4 major platforms (eBay, Grailed, StockX, GOAT) that are compliant
with Apify Challenge requirements.

---

### 5.1 eBay (Official API - Orchestrated)

**Strategy**: Use official eBay Finding API  
**Approach**: Orchestrate existing Apify actor  
**Risk Level**: ⭐ Low (Fully compliant)

#### Implementation Details

**Existing Actor**: `getdataforme/ebay-scraper`

**Orchestration Code**:

```javascript
async function scrapeEbay(searchParams) {
  const { keywords, minPrice, maxPrice, sizes } = searchParams;

  const actorInput = {
    urls: sizes.map(
      (size) =>
        `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keywords + ' size ' + size)}&_udlo=${minPrice}&_udhi=${maxPrice}&_sop=10` // Sort by newest
    ),
    maxItems: searchParams.maxResults || 50,
    proxyConfiguration: searchParams.proxyConfig,
  };

  const run = await Actor.call('getdataforme/ebay-scraper', actorInput);
  const { items } = await Actor.apifyClient.dataset(run.defaultDatasetId).listItems();

  return items.items.map((item) => normalizeEbayData(item));
}

function normalizeEbayData(raw) {
  return {
    product: {
      name: raw.title,
      brand: extractBrand(raw.title),
      model: extractModel(raw.title),
      colorway: null, // Will be parsed later
      sku: null,
    },
    listing: {
      price: parseFloat(raw.price?.replace(/[^0-9.]/g, '')),
      currency: 'USD',
      size_us_mens: null, // Will be parsed from title
      condition: mapEbayCondition(raw.condition),
      tags: raw.authenticity_guarantee ? ['authenticated'] : [],
      type: raw.format === 'Auction' ? 'auction' : 'sell',
      description: raw.description,
    },
    source: {
      platform: 'eBay',
      url: raw.url,
      id: raw.itemId,
      is_authenticated: raw.authenticity_guarantee || false,
      imageUrl: raw.image,
    },
    seller: {
      name: raw.seller?.username,
      rating: raw.seller?.feedbackScore,
      reviewCount: raw.seller?.feedbackCount,
    },
  };
}

function mapEbayCondition(ebayCondition) {
  const conditionMap = {
    'New with box': 'new_in_box',
    'New without box': 'new_in_box',
    'Pre-owned': 'used_good',
    Used: 'used_fair',
  };
  return conditionMap[ebayCondition] || 'unspecified';
}
```

#### API Specifications

**eBay Finding API** (alternative to actor):

```javascript
// Direct API implementation (backup option)
async function callEbayAPI(keywords, minPrice, maxPrice) {
  const EBAY_APP_ID = await Actor.getValue('EBAY_APP_ID');

  const url = new URL('https://svcs.ebay.com/services/search/FindingService/v1');
  url.searchParams.append('OPERATION-NAME', 'findItemsAdvanced');
  url.searchParams.append('SERVICE-VERSION', '1.0.0');
  url.searchParams.append('SECURITY-APPNAME', EBAY_APP_ID);
  url.searchParams.append('RESPONSE-DATA-FORMAT', 'JSON');
  url.searchParams.append('keywords', keywords);
  url.searchParams.append('itemFilter(0).name', 'MinPrice');
  url.searchParams.append('itemFilter(0).value', minPrice);
  url.searchParams.append('itemFilter(1).name', 'MaxPrice');
  url.searchParams.append('itemFilter(1).value', maxPrice);
  url.searchParams.append('itemFilter(2).name', 'ListingType');
  url.searchParams.append('itemFilter(2).value', 'FixedPrice');
  url.searchParams.append('sortOrder', 'StartTimeNewest');

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.findItemsAdvancedResponse[0].searchResult[0].item || [];
}
```

**Rate Limits**: 5,000 calls/day (free tier)

#### Error Handling

- Handle rate limit (HTTP 429) with exponential backoff
- Gracefully handle "no results" responses
- Log eBay API errors separately for debugging

---

### 5.2 GOAT (Orchestrated)

**Strategy**: Use existing Apify actor  
**Approach**: Orchestrate `ecomscrape/goat-product-search-scraper`  
**Risk Level**: ⭐⭐ Medium

#### Implementation

```javascript
async function scrapeGOAT(searchParams) {
  const { keywords, minPrice, maxPrice } = searchParams;

  const actorInput = {
    query: keywords,
    maxItems: searchParams.maxResults || 50,
    proxyConfiguration: searchParams.proxyConfig,
  };

  try {
    const run = await Actor.call('ecomscrape/goat-product-search-scraper', actorInput, {
      timeout: 300, // 5 minutes
      memory: 1024, // 1GB
    });

    const { items } = await Actor.apifyClient.dataset(run.defaultDatasetId).listItems();

    return items.items
      .filter((item) => {
        const price = item.lowest_price_cents / 100;
        return (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
      })
      .map((item) => normalizeGOATData(item));
  } catch (error) {
    Actor.log.error('GOAT scraping failed', { error: error.message });
    throw error;
  }
}

function normalizeGOATData(raw) {
  return {
    product: {
      name: raw.name || raw.product_name,
      brand: raw.brand_name,
      model: extractModel(raw.name),
      colorway: raw.details?.colorway,
      sku: raw.sku || raw.style_id,
      releaseYear: raw.release_date ? new Date(raw.release_date).getFullYear() : null,
    },
    listing: {
      price: raw.lowest_price_cents / 100,
      currency: 'USD',
      size_us_mens: raw.size,
      condition: 'new_in_box',
      tags: ['authenticated', 'goat_verified'],
      type: 'sell',
    },
    source: {
      platform: 'GOAT',
      url: `https://www.goat.com/sneakers/${raw.slug}`,
      id: raw.id.toString(),
      is_authenticated: true,
      imageUrl: raw.main_picture_url || raw.picture_url,
    },
    scrape: {
      timestamp: new Date().toISOString(),
    },
  };
}
```

#### Market Value Benchmark

Since GOAT authenticates all items, use GOAT prices as market value benchmarks:

```javascript
async function updateMarketValues(sku, goatPrice) {
  const kvStore = await Actor.openKeyValueStore();
  const key = `market_values_${sku}`;

  const existing = (await kvStore.getValue(key)) || {};

  await kvStore.setValue(key, {
    ...existing,
    sku,
    goatPrice,
    lastUpdated: new Date().toISOString(),
  });
}
```

---

### 5.3 Flight Club (Custom Scraper - **WHITE SPACE OPPORTUNITY**)

**Strategy**: Build custom scraper (no existing actor)  
**Approach**: Playwright browser automation  
**Risk Level**: ⭐⭐ Medium  
**Value**: High - Authenticated consignment platform

#### Why Flight Club?

- High-end authenticated sneakers
- No existing Apify actor (**novelty points**)
- Cleaner site structure than StockX
- Less aggressive anti-scraping than GOAT

#### Technical Implementation

```javascript
import { PlaywrightCrawler } from 'crawlee';

class FlightClubScraper {
  constructor(proxyConfig) {
    this.proxyConfig = proxyConfig;
    this.baseUrl = 'https://www.flightclub.com';
  }

  async scrape(searchParams) {
    const { keywords, minPrice, maxPrice, sizes } = searchParams;
    const results = [];

    const crawler = new PlaywrightCrawler({
      proxyConfiguration: this.proxyConfig,
      launchContext: {
        launchOptions: {
          headless: true,
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },

      async requestHandler({ page, request }) {
        Actor.log.info(`Scraping Flight Club: ${request.url}`);

        // Navigate to search page
        await page.goto(`${this.baseUrl}/catalogsearch/result/?q=${encodeURIComponent(keywords)}`);
        await page.waitForSelector('.product-tile', { timeout: 10000 });

        // Extract product listings
        const listings = await page.$$eval('.product-tile', (tiles) => {
          return tiles.map((tile) => ({
            name: tile.querySelector('.product-name')?.textContent?.trim(),
            price: tile.querySelector('.price')?.textContent?.trim(),
            url: tile.querySelector('a')?.href,
            imageUrl: tile.querySelector('img')?.src,
            sku: tile.getAttribute('data-sku'),
          }));
        });

        // Filter by size (requires clicking into individual listings)
        for (const listing of listings) {
          const price = parseFloat(listing.price.replace(/[^0-9.]/g, ''));

          if ((minPrice && price < minPrice) || (maxPrice && price > maxPrice)) {
            continue;
          }

          results.push({
            product: {
              name: listing.name,
              brand: extractBrand(listing.name),
              model: extractModel(listing.name),
              sku: listing.sku,
            },
            listing: {
              price: price,
              currency: 'USD',
              condition: 'new_in_box',
              tags: ['authenticated', 'consignment'],
              type: 'sell',
            },
            source: {
              platform: 'Flight Club',
              url: listing.url,
              id: listing.sku,
              is_authenticated: true,
              imageUrl: listing.imageUrl,
            },
          });
        }
      },

      maxRequestsPerCrawl: searchParams.maxResults || 50,
      maxConcurrency: 2, // Be respectful
      requestHandlerTimeoutSecs: 60,
    });

    await crawler.run([`${this.baseUrl}/catalogsearch/result/?q=${encodeURIComponent(keywords)}`]);

    return results;
  }
}
```

#### Anti-Scraping Countermeasures

**Challenges**:

- Cloudflare (basic level)
- Rate limiting (~100 req/hour)
- Dynamic JavaScript rendering

**Solutions**:

1. **Use residential proxies** (Apify proxy pool)
2. **Randomize delays** between requests (2-5 seconds)
3. **Rotate User-Agents**:
   ```javascript
   const userAgents = [
     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
   ];
   ```
4. **Implement retry logic** with exponential backoff
5. **Monitor for CAPTCHA** and handle gracefully

---

### 5.4 Stadium Goods (Custom Scraper - **WHITE SPACE OPPORTUNITY**)

**Strategy**: Build custom scraper (no existing actor)  
**Approach**: HTTP requests + Cheerio (lighter than Playwright)  
**Risk Level**: ⭐⭐ Medium  
**Value**: High - Sister site to Flight Club

#### Implementation

```javascript
import { CheerioCrawler } from 'crawlee';

class StadiumGoodsScraper {
  constructor(proxyConfig) {
    this.proxyConfig = proxyConfig;
    this.baseUrl = 'https://www.stadiumgoods.com';
  }

  async scrape(searchParams) {
    const { keywords, minPrice, maxPrice } = searchParams;
    const results = [];

    const crawler = new CheerioCrawler({
      proxyConfiguration: this.proxyConfig,

      async requestHandler({ $, request }) {
        Actor.log.info(`Scraping Stadium Goods: ${request.url}`);

        $('.product-grid-item').each((_, el) => {
          const $el = $(el);

          const name = $el.find('.product-name').text().trim();
          const priceText = $el.find('.price').text().trim();
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          const url = $el.find('a').attr('href');
          const imageUrl = $el.find('img').attr('src');
          const sku = $el.attr('data-product-id');

          if ((minPrice && price < minPrice) || (maxPrice && price > maxPrice)) {
            return;
          }

          results.push({
            product: {
              name: name,
              brand: extractBrand(name),
              model: extractModel(name),
              sku: sku,
            },
            listing: {
              price: price,
              currency: 'USD',
              condition: 'new_in_box',
              tags: ['authenticated', 'consignment'],
              type: 'sell',
            },
            source: {
              platform: 'Stadium Goods',
              url: this.baseUrl + url,
              id: sku,
              is_authenticated: true,
              imageUrl: imageUrl,
            },
          });
        });
      },

      maxRequestsPerCrawl: searchParams.maxResults || 50,
      maxConcurrency: 3,
    });

    await crawler.run([`${this.baseUrl}/search?q=${encodeURIComponent(keywords)}`]);

    return results;
  }
}
```

**Advantages over Flight Club**:

- Simpler HTML structure (no heavy JavaScript)
- Faster scraping (Cheerio vs Playwright)
- Same authenticated inventory

---

### 5.5 Grailed (Orchestrated)

**Strategy**: Use existing actor  
**Approach**: `vmscrapers/grailed`  
**Risk Level**: ⭐⭐ Medium

```javascript
async function scrapeGrailed(searchParams) {
  const { keywords } = searchParams;

  const actorInput = {
    search: keywords,
    category: 'footwear',
    maxItems: searchParams.maxResults || 50,
    proxyConfiguration: searchParams.proxyConfig,
  };

  const run = await Actor.call('vmscrapers/grailed', actorInput);
  const { items } = await Actor.apifyClient.dataset(run.defaultDatasetId).listItems();

  return items.items.map((item) => normalizeGrailedData(item));
}
```

**Key Parsing**: Grailed listings are unstructured - **heavy parsing required**

---

### 5.6 Depop (Custom Scraper)

**Strategy**: HTTP requests to internal API  
**Approach**: Reverse-engineered mobile API  
**Risk Level**: ⭐⭐ Medium

```javascript
async function scrapeDepop(keywords) {
  const response = await fetch(
    `https://webapi.depop.com/api/v2/search/products/?what=${encodeURIComponent(keywords)}&itemsPerPage=50`,
    {
      headers: {
        'User-Agent': 'Depop/1.0 (iPhone; iOS 15.0)',
      },
    }
  );

  const data = await response.json();
  return data.products.map((product) => normalizeDepopData(product));
}
```

---

### 5.7 Poshmark (Custom Scraper)

**Strategy**: Internal REST API  
**Risk Level**: ⭐⭐⭐ High (Cloudflare + rate limiting)

```javascript
async function scrapePoshmark(keywords) {
  const response = await fetch('https://poshmark.com/vm-rest/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      query: keywords,
      type: 'listings',
      sort: 'added_desc',
      category: 'Men-Shoes-Athletic_Shoes',
    }),
  });

  const data = await response.json();
  return data.data.map((item) => normalizePoshmarkData(item));
}
```

---

### 5.8 Craigslist (Orchestrated)

**Strategy**: Use existing scraper  
**Challenge**: Requires city-specific URLs  
**Risk Level**: ⭐⭐ Medium

```javascript
async function scrapeCraigslist(searchParams) {
  const { craigslistLocations } = searchParams;

  const actorInput = {
    startUrls: craigslistLocations,
    maxItems: searchParams.maxResults || 50,
    proxyConfiguration: searchParams.proxyConfig,
  };

  const run = await Actor.call('misceres/craigslist-search-scraper', actorInput);
  const { items } = await Actor.apifyClient.dataset(run.defaultDatasetId).listItems();

  return items.items.map((item) => normalizeCraigslistData(item));
}
```

**User Input Example**:

```json
{
  "craigslistLocations": [
    "https://newyork.craigslist.org/search/sss?query=jordan+1",
    "https://losangeles.craigslist.org/search/sss?query=jordan+1",
    "https://chicago.craigslist.org/search/sss?query=jordan+1"
  ]
}
```

---

### 5.9 StockX (Custom - HIGH RISK)

**Strategy**: Browser automation or internal API  
**Risk Level**: ⭐⭐⭐⭐ Very High  
**Recommendation**: **Low priority** - only if other platforms fail

#### Challenges

- Cloudflare Enterprise
- PerimeterX bot detection
- TLS fingerprinting
- Aggressive legal team

#### Minimal Implementation (Fallback Only)

```javascript
class StockXScraper {
  async scrape(keywords) {
    try {
      // Attempt API endpoint (may break frequently)
      const response = await fetch(
        `https://stockx.com/api/browse?_search=${encodeURIComponent(keywords)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0...',
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 403) {
        Actor.log.warning('StockX scraping blocked - skipping platform');
        return [];
      }

      const data = await response.json();
      return data.Products.map((p) => normalizeStockXData(p));
    } catch (error) {
      Actor.log.error('StockX scraping failed', { error });
      return []; // Fail gracefully
    }
  }
}
```

**Legal Disclaimer in README**:

> ⚠️ **StockX Scraping**: Use at your own risk. StockX actively enforces their ToS. Consider
> excluding this platform or using official StockX API access if available.

---

### 5.10 Platform Fallback Strategy

```javascript
async function scrapeWithFallback(platform, searchParams) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const results = await scrapers[platform].scrape(searchParams);

      if (results.length === 0) {
        Actor.log.warning(`${platform} returned no results (attempt ${attempt}/${maxRetries})`);
      } else {
        Actor.log.info(`${platform} scraped successfully: ${results.length} listings`);
        return results;
      }
    } catch (error) {
      lastError = error;
      Actor.log.error(`${platform} scraping failed (attempt ${attempt}/${maxRetries})`, {
        error: error.message,
      });

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed - log and continue
  await notifyPlatformFailure(platform, lastError);
  return [];
}
```

---

## 6. Authentication & Security

### 6.1 API Key Management

**Storage Strategy**: Use Apify Key-Value Store with encryption

```javascript
// Storing API keys securely
async function storeAPIKey(serviceName, apiKey) {
  const kvStore = await Actor.openKeyValueStore();
  await kvStore.setValue(`API_KEY_${serviceName}`, apiKey, {
    contentType: 'text/plain',
  });
}

// Retrieving API keys
async function getAPIKey(serviceName) {
  const kvStore = await Actor.openKeyValueStore();
  return await kvStore.getValue(`API_KEY_${serviceName}`);
}

// Usage
const EBAY_APP_ID = (await getAPIKey('EBAY')) || process.env.EBAY_APP_ID;
```

**Environment Variables**:

```bash
# .actor/.actor.json - Secrets configuration
{
  "secrets": [
    "EBAY_APP_ID",
    "SENDGRID_API_KEY",
    "OPENAI_API_KEY",
    "WEBHOOK_SECRET"
  ]
}
```

### 6.2 User Credential Storage (If Needed)

**Scenario**: If user provides platform credentials (e.g., for Craigslist login)

**Approach**: Encrypted storage with AES-256

```javascript
const crypto = require('crypto');

class CredentialManager {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async storeCredentials(platform, username, password) {
    const kvStore = await Actor.openKeyValueStore();
    const encrypted = this.encrypt(JSON.stringify({ username, password }));
    await kvStore.setValue(`CREDS_${platform}`, encrypted);
  }

  async getCredentials(platform) {
    const kvStore = await Actor.openKeyValueStore();
    const encrypted = await kvStore.getValue(`CREDS_${platform}`);
    if (!encrypted) return null;
    return JSON.parse(this.decrypt(encrypted));
  }
}
```

**CRITICAL**: Always inform users that credentials are encrypted and only used for their actor runs.

### 6.3 Data Encryption in Transit

**All external communications use HTTPS**:

- Webhook notifications
- API calls (eBay, SendGrid)
- Proxy connections (Apify proxies use TLS)

### 6.4 Rate Limiting Implementation

**Per-Platform Rate Limiters**:

```javascript
class PlatformRateLimiter {
  constructor() {
    this.limiters = {
      ebay: new RateLimiter(200), // 200 req/hour
      goat: new RateLimiter(100),
      flightclub: new RateLimiter(50),
      stadiumgoods: new RateLimiter(75),
      grailed: new RateLimiter(150),
      depop: new RateLimiter(100),
      poshmark: new RateLimiter(50),
      craigslist: new RateLimiter(100),
      offerup: new RateLimiter(50),
      stockx: new RateLimiter(20), // Very conservative
    };
  }

  async throttle(platform) {
    const limiter = this.limiters[platform];
    if (!limiter) return;
    await limiter.throttle();
  }
}

class RateLimiter {
  constructor(requestsPerHour) {
    this.limit = requestsPerHour;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    this.requests = this.requests.filter((t) => t > oneHourAgo);

    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + 3600000 - now;
      Actor.log.warning(`Rate limit reached for platform, waiting ${Math.round(waitTime / 1000)}s`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}
```

### 6.5 Security Best Practices

#### Input Sanitization

```javascript
function sanitizeInput(input) {
  // Prevent injection attacks
  const sanitized = { ...input };

  // Sanitize search terms (no SQL, no XSS)
  sanitized.searchTerms = input.searchTerms.map((term) =>
    term
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
  );

  // Validate URLs
  if (input.notificationConfig?.webhookUrl) {
    try {
      new URL(input.notificationConfig.webhookUrl);
    } catch {
      throw new Error('Invalid webhook URL');
    }
  }

  // Validate email
  if (input.notificationConfig?.emailTo) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.notificationConfig.emailTo)) {
      throw new Error('Invalid email address');
    }
  }

  return sanitized;
}
```

#### HMAC Webhook Signatures

```javascript
function generateWebhookSignature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

async function sendWebhookWithSignature(url, payload, secret) {
  const signature = generateWebhookSignature(payload, secret);

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SneakerMeta-Signature': signature,
      'X-SneakerMeta-Timestamp': Date.now().toString(),
    },
    body: JSON.stringify(payload),
  });
}
```

#### robots.txt Compliance

```javascript
import robotsParser from 'robots-parser';

async function checkRobotsTxt(url) {
  try {
    const robotsUrl = new URL('/robots.txt', url).href;
    const response = await fetch(robotsUrl);
    const robotsTxt = await response.text();

    const robots = robotsParser(robotsUrl, robotsTxt);
    const isAllowed = robots.isAllowed(url, 'ApifySneakerMeta');

    if (!isAllowed) {
      Actor.log.warning(`robots.txt disallows scraping: ${url}`);
    }

    return isAllowed;
  } catch (error) {
    Actor.log.warning(`Could not fetch robots.txt for ${url}`);
    return true; // Assume allowed if robots.txt is unavailable
  }
}
```

---

## 7. Deployment & Infrastructure

### 7.1 Apify Platform Configuration

**Actor Configuration (`.actor/actor.json`)**:

```json
{
  "actorSpecification": 1,
  "name": "sneaker-meta-orchestrator",
  "title": "SneakerMeta: Multi-Platform Sneaker Alert System",
  "description": "Aggregate sneaker listings from 4 major marketplaces (GOAT, eBay, Grailed, StockX) with real-time alerts via email, Slack, and webhooks. AI-powered parsing of sneakerhead terminology. Perfect for collectors and resellers.",
  "version": "1.0.0",
  "meta": {
    "templateId": "node-playwright-chrome"
  },
  "input": "./input_schema.json",
  "dockerfile": "./Dockerfile",
  "readme": "./README.md",
  "categories": ["ECOMMERCE", "SCRAPER", "AUTOMATION"],
  "storageDescriptors": [
    {
      "localPath": "./storage/datasets",
      "storageName": "default"
    },
    {
      "localPath": "./storage/key_value_stores",
      "storageName": "default"
    }
  ],
  "defaultRunOptions": {
    "build": "latest",
    "timeoutSecs": 3600,
    "memoryMbytes": 4096
  }
}
```

### 7.2 Resource Allocation

| Resource   | Minimum     | Recommended | Maximum    |
| ---------- | ----------- | ----------- | ---------- |
| Memory     | 2048 MB     | 4096 MB     | 8192 MB    |
| Timeout    | 1800s (30m) | 3600s (1h)  | 7200s (2h) |
| CPU        | 1 core      | 2 cores     | 4 cores    |
| Build Time | 300s        | 600s        | 900s       |

**Memory Considerations**:

- Playwright browsers: ~500MB each
- Dataset storage: ~100MB per 1000 listings
- Key-Value Store: ~10MB
- Base Node.js: ~200MB

**Cost Estimate** (Apify pricing):

- Free tier: $5 of credits/month
- Basic run (1h, 4GB): ~$0.50
- Monthly scheduled (daily): ~$15/month
- User pays via subscription, covers platform costs

### 7.3 Dockerfile Configuration

```dockerfile
FROM apify/actor-node-playwright-chrome:18

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install --production

# Copy source code
COPY . ./

# Run the actor
CMD npm start
```

### 7.4 Scheduling Strategy

**Use Cases**:

1. **Real-time monitoring** - Hourly runs
2. **Daily digest** - Once per day at 9 AM
3. **Release calendar** - Daily at midnight

**Scheduling Configuration**:

```json
{
  "schedules": [
    {
      "name": "Hourly Sneaker Monitoring",
      "cronExpression": "0 * * * *",
      "isEnabled": true,
      "input": {
        "searchTerms": ["Air Jordan 1", "Yeezy 350"],
        "targetPlatforms": ["goat", "ebay", "grailed"],
        "notificationConfig": {
          "emailTo": "user@example.com"
        }
      }
    },
    {
      "name": "Daily Release Calendar",
      "cronExpression": "0 0 * * *",
      "isEnabled": true,
      "input": {
        "enableReleaseCalendar": true,
        "notificationConfig": {
          "slackWebhookUrl": "https://hooks.slack.com/..."
        }
      }
    }
  ]
}
```

### 7.5 Monitoring and Logging

**Structured Logging**:

```javascript
// Log levels: DEBUG, INFO, WARNING, ERROR
Actor.log.info('Starting SneakerMeta scraping run', {
  searchTerms: input.searchTerms,
  platforms: input.targetPlatforms.length,
  runId: Actor.getEnv().actorRunId,
});

Actor.log.warning('Platform scraping partial failure', {
  platform: 'flightclub',
  error: error.message,
  recovered: true,
});

Actor.log.error('Critical failure - aborting run', {
  error: error.stack,
  input: input,
});
```

**Performance Metrics**:

```javascript
async function logRunStatistics() {
  const stats = {
    totalListings: allListings.length,
    newListings: newAlerts.length,
    platformBreakdown: {},
    averagePrice: calculateAverage(allListings.map((l) => l.listing.price)),
    executionTime: Date.now() - startTime,
  };

  for (const listing of allListings) {
    const platform = listing.source.platform;
    stats.platformBreakdown[platform] = (stats.platformBreakdown[platform] || 0) + 1;
  }

  Actor.log.info('Run completed successfully', stats);

  // Store metrics for dashboard
  await Actor.setValue('RUN_STATISTICS', stats);
}
```

**Monitoring Dashboard** (Future Enhancement):

- Create simple HTML dashboard showing:
  - Success rate per platform
  - Average listings found per run
  - Alert frequency
  - Error trends

### 7.6 Backup and Recovery

**State Backup**:

```javascript
async function backupState() {
  const kvStore = await Actor.openKeyValueStore();

  // Backup seen hashes
  const seenHashes = await kvStore.getValue('seen_listing_hashes');
  await kvStore.setValue('seen_hashes_backup', seenHashes);

  // Backup market values
  const keys = await kvStore.listKeys();
  const marketValues = {};

  for (const key of keys.items.filter((k) => k.key.startsWith('market_values_'))) {
    marketValues[key.key] = await kvStore.getValue(key.key);
  }

  await kvStore.setValue('market_values_backup', marketValues);

  Actor.log.info('State backed up successfully');
}
```

**Recovery Strategy**:

```javascript
async function recoverFromFailure() {
  const kvStore = await Actor.openKeyValueStore();

  // Restore from backup if primary state is corrupted
  const seenHashes = await kvStore.getValue('seen_listing_hashes');

  if (!seenHashes || seenHashes.length === 0) {
    Actor.log.warning('Primary state corrupted, restoring from backup');
    const backup = await kvStore.getValue('seen_hashes_backup');
    await kvStore.setValue('seen_listing_hashes', backup);
  }
}
```

---

## 8. Monetization Strategy

### 8.1 Pricing Tiers

| Tier         | Price     | Platforms | Max Results  | Alerts          | Features                                 |
| ------------ | --------- | --------- | ------------ | --------------- | ---------------------------------------- |
| **Free**     | $0        | 2         | 20/platform  | Email only      | Basic scraping, 1 search term            |
| **Hobby**    | $4.99/mo  | 5         | 50/platform  | Email + Webhook | 5 search terms, hourly runs              |
| **Pro**      | $9.99/mo  | 12 (All)  | 200/platform | All channels    | Unlimited terms, AI parsing, price drops |
| **Business** | $29.99/mo | 12 (All)  | 500/platform | All + priority  | API access, white-label, SLA             |

### 8.2 Implementation of Tiered Access

**Tier Enforcement**:

```javascript
const TIER_LIMITS = {
  free: {
    maxPlatforms: 2,
    maxSearchTerms: 1,
    maxResultsPerPlatform: 20,
    emailAlerts: true,
    webhookAlerts: false,
    aiParsing: false,
    priceDropAlerts: false,
  },
  hobby: {
    maxPlatforms: 5,
    maxSearchTerms: 5,
    maxResultsPerPlatform: 50,
    emailAlerts: true,
    webhookAlerts: true,
    aiParsing: false,
    priceDropAlerts: false,
  },
  pro: {
    maxPlatforms: 12,
    maxSearchTerms: 999,
    maxResultsPerPlatform: 200,
    emailAlerts: true,
    webhookAlerts: true,
    aiParsing: true,
    priceDropAlerts: true,
  },
  business: {
    maxPlatforms: 12,
    maxSearchTerms: 999,
    maxResultsPerPlatform: 500,
    emailAlerts: true,
    webhookAlerts: true,
    aiParsing: true,
    priceDropAlerts: true,
    apiAccess: true,
  },
};

async function validateTier(input) {
  const tier = input.subscriptionTier || 'free';
  const limits = TIER_LIMITS[tier];

  if (input.targetPlatforms.length > limits.maxPlatforms) {
    throw new Error(
      `${tier} tier limited to ${limits.maxPlatforms} platforms. Upgrade to Pro for all platforms.`
    );
  }

  if (input.searchTerms.length > limits.maxSearchTerms) {
    throw new Error(`${tier} tier limited to ${limits.maxSearchTerms} search terms.`);
  }

  if (input.advancedOptions?.useAIParsing && !limits.aiParsing) {
    throw new Error(`AI parsing requires Pro tier or higher.`);
  }

  Actor.log.info(`User tier validated: ${tier}`);
}
```

### 8.3 Apify Monetization Configuration

**Enable Paid Actor in Apify Console**:

```json
{
  "pricingModel": "MONTHLY_RENTAL",
  "monthlyPrice": 4.99,
  "annualPrice": 49.99,
  "freeTrial": 7,
  "freeTrialRuns": 10
}
```

**Revenue Split**:

- Apify takes 20% commission
- You receive 80% ($3.99 per $4.99 subscription)

### 8.4 Payment Processing

**Handled by Apify** - No additional integration needed:

- Users purchase via Apify Store
- Billing managed by Apify
- Monthly payouts via PayPal or bank transfer

### 8.5 Usage Tracking

```javascript
async function trackUsage(userId, tier) {
  const kvStore = await Actor.openKeyValueStore();
  const usageKey = `usage_${userId}_${new Date().toISOString().slice(0, 7)}`; // YYYY-MM

  const usage = (await kvStore.getValue(usageKey)) || {
    userId,
    tier,
    runs: 0,
    listingsScraped: 0,
    alertsSent: 0,
  };

  usage.runs += 1;
  usage.listingsScraped += allListings.length;
  usage.alertsSent += newAlerts.length;

  await kvStore.setValue(usageKey, usage);
}
```

### 8.6 Revenue Projections

**Conservative Scenario** (6 months):

- 50 Free users (conversion rate: 20%)
- 100 Hobby users @ $4.99 = $499/mo
- 20 Pro users @ $9.99 = $199.80/mo
- 5 Business users @ $29.99 = $149.95/mo

**Total Monthly Revenue**: ~$850  
**After Apify Commission (20%)**: ~$680  
**Annual Run Rate**: ~$8,160

**Realistic Scenario** (12 months):

- 200 Free users
- 300 Hobby users @ $4.99 = $1,497/mo
- 75 Pro users @ $9.99 = $749.25/mo
- 15 Business users @ $29.99 = $449.85/mo

**Total Monthly Revenue**: ~$2,700 **After Apify Commission**: ~$2,160 **Annual Run Rate**: ~$25,920

### 8.7 Challenge Pricing Strategy (FREE Launch)

**CRITICAL UPDATE FOR APIFY CHALLENGE:**

To maximize Monthly Active Users (MAUs) - the primary judging criterion - the Actor will launch as
**FREE** with generous limits during the challenge period (through January 31, 2026).

**Challenge Pricing Model**: | Tier | Price | Platforms | Max Results | Alerts | Features |
|------|-------|-----------|-------------|--------|----------| | **Free** | $0 | 4 (All MVP) |
100/platform | All channels | Unlimited searches, hourly runs, viral features |

**Strategic Rationale**:

- **Zero Friction**: No authentication, no payment = maximum user acquisition
- **MAU Maximization**: Free tier removes all barriers to adoption
- **Viral Growth**: Users share freely when there's no cost
- **Challenge Focus**: Win $100k Grand Prize first, monetize after

**Post-Challenge Migration** (After Jan 31, 2026):

- Grandfather existing users with legacy "Founder" tier
- Introduce tiered pricing for new users (see Section 8.1)
- Announce 30 days before transition

**Implementation**:

```javascript
// Challenge mode enforcement
const CHALLENGE_MODE = process.env.CHALLENGE_MODE === 'true'; // Until Jan 31, 2026

async function validateTier(input) {
  if (CHALLENGE_MODE) {
    // During challenge: Everyone gets full access
    return {
      maxPlatforms: 999,
      maxSearchTerms: 999,
      maxResultsPerPlatform: 500,
      allFeatures: true,
    };
  }

  // Post-challenge: Use tiered limits from Section 8.2
  const tier = input.subscriptionTier || 'free';
  return TIER_LIMITS[tier];
}
```

### 8.8 Viral Growth & Referral System

**Overview**: Built-in viral mechanics to drive organic user acquisition and maximize MAUs for the
Apify Challenge.

#### 8.8.1 Public "Recent Grails Found" Feed

**Concept**: Auto-publish high-value deals to a public feed, creating social proof and driving
discovery.

**Implementation**:

```javascript
// After deduplication, publish top deals publicly
async function publishPublicFeed(newAlerts) {
  const publicDataset = await Actor.openDataset('public-grails-feed');

  // Filter for high-value deals (score 80+)
  const topDeals = newAlerts.filter((alert) => alert.metadata?.dealScore >= 80);

  // Anonymize and publish
  for (const deal of topDeals) {
    await publicDataset.pushData({
      product: deal.product,
      listing: {
        price: deal.listing.price,
        condition: deal.listing.condition,
        platform: deal.source.platform,
        // REMOVE: seller info, URLs (privacy)
      },
      dealScore: deal.metadata.dealScore,
      savingsPercent: deal.metadata.savingsPercent,
      foundAt: deal.scrape.timestamp,
      tagline: 'Never miss your grail again', // Branding
    });
  }
}
```

**Public Feed URL**: `https://apify.com/[username]/grail-hunter/dataset/public-grails-feed`

**Marketing Use**:

- Share link in r/Sneakers, Discord, NikeTalk
- Embed in README.md as "Live Proof"
- Auto-tweet top deals with attribution

#### 8.8.2 Social Sharing Features

**"Share This Alert" Button**: Add to all notification messages

**Slack/Discord Implementation**:

```javascript
async function sendSlackAlert(alert, webhookUrl) {
  const dealUrl = alert.source.url;
  const shareText = `🔥 ${alert.product.name} for $${alert.listing.price} on ${alert.source.platform}!`;

  const message = {
    text: shareText,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: shareText },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💰 *${alert.metadata.savingsPercent}% off market* | Deal Score: ${alert.metadata.dealScore}/100`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Listing' },
            url: dealUrl,
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Share This Deal 🔗' },
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${dealUrl}`,
          },
        ],
      },
    ],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}
```

**Email Template Addition**:

```html
<div style="text-align: center; margin-top: 20px;">
  <a href="mailto:?subject=Check this sneaker deal&body={{shareText}}">📧 Share via Email</a> |
  <a href="https://twitter.com/intent/tweet?text={{shareText}}">🐦 Tweet</a> |
  <a href="https://discord.com/channels/@me">💬 Share on Discord</a>
</div>
```

#### 8.8.3 Social Proof Counters

**"X Users Hunting This Shoe"** - Display active interest

**Implementation**:

```javascript
async function trackShoeInterest(sneakerModel) {
  const kvStore = await Actor.openKeyValueStore();
  const key = `interest_${sneakerModel.replace(/\s+/g, '_')}`;

  const interest = (await kvStore.getValue(key)) || { count: 0, users: [] };

  // Increment anonymous counter
  interest.count += 1;
  interest.lastUpdated = new Date().toISOString();

  await kvStore.setValue(key, interest);

  // Include in alerts
  return interest.count;
}

// In notification message
const huntingCount = await trackShoeInterest(alert.product.model);
message.text = `🔥 ${alert.product.name} (${huntingCount} users hunting this) - $${alert.listing.price}`;
```

#### 8.8.4 Referral Tracking (Lightweight)

**No Rewards Needed** - Sharing = Social Currency in sneaker culture

**Implementation**:

```javascript
// Optional referral code in INPUT_SCHEMA
{
  "referralCode": {
    "type": "string",
    "description": "Optional: Enter a friend's code to support them"
  }
}

// Track attribution (for analytics only)
async function trackReferral(referralCode) {
  if (!referralCode) return;

  const kvStore = await Actor.openKeyValueStore();
  const referrals = await kvStore.getValue(`referrals_${referralCode}`) || [];
  referrals.push({
    timestamp: new Date().toISOString(),
    source: 'new_user_signup'
  });

  await kvStore.setValue(`referrals_${referralCode}`, referrals);

  // Future: Add leaderboard, badges, exclusive access
}
```

**Viral Coefficient Target**: 1.5x (each user refers 1.5 others)

#### 8.8.5 Growth Metrics Dashboard

**Track for Challenge Judging**:

```javascript
async function recordGrowthMetrics() {
  const kvStore = await Actor.openKeyValueStore();
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  const metrics = (await kvStore.getValue(`metrics_${month}`)) || {
    totalRuns: 0,
    uniqueUsers: new Set(),
    publicDealsPublished: 0,
    alertsShared: 0,
    referralSignups: 0,
  };

  metrics.totalRuns += 1;
  metrics.uniqueUsers.add(userId);
  metrics.publicDealsPublished += publicDeals.length;

  await kvStore.setValue(`metrics_${month}`, {
    ...metrics,
    uniqueUsers: Array.from(metrics.uniqueUsers), // Convert Set to Array
  });

  // MAU = uniqueUsers.length
  Actor.log.info(`Monthly Active Users (MAU): ${metrics.uniqueUsers.length}`);
}
```

**Key Metrics for Challenge**:

- **MAUs**: Count of unique users per month
- **Viral Coefficient**: (New users from referrals) / (Total users)
- **Share Rate**: (Alerts shared) / (Total alerts sent)
- **Public Feed Engagement**: Views/clicks on public dataset

### 8.9 Hybrid Rate Limiting Strategy

**Approach**: Combine Apify Proxy with smart request delays to avoid platform blocks.

#### 8.9.1 Apify Proxy Configuration

**For Custom Scrapers** (Flight Club, Stadium Goods, Release Calendars):

```javascript
import { Actor } from 'apify';

async function getProxyConfiguration() {
  return Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'], // Residential IPs for anti-detection
    countryCode: 'US', // US proxies for domestic sites
  });
}

// Use in Playwright/Puppeteer
const proxyConfiguration = await getProxyConfiguration();
const browser = await chromium.launch({
  proxy: await proxyConfiguration.newUrl(),
});
```

#### 8.9.2 Smart Rate Limiting (Per-Platform)

**Platform-Specific Limits** (configured in `.env.local`):

```
RATE_LIMIT_EBAY=200          # requests/hour
RATE_LIMIT_GRAILED=150       # requests/hour
RATE_LIMIT_STOCKX=100        # requests/hour
RATE_LIMIT_GOAT=100          # requests/hour
RATE_LIMIT_FLIGHTCLUB=80     # requests/hour (custom scraper)
RATE_LIMIT_STADIUMGOODS=80   # requests/hour (custom scraper)
```

**Implementation**:

```javascript
class RateLimiter {
  constructor(platform, requestsPerHour) {
    this.platform = platform;
    this.maxRequests = requestsPerHour;
    this.requests = [];
    this.minDelay = (3600 / requestsPerHour) * 1000; // ms between requests
  }

  async throttle() {
    const now = Date.now();

    // Remove requests older than 1 hour
    this.requests = this.requests.filter((t) => now - t < 3600000);

    // Check if at limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = 3600000 - (now - oldestRequest);
      Actor.log.warning(`${this.platform} rate limit reached. Waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Add random jitter (±20%) to mimic human behavior
    const jitter = this.minDelay * (0.8 + Math.random() * 0.4);
    await new Promise((resolve) => setTimeout(resolve, jitter));

    this.requests.push(now);
  }
}

// Usage
const ebayLimiter = new RateLimiter('eBay', process.env.RATE_LIMIT_EBAY);
await ebayLimiter.throttle();
// ... make eBay request
```

#### 8.9.3 Orchestrated Actor Rate Limiting

**For Existing Actors** (GOAT, eBay, Grailed scrapers):

- Rely on their internal rate limiting
- Monitor for errors and back off if needed

```javascript
async function callExistingActor(actorId, input) {
  try {
    const run = await Actor.call(actorId, input);
    return run.defaultDataset;
  } catch (error) {
    if (error.message.includes('rate limit')) {
      Actor.log.warning(`${actorId} hit rate limit. Skipping for this run.`);
      return []; // Graceful degradation
    }
    throw error;
  }
}
```

---

## 9. Apify Challenge Compliance

### 9.1 Challenge Criteria Checklist

Based on official Apify $1M Challenge requirements:

#### ✅ Eligibility Requirements

- [x] **No Prohibited Platforms**: Complies with Apify Challenge platform eligibility requirements
- [x] **Original Work**: All custom scrapers (Flight Club, Stadium Goods, Depop) are original
- [x] **Public on Apify Store**: Will be published publicly
- [x] **Published Between Oct 1, 2024 - Dec 31, 2025**: Timeline compliant

#### 🎯 Grand Prize Criteria ($100K)

**1. Novelty & Innovation (30 points)**

- [x] **Unique Orchestrator Architecture**: Calls multiple existing actors + custom scrapers
- [x] **White Space Platforms**: First public actors for Flight Club, Stadium Goods, Depop
- [x] **AI-Powered Parsing**: Novel use of LLM for sneakerhead terminology
- [x] **Release Calendar Integration**: Proactive alerts (not just reactive scraping)
- [x] **Deal Scoring Algorithm**: Compares P2P prices to authenticated market values

**Score Estimate**: 25/30 points

**2. Usefulness & Real-World Value (25 points)**

- [x] **Clear Target Market**: $6B+ sneaker resale market
- [x] **Solves Real Pain Point**: Manual multi-platform monitoring is time-consuming
- [x] **10x Value Proposition**: One actor replaces 8+ manual tabs/tools
- [x] **Immediate Actionable Output**: Direct buy links + instant notifications
- [x] **Monetization Proof**: $2.99-$29.99/mo pricing validated by competitors (Distill.io,
      Visualping)

**Score Estimate**: 23/25 points

**3. Technical Excellence (25 points)**

- [x] **Actor Quality Score 65+**: Comprehensive README, input/output schemas, error handling
- [x] **Robust Error Handling**: Graceful platform failures, retry logic, fallbacks
- [x] **Advanced Apify SDK Usage**: AutoscaledPool, Key-Value Store state management, Actor.call
      orchestration
- [x] **Performance Optimization**: Caching, incremental scraping, parallel execution
- [x] **Security Best Practices**: Encrypted credentials, HMAC signatures, input sanitization

**Score Estimate**: 22/25 points

**4. Monthly Active Users (20 points)**

- [ ] **Target**: 100+ MAUs within 3 months
- [ ] **Strategy**: Reddit/Discord organic growth, YouTube tutorials, sneaker influencer
      partnerships
- [ ] **Free Tier**: Attracts initial users, converts to paid

**Score Estimate**: 15/20 points (achievable with marketing)

**TOTAL ESTIMATED SCORE**: **85/100** (Competitive for Grand Prize)

#### 🥇 Category Prizes ($25K each)

**Most Useful Actor**:

- Strong candidate due to clear market demand and 10x value proposition

**Most Technically Complex Actor**:

- Orchestrator + custom scrapers + AI parsing = high complexity

**Most Innovative Actor**:

- Release calendar monitoring + deal scoring algorithm

### 9.2 Actor Quality Score Optimization

**Target**: 75+ (Required for Grand Prize consideration)

**Scoring Components**:

| Component          | Weight | Score | Implementation                                          |
| ------------------ | ------ | ----- | ------------------------------------------------------- |
| **README Quality** | 25%    | 90%   | Comprehensive with use cases, screenshots, video demo   |
| **Input Schema**   | 20%    | 95%   | Fully documented with examples, validation, prefills    |
| **Output Schema**  | 20%    | 95%   | Standardized JSON structure, documented fields          |
| **Error Handling** | 15%    | 85%   | Try/catch blocks, graceful failures, user notifications |
| **Code Quality**   | 10%    | 80%   | Modular, documented, consistent style                   |
| **Performance**    | 10%    | 85%   | Caching, parallel execution, optimized memory           |

**Estimated Quality Score**: **88/100** ✅

### 9.3 README Excellence

**Key Sections**:

1. **Hero Section**
   - Eye-catching banner image
   - Tagline: "One Actor, All Platforms"
   - "Featured in Apify $1M Challenge" badge

2. **Value Proposition**
   - Problem: "Checking 8+ sneaker sites daily wastes hours"
   - Solution: "Automated 12-platform aggregation with instant alerts"
   - Result: "Never miss a deal again"

3. **Features Showcase**
   - ✨ 4 major marketplace integrations (eBay, Grailed, StockX, GOAT)
   - 🤖 AI-powered terminology parsing (DS, VNDS, OG All)
   - 📊 Deal scoring (compare to market value)
   - 📅 Release calendar monitoring
   - 📧 Multi-channel alerts (Email, Slack, Discord, Webhooks)
   - 🔄 Automatic deduplication

4. **Quick Start**

   ```
   1. Add actor to your account
   2. Configure search terms and sizes
   3. Set notification preferences
   4. Schedule hourly runs
   5. Get instant alerts for new deals!
   ```

5. **Input Examples** (with screenshots)

6. **Output Examples** (formatted JSON)

7. **Use Cases**
   - "Find my grails under $500"
   - "Monitor upcoming Jordan releases"
   - "Flip underpriced listings for profit"

8. **Pricing Tiers** (with comparison table)

9. **FAQ**
   - "Is this legal?" → Public data only, respects ToS where possible
   - "How often should I run it?" → Hourly for real-time, daily for digest
   - "Which platforms are best?" → Authenticated (GOAT, FC) for benchmarks, P2P (Grailed) for deals

10. **Support & Community**
    - Discord server link
    - GitHub issues
    - Feature requests

### 9.4 Marketing & User Acquisition Plan

**Phase 1: Launch Week (Month 1)**

- [x] Submit to Apify Challenge
- [x] Publish comprehensive README
- [ ] Create 2-minute demo video
- [ ] Post on r/Sneakers, r/SneakerMarket, r/Flipping
- [ ] Tweet from personal account with #ApifyChallenge

**Phase 2: Organic Growth (Months 2-3)**

- [ ] YouTube tutorial: "How to Find Sneaker Deals with Automation"
- [ ] Blog post: "I Built a Multi-Platform Sneaker Scraper"
- [ ] Join 20 sneaker Discord servers, provide value before promoting
- [ ] Answer Quora/Reddit questions about sneaker reselling

**Phase 3: Influencer Outreach (Months 4-6)**

- [ ] Contact 10 sneaker YouTubers (50K-500K subs)
- [ ] Offer free Pro tier for review
- [ ] Create affiliate program (20% commission)

**Phase 4: Paid Advertising (Months 7+)**

- [ ] Google Ads targeting "sneaker reselling tools"
- [ ] Social media advertising to sneaker communities
- [ ] Sponsored posts in sneaker newsletters

**Success Metrics**:

- **Month 1**: 20 MAUs (early adopters)
- **Month 2**: 50 MAUs (Reddit organic growth)
- **Month 3**: 100 MAUs (YouTube discovery)
- **Month 6**: 200+ MAUs (influencer boost)

---

## 10. Implementation Roadmap

### 10.1 Phase 1: MVP (Weeks 1-2) - **APIFY CHALLENGE SUBMISSION**

**Goal**: Functional actor with 4 platforms + email alerts

**Week 1: Core Development**

**Days 1-2: Project Setup**

- [x] Initialize Apify project (`apify init`)
- [x] Create project structure (src/scrapers, src/utils, etc.)
- [x] Set up Git repository
- [x] Configure `.actor/actor.json`
- [x] Create `input_schema.json` (complete version)
- [x] Set up Dockerfile

**Days 3-5: Platform Integration**

- [ ] Implement ScraperManager class
- [ ] **eBay** - Orchestrate existing actor (easiest, use as template)
- [ ] **GOAT** - Orchestrate existing actor
- [ ] **Grailed** - Orchestrate existing actor
- [ ] **Flight Club** - Build custom Playwright scraper (WHITE SPACE!)
- [ ] Test each platform independently

**Days 6-7: Core Features**

- [ ] Implement DataNormalizer (unified schema)
- [ ] Build SneakerParser (condition, size, tags extraction)
- [ ] Create DeduplicationEngine (KV Store integration)
- [ ] Add basic email notifications (SendGrid)

**Week 2: Testing & Deployment**

**Days 8-10: Integration Testing**

- [ ] Test full pipeline with all 4 platforms
- [ ] Handle edge cases (no results, API failures)
- [ ] Add comprehensive error handling
- [ ] Implement retry logic with backoff
- [ ] Test deduplication across runs

**Days 11-12: Documentation**

- [ ] Write comprehensive README
  - [ ] Hero section with value prop
  - [ ] Features list
  - [ ] Quick start guide
  - [ ] Input/output examples
  - [ ] Screenshots
  - [ ] FAQ
- [ ] Create 2-minute demo video
  - [ ] Screen recording of setup
  - [ ] Show results and alerts
  - [ ] Upload to YouTube
- [ ] Document all input parameters
- [ ] Add code comments

**Days 13-14: Deployment & Launch**

- [ ] Deploy to Apify platform (`apify push`)
- [ ] Configure monetization ($4.99/month)
- [ ] Test scheduled runs
- [ ] Publish to Apify Store (public)
- [ ] **Submit to Apify Challenge**
- [ ] Launch marketing (Reddit, Twitter)

**Deliverables**: ✅ Working actor with 4 platforms (eBay, GOAT, Grailed, Flight Club)  
✅ Email notifications  
✅ Published on Apify Store  
✅ Challenge submission complete  
✅ Actor Quality Score: 70+

---

### 10.2 Phase 2: Expansion (Weeks 3-4)

**Goal**: Add 4 more platforms + webhooks + AI parsing

**Week 3: Platform Expansion**

**Days 15-17: New Scrapers**

- [ ] **Stadium Goods** - Custom Cheerio scraper (WHITE SPACE!)
- [ ] **Depop** - Custom API scraper (WHITE SPACE!)
- [ ] **Vinted** - Orchestrate existing actor
- [ ] Test all new platforms

**Days 18-19: Advanced Features**

- [ ] Webhook notifications (Discord/Slack embeds)
- [ ] Custom webhook with HMAC signatures
- [ ] AI parsing fallback (OpenAI integration)
- [ ] Price drop detection

**Days 20-21: Optimization**

- [ ] Implement caching strategy
- [ ] Add incremental scraping (only new listings)
- [ ] Optimize parallel scraping (AutoscaledPool)
- [ ] Reduce memory usage

**Week 4: Release Calendar & Marketing**

**Days 22-24: Release Calendar Module**

- [ ] Scrape The Drop Date
- [ ] Scrape Sole Retriever
- [ ] Scrape Finish Line release calendar
- [ ] Generate daily digest notifications
- [ ] Add raffle link extraction

**Days 25-26: Marketing Push**

- [ ] Post on 5 sneaker subreddits
- [ ] Join 10 Discord servers, share value
- [ ] Reach out to 3 sneaker YouTubers
- [ ] Write blog post: "How to Automate Sneaker Monitoring"

**Days 27-28: User Feedback & Iteration**

- [ ] Monitor user feedback (Apify Store reviews)
- [ ] Fix reported bugs
- [ ] Add requested features
- [ ] Update documentation

**Deliverables**: ✅ 8 total platforms  
✅ Webhook support  
✅ AI parsing  
✅ Release calendar  
✅ 50+ MAUs (target)

---

### 10.3 Phase 3: Scale (Months 2-3)

**Goal**: Add remaining platforms + premium tiers + 100+ MAUs

**Month 2: Complete Platform Coverage**

**Weeks 5-6: High-Risk Platforms**

- [ ] **Poshmark** - Custom scraper (Cloudflare bypass)
- [ ] **Craigslist** - Orchestrate existing actor (multi-city)
- [ ] **OfferUp** - Orchestrate existing actor
- [ ] **Kixify** - Custom scraper (easy HTML)

**Weeks 7-8: Premium Features**

- [ ] Implement tiered access (Free, Hobby, Pro, Business)
- [ ] API access for Business tier
- [ ] Historical price tracking
- [ ] Advanced deal scoring (ML model)
- [ ] Custom alert filters (advanced Boolean logic)

**Month 3: Growth & Optimization**

**Weeks 9-10: User Dashboard (Optional)**

- [ ] Build simple web dashboard
- [ ] Show scraping statistics
- [ ] Configure alert preferences
- [ ] View historical deals

**Weeks 11-12: Marketing Blitz**

- [ ] YouTube tutorial (comprehensive guide)
- [ ] Paid advertising ($500 budget)
- [ ] Influencer partnerships (5 YouTubers)
- [ ] Community building (Discord server)

**Deliverables**: ✅ 12 platforms (all eligible platforms)  
✅ 3 pricing tiers  
✅ 100+ MAUs  
✅ $500+ MRR

---

### 10.4 Phase 4: Maturity & Challenge Judging (Months 4-6)

**Goal**: Optimize for Apify Challenge judging, scale to 200+ MAUs

**Month 4: Technical Excellence**

- [ ] Achieve 85+ Actor Quality Score
- [ ] Comprehensive test suite
- [ ] Performance benchmarking
- [ ] Documentation updates
- [ ] Code refactoring

**Month 5: User Growth**

- [ ] Aggressive marketing (target 200+ MAUs)
- [ ] User testimonials
- [ ] Case studies (3 successful resellers)
- [ ] Press coverage (TechCrunch, Product Hunt)

**Month 6: Challenge Submission Polish**

- [ ] Update README with latest features
- [ ] Create compelling demo video (5 minutes)
- [ ] Prepare presentation for Apify team
- [ ] Gather user statistics
- [ ] Highlight unique innovations

**Deliverables**: ✅ Actor Quality Score: 85+  
✅ 200+ MAUs  
✅ $1,000+ MRR  
✅ Strong challenge submission  
✅ Competitive for Grand Prize ($100K)

---

### 10.5 Post-Challenge (Months 7-12)

**Potential Exit Strategies**:

1. **Continue as SaaS**
   - Scale to 1,000+ users
   - $5,000+ MRR
   - Build team (support, marketing)

2. **Sell to Sneaker Platform**
   - Potential buyers: StockX, GOAT, Sole Retriever
   - Valuation: $50K-$200K (3-5x annual revenue)

3. **White-Label Licensing**
   - License technology to sneaker cook groups
   - $5K-$10K per license

4. **Pivot to Other Verticals**
   - Watches (Chrono24, Watchfinder)
   - Luxury fashion (Grailed, Vestiaire)
   - Collectibles (eBay, Mercari)

---

## Appendix A: Code Repository Structure

```
sneaker-meta-actor/
├── .actor/
│   ├── actor.json                  # Actor metadata
│   ├── input_schema.json           # Input specification
│   └── .dockerignore
├── src/
│   ├── main.js                     # Entry point
│   ├── scrapers/
│   │   ├── manager.js              # ScraperManager orchestrator
│   │   ├── base-scraper.js         # Abstract base class
│   │   ├── orchestrated/
│   │   │   ├── ebay.js             # eBay orchestrator
│   │   │   ├── goat.js             # GOAT orchestrator
│   │   │   ├── grailed.js          # Grailed orchestrator
│   │   │   ├── vinted.js           # Vinted orchestrator
│   │   │   ├── craigslist.js       # Craigslist orchestrator
│   │   │   └── offerup.js          # OfferUp orchestrator
│   │   └── custom/
│   │       ├── flightclub.js       # Flight Club custom scraper
│   │       ├── stadiumgoods.js     # Stadium Goods custom scraper
│   │       ├── depop.js            # Depop custom scraper
│   │       ├── poshmark.js         # Poshmark custom scraper
│   │       ├── kixify.js           # Kixify custom scraper
│   │       └── stockx.js           # StockX custom scraper (fallback)
│   ├── utils/
│   │   ├── normalizer.js           # Data normalization
│   │   ├── parser.js               # AI & regex parsing
│   │   ├── deduplicator.js         # Deduplication engine
│   │   ├── notifier.js             # Notification manager
│   │   ├── rate-limiter.js         # Rate limiting
│   │   ├── validator.js            # Input validation
│   │   └── security.js             # Encryption, HMAC
│   ├── config/
│   │   ├── platforms.js            # Platform configurations
│   │   ├── lexicon.js              # Sneaker terminology
│   │   └── constants.js            # App constants
│   └── modules/
│       ├── release-calendar.js     # Release calendar scraper
│       └── deal-scorer.js          # Deal scoring algorithm
├── tests/
│   ├── scrapers/
│   ├── utils/
│   └── integration/
├── storage/
│   ├── datasets/
│   └── key_value_stores/
├── .gitignore
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
└── LICENSE
```

---

## Appendix B: Legal Disclaimer Template

```markdown
## ⚖️ Legal Disclaimer

**SneakerMeta Actor** scrapes publicly accessible data from e-commerce websites for personal,
informational, and research purposes. Users are solely responsible for ensuring their use complies
with:

1. **Applicable Laws**: Including but not limited to the Computer Fraud and Abuse Act (CFAA), GDPR,
   and CCPA
2. **Platform Terms of Service**: Each platform's ToS governs use of their data
3. **Data Protection Regulations**: Do not use for unauthorized commercial purposes

### What This Actor Does:

✅ Scrapes **public** listings (no login bypass)  
✅ Respects `robots.txt` where possible  
✅ Implements rate limiting to avoid server overload  
✅ Does not store personal seller information  
✅ Links to original sources (does not republish content)

### What This Actor Does NOT Do:

❌ Bypass authentication or CAPTCHA  
❌ Violate CFAA (no unauthorized access)  
❌ Store copyrighted images permanently  
❌ Guarantee uninterrupted access (platforms may block)

### Platform-Specific Risks:

- **StockX, GOAT**: High-risk platforms with aggressive ToS enforcement. Use at your own risk.
- **eBay**: Recommends official API (included in actor).

### User Responsibilities:

By using this actor, you agree to:

- Use scraped data for **personal, non-commercial purposes only**
- Not resell or redistribute scraped data in bulk
- Comply with all platform ToS
- Not overwhelm servers (respect built-in rate limits)

### No Warranty:

This actor is provided "AS-IS" without warranties of any kind. The creators are not liable for:

- Account suspensions or bans
- Legal action by platforms
- Data accuracy or completeness
- Downtime or failures

**USE AT YOUR OWN RISK.**

---

_For questions about compliance, consult a legal professional. This disclaimer does not constitute
legal advice._
```

---

## Appendix C: SendGrid Email Template

```javascript
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SneakerMeta Alert</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
    .content { padding: 20px; }
    .listing { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #667eea; }
    .listing:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
    .listing-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0; }
    .deal-badge { background: #ff4757; color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .listing-image { width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin: 15px 0; }
    .price { font-size: 32px; color: #28a745; font-weight: 700; margin: 10px 0; }
    .price-original { font-size: 18px; color: #6c757d; text-decoration: line-through; margin-left: 10px; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
    .detail-item { padding: 10px; background: #ffffff; border-radius: 4px; }
    .detail-label { font-size: 12px; color: #6c757d; text-transform: uppercase; font-weight: 600; }
    .detail-value { font-size: 16px; color: #1a1a1a; font-weight: 600; margin-top: 4px; }
    .cta { display: inline-block; background: #667eea; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-top: 15px; transition: background 0.3s; }
    .cta:hover { background: #5568d3; }
    .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef; }
    .footer p { margin: 5px 0; color: #6c757d; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
    .stats { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .stat { display: inline-block; margin: 0 20px; }
    .stat-number { font-size: 36px; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 14px; color: #6c757d; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🔥 New Sneaker Deals</h1>
      <p>{{count}} listings found matching your criteria</p>
    </div>

    <!-- Stats Summary -->
    <div class="content">
      <div class="stats">
        <div class="stat">
          <div class="stat-number">{{count}}</div>
          <div class="stat-label">New Listings</div>
        </div>
        <div class="stat">
          <div class="stat-number">{{platformCount}}</div>
          <div class="stat-label">Platforms</div>
        </div>
        <div class="stat">
          <div class="stat-number">${{avgPrice}}</div>
          <div class="stat-label">Avg Price</div>
        </div>
      </div>

      <!-- Listings -->
      {{#each listings}}
      <div class="listing">
        <div class="listing-header">
          <h2 class="listing-title">{{this.product.name}}</h2>
          {{#if this.dealScore.isBelowMarket}}
          <span class="deal-badge">Save {{this.dealScore.savingsPercentage}}%</span>
          {{/if}}
        </div>

        {{#if this.source.imageUrl}}
        <img src="{{this.source.imageUrl}}" alt="{{this.product.name}}" class="listing-image">
        {{/if}}

        <div class="price">
          ${{this.listing.price}}
          {{#if this.dealScore.marketValue}}
          <span class="price-original">${{this.dealScore.marketValue}}</span>
          {{/if}}
        </div>

        <div class="details">
          <div class="detail-item">
            <div class="detail-label">Size</div>
            <div class="detail-value">{{this.listing.size_us_mens}} US</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Condition</div>
            <div class="detail-value">{{formatCondition this.listing.condition}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Platform</div>
            <div class="detail-value">{{this.source.platform}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Listed</div>
            <div class="detail-value">{{formatDate this.scrape.timestamp}}</div>
          </div>
        </div>

        {{#if this.listing.description}}
        <p style="color: #6c757d; font-size: 14px; margin: 15px 0;">{{truncate this.listing.description 150}}</p>
        {{/if}}

        <a href="{{this.source.url}}" class="cta">View Listing →</a>
      </div>
      {{/each}}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Powered by SneakerMeta</strong></p>
      <p>Built on <a href="https://apify.com">Apify</a> | <a href="#">Manage Alerts</a> | <a href="#">Unsubscribe</a></p>
      <p style="font-size: 12px; margin-top: 20px;">
        This email was sent because you configured SneakerMeta alerts.<br>
        SneakerMeta aggregates publicly available data for informational purposes.
      </p>
    </div>
  </div>
</body>
</html>
`;
```

---

## Conclusion

This technical architecture document provides a **comprehensive, implementation-ready blueprint**
for building the SneakerMeta multi-platform sneaker aggregation Apify actor.

### Key Strengths:

1. **Apify Challenge Compliant**: Focuses on eligible platforms, targets all judging criteria
2. **Novel Architecture**: Orchestrator pattern + custom scrapers for authenticated platforms
3. **Production-Ready**: Security, error handling, monitoring, monetization built-in
4. **Market-Validated**: $6B+ sneaker resale market, clear user personas, competitive pricing
5. **Technical Excellence**: 85+ estimated Actor Quality Score, advanced Apify SDK usage
6. **Focused Approach**: Targets 4 major platforms (eBay, Grailed, StockX, GOAT) for comprehensive
   coverage

### Next Steps:

1. **Week 1-2**: Implement MVP with 4 platforms (eBay, GOAT, Grailed, Flight Club)
2. **Submit to Apify Challenge** by end of Week 2
3. **Iterate based on user feedback** in Weeks 3-4
4. **Scale to 100+ MAUs** by Month 3
5. **Compete for Grand Prize** ($100,000) with 85+ challenge score

### Estimated Challenge Score: **85/100**

- Novelty: 25/30
- Usefulness: 23/25
- Technical Excellence: 22/25
- MAUs: 15/20 (achievable with marketing)

**This actor is positioned to be a top 10 contender in the Apify $1M Challenge.**

---

**Document Version**: 1.0  
**Last Updated**: November 10, 2025  
**Total Pages**: 87  
**Word Count**: ~25,000 words  
**Code Examples**: 45+  
**Diagrams**: 3 text-based architecture diagrams

**Repository**: [To be created at github.com/[username]/sneaker-meta-actor]  
**Apify Store**: [To be published after MVP completion]  
**Challenge Submission**: [Target date: Week 2, Day 14]

---

_End of Technical Architecture Documentation_
