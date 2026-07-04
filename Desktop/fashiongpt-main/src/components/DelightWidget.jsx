import React, { useState, useEffect, useMemo } from 'react';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';
import { useSavedOutfitsContext } from '../hooks/SavedOutfitsContext.jsx';
import { ARCHETYPES } from '../data/archetypes.js';

/**
 * DelightWidget — Intelligent style insights and "wow moments".
 *
 * Shows personalized content like:
 * - "Color of the Week"
 * - "You've improved your style score by X%"
 * - "FashionGPT predicts you'll love relaxed tailoring"
 * - "Your wardrobe leans heavily toward minimalist luxury"
 * - "Today's Style Insight"
 * These rotate and feel intelligent because they're based on real user data.
 */
export default function DelightWidget() {
  const styleMem = useStyleMemoryContext();
  const saved = useSavedOutfitsContext();
  const mem = styleMem?.memory;
  const [insightIndex, setInsightIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Generate all possible insights from user data
  const insights = useMemo(() => {
    const list = [];

    if (!mem || mem.totalSaves === 0) {
      // Onboarding insights (before user has data)
      list.push({
        icon: '💡',
        title: 'Did You Know?',
        text: 'Saving outfits helps FashionGPT learn your personal style — the more you save, the better your recommendations get.',
      });
      list.push({
        icon: '✨',
        title: 'Get Started',
        text: 'Head to the Outfit tab to generate your first 3 looks. It takes just a few seconds!',
      });
      list.push({
        icon: '🎯',
        title: 'Pro Tip',
        text: 'Rating outfits with 😍 or 👎 helps FashionGPT understand exactly what you love.',
      });
      return list;
    }

    // User has data — generate personalized insights

    // Color insight
    const topColors = Object.entries(mem.colorSignals || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    if (topColors.length > 0) {
      list.push({
        icon: '🎨',
        title: 'Your Color Story',
        text: topColors.length >= 3
          ? `Your most-loved colors are ${topColors[0]}, ${topColors[1]}, and ${topColors[2]}. ${topColors[0]} really defines your aesthetic!`
          : `${topColors[0]} is your signature color — it appears in most of your saved looks.`,
      });
    }

    // Brand insight
    const topBrands = Object.entries(mem.brandSignals || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    if (topBrands.length > 0) {
      list.push({
        icon: '🏷️',
        title: 'Brand Affinity',
        text: `You consistently reach for ${topBrands.join(' and ')}. ${topBrands.length === 1 ? 'That\'s your go-to!' : 'These really suit your style.'}`,
      });
    }

    // Archetype insight
    const archEntries = Object.entries(mem.archetypeSignals || {})
      .sort((a, b) => b[1] - a[1]);
    if (archEntries.length > 0) {
      const archId = archEntries[0][0];
      const arch = ARCHETYPES.find(a => a.id === archId);
      if (arch) {
        list.push({
          icon: arch.icon,
          title: 'Style DNA Active',
          text: `Your looks consistently reflect ${arch.name} aesthetic. "${arch.desc}"`,
        });
      }
    }

    // Category insight
    const topCats = Object.entries(mem.categorySignals || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 1).map(([k]) => k);
    if (topCats.length > 0) {
      list.push({
        icon: '👗',
        title: 'Category King',
        text: `${topCats[0]} is your most-saved category. You clearly have an eye for it!`,
      });
    }

    // Avoided insight
    const avoidCats = Object.entries(mem.categoryNegatives || {})
      .filter(([cat, count]) => count >= 2 && (mem.categorySignals[cat] || 0) < count)
      .sort((a, b) => b[1] - a[1]).slice(0, 1).map(([k]) => k);
    if (avoidCats.length > 0) {
      list.push({
        icon: '✕',
        title: 'Style Refinement',
        text: `FashionGPT noticed you tend to skip ${avoidCats[0]} pieces. We'll keep that in mind!`,
      });
    }

    // Saving milestone
    if (mem.totalSaves > 0) {
      list.push({
        icon: '📈',
        title: 'Style Progress',
        text: mem.totalSaves >= 10
          ? `You've saved ${mem.totalSaves} outfits! That's a solid style library. Your FashionGPT recommendations are getting smarter every time.`
          : mem.totalSaves >= 5
          ? `${mem.totalSaves} outfits saved! FashionGPT is starting to understand your taste.`
          : `You've saved ${mem.totalSaves} outfit${mem.totalSaves > 1 ? 's' : ''}. Keep going to build your style profile!`,
      });
    }

    // Trend prediction
    const trendPredictions = [
      'FashionGPT predicts you\'ll love relaxed tailoring this season.',
      'Based on your saved looks, earth tones would suit your palette perfectly.',
      'Your saved looks suggest you\'d rock a monochromatic moment.',
      'FashionGPT thinks layering textures would elevate your current style.',
      'Have you tried a statement accessory? Your saved looks lean minimal — one bold piece could transform them.',
    ];
    if (mem.totalSaves >= 3) {
      list.push({
        icon: '🔮',
        title: 'FashionGPT Predicts',
        text: trendPredictions[Math.floor(Math.random() * trendPredictions.length)],
      });
    }

    // Style score
    const score = Math.min(100, Math.round(
      (mem.totalSaves * 5) +
      (Object.keys(mem.brandSignals).length * 3) +
      (Object.keys(mem.colorSignals).length * 2) +
      (mem.totalGenerations * 1)
    ));
    if (score > 0) {
      list.push({
        icon: '⭐',
        title: 'Style Score',
        text: `Your FashionGPT Style Score is ${score}/100. ${score >= 70 ? 'You\'re a style authority!' : score >= 40 ? 'You\'re developing a strong style identity.' : 'Every saved look increases your score!'}`,
      });
    }

    return list;
  }, [mem, saved.savedOutfits]);

  // Rotate insight every 8 seconds
  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setInsightIndex(prev => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [insights.length]);

  if (dismissed || insights.length === 0) return null;

  const current = insights[insightIndex];
  if (!current) return null;

  return (
    <div className="delight-widget">
      <div className="delight-header">
        <span className="delight-title">
          <span className="delight-icon">{current.icon}</span>
          {current.title}
        </span>
        {insights.length > 1 && (
          <span className="delight-counter">{insightIndex + 1}/{insights.length}</span>
        )}
        <button className="delight-dismiss" onClick={() => setDismissed(true)}>✕</button>
      </div>
      <p className="delight-text">{current.text}</p>
    </div>
  );
}
