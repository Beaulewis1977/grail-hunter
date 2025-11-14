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
  async send(listings, config = {}) {
    const { webhookUrl, webhookSecret, requestTimeoutMs = 10000 } = config || {};
    const normalizedListings = Array.isArray(listings) ? listings : [];

    if (!webhookUrl) {
      logger.debug('No webhook URL configured, skipping webhook notification');
      return;
    }

    const timestamp = new Date().toISOString();

    const controller = new AbortController();
    let timeoutId;

    try {
      const payload = this.buildPayload(normalizedListings, timestamp);
      const headers = this.buildHeaders(payload, webhookSecret, timestamp);

      logger.info(`Sending webhook notification to ${webhookUrl}`, {
        listingCount: normalizedListings.length,
      });

      timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info('Webhook notification sent successfully', {
        status: response.status,
      });
    } catch (error) {
      const isTimeout = error.name === 'AbortError';
      const message = isTimeout
        ? `Webhook request timed out after ${requestTimeoutMs}ms`
        : error.message;
      logger.error('Webhook notification failed', { error: message });
      throw new NotificationError('webhook', message, error);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Build webhook payload
   */
  buildPayload(listings, timestamp) {
    const safeListings = Array.isArray(listings) ? listings : [];

    return {
      event: 'new_listings_found',
      timestamp,
      runId: process.env.APIFY_ACT_RUN_ID || 'local',
      summary: {
        totalNewListings: safeListings.length,
        platformBreakdown: this.getPlatformBreakdown(safeListings),
        averagePrice: this.calculateAveragePrice(safeListings),
        bestDeal: this.findBestDeal(safeListings),
        dealHighlights: this.getDealHighlights(safeListings),
        priceDrops: this.getPriceDrops(safeListings),
      },
      listings: safeListings,
    };
  }

  /**
   * Build HTTP headers with HMAC signature
   */
  buildHeaders(payload, secret, timestamp) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Grail-Hunter-Event': 'new_listings_found',
      'X-Grail-Hunter-Timestamp': timestamp,
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
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Get platform breakdown
   */
  getPlatformBreakdown(listings) {
    const breakdown = {};
    const safeListings = Array.isArray(listings) ? listings : [];

    for (const listing of safeListings) {
      if (listing && typeof listing === 'object') {
        const platform =
          typeof listing?.source?.platform === 'string' && listing.source.platform.trim()
            ? listing.source.platform
            : 'unknown';
        breakdown[platform] = (breakdown[platform] || 0) + 1;
      }
    }

    return breakdown;
  }

  /**
   * Calculate average price
   */
  calculateAveragePrice(listings) {
    const safeListings = Array.isArray(listings) ? listings : [];
    const prices = safeListings
      .map((listing) => Number(listing?.listing?.price))
      .filter((price) => Number.isFinite(price));

    if (prices.length === 0) return 0;

    const total = prices.reduce((sum, price) => sum + price, 0);
    return Math.round((total / prices.length) * 100) / 100;
  }

  /**
   * Find best deal (lowest price)
   */
  findBestDeal(listings) {
    const safeListings = Array.isArray(listings) ? listings : [];
    const candidates = safeListings.filter((listing) => {
      if (!listing || typeof listing !== 'object') return false;
      const price = Number(listing?.listing?.price);
      return (
        Number.isFinite(price) &&
        listing.product?.name &&
        listing.source?.url &&
        listing.source?.platform
      );
    });

    if (candidates.length === 0) return null;

    const sorted = [...candidates].sort(
      (a, b) => Number(a.listing.price) - Number(b.listing.price)
    );
    const best = sorted[0];

    return {
      productName: best.product.name,
      price: Number(best.listing.price),
      url: best.source.url,
      platform: best.source.platform,
    };
  }

  getDealHighlights(listings) {
    const safeListings = Array.isArray(listings) ? listings : [];
    const deals = safeListings.filter((listing) => listing.metadata?.dealScore?.isBelowMarket);

    if (deals.length === 0) {
      return {
        totalDeals: 0,
        excellentDeals: 0,
        goodDeals: 0,
        fairDeals: 0,
        topDeals: [],
      };
    }

    const excellentDeals = deals.filter(
      (l) => l.metadata.dealScore.dealQuality === 'excellent'
    ).length;
    const goodDeals = deals.filter((l) => l.metadata.dealScore.dealQuality === 'good').length;
    const fairDeals = deals.filter((l) => l.metadata.dealScore.dealQuality === 'fair').length;

    const topDeals = deals
      .sort((a, b) => {
        const savingsA = a.metadata?.dealScore?.savingsPercentage || 0;
        const savingsB = b.metadata?.dealScore?.savingsPercentage || 0;
        return savingsB - savingsA;
      })
      .slice(0, 5)
      .map((listing) => ({
        productName: listing.product?.name,
        currentPrice: listing.listing?.price,
        marketValue: listing.metadata.dealScore.marketValue,
        savingsPercentage: listing.metadata.dealScore.savingsPercentage,
        savingsAmount: listing.metadata.dealScore.savingsAmount,
        dealQuality: listing.metadata.dealScore.dealQuality,
        url: listing.source?.url,
        platform: listing.source?.platform,
      }));

    return {
      totalDeals: deals.length,
      excellentDeals,
      goodDeals,
      fairDeals,
      topDeals,
    };
  }

  getPriceDrops(listings) {
    const safeListings = Array.isArray(listings) ? listings : [];
    const priceDrops = safeListings.filter((listing) => listing.metadata?.priceChange?.hasDrop);

    if (priceDrops.length === 0) {
      return {
        totalPriceDrops: 0,
        drops: [],
      };
    }

    const drops = priceDrops
      .sort((a, b) => {
        const dropA = a.metadata?.priceChange?.dropPercent || 0;
        const dropB = b.metadata?.priceChange?.dropPercent || 0;
        return dropB - dropA;
      })
      .slice(0, 5)
      .map((listing) => ({
        productName: listing.product?.name,
        previousPrice: listing.metadata.priceChange.previousPrice,
        currentPrice: listing.metadata.priceChange.currentPrice,
        dropPercent: listing.metadata.priceChange.dropPercent,
        url: listing.source?.url,
        platform: listing.source?.platform,
      }));

    return {
      totalPriceDrops: priceDrops.length,
      drops,
    };
  }
}
