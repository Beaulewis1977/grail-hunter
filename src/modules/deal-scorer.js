/**
 * Deal Scoring Module
 * Compares peer-to-peer listing prices against market values to identify deals
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Actor } from 'apify';
import { logger } from '../utils/logger.js';
import { fetchAllDatasetItems } from '../utils/pagination.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export class DealScorer {
  constructor(config = {}) {
    this.excellentDealThreshold = config.excellentDealThreshold || 30;
    this.goodDealThreshold = config.goodDealThreshold || 20;
    this.fairDealThreshold = config.fairDealThreshold || 10;
    this.cacheTimeout = config.cacheTimeout || 3600000;
    this.marketValues = null;
    this.userOverrides = config.marketValueOverrides || {};
    this.kvStore = null;
    this.marketDataSources = Array.isArray(config.marketDataSources)
      ? config.marketDataSources
      : [];
    this.cacheStoreId = config.cacheStoreId || null;
    this.liveMarketValues = {
      sku: new Map(),
      name: new Map(),
    };
  }

  /**
   * Round a number to one decimal place
   * @param {number} value - The value to round
   * @returns {number} Rounded value
   */
  roundToOneDecimal(value) {
    return Math.round(value * 10) / 10;
  }

  async initialize() {
    this.kvStore = await Actor.openKeyValueStore(this.cacheStoreId || 'grail-hunter-state');
    await this.loadMarketValues();
    await this.loadLiveMarketValues();
    logger.info('Deal scorer initialized', {
      excellentThreshold: this.excellentDealThreshold,
      goodThreshold: this.goodDealThreshold,
      fairThreshold: this.fairDealThreshold,
      marketValuesLoaded: this.marketValues?.sneakers?.length || 0,
      userOverrides: Object.keys(this.userOverrides).length,
      liveMarketSources: this.marketDataSources.length,
    });
  }

  async loadMarketValues() {
    try {
      const marketValuesPath = path.join(dirname, '../data/market-values.json');
      const data = await fs.readFile(marketValuesPath, 'utf8');
      this.marketValues = JSON.parse(data);
      logger.debug('Market values loaded from JSON', {
        count: this.marketValues.sneakers.length,
      });
    } catch (error) {
      logger.error('Failed to load market values database', {
        error: error.message,
      });
      this.marketValues = { sneakers: [] };
    }
  }

  async loadLiveMarketValues() {
    if (!this.marketDataSources.length) {
      return;
    }

    for (const source of this.marketDataSources) {
      const datasetId = source?.datasetId;
      if (!datasetId) {
        logger.warn('Live market data source missing datasetId, skipping');
      } else {
        try {
          const items = await fetchAllDatasetItems(datasetId, { limit: 500 });

          for (const item of items) {
            const sku = this.resolveSku(item);
            const name = (item.name || item.title || item.productName || '').trim().toLowerCase();
            const value = this.extractMarketValue(item);
            if (value) {
              if (sku) {
                this.liveMarketValues.sku.set(sku, value);
              }

              if (name) {
                this.liveMarketValues.name.set(name, value);
              }
            }
          }

          logger.info('Loaded live market data', {
            datasetId,
            label: source.label || datasetId,
            count: items.length,
          });
        } catch (error) {
          logger.warn('Failed to load live market data source', {
            datasetId,
            error: error.message,
          });
        }
      }
    }
  }

  resolveSku(record = {}) {
    const candidates = [
      record.sku,
      record.styleId,
      record.style_id,
      record.id,
      record.productId,
      record.product_id,
    ];

    const sku = candidates.find((c) => typeof c === 'string' && c.trim().length > 0);
    return sku ? sku.trim().toLowerCase() : null;
  }

  extractMarketValue(record = {}) {
    const fields = [
      record.marketValue,
      record.lowestAsk,
      record.lowestAskPrice,
      record.price,
      record.buyPrice,
      record.lastSale,
      record.averagePrice,
      record.avgPrice,
      record.avg_price,
    ];

    const numeric = fields.find((v) => typeof v === 'number' && Number.isFinite(v) && v > 0);
    return numeric || null;
  }

  async scoreListings(listings) {
    if (!Array.isArray(listings) || listings.length === 0) {
      return listings;
    }

    logger.info(`Scoring ${listings.length} listings for deal quality`);

    const scoredListings = await Promise.all(listings.map((listing) => this.scoreListing(listing)));

    const dealsFound = scoredListings.filter((l) => l.metadata?.dealScore?.isBelowMarket).length;

    logger.info(`Deal scoring complete: ${dealsFound} deals found`, {
      total: listings.length,
      deals: dealsFound,
      dealRate: `${((dealsFound / listings.length) * 100).toFixed(1)}%`,
    });

    return scoredListings;
  }

  async scoreListing(listing) {
    try {
      const marketValue = await this.getMarketValue(listing);

      if (!marketValue) {
        return this.setDefaultDealScore(listing);
      }

      const currentPrice = listing.listing?.price || 0;
      const isBelowMarket = currentPrice < marketValue;
      const savingsAmount = isBelowMarket ? marketValue - currentPrice : 0;
      const savingsPercentage = isBelowMarket ? (savingsAmount / marketValue) * 100 : 0;

      const dealQuality = this.calculateDealQuality(savingsPercentage);

      if (!listing.metadata) {
        listing.metadata = {};
      }

      listing.metadata.dealScore = {
        isBelowMarket,
        marketValue,
        savingsPercentage: isBelowMarket ? this.roundToOneDecimal(savingsPercentage) : null,
        savingsAmount: isBelowMarket ? savingsAmount : null,
        dealQuality,
      };

      if (isBelowMarket) {
        logger.debug('Deal found', {
          product: listing.product?.name,
          currentPrice,
          marketValue,
          savings: `${this.roundToOneDecimal(savingsPercentage)}%`,
          quality: dealQuality,
        });
      }

      return listing;
    } catch (error) {
      logger.error('Error scoring listing', {
        error: error.message,
        listing: listing.product?.name,
      });
      return this.setDefaultDealScore(listing);
    }
  }

  setDefaultDealScore(listing) {
    const currentPrice = listing.listing?.price || 0;

    if (!listing.metadata) {
      listing.metadata = {};
    }

    listing.metadata.dealScore = {
      isBelowMarket: false,
      marketValue: null,
      savingsPercentage: null,
      savingsAmount: null,
      dealQuality: null,
    };

    if (!listing.metadata.priceChange) {
      listing.metadata.priceChange = {
        hasDrop: false,
        previousPrice: null,
        currentPrice,
        dropPercent: null,
      };
    } else {
      listing.metadata.priceChange.currentPrice = currentPrice;
    }

    return listing;
  }

  calculateDealQuality(savingsPercentage) {
    if (savingsPercentage >= this.excellentDealThreshold) {
      return 'excellent';
    }
    if (savingsPercentage >= this.goodDealThreshold) {
      return 'good';
    }
    if (savingsPercentage >= this.fairDealThreshold) {
      return 'fair';
    }
    return 'market';
  }

  async getMarketValue(listing) {
    const productName = listing.product?.name || '';
    const model = listing.product?.model || '';
    const colorway = listing.product?.colorway || '';
    const sku = listing.product?.sku || '';

    if (this.userOverrides[productName]) {
      logger.debug('Using user override for market value', { productName });
      return this.userOverrides[productName];
    }

    if (sku && this.userOverrides[sku]) {
      logger.debug('Using user SKU override for market value', { sku });
      return this.userOverrides[sku];
    }

    // Live data (dataset ingestion for market baselines)
    const liveValue = this.findLiveMarketValue(productName, sku);
    if (liveValue) {
      return liveValue;
    }

    const marketValue = this.findMarketValue(productName, model, colorway, sku);

    if (marketValue) {
      return marketValue;
    }

    const cachedValue = await this.getCachedStockXValue(productName, sku);
    if (cachedValue) {
      return cachedValue;
    }

    return null;
  }

  findMarketValue(productName, model, colorway, sku) {
    if (!this.marketValues || !this.marketValues.sneakers) {
      return null;
    }

    const normalizedProductName = (productName || '').toLowerCase();
    const normalizedModel = (model || '').toLowerCase();
    const normalizedColorway = (colorway || '').toLowerCase();
    const normalizedSku = (sku || '').trim().toLowerCase();

    const exactMatch = this.marketValues.sneakers.find((s) => {
      const marketSku = (s.sku || '').trim().toLowerCase();
      const skuMatches =
        Boolean(normalizedSku) && Boolean(marketSku) && marketSku === normalizedSku;
      const nameMatches = s.name.toLowerCase() === normalizedProductName;
      return nameMatches || skuMatches;
    });

    if (exactMatch) {
      logger.debug('Exact market value match found', {
        product: productName,
        value: exactMatch.marketValue,
      });
      return exactMatch.marketValue;
    }

    const modelMatch = this.marketValues.sneakers.find(
      (s) =>
        normalizedModel &&
        normalizedColorway &&
        s.model.toLowerCase() === normalizedModel &&
        s.colorway.toLowerCase().includes(normalizedColorway)
    );

    if (modelMatch) {
      logger.debug('Partial market value match found', {
        product: productName,
        value: modelMatch.marketValue,
      });
      return modelMatch.marketValue;
    }

    return null;
  }

  async getCachedStockXValue(productName, sku) {
    if (!this.kvStore) {
      return null;
    }

    try {
      const cacheKey = `market_value_${sku || productName.replace(/\s+/g, '_')}`;
      const cached = await this.kvStore.getValue(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.debug('Using cached market value', {
          product: productName,
          age: `${Math.round((Date.now() - cached.timestamp) / 1000 / 60)} minutes`,
        });
        return cached.value;
      }
    } catch (error) {
      logger.warn('Failed to retrieve cached market value', {
        error: error.message,
      });
    }

    return null;
  }

  // Note: Market value caching is read-only from the static database.
  // If StockX API fetching is added in the future, implement cacheStockXValue
  // to write market values retrieved from StockX API.

  getStatistics(listings) {
    const scored = listings.filter((l) => l.metadata?.dealScore);
    const deals = scored.filter((l) => l.metadata.dealScore.isBelowMarket);
    const excellent = deals.filter((l) => l.metadata.dealScore.dealQuality === 'excellent');
    const good = deals.filter((l) => l.metadata.dealScore.dealQuality === 'good');
    const fair = deals.filter((l) => l.metadata.dealScore.dealQuality === 'fair');

    return {
      total: listings.length,
      scored: scored.length,
      deals: deals.length,
      excellent: excellent.length,
      good: good.length,
      fair: fair.length,
      dealRate: scored.length > 0 ? Number(((deals.length / scored.length) * 100).toFixed(1)) : 0,
    };
  }

  findLiveMarketValue(productName, sku) {
    const normalizedProductName = (productName || '').trim().toLowerCase();
    const normalizedSku = (sku || '').trim().toLowerCase();

    if (normalizedSku && this.liveMarketValues.sku.has(normalizedSku)) {
      return this.liveMarketValues.sku.get(normalizedSku);
    }

    if (normalizedProductName && this.liveMarketValues.name.has(normalizedProductName)) {
      return this.liveMarketValues.name.get(normalizedProductName);
    }

    return null;
  }
}
