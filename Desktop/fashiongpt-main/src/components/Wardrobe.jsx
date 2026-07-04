import React, { useState } from 'react';
import { useSavedOutfitsContext } from '../hooks/SavedOutfitsContext.jsx';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';
import OutfitCard from './OutfitCard.jsx';
import CapsuleWardrobe from './CapsuleWardrobe.jsx';
import StyleMemoryPanel from './StyleMemoryPanel.jsx';
import CriticScore from './CriticScore.jsx';

/**
 * Wardrobe — Your personal style collection.
 * Merges Saved Looks + Capsule Wardrobe + Style Memory into one tab.
 * Sub-navigation: Saved (default) | Capsule | Memory
 */
export default function Wardrobe({ onNavigate, capsuleResult, capsuleLoading, buildCapsule, onResetCapsule }) {
  const [section, setSection] = useState('saved'); // saved | capsule | memory
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const { savedOutfits, removeOutfit, rateOutfit } = useSavedOutfitsContext();
  const styleMem = useStyleMemoryContext();

  const filtered = savedOutfits.filter(o => {
    if (filter === 'rated') return o.rating > 0;
    if (filter === 'unrated') return o.rating === 0;
    return true;
  });

  const occasionCounts = {};
  savedOutfits.forEach(o => {
    occasionCounts[o.occasion] = (occasionCounts[o.occasion] || 0) + 1;
  });
  const occasions = Object.keys(occasionCounts);

  return (
    <div className="section-pad wardrobe">
      {/* ─── Sub-navigation ─────────────────────────────── */}
      <div className="section-title">My Wardrobe</div>
      <p className="section-sub">Your saved looks, capsule, and style memory — all in one place.</p>

      <div className="wardrobe-subnav">
        <button
          className={`wardrobe-subnav-btn${section === 'saved' ? ' active' : ''}`}
          onClick={() => setSection('saved')}
        >
          <span className="wardrobe-subnav-icon">❤️</span>
          <span>Saved</span>
          {savedOutfits.length > 0 && <span className="wardrobe-subnav-badge">{savedOutfits.length}</span>}
        </button>
        <button
          className={`wardrobe-subnav-btn${section === 'capsule' ? ' active' : ''}`}
          onClick={() => setSection('capsule')}
        >
          <span className="wardrobe-subnav-icon">🗂</span>
          <span>Capsule</span>
        </button>
        <button
          className={`wardrobe-subnav-btn${section === 'memory' ? ' active' : ''}`}
          onClick={() => setSection('memory')}
        >
          <span className="wardrobe-subnav-icon">🧠</span>
          <span>Memory</span>
        </button>
      </div>

      {/* ─── SECTION: Saved Looks ───────────────────────── */}
      {section === 'saved' && (
        <>
          {savedOutfits.length === 0 ? (
            <div className="empty-state-animated">
              <span className="empty-state-icon" style={{ fontSize: 56 }}>👗</span>
              <h3 className="empty-state-title">Your Style Collection</h3>
              <p className="empty-state-desc">
                This is where your favorite looks live. Generate outfits, save the ones you love, and build your personal style library.
              </p>
              <button className="empty-state-action" onClick={() => onNavigate?.('create')}>
                ✦ Generate Your First Look
              </button>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div className="sl-stats">
                <div className="sl-stat">
                  <span className="sl-stat-val">{savedOutfits.length}</span>
                  <span className="sl-stat-lbl">Total</span>
                </div>
                <div className="sl-stat">
                  <span className="sl-stat-val">{savedOutfits.filter(o => o.rating > 0).length}</span>
                  <span className="sl-stat-lbl">Rated</span>
                </div>
                <div className="sl-stat">
                  <span className="sl-stat-val">{savedOutfits.filter(o => o.rating >= 4).length}</span>
                  <span className="sl-stat-lbl">Loved</span>
                </div>
                <div className="sl-stat">
                  <span className="sl-stat-val">{occasions.length}</span>
                  <span className="sl-stat-lbl">Occasions</span>
                </div>
              </div>

              {/* Filters */}
              <div className="sl-filters">
                <button className={`sl-filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
                <button className={`sl-filter-btn${filter === 'rated' ? ' active' : ''}`} onClick={() => setFilter('rated')}>Rated</button>
                <button className={`sl-filter-btn${filter === 'unrated' ? ' active' : ''}`} onClick={() => setFilter('unrated')}>Unrated</button>
              </div>

              {/* Saved looks list */}
              <div className="sl-list">
                {filtered.map(o => (
                  <div key={o.id} className="sl-item">
                    <div className="sl-item-header">
                      <div className="sl-item-meta">
                        <span className="sl-item-name">{o.name}</span>
                        <span className="sl-item-occasion">{o.occasion}</span>
                        <span className="sl-item-date">
                          {new Date(o.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <OutfitCard
                      outfit={o.result?.outfit}
                      showActions
                      rating={o.rating}
                      onRate={(r) => { rateOutfit(o.id, r); styleMem?.recordRate(o.result, r); }}
                      onRemove={() => removeOutfit(o.id)}
                    />

                    {o.result?.critique && (
                      <div className="sl-critic-toggle" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                        <span>🔍 Why This Outfit?</span>
                        <span>{expandedId === o.id ? '▲' : '▼'}</span>
                      </div>
                    )}
                    {expandedId === o.id && o.result?.critique && (
                      <CriticScore critique={o.result.critique} weatherContext={o.result.weatherContext} />
                    )}

                    <div className="sl-item-divider" />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ─── SECTION: Capsule Wardrobe ──────────────────── */}
      {section === 'capsule' && (
        <CapsuleWardrobe
          capsuleResult={capsuleResult}
          capsuleLoading={capsuleLoading}
          buildCapsule={buildCapsule}
          onReset={onResetCapsule}
        />
      )}

      {/* ─── SECTION: Style Memory ──────────────────────── */}
      {section === 'memory' && (
        <div className="wardrobe-memory-section">
          <StyleMemoryPanel />
        </div>
      )}
    </div>
  );
}
