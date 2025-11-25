/**
 * Integration test for MercariScraper using mocked PlaywrightCrawler (BETA platform)
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

let MercariScraper;

beforeAll(async () => {
  ({ MercariScraper } = await import('../../src/scrapers/mercari.js'));
});

const createPage = (data, nextUrl = null) => ({
  setExtraHTTPHeaders: jest.fn(async () => {}),
  waitForSelector: jest.fn(async () => {}),
  evaluate: jest.fn(async () => null),
  $$eval: jest.fn(async () => data),
  $eval: jest.fn(async () => nextUrl),
});

const createTestLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child() {
    return this;
  },
});

describe('MercariScraper (mocked Playwright integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Nike Dunk'],
    maxResults: 3,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  const mockMercariListings = [
    {
      id: 'merc123',
      title: 'Air Jordan 1 Retro High OG Chicago',
      price: '$280',
      priceAmount: 280,
      description: 'Brand new with tags, never worn',
      brand: 'Nike',
      size: '11',
      condition: 'new',
      url: 'https://mercari.com/us/item/merc123',
      sellerName: 'sneakerdealer',
    },
    {
      id: 'merc456',
      title: 'Nike Dunk Low Panda',
      price: '$180',
      description: 'Like new condition',
      size: '10.5',
      condition: 'like new',
      url: 'https://mercari.com/us/item/merc456',
      photo: 'https://mercari.com/images/merc456.jpg',
    },
  ];

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();
    crawlerOptions.length = 0;
    scraper = new MercariScraper({
      name: 'Mercari',
      maxResults: 30,
      maxResultsCap: 60,
      maxRequestRetries: 2,
      isBeta: true,
      riskLevel: 'medium-high',
    });
  });

  it('scrapes listings with pagination and residential proxy enforcement', async () => {
    const page1 = createPage(
      mockMercariListings.slice(0, 1),
      'https://www.mercari.com/search/?page=2'
    );
    const page2 = createPage(mockMercariListings.slice(1), null);
    const log = createTestLogger();

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
          log,
        });
      }
    });

    const results = await scraper.scrape(defaultParams);

    expect(mockCreateProxyConfiguration).toHaveBeenCalled();
    expect(results).toHaveLength(2);
  });

  it('builds search urls correctly', () => {
    const urls = scraper.buildSearchUrls(['Dunk Low']);
    expect(urls[0]).toContain('https://www.mercari.com/search/?keyword=Dunk%20Low');
  });
});
