import React, { useState, useEffect, useMemo } from 'react';
import { useSavedOutfitsContext } from '../hooks/SavedOutfitsContext.jsx';
import WeatherWidget from './WeatherWidget.jsx';
import DelightWidget from './DelightWidget.jsx';

/**
 * HomeScreen — Streamlined landing page.
 * 
 * Every element answers: "How does this help someone dress better today?"
 * 
 * Sections:
 * 1. Time-aware greeting + context (weather)
 * 2. Hero CTA: "Create an Outfit" — the primary action
 * 3. Quick Generate — one-tap instant outfit
 * 4. Recent favorites (if they have saved looks)
 * 5. Simple style tip
 */
export default function HomeScreen({ memory, onNavigate }) {
  const saved = useSavedOutfitsContext();
  const [greeting, setGreeting] = useState('');
  const [timeIcon, setTimeIcon] = useState('☀️');
  const [styleTip, setStyleTip] = useState('');

  // Time-aware greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
      setTimeIcon('🌅');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
      setTimeIcon('☀️');
    } else if (hour < 21) {
      setGreeting('Good evening');
      setTimeIcon('🌆');
    } else {
      setGreeting('Good night');
      setTimeIcon('🌙');
    }
  }, []);

  // Rotating style tips
  const TIPS = [
    'A well-fitted blazer instantly elevates any casual outfit.',
    'Contrasting textures (denim + silk + leather) create visual interest.',
    'The golden ratio for accessories: rule of three.',
    'Monochromatic outfits are universally flattering — play with shades.',
    'Your belt should match your shoes for a polished look.',
    'A statement accessory is worth more than a busy pattern.',
    'White sneakers work with almost every casual outfit.',
    'Layering adds depth: start light, layer darker.',
    'The hem of your trousers should just kiss the top of your shoes.',
    'Less is one bold piece, the rest neutral.',
  ];

  useEffect(() => {
    setStyleTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  // Recent saved looks (top 2)
  const recentFaves = useMemo(() => {
    return saved.savedOutfits
      .filter(o => o.rating >= 4)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .slice(0, 2);
  }, [saved.savedOutfits]);

  const isReturning = saved.savedOutfits.length > 0;

  return (
    <div className="home-screen">
      {/* ════════════════════════════════════════════
         GREETING
         ════════════════════════════════════════════ */}
      <div className="home-greeting-section">
        <div className="home-greeting-icon">{timeIcon}</div>
        <div className="home-greeting-text">
          <h1 className="home-greeting">{greeting}</h1>
          {isReturning ? (
            <p className="home-returning">
              Welcome back{memory?.lastSeenAgo ? ` · last seen ${memory.lastSeenAgo()}` : ''}
            </p>
          ) : (
            <p className="home-returning">Let's find your style ✨</p>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
         WEATHER
         ════════════════════════════════════════════ */}
      <WeatherWidget />
      <DelightWidget />

      {/* ════════════════════════════════════════════
         HERO: How can I help you dress today?
         ════════════════════════════════════════════ */}
      <div className="home-hero-card">
        <h2 className="home-hero-title">What are you wearing today?</h2>
        <p className="home-hero-desc">Share the occasion and I'll curate 3 complete looks from your favorite Inditex brands — tailored to your style DNA, the weather, and the moment.</p>
        <button
          className="home-hero-cta"
          onClick={() => onNavigate?.('create')}
        >
          <span className="home-hero-cta-icon">✨</span>
          <span className="home-hero-cta-text">Create an Outfit</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════
         QUICK GENERATE — One-tap instant outfit
         ════════════════════════════════════════════ */}
      <button
        className="home-quick-gen"
        onClick={() => {
          memory?.save({ lastTab: 'create', quickGenerate: true });
          onNavigate?.('create');
        }}
      >
        <span className="home-quick-gen-icon">⚡</span>
        <div className="home-quick-gen-text">
          <span className="home-quick-gen-label">Quick Generate</span>
          <span className="home-quick-gen-sub">Random occasion & style — 3 looks instantly</span>
        </div>
      </button>

      {/* ════════════════════════════════════════════
         RECENT FAVORITES (if they have saves)
         ════════════════════════════════════════════ */}
      {recentFaves.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <h3 className="home-section-title">Recent Favorites</h3>
            <button className="home-section-link" onClick={() => onNavigate?.('wardrobe')}>
              See all in Wardrobe →
            </button>
          </div>
          <div className="home-faves-row">
            {recentFaves.map(o => (
              <div key={o.id} className="home-fave-item">
                <div className="home-fave-icon">👗</div>
                <div className="home-fave-info">
                  <span className="home-fave-name">{o.name}</span>
                  <span className="home-fave-occasion">{o.occasion}</span>
                </div>
                <span className="home-fave-rating">{'★'.repeat(o.rating || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
         STYLE TIP
         ════════════════════════════════════════════ */}
      <div className="home-tip-card">
        <span className="home-tip-icon">💡</span>
        <div className="home-tip-content">
          <span className="home-tip-label">Style Tip</span>
          <p className="home-tip-text">{styleTip}</p>
        </div>
      </div>
    </div>
  );
}
