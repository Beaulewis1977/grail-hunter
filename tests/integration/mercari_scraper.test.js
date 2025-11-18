/**
 * Integration test for MercariScraper using mocked Apify API responses
 * Phase 4.1: Beta Platforms
 */

import { jest } from '@jest/globals';
import { ActorCallError } from '../../src/utils/errors.js';

const mockMercariListings = [
  {
    id: 'merc123',
    title: 'Air Jordan 1 Retro High OG Chicago',
    price: 280,
    priceAmount: 280,
    description: 'Brand new with tags, never worn',
    brand: 'Nike',
    size: '11',
    condition: 'new',
    url: 'https://mercari.com/us/item/merc123',
    sellerName: 'sneakerdealer',
    sellerRating: 4.9,
    sellerReviewCount: 200,
    image: 'https://mercari.com/images/merc123.jpg',
  },
  {
    id: 'merc456',
    title: 'Nike Dunk Low Panda',
    price: 180,
    description: 'Like new condition',
    size: '10.5',
    condition: 'like new',
    productUrl: 'https://mercari.com/us/item/merc456',
    photo: 'https://mercari.com/images/merc456.jpg',
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

let MercariScraper;

beforeAll(async () => {
  ({ MercariScraper } = await import('../../src/scrapers/mercari.js'));
});

describe('MercariScraper (mocked Apify integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Nike Dunk'],
    maxResults: 30,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  const config = {
    name: 'Mercari',
    type: 'orchestrated',
    actorId: 'jupri/mercari-scraper',
    rateLimit: 50,
    maxResults: 30,
    timeoutMs: 120000,
    riskLevel: 'medium-high',
    isBeta: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully scrape Mercari listings', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run-123',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset-123',
    });

    mockDatasetListItems.mockResolvedValueOnce({
      items: mockMercariListings,
    });

    const scraper = new MercariScraper(config);
    const results = await scraper.scrape(defaultParams);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('merc123');
    expect(results[0].title).toContain('Air Jordan 1');
    expect(results[1].id).toBe('merc456');

    expect(mockActorCall).toHaveBeenCalledWith(
      'jupri/mercari-scraper',
      expect.objectContaining({
        searchKeywords: defaultParams.keywords,
        maxItems: 30,
        proxyConfiguration: defaultParams.proxyConfig,
      }),
      expect.objectContaining({
        timeoutSecs: 120,
      })
    );
  });

  it('should handle actor call failure gracefully (BETA platform)', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run-456',
      status: 'FAILED',
      defaultDatasetId: 'dataset-456',
    });

    const scraper = new MercariScraper(config);

    const error = await scraper.scrape(defaultParams).catch((e) => e);
    expect(error).toBeInstanceOf(ActorCallError);
    expect(error.message).toMatch(/failed with status: FAILED/);
    expect(error.recoverable).toBe(true);
  });

  it('should handle null actor response', async () => {
    mockActorCall.mockResolvedValueOnce(null);

    const scraper = new MercariScraper(config);

    await expect(scraper.scrape(defaultParams)).rejects.toThrow(ActorCallError);
    await expect(scraper.scrape(defaultParams)).rejects.toThrow(/Actor call returned null/);
  });

  it('should apply strict maxResults limit for beta platform', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run-789',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset-789',
    });

    mockDatasetListItems.mockResolvedValueOnce({
      items: [],
    });

    const scraper = new MercariScraper(config);

    // Try to request 100 items, but beta platform should cap at 30
    await scraper.scrape({ ...defaultParams, maxResults: 100 });

    expect(mockActorCall).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        maxItems: 30, // Capped at beta platform limit
      }),
      expect.any(Object)
    );
  });
});
