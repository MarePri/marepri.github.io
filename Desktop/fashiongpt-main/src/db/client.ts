// ─── Database Layer: Supabase Client ──────────────────────────────────────────
// Singleton Supabase client. Configured via Vite environment variables.
// No UI or agent imports — pure infrastructure.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const AGENT = 'DBClient';

// ─── Environment configuration ───────────────────────────────────────────────

/**
 * Get the Supabase URL from environment.
 * Falls back to empty string for build-time safety.
 */
function getSupabaseUrl(): string {
  try {
    return import.meta.env.VITE_SUPABASE_URL || '';
  } catch {
    return '';
  }
}

/**
 * Get the Supabase anon key from environment.
 */
function getSupabaseAnonKey(): string {
  try {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  } catch {
    return '';
  }
}

// ─── Client singleton ────────────────────────────────────────────────────────

let _client: SupabaseClient | null = null;
let _initialized = false;

/**
 * Get or create the Supabase client singleton.
 * Returns null if Supabase is not configured (offline/dev mode).
 *
 * @param forceReinit - Force a new client instance
 * @returns SupabaseClient or null
 */
export function getClient(forceReinit = false): SupabaseClient | null {
  if (_client && !forceReinit) return _client;
  if (_initialized && !forceReinit) return _client;

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    if (!_initialized) {
      console.info(`[${AGENT}] Supabase not configured — running in offline mode`);
      _initialized = true;
    }
    return null;
  }

  try {
    _client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
    });
    _initialized = true;
    console.info(`[${AGENT}] Supabase client initialized`);
    return _client;
  } catch (err) {
    console.error(`[${AGENT}] Failed to create Supabase client:`, err);
    _initialized = true;
    return null;
  }
}

/**
 * Check whether Supabase is configured and available.
 */
export function isSupabaseAvailable(): boolean {
  if (!_initialized) getClient();
  return _client !== null;
}

/**
 * Reset the client singleton (useful for testing or reconfiguration).
 */
export function resetClient(): void {
  _client = null;
  _initialized = false;
}

export default { getClient, isSupabaseAvailable, resetClient };
