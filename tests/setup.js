/**
 * Jest setup file
 * Suppress expected console warnings in test environment
 */

/* eslint-disable no-console */

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Suppress specific Actor warnings that are expected in test environment
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes(
      'Actor.openKeyValueStore() was called but the Actor instance was not initialized'
    )
  ) {
    // Suppress this expected warning in tests
    return;
  }
  originalWarn.apply(console, args);
};

// Suppress React/PropTypes warnings in tests if needed
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('Warning: ')) {
    // Suppress React warnings
    return;
  }
  originalError.apply(console, args);
};
