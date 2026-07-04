/**
 * Occasion Rules — Maps occasions to formality, required categories, style tags, and color palettes.
 *
 * Each occasion entry defines:
 * - formalityLevel: 1 (totally casual) to 5 (black-tie formal)
 * - requiredCategories: Must-include product categories
 * - preferredCategories: Nice-to-haves
 * - styleTags: Product style tags that match this occasion
 * - colorPalette: Suggested color direction
 * - vibe: The aesthetic tone
 */

export interface OccasionRule {
  id: string;
  label: string;
  formalityLevel: number;
  requiredCategories: string[];
  preferredCategories: string[];
  styleTags: string[];
  colorPalette: string[];
  vibe: string;
}

export const OCCASION_RULES: Record<string, OccasionRule> = {
  wedding: {
    id: 'wedding',
    label: 'Summer Wedding',
    formalityLevel: 4,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Dresses', 'Bags', 'Accessories', 'Outerwear'],
    styleTags: ['wedding', 'evening', 'romantic', 'smart casual', 'formal'],
    colorPalette: ['Ivory', 'Champagne', 'Blush', 'Gold', 'Navy', 'Floral'],
    vibe: 'elegant, romantic, celebratory',
  },
  vacation: {
    id: 'vacation',
    label: 'City Break',
    formalityLevel: 2,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Bags', 'Dresses', 'Accessories'],
    styleTags: ['vacation', 'casual', 'everyday', 'beach'],
    colorPalette: ['White', 'Sand', 'Cream', 'Beige', 'Camel', 'Rust'],
    vibe: 'comfortable, stylish, practical',
  },
  festival: {
    id: 'festival',
    label: 'Festival',
    formalityLevel: 1,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Accessories', 'Bags', 'Outerwear', 'Dresses'],
    styleTags: ['festival', 'streetwear', 'casual', 'vacation', 'concert'],
    colorPalette: ['Black', 'Rust', 'Cobalt', 'White', 'Faded Black', 'Multicolor'],
    vibe: 'bold, expressive, free-spirited',
  },
  date: {
    id: 'date',
    label: 'Date Night',
    formalityLevel: 3,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Dresses', 'Bags', 'Accessories', 'Outerwear'],
    styleTags: ['date', 'evening', 'romantic', 'smart casual'],
    colorPalette: ['Black', 'Blush', 'Gold', 'Chocolate', 'Cream', 'Navy'],
    vibe: 'confident, alluring, intentional',
  },
  office: {
    id: 'office',
    label: 'Office',
    formalityLevel: 4,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Outerwear', 'Bags', 'Accessories'],
    styleTags: ['office', 'smart casual', 'minimal', 'formal'],
    colorPalette: ['Navy', 'Charcoal', 'White', 'Camel', 'Black', 'Ecru'],
    vibe: 'polished, professional, confident',
  },
  beach: {
    id: 'beach',
    label: 'Beach Holiday',
    formalityLevel: 1,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Dresses', 'Bags', 'Accessories'],
    styleTags: ['beach', 'vacation', 'casual'],
    colorPalette: ['White', 'Sand', 'Cream', 'Beige', 'Gold', 'Coral'],
    vibe: 'relaxed, effortless, breezy',
  },
  concert: {
    id: 'concert',
    label: 'Concert Night',
    formalityLevel: 2,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Outerwear', 'Bags', 'Accessories'],
    styleTags: ['concert', 'streetwear', 'casual', 'festival'],
    colorPalette: ['Black', 'Faded Black', 'Rust', 'Cobalt', 'Silver'],
    vibe: 'edgy, statement, energetic',
  },
  weekend: {
    id: 'weekend',
    label: 'Weekend Brunch',
    formalityLevel: 2,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Bags', 'Accessories'],
    styleTags: ['casual', 'everyday', 'weekend', 'smart casual'],
    colorPalette: ['Beige', 'Cream', 'White', 'Sand', 'Chocolate', 'Blush'],
    vibe: 'casual, put-together, relaxed',
  },
};

/**
 * Get the OccasionRule for a given occasion ID, with fallback.
 */
export function getOccasionRule(occasionId: string): OccasionRule {
  return OCCASION_RULES[occasionId] || {
    id: occasionId,
    label: occasionId.charAt(0).toUpperCase() + occasionId.slice(1),
    formalityLevel: 3,
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Bags', 'Outerwear'],
    styleTags: ['casual', 'everyday', 'smart casual'],
    colorPalette: ['Black', 'White', 'Navy', 'Beige'],
    vibe: 'versatile, adaptable',
  };
}

/**
 * Determine formality difference between two style profiles.
 * Used to check if an archetype and occasion are compatible.
 */
export function getFormalityGap(archetypeFormality: number, occasionFormality: number): number {
  return Math.abs(archetypeFormality - occasionFormality);
}

/**
 * Get a unique outfit name based on the occasion and style.
 */
export function getOutfitName(occasion: string, styleCategory: string): string {
  const names: Record<string, string[]> = {
    wedding: ['Golden Hour Garden Party', 'Twilight Romance', 'Summer Celebration'],
    date: ['Confident & Approachable', 'Midnight Elegance', 'First Impression'],
    office: ['The Boardroom Edit', 'Power Lunch', 'Corner Office'],
    festival: ['Weekend Rebel', 'Main Stage Energy', 'Golden Hour Glow'],
    beach: ['Coastal Drift', 'Sun-Kissed Minimal', 'Tide Pools'],
    vacation: ['Wanderlust Edit', 'City Explorer', 'Jet Set Casual'],
    concert: ['Stage Presence', 'Encore', 'Backstage Access'],
    weekend: ['Sunday Morning', 'Brunch Club', 'Leisurely Pace'],
  };
  const options = names[occasion] || ['Signature Style', 'Curated Look', 'Personal Edit'];
  return options[Math.floor(Math.random() * options.length)];
}
