# Development Setup Guide

Complete guide for setting up the grail-hunter development environment with linting, code review,
and git hooks.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git >= 2.13.0

## Initial Setup

The project has been pre-configured with all necessary tools. To activate git hooks after cloning:

```bash
npm install
```

This command automatically:

- Installs all dependencies
- Initializes Husky git hooks
- Sets up pre-commit and commit-msg hooks

## Git Hooks (Husky)

### Pre-commit Hook

Runs before every commit. Automatically:

- Lints staged JavaScript/TypeScript files with ESLint
- Formats files with Prettier
- Lints markdown files with markdownlint
- Fixes fixable issues automatically

**Triggered by:** `git commit`

```bash
# If linting fails, the commit is blocked
# Fix issues with:
npm run lint:fix

# Then try committing again
git commit -m "your message"
```

### Commit Message Hook

Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
standard.

**Format:** `<type>(<scope>): <subject>`

**Valid types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (no logic changes)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions/modifications
- `chore` - Build, dependencies, tooling
- `ci` - CI/CD configuration
- `revert` - Revert previous commit

**Examples:**

```bash
git commit -m "feat(scraper): add stockx platform support"
git commit -m "fix(notifications): resolve email delivery issue"
git commit -m "docs: update API integration guide"
git commit -m "refactor(core): simplify request handler"
```

## Linting & Formatting

### Manual Linting

```bash
# Check for all lint issues
npm run lint

# Fix fixable issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### What Gets Linted

- **JavaScript/TypeScript** - ESLint (airbnb-base config)
- **Markdown** - markdownlint
- **Formatting** - Prettier
- **Commit messages** - commitlint

### ESLint Rules

Rules configured in `.eslintrc.json`:

```json
{
  "no-console": "warn",
  "no-unused-vars": "error",
  "import/prefer-default-export": "off",
  "no-param-reassign": ["error", { "props": false }]
}
```

Override rules with comments in code:

```javascript
// eslint-disable-next-line no-console
console.log('Debug info');

// eslint-disable no-param-reassign
obj.prop = newValue;
```

## CodeRabbit AI Reviews

### Configuration

CodeRabbit is configured in `.coderabbitai.yaml` with:

- **Auto review** on all PRs to `develop` and `main`
- **Security scanning** enabled
- **Performance analysis** enabled
- **Comment style** - GitHub markdown
- **Heavy review mode** - Comprehensive analysis

### How It Works

**Before Push (Pre-commit):**

- Local hooks catch formatting/linting issues
- Prevents bad code from entering git history

**After Push (GitHub):**

- CodeRabbit GitHub Action automatically reviews PRs
- Posts detailed code review comments
- Highlights security issues, performance concerns, best practices
- Labels PR as reviewed when complete

### Triggering Reviews

1. **Create a PR to develop/main:**

```bash
git push origin feature-branch
# GitHub creates PR automatically
```

2. **CodeRabbit Action Runs:**
   - Checks code quality
   - Analyzes git diff
   - Posts comprehensive review

3. **Review Triggers:**
   - ✅ PR opened
   - ✅ New commits pushed to PR
   - ✅ PR reopened

### Skipping CodeRabbit Review

Add label to PR:

- `no-review` - Skip CodeRabbit review
- `skip-review` - Skip CodeRabbit review
- `documentation-only` - Skip review for docs changes

## GitHub Actions Workflows

### 1. Lint & Format Check

Runs on every push and PR:

- **ESLint Check** - Code quality analysis
- **Prettier Check** - Formatting validation
- **Markdown Lint** - Markdown style check
- **Commitlint** - Conventional commit validation

### 2. CodeRabbit Review

Runs on every PR to main/develop:

- Comprehensive code review
- Security analysis
- Performance suggestions
- Best practices feedback

## Typical Development Workflow

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Pre-commit hooks will run automatically
git add .
git commit -m "feat(module): add new feature"
# ✅ Hooks run: ESLint, Prettier, markdownlint
# ✅ Commit message validated
# ✅ Commit succeeds

# 4. Push to remote
git push origin feature/my-feature

# 5. Create PR to develop branch
# GitHub: Open PR from feature/my-feature → develop
# CodeRabbit Action starts automatically

# 6. Address CodeRabbit feedback
# ... make changes ...
git commit -m "fix: address review feedback"
git push origin feature/my-feature
# CodeRabbit re-reviews automatically

# 7. Merge PR
# After approval, merge to develop
# GitHub: Merge PR
```

## Bypassing Hooks (Use Sparingly)

```bash
# Bypass all hooks
git commit -m "message" --no-verify

# Bypass only pre-commit hooks
git commit -m "message" -n

# Bypass only commit-msg hooks
git commit -m "message" --no-verify
```

⚠️ **Note:** Only use `--no-verify` for emergency fixes. Hooks exist to maintain code quality.

## Troubleshooting

### Hooks Not Running

```bash
# Reinstall hooks
npx husky install

# Verify hooks are installed
ls -la .husky/
```

### Pre-commit Fails

```bash
# Check what lint-staged would do
npx lint-staged --dry-run

# Fix all issues automatically
npm run lint:fix

# Try commit again
git commit -m "message"
```

### Commit Message Validation Fails

Ensure message follows format: `type(scope): subject`

```bash
# ❌ Bad
git commit -m "Fix stuff"
git commit -m "feat: added new feature without scope"

# ✅ Good
git commit -m "fix(scraper): resolve timeout issue"
git commit -m "feat(notifications): add discord webhook support"
```

### CodeRabbit Not Reviewing

1. Verify `.coderabbitai.yaml` exists in root
2. Check GitHub Actions tab for workflow run status
3. Ensure `CODERABBIT_TOKEN` secret is set in repo
4. Verify PR targets `develop` or `main` branch

### Need to Update Linting Rules

Edit configuration files:

- **ESLint** → `.eslintrc.json`
- **Prettier** → `.prettierrc.json`
- **Markdown** → `.markdownlintrc.json`
- **Commit** → `commitlint.config.js`
- **CodeRabbit** → `.coderabbitai.yaml`

Then reinstall: `npm install`

## Scripts Reference

```bash
npm run lint           # Check all lint issues
npm run lint:fix       # Fix all auto-fixable issues
npm run format         # Format code with Prettier
npm run test           # Run tests (not configured yet)
npm run prepare        # Husky setup (runs on npm install)
```

## Project Structure

```
grail-hunter/
├── .husky/                        # Husky git hooks
│   ├── pre-commit                 # Lint-staged hook
│   └── commit-msg                 # Commitlint hook
├── .github/workflows/             # GitHub Actions
│   ├── coderabbit-review.yml      # CodeRabbit review workflow
│   └── lint-and-format.yml        # Lint & format check workflow
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc.json               # Prettier configuration
├── .markdownlintrc.json           # Markdownlint configuration
├── .lintstagedrc.json             # lint-staged configuration
├── .coderabbitai.yaml             # CodeRabbit configuration
├── commitlint.config.js           # Commitlint configuration
├── package.json                   # Project dependencies
└── src/                           # Source code (TBD)
```

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged GitHub](https://github.com/okonet/lint-staged)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [CodeRabbit Documentation](https://coderabbit.ai/docs)

## Questions or Issues?

For setup issues, check:

1. Node.js and npm versions match prerequisites
2. All dependencies installed: `npm install`
3. Husky hooks initialized: `npx husky install`
4. Hook files are executable: `ls -la .husky/`

---

**Last Updated:** November 10, 2025
