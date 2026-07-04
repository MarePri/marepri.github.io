import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'fashiongpt_saved_outfits';

/**
 * Load saved outfits from LocalStorage.
 * @returns {import('../types/index.js').SavedOutfit[]}
 */
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Hook for persisting saved outfits and ratings to LocalStorage.
 *
 * @returns {{
 *   savedOutfits: import('../types/index.js').SavedOutfit[],
 *   saveOutfit: (name: string, occasion: string, result: object, budget?: number) => string,
 *   removeOutfit: (id: string) => void,
 *   rateOutfit: (id: string, rating: number) => void,
 *   isSaved: (name: string) => boolean,
 * }}
 */
export default function useSavedOutfits() {
  const [savedOutfits, setSavedOutfits] = useState(loadSaved);

  // Persist to LocalStorage whenever savedOutfits changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOutfits));
    } catch {
      console.warn('[useSavedOutfits] Failed to persist to LocalStorage');
    }
  }, [savedOutfits]);

  /**
   * Save an outfit generation result.
   * @param {string} name - Outfit name
   * @param {string} occasion - Occasion description
   * @param {object} result - Full OutfitGeneratorResult
   * @param {number} [budget] - Optional budget
   * @returns {string} The saved outfit ID
   */
  const saveOutfit = useCallback((name, occasion, result, budget) => {
    const id = `outfit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const entry = {
      id,
      name,
      occasion,
      result,
      rating: 0,
      savedAt: Date.now(),
      budget: budget || null,
    };
    setSavedOutfits(prev => [entry, ...prev]);
    return id;
  }, []);

  /**
   * Remove a saved outfit by ID.
   */
  const removeOutfit = useCallback((id) => {
    setSavedOutfits(prev => prev.filter(o => o.id !== id));
  }, []);

  /**
   * Rate a saved outfit (1-5, 0 = unrated).
   */
  const rateOutfit = useCallback((id, rating) => {
    setSavedOutfits(prev =>
      prev.map(o => (o.id === id ? { ...o, rating: Math.max(0, Math.min(5, rating)) } : o))
    );
  }, []);

  /**
   * Check if an outfit with this name is already saved.
   */
  const isSaved = useCallback((name) => {
    return savedOutfits.some(o => o.name === name);
  }, [savedOutfits]);

  return { savedOutfits, saveOutfit, removeOutfit, rateOutfit, isSaved };
}
