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
    const {
      size,
      priceRange,
      condition,
      authenticatedOnly,
      requireOGAll,
      excludeAuctions,
      minSellerRating,
      minSellerReviewCount,
    } = filters;

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

    // Phase 3.x: Advanced filters
    if (authenticatedOnly) {
      filtered = this.filterByAuthentication(filtered, authenticatedOnly);
    }

    if (requireOGAll) {
      filtered = this.filterByOGAll(filtered, requireOGAll);
    }

    if (excludeAuctions) {
      filtered = this.filterByListingType(filtered, excludeAuctions);
    }

    if (minSellerRating || minSellerReviewCount) {
      filtered = this.filterBySellerQuality(filtered, {
        minRating: minSellerRating,
        minReviewCount: minSellerReviewCount,
      });
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

    return listings.filter(({ listing: listingData = {} }) => {
      const { price } = listingData;

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

    return listings.filter(({ listing: listingData = {} }) => {
      const { condition } = listingData;
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

  /**
   * Filter by authentication status (Phase 3.x)
   * @param {Array} listings - Normalized listings
   * @param {boolean} authenticatedOnly - Require authenticated listings
   * @returns {Array} Filtered listings
   */
  filterByAuthentication(listings, authenticatedOnly) {
    if (!authenticatedOnly) return listings;

    return listings.filter((listing) => {
      const isAuthenticated =
        listing.source.is_authenticated ||
        listing.listing.tags?.includes('authenticated') ||
        listing.listing.tags?.includes('authenticity_guarantee');

      if (!isAuthenticated) {
        logger.debug('Filtering out non-authenticated listing', { id: listing.source.id });
      }

      return isAuthenticated;
    });
  }

  /**
   * Filter by OG All requirement (Phase 3.x)
   * @param {Array} listings - Normalized listings
   * @param {boolean} requireOGAll - Require original box/accessories
   * @returns {Array} Filtered listings
   */
  filterByOGAll(listings, requireOGAll) {
    if (!requireOGAll) return listings;

    return listings.filter((listing) => {
      const hasOGAll =
        listing.listing.tags?.includes('og_all') || listing.listing.tags?.includes('og_box');

      if (!hasOGAll) {
        logger.debug('Filtering out listing without OG All', { id: listing.source.id });
      }

      return hasOGAll;
    });
  }

  /**
   * Filter by listing type (exclude auctions) (Phase 3.x)
   * @param {Array} listings - Normalized listings
   * @param {boolean} excludeAuctions - Exclude auction listings
   * @returns {Array} Filtered listings
   */
  filterByListingType(listings, excludeAuctions) {
    if (!excludeAuctions) return listings;

    return listings.filter((listing) => {
      const isAuction =
        listing.listing.type === 'auction' || listing.listing.tags?.includes('auction');

      if (isAuction) {
        logger.debug('Filtering out auction listing', { id: listing.source.id });
      }

      return !isAuction;
    });
  }

  /**
   * Filter by seller quality (Phase 3.x)
   * @param {Array} listings - Normalized listings
   * @param {object} criteria - { minRating, minReviewCount }
   * @returns {Array} Filtered listings
   */
  filterBySellerQuality(listings, criteria) {
    const { minRating, minReviewCount } = criteria;

    return listings.filter((listing) => {
      const seller = listing.seller || {};

      // Check rating if specified
      if (minRating !== undefined && minRating > 0) {
        if (seller.rating === null || seller.rating === undefined) {
          logger.debug('Filtering out listing with no seller rating', { id: listing.source.id });
          return false; // No rating data
        }
        if (seller.rating < minRating) {
          logger.debug('Filtering out listing with low seller rating', {
            id: listing.source.id,
            rating: seller.rating,
            minRating,
          });
          return false;
        }
      }

      // Check review count if specified
      if (minReviewCount !== undefined && minReviewCount > 0) {
        if (seller.reviewCount === null || seller.reviewCount === undefined) {
          logger.debug('Filtering out listing with no seller review count', {
            id: listing.source.id,
          });
          return false;
        }
        if (seller.reviewCount < minReviewCount) {
          logger.debug('Filtering out listing with insufficient seller reviews', {
            id: listing.source.id,
            reviewCount: seller.reviewCount,
            minReviewCount,
          });
          return false;
        }
      }

      return true;
    });
  }
}
