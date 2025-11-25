/**
 * Integration tests for StockX Hybrid Strategy (Phase 4.2)
 * Tests orchestrated actor + API fallback behavior
 */

import { jest } from '@jest/globals';

const mockStockXActorListings = [
  {
    id: 'stockx-actor-123',
    name: 'Air Jordan 1 Retro High OG Chicago',
    brand: 'Air Jordan',
    lowestAsk: 1200,
    lastSale: 1150,
    styleId: '555088-101',
    colorway: 'Chicago',
    urlKey: 'air-jordan-1-retro-high-og-chicago',
    releaseDate: '2015-05-30',
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

let StockXScraper;

beforeAll(async () => {
  ({ StockXScraper } = await import('../../src/scrapers/stockx.js'));
});

describe('StockXScraper Hybrid Strategy (Phase 4.2)', () => {
  const defaultParams = {
    keywords: ['Air Jordan 1'],
    maxResults: 50,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
    acknowledgePlatformTerms: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatasetListItems.mockResolvedValue({ items: [] });
    mockApifyClientDataset.mockReturnValue({ listItems: mockDatasetListItems });
  });

  afterEach(() => {
    // Clean up global.fetch mock to prevent test pollution
    delete global.fetch;
  });

  describe('Hybrid mode (orchestrated actor + API fallback)', () => {
    it('should try orchestrated actor first when actorId is configured', async () => {
      mockActorCall.mockResolvedValue({
        id: 'run_stockx_123',
        status: 'SUCCEEDED',
        defaultDatasetId: 'dataset_stockx_abc',
      });
      mockDatasetListItems.mockResolvedValue({ items: mockStockXActorListings });

      const scraper = new StockXScraper({
        name: 'StockX',
        actorId: 'some-stockx-actor',
        timeoutMs: 180000,
      });

      const results = await scraper.scrape(defaultParams);

      // Should call actor
      expect(mockActorCall).toHaveBeenCalledWith(
        'some-stockx-actor',
        expect.objectContaining({
          query: 'Air Jordan 1',
          maxItems: 50,
        }),
        expect.objectContaining({
          timeoutSecs: 180,
        })
      );

      expect(results).toEqual(mockStockXActorListings);
      expect(results).toHaveLength(1);
    });

    it('should fallback to API when actor fails', async () => {
      mockActorCall.mockResolvedValue({
        id: 'run_fail',
        status: 'FAILED',
        defaultDatasetId: 'dataset_fail',
      });

      // Mock global fetch for API fallback
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          Products: [
            {
              uuid: 'api-fallback-123',
              title: 'Air Jordan 1 From API',
              brand: 'Air Jordan',
              market: { lowestAsk: 1000 },
              styleId: '555088-101',
              urlKey: 'air-jordan-1-api',
            },
          ],
        }),
      });

      const scraper = new StockXScraper({
        name: 'StockX',
        actorId: 'some-stockx-actor',
        allowApiFallback: true,
      });

      const results = await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });

      // Should try actor first
      expect(mockActorCall).toHaveBeenCalled();

      // Should fallback to API and return API results
      expect(global.fetch).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('api-fallback-123');
      expect(results[0].title).toBe('Air Jordan 1 From API');
    });

    it('should stop trying actor after 2 consecutive failures', async () => {
      mockActorCall.mockResolvedValue(null); // Actor fails

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ Products: [] }),
      });

      const scraper = new StockXScraper({
        name: 'StockX',
        actorId: 'unreliable-actor',
      });

      // First call: actor fails, fallback to API
      await scraper.scrape(defaultParams);
      expect(mockActorCall).toHaveBeenCalledTimes(1);
      expect(scraper.actorFailureCount).toBe(1);

      // Second call: actor fails again, fallback to API
      await scraper.scrape(defaultParams);
      expect(mockActorCall).toHaveBeenCalledTimes(2);
      expect(scraper.actorFailureCount).toBe(2);

      // Third call: should skip actor entirely, go straight to API
      await scraper.scrape(defaultParams);
      expect(mockActorCall).toHaveBeenCalledTimes(2); // Not called on 3rd attempt
    });
  });

  describe('Backward compatibility (API-only mode)', () => {
    it('should use API-only when no actorId is configured and API fallback is allowed', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          Products: [
            {
              uuid: 'api-only-123',
              title: 'Air Jordan 1 API Only',
              brand: 'Air Jordan',
              market: { lowestAsk: 950 },
              styleId: '555088-001',
              urlKey: 'air-jordan-1-bred',
            },
          ],
        }),
      });

      // No actorId configured (backward compatible)
      const scraper = new StockXScraper({ name: 'StockX', allowApiFallback: true });

      const results = await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });

      // Should NOT call actor
      expect(mockActorCall).not.toHaveBeenCalled();

      // Should use API directly
      expect(global.fetch).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('api-only-123');
    });

    it('should respect useOrchestrated=false flag when API fallback is allowed', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ Products: [] }),
      });

      const scraper = new StockXScraper({
        name: 'StockX',
        actorId: 'some-actor',
        useOrchestrated: false, // Explicitly disable
        allowApiFallback: true,
      });

      await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });

      // Should NOT call actor when explicitly disabled
      expect(mockActorCall).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Auto-disable after max failures', () => {
    it('should disable scraper after 3 consecutive API failures', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('403 Forbidden'));

      const scraper = new StockXScraper({ name: 'StockX', allowApiFallback: true });

      // First 3 failures
      await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });
      expect(scraper.failureCount).toBe(1);

      await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });
      expect(scraper.failureCount).toBe(2);

      await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });
      expect(scraper.failureCount).toBe(3);

      // 4th attempt should skip scraping
      const results = await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });
      expect(results).toEqual([]);
      expect(global.fetch).toHaveBeenCalledTimes(3); // Not called on 4th attempt
    });

    it('should reset failure count on successful scrape', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temp failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ Products: [] }),
        });

      const scraper = new StockXScraper({ name: 'StockX' });

      // First call fails
      await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });
      expect(scraper.failureCount).toBe(1);

      // Second call succeeds
      await scraper.scrape({
        ...defaultParams,
        allowStockXApiFallback: true,
      });
      expect(scraper.failureCount).toBe(0); // Reset
    });
  });

  describe('Compliance-first defaults', () => {
    it('should return empty results when API fallback is disabled and actor fails', async () => {
      mockActorCall.mockResolvedValue({
        id: 'run_fail',
        status: 'FAILED',
        defaultDatasetId: 'dataset_fail',
      });

      const scraper = new StockXScraper({
        name: 'StockX',
        actorId: 'some-stockx-actor',
        allowApiFallback: false,
      });

      const results = await scraper.scrape(defaultParams);
      expect(results).toEqual([]);
      expect(global.fetch).toBeUndefined();
    });
  });
});
