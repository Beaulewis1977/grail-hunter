/**
 * Unit tests for data normalizer
 */

import { DataNormalizer } from '../../src/core/normalizer.js';

describe('DataNormalizer', () => {
  let normalizer;

  beforeEach(() => {
    normalizer = new DataNormalizer();
  });

  describe('normalizeGrailed', () => {
    it('should normalize Grailed listing correctly', () => {
      const rawListing = {
        id: '12345',
        title: 'Nike Air Jordan 1 Bred',
        price: '$400',
        size: '10',
        condition: 'Gently Used',
        color: 'Black/Red',
        description: 'VNDS condition, OG all included',
        url: 'https://grailed.com/listings/12345',
        image_url: 'tests/fixtures/images/placeholder.jpg',
        user: {
          username: 'sneaker_seller',
          feedback_score: 4.9,
          feedback_count: 127,
          verified: true,
        },
      };

      const normalized = normalizer.normalizeGrailed(rawListing);

      expect(normalized.product.name).toBe('Nike Air Jordan 1 Bred');
      expect(normalized.product.brand).toBe('Air Jordan'); // Air Jordan is detected before Nike
      expect(normalized.listing.price).toBe(400);
      expect(normalized.listing.size_us_mens).toBe('10');
      expect(normalized.listing.condition).toBe('used_like_new');
      expect(normalized.listing.tags).toContain('og_all');
      expect(normalized.listing.tags).toContain('vnds');
      expect(normalized.source.platform).toBe('Grailed');
      expect(normalized.source.id).toBe('12345');
      expect(normalized.seller.name).toBe('sneaker_seller');
      expect(normalized.seller.verified).toBe(true);
    });

    it('should handle missing fields gracefully', () => {
      const rawListing = {
        id: '12345',
        title: 'Unknown Sneaker',
        price: 100,
      };

      const normalized = normalizer.normalizeGrailed(rawListing);

      expect(normalized.product.name).toBe('Unknown Sneaker');
      expect(normalized.listing.price).toBe(100);
      expect(normalized.listing.size_us_mens).toBeNull();
      expect(normalized.seller.name).toBeNull();
    });
  });

  describe('extractBrand', () => {
    it('should extract Nike brand', () => {
      expect(normalizer.extractBrand('Nike Air Force 1')).toBe('Nike');
    });

    it('should extract Air Jordan brand', () => {
      expect(normalizer.extractBrand('Air Jordan 1 Bred')).toBe('Air Jordan');
    });

    it('should extract Adidas brand', () => {
      expect(normalizer.extractBrand('Adidas Yeezy 350')).toBe('Adidas');
    });

    it('should return null for unknown brand', () => {
      expect(normalizer.extractBrand('Unknown Brand Shoes')).toBeNull();
    });
  });

  describe('parsePrice', () => {
    it('should parse numeric price', () => {
      expect(normalizer.parsePrice(100)).toBe(100);
    });

    it('should parse string price with dollar sign', () => {
      expect(normalizer.parsePrice('$400')).toBe(400);
    });

    it('should parse string price with commas', () => {
      expect(normalizer.parsePrice('$1,200.50')).toBe(1200.5);
    });

    it('should return null for invalid price', () => {
      expect(normalizer.parsePrice('invalid')).toBeNull();
      expect(normalizer.parsePrice(null)).toBeNull();
    });
  });

  describe('mapGrailedCondition', () => {
    it('should map Grailed conditions correctly', () => {
      expect(normalizer.mapGrailedCondition('New')).toBe('new_in_box');
      expect(normalizer.mapGrailedCondition('Brand New')).toBe('new_in_box');
      expect(normalizer.mapGrailedCondition('Gently Used')).toBe('used_like_new');
      expect(normalizer.mapGrailedCondition('Used')).toBe('used_good');
      expect(normalizer.mapGrailedCondition('Worn')).toBe('used_fair');
    });

    it('should return unspecified for unknown condition', () => {
      expect(normalizer.mapGrailedCondition('Unknown')).toBe('unspecified');
      expect(normalizer.mapGrailedCondition(null)).toBe('unspecified');
    });
  });
});
