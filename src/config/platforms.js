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
  // Phase 4.1: Beta Platforms (Higher Risk)
  mercari: {
    name: 'Mercari',
    type: 'orchestrated',
    actorId: 'jupri/mercari-scraper',
    rateLimit: 50, // Conservative limit for beta platform
    cacheTimeout: 15, // Shorter cache for beta
    isAuthenticated: false,
    requiresProxy: true,
    enabled: false, // Disabled by default - beta platform
    baseUrl: 'https://www.mercari.com',
    riskLevel: 'medium-high', // Beta platform with anti-bot measures
    isBeta: true,
    maxResults: 30, // Strict limit for beta
    timeoutMs: 120000, // 2 minute timeout
    maxRetries: 2, // Conservative retry strategy
  },
  offerup: {
    name: 'OfferUp',
    type: 'orchestrated',
    actorId: 'igolaizola/offerup-scraper',
    rateLimit: 30, // Very conservative for Cloudflare protection
    cacheTimeout: 15,
    isAuthenticated: false,
    requiresProxy: true,
    enabled: false, // Disabled by default - beta platform
    baseUrl: 'https://offerup.com',
    riskLevel: 'medium-high', // Beta platform with Cloudflare
    isBeta: true,
    maxResults: 30, // Strict limit for beta
    timeoutMs: 180000, // 3 minute timeout (browser automation is slower)
    maxRetries: 2, // Conservative retry strategy
    requiresZipCode: true, // OfferUp requires location-based search
  },
};

// Export all platforms that are either enabled OR are beta platforms (beta platforms use explicit toggle-based validation)
export const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_CONFIGS).filter(
  (key) => PLATFORM_CONFIGS[key].enabled !== false || PLATFORM_CONFIGS[key].isBeta === true
);
