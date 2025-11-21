/**
 * eBay Scraper
 * Orchestrates the dtrungtin/ebay-items-scraper Apify actor
 */

import { Actor } from 'apify';
import { BaseScraper } from './base.js';
import { ActorCallError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { fetchAllDatasetItems } from '../utils/pagination.js';

export class EbayScraper extends BaseScraper {
  /**
   * Scrape eBay listings via orchestrated actor
   * @param {object} searchParams
   * @param {string[]} searchParams.keywords
   * @param {string|null} [searchParams.size]
   * @param {{min?: number, max?: number}} [searchParams.priceRange]
   * @param {number} [searchParams.maxResults]
   * @param {object} [searchParams.proxyConfig]
   * @param {boolean} [searchParams.excludeAuctions]
   * @returns {Promise<Array>} Raw listings from the actor dataset
   */
  async scrape(searchParams) {
    logger.info('Starting eBay scraping', {
      keywords: searchParams.keywords,
      maxResults: searchParams.maxResults,
      excludeAuctions: searchParams.excludeAuctions || false,
    });

    const startUrls = this.buildSearchUrls(
      searchParams.keywords,
      searchParams.size,
      searchParams.priceRange,
      searchParams.excludeAuctions || false
    );

    const actorId = this.config.actorId || 'dtrungtin/ebay-items-scraper';

    try {
      const input = {
        startUrls,
        maxItems: searchParams.maxResults || 50,
        proxyConfiguration: searchParams.proxyConfig || {
          useApifyProxy: true,
        },
      };

      logger.debug(`Calling ${actorId} actor`, { input });

      const run = await Actor.call(actorId, input);

      if (!run) {
        throw new ActorCallError(actorId, 'Actor call returned null');
      }

      logger.info('eBay actor run finished', { runId: run.id, status: run.status });

      if (run.status !== 'SUCCEEDED') {
        throw new ActorCallError(actorId, `Actor run failed with status: ${run.status}`);
      }

      const items = await fetchAllDatasetItems(run.defaultDatasetId);

      logger.info(`Scraped ${items.length} listings from eBay`);

      return items;
    } catch (error) {
      logger.error('eBay scraping failed', { error: error.message });
      throw new ActorCallError(actorId, error.message, error);
    }
  }

  /**
   * Build search URLs from keywords and optional filters
   * - Sort by newly listed (_sop=10)
   * - Price min/max: _udlo / _udhi
   * - Exclude auctions: add LH_BIN=1 to prefer Buy It Now
   */
  buildSearchUrls(keywords, size, priceRange, excludeAuctions) {
    const urls = [];

    const safeKeywords = Array.isArray(keywords) ? keywords : [];
    const min = priceRange?.min;
    const max = priceRange?.max;

    for (const kw of safeKeywords) {
      const parts = [kw];
      if (size) parts.push(`size ${size}`);
      const query = encodeURIComponent(parts.join(' '));

      const params = new URLSearchParams();
      params.set('_nkw', query);
      params.set('_sop', '10'); // newly listed
      if (typeof min === 'number') params.set('_udlo', String(min));
      if (typeof max === 'number') params.set('_udhi', String(max));
      if (excludeAuctions) params.set('LH_BIN', '1');

      const url = `https://www.ebay.com/sch/i.html?${params.toString()}`;
      urls.push({ url });
    }

    return urls;
  }

  /**
   * Validate eBay scraper configuration
   */
  validate() {
    super.validate();
  }
}
