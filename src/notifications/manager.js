/**
 * Notification Manager
 * Orchestrates multi-channel notifications
 */

import { WebhookNotifier } from './webhook.js';
import { DatasetNotifier } from './dataset.js';
import { logger } from '../utils/logger.js';

export class NotificationManager {
  constructor() {
    this.webhookNotifier = new WebhookNotifier();
    this.datasetNotifier = new DatasetNotifier();
  }

  /**
   * Send notifications through all configured channels
   * @param {Array} listings - Listings to notify about
   * @param {object} config - Notification configuration
   */
  async send(listings, config = {}) {
    if (!listings || listings.length === 0) {
      logger.info('No listings to notify about');
      return {
        success: true,
        channels: [],
        listingCount: 0,
      };
    }

    logger.info(`Sending notifications for ${listings.length} listings`);

    const results = {
      success: true,
      channels: [],
      listingCount: listings.length,
      errors: [],
    };

    // Always push to dataset (core feature)
    try {
      await this.datasetNotifier.send(listings);
      results.channels.push({ channel: 'dataset', status: 'success' });
    } catch (error) {
      results.success = false;
      results.errors.push({
        channel: 'dataset',
        error: error.message,
      });
      logger.error('Dataset notification failed (critical)', { error: error.message });
      // Bug Fix #6: Re-throw critical dataset failures instead of swallowing them
      throw error;
    }

    // Send webhook if configured
    if (config.webhookUrl) {
      try {
        await this.webhookNotifier.send(listings, config);
        results.channels.push({ channel: 'webhook', status: 'success' });
      } catch (error) {
        results.success = false;
        results.errors.push({
          channel: 'webhook',
          error: error.message,
        });
        logger.warn('Webhook notification failed (non-critical)', { error: error.message });
      }
    }

    // TODO: Add email notifications (future phase)
    // TODO: Add Slack notifications (future phase)
    // TODO: Add Discord notifications (future phase)

    logger.info('Notification delivery complete', {
      success: results.success,
      channels: results.channels.map((c) => c.channel).join(', '),
    });

    return results;
  }
}
