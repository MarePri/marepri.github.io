import React, { useState } from 'react';
import ColorDot from './ColorDot.jsx';
import { useStyleMemoryContext } from '../hooks/StyleMemoryContext.jsx';

/**
 * FashionDNA — full personality system.
 * 
 * Shows:
 * - Primary Style Archetype (selected by user or learned from memory)
 * - Secondary Style Archetype (complementary style)
 * - Style Strengths (what they excel at)
 * - Style Blind Spots (areas to explore)
 * - Recommended Brands and Outfit Formulas
 * - Color Analysis
 * - Style Score progress
 * 
 * Feels like a personality test users want to share.
 */
function FashionDNA({ archetypes, selectedArchetype, dnaResult, dnaLoading, buildFashionDNA, onReset }) {
  const styleMem = useStyleMemoryContext();
  const [showShareToast, setShowShareToast] = useState(false);

  // Determine secondary archetype (complementary to primary)
  const getSecondaryArchetype = (primaryId) => {
    const complementary = {
      minimalist: 'professional',
      streetwear: 'romantic',
      romantic: 'streetwear',
      professional: 'minimalist',
    };
    const secId = complementary[primaryId] || archetypes.find(a => a.id !== primaryId)?.id;
    return archetypes.find(a => a.id === secId) || null;
  };

  // Style strengths by archetype
  const getStrengths = (archId) => {
    const map = {
      minimalist: ['Color curation', 'Quality over quantity', 'Timeless silhouettes', 'Effortless elegance'],
      streetwear: ['Trend awareness', 'Bold expression', 'Cultural fluency', 'Comfort innovation'],
      romantic: ['Texture mixing', 'Occasion dressing', 'Detail appreciation', 'Soft power dressing'],
      professional: ['Investment strategy', 'Fit mastery', 'Power dressing', 'Versatile basics'],
    };
    return map[archId] || ['Adaptability', 'Openness to style', 'Curiosity', 'Confidence'];
  };

  // Style blind spots by archetype
  const getBlindSpots = (archId) => {
    const map = {
      minimalist: ['Risk-taking', 'Pattern mixing', 'Statement pieces', 'Color exploration'],
      streetwear: ['Formal mastery', 'Investment pieces', 'Timeless staples', 'Textured formality'],
      romantic: ['Minimal restraint', 'Practical footwear', 'Day-to-night editing', 'Athleisure blending'],
      professional: ['Casual ease', 'Trend experimentation', 'Playful expression', 'Weekend dressing'],
    };
    return map[archId] || ['Brand awareness', 'Trend timing', 'Occasion adaptability'];
  };

  // Outfit formulas
  const getFormulas = (archId) => {
    const map = {
      minimalist: ['Neutral base + one texture piece', 'Monochromatic with tonal variation', 'Relaxed suit + statement shoe'],
      streetwear: ['Oversized top + fitted bottom + chunky shoe', 'Layering: tee + overshirt + jacket', 'Statement piece + all-neutral base'],
      romantic: ['Soft top + structured bottom + gold accent', 'Floral dress + denim jacket + sandal', 'Lace detail + tailored piece'],
      professional: ['Blazer + silk top + tailored trouser + loafer', 'Sweater + midi skirt + boot + structured bag', 'Power suit + relaxed shoe'],
    };
    return map[archId] || ['Base + layer + accent', 'Statement + neutral support', 'Structured + relaxed balance'];
  };

  // Calculate style score from memory
  const styleScore = styleMem?.memory
    ? Math.min(100, Math.round(
      (styleMem.memory.totalSaves * 5) +
      (Object.keys(styleMem.memory.brandSignals).length * 3) +
      (Object.keys(styleMem.memory.colorSignals).length * 2) +
      (styleMem.memory.totalGenerations * 1)
    ))
    : 0;

  const scoreLevel = styleScore >= 60 ? 'Expert' : styleScore >= 30 ? 'Developing' : 'Emerging';

  const handleShare = () => {
    const arch = dnaResult?.archetype;
    if (!arch) return;
    const text = `My FashionGPT Style DNA: ${arch.name} ${arch.icon}\n"${arch.desc}"\nDiscover your style at FashionGPT ✨`;
    navigator.clipboard?.writeText(text).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }).catch(() => {});
  };

  return (
    <div className="section-pad" style={{ paddingBottom: 40 }}>
      <div className="section-title">Style DNA</div>
      <div className="section-sub">Your complete style personality profile.</div>

      {!dnaResult ? (
        <>
          <div className="empty-state-personality" style={{ padding: '20px 0' }}>
            <span className="empty-state-icon">🧬</span>
            <h3>Discover Your Style DNA</h3>
            <p>FashionGPT builds a complete style personality profile — your archetype, strengths, blind spots, color palette, and personalized outfit formulas. Pick an archetype to begin.</p>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Pick your style archetype:</div>
          <div className="dna-archetype-grid">
            {archetypes.map(a => (
              <div
                key={a.id}
                className={`archetype-card${selectedArchetype === a.id ? ' selected' : ''}`}
                onClick={() => buildFashionDNA(a)}
              >
                <div className="archetype-icon">{a.icon}</div>
                <div className="archetype-name">{a.name}</div>
                <div className="archetype-desc-short">{a.desc.slice(0, 40)}…</div>
                <div className="archetype-colors">
                  {a.colors.slice(0, 3).map(c => (
                    <span key={c} className="archetype-swatch" style={{ background: colorToHex(c) }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {dnaLoading && (
            <div className="dna-loading">
              <div className="dna-loading-spinner" />
              <div className="dna-loading-text">Building your style personality…</div>
              <div className="dna-loading-stages">
                <span className="dna-loading-stage active">Analyzing preferences</span>
                <span className="dna-loading-stage">Finding your archetype</span>
                <span className="dna-loading-stage">Mapping your strengths</span>
              </div>
            </div>
          )}

          {/* Show existing style score even before DNA test */}
          {styleScore > 0 && !dnaLoading && (
            <div className="dna-preview-score">
              <div className="dna-preview-score-label">Your current style score</div>
              <div className="dna-preview-score-val">{styleScore}</div>
              <div className="dna-preview-score-level">{scoreLevel}</div>
            </div>
          )}
        </>
      ) : (
        <div className="dna-result-full">
          {/* Primary Archetype */}
          <div className="dna-primary-card">
            <div className="dna-primary-header">
              <div className="dna-primary-icon-wrap">
                <span className="dna-primary-icon">{dnaResult.archetype.icon}</span>
              </div>
              <div className="dna-primary-info">
                <span className="dna-primary-label">PRIMARY STYLE</span>
                <h2 className="dna-primary-name">{dnaResult.archetype.name}</h2>
                <p className="dna-primary-desc">{dnaResult.meta?.headline || dnaResult.archetype.desc}</p>
                <div className="dna-primary-tags">
                  {dnaResult.archetype.colors.map(c => (
                    <span key={c} className="dna-primary-tag" style={{ background: colorToHex(c), color: isLight(c) ? '#1a1a1a' : '#f5f5f5' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Archetype */}
          {(() => {
            const secondary = getSecondaryArchetype(dnaResult.archetype.id);
            if (!secondary) return null;
            return (
              <div className="dna-secondary-card">
                <div className="dna-secondary-header">
                  <span className="dna-secondary-icon">{secondary.icon}</span>
                  <div className="dna-secondary-info">
                    <span className="dna-secondary-label">COMPLEMENTARY STYLE</span>
                    <span className="dna-secondary-name">{secondary.name}</span>
                    <span className="dna-secondary-desc">{secondary.desc}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Style Score */}
          <div className="dna-score-card">
            <div className="dna-score-header">
              <span className="dna-score-icon">🏆</span>
              <div>
                <span className="dna-score-label">Style Score</span>
                <span className="dna-score-level">{scoreLevel}</span>
              </div>
              <span className="dna-score-val">{Math.min(100, styleScore || 75)}</span>
            </div>
            <div className="dna-score-bar">
              <div className="dna-score-fill" style={{ width: `${Math.min(100, styleScore || 75)}%` }} />
            </div>
            <p className="dna-score-text">
              {styleScore >= 60
                ? 'You have a well-developed style identity. Keep exploring to refine your edge.'
                : styleScore >= 30
                ? 'Your style is evolving. Every saved look strengthens your profile.'
                : 'Start saving outfits to build your style profile.'}
            </p>
          </div>

          {/* Strengths */}
          <div className="dna-section dna-strengths">
            <span className="dna-section-title">✓ Style Strengths</span>
            <div className="dna-strength-grid">
              {getStrengths(dnaResult.archetype.id).map((s, i) => (
                <div key={i} className="dna-strength-item">
                  <span className="dna-strength-icon">✓</span>
                  <span className="dna-strength-text">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blind Spots */}
          <div className="dna-section dna-blindspots">
            <span className="dna-section-title">○ Areas to Explore</span>
            <div className="dna-blindspot-grid">
              {getBlindSpots(dnaResult.archetype.id).map((s, i) => (
                <div key={i} className="dna-blindspot-item">
                  <span className="dna-blindspot-icon">○</span>
                  <span className="dna-blindspot-text">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outfit Formulas */}
          <div className="dna-section">
            <span className="dna-section-title">✦ Your Outfit Formulas</span>
            <div className="dna-formula-list">
              {getFormulas(dnaResult.archetype.id).map((f, i) => (
                <div key={i} className="dna-formula-item">
                  <span className="dna-formula-num">{i + 1}</span>
                  <span className="dna-formula-text">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Brands */}
          <div className="dna-section">
            <span className="dna-section-title">🏷️ Recommended Brands</span>
            <div className="dna-brands-grid">
              {dnaResult.archetype.brands.map(b => (
                <span key={b} className="dna-brand-chip">{b}</span>
              ))}
              {dnaResult.archetype.id === 'minimalist' && <span className="dna-brand-chip">COS</span>}
              {dnaResult.archetype.id === 'streetwear' && <span className="dna-brand-chip">Nike</span>}
              {dnaResult.archetype.id === 'romantic' && <span className="dna-brand-chip">Mango</span>}
              {dnaResult.archetype.id === 'professional' && <span className="dna-brand-chip">Hugo Boss</span>}
            </div>
          </div>

          {/* Color Palette */}
          <div className="dna-section">
            <span className="dna-section-title">🎨 Your Color Palette</span>
            <div className="dna-palette-display">
              {dnaResult.archetype.colors.map(c => (
                <div key={c} className="dna-palette-item">
                  <span className="dna-palette-swatch" style={{ background: colorToHex(c) }} />
                  <span className="dna-palette-name">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share */}
          <button className="dna-share-btn" onClick={handleShare}>
            📤 Share My Style DNA
          </button>

          {showShareToast && (
            <div className="dna-share-toast">Copied to clipboard! Share your style personality.</div>
          )}

          {/* Retake */}
          <button className="btn-ghost dna-retake-btn" onClick={onReset}>
            Retake Style Quiz
          </button>
        </div>
      )}
    </div>
  );
}

/** Simple color → hex */
function colorToHex(name) {
  const map = {
    black: '#1a1a1a', white: '#f5f5f5', beige: '#f5e6d0', grey: '#9e9e9e',
    navy: '#1a2744', charcoal: '#36454f', camel: '#c19a6b',
    blush: '#f4c2c2', cream: '#fffdd0', gold: '#d4af37',
    rust: '#b7410e', cobalt: '#0047ab', floral: '#e8b4c8',
  };
  return map[name?.toLowerCase()] || '#ccc';
}

function isLight(color) {
  const light = ['white', 'beige', 'cream', 'blush', 'gold', 'camel'];
  return light.includes(color?.toLowerCase());
}

export default React.memo(FashionDNA);
