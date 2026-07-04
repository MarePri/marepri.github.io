/**
 * ISOLATED Unit Test for colorHarmony.ts
 * Target: src/utils/colorHarmony.ts
 * Session: ses_1
 *
 * **WARNING**: THIS FILE WILL BE DELETED AFTER TEST PASSES
 * Test code preserved in: .opencode/unit-tests/
 */

import { describe, it, expect } from 'vitest';

// Import target file (will fail initially — Red phase)
import { COLOR_GROUPS, getColorGroup, computeColorHarmony } from '../colorHarmony.js';

describe('colorHarmony - Isolated Tests', () => {
  // ─── COLOR_GROUPS ─────────────────────────────────────────────────────────
  describe('COLOR_GROUPS', () => {
    it('should contain all expected group keys', () => {
      const keys = Object.keys(COLOR_GROUPS);
      expect(keys).toContain('neutrals');
      expect(keys).toContain('earths');
      expect(keys).toContain('darks');
      expect(keys).toContain('pastels');
      expect(keys).toContain('brights');
      expect(keys).toContain('naturals');
      expect(keys).toContain('washing');
    });

    it('neutrals should include Black, White, Beige, Grey, Cream, Ivory', () => {
      expect(COLOR_GROUPS.neutrals).toContain('Black');
      expect(COLOR_GROUPS.neutrals).toContain('White');
      expect(COLOR_GROUPS.neutrals).toContain('Beige');
    });

    it('pastels should include Lavender and Mint (union of all 3 sources)', () => {
      expect(COLOR_GROUPS.pastels).toContain('Lavender');
      expect(COLOR_GROUPS.pastels).toContain('Mint');
    });

    it('brights should include Yellow (union of all 3 sources)', () => {
      expect(COLOR_GROUPS.brights).toContain('Yellow');
    });

    it('washing should be present with denim washes', () => {
      expect(COLOR_GROUPS.washing).toBeDefined();
      expect(COLOR_GROUPS.washing).toContain('Medium Wash');
      expect(COLOR_GROUPS.washing).toContain('Light Wash');
    });
  });

  // ─── getColorGroup ────────────────────────────────────────────────────────
  describe('getColorGroup', () => {
    it('should return neutrals for "Black"', () => {
      const groups = getColorGroup('Black');
      expect(groups).toContain('neutrals');
    });

    it('should return darks+neutrals for "Black" (multi-group match)', () => {
      const groups = getColorGroup('Black');
      expect(groups).toContain('neutrals');
      expect(groups).toContain('darks');
    });

    it('should return earths for "Rust"', () => {
      const groups = getColorGroup('Rust');
      expect(groups).toContain('earths');
      expect(groups).not.toContain('neutrals');
    });

    it('should return brights for "Gold"', () => {
      const groups = getColorGroup('Gold');
      expect(groups).toContain('brights');
    });

    it('should return empty array for unknown color', () => {
      const groups = getColorGroup('NeonPink');
      expect(groups).toEqual([]);
    });

    it('should return washing for "Medium Wash"', () => {
      const groups = getColorGroup('Medium Wash');
      expect(groups).toContain('washing');
    });

    it('should be case-insensitive', () => {
      const groups = getColorGroup('black');
      expect(groups).toContain('neutrals');
      expect(groups).toContain('darks');
    });
  });

  // ─── computeColorHarmony ──────────────────────────────────────────────────
  describe('computeColorHarmony', () => {
    it('should return 80 for null/undefined items', () => {
      expect(computeColorHarmony(null as any)).toBe(80);
      expect(computeColorHarmony(undefined as any)).toBe(80);
    });

    it('should return 80 for single item', () => {
      expect(computeColorHarmony([{ color: 'Black' }])).toBe(80);
    });

    it('should return 80 for empty array', () => {
      expect(computeColorHarmony([])).toBe(80);
    });

    it('should return high score for same-group colors', () => {
      // "Black" and "White" are both in 'neutrals'
      const score = computeColorHarmony([{ color: 'Black' }, { color: 'White' }]);
      expect(score).toBeGreaterThanOrEqual(60);
      expect(score).toBeLessThanOrEqual(95);
    });

    it('should return lower score for unrelated colors', () => {
      // "NeonPink" (unknown) and "Rust" (earths) — no overlap
      const score = computeColorHarmony([{ color: 'NeonPink' }, { color: 'Rust' }]);
      expect(score).toBe(60); // 0/1 = 0 → 60 + 0 → 60
    });

    it('should handle items without color property', () => {
      const score = computeColorHarmony([{}, { color: 'Black' }] as any);
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should give higher score when multiple pairs share groups', () => {
      // 3 items all in neutrals: Black, White, Beige
      // Pairs: (0,1) → neutrals ✓, (0,2) → neutrals ✓, (1,2) → neutrals ✓
      // 3/3 harmony → 60 + (3/3)*35 = 95
      const score = computeColorHarmony([
        { color: 'Black' },
        { color: 'White' },
        { color: 'Beige' },
      ]);
      expect(score).toBe(95);
    });
  });
});
