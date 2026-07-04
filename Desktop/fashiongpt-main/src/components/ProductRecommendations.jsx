import React from 'react';

/**
 * Color name → hex mapper for product color swatches.
 */
const COLOR_MAP = {
  black: '#1a1a1a', white: '#f5f5f5', beige: '#f5e6d0', grey: '#9e9e9e',
  gray: '#9e9e9e', navy: '#1a2744', charcoal: '#36454f', camel: '#c19a6b',
  tan: '#d2b48c', cognac: '#9a4a2a', rust: '#b7410e', cobalt: '#0047ab',
  blush: '#f4c2c2', cream: '#fffdd0', gold: '#d4af37', silver: '#c0c0c0',
  floral: '#e8b4c8', ecru: '#c3b091', ivory: '#fffff0', champagne: '#f7e7ce',
  chocolate: '#7b3f00', slate: '#708090', 'dusty pink': '#dca3a3',
  sand: '#c2b280', olive: '#556b2f', khaki: '#c3b091', burgundy: '#800020',
  maroon: '#800000', teal: '#008080', mint: '#98ff98', coral: '#ff7f50',
  lavender: '#e6e6fa', mauve: '#e0b0ff', taupe: '#483c3c', espresso: '#4b3621',
  emerald: '#50c878', ruby: '#e0115f', sapphire: '#0f52ba', rose: '#ff007f',
  denim: '#1560bd', brown: '#8b4513', blue: '#4169e1', red: '#dc143c',
  green: '#228b22', yellow: '#ffd700', orange: '#ff8c00', purple: '#8a2be2',
  pink: '#ff69b4', multicolor: 'linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71, #3498db, #9b59b6)',
};

function colorToHex(name) {
  return COLOR_MAP[name?.toLowerCase()] || 'transparent';
}

/**
 * ProductRecommendations — visual product list with color swatches.
 * Every item shows: category icon, color dot, name, brand, price.
 */
function ProductRecommendations({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="outfit-items">
      {items.map((item, i) => {
        const itemColor = item.color || item.colour || '';
        const hex = colorToHex(itemColor);
        const isMulti = itemColor?.toLowerCase() === 'multicolor';

        return (
          <div className="outfit-item" key={item.id || i}>
            <img className="outfit-item-icon" src={item.img} alt={item.name} />
            <div className="outfit-item-info">
              <div className="outfit-item-name-row">
                {itemColor && (
                  <span
                    className={`outfit-color-swatch${isMulti ? ' multicolor' : ''}`}
                    style={isMulti ? {} : { background: hex }}
                    title={itemColor}
                  />
                )}
                <span className="name">{item.name}</span>
              </div>
              <div className="brand-price">
                {item.brand}{item.brand && item.cat ? ' · ' : ''}{item.cat}
                {itemColor ? ` · ${itemColor}` : ''}
              </div>
            </div>
            <div className="outfit-item-price">€{item.price?.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(ProductRecommendations);
