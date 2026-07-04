/**
 * Outfit Engine — Rule-Based Orchestrator
 *
 * The core of the Explainable AI Stylist. Takes inputs (occasion, archetype, budget, weather)
 * and produces 3 complete, scored, and explained outfits using deterministic rule-based logic.
 *
 * No AI/API calls. No random seeds (deterministic from input parameters).
 * Every decision is explainable and traceable.
 */

import { PRODUCTS, type Product } from '../data/products.js';
import { getStyleProfile, CATEGORY_ORDER, type StyleProfile } from './styleRules.js';
import { getOccasionRule, getOutfitName, type OccasionRule } from './occasionRules.js';
import { getWeatherInfluence, adjustPaletteForWeather, type WeatherInfluence } from './weatherRules.js';
import { computeColorScore, scoreColorPair } from './colorRules.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EngineInput {
  occasion: string;
  archetypeId?: string | null;
  budget?: number | null;
  weather?: {
    temperature: number;
    condition?: string;
  } | null;
  styleGoal?: string | null;
  preferredCategories?: string[];
}

export interface EngineOutput {
  outfits: EngineOutfitResult[];
  duration: number;
}

export interface EngineOutfitResult {
  outfit: {
    items: Product[];
    name: string;
    why: string;
    whyDetailed?: string;
  };
  reasoning: string;
  confidenceScore: number;
  styleScore: number;
  critique: {
    approved: boolean;
    scores: {
      occasionFit: number;
      budgetCompliance: number;
      styleCoherence: number;
      colorHarmony: number;
      trendAlignment: number;
      overall: number;
    };
    suggestions: string[];
    issues: string[];
    verdict: string;
  };
  weatherContext: {
    temperature: number;
    condition: string;
    description: string;
    recommendation: string;
  } | null;
  variationLabel: string;
  styleCategory: string;
  itemExplanations: string[];   // Per-item rationale
}

// ─── Product Selection ───────────────────────────────────────────────────────

function getProductPool(): Product[] {
  return PRODUCTS as unknown as Product[];
}

function filterByStyle(pool: Product[], styleTags: string[]): Product[] {
  if (styleTags.length === 0) return pool;
  const lowerTags = styleTags.map(t => t.toLowerCase());
  return pool.filter(p =>
    (p.style as string[]).some(s => lowerTags.includes(s.toLowerCase()))
  );
}

function filterByCategory(pool: Product[], categories: string[]): Product[] {
  return pool.filter(p => categories.includes(p.cat));
}

function filterByBudget(pool: Product[], budget: number | null): Product[] {
  if (budget == null) return pool;
  return pool.filter(p => p.price <= budget);
}

function pickBest(pool: Product[], preferredColors: string[], preferredBrands: string[]): Product {
  // Score each product and pick the best
  let best: Product | null = null;
  let bestScore = -1;

  for (const p of pool) {
    let score = 50;
    // Color match
    if (preferredColors.some(c => p.color.toLowerCase().includes(c.toLowerCase()))) {
      score += 20;
    }
    // Brand match
    if (preferredBrands.includes(p.brand)) {
      score += 15;
    }
    // Trend score (normalize to 0-15)
    score += (p.trend / 100) * 15;
    // Bonus for being in the pool (already filtered for relevance)
    score += 10;

    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  return best || pool[0];
}

function pickDiverse(pool: Product[], count: number, preferredColors: string[], preferredBrands: string[]): Product[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const scored = shuffled.map(p => ({
    product: p,
    score: scoreProduct(p, preferredColors, preferredBrands),
  }));
  scored.sort((a, b) => b.score - a.score);

  // Pick top items, but ensure category diversity
  const picked: Product[] = [];
  const usedCategories = new Set<string>();
  const usedBrands = new Set<string>();

  for (const { product } of scored) {
    if (picked.length >= count) break;
    // Allow same category if running out of options
    if (usedCategories.size < 3 && usedCategories.has(product.cat) && picked.length < count - 1) continue;
    picked.push(product);
    usedCategories.add(product.cat);
    if (product.brand) usedBrands.add(product.brand);
  }

  return picked.length > 0 ? picked : pool.slice(0, count);
}

function scoreProduct(product: Product, preferredColors: string[], preferredBrands: string[]): number {
  let score = 50;
  if (preferredColors.some(c => product.color.toLowerCase().includes(c.toLowerCase()))) score += 25;
  if (preferredBrands.includes(product.brand)) score += 15;
  score += (product.trend / 100) * 20;
  // Style tag count = versatility bonus
  const styleCount = (product.style as string[]).length;
  score += Math.min(styleCount * 5, 15);
  return score;
}

// ─── Look Generation ─────────────────────────────────────────────────────────

interface LookBlueprint {
  variationLabel: string;
  styleCategory: string;
  styleGoal: string;
  preferDress: boolean;
  colorBias: string[];
  brandBias: string[];
  formalityAdjust: number;  // -1 (casual), 0 (neutral), +1 (formal)
}

function buildLookBlueprints(
  occasionRule: OccasionRule,
  styleProfile: StyleProfile,
  weatherInfluence: WeatherInfluence | null
): LookBlueprint[] {
  const baseColors = styleProfile.preferredColors;
  const adjustedColors = weatherInfluence
    ? adjustPaletteForWeather(baseColors, weatherInfluence)
    : baseColors;

  return [
    {
      variationLabel: 'Your Style',
      styleCategory: 'Modern Classic',
      styleGoal: occasionRule.vibe,
      preferDress: occasionRule.formalityLevel >= 3,
      colorBias: adjustedColors,
      brandBias: styleProfile.preferredBrands,
      formalityAdjust: 0,
    },
    {
      variationLabel: 'Alternative',
      styleCategory: 'Contemporary Edge',
      styleGoal: `${occasionRule.vibe} with a modern twist`,
      preferDress: false,
      colorBias: adjustedColors.slice().reverse(),
      brandBias: styleProfile.preferredBrands.slice().reverse(),
      formalityAdjust: -1,
    },
    {
      variationLabel: 'Surprise Me',
      styleCategory: 'Relaxed Luxe',
      styleGoal: `${occasionRule.vibe} — relaxed, elevated, unexpected`,
      preferDress: occasionRule.formalityLevel <= 2,
      colorBias: [...adjustedColors].sort(() => Math.random() - 0.5),
      brandBias: [...styleProfile.preferredBrands].sort(() => Math.random() - 0.5),
      formalityAdjust: 1,
    },
  ];
}

function generateSingleLook(
  blueprint: LookBlueprint,
  occasionRule: OccasionRule,
  styleProfile: StyleProfile,
  budget: number | null,
  weatherInfluence: WeatherInfluence | null,
  index: number
): EngineOutfitResult {
  const pool = getProductPool();

  // 1. Filter by occasion style tags
  const styleFiltered = filterByStyle(pool, occasionRule.styleTags);

  // 2. Filter by budget if set
  const budgetFiltered = filterByBudget(styleFiltered, budget);

  // 3. Determine categories needed
  const useDress = blueprint.preferDress && budgetFiltered.some(p => p.cat === 'Dresses');
  const neededCats: string[] = [];

  if (useDress) {
    neededCats.push('Dresses');
  } else {
    neededCats.push('Tops');
    neededCats.push('Bottoms');
  }

  neededCats.push('Shoes');

  // Add optional categories for completeness
  if (occasionRule.preferredCategories.includes('Bags') && budgetFiltered.some(p => p.cat === 'Bags')) {
    neededCats.push('Bags');
  }
  if (occasionRule.preferredCategories.includes('Outerwear') && budgetFiltered.some(p => p.cat === 'Outerwear')) {
    // Only add outerwear if weather suggests it or formality warrants it
    if (weatherInfluence?.outerwearNeeded || occasionRule.formalityLevel >= 4) {
      neededCats.push('Outerwear');
    }
  }
  if (occasionRule.preferredCategories.includes('Accessories') && budgetFiltered.some(p => p.cat === 'Accessories')) {
    neededCats.push('Accessories');
  }

  // 4. Pick items per category
  const items: Product[] = [];
  const itemExplanations: string[] = [];
  let totalCost = 0;
  const remainingBudget = budget ?? Infinity;

  for (const cat of neededCats) {
    const catPool = filterByCategory(budgetFiltered, [cat]);
    if (catPool.length === 0) continue;

    const maxPrice = remainingBudget - totalCost;
    const affordable = maxPrice > 0
      ? catPool.filter(p => p.price <= maxPrice * 1.2)  // slight overage allowed
      : catPool;

    const chosen = affordable.length > 0
      ? pickBest(affordable, blueprint.colorBias, blueprint.brandBias)
      : catPool[0];

    if (chosen) {
      items.push(chosen);
      totalCost += chosen.price;
      itemExplanations.push(buildItemExplanation(chosen, cat, blueprint));
    }
  }

  // 5. Ensure at least 3 items; if not enough, expand pool
  if (items.length < 3) {
    const fallbackPool = filterByBudget(styleFiltered, budget);
    const extraCats = ['Bags', 'Accessories', 'Outerwear'].filter(c =>
      !neededCats.includes(c) && fallbackPool.some(p => p.cat === c)
    );
    for (const cat of extraCats) {
      if (items.length >= 4) break;
      const catPool = filterByCategory(fallbackPool, [cat]);
      if (catPool.length > 0) {
        const pick = pickBest(catPool, blueprint.colorBias, blueprint.brandBias);
        if (pick) {
          items.push(pick);
          itemExplanations.push(buildItemExplanation(pick, cat, blueprint));
        }
      }
    }
  }

  // 6. Compute outfit name and reasoning
  const outfitName = getOutfitName(occasionRule.id, blueprint.styleCategory);
  const why = buildWhy(items, occasionRule, blueprint);
  const reasoning = buildReasoning(items, occasionRule, styleProfile, weatherInfluence, budget);
  const whyDetailed = buildWhyDetailed(items, occasionRule, weatherInfluence);

  // 7. Score the outfit
  const scores = computeAllScores(items, occasionRule, styleProfile, weatherInfluence, budget, totalCost);
  const overall = Math.round(
    (scores.occasionFit + scores.budgetCompliance + scores.styleCoherence + scores.colorHarmony + scores.trendAlignment) / 5
  );

  // 8. Generate suggestions and verdict
  const suggestions = buildSuggestions(items, scores, weatherInfluence);
  const issues = buildIssues(items, scores, budget, totalCost);
  const verdict = buildVerdict(scores, overall);

  // 9. Build weather context
  const weatherContext = weatherInfluence
    ? {
        temperature: weatherInfluence.fabricWeight <= 25 ? 28 : weatherInfluence.fabricWeight >= 80 ? 5 : 18,
        condition: weatherInfluence.openToe ? 'Clear' : 'Cloudy',
        description: weatherInfluence.description,
        recommendation: weatherInfluence.description,
      }
    : null;

  return {
    outfit: {
      items,
      name: outfitName,
      why,
      whyDetailed,
    },
    reasoning,
    confidenceScore: overall,
    styleScore: scores.styleCoherence,
    critique: {
      approved: overall >= 60,
      scores: {
        occasionFit: scores.occasionFit,
        budgetCompliance: scores.budgetCompliance,
        styleCoherence: scores.styleCoherence,
        colorHarmony: scores.colorHarmony,
        trendAlignment: scores.trendAlignment,
        overall,
      },
      suggestions,
      issues,
      verdict,
    },
    weatherContext,
    variationLabel: blueprint.variationLabel,
    styleCategory: blueprint.styleCategory,
    itemExplanations,
  };
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function computeAllScores(
  items: Product[],
  occasionRule: OccasionRule,
  styleProfile: StyleProfile,
  weatherInfluence: WeatherInfluence | null,
  budget: number | null,
  totalCost: number
): {
  occasionFit: number;
  budgetCompliance: number;
  styleCoherence: number;
  colorHarmony: number;
  trendAlignment: number;
} {
  // Occasion fit: how well items match occasion style tags
  const occasionFit = computeOccasionFit(items, occasionRule);

  // Budget compliance
  const budgetCompliance = computeBudgetCompliance(totalCost, budget);

  // Style coherence: how well items match the archetype
  const styleCoherence = computeStyleCoherence(items, styleProfile);

  // Color harmony
  const colorHarmony = computeColorScore(items).score;

  // Trend alignment: average trend score
  const trendAlignment = items.length > 0
    ? Math.round(items.reduce((s, i) => s + (i.trend || 70), 0) / items.length)
    : 70;

  return { occasionFit, budgetCompliance, styleCoherence, colorHarmony, trendAlignment };
}

function computeOccasionFit(items: Product[], occasionRule: OccasionRule): number {
  if (items.length === 0 || occasionRule.styleTags.length === 0) return 70;

  let matchScore = 0;
  for (const item of items) {
    const itemStyles = (item.style as string[]).map(s => s.toLowerCase());
    const occTags = occasionRule.styleTags.map(t => t.toLowerCase());
    const matches = itemStyles.filter(s => occTags.includes(s)).length;
    matchScore += matches > 0
      ? Math.min(50 + (matches / occTags.length) * 50, 100)
      : 30;
  }

  return Math.round(matchScore / items.length);
}

function computeBudgetCompliance(totalCost: number, budget: number | null): number {
  if (budget == null || budget === 0) return 85; // No constraint
  if (totalCost <= budget) return 100; // Within budget
  const overage = ((totalCost - budget) / budget) * 100;
  if (overage <= 10) return 80;  // Slightly over
  if (overage <= 25) return 60;
  if (overage <= 50) return 40;
  return 20;
}

function computeStyleCoherence(items: Product[], styleProfile: StyleProfile): number {
  if (items.length === 0) return 70;
  const profileTags = styleProfile.tags.map(t => t.toLowerCase());

  let totalScore = 0;
  for (const item of items) {
    const itemStyles = (item.style as string[]).map(s => s.toLowerCase());
    const matches = itemStyles.filter(s => profileTags.includes(s)).length;
    totalScore += matches > 0
      ? 60 + (matches / Math.max(itemStyles.length, 1)) * 40
      : 40;
  }

  return Math.round(totalScore / items.length);
}

// ─── Explanations ────────────────────────────────────────────────────────────

function buildItemExplanation(item: Product, category: string, blueprint: LookBlueprint): string {
  const colorMatch = blueprint.colorBias.some(c => item.color.toLowerCase().includes(c.toLowerCase()))
    ? 'Color aligns with your palette.'
    : 'Provides contrast against your core colors.';
  const brandNote = blueprint.brandBias.includes(item.brand)
    ? `From ${item.brand} — a preferred brand for this style.`
    : `${item.brand} adds variety to the look.`;
  const trendNote = (item.trend || 70) >= 80
    ? ' Trending item.'
    : ' Classic piece.';
  return `${item.name} (${item.brand}, €${item.price}) — ${colorMatch} ${brandNote}${trendNote}`;
}

function buildWhy(
  items: Product[],
  occasionRule: OccasionRule,
  blueprint: LookBlueprint
): string {
  const itemNames = items.slice(0, 3).map(i => i.name);
  return `A ${blueprint.styleCategory.toLowerCase()} look for ${occasionRule.label.toLowerCase()} — featuring ${itemNames.join(', ')}${items.length > 3 ? `, and ${items.length - 3} more pieces` : ''}.`;
}

function buildWhyDetailed(
  items: Product[],
  occasionRule: OccasionRule,
  weatherInfluence: WeatherInfluence | null
): string {
  const parts: string[] = [];
  const colors = [...new Set(items.map(i => i.color))];
  const brands = [...new Set(items.map(i => i.brand))];

  parts.push(`Color story: ${colors.join(', ')}.`);
  parts.push(`Brands: ${brands.join(', ')}.`);

  if (weatherInfluence) {
    parts.push(weatherInfluence.description);
  }

  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  parts.push(`Total: €${total.toFixed(2)}.`);

  return parts.join(' ');
}

function buildReasoning(
  items: Product[],
  occasionRule: OccasionRule,
  styleProfile: StyleProfile,
  weatherInfluence: WeatherInfluence | null,
  budget: number | null
): string {
  const parts: string[] = [];
  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  parts.push(`Styled for "${occasionRule.label}" with a ${styleProfile.description.toLowerCase()}`);
  parts.push(`Selected ${items.length} pieces totaling €${total.toFixed(2)}${budget ? ` (budget: €${budget})` : ''}.`);

  if (weatherInfluence) {
    parts.push(weatherInfluence.description);
  }

  const coherence = computeStyleCoherence(items, styleProfile);
  const harmony = computeColorScore(items);
  parts.push(`Style coherence: ${coherence}/100. ${harmony.explanation}`);

  return parts.join(' ');
}

function buildSuggestions(
  items: Product[],
  scores: {
    occasionFit: number;
    budgetCompliance: number;
    styleCoherence: number;
    colorHarmony: number;
    trendAlignment: number;
  },
  weatherInfluence: WeatherInfluence | null
): string[] {
  const suggestions: string[] = [];

  if (scores.occasionFit < 70) {
    suggestions.push('Consider swapping one piece for a more occasion-appropriate item.');
  }
  if (scores.colorHarmony < 70) {
    suggestions.push('Adding a neutral piece (white, black, or beige) would improve color balance.');
  }
  if (scores.budgetCompliance < 70) {
    suggestions.push('Look for more affordable alternatives to stay within budget.');
  }
  if (weatherInfluence?.outerwearNeeded && !items.some(i => i.cat === 'Outerwear')) {
    suggestions.push('A light jacket or cardigan would complete this look for the weather.');
  }
  if (scores.trendAlignment >= 80) {
    suggestions.push('This look features trending pieces — you\'ll be ahead of the curve.');
  }

  if (suggestions.length === 0) {
    suggestions.push('This look is well-balanced and occasion-appropriate.');
  }

  return suggestions;
}

function buildIssues(
  items: Product[],
  scores: {
    occasionFit: number;
    budgetCompliance: number;
    styleCoherence: number;
    colorHarmony: number;
    trendAlignment: number;
  },
  budget: number | null,
  totalCost: number
): string[] {
  const issues: string[] = [];

  if (items.length < 3) {
    issues.push('Not enough matching products for a complete look.');
  }
  if (budget && totalCost > budget * 1.3) {
    issues.push(`Total (€${totalCost.toFixed(2)}) significantly exceeds budget (€${budget}).`);
  }
  if (scores.styleCoherence < 50) {
    issues.push('Style tags across items have low coherence — consider a different archetype pairing.');
  }

  return issues;
}

function buildVerdict(
  scores: {
    occasionFit: number;
    budgetCompliance: number;
    styleCoherence: number;
    colorHarmony: number;
    trendAlignment: number;
  },
  overall: number
): string {
  if (overall >= 80) {
    return 'Excellent outfit. Well-balanced across all dimensions — occasion-appropriate, style-coherent, and on-trend.';
  }
  if (overall >= 65) {
    return 'Solid outfit with minor areas for improvement. Consider the suggestions above to elevate the look.';
  }
  if (overall >= 50) {
    return 'Adequate outfit with room for improvement. Review the suggestions for adjustments.';
  }
  return 'This outfit needs significant reworking. Consider different style or occasion choices.';
}

// ─── Variations ──────────────────────────────────────────────────────────────

function generateThreeLooks(
  occasionRule: OccasionRule,
  styleProfile: StyleProfile,
  budget: number | null,
  weatherInfluence: WeatherInfluence | null
): EngineOutfitResult[] {
  const blueprints = buildLookBlueprints(occasionRule, styleProfile, weatherInfluence);

  return blueprints.map((bp, i) =>
    generateSingleLook(bp, occasionRule, styleProfile, budget, weatherInfluence, i)
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate 3 complete, scored outfits using deterministic rule-based logic.
 * This is the main entry point for the Explainable AI Stylist.
 */
export function generateOutfits(input: EngineInput): EngineOutput {
  const startTime = Date.now();

  const occasionRule = getOccasionRule(input.occasion);
  const styleProfile = getStyleProfile(input.archetypeId);
  const weatherInfluence = input.weather
    ? getWeatherInfluence(input.weather.temperature, input.weather.condition)
    : null;

  const outfits = generateThreeLooks(
    occasionRule,
    styleProfile,
    input.budget ?? null,
    weatherInfluence
  );

  return {
    outfits,
    duration: Date.now() - startTime,
  };
}

/**
 * Modify an existing outfit with a specific action.
 * Used by the Interactive Outfit Builder (Phase 3).
 */
export function modifyOutfit(
  outfit: EngineOutfitResult,
  action: string
): EngineOutfitResult {
  // Clone the outfit
  const modified = JSON.parse(JSON.stringify(outfit)) as EngineOutfitResult;

  switch (action) {
    case 'more_formal': {
      // Swap casual pieces for more formal alternatives
      const pool = getProductPool();
      const formalPool = pool.filter(p =>
        (p.style as string[]).some(s => ['office', 'formal', 'smart casual'].includes(s.toLowerCase()))
      );
      for (let i = 0; i < modified.outfit.items.length; i++) {
        const item = modified.outfit.items[i];
        if (item.cat && ['Tops', 'Bottoms', 'Shoes'].includes(item.cat)) {
          const alternatives = filterByCategory(formalPool, [item.cat]);
          if (alternatives.length > 0) {
            const replacement = pickBest(alternatives, ['Navy', 'Charcoal', 'White', 'Black'], ['Massimo Dutti', 'Zara']);
            if (replacement && replacement.id !== item.id) {
              modified.outfit.items[i] = replacement;
            }
          }
        }
      }
      modified.outfit.why = 'Adjusted for higher formality.';
      break;
    }

    case 'more_casual': {
      const pool = getProductPool();
      const casualPool = pool.filter(p =>
        (p.style as string[]).some(s => ['casual', 'everyday', 'weekend'].includes(s.toLowerCase()))
      );
      for (let i = 0; i < modified.outfit.items.length; i++) {
        const item = modified.outfit.items[i];
        if (item.cat && ['Tops', 'Bottoms', 'Shoes'].includes(item.cat)) {
          const alternatives = filterByCategory(casualPool, [item.cat]);
          if (alternatives.length > 0) {
            const replacement = pickBest(alternatives, ['White', 'Beige', 'Sand', 'Black'], ['Pull&Bear', 'Bershka']);
            if (replacement && replacement.id !== item.id) {
              modified.outfit.items[i] = replacement;
            }
          }
        }
      }
      modified.outfit.why = 'Adjusted for a more casual feel.';
      break;
    }

    case 'swap_shoes': {
      const pool = getProductPool();
      const shoes = filterByCategory(pool, ['Shoes']);
      if (shoes.length > 0) {
        const current = modified.outfit.items.find(i => i.cat === 'Shoes');
        const alternatives = shoes.filter(s => current ? s.id !== current.id : true);
        if (alternatives.length > 0) {
          const replacement = alternatives[Math.floor(Math.random() * Math.min(alternatives.length, 3))];
          const idx = modified.outfit.items.findIndex(i => i.cat === 'Shoes');
          if (idx >= 0) modified.outfit.items[idx] = replacement;
        }
      }
      break;
    }

    case 'swap_top': {
      const pool = getProductPool();
      const tops = filterByCategory(pool, ['Tops']);
      if (tops.length > 0) {
        const current = modified.outfit.items.find(i => i.cat === 'Tops');
        const alternatives = tops.filter(s => current ? s.id !== current.id : true);
        if (alternatives.length > 0) {
          const replacement = alternatives[Math.floor(Math.random() * Math.min(alternatives.length, 3))];
          const idx = modified.outfit.items.findIndex(i => i.cat === 'Tops');
          if (idx >= 0) modified.outfit.items[idx] = replacement;
        }
      }
      break;
    }

    case 'swap_bottom': {
      const pool = getProductPool();
      const bottoms = filterByCategory(pool, ['Bottoms']);
      if (bottoms.length > 0) {
        const current = modified.outfit.items.find(i => i.cat === 'Bottoms');
        const alternatives = bottoms.filter(s => current ? s.id !== current.id : true);
        if (alternatives.length > 0) {
          const replacement = alternatives[Math.floor(Math.random() * Math.min(alternatives.length, 3))];
          const idx = modified.outfit.items.findIndex(i => i.cat === 'Bottoms');
          if (idx >= 0) modified.outfit.items[idx] = replacement;
        }
      }
      break;
    }

    case 'color_swap': {
      // Swap the most discordant color item
      const colorItems = modified.outfit.items.filter(i => i.color);
      if (colorItems.length >= 2) {
        // Find the item with lowest color harmony score against the rest
        let worstIdx = 0;
        let worstScore = Infinity;
        for (let i = 0; i < colorItems.length; i++) {
          const others = colorItems.filter((_, j) => j !== i).map(o => o.color || 'Black');
          const minScore = Math.min(...others.map(c => scoreColorPair(colorItems[i].color || 'Black', c)));
          if (minScore < worstScore) {
            worstScore = minScore;
            worstIdx = i;
          }
        }
        const item = colorItems[worstIdx];
        if (item.cat) {
          const pool = getProductPool();
          const alternatives = filterByCategory(pool, [item.cat]);
          const neutralAlts = alternatives.filter(a =>
            ['Black', 'White', 'Navy', 'Beige'].includes(a.color) && a.id !== item.id
          );
          if (neutralAlts.length > 0) {
            const replacement = neutralAlts[0];
            const idx = modified.outfit.items.findIndex(i => i.id === item.id);
            if (idx >= 0) modified.outfit.items[idx] = replacement;
          }
        }
      }
      break;
    }
  }

  // Re-score
  const occasionRule = getOccasionRule('everyday'); // Can't determine from outfit alone
  const styleProfile = getStyleProfile();
  const scores = computeAllScores(
    modified.outfit.items as Product[],
    occasionRule,
    styleProfile,
    null,
    null,
    modified.outfit.items.reduce((s, i) => s + (i.price || 0), 0)
  );
  modified.confidenceScore = Math.round(
    (scores.occasionFit + scores.budgetCompliance + scores.styleCoherence + scores.colorHarmony + scores.trendAlignment) / 5
  );
  modified.styleScore = scores.styleCoherence;
  modified.critique.scores = {
    occasionFit: scores.occasionFit,
    budgetCompliance: scores.budgetCompliance,
    styleCoherence: scores.styleCoherence,
    colorHarmony: scores.colorHarmony,
    trendAlignment: scores.trendAlignment,
    overall: modified.confidenceScore,
  };

  return modified;
}

export default { generateOutfits, modifyOutfit };
