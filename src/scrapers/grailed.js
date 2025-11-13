/**
 * Grailed Scraper
 * Orchestrates the vmscrapers/grailed Apify actor
 */

import { Actor } from 'apify';
import { BaseScraper } from './base.js';
import { ActorCallError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class GrailedScraper extends BaseScraper {
  /**
   * Scrape Grailed listings
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams) {
    logger.info('Starting Grailed scraping', {
      keywords: searchParams.keywords,
      maxResults: searchParams.maxResults,
    });

    const startUrls = this.buildSearchUrls(searchParams.keywords);

    // Get actor ID from config with fallback
    const actorId = this.config.actorId || 'vmscrapers/grailed';

    try {
      // Call the existing Grailed actor
      const input = {
        startUrls,
        maxProductsPerStartUrl: searchParams.maxResults || 50,
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

      logger.info('Grailed actor run finished', { runId: run.id, status: run.status });

      if (run.status !== 'SUCCEEDED') {
        throw new ActorCallError(actorId, `Actor run failed with status: ${run.status}`);
      }

      // Fetch all results from the dataset with pagination to avoid truncation
      const dataset = await Actor.apifyClient.dataset(run.defaultDatasetId);
      const allItems = [];
      let offset = 0;
      const limit = 1000;
      // Loop until fewer than limit items are returned
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page = await dataset.listItems({ limit, offset });
        if (page?.items?.length) allItems.push(...page.items);
        if (!page?.items?.length || page.items.length < limit) break;
        offset += limit;
      }

      logger.info(`Scraped ${allItems.length} listings from Grailed`);

      return allItems;
    } catch (error) {
      logger.error('Grailed scraping failed', { error: error.message });
      throw new ActorCallError(actorId, error.message, error);
    }
  }

  /**
   * Build search URLs from keywords
   */
  buildSearchUrls(keywords) {
    return keywords.map((keyword) => {
      const query = encodeURIComponent(keyword);
      return { url: `https://www.grailed.com/shop?q=${query}` };
    });
  }

  /**
   * Validate Grailed scraper configuration
   */
  validate() {
    super.validate();
    // actorId is optional; scrape() falls back to 'vmscrapers/grailed' when not provided
  }
}
