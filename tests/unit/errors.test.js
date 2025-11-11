/**
 * Unit tests for custom error classes
 */

import {
  ValidationError,
  PlatformScrapingError,
  NotificationError,
  ActorCallError,
} from '../../src/utils/errors.js';

describe('Custom Errors', () => {
  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('PlatformScrapingError', () => {
    it('should create platform scraping error', () => {
      const error = new PlatformScrapingError('Grailed', 'Connection failed');
      expect(error.message).toContain('Grailed');
      expect(error.message).toContain('Connection failed');
      expect(error.platform).toBe('Grailed');
      expect(error.recoverable).toBe(true);
    });
  });

  describe('NotificationError', () => {
    it('should create notification error', () => {
      const error = new NotificationError('webhook', 'Failed to send');
      expect(error.message).toContain('webhook');
      expect(error.channel).toBe('webhook');
      expect(error.recoverable).toBe(true);
    });
  });

  describe('ActorCallError', () => {
    it('should create actor call error', () => {
      const error = new ActorCallError('vmscrapers/grailed', 'Actor failed');
      expect(error.message).toContain('vmscrapers/grailed');
      expect(error.actorId).toBe('vmscrapers/grailed');
      expect(error.recoverable).toBe(false);
    });
  });
});
