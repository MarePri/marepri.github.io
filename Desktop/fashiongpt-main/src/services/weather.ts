// ─── Weather Service ──────────────────────────────────────────────────────────
// Fetches real weather data from OpenWeatherMap (optional — needs API key).
// Falls back to mock data when the API key is unavailable.
// Returns structured weather context for outfit generation.

export interface WeatherData {
  temperature: number;       // Celsius
  condition: string;         // e.g. "Clear", "Clouds", "Rain"
  description: string;       // e.g. "clear sky", "light rain"
  humidity: number;          // Percentage
  windSpeed: number;         // m/s
  feelsLike: number;         // Celsius
  icon: string;              // Weather icon code
  recommendation: string;    // Human-readable style recommendation
}

export interface WeatherServiceConfig {
  apiKey?: string;
  city?: string;
  lat?: number;
  lon?: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_WEATHER: Record<string, WeatherData> = {
  clear: {
    temperature: 26,
    condition: 'Clear',
    description: 'clear sky',
    humidity: 45,
    windSpeed: 3.2,
    feelsLike: 27,
    icon: '01d',
    recommendation: 'Light layers work best — linen, cotton, and breathable fabrics. Sun protection recommended.',
  },
  cloudy: {
    temperature: 18,
    condition: 'Clouds',
    description: 'overcast clouds',
    humidity: 65,
    windSpeed: 4.5,
    feelsLike: 17,
    icon: '04d',
    recommendation: 'A light jacket or cardigan recommended. Versatile layers that can adjust through the day.',
  },
  rainy: {
    temperature: 14,
    condition: 'Rain',
    description: 'light rain',
    humidity: 80,
    windSpeed: 6.1,
    feelsLike: 12,
    icon: '10d',
    recommendation: 'Water-resistant outer layer recommended. Closed shoes and an umbrella are essential.',
  },
  cold: {
    temperature: 5,
    condition: 'Snow',
    description: 'cold winter',
    humidity: 70,
    windSpeed: 5.0,
    feelsLike: 1,
    icon: '13d',
    recommendation: 'Bundle up — warm layers, wool, and insulated footwear. A coat is essential.',
  },
};

const MOCK_HOT: WeatherData = {
  temperature: 32,
  condition: 'Clear',
  description: 'hot summer day',
  humidity: 35,
  windSpeed: 2.0,
  feelsLike: 34,
  icon: '01d',
  recommendation: 'Keep it light and airy — linen, loose fits, and breathable fabrics. Sun hat and sunglasses recommended.',
};

function getMockWeather(): WeatherData {
  const month = new Date().getMonth();
  // Summer (Jun-Aug): hot; Spring/Fall: clear; Winter: cold
  if (month >= 5 && month <= 7) return MOCK_HOT;
  if (month >= 3 && month <= 4) return { ...MOCK_WEATHER.clear, temperature: 22, feelsLike: 23, recommendation: 'Mild and pleasant — most fabrics work well. A light layer for evening is smart.' };
  if (month >= 8 && month <= 10) return { ...MOCK_WEATHER.cloudy, temperature: 16, feelsLike: 15, recommendation: 'Crisp autumn weather — layers and earth tones fit the season naturally.' };
  return MOCK_WEATHER.cold;
}

// ─── OpenWeatherMap Fetcher ────────────────────────────────────────────────────

async function fetchRealWeather(config: WeatherServiceConfig): Promise<WeatherData | null> {
  const apiKey = config.apiKey || '';
  if (!apiKey) return null;

  let url: string;
  if (config.lat !== undefined && config.lon !== undefined) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${config.lat}&lon=${config.lon}&appid=${apiKey}&units=metric`;
  } else {
    const city = config.city || 'London';
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[WeatherService] API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Build recommendation from conditions
    const temp = Math.round(data.main?.temp || 20);
    const condition = data.weather?.[0]?.main || 'Clear';
    let recommendation: string;

    if (temp >= 28) {
      recommendation = 'Hot weather — prioritize breathable fabrics (linen, cotton). Loose fits and sun protection.';
    } else if (temp >= 22) {
      recommendation = 'Warm and pleasant — light layers work well. A jacket for evening is smart.';
    } else if (temp >= 15) {
      recommendation = 'Mild temperature — layers are your friend. A light jacket or cardigan recommended.';
    } else if (temp >= 8) {
      recommendation = 'Cool weather — a medium-weight jacket and closed shoes. Layering is essential.';
    } else {
      recommendation = 'Cold weather — bundle up with warm layers, wool, and insulated footwear.';
    }

    if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
      recommendation += ' Rain expected — water-resistant outerwear and closed shoes.';
    }

    return {
      temperature: temp,
      condition,
      description: data.weather?.[0]?.description || 'unknown',
      humidity: data.main?.humidity || 50,
      windSpeed: data.wind?.speed || 0,
      feelsLike: Math.round(data.main?.feels_like || temp),
      icon: data.weather?.[0]?.icon || '01d',
      recommendation,
    };
  } catch (err) {
    console.warn(`[WeatherService] Fetch failed:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get current weather data for outfit context.
 * Tries real API first (if key available), falls back to mock data.
 *
 * @param config - Optional: API key, city name, or lat/lon coordinates
 * @returns WeatherData with recommendation text
 */
export async function getWeather(config?: WeatherServiceConfig): Promise<WeatherData> {
  const resolvedConfig: WeatherServiceConfig = {
    apiKey: config?.apiKey || getEnvWeatherKey(),
    city: config?.city || 'London',
    lat: config?.lat,
    lon: config?.lon,
  };

  // Try real API
  const real = await fetchRealWeather(resolvedConfig);
  if (real) {
    console.info(`[WeatherService] Real weather fetched: ${real.temperature}°C, ${real.condition}`);
    return real;
  }

  // Fall back to mock
  const mock = getMockWeather();
  console.info(`[WeatherService] Using mock weather: ${mock.temperature}°C, ${mock.condition}`);
  return mock;
}

function getEnvWeatherKey(): string {
  try {
    return import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  } catch {
    return '';
  }
}

export default { getWeather };
