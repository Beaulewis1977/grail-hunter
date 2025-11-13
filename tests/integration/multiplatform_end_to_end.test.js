/**
 * Integration-style test for multi-platform orchestration in src/index.js
 * Mocks external boundaries but exercises the main flow and stats for two platforms.
 */

import { jest } from '@jest/globals';

let actorMainHandler;

const mockGetInput = jest.fn();
const mockOpenKeyValueStore = jest.fn();
const mockStoreSetValue = jest.fn();

jest.unstable_mockModule('apify', () => ({
  Actor: {
    main: (handler) => {
      actorMainHandler = handler;
    },
    getInput: mockGetInput,
    openKeyValueStore: mockOpenKeyValueStore,
  },
}));

// Keep validators mocked to provide normalized input for simplicity
const mockValidateInput = jest.fn();
const mockNormalizeInput = jest.fn();

jest.unstable_mockModule('../../src/utils/validators.js', () => ({
  validateInput: mockValidateInput,
  normalizeInput: mockNormalizeInput,
}));

// Mock scraper manager to return different results per platform
const mockScrape = jest.fn();

jest.unstable_mockModule('../../src/scrapers/manager.js', () => ({
  ScraperManager: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
  })),
}));

// Mock NotificationManager to avoid side effects
const mockSendNotifications = jest.fn();

jest.unstable_mockModule('../../src/notifications/manager.js', () => ({
  NotificationManager: jest.fn().mockImplementation(() => ({
    send: mockSendNotifications,
  })),
}));

await import('../../src/index.js');

describe('Multi-platform End-to-End Orchestration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenKeyValueStore.mockResolvedValue({
      getValue: jest.fn(async () => null),
      setValue: mockStoreSetValue,
    });
    mockSendNotifications.mockResolvedValue({ delivered: 2 });
  });

  it('aggregates results from grailed and ebay and records correct stats', async () => {
    const rawInput = { keywords: ['AJ1'] };
    mockGetInput.mockResolvedValueOnce(rawInput);

    const normalizedInput = {
      keywords: ['Air Jordan 1'],
      platforms: ['grailed', 'ebay'],
      platform: 'grailed',
      maxResults: 10,
      proxyConfig: { useApifyProxy: true },
      notificationConfig: {},
      excludeAuctions: true,
    };
    mockNormalizeInput.mockReturnValueOnce(normalizedInput);

    // First call: grailed raw listing (shape compatible with normalizeGrailed)
    // Second call: ebay raw listing (shape compatible with normalizeEbay)
    const grailedRaw = [
      {
        id: 'g1',
        title: 'Nike Air Jordan 1 Bred',
        price: '$200',
        size: '10',
        condition: 'Gently Used',
        url: 'https://grailed.com/listings/1',
      },
    ];

    const ebayRaw = [
      {
        itemNumber: 'e1',
        title: 'Air Jordan 1 Chicago',
        price: '$150',
        url: 'https://www.ebay.com/itm/1234567890',
        image: 'https://i.ebayimg.com/images/foo.jpg',
        seller: 'trusted_seller',
      },
    ];

    mockScrape
      .mockResolvedValueOnce(grailedRaw) // for 'grailed'
      .mockResolvedValueOnce(ebayRaw); // for 'ebay'

    await actorMainHandler();

    // Scrapers called for both platforms
    expect(mockScrape).toHaveBeenCalledTimes(2);

    // Stats saved include both platforms and total scraped = 2
    expect(mockStoreSetValue).toHaveBeenCalledWith(
      'last_run_stats',
      expect.objectContaining({
        platforms: ['grailed', 'ebay'],
        totalScraped: 2,
        notifications: { delivered: 2 },
      })
    );
  });
});
