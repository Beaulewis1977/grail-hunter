/**
 * Unit tests for input validators
 */

import { validateInput, normalizeInput } from '../../src/utils/validators.js';
import { ValidationError } from '../../src/utils/errors.js';

describe('Input Validators', () => {
  describe('validateInput', () => {
    it('should accept valid input', () => {
      const input = {
        keywords: ['Air Jordan 1'],
        size: '10',
        priceRange: { min: 100, max: 500 },
        condition: 'used_good',
      };

      expect(() => validateInput(input)).not.toThrow();
    });

    it('should accept platforms array and preserve it', () => {
      const input = {
        keywords: ['Air Jordan 1'],
        platforms: ['grailed', 'ebay'],
        maxResults: 10,
      };

      expect(() => validateInput(input)).not.toThrow();
      const normalized = normalizeInput(input);
      expect(normalized.platforms).toEqual(['grailed', 'ebay']);
      expect(normalized.maxResults).toBe(10);
    });

    it('should reject missing keywords', () => {
      const input = {};

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow('keywords is required');
    });

    it('should reject empty keywords array', () => {
      const input = { keywords: [] };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('should reject too many keywords', () => {
      const input = { keywords: new Array(21).fill('test') };

      expect(() => validateInput(input)).toThrow('cannot exceed 20 items');
    });

    it('should reject unsupported platform', () => {
      const input = {
        keywords: ['test'],
        platform: 'unknown_platform',
      };

      expect(() => validateInput(input)).toThrow('not supported');
    });

    it('should reject invalid size format', () => {
      const input = {
        keywords: ['test'],
        size: '20', // Invalid: too large
      };

      expect(() => validateInput(input)).toThrow('Invalid size format');
    });

    it('should accept valid size formats', () => {
      const validSizes = ['8', '10', '10.5', '12', '14.5'];

      validSizes.forEach((size) => {
        const input = { keywords: ['test'], size };
        expect(() => validateInput(input)).not.toThrow();
      });
    });

    it('should reject invalid priceRange', () => {
      const input = {
        keywords: ['test'],
        priceRange: { min: 500, max: 100 }, // min > max
      };

      expect(() => validateInput(input)).toThrow('Price range minimum cannot exceed maximum');
    });

    it('should reject invalid condition', () => {
      const input = {
        keywords: ['test'],
        condition: 'brand_new', // Invalid
      };

      expect(() => validateInput(input)).toThrow('Invalid condition');
    });

    it('should reject invalid webhook URL', () => {
      const input = {
        keywords: ['test'],
        notificationConfig: {
          webhookUrl: 'not-a-url',
        },
      };

      expect(() => validateInput(input)).toThrow('must be a valid URL');
    });
  });

  describe('normalizeInput', () => {
    it('should normalize and set defaults', () => {
      const input = {
        keywords: ['  Air Jordan 1  ', 'Yeezy 350  '],
      };

      const normalized = normalizeInput(input);

      expect(normalized.keywords).toEqual(['Air Jordan 1', 'Yeezy 350']);
      expect(normalized.platform).toBe('grailed');
      expect(normalized.maxResults).toBe(50);
      expect(normalized.proxyConfig).toBeDefined();
    });

    it('should preserve provided values', () => {
      const input = {
        keywords: ['test'],
        size: '10',
        priceRange: { min: 100, max: 500 },
        condition: 'new_in_box',
        maxResults: 100,
      };

      const normalized = normalizeInput(input);

      expect(normalized.size).toBe('10');
      expect(normalized.priceRange).toEqual({ min: 100, max: 500 });
      expect(normalized.condition).toBe('new_in_box');
      expect(normalized.maxResults).toBe(100);
    });

    // Phase 3.x: Advanced filter validation tests
    it('should normalize advanced filter fields', () => {
      const input = {
        keywords: ['Test'],
        authenticatedOnly: true,
        requireOGAll: true,
        minSellerRating: 4.5,
        minSellerReviewCount: 50,
      };

      const normalized = normalizeInput(input);

      expect(normalized.authenticatedOnly).toBe(true);
      expect(normalized.requireOGAll).toBe(true);
      expect(normalized.minSellerRating).toBe(4.5);
      expect(normalized.minSellerReviewCount).toBe(50);
    });

    it('should default advanced filter fields when not provided', () => {
      const input = {
        keywords: ['Test'],
      };

      const normalized = normalizeInput(input);

      expect(normalized.authenticatedOnly).toBe(false);
      expect(normalized.requireOGAll).toBe(false);
      expect(normalized.minSellerRating).toBe(0);
      expect(normalized.minSellerReviewCount).toBe(0);
    });
  });

  describe('Phase 3.x: Advanced Filter Validation', () => {
    it('should accept valid authenticatedOnly boolean', () => {
      const input = {
        keywords: ['Test'],
        authenticatedOnly: true,
      };

      expect(() => validateInput(input)).not.toThrow();
    });

    it('should reject invalid authenticatedOnly type', () => {
      const input = {
        keywords: ['Test'],
        authenticatedOnly: 'yes',
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow('authenticatedOnly must be a boolean');
    });

    it('should accept valid requireOGAll boolean', () => {
      const input = {
        keywords: ['Test'],
        requireOGAll: false,
      };

      expect(() => validateInput(input)).not.toThrow();
    });

    it('should reject invalid requireOGAll type', () => {
      const input = {
        keywords: ['Test'],
        requireOGAll: 1,
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow('requireOGAll must be a boolean');
    });

    it('should accept valid minSellerRating', () => {
      const input = {
        keywords: ['Test'],
        minSellerRating: 4.5,
      };

      expect(() => validateInput(input)).not.toThrow();
    });

    it('should reject minSellerRating below 0', () => {
      const input = {
        keywords: ['Test'],
        minSellerRating: -1,
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow('minSellerRating must be between 0 and 5');
    });

    it('should reject minSellerRating above 5', () => {
      const input = {
        keywords: ['Test'],
        minSellerRating: 5.5,
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow('minSellerRating must be between 0 and 5');
    });

    it('should accept valid minSellerReviewCount', () => {
      const input = {
        keywords: ['Test'],
        minSellerReviewCount: 100,
      };

      expect(() => validateInput(input)).not.toThrow();
    });

    it('should reject negative minSellerReviewCount', () => {
      const input = {
        keywords: ['Test'],
        minSellerReviewCount: -10,
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow('minSellerReviewCount must be between 0 and 100000');
    });
  });
});
