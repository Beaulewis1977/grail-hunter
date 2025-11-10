
/**
 * Integration test: End-to-end actor execution
 * Note: This test mocks external dependencies but tests the full pipeline
 */

import { jest } from '@jest/globals';
import { DataNormalizer } from '../../src/core/normalizer.js';
import { SneakerParser } from '../../src/core/parser.js';
import { ListingFilter } from '../../src/core/filter.js';
import { DeduplicationEngine } from '../../src/core/deduplicator.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock Apify Actor globally for this test
const mockKvStore = {
  getValue: jest.fn(() => Promise.resolve(null)),
  setValue: jest.fn(() => Promise.resolve()),
};

// We need to mock the Actor before importing DeduplicationEngine
jest.unstable_mockModule('apify', () => ({
  Actor: {
    openKeyValueStore: jest.fn(() => Promise.resolve(mockKvStore)),
  },
}));

describe('End-to-End Integration', () => {
  let normalizer;
  let parser;
  let filter;
  let deduplicator;
  let fixtureData;

  beforeEach(async () => {
    normalizer = new DataNormalizer();
    parser = new SneakerParser();
    filter = new ListingFilter();
    deduplicator = new DeduplicationEngine();
    deduplicator.kvStore = mockKvStore; // Manually set the mock
    deduplicator.seenHashes = new Set();

    // Load fixture data
    const fixturePath = join(__dirname, '../fixtures/grailed-listings.json');
    fixtureData = JSON.parse(readFileSync(fixturePath, 'utf-8'));
  });

  it('should process listings through complete pipeline', async () => {
    // 1. Normalize
    const normalizedListings = fixtureData.map((raw) => normalizer.normalize(raw, 'grailed'));

    expect(normalizedListings).toHaveLength(3);
    expect(normalizedListings[0].product.name).toContain('Air Jordan 1');
    expect(normalizedListings[0].listing.price).toBe(750);

    // 2. Parse
    const parsedListings = normalizedListings.map((listing) => parser.parse(listing));

    expect(parsedListings[0].listing.condition).toBe('used_like_new'); // VNDS
    expect(parsedListings[1].listing.condition).toBe('new_in_box'); // DS

    // 3. Filter by size
    const filteredBySize = filter.filter(parsedListings, {
      size: '10',
    });

    expect(filteredBySize).toHaveLength(1);
    expect(filteredBySize[0].listing.size_us_mens).toBe('10');

    // 4. Filter by price range
    const filteredByPrice = filter.filter(parsedListings, {
      priceRange: { min: 100, max: 500 },
    });

    expect(filteredByPrice).toHaveLength(2); // $450 and $180

    // 5. Deduplicate
    const newListings = await deduplicator.findNewListings(parsedListings);

    expect(newListings).toHaveLength(3); // All new on first run

    // 6. Run deduplication again (simulating second run)
    const newListings2 = await deduplicator.findNewListings(parsedListings);

    expect(newListings2).toHaveLength(0); // All already seen
  });

  it('should handle complex filtering scenarios', async () => {
    const normalizedListings = fixtureData.map((raw) => normalizer.normalize(raw, 'grailed'));
    const parsedListings = normalizedListings.map((listing) => parser.parse(listing));

    // Filter: size 10.5, price $500-$1000, condition used_good or better
    const filtered = filter.filter(parsedListings, {
      size: '10.5',
      priceRange: { min: 500, max: 1000 },
      condition: 'used_good',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].listing.price).toBe(750);
    expect(filtered[0].listing.size_us_mens).toBe('10.5');
  });

  it('should handle empty results gracefully', async () => {
    const normalizedListings = fixtureData.map((raw) => normalizer.normalize(raw, 'grailed'));

    // Filter with impossible criteria
    const filtered = filter.filter(normalizedListings, {
      size: '15', // No listings match
    });

    expect(filtered).toHaveLength(0);

    const newListings = await deduplicator.findNewListings(filtered);

    expect(newListings).toHaveLength(0);
  });
});

