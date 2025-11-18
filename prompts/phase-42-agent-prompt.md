# Agent Prompt: Phase 4.2 – GOAT & StockX Hybrid Intelligence Layer

## Mission Overview

Phase 4.2 focuses on **high-risk authenticated platforms** (GOAT and StockX) and delivering their
value as an **intelligence layer** rather than brittle, mandatory scrapers.

You will implement a **hybrid strategy**:

- **Pattern A – Orchestrated actors** for GOAT/StockX where stable actors exist.
- **Pattern C – Bring-your-own-data (dataset ingestion)** so users can supply GOAT/StockX-like
  datasets when scraping is blocked or undesirable.

Both platforms must be clearly marked as high-risk and **disabled by default**.

## Objectives & Success Criteria

1. Implement hybrid integration for GOAT and refine StockX to support ingestion-based intelligence.
2. Treat GOAT/StockX as optional intelligence layers (not core required platforms).
3. Ensure graceful failure and strong logging when GOAT/StockX scrapes are blocked or unstable.
4. Support user-provided datasets for GOAT/StockX-like data via a generic ingestion path.
5. Preserve actor stability, performance, and coverage targets.

## Required Reading (complete before implementation)

1. `audit/COVERAGE_ROADMAP.md`
   - Section: **Phase 4.2 – High-Risk Intelligence Layers (GOAT & StockX)**.
2. `IMPLEMENTATION_STATUS.md`
   - Phase 3 summary and new roadmap overview section.
3. `technical_architecture.md`
   - Sections on GOAT and StockX (risks, strategies, fallback patterns).
4. `agile_project_breakdown.md`
   - Epics/stories related to GOAT/StockX and high-risk platforms.
5. `component_specifications_complete.md`
   - Schema fields for deal scoring, price history, and platform metadata.
6. `WORKSPACE_FILE_AUDIT.md`
   - Design principles, logging, and ToS-risk considerations.

## GitHub Issue Tracking

- Work under issues labeled **`phase-42`**, especially:
  - **Phase 4.2: GOAT & StockX Hybrid Intelligence Layers**
- Link your PR(s) to the relevant `phase-42` issue and the Phase 4 epic issue.

## Implementation Guidance

### 4.2.1 Hybrid Strategy (Patterns A + C)

- Follow the roadmap decision to use a **hybrid approach**:
  - Use orchestrated actors (Pattern A) where reliable GOAT/StockX actors exist.
  - Provide a dataset ingestion path (Pattern C) that reads user-provided datasets and treats them
    as GOAT/StockX-like listings.
- Ensure both approaches share the same normalization/output schema so downstream stages do not care
  whether data came from scraping or ingestion.

### 4.2.2 GOAT

- Implement `GoatScraper` as an orchestrated actor wrapper where feasible (Pattern A):
  - Handle proxy requirements, timeouts, and anti-bot behavior.
  - Treat failures as best-effort and never block other platforms.
- Implement a dataset ingestion path for GOAT:
  - Accept a dataset ID and platform label via input configuration.
  - Read entries and map them into the unified listing schema.
- Extend `DataNormalizer` with `normalizeGoat()` that supports both scraped and ingested data.
- Mark GOAT as **HIGH RISK** and disabled by default via input flags.

### 4.2.3 StockX Revisit

- Review the existing StockX implementation and adapt it to the hybrid model:
  - Keep or simplify the current scraping behavior as an experimental, best-effort path.
  - Add a dataset ingestion path similar to GOAT.
- Ensure `normalizeStockX()` (or equivalent logic) aligns with the GOAT/StockX schema expectations
  used by the deal scoring and price-tracking modules.
- Clearly flag StockX as experimental and high risk in configuration and docs.

### 4.2.4 Input Schema & Configuration

- Update `.actor/input_schema.json` to include:
  - Flags to enable GOAT and StockX integrations (both default `false`).
  - Configuration options for dataset ingestion (dataset IDs, platform names, or aliases).
  - Clear descriptions reminding users that GOAT/StockX are high risk and optional.
- Ensure these options compose cleanly with existing advanced filters and platform selections.

### 4.2.5 Logging, Monitoring, and Risk Controls

- Extend logging for GOAT/StockX paths to capture:
  - Failure types (HTTP codes, timeouts, captchas).
  - Rate of fallbacks vs successful runs.
- Integrate with `last_run_stats` to record GOAT/StockX failure rates and highlight when they exceed
  thresholds (e.g., >50% failures).
- Provide clear recommendations in logs and docs on when to disable GOAT/StockX.

## Testing Requirements

1. **Unit Tests**
   - Tests for GOAT/StockX normalization and ingestion paths.
2. **Integration Tests**
   - Runs where GOAT/StockX scraping succeeds.
   - Runs where GOAT/StockX scraping fails and dataset ingestion is used instead.
3. **End-to-End Tests**
   - Scenarios with GOAT/StockX disabled (baseline) and enabled via scraping or datasets.
4. Maintain or improve coverage thresholds and keep `npm test` passing.

## Documentation Updates

- Update `README.md` and `IMPLEMENTATION_STATUS.md` to:
  - Describe the hybrid GOAT/StockX strategy.
  - Clarify that these platforms are optional, high-risk, and disabled by default.
- Ensure Apify Store docs and legal disclaimers highlight GOAT/StockX risks and recommended usage.

## Definition of Done (Phase 4.2)

- GOAT and StockX hybrid paths (scraping + dataset ingestion) are implemented, tested, and
  documented.
- Both platforms are optional, clearly marked high-risk, and disabled by default.
- Failure and fallback behavior is robust and observable via logs and `last_run_stats`.
- Issues labeled `phase-42` are closed and the Phase 4 epic reflects completion of the high-risk
  intelligence layer.
