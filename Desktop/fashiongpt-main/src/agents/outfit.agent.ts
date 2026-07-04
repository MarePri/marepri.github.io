// ─── Outfit Agent ──────────────────────────────────────────────────────────────
// Composes a complete outfit from wardrobe selections.
// Computes style/trend/versatility/color-harmony scores.
// Never calls other agents — returns outfit to orchestrator.

import type {
  OutfitAgentInput,
  OutfitAgentOutput,
  OutfitScores,
  Product,
} from './types';
import * as logger from './logger';
import { computeColorHarmony, getColorGroup, COLOR_GROUPS } from '../utils/colorHarmony';

const AGENT = 'OutfitAgent';

// ─── Scoring ──────────────────────────────────────────────────────────────────

function computeStyleScore(product: Product, styleTags: string[]): number {
  const productTags = product.style.map(t => t.toLowerCase());
  const relevant = styleTags.map(t => t.toLowerCase());
  if (relevant.length === 0) return 70;
  const matchCount = productTags.filter(t => relevant.includes(t)).length;
  const maxPossible = Math.min(productTags.length, relevant.length);
  if (maxPossible === 0) return 50;
  return Math.round(50 + (matchCount / maxPossible) * 45);
}

function computeVersatility(product: Product): number {
  const count = product.style.length;
  if (count >= 4) return 90;
  if (count === 3) return 80;
  if (count === 2) return 65;
  return 50;
}

function computeOutfitScores(
  products: Product[],
  styleTags: string[]
): OutfitScores {
  if (products.length === 0) {
    return { Style: 75, Trend: 75, Versatility: 75, ColorHarmony: 80 };
  }

  const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);

  return {
    Style: avg(products.map(p => computeStyleScore(p, styleTags))),
    Trend: avg(products.map(p => p.trend || 75)),
    Versatility: avg(products.map(p => computeVersatility(p))),
    ColorHarmony: computeColorHarmony(products),
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Compose a complete outfit from wardrobe selections.
 * Always returns a valid OutfitAgentOutput — never throws.
 */
export async function composeOutfit(input: OutfitAgentInput): Promise<OutfitAgentOutput> {
  const start = Date.now();
  const warnings: string[] = [];

  logger.info(AGENT, 'Composing outfit', {
    selections: input.wardrobe.selections.length,
    occasion: input.occasion,
    styleGoal: input.styleGoal,
  });

  try {
    const products = input.wardrobe.selections.map(s => s.product);
    const styleTags = input.profile.styleTags;
    const scores = computeOutfitScores(products, styleTags);

    // Build rationale from selection reasons
    const rationaleLines = input.wardrobe.selections.map(
      (s, i) => `${i + 1}. ${s.product.name} — ${s.reason}`
    );

    const items = products.map(p => ({
      id: p.id,
      brand: p.brand,
      name: p.name,
      cat: p.cat,
      color: p.color,
      price: p.price,
      img: p.img,
    }));

    const total = products.reduce((s, p) => s + p.price, 0);

    const outfit = {
      items,
      name: input.styleGoal
        ? `Styled for ${input.styleGoal}`
        : `${input.profile.archetype.name} Look`,
      why: `Curated for "${input.occasion}" with ${input.profile.archetype.name} aesthetic — ${products.length} pieces at €${total.toFixed(2)}.`,
      scores,
    };

    logger.info(AGENT, 'Outfit composed', {
      items: products.length,
      totalCost: total,
      scores,
      duration: Date.now() - start,
    });

    return {
      outfit,
      rationale: rationaleLines.join('\n'),
      scores,
      warnings,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(AGENT, 'Outfit composition failed', { error: msg });
    warnings.push(`Outfit composition error: ${msg}`);
    return {
      outfit: { items: [], name: 'Fallback Outfit' },
      rationale: 'Error occurred during composition — fallback empty outfit',
      scores: { Style: 50, Trend: 50, Versatility: 50, ColorHarmony: 50 },
      warnings,
    };
  }
}

export default { composeOutfit };
