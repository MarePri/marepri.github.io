import React from 'react';

/**
 * ShortcutsHelp — overlay showing all available keyboard shortcuts.
 * Triggered by pressing ? anywhere in the app.
 */
const SHORTCUTS = [
  { key: 'G', label: 'Go to Outfit Generator' },
  { key: 'H', label: 'Go to Home' },
  { key: 'L', label: 'Go to Saved Looks' },
  { key: 'D', label: 'Go to Discover' },
  { key: 'S', label: 'Save current look' },
  { key: '1-3', label: 'Select look 1 / 2 / 3' },
  { key: '?', label: 'Toggle this shortcut help' },
  { key: 'Esc', label: 'Close overlay' },
];

export default function ShortcutsHelp({ onClose }) {
  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <span className="shortcuts-title">⌨ Keyboard Shortcuts</span>
          <button className="shortcuts-close" onClick={onClose}>✕</button>
        </div>
        <div className="shortcuts-list">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="shortcuts-row">
              <kbd className="shortcuts-key">{s.key}</kbd>
              <span className="shortcuts-desc">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="shortcuts-footer">Press <kbd>?</kbd> anytime to toggle this overlay</p>
      </div>
    </div>
  );
}
