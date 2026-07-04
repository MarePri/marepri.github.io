/**
 * Weather Rules — Temperature/condition → fabric weight, layering, color palette.
 *
 * Maps weather data to outfit recommendations:
 * - Fabric weight and breathability
 * - Number of layers
 * - Color palette guidance
 * - Specific product recommendations
 */

export interface WeatherInfluence {
  fabricWeight: number;         // 0 (minimal/breathable) – 100 (heavy/insulated)
  layerCount: number;           // Recommended number of layers
  colorTone: 'warm' | 'cool' | 'neutral';  // Color direction
  recommendedFabrics: string[];
  avoidFabrics: string[];
  openToe: boolean;              // Open-toe shoes appropriate?
  outerwearNeeded: boolean;
  description: string;
}

/**
 * Get weather influence based on temperature and condition.
 */
export function getWeatherInfluence(
  temperature: number,
  condition?: string
): WeatherInfluence {
  // Temperature-based rules
  if (temperature >= 28) {
    return {
      fabricWeight: 10,
      layerCount: 1,
      colorTone: 'cool',
      recommendedFabrics: ['Linen', 'Cotton', 'Rayon', 'Silk', 'Tencel'],
      avoidFabrics: ['Wool', 'Leather', 'Polyester', 'Denim heavy'],
      openToe: true,
      outerwearNeeded: false,
      description: 'Hot — prioritize breathable, loose-fit fabrics. Open-toe shoes and sun protection recommended.',
    };
  }

  if (temperature >= 22) {
    return {
      fabricWeight: 25,
      layerCount: 1,
      colorTone: 'warm',
      recommendedFabrics: ['Cotton', 'Linen', 'Silk', 'Tencel', 'Light denim'],
      avoidFabrics: ['Wool', 'Heavy knit', 'Leather'],
      openToe: true,
      outerwearNeeded: false,
      description: 'Warm — light layers work well. Breathable fabrics keep you comfortable.',
    };
  }

  if (temperature >= 15) {
    return {
      fabricWeight: 45,
      layerCount: 2,
      colorTone: 'warm',
      recommendedFabrics: ['Cotton', 'Denim', 'Light knit', 'Silk', 'Tencel'],
      avoidFabrics: ['Heavy wool', 'Insulated'],
      openToe: false,
      outerwearNeeded: false,
      description: 'Mild — most fabrics work. A light jacket or cardigan for evening is smart.',
    };
  }

  if (temperature >= 8) {
    return {
      fabricWeight: 65,
      layerCount: 2,
      colorTone: 'neutral',
      recommendedFabrics: ['Knit', 'Denim', 'Wool blend', 'Cotton', 'Leather'],
      avoidFabrics: ['Linen', 'Rayon', 'Silk'],
      openToe: false,
      outerwearNeeded: true,
      description: 'Cool — layers essential. Medium-weight jacket and closed shoes recommended.',
    };
  }

  // Cold (below 8°C)
  return {
    fabricWeight: 90,
    layerCount: 3,
    colorTone: 'neutral',
    recommendedFabrics: ['Wool', 'Cashmere', 'Leather', 'Heavy knit', 'Insulated'],
    avoidFabrics: ['Linen', 'Cotton thin', 'Rayon', 'Silk'],
    openToe: false,
    outerwearNeeded: true,
    description: 'Cold — bundle up with warm layers. Wool, cashmere, and insulated footwear essential.',
  };
}

/**
 * Apply weather-based color adjustments to a base palette.
 * Returns adjusted colors that match the weather tone.
 */
export function adjustPaletteForWeather(
  baseColors: string[],
  weatherInfluence: WeatherInfluence
): string[] {
  const warmColors = ['Rust', 'Camel', 'Chocolate', 'Cognac', 'Gold', 'Tan', 'Cream', 'Beige'];
  const coolColors = ['White', 'Navy', 'Slate', 'Cobalt', 'Silver', 'Ivory', 'Ecru', 'Blush'];
  const neutralColors = ['Black', 'White', 'Grey', 'Navy', 'Beige', 'Charcoal'];

  let preferred: string[];
  switch (weatherInfluence.colorTone) {
    case 'warm':
      preferred = warmColors;
      break;
    case 'cool':
      preferred = coolColors;
      break;
    default:
      preferred = neutralColors;
  }

  // Intersect base palette with weather-preferred colors, then fill with preferred
  const matched = baseColors.filter(c => preferred.includes(c));
  if (matched.length > 0) return matched;

  // Fallback: return first 3 from preferred
  return preferred.slice(0, 3);
}

/**
 * Check if weather permits open-toe shoes.
 */
export function canWearOpenToe(temperature: number): boolean {
  return temperature >= 22;
}

/**
 * Get outerwear recommendation based on temperature.
 */
export function getOuterwearRecommendation(temperature: number): string | null {
  if (temperature >= 25) return null;
  if (temperature >= 18) return 'Light jacket or cardigan';
  if (temperature >= 10) return 'Medium jacket or coat';
  return 'Warm coat or heavy jacket';
}
