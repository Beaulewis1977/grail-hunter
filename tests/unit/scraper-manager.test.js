
/**
 * Unit tests for scraper manager
 */

import { jest } from '@jest/globals';
import { ScraperManager } from '../../src/scrapers/manager.js';
import { PlatformScrapingError } from '../../src/utils/errors.js';

describe('ScraperManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ScraperManager();
  });

  describe('initializeScrapers', () => {
    it('should initialize Grailed scraper', () => {
      expect(manager.scrapers.grailed).toBeDefined();
    });

    it('should return available platforms', () => {
      const platforms = manager.getAvailablePlatforms();
      expect(platforms).toContain('grailed');
    });
  });

  describe('scrape', () => {
    it('should throw error for unsupported platform', async () => {
      await expect(manager.scrape('ebay', {})).rejects.toThrow(PlatformScrapingError);
    });

    it('should return empty array on graceful degradation', async () => {
      // Mock the scraper to throw recoverable error immediately (no retries)
      manager.scrapers.grailed = {
        validate: jest.fn(),
        scrape: jest.fn(() => {
          const error = new Error('Test error');
          error.recoverable = true;
          throw error;
        }),
      };

      // Override retryWithBackoff to not retry
      manager.retryWithBackoff = jest.fn((fn) => fn());

      const result = await manager.scrape('grailed', {});
      expect(result).toEqual([]);
    });
  });
});

