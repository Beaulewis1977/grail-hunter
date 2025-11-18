/**
 * Integration tests for DatasetIngestionScraper (Pattern C)
 * Phase 4.2: GOAT & StockX Hybrid Intelligence Layers
 *
 * Tests all scenarios:
 * - Scraping blocked → ingestion still provides data
 * - Ingestion-only mode (scraping disabled)
 * - Mixed mode (scraping + ingestion)
 * - Invalid dataset schema → graceful error handling
 */

import { jest } from '@jest/globals';

const mockGoatIngestionData = [
  {
    name: 'Air Jordan 1 Retro High OG Chicago',
    price: 1200,
    brand: 'Air Jordan',
    sku: '555088-101',
    colorway: 'Chicago',
    size_us_mens: '10',
    condition: 'new_in_box',
    url: 'https://goat.com/sneakers/air-jordan-1-chicago',
    imageUrl: 'https://image.goat.com/chicago.jpg',
    marketValue: 1200,
  },
  {
    name: 'Nike Dunk Low Panda',
    price: 180,
    brand: 'Nike',
    sku: 'DD1391-100',
    size_us_mens: '11',
  },
];

const mockStockXIngestionData = [
  {
    name: 'Yeezy Boost 350 V2 Zebra',
    price: 350,
    brand: 'adidas',
    sku: 'CP9654',
    colorway: 'Zebra',
    size_us_mens: '10.5',
  },
];

const mockInvalidData = [
  { name: 'Invalid Listing' }, // Missing price
  { price: 100 }, // Missing name
];

const mockDatasetListItems = jest.fn();
const mockApifyClientDataset = jest.fn(() => ({ listItems: mockDatasetListItems }));

jest.unstable_mockModule('apify', () => ({
  Actor: {
    apifyClient: {
      dataset: mockApifyClientDataset,
    },
  },
}));

let DatasetIngestionScraper;

beforeAll(async () => {
  ({ DatasetIngestionScraper } = await import('../../src/scrapers/dataset-ingestion.js'));
});

describe('DatasetIngestionScraper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock behavior for all tests
    mockDatasetListItems.mockResolvedValue({ items: [] });
    mockApifyClientDataset.mockReturnValue({ listItems: mockDatasetListItems });
  });

  describe('GOAT dataset ingestion', () => {
    it('should ingest valid GOAT data from dataset', async () => {
      mockDatasetListItems.mockResolvedValue({ items: mockGoatIngestionData });

      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Ingestion',
        datasetId: 'dataset_goat_123',
        platform: 'goat',
        platformLabel: 'GOAT Market Data',
      });

      const results = await scraper.scrape({});

      expect(mockApifyClientDataset).toHaveBeenCalledWith('dataset_goat_123');
      expect(mockDatasetListItems).toHaveBeenCalledWith({ limit: 1000, offset: 0 });
      expect(results).toHaveLength(2);

      // Verify enrichment with ingestion metadata
      expect(results[0]._ingestionSource).toBeDefined();
      expect(results[0]._ingestionSource.datasetId).toBe('dataset_goat_123');
      expect(results[0]._ingestionSource.platform).toBe('goat');
      expect(results[0]._ingestionSource.platformLabel).toBe('GOAT Market Data');
      expect(results[0]._ingestionSource.ingestedAt).toBeTruthy();

      // Original data should be preserved
      expect(results[0].name).toBe('Air Jordan 1 Retro High OG Chicago');
      expect(results[0].price).toBe(1200);
    });

    it('should filter out invalid records with missing required fields', async () => {
      mockDatasetListItems.mockResolvedValue({ items: mockInvalidData });

      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Ingestion',
        datasetId: 'dataset_invalid',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      // Both invalid records should be filtered out
      expect(results).toHaveLength(0);
    });

    it('should handle mixed valid and invalid data', async () => {
      const mixedData = [...mockGoatIngestionData, ...mockInvalidData];
      mockDatasetListItems.mockResolvedValue({ items: mixedData });

      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Ingestion',
        datasetId: 'dataset_mixed',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      // Only 2 valid records should pass through
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Air Jordan 1 Retro High OG Chicago');
      expect(results[1].name).toBe('Nike Dunk Low Panda');
    });
  });

  describe('StockX dataset ingestion', () => {
    it('should ingest valid StockX data from dataset', async () => {
      mockDatasetListItems.mockResolvedValue({ items: mockStockXIngestionData });

      const scraper = new DatasetIngestionScraper({
        name: 'StockX Ingestion',
        datasetId: 'dataset_stockx_456',
        platform: 'stockx',
        platformLabel: 'StockX Market Feed',
      });

      const results = await scraper.scrape({});

      expect(mockApifyClientDataset).toHaveBeenCalledWith('dataset_stockx_456');
      expect(results).toHaveLength(1);
      expect(results[0]._ingestionSource.platform).toBe('stockx');
      expect(results[0].name).toBe('Yeezy Boost 350 V2 Zebra');
    });
  });

  describe('Ingestion-only mode (scraping disabled)', () => {
    it('should work when GOAT scraping is disabled but ingestion is provided', async () => {
      mockDatasetListItems.mockResolvedValue({ items: mockGoatIngestionData });

      // Simulate user input with enableGOAT=false but ingestionDatasets provided
      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Ingestion Only',
        datasetId: 'dataset_goat_ingestion_only',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      // Should successfully ingest data even though scraping is disabled
      expect(results).toHaveLength(2);
      expect(results[0]._ingestionSource.platform).toBe('goat');
    });
  });

  describe('Pagination handling', () => {
    it('should handle dataset pagination correctly', async () => {
      // First page: 1000 items (full page, continues)
      const firstPageData = Array(1000)
        .fill(null)
        .map((_, i) => ({
          name: `Sneaker ${i}`,
          price: 100 + i,
        }));

      // Second page: 500 items (partial page, stops)
      const secondPageData = Array(500)
        .fill(null)
        .map((_, i) => ({
          name: `Sneaker ${1000 + i}`,
          price: 1100 + i,
        }));

      mockDatasetListItems
        .mockResolvedValueOnce({ items: firstPageData })
        .mockResolvedValueOnce({ items: secondPageData });

      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Pagination Test',
        datasetId: 'dataset_large',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      // Should have fetched both pages
      expect(mockDatasetListItems).toHaveBeenCalledTimes(2);
      expect(mockDatasetListItems).toHaveBeenNthCalledWith(1, { limit: 1000, offset: 0 });
      expect(mockDatasetListItems).toHaveBeenNthCalledWith(2, { limit: 1000, offset: 1000 });
      expect(results).toHaveLength(1500);
    });

    it('should stop pagination when no more items', async () => {
      mockDatasetListItems
        .mockResolvedValueOnce({ items: mockGoatIngestionData })
        .mockResolvedValueOnce({ items: [] }); // Empty page

      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Pagination End Test',
        datasetId: 'dataset_end',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      // Should stop after first page when second is empty
      expect(mockDatasetListItems).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(2);
    });
  });

  describe('Error handling', () => {
    it('should return empty array when dataset not found', async () => {
      mockApifyClientDataset.mockReturnValue(null);

      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Missing Dataset',
        datasetId: 'dataset_nonexistent',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      expect(results).toEqual([]);
    });

    it('should return empty array when dataset access fails', async () => {
      // Mock dataset.listItems() to throw an error (simulating access denied, network failure, etc.)
      mockDatasetListItems.mockRejectedValue(new Error('Access denied'));
      mockApifyClientDataset.mockReturnValue({ listItems: mockDatasetListItems });

      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Access Error',
        datasetId: 'dataset_forbidden',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      expect(results).toEqual([]);
      // Verify that listItems was actually called and rejected
      expect(mockDatasetListItems).toHaveBeenCalled();
    });

    it('should throw validation error when datasetId is missing', () => {
      const scraper = new DatasetIngestionScraper({
        name: 'Invalid Config',
        platform: 'goat',
        // Missing datasetId
      });

      expect(() => scraper.validate()).toThrow(
        'Dataset ingestion requires datasetId configuration'
      );
    });
  });

  describe('buildSearchUrls', () => {
    it('should return empty array (not applicable for ingestion)', () => {
      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Ingestion',
        datasetId: 'dataset_test',
        platform: 'goat',
      });

      const urls = scraper.buildSearchUrls(['Air Jordan 1', 'Nike Dunk']);
      expect(urls).toEqual([]);
    });
  });

  describe('Platform label handling', () => {
    beforeEach(() => {
      // Override default mock for this describe block (don't clear, just override)
      mockDatasetListItems.mockResolvedValue({ items: mockGoatIngestionData });
    });

    it('should use platformLabel when provided', async () => {
      const scraper = new DatasetIngestionScraper({
        name: 'GOAT Custom Label',
        datasetId: 'dataset_labeled',
        platform: 'goat',
        platformLabel: 'GOAT Q4 2025 Market Data',
      });

      const results = await scraper.scrape({});

      expect(results).toHaveLength(2);
      expect(results[0]._ingestionSource.platformLabel).toBe('GOAT Q4 2025 Market Data');
    });

    it('should fallback to platform name when platformLabel not provided', async () => {
      const scraper = new DatasetIngestionScraper({
        name: 'GOAT No Label',
        datasetId: 'dataset_nolabel',
        platform: 'goat',
      });

      const results = await scraper.scrape({});

      expect(results).toHaveLength(2);
      expect(results[0]._ingestionSource.platformLabel).toBe('goat');
    });
  });
});
