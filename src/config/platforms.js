/**
 * Platform Configuration
 * Defines platform-specific settings for scraping
 */

export const PLATFORM_CONFIGS = {
  grailed: {
    name: 'Grailed',
    type: 'custom',
    rateLimit: 100, // requests per hour
    requestsPerMinute: 90,
    maxConcurrency: 2,
    maxRequestRetries: 2,
    navigationTimeoutSecs: 45,
    cacheTimeout: 30, // minutes
    isAuthenticated: false,
    requiresProxy: true,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
    baseUrl: 'https://www.grailed.com',
    maxResults: 80,
    maxResultsCap: 150,
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
    type: 'custom',
    rateLimit: 200,
    requestsPerMinute: 120,
    maxConcurrency: 2,
    maxRequestRetries: 2,
    navigationTimeoutSecs: 45,
    maxResults: 80,
    maxResultsCap: 200,
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
    type: 'orchestrated',
    actorId: 'ecomscrape/goat-product-search-scraper',
    rateLimit: 50, // Conservative limit for high-risk platform
    cacheTimeout: 60, // 60 minutes
    isAuthenticated: true,
    requiresProxy: true,
    enabled: false, // Disabled by default - HIGH RISK platform
    baseUrl: 'https://goat.com',
    riskLevel: 'very_high', // Phase 4.2: HIGH RISK - actively enforces ToS
    timeoutMs: 180000, // 3 minute timeout for actor calls
    maxRetries: 2, // Conservative retry strategy
  },
  // Phase 4.0: Safer Marketplaces
  depop: {
    name: 'Depop',
    type: 'custom',
    rateLimit: 100, // requests per hour
    requestsPerMinute: 70,
    maxConcurrency: 2,
    maxRequestRetries: 2,
    navigationTimeoutSecs: 45,
    cacheTimeout: 30, // minutes
    isAuthenticated: false,
    requiresProxy: true,
    enabled: true,
    baseUrl: 'https://www.depop.com',
    riskLevel: 'low', // Safer marketplace
    maxResults: 60,
    maxResultsCap: 120,
  },
  poshmark: {
    name: 'Poshmark',
    type: 'custom',
    rateLimit: 100,
    requestsPerMinute: 70,
    maxConcurrency: 2,
    maxRequestRetries: 2,
    navigationTimeoutSecs: 45,
    cacheTimeout: 30,
    isAuthenticated: false,
    requiresProxy: true,
    enabled: true,
    baseUrl: 'https://poshmark.com',
    riskLevel: 'low', // Safer marketplace
    maxResults: 60,
    maxResultsCap: 120,
  },
  // Phase 4.1: Beta Platforms (Higher Risk)
  mercari: {
    name: 'Mercari',
    type: 'custom',
    rateLimit: 50, // Conservative limit for beta platform
    requestsPerMinute: 40,
    maxConcurrency: 2,
    maxRequestRetries: 2, // Conservative retry strategy
    navigationTimeoutSecs: 45,
    cacheTimeout: 15, // Shorter cache for beta
    isAuthenticated: false,
    requiresProxy: true,
    enabled: false, // Disabled by default - beta platform
    baseUrl: 'https://www.mercari.com',
    riskLevel: 'medium-high', // Beta platform with anti-bot measures
    isBeta: true,
    maxResults: 30, // Strict limit for beta
    maxResultsCap: 60,
    timeoutMs: 120000, // 2 minute timeout
  },
  offerup: {
    name: 'OfferUp',
    type: 'custom',
    rateLimit: 30, // Very conservative for Cloudflare protection
    requestsPerMinute: 30,
    maxConcurrency: 2,
    maxRequestRetries: 2,
    navigationTimeoutSecs: 60,
    cacheTimeout: 15,
    isAuthenticated: false,
    requiresProxy: true,
    enabled: false, // Disabled by default - beta platform
    baseUrl: 'https://offerup.com',
    riskLevel: 'medium-high', // Beta platform with Cloudflare
    isBeta: true,
    maxResults: 30, // Strict limit for beta
    maxResultsCap: 60,
    timeoutMs: 180000, // 3 minute timeout (browser automation is slower)
    requiresZipCode: true, // OfferUp requires location-based search
  },
};

// Export all platforms that are either enabled OR are beta platforms (beta platforms use explicit toggle-based validation)
export const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_CONFIGS).filter(
  (key) =>
    PLATFORM_CONFIGS[key].enabled !== false ||
    PLATFORM_CONFIGS[key].isBeta === true ||
    PLATFORM_CONFIGS[key].riskLevel === 'very_high'
);
