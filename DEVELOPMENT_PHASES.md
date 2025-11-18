# Development Phases & GitHub Workflow

This document explains **how to work on a phase** in the Grail Hunter project, including:

- How phases map to GitHub issues and prompts
- How to branch from `develop`
- How to structure PRs so issues auto-close on merge
- Expectations for automated agents vs. human maintainers

The goal is to keep the workflow **predictable for future coding agents** and consistent with the
project’s planning docs.

---

## 1. Phase Structure and Artifacts

Each phase or sub-phase has three primary artifacts:

- **Roadmap spec** – `audit/COVERAGE_ROADMAP.md`
- **Agent prompt** – `prompts/phase-*-agent-prompt.md`
- **GitHub issue** – labeled with `phase-*`

Current sub-phases relevant for Phase 4:

- **Phase 3.x – Advanced Filters & Monitoring (No New Platforms)**
  - Roadmap: `audit/COVERAGE_ROADMAP.md` (Phase 3.x section)
  - Prompt: `prompts/phase-3x-agent-prompt.md`
  - Issue: `#13` (label: `phase-3x`)

- **Phase 4.0 – Safer Marketplaces (Depop + Poshmark)**
  - Roadmap: `audit/COVERAGE_ROADMAP.md` (Phase 4.0 section)
  - Prompt: `prompts/phase-40-agent-prompt.md`
  - Issue: `#14` (label: `phase-40`)

- **Phase 4.1 – Beta Platforms (Mercari, OfferUp)**
  - Roadmap: `audit/COVERAGE_ROADMAP.md` (Phase 4.1 section)
  - Prompt: `prompts/phase-41-agent-prompt.md`
  - Issue: `#15` (label: `phase-41`)

- **Phase 4.2 – GOAT & StockX Hybrid Intelligence Layers**
  - Roadmap: `audit/COVERAGE_ROADMAP.md` (Phase 4.2 section)
  - Prompt: `prompts/phase-42-agent-prompt.md`
  - Issue: `#16` (label: `phase-42`)

The umbrella epic is **Issue #4 – Phase 4: GOAT Integration & Launch Readiness**, labeled with
`phase-4-epic` and `type-epic`.

---

## 2. Branching Model

- **Base branch:** `develop`
- **Protected branch:** `main` (no direct work)

### 2.1 General Rules

- Always start new work from **`develop`**.
- Never push directly to `main`.
- Every change must flow through a **pull request targeting `develop`**.

### 2.2 Suggested Branch Names

Use feature branches named after the phase and scope, for example:

- Phase 3.x: `feature/phase-3x-advanced-filters`
- Phase 4.0: `feature/phase-40-safer-marketplaces`
- Phase 4.1: `feature/phase-41-beta-platforms`
- Phase 4.2: `feature/phase-42-goat-stockx-hybrid`

### 2.3 Step-by-Step Branch Flow

1. Ensure local `develop` is up to date:
   - `git checkout develop`
   - `git pull`
2. Create a feature branch for a specific phase issue:
   - `git checkout -b feature/phase-3x-advanced-filters`
3. Implement changes scoped to that phase issue only.
4. Run tests and linters locally:
   - `npm test`
   - `npm run lint`
5. Commit changes on the feature branch.
6. Push the feature branch and open a **PR to `develop`**.

Automated agents **must not** merge PRs or push directly to remote branches; merges and final
approvals are handled by the maintainer.

---

## 3. GitHub Issues and Auto-Closing via PRs

### 3.1 Issue Labels

Each phase issue uses:

- **Phase labels:** `phase-3x`, `phase-40`, `phase-41`, `phase-42`, `phase-4-epic`
- **Type labels:** `type-epic`, `type-feature`
- **Area labels:** `area-filters`, `area-platforms`, `area-monitoring`, `area-performance`,
  `area-risk-high`

Use these labels when creating or updating issues so that filtering and automation stay consistent.

### 3.2 Auto-Closing Issues on Merge

GitHub automatically closes issues when a merged PR description includes closing keywords. For each
phase, use the appropriate `Closes` line in the PR description, for example:

```markdown
Closes #13
```

This ensures that when the PR is merged into `develop`, **Issue #13** is automatically closed.

Recommended pattern for PR descriptions:

```markdown
## Summary

- Short explanation of what this PR implements for the phase.

## Related Issues

Closes #13

## Testing

- [ ] npm test
- [ ] npm run lint
```

You can extend this to multiple issues:

```markdown
Closes #13 Closes #14
```

Use this only when the PR truly completes all listed issues.

---

## 4. Working on a Phase: Checklist

For any phase/sub-phase (3.x, 4.0, 4.1, 4.2):

1. **Identify the phase issue**
   - Example: `#13` for Phase 3.x, `#14` for Phase 4.0, etc.
2. **Read the specs**
   - `audit/COVERAGE_ROADMAP.md` (relevant section)
   - `prompts/phase-*-agent-prompt.md`
   - `IMPLEMENTATION_STATUS.md` roadmap overview
3. **Create a feature branch from `develop`**
4. **Implement scope-limited changes**
   - Only work on the tasks defined for that phase issue.
5. **Update docs and status where appropriate**
   - `IMPLEMENTATION_STATUS.md` with new metrics/coverage.
   - Any docs referenced by the phase prompt.
6. **Run tests and linting locally**
7. **Open a PR to `develop`**
   - Include `Closes #<issue>` lines.
   - Reference the relevant prompt and roadmap section.
8. **Await review and merge by maintainer**

---

## 5. Milestones (Planned)

Milestones can be used to track completion of each phase. A recommended structure is:

- `Milestone: Phase 3.x – Advanced Filters & Monitoring`
- `Milestone: Phase 4.0 – Safer Marketplaces`
- `Milestone: Phase 4.1 – Beta Platforms`
- `Milestone: Phase 4.2 – GOAT & StockX Hybrid`

At present, milestones are **not yet configured**. When they are created, each phase issue
(`#13`–`#16`) should be assigned to the appropriate milestone.

---

## 6. Expectations for Automated Agents

Automated agents (e.g., AI coding assistants) working in this repository should:

- **Always work off `develop`**, using feature branches as described.
- **Never push directly to `main` or merge PRs.**
- **Never commit or push** without explicit maintainer permission.
- Always open a PR for any changes and link it to the relevant phase issue.
- Follow the per-phase prompts and roadmap sections exactly; avoid scope creep.

Human maintainers are responsible for:

- Reviewing PRs
- Merging to `develop` and promoting changes to `main`
- Managing releases, milestones, and deployment.

This keeps the workflow safe, predictable, and easy to follow for future contributors and agents.
