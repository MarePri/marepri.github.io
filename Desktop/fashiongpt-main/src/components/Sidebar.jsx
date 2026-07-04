import React from 'react';

/**
 * Sidebar tab navigation.
 * @param {{
 *   tabs: Array<{id: string, icon: string, label: string}>,
 *   activeTab: string,
 *   onTabChange: (id: string) => void
 * }} props
 */
export default function Sidebar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="nav-tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`nav-tab${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          <span className="icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
