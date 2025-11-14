/**
 * StockX Scraper - Minimal Fallback Implementation
 * HIGH RISK: Use with caution - StockX actively enforces ToS
 * Strategy: Graceful degradation on failure
 */

import { BaseScraper } from './base.js';
import { logger } from '../utils/logger.js';

export class StockXScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.failureCount = 0;
    this.maxFailures = 3;
  }

  async scrape(searchParams) {
    const { keywords, maxResults = 50 } = searchParams;

    if (this.failureCount >= this.maxFailures) {
      logger.warn('StockX scraper disabled after repeated failures - skipping platform', {
        failureCount: this.failureCount,
      });
      return [];
    }

    try {
      logger.info('Attempting StockX scraping (HIGH RISK)', { keywords });

      const results = [];

      for (const keyword of keywords) {
        try {
          const items = await this.searchStockX(keyword, maxResults);
          results.push(...items);
        } catch (error) {
          logger.warn(`StockX search failed for keyword: ${keyword}`, {
            error: error.message,
          });
        }
      }

      this.failureCount = 0;
      logger.info(`StockX scraping completed: ${results.length} items`, {
        keywords,
      });

      return results;
    } catch (error) {
      this.failureCount += 1;
      logger.error('StockX scraping failed', {
        error: error.message,
        failureCount: this.failureCount,
      });

      if (error.message.includes('403') || error.message.includes('blocked')) {
        logger.warn(
          '⚠️  StockX blocked request - this platform actively enforces ToS. Consider using proxies or disabling StockX.'
        );
      }

      return [];
    }
  }

  async searchStockX(keyword, maxResults) {
    try {
      const encodedQuery = encodeURIComponent(keyword);
      const url = `https://stockx.com/api/browse?_search=${encodedQuery}`;

      logger.debug('Fetching StockX API', { url });

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://stockx.com/',
        },
      });

      if (response.status === 403) {
        throw new Error('403 Forbidden - StockX blocked request (anti-bot protection)');
      }

      if (response.status === 429) {
        throw new Error('429 Too Many Requests - Rate limit exceeded');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.Products || !Array.isArray(data.Products)) {
        logger.warn('Unexpected StockX API response structure', { data });
        return [];
      }

      const products = data.Products.slice(0, maxResults);

      return products.map((product) => ({
        id: product.uuid || product.id,
        title: product.title || product.name,
        brand: product.brand,
        price: product.market?.lowestAsk || product.retailPrice,
        lastSale: product.market?.lastSale,
        lowestAsk: product.market?.lowestAsk,
        highestBid: product.market?.highestBid,
        styleId: product.styleId,
        colorway: product.colorway,
        releaseDate: product.releaseDate,
        image_url: product.media?.imageUrl || product.media?.thumbUrl,
        url: `https://stockx.com/${product.urlKey}`,
        condition: 'new_in_box',
        description: product.description || '',
      }));
    } catch (error) {
      logger.error('StockX API request failed', { error: error.message });
      throw error;
    }
  }

  buildSearchUrls(keywords) {
    return keywords.map((keyword) => `https://stockx.com/search?s=${encodeURIComponent(keyword)}`);
  }
}
