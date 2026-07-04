import { useState, useCallback, useEffect } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fashiongpt_style_memory';

const DEFAULT_MEMORY = {
  /** Count of positive signals per brand */
  brandSignals: {},
  /** Count of negative signals per brand */
  brandNegatives: {},
  /** Count of positive signals per category */
  categorySignals: {},
  /** Count of negative signals per category */
  categoryNegatives: {},
  /** Count of positive signals per color */
  colorSignals: {},
  /** Count of negative signals per color */
  colorNegatives: {},
  /** Running sum of prices for average calculation */
  priceTotal: 0,
  priceCount: 0,
  /** Count per archetype (positive) */
  archetypeSignals: {},
  /** Count per occasion (positive) */
  occasionSignals: {},
  /** Total generations */
  totalGenerations: 0,
  /** Total saves */
  totalSaves: 0,
  /** Timestamp of last memory update */
  lastUpdated: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MEMORY };
    return { ...DEFAULT_MEMORY, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

function persist(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently degrade
  }
}

/** Increment a counter in an object, creating it if missing */
function inc(map, key, amount = 1) {
  // eslint-disable-next-line no-param-reassign
  map[key] = (map[key] || 0) + amount;
}

/** Get the top N entries from a signal object (positive only) */
function topSignals(signals, n = 5) {
  return Object.entries(signals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

/** Get categories the user consistently avoids */
function avoidedCategories(signals, negatives, threshold = 2) {
  return Object.entries(negatives)
    .filter(([cat, count]) => count >= threshold && (signals[cat] || 0) < count)
    .map(([cat]) => cat);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useStyleMemory — Learns user's taste from save/rate/regenerate actions.
 *
 * Builds a preference profile over time that feeds back into outfit generation
 * so results become more aligned with the user's style.
 *
 * Storage: localStorage key 'fashiongpt_style_memory'
 *
 * Usage:
 *   const memory = useStyleMemory();
 *   memory.recordSave(outfitResult, occasionId, archetypeId);
 *   memory.recordRate(outfitResult, rating);
 *   memory.recordRegenerate(outfitResult);
 *   memory.recordGeneration(occasionId, archetypeId);
 *
 *   const prefs = memory.getPreferences();   // For injection into generation
 *   const summary = memory.getSummary();     // Human-readable profile text
 */
export default function useStyleMemory() {
  const [memory, setMemory] = useState(load);

  // Persist on change
  useEffect(() => {
    persist(memory);
  }, [memory]);

  /**
   * Record a save (strong positive signal for all items in the outfit).
   * @param {object} result - Full OutfitGeneratorResult
   * @param {string} occasionId - Occasion ID used
   * @param {string} archetypeId - Archetype ID used
   */
  const recordSave = useCallback((result, occasionId, archetypeId) => {
    setMemory(prev => {
      const next = { ...prev };
      next.totalSaves += 1;
      next.lastUpdated = Date.now();

      // Track each item in the outfit
      (result.outfit?.items || []).forEach(item => {
        if (item.brand) inc(next.brandSignals, item.brand, 2);
        if (item.cat) inc(next.categorySignals, item.cat, 2);
        if (item.color) inc(next.colorSignals, item.color, 2);
        if (item.price) {
          next.priceTotal += item.price;
          next.priceCount += 1;
        }
      });

      // Track the archetype and occasion
      if (archetypeId) inc(next.archetypeSignals, archetypeId);
      if (occasionId) inc(next.occasionSignals, occasionId);

      return next;
    });
  }, []);

  /**
   * Record a rating (weighted signal: 4-5 = positive, 1-2 = negative, 3 = neutral).
   * @param {object} result - Full OutfitGeneratorResult
   * @param {number} rating - 1-5
   */
  const recordRate = useCallback((result, rating) => {
    if (rating < 1 || rating > 5) return;
    setMemory(prev => {
      const next = { ...prev };
      next.lastUpdated = Date.now();

      const weight = rating >= 4 ? rating - 2 : rating <= 2 ? rating - 3 : 0;

      (result.outfit?.items || []).forEach(item => {
        if (item.brand) {
          if (weight > 0) inc(next.brandSignals, item.brand, weight);
          else if (weight < 0) inc(next.brandNegatives, item.brand, Math.abs(weight));
        }
        if (item.cat) {
          if (weight > 0) inc(next.categorySignals, item.cat, weight);
          else if (weight < 0) inc(next.categoryNegatives, item.cat, Math.abs(weight));
        }
        if (item.color) {
          if (weight > 0) inc(next.colorSignals, item.color, weight);
          else if (weight < 0) inc(next.colorNegatives, item.color, Math.abs(weight));
        }
      });

      return next;
    });
  }, []);

  /**
   * Record regenerate (discarded look = mild negative signal).
   * @param {object} result - Full OutfitGeneratorResult being replaced
   */
  const recordRegenerate = useCallback((result) => {
    setMemory(prev => {
      const next = { ...prev };
      next.lastUpdated = Date.now();

      (result.outfit?.items || []).forEach(item => {
        if (item.brand) inc(next.brandNegatives, item.brand);
        if (item.cat) inc(next.categoryNegatives, item.cat);
        if (item.color) inc(next.colorNegatives, item.color);
      });

      return next;
    });
  }, []);

  /**
   * Record a generation event (tracks usage).
   */
  const recordGeneration = useCallback((occasionId, archetypeId) => {
    setMemory(prev => {
      const next = { ...prev };
      next.totalGenerations += 1;
      next.lastUpdated = Date.now();
      return next;
    });
  }, []);

  /**
   * Build a UserPreferences-style object to inject into generation.
   * @returns {{ preferredBrands?: string[], preferredCategories?: string[], excludedCategories?: string[], preferredColors?: string[], styleGoal?: string }}
   */
  const getPreferences = useCallback(() => {
    const prefs = {};

    const topBrands = topSignals(memory.brandSignals, 4);
    if (topBrands.length > 0) prefs.preferredBrands = topBrands;

    const topCats = topSignals(memory.categorySignals, 4);
    if (topCats.length > 0) prefs.preferredCategories = topCats;

    const avoidCats = avoidedCategories(memory.categorySignals, memory.categoryNegatives, 2);
    if (avoidCats.length > 0) prefs.excludedCategories = avoidCats;

    return prefs;
  }, [memory]);

  /**
   * Build a human-readable style profile summary for styleGoal injection.
   * @returns {string}
   */
  const getSummary = useCallback(() => {
    const parts = [];

    const topBrands = topSignals(memory.brandSignals, 3);
    if (topBrands.length > 0) {
      parts.push(`prefers ${topBrands.join(', ')}`);
    }

    const topCats = topSignals(memory.categorySignals, 3);
    if (topCats.length > 0) {
      parts.push(`favors ${topCats.join(', ')}`);
    }

    const topColors = topSignals(memory.colorSignals, 3);
    if (topColors.length > 0) {
      parts.push(`tends toward ${topColors.join(', ')} colors`);
    }

    if (memory.priceCount > 0) {
      const avg = Math.round(memory.priceTotal / memory.priceCount);
      parts.push(`average item budget €${avg}`);
    }

    if (memory.totalSaves > 0) {
      parts.push(`${memory.totalSaves} saved looks`);
    }

    if (parts.length === 0) return '';

    return `Your style profile: ${parts.join('; ')}.`;
  }, [memory]);

  /**
   * Check if memory has enough data to be useful.
   */
  const hasData = memory.totalSaves > 0 || memory.totalGenerations > 2;

  /** Reset all style memory */
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
    setMemory({ ...DEFAULT_MEMORY });
  }, []);

  return {
    recordSave,
    recordRate,
    recordRegenerate,
    recordGeneration,
    getPreferences,
    getSummary,
    hasData,
    clear,
    memory,
  };
}
