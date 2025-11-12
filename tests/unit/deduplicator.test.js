/**
 * Unit tests for deduplication engine
 */

import { jest } from '@jest/globals';
import { DeduplicationEngine } from '../../src/core/deduplicator.js';

describe('DeduplicationEngine', () => {
  let deduplicator;
  let mockKvStore;

  beforeEach(() => {
    deduplicator = new DeduplicationEngine();
    mockKvStore = {
      getValue: jest.fn(),
      setValue: jest.fn(),
    };
  });

  describe('generateHash', () => {
    it('should generate consistent hash for same listing', () => {
      const listing = {
        source: { platform: 'Grailed', id: '12345' },
      };

      const hash1 = deduplicator.generateHash(listing);
      const hash2 = deduplicator.generateHash(listing);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different listings', () => {
      const listing1 = {
        source: { platform: 'Grailed', id: '12345' },
      };

      const listing2 = {
        source: { platform: 'Grailed', id: '67890' },
      };

      const hash1 = deduplicator.generateHash(listing1);
      const hash2 = deduplicator.generateHash(listing2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('findNewListings', () => {
    it('should identify new listings', async () => {
      deduplicator.kvStore = mockKvStore;
      deduplicator.seenHashes = new Map();

      const listings = [
        {
          source: { platform: 'Grailed', id: '1' },
          product: { name: 'Test 1' },
          listing: { price: 100 },
        },
        {
          source: { platform: 'Grailed', id: '2' },
          product: { name: 'Test 2' },
          listing: { price: 200 },
        },
      ];

      const newListings = await deduplicator.findNewListings(listings);

      expect(newListings).toHaveLength(2);
      expect(mockKvStore.setValue).toHaveBeenCalledWith('seen_listing_hashes', expect.any(Array));
    });

    it('should filter out previously seen listings', async () => {
      deduplicator.kvStore = mockKvStore;

      const listing1 = {
        source: { platform: 'Grailed', id: '1' },
        product: { name: 'Test' },
        listing: { price: 100 },
      };
      const hash1 = deduplicator.generateHash(listing1);

      deduplicator.seenHashes = new Map([[hash1, Date.now()]]);

      const listings = [
        listing1,
        {
          source: { platform: 'Grailed', id: '2' },
          product: { name: 'Test 2' },
          listing: { price: 200 },
        },
      ];

      const newListings = await deduplicator.findNewListings(listings);

      expect(newListings).toHaveLength(1);
      expect(newListings[0].source.id).toBe('2');
    });

    it('should trim hashes when exceeding maxStoredHashes', async () => {
      // Create deduplicator with small maxStoredHashes for testing
      deduplicator = new DeduplicationEngine();
      deduplicator.maxStoredHashes = 5;
      deduplicator.kvStore = mockKvStore;
      deduplicator.seenHashes = new Map();

      // Create 7 listings (exceeding max of 5)
      const listings = Array.from({ length: 7 }, (_, i) => ({
        source: { platform: 'Grailed', id: `${i + 1}` },
        product: { name: `Test ${i + 1}` },
        listing: { price: 100 },
      }));

      await deduplicator.findNewListings(listings);

      // Should have trimmed to 5 most recent
      expect(deduplicator.seenHashes.size).toBeLessThanOrEqual(5);
    });
  });

  describe('getStats', () => {
    it('should return statistics', () => {
      deduplicator.seenHashes = new Map([
        ['hash1', Date.now()],
        ['hash2', Date.now()],
        ['hash3', Date.now()],
      ]);

      const stats = deduplicator.getStats();

      expect(stats.totalSeenListings).toBe(3);
      expect(stats.maxCapacity).toBe(10000);
      expect(stats.utilizationPercent).toBe('0.0');
    });
  });
});
