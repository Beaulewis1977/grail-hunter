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
    this.seenHashes = new Map();
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
      this.seenHashes = new Map();

      for (const entry of storedHashes) {
        if (typeof entry === 'string') {
          this.seenHashes.set(entry, Date.now());
        } else if (entry && typeof entry === 'object' && entry.hash) {
          this.seenHashes.set(entry.hash, entry.lastSeen || Date.now());
        }
      }

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
    const safeListings = Array.isArray(listings) ? listings : [];
    const newListings = [];
    const previousState = new Map(this.seenHashes);
    const updatedHashes = new Map(this.seenHashes);

    for (const listing of safeListings) {
      const hash = this.generateHash(listing);
      const seenBefore = updatedHashes.has(hash);

      if (!seenBefore) {
        newListings.push(listing);
        logger.debug(
          `NEW LISTING: ${listing.product?.name ?? 'Unknown'} - $${listing.listing?.price ?? 'n/a'}`,
          {
            platform: listing.source?.platform,
            id: listing.source?.id,
          }
        );
      }

      updatedHashes.set(hash, Date.now());
    }

    this.seenHashes = this.enforceCapacity(updatedHashes);

    // Persist updated state with retry and rollback on failure
    await this.persistHashes(previousState);

    logger.info(`Found ${newListings.length} new listings out of ${safeListings.length} total`);

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

  enforceCapacity(hashMap) {
    if (hashMap.size <= this.maxStoredHashes) {
      return hashMap;
    }

    const sortedEntries = Array.from(hashMap.entries()).sort((a, b) => b[1] - a[1]);
    const trimmedEntries = sortedEntries.slice(0, this.maxStoredHashes);
    logger.warn(`Trimmed hash storage to ${this.maxStoredHashes} most recent entries`);
    return new Map(trimmedEntries);
  }

  serializeHashes() {
    return Array.from(this.seenHashes.entries()).map(([hash, lastSeen]) => ({ hash, lastSeen }));
  }

  async persistHashes(previousState) {
    const payload = this.serializeHashes();

    try {
      await this.kvStore.setValue(this.seenHashesKey, payload);
      return;
    } catch (error) {
      logger.warn('Failed to persist deduplication state, retrying with backoff', {
        error: error.message,
      });
      await Actor.sleep(500);
    }

    try {
      await this.kvStore.setValue(this.seenHashesKey, payload);
    } catch (finalError) {
      this.seenHashes = previousState;
      logger.error('Deduplication state persistence failed; reverted to previous snapshot', {
        error: finalError.message,
      });
      throw finalError;
    }
  }
}
