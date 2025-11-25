import { logger } from '../utils/logger.js';
import { NotificationError } from '../utils/errors.js';

/**
 * EmailNotifier
 * Uses a user-provided webhook (e.g., SendGrid/Twilio Functions/Zapier) to fan out email.
 */
export class EmailNotifier {
  async send(listings, config = {}) {
    const { emailWebhookUrl, emailRecipients, emailSubject = 'Grail Hunter Alerts' } = config;
    const safeListings = Array.isArray(listings) ? listings : [];

    if (!emailWebhookUrl) {
      logger.debug('No email webhook configured, skipping email notification');
      return;
    }

    const payload = {
      subject: emailSubject,
      recipients: Array.isArray(emailRecipients) ? emailRecipients : [],
      total: safeListings.length,
      listings: safeListings.slice(0, 50), // cap payload size
    };

    try {
      const res = await fetch(emailWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Email webhook HTTP ${res.status}`);
      }
    } catch (error) {
      throw new NotificationError('email', error.message, error);
    }
  }
}
