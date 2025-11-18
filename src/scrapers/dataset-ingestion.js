/**
 * Dataset Ingestion Scraper
 * Pattern C: "Bring Your Own Data" for GOAT/StockX when scraping is blocked
 * Part of Phase 4.2: GOAT & StockX Hybrid Intelligence Layers
 *
 * Allows users to provide GOAT/StockX-like data via Apify datasets as a safer
 * alternative to direct scraping.
 */

import { Actor } from 'apify';
import { BaseScraper } from './base.js';
import { logger } from '../utils/logger.js';
import { fetchAllDatasetItems } from '../utils/pagination.js';

export class DatasetIngestionScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.datasetId = config.datasetId;
    this.platformLabel = config.platformLabel || config.platform || config.name;
    this.targetPlatform = config.platform; // 'goat' or 'stockx'
  }

  /**
   * Ingest listings from user-provided dataset
   * @param {object} _searchParams - Search parameters (unused for ingestion)
   * @returns {Promise<Array>} Raw listings from dataset
   */
  async scrape(_searchParams) {
    if (!this.datasetId) {
      logger.error('Dataset ingestion requires datasetId configuration');
      return [];
    }

    logger.info('Starting dataset ingestion', {
      datasetId: this.datasetId,
      platform: this.targetPlatform,
      platformLabel: this.platformLabel,
    });

    try {
      // Open the dataset provided by the user
      const dataset = await Actor.apifyClient.dataset(this.datasetId);

      if (!dataset) {
        logger.error('Dataset not found or inaccessible', { datasetId: this.datasetId });
        return [];
      }

      // Fetch all items from the dataset with pagination and validation
      const allItems = await fetchAllDatasetItems(this.datasetId, {
        filter: (item) => this.validateIngestionRecord(item),
      });

      logger.info(`Ingested ${allItems.length} listings from dataset`, {
        datasetId: this.datasetId,
        platform: this.targetPlatform,
        totalFetched: allItems.length,
      });

      // Enrich items with platform metadata for normalization
      return allItems.map((item) => ({
        ...item,
        _ingestionSource: {
          datasetId: this.datasetId,
          platform: this.targetPlatform,
          platformLabel: this.platformLabel,
          ingestedAt: new Date().toISOString(),
        },
      }));
    } catch (error) {
      logger.error('Dataset ingestion failed', {
        error: error.message,
        datasetId: this.datasetId,
        platform: this.targetPlatform,
      });

      // Return empty array to allow graceful degradation
      return [];
    }
  }

  /**
   * Validate ingestion record has minimum required fields
   * @param {object} record - Record from dataset
   * @returns {boolean} True if valid
   */
  validateIngestionRecord(record) {
    // Required fields for ingestion
    const hasName = Boolean(record.name || record.title || record.productName);
    const hasPrice = Boolean(
      typeof record.price === 'number' || typeof record.lowestPrice === 'number'
    );

    if (!hasName || !hasPrice) {
      logger.warn('Invalid ingestion record - missing required fields', {
        hasName,
        hasPrice,
        record: { name: record.name, price: record.price },
      });
      return false;
    }

    return true;
  }

  /**
   * Build search URLs (not applicable for dataset ingestion)
   * @param {Array} _keywords - Search keywords (unused)
   * @returns {Array} Empty array
   */
  buildSearchUrls(_keywords) {
    // Dataset ingestion doesn't use search URLs
    return [];
  }

  /**
   * Validate dataset ingestion configuration
   */
  validate() {
    super.validate();

    if (!this.datasetId) {
      throw new Error('Dataset ingestion requires datasetId configuration');
    }

    if (!this.targetPlatform) {
      logger.warn('Dataset ingestion missing platform identifier - normalization may fail');
    }

    // Validate platform is supported for ingestion
    const supportedPlatforms = ['goat', 'stockx'];
    if (this.targetPlatform && !supportedPlatforms.includes(this.targetPlatform.toLowerCase())) {
      logger.warn(`Dataset ingestion platform '${this.targetPlatform}' not in recommended list`, {
        supported: supportedPlatforms,
      });
    }
  }
}
