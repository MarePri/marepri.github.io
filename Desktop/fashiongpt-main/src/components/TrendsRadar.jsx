import React from 'react';

/**
 * TrendsRadar — interactive current fashion trend display.
 * Click any trend card to generate an outfit inspired by that trend.
 * @param {{ trends: import('../types/index.js').Trend[], onTryTrend?: (trendName: string) => void }} props
 */
function TrendsRadar({ trends, onTryTrend }) {
  return (
    <div className="section-pad" style={{ paddingBottom: 40 }}>
      <div className="section-title">Trend Radar</div>
      <div className="section-sub">Tap any trend to get an AI-styled look inspired by it.</div>
      <div className="trend-list">
        {trends.map((t, i) => (
          <div
            className={`trend-item${t.dir === 'up' ? ' trend-interactive' : ''}`}
            key={i}
            onClick={() => t.dir === 'up' && onTryTrend?.(t.name)}
            role={t.dir === 'up' ? 'button' : undefined}
            tabIndex={t.dir === 'up' ? 0 : undefined}
            onKeyDown={t.dir === 'up' ? (e) => { if (e.key === 'Enter' || e.key === ' ') onTryTrend?.(t.name); } : undefined}
          >
            <div className="trend-item-header">
              <span className="trend-name">
                {t.name}
                {t.dir === 'up' && <span className="trend-try-badge">Try It →</span>}
              </span>
              <span className={`trend-dir ${t.dir}`}>{t.dir === 'up' ? '↑ Rising' : '↓ Fading'}</span>
            </div>
            <div className="trend-bar-wrap">
              <div
                className="trend-bar"
                style={{
                  width: `${t.pct}%`,
                  background: t.dir === 'up'
                    ? 'linear-gradient(90deg, var(--accent), var(--accent2))'
                    : 'linear-gradient(90deg, #555, #444)',
                }}
              />
            </div>
            <div className="trend-desc">{t.desc}</div>
            {t.brands.length > 0 && (
              <div className="trend-brands">
                {t.brands.map(b => <span className="trend-brand-tag" key={b}>{b}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(TrendsRadar);
