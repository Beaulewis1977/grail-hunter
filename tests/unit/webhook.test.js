/**
 * Unit tests for webhook notifier
 */

import { jest } from '@jest/globals';
import { WebhookNotifier } from '../../src/notifications/webhook.js';
import { NotificationError } from '../../src/utils/errors.js';

let fetchSpy;

describe('WebhookNotifier', () => {
  let notifier;

  beforeAll(() => {
    if (typeof global.fetch !== 'function') {
      global.fetch = async () => ({ ok: true, status: 200 });
    }
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  beforeEach(() => {
    notifier = new WebhookNotifier();
    fetchSpy.mockReset();
  });

  describe('send', () => {
    it('should skip if no webhook URL provided', async () => {
      const listings = [{ product: { name: 'Test' }, listing: { price: 100 } }];

      await notifier.send(listings, {});

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should send webhook with correct payload', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const listings = [
        {
          product: { name: 'Air Jordan 1' },
          listing: { price: 750 },
          source: { platform: 'Grailed', url: 'https://example.com' },
        },
      ];

      await notifier.send(listings, {
        webhookUrl: 'https://webhook.site/test',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://webhook.site/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include HMAC signature if secret provided', async () => {
      fetchSpy.mockResolvedValue({ ok: true, status: 200 });

      const listings = [
        { product: { name: 'Test' }, listing: { price: 100 }, source: { platform: 'Grailed' } },
      ];

      await notifier.send(listings, {
        webhookUrl: 'https://webhook.site/test',
        webhookSecret: 'my-secret',
      });

      const [, { headers }] = fetchSpy.mock.calls[0];

      expect(headers['X-Grail-Hunter-Signature']).toBeDefined();
      expect(typeof headers['X-Grail-Hunter-Signature']).toBe('string');
    });

    it('should throw NotificationError on failure', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const listings = [
        { product: { name: 'Test' }, listing: { price: 100 }, source: { platform: 'Grailed' } },
      ];

      await expect(
        notifier.send(listings, { webhookUrl: 'https://webhook.site/test' })
      ).rejects.toThrow(NotificationError);
    });
  });

  describe('buildPayload', () => {
    it('should build correct payload structure', () => {
      const listings = [
        {
          product: { name: 'Air Jordan 1' },
          listing: { price: 750 },
          source: { platform: 'Grailed', url: 'https://example.com/1' },
        },
        {
          product: { name: 'Yeezy 350' },
          listing: { price: 450 },
          source: { platform: 'Grailed', url: 'https://example.com/2' },
        },
      ];

      const payload = notifier.buildPayload(listings);

      expect(payload.event).toBe('new_listings_found');
      expect(payload.summary.totalNewListings).toBe(2);
      expect(payload.summary.averagePrice).toBe(600);
      expect(payload.summary.bestDeal.price).toBe(450);
      expect(payload.listings).toHaveLength(2);
    });
  });
});
