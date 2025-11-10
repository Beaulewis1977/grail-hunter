
/**
 * Data Normalization Engine
 * Converts platform-specific data to standardized schema
 */

import { logger } from '../utils/logger.js';

export class DataNormalizer {
  /**
   * Normalize a listing from any platform
   * @param {object} rawListing - Platform-specific listing data
   * @param {string} platform - Platform name
   * @returns {object} Normalized listing
   */
  normalize(rawListing, platform) {
    logger.debug(`Normalizing listing from ${platform}`, { listingId: rawListing.id });

    switch (platform.toLowerCase()) {
      case 'grailed':
        return this.normalizeGrailed(rawListing);
      default:
        logger.warn(`Unknown platform: ${platform}, using generic normalizer`);
        return this.normalizeGeneric(rawListing, platform);
    }
  }

  /**
   * Normalize Grailed listing
   * @param {object} raw - Raw Grailed data
   * @returns {object} Normalized listing
   */
  normalizeGrailed(raw) {
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
        price: this.parsePrice(raw.price),
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
    };
  }

  /**
   * Generic normalizer for unknown platforms
   */
  normalizeGeneric(raw, platform) {
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
        price: this.parsePrice(raw.price),
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
        platform,
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
    };
  }

  /**
   * Extract brand from title
   */
  extractBrand(title) {
    const upperTitle = title.toUpperCase();

    // Check for Air Jordan first (before Jordan)
    if (upperTitle.includes('AIR JORDAN')) {
      return 'Air Jordan';
    }

    const brands = ['Nike', 'Adidas', 'Jordan', 'Yeezy', 'New Balance', 'Asics', 'Puma', 'Reebok', 'Vans', 'Converse'];

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
    if (!condition) return 'unspecified';

    const conditionStr = condition.toLowerCase();
    const mapping = {
      'new': 'new_in_box',
      'brand new': 'new_in_box',
      'gently used': 'used_like_new',
      'used': 'used_good',
      'worn': 'used_fair',
    };

    return mapping[conditionStr] || 'unspecified';
  }

  /**
   * Extract tags from description
   */
  extractTags(description) {
    const tags = [];
    const desc = description.toLowerCase();

    if (desc.includes('og all') || desc.includes('og box')) tags.push('og_all');
    if (desc.includes('no box')) tags.push('no_box');
    if (desc.includes('deadstock') || desc.includes('ds')) tags.push('deadstock');
    if (desc.includes('vnds')) tags.push('vnds');

    return tags;
  }

  /**
   * Parse price to number
   */
  parsePrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const cleaned = price.replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  /**
   * Truncate description
   */
  truncateDescription(desc) {
    if (!desc) return '';
    return desc.length > 500 ? `${desc.substring(0, 497)}...` : desc;
  }
}

