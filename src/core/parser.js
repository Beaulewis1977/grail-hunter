
/**
 * AI & Regex Parsing Engine
 * Extracts structured data from unstructured text
 */

import { logger } from '../utils/logger.js';

export class SneakerParser {
  constructor() {
    // Order matters: check more specific patterns first
    this.conditionPatterns = [
      { regex: /\b(vnds|very near deadstock)\b/i, value: 'used_like_new' }, // Check VNDS before DS
      { regex: /\b(nds|near deadstock)\b/i, value: 'used_good' },
      { regex: /\b(ds|deadstock|bnib|brand new)\b/i, value: 'new_in_box' },
      { regex: /\b(worn|used|gently used)\b/i, value: 'used_fair' },
      { regex: /\b(beat|beaters|thrashed)\b/i, value: 'used_poor' },
    ];

    this.tagPatterns = [
      { regex: /\b(og all|og box)\b/i, tag: 'og_all' },
      { regex: /\b(pe|player edition)\b/i, tag: 'player_edition' },
      { regex: /\b(sample)\b/i, tag: 'sample' },
      { regex: /\b(promo)\b/i, tag: 'promo' },
      { regex: /\b(no box)\b/i, tag: 'no_box' },
      { regex: /\b(replacement box)\b/i, tag: 'replacement_box' },
      // Condition keywords as tags
      { regex: /\b(vnds|very near deadstock)\b/i, tag: 'vnds' },
      { regex: /\b(nds|near deadstock)\b/i, tag: 'nds' },
      { regex: /\b(ds|deadstock)\b/i, tag: 'ds' },
    ];

    // Updated regex to properly capture decimal sizes
    this.sizePatterns = [
      /\b(?:size|sz)[:, ]+([1-9]|1[0-5])(\.5)?\b/i,
      /\b(?:us\s*m(?:en's)?)[:\s]+([1-9]|1[0-5])(\.5)?\b/i,
      /\b([1-9]|1[0-5])(\.5)?\s*(?:US|M)\b/i,
    ];
  }

  /**
   * Parse all fields from a listing
   * @param {object} listing - Normalized listing
   * @returns {object} Enhanced listing with parsed data
   */
  parse(listing) {
    logger.debug('Parsing listing', { listingId: listing.source.id });

    const text = `${listing.product.name} ${listing.listing.description}`;

    // Parse condition if not already set
    if (!listing.listing.condition || listing.listing.condition === 'unspecified') {
      listing.listing.condition = this.parseCondition(text);
    }

    // Parse size if not already set
    if (!listing.listing.size_us_mens) {
      listing.listing.size_us_mens = this.parseSize(text);
    }

    // Parse and enhance tags
    const parsedTags = this.parseTags(text);
    listing.listing.tags = [...new Set([...listing.listing.tags, ...parsedTags])];

    return listing;
  }

  /**
   * Parse condition from text
   */
  parseCondition(text) {
    for (const pattern of this.conditionPatterns) {
      if (pattern.regex.test(text)) {
        return pattern.value;
      }
    }
    return 'unspecified';
  }

  /**
   * Parse size from text
   */
  parseSize(text) {
    for (const regex of this.sizePatterns) {
      const match = text.match(regex);
      if (match && match[1]) {
        // Concatenate integer part (match[1]) and decimal part (match[2] if exists)
        return match[1] + (match[2] || '');
      }
    }
    return null;
  }

  /**
   * Parse tags from text
   */
  parseTags(text) {
    const tags = [];
    for (const pattern of this.tagPatterns) {
      if (pattern.regex.test(text)) {
        tags.push(pattern.tag);
      }
    }
    return tags;
  }
}

