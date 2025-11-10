
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

      logger.debug('Calling vmscrapers/grailed actor', { input });

      const run = await Actor.call('vmscrapers/grailed', input, {
        waitSecs: 0, // Don't wait for completion, we'll check status
      });

      if (!run) {
        throw new ActorCallError('vmscrapers/grailed', 'Actor call returned null');
      }

      logger.info('Grailed actor run started', { runId: run.id });

      // Wait for the actor run to finish
      const finishedRun = await Actor.apifyClient.run(run.id).waitForFinish();

      if (finishedRun.status !== 'SUCCEEDED') {
        throw new ActorCallError(
          'vmscrapers/grailed',
          `Actor run failed with status: ${finishedRun.status}`
        );
      }

      // Fetch results from the dataset
      const dataset = await Actor.apifyClient.dataset(finishedRun.defaultDatasetId);
      const { items } = await dataset.listItems();

      logger.info(`Scraped ${items.length} listings from Grailed`);

      return items;
    } catch (error) {
      logger.error('Grailed scraping failed', { error: error.message });
      throw new ActorCallError('vmscrapers/grailed', error.message, error);
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

    if (!this.config.actorId) {
      throw new Error('actorId is required for Grailed scraper');
    }
  }
}

