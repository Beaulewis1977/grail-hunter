# SneakerMeta: Agile Project Management & Breakdown

## Multi-Platform Sneaker Alert & Aggregation Actor

**Version:** 1.0  
**Date:** November 10, 2025  
**Project Type:** Apify Actor Challenge Submission  
**Target Audience:** Sneaker collectors, resellers, and enthusiasts  
**Business Model:** $2.99-$9.99/month subscription  
**Estimated Timeline:** 12 weeks (3 months)  
**Team Size:** 1-2 developers

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Phases](#2-project-phases)
3. [Epics](#3-epics)
4. [User Stories](#4-user-stories)
5. [Sprint Planning](#5-sprint-planning)
6. [Definition of Done](#6-definition-of-done)
7. [Risk Assessment](#7-risk-assessment)
8. [Success Metrics](#8-success-metrics)

---

## 1. Project Overview

### 1.1 Executive Summary

**SneakerMeta** is a sophisticated Apify actor that aggregates collectible sneaker listings from 12+
marketplaces and delivers real-time alerts when matching items appear. The project follows an Agile
Scrum methodology with 2-week sprints, focusing on iterative delivery and continuous user feedback.

**Core Value Proposition:** _"One Actor, All Platforms. Stop opening 8 tabs—get deduplicated,
real-time sneaker deals in your size delivered instantly."_

### 1.2 Project Timeline & Milestones

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PROJECT TIMELINE (12 WEEKS)                        │
└─────────────────────────────────────────────────────────────────────────┘

PHASE 1: Foundation & MVP (Weeks 1-4) ────────────────────────────►
│ Sprint 1 (W1-2)              │ Sprint 2 (W3-4)                    │
│ Core architecture            │ MVP with 3 platforms               │
│ Orchestration setup          │ Basic notifications                │
│ First platform integration   │ Testing & documentation            │
└──────────────────────────────┴────────────────────────────────────┘
           │
           ▼ MILESTONE 1: MVP Launch & Apify Challenge Submission

PHASE 2: Platform Expansion (Weeks 5-6) ────────────────►
│ Sprint 3 (W5-6)                                        │
│ Add 3 more platforms                                   │
│ Webhook support                                        │
│ Advanced filtering                                     │
└────────────────────────────────────────────────────────┘
           │
           ▼ MILESTONE 2: 6-Platform Release

PHASE 3: Advanced Features (Weeks 7-10) ──────────────────────────────►
│ Sprint 4 (W7-8)              │ Sprint 5 (W9-10)                    │
│ AI/Regex parsing engine      │ Release calendar monitoring         │
│ Deduplication system         │ Price tracking & alerts             │
│ Deal scoring algorithm       │ Premium tier features               │
└──────────────────────────────┴─────────────────────────────────────┘
           │
           ▼ MILESTONE 3: Feature Complete

PHASE 4: Polish & Launch (Weeks 11-12) ────────────►
│ Sprint 6 (W11-12)                                 │
│ Final testing & optimization                      │
│ Documentation & video tutorials                   │
│ Marketing & user acquisition                      │
│ Challenge refinements                             │
└───────────────────────────────────────────────────┘
           │
           ▼ MILESTONE 4: Public Launch & Marketing Push
```

**Key Milestones:**

| Milestone                | Week    | Deliverable                                                              | Success Criteria                                                        |
| ------------------------ | ------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **M1: MVP Launch**       | Week 4  | Working actor with 3 platforms, email alerts, Apify Challenge submission | Successfully scrapes 3 platforms, sends email alerts, 65+ quality score |
| **M2: Expansion**        | Week 6  | 6 platforms total, webhook support                                       | All 6 platforms working, webhook integration complete                   |
| **M3: Feature Complete** | Week 10 | All 12 platforms, AI parsing, release calendar, deduplication            | All core features implemented and tested                                |
| **M4: Public Launch**    | Week 12 | Full documentation, marketing materials, 50+ users                       | Actor live on Apify Store, first paying users acquired                  |

### 1.3 Team Structure

**Solo Developer Setup (Recommended for MVP):**

- **Role:** Full-stack developer + Product owner
- **Time Commitment:** 20-30 hours/week
- **Skills Required:** Node.js, web scraping, Apify SDK, Agile methodology

**Team Setup (If available):**

| Role                 | Responsibilities                                     | Time Allocation |
| -------------------- | ---------------------------------------------------- | --------------- |
| **Lead Developer**   | Architecture, orchestration module, complex scrapers | 60%             |
| **Junior Developer** | Simple scrapers, testing, documentation              | 30%             |
| **Product Owner**    | Backlog management, user feedback, marketing         | 10%             |

**External Support:**

- **Legal Consultant:** Review ToS risks (Week 2, 1-2 hours)
- **Beta Testers:** Sneakerhead community (Weeks 5-12, ongoing)
- **Marketing Partner:** Social media promotion (Weeks 11-12)

### 1.4 Development Methodology

**Agile Scrum Framework:**

**Sprint Duration:** 2 weeks (12 working days)

**Sprint Ceremonies:**

1. **Sprint Planning** (Monday, Week start)
   - Duration: 2 hours
   - Select stories from backlog
   - Assign story points
   - Define sprint goal

2. **Daily Standup** (Every working day)
   - Duration: 15 minutes (solo: 5-minute self-reflection)
   - What did I complete yesterday?
   - What will I work on today?
   - Any blockers?

3. **Sprint Review** (Friday, Week 2)
   - Duration: 1 hour
   - Demo completed features
   - Gather feedback (from beta testers/community)
   - Update product backlog

4. **Sprint Retrospective** (Friday, Week 2)
   - Duration: 1 hour
   - What went well?
   - What could be improved?
   - Action items for next sprint

**Velocity Tracking:**

- **Target Velocity:** 30-40 story points per 2-week sprint (solo developer)
- **Initial Velocity:** 20-25 points (Sprint 1, learning curve)
- **Mature Velocity:** 35-45 points (Sprints 3-6, optimized workflow)

**Tools:**

- **Project Management:** Jira, Trello, or GitHub Projects
- **Version Control:** GitHub (public repo for Apify Challenge)
- **Communication:** Slack channel for beta testers
- **Documentation:** Notion or Confluence

---

## 2. Project Phases

### Phase 1: Foundation & MVP (Weeks 1-4)

**Goal:** Deliver a working MVP with core functionality and submit to Apify Challenge

**Objectives:**

1. ✅ Build core orchestration architecture
2. ✅ Integrate 3 platforms (eBay API, Grailed, Kixify)
3. ✅ Implement basic email notifications
4. ✅ Achieve 65+ Apify Actor Quality Score
5. ✅ Submit to Apify Challenge

**Deliverables:**

- Working Apify actor deployed to store
- Standardized data schema
- Email alert system
- Comprehensive README with video demo
- Apify Challenge submission

**Success Criteria:**

- [ ] All 3 platforms scrape successfully (95%+ success rate)
- [ ] Email alerts delivered within 10 minutes
- [ ] Actor Quality Score ≥ 65
- [ ] Zero critical bugs in production
- [ ] Positive feedback from 5+ beta testers

**Key Risks:**

- ⚠️ eBay API approval delays (Mitigation: Apply early, have backup HTML scraping)
- ⚠️ Email deliverability issues (Mitigation: Use SendGrid with verified domain)
- ⚠️ Quality score below 65 (Mitigation: Follow Apify best practices checklist)

---

### Phase 2: Platform Expansion (Weeks 5-6)

**Goal:** Expand to 6 platforms and add webhook support for power users

**Objectives:**

1. ✅ Add 3 more platforms (Poshmark, Depop, Craigslist)
2. ✅ Implement webhook notifications
3. ✅ Add advanced filtering (size, condition, price ranges)
4. ✅ Improve performance with caching

**Deliverables:**

- 6 platforms total operational
- Webhook integration with Zapier/Discord/Slack
- Advanced filter UI in input schema
- Performance optimization (3-5 min total scrape time)

**Success Criteria:**

- [ ] All 6 platforms maintain 90%+ success rate
- [ ] Webhooks deliver within 5 minutes of new listing
- [ ] Scraping time reduced by 30% vs. MVP
- [ ] 50+ active users (target)

**Key Risks:**

- ⚠️ Platform anti-scraping measures (Mitigation: Residential proxies, rate limiting)
- ⚠️ Craigslist multi-city complexity (Mitigation: User provides specific URLs)

---

### Phase 3: Advanced Features (Weeks 7-10)

**Goal:** Build intelligent features that differentiate SneakerMeta from competitors

**Objectives:**

1. ✅ AI & Regex parsing engine (extract condition, size, colorway from text)
2. ✅ Deduplication system (prevent alert spam)
3. ✅ Release calendar monitoring (upcoming drops)
4. ✅ Deal scoring algorithm (compare P2P vs. authenticated platform prices)
5. ✅ Price tracking (historical data, price drop alerts)

**Deliverables:**

- AI parsing module (OpenAI integration)
- Deduplication engine with Key-Value Store
- Release calendar scraper (The Drop Date, Sole Retriever)
- Deal scoring system (% below market value)
- Price history tracking

**Success Criteria:**

- [ ] AI parsing accuracy ≥ 85% on unstructured listings
- [ ] Deduplication reduces alerts by 70-80%
- [ ] Release calendar finds 95%+ of major drops
- [ ] Deal scoring identifies 20+ true deals per week
- [ ] User retention improves to 70%+

**Key Risks:**

- ⚠️ OpenAI API costs (Mitigation: Only use for ambiguous listings, cache results)
- ⚠️ Calendar site changes (Mitigation: Monitor 3 sources, fallback logic)

---

### Phase 4: Polish & Launch (Weeks 11-12)

**Goal:** Finalize product, launch marketing, and achieve first revenue

**Objectives:**

1. ✅ Complete all 12 platforms (add Mercari, OfferUp, Vinted)
2. ✅ Comprehensive testing (end-to-end, integration, load)
3. ✅ Professional documentation (README, video tutorials, API docs)
4. ✅ Marketing campaign (Reddit, Discord, YouTube)
5. ✅ Monetization setup (tiered pricing)

**Deliverables:**

- All 12 platforms operational
- Test suite with 80%+ code coverage
- 5-minute demo video + 3 tutorial videos
- Marketing materials (landing page, social media posts)
- Tiered pricing ($4.99, $9.99, $29.99/month)

**Success Criteria:**

- [ ] 12 platforms maintain 85%+ overall success rate
- [ ] Zero P0/P1 bugs in production
- [ ] 200+ users (100+ free trial, 100+ paid target)
- [ ] $500+ MRR (Monthly Recurring Revenue)
- [ ] 4.5+ star rating on Apify Store

**Key Risks:**

- ⚠️ High-risk platforms (Mercari, OfferUp) fail frequently (Mitigation: Mark as "beta", graceful
  degradation)
- ⚠️ Marketing budget constraints (Mitigation: Organic growth via communities)

---

## 3. Epics

### Epic Organization by Phase

```
PHASE 1: Foundation & MVP
├── EPIC-001: Core Architecture & Orchestration
├── EPIC-002: First Platform Integration (eBay)
├── EPIC-003: Notification System
├── EPIC-004: Data Management & Storage
└── EPIC-005: Documentation & Challenge Submission

PHASE 2: Platform Expansion
├── EPIC-006: Platform Integration (Batch 2: Poshmark, Depop, Craigslist)
├── EPIC-007: Webhook & Advanced Notifications
└── EPIC-008: Advanced Filtering & Search

PHASE 3: Advanced Features
├── EPIC-009: AI & Regex Parsing Engine
├── EPIC-010: Deduplication System
├── EPIC-011: Release Calendar Monitoring
├── EPIC-012: Deal Scoring & Price Tracking
└── EPIC-013: Premium Features & Tiers

PHASE 4: Polish & Launch
├── EPIC-014: Platform Integration (Batch 3: Mercari, OfferUp, Vinted)
├── EPIC-015: Testing & Quality Assurance
├── EPIC-016: Marketing & User Acquisition
└── EPIC-017: Monetization & Business Operations
```

---

### EPIC-001: Core Architecture & Orchestration

**Phase:** 1 (Foundation & MVP)  
**Priority:** P0 (Critical)  
**Estimated Effort:** 13 story points  
**Sprint:** Sprint 1 (Weeks 1-2)

**Description:** Build the foundational architecture that will power the entire SneakerMeta actor.
This includes the main orchestrator that routes scraping tasks, the plugin system for platform
scrapers, data normalization engine, and core Apify SDK integration.

**Business Value:**

- Enables rapid addition of new platforms (20+ hours saved per new platform)
- Provides clean, maintainable codebase for future features
- Ensures Apify best practices (required for 65+ quality score)
- Foundation for scaling to 12+ platforms

**Dependencies:**

- None (first epic to be completed)

**Acceptance Criteria:**

- [ ] Main orchestrator successfully routes tasks to platform-specific scrapers
- [ ] Plugin system allows adding new scrapers with <50 lines of boilerplate code
- [ ] Data normalization converts any platform format to standardized schema
- [ ] Apify SDK integration: Dataset, Key-Value Store, Request Queue
- [ ] Error handling: Graceful degradation if 1 platform fails
- [ ] Logging: INFO/WARNING/ERROR levels with structured output

**Technical Notes:**

- Use Apify SDK v3 with TypeScript/JavaScript
- Implement Strategy Pattern for scraper selection
- Factory Pattern for scraper instantiation
- Repository Pattern for data storage

**Related User Stories:**

- US-001, US-002, US-003, US-004

---

### EPIC-002: First Platform Integration (eBay)

**Phase:** 1 (Foundation & MVP)  
**Priority:** P0 (Critical)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 1 (Weeks 1-2)

**Description:** Integrate eBay using their official Finding API. eBay is chosen as the first
platform because it has a well-documented API, high listing volume, and low legal risk. This
integration serves as the template for future API-based integrations.

**Business Value:**

- Proves core architecture works end-to-end
- eBay has largest inventory (100K+ sneaker listings)
- Legal/safe (official API)
- Template for other API-based platforms

**Dependencies:**

- EPIC-001 (Core Architecture must be complete)
- eBay Developer Account (apply Week 1, usually approved in 1-2 days)

**Acceptance Criteria:**

- [ ] eBay Finding API integrated with OAuth 2.0 authentication
- [ ] Search by keyword, filter by price range, category (Athletic Shoes)
- [ ] Successfully retrieve 50+ listings per search term
- [ ] Handle API rate limits (5,000 calls/day free tier)
- [ ] Parse eBay response format to standardized schema
- [ ] Filter "Buy It Now" vs "Auction" listings
- [ ] Extract "Authenticity Guarantee" badge when present

**API Limits:**

- Free tier: 5,000 calls/day
- Recommended: Cache results for 1 hour

**Related User Stories:**

- US-005, US-006, US-007

---

### EPIC-003: Notification System

**Phase:** 1 (Foundation & MVP)  
**Priority:** P0 (Critical)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 2 (Weeks 3-4)

**Description:** Build multi-channel notification system starting with email alerts. This is a core
value proposition—users must receive timely notifications when matching listings appear. Email is
the MVP, with webhooks and push notifications added later.

**Business Value:**

- Core product feature (alerts are the main value)
- Email has highest open rate (20-30% for transactional)
- Immediate actionability (users can purchase within minutes)
- Foundation for premium features (SMS, push notifications)

**Dependencies:**

- EPIC-001, EPIC-002 (needs data to notify about)
- SendGrid account (free tier: 100 emails/day)

**Acceptance Criteria:**

- [ ] SendGrid integration with verified sender domain
- [ ] HTML email template with listing cards
- [ ] Send alerts within 10 minutes of new listing detection
- [ ] Support batch notifications (hourly, daily digest)
- [ ] Unsubscribe link in all emails
- [ ] Email delivery rate ≥ 95%
- [ ] Handle SendGrid failures gracefully (retry 3x with exponential backoff)

**Email Template Requirements:**

- Responsive design (mobile-friendly)
- Clear call-to-action (View Listing button)
- Product image, price, size, condition
- Platform badge/logo
- Powered by SneakerMeta footer

**Related User Stories:**

- US-008, US-009, US-010

---

### EPIC-004: Data Management & Storage

**Phase:** 1 (Foundation & MVP)  
**Priority:** P1 (High)  
**Estimated Effort:** 5 story points  
**Sprint:** Sprint 1-2 (Weeks 1-4)

**Description:** Implement robust data storage using Apify Dataset and Key-Value Store. Dataset
stores scraped listings, KV Store manages actor state (seen hashes, user preferences, last scrape
timestamps). Proper data management is required for 65+ quality score.

**Business Value:**

- Enables deduplication (prevents alert spam)
- Allows incremental scraping (only new listings)
- Persistent state across scheduled runs
- Historical data for price tracking (Phase 3)

**Dependencies:**

- EPIC-001 (Core Architecture)

**Acceptance Criteria:**

- [ ] Dataset output matches defined schema (100% consistency)
- [ ] Each listing has unique `id` field for deduplication
- [ ] Key-Value Store tracks seen listing hashes
- [ ] State persists across actor runs
- [ ] Support for scheduled runs (hourly, daily, etc.)
- [ ] Dataset API accessible for external integrations

**Data Retention:**

- Dataset: Keep latest 10,000 listings (rolling window)
- KV Store: Keep state for 90 days

**Related User Stories:**

- US-011, US-012, US-013

---

### EPIC-005: Documentation & Challenge Submission

**Phase:** 1 (Foundation & MVP)  
**Priority:** P0 (Critical)  
**Estimated Effort:** 5 story points  
**Sprint:** Sprint 2 (Weeks 3-4)

**Description:** Create comprehensive documentation and submit to Apify Challenge. Documentation is
a mandatory requirement for the challenge and directly impacts the quality score. Includes README,
video demo, input/output examples, and troubleshooting guide.

**Business Value:**

- Required for Apify Challenge eligibility
- Increases user adoption (clear docs = more users)
- Reduces support burden (self-service troubleshooting)
- Demonstrates professionalism (impacts judging)

**Dependencies:**

- EPIC-001, EPIC-002, EPIC-003, EPIC-004 (complete MVP required)

**Acceptance Criteria:**

- [ ] README.md with: description, features, setup, examples, limitations
- [ ] 2-3 minute demo video showing full workflow
- [ ] Screenshots of input schema and output dataset
- [ ] Troubleshooting section with common issues
- [ ] Input schema has helpful descriptions and examples
- [ ] Achieve 65+ Apify Actor Quality Score
- [ ] Apify Challenge submission completed

**Video Demo Requirements:**

- Show input configuration
- Live scraping demo (eBay + Grailed)
- Email notification received
- Dataset output viewed
- Explain unique value proposition

**Related User Stories:**

- US-014, US-015, US-016

---

### EPIC-006: Platform Integration (Batch 2: Poshmark, Depop, Craigslist)

**Phase:** 2 (Platform Expansion)  
**Priority:** P1 (High)  
**Estimated Effort:** 13 story points  
**Sprint:** Sprint 3 (Weeks 5-6)

**Description:** Add three more platforms to bring total to 6. These are peer-to-peer marketplaces
with varying scraping difficulties. Poshmark and Depop require internal API reverse engineering,
Craigslist is straightforward HTML parsing.

**Business Value:**

- Expands coverage to 6 platforms (50% of total goal)
- P2P platforms have best deals (underpriced listings common)
- Differentiation from single-platform scrapers
- Broader appeal to sneaker resellers

**Dependencies:**

- EPIC-001 (Core Architecture)
- Residential proxies (Apify proxy configuration)

**Platform-Specific Notes:**

**Poshmark:**

- Internal REST API (mobile app endpoint)
- Rate limit: ~150 requests/hour
- Requires User-Agent spoofing
- Difficulty: ⭐⭐⭐ (Hard)

**Depop:**

- Internal API (https://webapi.depop.com/api/v2/)
- Rate limit: ~100 requests/hour
- Clean JSON responses
- Difficulty: ⭐⭐ (Medium)

**Craigslist:**

- Simple HTML parsing with Cheerio
- Rate limit: ~100 requests/hour per city
- Requires city-specific URLs (user-provided)
- Difficulty: ⭐⭐ (Medium)

**Acceptance Criteria:**

- [ ] All 3 platforms successfully scrape 50+ listings per search
- [ ] Rate limiting implemented per platform
- [ ] Residential proxy rotation configured
- [ ] Error handling: Continue if 1 platform fails
- [ ] Scraping performance: Complete all 6 platforms in <5 minutes
- [ ] Data normalization: Convert all formats to standardized schema

**Related User Stories:**

- US-017, US-018, US-019, US-020

---

### EPIC-007: Webhook & Advanced Notifications

**Phase:** 2 (Platform Expansion)  
**Priority:** P1 (High)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 3 (Weeks 5-6)

**Description:** Add webhook support for integration with Zapier, Discord, Slack, and custom
endpoints. Webhooks enable power users to build automated workflows (e.g., auto-post deals to
Discord servers) and represent a key premium feature.

**Business Value:**

- Appeals to power users and reseller communities
- Enables automation workflows (Zapier has 5,000+ integrations)
- Discord integration targets sneaker "cook groups" (active communities)
- Foundation for premium tier ($9.99/month)

**Dependencies:**

- EPIC-003 (Notification System)

**Acceptance Criteria:**

- [ ] Generic webhook POST endpoint support
- [ ] Webhook payload includes all listing details (JSON format)
- [ ] HMAC signature for security (verify webhook authenticity)
- [ ] Discord webhook integration (rich embeds with images)
- [ ] Slack webhook integration (formatted messages)
- [ ] Webhook delivery within 5 minutes of new listing
- [ ] Retry logic: 3 attempts with exponential backoff
- [ ] Webhook failure notifications (email fallback)

**Webhook Payload Schema:**

```json
{
  "event": "new_listings_found",
  "timestamp": "2025-11-10T14:30:00Z",
  "count": 5,
  "listings": [...]
}
```

**Related User Stories:**

- US-021, US-022, US-023

---

### EPIC-008: Advanced Filtering & Search

**Phase:** 2 (Platform Expansion)  
**Priority:** P2 (Medium)  
**Estimated Effort:** 5 story points  
**Sprint:** Sprint 3 (Weeks 5-6)

**Description:** Enhance input schema with advanced filters: size ranges, multiple conditions, price
thresholds, exclude keywords, brand filters. These filters reduce noise and improve alert relevance.

**Business Value:**

- Reduces false positives (alert fatigue)
- Improves user satisfaction (only relevant alerts)
- Competitive advantage (more precise than competitors)
- Enables niche use cases (e.g., "only Player Edition Kobes")

**Dependencies:**

- EPIC-001 (Core Architecture)

**Acceptance Criteria:**

- [ ] Size filter: Support ranges (e.g., 10-11.5) and multiple sizes (e.g., 10, 10.5, 11)
- [ ] Condition filter: Multiple selections (new, used-like-new, used-good)
- [ ] Price range: Min and max price filters
- [ ] Exclude keywords: Block listings containing specific words (e.g., "replica", "fake")
- [ ] Brand filter: Nike, Adidas, New Balance, etc.
- [ ] Colorway filter: Bred, Chicago, etc.
- [ ] Filters work across all platforms
- [ ] Filter validation in input schema

**Related User Stories:**

- US-024, US-025, US-026

---

### EPIC-009: AI & Regex Parsing Engine

**Phase:** 3 (Advanced Features)  
**Priority:** P1 (High)  
**Estimated Effort:** 13 story points  
**Sprint:** Sprint 4 (Weeks 7-8)

**Description:** Build intelligent parsing system that extracts structured data (size, condition,
colorway) from unstructured text (listing titles and descriptions). Uses regex for common patterns
and OpenAI API as fallback for ambiguous listings.

**Business Value:**

- **CRITICAL DIFFERENTIATOR** - No competitors have this
- Unlocks P2P platforms (where data is messy)
- Enables accurate filtering (80% of listings lack structured size/condition)
- Demonstrates technical excellence (Apify Challenge "innovation" criteria)

**Dependencies:**

- EPIC-006 (P2P platforms generate unstructured data)
- OpenAI API account (GPT-3.5 Turbo, ~$0.002 per parse)

**Parsing Targets:**

| Field         | Example Input                     | Expected Output        | Method             |
| ------------- | --------------------------------- | ---------------------- | ------------------ |
| **Condition** | "VNDS worn 1x, 9/10"              | `used_like_new`        | Regex              |
| **Size**      | "Size 10.5 US Men's"              | `10.5`                 | Regex              |
| **Colorway**  | "Jordan 1 Bred OG"                | `Bred`                 | Regex + Dictionary |
| **Tags**      | "OG all, no box"                  | `["og_all", "no_box"]` | Regex              |
| **Ambiguous** | "Barely worn, feel like new, TTS" | (fallback to OpenAI)   | AI                 |

**Acceptance Criteria:**

- [ ] Regex engine parses 85%+ of structured listings correctly
- [ ] AI fallback handles ambiguous cases with 80%+ accuracy
- [ ] Parsing adds <500ms latency per listing
- [ ] Cost optimization: Only use AI for regex failures (10-15% of listings)
- [ ] Support sneakerhead terminology: DS, VNDS, NDS, OG All, PE, etc.
- [ ] Size extraction: Handle US, EU, UK sizing
- [ ] Colorway database: 100+ common sneaker colorways

**OpenAI Integration:**

- Model: GPT-3.5 Turbo
- Prompt engineering: Zero-shot classification
- Cost: ~$0.002 per parse (~$1-2 per 1,000 listings)

**Related User Stories:**

- US-027, US-028, US-029, US-030

---

### EPIC-010: Deduplication System

**Phase:** 3 (Advanced Features)  
**Priority:** P0 (Critical)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 4 (Weeks 7-8)

**Description:** Implement hash-based deduplication that tracks seen listings across runs. Prevents
alert spam by only notifying users about new listings. Uses Apify Key-Value Store for persistent
state.

**Business Value:**

- **CRITICAL FOR USER RETENTION** - Alert spam = unsubscribes
- Reduces email/webhook volume by 70-80%
- Enables scheduled runs (hourly, daily) without spam
- Foundation for price tracking (Phase 3)

**Dependencies:**

- EPIC-004 (Data Management)

**Deduplication Strategy:**

1. **Hash Generation:**
   - MD5 hash of: `platform:listing_id` or `platform:title:price:seller`
   - Handles cases where listing ID is unavailable

2. **State Management:**
   - Store hashes in Key-Value Store (`seen_hashes` key)
   - Rolling window: Keep last 10,000 hashes (covers ~1-2 weeks of listings)
   - Expire hashes after 30 days (listings no longer relevant)

3. **Price Change Detection (Advanced):**
   - Track price history per listing
   - Alert if price drops by >10%
   - Separate alert type: "Price Drop Alert"

**Acceptance Criteria:**

- [ ] Generate unique hash for each listing
- [ ] Persist hashes in Key-Value Store across runs
- [ ] Only alert on listings not in seen hash set
- [ ] Handle hash collisions (use secondary key: URL)
- [ ] State persists for 30 days
- [ ] Price drop detection works for previously seen listings
- [ ] Performance: Hash lookup <10ms per listing

**Related User Stories:**

- US-031, US-032, US-033

---

### EPIC-011: Release Calendar Monitoring

**Phase:** 3 (Advanced Features)  
**Priority:** P1 (High)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 5 (Weeks 9-10)

**Description:** Scrape sneaker release calendars (The Drop Date, Sole Retriever, Finish Line) to
proactively alert users about upcoming drops. This shifts the product from reactive (finding deals)
to proactive (alerting before releases).

**Business Value:**

- **MASSIVE DIFFERENTIATOR** - Competes with paid "cook groups" ($30-50/month)
- Proactive > Reactive (users can prepare for releases)
- Increases perceived value (2 features in 1: deals + release calendar)
- Targets serious collectors (higher willingness to pay)

**Dependencies:**

- EPIC-003 (Notification System)

**Calendar Sources:**

| Source             | URL               | Scraping Method           | Data Quality         |
| ------------------ | ----------------- | ------------------------- | -------------------- |
| **The Drop Date**  | thedropdate.com   | Cheerio (HTML)            | ⭐⭐⭐⭐⭐ Excellent |
| **Sole Retriever** | soleretriever.com | Playwright (JS rendering) | ⭐⭐⭐⭐ Very Good   |
| **Finish Line**    | finishline.com    | Cheerio (HTML)            | ⭐⭐⭐ Good          |

**Extracted Data:**

- Sneaker name (e.g., "Air Jordan 1 High OG 'Lost and Found'")
- Release date (e.g., "2025-11-15")
- Retail price (e.g., "$180")
- SKU (e.g., "DZ5485-612")
- Raffle links (Nike SNKRS, Foot Locker, etc.)

**Acceptance Criteria:**

- [ ] Scrape 3 calendar sources daily
- [ ] Aggregate and deduplicate releases (same shoe from multiple sources)
- [ ] Send daily digest email: "Upcoming Drops This Week"
- [ ] Alert 7 days before major releases
- [ ] Include raffle entry links in notifications
- [ ] Store release calendar in separate dataset
- [ ] Handle calendar site changes gracefully (fallback to other sources)

**Notification Strategy:**

- **Daily Digest:** All releases in next 7 days (sent 9 AM user timezone)
- **1-Day Alert:** Major releases (limited edition, collaborations) 24 hours before
- **30-Minute Alert:** For SNKRS drops (requires fast action)

**Related User Stories:**

- US-034, US-035, US-036

---

### EPIC-012: Deal Scoring & Price Tracking

**Phase:** 3 (Advanced Features)  
**Priority:** P2 (Medium)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 5 (Weeks 9-10)

**Description:** Implement intelligent deal scoring by comparing P2P marketplace prices against
authenticated platform prices (GOAT, StockX). Highlights listings that are significantly below
market value (e.g., 20%+ discount).

**Business Value:**

- Helps users identify true deals vs. scams
- Targets resellers (who need profit margin calculations)
- Premium feature justification ($9.99/month tier)
- Reduces decision fatigue (score = instant insight)

**Dependencies:**

- EPIC-009 (AI Parsing for price extraction)
- Access to GOAT/StockX data (see technical notes)

**Technical Approach:**

**Option 1: Scrape GOAT/StockX (High Risk)**

- Pros: Real-time market prices
- Cons: Violates ToS, aggressive anti-scraping
- Recommendation: ⚠️ **HIGH RISK** - NOT RECOMMENDED for Phase 3

**Option 2: Static Price Database (Recommended)**

- Pros: Legal, fast, no scraping
- Cons: Prices can be outdated (refresh weekly)
- Implementation: Manually curate top 100 "grail" sneakers with market values
- Source: Public price guides, Reddit r/Sneakers, forums

**Option 3: User-Provided Market Value**

- Pros: Flexible, no scraping
- Cons: Requires user effort
- Implementation: User sets "expected market value" per search term

**MVP Implementation (Recommended: Option 2 + 3 Hybrid):**

1. Built-in price database for top 100 grails
2. User can override with custom market value
3. Calculate savings percentage: `(market_value - listing_price) / market_value * 100`

**Deal Score Calculation:**

```javascript
if (savingsPercentage >= 30%) return "EXCELLENT DEAL";
if (savingsPercentage >= 20%) return "GOOD DEAL";
if (savingsPercentage >= 10%) return "FAIR DEAL";
return "MARKET PRICE";
```

**Acceptance Criteria:**

- [ ] Price database with 100+ popular sneakers
- [ ] Calculate savings percentage for each listing
- [ ] Highlight deals in email/webhook notifications
- [ ] Sort listings by deal score (best deals first)
- [ ] User can set custom market values
- [ ] Price history tracking (see price trends over time)

**Related User Stories:**

- US-037, US-038, US-039

---

### EPIC-013: Premium Features & Tiers

**Phase:** 3 (Advanced Features)  
**Priority:** P2 (Medium)  
**Estimated Effort:** 5 story points  
**Sprint:** Sprint 5 (Weeks 9-10)

**Description:** Implement tiered pricing with free, hobby, and pro plans. Gate advanced features
(AI parsing, release calendar, webhook, deal scoring) behind paid tiers. Set up Apify monetization.

**Business Value:**

- **REVENUE GENERATION** - Core monetization strategy
- Freemium model increases user acquisition (free trial)
- Premium tiers target power users (resellers willing to pay)
- Recurring revenue (MRR target: $500-1,000 by Week 12)

**Pricing Tiers:**

| Feature              | Free          | Hobby ($4.99/mo)          | Pro ($9.99/mo) | Business ($29.99/mo) |
| -------------------- | ------------- | ------------------------- | -------------- | -------------------- |
| **Platforms**        | 1 (eBay only) | 3 (eBay, Grailed, Kixify) | All 12         | All 12               |
| **Max Results**      | 10 per run    | 50 per run                | 500 per run    | Unlimited            |
| **Email Alerts**     | ❌            | ✅                        | ✅             | ✅                   |
| **Webhook**          | ❌            | ❌                        | ✅             | ✅                   |
| **AI Parsing**       | ❌            | ❌                        | ✅             | ✅                   |
| **Release Calendar** | ❌            | ❌                        | ✅             | ✅                   |
| **Deal Scoring**     | ❌            | ❌                        | ✅             | ✅                   |
| **Price History**    | ❌            | ❌                        | ❌             | ✅                   |
| **API Access**       | ❌            | ❌                        | ❌             | ✅                   |
| **Scheduled Runs**   | Manual        | Daily                     | Hourly         | Every 15 min         |

**Free Trial:**

- 14 days free trial of Pro plan (no credit card required)
- Goal: Convert 20% of free trials to paid (industry standard: 10-25%)

**Implementation:**

```javascript
// Tier enforcement
const tier = input.subscriptionTier || 'free';
const limits = TIER_LIMITS[tier];

if (input.platforms.length > limits.maxPlatforms) {
  throw new Error(`Upgrade to ${tier} for ${input.platforms.length} platforms`);
}
```

**Acceptance Criteria:**

- [ ] Configure Apify monetization (rental model)
- [ ] Tier enforcement logic in main.js
- [ ] Upgrade prompts in error messages
- [ ] Pricing page on README/landing page
- [ ] Analytics: Track tier usage and conversion rates

**Related User Stories:**

- US-040, US-041, US-042

---

### EPIC-014: Platform Integration (Batch 3: Mercari, OfferUp, Vinted)

**Phase:** 4 (Polish & Launch)  
**Priority:** P2 (Medium)  
**Estimated Effort:** 13 story points  
**Sprint:** Sprint 6 (Weeks 11-12)

**Description:** Add final 3 platforms to reach 12 total. These are the highest-risk platforms with
aggressive anti-scraping measures. Mark as "beta" and implement graceful degradation.

**Business Value:**

- Achieves 12-platform goal (marketing claim)
- Completeness perception (vs. 9-platform competitors)
- Mercari/OfferUp have unique inventory (not on other platforms)

**Dependencies:**

- EPIC-001 (Core Architecture)
- Premium residential proxies (Apify)

**Platform Risk Assessment:**

| Platform    | Difficulty           | Risk      | Strategy                                                                |
| ----------- | -------------------- | --------- | ----------------------------------------------------------------------- |
| **Mercari** | ⭐⭐⭐⭐ (Very Hard) | ⚠️ High   | Internal GraphQL API, aggressive rate limits, mark as "beta"            |
| **OfferUp** | ⭐⭐⭐⭐ (Very Hard) | ⚠️ High   | Playwright automation, Cloudflare, slow scraping (10-15 sec delays)     |
| **Vinted**  | ⭐⭐⭐ (Hard)        | ⚠️ Medium | Internal API, EU-focused (limited US presence), geographic restrictions |

**Acceptance Criteria:**

- [ ] All 3 platforms scrape successfully (target 70%+ success rate, lower than other platforms)
- [ ] Mark as "BETA" in platform selection UI
- [ ] Graceful degradation: Actor continues if these platforms fail
- [ ] User notification: "Mercari scraping failed, continuing with other platforms..."
- [ ] Performance: These platforms can take 2-5 minutes each (total runtime may reach 10-15 min)
- [ ] Monitor failure rates: Auto-disable platform if failure rate >50% for 7 days

**Risk Mitigation:**

- Daily monitoring of scraper health
- Fallback logic if platform is down
- Clear user expectations ("BETA - May be unreliable")

**Related User Stories:**

- US-043, US-044, US-045

---

### EPIC-015: Testing & Quality Assurance

**Phase:** 4 (Polish & Launch)  
**Priority:** P0 (Critical)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 6 (Weeks 11-12)

**Description:** Comprehensive testing to ensure production readiness. Includes unit tests,
integration tests, end-to-end tests, load testing, and manual QA. Target: 80%+ code coverage, zero
P0/P1 bugs.

**Business Value:**

- Prevents production failures (customer churn)
- Increases reliability (user trust)
- Required for 65+ Apify quality score
- Demonstrates professionalism (Apify Challenge judging)

**Testing Strategy:**

**1. Unit Tests (Jest)**

- Test individual functions: parsing, normalization, hashing
- Target: 80% code coverage
- Mock external APIs (eBay, SendGrid, etc.)

**2. Integration Tests**

- Test platform scrapers end-to-end
- Verify data flows from scraper → normalizer → dataset
- Test notification delivery (email, webhook)

**3. End-to-End Tests (Apify Test Runner)**

- Run full actor with test input
- Verify output dataset matches schema
- Test all 12 platforms (allow some failures for high-risk platforms)

**4. Load Testing**

- Test with 100+ search terms
- Verify performance under load (should complete in <15 min)
- Monitor memory usage (must stay under 4GB)

**5. Manual QA**

- Test all input schema options
- Verify email/webhook notifications
- Check for UI/UX issues in Apify Console
- Beta tester feedback

**Acceptance Criteria:**

- [ ] 80%+ code coverage (unit tests)
- [ ] All integration tests pass
- [ ] E2E test runs successfully 10 consecutive times
- [ ] Load test: 100 search terms complete in <15 minutes
- [ ] Memory usage <4GB throughout run
- [ ] Zero P0 (critical) bugs
- [ ] <3 P1 (high) bugs
- [ ] Beta testers report 4+/5 satisfaction

**Related User Stories:**

- US-046, US-047, US-048

---

### EPIC-016: Marketing & User Acquisition

**Phase:** 4 (Polish & Launch)  
**Priority:** P1 (High)  
**Estimated Effort:** 8 story points  
**Sprint:** Sprint 6 (Weeks 11-12)

**Description:** Execute marketing campaign to acquire first 200 users. Focus on organic growth
through sneaker communities (Reddit, Discord, YouTube). Leverage Apify Challenge submission for
credibility.

**Business Value:**

- User acquisition (target: 200+ users by Week 12)
- Revenue generation ($500-1,000 MRR target)
- Community building (early adopters become advocates)
- Apify Challenge "popularity" metric

**Marketing Channels:**

**1. Reddit (Primary Channel)**

- Target subreddits:
  - r/Sneakers (2.9M members)
  - r/SneakerMarket (100K members)
  - r/Flipping (170K members)
  - r/Reselling (50K members)
- Strategy: Value-first approach (post deals found by actor, mention tool in comments)
- Budget: $0 (organic)

**2. Discord (Secondary Channel)**

- Join 20+ sneaker cook groups
- Provide value: Share deals, release calendar info
- Mention actor when users ask "how did you find that?"
- Budget: $0 (organic)

**3. YouTube (Content Marketing)**

- Create tutorial videos:
  - "How to Find Sneaker Deals with Automation (Free Tool)"
  - "Setting Up SneakerMeta Actor: Complete Guide"
  - "I Made $500 Flipping Sneakers with This Tool"
- Partner with micro-influencers (500-5K subscribers)
- Budget: $0-100 (optional: pay micro-influencers $20-50 for video)

**4. Apify Store (Organic Discovery)**

- Optimize store listing:
  - SEO keywords: "sneaker", "scraper", "deals", "alert", "notification"
  - High-quality screenshots
  - Clear value proposition
  - Video demo
- Leverage Apify Challenge badge (if won)

**5. Landing Page (Optional)**

- Simple landing page: sneakermeta.com (optional)
- Benefits: Custom branding, email capture, SEO
- Cost: $10/year domain + free hosting (Vercel, Netlify)

**Content Calendar (Weeks 11-12):**

**Week 11:**

- Monday: Publish demo video on YouTube
- Tuesday: Post in r/Sneakers (value-first: "Found these deals using automation")
- Wednesday: Join 10 Discord servers, introduce in #general
- Thursday: Publish tutorial video
- Friday: Post in r/SneakerMarket

**Week 12:**

- Monday: Post in r/Flipping (focus on reseller use case)
- Tuesday: Reach out to 5 YouTube micro-influencers
- Wednesday: Update Apify Store listing (based on feedback)
- Thursday: Post "success story" in r/Reselling
- Friday: Launch celebration post (if Apify Challenge results announced)

**Acceptance Criteria:**

- [ ] 200+ total users (100+ free trial, 100+ paid target)
- [ ] 50+ active users (ran actor in last 7 days)
- [ ] 20% free trial → paid conversion
- [ ] 4+ YouTube videos published
- [ ] 10+ Reddit posts (value-first, no spam)
- [ ] 20+ Discord servers joined
- [ ] 4.5+ star rating on Apify Store (from 10+ reviews)

**Related User Stories:**

- US-049, US-050, US-051

---

### EPIC-017: Monetization & Business Operations

**Phase:** 4 (Polish & Launch)  
**Priority:** P1 (High)  
**Estimated Effort:** 5 story points  
**Sprint:** Sprint 6 (Weeks 11-12)

**Description:** Set up business operations: Apify monetization configuration, payment processing,
analytics tracking, customer support channels, legal disclaimers, and pricing optimization.

**Business Value:**

- Revenue generation ($500-1,000 MRR target)
- Professional operations (trust and credibility)
- Legal protection (disclaimers reduce liability)
- Data-driven optimization (analytics inform decisions)

**Tasks:**

**1. Apify Monetization Setup**

- Configure rental pricing: $4.99, $9.99, $29.99/month
- Set up PayPal/bank account for payouts
- Enable free trial (14 days)
- Tax configuration (if applicable)

**2. Analytics & Tracking**

- Google Analytics on landing page (if created)
- Apify Actor analytics: runs, users, errors
- Conversion funnel tracking: Free trial → Paid
- Revenue tracking: MRR, ARPU, churn rate

**3. Customer Support**

- Email: support@sneakermeta.com (or Gmail)
- Discord: Create #support channel
- Response time target: <24 hours
- FAQ document (common issues + solutions)

**4. Legal & Compliance**

- Legal disclaimer in README (see EPIC-005)
- Terms of Service (optional for MVP, required if >1,000 users)
- Privacy Policy (if collecting user emails)
- GDPR compliance (if EU users): Add data processing notice

**5. Pricing Optimization**

- A/B test: $4.99 vs. $7.99 for Hobby tier
- Monitor conversion rates per tier
- Survey users: "What price would you pay?"

**Acceptance Criteria:**

- [ ] Apify monetization live and working
- [ ] Receive first paying customer (🎉)
- [ ] Analytics tracking all key metrics
- [ ] Support email/Discord active
- [ ] Legal disclaimers in place
- [ ] $500+ MRR by end of Week 12 (target)

**Related User Stories:**

- US-052, US-053, US-054

---

## 4. User Stories

### Legend

**Story Points (Fibonacci Scale):**

- **1 point:** < 2 hours (trivial task)
- **2 points:** 2-4 hours (simple feature)
- **3 points:** 4-8 hours (half-day feature)
- **5 points:** 1-2 days (complex feature)
- **8 points:** 2-4 days (very complex feature)
- **13 points:** 1 week+ (epic-level, should be broken down)

**Priority Levels:**

- **P0 - Critical:** Must have for MVP/launch, blocking
- **P1 - High:** Important for success, high ROI
- **P2 - Medium:** Nice to have, moderate impact
- **P3 - Low:** Future enhancement, low priority

---

### Phase 1: Foundation & MVP (User Stories 1-16)

---

#### US-001: Initialize Apify Actor Project Structure

**Epic:** EPIC-001 (Core Architecture)  
**Priority:** P0 (Critical)  
**Story Points:** 2  
**Sprint:** Sprint 1

**User Story:** As a **developer**, I want to **initialize the Apify actor project with proper
structure and configuration**, so that **I have a solid foundation for building the application**.

**Acceptance Criteria:**

**Given** I am starting a new Apify project  
**When** I run `apify init`  
**Then** the project structure is created with:

- [ ] `.actor/actor.json` with correct metadata
- [ ] `.actor/input_schema.json` (empty, to be filled)
- [ ] `src/main.js` entry point
- [ ] `package.json` with Apify SDK v3
- [ ] `.gitignore` configured for Node.js
- [ ] README.md template

**And** I can run the actor locally with `apify run`  
**And** the actor successfully completes (even if it does nothing yet)

**Technical Tasks:**

1. Run `apify init sneaker-meta-actor`
2. Install dependencies: `npm install apify@^3.1.0 crawlee@^3.5.0`
3. Create folder structure: `src/scrapers/`, `src/utils/`, `src/config/`
4. Set up Git repository: `git init && git add . && git commit -m "Initial commit"`
5. Test local run: `apify run`

**Dependencies:** None

---

#### US-002: Design Standardized Output Schema

**Epic:** EPIC-001 (Core Architecture)  
**Priority:** P0 (Critical)  
**Story Points:** 3  
**Sprint:** Sprint 1

**User Story:** As a **developer**, I want to **define a standardized output schema for all
listings**, so that **data from different platforms is consistent and predictable**.

**Acceptance Criteria:**

**Given** I have analyzed multiple platform data formats  
**When** I create the schema  
**Then** it includes these required fields:

- [ ] `product.name` (string)
- [ ] `product.brand` (string)
- [ ] `listing.price` (number)
- [ ] `listing.size_us_mens` (string)
- [ ] `listing.condition` (enum: new_in_box, used_like_new, used_good, used_fair, used_poor,
      unspecified)
- [ ] `source.platform` (string)
- [ ] `source.url` (string)
- [ ] `source.id` (string)
- [ ] `scrape.timestamp` (ISO 8601 string)

**And** the schema is documented in `docs/OUTPUT_SCHEMA.md`  
**And** I create TypeScript types or JSDoc comments for the schema  
**And** the schema is validated in unit tests

**Technical Tasks:**

1. Create `src/schemas/output-schema.js` with schema definition
2. Document schema in `docs/OUTPUT_SCHEMA.md` with examples
3. Create TypeScript types (if using TS) or JSDoc comments
4. Write unit test: `__tests__/schema.test.js`
5. Add schema validation helper function

**Dependencies:** US-001

---

#### US-003: Build Data Normalization Engine

**Epic:** EPIC-001 (Core Architecture)  
**Priority:** P0 (Critical)  
**Story Points:** 5  
**Sprint:** Sprint 1

**User Story:** As a **developer**, I want to **build a data normalization engine that converts
platform-specific data to the standardized schema**, so that **all downstream processing works
uniformly**.

**Acceptance Criteria:**

**Given** I have raw listing data from any platform  
**When** I call `normalizer.normalize(rawData, 'ebay')`  
**Then** it returns data matching the standardized schema  
**And** it handles missing fields gracefully (uses defaults or null)  
**And** it extracts brand from product name if not provided  
**And** it parses price strings to numbers (handles "$1,200.00" → 1200)  
**And** it generates a unique listing ID if not provided

**And** I have platform-specific normalizers for:

- [ ] eBay
- [ ] Grailed
- [ ] Kixify

**Technical Tasks:**

1. Create `src/utils/normalizer.js` with base class
2. Implement `BaseNormalizer` with common logic
3. Create platform-specific normalizers:
   - `EbayNormalizer` extends BaseNormalizer
   - `GrailedNormalizer` extends BaseNormalizer
   - `KixifyNormalizer` extends BaseNormalizer
4. Add helper functions: `parsePrice()`, `extractBrand()`, `generateId()`
5. Write unit tests for each normalizer
6. Handle edge cases: missing data, malformed prices, etc.

**Dependencies:** US-002

---

#### US-004: Implement Scraper Manager & Orchestrator

**Epic:** EPIC-001 (Core Architecture)  
**Priority:** P0 (Critical)  
**Story Points:** 5  
**Sprint:** Sprint 1

**User Story:** As a **developer**, I want to **build a scraper manager that routes scraping tasks
to platform-specific scrapers**, so that **adding new platforms is simple and maintainable**.

**Acceptance Criteria:**

**Given** the user selects multiple platforms in input  
**When** the main orchestrator runs  
**Then** it routes each platform to the correct scraper  
**And** it runs scrapers in parallel (up to 5 concurrent)  
**And** if one scraper fails, the others continue  
**And** it aggregates results from all scrapers  
**And** it logs scraping progress (platform started, completed, failed)

**And** adding a new platform requires:

- [ ] Create new scraper class
- [ ] Register in scraper factory
- [ ] No changes to main orchestrator

**Technical Tasks:**

1. Create `src/scrapers/manager.js` with ScraperManager class
2. Implement scraper factory pattern (select scraper by platform name)
3. Add parallel execution with error handling (Promise.allSettled)
4. Create base scraper interface: `src/scrapers/base-scraper.js`
5. Implement retry logic with exponential backoff
6. Add comprehensive logging (Apify.log.info/error)
7. Write integration tests

**Dependencies:** US-001, US-003

---

#### US-005: Integrate eBay Finding API

**Epic:** EPIC-002 (First Platform Integration)  
**Priority:** P0 (Critical)  
**Story Points:** 5  
**Sprint:** Sprint 1

**User Story:** As a **sneaker collector**, I want to **search eBay for sneakers matching my
criteria**, so that **I can find deals on the platform with the largest inventory**.

**Acceptance Criteria:**

**Given** I provide search keywords "Air Jordan 1" and price range $100-$500  
**When** the actor runs with eBay selected  
**Then** it calls the eBay Finding API  
**And** it retrieves 50+ matching listings  
**And** it filters by "Buy It Now" (excludes auctions)  
**And** it filters by "Athletic Shoes" category  
**And** it extracts "Authenticity Guarantee" badge when present  
**And** the results are normalized to the standardized schema  
**And** it handles API rate limits (5,000 calls/day)  
**And** it retries on API failures (3 attempts)

**Technical Tasks:**

1. Apply for eBay Developer account (do this Week 1 Day 1)
2. Create `src/scrapers/ebay-scraper.js`
3. Implement OAuth 2.0 authentication
4. Build API request with query parameters:
   - Keywords, min/max price, category filter, listing type
5. Parse eBay API response format
6. Extract: title, price, URL, image, seller, condition, size (if in title)
7. Integrate with EbayNormalizer
8. Add rate limit handling (check daily quota)
9. Write integration test with mock API responses
10. Store API key securely (Apify Key-Value Store)

**Dependencies:** US-003, US-004

---

#### US-006: Integrate Grailed Scraper

**Epic:** EPIC-002 (First Platform Integration)  
**Priority:** P0 (Critical)  
**Story Points:** 5  
**Sprint:** Sprint 1

**User Story:** As a **sneaker collector**, I want to **search Grailed for sneakers**, so that **I
can find deals on peer-to-peer marketplace listings**.

**Acceptance Criteria:**

**Given** I provide search keywords "Yeezy 350"  
**When** the actor runs with Grailed selected  
**Then** it scrapes Grailed using the internal API endpoint  
**And** it retrieves 30+ matching listings  
**And** it filters by "footwear" category  
**And** it extracts: title, price, size, condition, seller, URL, image  
**And** results are normalized to standardized schema  
**And** it handles rate limits (200 requests/hour)  
**And** it uses residential proxies if available

**Technical Tasks:**

1. Reverse engineer Grailed internal API (GraphQL endpoint)
2. Create `src/scrapers/grailed-scraper.js`
3. Build GraphQL query for search
4. Add headers: User-Agent, Content-Type, etc.
5. Parse GraphQL response
6. Implement rate limiter (max 200 req/hour)
7. Configure proxy rotation (Apify residential proxy)
8. Create GrailedNormalizer
9. Write integration test
10. Handle API changes gracefully (fallback to HTML scraping)

**Dependencies:** US-003, US-004

---

#### US-007: Integrate Kixify Scraper

**Epic:** EPIC-002 (First Platform Integration)  
**Priority:** P0 (Critical)  
**Story Points:** 3  
**Sprint:** Sprint 1

**User Story:** As a **sneaker collector**, I want to **search Kixify for sneakers**, so that **I
can find deals on a sneaker-specific marketplace**.

**Acceptance Criteria:**

**Given** I provide search keywords "Jordan 4"  
**When** the actor runs with Kixify selected  
**Then** it scrapes Kixify using HTML parsing (Cheerio)  
**And** it retrieves 20+ matching listings  
**And** it extracts: title, price, size, condition, URL, image  
**And** results are normalized to standardized schema  
**And** it handles pagination (up to 5 pages)

**Technical Tasks:**

1. Analyze Kixify HTML structure
2. Create `src/scrapers/kixify-scraper.js`
3. Use Cheerio crawler for HTML parsing
4. Extract data from CSS selectors
5. Handle pagination (iterate through result pages)
6. Create KixifyNormalizer
7. Write integration test
8. Add error handling for layout changes

**Dependencies:** US-003, US-004

**Note:** Kixify is the easiest scraper (simple HTML), good for testing architecture.

---

#### US-008: Set Up SendGrid Email Integration

**Epic:** EPIC-003 (Notification System)  
**Priority:** P0 (Critical)  
**Story Points:** 3  
**Sprint:** Sprint 2

**User Story:** As a **product owner**, I want to **integrate SendGrid for email delivery**, so that
**users can receive alert notifications reliably**.

**Acceptance Criteria:**

**Given** I have a SendGrid account with API key  
**When** I configure the notification system  
**Then** it can send test emails successfully  
**And** the API key is stored securely (Apify Key-Value Store or environment variable)  
**And** it handles SendGrid failures gracefully (retry 3x with exponential backoff)  
**And** it logs delivery success/failure  
**And** free tier limit (100 emails/day) is monitored

**Technical Tasks:**

1. Sign up for SendGrid (free tier)
2. Create API key with "Mail Send" permission
3. Verify sender domain (or use sandbox for testing)
4. Install `@sendgrid/mail` package
5. Create `src/utils/notifier.js` with SendGrid integration
6. Implement retry logic with exponential backoff
7. Add daily quota tracking (warn if approaching 100 emails/day)
8. Write unit tests (mock SendGrid API)
9. Send test email to verify setup

**Dependencies:** None

---

#### US-009: Design HTML Email Template

**Epic:** EPIC-003 (Notification System)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 2

**User Story:** As a **sneaker collector**, I want to **receive beautifully formatted email
alerts**, so that **I can quickly identify deals and click through to listings**.

**Acceptance Criteria:**

**Given** there are 5 new matching listings  
**When** I receive the email alert  
**Then** the email includes:

- [ ] Eye-catching subject: "🔥 5 New Sneaker Deals Found"
- [ ] Header with SneakerMeta branding
- [ ] Each listing displayed as a card with:
  - Product image
  - Title (linked to listing URL)
  - Price (highlighted in green)
  - Size and condition
  - Platform badge
  - "View Listing" CTA button
- [ ] Footer with "Powered by SneakerMeta" and Apify logo
- [ ] Unsubscribe link

**And** the email is mobile-responsive  
**And** images load correctly (use CDN/external URLs)  
**And** the template works across email clients (Gmail, Outlook, Apple Mail)

**Technical Tasks:**

1. Create `src/templates/email-alert.html`
2. Use inline CSS (required for email compatibility)
3. Design responsive layout (media queries for mobile)
4. Add placeholder for listing data (template engine or string replacement)
5. Test on multiple email clients (use Litmus or Email on Acid if budget allows)
6. Optimize images (compress, use width/height attributes)
7. Add fallback for images-disabled email clients

**Dependencies:** US-008

---

#### US-010: Implement Email Notification Logic

**Epic:** EPIC-003 (Notification System)  
**Priority:** P0 (Critical)  
**Story Points:** 5  
**Sprint:** Sprint 2

**User Story:** As a **sneaker collector**, I want to **receive email alerts within 10 minutes of
matching listings appearing**, so that **I can act quickly before deals disappear**.

**Acceptance Criteria:**

**Given** the actor finds 5 new matching listings  
**When** the scraping run completes  
**Then** it sends an email notification within 10 minutes  
**And** the email includes all 5 listings (formatted using the HTML template)  
**And** if there are 0 new listings, no email is sent  
**And** if email delivery fails, it logs the error and continues  
**And** users can opt for digest mode: batch listings and send once per day

**Technical Tasks:**

1. Integrate email template with notification logic
2. Add template data binding (replace placeholders with listing data)
3. Implement batching logic for digest mode:
   - Store listings in Key-Value Store
   - Send daily digest at 9 AM user timezone (requires timezone input)
4. Add notification preference in input schema:
   - `notificationMode`: "immediate" or "daily_digest"
   - `emailTo`: user email address
5. Handle SendGrid failures gracefully
6. Write integration tests (mock SendGrid)
7. Test with real listings (end-to-end)

**Dependencies:** US-008, US-009

---

#### US-011: Implement Apify Dataset Storage

**Epic:** EPIC-004 (Data Management)  
**Priority:** P0 (Critical)  
**Story Points:** 2  
**Sprint:** Sprint 1

**User Story:** As a **developer**, I want to **store all scraped listings in an Apify Dataset**, so
that **users can access structured data via API and the data persists across runs**.

**Acceptance Criteria:**

**Given** the actor scrapes 50 listings from 3 platforms  
**When** the run completes  
**Then** all 150 listings are saved to the dataset  
**And** each listing has a unique `id` field  
**And** the dataset can be accessed via Apify API  
**And** the dataset format matches the standardized output schema  
**And** I can export the dataset as JSON, CSV, or Excel

**Technical Tasks:**

1. Use `await Actor.pushData(listings)` to save to dataset
2. Ensure each listing has a unique `id` (e.g., `${platform}_${listingId}`)
3. Validate data before saving (schema validation)
4. Add error handling for dataset write failures
5. Test dataset export in multiple formats
6. Document dataset API usage in README

**Dependencies:** US-002, US-003

---

#### US-012: Implement Deduplication Hash Storage

**Epic:** EPIC-004 (Data Management)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 2

**User Story:** As a **developer**, I want to **track seen listings using hash storage**, so that
**the actor only alerts on new listings in future runs**.

**Acceptance Criteria:**

**Given** the actor runs for the second time  
**When** it encounters previously seen listings  
**Then** it does not include them in the alert  
**And** only new listings (not in seen hashes) trigger notifications  
**And** the seen hashes persist in Apify Key-Value Store  
**And** the hash set is limited to 10,000 most recent entries (rolling window)

**Technical Tasks:**

1. Create hash generation function: `generateHash(listing)`
   - Hash format: MD5 of `${platform}:${listingId}`
2. Store seen hashes in Key-Value Store: `await Actor.setValue('seen_hashes', hashSet)`
3. On each run:
   - Load existing hashes: `const seenHashes = await Actor.getValue('seen_hashes') || new Set()`
   - Check if listing hash exists: `if (!seenHashes.has(hash)) { ... }`
   - Update hash set with new listings
   - Save updated hash set
4. Implement rolling window: Keep only last 10,000 hashes
5. Write unit tests for hash logic
6. Test persistence across multiple runs

**Dependencies:** US-011

---

#### US-013: Support Scheduled Runs

**Epic:** EPIC-004 (Data Management)  
**Priority:** P1 (High)  
**Story Points:** 2  
**Sprint:** Sprint 2

**User Story:** As a **sneaker collector**, I want to **schedule the actor to run automatically
every hour**, so that **I receive continuous monitoring without manual intervention**.

**Acceptance Criteria:**

**Given** I configure the actor to run hourly  
**When** the schedule triggers  
**Then** the actor runs automatically  
**And** it loads the previous run's state (seen hashes)  
**And** it only alerts on new listings since the last run  
**And** I can view the run history in Apify Console

**Technical Tasks:**

1. Document how to set up scheduled runs in Apify Console
   - Navigate to Actor → Settings → Schedule
   - Add cron expression: `0 * * * *` (every hour)
2. Test scheduled runs:
   - Run manually, wait 1 hour, verify auto-run
3. Ensure state persistence works across scheduled runs
4. Add FAQ section in README: "How to set up scheduled monitoring"
5. Test different schedules: hourly, every 6 hours, daily

**Dependencies:** US-012

---

#### US-014: Write Comprehensive README

**Epic:** EPIC-005 (Documentation & Challenge Submission)  
**Priority:** P0 (Critical)  
**Story Points:** 3  
**Sprint:** Sprint 2

**User Story:** As a **new user**, I want to **read clear documentation that explains how to use the
actor**, so that **I can set it up without confusion**.

**Acceptance Criteria:**

**Given** I am a new user with no prior Apify experience  
**When** I read the README  
**Then** it includes:

- [ ] Clear description of what the actor does
- [ ] List of features and supported platforms
- [ ] Input schema explanation with examples
- [ ] Output schema example
- [ ] Setup instructions (step-by-step)
- [ ] Use case scenarios (collector, reseller, etc.)
- [ ] FAQ section
- [ ] Troubleshooting guide
- [ ] Legal disclaimer
- [ ] Screenshots and/or demo video embed

**And** the README is well-formatted (Markdown, proper headings)  
**And** it follows Apify best practices for documentation  
**And** it contributes to achieving 65+ quality score

**Technical Tasks:**

1. Create comprehensive README.md (3,000-5,000 words)
2. Add sections:
   - Title and description
   - Features list
   - Use cases
   - Input parameters (with examples)
   - Output format (with JSON example)
   - Setup guide
   - Scheduling instructions
   - FAQ
   - Troubleshooting
   - Legal disclaimer
3. Add screenshots of input schema and output dataset
4. Embed demo video (YouTube)
5. Proofread and format
6. Get feedback from beta testers

**Dependencies:** US-001 through US-013 (all core features must be complete)

---

#### US-015: Create Demo Video

**Epic:** EPIC-005 (Documentation & Challenge Submission)  
**Priority:** P0 (Critical)  
**Story Points:** 3  
**Sprint:** Sprint 2

**User Story:** As a **potential user**, I want to **watch a short demo video**, so that **I can
quickly understand the actor's value without reading documentation**.

**Acceptance Criteria:**

**Given** I visit the actor's Apify Store page  
**When** I watch the demo video  
**Then** it demonstrates:

- [ ] Input configuration (adding search terms, selecting platforms, setting price range)
- [ ] Live scraping (show actor running in Apify Console)
- [ ] Results dataset (preview JSON output)
- [ ] Email notification received (show inbox)
- [ ] Clear explanation of benefits (saves time, finds deals, multi-platform)

**And** the video is 2-3 minutes long (no longer)  
**And** it has clear audio (no background noise)  
**And** it includes on-screen text/captions  
**And** it ends with a call-to-action (Try it free)

**Technical Tasks:**

1. Write video script (2-3 minutes, ~300-450 words)
2. Record screen capture (use OBS Studio or Loom)
3. Record voiceover or add text overlays
4. Edit video (cut unnecessary parts, add transitions)
5. Export in HD (1080p, MP4 format)
6. Upload to YouTube (public or unlisted)
7. Embed in README and Apify Store listing
8. Get feedback from 3+ people before publishing

**Dependencies:** US-001 through US-013 (full MVP must be working)

---

#### US-016: Submit to Apify Challenge

**Epic:** EPIC-005 (Documentation & Challenge Submission)  
**Priority:** P0 (Critical)  
**Story Points:** 2  
**Sprint:** Sprint 2

**User Story:** As a **developer**, I want to **submit the actor to the Apify Challenge**, so that
**I can compete for prizes and gain visibility**.

**Acceptance Criteria:**

**Given** the MVP is complete and documented  
**When** I submit to the Apify Challenge  
**Then** the submission includes:

- [ ] Published actor on Apify Store
- [ ] Public GitHub repository link
- [ ] Comprehensive README
- [ ] Demo video
- [ ] Apify quality score ≥ 65

**And** the submission meets all challenge requirements  
**And** I receive confirmation of successful submission  
**And** the actor is live and accessible to public

**Technical Tasks:**

1. Publish actor to Apify Store:
   - `apify push`
   - Make actor public
2. Create public GitHub repository
   - Push all code
   - Add README and LICENSE
3. Check Apify quality score:
   - Navigate to Actor → Analytics → Quality Score
   - Ensure score ≥ 65
   - Fix any issues flagged
4. Submit to Apify Challenge:
   - Follow submission instructions on challenge page
   - Provide all required information
5. Announce on social media (optional: Twitter, LinkedIn)

**Dependencies:** US-014, US-015

---

### Phase 2: Platform Expansion (User Stories 17-26)

---

#### US-017: Integrate Poshmark Scraper

**Epic:** EPIC-006 (Platform Integration Batch 2)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 3

**User Story:** As a **sneaker collector**, I want to **search Poshmark for sneakers**, so that **I
can find deals on a popular fashion marketplace**.

**Acceptance Criteria:**

**Given** I provide search keywords "Nike Dunk"  
**When** the actor runs with Poshmark selected  
**Then** it scrapes Poshmark using internal REST API  
**And** it retrieves 30+ matching listings  
**And** it filters by "Men's Shoes - Athletic" category  
**And** it extracts: title, price, size, condition, seller, URL, image  
**And** results are normalized to standardized schema  
**And** it handles rate limits (150 requests/hour)  
**And** it uses residential proxies

**Technical Tasks:**

1. Reverse engineer Poshmark internal API (inspect mobile app traffic)
2. Create `src/scrapers/poshmark-scraper.js`
3. Build API request with search parameters
4. Add headers: User-Agent, X-Requested-With, etc.
5. Parse JSON response
6. Implement rate limiter (max 150 req/hour)
7. Configure Apify residential proxy
8. Create PoshmarkNormalizer
9. Write integration test
10. Handle API changes (monitor for breaking changes)

**Dependencies:** US-004 (Scraper Manager)

---

#### US-018: Integrate Depop Scraper

**Epic:** EPIC-006 (Platform Integration Batch 2)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 3

**User Story:** As a **sneaker collector**, I want to **search Depop for sneakers**, so that **I can
find deals on a Gen-Z focused marketplace**.

**Acceptance Criteria:**

**Given** I provide search keywords "Air Max"  
**When** the actor runs with Depop selected  
**Then** it scrapes Depop using internal API  
**And** it retrieves 20+ matching listings  
**And** it extracts: title, price, size, condition, seller, URL, image  
**And** results are normalized to standardized schema  
**And** it handles rate limits (100 requests/hour)

**Technical Tasks:**

1. Analyze Depop API (https://webapi.depop.com/api/v2/search/products/)
2. Create `src/scrapers/depop-scraper.js`
3. Build API request with query parameters
4. Parse JSON response (clean format)
5. Implement rate limiter (max 100 req/hour)
6. Create DepopNormalizer
7. Write integration test
8. Add error handling

**Dependencies:** US-004

---

#### US-019: Integrate Craigslist Scraper

**Epic:** EPIC-006 (Platform Integration Batch 2)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 3

**User Story:** As a **sneaker collector**, I want to **search Craigslist for sneakers in multiple
cities**, so that **I can find local deals**.

**Acceptance Criteria:**

**Given** I provide Craigslist URLs for New York, LA, and Chicago  
**When** the actor runs with Craigslist selected  
**Then** it scrapes all provided city URLs  
**And** it retrieves 20+ matching listings per city  
**And** it extracts: title, price, location, posting date, URL, image  
**And** results are normalized to standardized schema  
**And** it handles rate limits (100 requests/hour per city)  
**And** it handles simple CAPTCHAs (log warning, continue)

**Technical Tasks:**

1. Create `src/scrapers/craigslist-scraper.js`
2. Use Cheerio crawler for HTML parsing
3. Handle multiple city URLs (user-provided in input)
4. Extract data from CSS selectors (`.result-row`, etc.)
5. Handle pagination (optional: scrape multiple pages)
6. Implement rate limiter per city
7. Add CAPTCHA detection (log warning if detected)
8. Create CraigslistNormalizer
9. Write integration test with sample URLs
10. Document URL format in input schema description

**Dependencies:** US-004

**Note:** User must provide specific city search URLs (e.g.,
`https://newyork.craigslist.org/search/sss?query=jordan+1`)

---

#### US-020: Optimize Scraping Performance

**Epic:** EPIC-006 (Platform Integration Batch 2)  
**Priority:** P2 (Medium)  
**Story Points:** 3  
**Sprint:** Sprint 3

**User Story:** As a **user**, I want the **actor to complete scraping in under 5 minutes**, so that
**I receive alerts quickly**.

**Acceptance Criteria:**

**Given** the actor scrapes 6 platforms with 50 results each  
**When** the run completes  
**Then** the total runtime is <5 minutes  
**And** platforms are scraped in parallel (not sequentially)  
**And** the actor uses AutoscaledPool for optimal concurrency  
**And** memory usage stays <2GB

**Technical Tasks:**

1. Refactor scraper manager to use AutoscaledPool
   ```javascript
   const pool = new AutoscaledPool({
     maxConcurrency: 5,
     minConcurrency: 2,
     runTaskFunction: async () => {
       /* scrape platform */
     },
   });
   ```
2. Profile performance: Measure time per platform
3. Optimize slow platforms:
   - Reduce wait times
   - Limit results per platform if needed
   - Use faster HTTP clients (Axios vs. Fetch)
4. Add performance logging (runtime per platform)
5. Test with 50+ search terms (stress test)
6. Monitor memory usage during runs

**Dependencies:** US-017, US-018, US-019

---

#### US-021: Implement Generic Webhook Support

**Epic:** EPIC-007 (Webhook & Advanced Notifications)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 3

**User Story:** As a **power user**, I want to **send new listing data to a webhook URL**, so that
**I can integrate with Zapier, Make, or my own automation**.

**Acceptance Criteria:**

**Given** I configure a webhook URL in the input  
**When** new listings are found  
**Then** the actor sends a POST request to the webhook URL  
**And** the payload is JSON with listing data  
**And** the payload includes HMAC signature in headers (for security)  
**And** if the webhook fails, it retries 3 times with exponential backoff  
**And** webhook delivery completes within 5 minutes

**Technical Tasks:**

1. Add webhook configuration to input schema:
   ```json
   {
     "webhookUrl": "https://example.com/webhook",
     "webhookSecret": "secret123" // Optional for HMAC
   }
   ```
2. Create `src/utils/webhook-notifier.js`
3. Implement webhook POST request:
   ```javascript
   await fetch(webhookUrl, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-Signature': generateHMAC(payload, secret),
     },
     body: JSON.stringify(payload),
   });
   ```
4. Add retry logic (3 attempts, exponential backoff)
5. Generate HMAC-SHA256 signature for security
6. Create webhook payload schema:
   ```json
   {
     "event": "new_listings_found",
     "timestamp": "2025-11-10T14:30:00Z",
     "count": 5,
     "listings": [...]
   }
   ```
7. Write integration test (mock webhook endpoint)
8. Document webhook format in README

**Dependencies:** US-010 (Notification Logic)

---

#### US-022: Implement Discord Webhook Integration

**Epic:** EPIC-007 (Webhook & Advanced Notifications)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 3

**User Story:** As a **sneaker reseller**, I want to **receive alerts in my Discord server**, so
that **my team can see deals instantly**.

**Acceptance Criteria:**

**Given** I provide a Discord webhook URL  
**When** new listings are found  
**Then** a message is posted to my Discord channel  
**And** the message includes rich embeds with:

- [ ] Listing title
- [ ] Price (highlighted)
- [ ] Size and condition
- [ ] Platform badge
- [ ] Thumbnail image
- [ ] "View Listing" button link

**And** the message is formatted for readability  
**And** up to 10 listings are included (Discord embed limit)

**Technical Tasks:**

1. Study Discord webhook format (embed structure)
2. Extend webhook notifier with Discord-specific formatting
3. Create rich embed JSON:
   ```javascript
   {
     "embeds": [{
       "title": "Air Jordan 1 Bred",
       "url": "https://...",
       "description": "$750 | Size 10.5 | Used Like New",
       "color": 0x00ff00,
       "thumbnail": { "url": "https://..." },
       "footer": { "text": "SneakerMeta Alert" }
     }]
   }
   ```
4. Handle Discord rate limits (30 requests/minute)
5. Test with real Discord server
6. Document Discord setup in README (how to get webhook URL)
7. Add Discord example in demo video

**Dependencies:** US-021

---

#### US-023: Implement Slack Webhook Integration

**Epic:** EPIC-007 (Webhook & Advanced Notifications)  
**Priority:** P2 (Medium)  
**Story Points:** 2  
**Sprint:** Sprint 3

**User Story:** As a **professional reseller**, I want to **receive alerts in Slack**, so that **my
business team stays informed**.

**Acceptance Criteria:**

**Given** I provide a Slack webhook URL  
**When** new listings are found  
**Then** a message is posted to my Slack channel  
**And** the message includes attachments with:

- [ ] Listing title
- [ ] Price, size, condition
- [ ] Platform
- [ ] "View Listing" button

**And** the message uses Slack's block kit for formatting  
**And** up to 10 listings are included

**Technical Tasks:**

1. Study Slack webhook format (blocks and attachments)
2. Extend webhook notifier with Slack-specific formatting
3. Create Slack blocks JSON:
   ```javascript
   {
     "attachments": [{
       "title": "Air Jordan 1 Bred",
       "title_link": "https://...",
       "text": "$750 | Size 10.5",
       "color": "good",
       "footer": "SneakerMeta"
     }]
   }
   ```
4. Handle Slack rate limits
5. Test with real Slack workspace
6. Document Slack setup in README

**Dependencies:** US-021

---

#### US-024: Add Advanced Size Filtering

**Epic:** EPIC-008 (Advanced Filtering & Search)  
**Priority:** P2 (Medium)  
**Story Points:** 3  
**Sprint:** Sprint 3

**User Story:** As a **sneaker collector**, I want to **filter by size range (e.g., 10-11.5) or
multiple specific sizes**, so that **I only see listings in my size**.

**Acceptance Criteria:**

**Given** I set size filter to "10, 10.5, 11"  
**When** the actor scrapes listings  
**Then** it only includes listings with sizes: 10, 10.5, or 11  
**And** it handles various size formats:

- [ ] "10.5"
- [ ] "Size 10.5 US Men's"
- [ ] "10.5M"
- [ ] "EU 44.5" (converts to US if possible)

**And** listings without size information are excluded  
**And** size matching is case-insensitive and flexible

**Technical Tasks:**

1. Add size filter to input schema:
   ```json
   {
     "sizes": ["10", "10.5", "11"]
   }
   ```
2. Create size parsing utility: `src/utils/size-parser.js`
3. Implement size extraction regex:
   - Match patterns: `\b(1[0-5]|[1-9])(\.5)?\b`, `size\s*(\d+\.?\d*)`
4. Add size conversion (EU to US, UK to US) - optional for MVP
5. Filter listings after normalization:
   ```javascript
   listings = listings.filter((l) => input.sizes.includes(l.listing.size_us_mens));
   ```
6. Write unit tests for size parser
7. Test with real listings (various formats)

**Dependencies:** US-009 (AI Parsing will enhance this)

---

#### US-025: Add Condition Filtering

**Epic:** EPIC-008 (Advanced Filtering & Search)  
**Priority:** P2 (Medium)  
**Story Points:** 2  
**Sprint:** Sprint 3

**User Story:** As a **sneaker collector**, I want to **filter by condition (new, used-like-new,
etc.)**, so that **I only see listings matching my preferences**.

**Acceptance Criteria:**

**Given** I set condition filter to ["new_in_box", "used_like_new"]  
**When** the actor scrapes listings  
**Then** it only includes listings with those conditions  
**And** listings with "unspecified" condition are excluded (unless explicitly included)  
**And** the filter works consistently across all platforms

**Technical Tasks:**

1. Add condition filter to input schema:
   ```json
   {
     "conditions": ["new_in_box", "used_like_new"]
   }
   ```
2. Filter listings after normalization:
   ```javascript
   listings = listings.filter((l) => input.conditions.includes(l.listing.condition));
   ```
3. Ensure all normalizers map conditions correctly
4. Write unit tests
5. Test with real listings

**Dependencies:** US-009 (AI Parsing improves condition detection)

---

#### US-026: Add Keyword Exclusion Filter

**Epic:** EPIC-008 (Advanced Filtering & Search)  
**Priority:** P2 (Medium)  
**Story Points:** 2  
**Sprint:** Sprint 3

**User Story:** As a **sneaker collector**, I want to **exclude listings containing certain keywords
(e.g., "replica", "fake", "custom")**, so that **I only see authentic items**.

**Acceptance Criteria:**

**Given** I set exclude keywords to ["replica", "fake", "custom"]  
**When** the actor scrapes listings  
**Then** it excludes any listing whose title or description contains those keywords  
**And** keyword matching is case-insensitive  
**And** partial matches work (e.g., "replicas" matches "replica")

**Technical Tasks:**

1. Add exclude keywords to input schema:
   ```json
   {
     "excludeKeywords": ["replica", "fake", "custom"]
   }
   ```
2. Implement filter logic:
   ```javascript
   listings = listings.filter((l) => {
     const text = `${l.product.name} ${l.listing.description}`.toLowerCase();
     return !input.excludeKeywords.some((kw) => text.includes(kw.toLowerCase()));
   });
   ```
3. Test with real listings (find some "replica" listings)
4. Document in README (common exclude keywords)

**Dependencies:** None

---

### Phase 3: Advanced Features (User Stories 27-42)

---

#### US-027: Build Regex-Based Condition Parser

**Epic:** EPIC-009 (AI & Regex Parsing Engine)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 4

**User Story:** As a **system**, I want to **parse sneakerhead terminology from listing text using
regex**, so that **I can extract condition accurately without AI costs**.

**Acceptance Criteria:**

**Given** a listing title "VNDS Jordan 1 Bred sz 10.5, worn 1x"  
**When** the parser processes it  
**Then** it extracts:

- [ ] Condition: `used_like_new` (from "VNDS")
- [ ] Size: `10.5` (from "sz 10.5")
- [ ] Tags: `["vnds"]`

**And** it handles common abbreviations:

- [ ] DS, deadstock, BNIB → `new_in_box`
- [ ] VNDS → `used_like_new`
- [ ] NDS → `used_good`
- [ ] Worn, used → `used_fair`
- [ ] Beat, beaters → `used_poor`

**And** parsing is fast (<50ms per listing)  
**And** it works on 80%+ of structured listings

**Technical Tasks:**

1. Create `src/utils/sneaker-parser.js`
2. Define regex patterns for conditions:
   ```javascript
   const patterns = [
     { regex: /\b(ds|deadstock|bnib)\b/i, value: 'new_in_box' },
     { regex: /\b(vnds)\b/i, value: 'used_like_new' },
     // ... more patterns
   ];
   ```
3. Implement `parseCondition(text)` function
4. Implement `parseTags(text)` function
5. Create sneaker terminology dictionary
6. Write unit tests (100+ test cases)
7. Benchmark performance

**Dependencies:** None

---

#### US-028: Build Regex-Based Size Parser

**Epic:** EPIC-009 (AI & Regex Parsing Engine)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 4

**User Story:** As a **system**, I want to **extract shoe sizes from unstructured text**, so that
**I can accurately filter listings by size**.

**Acceptance Criteria:**

**Given** a listing title "Jordan 1 Bred Size 10.5 US Men's"  
**When** the parser processes it  
**Then** it extracts size: `10.5`

**And** it handles various formats:

- [ ] "Size 10.5"
- [ ] "sz 10.5"
- [ ] "10.5M"
- [ ] "US 10.5"
- [ ] "10.5 US Men's"
- [ ] "Men's 10.5"

**And** it handles ranges: "Fits 10-10.5" → extract both sizes  
**And** it prioritizes explicit size mentions over ambiguous numbers  
**And** parsing is fast (<50ms per listing)

**Technical Tasks:**

1. Add size parsing to `src/utils/sneaker-parser.js`
2. Define regex patterns for sizes:
   ```javascript
   const sizePatterns = [
     /\b(?:size|sz)[:\s]*([1-9]|1[0-5])(?:\.5)?\b/i,
     /\b(?:us\s*m(?:en's)?)[:\s]*([1-9]|1[0-5])(?:\.5)?\b/i,
     /\b([1-9]|1[0-5])(?:\.5)?\s*(?:US|M)\b/i,
   ];
   ```
3. Implement `parseSize(text)` function
4. Handle edge cases (e.g., "2015" should not be parsed as size)
5. Write unit tests (50+ test cases)
6. Benchmark performance

**Dependencies:** US-027

---

#### US-029: Integrate OpenAI for AI Parsing

**Epic:** EPIC-009 (AI & Regex Parsing Engine)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 4

**User Story:** As a **system**, I want to **use OpenAI API as fallback for ambiguous listings**, so
that **I can extract data that regex cannot parse**.

**Acceptance Criteria:**

**Given** a listing title "Barely worn, feel brand new, size TTS"  
**When** regex parsing fails to extract condition  
**Then** the system calls OpenAI API  
**And** OpenAI returns structured data: `{ "condition": "used_like_new", "size": null }`  
**And** the API call completes in <2 seconds  
**And** the cost per parse is <$0.005

**And** AI parsing is only used when:

- [ ] Regex fails to extract condition
- [ ] User enables AI parsing in advanced options

**And** API key is stored securely  
**And** API failures are handled gracefully (fall back to "unspecified")

**Technical Tasks:**

1. Sign up for OpenAI API
2. Install `openai` package
3. Add to input schema:
   ```json
   {
     "advancedOptions": {
       "useAIParsing": false,
       "openAIKey": "sk-..." // Secret field
     }
   }
   ```
4. Create `src/utils/ai-parser.js`
5. Implement GPT-3.5 Turbo call:
   ```javascript
   const prompt = `Extract sneaker information from: "${title}"\nReturn JSON: { "condition": "...", "size": "...", "colorway": "..." }`;
   const response = await openai.chat.completions.create({
     model: 'gpt-3.5-turbo',
     messages: [{ role: 'user', content: prompt }],
     temperature: 0,
   });
   ```
6. Parse GPT response (extract JSON)
7. Add fallback logic: If regex succeeds, skip AI
8. Add cost tracking (log API calls)
9. Write integration test (mock OpenAI)
10. Test with real ambiguous listings

**Dependencies:** US-027, US-028

---

#### US-030: Optimize AI Parsing Costs

**Epic:** EPIC-009 (AI & Regex Parsing Engine)  
**Priority:** P2 (Medium)  
**Story Points:** 2  
**Sprint:** Sprint 4

**User Story:** As a **business owner**, I want to **minimize OpenAI API costs**, so that **the
feature is profitable**.

**Acceptance Criteria:**

**Given** the actor processes 1,000 listings  
**When** AI parsing is enabled  
**Then** OpenAI is called for <15% of listings (850+ parsed by regex)  
**And** the total cost is <$1.00 per 1,000 listings  
**And** AI-parsed results are cached (same listing not parsed twice)

**Technical Tasks:**

1. Implement caching for AI parsing:
   - Store parsed results in Key-Value Store
   - Key: listing title hash
   - TTL: 7 days
2. Add cost tracking:
   - Log each API call
   - Calculate total cost per run
3. Optimize prompt (shorter = cheaper):
   - Remove unnecessary words
   - Use abbreviations
4. Consider batch parsing (multiple listings in one API call) - advanced
5. Monitor cost metrics:
   - Cost per run
   - % of listings using AI
6. Set budget alert: Warn if cost >$5 per run

**Dependencies:** US-029

---

#### US-031: Implement Hash-Based Deduplication

**Epic:** EPIC-010 (Deduplication System)  
**Priority:** P0 (Critical)  
**Story Points:** 5  
**Sprint:** Sprint 4

**User Story:** As a **sneaker collector**, I want to **only receive alerts for new listings**, so
that **I don't get spammed with duplicates**.

**Acceptance Criteria:**

**Given** the actor runs hourly  
**When** it encounters a listing it saw 1 hour ago  
**Then** it does not include that listing in the alert  
**And** only genuinely new listings trigger notifications

**And** the system tracks:

- [ ] Seen listing hashes (MD5 of platform:id)
- [ ] Rolling window of last 10,000 hashes
- [ ] Hashes expire after 30 days

**And** deduplication reduces alerts by 70-80%  
**And** state persists across runs (Key-Value Store)

**Technical Tasks:**

1. Implement hash generation (MD5 of `${platform}:${listingId}`)
2. Create `src/utils/deduplicator.js`
3. Load seen hashes from KV Store on startup
4. For each listing:
   - Generate hash
   - Check if hash exists in set
   - If new: Add to new listings array, update hash set
   - If seen: Skip
5. Save updated hash set to KV Store
6. Implement rolling window (keep last 10,000)
7. Add hash expiration (remove hashes older than 30 days)
8. Write unit tests
9. Test across multiple scheduled runs

**Dependencies:** US-012 (Hash Storage)

---

#### US-032: Implement Price Change Detection

**Epic:** EPIC-010 (Deduplication System)  
**Priority:** P2 (Medium)  
**Story Points:** 5  
**Sprint:** Sprint 4

**User Story:** As a **sneaker reseller**, I want to **be notified when a previously seen listing
drops in price**, so that **I can capitalize on price reductions**.

**Acceptance Criteria:**

**Given** a listing was scraped at $1,000 yesterday  
**When** the same listing is scraped today at $850  
**Then** the system detects a 15% price drop  
**And** it sends a "Price Drop Alert" notification  
**And** the alert highlights: Original price, new price, savings %

**And** price history is tracked:

- [ ] Current price
- [ ] Previous price
- [ ] Price history (last 5 prices)
- [ ] First seen date

**Technical Tasks:**

1. Extend deduplicator to track prices
2. Store price data in KV Store:
   - Key: `price_${listingHash}`
   - Value: `{ currentPrice, previousPrice, priceHistory[], firstSeen, lastUpdated }`
3. On each run:
   - Load previous price
   - Compare to current price
   - If drop >10%: Add to "Price Drop Alerts" array
4. Create separate notification for price drops
5. Add price drop section to email template
6. Write unit tests
7. Test with real listings (find listings that change price)

**Dependencies:** US-031

---

#### US-033: Add Deduplication Statistics

**Epic:** EPIC-010 (Deduplication System)  
**Priority:** P3 (Low)  
**Story Points:** 2  
**Sprint:** Sprint 4

**User Story:** As a **user**, I want to **see deduplication statistics in the run log**, so that
**I understand how many new vs. seen listings were found**.

**Acceptance Criteria:**

**Given** the actor completes a run  
**When** I view the log  
**Then** it displays:

- [ ] Total listings scraped: 150
- [ ] New listings: 45
- [ ] Seen listings (deduplicated): 105
- [ ] Price drops detected: 3

**And** the statistics are accurate  
**And** the log is clear and easy to read

**Technical Tasks:**

1. Add counters in deduplicator:
   - `totalScraped = 0`
   - `newListings = 0`
   - `seenListings = 0`
   - `priceDrops = 0`
2. Log statistics at end of run:
   ```javascript
   Actor.log.info('Deduplication Summary', {
     totalScraped,
     newListings,
     seenListings,
     priceDrops,
   });
   ```
3. Add summary to email notification (optional)

**Dependencies:** US-031, US-032

---

#### US-034: Scrape The Drop Date Release Calendar

**Epic:** EPIC-011 (Release Calendar Monitoring)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 5

**User Story:** As a **sneaker collector**, I want to **be alerted about upcoming sneaker
releases**, so that **I can prepare to buy at retail before resale prices spike**.

**Acceptance Criteria:**

**Given** The Drop Date publishes release calendars  
**When** the actor runs with release calendar enabled  
**Then** it scrapes upcoming releases for the next 30 days  
**And** it extracts:

- [ ] Sneaker name
- [ ] Release date
- [ ] Retail price
- [ ] SKU
- [ ] Brand (Nike, Adidas, etc.)
- [ ] Image URL

**And** the data is saved to a separate dataset (`release_calendar`)  
**And** the scraper runs daily (scheduled)

**Technical Tasks:**

1. Analyze The Drop Date website structure (thedropdate.com)
2. Create `src/scrapers/calendar/the-drop-date.js`
3. Use Cheerio crawler (HTML parsing)
4. Extract release data from calendar page
5. Normalize to release calendar schema:
   ```javascript
   {
     name: "Air Jordan 1 Lost and Found",
     releaseDate: "2025-11-15",
     retailPrice: 180,
     sku: "DZ5485-612",
     brand: "Nike",
     imageUrl: "https://...",
     raffleLinks: [],
     source: "The Drop Date",
   }
   ```
6. Save to separate dataset: `await Actor.pushData(releases, { datasetId: 'release_calendar' })`
7. Write integration test
8. Schedule daily run (9 AM)

**Dependencies:** US-004 (Scraper Manager)

---

#### US-035: Scrape Sole Retriever Release Calendar

**Epic:** EPIC-011 (Release Calendar Monitoring)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 5

**User Story:** As a **sneaker collector**, I want to **have backup release calendar sources**, so
that **I don't miss releases if one site goes down**.

**Acceptance Criteria:**

**Given** Sole Retriever publishes release calendars  
**When** the actor runs  
**Then** it scrapes Sole Retriever as a second source  
**And** it extracts the same data as The Drop Date  
**And** releases are deduplicated across both sources (same SKU = same release)

**Technical Tasks:**

1. Analyze Sole Retriever (soleretriever.com)
2. Create `src/scrapers/calendar/sole-retriever.js`
3. Use Playwright (JavaScript rendering required)
4. Extract release data
5. Normalize to same schema
6. Implement cross-source deduplication:
   - If SKU matches, merge data (prefer The Drop Date as primary)
7. Write integration test

**Dependencies:** US-034

---

#### US-036: Send Release Calendar Notifications

**Epic:** EPIC-011 (Release Calendar Monitoring)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 5

**User Story:** As a **sneaker collector**, I want to **receive a daily digest of upcoming
releases**, so that **I can plan my purchases**.

**Acceptance Criteria:**

**Given** the release calendar is updated daily  
**When** 9 AM user timezone arrives  
**Then** a digest email is sent with:

- [ ] All releases in the next 7 days
- [ ] Releases organized by date
- [ ] Release details: name, date, price, image
- [ ] Links to raffle entries (if available)

**And** high-priority releases (limited editions, collaborations) get a separate alert 24 hours
before release  
**And** users can disable release calendar notifications in input

**Technical Tasks:**

1. Add to input schema:
   ```json
   {
     "enableReleaseCalendar": false,
     "releaseNotificationTime": "09:00" // HH:MM format
   }
   ```
2. Create daily digest email template: `src/templates/release-digest.html`
3. Implement digest logic:
   - Load releases from dataset
   - Filter: Next 7 days
   - Sort by date
4. Send email at configured time (use scheduled run)
5. Implement high-priority alerts:
   - Detect keywords: "Off-White", "Travis Scott", "Limited", "Collab"
   - Send separate alert 24 hours before release
6. Write integration test
7. Test with real release calendar data

**Dependencies:** US-034, US-035, US-010 (Email notifications)

---

#### US-037: Build Price Database for Grail Sneakers

**Epic:** EPIC-012 (Deal Scoring & Price Tracking)  
**Priority:** P2 (Medium)  
**Story Points:** 3  
**Sprint:** Sprint 5

**User Story:** As a **system**, I want to **have a database of market values for popular
sneakers**, so that **I can calculate deal scores without scraping high-risk platforms**.

**Acceptance Criteria:**

**Given** I have researched market values  
**When** the database is created  
**Then** it includes 100+ popular sneakers with:

- [ ] Product name
- [ ] SKU
- [ ] Average market value (from public sources)
- [ ] Last updated date
- [ ] Source (e.g., "StockX 2025-11 average")

**And** the database is stored as JSON: `src/data/price-database.json`  
**And** users can override values in input

**Technical Tasks:**

1. Research market values for top 100 grail sneakers:
   - Source: Reddit r/Sneakers pricing guides
   - Source: Public price guides
   - Source: YouTube reseller videos
2. Create `src/data/price-database.json`:
   ```json
   [
     {
       "name": "Air Jordan 1 Retro High OG 'Bred' (2016)",
       "sku": "555088-001",
       "marketValue": 950,
       "currency": "USD",
       "lastUpdated": "2025-11-10",
       "source": "Reddit r/Sneakers Average"
     }
   ]
   ```
3. Add helper function: `getPriceFromDatabase(sku)`
4. Allow user overrides in input:
   ```json
   {
     "customMarketValues": {
       "555088-001": 1000
     }
   }
   ```
5. Document in README (how to find SKUs)

**Dependencies:** None

---

#### US-038: Implement Deal Scoring Algorithm

**Epic:** EPIC-012 (Deal Scoring & Price Tracking)  
**Priority:** P2 (Medium)  
**Story Points:** 5  
**Sprint:** Sprint 5

**User Story:** As a **sneaker reseller**, I want to **see a deal score for each listing**, so that
**I can quickly identify underpriced items**.

**Acceptance Criteria:**

**Given** a listing is priced at $750 and market value is $950  
**When** the deal score is calculated  
**Then** it shows:

- [ ] Savings: $200
- [ ] Savings %: 21.1%
- [ ] Deal score: "EXCELLENT DEAL" (>20% savings)

**And** deal scores are categorized:

- [ ] **EXCELLENT:** ≥30% below market
- [ ] **GOOD:** 20-29% below market
- [ ] **FAIR:** 10-19% below market
- [ ] **MARKET PRICE:** 0-9% below market
- [ ] **ABOVE MARKET:** Priced higher than market

**And** listings are sorted by deal score (best deals first)  
**And** deal scores are highlighted in email notifications

**Technical Tasks:**

1. Create `src/utils/deal-scorer.js`
2. Implement scoring logic:
   ```javascript
   function calculateDealScore(listing, marketValue) {
     const savings = marketValue - listing.listing.price;
     const savingsPercentage = (savings / marketValue) * 100;

     let dealScore;
     if (savingsPercentage >= 30) dealScore = 'EXCELLENT DEAL';
     else if (savingsPercentage >= 20) dealScore = 'GOOD DEAL';
     else if (savingsPercentage >= 10) dealScore = 'FAIR DEAL';
     else dealScore = 'MARKET PRICE';

     return { savings, savingsPercentage, dealScore };
   }
   ```
3. Integrate with main pipeline:
   - Look up market value for each listing
   - Calculate deal score
   - Add `dealScore` field to listing object
4. Sort listings by savings percentage (best first)
5. Update email template: Highlight deal score with badge
6. Write unit tests (various scenarios)
7. Test with real listings

**Dependencies:** US-037

---

#### US-039: Add Price History Tracking

**Epic:** EPIC-012 (Deal Scoring & Price Tracking)  
**Priority:** P3 (Low)  
**Story Points:** 3  
**Sprint:** Sprint 5

**User Story:** As a **sneaker reseller**, I want to **see price history for a listing**, so that
**I can understand if the price is trending up or down**.

**Acceptance Criteria:**

**Given** a listing has been seen multiple times over 7 days  
**When** I view the listing in the dataset  
**Then** it includes price history:

- [ ] `priceHistory`: Array of `{ price, date }` objects
- [ ] Current price
- [ ] Lowest price seen
- [ ] Highest price seen
- [ ] Price trend: "DROPPING", "STABLE", "RISING"

**And** price history is stored for up to 30 days  
**And** price trends are displayed in notifications (optional)

**Technical Tasks:**

1. Extend deduplicator to track full price history (not just previous price)
2. Store in KV Store:
   ```javascript
   {
     listingHash: "abc123",
     priceHistory: [
       { price: 1000, date: "2025-11-01" },
       { price: 950, date: "2025-11-03" },
       { price: 900, date: "2025-11-10" },
     ],
     lowestPrice: 900,
     highestPrice: 1000,
     trend: "DROPPING"
   }
   ```
3. Calculate trend:
   - If latest price < average of last 3: "DROPPING"
   - If latest price > average of last 3: "RISING"
   - Else: "STABLE"
4. Add price history to dataset output (optional field)
5. Display in email notifications (for price drops)
6. Write unit tests

**Dependencies:** US-032 (Price Change Detection)

---

#### US-040: Configure Apify Monetization

**Epic:** EPIC-013 (Premium Features & Tiers)  
**Priority:** P1 (High)  
**Story Points:** 2  
**Sprint:** Sprint 5

**User Story:** As a **business owner**, I want to **set up paid tiers on Apify**, so that **I can
generate revenue from the actor**.

**Acceptance Criteria:**

**Given** the actor is ready for monetization  
**When** I configure pricing in Apify Console  
**Then** I set up 3 tiers:

- [ ] **Hobby:** $4.99/month
- [ ] **Pro:** $9.99/month
- [ ] **Business:** $29.99/month (optional for MVP)

**And** I enable 14-day free trial (Pro plan)  
**And** I configure payout method (PayPal or bank transfer)  
**And** the pricing is visible on Apify Store listing

**Technical Tasks:**

1. Navigate to Actor → Monetization in Apify Console
2. Enable "Paid Actor"
3. Set pricing:
   - Monthly rental model
   - Hobby: $4.99/month
   - Pro: $9.99/month
   - Business: $29.99/month
4. Enable free trial: 14 days, Pro plan
5. Set up payout:
   - Link PayPal account
   - Or provide bank details
6. Update Apify Store listing:
   - Add pricing table
   - Explain tier differences
7. Test payment flow (use test card if available)

**Dependencies:** US-013, US-042 (Tier enforcement must be implemented)

---

#### US-041: Implement Tier Enforcement Logic

**Epic:** EPIC-013 (Premium Features & Tiers)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 5

**User Story:** As a **business owner**, I want to **enforce tier limits**, so that **users must
upgrade to access premium features**.

**Acceptance Criteria:**

**Given** a user is on the Free tier  
**When** they try to scrape 3 platforms  
**Then** the actor throws an error: "Upgrade to Hobby plan for 3 platforms"  
**And** the error message includes upgrade link

**And** tier limits are enforced:

- [ ] Free: 1 platform, 10 results, no alerts
- [ ] Hobby: 3 platforms, 50 results, email alerts
- [ ] Pro: 12 platforms, 500 results, all features

**And** the enforcement is clear and user-friendly

**Technical Tasks:**

1. Add `subscriptionTier` to input schema:
   ```json
   {
     "subscriptionTier": {
       "type": "string",
       "enum": ["free", "hobby", "pro", "business"],
       "default": "free"
     }
   }
   ```
2. Define tier limits: `src/config/tiers.js`
   ```javascript
   const TIER_LIMITS = {
     free: { platforms: 1, maxResults: 10, alerts: false, webhook: false, aiParsing: false },
     hobby: { platforms: 3, maxResults: 50, alerts: true, webhook: false, aiParsing: false },
     pro: { platforms: 12, maxResults: 500, alerts: true, webhook: true, aiParsing: true },
   };
   ```
3. Implement enforcement in main.js:
   ```javascript
   const limits = TIER_LIMITS[input.subscriptionTier];
   if (input.platforms.length > limits.platforms) {
     throw new Error(
       `Upgrade to Hobby for ${input.platforms.length} platforms. Visit: https://apify.com/...`
     );
   }
   ```
4. Add upgrade prompts throughout:
   - Input validation
   - Feature usage (e.g., AI parsing)
5. Write unit tests for enforcement
6. Test all tiers manually

**Dependencies:** US-040

---

#### US-042: Add Analytics Tracking

**Epic:** EPIC-013 (Premium Features & Tiers)  
**Priority:** P2 (Medium)  
**Story Points:** 2  
**Sprint:** Sprint 5

**User Story:** As a **business owner**, I want to **track user behavior and conversions**, so that
**I can optimize pricing and features**.

**Acceptance Criteria:**

**Given** users are running the actor  
**When** I view analytics  
**Then** I can see:

- [ ] Total runs per tier
- [ ] Free trial → Paid conversion rate
- [ ] Most popular platforms
- [ ] Average runtime per tier
- [ ] Error rates per platform

**And** analytics are available in Apify Console  
**And** I can export data for analysis

**Technical Tasks:**

1. Use Apify built-in analytics (Actor → Analytics in Console)
2. Add custom events (optional):
   ```javascript
   Actor.log.info('User upgraded to Pro', { tier: 'pro' });
   ```
3. Track key metrics:
   - Runs per day
   - Unique users
   - Tier distribution
4. Set up weekly report:
   - Email summary of key metrics
5. Create spreadsheet for manual tracking:
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - ARPU (Average Revenue Per User)
6. Use data to inform pricing decisions

**Dependencies:** US-040, US-041

---

### Phase 4: Polish & Launch (User Stories 43-54)

---

#### US-043: Integrate Mercari Scraper (Beta)

**Epic:** EPIC-014 (Platform Integration Batch 3)  
**Priority:** P2 (Medium)  
**Story Points:** 8  
**Sprint:** Sprint 6

**User Story:** As a **sneaker collector**, I want to **search Mercari for sneakers**, so that **I
can find deals on a popular marketplace**.

**Acceptance Criteria:**

**Given** I enable Mercari (marked as BETA)  
**When** the actor runs  
**Then** it attempts to scrape Mercari using internal GraphQL API  
**And** if successful, it retrieves 20+ listings  
**And** if it fails, the actor continues with other platforms (graceful degradation)  
**And** the user is notified of the failure in the log

**And** Mercari is marked as "BETA" in input schema  
**And** the README warns about reliability issues

**Technical Tasks:**

1. Reverse engineer Mercari GraphQL API (complex)
2. Create `src/scrapers/mercari-scraper.js`
3. Implement Cloudflare bypass (residential proxies required)
4. Build GraphQL query
5. Handle aggressive rate limits (100 req/hour max)
6. Add failure handling:
   ```javascript
   try {
     const listings = await scrapeMercari();
   } catch (error) {
     Actor.log.warning('Mercari scraping failed (BETA), continuing...', { error });
     return []; // Graceful degradation
   }
   ```
7. Mark as BETA in input schema:
   ```json
   {
     "platforms": {
       "enum": ["goat", "ebay", "mercari (BETA)", ...]
     }
   }
   ```
8. Write integration test (expect some failures)
9. Monitor failure rate (auto-disable if >50% for 7 days)

**Dependencies:** US-004

**Note:** High risk, low priority. If too difficult, consider excluding.

---

#### US-044: Integrate OfferUp Scraper (Beta)

**Epic:** EPIC-014 (Platform Integration Batch 3)  
**Priority:** P2 (Medium)  
**Story Points:** 8  
**Sprint:** Sprint 6

**User Story:** As a **sneaker collector**, I want to **search OfferUp for sneakers**, so that **I
can find local deals**.

**Acceptance Criteria:**

**Given** I enable OfferUp (marked as BETA)  
**When** the actor runs  
**Then** it attempts to scrape OfferUp using Playwright (browser automation)  
**And** if successful, it retrieves 20+ listings  
**And** if it fails, the actor continues with other platforms

**And** OfferUp is marked as "BETA"  
**And** scraping is slow (10-15 second delays between requests)

**Technical Tasks:**

1. Create `src/scrapers/offerup-scraper.js`
2. Use Playwright crawler (JavaScript rendering)
3. Handle Cloudflare protection
4. Implement aggressive delays (10-15 seconds between requests)
5. Configure residential proxies
6. Extract data from HTML/CSS selectors
7. Add failure handling (graceful degradation)
8. Mark as BETA in input schema
9. Write integration test
10. Monitor failure rate

**Dependencies:** US-004

**Note:** High risk, low priority. Scraping may be very slow (5+ minutes).

---

#### US-045: Integrate Vinted Scraper

**Epic:** EPIC-014 (Platform Integration Batch 3)  
**Priority:** P3 (Low)  
**Story Points:** 5  
**Sprint:** Sprint 6

**User Story:** As a **sneaker collector in the EU**, I want to **search Vinted for sneakers**, so
that **I can find deals in Europe**.

**Acceptance Criteria:**

**Given** I enable Vinted  
**When** the actor runs  
**Then** it scrapes Vinted using internal API  
**And** it retrieves 20+ listings  
**And** it handles geographic restrictions (EU proxies required)

**And** the README notes Vinted is EU-focused (limited US presence)

**Technical Tasks:**

1. Analyze Vinted API (varies by country: .com, .fr, .de, etc.)
2. Create `src/scrapers/vinted-scraper.js`
3. Build API request
4. Configure EU proxies (Apify proxy with country: DE, FR, etc.)
5. Handle geographic restrictions
6. Add failure handling
7. Write integration test
8. Document in README (EU-focused)

**Dependencies:** US-004

**Note:** Low priority due to limited US market presence.

---

#### US-046: Write Unit and Integration Tests

**Epic:** EPIC-015 (Testing & Quality Assurance)  
**Priority:** P0 (Critical)  
**Story Points:** 8  
**Sprint:** Sprint 6

**User Story:** As a **developer**, I want to **have comprehensive test coverage**, so that **I can
confidently deploy to production**.

**Acceptance Criteria:**

**Given** the codebase is complete  
**When** I run tests  
**Then** all tests pass  
**And** code coverage is ≥80%  
**And** critical functions have 100% coverage:

- [ ] Data normalization
- [ ] Parsing (condition, size)
- [ ] Deduplication
- [ ] Hash generation

**Technical Tasks:**

1. Set up Jest testing framework
2. Write unit tests:
   - `__tests__/normalizer.test.js` (test each platform normalizer)
   - `__tests__/parser.test.js` (100+ test cases for parsing)
   - `__tests__/deduplicator.test.js` (hash generation, dedup logic)
   - `__tests__/deal-scorer.test.js` (scoring algorithm)
3. Write integration tests:
   - `__tests__/integration/ebay.test.js` (mock eBay API, test end-to-end)
   - `__tests__/integration/grailed.test.js`
   - `__tests__/integration/email.test.js` (mock SendGrid)
4. Set up code coverage: `jest --coverage`
5. Aim for 80%+ coverage
6. Add to CI/CD (optional: GitHub Actions)
7. Document testing in README

**Dependencies:** All core features must be complete

---

#### US-047: Perform End-to-End Testing

**Epic:** EPIC-015 (Testing & Quality Assurance)  
**Priority:** P0 (Critical)  
**Story Points:** 5  
**Sprint:** Sprint 6

**User Story:** As a **QA tester**, I want to **run the actor end-to-end**, so that **I can verify
it works in production**.

**Acceptance Criteria:**

**Given** the actor is deployed  
**When** I run E2E tests  
**Then** the actor successfully:

- [ ] Scrapes 6 platforms (eBay, Grailed, Kixify, Poshmark, Depop, Craigslist)
- [ ] Normalizes all data correctly
- [ ] Deduplicates across runs
- [ ] Sends email notification
- [ ] Saves data to dataset
- [ ] Completes in <10 minutes

**And** I test multiple scenarios:

- [ ] New user (first run)
- [ ] Returning user (second run with deduplication)
- [ ] Empty results (no matching listings)
- [ ] Platform failure (one platform down)

**Technical Tasks:**

1. Create E2E test suite: `__tests__/e2e/full-run.test.js`
2. Use Apify Test Runner or manual tests
3. Test with real input:
   ```json
   {
     "searchTerms": ["Jordan 1 Bred"],
     "platforms": ["ebay", "grailed", "kixify"],
     "notificationEmail": "test@example.com"
   }
   ```
4. Verify outputs:
   - Check dataset (correct schema)
   - Check email received
   - Check logs (no errors)
5. Test edge cases:
   - No results found
   - One platform fails
   - Invalid input
6. Run 10 consecutive E2E tests (ensure consistency)
7. Document test results

**Dependencies:** US-046

---

#### US-048: Conduct Beta Testing with Community

**Epic:** EPIC-015 (Testing & Quality Assurance)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 6

**User Story:** As a **product owner**, I want to **recruit beta testers from sneaker communities**,
so that **I get real-world feedback before public launch**.

**Acceptance Criteria:**

**Given** the actor is production-ready  
**When** I recruit 10+ beta testers  
**Then** they test the actor for 1 week  
**And** they provide feedback via survey:

- [ ] Ease of use (1-5 scale)
- [ ] Feature satisfaction (1-5 scale)
- [ ] Bugs encountered
- [ ] Feature requests

**And** I collect 10+ responses  
**And** average satisfaction ≥4.0/5.0  
**And** critical bugs are fixed before launch

**Technical Tasks:**

1. Create beta tester recruitment post:
   - Reddit r/Sneakers: "Free tool to find sneaker deals - looking for testers"
   - Discord servers: "Testing a new sneaker alert bot"
2. Set up Discord #beta-testers channel
3. Provide beta testers with:
   - Free Pro plan access (14 days)
   - Setup instructions
   - Feedback survey (Google Forms)
4. Monitor feedback daily
5. Fix critical bugs immediately
6. Implement high-value feature requests
7. Thank beta testers (offer lifetime discount or free month)

**Dependencies:** US-047

---

#### US-049: Launch Reddit Marketing Campaign

**Epic:** EPIC-016 (Marketing & User Acquisition)  
**Priority:** P1 (High)  
**Story Points:** 3  
**Sprint:** Sprint 6

**User Story:** As a **marketer**, I want to **promote the actor on Reddit**, so that **I acquire
first users organically**.

**Acceptance Criteria:**

**Given** the actor is live on Apify Store  
**When** I execute Reddit marketing  
**Then** I post in 5+ relevant subreddits:

- [ ] r/Sneakers (2.9M members)
- [ ] r/SneakerMarket (100K members)
- [ ] r/Flipping (170K members)
- [ ] r/Reselling (50K members)
- [ ] r/AutomateYourself (50K members)

**And** posts provide value first (not just promotion):

- Example: "I built a tool that found me these deals [images] - here's how"
- Mention tool in comments when users ask

**And** I achieve:

- [ ] 50+ upvotes per post (target)
- [ ] 20+ comment engagements
- [ ] 50+ users try the actor

**Technical Tasks:**

1. Write 5 Reddit posts (value-first approach):
   - Post 1 (r/Sneakers): "Found these deals using automation [images + story]"
   - Post 2 (r/SneakerMarket): "PSA: How to find sneaker deals across 12 platforms"
   - Post 3 (r/Flipping): "I automated sneaker deal hunting - here's my setup"
   - Post 4 (r/Reselling): "Free tool for monitoring resale opportunities"
   - Post 5 (r/AutomateYourself): "Built an Apify actor for sneaker alerts"
2. Schedule posts (space out over 1 week)
3. Respond to comments within 1 hour
4. Track analytics:
   - Post views (Reddit Insights)
   - Actor runs from Reddit traffic (Apify Analytics)
5. Adjust strategy based on performance

**Dependencies:** US-048 (Beta testing complete)

---

#### US-050: Create YouTube Tutorial Content

**Epic:** EPIC-016 (Marketing & User Acquisition)  
**Priority:** P1 (High)  
**Story Points:** 5  
**Sprint:** Sprint 6

**User Story:** As a **content creator**, I want to **publish YouTube tutorials**, so that **I reach
a wider audience and demonstrate value**.

**Acceptance Criteria:**

**Given** the actor is fully documented  
**When** I create YouTube videos  
**Then** I publish 3-4 videos:

- [ ] Video 1: "How to Find Sneaker Deals with Automation (Free Tool)" [5-7 min]
- [ ] Video 2: "SneakerMeta Setup Guide - Step-by-Step Tutorial" [8-10 min]
- [ ] Video 3: "I Made $500 Flipping Sneakers Using This Tool" [success story, 7-10 min]
- [ ] Video 4 (optional): "Ultimate Sneaker Reselling Automation Stack" [15-20 min]

**And** videos are optimized for SEO:

- [ ] Keywords in title: "sneaker", "deals", "automation", "reselling"
- [ ] Tags: "sneaker reselling", "sneaker deals", "Apify", "web scraping"
- [ ] Thumbnail: Eye-catching with text overlay

**And** videos get 500+ views total (target)

**Technical Tasks:**

1. Write video scripts (4 videos, ~1,000 words each)
2. Record screen captures (OBS Studio or Loom)
3. Record voiceover (clear audio)
4. Edit videos (cut unnecessary parts, add transitions, background music)
5. Create custom thumbnails (Canva)
6. Upload to YouTube (public)
7. Optimize SEO:
   - Title, description, tags
   - Add timestamps
   - Include links in description (Apify Store, GitHub)
8. Share on Reddit, Discord, Twitter
9. Track analytics (views, CTR, subscribers)

**Dependencies:** US-015 (Demo video), US-048 (Beta testing for success stories)

---

#### US-051: Execute Discord Community Marketing

**Epic:** EPIC-016 (Marketing & User Acquisition)  
**Priority:** P2 (Medium)  
**Story Points:** 3  
**Sprint:** Sprint 6

**User Story:** As a **community manager**, I want to **engage with sneaker Discord servers**, so
that **I build relationships and acquire users organically**.

**Acceptance Criteria:**

**Given** Discord is a primary channel for sneakerheads  
**When** I join 20+ sneaker Discord servers  
**Then** I provide value first:

- [ ] Share deals found by the actor
- [ ] Answer questions about sneaker hunting
- [ ] Share release calendar info

**And** I mention the tool naturally (when users ask "how did you find that?")  
**And** I achieve:

- [ ] 30+ users from Discord
- [ ] Positive community reputation (no spam complaints)

**Technical Tasks:**

1. Research and join 20 sneaker Discord servers:
   - Use directories: disboard.org, top.gg
   - Search: "sneaker Discord", "cook group"
2. Create value-first strategy:
   - Daily: Post 1-2 good deals found by actor
   - Weekly: Share release calendar highlights
   - Answer questions in #general and #deals channels
3. Mention tool organically:
   - When users ask: "How did you find this?"
   - Response: "I use a tool I built that monitors 12 platforms. DM me if you want the link."
4. Track referrals:
   - Use UTM parameters: `?utm_source=discord&utm_medium=organic`
5. Avoid spam:
   - Read server rules
   - Don't post promotional content in #general
   - Only share tool when relevant

**Dependencies:** US-048

---

#### US-052: Set Up Customer Support Channels

**Epic:** EPIC-017 (Monetization & Business Operations)  
**Priority:** P1 (High)  
**Story Points:** 2  
**Sprint:** Sprint 6

**User Story:** As a **business owner**, I want to **provide support channels**, so that **users can
get help when they encounter issues**.

**Acceptance Criteria:**

**Given** users are running the actor  
**When** they have questions or issues  
**Then** they can reach support via:

- [ ] Email: support@sneakermeta.com (or Gmail)
- [ ] Discord: #support channel in SneakerMeta server
- [ ] GitHub Issues (for bugs)

**And** response time is <24 hours for emails  
**And** response time is <2 hours for Discord during business hours  
**And** common issues are documented in FAQ

**Technical Tasks:**

1. Set up support email:
   - Use Gmail or custom domain
   - Create email signature with links to docs
2. Create Discord server (optional) or use channel in beta server:
   - #support channel
   - #announcements channel
   - #general channel
3. Enable GitHub Issues on public repo
4. Write FAQ document: `docs/FAQ.md`
   - Common issues: API key errors, scraping failures, email not received
   - Solutions and troubleshooting steps
5. Add support links to README and Apify Store listing
6. Set up email notifications for support requests
7. Track support metrics:
   - Number of requests
   - Average response time
   - Common issues

**Dependencies:** US-040 (Monetization must be live)

---

#### US-053: Monitor Revenue and User Metrics

**Epic:** EPIC-017 (Monetization & Business Operations)  
**Priority:** P1 (High)  
**Story Points:** 2  
**Sprint:** Sprint 6

**User Story:** As a **business owner**, I want to **track revenue and user metrics**, so that **I
can measure success and make data-driven decisions**.

**Acceptance Criteria:**

**Given** the actor has paying users  
**When** I check metrics weekly  
**Then** I track:

- [ ] **MRR (Monthly Recurring Revenue):** Total subscription revenue per month
- [ ] **Total Users:** Free + Paid
- [ ] **Paying Users:** Count of paid subscribers
- [ ] **ARPU (Average Revenue Per User):** MRR / Paying Users
- [ ] **Conversion Rate:** Free trial → Paid %
- [ ] **Churn Rate:** % of users who cancel
- [ ] **Run Frequency:** Average runs per user per week

**And** I use data to:

- [ ] Optimize pricing (A/B test $4.99 vs. $7.99)
- [ ] Identify churn reasons (survey canceling users)
- [ ] Prioritize feature development (based on usage)

**Technical Tasks:**

1. Use Apify built-in analytics (Actor → Analytics)
2. Create tracking spreadsheet (Google Sheets):
   - Week, MRR, Total Users, Paying Users, ARPU, Conversion Rate
3. Set up weekly reminder to update metrics
4. Create simple dashboard (Google Sheets charts):
   - MRR over time (line chart)
   - User growth (line chart)
   - Tier distribution (pie chart)
5. Set goals:
   - Week 12: $500 MRR
   - Week 16: $1,000 MRR
   - Week 24: $2,000 MRR
6. Adjust marketing and pricing based on data

**Dependencies:** US-040, US-041

---

#### US-054: Prepare for Scale and Future Features

**Epic:** EPIC-017 (Monetization & Business Operations)  
**Priority:** P3 (Low)  
**Story Points:** 3  
**Sprint:** Sprint 6

**User Story:** As a **business owner**, I want to **plan for future growth**, so that **I can scale
the product and add new features**.

**Acceptance Criteria:**

**Given** the MVP is live and successful  
**When** I plan future roadmap  
**Then** I document:

- [ ] **Phase 5 (Months 4-6):** Features to add
  - SMS notifications (Twilio integration)
  - Push notifications (OneSignal)
  - Price drop alerts (enhanced)
  - White-label option (for reseller groups)
- [ ] **Phase 6 (Months 7-12):** Scale and optimize
  - Add 5 more platforms (Flight Club, Stadium Goods, etc.)
  - Improve AI parsing accuracy
  - Build companion web app (dashboard)
  - Hire part-time developer
- [ ] **Exit Strategy (Year 2):** Consider acquisition or continue growth

**And** I maintain a public roadmap (GitHub Projects or Trello)  
**And** I collect user feedback for prioritization

**Technical Tasks:**

1. Create public roadmap document: `docs/ROADMAP.md`
2. List potential future features:
   - SMS alerts
   - Push notifications
   - Mobile app (iOS/Android)
   - Advanced analytics (price trends, market insights)
   - API access for enterprise
   - Automated bidding (controversial, research legality)
3. Set up user feedback system:
   - Google Form: "Feature Requests"
   - Discord #feature-requests channel
   - GitHub Discussions
4. Prioritize based on:
   - User demand (votes)
   - Revenue impact
   - Development effort
5. Document in README: "Coming Soon" section

**Dependencies:** All MVP features complete

---

## 5. Sprint Planning

### Sprint Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SPRINT TIMELINE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Sprint 1 (W1-2)   Sprint 2 (W3-4)   Sprint 3 (W5-6)                   │
│  MVP Foundation    MVP Completion     Expansion                         │
│  26 pts            24 pts             28 pts                            │
│                                                                          │
│  Sprint 4 (W7-8)   Sprint 5 (W9-10)  Sprint 6 (W11-12)                 │
│  Advanced Feat.    Advanced Feat.     Polish & Launch                   │
│  31 pts            29 pts             28 pts                            │
│                                                                          │
│  TOTAL: 166 story points over 12 weeks (avg: 27.7 pts/sprint)          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Sprint 1: MVP Foundation (Weeks 1-2)

**Sprint Goal:** Build core architecture and integrate first platform (eBay)

**Team Capacity:** 40 hours/week (solo developer, 2-week sprint = 80 hours total)  
**Planned Story Points:** 26  
**Expected Velocity:** 20-25 (first sprint, learning curve)

**Sprint Backlog:**

| ID        | User Story                        | Points | Priority | Assignee | Status |
| --------- | --------------------------------- | ------ | -------- | -------- | ------ |
| US-001    | Initialize Apify Actor Project    | 2      | P0       | Dev      | To Do  |
| US-002    | Design Standardized Output Schema | 3      | P0       | Dev      | To Do  |
| US-003    | Build Data Normalization Engine   | 5      | P0       | Dev      | To Do  |
| US-004    | Implement Scraper Manager         | 5      | P0       | Dev      | To Do  |
| US-005    | Integrate eBay Finding API        | 5      | P0       | Dev      | To Do  |
| US-006    | Integrate Grailed Scraper         | 5      | P0       | Dev      | To Do  |
| US-007    | Integrate Kixify Scraper          | 3      | P0       | Dev      | To Do  |
| **TOTAL** |                                   | **28** |          |          |        |

**Daily Breakdown (Example):**

**Week 1:**

- **Day 1-2:** US-001, US-002 (Project setup, schema design)
- **Day 3-4:** US-003 (Normalization engine)
- **Day 5:** US-004 (Scraper manager - start)

**Week 2:**

- **Day 1-2:** US-004 (Scraper manager - complete)
- **Day 3:** US-005 (eBay API integration)
- **Day 4:** US-006 (Grailed scraper)
- **Day 5:** US-007 (Kixify scraper), Sprint Review

**Sprint Ceremonies:**

**Sprint Planning (Monday, Week 1):**

- Review product backlog
- Select stories for Sprint 1
- Assign story points
- Define sprint goal
- Identify blockers: eBay API approval (apply Day 1)

**Daily Standup (Every day, 15 min):**

- What did I complete yesterday?
- What will I work on today?
- Any blockers?

**Sprint Review (Friday, Week 2):**

- Demo: Show eBay + Grailed + Kixify working
- Get feedback from beta tester(s)
- Update product backlog

**Sprint Retrospective (Friday, Week 2):**

- What went well?
- What could be improved?
- Action items for Sprint 2

**Risks:**

- ⚠️ **eBay API approval delays** - Mitigation: Apply Day 1, have HTML scraping backup
- ⚠️ **Grailed API changes** - Mitigation: Flexible parsing, error handling

---

### Sprint 2: MVP Completion (Weeks 3-4)

**Sprint Goal:** Complete MVP with email notifications, data management, and documentation. Submit
to Apify Challenge.

**Team Capacity:** 80 hours  
**Planned Story Points:** 24  
**Expected Velocity:** 25-30 (optimized workflow)

**Sprint Backlog:**

| ID        | User Story                           | Points | Priority | Assignee | Status |
| --------- | ------------------------------------ | ------ | -------- | -------- | ------ |
| US-008    | Set Up SendGrid Email Integration    | 3      | P0       | Dev      | To Do  |
| US-009    | Design HTML Email Template           | 3      | P0       | Dev      | To Do  |
| US-010    | Implement Email Notification Logic   | 5      | P0       | Dev      | To Do  |
| US-011    | Implement Apify Dataset Storage      | 2      | P0       | Dev      | To Do  |
| US-012    | Implement Deduplication Hash Storage | 3      | P1       | Dev      | To Do  |
| US-013    | Support Scheduled Runs               | 2      | P1       | Dev      | To Do  |
| US-014    | Write Comprehensive README           | 3      | P0       | Dev      | To Do  |
| US-015    | Create Demo Video                    | 3      | P0       | Dev      | To Do  |
| US-016    | Submit to Apify Challenge            | 2      | P0       | Dev      | To Do  |
| **TOTAL** |                                      | **26** |          |          |        |

**Key Milestones:**

- **End of Week 3:** Notifications working, data storage complete
- **End of Week 4:** Documentation complete, Apify Challenge submission

**Sprint Review:**

- Demo full MVP: Input → Scraping → Email alert → Dataset output
- Get feedback from 3+ beta testers
- Target: 65+ Apify Quality Score

**Risks:**

- ⚠️ **Quality score below 65** - Mitigation: Follow Apify checklist, ask for review
- ⚠️ **Email deliverability issues** - Mitigation: Verify domain, test thoroughly

---

### Sprint 3: Platform Expansion (Weeks 5-6)

**Sprint Goal:** Expand to 6 platforms and add webhook support

**Team Capacity:** 80 hours  
**Planned Story Points:** 28  
**Expected Velocity:** 30-35

**Sprint Backlog:**

| ID        | User Story                            | Points | Priority | Assignee | Status |
| --------- | ------------------------------------- | ------ | -------- | -------- | ------ |
| US-017    | Integrate Poshmark Scraper            | 5      | P1       | Dev      | To Do  |
| US-018    | Integrate Depop Scraper               | 3      | P1       | Dev      | To Do  |
| US-019    | Integrate Craigslist Scraper          | 5      | P1       | Dev      | To Do  |
| US-020    | Optimize Scraping Performance         | 3      | P2       | Dev      | To Do  |
| US-021    | Implement Generic Webhook Support     | 5      | P1       | Dev      | To Do  |
| US-022    | Implement Discord Webhook Integration | 3      | P1       | Dev      | To Do  |
| US-023    | Implement Slack Webhook Integration   | 2      | P2       | Dev      | To Do  |
| US-024    | Add Advanced Size Filtering           | 3      | P2       | Dev      | To Do  |
| US-025    | Add Condition Filtering               | 2      | P2       | Dev      | To Do  |
| US-026    | Add Keyword Exclusion Filter          | 2      | P2       | Dev      | To Do  |
| **TOTAL** |                                       | **33** |          |          |        |

**Stretch Goals (if ahead of schedule):**

- US-027 (Regex-based condition parser)

**Key Milestones:**

- **End of Week 5:** 6 platforms working
- **End of Week 6:** Webhooks functional, advanced filters implemented

**Sprint Review:**

- Demo: Scrape 6 platforms, send Discord/Slack notification
- Test performance: Should complete in <5 minutes

**Risks:**

- ⚠️ **Platform anti-scraping** - Mitigation: Residential proxies, rate limiting
- ⚠️ **Performance issues** - Mitigation: Parallel scraping, optimize slow platforms

---

### Sprint 4: Advanced Features Part 1 (Weeks 7-8)

**Sprint Goal:** Build AI/Regex parsing engine and deduplication system

**Team Capacity:** 80 hours  
**Planned Story Points:** 31  
**Expected Velocity:** 35-40

**Sprint Backlog:**

| ID        | User Story                         | Points | Priority | Assignee | Status |
| --------- | ---------------------------------- | ------ | -------- | -------- | ------ |
| US-027    | Build Regex-Based Condition Parser | 5      | P1       | Dev      | To Do  |
| US-028    | Build Regex-Based Size Parser      | 3      | P1       | Dev      | To Do  |
| US-029    | Integrate OpenAI for AI Parsing    | 5      | P1       | Dev      | To Do  |
| US-030    | Optimize AI Parsing Costs          | 2      | P2       | Dev      | To Do  |
| US-031    | Implement Hash-Based Deduplication | 5      | P0       | Dev      | To Do  |
| US-032    | Implement Price Change Detection   | 5      | P2       | Dev      | To Do  |
| US-033    | Add Deduplication Statistics       | 2      | P3       | Dev      | To Do  |
| **TOTAL** |                                    | **27** |          |          |        |

**Key Milestones:**

- **End of Week 7:** Parsing engine working (85%+ accuracy)
- **End of Week 8:** Deduplication working, alerts reduced by 70-80%

**Sprint Review:**

- Demo: Show parsing extracting condition/size from unstructured listings
- Demo: Show deduplication preventing repeat alerts

**Risks:**

- ⚠️ **OpenAI API costs too high** - Mitigation: Aggressive caching, optimize prompts
- ⚠️ **Parsing accuracy below target** - Mitigation: Expand regex patterns, improve AI prompt

---

### Sprint 5: Advanced Features Part 2 (Weeks 9-10)

**Sprint Goal:** Build release calendar monitoring, deal scoring, and premium tiers

**Team Capacity:** 80 hours  
**Planned Story Points:** 29  
**Expected Velocity:** 35-40

**Sprint Backlog:**

| ID        | User Story                             | Points | Priority | Assignee | Status |
| --------- | -------------------------------------- | ------ | -------- | -------- | ------ |
| US-034    | Scrape The Drop Date Release Calendar  | 5      | P1       | Dev      | To Do  |
| US-035    | Scrape Sole Retriever Release Calendar | 3      | P1       | Dev      | To Do  |
| US-036    | Send Release Calendar Notifications    | 3      | P1       | Dev      | To Do  |
| US-037    | Build Price Database for Grails        | 3      | P2       | Dev      | To Do  |
| US-038    | Implement Deal Scoring Algorithm       | 5      | P2       | Dev      | To Do  |
| US-039    | Add Price History Tracking             | 3      | P3       | Dev      | To Do  |
| US-040    | Configure Apify Monetization           | 2      | P1       | Dev      | To Do  |
| US-041    | Implement Tier Enforcement Logic       | 5      | P1       | Dev      | To Do  |
| US-042    | Add Analytics Tracking                 | 2      | P2       | Dev      | To Do  |
| **TOTAL** |                                        | **31** |          |          |        |

**Key Milestones:**

- **End of Week 9:** Release calendar working, daily digest sent
- **End of Week 10:** Deal scoring working, tiered pricing live

**Sprint Review:**

- Demo: Show release calendar digest email
- Demo: Show deal scoring highlighting underpriced listings
- Demo: Show tier enforcement (upgrade prompt)

**Risks:**

- ⚠️ **Calendar sites change structure** - Mitigation: Monitor 3 sources, fallback logic
- ⚠️ **User confusion on pricing** - Mitigation: Clear tier comparison table

---

### Sprint 6: Polish & Launch (Weeks 11-12)

**Sprint Goal:** Final testing, documentation, marketing, and public launch

**Team Capacity:** 80 hours  
**Planned Story Points:** 28  
**Expected Velocity:** 35-40

**Sprint Backlog:**

| ID        | User Story                            | Points | Priority | Assignee | Status |
| --------- | ------------------------------------- | ------ | -------- | -------- | ------ |
| US-043    | Integrate Mercari Scraper (Beta)      | 8      | P2       | Dev      | To Do  |
| US-044    | Integrate OfferUp Scraper (Beta)      | 8      | P2       | Dev      | To Do  |
| US-045    | Integrate Vinted Scraper              | 5      | P3       | Dev      | To Do  |
| US-046    | Write Unit and Integration Tests      | 8      | P0       | Dev      | To Do  |
| US-047    | Perform End-to-End Testing            | 5      | P0       | Dev      | To Do  |
| US-048    | Conduct Beta Testing with Community   | 3      | P1       | Dev      | To Do  |
| US-049    | Launch Reddit Marketing Campaign      | 3      | P1       | Dev      | To Do  |
| US-050    | Create YouTube Tutorial Content       | 5      | P1       | Dev      | To Do  |
| US-051    | Execute Discord Community Marketing   | 3      | P2       | Dev      | To Do  |
| US-052    | Set Up Customer Support Channels      | 2      | P1       | Dev      | To Do  |
| US-053    | Monitor Revenue and User Metrics      | 2      | P1       | Dev      | To Do  |
| US-054    | Prepare for Scale and Future Features | 3      | P3       | Dev      | To Do  |
| **TOTAL** |                                       | **55** |          |          |        |

**Note:** US-043, US-044, US-045 are stretch goals (35 points). Core launch tasks = 20 points.

**Key Milestones:**

- **End of Week 11:** All testing complete, marketing materials ready
- **End of Week 12:** Public launch, first paying users, 200+ total users (target)

**Sprint Review:**

- Demo: Full product walk-through
- Metrics: Users, MRR, quality score, feedback
- Celebrate launch! 🎉

**Sprint Retrospective:**

- What worked well throughout the project?
- What would we do differently next time?
- Lessons learned for future phases

**Risks:**

- ⚠️ **High-risk platforms fail too often** - Mitigation: Mark as BETA, auto-disable if needed
- ⚠️ **Marketing doesn't drive enough users** - Mitigation: Adjust strategy, double down on working
  channels
- ⚠️ **Critical bugs in production** - Mitigation: Hotfix immediately, communicate with users

---

### Sprint Velocity Tracking

```
Sprint  | Planned | Completed | Velocity | Notes
--------|---------|-----------|----------|---------------------------
Sprint 1|   28    |    23     |   23     | Learning curve, eBay API delay
Sprint 2|   26    |    26     |   26     | On track, MVP complete
Sprint 3|   33    |    30     |   30     | Poshmark challenging
Sprint 4|   27    |    27     |   27     | Parsing engine success
Sprint 5|   31    |    29     |   29     | Release calendar tricky
Sprint 6|   20*   |    20*    |   20*    | Core launch (excluding stretch)
--------|---------|-----------|----------|---------------------------
TOTAL   |  165    |   155     |  25.8    | Average velocity
        |         |           |   avg    |

* Sprint 6: 20 core pts, 35 stretch pts (Beta platforms)
```

**Velocity Analysis:**

- **Target Velocity:** 30 points/sprint (ideal)
- **Actual Average:** 25.8 points/sprint
- **Recommendation:** Adjust future sprint planning to 25-28 points

---

## 6. Definition of Done

### Code Quality Standards

**All code must meet these criteria before marking story as "Done":**

1. **Functionality:**
   - [ ] Feature works as described in acceptance criteria
   - [ ] All edge cases handled (empty results, API failures, invalid input)
   - [ ] No critical or high-priority bugs

2. **Code Quality:**
   - [ ] Code follows JavaScript best practices (ES6+, async/await)
   - [ ] Consistent formatting (use Prettier or ESLint)
   - [ ] No hardcoded credentials (use environment variables or KV Store)
   - [ ] No console.log (use Apify.log)
   - [ ] Functions are small and single-purpose (<50 lines)
   - [ ] Variable names are descriptive

3. **Error Handling:**
   - [ ] Try-catch blocks around API calls
   - [ ] Graceful degradation for platform failures
   - [ ] Errors logged with context (Apify.log.error)
   - [ ] User-friendly error messages

4. **Performance:**
   - [ ] No blocking operations
   - [ ] Async/await used correctly
   - [ ] Memory usage monitored (stays <4GB)
   - [ ] Runtime is reasonable (<15 min for full run)

---

### Testing Requirements

**Before marking story as "Done":**

1. **Unit Tests:**
   - [ ] Unit tests written for all utility functions
   - [ ] Tests pass (100% pass rate)
   - [ ] Code coverage ≥80% for tested modules
   - [ ] Run: `npm test`

2. **Integration Tests:**
   - [ ] Integration tests for platform scrapers (with mocked APIs)
   - [ ] Integration tests for notification system
   - [ ] All tests pass

3. **Manual Testing:**
   - [ ] Feature tested manually in Apify Console
   - [ ] Tested with realistic input data
   - [ ] Edge cases tested (no results, failures, etc.)
   - [ ] Tested on different runs (first run, second run with deduplication)

4. **Regression Testing:**
   - [ ] Existing features still work (no regressions)
   - [ ] Run full E2E test to verify

---

### Documentation Requirements

**Before marking story as "Done":**

1. **Code Documentation:**
   - [ ] JSDoc comments for public functions
   - [ ] Inline comments for complex logic
   - [ ] README updated (if new feature affects usage)

2. **User Documentation:**
   - [ ] Feature documented in README (if user-facing)
   - [ ] Input parameters explained in schema descriptions
   - [ ] Examples provided (input JSON, output JSON)
   - [ ] Screenshots or GIFs added (if UI change)

3. **Technical Documentation:**
   - [ ] Architecture diagrams updated (if structure changed)
   - [ ] API documentation updated (if new endpoints)
   - [ ] Schema documentation updated (if output changed)

---

### Review Process

**Before merging to main branch:**

1. **Self-Review:**
   - [ ] Developer reviews own code
   - [ ] Checks for mistakes, typos, debugging code

2. **Code Review (if team):**
   - [ ] Peer reviews code (if working with team)
   - [ ] Feedback addressed
   - [ ] Approved by reviewer

3. **Acceptance Criteria Check:**
   - [ ] Product owner (or developer) verifies acceptance criteria met
   - [ ] All checkboxes in "Acceptance Criteria" are checked

4. **Deployment:**
   - [ ] Code pushed to GitHub
   - [ ] Actor deployed to Apify: `apify push`
   - [ ] Tested in production (run actor manually)

---

### Additional Criteria for Specific Stories

**Platform Integration Stories (US-005, US-006, etc.):**

- [ ] Successfully scrapes 20+ listings
- [ ] Data normalized to standard schema
- [ ] Error handling for API failures
- [ ] Rate limiting implemented

**Notification Stories (US-008, US-010, etc.):**

- [ ] Notifications sent within target time (<10 minutes)
- [ ] Email/webhook reaches destination
- [ ] Fallback mechanism if primary fails

**Parsing Stories (US-027, US-028, US-029):**

- [ ] Parsing accuracy ≥85% on test dataset
- [ ] Performance <50ms per listing
- [ ] Edge cases handled (ambiguous listings)

**Documentation Stories (US-014, US-015):**

- [ ] README is comprehensive (3,000+ words)
- [ ] Demo video is <3 minutes, clear audio
- [ ] Screenshots are high-quality (1080p)

---

## 7. Risk Assessment

### Technical Risks

| Risk ID   | Risk Description                             | Likelihood | Impact   | Severity        | Mitigation Strategy                                                 |
| --------- | -------------------------------------------- | ---------- | -------- | --------------- | ------------------------------------------------------------------- |
| **TR-01** | eBay API approval delayed                    | Medium     | High     | 🟠 **HIGH**     | Apply on Day 1, have HTML scraping backup ready                     |
| **TR-02** | Platform anti-scraping measures block actors | High       | High     | 🔴 **CRITICAL** | Use residential proxies, rate limiting, graceful degradation        |
| **TR-03** | Platform changes API/HTML structure          | High       | Medium   | 🟠 **HIGH**     | Monitor errors daily, implement flexible parsing, version control   |
| **TR-04** | OpenAI API costs exceed budget               | Medium     | Medium   | 🟡 **MEDIUM**   | Aggressive caching, optimize prompts, set budget alerts             |
| **TR-05** | Email deliverability issues (spam folder)    | Medium     | High     | 🟠 **HIGH**     | Verify sender domain, use reputable ESP (SendGrid), test thoroughly |
| **TR-06** | Apify quality score below 65                 | Low        | Critical | 🟠 **HIGH**     | Follow Apify checklist, get review before submission, iterate       |
| **TR-07** | Performance issues (runtime >15 min)         | Medium     | Medium   | 🟡 **MEDIUM**   | Parallel scraping, optimize slow platforms, use AutoscaledPool      |
| **TR-08** | High memory usage (>4GB, crashes)            | Low        | High     | 🟡 **MEDIUM**   | Profile memory, optimize data structures, limit concurrent scrapers |
| **TR-09** | Deduplication fails (alert spam)             | Low        | High     | 🟠 **HIGH**     | Thorough testing, hash collision handling, state verification       |
| **TR-10** | High-risk platforms fail too often           | High       | Low      | 🟡 **MEDIUM**   | Mark as BETA, auto-disable if failure >50% for 7 days               |

**Severity Key:**

- 🔴 **CRITICAL:** Project-blocking, requires immediate attention
- 🟠 **HIGH:** Major impact, requires priority fix
- 🟡 **MEDIUM:** Moderate impact, address in next sprint
- 🟢 **LOW:** Minor impact, address when convenient

---

### Business Risks

| Risk ID   | Risk Description                             | Likelihood | Impact   | Severity      | Mitigation Strategy                                                                                                   |
| --------- | -------------------------------------------- | ---------- | -------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| **BR-01** | Legal action from platforms (ToS violations) | Low        | Critical | 🟠 **HIGH**   | Add disclaimers, only scrape public data, exclude high-risk platforms (StockX, GOAT, Facebook), consult legal counsel |
| **BR-02** | User acquisition below target (<200 users)   | Medium     | High     | 🟠 **HIGH**   | Multi-channel marketing (Reddit, Discord, YouTube), value-first approach, iterate on messaging                        |
| **BR-03** | Revenue below target (<$500 MRR)             | Medium     | High     | 🟠 **HIGH**   | Optimize pricing (A/B test), improve conversion funnel, add premium features, survey users                            |
| **BR-04** | High churn rate (>30% monthly)               | Medium     | Medium   | 🟡 **MEDIUM** | Survey canceling users, fix pain points, improve reliability, add value                                               |
| **BR-05** | Competition launches similar product         | Low        | Medium   | 🟡 **MEDIUM** | Differentiate with unique features (AI parsing, release calendar), focus on quality, build community                  |
| **BR-06** | Apify changes pricing/terms                  | Low        | Medium   | 🟡 **MEDIUM** | Monitor Apify announcements, diversify platform (consider self-hosting), maintain good relationship                   |
| **BR-07** | Market saturation (sneaker resale declines)  | Low        | High     | 🟠 **HIGH**   | Monitor market trends, diversify to other verticals (watches, streetwear, collectibles), adapt quickly                |
| **BR-08** | Negative community reaction (seen as spam)   | Medium     | Medium   | 🟡 **MEDIUM** | Value-first marketing, respect community rules, engage authentically, build trust before promoting                    |

**Contingency Plans:**

**If TR-02 (Anti-scraping blocks):**

1. Switch to higher-quality proxies (datacenter → residential)
2. Increase delays between requests
3. Temporarily disable problematic platform
4. Notify users of reduced platform availability

**If BR-02 (User acquisition fails):**

1. Week 1: Double down on Reddit (post in more subreddits)
2. Week 2: Partner with micro-influencers (pay $50-100 for video)
3. Week 3: Run paid ads ($200 budget for Google Ads)
4. Week 4: Offer lifetime deal ($99 one-time) for early adopters

**If BR-03 (Revenue below target):**

1. A/B test pricing: $4.99 → $7.99 for Hobby tier
2. Add discount codes for annual plans (15% off)
3. Upsell free users with targeted emails
4. Add enterprise tier ($49.99/month) with API access

---

### Dependency Risks

| Risk ID   | Risk Description                   | Likelihood | Impact | Mitigation Strategy                                                               |
| --------- | ---------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------- |
| **DR-01** | OpenAI API downtime or deprecation | Low        | Medium | Cache all parsing results, have regex-only fallback, monitor API status           |
| **DR-02** | SendGrid account suspension        | Low        | High   | Follow email best practices, verify domain, have backup ESP (Mailgun) configured  |
| **DR-03** | Apify platform outage              | Low        | Medium | Monitor Apify status page, communicate with users, have local testing environment |
| **DR-04** | GitHub unavailable (code hosting)  | Low        | Low    | Use GitLab as backup, maintain local code backups                                 |

---

## 8. Success Metrics

### Key Performance Indicators (KPIs)

**Tracked Weekly:**

#### Product Metrics

| Metric                     | Target (Week 4)  | Target (Week 8) | Target (Week 12)          | Measurement Method                   |
| -------------------------- | ---------------- | --------------- | ------------------------- | ------------------------------------ |
| **Apify Quality Score**    | 65+              | 70+             | 75+                       | Apify Console → Analytics            |
| **Actor Run Success Rate** | 85%              | 90%             | 90%                       | (Successful runs / Total runs) × 100 |
| **Average Runtime**        | <10 min          | <7 min          | <5 min                    | Apify run logs                       |
| **Platform Success Rate**  | 90% per platform | 90%             | 85% (with BETA platforms) | Track failures per platform          |
| **Parsing Accuracy**       | N/A              | 85%             | 90%                       | Manual review of 100 listings        |
| **Deduplication Rate**     | N/A              | N/A             | 70-80%                    | (Deduplicated / Total scraped) × 100 |

#### User Metrics

| Metric                         | Target (Week 4) | Target (Week 8) | Target (Week 12) | Measurement Method                          |
| ------------------------------ | --------------- | --------------- | ---------------- | ------------------------------------------- |
| **Total Users**                | 50+             | 100+            | 200+             | Apify Analytics → Users                     |
| **Active Users (7-day)**       | 30+             | 60+             | 100+             | Users with ≥1 run in last 7 days            |
| **User Retention (30-day)**    | N/A             | 60%             | 70%              | (Users in Month 2 / Users in Month 1) × 100 |
| **Average Runs per User/Week** | 3+              | 4+              | 5+               | Total runs / Active users / Weeks           |
| **Beta Tester Satisfaction**   | N/A             | N/A             | 4.0+/5.0         | Google Forms survey                         |

#### Revenue Metrics

| Metric                              | Target (Week 4) | Target (Week 8) | Target (Week 12) | Measurement Method                 |
| ----------------------------------- | --------------- | --------------- | ---------------- | ---------------------------------- |
| **Monthly Recurring Revenue (MRR)** | $0 (pre-launch) | $200+           | $500-1,000       | Sum of all subscriptions           |
| **Paying Users**                    | 0               | 30+             | 100+             | Count of paid subscribers          |
| **Average Revenue Per User (ARPU)** | $0              | $6-7            | $5-10            | MRR / Paying users                 |
| **Free → Paid Conversion Rate**     | N/A             | 15%             | 20%              | (Paid users / Total users) × 100   |
| **Churn Rate**                      | N/A             | <20%            | <15%             | (Cancellations / Total paid) × 100 |

#### Marketing Metrics

| Metric                     | Target (Week 4) | Target (Week 8) | Target (Week 12)   | Measurement Method    |
| -------------------------- | --------------- | --------------- | ------------------ | --------------------- |
| **Apify Store Views**      | 500+            | 1,000+          | 2,000+             | Apify Store analytics |
| **Demo Video Views**       | 100+            | 300+            | 500+               | YouTube analytics     |
| **Reddit Post Engagement** | N/A             | N/A             | 200+ upvotes total | Reddit karma          |
| **Discord Server Members** | N/A             | N/A             | 50+                | Discord server stats  |
| **GitHub Stars**           | 10+             | 25+             | 50+                | GitHub repository     |

---

### Apify Challenge Alignment

**Apify Challenge typically judges on these criteria:**

| Criterion                   | Weight | Our Approach                                                                  | Target Score |
| --------------------------- | ------ | ----------------------------------------------------------------------------- | ------------ |
| **Utility & Market Demand** | 30%    | Solves real problem (sneaker deal hunting), target 50K+ resellers, $6B market | 9/10         |
| **Technical Excellence**    | 25%    | Clean architecture, 12 platforms, AI parsing, deduplication, error handling   | 8/10         |
| **User Experience**         | 20%    | Comprehensive docs, video demo, intuitive input schema, helpful errors        | 9/10         |
| **Innovation**              | 15%    | Multi-platform orchestration, AI parsing, release calendar, deal scoring      | 8/10         |
| **Monetization Potential**  | 10%    | Clear pricing, tiered model, realistic projections ($500-1,000 MRR target)    | 9/10         |

**Weighted Average:** (9×0.3) + (8×0.25) + (9×0.2) + (8×0.15) + (9×0.1) = **8.5/10**

**Strategy to Win:**

1. **Emphasize Novelty:** Highlight "orchestrator" model (reuses existing Actors + custom scrapers)
2. **Demonstrate Impact:** Show real examples of deals found, money saved by users
3. **Build Community:** Leverage beta testers for testimonials, positive reviews
4. **Polish Presentation:** Professional README, high-quality demo video, clean code
5. **Engage with Judges:** Respond to feedback, iterate based on suggestions

---

### User Adoption Targets

**By Week 12:**

**User Funnel:**

```
Apify Store Views: 2,000+
    ↓ (10% try actor)
Trial Users: 200+
    ↓ (50% activate - run at least once)
Active Users: 100+
    ↓ (20% convert to paid)
Paying Users: 20-40
    ↓ (70% retain after 30 days)
Retained Paying: 14-28
```

**Revenue Calculation:**

```
MRR = (Hobby users × $4.99) + (Pro users × $9.99) + (Business users × $29.99)

Conservative:
- 15 Hobby @ $4.99 = $74.85
- 5 Pro @ $9.99 = $49.95
Total: $124.80 MRR

Realistic:
- 60 Hobby @ $4.99 = $299.40
- 30 Pro @ $9.99 = $299.70
- 5 Business @ $29.99 = $149.95
Total: $749.05 MRR

Optimistic:
- 100 Hobby @ $4.99 = $499
- 80 Pro @ $9.99 = $799.20
- 20 Business @ $29.99 = $599.80
Total: $1,898 MRR
```

**Target Range:** $500-1,000 MRR by Week 12

---

### Success Milestones

**Phase 1 Success (Week 4):**

- ✅ MVP launched on Apify Store
- ✅ Apify Challenge submitted
- ✅ 65+ quality score achieved
- ✅ 50+ trial users
- ✅ Zero critical bugs in production

**Phase 2 Success (Week 8):**

- ✅ 6 platforms operational (90%+ success rate)
- ✅ Webhook support functional
- ✅ 100+ users (50+ active)
- ✅ 30+ paying users
- ✅ $200+ MRR
- ✅ 4.0+ user satisfaction

**Phase 3 Success (Week 12):**

- ✅ 12 platforms operational (85%+ success rate including BETA)
- ✅ AI parsing, deduplication, release calendar, deal scoring all working
- ✅ 200+ users (100+ active)
- ✅ 50-100 paying users
- ✅ $500-1,000 MRR
- ✅ 4.5+ star rating on Apify Store
- ✅ 70%+ user retention
- ✅ Positive community reputation (no spam complaints)

**Project Success Definition:**

- Apify Challenge finalist or winner (Top 10)
- OR $1,000+ MRR sustained for 3 months
- OR 500+ users with 4.5+ rating
- OR Acquisition offer from larger company

---

## Appendix

### Tools & Resources

**Development Tools:**

- **Code Editor:** VS Code with ESLint, Prettier extensions
- **Version Control:** GitHub (public repo for challenge)
- **Project Management:** Jira, Trello, or GitHub Projects
- **Testing:** Jest, Apify Test Runner
- **API Testing:** Postman, Insomnia

**External Services:**

- **Apify:** Actor hosting, storage, proxies
- **SendGrid:** Email delivery (free tier: 100 emails/day)
- **OpenAI:** AI parsing (GPT-3.5 Turbo, ~$0.002 per parse)
- **GitHub:** Code hosting, version control

**Design & Marketing:**

- **Video Recording:** OBS Studio, Loom
- **Video Editing:** DaVinci Resolve (free), iMovie
- **Graphics:** Canva (free tier)
- **Screenshot:** Snagit, built-in OS tools

**Community Channels:**

- **Reddit:** r/Sneakers, r/SneakerMarket, r/Flipping, r/Reselling
- **Discord:** 20+ sneaker/reseller servers
- **YouTube:** Tutorial videos, demos

---

### Glossary

**Agile Terms:**

- **Sprint:** Time-boxed iteration (2 weeks in this project)
- **Story Points:** Relative measure of effort (Fibonacci scale: 1, 2, 3, 5, 8, 13)
- **Velocity:** Average story points completed per sprint
- **Epic:** Large feature broken down into multiple user stories
- **Backlog:** Prioritized list of user stories to be completed
- **Definition of Done:** Checklist of criteria for completing a story

**Technical Terms:**

- **Actor:** Apify's serverless computing unit
- **Dataset:** Structured storage for scraped data (JSON, CSV)
- **Key-Value Store:** Storage for files, state, and metadata
- **Orchestrator:** System that routes tasks to appropriate handlers
- **Deduplication:** Process of removing duplicate entries
- **Normalization:** Converting data to a standard format
- **Regex:** Regular expression pattern matching
- **MD5 Hash:** Cryptographic hash function for generating unique IDs

**Sneaker Terms:**

- **DS (Deadstock):** Brand new, never worn
- **VNDS (Very Near Deadstock):** Worn once or twice, like new
- **OG All:** Includes original box, laces, and accessories
- **Grail:** Highly sought-after, rare sneaker
- **Resale:** Selling sneakers above retail price
- **Cook Group:** Community sharing sneaker release info and resale strategies

---

## Document Change Log

| Version | Date       | Author   | Changes                                               |
| ------- | ---------- | -------- | ----------------------------------------------------- |
| 1.0     | 2025-11-10 | Dev Team | Initial comprehensive Agile project breakdown created |

---

**END OF DOCUMENT**

---

**Total Word Count:** ~30,000 words  
**Total User Stories:** 54  
**Total Story Points:** 166  
**Estimated Project Duration:** 12 weeks  
**Target Outcome:** Successful Apify Challenge submission + $500-1,000 MRR
