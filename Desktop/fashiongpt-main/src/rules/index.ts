/**
 * Rules Module — Barrel Export
 * 
 * Central export point for all rule-based styling logic:
 * - styleRules: Archetype profiles and tag compatibility
 * - occasionRules: Occasion-to-formality/category/style mapping
 * - weatherRules: Temperature-to-fabric/layer/color guidance
 * - colorRules: Color wheel harmony scoring and pair matching
 * - outfitEngine: Complete outfit generation orchestrator
 */

export { getStyleProfile, CATEGORY_ORDER, ARCHETYPE_PROFILES } from './styleRules.js';
export type { StyleProfile } from './styleRules.js';

export { getOccasionRule, getOutfitName, OCCASION_RULES } from './occasionRules.js';
export type { OccasionRule } from './occasionRules.js';

export { getWeatherInfluence, adjustPaletteForWeather } from './weatherRules.js';
export type { WeatherInfluence } from './weatherRules.js';

export { computeColorScore, scoreColorPair, getHarmonyType, suggestColorSwap } from './colorRules.js';

export { generateOutfits, modifyOutfit } from './outfitEngine.js';
export type { EngineInput, EngineOutput, EngineOutfitResult } from './outfitEngine.js';
