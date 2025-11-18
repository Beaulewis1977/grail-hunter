/**
 * StockX Scraper - Hybrid Implementation (Phase 4.2)
 * HIGH RISK: Use with caution - StockX actively enforces ToS
 * Strategy: Orchestrated actor (if configured) + API fallback + Graceful degradation
 */

import { Actor } from 'apify';
import { BaseScraper } from './base.js';
import { ActorCallError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class StockXScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.failureCount = 0;
    this.maxFailures = 3;
    this.actorFailureCount = 0;
    this.useOrchestrated = config.actorId && config.useOrchestrated !== false;
  }

  /**
   * Scrape StockX using hybrid strategy
   * Phase 4.2: Try orchestrated actor first (if configured), fallback to API
   */
  async scrape(searchParams) {
    if (this.failureCount >= this.maxFailures) {
      logger.warn('StockX scraper disabled after repeated failures - skipping platform', {
        failureCount: this.failureCount,
        recommendation: 'Use dataset ingestion (Pattern C) instead',
      });
      return [];
    }

    // Phase 4.2: Try orchestrated actor first (if configured)
    if (this.useOrchestrated && this.actorFailureCount < 2) {
      try {
        logger.info('Trying StockX orchestrated actor (hybrid mode)', {
          actorId: this.config.actorId,
        });
        const results = await this.scrapeViaActor(searchParams);
        this.failureCount = 0; // Reset on success
        return results;
      } catch (error) {
        this.actorFailureCount += 1;
        logger.warn('StockX actor failed, falling back to API', {
          error: error.message,
          actorFailureCount: this.actorFailureCount,
        });
        // Continue to API fallback below
      }
    }

    // Existing API scraping (Phase 3 - preserved for backward compatibility)
    return this.scrapeViaAPI(searchParams);
  }

  /**
   * Scrape StockX via orchestrated Apify actor (Pattern A)
   * Phase 4.2: New hybrid strategy
   */
  async scrapeViaActor(searchParams) {
    const { keywords, maxResults = 50 } = searchParams;
    const { actorId } = this.config;

    try {
      const input = {
        query: keywords.join(' '), // Actor expects single query string
        maxItems: maxResults,
        proxyConfiguration: searchParams.proxyConfig || {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
      };

      logger.debug(`Calling ${actorId} actor`, { input });

      const run = await Actor.call(actorId, input, {
        timeoutSecs: this.config.timeoutMs ? this.config.timeoutMs / 1000 : 180,
      });

      if (!run) {
        throw new ActorCallError(actorId, 'Actor call returned null');
      }

      if (run.status !== 'SUCCEEDED') {
        throw new ActorCallError(actorId, `Actor run failed with status: ${run.status}`);
      }

      // Fetch results from dataset
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

      logger.info(`StockX actor scraping completed: ${allItems.length} items`, { keywords });
      return allItems;
    } catch (error) {
      logger.error('StockX actor scraping failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Scrape StockX via direct API (existing Phase 3 implementation)
   * Preserved for backward compatibility
   */
  async scrapeViaAPI(searchParams) {
    const { keywords, maxResults = 50 } = searchParams;

    logger.info('Attempting StockX API scraping (HIGH RISK)', { keywords });

    const results = [];
    let hadError = false;
    let lastError = null;

    for (const keyword of keywords) {
      try {
        const items = await this.searchStockX(keyword, maxResults);
        results.push(...items);
      } catch (error) {
        hadError = true;
        lastError = error;
        logger.warn(`StockX search failed for keyword: ${keyword}`, {
          error: error.message,
        });
      }
    }

    // If all keywords failed, increment failure count
    if (hadError && results.length === 0) {
      this.failureCount += 1;
      logger.error('StockX API scraping failed for all keywords', {
        error: lastError?.message,
        failureCount: this.failureCount,
      });

      if (lastError?.message.includes('403') || lastError?.message.includes('blocked')) {
        logger.warn(
          '⚠️  StockX blocked request - this platform actively enforces ToS. Consider dataset ingestion (Pattern C).'
        );
      }

      return [];
    }

    // Reset failure count if API call succeeded (even if no results)
    // This handles cases where the API works but there are no matching products
    if (!hadError || results.length > 0) {
      this.failureCount = 0;
    }

    logger.info(`StockX API scraping completed: ${results.length} items`, {
      keywords,
    });

    return results;
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
