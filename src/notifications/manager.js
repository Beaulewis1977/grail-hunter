/**
 * Notification Manager
 * Orchestrates multi-channel notifications
 */

import { WebhookNotifier } from './webhook.js';
import { DatasetNotifier } from './dataset.js';
import { SlackNotifier } from './slack.js';
import { DiscordNotifier } from './discord.js';
import { EmailNotifier } from './email.js';
import { SmsNotifier } from './sms.js';
import { logger } from '../utils/logger.js';

export class NotificationManager {
  constructor() {
    this.webhookNotifier = new WebhookNotifier();
    this.datasetNotifier = new DatasetNotifier();
    this.slackNotifier = new SlackNotifier();
    this.discordNotifier = new DiscordNotifier();
    this.emailNotifier = new EmailNotifier();
    this.smsNotifier = new SmsNotifier();
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

    if (config.slackWebhookUrl) {
      try {
        await this.slackNotifier.send(listings, config);
        results.channels.push({ channel: 'slack', status: 'success' });
      } catch (error) {
        results.success = false;
        results.errors.push({ channel: 'slack', error: error.message });
        logger.warn('Slack notification failed (non-critical)', { error: error.message });
      }
    }

    if (config.discordWebhookUrl) {
      try {
        await this.discordNotifier.send(listings, config);
        results.channels.push({ channel: 'discord', status: 'success' });
      } catch (error) {
        results.success = false;
        results.errors.push({ channel: 'discord', error: error.message });
        logger.warn('Discord notification failed (non-critical)', { error: error.message });
      }
    }

    if (config.emailWebhookUrl) {
      try {
        await this.emailNotifier.send(listings, config);
        results.channels.push({ channel: 'email', status: 'success' });
      } catch (error) {
        results.success = false;
        results.errors.push({ channel: 'email', error: error.message });
        logger.warn('Email notification failed (non-critical)', { error: error.message });
      }
    }

    if (config.smsWebhookUrl) {
      try {
        await this.smsNotifier.send(listings, config);
        results.channels.push({ channel: 'sms', status: 'success' });
      } catch (error) {
        results.success = false;
        results.errors.push({ channel: 'sms', error: error.message });
        logger.warn('SMS notification failed (non-critical)', { error: error.message });
      }
    }

    logger.info('Notification delivery complete', {
      success: results.success,
      channels: results.channels.map((c) => c.channel).join(', '),
    });

    return results;
  }
}
