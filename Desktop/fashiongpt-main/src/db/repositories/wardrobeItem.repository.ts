// ─── Wardrobe Item Repository ─────────────────────────────────────────────────
// CRUD operations for the wardrobe_items table.
// Manages a user's virtual wardrobe of owned/wishlist products.

import { getClient } from '../client';
import type { WardrobeItemRow, WardrobeItemInsert, WardrobeItemUpdate, PaginationParams, PaginatedResult } from '../types';

const TABLE = 'wardrobe_items';

/**
 * List all wardrobe items for a user, with optional pagination.
 */
export async function findByUserId(
  userId: string,
  pagination?: PaginationParams
): Promise<WardrobeItemRow[]> {
  const client = getClient();
  if (!client) return [];

  const page = pagination?.page || 1;
  const limit = pagination?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error(`[WardrobeRepo] findByUserId error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * List wardrobe items with pagination and count.
 */
export async function findWithCount(
  userId: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<WardrobeItemRow>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 50;

  const client = getClient();
  if (!client) {
    return { data: [], count: 0, page, limit, totalPages: 0 };
  }

  const { data, error, count } = await client
    .from(TABLE)
    .select('*', { count: 'exact', head: false })
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error(`[WardrobeRepo] findWithCount error:`, error.message);
    return { data: [], count: 0, page, limit, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

/**
 * Filter wardrobe items by category.
 */
export async function findByCategory(
  userId: string,
  category: string
): Promise<WardrobeItemRow[]> {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('added_at', { ascending: false });

  if (error) {
    console.error(`[WardrobeRepo] findByCategory error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Find a single wardrobe item by ID.
 */
export async function findById(id: string): Promise<WardrobeItemRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`[WardrobeRepo] findById error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Add an item to a user's wardrobe.
 */
export async function create(input: WardrobeItemInsert): Promise<WardrobeItemRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error(`[WardrobeRepo] create error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Bulk add items to a user's wardrobe.
 */
export async function createMany(inputs: WardrobeItemInsert[]): Promise<WardrobeItemRow[]> {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLE)
    .insert(inputs)
    .select();

  if (error) {
    console.error(`[WardrobeRepo] createMany error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Update a wardrobe item.
 */
export async function update(id: string, input: WardrobeItemUpdate): Promise<WardrobeItemRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[WardrobeRepo] update error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Remove an item from wardrobe.
 */
export async function remove(id: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[WardrobeRepo] delete error:`, error.message);
    return false;
  }
  return true;
}

/**
 * Remove all items from a user's wardrobe.
 */
export async function clearByUserId(userId: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error(`[WardrobeRepo] clearByUserId error:`, error.message);
    return false;
  }
  return true;
}

export default {
  findByUserId, findWithCount, findByCategory, findById,
  create, createMany, update, remove, clearByUserId,
};
