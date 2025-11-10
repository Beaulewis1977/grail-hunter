
/**
 * Webhook Notification Handler
 * Sends POST notifications to user-defined webhook URLs
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { NotificationError } from '../utils/errors.js';

export class WebhookNotifier {
  /**
   * Send webhook notification
   * @param {Array} listings - New listings to notify about
   * @param {object} config - Webhook configuration
   */
  async send(listings, config) {
    const { webhookUrl, webhookSecret } = config;

    if (!webhookUrl) {
      logger.debug('No webhook URL configured, skipping webhook notification');
      return;
    }

    try {
      const payload = this.buildPayload(listings);
      const headers = this.buildHeaders(payload, webhookSecret);

      logger.info(`Sending webhook notification to ${webhookUrl}`, {
        listingCount: listings.length,
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info('Webhook notification sent successfully', {
        status: response.status,
      });
    } catch (error) {
      logger.error('Webhook notification failed', { error: error.message });
      throw new NotificationError('webhook', error.message, error);
    }
  }

  /**
   * Build webhook payload
   */
  buildPayload(listings) {
    return {
      event: 'new_listings_found',
      timestamp: new Date().toISOString(),
      runId: process.env.APIFY_ACT_RUN_ID || 'local',
      summary: {
        totalNewListings: listings.length,
        platformBreakdown: this.getPlatformBreakdown(listings),
        averagePrice: this.calculateAveragePrice(listings),
        bestDeal: this.findBestDeal(listings),
      },
      listings,
    };
  }

  /**
   * Build HTTP headers with HMAC signature
   */
  buildHeaders(payload, secret) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Grail-Hunter-Event': 'new_listings_found',
      'X-Grail-Hunter-Timestamp': Date.now().toString(),
    };

    if (secret) {
      const signature = this.generateSignature(payload, secret);
      headers['X-Grail-Hunter-Signature'] = signature;
    }

    return headers;
  }

  /**
   * Generate HMAC-SHA256 signature
   */
  generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Get platform breakdown
   */
  getPlatformBreakdown(listings) {
    const breakdown = {};

    for (const listing of listings) {
      const platform = listing.source.platform;
      breakdown[platform] = (breakdown[platform] || 0) + 1;
    }

    return breakdown;
  }

  /**
   * Calculate average price
   */
  calculateAveragePrice(listings) {
    if (listings.length === 0) return 0;

    const total = listings.reduce((sum, l) => sum + l.listing.price, 0);
    return Math.round((total / listings.length) * 100) / 100;
  }

  /**
   * Find best deal (lowest price)
   */
  findBestDeal(listings) {
    if (listings.length === 0) return null;

    const sorted = [...listings].sort((a, b) => a.listing.price - b.listing.price);
    const best = sorted[0];

    return {
      productName: best.product.name,
      price: best.listing.price,
      url: best.source.url,
      platform: best.source.platform,
    };
  }
}

