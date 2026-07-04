import React from 'react';

/**
 * CriticScore — visual breakdown of an outfit's scores with reasoning.
 * @param {{
 *   critique: {
 *     scores: { occasionFit?: number, budgetCompliance?: number, styleCoherence?: number, colorHarmony?: number, trendAlignment?: number, overall?: number },
 *     suggestions?: string[],
 *     issues?: string[],
 *     verdict?: string,
 *   },
 *   styleScore?: number,
 *   weatherContext?: { temperature?: number, description?: string, recommendation?: string } | null,
 *   compact?: boolean,
 * }} props
 */
function CriticScore({ critique, styleScore, weatherContext, compact }) {
  if (!critique) return null;

  const scoreDefs = [
    { key: 'overall', label: 'Overall', value: critique.scores?.overall ?? 0, color: 'var(--accent)' },
    { key: 'occasionFit', label: 'Occasion Fit', value: critique.scores?.occasionFit ?? 0, color: '#7EC8A0' },
    { key: 'colorHarmony', label: 'Color Harmony', value: critique.scores?.colorHarmony ?? 0, color: '#B8A070' },
    { key: 'styleCoherence', label: 'Style Coherence', value: critique.scores?.styleCoherence ?? 0, color: '#8AB4F8' },
    { key: 'trendAlignment', label: 'Trend Alignment', value: critique.scores?.trendAlignment ?? 0, color: '#D4A0D4' },
    { key: 'budgetCompliance', label: 'Budget Fit', value: critique.scores?.budgetCompliance ?? 0, color: '#F4A7A3' },
  ];

  if (compact) {
    // Compact view: just overall + top 3 scores in a row
    const top = scoreDefs.slice(0, 4);
    return (
      <div className="critic-compact">
        {top.map(s => (
          <div className="critic-pill" key={s.key}>
            <div className="critic-pill-val" style={{ color: s.color }}>{s.value}</div>
            <div className="critic-pill-lbl">{s.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="critic-breakdown">
      {/* Main verdict */}
      {critique.verdict && (
        <div className="critic-verdict">
          <span className={`critic-badge ${critique.scores?.overall >= 70 ? 'approved' : 'needs-work'}`}>
            {critique.scores?.overall >= 70 ? '✓ Approved' : '○ Refinements Suggested'}
          </span>
          <span className="critic-verdict-text">{critique.verdict}</span>
        </div>
      )}

      {/* Weather context */}
      {weatherContext && (
        <div className="critic-weather">
          <span className="critic-weather-icon">
            {weatherContext.temperature > 25 ? '☀️' : weatherContext.temperature > 15 ? '⛅' : '🌧️'}
          </span>
          <span className="critic-weather-text">
            {weatherContext.temperature}°C — {weatherContext.recommendation}
          </span>
        </div>
      )}

      {/* Score breakdown */}
      <div className="critic-scores">
        {scoreDefs.map(s => (
          <div className="critic-score-row" key={s.key}>
            <div className="critic-score-label">{s.label}</div>
            <div className="critic-score-bar-track">
              <div
                className="critic-score-bar-fill"
                style={{
                  width: `${s.value}%`,
                  background: s.value >= 70 ? s.color : s.value >= 40 ? 'var(--accent2)' : '#E07070',
                }}
              />
            </div>
            <div className="critic-score-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {critique.suggestions && critique.suggestions.length > 0 && (
        <div className="critic-suggestions">
          <div className="critic-section-label">💡 Suggestions</div>
          <ul className="critic-suggestion-list">
            {critique.suggestions.map((s, i) => (
              <li key={i} className="critic-suggestion-item">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {critique.issues && critique.issues.length > 0 && (
        <div className="critic-issues">
          <div className="critic-section-label">⚠️ Issues</div>
          <ul className="critic-issue-list">
            {critique.issues.map((s, i) => (
              <li key={i} className="critic-issue-item">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default React.memo(CriticScore);
