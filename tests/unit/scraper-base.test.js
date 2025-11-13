/**
 * Unit tests for BaseScraper
 */

import { BaseScraper } from '../../src/scrapers/base.js';

class DummyScraper extends BaseScraper {}

describe('BaseScraper', () => {
  it('constructor throws when config is missing', () => {
    expect(() => new DummyScraper()).toThrow('Scraper configuration is required');
  });

  it('constructor accepts valid config and validate() passes', () => {
    const scraper = new DummyScraper({ name: 'dummy' });
    expect(scraper.platformName).toBe('dummy');
    expect(() => scraper.validate()).not.toThrow();
  });

  it('scrape() default throws when not implemented', async () => {
    const scraper = new DummyScraper({ name: 'dummy' });
    await expect(scraper.scrape({})).rejects.toThrow('scrape() must be implemented by subclass');
  });

  it('buildSearchUrls() default throws when not implemented', () => {
    const scraper = new DummyScraper({ name: 'dummy' });
    expect(() => scraper.buildSearchUrls(['q'])).toThrow(
      'buildSearchUrls() must be implemented by subclass'
    );
  });
});
