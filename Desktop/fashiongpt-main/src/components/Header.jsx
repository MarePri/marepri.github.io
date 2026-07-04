import React from 'react';
import { isOfflineMode } from '../services/config.js';

/**
 * App header with logo, branding, and a live AI status indicator.
 * Honest about whether real Claude API calls are configured vs. the
 * offline rule-based fallback — useful for reviewers checking the
 * AI integration actually works.
 */
export default function Header() {
  const offline = isOfflineMode();
  return (
    <div className="nav-header-row">
      <div className="nav-logo">Fashion<span>GPT</span></div>
      <span
        className={offline ? 'ai-status-badge ai-status-offline' : 'ai-status-badge ai-status-live'}
        title={offline ? 'No API proxy/key configured — using offline rule-based engine' : 'Connected to live Claude API'}
      >
        {offline ? '○ Offline mode' : '● Live AI'}
      </span>
    </div>
  );
}
