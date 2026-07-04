import React, { useMemo } from 'react';
import { ARCHETYPES } from '../data/archetypes.js';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';

/**
 * StyleMemoryPanel — Shows what FashionGPT has learned about the user.
 * Makes the invisible style memory visible, creating the "knows me" feeling.
 *
 * Shows:
 * - Favorite colors (with swatches)
 * - Favorite brands
 * - Preferred categories
 * - Style archetype signals
 * - Learning progress
 */
export default function StyleMemoryPanel({ compact }) {
  const styleMem = useStyleMemoryContext();
  const mem = styleMem?.memory;

  const hasData = mem && (mem.totalSaves > 0 || Object.keys(mem.brandSignals).length > 0);

  if (!hasData) {
    if (compact) return null;
    return (
      <div className="sm-empty">
        <div className="sm-empty-icon">🧠</div>
        <p className="sm-empty-text">
          FashionGPT is learning your style. Save outfits and rate them to build your style profile!
        </p>
      </div>
    );
  }

  // Top colors with weights
  const topColors = useMemo(() => {
    if (!mem) return [];
    return Object.entries(mem.colorSignals || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [mem]);

  // Top brands
  const topBrands = useMemo(() => {
    if (!mem) return [];
    return Object.entries(mem.brandSignals || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [mem]);

  // Top categories
  const topCategories = useMemo(() => {
    if (!mem) return [];
    return Object.entries(mem.categorySignals || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [mem]);

  // Archetype
  const topArchetype = useMemo(() => {
    if (!mem) return null;
    const entries = Object.entries(mem.archetypeSignals || {})
      .sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;
    const archId = entries[0][0];
    return ARCHETYPES.find(a => a.id === archId) || null;
  }, [mem]);

  // Avoided categories (negative signals)
  const avoidedCats = useMemo(() => {
    if (!mem) return [];
    return Object.entries(mem.categoryNegatives || {})
      .filter(([cat, count]) => count >= 2 && (mem.categorySignals[cat] || 0) < count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
  }, [mem]);

  // Learning insight text
  const learningInsight = useMemo(() => {
    const parts = [];
    if (mem.totalSaves > 0) parts.push(`${mem.totalSaves} looks saved`);
    if (mem.totalGenerations > 0) parts.push(`${mem.totalGenerations} outfits generated`);
    const disliked = Object.values(mem.categoryNegatives || {}).reduce((s, v) => s + v, 0);
    if (disliked > 0) parts.push(`learned from ${disliked} dislikes`);
    return parts.length > 0 ? parts.join(' · ') : 'Learning in progress';
  }, [mem]);

  if (compact) {
    // Compact version — inline for use in OutfitGenerator/SavedLooks
    return (
      <div className="sm-compact">
        <div className="sm-compact-header">
          <span className="sm-compact-icon">🧠</span>
          <span className="sm-compact-title">FashionGPT Knows You</span>
          <span className="sm-compact-insight">{learningInsight}</span>
        </div>

        {topColors.length > 0 && (
          <div className="sm-compact-row">
            <span className="sm-compact-row-label">Your colors</span>
            <div className="sm-color-dots">
              {topColors.slice(0, 4).map(c => (
                <span key={c.name} className="sm-color-dot" title={c.name} style={{ background: colorToHex(c.name) }} />
              ))}
            </div>
          </div>
        )}

        {topBrands.length > 0 && (
          <div className="sm-compact-row">
            <span className="sm-compact-row-label">Favorite brands</span>
            <div className="sm-brand-chips">
              {topBrands.slice(0, 3).map(b => (
                <span key={b.name} className="sm-brand-chip">{b.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Full version ────────────────────────────────────────────────
  return (
    <div className="sm-panel">
      <div className="sm-panel-header">
        <div className="sm-panel-title-row">
          <span className="sm-panel-icon">🧠</span>
          <div>
            <h3 className="sm-panel-title">Style Memory</h3>
            <p className="sm-panel-subtitle">
              FashionGPT remembers what you love
            </p>
          </div>
        </div>
        <span className="sm-panel-badge">{learningInsight}</span>
      </div>

      {/* Archetype */}
      {topArchetype && (
        <div className="sm-section">
          <div className="sm-section-header">
            <span className="sm-section-icon">{topArchetype.icon}</span>
            <div>
              <span className="sm-section-title">Your Style DNA</span>
              <span className="sm-section-desc">{topArchetype.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Favorite Colors */}
      {topColors.length > 0 && (
        <div className="sm-section">
          <span className="sm-section-label">🎨 Favorite Colors</span>
          <div className="sm-color-grid">
            {topColors.map(c => (
              <div key={c.name} className="sm-color-item">
                <span className="sm-color-swatch" style={{ background: colorToHex(c.name) }} />
                <span className="sm-color-name">{c.name}</span>
                <span className="sm-color-count">{c.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Brands */}
      {topBrands.length > 0 && (
        <div className="sm-section">
          <span className="sm-section-label">🏷️ Favorite Brands</span>
          <div className="sm-brand-grid">
            {topBrands.map(b => (
              <div key={b.name} className="sm-brand-item">
                <span className="sm-brand-name">{b.name}</span>
                <span className="sm-brand-count">{b.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferred Categories */}
      {topCategories.length > 0 && (
        <div className="sm-section">
          <span className="sm-section-label">👗 Preferred Categories</span>
          <div className="sm-cat-grid">
            {topCategories.map(c => (
              <span key={c.name} className="sm-cat-chip">{c.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Avoided Categories */}
      {avoidedCats.length > 0 && (
        <div className="sm-section">
          <span className="sm-section-label sm-label-avoid">✕ Not Your Style</span>
          <div className="sm-avoid-grid">
            {avoidedCats.map(c => (
              <span key={c} className="sm-avoid-chip">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Learning progress */}
      <div className="sm-footer">
        <span className="sm-footer-text">
          FashionGPT improves with every outfit you save, rate, or skip.
        </span>
        <button className="sm-reset-btn" onClick={() => { if (window.confirm('Clear all style memory? This cannot be undone.')) styleMem?.clear(); }}>
          Reset Memory
        </button>
      </div>
    </div>
  );
}

/**
 * Color name → hex mapper.
 */
function colorToHex(name) {
  const map = {
    black: '#1a1a1a', white: '#f5f5f5', beige: '#f5e6d0', grey: '#9e9e9e',
    navy: '#1a2744', charcoal: '#36454f', camel: '#c19a6b', tan: '#d2b48c',
    cognac: '#9a4a2a', rust: '#b7410e', cobalt: '#0047ab', blush: '#f4c2c2',
    cream: '#fffdd0', gold: '#d4af37', silver: '#c0c0c0', floral: '#e8b4c8',
    ecru: '#c3b091', ivory: '#fffff0', champagne: '#f7e7ce', chocolate: '#7b3f00',
    slate: '#708090', 'dusty pink': '#dca3a3', sand: '#c2b280',
  };
  return map[name?.toLowerCase()] || '#ccc';
}
