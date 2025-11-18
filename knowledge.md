# Grail Hunter Knowledge Base

## Project Overview

Grail Hunter is an Apify Actor that monitors sneaker listings across multiple marketplaces (eBay,
Grailed, StockX, GOAT) and sends real-time alerts when target sneakers appear. This is an Apify
Challenge 2024-2025 submission.

## Critical Rules

### Platform Compliance

- **NEVER scrape Facebook or Instagram** - explicitly disqualified per challenge rules
- Target Quality Score: 65+ (aim for 75+)
- Deadline: January 31, 2026

### Architecture

- **Orchestrator Model**: Calls existing Apify Actors + builds custom scrapers
- **Core Platforms (MVP)**: StockX, GOAT, eBay, Grailed
- **Phase 2 Platforms**: Flight Club, Stadium Goods (custom scrapers)

### Development Practices

#### Git Workflow

- Default branch: `develop` (feature branches branch from here)
- Protected branch: `main` (releases only)
- Commit format: Conventional Commits (`type(scope): subject`)
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

#### Code Quality

- Pre-commit hooks run: ESLint, markdownlint, Prettier
- Validate commit message format
- All commits must pass validation

#### Testing

- Run `npm test` to execute Jest tests with coverage
- Use mock data to avoid live scraping during tests
- Priority: Unit tests > Integration tests > E2E tests

#### Error Handling

- **Graceful degradation**: If one platform fails, continue with others
- Use per-platform try-catch blocks
- Never let single platform failure kill entire run

### Storage Strategy

- Dataset: User results
- KV Store: Deduplication memory (SHA256 hashing)
- Public Dataset: `public-grails-feed` for viral marketing

### Performance Targets

- Complete run: <5 minutes for 50 listings/platform
- Support: up to 500 results per platform
- Memory: <4GB RAM
- Timeout: 1 hour max execution

## Key Commands

```bash
npm install              # Setup
npm start                # Run actor
npm dev                  # Watch mode
npm lint                 # Check linting
npm lint:fix             # Auto-fix issues
npm test                 # Run Jest tests
npm build                # Build with Apify CLI
npm push                 # Push to Apify
npm pull                 # Pull from Apify
```

## Important Documents

Read these in order before implementing features:

1. `sneakers-gemini-1.md` - Strategic direction
2. `technical_architecture.md` - System design
3. `component_specifications_complete.md` - Implementation specs
4. `apify_challenge_rules.md` - Compliance requirements

## Sneakerhead Terminology

Must parse from titles/descriptions:

- **DS/BNIB**: Deadstock/Brand New In Box → `condition: "new_in_box"`
- **VNDS**: Very Near Deadstock → `condition: "used_like_new"`
- **NDS**: Near Deadstock → `condition: "used_good"`
- **OG All**: Original box/laces → `tags: ["og_all"]`
- **Bred**: Black/Red colorway → `colorway: "Bred"`

## Challenge Mode

- `CHALLENGE_MODE=true` in .env.local (until Jan 31, 2026)
- No tier validation during challenge
- No authentication required
- Goal: Maximize MAUs for judging
