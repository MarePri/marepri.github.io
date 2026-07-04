// ─── Outfit Generator Service ─────────────────────────────────────────────────
// THE FULL FLOW COORDINATOR.
// Connects: User Profile → Wardrobe → Occasion → Weather → Outfit Agent → Critic Agent
//
// This is a SERVICE, not an agent. It calls agents through the orchestrator.
// Never imports UI, never imports repositories directly.
// Returns a complete result with outfit, reasoning, confidence, style score.

import type { OrchestratorResponse } from '../agents/types';
import { handleRequest } from '../agents/orchestrator';
import { getWeather, type WeatherData } from './weather';
import { generateOutfits as ruleGenerateOutfits } from '../rules/outfitEngine.js';
import type { EngineOutfitResult } from '../rules/outfitEngine.js';

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface OutfitGeneratorInput {
  /** Free-form occasion text (e.g. "summer wedding", "office meeting") */
  occasion: string;
  /** Budget in EUR (null = no budget constraint) */
  budget?: number | null;
  /** Style archetype ID (e.g. "minimalist", "streetwear", "romantic") */
  archetypeId?: string;
  /** Optional style goal description */
  styleGoal?: string;
  /** Optional weather config (city, coords) */
  weather?: {
    city?: string;
    lat?: number;
    lon?: number;
  };
  /** Preferred product categories (e.g. ["Bags", "Outerwear"]) */
  preferredCategories?: string[];
  /** User ID if saving to database */
  userId?: string;
}

export interface OutfitGeneratorResult {
  /** The complete outfit with items */
  outfit: {
    items: Array<{
      id?: number;
      brand: string;
      name: string;
      cat?: string;
      color?: string;
      price?: number;
      img?: string;
    }>;
    name?: string;
    why?: string;
  };
  /** Human-readable reasoning for the outfit */
  reasoning: string;
  /** Overall confidence score (0–100) from the critic */
  confidenceScore: number;
  /** Combined style score (0–100) from outfit agent */
  styleScore: number;
  /** Full critique output from critic agent */
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
  /** Weather context used */
  weatherContext: WeatherData | null;
  /** Whether the outfit is approved by the critic */
  approved: boolean;
  /** Generation duration in ms */
  duration: number;
  /** Raw agent execution traces (for debugging) */
  agentTraces: Array<{
    agent: string;
    duration: number;
    success: boolean;
    warnings: string[];
  }>;
  /** Any warnings from the generation process */
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Extract style reasoning from orchestration result
// ═══════════════════════════════════════════════════════════════════════════════

function buildReasoning(
  profile: Record<string, unknown> | undefined,
  wardrobe: Record<string, unknown> | undefined,
  outfit: Record<string, unknown> | undefined,
  critique: Record<string, unknown> | undefined,
  weather: WeatherData | null,
  occasion: string
): string {
  const parts: string[] = [];

  // Profile context
  const profileData = profile as { profile?: { archetype?: { name?: string }; confidence?: number } } | undefined;
  const archetypeName = profileData?.profile?.archetype?.name || 'versatile';
  const profileConfidence = profileData?.profile?.confidence ?? 70;
  parts.push(`Styled for "${occasion}" with a ${archetypeName} aesthetic (profile confidence: ${profileConfidence}%).`);

  // Wardrobe context
  const wardrobeData = wardrobe as { selections?: Array<unknown>; totalCost?: number } | undefined;
  const itemCount = wardrobeData?.selections?.length ?? 0;
  const totalCost = wardrobeData?.totalCost ?? 0;
  if (itemCount > 0) {
    parts.push(`Selected ${itemCount} pieces totaling €${totalCost.toFixed(2)}.`);
  }

  // Weather context
  if (weather) {
    parts.push(`Weather: ${weather.temperature}°C, ${weather.description} — ${weather.recommendation}`);
  }

  // Outfit rationale
  const outfitData = outfit as { rationale?: string } | undefined;
  if (outfitData?.rationale) {
    parts.push(outfitData.rationale);
  }

  return parts.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the full outfit generation flow:
 *   Profile → Wardrobe → Occasion → Weather → Outfit Agent → Critic Agent → Result
 *
 * @param input - Generation parameters
 * @returns Complete result with outfit, reasoning, scores, critique
 */
export async function generateOutfit(input: OutfitGeneratorInput): Promise<OutfitGeneratorResult> {
  const absoluteStart = Date.now();
  const warnings: string[] = [];

  console.info(`[OutfitGenerator] Starting flow: "${input.occasion}"`);

  // ── Step 1: Fetch weather context (independent, parallel-safe) ─────────────
  let weatherContext: WeatherData | null = null;
  try {
    weatherContext = await getWeather({
      city: input.weather?.city,
      lat: input.weather?.lat,
      lon: input.weather?.lon,
    });
    console.info(`[OutfitGenerator] Weather: ${weatherContext.temperature}°C, ${weatherContext.condition}`);
  } catch (err) {
    warnings.push(`Weather fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    console.warn(`[OutfitGenerator] Weather unavailable, continuing without`);
  }

  // ── Step 2: Run the orchestrator (Profile → Wardrobe → Outfit → Critic) ──────
  let orchestratorResponse: OrchestratorResponse | null = null;
  try {
    orchestratorResponse = await handleRequest({
      type: 'build_outfit',
      payload: {
        archetypeId: input.archetypeId,
        occasion: input.occasion,
        budget: input.budget ?? null,
        styleGoal: input.styleGoal,
        preferredCategories: input.preferredCategories,
        preferences: {
          occasion: input.occasion,
          budget: input.budget,
          styleGoal: input.styleGoal,
        },
      },
    });
  } catch (orchestratorErr) {
    warnings.push(`Orchestrator threw: ${orchestratorErr instanceof Error ? orchestratorErr.message : String(orchestratorErr)}`);
    console.warn('[OutfitGenerator] Orchestrator threw, falling back to rule engine');
  }

  if (!orchestratorResponse?.success) {
    const errorMsg = orchestratorResponse?.error || 'Orchestrator returned failure or was unavailable';
    console.warn(`[OutfitGenerator] ${errorMsg} — using rule-based engine as fallback`);

    // ── Fallback: Rule-Based Engine ──────────────────────────────────────────
    try {
      const ruleResult = ruleGenerateOutfits({
        occasion: input.occasion,
        archetypeId: input.archetypeId,
        budget: input.budget ?? null,
        weather: weatherContext
          ? { temperature: weatherContext.temperature, condition: weatherContext.condition }
          : null,
        styleGoal: input.styleGoal,
        preferredCategories: input.preferredCategories,
      });

      // Pick the variation matching styleGoal, or default to first outfit
      const variationMap: Record<string, number> = {
        'alternative': 1,
        'surprise': 2,
        'surprise me': 2,
      };
      const variationIdx = input.styleGoal ? (variationMap[input.styleGoal.toLowerCase()] ?? 0) : 0;
      const selected: EngineOutfitResult = ruleResult.outfits[variationIdx] || ruleResult.outfits[0];

      // Map to OutfitGeneratorResult shape
      return {
        outfit: {
          items: selected.outfit.items.map((item) => ({
            id: (item as Record<string, unknown>).id as number | undefined,
            brand: (item as Record<string, unknown>).brand as string || 'Unknown',
            name: (item as Record<string, unknown>).name as string || 'Item',
            cat: (item as Record<string, unknown>).cat as string | undefined,
            color: (item as Record<string, unknown>).color as string | undefined,
            price: (item as Record<string, unknown>).price as number | undefined,
            img: (item as Record<string, unknown>).img as string | undefined,
          })),
          name: selected.outfit.name,
          why: selected.outfit.why,
        },
        reasoning: selected.reasoning,
        confidenceScore: selected.confidenceScore,
        styleScore: selected.styleScore,
        critique: selected.critique,
        weatherContext: selected.weatherContext
          ? {
              temperature: selected.weatherContext.temperature,
              condition: selected.weatherContext.condition,
              description: selected.weatherContext.description,
              recommendation: selected.weatherContext.recommendation,
              humidity: weatherContext?.humidity ?? 50,
              windSpeed: weatherContext?.windSpeed ?? 5,
              feelsLike: selected.weatherContext.temperature,
              icon: weatherContext?.icon ?? '01d',
            }
          : null,
        approved: selected.critique.approved,
        duration: ruleResult.duration,
        agentTraces: [],
        warnings: [...warnings, 'Used rule-based engine (AI orchestrator unavailable)'],
      };
    } catch (fallbackErr) {
      // Rule engine also failed — return a meaningful hardcoded fallback
      const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      warnings.push(`Rule engine fallback also failed: ${fallbackMsg}`);
      console.error('[OutfitGenerator] Rule engine fallback failed:', fallbackErr);
      return {
        outfit: { items: [], name: 'Generation Failed' },
        reasoning: `Could not generate outfit (AI unavailable, rule engine error: ${fallbackMsg})`,
        confidenceScore: 0,
        styleScore: 0,
        critique: {
          approved: false,
          scores: { occasionFit: 0, budgetCompliance: 0, styleCoherence: 0, colorHarmony: 0, trendAlignment: 0, overall: 0 },
          suggestions: ['Try again later or check your connection'],
          issues: [fallbackMsg],
          verdict: 'Both AI and rule-based generation failed.',
        },
        weatherContext,
        approved: false,
        duration: Date.now() - absoluteStart,
        agentTraces: [],
        warnings,
      };
    }
  }

  // ── Step 3: Extract and structure the result ────────────────────────────────
  const data = orchestratorResponse.data as Record<string, unknown> | undefined;
  const profileResult = data?.profile as Record<string, unknown> | undefined;
  const wardrobeResult = data?.wardrobe as Record<string, unknown> | undefined;
  const outfitResult = data?.outfit as Record<string, unknown> | undefined;
  const critiqueResult = data?.critique as Record<string, unknown> | undefined;

  // Extract outfit items
  const outfit = outfitResult?.outfit as {
    items?: Array<{ id?: number; brand: string; name: string; cat?: string; color?: string; price?: number; img?: string }>;
    name?: string;
    why?: string;
  } | undefined;

  // Extract scores
  const outfitScores = outfitResult?.scores as {
    Style?: number;
    Trend?: number;
    Versatility?: number;
    ColorHarmony?: number;
  } | undefined;

  const styleScore = outfitScores?.Style ?? 75;

  // Extract critique
  const critique = critiqueResult as {
    approved?: boolean;
    scores?: {
      occasionFit?: number;
      budgetCompliance?: number;
      styleCoherence?: number;
      colorHarmony?: number;
      trendAlignment?: number;
      overall?: number;
    };
    suggestions?: string[];
    issues?: string[];
    verdict?: string;
  } | undefined;

  const criticScores = critique?.scores || {};
  const confidenceScore = criticScores.overall ?? 75;
  const approved = critique?.approved ?? false;

  // Build reasoning
  const reasoning = buildReasoning(
    profileResult,
    wardrobeResult,
    outfitResult,
    critiqueResult,
    weatherContext,
    input.occasion
  );

  // Ingest weather into reasoning via suggestion if relevant
  const allSuggestions = [...(critique?.suggestions || [])];
  if (weatherContext && weatherContext.recommendation) {
    allSuggestions.push(`Weather note: ${weatherContext.recommendation}`);
  }

  const totalDuration = Date.now() - absoluteStart;
  console.info(`[OutfitGenerator] Flow complete: ${approved ? 'APPROVED' : 'REJECTED'}, confidence=${confidenceScore}, style=${styleScore}, ${totalDuration}ms`);

  return {
    outfit: {
      items: outfit?.items || [],
      name: outfit?.name || 'Styled Look',
      why: outfit?.why || 'Curated by FashionGPT',
    },
    reasoning,
    confidenceScore,
    styleScore,
    critique: {
      approved: critique?.approved ?? false,
      scores: {
        occasionFit: criticScores.occasionFit ?? 50,
        budgetCompliance: criticScores.budgetCompliance ?? 50,
        styleCoherence: criticScores.styleCoherence ?? 50,
        colorHarmony: criticScores.colorHarmony ?? 50,
        trendAlignment: criticScores.trendAlignment ?? 50,
        overall: criticScores.overall ?? 50,
      },
      suggestions: allSuggestions,
      issues: critique?.issues || [],
      verdict: critique?.verdict || 'No critique available.',
    },
    weatherContext,
    approved,
    duration: totalDuration,
    agentTraces: orchestratorResponse.agents,
    warnings,
  };
}

export default { generateOutfit };
