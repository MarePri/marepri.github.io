// ─── Color Harmony — Shared Module ─────────────────────────────────────────────
// Single source of truth for color groups and harmony scoring.
// Used by: OutfitAgent, CriticAgent, outfit.js

export const COLOR_GROUPS: Record<string, string[]> = {
  neutrals: ['Black', 'White', 'Beige', 'Grey', 'Cream', 'Ivory', 'Ecru', 'Champagne', 'Tan', 'Sand', 'Camel'],
  earths: ['Rust', 'Chocolate', 'Cognac', 'Brown', 'Charcoal', 'Slate'],
  darks: ['Navy', 'Black', 'Charcoal', 'Chocolate', 'Slate'],
  pastels: ['Blush', 'Dusty Pink', 'Cream', 'Ivory', 'Lavender', 'Mint'],
  brights: ['Gold', 'Silver', 'Cobalt', 'Red', 'Yellow'],
  naturals: ['Beige', 'Sand', 'Camel', 'White', 'Cream', 'Ecru', 'Tan'],
  washing: ['White/Navy', 'Multicolor', 'Faded Black', 'Medium Wash', 'Light Wash', 'Washed Blue'],
};

/**
 * Get the harmony group(s) for a color name.
 */
export function getColorGroup(color: string): string[] {
  const groups: string[] = [];
  for (const [groupName, colors] of Object.entries(COLOR_GROUPS)) {
    if (colors.some(c => color.toLowerCase().includes(c.toLowerCase()))) {
      groups.push(groupName);
    }
  }
  return groups;
}

/**
 * Compute color harmony score between items.
 * Higher means more harmonious (0–100 range).
 */
export function computeColorHarmony(items: Array<{ color?: string }>): number {
  if (!items || items.length < 2) return 80;

  const itemGroups = items.map(item => getColorGroup(item.color || ''));
  let harmonyCount = 0;
  let pairCount = 0;

  for (let i = 0; i < itemGroups.length; i++) {
    for (let j = i + 1; j < itemGroups.length; j++) {
      pairCount++;
      if (itemGroups[i].some(g => itemGroups[j].includes(g))) {
        harmonyCount++;
      }
    }
  }

  if (pairCount === 0) return 80;
  return Math.round(60 + (harmonyCount / pairCount) * 35); // 60–95 range
}
