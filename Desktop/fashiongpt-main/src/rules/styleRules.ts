/**
 * Style Rules — Archetype definitions, style tag compatibility, formality levels.
 *
 * Maps fashion archetypes to their core attributes and defines compatibility
 * between style tags, categories, and formality levels.
 */

export interface StyleProfile {
  archetypeId: string;
  tags: string[];
  formalityLevel: number;       // 1 (casual) – 5 (formal)
  preferredColors: string[];
  preferredBrands: string[];
  preferredCategories: string[];
  description: string;
}

export const ARCHETYPE_PROFILES: Record<string, StyleProfile> = {
  minimalist: {
    archetypeId: 'minimalist',
    tags: ['minimal', 'smart casual', 'everyday', 'office'],
    formalityLevel: 3,
    preferredColors: ['Black', 'White', 'Beige', 'Grey', 'Navy'],
    preferredBrands: ['Zara', 'Massimo Dutti'],
    preferredCategories: ['Tops', 'Bottoms', 'Shoes', 'Bags'],
    description: 'Clean lines, neutral palette, quality over quantity.',
  },
  streetwear: {
    archetypeId: 'streetwear',
    tags: ['streetwear', 'casual', 'concert', 'festival'],
    formalityLevel: 1,
    preferredColors: ['Black', 'White', 'Rust', 'Cobalt', 'Faded Black'],
    preferredBrands: ['Pull&Bear', 'Bershka'],
    preferredCategories: ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'],
    description: 'Bold silhouettes, cultural references, comfort-first.',
  },
  romantic: {
    archetypeId: 'romantic',
    tags: ['romantic', 'date', 'evening', 'wedding', 'vacation'],
    formalityLevel: 4,
    preferredColors: ['Blush', 'Cream', 'Gold', 'White', 'Floral'],
    preferredBrands: ['Stradivarius', 'Zara'],
    preferredCategories: ['Dresses', 'Tops', 'Shoes', 'Bags', 'Accessories'],
    description: 'Feminine details, soft textures, occasion-ready.',
  },
  professional: {
    archetypeId: 'professional',
    tags: ['office', 'formal', 'smart casual', 'minimal'],
    formalityLevel: 5,
    preferredColors: ['Navy', 'Charcoal', 'White', 'Camel', 'Black'],
    preferredBrands: ['Massimo Dutti', 'Zara'],
    preferredCategories: ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Bags'],
    description: 'Tailored silhouettes, investment pieces, boardroom-ready.',
  },
};

/** Category compatibility for complete looks (which categories can coexist) */
export const CATEGORY_ORDER: string[] = [
  'Outerwear', 'Tops', 'Dresses', 'Bottoms', 'Shoes', 'Bags', 'Accessories', 'Sport', 'Loungewear'
];

/** Categories that are alternatives to each other (mutually exclusive per look) */
export const ALTERNATIVE_CATEGORIES: Record<string, string[]> = {
  'Tops': ['Dresses'],           // Dress replaces top+bottom
  'Dresses': ['Tops', 'Bottoms'], // Dress eliminates need for top+bottom
};

/**
 * Get the StyleProfile for an archetype, falling back to a balanced default.
 */
export function getStyleProfile(archetypeId?: string | null): StyleProfile {
  if (archetypeId && ARCHETYPE_PROFILES[archetypeId]) {
    return { ...ARCHETYPE_PROFILES[archetypeId] };
  }
  // Default: balanced profile
  return {
    archetypeId: 'versatile',
    tags: ['casual', 'smart casual', 'everyday', 'minimal'],
    formalityLevel: 3,
    preferredColors: ['Black', 'White', 'Navy', 'Beige'],
    preferredBrands: ['Zara', 'Pull&Bear', 'Stradivarius'],
    preferredCategories: ['Tops', 'Bottoms', 'Shoes', 'Bags'],
    description: 'Versatile style — adapts to any occasion with balanced choices.',
  };
}

/**
 * Compute compatibility score between two style tags (0 = incompatible, 100 = perfect match).
 */
export function getTagCompatibility(tagA: string, tagB: string): number {
  const compatiblePairs: Record<string, string[]> = {
    'minimal': ['smart casual', 'office', 'everyday'],
    'smart casual': ['minimal', 'office', 'casual', 'everyday'],
    'office': ['minimal', 'smart casual', 'formal'],
    'casual': ['everyday', 'weekend', 'vacation', 'streetwear'],
    'evening': ['date', 'wedding', 'romantic'],
    'romantic': ['date', 'evening', 'wedding', 'vacation'],
    'streetwear': ['casual', 'concert', 'festival'],
    'vacation': ['beach', 'casual', 'festival', 'romantic'],
    'wedding': ['evening', 'romantic', 'formal'],
    'festival': ['streetwear', 'casual', 'vacation', 'concert'],
    'concert': ['streetwear', 'festival', 'casual'],
    'date': ['evening', 'romantic', 'smart casual'],
    'beach': ['vacation', 'casual'],
    'sport': ['wellness', 'casual'],
    'lounge': ['wellness', 'casual'],
    'formal': ['office', 'wedding', 'evening'],
  };

  if (tagA === tagB) return 100;
  const pairs = compatiblePairs[tagA] || [];
  if (pairs.includes(tagB)) return 75;
  return 30; // Low but non-zero — most tags can work together
}
