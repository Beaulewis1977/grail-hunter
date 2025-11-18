/**
 * Scraper Manager
 * Routes scraping tasks to appropriate platform scrapers
 */

import { GrailedScraper } from './grailed.js';
import { EbayScraper } from './ebay.js';
import { StockXScraper } from './stockx.js';
import { GoatScraper } from './goat.js';
import { DepopScraper } from './depop.js';
import { PoshmarkScraper } from './poshmark.js';
import { MercariScraper } from './mercari.js';
import { OfferUpScraper } from './offerup.js';
import { DatasetIngestionScraper } from './dataset-ingestion.js';
import { PLATFORM_CONFIGS } from '../config/platforms.js';
import { PlatformScrapingError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class ScraperManager {
  constructor(platformConfigs = PLATFORM_CONFIGS, userInput = {}) {
    this.platformConfigs = platformConfigs;
    this.userInput = userInput; // Store user input for beta platform toggles
    this.scrapers = {};
    this.initializeScrapers();
  }

  /**
   * Initialize platform scrapers
   */
  initializeScrapers() {
    const grailedConfig = this.platformConfigs.grailed;
    this.scrapers.grailed = new GrailedScraper(grailedConfig);

    if (this.platformConfigs.ebay) {
      this.scrapers.ebay = new EbayScraper(this.platformConfigs.ebay);
    }

    if (this.platformConfigs.stockx?.enabled) {
      this.scrapers.stockx = new StockXScraper(this.platformConfigs.stockx);
      logger.warn('⚠️  StockX scraper enabled - HIGH RISK: Use at your own discretion');
    }

    // Phase 4.0: Safer Marketplaces
    if (this.platformConfigs.depop?.enabled) {
      this.scrapers.depop = new DepopScraper(this.platformConfigs.depop);
    }

    if (this.platformConfigs.poshmark?.enabled) {
      this.scrapers.poshmark = new PoshmarkScraper(this.platformConfigs.poshmark);
    }

    // Phase 4.1: Beta Platforms (Higher Risk)
    // Beta platforms require explicit opt-in via betaPlatformsEnabled + per-platform toggles
    const betaPlatformsEnabled = this.userInput.betaPlatformsEnabled === true;

    if (betaPlatformsEnabled && this.userInput.enableMercari === true) {
      if (!this.platformConfigs.mercari) {
        logger.error('Mercari platform config not found. Cannot initialize Mercari scraper.');
      } else {
        this.scrapers.mercari = new MercariScraper(this.platformConfigs.mercari);
        logger.warn(
          '🧪 Mercari scraper enabled (BETA) - Expect higher failure rates and anti-bot blocking'
        );
      }
    }

    if (betaPlatformsEnabled && this.userInput.enableOfferUp === true) {
      if (!this.platformConfigs.offerup) {
        logger.error('OfferUp platform config not found. Cannot initialize OfferUp scraper.');
      } else {
        this.scrapers.offerup = new OfferUpScraper(this.platformConfigs.offerup);
        logger.warn(
          '🧪 OfferUp scraper enabled (BETA) - Expect higher failure rates, Cloudflare challenges, and slower scraping'
        );
      }
    }

    // Phase 4.2: GOAT (High-Risk Platform)
    // GOAT requires explicit opt-in via enableGOAT toggle
    if (this.userInput.enableGOAT === true) {
      if (!this.platformConfigs.goat) {
        logger.error('GOAT platform config not found. Cannot initialize GOAT scraper.');
      } else {
        this.scrapers.goat = new GoatScraper(this.platformConfigs.goat);
        logger.warn(
          '⚠️  GOAT scraper enabled - HIGH RISK: Platform actively enforces ToS. Dataset ingestion recommended. Use at your own discretion.'
        );
      }
    }

    // Phase 4.2: Dataset Ingestion (Pattern C)
    // Allow users to provide GOAT/StockX-like data via datasets
    if (this.userInput.ingestionDatasets && Array.isArray(this.userInput.ingestionDatasets)) {
      for (const datasetConfig of this.userInput.ingestionDatasets) {
        if (!datasetConfig.datasetId || !datasetConfig.platform) {
          logger.warn('Invalid dataset ingestion config - missing datasetId or platform', {
            datasetConfig,
          });
          // eslint-disable-next-line no-continue
          continue;
        }

        // Create a unique scraper ID for this dataset
        const datasetIdPrefix = String(datasetConfig.datasetId).substring(0, 8);
        const scraperId = `${datasetConfig.platform}_ingestion_${datasetIdPrefix}`;

        this.scrapers[scraperId] = new DatasetIngestionScraper({
          name: datasetConfig.platformLabel || `${datasetConfig.platform}_ingestion`,
          datasetId: datasetConfig.datasetId,
          platform: datasetConfig.platform,
          platformLabel: datasetConfig.platformLabel,
        });

        logger.info('Dataset ingestion scraper registered', {
          scraperId,
          datasetId: datasetConfig.datasetId,
          platform: datasetConfig.platform,
        });
      }
    }

    logger.info('Initialized scrapers', {
      platforms: Object.keys(this.scrapers),
      betaPlatformsEnabled,
      goatEnabled: this.userInput.enableGOAT === true,
      ingestionCount: this.userInput.ingestionDatasets?.length || 0,
    });
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
      // Use platform-specific maxRetries from config (e.g., 2 for beta platforms)
      const maxRetries = scraper.config?.maxRetries || 3;
      const results = await this.retryWithBackoff(() => scraper.scrape(searchParams), maxRetries);
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
