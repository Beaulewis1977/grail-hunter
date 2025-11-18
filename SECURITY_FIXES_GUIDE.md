# Security Fixes Implementation Guide

This document provides step-by-step instructions for implementing the security fixes identified in
the Security Audit Report.

## Priority 1: Critical Fixes (Implement Immediately)

### Fix 1: Update Dependencies to Patch CVE Vulnerabilities

**Issue:** 4 vulnerabilities detected (1 high, 1 moderate, 2 low)

**Steps:**

```bash
# Update dependencies
npm audit fix

# Update specific packages with known vulnerabilities
npm install pino@latest pino-pretty@latest

# Verify all tests still pass
npm test

# Verify linting still passes
npm run lint
```

**Expected Outcome:** All dependency vulnerabilities patched

---

### Fix 2: Implement Timing-Safe HMAC Comparison

**File:** `src/notifications/webhook.js`

**Add this verification function:**

```javascript
import crypto from 'crypto';

/**
 * Verify HMAC signature with timing-safe comparison
 * @param {string} receivedSignature - Signature from X-Grail-Hunter-Signature header
 * @param {string} expectedSignature - Generated signature
 * @returns {boolean} True if signatures match
 */
function verifySignature(receivedSignature, expectedSignature) {
  if (!receivedSignature || !expectedSignature) {
    return false;
  }

  try {
    const receivedBuf = Buffer.from(receivedSignature);
    const expectedBuf = Buffer.from(expectedSignature);

    // Ensure both buffers are same length
    if (receivedBuf.length !== expectedBuf.length) {
      return false;
    }

    // Use timing-safe comparison
    return crypto.timingSafeEqual(receivedBuf, expectedBuf);
  } catch (error) {
    return false;
  }
}

// Export for testing
export { verifySignature };
```

**Update the WebhookNotifier class to use verification:**

```javascript
// In src/notifications/webhook.js, add to class:

async send(listings, config = {}) {
  // ... existing code ...

  // If receiving webhooks (for testing/validation), add:
  /*
  const receivedSig = request.headers['x-grail-hunter-signature'];
  const expectedSig = this.generateSignature(payload, webhookSecret);

  if (!verifySignature(receivedSig, expectedSig)) {
    throw new Error('Invalid webhook signature');
  }
  */
}
```

**Testing:**

```javascript
// Add to tests/unit/webhook.test.js

test('verifySignature uses timing-safe comparison', () => {
  const { verifySignature } = require('../src/notifications/webhook');

  const signature1 = 'sha256=abc123def456';
  const signature2 = 'sha256=abc123def456';
  const signature3 = 'sha256=different123';

  expect(verifySignature(signature1, signature2)).toBe(true);
  expect(verifySignature(signature1, signature3)).toBe(false);
  expect(verifySignature(null, signature2)).toBe(false);
  expect(verifySignature(signature1, null)).toBe(false);
});
```

---

### Fix 3: Implement Rate Limiting for External APIs

**Create new file:** `src/utils/rate-limiter.js`

```javascript
/**
 * Rate Limiter for External API Calls
 * Prevents overwhelming external services and triggering anti-bot measures
 */

export class RateLimiter {
  constructor(config = {}) {
    this.maxRequestsPerSecond = config.maxRequestsPerSecond || 5;
    this.requestQueue = [];
    this.lastRequestTime = 0;
  }

  /**
   * Execute a function with rate limiting
   * @param {Function} fn - Async function to execute
   * @returns {Promise} Result of fn()
   */
  async execute(fn) {
    const now = Date.now();
    const minInterval = 1000 / this.maxRequestsPerSecond;
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 100;
      await this.sleep(delay + jitter);
    }

    this.lastRequestTime = Date.now();
    return fn();
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit statistics
   */
  getStats() {
    return {
      maxRequestsPerSecond: this.maxRequestsPerSecond,
      lastRequestTime: this.lastRequestTime,
    };
  }
}
```

**Update scraper to use rate limiter:**

```javascript
// In src/scrapers/stockx.js

import { RateLimiter } from '../utils/rate-limiter.js';

export class StockXScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.failureCount = 0;
    this.maxFailures = 3;
    this.actorFailureCount = 0;
    this.useOrchestrated = config.actorId && config.useOrchestrated !== false;

    // Add rate limiter (max 2 requests per second for high-risk platforms)
    this.rateLimiter = new RateLimiter({ maxRequestsPerSecond: 2 });
  }

  async searchStockX(keyword, maxResults) {
    // Wrap the fetch call with rate limiting
    return this.rateLimiter.execute(async () => {
      try {
        const encodedQuery = encodeURIComponent(keyword);
        const url = `https://stockx.com/api/browse?_search=${encodedQuery}`;

        logger.debug('Fetching StockX API', { url });

        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            Referer: 'https://stockx.com/',
          },
        });

        // ... rest of existing code ...
      } catch (error) {
        logger.error('StockX API request failed', { error: error.message });
        throw error;
      }
    });
  }
}
```

**Testing:**

```javascript
// Add to tests/unit/rate-limiter.test.js

import { RateLimiter } from '../src/utils/rate-limiter.js';

describe('RateLimiter', () => {
  test('enforces rate limit', async () => {
    const limiter = new RateLimiter({ maxRequestsPerSecond: 10 });
    const startTime = Date.now();

    // Execute 5 requests
    for (let i = 0; i < 5; i++) {
      await limiter.execute(async () => {
        return i;
      });
    }

    const elapsed = Date.now() - startTime;
    // Should take at least 400ms for 5 requests at 10/sec
    expect(elapsed).toBeGreaterThanOrEqual(400);
  });

  test('adds jitter to prevent thundering herd', async () => {
    const limiter = new RateLimiter({ maxRequestsPerSecond: 5 });
    const delays = [];

    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await limiter.execute(async () => {});
      delays.push(Date.now() - start);
    }

    // Delays should vary due to jitter
    const uniqueDelays = new Set(delays);
    expect(uniqueDelays.size).toBeGreaterThan(1);
  });
});
```

---

## Priority 2: High Severity Fixes

### Fix 4: Sanitize Error Messages in Production

**File:** `src/index.js`

**Replace lines 341-346:**

```javascript
// Before:
logger.error('❌ Actor execution failed', {
  error: error.message,
  type: error.type || error.name,
  stack: error.stack, // ⚠️ Exposed
});

// After:
const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.APIFY_IS_AT_HOME === '1';

const errorInfo = {
  error: error.message,
  type: error.type || error.name,
};

// Only include stack traces in development
if (isDevelopment) {
  errorInfo.stack = error.stack;
  errorInfo.details = {
    platforms: input?.platforms,
    keywords: input?.keywords,
  };
}

logger.error('❌ Actor execution failed', errorInfo);
```

**Also update KV store error saving (lines 350-355):**

```javascript
try {
  const kvStore = await Actor.openKeyValueStore();
  const errorPayload = {
    error: error.message,
    type: error.type || error.name,
    timestamp: new Date().toISOString(),
  };

  // Only include stack in development
  if (isDevelopment) {
    errorPayload.stack = error.stack;
  }

  await kvStore.setValue('last_error', errorPayload);
} catch (kvError) {
  logger.error('Failed to save error to KV store', { kvError: kvError.message });
}
```

---

### Fix 5: Enhance Webhook URL Validation (SSRF Prevention)

**File:** `src/utils/validators.js`

**Replace the `isValidUrl` function (lines 262-269):**

```javascript
/**
 * Validates a URL and prevents SSRF attacks
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid and safe
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);

    // Only allow http/https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost variants
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname === '[::]'
    ) {
      return false;
    }

    // Block private IP ranges (RFC 1918)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);

    if (match) {
      const octets = match.slice(1).map(Number);

      // Block 10.0.0.0/8
      if (octets[0] === 10) return false;

      // Block 172.16.0.0/12
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;

      // Block 192.168.0.0/16
      if (octets[0] === 192 && octets[1] === 168) return false;

      // Block 169.254.0.0/16 (link-local)
      if (octets[0] === 169 && octets[1] === 254) return false;

      // Block 127.0.0.0/8 (loopback)
      if (octets[0] === 127) return false;
    }

    // Block IPv6 private ranges
    const privateIPv6Patterns = [
      /^fe80:/i, // Link-local
      /^fc00:/i, // Unique local addresses
      /^fd00:/i, // Unique local addresses
      /^::1$/, // Loopback
    ];

    if (privateIPv6Patterns.some((pattern) => pattern.test(hostname))) {
      return false;
    }

    // Block metadata service endpoints (AWS, Google Cloud, Azure)
    const blockedHosts = [
      '169.254.169.254', // AWS/Azure metadata
      'metadata.google.internal', // GCP metadata
      'metadata',
    ];

    if (blockedHosts.includes(hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
```

**Add tests:**

```javascript
// In tests/unit/validators.test.js

describe('isValidUrl SSRF prevention', () => {
  test('blocks localhost', () => {
    expect(() =>
      validateInput({
        keywords: ['test'],
        notificationConfig: { webhookUrl: 'http://localhost:3000/hook' },
      })
    ).toThrow('must be a valid URL');
  });

  test('blocks private IP ranges', () => {
    const privateUrls = [
      'http://10.0.0.1/hook',
      'http://192.168.1.1/hook',
      'http://172.16.0.1/hook',
      'http://169.254.169.254/latest/meta-data/', // AWS metadata
    ];

    privateUrls.forEach((url) => {
      expect(() =>
        validateInput({
          keywords: ['test'],
          notificationConfig: { webhookUrl: url },
        })
      ).toThrow('must be a valid URL');
    });
  });

  test('allows public URLs', () => {
    expect(() =>
      validateInput({
        keywords: ['test'],
        notificationConfig: { webhookUrl: 'https://webhook.site/test' },
      })
    ).not.toThrow();
  });
});
```

---

## Priority 3: Medium Severity Fixes

### Fix 6: Add Keyword Sanitization

**File:** `src/utils/validators.js`

**Add sanitization function before validation (line 28):**

```javascript
/**
 * Sanitize keyword input to prevent injection
 * @param {string} keyword - Raw keyword
 * @returns {string} Sanitized keyword
 */
function sanitizeKeyword(keyword) {
  if (typeof keyword !== 'string') {
    return '';
  }

  return (
    keyword
      // Remove control characters (ASCII 0-31 and 127)
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Limit length to prevent abuse
      .slice(0, 100)
  );
}

export function validateInput(input) {
  // ... existing code ...

  // Sanitize and validate keywords
  const sanitizedKeywords = input.keywords.map((kw, index) => {
    const sanitized = sanitizeKeyword(kw);
    if (sanitized.length === 0) {
      throw new ValidationError(`keywords[${index}] must be a non-empty string after sanitization`);
    }
    return sanitized;
  });

  // Replace original keywords with sanitized versions
  input.keywords = sanitizedKeywords;

  // ... rest of validation ...
}
```

---

### Fix 7: Add Price Override Limits

**File:** `src/utils/validators.js`

**Update market value overrides validation (lines 174-190):**

```javascript
const MAX_REASONABLE_PRICE = 100000; // $100,000
const MIN_REASONABLE_PRICE = 1; // $1

if (input.marketValueOverrides !== undefined) {
  if (
    typeof input.marketValueOverrides !== 'object' ||
    Array.isArray(input.marketValueOverrides) ||
    input.marketValueOverrides === null
  ) {
    throw new ValidationError(
      'marketValueOverrides must be an object keyed by sneaker name or SKU'
    );
  }

  const overrideCount = Object.keys(input.marketValueOverrides).length;
  if (overrideCount > 100) {
    throw new ValidationError(
      `marketValueOverrides cannot exceed 100 entries (found ${overrideCount})`
    );
  }

  for (const [key, value] of Object.entries(input.marketValueOverrides)) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      throw new ValidationError(`marketValueOverrides["${key}"] must be a non-negative number`);
    }

    if (value < MIN_REASONABLE_PRICE || value > MAX_REASONABLE_PRICE) {
      throw new ValidationError(
        `marketValueOverrides["${key}"] must be between $${MIN_REASONABLE_PRICE} and $${MAX_REASONABLE_PRICE} (got $${value})`
      );
    }
  }
}
```

---

### Fix 8: Actor ID Whitelisting

**Create new file:** `src/config/allowed-actors.js`

```javascript
/**
 * Whitelist of allowed Apify actors for security
 * Prevents malicious actor injection via configuration
 */

export const ALLOWED_ACTORS = {
  grailed: ['vmscrapers/grailed', 'vmscrapers/grailed-scraper'],
  ebay: ['dtrungtin/ebay-items-scraper', 'getdataforme/ebay-scraper'],
  stockx: [
    // StockX actors (if any exist)
  ],
  goat: ['ecomscrape/goat-product-search-scraper'],
  depop: ['nerdytrout/depop-scraper'],
  poshmark: ['curious_coder/poshmark-scraper'],
  mercari: ['jupri/mercari-scraper'],
  offerup: ['igolaizola/offerup-scraper'],
};

/**
 * Validate actor ID against whitelist
 * @param {string} platform - Platform name
 * @param {string} actorId - Actor ID to validate
 * @throws {Error} If actor ID is not whitelisted
 */
export function validateActorId(platform, actorId) {
  const allowedForPlatform = ALLOWED_ACTORS[platform];

  if (!allowedForPlatform) {
    throw new Error(`No allowed actors defined for platform: ${platform}`);
  }

  if (!allowedForPlatform.includes(actorId)) {
    throw new Error(
      `Actor ID "${actorId}" is not whitelisted for platform "${platform}". ` +
        `Allowed actors: ${allowedForPlatform.join(', ')}`
    );
  }

  return true;
}
```

**Update scrapers to use validation:**

```javascript
// In src/scrapers/ebay.js, update scrape method:

import { validateActorId } from '../config/allowed-actors.js';

async scrape(searchParams) {
  const actorId = this.config.actorId || 'dtrungtin/ebay-items-scraper';

  // Validate actor ID
  validateActorId('ebay', actorId);

  // ... rest of code ...
}
```

---

## Testing After Fixes

After implementing all fixes, run the complete test suite:

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Check for security vulnerabilities
npm audit

# Run a test actor execution (if Apify credentials available)
npm start
```

---

## Verification Checklist

- [ ] All dependency vulnerabilities patched
- [ ] Timing-safe HMAC comparison implemented
- [ ] Rate limiting added to external API calls
- [ ] Error messages sanitized in production
- [ ] SSRF prevention in webhook URL validation
- [ ] Keyword sanitization implemented
- [ ] Price override limits enforced
- [ ] Actor ID whitelisting active
- [ ] All tests passing (214/214)
- [ ] Linting clean
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] Documentation updated

---

## Deployment Notes

**Before deploying:**

1. Update dependencies as outlined above
2. Test thoroughly in development environment
3. Review all error messages for information disclosure
4. Verify webhook endpoints are not internal
5. Monitor rate limiting effectiveness
6. Update actor documentation with new security features

**After deploying:**

1. Monitor logs for any unexpected errors
2. Check rate limiting metrics
3. Verify webhook deliveries still work
4. Monitor for IP blocks on external APIs
5. Review KV store usage for deduplication

---

## Long-Term Recommendations

1. **Continuous Dependency Updates**
   - Schedule monthly dependency updates
   - Subscribe to security advisories for critical packages
   - Use GitHub Dependabot or Snyk

2. **Security Scanning in CI/CD**

   ```yaml
   # Add to .github/workflows/security.yml
   - name: Run security audit
     run: npm audit --audit-level=moderate
   ```

3. **Regular Security Reviews**
   - Quarterly code security reviews
   - Annual penetration testing
   - OWASP Top 10 compliance checks

4. **Security Training**
   - Ensure team is trained on secure coding practices
   - Regular security awareness updates
   - OWASP Top 10 familiarization

---

**Implementation Priority:** Follow the priority order (P1 → P2 → P3) to address the most critical
issues first.

**Estimated Total Time:** 8-10 hours for all fixes + testing
