/**
 * Tests for StockX Scraper
 */

import { jest } from '@jest/globals';
import { StockXScraper } from '../../src/scrapers/stockx.js';

const originalFetch = global.fetch;
global.fetch = jest.fn();

describe('StockXScraper', () => {
  let stockxScraper;
  const mockConfig = {
    name: 'StockX',
    type: 'custom',
    enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    stockxScraper = new StockXScraper(mockConfig);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('scrape', () => {
    it('should return empty array if failure count exceeds max', async () => {
      stockxScraper.failureCount = 3;

      const results = await stockxScraper.scrape({
        keywords: ['Air Jordan 1'],
        maxResults: 50,
      });

      expect(results).toEqual([]);
    });

    it('should scrape listings successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          Products: [
            {
              uuid: 'test-123',
              title: 'Air Jordan 1 Retro High OG Chicago',
              brand: 'Air Jordan',
              colorway: 'Chicago',
              styleId: '555088-101',
              market: {
                lowestAsk: 2200,
                lastSale: 2150,
              },
              media: {
                imageUrl: 'https://example.com/image.jpg',
              },
              urlKey: 'air-jordan-1-retro-high-og-chicago',
            },
          ],
        }),
      });

      const results = await stockxScraper.scrape({
        keywords: ['Air Jordan 1'],
        maxResults: 50,
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Air Jordan 1 Retro High OG Chicago');
      expect(results[0].brand).toBe('Air Jordan');
      expect(results[0].price).toBe(2200);
    });

    it('should handle 403 errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const results = await stockxScraper.scrape({
        keywords: ['Air Jordan 1'],
        maxResults: 50,
      });

      expect(results).toEqual([]);
      // Note: failureCount only increments on outer scrape() failure,
      // not individual keyword failures - this is intentional behavior
      expect(stockxScraper.failureCount).toBe(0);
    });

    it('should handle rate limits (429)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const results = await stockxScraper.scrape({
        keywords: ['Air Jordan 1'],
        maxResults: 50,
      });

      expect(results).toEqual([]);
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const results = await stockxScraper.scrape({
        keywords: ['Air Jordan 1'],
        maxResults: 50,
      });

      expect(results).toEqual([]);
    });
  });

  describe('buildSearchUrls', () => {
    it('should build correct search URLs', () => {
      const urls = stockxScraper.buildSearchUrls(['Air Jordan 1', 'Nike Dunk']);

      expect(urls).toHaveLength(2);
      expect(urls[0]).toBe('https://stockx.com/search?s=Air%20Jordan%201');
      expect(urls[1]).toBe('https://stockx.com/search?s=Nike%20Dunk');
    });
  });
});
