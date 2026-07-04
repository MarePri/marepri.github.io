// ─── Database Layer Barrel Export ──────────────────────────────────────────────
// Usage: import { getClient, userRepo, outfitRepo } from '../db';

// Client
export { getClient, isSupabaseAvailable, resetClient } from './client';

// Types — re-export all type definitions
export type {
  UserRow, UserInsert, UserUpdate,
  StyleProfileRow, StyleProfileInsert, StyleProfileUpdate,
  BrandAffinityRecord,
  WardrobeItemRow, WardrobeItemInsert, WardrobeItemUpdate,
  WardrobeItemMetadata,
  OutfitRow, OutfitInsert, OutfitUpdate,
  SavedOutfitRow, SavedOutfitInsert, SavedOutfitUpdate,
  PaginationParams, PaginatedResult, QueryFilter,
} from './types';

// Repositories
export { userRepo, styleProfileRepo, wardrobeItemRepo, outfitRepo, savedOutfitRepo } from './repositories';
