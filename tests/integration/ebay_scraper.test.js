/**
 * Integration test for EbayScraper using mocked Apify API responses
 */

import { jest } from '@jest/globals';
import { ActorCallError } from '../../src/utils/errors.js';

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

let EbayScraper;

beforeAll(async () => {
  ({ EbayScraper } = await import('../../src/scrapers/ebay.js'));
});

describe('EbayScraper (mocked Apify integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1'],
    size: '10',
    priceRange: { min: 100, max: 500 },
    excludeAuctions: true,
    maxResults: 25,
    proxyConfig: {
      useApifyProxy: true,
    },
  };

  const ebayFixtures = [
    {
      itemNumber: '1234567890',
      title: 'Air Jordan 1 Retro High OG Bred',
      price: 250,
      url: 'https://www.ebay.com/itm/1234567890',
      image: 'https://i.ebayimg.com/images/foo.jpg',
      seller: 'trusted_seller',
    },
  ];

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();

    mockActorCall.mockResolvedValue({
      id: 'run_ebay',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset_ebay',
    });
    mockDatasetListItems.mockResolvedValue({ items: ebayFixtures });

    scraper = new EbayScraper({ name: 'ebay', actorId: 'dtrungtin/ebay-items-scraper' });
  });

  it('calls the eBay actor with correct input mapping and returns dataset listings', async () => {
    const results = await scraper.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith(
      'dtrungtin/ebay-items-scraper',
      expect.objectContaining({
        startUrls: expect.arrayContaining([
          expect.objectContaining({ url: expect.stringContaining('ebay.com/sch/i.html') }),
        ]),
        maxItems: 25,
        proxyConfiguration: defaultParams.proxyConfig,
      })
    );

    // Verify search URL params: query, _sop=10 (newly listed), _udlo/_udhi, LH_BIN when excludeAuctions
    const passedInput = mockActorCall.mock.calls[0][1];
    const urlStr = passedInput.startUrls[0].url;
    const url = new URL(urlStr);
    expect(url.searchParams.get('_sop')).toBe('10');
    expect(url.searchParams.get('_udlo')).toBe('100');
    expect(url.searchParams.get('_udhi')).toBe('500');
    expect(url.searchParams.get('LH_BIN')).toBe('1');

    expect(mockApifyClientDataset).toHaveBeenCalledWith('dataset_ebay');
    expect(results).toEqual(ebayFixtures);
  });

  it('throws ActorCallError when the downstream actor fails', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run_ebay',
      status: 'FAILED',
      defaultDatasetId: 'dataset_ebay',
    });

    await expect(scraper.scrape(defaultParams)).rejects.toThrow(ActorCallError);
  });
});
