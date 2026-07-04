import React, { useState, useEffect } from 'react';

/**
 * WeatherWidget — displays current weather for outfit context.
 * Fetches from the weather service on mount, falls back to mock.
 * Silently hides on error — never blocks the UI.
 */
export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    import('../services/weather.ts').then(({ getWeather }) => {
      getWeather().then(data => {
        if (!cancelled) {
          setWeather(data);
          setLoading(false);
        }
      }).catch(() => {
        if (!cancelled) setLoading(false);
      });
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-skeleton" />
      </div>
    );
  }

  if (!weather) return null; // Silently hide on error

  const iconMap = {
    'Clear': '☀️',
    'Clouds': '⛅',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
  };

  return (
    <div className="weather-widget">
      <div className="weather-icon">
        {iconMap[weather.condition] || '🌤️'}
      </div>
      <div className="weather-info">
        <div className="weather-temp">{weather.temperature}°C</div>
        <div className="weather-desc">{weather.description}</div>
        <div className="weather-recommendation">{weather.recommendation}</div>
      </div>
    </div>
  );
}
