import React, { createContext, useContext } from 'react';
import useSavedOutfits from './useSavedOutfits.js';

/**
 * SavedOutfitsContext — lifts useSavedOutfits state to app level so
 * OutfitGenerator and SavedLooks share the same React state in real-time.
 *
 * Usage:
 *   // App.jsx (root)
 *   <SavedOutfitsProvider>
 *     <OutfitGenerator />
 *     <SavedLooks />
 *   </SavedOutfitsProvider>
 *
 *   // Any consuming component
 *   const saved = useSavedOutfitsContext();
 *   saved.saveOutfit(...);
 *   saved.rateOutfit(id, 4);
 */

const SavedOutfitsContext = createContext(null);

export function SavedOutfitsProvider({ children }) {
  const saved = useSavedOutfits();
  return (
    <SavedOutfitsContext.Provider value={saved}>
      {children}
    </SavedOutfitsContext.Provider>
  );
}

/**
 * Hook for consuming the shared saved-outfits state.
 * Drop-in replacement for calling useSavedOutfits() directly.
 */
export function useSavedOutfitsContext() {
  const ctx = useContext(SavedOutfitsContext);
  if (!ctx) {
    throw new Error(
      'useSavedOutfitsContext must be used within a <SavedOutfitsProvider>'
    );
  }
  return ctx;
}
