import { Actor } from 'apify';
import { logger } from '../../utils/logger.js';

const USER_AGENTS = [
  // Desktop
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
  // Mobile
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 12; SM-G990U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36',
];

export function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Builds and enforces residential proxy configuration.
 * Throws when Apify proxy is disabled to avoid direct hits.
 */
export async function createResidentialProxyConfig(providedConfig = {}) {
  const resolved = { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'], ...providedConfig };

  if (resolved.useApifyProxy !== true) {
    const error = new Error('Residential Apify proxy is required for this scraper');
    error.recoverable = false;
    throw error;
  }

  // Ensure RESIDENTIAL group is present (avoid DC-only configs)
  if (Array.isArray(resolved.apifyProxyGroups)) {
    const groups = new Set(resolved.apifyProxyGroups);
    groups.add('RESIDENTIAL');
    resolved.apifyProxyGroups = Array.from(groups);
  } else {
    resolved.apifyProxyGroups = ['RESIDENTIAL'];
  }

  return Actor.createProxyConfiguration(resolved);
}

export function isBlockStatus(status) {
  return status === 429 || status === 503 || status === 403;
}

export function logBlock(platform, status, url) {
  logger.warn(`${platform} blocking detected`, {
    platform,
    status,
    url,
  });
}

export async function sleepWithJitter(baseMs = 500, jitterMs = 400) {
  const delayMs = baseMs + Math.floor(Math.random() * jitterMs);
  await Actor.sleep(delayMs);
  return delayMs;
}
