/**
 * Integration test for PoshmarkScraper using mocked PlaywrightCrawler
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

let PoshmarkScraper;

beforeAll(async () => {
  ({ PoshmarkScraper } = await import('../../src/scrapers/poshmark.js'));
});

const createPage = (data, nextUrl = null) => ({
  setExtraHTTPHeaders: jest.fn(async () => {}),
  waitForSelector: jest.fn(async () => {}),
  evaluate: jest.fn(async () => data),
  $$eval: jest.fn(async () => data),
  $eval: jest.fn(async () => nextUrl),
});

describe('PoshmarkScraper (mocked Playwright integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Yeezy 350'],
    maxResults: 3,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  const mockPoshmarkListings = [
    {
      id: 'posh456',
      title: 'Nike Air Jordan 1 Retro High OG Chicago',
      price: '$300',
      description: 'NWT, brand new with tags, OG box included',
      brand: 'Nike',
      size: '11',
      condition: 'nwt',
      url: 'https://poshmark.com/listing/posh456',
      sellerUsername: 'poshseller99',
      sellerRating: 4.9,
      sellerReviewCount: 200,
      image: 'https://poshmark.com/img/posh456.jpg',
    },
    {
      id: 'posh789',
      title: 'Yeezy 350 Zebra',
      price: '$220',
      description: 'Lightly worn',
      brand: 'Adidas',
      size: '10.5',
      condition: 'good',
      url: 'https://poshmark.com/listing/posh789',
      sellerUsername: 'yeezygal',
      sellerRating: 4.7,
      sellerReviewCount: 80,
      image: 'https://poshmark.com/img/posh789.jpg',
    },
  ];

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();
    crawlerOptions.length = 0;
    scraper = new PoshmarkScraper({ name: 'poshmark', maxResults: 5, maxResultsCap: 10 });
  });

  it('scrapes listings with pagination and residential proxy enforcement', async () => {
    const page1 = createPage(mockPoshmarkListings.slice(0, 1), 'https://poshmark.com/page-2');
    const page2 = createPage(mockPoshmarkListings.slice(1), null);

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
    expect(urls[0]).toContain('https://poshmark.com/search?query=Dunk%20Low');
  });
});
