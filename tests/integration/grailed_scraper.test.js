/**
 * Integration test for GrailedScraper using mocked Apify API responses
 */

import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ActorCallError } from '../../src/utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const grailedFixtures = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/grailed-listings.json'), 'utf-8')
);

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

let GrailedScraper;

beforeAll(async () => {
  ({ GrailedScraper } = await import('../../src/scrapers/grailed.js'));
});

describe('GrailedScraper (mocked Apify integration)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1', 'Yeezy 350'],
    maxResults: 25,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };

  let scraper;

  beforeEach(() => {
    jest.clearAllMocks();

    mockActorCall.mockResolvedValue({
      id: 'run_123',
      status: 'SUCCEEDED',
      defaultDatasetId: 'dataset_abc',
    });
    mockDatasetListItems.mockResolvedValue({ items: grailedFixtures });

    scraper = new GrailedScraper({ name: 'grailed', actorId: 'vmscrapers/grailed' });
  });

  it('calls the Grailed actor and returns dataset listings', async () => {
    const results = await scraper.scrape(defaultParams);

    expect(mockActorCall).toHaveBeenCalledWith(
      'vmscrapers/grailed',
      expect.objectContaining({
        startUrls: [
          { url: 'https://www.grailed.com/shop?q=Air%20Jordan%201' },
          { url: 'https://www.grailed.com/shop?q=Yeezy%20350' },
        ],
        maxProductsPerStartUrl: 25,
        proxyConfiguration: defaultParams.proxyConfig,
      })
    );

    expect(mockApifyClientDataset).toHaveBeenCalledWith('dataset_abc');
    expect(results).toEqual(grailedFixtures);
  });

  it('falls back to default proxy config when none provided', async () => {
    await scraper.scrape({ keywords: ['Dunk Low'] });

    expect(mockActorCall).toHaveBeenCalledWith(
      'vmscrapers/grailed',
      expect.objectContaining({
        maxProductsPerStartUrl: 50,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
      })
    );
  });

  it('throws ActorCallError when the downstream actor fails', async () => {
    mockActorCall.mockResolvedValueOnce({
      id: 'run_123',
      status: 'FAILED',
      defaultDatasetId: 'dataset_abc',
    });

    await expect(scraper.scrape(defaultParams)).rejects.toThrow(ActorCallError);
  });
});
