import React from 'react';
import { COLOR_HEX } from '../utils/color.js';

/**
 * @param {{ colorName: string }} props
 */
export default function ColorDot({ colorName }) {
  const hex = COLOR_HEX[colorName] || '#888';
  return (
    <div
      style={{
        background: hex,
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: '1.5px solid #333',
        flexShrink: 0,
      }}
    />
  );
}
