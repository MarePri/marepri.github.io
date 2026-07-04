/**
 * ISOLATED Unit Test for useCapsuleWardrobe
 * Target: src/hooks/useCapsuleWardrobe.js
 * Session: ses_5
 *
 * **WARNING**: THIS FILE WILL BE DELETED AFTER TEST PASSES
 * Test code preserved in: .opencode/unit-tests/
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useEffect } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

// ─── Mock PRODUCTS (isolated data, no real imports) ──────────────────────────
vi.mock('../data/products.js', () => ({
  PRODUCTS: [
    { id: 1, brand: 'Zara', name: 'Linen Blazer', cat: 'Outerwear', color: 'Ecru', price: 89.95, trend: 92, style: ['smart casual'], fit: 'relaxed', img: '\u{1F9E5}' },
    { id: 2, brand: 'Zara', name: 'Wide Leg Trousers', cat: 'Bottoms', color: 'Black', price: 49.95, trend: 88, style: ['minimal'], fit: 'wide', img: '\u{1F456}' },
    { id: 3, brand: 'Pull&Bear', name: 'Carpenter Jeans', cat: 'Bottoms', color: 'Washed Blue', price: 39.99, trend: 94, style: ['streetwear'], fit: 'baggy', img: '\u{1F456}' },
    { id: 4, brand: 'Pull&Bear', name: 'Graphic Tee', cat: 'Tops', color: 'Faded Black', price: 17.99, trend: 88, style: ['streetwear'], fit: 'relaxed', img: '\u{1F455}' },
    { id: 5, brand: 'Zara', name: 'Draped Dress', cat: 'Dresses', color: 'Ivory', price: 69.95, trend: 95, style: ['evening'], fit: 'draped', img: '\u{1F457}' },
    { id: 6, brand: 'Zara', name: 'Leather Tote', cat: 'Bags', color: 'Tan', price: 79.95, trend: 85, style: ['office'], fit: 'n/a', img: '\u{1F45C}' },
    { id: 7, brand: 'Zara', name: 'Heel Mule', cat: 'Shoes', color: 'Beige', price: 59.95, trend: 82, style: ['office'], fit: 'n/a', img: '\u{1F460}' },
    { id: 8, brand: 'Stradivarius', name: 'Linen Shorts', cat: 'Bottoms', color: 'Sand', price: 25.99, trend: 85, style: ['casual'], fit: 'relaxed', img: '\u{1FA73}' },
    { id: 9, brand: 'Pull&Bear', name: 'Chunky Sneaker', cat: 'Shoes', color: 'White', price: 49.99, trend: 89, style: ['streetwear'], fit: 'n/a', img: '\u{1F45F}' },
    { id: 10, brand: 'Zara', name: 'Midi Skirt', cat: 'Bottoms', color: 'Champagne', price: 45.95, trend: 90, style: ['evening'], fit: 'slim', img: '\u{1F457}' },
    { id: 11, brand: 'Pull&Bear', name: 'Bomber Jacket', cat: 'Outerwear', color: 'Navy', price: 59.99, trend: 91, style: ['streetwear'], fit: 'regular', img: '\u{1F9E5}' },
    { id: 12, brand: 'Bershka', name: 'Flare Jeans', cat: 'Bottoms', color: 'Light Wash', price: 32.99, trend: 96, style: ['y2k'], fit: 'flare', img: '\u{1F456}' },
  ],
}));

// Import target file (AFTER mocks)
import useCapsuleWardrobe from '../useCapsuleWardrobe.js';

// ─── Test Helpers ─────────────────────────────────────────────────────────────

/**
 * Test harness component that exposes hook state via a callback.
 * Uses useEffect to fire after every render so act() flushes updates.
 */
function TestHarness({ onHook }) {
  var hook = useCapsuleWardrobe();
  useEffect(function () {
    onHook(hook);
  });
  return null;
}

/**
 * Render the harness into a detached DOM node, returning a getter for
 * the latest hook value. All renders are wrapped in act().
 */
function createHookRenderer() {
  var container = document.createElement('div');
  document.body.appendChild(container);
  var root = createRoot(container);
  var current = {};

  function render() {
    act(function () {
      root.render(
        React.createElement(TestHarness, {
          onHook: function (h) { current = h; },
        })
      );
    });
  }

  function cleanup() {
    act(function () { root.unmount(); });
    container.remove();
  }

  function get() {
    return current;
  }

  return { render: render, cleanup: cleanup, get: get };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useCapsuleWardrobe - Isolated Tests', function () {
  var harness;

  beforeEach(function () {
    harness = createHookRenderer();
    harness.render();
  });

  afterEach(function () {
    harness.cleanup();
  });

  it('should return the expected interface', function () {
    var h = harness.get();
    expect(h).toHaveProperty('capsuleResult');
    expect(h).toHaveProperty('capsuleLoading');
    expect(h).toHaveProperty('buildCapsule');
    expect(h).toHaveProperty('reset');
    expect(typeof h.buildCapsule).toBe('function');
    expect(typeof h.reset).toBe('function');
  });

  it('should start with null result and loading false', function () {
    var h = harness.get();
    expect(h.capsuleResult).toBeNull();
    expect(h.capsuleLoading).toBe(false);
  });

  it('should build capsule and return a valid result structure', function () {
    act(function () {
      harness.get().buildCapsule();
    });

    var h = harness.get();
    expect(h.capsuleResult).not.toBeNull();
    expect(Array.isArray(h.capsuleResult.picks)).toBe(true);
    expect(h.capsuleResult.picks.length).toBeGreaterThan(0);
    expect(h.capsuleResult.total).toBeGreaterThan(0);
    expect(h.capsuleResult.combos).toBeGreaterThan(0);
    expect(h.capsuleLoading).toBe(false);
  });

  it('should set capsuleLoading false after build completes', function () {
    expect(harness.get().capsuleLoading).toBe(false);

    act(function () {
      harness.get().buildCapsule();
    });

    expect(harness.get().capsuleLoading).toBe(false);
    expect(harness.get().capsuleResult).not.toBeNull();
  });

  it('should guard against concurrent buildCapsule calls', function () {
    var buildCapsule = harness.get().buildCapsule;

    // First call
    act(function () { buildCapsule(); });
    var firstResult = harness.get().capsuleResult;
    expect(firstResult).not.toBeNull();

    // Second call (rapid) — ref guard should prevent corrupt state
    act(function () { buildCapsule(); });
    var secondResult = harness.get().capsuleResult;
    expect(secondResult).not.toBeNull();
    expect(harness.get().capsuleLoading).toBe(false);
  });

  it('should reset state correctly', function () {
    var h = harness.get();
    var buildCapsule = h.buildCapsule;
    var reset = h.reset;

    act(function () { buildCapsule(); });
    expect(harness.get().capsuleResult).not.toBeNull();

    act(function () { reset(); });
    expect(harness.get().capsuleResult).toBeNull();
    expect(harness.get().capsuleLoading).toBe(false);
  });
});
