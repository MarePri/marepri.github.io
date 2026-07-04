import React, { useState, useCallback, useRef } from 'react';

/**
 * FeedbackBar — Visual emotional feedback.
 * No text notifications. No "FashionGPT Learned" messages.
 * Just animated buttons that show delight through motion.
 *
 * Each reaction animates the button and briefly shows a score increment
 * to signal "this was recorded" without a single word of feedback text.
 */
export default function FeedbackBar({ outfit, onFeedback, compact }) {
  const [selected, setSelected] = useState(null);
  const [pulseId, setPulseId] = useState(0);
  const timerRef = useRef(null);

  const handleFeedback = useCallback((type) => {
    // Clear any pending timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setSelected(type);
    setPulseId(prev => prev + 1);
    onFeedback?.(type);

    // Reset after animation completes
    timerRef.current = setTimeout(() => {
      setSelected(null);
    }, 1800);
  }, [onFeedback]);

  const buttons = [
    { type: 'love', icon: '😍', label: 'Love It', color: 'var(--up)' },
    { type: 'like', icon: '🙂', label: 'Like It', color: 'var(--accent2)' },
    { type: 'dislike', icon: '👎', label: 'Not For Me', color: 'var(--down)' },
  ];

  return (
    <div className={`fb-bar${compact ? ' fb-bar-compact' : ''}`}>
      {!compact && <div className="fb-label">How does this look feel?</div>}
      <div className="fb-buttons">
        {buttons.map(btn => {
          const isSelected = selected === btn.type;
          return (
            <button
              key={btn.type}
              className={`fb-btn${isSelected ? ' selected' : ''}${compact ? ' fb-btn-compact' : ''}`}
              onClick={() => handleFeedback(btn.type)}
              style={isSelected ? { '--fb-color': btn.color } : {}}
              title={btn.label}
            >
              <span className={`fb-btn-icon${isSelected ? ' fb-btn-icon-pulse' : ''}`}>
                {btn.icon}
              </span>
              {!compact && <span className="fb-btn-label">{btn.label}</span>}
              {/* Visual pulse ring — animates on selection */}
              {isSelected && <span className="fb-pulse-ring" />}
            </button>
          );
        })}
      </div>

      {/* Score increment indicator — visual-only, no text */}
      {selected && (
        <div className="fb-score-flash" key={pulseId}>
          <div className={`fb-score-dot ${selected}`} />
        </div>
      )}
    </div>
  );
}
