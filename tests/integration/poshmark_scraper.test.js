/**
 * Integration test for PoshmarkScraper using mocked Apify API responses
 * Phase 4.0: Safer Marketplaces
 */

import { jest } from '@jest/globals';
import { ActorCallError } from '../../src/utils/errors.js';

const mockPoshmarkListings = [
  {
    id: 'posh456',
    title: 'Nike Air Jordan 1 Retro High OG Chicago',
    price: 300,
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

let PoshmarkScraper;

beforeAll(async () => {
  ({ PoshmarkScraper } = await import('../../src/scrapers/poshmark.js'));
});

describe('PoshmarkScraper (mocked Apify integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Yeezy 350'],
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
      id: 'run_posh_123',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset_posh_abc',
    });
    mockDatasetListItems.mockResolvedValue({ items: mockPoshmarkListings });

    scraper = new PoshmarkScraper({
      name: 'poshmark',
      actorId: 'lexis-solutions/poshmark-scraper',
    });
  });

  it('calls the Poshmark actor and returns dataset listings', async () => {
    const results = await scraper.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith(
      'lexis-solutions/poshmark-scraper',
      expect.objectContaining({
        searchQueries: ['Air Jordan 1', 'Yeezy 350'],
        maxItems: 50,
        proxyConfiguration: defaultParams.proxyConfig,
      })
    );

    expect(mockApifyClientDataset).toHaveBeenCalledWith('dataset_posh_abc');
    expect(results).toEqual(mockPoshmarkListings);
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
    const scraperNoActorId = new PoshmarkScraper({ name: 'poshmark' });
    await scraperNoActorId.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith(
      'lexis-solutions/poshmark-scraper',
      expect.anything()
    );
  });
});
