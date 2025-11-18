/**
 * Unit tests for src/index.js (Actor entrypoint)
 * Uses extensive mocking to exercise success and failure flows
 */

import { jest } from '@jest/globals';
import { ValidationError } from '../../src/utils/errors.js';

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

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule('../../src/utils/logger.js', () => ({ logger: mockLogger }));

const mockValidateInput = jest.fn();
const mockNormalizeInput = jest.fn();

jest.unstable_mockModule('../../src/utils/validators.js', () => ({
  validateInput: mockValidateInput,
  normalizeInput: mockNormalizeInput,
}));

const mockScrape = jest.fn();

jest.unstable_mockModule('../../src/scrapers/manager.js', () => ({
  ScraperManager: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
  })),
}));

const mockNormalizeListing = jest.fn();

jest.unstable_mockModule('../../src/core/normalizer.js', () => ({
  DataNormalizer: jest.fn().mockImplementation(() => ({
    normalize: mockNormalizeListing,
  })),
}));

const mockParseListing = jest.fn();

jest.unstable_mockModule('../../src/core/parser.js', () => ({
  SneakerParser: jest.fn().mockImplementation(() => ({
    parse: mockParseListing,
  })),
}));

const mockFilterListings = jest.fn();

jest.unstable_mockModule('../../src/core/filter.js', () => ({
  ListingFilter: jest.fn().mockImplementation(() => ({
    filter: mockFilterListings,
  })),
}));

const mockDedupInitialize = jest.fn();
const mockDedupFindNew = jest.fn();
const mockDedupStats = jest.fn();

jest.unstable_mockModule('../../src/core/deduplicator.js', () => ({
  DeduplicationEngine: jest.fn().mockImplementation(() => ({
    initialize: mockDedupInitialize,
    findNewListings: mockDedupFindNew,
    getStats: mockDedupStats,
  })),
}));

const mockSendNotifications = jest.fn();

jest.unstable_mockModule('../../src/notifications/manager.js', () => ({
  NotificationManager: jest.fn().mockImplementation(() => ({
    send: mockSendNotifications,
  })),
}));

await import('../../src/index.js');

describe('Actor main entrypoint', () => {
  const rawInput = { keywords: ['AJ1'] };
  const normalizedInput = {
    platform: 'grailed',
    keywords: ['Air Jordan 1'],
    size: '10',
    priceRange: { min: 100, max: 500 },
    condition: 'used_good',
    maxResults: 25,
    proxyConfig: { useApifyProxy: true },
    notificationConfig: { webhookUrl: 'https://example.com' },
  };
  const rawListings = [{ id: 'raw-1' }, { id: 'raw-2' }];
  const normalizedListing = { id: 'normalized', listing: {} };
  const parsedListing = { id: 'parsed', listing: {} };
  const filteredListings = [{ id: 'filtered' }];
  const newListings = [{ id: 'new' }];
  const dedupStats = { totalSeenListings: 1, maxCapacity: 10000, utilizationPercent: '0.1' };
  const notificationResult = { delivered: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenKeyValueStore.mockResolvedValue({ setValue: mockStoreSetValue });
    mockNormalizeInput.mockReturnValue(normalizedInput);
    mockScrape.mockResolvedValue(rawListings);
    mockNormalizeListing.mockReturnValue(normalizedListing);
    mockParseListing.mockReturnValue(parsedListing);
    mockFilterListings.mockReturnValue(filteredListings);
    mockDedupInitialize.mockResolvedValue();
    mockDedupFindNew.mockResolvedValue(newListings);
    mockDedupStats.mockReturnValue(dedupStats);
    mockSendNotifications.mockResolvedValue(notificationResult);
  });

  it('runs multi-platform and ignores failed platform results', async () => {
    mockGetInput.mockResolvedValueOnce(rawInput);

    // Provide multi-platform in normalized input
    const multi = { ...normalizedInput, platforms: ['grailed', 'ebay'], excludeAuctions: true };
    mockNormalizeInput.mockReturnValueOnce(multi);

    // First platform resolves, second rejects
    mockScrape.mockResolvedValueOnce(rawListings).mockRejectedValueOnce(new Error('ebay failed'));

    await actorMainHandler();

    // Called twice for two platforms
    expect(mockScrape).toHaveBeenCalledTimes(2);
    expect(mockScrape).toHaveBeenNthCalledWith(
      1,
      'grailed',
      expect.objectContaining({ keywords: multi.keywords, excludeAuctions: true })
    );
    expect(mockScrape).toHaveBeenNthCalledWith(
      2,
      'ebay',
      expect.objectContaining({ keywords: multi.keywords, excludeAuctions: true })
    );

    // Stats should include platforms and count only fulfilled raw listings
    expect(mockStoreSetValue).toHaveBeenCalledWith(
      'last_run_stats',
      expect.objectContaining({
        platforms: multi.platforms,
        totalScraped: rawListings.length,
      })
    );
  });

  it('runs the happy path and stores run stats', async () => {
    mockGetInput.mockResolvedValueOnce(rawInput);

    await actorMainHandler();

    expect(mockValidateInput).toHaveBeenCalledWith(rawInput);
    expect(mockNormalizeInput).toHaveBeenCalledWith(rawInput);
    expect(mockScrape).toHaveBeenCalledWith(
      'grailed',
      expect.objectContaining({
        keywords: normalizedInput.keywords,
        maxResults: normalizedInput.maxResults,
        proxyConfig: normalizedInput.proxyConfig,
      })
    );
    expect(mockFilterListings).toHaveBeenCalledWith(expect.any(Array), {
      size: normalizedInput.size,
      priceRange: normalizedInput.priceRange,
      condition: normalizedInput.condition,
    });
    expect(mockDedupInitialize).toHaveBeenCalledTimes(1);
    expect(mockDedupFindNew).toHaveBeenCalledWith(filteredListings);
    expect(mockSendNotifications).toHaveBeenCalledWith(
      newListings,
      normalizedInput.notificationConfig
    );
    expect(mockStoreSetValue).toHaveBeenCalledWith(
      'last_run_stats',
      expect.objectContaining({
        platforms: [normalizedInput.platform],
        totalScraped: rawListings.length,
        afterFiltering: filteredListings.length,
        newListings: newListings.length,
        notifications: notificationResult,
        deduplication: expect.objectContaining({
          ...dedupStats,
          newHashesAdded: newListings.length,
        }),
      })
    );
    // Phase 3: KV store opened twice - once for deduplicator, once for deal scorer
    // (stats storage reuses the same instance)
    expect(mockOpenKeyValueStore).toHaveBeenCalledTimes(2);
  });

  it('throws ValidationError when no input is provided and records last_error', async () => {
    mockGetInput.mockResolvedValueOnce(null);

    await expect(actorMainHandler()).rejects.toThrow(ValidationError);

    expect(mockValidateInput).not.toHaveBeenCalled();
    expect(mockStoreSetValue).toHaveBeenCalledWith(
      'last_error',
      expect.objectContaining({
        error: expect.stringContaining('No input provided'),
        type: expect.stringContaining('VALIDATION'),
      })
    );
  });
});
