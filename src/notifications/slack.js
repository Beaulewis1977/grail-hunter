import { logger } from '../utils/logger.js';
import { NotificationError } from '../utils/errors.js';

export class SlackNotifier {
  async send(listings, config = {}) {
    const { slackWebhookUrl } = config;
    const safeListings = Array.isArray(listings) ? listings : [];

    if (!slackWebhookUrl) {
      logger.debug('No Slack webhook configured, skipping Slack notification');
      return;
    }

    const textLines = safeListings.slice(0, 10).map((l) => {
      const name = l.product?.name || 'Unknown';
      const price = l.listing?.price ? `$${l.listing.price}` : 'N/A';
      const platform = l.source?.platform || 'unknown';
      const url = l.source?.url || '';
      return `• ${name} (${platform}) - ${price} ${url}`;
    });

    const payload = {
      text:
        safeListings.length === 0
          ? 'No new listings.'
          : `New sneaker listings: ${safeListings.length}\n${textLines.join('\n')}`,
    };

    try {
      const res = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Slack webhook HTTP ${res.status}`);
      }
    } catch (error) {
      throw new NotificationError('slack', error.message, error);
    }
  }
}
