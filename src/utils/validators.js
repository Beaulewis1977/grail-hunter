/**
 * Input Validation Utilities
 * Validates user input against schema requirements
 */

import { ValidationError } from './errors.js';
import { SUPPORTED_PLATFORMS } from '../config/platforms.js';

/**
 * Validates the actor input
 * @param {object} input - User input
 * @throws {ValidationError} If validation fails
 */
export function validateInput(input) {
  if (!input) {
    throw new ValidationError('No input provided to actor');
  }

  // Required fields
  if (!input.keywords || !Array.isArray(input.keywords) || input.keywords.length === 0) {
    throw new ValidationError('keywords is required and must be a non-empty array');
  }

  if (input.keywords.length > 20) {
    throw new ValidationError('keywords cannot exceed 20 items');
  }

  // Bug Fix #9: Validate each keyword is a non-empty string
  input.keywords.forEach((kw, index) => {
    if (typeof kw !== 'string' || kw.trim().length === 0) {
      throw new ValidationError(`keywords[${index}] must be a non-empty string`);
    }
  });

  // Validate platforms (Phase 2: multi-platform with legacy fallback)
  const supported = SUPPORTED_PLATFORMS;
  if (input.platforms !== undefined) {
    if (!Array.isArray(input.platforms) || input.platforms.length === 0) {
      throw new ValidationError('platforms must be a non-empty array');
    }
    for (const [idx, p] of input.platforms.entries()) {
      if (typeof p !== 'string' || p.trim().length === 0) {
        throw new ValidationError(`platforms[${idx}] must be a non-empty string`);
      }
      if (!supported.includes(p)) {
        throw new ValidationError(
          `Platform "${p}" is not supported. Supported platforms: ${supported.join(', ')}`
        );
      }
    }
  } else if (input.platform !== undefined) {
    if (typeof input.platform !== 'string' || input.platform.trim().length === 0) {
      throw new ValidationError('platform must be a non-empty string when provided');
    }
    if (!supported.includes(input.platform)) {
      throw new ValidationError(
        `Platform "${input.platform}" is not supported. Supported platforms: ${supported.join(', ')}`
      );
    }
  }

  // Validate size format (optional)
  if (input.size) {
    const sizeRegex = /^([1-9]|1[0-5])(\.5)?$/;
    if (!sizeRegex.test(input.size)) {
      throw new ValidationError(
        `Invalid size format: "${input.size}". Must be US Men's size (e.g., "10", "10.5")`
      );
    }
  }

  // Validate price range
  if (input.priceRange) {
    if (typeof input.priceRange !== 'object') {
      throw new ValidationError('priceRange must be an object with min and/or max properties');
    }

    const { min, max } = input.priceRange;

    if (min !== undefined && (typeof min !== 'number' || min < 0)) {
      throw new ValidationError('priceRange.min must be a non-negative number');
    }

    if (max !== undefined && (typeof max !== 'number' || max < 0)) {
      throw new ValidationError('priceRange.max must be a non-negative number');
    }

    if (min !== undefined && max !== undefined && min > max) {
      throw new ValidationError('Price range minimum cannot exceed maximum');
    }
  }

  // Validate condition
  const validConditions = [
    'new_in_box',
    'used_like_new',
    'used_good',
    'used_fair',
    'used_poor',
    'unspecified',
  ];
  if (input.condition && !validConditions.includes(input.condition)) {
    throw new ValidationError(
      `Invalid condition: "${input.condition}". Valid values: ${validConditions.join(', ')}`
    );
  }

  // Validate notification config
  if (input.notificationConfig) {
    // Bug Fix #10: Add type guard for notificationConfig
    if (typeof input.notificationConfig !== 'object' || Array.isArray(input.notificationConfig)) {
      throw new ValidationError('notificationConfig must be an object');
    }

    const { webhookUrl, webhookSecret } = input.notificationConfig;

    if (webhookUrl && typeof webhookUrl !== 'string') {
      throw new ValidationError('notificationConfig.webhookUrl must be a string');
    }

    if (webhookUrl && !isValidUrl(webhookUrl)) {
      throw new ValidationError('notificationConfig.webhookUrl must be a valid URL');
    }

    if (webhookSecret && typeof webhookSecret !== 'string') {
      throw new ValidationError('notificationConfig.webhookSecret must be a string');
    }
  }

  // Validate maxResults
  // Note: This upper bound aligns with Apify's actor output limit configuration (maxOutputDatasetItems).
  // If .actor/actor.json sets a higher limit (e.g., 500000 for large runs), we allow it here to keep
  // validation consistent with the runtime/output capabilities. Be mindful of resource usage when
  // requesting very large result sets.
  if (input.maxResults !== undefined) {
    if (typeof input.maxResults !== 'number' || input.maxResults < 1 || input.maxResults > 500000) {
      throw new ValidationError('maxResults must be a number between 1 and 500000');
    }
  }

  const ensurePercentage = (value, fieldName) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ValidationError(`${fieldName} must be a number`);
    }

    if (value < 0 || value > 100) {
      throw new ValidationError(`${fieldName} must be between 0 and 100`);
    }
  };

  if (input.dealScoreThreshold !== undefined) {
    ensurePercentage(input.dealScoreThreshold, 'dealScoreThreshold');
  }

  if (input.excellentDealThreshold !== undefined) {
    ensurePercentage(input.excellentDealThreshold, 'excellentDealThreshold');
  }

  if (input.priceDropThreshold !== undefined) {
    ensurePercentage(input.priceDropThreshold, 'priceDropThreshold');
  }

  const resolvedDealThreshold =
    input.dealScoreThreshold !== undefined ? input.dealScoreThreshold : 10;
  const resolvedExcellentThreshold =
    input.excellentDealThreshold !== undefined ? input.excellentDealThreshold : 30;

  if (resolvedExcellentThreshold < resolvedDealThreshold) {
    throw new ValidationError(
      `excellentDealThreshold (${resolvedExcellentThreshold}%) must be greater than or equal to dealScoreThreshold (${resolvedDealThreshold}%).`
    );
  }

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

    for (const [key, value] of Object.entries(input.marketValueOverrides)) {
      if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
        throw new ValidationError(`marketValueOverrides["${key}"] must be a non-negative number`);
      }
    }
  }

  if (input.enableStockX !== undefined && typeof input.enableStockX !== 'boolean') {
    throw new ValidationError('enableStockX must be a boolean when provided');
  }

  if (input.disableStockX !== undefined && typeof input.disableStockX !== 'boolean') {
    throw new ValidationError('disableStockX must be a boolean when provided');
  }

  // Phase 3.x: Advanced filter validations
  if (input.authenticatedOnly !== undefined && typeof input.authenticatedOnly !== 'boolean') {
    throw new ValidationError('authenticatedOnly must be a boolean');
  }

  if (input.requireOGAll !== undefined && typeof input.requireOGAll !== 'boolean') {
    throw new ValidationError('requireOGAll must be a boolean');
  }

  if (input.minSellerRating !== undefined) {
    if (typeof input.minSellerRating !== 'number' || Number.isNaN(input.minSellerRating)) {
      throw new ValidationError('minSellerRating must be a number');
    }
    if (input.minSellerRating < 0 || input.minSellerRating > 5) {
      throw new ValidationError('minSellerRating must be between 0 and 5');
    }
  }

  if (input.minSellerReviewCount !== undefined) {
    if (
      typeof input.minSellerReviewCount !== 'number' ||
      Number.isNaN(input.minSellerReviewCount)
    ) {
      throw new ValidationError('minSellerReviewCount must be a number');
    }
    if (input.minSellerReviewCount < 0 || input.minSellerReviewCount > 100000) {
      throw new ValidationError('minSellerReviewCount must be between 0 and 100000');
    }
  }

  // Phase 4.1: Beta platform toggle validations
  if (input.betaPlatformsEnabled !== undefined && typeof input.betaPlatformsEnabled !== 'boolean') {
    throw new ValidationError('betaPlatformsEnabled must be a boolean');
  }

  if (input.enableMercari !== undefined && typeof input.enableMercari !== 'boolean') {
    throw new ValidationError('enableMercari must be a boolean');
  }

  if (input.enableOfferUp !== undefined && typeof input.enableOfferUp !== 'boolean') {
    throw new ValidationError('enableOfferUp must be a boolean');
  }

  // Validate beta platform precedence rules
  if (input.enableMercari === true && input.betaPlatformsEnabled !== true) {
    throw new ValidationError(
      'enableMercari requires betaPlatformsEnabled to be true. Beta platforms must be explicitly enabled.'
    );
  }

  if (input.enableOfferUp === true && input.betaPlatformsEnabled !== true) {
    throw new ValidationError(
      'enableOfferUp requires betaPlatformsEnabled to be true. Beta platforms must be explicitly enabled.'
    );
  }
}

/**
 * Validates a URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes and sanitizes input
 * @param {object} input - Raw user input
 * @returns {object} Sanitized input
 */
export function normalizeInput(input) {
  return {
    keywords: input.keywords.map((kw) => kw.trim()),
    size: input.size || null,
    priceRange: input.priceRange || {},
    condition: input.condition || null,
    // Keep legacy platform for logs/back-compat
    platform: input.platform || 'grailed',
    // New: multi-platform selection
    platforms: Array.isArray(input.platforms) ? input.platforms : [input.platform || 'grailed'],
    maxResults: input.maxResults || 50,
    notificationConfig: input.notificationConfig || {},
    proxyConfig: input.proxyConfig || {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
    excludeAuctions: Boolean(input.excludeAuctions) || false,
    dealScoreThreshold: input.dealScoreThreshold,
    excellentDealThreshold: input.excellentDealThreshold,
    priceDropThreshold: input.priceDropThreshold,
    marketValueOverrides:
      typeof input.marketValueOverrides === 'object' &&
      !Array.isArray(input.marketValueOverrides) &&
      input.marketValueOverrides !== null
        ? input.marketValueOverrides
        : {},
    enableStockX: input.enableStockX === true,
    disableStockX: input.disableStockX === true,
    // Phase 3.x: Advanced filters
    authenticatedOnly: input.authenticatedOnly === true,
    requireOGAll: input.requireOGAll === true,
    minSellerRating: input.minSellerRating !== undefined ? input.minSellerRating : 0,
    minSellerReviewCount: input.minSellerReviewCount !== undefined ? input.minSellerReviewCount : 0,
    // Phase 4.1: Beta platform toggles
    betaPlatformsEnabled: input.betaPlatformsEnabled === true,
    enableMercari: input.enableMercari === true,
    enableOfferUp: input.enableOfferUp === true,
    zipCode: input.zipCode || null,
  };
}
