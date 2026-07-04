import React, { useMemo } from 'react';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';
import { useSavedOutfitsContext } from '../hooks/SavedOutfitsContext.jsx';

/**
 * StyleEvolution — Preference tracking dashboard.
 *
 * Shows the user's evolving style profile:
 * - Top brands, categories, colors
 * - Most-used occasions and archetypes
 * - Saved looks gallery with average scores
 * - Style history timeline
 * - Explicit "Clear Memory" option
 */
export default function StyleEvolution() {
  const styleMem = useStyleMemoryContext();
  const saved = useSavedOutfitsContext();
  const memory = styleMem.memory;

  // Compute derived stats
  const stats = useMemo(() => {
    const avgPrice = memory.priceCount > 0
      ? Math.round(memory.priceTotal / memory.priceCount)
      : null;

    const topBrands = topEntries(memory.brandSignals, 5);
    const topCategories = topEntries(memory.categorySignals, 5);
    const topColors = topEntries(memory.colorSignals, 5);
    const topArchetypes = topEntries(memory.archetypeSignals, 5);
    const topOccasions = topEntries(memory.occasionSignals, 5);

    const avoidedBrands = topEntries(memory.brandNegatives, 3);
    const avoidedCategories = topEntries(memory.categoryNegatives, 3);

    const totalSaved = (saved.savedOutfits || []).length;
    const avgScore = totalSaved > 0
      ? Math.round(
          saved.savedOutfits.reduce((s, o) => s + (o.result?.critique?.scores?.overall || 75), 0) / totalSaved
        )
      : null;

    return {
      avgPrice,
      topBrands,
      topCategories,
      topColors,
      topArchetypes,
      topOccasions,
      avoidedBrands,
      avoidedCategories,
      totalSaved,
      avgScore,
      totalGenerations: memory.totalGenerations || 0,
      totalSaves: memory.totalSaves || 0,
    };
  }, [memory, saved.savedOutfits]);

  const lastUpdated = memory.lastUpdated
    ? new Date(memory.lastUpdated).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'Never';

  const hasActivity = stats.totalGenerations > 0 || stats.totalSaved > 0;

  return (
    <div className="style-evolution">
      <div className="se-header">
        <h3 className="se-title">📊 Style Evolution</h3>
        <p className="se-subtitle">Your style profile, built from {stats.totalGenerations} generations and {stats.totalSaves} saves</p>
        {memory.lastUpdated && (
          <span className="se-last-updated">Last updated: {lastUpdated}</span>
        )}
      </div>

      {!hasActivity ? (
        <div className="se-empty">
          <div className="se-empty-icon">🌱</div>
          <div className="se-empty-text">
            <strong>Your style story begins here.</strong>
            <p>Generate and save outfits to build your personalized style profile. Each save teaches FashionGPT your preferences.</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Summary Stats ─────────────────────────────────────────── */}
          <div className="se-summary-stats">
            <div className="se-stat-card">
              <span className="se-stat-val">{stats.totalGenerations}</span>
              <span className="se-stat-lbl">Looks Generated</span>
            </div>
            <div className="se-stat-card">
              <span className="se-stat-val">{stats.totalSaves}</span>
              <span className="se-stat-lbl">Looks Saved</span>
            </div>
            {stats.avgScore && (
              <div className="se-stat-card">
                <span className="se-stat-val" style={{ color: stats.avgScore >= 70 ? 'var(--up)' : 'var(--accent2)' }}>
                  {stats.avgScore}
                </span>
                <span className="se-stat-lbl">Avg Score</span>
              </div>
            )}
            {stats.avgPrice && (
              <div className="se-stat-card">
                <span className="se-stat-val">€{stats.avgPrice}</span>
                <span className="se-stat-lbl">Avg Item Price</span>
              </div>
            )}
          </div>

          {/* ── Preference Grid ───────────────────────────────────────── */}
          <div className="se-prefs-grid">
            {/* Brands */}
            <div className="se-pref-card">
              <h4 className="se-pref-title">🏷️ Preferred Brands</h4>
              {stats.topBrands.length > 0 ? (
                <div className="se-tag-list">
                  {stats.topBrands.map(([brand, count]) => (
                    <div key={brand} className="se-tag">
                      <span className="se-tag-label">{brand}</span>
                      <span className="se-tag-count">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="se-pref-empty">Save outfits to discover your brand preferences</p>
              )}
            </div>

            {/* Categories */}
            <div className="se-pref-card">
              <h4 className="se-pref-title">👗 Favorite Categories</h4>
              {stats.topCategories.length > 0 ? (
                <div className="se-tag-list">
                  {stats.topCategories.map(([cat, count]) => (
                    <div key={cat} className="se-tag">
                      <span className="se-tag-label">{cat}</span>
                      <span className="se-tag-count">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="se-pref-empty">Save outfits to see your category preferences</p>
              )}
            </div>

            {/* Colors */}
            <div className="se-pref-card">
              <h4 className="se-pref-title">🎨 Color Palette</h4>
              {stats.topColors.length > 0 ? (
                <div className="se-color-list">
                  {stats.topColors.map(([color, count]) => (
                    <div key={color} className="se-color-chip">
                      <span className="se-color-swatch" style={{
                        background: colorToHex(color),
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        display: 'inline-block',
                        border: '1px solid var(--border)',
                        flexShrink: 0,
                      }} />
                      <span className="se-color-label">{color}</span>
                      <span className="se-color-count">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="se-pref-empty">Save outfits to track your color preferences</p>
              )}
            </div>

            {/* Occasions */}
            <div className="se-pref-card">
              <h4 className="se-pref-title">📅 Most Styled Occasions</h4>
              {stats.topOccasions.length > 0 ? (
                <div className="se-tag-list">
                  {stats.topOccasions.map(([occ, count]) => (
                    <div key={occ} className="se-tag">
                      <span className="se-tag-label">{occ}</span>
                      <span className="se-tag-count">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="se-pref-empty">Generate looks to see your most-used occasions</p>
              )}
            </div>

            {/* Archetypes */}
            <div className="se-pref-card">
              <h4 className="se-pref-title">🧑‍🎨 Style Archetypes</h4>
              {stats.topArchetypes.length > 0 ? (
                <div className="se-tag-list">
                  {stats.topArchetypes.map(([arch, count]) => (
                    <div key={arch} className="se-tag">
                      <span className="se-tag-label">{arch}</span>
                      <span className="se-tag-count">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="se-pref-empty">Select an archetype during generation to see your preferences</p>
              )}
            </div>

            {/* Avoided */}
            {(stats.avoidedBrands.length > 0 || stats.avoidedCategories.length > 0) && (
              <div className="se-pref-card se-avoided">
                <h4 className="se-pref-title">🚫 Less Preferred</h4>
                <div className="se-tag-list">
                  {stats.avoidedBrands.map(([brand, count]) => (
                    <div key={brand} className="se-tag se-avoid-tag">
                      <span className="se-tag-label">{brand}</span>
                      <span className="se-tag-count">{count}</span>
                    </div>
                  ))}
                  {stats.avoidedCategories.map(([cat, count]) => (
                    <div key={cat} className="se-tag se-avoid-tag">
                      <span className="se-tag-label">{cat}</span>
                      <span className="se-tag-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Style Summary ─────────────────────────────────────────── */}
          {styleMem.getSummary() && (
            <div className="se-summary-box">
              <div className="se-summary-icon">📝</div>
              <div className="se-summary-text">{styleMem.getSummary()}</div>
            </div>
          )}
        </>
      )}

      {/* ── Saved Looks Gallery ─────────────────────────────────────── */}
      {stats.totalSaved > 0 && (
        <div className="se-saved-gallery">
          <h4 className="se-gallery-title">💾 Saved Looks ({stats.totalSaved})</h4>
          <div className="se-gallery-grid">
            {saved.savedOutfits.slice().reverse().slice(0, 12).map((item, i) => {
              const result = item.result || {};
              const items = result.outfit?.items || [];
              const total = items.reduce((s, i) => s + (i.price || 0), 0);
              const score = result.critique?.scores?.overall || 75;
              return (
                <div key={item.id || i} className="se-gallery-card">
                  <div className="se-gallery-header">
                    <span className="se-gallery-name">{item.name || 'Styled Look'}</span>
                    <span className="se-gallery-score" style={{
                      color: score >= 70 ? 'var(--up)' : 'var(--accent2)',
                    }}>{score}</span>
                  </div>
                  <div className="se-gallery-items">
                    {items.slice(0, 4).map((it, j) => (
                      <span key={j} className="se-gallery-item">{it.name?.split(' ').slice(0, 2).join(' ') || it.brand || 'Item'}</span>
                    ))}
                  </div>
                  <div className="se-gallery-footer">
                    <span className="se-gallery-occasion">{item.occasion || ''}</span>
                    <span className="se-gallery-price">€{total.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Clear Memory ────────────────────────────────────────────── */}
      <div className="se-clear-section">
        <button className="se-clear-btn" onClick={() => {
          if (window.confirm('Clear all style memory and saved outfits? This cannot be undone.')) {
            styleMem.clear();
            saved.clearAll();
          }
        }}>
          🗑️ Clear All Data
        </button>
        <span className="se-clear-note">This removes your style profile, saved outfits, and preference data.</span>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Get top N entries from a signal map, sorted by count descending */
function topEntries(map, n = 5) {
  return Object.entries(map || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/** Rough color name → hex conversion for showing swatches */
function colorToHex(color) {
  const map = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Navy': '#000080',
    'Blue': '#0000FF',
    'Cobalt': '#0047AB',
    'Teal': '#008080',
    'Green': '#008000',
    'Lime': '#00FF00',
    'Red': '#FF0000',
    'Rust': '#B7410E',
    'Cognac': '#9A463D',
    'Camel': '#C19A6B',
    'Tan': '#D2B48C',
    'Sand': '#C2B280',
    'Gold': '#FFD700',
    'Beige': '#F5F5DC',
    'Yellow': '#FFFF00',
    'Cream': '#FFFDD0',
    'Ivory': '#FFFFF0',
    'Ecru': '#C2B280',
    'Champagne': '#F7E7CE',
    'Grey': '#808080',
    'Slate': '#708090',
    'Pink': '#FFC0CB',
    'Purple': '#800080',
    'Orange': '#FFA500',
    'Brown': '#A52A2A',
    'Khaki': '#C3B091',
    'Olive': '#808000',
    'Burgundy': '#800020',
    'Charcoal': '#36454F',
    'Denim': '#1565C0',
    'Pastel': '#B2EBF2',
  };
  return map[color] || '#ccc';
}
