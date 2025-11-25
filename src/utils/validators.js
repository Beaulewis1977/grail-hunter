/**
 * Input Validation Utilities
 * Validates user input against schema requirements
 */

import { ValidationError } from './errors.js';
import { SUPPORTED_PLATFORMS } from '../config/platforms.js';

// Risk tiers for compliance gating
const HIGH_RISK_PLATFORMS = ['stockx', 'goat'];
const BETA_PLATFORMS = ['mercari', 'offerup'];

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

  // Require explicit enableStockX/GOAT flags when provided in platforms list
  if (Array.isArray(input.platforms)) {
    if (input.platforms.includes('stockx') && input.enableStockX !== true) {
      throw new ValidationError(
        'StockX is high risk and is disabled by default. Set enableStockX=true to proceed.'
      );
    }
    if (input.platforms.includes('goat') && input.enableGOAT !== true) {
      throw new ValidationError('GOAT is high risk and requires enableGOAT=true to proceed.');
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

    const channelUrlFields = [
      'emailWebhookUrl',
      'slackWebhookUrl',
      'discordWebhookUrl',
      'smsWebhookUrl',
    ];
    channelUrlFields.forEach((field) => {
      const val = input.notificationConfig[field];
      if (val !== undefined && typeof val !== 'string') {
        throw new ValidationError(`notificationConfig.${field} must be a string when provided`);
      }
      if (typeof val === 'string' && val.trim().length > 0 && !isValidUrl(val)) {
        throw new ValidationError(`notificationConfig.${field} must be a valid URL`);
      }
    });

    if (
      input.notificationConfig.emailRecipients !== undefined &&
      !Array.isArray(input.notificationConfig.emailRecipients)
    ) {
      throw new ValidationError('notificationConfig.emailRecipients must be an array of emails');
    }

    if (
      input.notificationConfig.smsRecipients !== undefined &&
      !Array.isArray(input.notificationConfig.smsRecipients)
    ) {
      throw new ValidationError(
        'notificationConfig.smsRecipients must be an array of phone strings'
      );
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

  if (input.enableGOAT !== undefined && typeof input.enableGOAT !== 'boolean') {
    throw new ValidationError('enableGOAT must be a boolean when provided');
  }

  if (
    input.allowStockXApiFallback !== undefined &&
    typeof input.allowStockXApiFallback !== 'boolean'
  ) {
    throw new ValidationError('allowStockXApiFallback must be a boolean when provided');
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

  // Validate ingestion datasets (Pattern C - bring your own data)
  if (input.ingestionDatasets !== undefined) {
    if (!Array.isArray(input.ingestionDatasets)) {
      throw new ValidationError('ingestionDatasets must be an array of { datasetId, platform }');
    }

    input.ingestionDatasets.forEach((datasetConfig, index) => {
      if (
        !datasetConfig ||
        typeof datasetConfig !== 'object' ||
        Array.isArray(datasetConfig) ||
        !datasetConfig.datasetId ||
        !datasetConfig.platform
      ) {
        throw new ValidationError(
          `ingestionDatasets[${index}] must include datasetId and platform properties`
        );
      }
      if (
        typeof datasetConfig.datasetId !== 'string' ||
        datasetConfig.datasetId.trim().length === 0
      ) {
        throw new ValidationError(
          `ingestionDatasets[${index}].datasetId must be a non-empty string`
        );
      }
      if (
        typeof datasetConfig.platform !== 'string' ||
        datasetConfig.platform.trim().length === 0
      ) {
        throw new ValidationError(
          `ingestionDatasets[${index}].platform must be a non-empty string`
        );
      }
    });
  }

  // Validate live market data sources for scoring
  if (input.marketDataSources !== undefined) {
    if (!Array.isArray(input.marketDataSources)) {
      throw new ValidationError('marketDataSources must be an array of { datasetId, label }');
    }

    input.marketDataSources.forEach((source, index) => {
      if (!source || typeof source !== 'object' || Array.isArray(source) || !source.datasetId) {
        throw new ValidationError(
          `marketDataSources[${index}] must include a datasetId property (string)`
        );
      }
      if (typeof source.datasetId !== 'string' || source.datasetId.trim().length === 0) {
        throw new ValidationError(
          `marketDataSources[${index}].datasetId must be a non-empty string`
        );
      }
      if (source.label && typeof source.label !== 'string') {
        throw new ValidationError(
          `marketDataSources[${index}].label must be a string when provided`
        );
      }
    });
  }

  // Validate state store id for persistence
  if (input.stateStoreId !== undefined) {
    if (typeof input.stateStoreId !== 'string' || input.stateStoreId.trim().length < 3) {
      throw new ValidationError('stateStoreId must be a string of at least 3 characters');
    }
  }

  // Compliance gating for high-risk or beta platforms
  let selectedPlatforms = [];
  if (Array.isArray(input.platforms) && input.platforms.length) {
    selectedPlatforms = input.platforms;
  } else if (input.platform) {
    selectedPlatforms = [input.platform];
  }

  const wantsHighRisk =
    (Array.isArray(selectedPlatforms) &&
      selectedPlatforms.some((p) => HIGH_RISK_PLATFORMS.includes(String(p).toLowerCase()))) ||
    input.enableStockX === true ||
    input.enableGOAT === true;

  const wantsBeta =
    (Array.isArray(selectedPlatforms) &&
      selectedPlatforms.some((p) => BETA_PLATFORMS.includes(String(p).toLowerCase()))) ||
    input.enableMercari === true ||
    input.enableOfferUp === true;

  if ((wantsHighRisk || wantsBeta) && input.acknowledgePlatformTerms !== true) {
    throw new ValidationError(
      'acknowledgePlatformTerms must be true to run beta or high-risk platforms. Confirm you have rights to scrape these sites.'
    );
  }

  // Proxy validation for risky platforms (must use residential Apify proxy)
  if (wantsHighRisk || wantsBeta) {
    const { proxyConfig } = input;
    if (!proxyConfig || proxyConfig.useApifyProxy !== true) {
      throw new ValidationError(
        'High-risk/beta platforms require Apify residential proxy. Set proxyConfig.useApifyProxy=true (apifyProxyGroups will default to ["RESIDENTIAL"] if not provided).'
      );
    }

    if (
      proxyConfig.apifyProxyGroups &&
      Array.isArray(proxyConfig.apifyProxyGroups) &&
      !proxyConfig.apifyProxyGroups.includes('RESIDENTIAL')
    ) {
      throw new ValidationError(
        'High-risk/beta platforms require RESIDENTIAL proxy group. Include "RESIDENTIAL" in proxyConfig.apifyProxyGroups.'
      );
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
    // Keep legacy platform for logs/back-compat
    platform: input.platform || 'grailed',
    // New: multi-platform selection
    platforms: Array.isArray(input.platforms) ? input.platforms : [input.platform || 'grailed'],
    maxResults: input.maxResults || 50,
    notificationConfig: input.notificationConfig || {},
    proxyConfig: (() => {
      if (input.proxyConfig && typeof input.proxyConfig === 'object') {
        // Ensure RESIDENTIAL group is present when using Apify proxy
        const groups = Array.isArray(input.proxyConfig.apifyProxyGroups)
          ? Array.from(new Set([...input.proxyConfig.apifyProxyGroups, 'RESIDENTIAL']))
          : ['RESIDENTIAL'];

        if (input.proxyConfig.useApifyProxy === false) {
          return input.proxyConfig;
        }

        return {
          ...input.proxyConfig,
          useApifyProxy: true,
          apifyProxyGroups: groups,
        };
      }

      return {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      };
    })(),
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
    enableGOAT: input.enableGOAT === true,
    allowStockXApiFallback: input.allowStockXApiFallback === true,
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
    ingestionDatasets:
      Array.isArray(input.ingestionDatasets) && input.ingestionDatasets.length
        ? input.ingestionDatasets.map((cfg) => ({
            datasetId: cfg.datasetId,
            platform: cfg.platform,
            platformLabel: cfg.platformLabel || cfg.platform,
          }))
        : [],
    marketDataSources:
      Array.isArray(input.marketDataSources) && input.marketDataSources.length
        ? input.marketDataSources.map((cfg) => ({
            datasetId: cfg.datasetId,
            label: cfg.label || cfg.datasetId,
          }))
        : [],
    stateStoreId:
      typeof input.stateStoreId === 'string' && input.stateStoreId.trim().length >= 3
        ? input.stateStoreId.trim()
        : 'grail-hunter-state',
    acknowledgePlatformTerms: input.acknowledgePlatformTerms === true,
  };
}
