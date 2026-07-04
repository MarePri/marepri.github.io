/**
 * App configuration and feature flags.
 * Detects environment and enables/disables features accordingly.
 */

/** Retry configuration for AI API calls */
export const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  BASE_DELAY_MS: 1000,
};

/** Base URL for the local proxy server (keeps API key server-side) */
export const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL || 'http://localhost:3001';

/** Check if an Anthropic API key is available in the environment */
export function hasApiKey() {
  try {
    return !!(import.meta.env.VITE_ANTHROPIC_API_KEY);
  } catch {
    return false;
  }
}

/** Check if the backend proxy is configured */
export function hasProxyUrl() {
  try {
    return !!(import.meta.env.VITE_API_PROXY_URL);
  } catch {
    return false;
  }
}

/** Whether to use offline (mock) mode instead of live AI API */
export function isOfflineMode() {
  // Online if either a proxy URL is set (preferred) or a direct API key is set (legacy)
  return !hasProxyUrl() && !hasApiKey();
}

/** Get the Anthropic API key */
export function getApiKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || '';
}
