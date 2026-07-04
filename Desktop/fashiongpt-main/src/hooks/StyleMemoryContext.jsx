import React, { createContext, useContext } from 'react';
import useStyleMemory from './useStyleMemory.js';

/**
 * StyleMemoryContext — lifts style memory to app level so OutfitGenerator,
 * SavedLooks, and future components can read/write preference data.
 *
 * Usage:
 *   <StyleMemoryProvider>
 *     <OutfitGenerator />
 *   </StyleMemoryProvider>
 *
 *   const styleMem = useStyleMemoryContext();
 *   styleMem.recordSave(result, occasionId, archetypeId);
 *   styleMem.getPreferences();  // { preferredBrands, preferredCategories, ... }
 */

const StyleMemoryContext = createContext(null);

export function StyleMemoryProvider({ children }) {
  const styleMem = useStyleMemory();
  return (
    <StyleMemoryContext.Provider value={styleMem}>
      {children}
    </StyleMemoryContext.Provider>
  );
}

/**
 * Hook for consuming style memory from any component.
 */
export function useStyleMemoryContext() {
  const ctx = useContext(StyleMemoryContext);
  if (!ctx) {
    throw new Error(
      'useStyleMemoryContext must be used within a <StyleMemoryProvider>'
    );
  }
  return ctx;
}
