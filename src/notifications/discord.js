import { logger } from '../utils/logger.js';
import { NotificationError } from '../utils/errors.js';

export class DiscordNotifier {
  async send(listings, config = {}) {
    const { discordWebhookUrl } = config;
    const safeListings = Array.isArray(listings) ? listings : [];

    if (!discordWebhookUrl) {
      logger.debug('No Discord webhook configured, skipping Discord notification');
      return;
    }

    const lines = safeListings.slice(0, 10).map((l) => {
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
      return `• ${name} (${platform}) - ${price} ${url}`;
    });

    const payload = {
      content:
        safeListings.length === 0
          ? 'No new listings.'
          : `New sneaker listings: ${safeListings.length}\n${lines.join('\n')}`,
    };

    try {
      const res = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Discord webhook HTTP ${res.status}`);
      }
    } catch (error) {
      throw new NotificationError('discord', error.message, error);
    }
  }
}
