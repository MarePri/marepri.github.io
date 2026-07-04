import React, { useState } from 'react';
import ProductRecommendations from './ProductRecommendations.jsx';
import FeedbackBar from './FeedbackBar.jsx';

/**
 * OutfitCard — displays an outfit with visible reasoning.
 *
 * Every outfit includes:
 * - Why it was chosen (chosenFor)
 * - What problem it solves (solves)
 * - What alternatives were rejected (rejectedAlternatives)
 * - Per-dimension confidence breakdown with reasoning (confidenceBreakdown)
 */
function OutfitCard({
  outfit,
  reasoning,
  showActions,
  rating,
  onSave,
  onRate,
  onRegenerate,
  onRemove,
  isSaved,
  scores,
  showWhyThisWorks,
  onFeedback,
}) {
  // Auto-expand when reasoning data exists — always show for portfolio reviewers
  const hasReasoning = !!(reasoning?.confidenceBreakdown?.length);
  const [showWhy, setShowWhy] = useState(true);
  // Brief highlight pulse on mount to draw attention to the confidence ring
  const [highlight, setHighlight] = useState(false);
  React.useEffect(() => {
    if (hasReasoning) {
      const timer = setTimeout(() => setHighlight(true), 300);
      return () => clearTimeout(timer);
    }
  }, [hasReasoning]);

  if (!outfit) return null;

  const items = outfit.items || [];
  const total = items.reduce((s, i) => s + (i.price || 0), 0) || 0;

  // Determine overall confidence from reasoning breakdown or scores
  const breakdown = reasoning?.confidenceBreakdown || [];
  const overallScore = breakdown.length > 0
    ? Math.round(breakdown.reduce((s, d) => s + d.score, 0) / breakdown.length)
    : (scores?.overall ?? 75);

  const confidenceLevel = overallScore >= 80 ? 'high' : overallScore >= 60 ? 'medium' : 'low';
  const confidenceLabel = overallScore >= 80 ? 'High Confidence' : overallScore >= 60 ? 'Moderate Confidence' : 'Low Confidence';

  return (
    <div className="outfit-card">
      {/* ── CONFIDENCE METER — Visual ring at top ── */}
      <div className={`outfit-confidence-meter ${confidenceLevel}${highlight ? ' highlight' : ''}`}>
        <svg className="outfit-confidence-ring" viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke={overallScore >= 80 ? 'var(--up)' : overallScore >= 60 ? 'var(--accent2)' : 'var(--down)'}
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 16}`}
            strokeDashoffset={`${2 * Math.PI * 16 * (1 - overallScore / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
            fill="var(--text)" fontSize="10" fontWeight="700">
            {overallScore}
          </text>
        </svg>
        <div className="outfit-confidence-info">
          <span className="outfit-confidence-label">{confidenceLabel}</span>
          <span className="outfit-confidence-sub">
            {hasReasoning
              ? `${breakdown.length} dimensions scored`
              : 'Overall score'}
          </span>
        </div>
      </div>

      {/* ── CARD HEADER ── */}
      <div className="outfit-card-header">
        <div className="outfit-card-header-top">
          <span className="ai-label">✦ AI Styled</span>
          {outfit.styleCategory && (
            <span className="outfit-category-badge">{outfit.styleCategory}</span>
          )}
        </div>
        <h4>{outfit.name || 'Complete Outfit'}</h4>
        <p>{outfit.why || 'Curated for your occasion'}</p>
      </div>

      {/* ── REASONING: WHY THIS WAS CHOSEN ── */}
      {reasoning?.chosenFor && (
        <div className="outfit-reasoning-banner">
          <span className="outfit-reasoning-banner-icon">🎯</span>
          <div className="outfit-reasoning-banner-text">
            <strong>Why this was chosen</strong>
            <p>{reasoning.chosenFor}</p>
          </div>
        </div>
      )}

      {/* ── REASONING: WHAT PROBLEM IT SOLVES ── */}
      {reasoning?.solves && (
        <div className="outfit-reasoning-banner outfit-reasoning-solves">
          <span className="outfit-reasoning-banner-icon">✅</span>
          <div className="outfit-reasoning-banner-text">
            <strong>What this solves</strong>
            <p>{reasoning.solves}</p>
          </div>
        </div>
      )}

      {/* ── PRODUCT ITEMS ── */}
      <ProductRecommendations items={items} />

      {/* ── CONFIDENCE BREAKDOWN — expanded by default ── */}
      {hasReasoning && (
        <div className="outfit-why-section">
          <button
            className={`outfit-why-toggle${showWhy ? ' active' : ''}`}
            onClick={() => setShowWhy(!showWhy)}
          >
            <span>🧠 FashionGPT's Reasoning</span>
            <span className="outfit-why-arrow">{showWhy ? '▲' : '▼'}</span>
          </button>

          {showWhy && (
            <div className="outfit-why-breakdown">
              {breakdown.map((d, i) => (
                <div key={i} className="outfit-confidence-row">
                  <div className="outfit-confidence-row-header">
                    <span className="outfit-confidence-row-icon">{d.icon || '📊'}</span>
                    <span className="outfit-confidence-row-label">{d.dimension}</span>
                    <span className={`outfit-confidence-row-score ${d.score >= 80 ? 'high' : d.score >= 60 ? 'mid' : 'low'}`}>
                      {d.score}
                    </span>
                  </div>
                  <div className="outfit-confidence-row-bar">
                    <div
                      className="outfit-confidence-row-fill"
                      style={{
                        width: `${d.score}%`,
                        background: d.score >= 80 ? 'var(--up)' : d.score >= 60 ? 'var(--accent2)' : 'var(--down)',
                      }}
                    />
                  </div>
                  {d.reason && (
                    <p className="outfit-confidence-row-reason">{d.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REJECTED ALTERNATIVES — What FashionGPT considered and dismissed ── */}
      {reasoning?.rejectedAlternatives?.length > 0 && showWhy && (
        <div className="outfit-rejected-section">
          <div className="outfit-rejected-header">
            <span className="outfit-rejected-icon">✕</span>
            <span className="outfit-rejected-title">Alternatives Considered & Rejected</span>
          </div>
          {reasoning.rejectedAlternatives.map((alt, i) => (
            <div key={i} className="outfit-rejected-item">
              <div className="outfit-rejected-option">
                <span className="outfit-rejected-option-label">Option {i + 1}:</span>
                <span className="outfit-rejected-option-name">{alt.option}</span>
              </div>
              <p className="outfit-rejected-reason">{alt.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LEGACY SCORES (fallback when no reasoning data) ── */}
      {!hasReasoning && (
        <>
          <div className="outfit-why-section">
            <button
              className={`outfit-why-toggle${showWhy ? ' active' : ''}`}
              onClick={() => setShowWhy(!showWhy)}
            >
              <span>🧠 FashionGPT's Reasoning</span>
              <span className="outfit-why-arrow">{showWhy ? '▲' : '▼'}</span>
            </button>

            {showWhy && (() => {
              const s = scores || outfit.scores || {};
              const defs = [
                { key: 'occasionFit', label: 'Occasion Fit', value: s.occasionFit ?? s.occasion_fit ?? 75, icon: '📋' },
                { key: 'colorHarmony', label: 'Color Harmony', value: s.colorHarmony ?? s.color_harmony ?? 70, icon: '🎨' },
                { key: 'styleCoherence', label: 'Style Coherence', value: s.styleCoherence ?? s.style_coherence ?? 75, icon: '✨' },
                { key: 'trendAlignment', label: 'Trend Alignment', value: s.trendAlignment ?? s.trend_alignment ?? 70, icon: '📈' },
                { key: 'weatherFit', label: 'Weather Fit', value: s.weatherFit ?? s.weather_fit ?? 75, icon: '🌤️' },
              ];
              return (
                <div className="outfit-why-breakdown">
                  {defs.map(def => {
                    const status = def.value >= 70 ? 'pass' : def.value >= 40 ? 'neutral' : 'fail';
                    return (
                      <div key={def.key} className={`outfit-why-row ${status}`}>
                        <span className="outfit-why-icon">{def.icon}</span>
                        <span className="outfit-why-label">{def.label}</span>
                        <div className="outfit-why-bar-track">
                          <div className="outfit-why-bar-fill" style={{
                            width: `${def.value}%`,
                            background: status === 'pass' ? 'var(--up)' : status === 'neutral' ? 'var(--accent2)' : 'var(--down)',
                          }} />
                        </div>
                        <span className="outfit-why-score">{def.value}</span>
                        <span className="outfit-why-check">
                          {status === 'pass' ? '✓' : status === 'neutral' ? '○' : '⚠'}
                        </span>
                      </div>
                    );
                  })}
                  {outfit.whyDetailed && (
                    <div className="outfit-why-note">
                      <span className="outfit-why-note-icon">💡</span>
                      <span className="outfit-why-note-text">{outfit.whyDetailed}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Legacy scores row */}
          {(scores || outfit.scores) && (
            <div className="outfit-scores">
              {['occasionFit', 'colorHarmony', 'styleCoherence'].slice(0, 3).map(key => {
                const val = (scores || outfit.scores)[key] ?? 75;
                return (
                  <div className="score-pill" key={key}>
                    <div className="score-val" style={{
                      color: val >= 70 ? 'var(--up)' : val >= 40 ? 'var(--accent2)' : 'var(--down)',
                    }}>{val}</div>
                    <div className="score-lbl">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── TOTAL ── */}
      <div className="outfit-total">
        <span>Total look</span>
        <strong>€{total.toFixed(2)}</strong>
      </div>

      {/* ── ACTIONS ── */}
      {showActions && (
        <div className="outfit-actions">
          <div className="outfit-actions-left">
            {onSave && (
              <button
                className={`outfit-action-btn save${isSaved ? ' saved' : ''}`}
                onClick={onSave}
                title={isSaved ? 'Saved' : 'Save this look'}
              >
                {isSaved ? '❤️' : '🤍'}
              </button>
            )}
            {onRate !== undefined && (
              <div className="outfit-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`rating-star${(rating || 0) >= star ? ' active' : ''}`}
                    onClick={() => onRate(star)}
                  >★</button>
                ))}
              </div>
            )}
            {onRemove && (
              <button className="outfit-action-btn remove" onClick={onRemove} title="Remove">🗑️</button>
            )}
          </div>
          <div className="outfit-actions-right">
            {onRegenerate && (
              <button className="outfit-action-btn regenerate" onClick={onRegenerate} title="Regenerate this look">
                🔄 Regenerate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Emotional Feedback */}
      {onFeedback && <FeedbackBar outfit={outfit} onFeedback={onFeedback} compact />}
    </div>
  );
}

export default React.memo(OutfitCard);
