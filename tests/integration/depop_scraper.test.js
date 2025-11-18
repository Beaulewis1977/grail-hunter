/**
 * Integration test for DepopScraper using mocked Apify API responses
 * Phase 4.0: Safer Marketplaces
 */

import { jest } from '@jest/globals';
import { ActorCallError } from '../../src/utils/errors.js';

const mockDepopListings = [
  {
    id: 'dep123',
    title: 'Air Jordan 1 Retro High OG Bred',
    price: 250,
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

let DepopScraper;

beforeAll(async () => {
  ({ DepopScraper } = await import('../../src/scrapers/depop.js'));
});

describe('DepopScraper (mocked Apify integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Nike Dunk'],
    maxResults: 50,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();

    mockActorCall.mockResolvedValue({
      id: 'run_depop_123',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset_depop_abc',
    });
    mockDatasetListItems.mockResolvedValue({ items: mockDepopListings });

    scraper = new DepopScraper({ name: 'depop', actorId: 'lexis-solutions/depop-scraper' });
  });

  it('calls the Depop actor and returns dataset listings', async () => {
    const results = await scraper.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith(
      'lexis-solutions/depop-scraper',
      expect.objectContaining({
        searchQueries: ['Air Jordan 1', 'Nike Dunk'],
        maxItems: 50,
        proxyConfiguration: defaultParams.proxyConfig,
      })
    );

    expect(mockApifyClientDataset).toHaveBeenCalledWith('dataset_depop_abc');
    expect(results).toEqual(mockDepopListings);
  });

  it('throws error when actor call fails', async () => {
    mockActorCall.mockResolvedValue({
      id: 'run_fail',
      status: 'FAILED',
      defaultDatasetId: 'dataset_fail',
    });

    await expect(scraper.scrape(defaultParams)).rejects.toThrow(ActorCallError);
    await expect(scraper.scrape(defaultParams)).rejects.toThrow(
      'Actor run failed with status: FAILED'
    );
  });

  it('throws error when actor call returns null', async () => {
    mockActorCall.mockResolvedValue(null);

    await expect(scraper.scrape(defaultParams)).rejects.toThrow(ActorCallError);
    await expect(scraper.scrape(defaultParams)).rejects.toThrow('Actor call returned null');
  });

  it('uses fallback actor ID when not provided in config', async () => {
    const scraperNoActorId = new DepopScraper({ name: 'depop' });
    await scraperNoActorId.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith('lexis-solutions/depop-scraper', expect.anything());
  });
});
