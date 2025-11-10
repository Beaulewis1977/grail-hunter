
/**
 * Base Scraper Interface
 * Defines the contract that all scrapers must implement
 */

export class BaseScraper {
  constructor(config) {
    // Bug Fix #7: Add config guard before accessing properties
    if (!config) {
      throw new Error('Scraper configuration is required');
    }
    this.config = config;
    this.platformName = config.name;
  }

  /**
   * Scrape listings from the platform
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Raw listings
   */
  async scrape(searchParams) {
    throw new Error('scrape() must be implemented by subclass');
  }

  /**
   * Build search URL from keywords
   * @param {Array} keywords - Search keywords
   * @returns {Array} URLs to scrape
   */
  buildSearchUrls(keywords) {
    throw new Error('buildSearchUrls() must be implemented by subclass');
  }

  /**
   * Validate scraper-specific configuration
   */
  validate() {
    if (!this.config) {
      throw new Error('Scraper configuration is required');
    }
  }
}

