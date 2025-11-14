/**
 * Tests for DealScorer
 */

import { jest } from '@jest/globals';
import { DealScorer } from '../../src/modules/deal-scorer.js';

const mockKvStore = {
  getValue: jest.fn(),
  setValue: jest.fn(),
  getKeys: jest.fn(),
  delete: jest.fn(),
};

const mockActor = {
  openKeyValueStore: jest.fn().mockResolvedValue(mockKvStore),
};

global.Actor = mockActor;

describe('DealScorer', () => {
  let dealScorer;

  beforeEach(() => {
    jest.clearAllMocks();
    dealScorer = new DealScorer({
      dealScoreThreshold: 10,
      excellentDealThreshold: 30,
      marketValueOverrides: {
        'Air Jordan 1 Chicago': 2500,
      },
    });
  });

  describe('initialize', () => {
    it('should load market values successfully', async () => {
      await dealScorer.initialize();

      expect(dealScorer.kvStore).toBeDefined();
      expect(dealScorer.marketValues).toBeDefined();
      expect(dealScorer.marketValues.sneakers).toBeInstanceOf(Array);
      expect(dealScorer.marketValues.sneakers.length).toBeGreaterThan(0);
    });
  });

  describe('calculateDealQuality', () => {
    it('should return "excellent" for savings >= 30%', () => {
      expect(dealScorer.calculateDealQuality(35)).toBe('excellent');
    });

    it('should return "good" for savings >= 20% and < 30%', () => {
      expect(dealScorer.calculateDealQuality(25)).toBe('good');
    });

    it('should return "fair" for savings >= 10% and < 20%', () => {
      expect(dealScorer.calculateDealQuality(15)).toBe('fair');
    });

    it('should return "market" for savings < 10%', () => {
      expect(dealScorer.calculateDealQuality(5)).toBe('market');
    });
  });

  describe('scoreListing', () => {
    beforeEach(async () => {
      await dealScorer.initialize();
    });

    it('should score a listing below market value', async () => {
      const listing = {
        product: {
          name: 'Air Jordan 1 Chicago',
          model: 'Air Jordan 1',
          colorway: 'Chicago',
        },
        listing: {
          price: 1750,
        },
      };

      const scored = await dealScorer.scoreListing(listing);

      expect(scored.metadata.dealScore.isBelowMarket).toBe(true);
      expect(scored.metadata.dealScore.marketValue).toBe(2500);
      expect(scored.metadata.dealScore.savingsAmount).toBe(750);
      expect(scored.metadata.dealScore.dealQuality).toBe('excellent');
    });

    it('should not flag listing above market value as deal', async () => {
      const listing = {
        product: {
          name: 'Air Jordan 1 Chicago',
          model: 'Air Jordan 1',
          colorway: 'Chicago',
        },
        listing: {
          price: 3000,
        },
      };

      const scored = await dealScorer.scoreListing(listing);

      expect(scored.metadata.dealScore.isBelowMarket).toBe(false);
      expect(scored.metadata.dealScore.savingsPercentage).toBeNull();
    });

    it('should return default score when no market value found', async () => {
      const listing = {
        product: {
          name: 'Unknown Sneaker Model XYZ',
          model: 'Unknown Model',
          colorway: 'Random',
        },
        listing: {
          price: 100,
        },
      };

      const scored = await dealScorer.scoreListing(listing);

      expect(scored.metadata.dealScore.isBelowMarket).toBe(false);
      expect(scored.metadata.dealScore.marketValue).toBeNull();
    });
  });

  describe('scoreListings', () => {
    beforeEach(async () => {
      await dealScorer.initialize();
    });

    it('should score multiple listings', async () => {
      const listings = [
        {
          product: { name: 'Nike Dunk Low Panda', model: 'Dunk Low', colorway: 'Panda' },
          listing: { price: 200 },
        },
        {
          product: { name: 'Air Jordan 1 Chicago', model: 'Air Jordan 1', colorway: 'Chicago' },
          listing: { price: 1500 },
        },
      ];

      const scored = await dealScorer.scoreListings(listings);

      expect(scored).toHaveLength(2);
      expect(scored[1].metadata.dealScore.isBelowMarket).toBe(true);
    });

    it('should handle empty array gracefully', async () => {
      const scored = await dealScorer.scoreListings([]);
      expect(scored).toEqual([]);
    });
  });

  describe('getStatistics', () => {
    it('should calculate deal statistics', () => {
      const listings = [
        {
          metadata: {
            dealScore: { isBelowMarket: true, dealQuality: 'excellent' },
          },
        },
        {
          metadata: {
            dealScore: { isBelowMarket: true, dealQuality: 'good' },
          },
        },
        {
          metadata: {
            dealScore: { isBelowMarket: false, dealQuality: null },
          },
        },
      ];

      const stats = dealScorer.getStatistics(listings);

      expect(stats.total).toBe(3);
      expect(stats.deals).toBe(2);
      expect(stats.excellent).toBe(1);
      expect(stats.good).toBe(1);
    });
  });
});
