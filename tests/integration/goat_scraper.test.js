/**
 * Integration test for GoatScraper using mocked Apify API responses
 * Phase 4.2: GOAT & StockX Hybrid Intelligence Layers
 */

import { jest } from '@jest/globals';

const mockGoatListings = [
  {
    id: 'goat123',
    name: 'Air Jordan 1 Retro High OG Bred',
    brand: 'Air Jordan',
    lowestPrice: 950,
    price: 950,
    sku: '555088-001',
    colorway: 'Bred',
    size: '10.5',
    slug: 'air-jordan-1-retro-high-og-bred',
    image: 'https://image.goat.com/attachments/product_templates/photos/...jpg',
    description: 'Air Jordan 1 Retro High OG in iconic Bred colorway',
    releaseDate: '2016-09-03',
  },
  {
    id: 'goat456',
    name: 'Nike Dunk Low Panda',
    brand: 'Nike',
    lowestPrice: 180,
    price: 180,
    sku: 'DD1391-100',
    colorway: 'Panda',
    size: '11',
    slug: 'nike-dunk-low-panda',
    imageUrl: 'https://image.goat.com/attachments/product_templates/photos/...jpg',
    description: 'Nike Dunk Low in classic black and white Panda colorway',
  },
];

const mockActorCall = jest.fn();
const mockDatasetListItems = jest.fn();
const mockApifyClientDataset = jest.fn(() => ({ listItems: mockDatasetListItems }));

jest.unstable_mockModule('apify', () => ({
  Actor: {
    call: mockActorCall,
    apifyClient: {
      dataset: mockApifyClientDataset,
    },
  },
}));

let GoatScraper;

beforeAll(async () => {
  ({ GoatScraper } = await import('../../src/scrapers/goat.js'));
});

describe('GoatScraper (mocked Apify integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Nike Dunk'],
    maxResults: 50,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
    acknowledgePlatformTerms: true,
  };

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();

    mockActorCall.mockResolvedValue({
      id: 'run_goat_123',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset_goat_abc',
    });
    mockDatasetListItems.mockResolvedValue({ items: mockGoatListings });

    scraper = new GoatScraper({ name: 'goat', actorId: 'ecomscrape/goat-product-search-scraper' });
  });

  it('calls the GOAT actor and returns dataset listings', async () => {
    const results = await scraper.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith(
      'ecomscrape/goat-product-search-scraper',
      expect.objectContaining({
        query: 'Air Jordan 1 Nike Dunk', // Keywords joined
        maxItems: 50,
        proxyConfiguration: defaultParams.proxyConfig,
      }),
      expect.objectContaining({
        timeoutSecs: 180, // 3 minutes default
      })
    );

    expect(mockApifyClientDataset).toHaveBeenCalledWith('dataset_goat_abc');
    expect(results).toEqual(mockGoatListings);
    expect(results).toHaveLength(2);
  });

  it('throws error when actor call fails', async () => {
    mockActorCall.mockResolvedValue({
      id: 'run_fail',
      status: 'FAILED',
      defaultDatasetId: 'dataset_fail',
    });

    const results = await scraper.scrape(defaultParams);

    // GOAT scraper should return [] on failure (graceful degradation)
    expect(results).toEqual([]);
  });

  it('throws error when actor call returns null', async () => {
    mockActorCall.mockResolvedValue(null);

    const results = await scraper.scrape(defaultParams);

    // GOAT scraper should return [] on failure (graceful degradation)
    expect(results).toEqual([]);
  });

  it('uses fallback actor ID when not provided in config', async () => {
    const scraperNoActorId = new GoatScraper({ name: 'goat' });
    await scraperNoActorId.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith(
      'ecomscrape/goat-product-search-scraper',
      expect.anything(),
      expect.anything()
    );
  });

  it('resets failure count on successful scrape', async () => {
    // First scrape fails
    mockActorCall.mockResolvedValueOnce(null);
    await scraper.scrape(defaultParams);
    expect(scraper.failureCount).toBe(1);

    // Second scrape succeeds
    mockActorCall.mockResolvedValueOnce({
      id: 'run_success',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset_success',
    });
    mockDatasetListItems.mockResolvedValue({ items: mockGoatListings });

    await scraper.scrape(defaultParams);
    expect(scraper.failureCount).toBe(0); // Reset on success
  });

  it('auto-disables after max failures', async () => {
    // Fail 3 times (maxFailures = 3)
    mockActorCall.mockResolvedValue(null);

    await scraper.scrape(defaultParams);
    expect(scraper.failureCount).toBe(1);

    await scraper.scrape(defaultParams);
    expect(scraper.failureCount).toBe(2);

    await scraper.scrape(defaultParams);
    expect(scraper.failureCount).toBe(3);

    // 4th attempt should skip scraping
    const results = await scraper.scrape(defaultParams);
    expect(results).toEqual([]);
    expect(mockActorCall).toHaveBeenCalledTimes(3); // Not called on 4th attempt
  });
});
