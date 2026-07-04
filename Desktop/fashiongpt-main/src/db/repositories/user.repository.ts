// ─── User Repository ──────────────────────────────────────────────────────────
// CRUD operations for the users table.
// Uses the Supabase client from ../client.ts — never accesses the agent layer.

import { getClient } from '../client';
import type { UserRow, UserInsert, UserUpdate } from '../types';

const TABLE = 'users';

/**
 * Find a user by their unique ID.
 */
export async function findById(id: string): Promise<UserRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`[UserRepo] findById error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Find a user by email.
 */
export async function findByEmail(email: string): Promise<UserRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error(`[UserRepo] findByEmail error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Find a user by their Supabase Auth ID.
 */
export async function findByAuthId(authUserId: string): Promise<UserRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    console.error(`[UserRepo] findByAuthId error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Create a new user.
 */
export async function create(input: UserInsert): Promise<UserRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error(`[UserRepo] create error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Upsert a user by email (create if not exists, update if exists).
 */
export async function upsert(input: UserInsert): Promise<UserRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .upsert(input, { onConflict: 'email', ignoreDuplicates: false })
    .select()
    .single();

  if (error) {
    console.error(`[UserRepo] upsert error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Update an existing user.
 */
export async function update(id: string, input: UserUpdate): Promise<UserRow | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[UserRepo] update error:`, error.message);
    return null;
  }
  return data;
}

/**
 * Delete a user by ID.
 */
export async function remove(id: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[UserRepo] delete error:`, error.message);
    return false;
  }
  return true;
}

export default { findById, findByEmail, findByAuthId, create, upsert, update, remove };
