import { PRODUCTS } from '../data/products.js';
import { extractBudget } from './budget.js';
import { classifyOccasion, OCCASION_MAP } from '../data/occasionMap.js';
import { computeColorHarmony } from './colorHarmony';

// ─── SCORING ───────────────────────────────────────────────────────────────────

/**
 * Compute a style relevance score for a product given an occasion.
 * @param {import('../types/index.js').Product} product
 * @param {string[]} occasionTypes
 * @returns {number} 0–100
 */
function computeStyleScore(product, occasionTypes) {
  const productTags = (product.style || []).map(t => t.toLowerCase());

  // Collect all relevant style tags from occasion types
  const relevantTags = new Set();
  for (const occType of occasionTypes) {
    const entry = OCCASION_MAP[occType];
    if (entry) {
      entry.styleTags.forEach(t => relevantTags.add(t.toLowerCase()));
    }
  }

  if (relevantTags.size === 0) return 70;

  const matchCount = productTags.filter(t => relevantTags.has(t)).length;
  const maxPossible = Math.min(productTags.length, relevantTags.size);
  if (maxPossible === 0) return 50;

  return Math.round(50 + (matchCount / maxPossible) * 45); // 50–95 range
}

/**
 * Compute a versatility score for a product based on how many style tags it has.
 * @param {import('../types/index.js').Product} product
 * @returns {number} 0–100
 */
function computeVersatilityScore(product) {
  const tagCount = (product.style || []).length;
  // Products with 3+ style tags are most versatile
  if (tagCount >= 4) return 90;
  if (tagCount === 3) return 80;
  if (tagCount === 2) return 65;
  return 50;
}

/**
 * Compute all scores for an outfit.
 * @param {import('../types/index.js').Product[]} items
 * @param {string[]} occasionTypes
 * @returns {Object}
 */
function computeOutfitScores(items, occasionTypes) {
  if (!items || items.length === 0) {
    return { Style: 75, Trend: 75, Versatility: 75, ColorHarmony: 80 };
  }

  const styleScores = items.map(p => computeStyleScore(p, occasionTypes));
  const trendScores = items.map(p => p.trend || 75);
  const versatilityScores = items.map(p => computeVersatilityScore(p));

  const avg = arr => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);

  return {
    Style: avg(styleScores),
    Trend: avg(trendScores),
    Versatility: avg(versatilityScores),
    ColorHarmony: computeColorHarmony(items),
  };
}

// ─── FILTERING ─────────────────────────────────────────────────────────────────

/**
 * Filter product pool based on occasion classification.
 * @param {import('../types/index.js').Product[]} pool
 * @param {string} occasion
 * @returns {{ pool: import('../types/index.js').Product[], occasionTypes: string[] }}
 */
function filterByOccasion(pool, occasion) {
  const occasionTypes = classifyOccasion(occasion || '');
  const relevantTags = new Set();
  for (const occType of occasionTypes) {
    const entry = OCCASION_MAP[occType];
    if (entry) {
      entry.styleTags.forEach(t => relevantTags.add(t.toLowerCase()));
    }
  }

  if (relevantTags.size === 0) {
    return { pool, occasionTypes };
  }

  const filtered = pool.filter(p => {
    const tags = (p.style || []).map(t => t.toLowerCase());
    return tags.some(t => relevantTags.has(t));
  });

  return { pool: filtered.length > 0 ? filtered : pool, occasionTypes };
}

/**
 * Select items within budget, sorted by price ascending for optimal value.
 * @param {import('../types/index.js').Product[]} pool
 * @param {number|null} budget
 * @returns {import('../types/index.js').Product[]}
 */
function selectWithinBudget(pool, budget) {
  const tops = pool.filter(p => p.cat === 'Tops' || p.cat === 'Dresses').sort((a, b) => a.price - b.price);
  const bottoms = pool.filter(p => p.cat === 'Bottoms').sort((a, b) => a.price - b.price);
  const shoes = pool.filter(p => p.cat === 'Shoes').sort((a, b) => a.price - b.price);
  const bags = pool.filter(p => p.cat === 'Bags' || p.cat === 'Accessories').sort((a, b) => a.price - b.price);

  const allShoes = PRODUCTS.filter(p => p.cat === 'Shoes').sort((a, b) => a.price - b.price);
  const allBags = PRODUCTS.filter(p => p.cat === 'Bags').sort((a, b) => a.price - b.price);
  const allTops = PRODUCTS.filter(p => p.cat === 'Tops').sort((a, b) => a.price - b.price);
  const allBottoms = PRODUCTS.filter(p => p.cat === 'Bottoms').sort((a, b) => a.price - b.price);

  if (!budget) {
    // No budget — random pick (original behavior)
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const top = pick(tops.length ? tops : allTops);
    const isDress = top?.cat === 'Dresses';
    return [top, !isDress && pick(bottoms.length ? bottoms : allBottoms), pick(shoes.length ? shoes : allShoes), pick(bags.length ? bags : allBags)].filter(Boolean);
  }

  // Budget mode — pick cheapest that fits
  const top = tops.length ? tops[0] : allTops[0];
  if (!top) return [];
  const isDress = top.cat === 'Dresses';

  let remaining = budget - top.price;
  const picks = [top];

  if (!isDress) {
    const bottom = bottoms.length ? bottoms[0] : allBottoms[0];
    if (bottom && bottom.price <= remaining) {
      picks.push(bottom);
      remaining -= bottom.price;
    }
  }

  const shoe = shoes.length ? shoes[0] : allShoes[0];
  if (shoe && shoe.price <= remaining) {
    picks.push(shoe);
    remaining -= shoe.price;
  }

  const bag = bags.length ? bags[0] : allBags[0];
  if (bag && bag.price <= remaining) {
    picks.push(bag);
  }

  return picks;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Parse outfit from AI text + product pool, respecting budget constraints.
 * @param {string} text - AI response text
 * @param {string} occasion - Occasion description
 * @param {number|null} [budget] - Max total price
 * @returns {import('../types/index.js').Outfit}
 */
export function parseOutfitFromProducts(text, occasion, budget) {
  const resolvedBudget = budget || extractBudget(text || occasion || '');
  const { pool, occasionTypes } = filterByOccasion(PRODUCTS, occasion || text || '');
  const items = selectWithinBudget(pool, resolvedBudget);
  const scores = computeOutfitScores(items, occasionTypes);
  return { items, scores };
}

/**
 * Generate a complete offline outfit without calling any AI API.
 * @param {string} occasion
 * @param {number|null} [budget]
 * @returns {import('../types/index.js').Outfit}
 */
export function generateOfflineOutfit(occasion, budget) {
  return parseOutfitFromProducts('', occasion, budget);
}
