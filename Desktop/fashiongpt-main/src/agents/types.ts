// ─── Agent Layer: Core Types & Interfaces ──────────────────────────────────────
// All agents communicate through typed contracts defined here.
// No agent imports another agent — only the orchestrator coordinates them.

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Data Types (mirroring src/types/index.js with full TS)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Product {
  id: number;
  brand: string;
  name: string;
  cat: string;
  color: string;
  price: number;
  trend: number;
  style: string[];
  fit: string;
  img: string;
}

export interface Occasion {
  id: string;
  label: string;
  icon: string;
  vibe: string;
}

export interface Trend {
  name: string;
  dir: 'up' | 'down';
  pct: number;
  desc: string;
  brands: string[];
}

export interface Archetype {
  id: string;
  name: string;
  icon: string;
  colors: string[];
  brands: string[];
  desc: string;
}

export interface OutfitItem {
  id?: number;
  brand: string;
  name: string;
  cat?: string;
  color?: string;
  price?: number;
  img?: string;
}

export interface OutfitScores {
  Style: number;
  Trend: number;
  Versatility: number;
  ColorHarmony: number;
}

export interface Outfit {
  items: OutfitItem[];
  name?: string;
  why?: string;
  scores?: OutfitScores;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Agent-Specific Types
// ═══════════════════════════════════════════════════════════════════════════════

/** Session context passed through all agent calls */
export interface AgentContext {
  sessionId: string;
  timestamp: string;
  debug?: boolean;
}

/** User-supplied preferences (free-form, from any input source) */
export interface UserPreferences {
  occasion?: string;
  budget?: number;
  styleGoal?: string;
  excludedBrands?: string[];
  preferredBrands?: string[];
}

// ── Profile Agent ────────────────────────────────────────────────────────────

export interface ProfileAgentInput {
  archetypeId?: string;
  preferences?: UserPreferences;
  previousOutfits?: Outfit[];
}

export interface BrandAffinity {
  brand: string;
  score: number;
  reason: string;
}

export interface StyleProfile {
  archetype: Archetype;
  palette: string[];
  brandAffinities: BrandAffinity[];
  styleTags: string[];
  confidence: number;
}

export interface ProfileAgentOutput {
  profile: StyleProfile;
  confidence: number;
  warnings: string[];
}

// ── Wardrobe Agent ───────────────────────────────────────────────────────────

export interface WardrobeAgentInput {
  profile: StyleProfile;
  occasion: string;
  budget: number | null;
  requiredCategories: string[];
  preferredCategories: string[];
  /** Free-form style goal / user feedback to influence product selection */
  styleGoal?: string;
}

export interface WardrobeSelection {
  product: Product;
  reason: string;
  category: string;
}

export interface WardrobeAgentOutput {
  selections: WardrobeSelection[];
  totalCost: number;
  categoryCoverage: Record<string, boolean>;
  budgetRemaining: number;
  fallbackApplied: boolean;
  warnings: string[];
}

// ── Outfit Agent ─────────────────────────────────────────────────────────────

export interface OutfitAgentInput {
  profile: StyleProfile;
  wardrobe: WardrobeAgentOutput;
  occasion: string;
  budget: number | null;
  styleGoal?: string;
}

export interface OutfitAgentOutput {
  outfit: Outfit;
  rationale: string;
  scores: OutfitScores;
  warnings: string[];
}

// ── Critic Agent ─────────────────────────────────────────────────────────────

export interface CriticScores {
  occasionFit: number;
  budgetCompliance: number;
  styleCoherence: number;
  colorHarmony: number;
  trendAlignment: number;
  overall: number;
}

export interface CriticAgentInput {
  outfit: Outfit;
  context: {
    occasion: string;
    budget: number | null;
    profile: StyleProfile;
  };
}

export interface CriticAgentOutput {
  approved: boolean;
  scores: CriticScores;
  suggestions: string[];
  issues: string[];
  verdict: string;
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Orchestrator Types
// ═══════════════════════════════════════════════════════════════════════════════

export type RequestType =
  | 'build_outfit'
  | 'analyze_profile'
  | 'critique_outfit'
  | 'build_capsule';

export interface OrchestratorRequest {
  type: RequestType;
  payload: Record<string, unknown>;
  context?: Partial<AgentContext>;
}

export interface AgentTrace {
  agent: string;
  duration: number;
  success: boolean;
  warnings: string[];
  output?: Record<string, unknown>;
}

export interface OrchestratorResponse {
  success: boolean;
  requestId: string;
  type: RequestType;
  data: unknown;
  agents: AgentTrace[];
  duration: number;
  error?: string;
}
