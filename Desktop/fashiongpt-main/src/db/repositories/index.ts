// ─── Repository Barrel Export ─────────────────────────────────────────────────
// Using namespaced exports to avoid ambiguous re-export errors.
// Usage: import { userRepo, outfitRepo } from './repositories';

import * as _userRepo from './user.repository';
import * as _styleProfileRepo from './styleProfile.repository';
import * as _wardrobeItemRepo from './wardrobeItem.repository';
import * as _outfitRepo from './outfit.repository';
import * as _savedOutfitRepo from './savedOutfit.repository';

export const userRepo = _userRepo;
export const styleProfileRepo = _styleProfileRepo;
export const wardrobeItemRepo = _wardrobeItemRepo;
export const outfitRepo = _outfitRepo;
export const savedOutfitRepo = _savedOutfitRepo;
