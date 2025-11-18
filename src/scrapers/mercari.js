/**
 * Mercari Scraper
 * Orchestrates the jupri/mercari-scraper Apify actor
 * Part of Phase 4.1: Beta Platforms
 *
 * WARNING: This is a BETA platform with higher risk of blocking and failures.
 * The underlying actor may be unreliable and under maintenance.
 */

import { Actor } from 'apify';
import { BaseScraper } from './base.js';
import { ActorCallError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class MercariScraper extends BaseScraper {
  /**
   * Scrape Mercari listings
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams) {
    logger.info('Starting Mercari scraping (BETA)', {
      keywords: searchParams.keywords,
      maxResults: searchParams.maxResults,
      riskLevel: 'medium-high',
      betaPlatform: true,
    });

    // Get actor ID from config with fallback
    const actorId = this.config.actorId || 'jupri/mercari-scraper';

    // Apply strict limits for beta platform
    const maxResults = Math.min(searchParams.maxResults || 30, this.config.maxResults || 30);

    try {
      // Build search input for Mercari actor
      // Based on jupri/mercari-scraper input schema
      const input = {
        searchKeywords: searchParams.keywords,
        maxItems: maxResults,
        proxyConfiguration: searchParams.proxyConfig || {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
      };

      logger.debug(`Calling ${actorId} actor (BETA)`, { input });

      // Apply timeout for beta platform
      const timeout = this.config.timeoutMs || 120000; // 2 minutes
      const run = await Actor.call(actorId, input, {
        timeoutSecs: Math.floor(timeout / 1000),
      });

      if (!run) {
        const error = new ActorCallError(
          actorId,
          'Actor call returned null (BETA platform may be unstable)'
        );
        error.recoverable = true;
        throw error;
      }

      logger.info('Mercari actor run finished (BETA)', {
        runId: run.id,
        status: run.status,
        betaPlatform: true,
      });

      if (run.status !== 'SUCCEEDED') {
        const error = new ActorCallError(
          actorId,
          `Actor run failed with status: ${run.status} (BETA platform - expect occasional failures)`
        );
        error.recoverable = true;
        throw error;
      }

      // Fetch all results from the dataset with pagination
      const dataset = await Actor.apifyClient.dataset(run.defaultDatasetId);
      const allItems = [];
      let offset = 0;
      const limit = 1000;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page = await dataset.listItems({ limit, offset });
        if (page?.items?.length) allItems.push(...page.items);
        if (!page?.items?.length || page.items.length < limit) break;
        offset += limit;
      }

      logger.info(`Scraped ${allItems.length} listings from Mercari (BETA)`, {
        betaPlatform: true,
        riskLevel: 'medium-high',
      });

      return allItems;
    } catch (error) {
      logger.error('Mercari scraping failed (BETA - expected behavior)', {
        error: error.message,
        betaPlatform: true,
        riskLevel: 'medium-high',
        recoverable: true,
      });

      // Mark error as recoverable for graceful degradation
      if (!error.recoverable) {
        error.recoverable = true;
      }

      // If already an ActorCallError, just rethrow it with recoverable flag
      if (error instanceof ActorCallError) {
        throw error;
      }

      // Otherwise wrap it
      const wrappedError = new ActorCallError(actorId, error.message, error);
      wrappedError.recoverable = true;
      throw wrappedError;
    }
  }

  /**
   * Build search URLs from keywords
   * @param {Array} keywords - Search keywords
   * @returns {Array} Search queries for Mercari
   */
  buildSearchUrls(keywords) {
    // Mercari actor expects search keywords, not URLs
    // Return keywords as-is for compatibility with base interface
    return keywords.map((keyword) => keyword);
  }

  /**
   * Validate Mercari scraper configuration
   */
  validate() {
    super.validate();
    // actorId is optional; scrape() falls back to 'jupri/mercari-scraper' when not provided
    logger.warn('⚠️  Mercari scraper is BETA - expect higher failure rates and anti-bot blocking');
  }
}
