/**
 * Depop Scraper
 * First-party Playwright/Crawlee implementation.
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

export class DepopScraper extends BaseScraper {
  /**
   * Scrape Depop listings via Playwright + Crawlee
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams = {}) {
    const maxResults = Math.min(
      searchParams.maxResults || this.config.maxResults || 60,
      this.config.maxResultsCap || 120
    );

    logger.info('Starting Depop scraping', {
      keywords: searchParams.keywords,
      maxResults,
      via: 'playwright',
    });

    const startUrls = this.buildSearchUrls(searchParams.keywords);
    const results = [];
    const seenIds = new Set();

    try {
      const proxyConfiguration = await createResidentialProxyConfig(searchParams.proxyConfig);
      const crawler = new PlaywrightCrawler({
        proxyConfiguration,
        maxConcurrency: this.config.maxConcurrency || 2,
        maxRequestRetries: this.config.maxRequestRetries ?? 2,
        maxRequestsPerMinute: this.config.requestsPerMinute || 60,
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
            logBlock('depop', response.status(), request.loadedUrl || request.url);
            const err = new Error(`Depop responded with ${response.status()}`);
            err.recoverable = true;
            throw err;
          }

          await page
            .waitForSelector('article, [data-testid="productCard"]', {
              timeout: 15000,
            })
            .catch(() => {});

          const listings = await this.extractListings(page, request.loadedUrl || request.url);

          for (const listing of listings) {
            const id = listing.id || listing.url;
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
            const nextPage = await this.findNextPage(page, request.url);
            if (nextPage) {
              await enqueueLinks({ urls: [nextPage] });
            }
          }

          await sleepWithJitter(400, 500);
        },
        failedRequestHandler({ request, error }) {
          logger.warn('Depop request failed', {
            url: request.url,
            retries: request.retryCount,
            error: error.message,
          });
        },
      });

      await crawler.run(startUrls);

      logger.info(`Scraped ${results.length} listings from Depop`, {
        maxResults,
        startUrls: startUrls.length,
      });

      return results.slice(0, maxResults);
    } catch (error) {
      logger.error('Depop scraping failed', { error: error.message });
      const wrapped =
        error instanceof PlatformScrapingError
          ? error
          : new PlatformScrapingError('depop', error.message, error);
      wrapped.recoverable = true;
      throw wrapped;
    }
  }

  /**
   * Build search URLs from keywords
   * @param {Array} keywords - Search keywords
   * @returns {Array} Search URLs
   */
  buildSearchUrls(keywords = []) {
    const safeKeywords = Array.isArray(keywords) ? keywords : [];
    return safeKeywords.map((keyword) => {
      const query = encodeURIComponent(keyword);
      return `https://www.depop.com/search/?q=${query}&sort=newest`;
    });
  }

  /**
   * Extract listings from Depop search page
   */
  async extractListings(page, currentUrl) {
    const injected = await page
      // eslint-disable-next-line no-underscore-dangle, dot-notation
      .evaluate(() => globalThis['__SCRAPER_TEST_DATA__'] || null)
      .catch(() => null);
    if (Array.isArray(injected)) {
      return injected;
    }

    return page.$$eval(
      'article, [data-testid="productCard"]',
      (cards, url) => {
        const toPrice = (text) => {
          if (!text) return null;
          const cleaned = text.replace(/[^0-9.]/g, '');
          const parsed = parseFloat(cleaned);
          return Number.isNaN(parsed) ? null : parsed;
        };

        return cards
          .map((card) => {
            const titleEl = card.querySelector('[data-testid="productCardTitle"], h3, h2, a');
            const priceEl = card.querySelector(
              '[data-testid="productCardPrice"], [itemprop="price"], .price'
            );
            const sizeEl = card.querySelector('[data-testid="productCardSize"], .size');
            const conditionEl = card.querySelector(
              '[data-testid="productCardCondition"], .condition'
            );
            const sellerEl = card.querySelector('[data-testid="user"], .seller, [href*="/user/"]');
            const urlAnchor =
              card.querySelector('a[href*="/products/"]') ||
              card.querySelector('a[href*="/listing/"]');
            const imageEl = card.querySelector('img');

            const title = titleEl?.textContent?.trim() || null;
            const priceText = priceEl?.textContent?.trim() || null;
            const urlPath = urlAnchor?.getAttribute('href') || null;
            let absoluteUrl = null;
            if (urlPath) {
              absoluteUrl = urlPath.startsWith('http') ? urlPath : new URL(urlPath, url).toString();
            }

            const id =
              urlAnchor?.getAttribute('data-testid') ||
              urlAnchor?.getAttribute('data-item-id') ||
              absoluteUrl;

            return {
              id,
              title,
              price: priceText,
              priceAmount: toPrice(priceText),
              size: sizeEl?.textContent?.trim() || null,
              condition: conditionEl?.textContent?.trim() || null,
              description: card.innerText?.trim() || '',
              url: absoluteUrl,
              image: imageEl?.getAttribute('src') || null,
              sellerUsername: sellerEl?.textContent?.trim() || null,
              sellerRating: null,
              sellerReviewCount: null,
            };
          })
          .filter((l) => l && l.title && l.url);
      },
      currentUrl
    );
  }

  async findNextPage(page, currentUrl) {
    const nextHref = await page
      .$eval('a[rel="next"], a[aria-label="Next"]', (el) => el.href)
      .catch(() => null);
    if (nextHref) return nextHref;

    try {
      const url = new URL(currentUrl);
      const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
      url.searchParams.set('page', String(pageParam + 1));
      return url.toString();
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate Depop scraper configuration
   */
  validate() {
    super.validate();
    const { requiresProxy } = this.config;

    if (requiresProxy !== undefined && typeof requiresProxy !== 'boolean') {
      throw new PlatformScrapingError(
        'depop',
        'Depop scraper config: requiresProxy must be a boolean if set'
      );
    }

    if (requiresProxy !== undefined && requiresProxy !== true) {
      throw new PlatformScrapingError('depop', 'Depop scraper must enforce proxy usage');
    }
  }
}
