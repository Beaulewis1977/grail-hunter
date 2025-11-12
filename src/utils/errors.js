/**
 * Custom Error Classes
 * Provides specific error types for better error handling
 */

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'ValidationError';
    this.type = 'VALIDATION_ERROR';
  }
}

export class PlatformScrapingError extends Error {
  constructor(platform, message, originalError = null) {
    super(`${platform} scraping failed: ${message}`);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'PlatformScrapingError';
    this.type = 'PLATFORM_SCRAPING_ERROR';
    this.platform = platform;
    this.originalError = originalError;
    this.recoverable = true; // Allow graceful degradation
  }
}

export class NotificationError extends Error {
  constructor(channel, message, originalError = null) {
    super(`${channel} notification failed: ${message}`);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'NotificationError';
    this.type = 'NOTIFICATION_ERROR';
    this.channel = channel;
    this.originalError = originalError;
    this.recoverable = true;
  }
}

export class ActorCallError extends Error {
  constructor(actorId, message, originalError = null) {
    super(`Actor call to ${actorId} failed: ${message}`);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'ActorCallError';
    this.type = 'ACTOR_CALL_ERROR';
    this.actorId = actorId;
    this.originalError = originalError;
    this.recoverable = false;
  }
}
