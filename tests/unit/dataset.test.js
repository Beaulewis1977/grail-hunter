/**
 * Unit tests for dataset notifier
 */

import { jest } from '@jest/globals';

// Mock Actor BEFORE importing the module that uses it
const mockPushData = jest.fn(() => Promise.resolve());

jest.unstable_mockModule('apify', () => ({
  Actor: {
    pushData: mockPushData,
  },
}));

// Import after mocking
const { DatasetNotifier } = await import('../../src/notifications/dataset.js');

describe('DatasetNotifier', () => {
  let notifier;

  beforeEach(() => {
    notifier = new DatasetNotifier();
    mockPushData.mockClear();
  });

  it('should push listings to dataset', async () => {
    const listings = [{ product: { name: 'Test' }, listing: { price: 100 } }];

    await notifier.send(listings);

    expect(mockPushData).toHaveBeenCalledWith(listings);
  });

  it('should handle empty listings', async () => {
    await notifier.send([]);

    expect(mockPushData).not.toHaveBeenCalled();
  });

  it('should handle null listings', async () => {
    await notifier.send(null);

    expect(mockPushData).not.toHaveBeenCalled();
  });
});
