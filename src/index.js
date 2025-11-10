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
import { ValidationError } from './utils/errors.js';

// Main actor logic
Actor.main(async () => {
  logger.info('🚀 Grail Hunter actor started - Phase 1: Grailed MVP');

  try {
    // 1. Get and validate input
    const rawInput = await Actor.getInput();

    if (!rawInput) {
      throw new ValidationError('No input provided to actor. Check INPUT_SCHEMA.json');
    }

    validateInput(rawInput);
    const input = normalizeInput(rawInput);

    logger.info('✅ Input validated', {
      keywords: input.keywords,
      platform: input.platform,
      size: input.size,
      priceRange: input.priceRange,
      condition: input.condition,
    });

    // 2. Initialize components
    const scraperManager = new ScraperManager();
    const normalizer = new DataNormalizer();
    const parser = new SneakerParser();
    const filter = new ListingFilter();
    const deduplicator = new DeduplicationEngine();
    const notificationManager = new NotificationManager();

    await deduplicator.initialize();

    logger.info('✅ Components initialized');

    // 3. Scrape platform
    logger.info(`🔍 Scraping ${input.platform}...`);

    const rawListings = await scraperManager.scrape(input.platform, {
      keywords: input.keywords,
      maxResults: input.maxResults,
      proxyConfig: input.proxyConfig,
    });

    logger.info(`📦 Scraped ${rawListings.length} raw listings from ${input.platform}`);

    // 4. Normalize data
    logger.info('🔄 Normalizing listings...');
    const normalizedListings = rawListings.map((raw) => normalizer.normalize(raw, input.platform));

    // 5. Parse listings (extract size, condition, tags)
    logger.info('🧠 Parsing listings...');
    const parsedListings = normalizedListings.map((listing) => parser.parse(listing));

    // 6. Apply filters
    logger.info('🔍 Applying filters...');
    const filteredListings = filter.filter(parsedListings, {
      size: input.size,
      priceRange: input.priceRange,
      condition: input.condition,
    });

    logger.info(`✅ ${filteredListings.length} listings passed filters`);

    // 7. Deduplicate (find new listings only)
    logger.info('🔎 Checking for new listings...');
    const newListings = await deduplicator.findNewListings(filteredListings);

    if (newListings.length === 0) {
      logger.info('ℹ️  No new listings found');
    } else {
      logger.info(`🎉 Found ${newListings.length} NEW listings!`);
    }

    // 8. Send notifications
    logger.info('📬 Sending notifications...');
    const notificationResult = await notificationManager.send(
      newListings,
      input.notificationConfig
    );

    // 9. Log final statistics
    const stats = {
      platform: input.platform,
      totalScraped: rawListings.length,
      afterFiltering: filteredListings.length,
      newListings: newListings.length,
      notifications: notificationResult,
      deduplication: deduplicator.getStats(),
    };

    logger.info('📊 Run statistics', stats);

    // Save stats to KV store
    const kvStore = await Actor.openKeyValueStore();
    await kvStore.setValue('last_run_stats', {
      ...stats,
      timestamp: new Date().toISOString(),
      input,
    });

    logger.info('✅ Grail Hunter actor completed successfully');

    // Exit with success code
    process.exit(0);
  } catch (error) {
    logger.error('❌ Actor execution failed', {
      error: error.message,
      type: error.type || error.name,
      stack: error.stack,
    });

    // Save error to KV store for debugging
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

    // Rethrow to mark actor run as failed
    throw error;
  }
});
