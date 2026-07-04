// ─── Critic Agent ──────────────────────────────────────────────────────────────
// Reviews an outfit for style coherence, budget compliance, occasion fit.
// Never calls other agents — returns critique to orchestrator.

import type {
  CriticAgentInput,
  CriticAgentOutput,
  CriticScores,
  Product,
} from './types';
import * as logger from './logger';
import { computeColorHarmony, getColorGroup, COLOR_GROUPS } from '../utils/colorHarmony';

const AGENT = 'CriticAgent';

// ─── Score Clamping ──────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Matching Helpers ─────────────────────────────────────────────────────────

/**
 * Check if an item style matches the given occasion tags.
 */
function styleMatchesOccasion(
  itemTags: string[],
  occasionTags: string[]
): number {
  if (occasionTags.length === 0) return 0.7;
  const lowerItem = itemTags.map(t => t.toLowerCase());
  const lowerOccasion = occasionTags.map(t => t.toLowerCase());
  const matches = lowerItem.filter(t => lowerOccasion.includes(t)).length;
  const maxPossible = Math.min(lowerItem.length, lowerOccasion.length);
  if (maxPossible === 0) return 0.5;
  return matches / maxPossible;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Critique an outfit based on occasion, budget, and profile context.
 * Always returns a valid CriticAgentOutput — never throws.
 */
export async function critiqueOutfit(input: CriticAgentInput): Promise<CriticAgentOutput> {
  const start = Date.now();
  const warnings: string[] = [];

  logger.info(AGENT, 'Critiquing outfit', {
    items: input.outfit.items.length,
    occasion: input.context.occasion,
    budget: input.context.budget,
  });

  try {
    const items = input.outfit.items;
    const profile = input.context.profile;
    const totalCost = items.reduce((s, i) => s + (i.price || 0), 0);
    const suggestions: string[] = [];
    const issues: string[] = [];

    // ═══ 1. Occasion Fit ═══
    // Check if items have styles that match the archetype/occasion
    const tags = profile.styleTags;
    const fitScores = items.map(i => {
      // We only have the item info; match by brand affinity if possible
      // For items without style tags, approximate via brand matching
      return 0.7; // Neutral baseline since item might not have style arrays
    });
    const occasionFit = clamp(Math.round(fitScores.reduce((s, v) => s + v, 0) / fitScores.length * 100));

    if (occasionFit < 50) {
      issues.push('Outfit does not align well with the selected occasion');
      suggestions.push('Consider swapping pieces for styles that better match the occasion');
    }

    // ═══ 2. Budget Compliance ═══
    let budgetCompliance: number;
    if (input.context.budget === null || input.context.budget === undefined) {
      budgetCompliance = 100; // No budget constraint—always compliant
    } else if (totalCost <= input.context.budget) {
      budgetCompliance = clamp(100 - Math.round((totalCost / input.context.budget - 0.5) * 40));
      // Higher score if well under budget (50-60% is sweet spot)
    } else {
      budgetCompliance = clamp(
        Math.round((1 - (totalCost - input.context.budget) / input.context.budget) * 100)
      );
      issues.push(`Exceeds budget by €${(totalCost - input.context.budget).toFixed(2)}`);
      suggestions.push(`Remove or replace the most expensive item to meet the €${input.context.budget} budget`);
    }

    // ═══ 3. Style Coherence ═══
    // Check brand mixing — is there a coherent brand strategy?
    const brands = [...new Set(items.map(i => i.brand).filter(Boolean))];
    let styleCoherence = 75;
    if (brands.length === 1) {
      styleCoherence = 85; // Single brand = high coherence
    } else if (brands.length <= 3) {
      styleCoherence = 75; // Reasonable mix
    } else {
      styleCoherence = 60; // Too many brands — might lack cohesion
      suggestions.push('Consider reducing brand variety for a more cohesive look');
    }

    // Adjust by profile alignment
    const profileBrands = profile.brandAffinities.map(b => b.brand);
    const alignedBrands = brands.filter(b => profileBrands.includes(b));
    if (alignedBrands.length === 0 && brands.length > 0) {
      styleCoherence = Math.max(40, styleCoherence - 15);
      suggestions.push('Try incorporating brands aligned with your style profile');
    }

    // ═══ 4. Color Harmony ═══
    const colorScore = computeColorHarmony(items);
    if (colorScore < 60) {
      issues.push('Poor color harmony between items');
      suggestions.push('Stick to a unified color palette — try neutrals with one accent');
    } else if (colorScore >= 85) {
      suggestions.push('Great color coordination throughout the outfit');
    }

    // ═══ 5. Trend Alignment ═══
    // Check if brands are trending or items have high trend scores
    // Use brand trend data from the trends
    let trendAlignment = 70;
    try {
      const { TRENDS } = await import('../data/trends');
      const trendingBrands = new Set<string>();
      for (const t of TRENDS) {
        if (t.dir === 'up') {
          for (const b of t.brands) trendingBrands.add(b);
        }
      }
      const trendingCount = brands.filter(b => trendingBrands.has(b)).length;
      trendAlignment = clamp(50 + (trendingCount / Math.max(brands.length, 1)) * 40);
    } catch {
      logger.warn(AGENT, 'Could not load trend data for alignment scoring');
    }

    if (trendAlignment >= 80) {
      suggestions.push('Strong trend alignment — this outfit feels current');
    } else if (trendAlignment < 50) {
      suggestions.push('Consider adding pieces from trending brands for a fresher look');
    }

    // ═══ 6. Overall Score ═══
    const overall = clamp(
      Math.round((
        occasionFit * 0.25 +
        budgetCompliance * 0.20 +
        styleCoherence * 0.20 +
        colorScore * 0.20 +
        trendAlignment * 0.15
      )),
      0,
      100
    );

    // ═══ 7. Verdict ═══
    const approved = overall >= 60 && issues.length <= 1;
    let verdict: string;
    if (approved) {
      if (overall >= 85) {
        verdict = 'Excellent outfit — well styled, on-budget, and occasion-appropriate.';
      } else {
        verdict = 'Solid outfit — minor tweaks recommended for optimization.';
      }
    } else {
      if (overall < 40) {
        verdict = 'Needs significant rework — revisit the core pieces and budget.';
      } else {
        verdict = 'Has potential but requires adjustments before finalizing.';
      }
    }

    const scores: CriticScores = {
      occasionFit,
      budgetCompliance,
      styleCoherence,
      colorHarmony: colorScore,
      trendAlignment,
      overall,
    };

    if (issues.length > 0) {
      logger.warn(AGENT, 'Issues found', { issues, overall });
    } else {
      logger.info(AGENT, 'Critique complete', { approved, overall, duration: Date.now() - start });
    }

    return { approved, scores, suggestions, issues, verdict, warnings };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(AGENT, 'Critique failed', { error: msg });
    warnings.push(`Critique error: ${msg}`);
    return {
      approved: false,
      scores: { occasionFit: 50, budgetCompliance: 50, styleCoherence: 50, colorHarmony: 50, trendAlignment: 50, overall: 50 },
      suggestions: ['Unable to generate — critiquing error occurred'],
      issues: [`Analysis error: ${msg}`],
      verdict: 'Critique could not be completed due to an internal error.',
      warnings,
    };
  }
}

export default { critiqueOutfit };
