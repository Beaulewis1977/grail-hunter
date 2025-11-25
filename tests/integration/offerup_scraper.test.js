/**
 * Integration test for OfferUpScraper using mocked PlaywrightCrawler (BETA platform)
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

let OfferUpScraper;

beforeAll(async () => {
  ({ OfferUpScraper } = await import('../../src/scrapers/offerup.js'));
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

describe('OfferUpScraper (mocked Playwright integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Yeezy'],
    maxResults: 3,
    zipCode: '10001',
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  const mockOfferUpListings = [
    {
      listingId: 'offer123',
      title: 'Air Jordan 1 Retro High OG Shadow',
      price: '$220',
      formattedPrice: '$220',
      description: 'Good condition, worn a few times',
      size: '10',
      condition: 'good',
      url: 'https://offerup.com/item/detail/offer123',
      image: 'https://offerup.com/photos/offer123.jpg',
      locationName: 'Los Angeles, CA',
      _details: {
        description: 'Good condition, worn a few times. OG box included.',
        condition: 'good',
        seller: {
          name: 'john_doe',
          rating: 4.7,
          reviewCount: 85,
          verified: true,
        },
        location: {
          name: 'Los Angeles, CA',
          zipCode: '90001',
        },
        photos: ['https://offerup.com/photos/offer123.jpg'],
      },
    },
    {
      listingId: 'offer456',
      title: 'Yeezy Boost 350 V2 Zebra',
      price: '$300',
      formattedPrice: '$300',
      description: 'Brand new, never worn',
      size: '11.5',
      condition: 'new',
      url: 'https://offerup.com/item/detail/offer456',
      image: 'https://offerup.com/photos/offer456.jpg',
      locationName: 'New York, NY',
    },
  ];

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();
    crawlerOptions.length = 0;
    scraper = new OfferUpScraper({
      name: 'OfferUp',
      maxResults: 30,
      maxResultsCap: 60,
      maxRequestRetries: 2,
      isBeta: true,
      riskLevel: 'medium-high',
      requiresZipCode: true,
    });
  });

  it('scrapes listings with pagination, enforcing zip code and proxies', async () => {
    const page1 = createPage(mockOfferUpListings.slice(0, 1), 'https://offerup.com/search?page=2');
    const page2 = createPage(mockOfferUpListings.slice(1), null);
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

  it('builds search urls with zip code', () => {
    const urls = scraper.buildSearchUrls(['Dunk Low'], '94107');
    expect(urls[0]).toContain('zip_code=94107');
  });
});
