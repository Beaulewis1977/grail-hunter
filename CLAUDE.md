# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grail Hunter** (SneakerMeta) is an Apify Actor that monitors sneaker listings across 4 major marketplaces (eBay, Grailed, StockX, GOAT) and sends real-time alerts when target sneakers appear. This is an Apify Challenge 2024-2025 submission project.

**Status:** Scaffolding complete. Ready for agent implementation. Project structure, schemas, configs, and dependencies are set up.

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
npm install              # Setup (already done)
npm start                # Run actor
npm dev                  # Watch mode
npm lint                 # Check linting
npm lint:fix             # Auto-fix issues
npm test                 # Run Jest tests with coverage
npm build                # Build with Apify CLI
npm push                 # Push to Apify
npm pull                 # Pull from Apify
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

### Project Structure (Scaffolded)

```
.actor/
├── actor.json                 # ✅ Apify metadata (4GB, 1hr timeout)
├── INPUT_SCHEMA.json          # ✅ User input spec (search, sizes, platforms, notifications)
└── OUTPUT_SCHEMA.json         # ✅ Standardized listing schema

src/
├── index.js                   # ✅ Actor entry point (scaffolded)
├── orchestrator/              # TODO: Platform router & data aggregator
├── scrapers/                  # TODO: Call existing Actors + custom scrapers
├── parsers/                   # TODO: Terminology parser & normalizer
├── deduplication/             # TODO: KV Store listing tracker
├── notifications/             # TODO: Email/Slack/Discord alerts
└── utils/
    └── logger.js              # ✅ Pino logging

tests/                         # TODO: Jest test suite
Dockerfile                     # ✅ Container config
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

### Phase 1 (MVP) - Core Orchestrator
1. Orchestrator main loop (call existing Actors for eBay, Grailed, StockX, GOAT)
2. Data normalization to unified schema
3. KV Store-based deduplication (MD5 hash)
4. Multi-channel notifications (Email, Slack, Discord with "Share This Deal" buttons)
5. Public "Recent Grails Found" feed (publish high-value deals anonymously)

### Phase 2 - Viral Growth & Intelligence
1. Regex-based terminology parser (DS, VNDS, OG All, sizes)
2. Social proof counters ("X users hunting this shoe")
3. Referral tracking (lightweight, no rewards)
4. Custom scrapers for Flight Club & Stadium Goods
5. Price drop detection

### Phase 3 - Polish & Scale
1. AI fallback parsing (OpenAI)
2. Growth metrics dashboard (MAU tracking)
3. Release calendar monitoring
4. Deal scoring algorithm (P2P vs authenticated price comparison)

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

## Key Files to Know

- **src/index.js** - Actor entry point (basic scaffold, add orchestrator here)
- **.actor/INPUT_SCHEMA.json** - User input validation (includes viral features!)
- **.actor/OUTPUT_SCHEMA.json** - Listing schema (complete, don't modify)
- **.env.local** - Config (Apify token set, CHALLENGE_MODE=true)
- **technical_architecture.md** - Reference for implementation (see sections 8.7-8.9)
- **sneakers-gemini-1.md** - Strategic rules (Facebook/Instagram forbidden, viral growth strategy)

## Critical Strategic Updates

**FREE Launch Strategy:**
- CHALLENGE_MODE=true in .env.local (until Jan 31, 2026)
- No tier validation during challenge (everyone gets full access)
- No authentication required (zero friction)
- Goal: Maximize MAUs for challenge judging

**Viral Growth Features:**
- Public "Recent Grails Found" feed (auto-publish deals with score 80+)
- "Share This Deal" buttons in all notifications
- Social proof counters ("X users hunting this shoe")
- Optional referral tracking (no rewards, just kudos)

**Storage Strategy:**
- Dataset: User results
- KV Store: Deduplication memory
- Public Dataset: `public-grails-feed` for viral marketing

**Rate Limiting:**
- Apify Proxy for custom scrapers (residential IPs)
- Per-platform limits in .env.local
- Smart delays with jitter (mimic human behavior)

## Dependencies Ready

**Production:** apify, crawlee, axios, dotenv, pino (logging)
**Dev:** Jest (testing), ESLint, Prettier, Husky (pre-commit hooks)

## Environment

- Node.js 22, Apify CLI installed
- Apify account with challenge registered
- .env.local populated with API tokens + CHALLENGE_MODE=true
- Pre-commit hooks active (auto-lint on commit)
