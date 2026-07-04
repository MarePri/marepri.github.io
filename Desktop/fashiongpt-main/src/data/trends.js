/**
 * @typedef {import('../types/index.js').Trend} Trend
 */

/** @type {import('../types/index.js').Trend[]} */
export const TRENDS = [
  { name: "Quiet Luxury", dir: "up", pct: 94, desc: "Understated elegance, premium materials, no logos", brands: ["Massimo Dutti", "Zara"] },
  { name: "Linen Everything", dir: "up", pct: 91, desc: "Breathable summer staple, multiple silhouettes", brands: ["Pull&Bear", "Zara", "Oysho"] },
  { name: "Baggy Denim", dir: "up", pct: 89, desc: "Y2K revival, carpenter & wide fits dominating", brands: ["Pull&Bear", "Bershka"] },
  { name: "Crochet & Knits", dir: "up", pct: 87, desc: "Artisan textures returning for summer", brands: ["Bershka", "Stradivarius"] },
  { name: "Chocolate Brown", dir: "up", pct: 85, desc: "The neutral of the season, replacing camel", brands: ["Zara", "Massimo Dutti"] },
  { name: "Slim Fit Revival", dir: "down", pct: 38, desc: "Losing ground to relaxed silhouettes", brands: [] },
  { name: "Fast Logo Tees", dir: "down", pct: 29, desc: "Loud branding fading vs. minimal aesthetic", brands: [] },
  { name: "Athleisure Blend", dir: "up", pct: 82, desc: "Performance fabrics in everyday contexts", brands: ["Oysho", "Pull&Bear"] },
];
