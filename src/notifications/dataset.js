/**
 * Dataset Notification Handler
 * Pushes listings to Apify dataset (always enabled)
 */

import { Actor } from 'apify';
import { logger } from '../utils/logger.js';
import { NotificationError } from '../utils/errors.js';

export class DatasetNotifier {
  /**
   * Push listings to Apify dataset
   * @param {Array} listings - Listings to save
   */
  async send(listings) {
    if (!Array.isArray(listings) || listings.length === 0) {
      logger.info('No listings to push to dataset', {
        isArray: Array.isArray(listings),
        type: typeof listings,
        length: listings?.length,
      });
      return;
    }

    try {
      logger.info(`Pushing ${listings.length} listings to dataset`);

      // TODO Phase 3: Use dealScore.dealQuality for notification prioritization
      // TODO Phase 3: Include priceChange.hasDrop in alert conditions

      await Actor.pushData(listings);

      logger.info('Listings successfully saved to dataset');
    } catch (error) {
      logger.error('Dataset push failed', { error: error.message });
      throw new NotificationError('dataset', error.message, error);
    }
  }
}
