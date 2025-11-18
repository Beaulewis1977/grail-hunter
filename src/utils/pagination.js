/**
 * Pagination Utilities
 * Shared pagination logic for Apify dataset iteration
 */

import { Actor } from 'apify';

/**
 * Fetch all items from an Apify dataset with automatic pagination
 * @param {string} datasetId - Dataset ID to fetch from
 * @param {object} options - Pagination options
 * @param {number} options.limit - Items per page (default: 1000)
 * @param {function} options.filter - Optional filter function to apply to each item
 * @returns {Promise<Array>} All items from the dataset
 */
export async function fetchAllDatasetItems(datasetId, options = {}) {
  const { limit = 1000, filter = null } = options;

  const dataset = await Actor.apifyClient.dataset(datasetId);
  const allItems = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const page = await dataset.listItems({ limit, offset });

    if (!page?.items?.length) {
      hasMore = false;
      break;
    }

    // Apply filter if provided, otherwise add all items
    const itemsToAdd = filter ? page.items.filter(filter) : page.items;
    allItems.push(...itemsToAdd);

    // Check if there are more pages
    hasMore = page.items.length === limit;
    offset += limit;
  }

  return allItems;
}
