import React, { useState, useMemo } from 'react';
import { ARCHETYPE_PROFILES } from '../rules/styleRules';
import { OCCASION_RULES } from '../rules/occasionRules';

/**
 * StyleCoachInsight — Visual insight cards.
 *
 * NO text walls. Each card is a visual snapshot:
 * - Score ring (progress arc)
 * - One-line verdict
 * - One actionable tip
 * - Expandable detail bullets (compact)
 */
const StyleCoachInsight = React.memo(function StyleCoachInsight({ critique, styleScore, weatherContext, occasion, archetypeId }) {
  const [expanded, setExpanded] = useState(null);
  const scores = critique?.scores || {};
  const insights = useMemo(() => generateInsights(scores, styleScore, weatherContext, occasion, archetypeId), [scores, styleScore, weatherContext, occasion, archetypeId]);

  return (
    <div className="style-coach">
      <div className="style-coach-header">
        <span className="style-coach-icon">🧠</span>
        <span className="style-coach-title">Style Coach — Why This Works</span>
      </div>

      <div className="style-coach-grid">
        {insights.map((card, i) => {
          const isExpanded = expanded === i;
          const ringDash = 2 * Math.PI * 14;

          return (
            <div
              key={i}
              className={`style-coach-card ${card.tone}${isExpanded ? ' expanded' : ''}`}
              onClick={() => setExpanded(isExpanded ? null : i)}
            >
              <div className="style-coach-card-header">
                {/* Score ring */}
                {card.score != null && (
                  <div className="sc-score-ring-wrap">
                    <svg className="sc-score-ring" viewBox="0 0 34 34" width="34" height="34">
                      <circle cx="17" cy="17" r="14" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                      <circle
                        cx="17" cy="17" r="14"
                        fill="none"
                        stroke={card.score >= 80 ? 'var(--up)' : card.score >= 60 ? 'var(--accent2)' : 'var(--down)'}
                        strokeWidth="2.5"
                        strokeDasharray={ringDash}
                        strokeDashoffset={ringDash * (1 - (card.score || 50) / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 17 17)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                      <text x="17" y="17" textAnchor="middle" dominantBaseline="central"
                        fill="var(--text)" fontSize="9" fontWeight="700">{card.score}</text>
                    </svg>
                  </div>
                )}
                <div className="sc-card-meta">
                  <span className="sc-card-icon">{card.icon}</span>
                  <div>
                    <span className="sc-card-title">{card.title}</span>
                    <span className="sc-card-subtitle">{card.subtitle}</span>
                  </div>
                </div>
              </div>

              {/* One-line actionable tip — not a paragraph */}
              <div className="sc-card-tip">
                <span className="sc-tip-bulb">💡</span>
                <span className="sc-tip-text">{card.tip}</span>
              </div>

              {/* Expandable detail bullets */}
              {isExpanded && card.details && (
                <div className="sc-card-details">
                  {card.details.map((d, j) => (
                    <div key={j} className="sc-detail-row">
                      <span className="sc-detail-bullet">•</span>
                      <span className="sc-detail-text">{d}</span>
                    </div>
                  ))}
                </div>
              )}

              <button className="style-coach-toggle">
                {isExpanded ? '▲ Less' : '▼ More'}
              </button>
            </div>
          );
        })}
      </div>

      {archetypeId && ARCHETYPE_PROFILES[archetypeId] && (
        <div className="style-coach-footer">
          <span className="sc-footer-avatar">👤</span>
          <span className="sc-footer-text">
            Your <strong>{ARCHETYPE_PROFILES[archetypeId].description}</strong> style profile.
          </span>
        </div>
      )}
    </div>
  );
});

export default StyleCoachInsight;

// ─── Insight Generation — visual-first, minimal text ────────────────────────

function generateInsights(scores, styleScore, weatherContext, occasion, archetypeId) {
  const cards = [];
  const overall = scores.overall || 75;
  const verdictTone = overall >= 80 ? 'excellent' : overall >= 65 ? 'good' : overall >= 50 ? 'fair' : 'needs-work';

  // 1. Overall Verdict
  cards.push({
    icon: '🏆',
    title: 'Overall',
    subtitle: overall >= 80 ? 'Excellent' : overall >= 65 ? 'Solid' : overall >= 50 ? 'Fair' : 'Needs Work',
    score: overall,
    tone: verdictTone,
    tip: overall >= 80 ? 'Save this look — it\'s a winner.'
      : overall >= 65 ? 'A few tweaks could push this higher.'
      : overall >= 50 ? 'Try adjusting formality or swapping a piece.'
      : 'Consider regenerating with different choices.',
    details: [
      `Occasion Fit: ${scores.occasionFit || 70}`,
      `Color Harmony: ${scores.colorHarmony || 70}`,
      `Style Coherence: ${scores.styleCoherence || 70}`,
      `Trend Alignment: ${scores.trendAlignment || 70}`,
    ],
  });

  // 2. Occasion Fit
  const occScore = scores.occasionFit || 70;
  cards.push({
    icon: '📋',
    title: 'Occasion',
    subtitle: occScore >= 80 ? 'Perfect match' : occScore >= 65 ? 'Good fit' : 'Off brief',
    score: occScore,
    tone: occScore >= 70 ? 'good' : 'needs-work',
    tip: occScore >= 70 ? 'Formality and vibe align with the event.'
      : 'The formality level could better match the occasion.',
    details: [
      `Formality: ${occScore >= 80 ? 'On point' : occScore >= 65 ? 'Close' : 'Off'} for "${occasion || 'selected'}".`,
      occScore < 70 ? 'Tip: Swap casual pieces for smarter alternatives.' : 'Great occasion matching!',
    ],
  });

  // 3. Color Harmony
  const colorScore = scores.colorHarmony || 70;
  const colorTone = colorScore >= 80 ? 'excellent' : colorScore >= 65 ? 'good' : 'fair';
  cards.push({
    icon: '🎨',
    title: 'Color',
    subtitle: colorScore >= 80 ? 'Balanced palette' : colorScore >= 65 ? 'Good flow' : 'Needs balance',
    score: colorScore,
    tone: colorTone,
    tip: colorScore >= 70 ? 'Colors work well together.'
      : 'A neutral anchor piece would unify the palette.',
    details: [
      colorScore >= 70 ? 'The palette is visually balanced.' : 'Some colors compete for attention.',
      'Tip: Monochromatic schemes score highest for harmony.',
    ],
  });

  // 4. Style Coherence
  const styleScoreVal = scores.styleCoherence || styleScore || 70;
  cards.push({
    icon: '✨',
    title: 'Style',
    subtitle: styleScoreVal >= 70 ? 'Coherent' : styleScoreVal >= 50 ? 'Mixed' : 'Inconsistent',
    score: styleScoreVal,
    tone: styleScoreVal >= 70 ? 'good' : 'fair',
    tip: styleScoreVal >= 70 ? 'All pieces share a consistent style direction.'
      : 'Pieces pull in different style directions.',
    details: [
      `${styleScoreVal >= 70 ? '✓' : '○'} Aesthetic consistency: ${styleScoreVal >= 70 ? 'Strong' : 'Needs focus'}.`,
      archetypeId ? `Your ${archetypeId} profile prefers specific style tags.` : 'Select an archetype for more coherent results.',
    ],
  });

  // 5. Trend Alignment
  const trendScore = scores.trendAlignment || 70;
  cards.push({
    icon: '📈',
    title: 'Trend',
    subtitle: trendScore >= 80 ? 'Current' : trendScore >= 65 ? 'Seasonal' : 'Classic',
    score: trendScore,
    tone: trendScore >= 70 ? 'good' : 'fair',
    tip: trendScore >= 70 ? 'You\'re on trend.'
      : 'A statement piece would modernize this look.',
    details: [
      trendScore >= 70 ? 'Incorporate seasonal trends.' : 'Treads classic — timeless but not trend-forward.',
      'Mix 80% classic + 20% trendy for balance.',
    ],
  });

  // 6. Weather (if available)
  if (weatherContext) {
    cards.push({
      icon: '🌤️',
      title: 'Weather',
      subtitle: `${weatherContext.temperature}°C`,
      score: null,
      tone: 'info',
      tip: weatherContext.recommendation || 'Check the forecast.',
      details: [
        `${weatherContext.temperature}°C · ${weatherContext.condition || 'Clear'}`,
        weatherContext.recommendation || '',
      ].filter(Boolean),
    });
  }

  return cards;
}

export { generateInsights };
