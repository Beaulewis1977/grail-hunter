/**
 * Unit tests for EbayScraper helper methods and validation
 */

import { EbayScraper } from '../../src/scrapers/ebay.js';

describe('EbayScraper (unit)', () => {
  it('validate does not throw when actorId missing (falls back in scrape)', () => {
    const scraper = new EbayScraper({ name: 'ebay' });
    expect(() => scraper.validate()).not.toThrow();
  });

  it('buildSearchUrls includes price filters and sort order, with size and excludeAuctions', () => {
    const scraper = new EbayScraper({ name: 'ebay', actorId: 'dtrungtin/ebay-items-scraper' });
    const urls = scraper.buildSearchUrls(['Air Jordan 1'], '10.5', { min: 100, max: 500 }, true);
    expect(urls).toHaveLength(1);
    const u = new URL(urls[0].url);
    expect(u.hostname).toContain('ebay.com');
    expect(decodeURIComponent(u.searchParams.get('_nkw'))).toContain('Air Jordan 1'); // decoded keyword present
    expect(u.searchParams.get('_sop')).toBe('10');
    expect(u.searchParams.get('_udlo')).toBe('100');
    expect(u.searchParams.get('_udhi')).toBe('500');
    expect(u.searchParams.get('LH_BIN')).toBe('1');
  });

  it('buildSearchUrls omits price filters and LH_BIN when not provided', () => {
    const scraper = new EbayScraper({ name: 'ebay', actorId: 'dtrungtin/ebay-items-scraper' });
    const urls = scraper.buildSearchUrls(['Dunk Low'], null, {}, false);
    const u = new URL(urls[0].url);
    expect(u.searchParams.get('_udlo')).toBe(null);
    expect(u.searchParams.get('_udhi')).toBe(null);
    expect(u.searchParams.get('LH_BIN')).toBe(null);
  });
});
