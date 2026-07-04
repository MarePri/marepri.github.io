/**
 * Explicit mapping of occasion keywords to required product categories.
 * This replaces the string-matching logic in filterByOccasion with a
 * declarative data structure.
 *
 * @typedef {Object} OccasionMapEntry
 * @property {string[]} keywords - Keywords that trigger this occasion
 * @property {string[]} styleTags - Required style tags for product matching
 * @property {string[]} [requiredCategories] - Must-include categories
 * @property {string[]} [preferredCategories] - Nice-to-have categories
 */

/** @type {Object<string, OccasionMapEntry>} */
export const OCCASION_MAP = {
  evening: {
    keywords: ['wedding', 'date', 'evening', 'night', 'dinner', 'gala', 'party'],
    styleTags: ['evening', 'date', 'wedding', 'romantic'],
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Dresses', 'Bags', 'Accessories'],
  },
  casual: {
    keywords: ['beach', 'vacation', 'festival', 'weekend', 'brunch', 'casual', 'everyday'],
    styleTags: ['vacation', 'beach', 'festival', 'casual'],
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Bags', 'Accessories'],
  },
  professional: {
    keywords: ['office', 'professional', 'work', 'business', 'corporate', 'meeting'],
    styleTags: ['office', 'smart casual', 'minimal'],
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Bags', 'Outerwear'],
  },
  street: {
    keywords: ['street', 'concert', 'edgy', 'urban', 'hip', 'trendy'],
    styleTags: ['streetwear', 'concert', 'casual'],
    requiredCategories: ['Tops', 'Bottoms', 'Shoes'],
    preferredCategories: ['Outerwear', 'Accessories', 'Bags'],
  },
  lounge: {
    keywords: ['lounge', 'home', 'comfort', 'relax', 'wellness', 'sleep'],
    styleTags: ['lounge', 'wellness', 'casual'],
    requiredCategories: ['Loungewear', 'Tops'],
    preferredCategories: ['Sport', 'Shoes'],
  },
  sport: {
    keywords: ['sport', 'gym', 'workout', 'athletic', 'fitness', 'run'],
    styleTags: ['sport', 'gym', 'wellness'],
    requiredCategories: ['Sport', 'Shoes'],
    preferredCategories: ['Tops', 'Bags'],
  },
};

/**
 * Categorize a user message into occasion types.
 * @param {string} text
 * @returns {string[]} Array of matching occasion keys
 */
export function classifyOccasion(text) {
  if (!text) return ['casual'];
  const lower = text.toLowerCase();
  const matches = [];
  for (const [key, entry] of Object.entries(OCCASION_MAP)) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        matches.push(key);
        break;
      }
    }
  }
  return matches.length > 0 ? matches : ['casual'];
}
