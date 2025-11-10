
/**
 * Unit tests for listing filter
 */

import { ListingFilter } from '../../src/core/filter.js';

describe('ListingFilter', () => {
  let filter;

  beforeEach(() => {
    filter = new ListingFilter();
  });

  const createListing = (overrides = {}) => ({
    product: { name: 'Test Sneaker', ...overrides.product },
    listing: {
      price: 200,
      size_us_mens: '10',
      condition: 'used_good',
      ...overrides.listing,
    },
    source: { url: 'https://example.com', ...overrides.source },
  });

  describe('filterBySize', () => {
    it('should filter by exact size match', () => {
      const listings = [
        createListing({ listing: { size_us_mens: '10' } }),
        createListing({ listing: { size_us_mens: '11' } }),
        createListing({ listing: { size_us_mens: '10' } }),
      ];

      const filtered = filter.filterBySize(listings, '10');

      expect(filtered).toHaveLength(2);
      expect(filtered.every((l) => l.listing.size_us_mens === '10')).toBe(true);
    });

    it('should remove listings without size', () => {
      const listings = [
        createListing({ listing: { size_us_mens: '10' } }),
        createListing({ listing: { size_us_mens: null } }),
      ];

      const filtered = filter.filterBySize(listings, '10');

      expect(filtered).toHaveLength(1);
    });
  });

  describe('filterByPriceRange', () => {
    it('should filter by min price', () => {
      const listings = [
        createListing({ listing: { price: 100 } }),
        createListing({ listing: { price: 200 } }),
        createListing({ listing: { price: 300 } }),
      ];

      const filtered = filter.filterByPriceRange(listings, { min: 150 });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((l) => l.listing.price >= 150)).toBe(true);
    });

    it('should filter by max price', () => {
      const listings = [
        createListing({ listing: { price: 100 } }),
        createListing({ listing: { price: 200 } }),
        createListing({ listing: { price: 300 } }),
      ];

      const filtered = filter.filterByPriceRange(listings, { max: 250 });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((l) => l.listing.price <= 250)).toBe(true);
    });

    it('should filter by both min and max', () => {
      const listings = [
        createListing({ listing: { price: 100 } }),
        createListing({ listing: { price: 200 } }),
        createListing({ listing: { price: 300 } }),
      ];

      const filtered = filter.filterByPriceRange(listings, { min: 150, max: 250 });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].listing.price).toBe(200);
    });

    it('should remove listings with invalid price', () => {
      const listings = [
        createListing({ listing: { price: 200 } }),
        createListing({ listing: { price: 0 } }),
        createListing({ listing: { price: -10 } }),
      ];

      const filtered = filter.filterByPriceRange(listings, {});

      expect(filtered).toHaveLength(1);
    });
  });

  describe('filterByCondition', () => {
    it('should keep listings at or better than target condition', () => {
      const listings = [
        createListing({ listing: { condition: 'new_in_box' } }),
        createListing({ listing: { condition: 'used_like_new' } }),
        createListing({ listing: { condition: 'used_good' } }),
        createListing({ listing: { condition: 'used_fair' } }),
      ];

      const filtered = filter.filterByCondition(listings, 'used_good');

      expect(filtered).toHaveLength(3);
      expect(filtered.some((l) => l.listing.condition === 'used_fair')).toBe(false);
    });
  });

  describe('filterInvalidListings', () => {
    it('should remove listings without name', () => {
      const listings = [
        createListing({ product: { name: 'Valid Sneaker' } }),
        createListing({ product: { name: 'Unknown' } }),
        createListing({ product: { name: '' } }),
      ];

      const filtered = filter.filterInvalidListings(listings);

      expect(filtered).toHaveLength(1);
    });

    it('should remove listings without valid price', () => {
      const listings = [
        createListing({ listing: { price: 200 } }),
        createListing({ listing: { price: 0 } }),
        createListing({ listing: { price: -10 } }),
      ];

      const filtered = filter.filterInvalidListings(listings);

      expect(filtered).toHaveLength(1);
    });

    it('should remove listings without URL', () => {
      const listings = [
        createListing({ source: { url: 'https://example.com' } }),
        createListing({ source: { url: '' } }),
        createListing({ source: { url: null } }),
      ];

      const filtered = filter.filterInvalidListings(listings);

      expect(filtered).toHaveLength(1);
    });
  });

  describe('filter', () => {
    it('should apply all filters', () => {
      const listings = [
        createListing({
          listing: { price: 200, size_us_mens: '10', condition: 'used_good' },
        }),
        createListing({
          listing: { price: 300, size_us_mens: '11', condition: 'used_fair' },
        }),
        createListing({
          listing: { price: 150, size_us_mens: '10', condition: 'new_in_box' },
        }),
      ];

      const filtered = filter.filter(listings, {
        size: '10',
        priceRange: { min: 100, max: 250 },
        condition: 'used_good',
      });

      expect(filtered).toHaveLength(2);
    });
  });
});

