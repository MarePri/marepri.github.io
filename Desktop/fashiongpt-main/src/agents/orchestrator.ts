// ─── FashionGPT Orchestrator ───────────────────────────────────────────────────
// CENTRAL COORDINATOR. All agent communication goes through this module.
// Agents NEVER call each other — only the orchestrator invokes them in sequence.
//
// Flow for 'build_outfit':
//   ProfileAgent → WardrobeAgent → OutfitAgent → CriticAgent → response
//
// Each step feeds its output as input to the next.
// Full execution traces are returned for observability.

import type {
  OrchestratorRequest,
  OrchestratorResponse,
  AgentTrace,
  ProfileAgentInput,
  ProfileAgentOutput,
  WardrobeAgentInput,
  WardrobeAgentOutput,
  OutfitAgentInput,
  OutfitAgentOutput,
  CriticAgentInput,
  CriticAgentOutput,
  StyleProfile,
  AgentContext,
} from './types';
import * as logger from './logger';
import { analyzeProfile, setProductPool } from './profile.agent';
import { curateWardrobe } from './wardrobe.agent';
import { composeOutfit } from './outfit.agent';
import { critiqueOutfit } from './critic.agent';

const AGENT = 'Orchestrator';

// ─── Request ID Generation ───────────────────────────────────────────────────

let _requestCounter = 0;

function generateRequestId(): string {
  _requestCounter++;
  const ts = Date.now().toString(36);
  const seq = _requestCounter.toString(36).padStart(4, '0');
  return `fgpt-${ts}-${seq}`;
}

// ─── Internal: Build Capsule (special flow, no critic needed) ─────────────────

interface CapsuleBuildPayload {
  budget?: number;
  occasion?: string;
}

async function handleBuildCapsule(
  payload: CapsuleBuildPayload,
  context: AgentContext
): Promise<{ data: WardrobeAgentOutput; traces: AgentTrace[] }> {
  const traces: AgentTrace[] = [];

  // Step 1: Profile analysis (default minimalist profile for capsule)
  const profileStart = Date.now();
  const profileInput: ProfileAgentInput = {
    archetypeId: 'minimalist',
    preferences: { occasion: payload.occasion, budget: payload.budget },
  };
  const profileResult = await analyzeProfile(profileInput);
  traces.push({
    agent: 'ProfileAgent',
    duration: Date.now() - profileStart,
    success: true,
    warnings: profileResult.warnings,
  });

  // Step 2: Wardrobe curation — capsule mode (one of each category)
  const wardrobeStart = Date.now();
  const wardrobeInput: WardrobeAgentInput = {
    profile: profileResult.profile,
    occasion: payload.occasion || 'everyday',
    budget: payload.budget || 500,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Bags'],
    preferredCategories: ['Dresses', 'Accessories', 'Sport', 'Loungewear'],
  };
  const wardrobeResult = await curateWardrobe(wardrobeInput);
  traces.push({
    agent: 'WardrobeAgent',
    duration: Date.now() - wardrobeStart,
    success: true,
    warnings: wardrobeResult.warnings,
  });

  return { data: wardrobeResult, traces };
}

// ─── Seed the product pool on ProfileAgent at module init ─────────────────────

async function seedProductPool(): Promise<void> {
  try {
    const { PRODUCTS } = await import('../data/products');
    setProductPool(PRODUCTS);
    logger.info(AGENT, 'Product pool seeded', { count: PRODUCTS.length });
  } catch (err) {
    logger.warn(AGENT, 'Could not seed product pool at init', { error: String(err) });
  }
}

// Seed immediately
seedProductPool();

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle any agent request through the orchestrator.
 * Routes to the correct agent(s), chains dependencies, and returns results.
 *
 * @param request - The typed orchestrator request
 * @returns A complete response with execution traces
 */
export async function handleRequest(request: OrchestratorRequest): Promise<OrchestratorResponse> {
  const absoluteStart = Date.now();
  const requestId = generateRequestId();
  const context: AgentContext = {
    sessionId: request.context?.sessionId || requestId,
    timestamp: new Date().toISOString(),
    debug: request.context?.debug || false,
  };
  const traces: AgentTrace[] = [];

  logger.info(AGENT, `Handling request: ${request.type}`, {
    requestId,
    payloadKeys: Object.keys(request.payload),
  });

  try {
    let responseData: unknown;

    switch (request.type) {
      // ═══════════════════════════════════════════════════════════════════
      // ANALYZE PROFILE: Single agent call
      // ═══════════════════════════════════════════════════════════════════
      case 'analyze_profile': {
        const input: ProfileAgentInput = {
          archetypeId: request.payload.archetypeId as string | undefined,
          preferences: request.payload.preferences as Record<string, unknown> | undefined,
          previousOutfits: request.payload.previousOutfits as any[] | undefined,
        };

        const agentStart = Date.now();
        const result = await analyzeProfile(input);
        traces.push({
          agent: 'ProfileAgent',
          duration: Date.now() - agentStart,
          success: true,
          warnings: result.warnings,
        });

        responseData = result;
        break;
      }

      // ═══════════════════════════════════════════════════════════════════
      // CRITIQUE OUTFIT: Single agent call
      // ═══════════════════════════════════════════════════════════════════
      case 'critique_outfit': {
        const input: CriticAgentInput = {
          outfit: request.payload.outfit as any,
          context: request.payload.context as any,
        };

        const agentStart = Date.now();
        const result = await critiqueOutfit(input);
        traces.push({
          agent: 'CriticAgent',
          duration: Date.now() - agentStart,
          success: true,
          warnings: result.warnings,
        });

        responseData = result;
        break;
      }

      // ═══════════════════════════════════════════════════════════════════
      // BUILD OUTFIT: Multi-agent pipeline
      // ProfileAgent → WardrobeAgent → OutfitAgent → CriticAgent
      // ═══════════════════════════════════════════════════════════════════
      case 'build_outfit': {
        // --- Step 1: ProfileAgent ---
        const profileInput: ProfileAgentInput = {
          archetypeId: request.payload.archetypeId as string | undefined,
          preferences: request.payload.preferences as Record<string, unknown> | undefined,
        };

        const profileStart = Date.now();
        const profileResult = await analyzeProfile(profileInput);
        traces.push({
          agent: 'ProfileAgent',
          duration: Date.now() - profileStart,
          success: true,
          warnings: profileResult.warnings,
        });

        if (!profileResult.profile) {
          throw new Error('ProfileAgent returned empty profile');
        }

        const profile = profileResult.profile;

        // --- Step 2: WardrobeAgent ---
        const occasion = (request.payload.occasion as string) || 'everyday';
        const budget = (request.payload.budget as number | null) || null;

        const wardrobeInput: WardrobeAgentInput = {
          profile,
          occasion,
          budget,
          requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
          preferredCategories: (request.payload.preferredCategories as string[]) || ['Bags', 'Outerwear', 'Accessories'],
          styleGoal: request.payload.styleGoal as string | undefined,
        };

        const wardrobeStart = Date.now();
        const wardrobeResult = await curateWardrobe(wardrobeInput);
        traces.push({
          agent: 'WardrobeAgent',
          duration: Date.now() - wardrobeStart,
          success: true,
          warnings: wardrobeResult.warnings,
        });

        // --- Step 3: OutfitAgent ---
        const outfitInput: OutfitAgentInput = {
          profile,
          wardrobe: wardrobeResult,
          occasion,
          budget,
          styleGoal: request.payload.styleGoal as string | undefined,
        };

        const outfitStart = Date.now();
        const outfitResult = await composeOutfit(outfitInput);
        traces.push({
          agent: 'OutfitAgent',
          duration: Date.now() - outfitStart,
          success: true,
          warnings: outfitResult.warnings,
        });

        // --- Step 4: CriticAgent ---
        const criticInput: CriticAgentInput = {
          outfit: outfitResult.outfit,
          context: { occasion, budget, profile },
        };

        const criticStart = Date.now();
        const criticResult = await critiqueOutfit(criticInput);
        traces.push({
          agent: 'CriticAgent',
          duration: Date.now() - criticStart,
          success: true,
          warnings: criticResult.warnings,
        });

        responseData = {
          profile: profileResult,
          wardrobe: wardrobeResult,
          outfit: outfitResult,
          critique: criticResult,
        };
        break;
      }

      // ═══════════════════════════════════════════════════════════════════
      // BUILD CAPSULE: Special wardrobe-only flow
      // ═══════════════════════════════════════════════════════════════════
      case 'build_capsule': {
        const capsulePayload: CapsuleBuildPayload = {
          budget: request.payload.budget as number | undefined,
          occasion: request.payload.occasion as string | undefined,
        };
        const { data, traces: capsuleTraces } = await handleBuildCapsule(capsulePayload, context);
        traces.push(...capsuleTraces);
        responseData = data;
        break;
      }

      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }

    const totalDuration = Date.now() - absoluteStart;
    logger.info(AGENT, `Request completed: ${request.type}`, {
      requestId,
      duration: totalDuration,
      agentCount: traces.length,
    });

    return {
      success: true,
      requestId,
      type: request.type,
      data: responseData,
      agents: traces,
      duration: totalDuration,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const totalDuration = Date.now() - absoluteStart;
    logger.error(AGENT, `Request failed: ${request.type}`, {
      requestId,
      error: msg,
      duration: totalDuration,
    });

    return {
      success: false,
      requestId,
      type: request.type,
      data: null,
      agents: traces,
      duration: totalDuration,
      error: msg,
    };
  }
}
