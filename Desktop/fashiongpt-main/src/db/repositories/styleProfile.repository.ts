// ─── Style Profile Repository ───────────────────────────────────────────────
// CRUD operations for the style_profiles table.
// Stores archetype, palette, brand affinities, and user preferences.

import { getClient } from '../client';
import type { StyleProfileRow, StyleProfileInsert, StyleProfileUpdate } from '../types';

const TABLE = 'style_profiles';

/**
 * Get the style profile for a user.
 */
export async function findByUserId(userId: string): Promise<StyleProfileRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error(`[StyleProfileRepo] findByUserId error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Create a style profile for a user.
 */
export async function create(input: StyleProfileInsert): Promise<StyleProfileRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error(`[StyleProfileRepo] create error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Upsert a style profile (create if not exists, update if exists).
 * One profile per user enforced by DB UNIQUE(user_id).
 */
export async function upsert(input: StyleProfileInsert): Promise<StyleProfileRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .upsert(input, { onConflict: 'user_id', ignoreDuplicates: false })
    .select()
    .single();

  if (error) {
    console.error(`[StyleProfileRepo] upsert error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Update a style profile.
 */
export async function update(id: string, input: StyleProfileUpdate): Promise<StyleProfileRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[StyleProfileRepo] update error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Delete a style profile.
 */
export async function remove(id: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[StyleProfileRepo] delete error:`, error.message);
    return false;
  }
  return true;
}

export default { findByUserId, create, upsert, update, remove };
