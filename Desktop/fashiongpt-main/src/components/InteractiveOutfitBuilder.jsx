import React, { useState, useCallback } from 'react';
import { modifyOutfit } from '../rules/outfitEngine';

/**
 * InteractiveOutfitBuilder — lets users tweak and customize a generated outfit.
 *
 * Features:
 * - Swap individual items (top, bottom, shoes)
 * - Formality slider (more casual ↔ more formal)
 * - Color swap (replaces the most discordant color item with a neutral)
 * - Real-time scoring after each modification
 */
const InteractiveOutfitBuilder = React.memo(function InteractiveOutfitBuilder({ look, onModify, onClose }) {
  const [modifying, setModifying] = useState(null);   // which action is running
  const [formalityLevel, setFormalityLevel] = useState(0); // -1 casual, 0 neutral, +1 formal
  const [modifiedLook, setModifiedLook] = useState(look);

  // Categorize items
  const tops = (modifiedLook?.outfit?.items || []).filter(i => i.cat === 'Tops');
  const bottoms = (modifiedLook?.outfit?.items || []).filter(i => i.cat === 'Bottoms');
  const shoes = (modifiedLook?.outfit?.items || []).filter(i => i.cat === 'Shoes');
  const dresses = (modifiedLook?.outfit?.items || []).filter(i => i.cat === 'Dresses');
  const outerwear = (modifiedLook?.outfit?.items || []).filter(i => i.cat === 'Outerwear');
  const bags = (modifiedLook?.outfit?.items || []).filter(i => i.cat === 'Bags');
  const accessories = (modifiedLook?.outfit?.items || []).filter(i => i.cat === 'Accessories');

  const handleSwap = useCallback((action, label) => {
    setModifying(label);
    try {
      // Build a minimal EngineOutfitResult from the look
      const input = {
        ...modifiedLook,
        outfit: {
          ...modifiedLook?.outfit,
          items: (modifiedLook?.outfit?.items || []).map(item => ({
            ...item,
            style: item.style || [],
            trend: item.trend || 70,
            price: item.price || 0,
          })),
        },
      };
      const result = modifyOutfit(input, action);
      setModifiedLook(result);
      onModify?.(result);
    } catch (err) {
      console.warn(`[InteractiveOutfitBuilder] ${label} failed:`, err);
    } finally {
      setModifying(null);
    }
  }, [modifiedLook, onModify]);

  const handleFormalityChange = useCallback((direction) => {
    const action = direction === 'more_formal' ? 'more_formal' : 'more_casual';
    handleSwap(action, 'Formality');
    setFormalityLevel(prev => {
      if (direction === 'more_formal') return Math.min(prev + 1, 1);
      return Math.max(prev - 1, -1);
    });
  }, [handleSwap]);

  const handleReset = useCallback(() => {
    setModifiedLook(look);
    setFormalityLevel(0);
    onModify?.(look);
  }, [look, onModify]);

  if (!look?.outfit?.items?.length) return null;

  return (
    <div className="interactive-builder">
      <div className="builder-header">
        <h4 className="builder-title">✏️ Customize This Look</h4>
        <div className="builder-header-actions">
          <button className="builder-reset-btn" onClick={handleReset} title="Reset to original">
            ↺ Reset
          </button>
          <button className="builder-close-btn" onClick={onClose} title="Close builder">
            ✕
          </button>
        </div>
      </div>

      {/* ── Items Grid ──────────────────────────────────────────────── */}
      <div className="builder-items-grid">
        {tops.length > 0 && (
          <div className="builder-item-row">
            <div className="builder-item-info">
              <span className="builder-item-cat">Top</span>
              <span className="builder-item-name">{tops[0].name}</span>
              <span className="builder-item-brand">{tops[0].brand} · €{tops[0].price}</span>
            </div>
            <button
              className="builder-swap-btn"
              onClick={() => handleSwap('swap_top', 'Top')}
              disabled={modifying !== null}
            >
              {modifying === 'Top' ? '⟳' : '↻ Swap'}
            </button>
          </div>
        )}

        {dresses.length > 0 && (
          <div className="builder-item-row">
            <div className="builder-item-info">
              <span className="builder-item-cat">Dress</span>
              <span className="builder-item-name">{dresses[0].name}</span>
              <span className="builder-item-brand">{dresses[0].brand} · €{dresses[0].price}</span>
            </div>
          </div>
        )}

        {bottoms.length > 0 && (
          <div className="builder-item-row">
            <div className="builder-item-info">
              <span className="builder-item-cat">Bottom</span>
              <span className="builder-item-name">{bottoms[0].name}</span>
              <span className="builder-item-brand">{bottoms[0].brand} · €{bottoms[0].price}</span>
            </div>
            <button
              className="builder-swap-btn"
              onClick={() => handleSwap('swap_bottom', 'Bottom')}
              disabled={modifying !== null}
            >
              {modifying === 'Bottom' ? '⟳' : '↻ Swap'}
            </button>
          </div>
        )}

        {shoes.length > 0 && (
          <div className="builder-item-row">
            <div className="builder-item-info">
              <span className="builder-item-cat">Shoes</span>
              <span className="builder-item-name">{shoes[0].name}</span>
              <span className="builder-item-brand">{shoes[0].brand} · €{shoes[0].price}</span>
            </div>
            <button
              className="builder-swap-btn"
              onClick={() => handleSwap('swap_shoes', 'Shoes')}
              disabled={modifying !== null}
            >
              {modifying === 'Shoes' ? '⟳' : '↻ Swap'}
            </button>
          </div>
        )}

        {outerwear.map((item, i) => (
          <div className="builder-item-row" key={`outerwear-${i}`}>
            <div className="builder-item-info">
              <span className="builder-item-cat">Outerwear</span>
              <span className="builder-item-name">{item.name}</span>
              <span className="builder-item-brand">{item.brand} · €{item.price}</span>
            </div>
          </div>
        ))}

        {bags.map((item, i) => (
          <div className="builder-item-row" key={`bag-${i}`}>
            <div className="builder-item-info">
              <span className="builder-item-cat">Bag</span>
              <span className="builder-item-name">{item.name}</span>
              <span className="builder-item-brand">{item.brand} · €{item.price}</span>
            </div>
          </div>
        ))}

        {accessories.map((item, i) => (
          <div className="builder-item-row" key={`acc-${i}`}>
            <div className="builder-item-info">
              <span className="builder-item-cat">Accessory</span>
              <span className="builder-item-name">{item.name}</span>
              <span className="builder-item-brand">{item.brand} · €{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action Buttons ──────────────────────────────────────────── */}
      <div className="builder-actions">
        {/* Color Swap */}
        <button
          className="builder-action-btn"
          onClick={() => handleSwap('color_swap', 'Color')}
          disabled={modifying !== null}
          title="Swap the least harmonious color item for a neutral"
        >
          <span className="builder-action-icon">🎨</span>
          <span className="builder-action-label">Color Swap</span>
        </button>

        {/* Formality: More Casual */}
        <button
          className="builder-action-btn"
          onClick={() => handleFormalityChange('more_casual')}
          disabled={modifying !== null || formalityLevel <= -1}
          title="Make the look more casual"
        >
          <span className="builder-action-icon">👕</span>
          <span className="builder-action-label">Casual</span>
        </button>

        {/* Formality indicator */}
        <div className="builder-formality-indicator">
          <span className={`builder-formality-dot ${formalityLevel === -1 ? 'active' : ''}`} />
          <span className={`builder-formality-dot ${formalityLevel === 0 ? 'active' : ''}`} />
          <span className={`builder-formality-dot ${formalityLevel === 1 ? 'active' : ''}`} />
        </div>

        {/* Formality: More Formal */}
        <button
          className="builder-action-btn"
          onClick={() => handleFormalityChange('more_formal')}
          disabled={modifying !== null || formalityLevel >= 1}
          title="Make the look more formal"
        >
          <span className="builder-action-label">Formal</span>
          <span className="builder-action-icon">🤵</span>
        </button>
      </div>

      {/* ── Live Score Preview ──────────────────────────────────────── */}
      {modifiedLook?.critique?.scores && (
        <div className="builder-score-preview">
          <div className="builder-score-row">
            <span className="builder-score-label">Overall</span>
            <div className="builder-score-bar">
              <div
                className="builder-score-fill"
                style={{
                  width: `${modifiedLook.critique.scores.overall || 0}%`,
                  backgroundColor:
                    (modifiedLook.critique.scores.overall || 0) >= 70
                      ? 'var(--up)'
                      : (modifiedLook.critique.scores.overall || 0) >= 50
                        ? 'var(--accent2)'
                        : 'var(--down)',
                }}
              />
            </div>
            <span className="builder-score-val">{modifiedLook.critique.scores.overall}</span>
          </div>
        </div>
      )}

      {/* ── Modified Notification ──────────────────────────────────── */}
      {modifiedLook !== look && (
        <div className="builder-modified-notice">
          ⚡ Modified — changes are reflected below
        </div>
      )}
    </div>
  );
});

export default InteractiveOutfitBuilder;
