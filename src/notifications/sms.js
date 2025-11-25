import { logger } from '../utils/logger.js';
import { NotificationError } from '../utils/errors.js';

/**
 * SmsNotifier
 * Uses a user-provided webhook (e.g., Twilio, AWS SNS proxy) to send SMS.
 */
export class SmsNotifier {
  async send(listings, config = {}) {
    const { smsWebhookUrl, smsRecipients } = config;
    const safeListings = Array.isArray(listings) ? listings : [];

    if (!smsWebhookUrl) {
      logger.debug('No SMS webhook configured, skipping SMS notification');
      return;
    }

    const compact = safeListings.slice(0, 5).map((l) => {
      const name = l.product?.name || 'Unknown';
      const rawPrice = l.listing?.price;
      let price = 'N/A';
      if (rawPrice !== undefined && rawPrice !== null) {
        if (typeof rawPrice === 'string') {
          const trimmed = rawPrice.trim();
          price = trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
        } else if (typeof rawPrice === 'number') {
          price = `$${rawPrice}`;
        }
      }
      const platform = l.source?.platform || 'unknown';
      const url = l.source?.url || '';
      return `${name} (${platform}) - ${price} ${url}`;
    });

    const payload = {
      recipients: Array.isArray(smsRecipients) ? smsRecipients : [],
      total: safeListings.length,
      messages: compact,
    };

    try {
      const res = await fetch(smsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`SMS webhook HTTP ${res.status}`);
      }
    } catch (error) {
      throw new NotificationError('sms', error.message, error);
    }
  }
}
