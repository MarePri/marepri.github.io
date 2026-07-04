import { useState, useCallback, useEffect, useRef } from 'react';
import { getFashionDNA } from '../services/ai.js';

/**
 * Hook managing FashionDNA state and logic.
 */
export default function useFashionDNA() {
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [dnaResult, setDnaResult] = useState(null);
  const [dnaLoading, setDnaLoading] = useState(false);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  // Track mount state and abort in-flight requests on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const buildFashionDNA = useCallback(async (archetype) => {
    // Abort any in-flight request before starting a new one
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedArchetype(archetype.id);
    setDnaResult(null);
    setDnaLoading(true);
    try {
      const meta = await getFashionDNA(archetype, controller.signal);
      if (controller.signal.aborted || !mountedRef.current) return;
      setDnaResult({ archetype, meta });
    } catch {
      if (!mountedRef.current) return;
      setDnaResult(null);
    }
    if (mountedRef.current) setDnaLoading(false);
  }, []);

  const reset = useCallback(() => {
    setDnaResult(null);
    setSelectedArchetype(null);
  }, []);

  return { selectedArchetype, dnaResult, dnaLoading, buildFashionDNA, reset };
}
