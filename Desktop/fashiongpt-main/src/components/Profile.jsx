import React, { useState } from 'react';
import FashionDNA from './FashionDNA.jsx';
import StyleEvolution from './StyleEvolution.jsx';

/**
 * Profile — Your style identity.
 * Merges Fashion DNA + Style Evolution into one tab.
 * Sub-navigation: DNA (default) | Evolution
 */
export default function Profile({
  archetypes,
  selectedArchetype,
  dnaResult,
  dnaLoading,
  buildFashionDNA,
  onResetDNA,
}) {
  const [section, setSection] = useState('dna');

  return (
    <div className="section-pad profile">
      <div className="section-title">Your Style</div>
      <p className="section-sub">Your DNA, your evolution — your complete style identity.</p>

      <div className="profile-subnav">
        <button
          className={`profile-subnav-btn${section === 'dna' ? ' active' : ''}`}
          onClick={() => setSection('dna')}
        >
          <span className="profile-subnav-icon">🧬</span>
          <span>Style DNA</span>
        </button>
        <button
          className={`profile-subnav-btn${section === 'evolution' ? ' active' : ''}`}
          onClick={() => setSection('evolution')}
        >
          <span className="profile-subnav-icon">📊</span>
          <span>Evolution</span>
        </button>
      </div>

      {section === 'dna' && (
        <FashionDNA
          archetypes={archetypes}
          selectedArchetype={selectedArchetype}
          dnaResult={dnaResult}
          dnaLoading={dnaLoading}
          buildFashionDNA={buildFashionDNA}
          onReset={onResetDNA}
        />
      )}

      {section === 'evolution' && (
        <StyleEvolution />
      )}
    </div>
  );
}
