/**
 * Deduplication Engine
 * Tracks seen listings and identifies new ones across runs
 */

import crypto from 'crypto';
import { Actor } from 'apify';
import { logger } from '../utils/logger.js';

export class DeduplicationEngine {
  constructor() {
    this.kvStore = null;
    this.seenHashes = new Set();
    this.seenHashesKey = 'seen_listing_hashes';
    this.maxStoredHashes = 10000; // Prevent unbounded growth
  }

  /**
   * Initialize the deduplication engine
   */
  async initialize() {
    this.kvStore = await Actor.openKeyValueStore();

    // Load previously seen hashes
    const storedHashes = await this.kvStore.getValue(this.seenHashesKey);

    if (storedHashes && Array.isArray(storedHashes)) {
      this.seenHashes = new Set(storedHashes);
      logger.info(`Loaded ${this.seenHashes.size} previously seen listings`);
    } else {
      logger.info('No previous listing history found, starting fresh');
    }
  }

  /**
   * Generate unique hash for a listing
   * @param {object} listing - Normalized listing
   * @returns {string} MD5 hash
   */
  generateHash(listing) {
    const uniqueString = `${listing.source.platform}:${listing.source.id}`;
    return crypto.createHash('md5').update(uniqueString).digest('hex');
  }

  /**
   * Find new listings (not seen before)
   * @param {Array} listings - All listings
   * @returns {Array} New listings only
   */
  async findNewListings(listings) {
    const newListings = [];
    const newHashes = new Set(this.seenHashes);

    for (const listing of listings) {
      const hash = this.generateHash(listing);

      if (!this.seenHashes.has(hash)) {
        newListings.push(listing);
        newHashes.add(hash);
        logger.debug(`NEW LISTING: ${listing.product.name} - $${listing.listing.price}`, {
          platform: listing.source.platform,
          id: listing.source.id,
        });
      }
    }

    // Limit the size of stored hashes (keep most recent)
    const hashArray = Array.from(newHashes);
    if (hashArray.length > this.maxStoredHashes) {
      const trimmed = hashArray.slice(-this.maxStoredHashes);
      this.seenHashes = new Set(trimmed);
      logger.warn(`Trimmed hash storage to ${this.maxStoredHashes} most recent entries`);
    } else {
      this.seenHashes = newHashes;
    }

    // Persist updated state
    await this.kvStore.setValue(this.seenHashesKey, Array.from(this.seenHashes));

    logger.info(`Found ${newListings.length} new listings out of ${listings.length} total`);

    return newListings;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalSeenListings: this.seenHashes.size,
      maxCapacity: this.maxStoredHashes,
      utilizationPercent: ((this.seenHashes.size / this.maxStoredHashes) * 100).toFixed(1),
    };
  }
}
