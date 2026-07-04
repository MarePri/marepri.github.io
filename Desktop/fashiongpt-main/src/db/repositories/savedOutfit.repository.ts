// ─── Saved Outfit Repository ──────────────────────────────────────────────────
// CRUD operations for the saved_outfits table.
// Manages user bookmarks of outfits they want to keep/reference later.

import { getClient } from '../client';
import type { SavedOutfitRow, SavedOutfitInsert, SavedOutfitUpdate, PaginationParams } from '../types';

const TABLE = 'saved_outfits';

/**
 * Find a saved outfit by its ID.
 */
export async function findById(id: string): Promise<SavedOutfitRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`[SavedOutfitRepo] findById error:`, error.message);
    return null;
  }
  return data;
}

/**
 * List all saved outfits for a user, most recent first.
 */
export async function findByUserId(
  userId: string,
  pagination?: PaginationParams
): Promise<SavedOutfitRow[]> {
  const client = getClient();
  if (!client) return [];

  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await client
    .from(TABLE)
    .select('*, outfits(*)')  // Join outfit data
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error(`[SavedOutfitRepo] findByUserId error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Check if a user has saved a specific outfit.
 */
export async function exists(userId: string, outfitId: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { data, error } = await client
    .from(TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('outfit_id', outfitId)
    .maybeSingle();

  if (error) {
    console.error(`[SavedOutfitRepo] exists error:`, error.message);
    return false;
  }
  return data !== null;
}

/**
 * Save an outfit for a user (bookmark).
 */
export async function create(input: SavedOutfitInsert): Promise<SavedOutfitRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) {
    // Unique constraint violation — already saved
    if (error.code === '23505') {
      console.info(`[SavedOutfitRepo] Outfit already saved — returning existing`);
      const existing = await client
        .from(TABLE)
        .select('*')
        .eq('user_id', input.user_id)
        .eq('outfit_id', input.outfit_id)
        .single();
      return existing.data;
    }
    console.error(`[SavedOutfitRepo] create error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Update notes on a saved outfit.
 */
export async function update(id: string, input: SavedOutfitUpdate): Promise<SavedOutfitRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[SavedOutfitRepo] update error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Unsave an outfit (remove bookmark).
 */
export async function remove(id: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[SavedOutfitRepo] delete error:`, error.message);
    return false;
  }
  return true;
}

/**
 * Unsave a specific outfit for a user (by user + outfit IDs).
 */
export async function removeByUserAndOutfit(userId: string, outfitId: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('outfit_id', outfitId);

  if (error) {
    console.error(`[SavedOutfitRepo] removeByUserAndOutfit error:`, error.message);
    return false;
  }
  return true;
}

export default {
  findById, findByUserId, exists, create, update, remove, removeByUserAndOutfit,
};
