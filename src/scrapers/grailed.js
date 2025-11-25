/**
 * Grailed Scraper
 * First-party Playwright/Crawlee implementation with residential proxy enforcement.
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

export class GrailedScraper extends BaseScraper {
  /**
   * Scrape Grailed listings via Playwright + Crawlee
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams = {}) {
    const maxResults = Math.min(
      searchParams.maxResults || this.config.maxResults || 80,
      this.config.maxResultsCap || 150
    );

    logger.info('Starting Grailed scraping', {
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
        preNavigationHooks: [
          async ({ page }) => {
            const ua = randomUserAgent();
            await page.context().setExtraHTTPHeaders({ 'User-Agent': ua });
          },
        ],
        requestHandler: async ({ page, request, response, enqueueLinks }) => {
          if (response && isBlockStatus(response.status())) {
            logBlock('grailed', response.status(), request.loadedUrl || request.url);
            const error = new Error(`Grailed responded with ${response.status()}`);
            error.recoverable = true;
            throw error;
          }

          await page
            .waitForSelector('article, [data-testid="feed-item"]', {
              timeout: 15000,
            })
            .catch(() => {});

          const listings = await this.extractListings(page, request.loadedUrl || request.url);

          for (const listing of listings) {
            const id = listing.id || listing.url || listing.slug;
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
          logger.warn('Grailed request failed', {
            url: request.url,
            retries: request.retryCount,
            error: error.message,
          });
        },
      });

      await crawler.run(startUrls);

      logger.info(`Scraped ${results.length} listings from Grailed`, {
        maxResults,
        startUrls: startUrls.length,
      });

      return results.slice(0, maxResults);
    } catch (error) {
      logger.error('Grailed scraping failed', { error: error.message });
      const wrapped =
        error instanceof PlatformScrapingError
          ? error
          : new PlatformScrapingError('grailed', error.message, error);
      wrapped.recoverable = true;
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
      return `https://www.grailed.com/shop?q=${query}`;
    });
  }

  /**
   * Extract listings from Grailed search page
   */
  async extractListings(page, currentUrl) {
    // Allow tests to inject fixture data without DOM dependency
    const injected = await page
      // eslint-disable-next-line no-underscore-dangle, dot-notation
      .evaluate(() => globalThis['__SCRAPER_TEST_DATA__'] || null)
      .catch(() => null);
    if (Array.isArray(injected)) {
      return injected;
    }

    return page.$$eval(
      'article, [data-testid="feed-item"]',
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
              card.querySelector('[data-testid="listing-title"]') ||
              card.querySelector('h3, h2, a') ||
              card.querySelector('[data-testid="product-title"]');
            const priceEl =
              card.querySelector('[data-testid="listing-price"]') ||
              card.querySelector('[itemprop="price"]') ||
              card.querySelector('.subheader, .caption');
            const sizeEl =
              card.querySelector('[data-testid="size"]') ||
              card.querySelector('.listing-size, .size');
            const conditionEl =
              card.querySelector('[data-testid="condition"]') || card.querySelector('.condition');
            const sellerEl =
              card.querySelector('[data-testid="seller"]') || card.querySelector('.seller-name');
            const imageEl = card.querySelector('img');
            const linkEl = card.querySelector('a[href*="/listings/"]');

            const title = titleEl?.innerText?.trim() || null;
            const priceRaw = priceEl?.textContent?.trim() || null;
            const size = sizeEl?.textContent?.trim() || null;
            const condition = conditionEl?.textContent?.trim() || null;
            const urlPath = linkEl?.getAttribute('href') || null;
            let absoluteUrl = null;
            if (urlPath) {
              absoluteUrl = urlPath.startsWith('http') ? urlPath : new URL(urlPath, url).toString();
            }

            return {
              id: linkEl?.dataset?.id || linkEl?.getAttribute('data-id') || absoluteUrl,
              title,
              price: priceRaw ?? null,
              priceValue: toPrice(priceRaw),
              size,
              condition,
              color: null,
              description: card.innerText?.trim() || '',
              url: absoluteUrl,
              image_url: imageEl?.getAttribute('src') || null,
              user: {
                username: sellerEl?.textContent?.trim() || null,
                feedback_score: null,
                feedback_count: null,
                verified: false,
              },
            };
          })
          .filter((l) => l.title && l.url);
      },
      currentUrl
    );
  }

  async findNextPage(page, currentUrl) {
    const nextHref = await page
      .$eval('a[rel="next"], a[aria-label="Next"], a[aria-label="next"]', (el) => el.href)
      .catch(() => null);

    if (nextHref) {
      return nextHref;
    }

    // Fallback: increment ?page= param
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
   * Validate Grailed scraper configuration
   */
  validate() {
    super.validate();
    const { requiresProxy, proxyConfiguration, proxyConfig } = this.config;

    if (requiresProxy !== undefined && typeof requiresProxy !== 'boolean') {
      throw new TypeError('Grailed requiresProxy flag must be a boolean when set');
    }

    if (requiresProxy === true) {
      const resolvedProxyConfig = proxyConfiguration || proxyConfig;
      const hasValidProxyConfig =
        resolvedProxyConfig &&
        typeof resolvedProxyConfig === 'object' &&
        resolvedProxyConfig.useApifyProxy === true;

      if (!hasValidProxyConfig) {
        throw new PlatformScrapingError(
          'grailed',
          'Grailed scraper must enforce proxy usage with a valid proxyConfiguration'
        );
      }
    }
  }
}
