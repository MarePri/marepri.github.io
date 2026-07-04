/**
 * Offline Engine — deterministic outfit generation for demo/offline mode.
 * Returns seed outfits and mock data so the app works without any API key.
 */
import { getAllSeedOutfits } from '../data/seedOutfits.js';

/** Generate 3 seed looks for offline mode */
export async function generateOfflineLooks() {
  // Simulate realistic generation delay
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
  return getAllSeedOutfits();
}

/** Generate a single offline look for regeneration */
export async function regenerateOfflineLook() {
  await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
  const all = getAllSeedOutfits();
  return all[Math.floor(Math.random() * all.length)];
}
