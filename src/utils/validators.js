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

  // Validate platform (Phase 1: only grailed)
  if (input.platform && input.platform !== 'grailed') {
    throw new ValidationError(
      `Platform "${input.platform}" is not yet supported. Phase 1 only supports "grailed". ` +
        `Supported platforms: ${SUPPORTED_PLATFORMS.join(', ')}`
    );
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
      throw new ValidationError('priceRange.min cannot be greater than priceRange.max');
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
  if (input.maxResults !== undefined) {
    if (typeof input.maxResults !== 'number' || input.maxResults < 1 || input.maxResults > 500) {
      throw new ValidationError('maxResults must be a number between 1 and 500');
    }
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
    platform: input.platform || 'grailed',
    maxResults: input.maxResults || 50,
    notificationConfig: input.notificationConfig || {},
    proxyConfig: input.proxyConfig || {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };
}
