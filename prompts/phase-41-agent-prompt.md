# Agent Prompt: Phase 4.1 – Beta Platforms (Mercari & OfferUp)

## Mission Overview

Phase 4.1 introduces **higher-risk peer-to-peer platforms** as **beta integrations**:

- **Mercari**
- **OfferUp**

These platforms are opt-in and must be **safe by default**. Your mission is to implement them as
beta features with strict safeguards, clear toggles, and robust monitoring.

## Objectives & Success Criteria

1. Add Mercari and OfferUp as beta platforms, disabled by default.
2. Provide both a global beta toggle and per-platform toggles.
3. Apply strict limits (max results, time budgets, conservative retries) to beta platforms.
4. Implement robust failure monitoring and user-facing guidance.
5. Maintain stability and performance of the overall actor.

## Required Reading (complete before implementation)

1. `audit/COVERAGE_ROADMAP.md`
   - Section: **Phase 4.1 – Risk-Managed Beta Platforms (Mercari, OfferUp)**.
2. `IMPLEMENTATION_STATUS.md`
   - Phase 3 summary and any notes on high-risk platforms.
3. `technical_architecture.md`
   - Risk assessment and strategies for Mercari/OfferUp.
4. `agile_project_breakdown.md`
   - Epics/stories around beta platforms, risk management, and monitoring.
5. `component_specifications_complete.md`
   - Any platform-related schema notes relevant to beta integrations.
6. `WORKSPACE_FILE_AUDIT.md`
   - Overall design principles and logging/monitoring guidance.

## GitHub Issue Tracking

- Work under issues labeled **`phase-41`**, especially:
  - **Phase 4.1: Beta Platforms (Mercari, OfferUp)**
- Link your PR(s) to the relevant `phase-41` issue and the Phase 4 epic issue.

## Implementation Guidance

### 4.1.1 Beta Design & Toggles

- Update `.actor/input_schema.json` with:
  - `mercari` and `offerup` in the `platforms` enum.
  - `betaPlatformsEnabled` (boolean, default `false`).
  - `enableMercari` (boolean, default `false`).
  - `enableOfferUp` (boolean, default `false`).
- Define precedence clearly in schema descriptions and docs:
  - `betaPlatformsEnabled` controls whether beta platforms are allowed in general.
  - Per-platform flags (`enableMercari`, `enableOfferUp`) explicitly enable/disable each platform.

### 4.1.2 Mercari

- Choose an integration pattern based on available actors/APIs (Pattern A preferred where possible).
- Implement `MercariScraper` with:
  - Careful error handling (detect blocks/anti-bot responses).
  - Logging that includes risk context (e.g., `riskLevel: "medium-high"`).
- Implement `normalizeMercari()` in `DataNormalizer`.
- Add unit and integration tests.

### 4.1.3 OfferUp

- Implement `OfferUpScraper` with the same principles as Mercari (Pattern A preferred).
- Implement `normalizeOfferUp()` and tests.

### 4.1.4 Strict Limits & Failure Monitoring

- Apply strict limits for beta platforms:
  - Cap per-platform `maxResults`.
  - Enforce a global time budget for each beta platform.
  - Use conservative retry strategies; avoid aggressive concurrency.
- Extend KV and `last_run_stats` to include:
  - Per-platform failure counts and failure rates.
  - Flags when failure rate exceeds thresholds (e.g., >50% over 24 hours).
- Log and document recommendations to disable beta platforms when failure rates are high.

## Testing Requirements

1. **Unit Tests**
   - Scraper and normalizer tests for Mercari and OfferUp.
2. **Integration Tests**
   - Runs that include beta platforms and validate graceful degradation under failures.
   - Verify toggles behave as documented (global and per-platform).
3. **End-to-End Tests**
   - At least one scenario where beta platforms are enabled and one where they are disabled.
4. Maintain overall coverage thresholds and keep `npm test` passing.

## Documentation Updates

- Update `README.md` and `IMPLEMENTATION_STATUS.md` to:
  - Mark Mercari and OfferUp as **beta** platforms.
  - Document `betaPlatformsEnabled`, `enableMercari`, and `enableOfferUp` behavior.
- Ensure input examples and Apify listing text emphasize the beta/opt-in nature and risks.

## Definition of Done (Phase 4.1)

- Mercari and OfferUp are available as **beta** platforms, off by default.
- Strict limits and monitoring are in place and documented.
- Failure behavior is graceful and clearly surfaced to users.
- Issues labeled `phase-41` are closed and Phase 4 epic updated accordingly.
