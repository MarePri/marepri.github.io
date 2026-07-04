// ─── Outfit Repository ────────────────────────────────────────────────────────
// CRUD operations for the outfits table.
// Stores generated/composed outfits with scores, critique, and metadata.

import { getClient } from '../client';
import type {
  OutfitRow, OutfitInsert, OutfitUpdate,
  PaginationParams, PaginatedResult, QueryFilter,
} from '../types';

const TABLE = 'outfits';

/**
 * Find an outfit by its ID.
 */
export async function findById(id: string): Promise<OutfitRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`[OutfitRepo] findById error:`, error.message);
    return null;
  }
  return data;
}

/**
 * List outfits for a user, most recent first.
 */
export async function findByUserId(
  userId: string,
  pagination?: PaginationParams
): Promise<OutfitRow[]> {
  const client = getClient();
  if (!client) return [];

  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error(`[OutfitRepo] findByUserId error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * List outfits with pagination metadata.
 */
export async function findWithCount(
  userId: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<OutfitRow>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;

  const client = getClient();
  if (!client) {
    return { data: [], count: 0, page, limit, totalPages: 0 };
  }

  const { data, error, count } = await client
    .from(TABLE)
    .select('*', { count: 'exact', head: false })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error(`[OutfitRepo] findWithCount error:`, error.message);
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
 * Find approved outfits for a user.
 */
export async function findApproved(
  userId: string,
  pagination?: PaginationParams
): Promise<OutfitRow[]> {
  const client = getClient();
  if (!client) return [];

  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error(`[OutfitRepo] findApproved error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Find outfits matching an occasion.
 */
export async function findByOccasion(
  userId: string,
  occasion: string
): Promise<OutfitRow[]> {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .ilike('occasion', `%${occasion}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`[OutfitRepo] findByOccasion error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Query outfits with arbitrary filters.
 */
export async function query(
  filters: QueryFilter[],
  pagination?: PaginationParams
): Promise<OutfitRow[]> {
  const client = getClient();
  if (!client) return [];

  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  let query = client.from(TABLE).select('*');

  for (const f of filters) {
    query = query.filter(f.field, f.operator, f.value);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error(`[OutfitRepo] query error:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Create a new outfit record.
 */
export async function create(input: OutfitInsert): Promise<OutfitRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error(`[OutfitRepo] create error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Update an outfit.
 */
export async function update(id: string, input: OutfitUpdate): Promise<OutfitRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[OutfitRepo] update error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Approve an outfit (shortcut for setting approved=true).
 */
export async function approve(id: string): Promise<OutfitRow | null> {
  return update(id, { approved: true });
}

/**
 * Delete an outfit.
 */
export async function remove(id: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[OutfitRepo] delete error:`, error.message);
    return false;
  }
  return true;
}

export default {
  findById, findByUserId, findWithCount, findApproved,
  findByOccasion, query, create, update, approve, remove,
};
