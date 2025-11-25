/**
 * Integration test for GrailedScraper using mocked PlaywrightCrawler
 */

import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const grailedFixtures = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/grailed-listings.json'), 'utf-8')
);

const mockCreateProxyConfiguration = jest.fn(async (cfg) => cfg);
const mockSleep = jest.fn(async () => {});

jest.unstable_mockModule('apify', () => ({
  Actor: {
    createProxyConfiguration: mockCreateProxyConfiguration,
    sleep: mockSleep,
  },
}));

const crawlerOptions = [];
const mockRun = jest.fn();

jest.unstable_mockModule('crawlee', () => ({
  PlaywrightCrawler: jest.fn().mockImplementation((options) => {
    crawlerOptions.push(options);
    return { run: mockRun };
  }),
}));

let GrailedScraper;

beforeAll(async () => {
  ({ GrailedScraper } = await import('../../src/scrapers/grailed.js'));
});

const createPage = (data, nextUrl = null) => ({
  setExtraHTTPHeaders: jest.fn(async () => {}),
  waitForSelector: jest.fn(async () => {}),
  evaluate: jest.fn(async () => data),
  $$eval: jest.fn(async () => data),
  $eval: jest.fn(async () => nextUrl),
});

describe('GrailedScraper (mocked Playwright integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Yeezy 350'],
    maxResults: 3,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();
    crawlerOptions.length = 0;
    scraper = new GrailedScraper({ name: 'grailed', maxResults: 5, maxResultsCap: 10 });
  });

  it('collects listings across paginated responses with residential proxy enforcement', async () => {
    const page1 = createPage(grailedFixtures.slice(0, 2), 'https://www.grailed.com/page/2');
    const page2 = createPage(grailedFixtures.slice(2, 4), null);

    const queue = [];
    mockRun.mockImplementation(async (startUrls) => {
      queue.push(...startUrls.map((url) => ({ url })));
      while (queue.length) {
        const req = queue.shift();
        const page = req.pageIndex === 1 ? page2 : page1;
        await crawlerOptions[0].requestHandler({
          page,
          request: {
            url: req.url,
            loadedUrl: req.url,
            retryCount: 0,
            pageIndex: req.pageIndex || 0,
          },
          response: { status: () => 200 },
          enqueueLinks: async ({ urls }) => {
            queue.push(...urls.map((url, idx) => ({ url, pageIndex: idx + 1 })));
          },
          log: { info: jest.fn(), warning: jest.fn(), debug: jest.fn() },
        });
      }
    });

    const results = await scraper.scrape(defaultParams);

    expect(mockCreateProxyConfiguration).toHaveBeenCalled();
    expect(results).toHaveLength(3);
    expect(results[0].title).toEqual(grailedFixtures[0].title);
  });

  it('builds search urls correctly', () => {
    const urls = scraper.buildSearchUrls(['Dunk Low']);
    expect(urls[0]).toContain('https://www.grailed.com/shop?q=Dunk%20Low');
  });
});
