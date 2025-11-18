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
  // Phase 4.0: Safer Marketplaces
  depop: {
    name: 'Depop',
    type: 'orchestrated',
    actorId: 'lexis-solutions/depop-scraper',
    rateLimit: 100, // requests per hour
    cacheTimeout: 30, // minutes
    isAuthenticated: false,
    requiresProxy: true,
    enabled: true,
    baseUrl: 'https://www.depop.com',
    riskLevel: 'low', // Safer marketplace
  },
  poshmark: {
    name: 'Poshmark',
    type: 'orchestrated',
    actorId: 'lexis-solutions/poshmark-scraper',
    rateLimit: 100,
    cacheTimeout: 30,
    isAuthenticated: false,
    requiresProxy: true,
    enabled: true,
    baseUrl: 'https://poshmark.com',
    riskLevel: 'low', // Safer marketplace
  },
};

export const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_CONFIGS).filter(
  (key) => PLATFORM_CONFIGS[key].enabled !== false
);
