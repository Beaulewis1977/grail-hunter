# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grail Hunter** (SneakerMeta) is an Apify Actor that monitors sneaker listings across 4 major marketplaces (eBay, Grailed, StockX, GOAT) and sends real-time alerts when target sneakers appear. This is an Apify Challenge 2024-2025 submission project.

**Status:** Pre-implementation phase - comprehensive planning and architecture documentation complete, no source code yet.

## Essential Documents (READ FIRST)

Before implementing any feature, read these in order:

1. **sneakers-gemini-1.md** - Strategic direction and eligibility corrections
   - Facebook/Instagram are DISQUALIFIED platforms - never implement
   - Defines "Orchestrator" architecture (calls existing Actors + builds custom scrapers)
   - Focus on 4 core platforms for MVP: StockX, GOAT, eBay, Grailed

2. **technical_architecture.md** - Complete system design (115KB)
   - Actor input/output schemas
   - Orchestration logic and data normalization
   - Platform-specific scraping strategies
   - Multi-channel alert system

3. **component_specifications_complete.md** - Implementation specifications (178KB)
   - Detailed component specs for all modules
   - Scraper implementations for each platform
   - Testing specifications and acceptance criteria

4. **apify_challenge_rules.md** - Compliance requirements
   - Quality score target: 65+ (aim for 75+)
   - Prohibited platforms list
   - Judging criteria and deadlines (Jan 31, 2026)

## Development Commands

```bash
# Setup
npm install                    # Install dependencies + initialize Husky hooks

# Code Quality
npm run lint                   # Check linting (ESLint + Prettier + markdownlint)
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format code with Prettier

# Testing (not configured yet)
npm run test                   # Placeholder - will run tests when implemented

# Git Hooks (automatic)
git commit                     # Triggers pre-commit (lint-staged) + commit-msg (commitlint)
```

## Git Workflow

- **Default branch:** `develop` (all feature branches branch from here)
- **Protected branch:** `main` (releases only)
- **Commit format:** Conventional Commits (`type(scope): subject`)
  - Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`
  - Examples: `feat(scraper): add stockx platform support`, `fix(notifications): resolve email delivery`

**Pre-commit hooks will:**
- Lint staged files (ESLint, markdownlint, Prettier)
- Validate commit message format
- Block commits that fail validation

## Architecture Overview

### SneakerMeta Orchestrator Model

The actor is designed as an **orchestrator** that:
1. Calls existing Apify Actors for platforms with available scrapers
2. Builds custom scrapers for "white space" platforms (Flight Club, Stadium Goods)
3. Normalizes all data to a unified schema
4. Deduplicates listings using Apify Key-Value Store
5. Parses sneakerhead terminology (DS, VNDS, OG All) with AI/regex
6. Sends multi-channel alerts (email, Slack, Discord, webhooks)

### Core Components (To Be Implemented)

```
src/
├── main.js                    # Orchestrator entry point
├── orchestrator/
│   ├── platform-router.js     # Routes to Actor calls vs custom scrapers
│   └── data-aggregator.js     # Collects results from all sources
├── scrapers/
│   ├── ebay.js                # Calls existing Actor: getdataforme/ebay-scraper
│   ├── grailed.js             # Calls existing Actor: vmscrapers/grailed
│   ├── stockx.js              # Calls existing Actor: [TBD]
│   ├── goat.js                # Calls existing Actor: ecomscrape/goat-product-search-scraper
│   └── custom/                # Custom implementations for white space platforms
├── parsers/
│   ├── terminology-parser.js  # Regex + AI parsing for DS, VNDS, sizes, conditions
│   └── normalizer.js          # Maps platform-specific data to unified schema
├── deduplication/
│   └── listing-tracker.js     # KV Store-based deduplication engine
├── notifications/
│   ├── email.js               # Apify send-email integration
│   └── webhook.js             # Slack/Discord webhook sender
└── utils/
    ├── proxy-manager.js       # Apify proxy configuration
    └── error-handler.js       # Graceful degradation for platform failures
```

### Data Flow

```
User Input → Orchestrator → Platform Router
                ↓
    ┌───────────┴───────────┐
    ↓                       ↓
Existing Actors      Custom Scrapers
(eBay, Grailed,      (Flight Club,
 StockX, GOAT)       Stadium Goods)
    ↓                       ↓
    └───────────┬───────────┘
                ↓
         Data Aggregator → Normalizer → Parser
                ↓
         Deduplication Engine (KV Store)
                ↓
         New Listings Filter
                ↓
         Multi-Channel Alerts → Dataset Output
```

## Critical Implementation Rules

### Apify Challenge Compliance

1. **NEVER scrape Facebook or Instagram** - explicitly disqualified per challenge rules
2. **Target Quality Score 65+** (aim for 75+):
   - Define INPUT_SCHEMA.json with validation
   - Define OUTPUT_SCHEMA.json with standardized fields
   - Implement comprehensive error handling
   - Use Apify Proxy for all requests
   - Write detailed README with examples

3. **Deadline:** January 31, 2026

### Platform Integration Strategy

| Platform | Integration Method | Priority |
|----------|-------------------|----------|
| eBay | Call `getdataforme/ebay-scraper` | MVP |
| Grailed | Call `vmscrapers/grailed` | MVP |
| StockX | Call existing Actor | MVP |
| GOAT | Call `ecomscrape/goat-product-search-scraper` | MVP |
| Flight Club | Build custom scraper | Phase 2 |
| Stadium Goods | Build custom scraper | Phase 2 |

### Sneakerhead Terminology Parsing

Must parse these terms from unstructured titles/descriptions:

| Term | Meaning | Maps To |
|------|---------|---------|
| DS / BNIB | Deadstock / Brand New In Box | `condition: "new_in_box"` |
| VNDS | Very Near Deadstock | `condition: "used_like_new"` |
| NDS | Near Deadstock | `condition: "used_good"` |
| OG All | Original box/laces included | `tags: ["og_all"]` |
| Bred | Black/Red colorway | `colorway: "Bred"` |

Regex patterns defined in technical_architecture.md Table 1.

### Standardized Output Schema

Every listing must conform to this structure:

```json
{
  "product": {
    "name": "Air Jordan 1 Retro High OG 'Bred' (2016)",
    "brand": "Air Jordan",
    "model": "Air Jordan 1",
    "colorway": "Bred",
    "sku": "555088-001"
  },
  "listing": {
    "price": 1200,
    "size_us_mens": "10.5",
    "condition": "new_in_box",
    "tags": ["og_all"],
    "type": "sell"
  },
  "source": {
    "platform": "Grailed",
    "url": "https://grailed.com/listings/...",
    "id": "12345678",
    "is_authenticated": false
  },
  "seller": {
    "name": "sneakerhead123",
    "rating": 4.9
  },
  "scrape": {
    "timestamp": "2026-01-15T14:30:00Z"
  }
}
```

## Implementation Priorities

### MVP (Must Have - Phase 1)

1. INPUT_SCHEMA.json with search terms, sizes, price filters
2. Orchestrator main loop calling 4 existing Actors
3. Data normalization to unified schema
4. Basic deduplication (KV Store with MD5 hash)
5. Email notifications (Apify send-email)
6. OUTPUT_SCHEMA.json definition

### Phase 2 (Should Have)

1. Regex-based terminology parsing
2. Slack/Discord webhook notifications
3. Custom scrapers for Flight Club, Stadium Goods
4. Price drop alerts

### Phase 3 (Nice to Have)

1. AI-powered parsing fallback (OpenAI API)
2. Release calendar monitoring
3. Deal scoring (compare P2P vs authenticated prices)

## Error Handling Philosophy

**Principle:** Graceful degradation - if one platform fails, continue with others.

```javascript
// Good: Per-platform try-catch
for (const platform of targetPlatforms) {
  try {
    const listings = await scrapePlatform(platform);
    allListings.push(...listings);
  } catch (error) {
    console.warn(`Platform ${platform} failed: ${error.message}`);
    // Continue to next platform
  }
}

// Bad: Fail entire run on single error
const listings = await scrapePlatform(platform); // Throws, kills run
```

## Performance Targets

- Complete run in <5 minutes for 50 listings/platform
- Support up to 500 results per platform
- Memory: <4GB RAM
- Timeout: 1 hour max execution time

## Testing Strategy

When implementing tests:

1. **Unit tests** for parsers and normalizers (high priority)
2. **Integration tests** for Actor calls (medium priority)
3. **End-to-end tests** with sample data (low priority)

Use mock data from documentation examples to avoid live scraping during tests.

## Resources

- **Apify SDK Docs:** https://docs.apify.com/sdk/js
- **Crawlee Docs:** https://crawlee.dev/
- **Challenge Rules:** See apify_challenge_rules.md
- **Platform Research:** See existing_apify_actors_analysis.md
- **Market Research:** See sneaker_market_research.md

## Questions Before Starting

1. Verify `CODERABBIT_TOKEN` is set in GitHub Secrets for AI review
2. Confirm Apify account has access to residential proxies
3. Check if OpenAI API key is needed for AI parsing (optional feature)
4. Verify target platforms' current scraping Actor availability on Apify Store
