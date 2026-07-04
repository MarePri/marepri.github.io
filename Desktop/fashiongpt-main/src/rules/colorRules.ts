/**
 * Color Rules — Color harmony analysis: complementary, analogous, monochromatic.
 *
 * Provides deterministic color matching and scoring for outfit compositions.
 * Builds on the existing COLOR_GROUPS from colorHarmony.ts with extended rules.
 */

// Color wheel positions (0-360 degrees on the HSL color wheel)
const COLOR_WHEEL: Record<string, number> = {
  'Red': 0,
  'Rust': 15,
  'Cognac': 25,
  'Camel': 35,
  'Tan': 40,
  'Sand': 45,
  'Gold': 50,
  'Beige': 55,
  'Yellow': 60,
  'Cream': 65,
  'Ivory': 70,
  'Ecru': 75,
  'Champagne': 80,
  'Lime': 90,
  'Green': 120,
  'Teal': 170,
  'Cyan': 180,
  'Cobalt': 210,
  'Navy': 230,
  'Slate': 240,
  'Blue': 240,
  'Purple': 270,
  'Lavender': 275,
  'Magenta': 300,
  'Blush': 340,
  'Pink': 350,
  'Dusty Pink': 355,
  'Chocolate': 20,
  'Charcoal': 0,
  'Grey': 0,
  'Black': 0,
  'White': 0,
  'Silver': 0,
  'Floral': 340,
  'Brown': 25,
  'Faded Black': 0,
  'Medium Wash': 220,
  'Light Wash': 210,
  'Washed Blue': 215,
};

const NEUTRALS = new Set(['Black', 'White', 'Grey', 'Silver', 'Charcoal']);

/**
 * Get the hue angle for a color name.
 * Returns -1 for neutrals (they match everything).
 */
function getHue(color: string): number {
  // Handle compound colors: "White/Navy" -> take first
  const primary = color.split('/')[0].trim();
  // Handle "Blue Print" -> extract "Blue"
  const words = primary.split(' ');
  for (const word of words) {
    if (COLOR_WHEEL[word] !== undefined) return COLOR_WHEEL[word];
  }
  return COLOR_WHEEL[primary] ?? -1;
}

/**
 * Check if a color is neutral (goes with everything).
 */
function isNeutral(color: string): boolean {
  const primary = color.split('/')[0].trim();
  for (const n of NEUTRALS) {
    if (primary.includes(n)) return true;
  }
  // Common neutrals not in the set
  const extraNeutrals = ['Beige', 'Cream', 'Ivory', 'Ecru', 'Tan', 'Sand', 'Camel', 'Champagne'];
  return extraNeutrals.some(n => primary.includes(n));
}

/**
 * Compute the angular difference on the color wheel (0-180).
 */
function hueDiff(h1: number, h2: number): number {
  if (h1 < 0 || h2 < 0) return 0; // Neutral
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

/**
 * Determine harmony type between two colors.
 */
export function getHarmonyType(colorA: string, colorB: string): string {
  if (isNeutral(colorA) || isNeutral(colorB)) return 'neutral';

  const h1 = getHue(colorA);
  const h2 = getHue(colorB);
  if (h1 < 0 || h2 < 0) return 'neutral';

  const diff = hueDiff(h1, h2);

  if (diff <= 15) return 'monochromatic';
  if (diff <= 45) return 'analogous';
  if (diff >= 140 && diff <= 180) return 'complementary';
  if (diff >= 110 && diff < 140) return 'split-complementary';
  if (diff >= 60 && diff < 110) return 'triadic';

  return 'contrasting';
}

/**
 * Score color harmony between two colors (0-100).
 */
export function scoreColorPair(colorA: string, colorB: string): number {
  if (isNeutral(colorA) || isNeutral(colorB)) return 85;

  const h1 = getHue(colorA);
  const h2 = getHue(colorB);
  if (h1 < 0 || h2 < 0) return 80;

  const diff = hueDiff(h1, h2);

  // Best: monochromatic (0-15°), complementary (140-180°)
  if (diff <= 15) return 95;
  if (diff >= 150) return 90;

  // Good: analogous (16-45°)
  if (diff <= 45) return 80;

  // OK: triadic (60-110°)
  if (diff >= 60 && diff <= 110) return 70;

  // Lower: other ranges
  return 55;
}

/**
 * Compute overall color harmony score for a set of items (0-100).
 */
export function computeColorScore(
  items: Array<{ color?: string }>
): { score: number; harmonyType: string; explanation: string } {
  if (!items || items.length < 2) {
    return { score: 80, harmonyType: 'single', explanation: 'Single item — no conflict.' };
  }

  const colors = items.map(i => i.color || 'Unknown').filter(Boolean);
  let totalScore = 0;
  let pairCount = 0;
  const harmonyTypes = new Set<string>();

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const score = scoreColorPair(colors[i], colors[j]);
      totalScore += score;
      pairCount++;
      harmonyTypes.add(getHarmonyType(colors[i], colors[j]));
    }
  }

  const avgScore = pairCount > 0 ? Math.round(totalScore / pairCount) : 80;

  // Determine overall harmony description
  let harmonyType: string;
  if (harmonyTypes.has('complementary') || harmonyTypes.has('split-complementary')) {
    harmonyType = 'complementary';
  } else if (harmonyTypes.has('analogous')) {
    harmonyType = 'analogous';
  } else if (harmonyTypes.has('monochromatic')) {
    harmonyType = 'monochromatic';
  } else if (harmonyTypes.has('triadic')) {
    harmonyType = 'triadic';
  } else {
    harmonyType = 'neutral';
  }

  // Build explanation
  const explanation = buildColorExplanation(colors, harmonyType, avgScore);

  return { score: avgScore, harmonyType, explanation };
}

function buildColorExplanation(colors: string[], harmonyType: string, score: number): string {
  if (score >= 85) {
    const typeLabels: Record<string, string> = {
      complementary: 'creates striking visual balance through opposite colors',
      analogous: 'flows smoothly through adjacent color harmonies',
      monochromatic: 'builds depth through tonal variation of a single color family',
      neutral: 'anchors the outfit with versatile, timeless pieces',
      triadic: 'creates vibrant contrast through three-point harmony',
    };
    return `Color harmony is excellent (${score}/100). The palette ${typeLabels[harmonyType] || 'works beautifully together'}.`;
  }
  if (score >= 70) {
    return `Color harmony is solid (${score}/100). The palette is cohesive with some interesting contrast points.`;
  }
  return `Color harmony is adequate (${score}/100). Consider adding a neutral piece to balance the palette.`;
}

/**
 * Suggest a color swap to improve harmony.
 */
export function suggestColorSwap(
  currentColor: string,
  targetColors: string[]
): { suggestedColor: string; reason: string } | null {
  if (targetColors.length === 0) return null;

  const currentScore = Math.min(...targetColors.map(c => scoreColorPair(currentColor, c)));

  // Try common alternatives
  const alternatives = ['Black', 'White', 'Navy', 'Beige', 'Cream'];
  let bestAlt = '';
  let bestScore = 0;

  for (const alt of alternatives) {
    if (alt === currentColor) continue;
    const altScore = Math.min(...targetColors.map(c => scoreColorPair(alt, c)));
    if (altScore > bestScore) {
      bestScore = altScore;
      bestAlt = alt;
    }
  }

  if (bestScore > currentScore + 10) {
    return {
      suggestedColor: bestAlt,
      reason: `"${bestAlt}" would harmonize better with the existing palette (${bestScore}/100 vs ${currentScore}/100).`,
    };
  }

  return null;
}
