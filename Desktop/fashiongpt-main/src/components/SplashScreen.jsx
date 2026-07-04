import React, { useEffect, useState } from 'react';

/**
 * SplashScreen — brief animated intro that appears on first-ever visit.
 * Shows "Your AI Stylist — no chatbot, just style." then auto-dismisses.
 * Stored in localStorage so it only shows once.
 */
const SPLASH_KEY = 'fashiongpt_splash_seen';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter → visible → exit
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if already seen
    const seen = localStorage.getItem(SPLASH_KEY);
    if (seen) {
      setVisible(false);
      onComplete?.();
      return;
    }

    // Phase sequence: enter (0ms) → visible (300ms) → exit (2200ms) → done (2800ms)
    const t1 = setTimeout(() => setPhase('visible'), 50);
    const t2 = setTimeout(() => setPhase('exit'), 2000);
    const t3 = setTimeout(() => {
      setVisible(false);
      localStorage.setItem(SPLASH_KEY, '1');
      onComplete?.();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={`splash-screen splash-${phase}`}>
      <div className="splash-content">
        <div className="splash-icon">✦</div>
        <h1 className="splash-title">Your <em>AI Stylist</em></h1>
        <p className="splash-subtitle">No chatbot. Just style.</p>
        <div className="splash-loader">
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>
    </div>
  );
}
