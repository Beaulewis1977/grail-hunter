/**
 * Data Normalization Engine
 * Converts platform-specific data to standardized schema
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const MAX_DESCRIPTION_LENGTH = 500;

export class DataNormalizer {
  /**
   * Normalize a listing from any platform
   * @param {object} rawListing - Platform-specific listing data
   * @param {string} platform - Platform name
   * @returns {object} Normalized listing
   */
  normalize(rawListing, platform) {
    // Bug Fix #2: Add null/undefined guard for rawListing
    if (!rawListing || typeof rawListing !== 'object') {
      logger.warn('Invalid rawListing provided to normalize', { platform });
      return null;
    }

    // Bug Fix #5: Add validation for platform parameter before calling toLowerCase()
    if (typeof platform !== 'string') {
      logger.warn('Invalid platform parameter - not a string', {
        platform,
        type: typeof platform,
      });
      return this.normalizeGeneric(rawListing, '');
    }

    // Trim the platform value
    const platformTrimmed = platform.trim();

    // Check if platform is empty after trimming
    if (!platformTrimmed) {
      logger.warn('Invalid platform parameter - empty string after trimming', {
        platform,
      });
      return this.normalizeGeneric(rawListing, '');
    }

    logger.debug(`Normalizing listing from ${platformTrimmed}`, { listingId: rawListing.id });

    switch (platformTrimmed.toLowerCase()) {
      case 'grailed':
        return this.normalizeGrailed(rawListing);
      case 'ebay':
        return this.normalizeEbay(rawListing);
      case 'stockx':
        return this.normalizeStockX(rawListing);
      case 'goat':
        return this.normalizeGoat(rawListing);
      case 'depop':
        return this.normalizeDepop(rawListing);
      case 'poshmark':
        return this.normalizePoshmark(rawListing);
      case 'mercari':
        return this.normalizeMercari(rawListing);
      case 'offerup':
        return this.normalizeOfferUp(rawListing);
      default:
        logger.warn(`Unknown platform: ${platformTrimmed}, using generic normalizer`);
        return this.normalizeGeneric(rawListing, platformTrimmed);
    }
  }

  /**
   * Normalize Grailed listing
   * @param {object} raw - Raw Grailed data
   * @returns {object} Normalized listing
   */
  normalizeGrailed(raw) {
    const currentPrice = this.parsePrice(raw.price);

    return {
      product: {
        name: raw.title || raw.name || 'Unknown',
        brand: this.extractBrand(raw.title || ''),
        model: this.extractModel(raw.title || ''),
        colorway: raw.color || null,
        sku: raw.sku || null,
        releaseYear: null, // Not provided by Grailed
      },
      listing: {
        price: currentPrice,
        currency: 'USD',
        size_us_mens: raw.size || null,
        size_us_womens: null,
        size_eu: null,
        condition: this.mapGrailedCondition(raw.condition),
        tags: this.extractTags(raw.description || ''),
        type: 'sell',
        description: this.truncateDescription(raw.description || ''),
      },
      source: {
        platform: 'Grailed',
        url: raw.url || raw.link || `https://grailed.com/listings/${raw.id}`,
        id: String(raw.id || raw.listing_id || ''),
        is_authenticated: false,
        imageUrl: raw.image_url || raw.cover_photo?.url || null,
      },
      seller: {
        name: raw.user?.username || raw.seller?.name || null,
        rating: raw.user?.feedback_score || null,
        reviewCount: raw.user?.feedback_count || null,
        verified: raw.user?.verified || false,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        // TODO Phase 3: Populate with real StockX/GOAT market data and calculate savings/dealQuality
        dealScore: {
          isBelowMarket: false,
          marketValue: null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        // TODO Phase 3: Compare with stored previousPrice and set hasDrop/dropPercent accordingly
        priceChange: {
          hasDrop: false,
          previousPrice: null, // TODO: Fetch from storage or priceHistory
          currentPrice,
          dropPercent: null,
        },
      },
    };
  }

  normalizeEbay(raw) {
    const title = raw.title || raw.name || '';
    const fallbackIdSource = `${raw.url ?? ''}|${title}|${raw.price ?? ''}|${raw.itemNumber ?? ''}`;
    const id = String(
      raw.itemNumber ||
        this.extractEbayIdFromUrl(raw.url) ||
        this.generateDeterministicId(fallbackIdSource)
    );

    const tags = this.buildEbayTags(raw);
    const isAuthenticated = tags.includes('authenticity_guarantee');
    const currentPrice = this.parsePrice(raw.price);

    // Determine listing type from tags
    const listingType =
      tags.includes('auction') && !tags.includes('buy_it_now') ? 'auction' : 'sell';

    // Extract seller information
    const sellerRating = this.parseSellerRating(raw.sellerPositiveFeedbackPercent);
    const sellerReviewCount = this.parseSellerReviewCount(raw.sellerFeedbackScore);

    return {
      product: {
        name: title || 'Unknown',
        brand: this.extractBrand(title || ''),
        model: this.extractModel(title || ''),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: currentPrice,
        currency: 'USD',
        size_us_mens: null,
        size_us_womens: null,
        size_eu: null,
        condition: 'unspecified',
        tags,
        type: listingType,
        description: this.truncateDescription(raw.subTitle || ''),
      },
      source: {
        platform: 'eBay',
        url: raw.url || '',
        id,
        is_authenticated: isAuthenticated,
        imageUrl: raw.image || null,
      },
      seller: {
        name: raw.seller || null,
        rating: sellerRating,
        reviewCount: sellerReviewCount,
        verified: false,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        // TODO Phase 3: Populate with real StockX/GOAT market data and calculate savings/dealQuality
        dealScore: {
          isBelowMarket: false,
          marketValue: null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        // TODO Phase 3: Compare with stored previousPrice and set hasDrop/dropPercent accordingly
        priceChange: {
          hasDrop: false,
          previousPrice: null, // TODO: Fetch from storage or priceHistory
          currentPrice,
          dropPercent: null,
        },
      },
    };
  }

  normalizeStockX(raw) {
    const title = raw.title || raw.name || '';
    const currentPrice = this.parsePrice(raw.price || raw.lowestAsk || raw.lastSale);

    return {
      product: {
        name: title || 'Unknown',
        brand: raw.brand || this.extractBrand(title || ''),
        model: this.extractModel(title || ''),
        colorway: raw.colorway || null,
        sku: raw.styleId || raw.sku || null,
        releaseYear: raw.releaseDate ? new Date(raw.releaseDate).getFullYear() : null,
      },
      listing: {
        price: currentPrice,
        currency: 'USD',
        size_us_mens: null,
        size_us_womens: null,
        size_eu: null,
        condition: raw.condition || 'new_in_box',
        tags: ['authenticated', 'verified'],
        type: 'sell',
        description: this.truncateDescription(raw.description || ''),
      },
      source: {
        platform: 'StockX',
        url: raw.url || '',
        id: String(raw.id || raw.uuid || ''),
        is_authenticated: true,
        imageUrl: raw.image_url || null,
      },
      seller: {
        name: 'StockX',
        rating: null,
        reviewCount: null,
        verified: true,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        dealScore: {
          isBelowMarket: false,
          marketValue: raw.lastSale || raw.lowestAsk || null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        priceChange: {
          hasDrop: false,
          previousPrice: null,
          currentPrice,
          dropPercent: null,
        },
      },
    };
  }

  /**
   * Normalize GOAT listing
   * Phase 4.2: GOAT & StockX Hybrid Intelligence Layers
   * @param {object} raw - Raw GOAT data from ecomscrape/goat-product-search-scraper
   * @returns {object} Normalized listing
   */
  normalizeGoat(raw) {
    const title = raw.name || raw.title || raw.productName || '';
    const currentPrice = this.parsePrice(
      raw.lowestPrice || raw.price || raw.lowestPriceUsd || raw.retailPrice
    );

    // GOAT provides size in various formats - extract US Men's size
    const sizeUsMens = raw.size || raw.sizeUs || raw.usSize || null;

    return {
      product: {
        name: title || 'Unknown',
        brand: raw.brand || raw.brandName || this.extractBrand(title),
        model: this.extractModel(title),
        colorway: raw.colorway || raw.color || null,
        sku: raw.sku || raw.styleId || raw.productSku || null,
        releaseYear: raw.releaseDate ? new Date(raw.releaseDate).getFullYear() : null,
      },
      listing: {
        price: currentPrice,
        currency: 'USD',
        size_us_mens: sizeUsMens,
        size_us_womens: null,
        size_eu: null,
        condition: 'new_in_box', // GOAT sells authenticated new sneakers
        tags: ['authenticated', 'verified', 'goat'],
        type: 'sell',
        description: this.truncateDescription(raw.description || raw.details || ''),
      },
      source: {
        platform: 'GOAT',
        url:
          raw.url || raw.productUrl || (raw.slug && `https://goat.com/sneakers/${raw.slug}`) || '',
        id: String(raw.id || raw.productId || raw.slug || ''),
        is_authenticated: true,
        imageUrl: raw.imageUrl || raw.image || raw.mainPictureUrl || null,
      },
      seller: {
        name: 'GOAT',
        rating: null, // GOAT is a marketplace, not individual sellers
        reviewCount: null,
        verified: true,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        dealScore: {
          isBelowMarket: false,
          marketValue: raw.lowestPrice || raw.price || null, // Use GOAT price as market reference
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        priceChange: {
          hasDrop: false,
          previousPrice: null,
          currentPrice,
          dropPercent: null,
        },
      },
    };
  }

  /**
   * Normalize Depop listing
   * Phase 4.0: Safer Marketplaces
   * @param {object} raw - Raw Depop data from lexis-solutions/depop-scraper
   * @returns {object} Normalized listing
   */
  normalizeDepop(raw) {
    const title = raw.title || raw.name || raw.description || '';
    const currentPrice = this.parsePrice(raw.price || raw.priceAmount);

    // Extract tags from description and available metadata
    const tags = this.extractTags(raw.description || title);

    // Depop seller ratings (typically 0-5 stars)
    const sellerRating = raw.sellerRating || raw.seller?.rating || null;
    const sellerReviewCount = raw.sellerReviewCount || raw.seller?.reviewCount || null;

    return {
      product: {
        name: title || 'Unknown',
        brand: raw.brand || this.extractBrand(title),
        model: this.extractModel(title),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: currentPrice,
        currency: raw.currency || 'USD',
        size_us_mens: raw.size || null,
        size_us_womens: null,
        size_eu: null,
        condition: this.mapDepopCondition(raw.condition),
        tags,
        type: 'sell', // Depop is peer-to-peer, always fixed-price
        description: this.truncateDescription(raw.description || ''),
      },
      source: {
        platform: 'Depop',
        url: raw.url || raw.productUrl || '',
        id: String(raw.id || raw.productId || ''),
        is_authenticated: false,
        imageUrl: raw.image || raw.imageUrl || raw.images?.[0] || null,
      },
      seller: {
        name: raw.sellerUsername || raw.seller?.username || null,
        rating: sellerRating,
        reviewCount: sellerReviewCount,
        verified: raw.seller?.verified || false,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        dealScore: {
          isBelowMarket: false,
          marketValue: null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        priceChange: {
          hasDrop: false,
          previousPrice: null,
          currentPrice,
          dropPercent: null,
        },
      },
    };
  }

  /**
   * Normalize Poshmark listing
   * Phase 4.0: Safer Marketplaces
   * @param {object} raw - Raw Poshmark data from lexis-solutions/poshmark-scraper
   * @returns {object} Normalized listing
   */
  normalizePoshmark(raw) {
    const title = raw.title || raw.name || raw.description || '';
    const currentPrice = this.parsePrice(raw.price || raw.priceAmount);

    // Extract tags from description and available metadata
    const tags = this.extractTags(raw.description || title);

    // Poshmark seller info
    const sellerRating = raw.sellerRating || raw.seller?.rating || null;
    const sellerReviewCount = raw.sellerReviewCount || raw.seller?.reviewCount || null;

    return {
      product: {
        name: title || 'Unknown',
        brand: raw.brand || this.extractBrand(title),
        model: this.extractModel(title),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: currentPrice,
        currency: raw.currency || 'USD',
        size_us_mens: raw.size || null,
        size_us_womens: null,
        size_eu: null,
        condition: this.mapPoshmarkCondition(raw.condition),
        tags,
        type: 'sell', // Poshmark is peer-to-peer, always fixed-price
        description: this.truncateDescription(raw.description || ''),
      },
      source: {
        platform: 'Poshmark',
        url: raw.url || raw.productUrl || '',
        id: String(raw.id || raw.listingId || ''),
        is_authenticated: false,
        imageUrl: raw.image || raw.imageUrl || raw.pictures?.[0] || null,
      },
      seller: {
        name: raw.sellerUsername || raw.seller?.username || null,
        rating: sellerRating,
        reviewCount: sellerReviewCount,
        verified: raw.seller?.verified || false,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        dealScore: {
          isBelowMarket: false,
          marketValue: null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        priceChange: {
          hasDrop: false,
          previousPrice: null,
          currentPrice,
          dropPercent: null,
        },
      },
    };
  }

  /**
   * Normalize Mercari listing
   * Phase 4.1: Beta Platforms
   * @param {object} raw - Raw Mercari data from jupri/mercari-scraper
   * @returns {object} Normalized listing
   */
  normalizeMercari(raw) {
    const title = raw.title || raw.name || raw.productName || '';
    const currentPrice = this.parsePrice(raw.price || raw.priceAmount);

    // Extract tags from description and available metadata
    const tags = this.extractTags(raw.description || title);

    // Mercari seller info
    const sellerRating = raw.sellerRating || raw.seller?.rating || null;
    const sellerReviewCount = raw.sellerReviewCount || raw.seller?.reviewCount || null;

    return {
      product: {
        name: title || 'Unknown',
        brand: raw.brand || this.extractBrand(title),
        model: this.extractModel(title),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: currentPrice,
        currency: raw.currency || 'USD',
        size_us_mens: raw.size || null,
        size_us_womens: null,
        size_eu: null,
        condition: this.mapMercariCondition(raw.condition || raw.itemCondition),
        tags,
        type: 'sell', // Mercari is peer-to-peer, always fixed-price
        description: this.truncateDescription(raw.description || ''),
      },
      source: {
        platform: 'Mercari',
        url: raw.url || raw.productUrl || raw.itemUrl || '',
        id: String(raw.id || raw.itemId || raw.listingId || ''),
        is_authenticated: false,
        imageUrl: raw.image || raw.imageUrl || raw.photo || raw.photos?.[0] || null,
      },
      seller: {
        name: raw.sellerName || raw.seller?.name || raw.seller?.username || null,
        rating: sellerRating,
        reviewCount: sellerReviewCount,
        verified: raw.seller?.verified || false,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        dealScore: {
          isBelowMarket: false,
          marketValue: null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        priceChange: {
          hasDrop: false,
          previousPrice: null,
          currentPrice,
          dropPercent: null,
        },
        betaPlatform: true,
        riskLevel: 'medium-high',
      },
    };
  }

  /**
   * Normalize OfferUp listing
   * Phase 4.1: Beta Platforms
   * @param {object} raw - Raw OfferUp data from igolaizola/offerup-scraper
   * @returns {object} Normalized listing
   */
  normalizeOfferUp(raw) {
    const title = raw.title || raw.name || '';
    const currentPrice = this.parsePrice(raw.price || raw.formattedPrice);

    // Extract tags from description and available metadata
    const tags = this.extractTags(raw.description || title);

    // OfferUp includes detailed listing info in _details object
    // eslint-disable-next-line no-underscore-dangle
    const details = raw._details || {};
    const sellerInfo = details.seller || raw.seller || {};

    return {
      product: {
        name: title || 'Unknown',
        brand: raw.brand || this.extractBrand(title),
        model: this.extractModel(title),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: currentPrice,
        currency: 'USD', // OfferUp is US-only
        size_us_mens: raw.size || null,
        size_us_womens: null,
        size_eu: null,
        condition: this.mapOfferUpCondition(raw.condition || details.condition),
        tags,
        type: 'sell', // OfferUp is peer-to-peer, always fixed-price
        description: this.truncateDescription(raw.description || details.description || ''),
      },
      source: {
        platform: 'OfferUp',
        url: raw.url || raw.listingUrl || '',
        id: String(raw.listingId || raw.id || ''),
        is_authenticated: false,
        imageUrl: raw.image || raw.imageUrl || details.photos?.[0] || null,
      },
      seller: {
        name: sellerInfo.name || sellerInfo.username || null,
        rating: sellerInfo.rating || null,
        reviewCount: sellerInfo.reviewCount || null,
        verified: sellerInfo.verified || false,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        dealScore: {
          isBelowMarket: false,
          marketValue: null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        priceChange: {
          hasDrop: false,
          previousPrice: null,
          currentPrice,
          dropPercent: null,
        },
        betaPlatform: true,
        riskLevel: 'medium-high',
        location: raw.locationName || details.location?.name || null,
      },
    };
  }

  extractEbayIdFromUrl(url) {
    if (typeof url !== 'string') return null;
    const match = url.match(/\/(?:itm|p)\/(\d+)/);
    return match ? match[1] : null;
  }

  generateDeterministicId(source) {
    if (!source) {
      return crypto.randomBytes(8).toString('hex');
    }

    return crypto.createHash('sha256').update(source).digest('hex').slice(0, 16);
  }

  buildEbayTags(raw) {
    const tags = new Set();

    const subtitle = typeof raw.subTitle === 'string' ? raw.subTitle.toLowerCase() : '';
    const title = typeof raw.title === 'string' ? raw.title.toLowerCase() : '';

    if (subtitle.includes('authenticity guarantee') || title.includes('authenticity guarantee')) {
      tags.add('authenticity_guarantee');
    }

    const subtitleHasBuyNow = subtitle.includes('buy it now') || subtitle.includes('buy-it-now');
    const titleHasBuyNow = title.includes('buy it now') || title.includes('buy-it-now');
    if (raw.buyItNow === true || subtitleHasBuyNow || titleHasBuyNow) {
      tags.add('buy_it_now');
    }

    // Preserve auction awareness when excludeAuctions was false and listing notes auction type
    if (raw.listingType && typeof raw.listingType === 'string') {
      const lowerType = raw.listingType.toLowerCase();
      if (lowerType.includes('auction')) {
        tags.add('auction');
      }
      if (lowerType.includes('buy it now')) {
        tags.add('buy_it_now');
      }
    }

    return Array.from(tags);
  }

  /**
   * Generic normalizer for unknown platforms
   */
  normalizeGeneric(raw, platform) {
    // Simplified platform sanitization while maintaining safety
    const safePlatform = (typeof platform === 'string' ? platform : String(platform || '')).trim();
    const currentPrice = this.parsePrice(raw.price);

    return {
      product: {
        name: raw.title || raw.name || 'Unknown',
        brand: null,
        model: null,
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: currentPrice,
        currency: 'USD',
        size_us_mens: raw.size || null,
        size_us_womens: null,
        size_eu: null,
        condition: 'unspecified',
        tags: [],
        type: 'sell',
        description: raw.description || '',
      },
      source: {
        platform: safePlatform,
        url: raw.url || raw.link || '',
        id: String(raw.id || ''),
        is_authenticated: false,
        imageUrl: raw.image_url || raw.imageUrl || null,
      },
      seller: {
        name: null,
        rating: null,
        reviewCount: null,
        verified: false,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: process.env.APIFY_ACT_RUN_ID || 'local',
        version: '1.0.0',
      },
      metadata: {
        // TODO Phase 3: Populate with real StockX/GOAT market data and calculate savings/dealQuality
        dealScore: {
          isBelowMarket: false,
          marketValue: null,
          savingsPercentage: null,
          savingsAmount: null,
          dealQuality: null,
        },
        // TODO Phase 3: Compare with stored previousPrice and set hasDrop/dropPercent accordingly
        priceChange: {
          hasDrop: false,
          previousPrice: null, // TODO: Fetch from storage or priceHistory
          currentPrice,
          dropPercent: null,
        },
      },
    };
  }

  /**
   * Extract brand from title
   */
  extractBrand(title) {
    // Bug Fix #3: Add type safety check for title
    if (typeof title !== 'string') return null;

    const upperTitle = title.toUpperCase();

    // Check for Air Jordan first (before Jordan)
    if (upperTitle.includes('AIR JORDAN')) {
      return 'Air Jordan';
    }

    const brands = [
      'Nike',
      'Adidas',
      'Jordan',
      'Yeezy',
      'New Balance',
      'Asics',
      'Puma',
      'Reebok',
      'Vans',
      'Converse',
    ];

    for (const brand of brands) {
      if (upperTitle.includes(brand.toUpperCase())) {
        return brand;
      }
    }

    return null;
  }

  /**
   * Extract model from title
   */
  extractModel(title) {
    // Bug Fix #4: Add type safety check for title
    if (typeof title !== 'string') return null;

    // Common sneaker models
    const models = [
      'Air Jordan 1',
      'Air Jordan 4',
      'Dunk Low',
      'Dunk High',
      'Air Force 1',
      'Yeezy 350',
      'Yeezy 700',
    ];

    const upperTitle = title.toUpperCase();

    for (const model of models) {
      if (upperTitle.includes(model.toUpperCase())) {
        return model;
      }
    }

    return null;
  }

  /**
   * Map Grailed condition to standardized enum
   */
  mapGrailedCondition(condition) {
    // Bug Fix #1: Add type safety check for condition
    if (!condition || typeof condition !== 'string') return 'unspecified';

    const conditionStr = condition.toLowerCase();
    const mapping = {
      new: 'new_in_box',
      'brand new': 'new_in_box',
      'gently used': 'used_like_new',
      used: 'used_good',
      worn: 'used_fair',
    };

    return mapping[conditionStr] || 'unspecified';
  }

  /**
   * Map Depop condition to standardized enum
   * Phase 4.0: Safer Marketplaces
   */
  mapDepopCondition(condition) {
    if (!condition || typeof condition !== 'string') return 'unspecified';

    const conditionStr = condition.toLowerCase();
    const mapping = {
      new: 'new_in_box',
      'brand new': 'new_in_box',
      'new with tags': 'new_in_box',
      'like new': 'used_like_new',
      'gently used': 'used_like_new',
      good: 'used_good',
      used: 'used_good',
      fair: 'used_fair',
      worn: 'used_fair',
      poor: 'used_poor',
    };

    return mapping[conditionStr] || 'unspecified';
  }

  /**
   * Map Poshmark condition to standardized enum
   * Phase 4.0: Safer Marketplaces
   */
  mapPoshmarkCondition(condition) {
    if (!condition || typeof condition !== 'string') return 'unspecified';

    const conditionStr = condition.toLowerCase();
    const mapping = {
      nwt: 'new_in_box', // New With Tags
      'new with tags': 'new_in_box',
      new: 'new_in_box',
      'like new': 'used_like_new',
      'gently used': 'used_like_new',
      good: 'used_good',
      'good pre-owned': 'used_good',
      fair: 'used_fair',
      poor: 'used_poor',
    };

    return mapping[conditionStr] || 'unspecified';
  }

  /**
   * Map Mercari condition to standardized enum
   * Phase 4.1: Beta Platforms
   */
  mapMercariCondition(condition) {
    if (!condition || typeof condition !== 'string') return 'unspecified';

    const conditionStr = condition.toLowerCase();
    const mapping = {
      new: 'new_in_box',
      'new with tags': 'new_in_box',
      'new without tags': 'new_in_box',
      'like new': 'used_like_new',
      excellent: 'used_like_new',
      good: 'used_good',
      fair: 'used_fair',
      poor: 'used_poor',
    };

    return mapping[conditionStr] || 'unspecified';
  }

  /**
   * Map OfferUp condition to standardized enum
   * Phase 4.1: Beta Platforms
   */
  mapOfferUpCondition(condition) {
    if (!condition || typeof condition !== 'string') return 'unspecified';

    const conditionStr = condition.toLowerCase();
    const mapping = {
      new: 'new_in_box',
      'like new': 'used_like_new',
      excellent: 'used_like_new',
      good: 'used_good',
      fair: 'used_fair',
      poor: 'used_poor',
    };

    return mapping[conditionStr] || 'unspecified';
  }

  /**
   * Extract tags from description
   */
  extractTags(description) {
    if (typeof description !== 'string') {
      return [];
    }

    const tags = [];
    const desc = description.toLowerCase();

    // Box condition tags - check exclusions first to avoid substring collisions
    if (desc.includes('no box') || desc.includes('without box')) {
      tags.push('no_box');
    } else if (desc.includes('replacement box') || desc.includes('rep box')) {
      tags.push('replacement_box');
    } else if (
      desc.includes('og all') ||
      desc.includes('og box') ||
      desc.includes('original box')
    ) {
      tags.push('og_all');
    }

    // Condition tags
    if (desc.includes('deadstock') || desc.includes(' ds ') || desc.includes('ds,')) {
      tags.push('deadstock');
    }
    if (desc.includes('vnds')) {
      tags.push('vnds');
    }
    if (desc.includes('nds') || desc.includes('near deadstock')) {
      tags.push('nds');
    }

    // Authentication tags
    if (desc.includes('authenticated') || desc.includes('legit checked')) {
      tags.push('authenticated');
    }

    return tags;
  }

  /**
   * Parse price to number
   */
  parsePrice(price) {
    if (typeof price === 'number') {
      return Number.isFinite(price) ? price : null;
    }

    if (typeof price === 'string') {
      const cleaned = price.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }

      logger.warn('Failed to parse price string', { price });
      return null;
    }

    if (price !== undefined && price !== null) {
      logger.warn('Unsupported price type received while parsing', {
        price,
        type: typeof price,
      });
    }

    return null;
  }

  /**
   * Truncate description
   */
  truncateDescription(desc) {
    if (!desc) return '';
    if (desc.length <= MAX_DESCRIPTION_LENGTH) {
      return desc;
    }

    const truncatedLength = Math.max(0, MAX_DESCRIPTION_LENGTH - 3);
    return `${desc.substring(0, truncatedLength)}...`;
  }

  /**
   * Parse seller rating from eBay feedback data
   * Converts positive feedback percentage to 0-5 scale
   * @param {number|string} positiveFeedbackPercent - Positive feedback percentage (0-100)
   * @returns {number|null} Rating on 0-5 scale, or null if invalid
   */
  parseSellerRating(positiveFeedbackPercent) {
    if (positiveFeedbackPercent === undefined || positiveFeedbackPercent === null) {
      return null;
    }

    const percent =
      typeof positiveFeedbackPercent === 'string'
        ? parseFloat(positiveFeedbackPercent)
        : positiveFeedbackPercent;

    if (Number.isNaN(percent)) {
      return null;
    }

    // Convert 0-100 percentage to 0-5 scale
    // 100% = 5.0, 95% = 4.75, 90% = 4.5, etc.
    return Math.min(5, Math.max(0, (percent / 100) * 5));
  }

  /**
   * Parse seller review count from eBay feedback score
   * @param {number|string} feedbackScore - Total feedback score
   * @returns {number|null} Number of reviews
   */
  parseSellerReviewCount(feedbackScore) {
    if (feedbackScore === undefined || feedbackScore === null) {
      return null;
    }

    const count = typeof feedbackScore === 'string' ? parseInt(feedbackScore, 10) : feedbackScore;

    return Number.isNaN(count) ? null : count;
  }
}
