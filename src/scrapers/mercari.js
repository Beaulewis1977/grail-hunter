/**
 * Mercari Scraper
 * First-party Playwright/Crawlee implementation (BETA).
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

export class MercariScraper extends BaseScraper {
  /**
   * Scrape Mercari listings
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams = {}) {
    const maxResults = Math.min(
      searchParams.maxResults || this.config.maxResults || 30,
      this.config.maxResultsCap || 60
    );

    logger.info('Starting Mercari scraping (BETA)', {
      keywords: searchParams.keywords,
      maxResults,
      riskLevel: 'medium-high',
      betaPlatform: true,
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
        maxRequestsPerMinute: this.config.requestsPerMinute || 50,
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
            logBlock('mercari', response.status(), request.loadedUrl || request.url);
            const err = new Error(`Mercari responded with ${response.status()}`);
            err.recoverable = true;
            throw err;
          }

          await page
            .waitForSelector('[data-testid="ItemCell"], section, article', {
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
          logger.warn('Mercari request failed', {
            url: request.url,
            retries: request.retryCount,
            error: error.message,
            betaPlatform: true,
          });
        },
      });

      await crawler.run(startUrls);

      logger.info(`Scraped ${results.length} listings from Mercari (BETA)`, {
        maxResults,
        startUrls: startUrls.length,
        betaPlatform: true,
        riskLevel: 'medium-high',
      });

      return results.slice(0, maxResults);
    } catch (error) {
      logger.error('Mercari scraping failed (BETA - expected behavior)', {
        error: error.message,
        betaPlatform: true,
        riskLevel: 'medium-high',
        recoverable: true,
      });

      const wrapped =
        error instanceof PlatformScrapingError
          ? error
          : new PlatformScrapingError('mercari', error.message, error);
      wrapped.recoverable = true; // ensure graceful degradation
      throw wrapped;
    }
  }

  /**
   * Build search URLs from keywords
   */
  buildSearchUrls(keywords = []) {
    const safeKeywords = Array.isArray(keywords) ? keywords : [];
    return safeKeywords.map((keyword) => {
      const query = encodeURIComponent(keyword);
      return `https://www.mercari.com/search/?keyword=${query}`;
    });
  }

  /**
   * Extract listings from Mercari search page
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
      '[data-testid="ItemCell"], section, article',
      (cards, url) => {
        const toPrice = (text) => {
          if (!text) return null;
          const cleaned = text.replace(/[^0-9.]/g, '');
          const parsed = parseFloat(cleaned);
          return Number.isNaN(parsed) ? null : parsed;
        };

        return cards
          .map((card) => {
            const titleEl =
              card.querySelector('[data-testid="ItemCell-name"]') ||
              card.querySelector('h3, h2, a span');
            const priceEl =
              card.querySelector('[data-testid="ItemCell-price"]') ||
              card.querySelector('[itemprop="price"], .price');
            const urlAnchor =
              card.querySelector('a[href*="/item/"]') ||
              card.querySelector('a[href*="/products/"]');
            const imageEl = card.querySelector('img');
            const conditionEl = card.querySelector(
              '[data-testid="ItemCell-condition"], .condition'
            );

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
              description: card.innerText?.trim() || '',
              size: null,
              condition: conditionEl?.textContent?.trim() || null,
              url: absoluteUrl,
              image: imageEl?.getAttribute('src') || null,
              sellerUsername: null,
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
      const pageParamRaw = url.searchParams.get('page');
      const pageParam = pageParamRaw ? parseInt(pageParamRaw, 10) : 1;
      if (Number.isNaN(pageParam)) return null;

      url.searchParams.set('page', String(pageParam + 1));
      const nextUrl = url.toString();
      if (nextUrl === currentUrl) return null;
      return nextUrl;
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate Mercari scraper configuration
   */
  validate() {
    super.validate();
    if (this.config.requiresProxy !== undefined && this.config.requiresProxy !== true) {
      throw new PlatformScrapingError('mercari', 'Mercari scraper must enforce proxy usage');
    }
    logger.warn('⚠️  Mercari scraper is BETA - expect higher failure rates and anti-bot blocking');
  }
}
