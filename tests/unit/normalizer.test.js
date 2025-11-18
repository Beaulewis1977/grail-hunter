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

  // Phase 4.0: Depop normalizer tests
  describe('normalizeDepop', () => {
    it('should normalize Depop listing correctly', () => {
      const rawListing = {
        id: 'dep123',
        title: 'Air Jordan 1 Retro High OG Bred',
        price: 250,
        description: 'VNDS condition, OG all included',
        brand: 'Nike',
        size: '10.5',
        condition: 'like new',
        url: 'https://depop.com/products/dep123',
        sellerUsername: 'sneakercollector',
        sellerRating: 4.8,
        sellerReviewCount: 150,
        image: 'https://depop.com/images/dep123.jpg',
      };

      const normalized = normalizer.normalizeDepop(rawListing);

      expect(normalized.product.name).toBe('Air Jordan 1 Retro High OG Bred');
      expect(normalized.product.brand).toBe('Nike');
      expect(normalized.listing.price).toBe(250);
      expect(normalized.listing.size_us_mens).toBe('10.5');
      expect(normalized.listing.condition).toBe('used_like_new');
      expect(normalized.listing.type).toBe('sell');
      expect(normalized.listing.tags).toEqual(expect.arrayContaining(['vnds', 'og_all']));
      expect(normalized.source.platform).toBe('Depop');
      expect(normalized.source.url).toBe('https://depop.com/products/dep123');
      expect(normalized.source.is_authenticated).toBe(false);
      expect(normalized.seller.name).toBe('sneakercollector');
      expect(normalized.seller.rating).toBe(4.8);
      expect(normalized.seller.reviewCount).toBe(150);
    });

    it('should map Depop conditions correctly', () => {
      expect(normalizer.mapDepopCondition('new')).toBe('new_in_box');
      expect(normalizer.mapDepopCondition('brand new')).toBe('new_in_box');
      expect(normalizer.mapDepopCondition('new with tags')).toBe('new_in_box');
      expect(normalizer.mapDepopCondition('like new')).toBe('used_like_new');
      expect(normalizer.mapDepopCondition('gently used')).toBe('used_like_new');
      expect(normalizer.mapDepopCondition('good')).toBe('used_good');
      expect(normalizer.mapDepopCondition('used')).toBe('used_good');
      expect(normalizer.mapDepopCondition('fair')).toBe('used_fair');
      expect(normalizer.mapDepopCondition('worn')).toBe('used_fair');
      expect(normalizer.mapDepopCondition('poor')).toBe('used_poor');
      expect(normalizer.mapDepopCondition(null)).toBe('unspecified');
      expect(normalizer.mapDepopCondition('unknown')).toBe('unspecified');
    });

    it('should handle missing title/name fields using description fallback', () => {
      const rawListing = {
        id: 'dep789',
        description: 'Air Jordan 1 Bred - Size 10.5 - VNDS',
        price: 200,
      };

      const normalized = normalizer.normalizeDepop(rawListing);
      expect(normalized.product.name).toBe('Air Jordan 1 Bred - Size 10.5 - VNDS');
    });

    it('should handle nested seller object structure', () => {
      const rawListing = {
        id: 'dep999',
        title: 'Nike Dunk Low',
        price: 150,
        seller: {
          username: 'nestedseller',
          rating: 4.5,
          reviewCount: 75,
          verified: true,
        },
      };

      const normalized = normalizer.normalizeDepop(rawListing);
      expect(normalized.seller.name).toBe('nestedseller');
      expect(normalized.seller.rating).toBe(4.5);
      expect(normalized.seller.reviewCount).toBe(75);
      expect(normalized.seller.verified).toBe(true);
    });

    it('should handle alternative field names (productUrl, productId, images array)', () => {
      const rawListing = {
        productId: 'altdep123',
        title: 'Yeezy 350',
        price: 220,
        productUrl: 'https://depop.com/alt/altdep123',
        images: ['https://depop.com/img1.jpg', 'https://depop.com/img2.jpg'],
      };

      const normalized = normalizer.normalizeDepop(rawListing);
      expect(normalized.source.id).toBe('altdep123');
      expect(normalized.source.url).toBe('https://depop.com/alt/altdep123');
      expect(normalized.source.imageUrl).toBe('https://depop.com/img1.jpg');
    });

    it('should handle missing/null price with parsePrice fallback', () => {
      const rawListing = {
        id: 'depprice',
        title: 'Nike Air Max',
        priceAmount: 100,
      };

      const normalized = normalizer.normalizeDepop(rawListing);
      expect(normalized.listing.price).toBe(100);
    });
  });

  // Phase 4.0: Poshmark normalizer tests
  describe('normalizePoshmark', () => {
    it('should normalize Poshmark listing correctly', () => {
      const rawListing = {
        id: 'posh456',
        title: 'Nike Air Jordan 1 Retro High OG Chicago',
        price: 300,
        description: 'NWT, brand new with tags, OG box included',
        brand: 'Nike',
        size: '11',
        condition: 'nwt',
        url: 'https://poshmark.com/listing/posh456',
        sellerUsername: 'poshseller99',
        sellerRating: 4.9,
        sellerReviewCount: 200,
        image: 'https://poshmark.com/img/posh456.jpg',
      };

      const normalized = normalizer.normalizePoshmark(rawListing);

      expect(normalized.product.name).toBe('Nike Air Jordan 1 Retro High OG Chicago');
      expect(normalized.product.brand).toBe('Nike');
      expect(normalized.listing.price).toBe(300);
      expect(normalized.listing.size_us_mens).toBe('11');
      expect(normalized.listing.condition).toBe('new_in_box');
      expect(normalized.listing.type).toBe('sell');
      expect(normalized.source.platform).toBe('Poshmark');
      expect(normalized.source.url).toBe('https://poshmark.com/listing/posh456');
      expect(normalized.source.is_authenticated).toBe(false);
      expect(normalized.seller.name).toBe('poshseller99');
      expect(normalized.seller.rating).toBe(4.9);
      expect(normalized.seller.reviewCount).toBe(200);
    });

    it('should map Poshmark conditions correctly', () => {
      expect(normalizer.mapPoshmarkCondition('nwt')).toBe('new_in_box');
      expect(normalizer.mapPoshmarkCondition('new with tags')).toBe('new_in_box');
      expect(normalizer.mapPoshmarkCondition('new')).toBe('new_in_box');
      expect(normalizer.mapPoshmarkCondition('like new')).toBe('used_like_new');
      expect(normalizer.mapPoshmarkCondition('gently used')).toBe('used_like_new');
      expect(normalizer.mapPoshmarkCondition('good')).toBe('used_good');
      expect(normalizer.mapPoshmarkCondition('good pre-owned')).toBe('used_good');
      expect(normalizer.mapPoshmarkCondition('fair')).toBe('used_fair');
      expect(normalizer.mapPoshmarkCondition('poor')).toBe('used_poor');
      expect(normalizer.mapPoshmarkCondition(null)).toBe('unspecified');
      expect(normalizer.mapPoshmarkCondition('unknown')).toBe('unspecified');
    });

    it('should handle missing title/name fields using description fallback', () => {
      const rawListing = {
        id: 'posh999',
        description: 'Jordan 1 Chicago - Size 11 - NWT',
        price: 350,
      };

      const normalized = normalizer.normalizePoshmark(rawListing);
      expect(normalized.product.name).toBe('Jordan 1 Chicago - Size 11 - NWT');
    });

    it('should handle nested seller object structure', () => {
      const rawListing = {
        id: 'posh888',
        title: 'New Balance 550',
        price: 120,
        seller: {
          username: 'poshnestedseller',
          rating: 4.7,
          reviewCount: 120,
          verified: true,
        },
      };

      const normalized = normalizer.normalizePoshmark(rawListing);
      expect(normalized.seller.name).toBe('poshnestedseller');
      expect(normalized.seller.rating).toBe(4.7);
      expect(normalized.seller.reviewCount).toBe(120);
      expect(normalized.seller.verified).toBe(true);
    });

    it('should handle alternative field names (productUrl, listingId, pictures array)', () => {
      const rawListing = {
        listingId: 'altposh456',
        title: 'Adidas Yeezy Boost',
        price: 280,
        productUrl: 'https://poshmark.com/alt/altposh456',
        pictures: ['https://posh.com/pic1.jpg', 'https://posh.com/pic2.jpg'],
      };

      const normalized = normalizer.normalizePoshmark(rawListing);
      expect(normalized.source.id).toBe('altposh456');
      expect(normalized.source.url).toBe('https://poshmark.com/alt/altposh456');
      expect(normalized.source.imageUrl).toBe('https://posh.com/pic1.jpg');
    });

    it('should handle missing/null price with parsePrice fallback', () => {
      const rawListing = {
        id: 'poshprice',
        title: 'Nike Cortez',
        priceAmount: 85,
      };

      const normalized = normalizer.normalizePoshmark(rawListing);
      expect(normalized.listing.price).toBe(85);
    });
  });

  // Phase 4.1: Beta Platforms (Mercari, OfferUp)
  describe('normalizeMercari', () => {
    it('should normalize Mercari listing with all fields', () => {
      const rawListing = {
        id: 'merc123',
        title: 'Air Jordan 1 Retro High OG Chicago',
        price: 280,
        description: 'Brand new with tags, never worn',
        brand: 'Nike',
        size: '11',
        condition: 'new',
        url: 'https://mercari.com/us/item/merc123',
        sellerName: 'sneakerdealer',
        sellerRating: 4.9,
        sellerReviewCount: 200,
        image: 'https://mercari.com/images/merc123.jpg',
      };

      const normalized = normalizer.normalizeMercari(rawListing);

      expect(normalized.product.name).toBe('Air Jordan 1 Retro High OG Chicago');
      expect(normalized.product.brand).toBe('Nike');
      expect(normalized.listing.price).toBe(280);
      expect(normalized.listing.size_us_mens).toBe('11');
      expect(normalized.listing.condition).toBe('new_in_box');
      expect(normalized.listing.type).toBe('sell');
      expect(normalized.source.platform).toBe('Mercari');
      expect(normalized.source.url).toBe('https://mercari.com/us/item/merc123');
      expect(normalized.source.id).toBe('merc123');
      expect(normalized.source.is_authenticated).toBe(false);
      expect(normalized.seller.name).toBe('sneakerdealer');
      expect(normalized.seller.rating).toBe(4.9);
      expect(normalized.seller.reviewCount).toBe(200);
      expect(normalized.metadata.betaPlatform).toBe(true);
      expect(normalized.metadata.riskLevel).toBe('medium-high');
    });

    it('should handle alternative Mercari field names', () => {
      const rawListing = {
        itemId: 'merc456',
        productName: 'Nike Dunk Low Panda',
        priceAmount: 180,
        itemCondition: 'like new',
        productUrl: 'https://mercari.com/us/item/merc456',
        photo: 'https://mercari.com/images/merc456.jpg',
      };

      const normalized = normalizer.normalizeMercari(rawListing);

      expect(normalized.product.name).toBe('Nike Dunk Low Panda');
      expect(normalized.listing.price).toBe(180);
      expect(normalized.listing.condition).toBe('used_like_new');
      expect(normalized.source.id).toBe('merc456');
      expect(normalized.source.url).toBe('https://mercari.com/us/item/merc456');
      expect(normalized.source.imageUrl).toBe('https://mercari.com/images/merc456.jpg');
    });

    it('should handle nested seller object', () => {
      const rawListing = {
        id: 'merc789',
        title: 'Yeezy Boost 350',
        price: 250,
        seller: {
          name: 'yeezy_seller',
          rating: 4.8,
          reviewCount: 150,
          verified: true,
        },
      };

      const normalized = normalizer.normalizeMercari(rawListing);

      expect(normalized.seller.name).toBe('yeezy_seller');
      expect(normalized.seller.rating).toBe(4.8);
      expect(normalized.seller.reviewCount).toBe(150);
      expect(normalized.seller.verified).toBe(true);
    });

    it('should handle missing optional fields', () => {
      const rawListing = {
        id: 'merc999',
        title: 'Nike Air Max',
        price: 100,
      };

      const normalized = normalizer.normalizeMercari(rawListing);

      expect(normalized.product.name).toBe('Nike Air Max');
      expect(normalized.listing.price).toBe(100);
      expect(normalized.listing.condition).toBe('unspecified');
      expect(normalized.seller.name).toBeNull();
      expect(normalized.seller.rating).toBeNull();
    });

    it('should map Mercari-specific conditions correctly', () => {
      const testCases = [
        { input: 'new with tags', expected: 'new_in_box' },
        { input: 'excellent', expected: 'used_like_new' },
        { input: 'good', expected: 'used_good' },
        { input: 'fair', expected: 'used_fair' },
        { input: 'poor', expected: 'used_poor' },
      ];

      testCases.forEach(({ input, expected }) => {
        const rawListing = {
          id: 'test',
          title: 'Test Sneaker',
          price: 100,
          condition: input,
        };
        const normalized = normalizer.normalizeMercari(rawListing);
        expect(normalized.listing.condition).toBe(expected);
      });
    });
  });

  describe('normalizeOfferUp', () => {
    it('should normalize OfferUp listing with all fields including _details', () => {
      const rawListing = {
        listingId: 'offer123',
        title: 'Air Jordan 1 Shadow',
        price: 220,
        formattedPrice: '$220',
        description: 'Good condition',
        size: '10',
        condition: 'good',
        url: 'https://offerup.com/item/detail/offer123',
        image: 'https://offerup.com/photos/offer123.jpg',
        locationName: 'Los Angeles, CA',
        _details: {
          description: 'Good condition, worn a few times. OG box included.',
          condition: 'good',
          seller: {
            name: 'john_doe',
            rating: 4.7,
            reviewCount: 85,
            verified: true,
          },
          location: {
            name: 'Los Angeles, CA',
            zipCode: '90001',
          },
          photos: ['https://offerup.com/photos/offer123.jpg'],
        },
      };

      const normalized = normalizer.normalizeOfferUp(rawListing);

      expect(normalized.product.name).toBe('Air Jordan 1 Shadow');
      expect(normalized.listing.price).toBe(220);
      expect(normalized.listing.size_us_mens).toBe('10');
      expect(normalized.listing.condition).toBe('used_good');
      expect(normalized.listing.type).toBe('sell');
      expect(normalized.listing.currency).toBe('USD');
      expect(normalized.source.platform).toBe('OfferUp');
      expect(normalized.source.url).toBe('https://offerup.com/item/detail/offer123');
      expect(normalized.source.id).toBe('offer123');
      expect(normalized.source.is_authenticated).toBe(false);
      expect(normalized.seller.name).toBe('john_doe');
      expect(normalized.seller.rating).toBe(4.7);
      expect(normalized.seller.reviewCount).toBe(85);
      expect(normalized.seller.verified).toBe(true);
      expect(normalized.metadata.betaPlatform).toBe(true);
      expect(normalized.metadata.riskLevel).toBe('medium-high');
      expect(normalized.metadata.location).toBe('Los Angeles, CA');
    });

    it('should handle listings without _details object', () => {
      const rawListing = {
        id: 'offer456',
        title: 'Yeezy Boost 350',
        price: 300,
        condition: 'new',
        listingUrl: 'https://offerup.com/item/detail/offer456',
        seller: {
          name: 'yeezy_fan',
          rating: 4.9,
        },
      };

      const normalized = normalizer.normalizeOfferUp(rawListing);

      expect(normalized.product.name).toBe('Yeezy Boost 350');
      expect(normalized.listing.price).toBe(300);
      expect(normalized.listing.condition).toBe('new_in_box');
      expect(normalized.source.id).toBe('offer456');
      expect(normalized.source.url).toBe('https://offerup.com/item/detail/offer456');
      expect(normalized.seller.name).toBe('yeezy_fan');
      expect(normalized.seller.rating).toBe(4.9);
    });

    it('should handle formattedPrice parsing', () => {
      const rawListing = {
        listingId: 'offer789',
        title: 'Nike Dunk',
        formattedPrice: '$150',
      };

      const normalized = normalizer.normalizeOfferUp(rawListing);

      expect(normalized.listing.price).toBe(150);
    });

    it('should handle missing optional fields', () => {
      const rawListing = {
        id: 'offer999',
        title: 'Adidas Sneaker',
        price: 80,
      };

      const normalized = normalizer.normalizeOfferUp(rawListing);

      expect(normalized.product.name).toBe('Adidas Sneaker');
      expect(normalized.listing.price).toBe(80);
      expect(normalized.listing.condition).toBe('unspecified');
      expect(normalized.seller.name).toBeNull();
      expect(normalized.metadata.location).toBeNull();
    });

    it('should map OfferUp-specific conditions correctly', () => {
      const testCases = [
        { input: 'new', expected: 'new_in_box' },
        { input: 'like new', expected: 'used_like_new' },
        { input: 'excellent', expected: 'used_like_new' },
        { input: 'good', expected: 'used_good' },
        { input: 'fair', expected: 'used_fair' },
        { input: 'poor', expected: 'used_poor' },
      ];

      testCases.forEach(({ input, expected }) => {
        const rawListing = {
          id: 'test',
          title: 'Test Sneaker',
          price: 100,
          condition: input,
        };
        const normalized = normalizer.normalizeOfferUp(rawListing);
        expect(normalized.listing.condition).toBe(expected);
      });
    });
  });
});
