/**
 * Integration test for EbayScraper using mocked PlaywrightCrawler
 */

import { jest } from '@jest/globals';

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

let EbayScraper;

beforeAll(async () => {
  ({ EbayScraper } = await import('../../src/scrapers/ebay.js'));
});

const createPage = (data, nextUrl = null) => ({
  setExtraHTTPHeaders: jest.fn(async () => {}),
  waitForSelector: jest.fn(async () => {}),
  evaluate: jest.fn(async () => data),
  $$eval: jest.fn(async () => data),
  $eval: jest.fn(async () => nextUrl),
});

describe('EbayScraper (mocked Playwright integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1'],
    size: '10',
    priceRange: { min: 100, max: 500 },
    excludeAuctions: true,
    maxResults: 2,
    proxyConfig: {
      useApifyProxy: true,
    },
  };

  const ebayFixtures = [
    {
      itemNumber: '1234567890',
      title: 'Air Jordan 1 Retro High OG Bred',
      price: '$250',
      url: 'https://www.ebay.com/itm/1234567890',
      image: 'https://i.ebayimg.com/images/foo.jpg',
      seller: 'trusted_seller',
      listingType: 'buy_it_now',
    },
    {
      itemNumber: '222222222',
      title: 'Air Jordan 1 Chicago',
      price: '$150',
      url: 'https://www.ebay.com/itm/222222222',
      image: 'https://i.ebayimg.com/images/bar.jpg',
      seller: 'trusted_seller_2',
      listingType: 'auction',
    },
  ];

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();
    crawlerOptions.length = 0;
    scraper = new EbayScraper({ name: 'ebay', maxResults: 5, maxResultsCap: 10 });
  });

  it('scrapes listings with filters and buy-it-now preference', async () => {
    const page1 = createPage(ebayFixtures, null);

    const queue = [];
    mockRun.mockImplementation(async (startUrls) => {
      queue.push(...startUrls.map((url) => ({ url })));
      while (queue.length) {
        const req = queue.shift();
        const page = page1;
        await crawlerOptions[0].requestHandler({
          page,
          request: { url: req.url, loadedUrl: req.url, retryCount: 0 },
          response: { status: () => 200 },
          enqueueLinks: async () => {},
          log: { info: jest.fn(), warning: jest.fn(), debug: jest.fn() },
        });
      }
    });

    const results = await scraper.scrape(defaultParams);

    expect(mockCreateProxyConfiguration).toHaveBeenCalled();
    expect(results).toHaveLength(2);
    const url = new URL(scraper.buildSearchUrls(['AJ1'], '10', { min: 100, max: 500 }, true)[0]);
    expect(url.searchParams.get('_udlo')).toBe('100');
    expect(url.searchParams.get('_udhi')).toBe('500');
    expect(url.searchParams.get('LH_BIN')).toBe('1');
  });
});
