import { useState, useCallback, useEffect, useRef } from 'react';
import { generateOutfit } from '../services/outfitGenerator.ts';

/**
 * React hook wrapping the full outfit generation flow.
 *
 * Usage:
 *   const { result, loading, error, generate } = useOutfitGenerator();
 *   await generate({ occasion: 'summer wedding', budget: 150, archetypeId: 'romantic' });
 *
 * @returns {{ result, loading, error, generate, reset }}
 */
export default function useOutfitGenerator() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  // Track mount state and abort on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  /**
   * Run the full outfit generation pipeline.
   * @param {{
   *   occasion: string,
   *   budget?: number|null,
   *   archetypeId?: string,
   *   styleGoal?: string,
   *   weather?: { city?: string, lat?: number, lon?: number },
   *   preferredCategories?: string[],
   * }} input
   */
  const generate = useCallback(async (input) => {
    if (!input?.occasion) {
      setError(new Error('Occasion is required'));
      return null;
    }

    // Abort any in-flight request before starting a new one
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await generateOutfit({
        occasion: input.occasion,
        budget: input.budget ?? null,
        archetypeId: input.archetypeId,
        styleGoal: input.styleGoal,
        weather: input.weather,
        preferredCategories: input.preferredCategories,
      });
      if (controller.signal.aborted || !mountedRef.current) return null;
      setResult(output);
      return output;
    } catch (err) {
      if (!mountedRef.current) return null;
      const msg = err instanceof Error ? err.message : String(err);
      setError(new Error(msg));
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setLoading(false);
    setError(null);
  }, []);

  return { result, loading, error, generate, reset };
}
