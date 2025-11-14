/**
 * Unit tests for data normalizer
 */

import { DataNormalizer } from '../../src/core/normalizer.js';

describe('DataNormalizer', () => {
  let normalizer;

  beforeEach(() => {
    normalizer = new DataNormalizer();
  });

  describe('normalize (guards and routing)', () => {
    it('should return null when rawListing is invalid', () => {
      expect(normalizer.normalize(null, 'grailed')).toBeNull();
      expect(normalizer.normalize(undefined, 'grailed')).toBeNull();
    });

    it('should use generic normalizer when platform is not a string', () => {
      const out = normalizer.normalize({ title: 'Test' }, 123);
      expect(out.source.platform).toBe('');
      expect(out.product.name).toBe('Test');
    });

    it('should use generic normalizer when platform is empty after trim', () => {
      const out = normalizer.normalize({ title: 'Test' }, '   ');
      expect(out.source.platform).toBe('');
    });

    it('should normalize eBay listing with URL-based ID fallback', () => {
      const raw = {
        title: 'Air Jordan 1 Chicago',
        price: '$200',
        url: 'https://www.ebay.com/itm/9876543210',
        image: 'https://i.ebayimg.com/images/foo.jpg',
        seller: 'top_seller',
      };
      const out = normalizer.normalize(raw, 'ebay');
      expect(out.source.platform).toBe('eBay');
      expect(out.source.id).toBe('9876543210');
      expect(out.listing.price).toBe(200);
      expect(out.product.name).toContain('Air Jordan 1');

      // Verify metadata structures
      expect(out.metadata.dealScore).toBeDefined();
      expect(out.metadata.priceChange).toBeDefined();
      expect(out.metadata.priceChange.currentPrice).toBe(200);
    });

    it('should generate deterministic fallback id when identifiers missing', () => {
      const raw = {
        title: 'Rare Sneaker Sample',
        price: '$999',
      };

      const out1 = normalizer.normalize(raw, 'ebay');
      const out2 = normalizer.normalize(raw, 'ebay');

      expect(out1.source.id).toHaveLength(16);
      expect(out1.source.id).toMatch(/^[a-f0-9]+$/);
      expect(out1.source.id).toBe(out2.source.id);
    });

    it('should detect authenticity guarantee and buy it now indicators', () => {
      const raw = {
        title: 'Jordan 1 Authenticity Guarantee Exclusive',
        price: '$450',
        subTitle: 'Buy It Now with Authenticity Guarantee badges',
        buyItNow: true,
      };

      const out = normalizer.normalize(raw, 'ebay');

      expect(out.listing.tags).toEqual(
        expect.arrayContaining(['authenticity_guarantee', 'buy_it_now'])
      );
      expect(out.source.is_authenticated).toBe(true);
    });
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

      // Verify new metadata structures
      expect(normalized.metadata.dealScore).toEqual({
        isBelowMarket: false,
        marketValue: null,
        savingsPercentage: null,
        savingsAmount: null,
        dealQuality: null,
      });

      expect(normalized.metadata.priceChange).toEqual({
        hasDrop: false,
        previousPrice: null,
        currentPrice: 400,
        dropPercent: null,
      });
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

      // Verify metadata objects are present with defaults
      expect(normalized.metadata.dealScore).toBeDefined();
      expect(normalized.metadata.dealScore.isBelowMarket).toBe(false);
      expect(normalized.metadata.priceChange).toBeDefined();
      expect(normalized.metadata.priceChange.currentPrice).toBe(100);
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

  describe('metadata structures', () => {
    it('should include dealScore object with correct default structure', () => {
      const raw = { title: 'Test Sneaker', price: 100, id: '123' };
      const normalized = normalizer.normalize(raw, 'grailed');

      expect(normalized.metadata.dealScore).toEqual({
        isBelowMarket: false,
        marketValue: null,
        savingsPercentage: null,
        savingsAmount: null,
        dealQuality: null,
      });
    });

    it('should include priceChange object with correct default structure', () => {
      const raw = { title: 'Test Sneaker', price: '$250', id: '123' };
      const normalized = normalizer.normalize(raw, 'grailed');

      expect(normalized.metadata.priceChange).toEqual({
        hasDrop: false,
        previousPrice: null,
        currentPrice: 250,
        dropPercent: null,
      });
    });

    it('should handle null price in priceChange', () => {
      const raw = { title: 'Test Sneaker', price: null, id: '123' };
      const normalized = normalizer.normalize(raw, 'grailed');

      expect(normalized.metadata.priceChange.currentPrice).toBeNull();
    });
  });
});
