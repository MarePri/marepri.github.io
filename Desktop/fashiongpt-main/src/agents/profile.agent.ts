// ─── Profile Agent ─────────────────────────────────────────────────────────────
// Analyzes user style preferences and builds a StyleProfile.
// Never calls other agents — returns result to orchestrator.

import type {
  ProfileAgentInput,
  ProfileAgentOutput,
  StyleProfile,
  BrandAffinity,
  Archetype,
} from './types';
import * as logger from './logger';

const AGENT = 'ProfileAgent';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Style tags associated with each archetype. */
const ARCHETYPE_TAGS: Record<string, string[]> = {
  minimalist: ['minimal', 'smart casual', 'everyday', 'office'],
  streetwear: ['streetwear', 'casual', 'concert', 'festival'],
  romantic: ['romantic', 'date', 'evening', 'wedding', 'vacation'],
  professional: ['office', 'formal', 'smart casual', 'minimal'],
};

/** Confidence floor — even with no input, we return a sensible profile. */
const MIN_CONFIDENCE = 55;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute brand affinity scores for an archetype.
 * Uses the archetype's defined brands + expands based on style overlap.
 */
function computeBrandAffinities(archetype: Archetype): BrandAffinity[] {
  const affinities: BrandAffinity[] = [];

  // Primary brands (from archetype definition) — max affinity
  for (const brand of archetype.brands) {
    affinities.push({ brand, score: 95, reason: `Core brand for ${archetype.name}` });
  }

  // Secondary brands based on style overlap
  const tags = ARCHETYPE_TAGS[archetype.id] || [];
  const allProducts = getProductPool(); // Safe import handled in orchestrator
  const brandScores = new Map<string, { count: number; total: number }>();

  for (const p of allProducts) {
    if (archetype.brands.includes(p.brand)) continue; // already primary
    const overlap = p.style.filter(s => tags.includes(s)).length;
    if (overlap > 0) {
      const current = brandScores.get(p.brand) || { count: 0, total: 0 };
      current.count++;
      current.total += overlap;
      brandScores.set(p.brand, current);
    }
  }

  for (const [brand, data] of brandScores) {
    const avgOverlap = data.total / data.count;
    // Convert avgOverlap (0-3) to score (0-70)
    const score = Math.min(70, Math.round((avgOverlap / 3) * 70));
    if (score > 20) {
      affinities.push({
        brand,
        score: 50 + score,
        reason: `Style tag overlap detected (${data.count} products)`,
      });
    }
  }

  return affinities.sort((a, b) => b.score - a.score);
}

/**
 * Lazy import to avoid circular dependency issues at module level.
 * The orchestrator passes the product pool; this is a fallback.
 */
let _productPool: import('./types').Product[] = [];
export function setProductPool(pool: import('./types').Product[]): void {
  _productPool = pool;
}
function getProductPool(): import('./types').Product[] {
  return _productPool;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Build a style profile from archetype selection and user preferences.
 * Always returns a valid ProfileAgentOutput — never throws.
 */
export async function analyzeProfile(input: ProfileAgentInput): Promise<ProfileAgentOutput> {
  const start = Date.now();
  const warnings: string[] = [];

  logger.info(AGENT, 'Analyzing profile', { archetypeId: input.archetypeId });

  try {
    if (!input.archetypeId) {
      warnings.push('No archetype provided — using default profile');
      logger.warn(AGENT, 'Missing archetype, returning default');
      return {
        profile: createDefaultProfile(),
        confidence: MIN_CONFIDENCE,
        warnings,
      };
    }

    // Import data dynamically to keep agent module self-contained
    const { ARCHETYPES } = await import('../data/archetypes');
    const archetype = ARCHETYPES.find((a: Archetype) => a.id === input.archetypeId);

    if (!archetype) {
      warnings.push(`Archetype "${input.archetypeId}" not found — using default`);
      logger.warn(AGENT, 'Unknown archetype', { archetypeId: input.archetypeId });
      return {
        profile: createDefaultProfile(),
        confidence: MIN_CONFIDENCE,
        warnings,
      };
    }

    const brandAffinities = computeBrandAffinities(archetype);
    const tags = ARCHETYPE_TAGS[archetype.id] || [];

    // Adjust confidence based on input quality
    let confidence = 85;
    if (input.preferences?.occasion) confidence += 5;
    if (input.preferences?.budget) confidence += 3;
    if (input.preferences?.styleGoal) confidence += 5;
    if (input.previousOutfits && input.previousOutfits.length > 0) confidence += 5;
    confidence = Math.min(99, confidence);

    const profile: StyleProfile = {
      archetype,
      palette: archetype.colors,
      brandAffinities,
      styleTags: tags,
      confidence,
    };

    logger.info(AGENT, 'Profile built', {
      archetype: archetype.name,
      confidence,
      brands: brandAffinities.length,
      duration: Date.now() - start,
    });

    return { profile, confidence, warnings };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(AGENT, 'Profile analysis failed', { error: msg });
    warnings.push(`Profile analysis error: ${msg}`);
    return {
      profile: createDefaultProfile(),
      confidence: MIN_CONFIDENCE,
      warnings,
    };
  }
}

function createDefaultProfile(): StyleProfile {
  return {
    archetype: {
      id: 'minimalist',
      name: 'Modern Minimalist',
      icon: '⬜',
      colors: ['Black', 'White', 'Beige', 'Grey'],
      brands: ['Zara', 'Massimo Dutti'],
      desc: 'Clean lines, neutral palette, quality over quantity.',
    },
    palette: ['Black', 'White', 'Beige', 'Grey'],
    brandAffinities: [
      { brand: 'Zara', score: 80, reason: 'Default affinity' },
      { brand: 'Massimo Dutti', score: 70, reason: 'Default affinity' },
    ],
    styleTags: ['minimal', 'smart casual', 'everyday', 'office'],
    confidence: MIN_CONFIDENCE,
  };
}

export default { analyzeProfile, setProductPool };
