import React, { useState, useMemo } from 'react';
import { ARCHETYPES } from '../data/archetypes.js';
import { PRODUCTS } from '../data/products.js';

/**
 *  Build curated outfits from product data by matching style tags to archetypes.
 */
const STYLE_MAP = {
  minimalist: ['minimal', 'everyday'],
  streetwear: ['streetwear', 'concert', 'festival'],
  romantic: ['romantic', 'date', 'wedding'],
  professional: ['office', 'formal', 'smart casual'],
};

function buildCuratedLooks() {
  return ARCHETYPES.map((arch) => {
    const tags = STYLE_MAP[arch.id] || [];
    const matching = PRODUCTS.filter((p) =>
      p.style.some((s) => tags.includes(s))
    );

    // Build 2 outfits per archetype: smart casual + evening/occasion
    const outfits = [];
    const byCategory = {};

    matching.forEach((p) => {
      if (!byCategory[p.cat]) byCategory[p.cat] = [];
      byCategory[p.cat].push(p);
    });

    // Pick one item from each major category for a complete look
    const categories = ['Outerwear', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories'];
    const picks = {};

    // Look 1: balanced, mid-range
    categories.forEach((cat) => {
      const items = byCategory[cat];
      if (items && items.length > 0) {
        picks[cat] = items[Math.floor(Math.random() * items.length)];
      }
    });
    if (Object.keys(picks).length >= 2) {
      const items = Object.values(picks);
      outfits.push({
        id: `${arch.id}_1`,
        items,
        totalPrice: items.reduce((s, i) => s + i.price, 0),
        vibe: 'Everyday Chic',
      });
    }

    // Look 2: evening/occasion - bias toward dresses + heels + bags
    const picks2 = {};
    const dressItems = byCategory['Dresses'] || [];
    const shoeItems = byCategory['Shoes'] || [];
    const bagItems = byCategory['Bags'] || [];
    const topItems = byCategory['Tops'] || [];

    if (dressItems.length > 0) picks2['Dresses'] = dressItems[dressItems.length - 1];
    if (shoeItems.length > 0) picks2['Shoes'] = shoeItems[shoeItems.length - 1];
    if (bagItems.length > 0) picks2['Bags'] = bagItems[bagItems.length - 1];
    if (topItems.length > 0 && !picks2['Dresses']) picks2['Tops'] = topItems[topItems.length - 1];

    if (Object.keys(picks2).length >= 2) {
      const items = Object.values(picks2);
      outfits.push({
        id: `${arch.id}_2`,
        items,
        totalPrice: items.reduce((s, i) => s + i.price, 0),
        vibe: 'Evening Statement',
      });
    }

    return { ...arch, outfits };
  });
}

/**
 * Discovery — browse curated outfit ideas across all style archetypes.
 * Click "Try This Look" to jump to the Outfit tab with the archetype pre-filled.
 */
export default function Discovery({ onTryLook }) {
  const [activeArch, setActiveArch] = useState('all');

  const curated = useMemo(() => buildCuratedLooks(), []);

  const filtered = activeArch === 'all'
    ? curated
    : curated.filter((a) => a.id === activeArch);

  return (
    <div className="section-pad discovery">
      <div className="section-title">Style Discovery</div>
      <div className="section-sub">Explore curated looks across every style archetype.</div>

      {/* Archetype filter chips */}
      <div className="disc-filter-row">
        <button
          className={`disc-filter-chip${activeArch === 'all' ? ' active' : ''}`}
          onClick={() => setActiveArch('all')}
        >All</button>
        {ARCHETYPES.map((a) => (
          <button
            key={a.id}
            className={`disc-filter-chip${activeArch === a.id ? ' active' : ''}`}
            onClick={() => setActiveArch(a.id)}
          >
            {a.icon} {a.name}
          </button>
        ))}
      </div>

      {/* Curated looks */}
      <div className="disc-grid">
        {filtered.map((arch) => (
          <div key={arch.id} className="disc-arch-section">
            <div className="disc-arch-header">
              <span className="disc-arch-icon">{arch.icon}</span>
              <div>
                <div className="disc-arch-name">{arch.name}</div>
                <div className="disc-arch-desc">{arch.desc}</div>
              </div>
            </div>

            {arch.outfits.length === 0 ? (
              <div className="empty-state-personality">
                <span className="empty-state-icon">🎨</span>
                <h3>Curating looks for {arch.name}</h3>
                <p>We're working on outfits that match this style. Check back soon for hand-picked selections.</p>
              </div>
            ) : (
              <div className="disc-outfits">
                {arch.outfits.map((outfit) => (
                  <div key={outfit.id} className="disc-outfit-card">
                    {/* Vibe badge */}
                    <div className="disc-vibe-badge">{outfit.vibe}</div>

                    {/* Items grid */}
                    <div className="disc-items">
                      {outfit.items.map((item) => (
                        <div key={item.id} className="disc-item">
                          <img className="disc-item-img" src={item.img} alt={item.name} />
                          <span className="disc-item-name">{item.name}</span>
                          <span className="disc-item-brand">{item.brand}</span>
                          <span className="disc-item-price">€{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Color palette */}
                    <div className="disc-palette">
                      {[...new Set(outfit.items.map((i) => i.color.split('/')[0].trim()))].slice(0, 5).map((c) => (
                        <span key={c} className="disc-swatch" title={c} style={{ background: colorToHex(c) }} />
                      ))}
                    </div>

                    {/* Total */}
                    <div className="disc-total">
                      <span className="disc-total-label">Total</span>
                      <span className="disc-total-price">€{outfit.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Try this look */}
                    <button
                      className="disc-try-btn"
                      onClick={() => onTryLook?.(arch.id)}
                    >
                      Try This Look →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple color name → hex mapper for palette swatches.
 */
function colorToHex(name) {
  const map = {
    black: '#1a1a1a', white: '#f5f5f5', beige: '#f5e6d0', grey: '#9e9e9e',
    navy: '#1a2744', charcoal: '#36454f', camel: '#c19a6b', tan: '#d2b48c',
    cognac: '#9a4a2a', rust: '#b7410e', cobalt: '#0047ab', blush: '#f4c2c2',
    cream: '#fffdd0', gold: '#d4af37', silver: '#c0c0c0', floral: '#e8b4c8',
    ecru: '#c3b091', ivory: '#fffff0', champagne: '#f7e7ce', chocolate: '#7b3f00',
    slate: '#708090', 'dusty pink': '#dca3a3', sand: '#c2b280',
    multicolor: 'linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71, #3498db, #9b59b6)',
    'washed blue': '#6b8fa3', 'light wash': '#a8c4d8', 'medium wash': '#6a8a9e',
    'faded black': '#2a2a2a', 'white/navy': 'linear-gradient(90deg, #f5f5f5 50%, #1a2744 50%)',
    'navy/white': 'linear-gradient(90deg, #1a2744 50%, #f5f5f5 50%)',
    'blue print': '#2c5f8a',
  };
  return map[name?.toLowerCase()] || '#ccc';
}
