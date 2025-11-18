/**
 * Depop Scraper
 * Orchestrates the lexis-solutions/depop-scraper Apify actor
 * Part of Phase 4.0: Safer Marketplaces
 */

import { Actor } from 'apify';
import { BaseScraper } from './base.js';
import { ActorCallError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class DepopScraper extends BaseScraper {
  /**
   * Scrape Depop listings
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams) {
    logger.info('Starting Depop scraping', {
      keywords: searchParams.keywords,
      maxResults: searchParams.maxResults,
    });

    // Get actor ID from config with fallback
    const actorId = this.config.actorId || 'lexis-solutions/depop-scraper';

    try {
      // Build search input for Depop actor
      // Note: Depop actor expects search queries as keywords
      const input = {
        searchQueries: searchParams.keywords,
        maxItems: searchParams.maxResults || 50,
        proxyConfiguration: searchParams.proxyConfig || {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
      };

      logger.debug(`Calling ${actorId} actor`, { input });

      const run = await Actor.call(actorId, input);

      if (!run) {
        throw new ActorCallError(actorId, 'Actor call returned null');
      }

      logger.info('Depop actor run finished', { runId: run.id, status: run.status });

      if (run.status !== 'SUCCEEDED') {
        throw new ActorCallError(actorId, `Actor run failed with status: ${run.status}`);
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

      logger.info(`Scraped ${allItems.length} listings from Depop`);

      return allItems;
    } catch (error) {
      logger.error('Depop scraping failed', { error: error.message });
      throw new ActorCallError(actorId, error.message, error);
    }
  }

  /**
   * Build search URLs from keywords
   * @param {Array} keywords - Search keywords
   * @returns {Array} Search queries for Depop
   */
  buildSearchUrls(keywords) {
    // Depop actor expects search queries, not URLs
    // Return keywords as-is for compatibility with base interface
    return keywords.map((keyword) => keyword);
  }

  /**
   * Validate Depop scraper configuration
   */
  validate() {
    super.validate();
    // actorId is optional; scrape() falls back to 'lexis-solutions/depop-scraper' when not provided
  }
}
