/**
 * Integration test for DepopScraper using mocked PlaywrightCrawler
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

let DepopScraper;

beforeAll(async () => {
  ({ DepopScraper } = await import('../../src/scrapers/depop.js'));
});

const createPage = (data, nextUrl = null) => ({
  setExtraHTTPHeaders: jest.fn(async () => {}),
  waitForSelector: jest.fn(async () => {}),
  evaluate: jest.fn(async () => null),
  $$eval: jest.fn(async () => data),
  $eval: jest.fn(async () => nextUrl),
});

describe('DepopScraper (mocked Playwright integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Nike Dunk'],
    maxResults: 3,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  const mockDepopListings = [
    {
      id: 'dep123',
      title: 'Air Jordan 1 Retro High OG Bred',
      price: '$250',
      description: 'VNDS condition, OG all included',
      brand: 'Nike',
      size: '10.5',
      condition: 'like new',
      url: 'https://depop.com/products/dep123',
      sellerUsername: 'sneakercollector',
      sellerRating: 4.8,
      sellerReviewCount: 150,
      image: 'https://depop.com/images/dep123.jpg',
    },
    {
      id: 'dep456',
      title: 'Nike Dunk Low Panda',
      price: '$180',
      description: 'Great condition',
      brand: 'Nike',
      size: '10',
      condition: 'used good',
      url: 'https://depop.com/products/dep456',
      sellerUsername: 'panda_seller',
      sellerRating: 4.5,
      sellerReviewCount: 75,
      image: 'https://depop.com/images/dep456.jpg',
    },
  ];

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();
    crawlerOptions.length = 0;
    scraper = new DepopScraper({ name: 'depop', maxResults: 5, maxResultsCap: 10 });
  });

  it('scrapes listings with pagination and residential proxy enforcement', async () => {
    const page1 = createPage(
      mockDepopListings.slice(0, 1),
      'https://www.depop.com/search/?q=Air&page=2'
    );
    const page2 = createPage(mockDepopListings.slice(1), null);

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
        });
      }
    });

    const results = await scraper.scrape(defaultParams);

    expect(mockCreateProxyConfiguration).toHaveBeenCalled();
    expect(results).toHaveLength(2);
  });

  it('builds search urls correctly', () => {
    const urls = scraper.buildSearchUrls(['Dunk Low']);
    expect(urls[0]).toContain('https://www.depop.com/search/?q=Dunk%20Low');
  });
});
