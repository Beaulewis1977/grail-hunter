/**
 * OfferUp Scraper
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

export class OfferUpScraper extends BaseScraper {
  /**
   * Scrape OfferUp listings
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams = {}) {
    const maxResults = Math.min(
      searchParams.maxResults || this.config.maxResults || 30,
      this.config.maxResultsCap || 60
    );

    const zipCode = searchParams.zipCode || '10001';
    if (!searchParams.zipCode) {
      logger.warn('No ZIP code provided for OfferUp search, defaulting to 10001 (NYC)', {
        betaPlatform: true,
      });
    }

    logger.info('Starting OfferUp scraping (BETA)', {
      keywords: searchParams.keywords,
      maxResults,
      zipCode,
      riskLevel: 'medium-high',
      betaPlatform: true,
      via: 'playwright',
    });

    const startUrls = this.buildSearchUrls(searchParams.keywords, zipCode);
    const results = [];
    const seenIds = new Set();

    try {
      const proxyConfiguration = await createResidentialProxyConfig(searchParams.proxyConfig);
      const crawler = new PlaywrightCrawler({
        proxyConfiguration,
        maxConcurrency: this.config.maxConcurrency || 2,
        maxRequestRetries: this.config.maxRequestRetries ?? 2,
        maxRequestsPerMinute: this.config.requestsPerMinute || 40,
        navigationTimeoutSecs: this.config.navigationTimeoutSecs || 60,
        requestHandlerTimeoutSecs: this.config.requestHandlerTimeoutSecs || 70,
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
            logBlock('offerup', response.status(), request.loadedUrl || request.url);
            const err = new Error(`OfferUp responded with ${response.status()}`);
            err.recoverable = true;
            throw err;
          }

          await page
            .waitForSelector('[data-testid="item-card"], article, section', {
              timeout: 18000,
            })
            .catch(() => {});

          const listings = await this.extractListings(page, request.loadedUrl || request.url);

          for (const listing of listings) {
            const id = listing.listingId || listing.id || listing.url;
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

          await sleepWithJitter(500, 600);
        },
        failedRequestHandler({ request, error }) {
          logger.warn('OfferUp request failed', {
            url: request.url,
            retries: request.retryCount,
            error: error.message,
            betaPlatform: true,
          });
        },
      });

      await crawler.run(startUrls);

      logger.info(`Scraped ${results.length} listings from OfferUp (BETA)`, {
        maxResults,
        startUrls: startUrls.length,
        betaPlatform: true,
        riskLevel: 'medium-high',
        zipCode,
      });

      return results.slice(0, maxResults);
    } catch (error) {
      logger.error('OfferUp scraping failed (BETA - expected behavior)', {
        error: error.message,
        betaPlatform: true,
        riskLevel: 'medium-high',
        recoverable: true,
      });

      const wrapped =
        error instanceof PlatformScrapingError
          ? error
          : new PlatformScrapingError('offerup', error.message, error);
      wrapped.recoverable = true; // allow graceful degradation
      throw wrapped;
    }
  }

  /**
   * Build search URLs from keywords and zip code
   */
  buildSearchUrls(keywords = [], zipCode = '10001') {
    const safeKeywords = Array.isArray(keywords) ? keywords : [];
    return safeKeywords.map((keyword) => {
      const query = encodeURIComponent(keyword);
      return `https://offerup.com/search?q=${query}&zip_code=${zipCode}`;
    });
  }

  /**
   * Extract listings from OfferUp search page
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
      '[data-testid="item-card"], article, section',
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
              card.querySelector('[data-testid="item-card-title"]') ||
              card.querySelector('h3, h2, a span');
            const priceEl =
              card.querySelector('[data-testid="item-card-price"]') ||
              card.querySelector('[itemprop="price"], .price');
            const urlAnchor =
              card.querySelector('a[href*="/item/"]') || card.querySelector('a[href*="/detail/"]');
            const imageEl = card.querySelector('img');
            const locationEl = card.querySelector('[data-testid="item-card-location"]');
            const descriptionEl = card.querySelector('[data-testid="item-card-description"]');

            const title = titleEl?.textContent?.trim() || null;
            const priceText = priceEl?.textContent?.trim() || null;
            const urlPath = urlAnchor?.getAttribute('href') || null;
            let absoluteUrl = null;
            if (urlPath) {
              absoluteUrl = urlPath.startsWith('http') ? urlPath : new URL(urlPath, url).toString();
            }

            const id =
              urlAnchor?.getAttribute('data-testid') ||
              urlAnchor?.getAttribute('data-lid') ||
              urlAnchor?.getAttribute('data-id') ||
              absoluteUrl;

            return {
              listingId: id,
              id,
              title,
              price: priceText,
              formattedPrice: priceText,
              priceAmount: toPrice(priceText),
              description: descriptionEl?.textContent?.trim() || card.innerText?.trim() || '',
              size: null,
              condition: null,
              url: absoluteUrl,
              image: imageEl?.getAttribute('src') || null,
              locationName: locationEl?.textContent?.trim() || null,
              _details: {
                description: descriptionEl?.textContent?.trim() || '',
                condition: null,
                seller: {},
                location: { name: locationEl?.textContent?.trim() || null },
                photos: imageEl?.getAttribute('src') ? [imageEl.getAttribute('src')] : [],
              },
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
   * Validate OfferUp scraper configuration
   */
  validate() {
    super.validate();
    if (this.config.requiresProxy && this.config.requiresProxy !== true) {
      throw new PlatformScrapingError('offerup', 'OfferUp scraper must enforce proxy usage');
    }
    logger.warn(
      '⚠️  OfferUp scraper is BETA - expect higher failure rates, Cloudflare challenges, and slower scraping (browser automation)'
    );
  }
}
