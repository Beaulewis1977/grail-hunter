/**
 * eBay Scraper
 * First-party Playwright/Crawlee implementation with auction vs BIN awareness.
 */

import { PlaywrightCrawler } from 'crawlee';
import { BaseScraper } from './base.js';
import { PlatformScrapingError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import {
  createResidentialProxyConfig,
  isBlockStatus,
  logBlock,
  randomUserAgent,
  sleepWithJitter,
} from './utils/playwright.js';

export class EbayScraper extends BaseScraper {
  /**
   * Scrape eBay listings via Playwright + Crawlee
   * @param {object} searchParams
   * @param {string[]} searchParams.keywords
   * @param {string|null} [searchParams.size]
   * @param {{min?: number, max?: number}} [searchParams.priceRange]
   * @param {number} [searchParams.maxResults]
   * @param {object} [searchParams.proxyConfig]
   * @param {boolean} [searchParams.excludeAuctions]
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams = {}) {
    const maxResults = Math.min(
      searchParams.maxResults || this.config.maxResults || 80,
      this.config.maxResultsCap || 200
    );

    logger.info('Starting eBay scraping', {
      keywords: searchParams.keywords,
      maxResults,
      excludeAuctions: searchParams.excludeAuctions || false,
      via: 'playwright',
    });

    const startUrls = this.buildSearchUrls(
      searchParams.keywords,
      searchParams.size,
      searchParams.priceRange,
      searchParams.excludeAuctions || false
    );
    const results = [];
    const seenIds = new Set();

    try {
      const proxyConfiguration = await createResidentialProxyConfig(searchParams.proxyConfig);

      const crawler = new PlaywrightCrawler({
        proxyConfiguration,
        maxConcurrency: this.config.maxConcurrency || 2,
        maxRequestRetries: this.config.maxRequestRetries ?? 2,
        maxRequestsPerMinute: this.config.requestsPerMinute || 90,
        navigationTimeoutSecs: this.config.navigationTimeoutSecs || 45,
        requestHandlerTimeoutSecs: this.config.requestHandlerTimeoutSecs || 60,
        launchContext: {
          useIncognitoPages: true,
          launchOptions: {
            headless: true,
          },
        },
        requestHandler: async ({ page, request, response, enqueueLinks }) => {
          const ua = randomUserAgent();
          await page.setExtraHTTPHeaders({ 'User-Agent': ua });

          if (response && isBlockStatus(response.status())) {
            logBlock('ebay', response.status(), request.loadedUrl || request.url);
            const err = new Error(`eBay responded with ${response.status()}`);
            err.recoverable = true;
            throw err;
          }

          await page
            .waitForSelector('li.s-item, .srp-results li', { timeout: 15000 })
            .catch(() => {});

          const listings = await this.extractListings(page, request.loadedUrl || request.url);
          const hadResults = Array.isArray(listings) && listings.length > 0;

          for (const listing of listings) {
            const id = listing.itemNumber || listing.id || listing.url;
            const shouldSkip = !id || seenIds.has(id);

            if (!shouldSkip) {
              seenIds.add(id);
              results.push(listing);
            }

            if (results.length >= maxResults) {
              break;
            }
          }

          if (results.length < maxResults) {
            const nextPage = await this.findNextPage(page, request.url, hadResults);
            if (nextPage) {
              await enqueueLinks({ urls: [nextPage] });
            }
          }

          await sleepWithJitter(400, 600);
        },
        failedRequestHandler({ request, error }) {
          logger.warn('eBay request failed', {
            url: request.url,
            retries: request.retryCount,
            error: error.message,
          });
        },
      });

      await crawler.run(startUrls.map((url) => ({ url })));

      logger.info(`Scraped ${results.length} listings from eBay`, {
        maxResults,
        startUrls: startUrls.length,
      });

      return results.slice(0, maxResults);
    } catch (error) {
      logger.error('eBay scraping failed', { error: error.message });
      const wrapped =
        error instanceof PlatformScrapingError
          ? error
          : new PlatformScrapingError('ebay', error.message, error);
      wrapped.recoverable = true;
      throw wrapped;
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
      const query = parts.join(' ');

      const params = new URLSearchParams();
      params.set('_nkw', query);
      params.set('_sop', '10'); // newly listed
      if (typeof min === 'number') params.set('_udlo', String(min));
      if (typeof max === 'number') params.set('_udhi', String(max));
      if (excludeAuctions) params.set('LH_BIN', '1');

      const url = `https://www.ebay.com/sch/i.html?${params.toString()}`;
      urls.push(url);
    }

    return urls;
  }

  async extractListings(page, currentUrl) {
    const injected = await page
      // eslint-disable-next-line no-underscore-dangle, dot-notation
      .evaluate(() => globalThis['__SCRAPER_TEST_DATA__'] || null)
      .catch(() => null);
    if (Array.isArray(injected)) {
      return injected;
    }

    return page.$$eval(
      'li.s-item, .srp-results li',
      (items, url) =>
        items
          .map((item) => {
            const titleEl =
              item.querySelector('h3.s-item__title') ||
              item.querySelector('[role="heading"]') ||
              item.querySelector('span[aria-level]');
            if (!titleEl) return null;

            const priceEl =
              item.querySelector('.s-item__price') ||
              item.querySelector('[data-testid="item-price"]') ||
              item.querySelector('.x-price-primary');
            const bidEl = item.querySelector(
              '.s-item__bidCount, .s-item__bid, .s-item__purchaseOptions'
            );
            const sellerEl = item.querySelector('.s-item__seller-info-text');
            const urlAnchor = item.querySelector('a.s-item__link, a[href*="/itm/"]');
            const imageEl = item.querySelector('img.s-item__image-img, img');

            const priceText = priceEl?.textContent?.trim() || null;
            const urlPath = urlAnchor?.getAttribute('href') || null;
            let absoluteUrl = null;
            if (urlPath) {
              absoluteUrl = urlPath.startsWith('http') ? urlPath : new URL(urlPath, url).toString();
            }

            const itemNumberMatch = absoluteUrl ? absoluteUrl.match(/\/itm\/(\d+)/) : null;
            const listingTypeText = bidEl?.textContent?.trim().toLowerCase() || '';
            const isAuction =
              listingTypeText.includes('bid') || listingTypeText.includes('auction') || false;

            return {
              itemNumber: itemNumberMatch ? itemNumberMatch[1] : null,
              url: absoluteUrl,
              title: titleEl.textContent?.trim() || null,
              price: priceText,
              bidCount: listingTypeText || null,
              listingType: isAuction ? 'auction' : 'buy_it_now',
              buyItNow: !isAuction,
              image: imageEl?.getAttribute('src') || null,
              seller: sellerEl?.textContent?.replace('Seller:', '').trim() || null,
              sellerPositiveFeedbackPercent: null,
              sellerFeedbackScore: null,
            };
          })
          .filter((l) => l && l.title && l.url),
      currentUrl
    );
  }

  async findNextPage(page, currentUrl, hadResults = true) {
    const nextHref = await page
      .$eval('a[aria-label="Next"], a[rel="next"]', (el) => el.href)
      .catch(() => null);

    if (nextHref) {
      return nextHref;
    }

    // Stop paginating when the current page yielded no results
    if (!hadResults) {
      return null;
    }

    try {
      const url = new URL(currentUrl);
      const pageParamRaw = url.searchParams.get('_pgn') || '1';
      const pageParam = parseInt(pageParamRaw, 10);
      if (Number.isNaN(pageParam)) {
        return null;
      }

      url.searchParams.set('_pgn', String(pageParam + 1));
      const nextUrl = url.toString();
      if (nextUrl === currentUrl) {
        return null;
      }

      return nextUrl;
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate eBay scraper configuration
   */
  validate() {
    super.validate();
    if (this.config.requiresProxy !== undefined && this.config.requiresProxy !== true) {
      throw new PlatformScrapingError('ebay', 'eBay scraper must enforce proxy usage');
    }
  }
}
