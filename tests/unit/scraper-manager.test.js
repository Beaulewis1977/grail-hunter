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
      await expect(manager.scrape('unknown_platform', {})).rejects.toThrow(PlatformScrapingError);
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

    it('should throw on non-recoverable error', async () => {
      manager.scrapers.grailed = {
        validate: jest.fn(),
        scrape: jest.fn(() => {
          const error = new Error('Hard failure');
          error.recoverable = false;
          throw error;
        }),
      };

      // Avoid retries to keep test fast
      manager.retryWithBackoff = jest.fn((fn) => fn());

      await expect(manager.scrape('grailed', {})).rejects.toThrow('Hard failure');
    });

    it('should retry with backoff and succeed on third attempt', async () => {
      jest.useFakeTimers();

      const scrapeMock = jest
        .fn()
        .mockImplementationOnce(() => {
          const e = new Error('try1');
          e.recoverable = true;
          throw e;
        })
        .mockImplementationOnce(() => {
          const e = new Error('try2');
          e.recoverable = true;
          throw e;
        })
        .mockResolvedValueOnce(['ok']);

      manager.scrapers.grailed = {
        validate: jest.fn(),
        scrape: scrapeMock,
      };

      const promise = manager.scrape('grailed', {});

      // Advance timers for 2 retries: 2s and 4s
      await Promise.resolve();
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      jest.advanceTimersByTime(4000);

      const result = await promise;
      expect(result).toEqual(['ok']);
      expect(scrapeMock).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });
  });
});
