import React, { useState, useMemo } from 'react';

/**
 * OutfitBattle — Side-by-side comparison of all 3 looks with pick-a-winner.
 *
 * Features:
 * - All 3 looks displayed simultaneously with scores
 * - Dimension-by-dimension score comparison
 * - "Pick Winner" mechanic with celebration
 * - Winner tracking with style memory integration
 */
const OutfitBattle = React.memo(function OutfitBattle({ looks, styleCategories, onPickWinner, onRegenerate }) {
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [showDimensionCompare, setShowDimensionCompare] = useState(false);

  // Compute best-in-class for each dimension
  const bestScores = useMemo(() => {
    if (!looks?.length) return {};
    const dimensions = ['occasionFit', 'colorHarmony', 'styleCoherence', 'trendAlignment', 'overall'];
    const best = {};
    for (const dim of dimensions) {
      let maxVal = -1;
      let maxIdx = -1;
      looks.forEach((look, i) => {
        const val = look.critique?.scores?.[dim] || 0;
        if (val > maxVal) { maxVal = val; maxIdx = i; }
      });
      best[dim] = { value: maxVal, index: maxIdx };
    }
    return best;
  }, [looks]);

  const handlePickWinner = (index) => {
    setWinnerIndex(index);
    onPickWinner?.(index, looks[index]);
  };

  if (!looks?.length) return null;

  return (
    <div className="outfit-battle">
      <div className="battle-header">
        <h4 className="battle-title">⇄ Outfit Battle</h4>
        <p className="battle-subtitle">Compare all 3 looks and pick your favorite</p>
      </div>

      {/* Winner banner */}
      {winnerIndex !== null && (
        <div className="battle-winner-banner">
          <span className="battle-winner-icon">🏆</span>
          <div className="battle-winner-text">
            <strong>{looks[winnerIndex].variationLabel || `Look ${winnerIndex + 1}`} wins!</strong>
            <span> Overall score: {looks[winnerIndex].critique?.scores?.overall || 75}</span>
          </div>
          <button className="battle-reset-btn" onClick={() => setWinnerIndex(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Dimension compare toggle */}
      <button
        className="battle-dim-toggle"
        onClick={() => setShowDimensionCompare(!showDimensionCompare)}
      >
        {showDimensionCompare ? '▲ Hide Dimension Compare' : '▼ Compare by Dimension'}
      </button>

      {/* Dimension compare table */}
      {showDimensionCompare && (
        <div className="battle-dim-table">
          <div className="battle-dim-row battle-dim-header">
            <span className="battle-dim-label">Dimension</span>
            {looks.map((_, i) => (
              <span key={i} className="battle-dim-cell">
                {looks[i].variationLabel || `Look ${i + 1}`}
              </span>
            ))}
          </div>
          {['occasionFit', 'colorHarmony', 'styleCoherence', 'trendAlignment', 'budgetCompliance', 'overall'].map(dim => (
            <div key={dim} className="battle-dim-row">
              <span className="battle-dim-label">
                {dimLabel(dim)}
                {bestScores[dim] && (
                  <span className="battle-dim-crown">👑</span>
                )}
              </span>
              {looks.map((look, i) => {
                const val = look.critique?.scores?.[dim] || '-';
                const isBest = bestScores[dim]?.index === i;
                return (
                  <span
                    key={i}
                    className={`battle-dim-cell ${isBest ? 'best' : ''}`}
                  >
                    {val}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Card grid */}
      <div className="battle-grid">
        {looks.map((look, i) => {
          const score = look.critique?.scores?.overall || 75;
          const isWinner = winnerIndex === i;
          return (
            <div
              key={i}
              className={`battle-card${isWinner ? ' winner' : ''}${winnerIndex !== null && !isWinner ? ' faded' : ''}`}
            >
              <div className="battle-card-header">
                <span className="battle-card-label">{look.variationLabel || `Look ${i + 1}`}</span>
                <span className="battle-card-cat">{styleCategories?.[i] || 'Signature'}</span>
              </div>

              {/* Score circle */}
              <div className="battle-score-circle" style={{
                borderColor: score >= 70 ? 'var(--up)' : score >= 50 ? 'var(--accent2)' : 'var(--down)',
              }}>
                <span className="battle-score-val">{score}</span>
                <span className="battle-score-lbl">Overall</span>
              </div>

              {/* Mini scores */}
              <div className="battle-mini-scores">
                {[
                  { key: 'occasionFit', label: 'Occasion', val: look.critique?.scores?.occasionFit || 0 },
                  { key: 'colorHarmony', label: 'Color', val: look.critique?.scores?.colorHarmony || 0 },
                  { key: 'styleCoherence', label: 'Style', val: look.critique?.scores?.styleCoherence || 0 },
                ].map(s => (
                  <div key={s.key} className="battle-mini-row">
                    <span className="battle-mini-label">{s.label}</span>
                    <div className="battle-mini-bar">
                      <div className="battle-mini-fill" style={{
                        width: `${s.val}%`,
                        backgroundColor: s.val >= 70
                          ? 'var(--up)'
                          : s.val >= 50
                            ? 'var(--accent2)'
                            : 'var(--down)',
                      }} />
                    </div>
                    <span className="battle-mini-val">{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Items preview */}
              <div className="battle-items-preview">
                {(look.outfit?.items || []).slice(0, 4).map((item, j) => (
                  <div key={j} className="battle-item-chip">
                    <span className="battle-item-color" style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: item.color || '#ccc',
                      marginRight: 4,
                    }} />
                    <span className="battle-item-name">{item.name?.split(' ').slice(0, 3).join(' ') || 'Item'}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="battle-total">
                €{(look.outfit?.items || []).reduce((s, item) => s + (item.price || 0), 0).toFixed(2)}
              </div>

              {/* Actions */}
              <div className="battle-actions">
                {winnerIndex === null && (
                  <button
                    className="battle-pick-btn"
                    onClick={() => handlePickWinner(i)}
                  >
                    👑 Pick Winner
                  </button>
                )}
                {onRegenerate && (
                  <button
                    className="battle-regen-btn"
                    onClick={() => onRegenerate(i)}
                  >
                    🔄
                  </button>
                )}
              </div>

              {/* Winner badge */}
              {isWinner && (
                <div className="battle-winner-badge">
                  🏆 Winner
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default OutfitBattle;

function dimLabel(key) {
  const labels = {
    occasionFit: 'Occasion Fit',
    colorHarmony: 'Color Harmony',
    styleCoherence: 'Style Coherence',
    trendAlignment: 'Trend Alignment',
    budgetCompliance: 'Budget',
    overall: 'Overall',
  };
  return labels[key] || key;
}

// Needed for the crown indicator to re-render properly
