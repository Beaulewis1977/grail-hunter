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
  logger.info(
    '🚀 Grail Hunter actor started - Phase 3: StockX Integration & Advanced Intelligence'
  );

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

    const scraperManager = new ScraperManager(runtimePlatformConfigs);
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

    const totalRaw = rawByPlatform.reduce((acc, cur) => acc + (cur.items?.length || 0), 0);
    logger.info(`📦 Scraped ${totalRaw} raw listings total`, {
      perPlatform: Object.fromEntries(rawByPlatform.map((x) => [x.platform, x.items.length])),
    });

    logger.info('🔄 Normalizing listings...');
    const normalizedListings = rawByPlatform
      .flatMap(({ platform, items }) => items.map((raw) => normalizer.normalize(raw, platform)))
      .filter((listing) => listing != null);

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

    logger.info(`✅ ${filteredListings.length} listings passed filters`);

    logger.info('🔎 Checking for new listings and tracking prices...');
    const newListings = await deduplicator.findNewListings(filteredListings);

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

    const stats = {
      platforms,
      totalScraped: totalRaw,
      afterFiltering: filteredListings.length,
      newListings: newListings.length,
      dealStatistics: dealStats,
      notifications: notificationResult,
      deduplication: deduplicator.getStats(),
    };

    logger.info('📊 Run statistics', stats);

    const kvStore = await Actor.openKeyValueStore();
    await kvStore.setValue('last_run_stats', {
      ...stats,
      timestamp: new Date().toISOString(),
      input,
    });

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
