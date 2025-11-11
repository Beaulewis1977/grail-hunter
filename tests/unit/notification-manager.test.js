/**
 * Unit tests for notification manager
 */

import { jest } from '@jest/globals';
import { NotificationManager } from '../../src/notifications/manager.js';

// Mock notifiers
const mockWebhookSend = jest.fn(() => Promise.resolve());
const mockDatasetSend = jest.fn(() => Promise.resolve());

jest.unstable_mockModule('../../src/notifications/webhook.js', () => ({
  WebhookNotifier: jest.fn(() => ({
    send: mockWebhookSend,
  })),
}));

jest.unstable_mockModule('../../src/notifications/dataset.js', () => ({
  DatasetNotifier: jest.fn(() => ({
    send: mockDatasetSend,
  })),
}));

describe('NotificationManager', () => {
  let manager;

  beforeEach(() => {
    manager = new NotificationManager();
    manager.webhookNotifier = { send: mockWebhookSend };
    manager.datasetNotifier = { send: mockDatasetSend };
    mockWebhookSend.mockClear();
    mockDatasetSend.mockClear();
  });

  it('should send to dataset for all listings', async () => {
    const listings = [{ product: { name: 'Test' }, listing: { price: 100 } }];

    await manager.send(listings);

    expect(mockDatasetSend).toHaveBeenCalledWith(listings);
  });

  it('should send to webhook if URL is configured', async () => {
    const listings = [
      { product: { name: 'Test' }, listing: { price: 100 }, source: { platform: 'Grailed' } },
    ];

    const config = { webhookUrl: 'https://example.com/webhook' };

    await manager.send(listings, config);

    expect(mockWebhookSend).toHaveBeenCalledWith(listings, config);
    expect(mockDatasetSend).toHaveBeenCalledWith(listings);
  });

  it('should handle no listings gracefully', async () => {
    const result = await manager.send([]);

    expect(result.success).toBe(true);
    expect(result.listingCount).toBe(0);
  });

  it('should continue on webhook failure', async () => {
    mockWebhookSend.mockRejectedValue(new Error('Webhook failed'));

    const listings = [
      { product: { name: 'Test' }, listing: { price: 100 }, source: { platform: 'Grailed' } },
    ];

    const result = await manager.send(listings, { webhookUrl: 'https://example.com' });

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(mockDatasetSend).toHaveBeenCalled(); // Dataset still called
  });
});
