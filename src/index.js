/**
 * Grail Hunter - Multi-Platform Sneaker Monitor
 * Phase 1: Foundation + Grailed MVP
 *
 * This actor scrapes sneaker listings from Grailed and sends notifications
 * for new listings that match your search criteria.
 */

import { Actor } from 'apify';
import { logger } from './utils/logger.js';
import { validateInput, normalizeInput } from './utils/validators.js';
import { ScraperManager } from './scrapers/manager.js';
import { DataNormalizer } from './core/normalizer.js';
import { SneakerParser } from './core/parser.js';
import { ListingFilter } from './core/filter.js';
import { DeduplicationEngine } from './core/deduplicator.js';
import { NotificationManager } from './notifications/manager.js';
import { DealScorer } from './modules/deal-scorer.js';
import { PLATFORM_CONFIGS } from './config/platforms.js';
import { ValidationError } from './utils/errors.js';

Actor.main(async () => {
  logger.info('🚀 Grail Hunter actor started - Phase 4.1: Beta Platforms (Mercari + OfferUp)');

  try {
    const rawInput = await Actor.getInput();

    if (!rawInput) {
      throw new ValidationError('No input provided to actor. Check input_schema.json');
    }

    validateInput(rawInput);
    const input = normalizeInput(rawInput);

    const runtimePlatformConfigs = JSON.parse(JSON.stringify(PLATFORM_CONFIGS));
    const stockxConfig = runtimePlatformConfigs.stockx;
    const stockxExplicitlyDisabled = input.disableStockX === true;
    const stockxEnabledByInput = input.enableStockX === true;
    const shouldDisableStockX = stockxExplicitlyDisabled || !stockxEnabledByInput;

    if (stockxConfig && shouldDisableStockX) {
      stockxConfig.enabled = false;
      logger.info(
        stockxExplicitlyDisabled
          ? 'StockX scraping disabled by user request'
          : 'StockX scraping disabled (enableStockX not set)'
      );
    }

    logger.info('✅ Input validated', {
      keywords: input.keywords,
      platform: input.platform,
      size: input.size,
      priceRange: input.priceRange,
      condition: input.condition,
      enableStockX: input.enableStockX,
    });

    const scraperManager = new ScraperManager(runtimePlatformConfigs, input);
    const normalizer = new DataNormalizer();
    const parser = new SneakerParser();
    const filter = new ListingFilter();
    const deduplicator = new DeduplicationEngine({
      priceDropThreshold: input.priceDropThreshold ?? 10,
    });
    const notificationManager = new NotificationManager();
    const dealScorer = new DealScorer({
      dealScoreThreshold: input.dealScoreThreshold ?? 10,
      excellentDealThreshold: input.excellentDealThreshold ?? 30,
      marketValueOverrides: input.marketValueOverrides || {},
    });

    await deduplicator.initialize();
    await dealScorer.initialize();

    logger.info('✅ Components initialized');

    const platforms =
      Array.isArray(input.platforms) && input.platforms.length ? input.platforms : [input.platform];

    logger.info(`🔍 Scraping platforms...`, { platforms });

    const scrapeTasks = platforms.map((platform) =>
      scraperManager
        .scrape(platform, {
          keywords: input.keywords,
          maxResults: input.maxResults,
          proxyConfig: input.proxyConfig,
          excludeAuctions: input.excludeAuctions,
        })
        .then((items) => ({ platform, items }))
    );

    const settled = await Promise.allSettled(scrapeTasks);

    const rawByPlatform = settled.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    const failedPlatforms = settled
      .filter((r) => r.status === 'rejected')
      .map((r, idx) => ({ platform: platforms[idx], error: r.reason?.message }));

    const totalRaw = rawByPlatform.reduce((acc, cur) => acc + (cur.items?.length || 0), 0);
    logger.info(`📦 Scraped ${totalRaw} raw listings total`, {
      perPlatform: Object.fromEntries(rawByPlatform.map((x) => [x.platform, x.items.length])),
    });

    // Phase 3.x: Initialize per-platform stats tracking
    const platformStats = {};
    platforms.forEach((platform) => {
      platformStats[platform] = {
        scraped: 0,
        normalized: 0,
        filtered: 0,
        new: 0,
        priceDrops: 0,
        errors: 0,
      };
    });

    // Track scraped counts
    rawByPlatform.forEach(({ platform, items }) => {
      platformStats[platform].scraped = items.length;
    });

    // Track failed platforms
    failedPlatforms.forEach(({ platform }) => {
      if (platformStats[platform]) {
        platformStats[platform].errors = 1;
      }
    });

    logger.info('🔄 Normalizing listings...');
    const normalizedListings = rawByPlatform.flatMap(({ platform, items }) => {
      const normalized = items
        .map((raw) => normalizer.normalize(raw, platform))
        .filter((listing) => listing != null);

      // Phase 3.x: Track normalized count per platform
      platformStats[platform].normalized = normalized.length;

      return normalized;
    });

    const droppedCount = totalRaw - normalizedListings.length;
    if (droppedCount > 0) {
      logger.info(`⚠️  Dropped ${droppedCount} invalid listing(s) during normalization`);
    }
    logger.info(`✅ Successfully normalized ${normalizedListings.length} listings`);

    logger.info('🧠 Parsing listings...');
    const parsedListings = normalizedListings.map((listing) => parser.parse(listing));

    logger.info('💰 Scoring deals...');
    const scoredListings = await dealScorer.scoreListings(parsedListings);
    const dealStats = dealScorer.getStatistics(scoredListings);
    logger.info('✅ Deal scoring complete', dealStats);

    logger.info('🔍 Applying filters...');

    // Phase 3.x: Track which filters are active
    const appliedFilters = [];
    if (input.size) appliedFilters.push('size');
    if (input.priceRange && (input.priceRange.min || input.priceRange.max))
      appliedFilters.push('priceRange');
    if (input.condition) appliedFilters.push('condition');
    if (input.authenticatedOnly) appliedFilters.push('authenticatedOnly');
    if (input.requireOGAll) appliedFilters.push('requireOGAll');
    if (input.excludeAuctions) appliedFilters.push('excludeAuctions');
    if (input.minSellerRating > 0) appliedFilters.push('minSellerRating');
    if (input.minSellerReviewCount > 0) appliedFilters.push('minSellerReviewCount');

    const preFilterCount = scoredListings.length;

    const filteredListings = filter.filter(scoredListings, {
      size: input.size,
      priceRange: input.priceRange,
      condition: input.condition,
      // Phase 3.x: Advanced filters
      authenticatedOnly: input.authenticatedOnly,
      requireOGAll: input.requireOGAll,
      excludeAuctions: input.excludeAuctions,
      minSellerRating: input.minSellerRating,
      minSellerReviewCount: input.minSellerReviewCount,
    });

    // Phase 3.x: Track filtered counts per platform
    const platformCounts = {};
    filteredListings.forEach((listing) => {
      const platform = listing.source?.platform?.toLowerCase();
      if (!platform) return;
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    Object.keys(platformStats).forEach((platform) => {
      platformStats[platform].filtered = platformCounts[platform] || 0;
    });

    logger.info(`✅ ${filteredListings.length} listings passed filters`);

    logger.info('🔎 Checking for new listings and tracking prices...');
    const newListings = await deduplicator.findNewListings(filteredListings);

    // Phase 3.x: Track new listings and price drops per platform
    const newCounts = {};
    const priceDropCounts = {};
    filteredListings.forEach((listing) => {
      const platform = listing.source?.platform?.toLowerCase();
      if (!platform) return;
      if (listing.scrape?.isNew) {
        newCounts[platform] = (newCounts[platform] || 0) + 1;
      }
      if (listing.metadata?.priceChange?.hasDrop) {
        priceDropCounts[platform] = (priceDropCounts[platform] || 0) + 1;
      }
    });

    Object.keys(platformStats).forEach((platform) => {
      platformStats[platform].new = newCounts[platform] || 0;
      platformStats[platform].priceDrops = priceDropCounts[platform] || 0;
    });

    if (newListings.length === 0) {
      logger.info('ℹ️  No new listings found');
    } else {
      logger.info(`🎉 Found ${newListings.length} NEW listings!`);
    }

    logger.info('📬 Sending notifications...');
    const notificationResult = await notificationManager.send(
      newListings,
      input.notificationConfig
    );

    // Phase 3.x: Calculate aggregate stats
    const aggregateStats = {
      totalScraped: Object.values(platformStats).reduce((sum, p) => sum + p.scraped, 0),
      totalNormalized: Object.values(platformStats).reduce((sum, p) => sum + p.normalized, 0),
      totalFiltered: Object.values(platformStats).reduce((sum, p) => sum + p.filtered, 0),
      totalNew: Object.values(platformStats).reduce((sum, p) => sum + p.new, 0),
      totalPriceDrops: Object.values(platformStats).reduce((sum, p) => sum + p.priceDrops, 0),
      totalErrors: Object.values(platformStats).reduce((sum, p) => sum + p.errors, 0),
    };

    const dedupStats = deduplicator.getStats();

    const stats = {
      runMetadata: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        duration: null, // Calculated below
        platforms,
      },
      platformStats,
      aggregateStats,
      filtering: {
        appliedFilters,
        preFilterCount,
        postFilterCount: filteredListings.length,
        filtersRemoved: preFilterCount - filteredListings.length,
      },
      deduplication: {
        ...dedupStats,
        newHashesAdded: newListings.length,
      },
      dealStatistics: dealStats,
      notifications: notificationResult,
      // Legacy fields for backward compatibility
      platforms,
      totalScraped: totalRaw,
      afterFiltering: filteredListings.length,
      newListings: newListings.length,
    };

    logger.info('📊 Run statistics', stats);

    const kvStore = await Actor.openKeyValueStore();
    await kvStore.setValue('last_run_stats', stats);

    logger.info('✅ Grail Hunter actor completed successfully');
  } catch (error) {
    logger.error('❌ Actor execution failed', {
      error: error.message,
      type: error.type || error.name,
      stack: error.stack,
    });

    try {
      const kvStore = await Actor.openKeyValueStore();
      await kvStore.setValue('last_error', {
        error: error.message,
        type: error.type || error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    } catch (kvError) {
      logger.error('Failed to save error to KV store', { kvError: kvError.message });
    }

    throw error;
  }
});
