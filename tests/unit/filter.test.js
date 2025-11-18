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
      tags: [],
      type: 'sell',
      ...overrides.listing,
    },
    source: {
      url: 'https://example.com',
      id: '123',
      is_authenticated: false,
      ...overrides.source,
    },
    seller: {
      name: 'test_seller',
      rating: null,
      reviewCount: null,
      verified: false,
      ...overrides.seller,
    },
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

  // Phase 3.x: Advanced Filter Tests
  describe('filterByAuthentication', () => {
    it('should filter authenticated listings', () => {
      const listings = [
        createListing({ source: { is_authenticated: true } }),
        createListing({ source: { is_authenticated: false }, listing: { tags: ['authenticated'] } }),
        createListing({ source: { is_authenticated: false }, listing: { tags: [] } }),
      ];

      const filtered = filter.filterByAuthentication(listings, true);

      expect(filtered).toHaveLength(2);
    });

    it('should return all listings when authenticatedOnly is false', () => {
      const listings = [
        createListing({ source: { is_authenticated: true } }),
        createListing({ source: { is_authenticated: false } }),
      ];

      const filtered = filter.filterByAuthentication(listings, false);

      expect(filtered).toHaveLength(2);
    });
  });

  describe('filterByOGAll', () => {
    it('should filter listings with og_all tag', () => {
      const listings = [
        createListing({ listing: { tags: ['og_all', 'vnds'] } }),
        createListing({ listing: { tags: ['og_box'] } }),
        createListing({ listing: { tags: ['no_box'] } }),
        createListing({ listing: { tags: [] } }),
      ];

      const filtered = filter.filterByOGAll(listings, true);

      expect(filtered).toHaveLength(2);
    });

    it('should return all listings when requireOGAll is false', () => {
      const listings = [
        createListing({ listing: { tags: ['og_all'] } }),
        createListing({ listing: { tags: [] } }),
      ];

      const filtered = filter.filterByOGAll(listings, false);

      expect(filtered).toHaveLength(2);
    });
  });

  describe('filterByListingType', () => {
    it('should filter out auction listings', () => {
      const listings = [
        createListing({ listing: { type: 'sell', tags: [] } }),
        createListing({ listing: { type: 'auction', tags: ['auction'] } }),
        createListing({ listing: { type: 'sell', tags: ['buy_it_now'] } }),
      ];

      const filtered = filter.filterByListingType(listings, true);

      expect(filtered).toHaveLength(2);
    });

    it('should return all listings when excludeAuctions is false', () => {
      const listings = [
        createListing({ listing: { type: 'sell' } }),
        createListing({ listing: { type: 'auction' } }),
      ];

      const filtered = filter.filterByListingType(listings, false);

      expect(filtered).toHaveLength(2);
    });
  });

  describe('filterBySellerQuality', () => {
    it('should filter by minimum seller rating', () => {
      const listings = [
        createListing({ seller: { rating: 4.8, reviewCount: 100 } }),
        createListing({ seller: { rating: 4.2, reviewCount: 50 } }),
        createListing({ seller: { rating: 5.0, reviewCount: 200 } }),
        createListing({ seller: { rating: null, reviewCount: 10 } }),
      ];

      const filtered = filter.filterBySellerQuality(listings, { minRating: 4.5, minReviewCount: 0 });

      expect(filtered).toHaveLength(2);
    });

    it('should filter by minimum review count', () => {
      const listings = [
        createListing({ seller: { rating: 4.5, reviewCount: 100 } }),
        createListing({ seller: { rating: 4.8, reviewCount: 25 } }),
        createListing({ seller: { rating: 5.0, reviewCount: 200 } }),
      ];

      const filtered = filter.filterBySellerQuality(listings, { minRating: 0, minReviewCount: 50 });

      expect(filtered).toHaveLength(2);
    });

    it('should filter by both rating and review count', () => {
      const listings = [
        createListing({ seller: { rating: 4.8, reviewCount: 100 } }),
        createListing({ seller: { rating: 4.2, reviewCount: 150 } }),
        createListing({ seller: { rating: 5.0, reviewCount: 25 } }),
        createListing({ seller: { rating: 4.9, reviewCount: 200 } }),
      ];

      const filtered = filter.filterBySellerQuality(listings, { minRating: 4.5, minReviewCount: 50 });

      expect(filtered).toHaveLength(2);
    });

    it('should handle null seller data gracefully', () => {
      const listings = [
        createListing({ seller: { rating: null, reviewCount: null } }),
        createListing({ seller: { rating: 4.5, reviewCount: 100 } }),
      ];

      const filtered = filter.filterBySellerQuality(listings, { minRating: 4.0, minReviewCount: 50 });

      expect(filtered).toHaveLength(1);
    });
  });
});
