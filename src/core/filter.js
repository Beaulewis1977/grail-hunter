
/**
 * Filtering Engine
 * Applies user-defined filters to listings
 */

import { logger } from '../utils/logger.js';

export class ListingFilter {
  /**
   * Filter listings based on user criteria
   * @param {Array} listings - Normalized listings
   * @param {object} filters - Filter criteria
   * @returns {Array} Filtered listings
   */
  filter(listings, filters = {}) {
    // Bug Fix #5: Add default parameter for filters and use destructuring
    logger.info(`Filtering ${listings.length} listings`, { filters });
    const { size, priceRange, condition } = filters;

    let filtered = listings;

    // Filter by size
    if (size) {
      filtered = this.filterBySize(filtered, size);
    }

    // Filter by price range
    if (priceRange) {
      filtered = this.filterByPriceRange(filtered, priceRange);
    }

    // Filter by condition
    if (condition) {
      filtered = this.filterByCondition(filtered, condition);
    }

    // Remove listings with missing critical data
    filtered = this.filterInvalidListings(filtered);

    logger.info(`Filtered down to ${filtered.length} listings`);

    return filtered;
  }

  /**
   * Filter by size
   */
  filterBySize(listings, targetSize) {
    return listings.filter((listing) => {
      const size = listing.listing.size_us_mens;
      if (!size) return false;

      // Convert to string for comparison
      return String(size) === String(targetSize);
    });
  }

  /**
   * Filter by price range
   */
  filterByPriceRange(listings, priceRange) {
    const { min, max } = priceRange;

    return listings.filter((listing) => {
      const price = listing.listing.price;

      if (typeof price !== 'number' || price <= 0) {
        return false;
      }

      if (min !== undefined && price < min) {
        return false;
      }

      if (max !== undefined && price > max) {
        return false;
      }

      return true;
    });
  }

  /**
   * Filter by condition
   */
  filterByCondition(listings, targetCondition) {
    const conditionOrder = [
      'new_in_box',
      'used_like_new',
      'used_good',
      'used_fair',
      'used_poor',
      'unspecified',
    ];

    const minIndex = conditionOrder.indexOf(targetCondition);

    if (minIndex === -1) {
      logger.warn(`Unknown condition: ${targetCondition}, skipping filter`);
      return listings;
    }

    return listings.filter((listing) => {
      const condition = listing.listing.condition;
      const currentIndex = conditionOrder.indexOf(condition);

      // Keep listings that are same condition or better
      return currentIndex !== -1 && currentIndex <= minIndex;
    });
  }

  /**
   * Remove listings with invalid/missing critical data
   */
  filterInvalidListings(listings) {
    return listings.filter((listing) => {
      // Must have a name
      if (!listing.product.name || listing.product.name === 'Unknown') {
        logger.debug('Filtering out listing with no name', { id: listing.source.id });
        return false;
      }

      // Must have a valid price
      if (typeof listing.listing.price !== 'number' || listing.listing.price <= 0) {
        logger.debug('Filtering out listing with invalid price', { id: listing.source.id });
        return false;
      }

      // Must have a URL
      if (!listing.source.url) {
        logger.debug('Filtering out listing with no URL', { id: listing.source.id });
        return false;
      }

      return true;
    });
  }
}

