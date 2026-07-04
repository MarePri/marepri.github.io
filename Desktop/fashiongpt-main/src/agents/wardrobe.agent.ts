// ─── Wardrobe Agent ────────────────────────────────────────────────────────────
// Curates product selections from the available pool based on profile + occasion.
// Never calls other agents — returns curated selections to orchestrator.

import type {
  WardrobeAgentInput,
  WardrobeAgentOutput,
  WardrobeSelection,
  Product,
} from './types';
import * as logger from './logger';

const AGENT = 'WardrobeAgent';
const DEFAULT_BUDGET = 250;

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Match products against style tags from the user's profile and occasion.
 */
function filterByStyleTags(pool: Product[], tags: string[]): Product[] {
  if (tags.length === 0) return pool;
  const lowerTags = tags.map(t => t.toLowerCase());
  return pool.filter(p =>
    p.style.some(s => lowerTags.includes(s.toLowerCase()))
  );
}

/**
 * Filter products by category, returning best matches sorted by style relevance.
 */
function filterByCategory(
  pool: Product[],
  category: string,
  styleTags: string[],
  count: number
): Product[] {
  const candidates = pool.filter(p => p.cat.toLowerCase() === category.toLowerCase());
  if (candidates.length === 0) return [];

  // Score by style tag overlap, then sort
  const scored = candidates.map(p => {
    const overlap = p.style.filter(s =>
      styleTags.some(t => t.toLowerCase() === s.toLowerCase())
    ).length;
    return { product: p, score: overlap * 10 + (p.trend || 50) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.product);
}

/**
 * Select the best single product for a category within budget.
 * Returns null if no affordable product exists.
 */
function pickAffordable(
  pool: Product[],
  category: string,
  styleTags: string[],
  maxPrice: number,
  styleGoalContext?: { colorBoost: 'colorful' | 'neutral' | null; priceSensitivity: number } | null
): Product | null {
  const candidates = pool.filter(
    p => p.cat.toLowerCase() === category.toLowerCase() && p.price <= maxPrice
  );
  if (candidates.length === 0) return null;

  // Score by style tag overlap + trendiness + small random jitter
  const scored = candidates.map(p => {
    const overlap = p.style.filter(s =>
      styleTags.some(t => t.toLowerCase() === s.toLowerCase())
    ).length;
    // Style tag match score
    let score = overlap * 15 + (p.trend || 50);
    // Price penalty (modulated by price sensitivity from user feedback)
    const priceFactor = styleGoalContext?.priceSensitivity ?? 1.0;
    score -= p.price * 0.1 * priceFactor;
    // Color boost from user feedback ("more colorful" / "neutral")
    if (styleGoalContext?.colorBoost === 'colorful') {
      const neutrals = ['Black','White','Beige','Grey','Cream','Ivory','Ecru','Champagne','Tan','Sand','Camel','Charcoal','Slate','Navy'];
      const isNeutral = neutrals.some(n => p.color.toLowerCase().includes(n.toLowerCase()));
      score += isNeutral ? -8 : 12; // penalize neutrals, boost colors
    } else if (styleGoalContext?.colorBoost === 'neutral') {
      const neutrals = ['Black','White','Beige','Grey','Cream','Ivory','Ecru','Champagne','Tan','Sand','Camel','Charcoal','Slate','Navy'];
      const isNeutral = neutrals.some(n => p.color.toLowerCase().includes(n.toLowerCase()));
      score += isNeutral ? 12 : -8;
    }
    // Jitter ensures variety between generations while favoring best matches
    score += (Math.random() - 0.5) * 10;
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].product;
}

// ─── Style Goal Intent Parsing ────────────────────────────────────────────────

/**
 * Parse styleGoal text for intent keywords and return score adjustments + category hints.
 * This is how user feedback ("more colorful", "formal", "cheaper") influences product selection.
 */
function parseStyleGoalIntent(styleGoal: string | undefined): {
  /** Score boost/penalty for products matching certain color types */
  colorBoost: 'colorful' | 'neutral' | null;
  /** Score boost for products matching certain style tags */
  styleBoost: string[];
  /** Categories to add to preferred list */
  extraCategories: string[];
  /** Price sensitivity multiplier (>1 = prefer cheaper) */
  priceSensitivity: number;
} {
  const result = {
    colorBoost: null as 'colorful' | 'neutral' | null,
    styleBoost: [] as string[],
    extraCategories: [] as string[],
    priceSensitivity: 1.0,
  };

  if (!styleGoal) return result;

  const lower = styleGoal.toLowerCase();

  // Color intent
  if (/colorful|vibrant|bright|bold|pop/i.test(lower)) result.colorBoost = 'colorful';
  if (/neutral|minimal|muted|subtle|monochrome/i.test(lower)) result.colorBoost = 'neutral';

  // Style intent
  if (/formal|professional|office|sharp|tailored/i.test(lower)) result.styleBoost.push('office', 'formal', 'smart casual');
  if (/casual|relaxed|comfortable|everyday/i.test(lower)) result.styleBoost.push('casual', 'everyday', 'weekend');
  if (/edgy|bold|statement|avant/i.test(lower)) result.styleBoost.push('streetwear', 'concert', 'festival');
  if (/romantic|feminine|soft|elegant/i.test(lower)) result.styleBoost.push('romantic', 'date', 'evening', 'wedding');
  if (/sport|athletic|gym|active/i.test(lower)) result.styleBoost.push('sport', 'gym', 'wellness');

  // Category intent
  if (/accessor|jewelry|bag|belt|hat/i.test(lower) && !result.extraCategories.includes('Accessories'))
    result.extraCategories.push('Accessories');
  if (/jacket|coat|outerwear|layer/i.test(lower) && !result.extraCategories.includes('Outerwear'))
    result.extraCategories.push('Outerwear');
  if (/shoe|sneaker|boot|heel|footwear/i.test(lower) && !result.extraCategories.includes('Shoes'))
    result.extraCategories.push('Shoes');
  if (/dress|skirt/i.test(lower) && !result.extraCategories.includes('Dresses'))
    result.extraCategories.push('Dresses');
  if (/top|shirt|blouse|tee/i.test(lower) && !result.extraCategories.includes('Tops'))
    result.extraCategories.push('Tops');
  if (/bottom|pant|jean|short|trouser/i.test(lower) && !result.extraCategories.includes('Bottoms'))
    result.extraCategories.push('Bottoms');

  // Price intent
  if (/cheap|affordable|budget|cheaper|inexpensive|bargain|save/i.test(lower)) result.priceSensitivity = 2.0;
  if (/premium|luxury|designer|expensive|investment|quality/i.test(lower)) result.priceSensitivity = 0.3;

  return result;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Curate a set of product selections given profile, occasion, and budget.
 * Always returns a valid WardrobeAgentOutput — never throws.
 */
export async function curateWardrobe(input: WardrobeAgentInput): Promise<WardrobeAgentOutput> {
  const start = Date.now();
  const warnings: string[] = [];

  logger.info(AGENT, 'Curating wardrobe', {
    occasion: input.occasion,
    budget: input.budget,
    profile: input.profile.archetype.id,
  });

  try {
    // Import product pool
    const { PRODUCTS } = await import('../data/products');
    const pool: Product[] = PRODUCTS;

    // Determine effective budget
    const effectiveBudget = input.budget ?? DEFAULT_BUDGET;
    let remaining = effectiveBudget;

    // Build style tags from profile + occasion classification
    const styleTags = [...input.profile.styleTags];

    // Try importing occasion map for additional tags
    try {
      const { OCCASION_MAP } = await import('../data/occasionMap');
      for (const [, entry] of Object.entries(OCCASION_MAP)) {
        const e = entry as { keywords: string[]; styleTags: string[] };
        if (e.keywords.some(k => input.occasion.toLowerCase().includes(k))) {
          for (const tag of e.styleTags) {
            if (!styleTags.includes(tag)) styleTags.push(tag);
          }
        }
      }
    } catch {
      logger.warn(AGENT, 'Could not load occasion map');
    }

    // Parse styleGoal/user feedback for intent-driven adjustments
    let styleGoalContext = null as {
      colorBoost: 'colorful' | 'neutral' | null;
      styleBoost: string[];
      priceSensitivity: number;
    } | null;
    if (input.styleGoal) {
      const intent = parseStyleGoalIntent(input.styleGoal);
      // Extend style tags with intent-derived style tags
      for (const tag of intent.styleBoost) {
        if (!styleTags.includes(tag)) styleTags.push(tag);
      }
      // Extend preferred categories with intent-derived categories
      for (const cat of intent.extraCategories) {
        if (!input.preferredCategories.includes(cat)) {
          (input.preferredCategories as string[]).push(cat);
        }
      }
      styleGoalContext = {
        colorBoost: intent.colorBoost,
        styleBoost: intent.styleBoost,
        priceSensitivity: intent.priceSensitivity,
      };
      if (intent.priceSensitivity !== 1.0 || intent.colorBoost || intent.styleBoost.length > 0) {
        logger.info(AGENT, 'StyleGoal intent applied', {
          colorBoost: intent.colorBoost,
          styleBoost: intent.styleBoost,
          priceSensitivity: intent.priceSensitivity,
          extraCategories: intent.extraCategories,
        });
      }
    }

    // Filter pool by style tags
    const filtered = filterByStyleTags(pool, styleTags);
    if (filtered.length === 0) {
      warnings.push('No products matched style tags — using unfiltered pool');
    }
    const workPool = filtered.length > 0 ? filtered : pool;

    // Determine categories to fill: required first, then preferred
    const categories = [
      ...input.requiredCategories.map(c => ({ cat: c, required: true })),
      ...input.preferredCategories
        .filter(c => !input.requiredCategories.includes(c))
        .map(c => ({ cat: c, required: false })),
    ];

    const selections: WardrobeSelection[] = [];
    const categoryCoverage: Record<string, boolean> = {};
    let fallbackApplied = false;

    // Phase 1: Fill required categories
    for (const { cat, required } of categories) {
      const product = pickAffordable(workPool, cat, styleTags, remaining, styleGoalContext);

      if (product) {
        selections.push({
          product,
          reason: `Best match for ${cat} matching "${input.profile.archetype.name}" style`,
          category: cat,
        });
        categoryCoverage[cat] = true;
        remaining -= product.price;
      } else if (required) {
        // Fallback: try from full pool without style filter
        const fallback = pickAffordable(pool, cat, styleTags, remaining, styleGoalContext);
        if (fallback) {
          selections.push({
            product: fallback,
            reason: `Fallback — no style match found for ${cat}`,
            category: cat,
          });
          categoryCoverage[cat] = true;
          remaining -= fallback.price;
          fallbackApplied = true;
          warnings.push(`Fallback used for required category: ${cat}`);
        } else {
          categoryCoverage[cat] = false;
          warnings.push(`Could not fill required category: ${cat}`);
        }
      }
    }

    const totalCost = selections.reduce((s, sel) => s + sel.product.price, 0);

    logger.info(AGENT, 'Wardrobe curated', {
      selections: selections.length,
      totalCost,
      budgetRemaining: remaining,
      fallbackApplied,
      duration: Date.now() - start,
    });

    return {
      selections,
      totalCost,
      categoryCoverage,
      budgetRemaining: remaining,
      fallbackApplied,
      warnings,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(AGENT, 'Wardrobe curation failed', { error: msg });
    warnings.push(`Wardrobe error: ${msg}`);
    return {
      selections: [],
      totalCost: 0,
      categoryCoverage: {},
      budgetRemaining: input.budget ?? DEFAULT_BUDGET,
      fallbackApplied: true,
      warnings,
    };
  }
}

export default { curateWardrobe };
