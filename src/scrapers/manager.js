/**
 * Scraper Manager
 * Routes scraping tasks to appropriate platform scrapers
 */

import { GrailedScraper } from './grailed.js';
import { PLATFORM_CONFIGS } from '../config/platforms.js';
import { PlatformScrapingError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class ScraperManager {
  constructor() {
    this.scrapers = {};
    this.initializeScrapers();
  }

  /**
   * Initialize platform scrapers
   */
  initializeScrapers() {
    // Initialize Grailed scraper (Phase 1)
    const grailedConfig = PLATFORM_CONFIGS.grailed;
    this.scrapers.grailed = new GrailedScraper(grailedConfig);

    // Placeholder for future platforms
    // this.scrapers.ebay = new EbayScraper(PLATFORM_CONFIGS.ebay);
    // this.scrapers.stockx = new StockXScraper(PLATFORM_CONFIGS.stockx);
    // this.scrapers.goat = new GoatScraper(PLATFORM_CONFIGS.goat);

    logger.info('Initialized scrapers', { platforms: Object.keys(this.scrapers) });
  }

  /**
   * Scrape a platform
   * @param {string} platform - Platform name
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(platform, searchParams) {
    const scraper = this.scrapers[platform];

    if (!scraper) {
      throw new PlatformScrapingError(
        platform,
        `Platform not supported or not yet implemented. Available: ${Object.keys(this.scrapers).join(', ')}`
      );
    }

    try {
      scraper.validate();
      const results = await this.retryWithBackoff(() => scraper.scrape(searchParams));
      return results || [];
    } catch (error) {
      logger.error(`${platform} scraping failed`, {
        error: error.message,
        platform,
      });

      // Bug Fix #8: Only degrade for explicitly recoverable errors
      // Check if error is explicitly marked as recoverable
      if (error.recoverable === true) {
        logger.warn(`Gracefully degrading: ${platform} will be skipped`);
        return [];
      }

      // Bubble up non-recoverable errors
      throw error;
    }
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = 2 ** attempt * 1000; // 2s, 4s, 8s
        logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`, {
          error: error.message,
        });

        await new Promise((resolve) => {
          setTimeout(resolve, delay);
        });
      }
    }
    // This line should never be reached due to the logic above,
    // but it satisfies the consistent-return rule
    throw new Error('retryWithBackoff: Maximum retries exceeded');
  }

  /**
   * Get available platforms
   */
  getAvailablePlatforms() {
    return Object.keys(this.scrapers);
  }
}
