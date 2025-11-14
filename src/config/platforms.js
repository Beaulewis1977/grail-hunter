/**
 * Platform Configuration
 * Defines platform-specific settings for scraping
 */

export const PLATFORM_CONFIGS = {
  grailed: {
    name: 'Grailed',
    type: 'orchestrated',
    actorId: 'vmscrapers/grailed',
    rateLimit: 100, // requests per hour
    cacheTimeout: 30, // minutes
    isAuthenticated: false,
    requiresProxy: true,
    baseUrl: 'https://www.grailed.com',
    // Mapping for search URLs
    searchUrlTemplate: 'https://www.grailed.com/shop?q={query}',
    categoryUrls: {
      sneakers: 'https://www.grailed.com/categories/sneakers',
      footwear: 'https://www.grailed.com/categories/footwear',
    },
  },
  // Placeholder for future platforms
  ebay: {
    name: 'eBay',
    type: 'orchestrated',
    actorId: 'dtrungtin/ebay-items-scraper',
    rateLimit: 200,
    cacheTimeout: 60,
    isAuthenticated: false,
    requiresProxy: true,
    enabled: true, // Phase 2 enabled
  },
  stockx: {
    name: 'StockX',
    type: 'custom',
    enabled: true,
    rateLimit: 50,
    cacheTimeout: 60,
    isAuthenticated: true,
    requiresProxy: true,
    riskLevel: 'very_high',
    baseUrl: 'https://stockx.com',
  },
  goat: {
    name: 'GOAT',
    type: 'custom',
    enabled: false, // Phase 4
  },
};

export const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_CONFIGS).filter(
  (key) => PLATFORM_CONFIGS[key].enabled !== false
);
