/**
 * Unit tests for notification manager
 */

import { jest } from '@jest/globals';
import { NotificationManager } from '../../src/notifications/manager.js';

// Mock notifiers
const mockWebhookSend = jest.fn(() => Promise.resolve());
const mockDatasetSend = jest.fn(() => Promise.resolve());
const mockSlackSend = jest.fn(() => Promise.resolve());
const mockDiscordSend = jest.fn(() => Promise.resolve());
const mockEmailSend = jest.fn(() => Promise.resolve());
const mockSmsSend = jest.fn(() => Promise.resolve());

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

jest.unstable_mockModule('../../src/notifications/slack.js', () => ({
  SlackNotifier: jest.fn(() => ({
    send: mockSlackSend,
  })),
}));

jest.unstable_mockModule('../../src/notifications/discord.js', () => ({
  DiscordNotifier: jest.fn(() => ({
    send: mockDiscordSend,
  })),
}));

jest.unstable_mockModule('../../src/notifications/email.js', () => ({
  EmailNotifier: jest.fn(() => ({
    send: mockEmailSend,
  })),
}));

jest.unstable_mockModule('../../src/notifications/sms.js', () => ({
  SmsNotifier: jest.fn(() => ({
    send: mockSmsSend,
  })),
}));

describe('NotificationManager', () => {
  let manager;

  beforeEach(() => {
    manager = new NotificationManager();
    manager.webhookNotifier = { send: mockWebhookSend };
    manager.datasetNotifier = { send: mockDatasetSend };
    manager.slackNotifier = { send: mockSlackSend };
    manager.discordNotifier = { send: mockDiscordSend };
    manager.emailNotifier = { send: mockEmailSend };
    manager.smsNotifier = { send: mockSmsSend };
    mockWebhookSend.mockClear();
    mockDatasetSend.mockClear();
    mockSlackSend.mockClear();
    mockDiscordSend.mockClear();
    mockEmailSend.mockClear();
    mockSmsSend.mockClear();
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

  it('should call optional channels when configured', async () => {
    const listings = [{ product: { name: 'Test' }, listing: { price: 100 } }];
    const config = {
      slackWebhookUrl: 'https://hooks.slack.com/services/test',
      discordWebhookUrl: 'https://discord.com/api/webhooks/test',
      emailWebhookUrl: 'https://email.example.com/webhook',
      smsWebhookUrl: 'https://sms.example.com/webhook',
    };

    await manager.send(listings, config);

    expect(mockSlackSend).toHaveBeenCalled();
    expect(mockDiscordSend).toHaveBeenCalled();
    expect(mockEmailSend).toHaveBeenCalled();
    expect(mockSmsSend).toHaveBeenCalled();
  });
});
