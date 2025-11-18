/**
 * Integration test for OfferUpScraper using mocked Apify API responses
 * Phase 4.1: Beta Platforms
 */

import { jest } from '@jest/globals';
import { ActorCallError } from '../../src/utils/errors.js';

const mockOfferUpListings = [
  {
    listingId: 'offer123',
    title: 'Air Jordan 1 Retro High OG Shadow',
    price: 220,
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
    price: 300,
    formattedPrice: '$300',
    description: 'Brand new, never worn',
    size: '11.5',
    condition: 'new',
    url: 'https://offerup.com/item/detail/offer456',
    image: 'https://offerup.com/photos/offer456.jpg',
    locationName: 'New York, NY',
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

let OfferUpScraper;

beforeAll(async () => {
  ({ OfferUpScraper } = await import('../../src/scrapers/offerup.js'));
});

describe('OfferUpScraper (mocked Apify integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Yeezy'],
    maxResults: 30,
    zipCode: '10001',
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  const config = {
    name: 'OfferUp',
    type: 'orchestrated',
    actorId: 'igolaizola/offerup-scraper',
    rateLimit: 30,
    maxResults: 30,
    timeoutMs: 180000,
    riskLevel: 'medium-high',
    isBeta: true,
    requiresZipCode: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully scrape OfferUp listings with ZIP code', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run-123',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset-123',
    });

    mockDatasetListItems.mockResolvedValueOnce({
      items: mockOfferUpListings,
    });

    const scraper = new OfferUpScraper(config);
    const results = await scraper.scrape(defaultParams);

    expect(results).toHaveLength(2);
    expect(results[0].listingId).toBe('offer123');
    expect(results[0].title).toContain('Air Jordan 1');
    expect(results[1].listingId).toBe('offer456');

    expect(mockActorCall).toHaveBeenCalledWith(
      'igolaizola/offerup-scraper',
      expect.objectContaining({
        query: 'Air Jordan 1 Yeezy', // Combined keywords
        zipCode: '10001',
        maxItems: 30,
        fetchDetails: true,
        proxyConfiguration: defaultParams.proxyConfig,
      }),
      expect.objectContaining({
        timeoutSecs: 180, // 3 minutes for browser automation
      })
    );
  });

  it('should default to NYC ZIP code when not provided', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run-456',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset-456',
    });

    mockDatasetListItems.mockResolvedValueOnce({
      items: [],
    });

    const scraper = new OfferUpScraper(config);
    const paramsWithoutZip = { ...defaultParams };
    delete paramsWithoutZip.zipCode;

    await scraper.scrape(paramsWithoutZip);

    expect(mockActorCall).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        zipCode: '10001', // Default to NYC
      }),
      expect.any(Object)
    );
  });

  it('should handle actor call failure gracefully (BETA platform)', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run-789',
      status: 'FAILED',
      defaultDatasetId: 'dataset-789',
    });

    const scraper = new OfferUpScraper(config);

    const error = await scraper.scrape(defaultParams).catch((e) => e);
    expect(error).toBeInstanceOf(ActorCallError);
    expect(error.message).toMatch(/failed with status: FAILED/);
    expect(error.recoverable).toBe(true);
  });

  it('should apply strict maxResults limit for beta platform', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run-999',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset-999',
    });

    mockDatasetListItems.mockResolvedValueOnce({
      items: [],
    });

    const scraper = new OfferUpScraper(config);

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

  it('should handle errors as recoverable for graceful degradation', async () => {
    mockActorCall.mockRejectedValueOnce(new Error('Network timeout'));

    const scraper = new OfferUpScraper(config);

    const error = await scraper.scrape(defaultParams).catch((e) => e);
    expect(error).toBeInstanceOf(ActorCallError);
    expect(error.recoverable).toBe(true); // Should be marked as recoverable
  });
});
