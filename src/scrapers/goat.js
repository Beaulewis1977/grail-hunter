/**
 * GOAT Scraper
 * Orchestrates the ecomscrape/goat-product-search-scraper Apify actor
 * Part of Phase 4.2: GOAT & StockX Hybrid Intelligence Layers
 *
 * ⚠️ HIGH RISK: GOAT actively enforces ToS. Use dataset ingestion when possible.
 */

import { Actor } from 'apify';
import { BaseScraper } from './base.js';
import { ActorCallError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { fetchAllDatasetItems } from '../utils/pagination.js';

export class GoatScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.failureCount = 0;
    this.maxFailures = 3;
    this.requireResidentialProxy = config.requireResidentialProxy !== false;
    this.riskAcknowledged = config.riskAcknowledged === true;
  }

  /**
   * Scrape GOAT listings via orchestrated actor
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams) {
    const riskAcknowledged =
      searchParams?.acknowledgePlatformTerms === true || this.riskAcknowledged === true;

    if (!riskAcknowledged) {
      logger.warn(
        'GOAT scraping blocked: acknowledgePlatformTerms must be true to enable high-risk scraping. Consider dataset ingestion instead.'
      );
      return [];
    }

    // Check if scraper is disabled due to repeated failures
    if (this.failureCount >= this.maxFailures) {
      logger.warn('GOAT scraper disabled after repeated failures - skipping platform', {
        failureCount: this.failureCount,
        recommendation: 'Use dataset ingestion (Pattern C) instead',
      });
      return [];
    }

    logger.info('Starting GOAT scraping (HIGH RISK)', {
      keywords: searchParams.keywords,
      maxResults: searchParams.maxResults,
    });

    // Get actor ID from config with fallback
    const actorId = this.config.actorId || 'ecomscrape/goat-product-search-scraper';

    try {
      // Build search input for GOAT actor
      const proxyConfiguration = this.enforceProxy(searchParams.proxyConfig);

      const input = {
        query: searchParams.keywords.join(' '), // GOAT actor expects single query string
        maxItems: searchParams.maxResults || 50,
        proxyConfiguration,
      };

      logger.debug(`Calling ${actorId} actor`, { input });

      const run = await Actor.call(actorId, input, {
        timeoutSecs: this.config.timeoutMs ? this.config.timeoutMs / 1000 : 180, // 3 min default
      });

      if (!run) {
        throw new ActorCallError(actorId, 'Actor call returned null');
      }

      logger.info('GOAT actor run finished', { runId: run.id, status: run.status });

      if (run.status !== 'SUCCEEDED') {
        throw new ActorCallError(actorId, `Actor run failed with status: ${run.status}`);
      }

      // Fetch all results from the dataset with pagination
      const allItems = await fetchAllDatasetItems(run.defaultDatasetId);

      // Reset failure count on success
      this.failureCount = 0;

      logger.info(`Scraped ${allItems.length} listings from GOAT`, {
        keywords: searchParams.keywords,
      });

      return allItems;
    } catch (error) {
      this.failureCount += 1;

      logger.error('GOAT scraping failed', {
        error: error.message,
        failureCount: this.failureCount,
        maxFailures: this.maxFailures,
      });

      // Log specific warnings for common failure scenarios
      if (error.message.includes('403') || error.message.includes('blocked')) {
        logger.warn(
          '⚠️  GOAT blocked request - this platform actively enforces ToS. Consider using dataset ingestion (Pattern C).'
        );
      }

      if (this.failureCount >= this.maxFailures) {
        logger.error(
          `GOAT scraper auto-disabled after ${this.maxFailures} consecutive failures. Use dataset ingestion instead.`
        );
      }

      // Return empty array to allow graceful degradation
      return [];
    }
  }

  /**
   * Build search URLs from keywords
   * @param {Array} keywords - Search keywords
   * @returns {Array} Search queries for GOAT
   */
  buildSearchUrls(keywords) {
    // GOAT actor expects search queries, not URLs
    // Return keywords as-is for compatibility with base interface
    return keywords.map((keyword) => keyword);
  }

  /**
   * Validate GOAT scraper configuration
   */
  validate() {
    super.validate();
    // actorId is optional; scrape() falls back to 'ecomscrape/goat-product-search-scraper' when not provided
  }

  enforceProxy(proxyConfig) {
    if (!this.requireResidentialProxy) {
      return proxyConfig;
    }

    if (!proxyConfig || proxyConfig.useApifyProxy !== true) {
      throw new Error(
        'GOAT scraping requires Apify residential proxy. Set proxyConfig.useApifyProxy=true and include RESIDENTIAL group.'
      );
    }

    const groups = Array.isArray(proxyConfig.apifyProxyGroups)
      ? Array.from(new Set([...proxyConfig.apifyProxyGroups, 'RESIDENTIAL']))
      : ['RESIDENTIAL'];

    return {
      ...proxyConfig,
      useApifyProxy: true,
      apifyProxyGroups: groups,
    };
  }
}
