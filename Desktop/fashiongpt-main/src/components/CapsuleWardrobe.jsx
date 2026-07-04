import React from 'react';

/**
 * CapsuleWardrobe — 10-piece capsule builder.
 * @param {{
 *   capsuleResult: import('../types/index.js').CapsuleResult|null,
 *   capsuleLoading: boolean,
 *   buildCapsule: () => void,
 *   onReset: () => void
 * }} props
 */
function CapsuleWardrobe({ capsuleResult, capsuleLoading, buildCapsule, onReset }) {
  return (
    <div className="section-pad" style={{ paddingBottom: 40 }}>
      <div className="section-title">Capsule Wardrobe</div>
      <div className="section-sub">10 pieces. Endless combinations.</div>

      {!capsuleResult ? (
        <>
          <div className="empty-state-personality" style={{ padding: '20px 0' }}>
            <span className="empty-state-icon">🗂</span>
            <h3>Your 10-Piece Capsule</h3>
            <p>A curated collection of versatile pieces that all work together. FashionGPT selects from across Inditex brands — mixing investment staples with accessible finds.</p>
            <button className="btn-primary" onClick={buildCapsule} disabled={capsuleLoading}>
              {capsuleLoading ? 'Building capsule…' : '✦ Build My Capsule'}
            </button>
          </div>
        </>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s' }}>
          <div className="capsule-header">
            <div className="capsule-count">10</div>
            <div className="capsule-label">carefully selected pieces</div>
            <div className="capsule-outfits">creates <strong>{capsuleResult.combos}+</strong> outfits</div>
            <div style={{ marginTop: 10, fontSize: 14, color: 'var(--accent2)', fontWeight: 600 }}>
              Total: €{capsuleResult.total.toFixed(2)}
            </div>
          </div>

          <div className="capsule-grid">
            {capsuleResult.picks.map((p, i) => (
              <div className="capsule-item" key={i}>
                <img className="capsule-item-icon" src={p.img} alt={p.name} />
                <div className="capsule-item-name">
                  {p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 1 }}>{p.brand}</div>
                <div className="capsule-item-price">€{p.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: 'rgba(201,130,107,0.08)', border: '1px solid rgba(201,130,107,0.2)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>✦ WHY THIS WORKS</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Neutral base pieces anchor the wardrobe while one statement item (the outerwear or dress) elevates every look. Cross-brand mixing gives you price-point range without sacrificing cohesion.
            </div>
          </div>

          <button className="btn-ghost" style={{ width: '100%', marginTop: 14 }} onClick={onReset}>
            Rebuild Capsule
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(CapsuleWardrobe);
