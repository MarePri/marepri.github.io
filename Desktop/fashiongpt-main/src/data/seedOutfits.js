/**
 * Seed Outfits — 3 pre-generated, fully explained looks for demo/offline mode.
 * Each matches the OutfitGeneratorResult shape so they drop in seamlessly.
 */

export const SEED_OUTFITS = [
  // ── Look 1: Summer Wedding Guest ───────────────────────────────────────────
  {
    outfit: {
      name: 'Golden Hour Garden Party',
      items: [
        { id: 3, brand: 'Zara', name: 'Asymmetric Draped Dress', cat: 'Dresses', color: 'Ivory', price: 69.95, img: '👗' },
        { id: 25, brand: 'Stradivarius', name: 'Strappy Heeled Sandal', cat: 'Shoes', color: 'Gold', price: 42.99, img: '👡' },
        { id: 22, brand: 'Bershka', name: 'Chain Shoulder Bag', cat: 'Bags', color: 'Silver', price: 29.99, img: '👜' },
        { id: 28, brand: 'Stradivarius', name: 'Hoop Earrings Set', cat: 'Accessories', color: 'Gold', price: 12.99, img: '💍' },
      ],
      why: 'Effortless wedding guest — elegant without upstaging. The draped silhouette moves beautifully in summer heat.',
      whyDetailed: 'The asymmetric cut creates visual interest while the ivory keeps it timeless. Gold accessories warm the neutral palette without competing with floral arrangements.',
    },
    reasoning: 'Styled for "summer wedding" with a romantic aesthetic (profile confidence: 85%). Selected 4 pieces totaling €155.92. Weather: 28°C, sunny — lightweight fabrics and open-toe shoes recommended.',
    confidenceScore: 88,
    styleScore: 84,
    critique: {
      approved: true,
      scores: { occasionFit: 92, budgetCompliance: 85, styleCoherence: 88, colorHarmony: 90, trendAlignment: 86, overall: 88 },
      suggestions: ['Add a light linen shawl for the ceremony', 'Consider a neutral clutch for an alternative', 'Gold jewelry ties the warm tones together'],
      issues: [],
      verdict: 'Perfectly suited for a summer wedding. The draped dress balances elegance with comfort, and gold accessories tie the warm palette together beautifully.',
    },
    weatherContext: { temperature: 28, condition: 'Sunny', description: 'Warm summer day', recommendation: 'Lightweight fabrics, open-toe shoes, sun protection', city: 'Madrid' },
    approved: true,
    duration: 0,
    agentTraces: [],
    warnings: [],
    variationLabel: 'Your Style',
    styleCategory: 'Modern Classic',
  },

  // ── Look 2: First Date ────────────────────────────────────────────────────
  {
    outfit: {
      name: 'Confident & Approachable',
      items: [
        { id: 8, brand: 'Zara', name: 'Ribbed Mock-Neck Top', cat: 'Tops', color: 'Chocolate', price: 25.95, img: '👕' },
        { id: 17, brand: 'Bershka', name: 'Y2K Flare Jeans', cat: 'Bottoms', color: 'Light Wash', price: 32.99, img: '👖' },
        { id: 7, brand: 'Zara', name: 'Block Heel Mule', cat: 'Shoes', color: 'Beige', price: 59.95, img: '👠' },
        { id: 4, brand: 'Zara', name: 'Structured Leather Tote', cat: 'Bags', color: 'Tan', price: 79.95, img: '👜' },
      ],
      why: 'Approachable yet intentional. The chocolate top warms the light-wash denim, and the block heel adds polish without overdoing it.',
      whyDetailed: 'The flared jean silhouette is trending for 2025 and elongates the leg when paired with a heeled mule. Tan accessories bridge the warm top and cool denim for a balanced color story.',
    },
    reasoning: 'Styled for "date night" with a minimalist-meets-romantic blend (profile confidence: 78%). Selected 4 pieces totaling €198.84. Aiming for confident, approachable, and slightly dressed up without looking like you tried too hard.',
    confidenceScore: 85,
    styleScore: 82,
    critique: {
      approved: true,
      scores: { occasionFit: 90, budgetCompliance: 80, styleCoherence: 85, colorHarmony: 88, trendAlignment: 84, overall: 85 },
      suggestions: ['Swap to a silk camisole for a more evening-appropriate feel', 'Add a delicate necklace to draw the eye upward', 'The structured tote reads "daytime" — a clutch would elevate'],
      issues: [],
      verdict: 'A solid date-night outfit. The chocolate + light wash + tan palette is harmonious and on-trend. The block heel is a practical choice for a walking date.',
    },
    weatherContext: { temperature: 22, condition: 'Clear', description: 'Mild evening', recommendation: 'Light jacket optional, comfortable footwear for walking', city: 'Madrid' },
    approved: true,
    duration: 0,
    agentTraces: [],
    warnings: [],
    variationLabel: 'Alternative',
    styleCategory: 'Contemporary Edge',
  },

  // ── Look 3: Office / Professional ─────────────────────────────────────────
  {
    outfit: {
      name: 'The Boardroom Edit',
      items: [
        { id: 29, brand: 'Massimo Dutti', name: 'Cashmere V-Neck Sweater', cat: 'Tops', color: 'Navy', price: 99.00, img: '🧥' },
        { id: 30, brand: 'Massimo Dutti', name: 'Tailored Wool Trousers', cat: 'Bottoms', color: 'Charcoal', price: 119.00, img: '👖' },
        { id: 31, brand: 'Massimo Dutti', name: 'Oxford Leather Brogues', cat: 'Shoes', color: 'Cognac', price: 149.00, img: '👞' },
        { id: 4, brand: 'Zara', name: 'Structured Leather Tote', cat: 'Bags', color: 'Tan', price: 79.95, img: '👜' },
      ],
      why: 'Investment dressing at its finest. The cashmere + wool combination signals quality, and cognac accessories warm the navy-charcoal base.',
      whyDetailed: 'Navy and charcoal is a power combo — approachable yet authoritative. Cognac leather accessories add a subtle warmth that prevents the look from feeling cold or severe. The cashmere sweater is lightweight enough for year-round wear.',
    },
    reasoning: 'Styled for "office" with a professional aesthetic (profile confidence: 92%). Selected 4 investment pieces totaling €446.95. Prioritized timeless quality over trend-driven items.',
    confidenceScore: 91,
    styleScore: 89,
    critique: {
      approved: true,
      scores: { occasionFit: 94, budgetCompliance: 70, styleCoherence: 92, colorHarmony: 90, trendAlignment: 88, overall: 91 },
      suggestions: ['Swap the cashmere for a silk blouse in warmer months', 'Add a silk scarf for a personality pop', 'Consider a blazer for formal meetings'],
      issues: ['Budget compliance is borderline — these are investment pieces'],
      verdict: 'Exemplary professional attire. Each piece is versatile enough to remix with other wardrobe items. The cognac-navy-charcoal palette is sophisticated and timeless.',
    },
    weatherContext: { temperature: 18, condition: 'Cloudy', description: 'Cool office day', recommendation: 'Layering-friendly, closed-toe shoes, indoor climate', city: 'Madrid' },
    approved: true,
    duration: 0,
    agentTraces: [],
    warnings: [],
    variationLabel: 'Surprise Me',
    styleCategory: 'Relaxed Luxe',
  },
];

/** Get seed outfit by index (0-2), returns clone to avoid mutation */
export function getSeedOutfit(index = 0) {
  return JSON.parse(JSON.stringify(SEED_OUTFITS[index % SEED_OUTFITS.length]));
}

/** Get all 3 seed outfits as cloned array */
export function getAllSeedOutfits() {
  return SEED_OUTFITS.map(o => JSON.parse(JSON.stringify(o)));
}

export default SEED_OUTFITS;
