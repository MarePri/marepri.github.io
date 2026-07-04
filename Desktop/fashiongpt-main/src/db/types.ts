// ─── Database Layer: TypeScript Types ──────────────────────────────────────────
// Row/Insert/Update types for all 5 Supabase tables.
// These mirror the SQL schema exactly — one type per table operation.

// ═══════════════════════════════════════════════════════════════════════════════
// 1. USERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  auth_user_id?: string | null;
}

export interface UserUpdate {
  display_name?: string | null;
  avatar_url?: string | null;
  auth_user_id?: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. STYLE PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BrandAffinityRecord {
  brand: string;
  score: number;
  reason: string;
}

export interface StyleProfileRow {
  id: string;
  user_id: string;
  archetype_id: string;
  archetype_name: string;
  palette: string[];
  brand_affinities: BrandAffinityRecord[];
  style_tags: string[];
  confidence: number;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface StyleProfileInsert {
  user_id: string;
  archetype_id: string;
  archetype_name: string;
  palette?: string[];
  brand_affinities?: BrandAffinityRecord[];
  style_tags?: string[];
  confidence?: number;
  preferences?: Record<string, unknown> | null;
}

export interface StyleProfileUpdate {
  archetype_id?: string;
  archetype_name?: string;
  palette?: string[];
  brand_affinities?: BrandAffinityRecord[];
  style_tags?: string[];
  confidence?: number;
  preferences?: Record<string, unknown> | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. WARDROBE ITEMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WardrobeItemMetadata {
  fit?: string;
  style_tags?: string[];
  trend?: number;
  img?: string;
}

export interface WardrobeItemRow {
  id: string;
  user_id: string;
  product_id: number | null;
  brand: string;
  name: string;
  category: string;
  color: string | null;
  price: number;
  image_url: string | null;
  metadata: WardrobeItemMetadata | null;
  notes: string | null;
  is_owned: boolean;
  added_at: string;
  updated_at: string;
}

export interface WardrobeItemInsert {
  user_id: string;
  product_id?: number | null;
  brand: string;
  name: string;
  category: string;
  color?: string | null;
  price?: number;
  image_url?: string | null;
  metadata?: WardrobeItemMetadata | null;
  notes?: string | null;
  is_owned?: boolean;
}

export interface WardrobeItemUpdate {
  brand?: string;
  name?: string;
  category?: string;
  color?: string | null;
  price?: number;
  image_url?: string | null;
  metadata?: WardrobeItemMetadata | null;
  notes?: string | null;
  is_owned?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. OUTFITS
// ═══════════════════════════════════════════════════════════════════════════════

import type { OutfitItem, OutfitScores } from '../agents/types';
import type { CriticAgentOutput } from '../agents/types';

export interface OutfitRow {
  id: string;
  user_id: string | null;
  name: string | null;
  occasion: string | null;
  budget: number | null;
  style_goal: string | null;
  items: OutfitItem[];
  scores: OutfitScores | null;
  rationale: string | null;
  critique: CriticAgentOutput | null;
  approved: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface OutfitInsert {
  user_id?: string | null;
  name?: string | null;
  occasion?: string | null;
  budget?: number | null;
  style_goal?: string | null;
  items: OutfitItem[];
  scores?: OutfitScores | null;
  rationale?: string | null;
  critique?: CriticAgentOutput | null;
  approved?: boolean;
  source?: string;
}

export interface OutfitUpdate {
  name?: string | null;
  occasion?: string | null;
  budget?: number | null;
  style_goal?: string | null;
  items?: OutfitItem[];
  scores?: OutfitScores | null;
  rationale?: string | null;
  critique?: CriticAgentOutput | null;
  approved?: boolean;
  source?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SAVED OUTFITS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SavedOutfitRow {
  id: string;
  user_id: string;
  outfit_id: string;
  notes: string | null;
  saved_at: string;
}

export interface SavedOutfitInsert {
  user_id: string;
  outfit_id: string;
  notes?: string | null;
}

export interface SavedOutfitUpdate {
  notes?: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. GENERIC QUERY PARAMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: unknown;
}
