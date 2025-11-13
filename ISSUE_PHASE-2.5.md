# Phase 2.5: Schema Alignment for Deal Scoring & Price Tracking

This issue addresses schema misalignment identified before starting Phase 3. The current .actor/OUTPUT_SCHEMA.json treats metadata.dealScore as a simple number, but component specifications define it as a rich object. This must be resolved to ensure Phase 3 implementation uses the correct contract.

## Tasks:
- Update .actor/OUTPUT_SCHEMA.json to replace scalar metadata.dealScore with object structure (isBelowMarket, marketValue, savingsPercentage, savingsAmount, dealQuality) and add metadata.priceChange object (hasDrop, previousPrice, currentPrice, dropPercent).
- Standardize naming: use savingsPercentage, deprecate savingsPercent by documenting the change.
- Modify src/core/normalizer.js and src/notifications/dataset.js to tolerate new schema shapes with null/false defaults. Add TODO comments for Phase 3 population.
- Update component_specifications.md, component_specifications_complete.md, and prompts/phase-3-agent-prompt.md with finalized field names and structures.
- Extend unit/integration tests (tests/unit/normalizer.test.js, tests/unit/webhook.test.js, tests/integration/end-to-end.test.js) to accept nested objects with placeholder values.
- Document schema changes in README.md, IMPLEMENTATION_STATUS.md.
- Post an update note in Issue #3 linking to this schema alignment work, clarifying that Phase 3 tasks must populate the new object fields.

## Acceptance Criteria:
- .actor/OUTPUT_SCHEMA.json reflects the new object structures and passes validation.
- Test suite updated to cover the nested dealScore and priceChange shapes (allowing null defaults).
- Component specs, prompts, and other docs use consistent field names and examples.
- Issue #3 references this schema update so Phase 3 coding starts from the same contract.
- No behavior change yet beyond schema scaffolding; Phase 3 will implement real scoring logic.

## Out of Scope:
- Implementing StockX scraping, deal scoring calculations, or price tracking logic (Phase 3 deliverables).
- Reworking notification formatting beyond ensuring new fields are available for Phase 3 use.

Labels: enhancement, phase-2.5
