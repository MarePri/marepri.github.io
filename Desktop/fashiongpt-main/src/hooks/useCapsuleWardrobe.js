import { useState, useCallback, useEffect, useRef } from 'react';
import { PRODUCTS } from '../data/products.js';

/**
 * Hook managing capsule wardrobe state and logic.
 *
 * Uses a buildingRef guard to prevent race conditions from rapid
 * double-clicks or concurrent buildCapsule calls.
 */
export default function useCapsuleWardrobe() {
  const [capsuleResult, setCapsuleResult] = useState(null);
  const [capsuleLoading, setCapsuleLoading] = useState(false);
  const mountedRef = useRef(true);
  const buildingRef = useRef(false);

  // Track mount state and prevent setState on unmounted component
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const buildCapsule = useCallback(() => {
    // Guard: prevent concurrent invocations from rapid double-clicks
    if (buildingRef.current || capsuleLoading) return;
    buildingRef.current = true;

    setCapsuleResult(null);
    setCapsuleLoading(true);
    try {
      const picks = [
        PRODUCTS.find(p => p.cat === 'Tops' && p.brand === 'Zara'),
        PRODUCTS.find(p => p.cat === 'Tops' && p.brand === 'Pull&Bear'),
        PRODUCTS.find(p => p.cat === 'Bottoms' && p.color === 'Black'),
        PRODUCTS.find(p => p.cat === 'Bottoms' && p.brand === 'Stradivarius'),
        PRODUCTS.find(p => p.cat === 'Dresses'),
        PRODUCTS.find(p => p.cat === 'Outerwear'),
        PRODUCTS.find(p => p.cat === 'Shoes' && p.brand === 'Zara'),
        PRODUCTS.find(p => p.cat === 'Shoes' && p.brand === 'Pull&Bear'),
        PRODUCTS.find(p => p.cat === 'Bags'),
        PRODUCTS.find(p => p.cat === 'Accessories' || p.cat === 'Loungewear'),
      ].filter(Boolean);
      const total = picks.reduce((s, p) => s + p.price, 0);
      const combos = Math.floor(picks.length * (picks.length - 1) * 1.4);
      if (mountedRef.current) setCapsuleResult({ picks, total, combos });
    } catch {
      // On error, omit result (capsuleResult stays null)
    } finally {
      if (mountedRef.current) setCapsuleLoading(false);
      buildingRef.current = false;
    }
  }, [capsuleLoading]);

  const reset = useCallback(() => {
    setCapsuleResult(null);
    setCapsuleLoading(false);
    buildingRef.current = false;
  }, []);

  return { capsuleResult, capsuleLoading, buildCapsule, reset };
}
