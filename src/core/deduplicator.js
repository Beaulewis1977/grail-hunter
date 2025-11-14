/**
 * Deduplication Engine
 * Tracks seen listings and identifies new ones across runs
 */

import crypto from 'crypto';
import { Actor } from 'apify';
import { logger } from '../utils/logger.js';

export class DeduplicationEngine {
  constructor(config = {}) {
    this.kvStore = null;
    this.seenHashes = new Map();
    this.seenHashesKey = 'seen_listing_hashes';
    this.maxStoredHashes = 10000;
    this.priceDropThreshold = config.priceDropThreshold || 10;
    this.maxHistoryEntriesPerItem = config.maxHistoryEntriesPerItem || 50;
    this.historyRetentionDays = config.historyRetentionDays || 30;
  }

  /**
   * Initialize the deduplication engine
   */
  async initialize() {
    this.kvStore = await Actor.openKeyValueStore();

    await this.cleanupOldHistory();

    const storedHashes = await this.kvStore.getValue(this.seenHashesKey);

    if (storedHashes && Array.isArray(storedHashes)) {
      this.seenHashes = new Map();

      for (const entry of storedHashes) {
        if (typeof entry === 'string') {
          this.upsertMigratedHash(entry, Date.now());
        } else if (entry && typeof entry === 'object' && entry.hash) {
          this.upsertMigratedHash(entry.hash, entry.lastSeen || Date.now());
        }
      }

      logger.info(`Loaded ${this.seenHashes.size} previously seen listings`);

      if (this.migratedHashCount) {
        logger.info(
          `Dropped ${this.migratedHashCount} legacy MD5 hashes; dedupe history will repopulate under SHA-256 on subsequent runs`
        );
        await this.persistHashes(new Map(this.seenHashes));
      }
    } else {
      logger.info('No previous listing history found, starting fresh');
    }
  }

  /**
   * Generate unique hash for a listing
   * @param {object} listing - Normalized listing
   * @returns {string} SHA-256 hash
   */
  generateHash(listing) {
    const uniqueString = `${listing.source.platform}:${listing.source.id}`;
    return crypto.createHash('sha256').update(uniqueString).digest('hex');
  }

  /**
   * Find new listings (not seen before) and track price changes
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

      if (!listing.scrape || typeof listing.scrape !== 'object') {
        listing.scrape = {};
      }

      listing.scrape.isNew = !seenBefore;

      await this.trackPriceChange(listing, hash);

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

    await this.persistHashes(previousState);

    logger.info(`Found ${newListings.length} new listings out of ${safeListings.length} total`);

    return newListings;
  }

  migrateHash(hash) {
    if (!hash || typeof hash !== 'string') {
      return null;
    }

    const normalized = hash.trim().toLowerCase();

    if (normalized.length === 64 && /^[a-f0-9]+$/.test(normalized)) {
      return normalized;
    }

    if (normalized.length === 32 && /^[a-f0-9]+$/.test(normalized)) {
      // Legacy MD5 digests are intentionally skipped so the KV store is rebuilt with SHA-256 values
      this.migratedHashCount = (this.migratedHashCount || 0) + 1;
      return null;
    }

    logger.warn('Encountered unexpected hash format during deduplication migration', { hash });
    return null;
  }

  upsertMigratedHash(hash, timestamp) {
    const migrated = this.migrateHash(hash);
    if (!migrated) {
      return;
    }

    if (!this.seenHashes) {
      this.seenHashes = new Map();
    }

    this.seenHashes.set(migrated, timestamp);
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

  async trackPriceChange(listing, hash) {
    const currentPrice = listing.listing?.price || 0;
    const priceHistoryKey = `price_history_${hash}`;

    try {
      const storedHistory = await this.kvStore.getValue(priceHistoryKey);
      const priceHistory = storedHistory || [];

      const previousPrice =
        priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : null;

      if (!listing.metadata) {
        listing.metadata = {};
      }

      if (previousPrice && previousPrice !== currentPrice) {
        const dropAmount = previousPrice - currentPrice;
        const dropPercent = ((dropAmount / previousPrice) * 100).toFixed(1);
        const hasDrop = parseFloat(dropPercent) >= this.priceDropThreshold;

        listing.metadata.priceChange = {
          hasDrop,
          previousPrice,
          currentPrice,
          dropPercent: parseFloat(dropPercent),
        };

        if (hasDrop) {
          logger.info('Price drop detected', {
            product: listing.product?.name,
            previousPrice,
            currentPrice,
            dropPercent: `${dropPercent}%`,
          });
        }
      } else {
        listing.metadata.priceChange = {
          hasDrop: false,
          previousPrice,
          currentPrice,
          dropPercent: null,
        };
      }

      if (!previousPrice || previousPrice !== currentPrice) {
        priceHistory.push({
          price: currentPrice,
          date: new Date().toISOString(),
          timestamp: Date.now(),
        });

        const trimmedHistory = priceHistory.slice(-this.maxHistoryEntriesPerItem);

        await this.kvStore.setValue(priceHistoryKey, trimmedHistory);
      }
    } catch (error) {
      logger.warn('Failed to track price change', {
        error: error.message,
        listing: listing.product?.name,
      });

      if (!listing.metadata) {
        listing.metadata = {};
      }

      listing.metadata.priceChange = {
        hasDrop: false,
        previousPrice: null,
        currentPrice,
        dropPercent: null,
      };
    }
  }

  async cleanupOldHistory() {
    try {
      logger.info('Cleaning up old price history entries');

      const cutoffDate = Date.now() - this.historyRetentionDays * 24 * 60 * 60 * 1000;
      let cleanedCount = 0;

      const keys = await this.kvStore.getKeys();

      for (const key of keys) {
        if (key.startsWith('price_history_')) {
          const history = await this.kvStore.getValue(key);

          if (Array.isArray(history) && history.length > 0) {
            const lastEntry = history[history.length - 1];

            if (lastEntry.timestamp < cutoffDate) {
              await this.kvStore.delete(key);
              cleanedCount++;
            }
          }
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} old price history entries`);
      }
    } catch (error) {
      logger.warn('Failed to cleanup old price history', {
        error: error.message,
      });
    }
  }

  async getPriceHistory(hash) {
    try {
      const priceHistoryKey = `price_history_${hash}`;
      const history = await this.kvStore.getValue(priceHistoryKey);
      return history || [];
    } catch (error) {
      logger.warn('Failed to retrieve price history', { error: error.message });
      return [];
    }
  }
}
