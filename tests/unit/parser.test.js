/**
 * Unit tests for sneaker parser
 */

import { SneakerParser } from '../../src/core/parser.js';

describe('SneakerParser', () => {
  let parser;

  beforeEach(() => {
    parser = new SneakerParser();
  });

  describe('parseCondition', () => {
    it('should parse deadstock/DS', () => {
      expect(parser.parseCondition('Brand new DS in box')).toBe('new_in_box');
      expect(parser.parseCondition('Deadstock condition')).toBe('new_in_box');
      expect(parser.parseCondition('BNIB never worn')).toBe('new_in_box');
    });

    it('should parse VNDS', () => {
      expect(parser.parseCondition('VNDS condition')).toBe('used_like_new');
      expect(parser.parseCondition('Very Near Deadstock')).toBe('used_like_new');
    });

    it('should parse worn/used', () => {
      expect(parser.parseCondition('Gently used')).toBe('used_fair');
      expect(parser.parseCondition('Worn a few times')).toBe('used_fair');
    });

    it('should return unspecified if no match', () => {
      expect(parser.parseCondition('Good condition')).toBe('unspecified');
    });
  });

  describe('parseSize', () => {
    it('should parse various size formats', () => {
      expect(parser.parseSize('Size 10')).toBe('10');
      expect(parser.parseSize('sz: 10.5')).toBe('10.5');
      expect(parser.parseSize("US Men's 11")).toBe('11');
      expect(parser.parseSize('12 US')).toBe('12');
    });

    it('should return null if no size found', () => {
      expect(parser.parseSize('No size mentioned')).toBeNull();
    });
  });

  describe('parseTags', () => {
    it('should parse OG all tag', () => {
      const tags = parser.parseTags('Comes with OG box and all accessories');
      expect(tags).toContain('og_all');
    });

    it('should parse no box tag', () => {
      const tags = parser.parseTags('Shoes only, no box included');
      expect(tags).toContain('no_box');
    });

    it('should parse multiple tags', () => {
      const tags = parser.parseTags('Sample pair, OG all, never released');
      expect(tags).toContain('sample');
      expect(tags).toContain('og_all');
    });

    it('should return empty array if no tags found', () => {
      const tags = parser.parseTags('Regular listing');
      expect(tags).toEqual([]);
    });
  });

  describe('parse', () => {
    it('should parse all fields from a listing', () => {
      const listing = {
        product: { name: 'Air Jordan 1' },
        listing: {
          description: 'Size 10.5 VNDS condition with OG box',
          condition: 'unspecified',
          tags: [],
        },
        source: { id: '123' },
      };

      const parsed = parser.parse(listing);

      expect(parsed.listing.condition).toBe('used_like_new');
      expect(parsed.listing.size_us_mens).toBe('10.5');
      expect(parsed.listing.tags).toContain('og_all');
      expect(parsed.listing.tags).toContain('vnds');
    });
  });
});
