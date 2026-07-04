import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useMemory — persists session state to localStorage so users don't start
 * from zero every time they open the app.
 *
 * Stores: lastTab, lastInputs, lastResults, lastVisit
 * Key: 'fashiongpt_session'
 *
 * Usage:
 *   const memory = useMemory();
 *   memory.save({ lastTab: 'outfit' });
 *   const { lastTab } = memory.data;
 */

const STORAGE_KEY = 'fashiongpt_session';
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

const DEFAULT_SESSION = {
  lastTab: 'outfit',
  lastInputs: null,
  lastResults: null,
  lastVisit: null,
  createdAt: null,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SESSION };
    const parsed = JSON.parse(raw);
    // Merge with defaults in case schema evolved
    return { ...DEFAULT_SESSION, ...parsed };
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

function persist(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or disabled — silently degrade
  }
}

export default function useMemory() {
  const [data, setData] = useState(load);
  const isFirstMount = useRef(true);

  // Deep-sync to localStorage whenever data changes (skip initial re-hydrate)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    persist(data);
  }, [data]);

  /** Merge partial updates into session memory */
  const save = useCallback((partial) => {
    setData(prev => {
      const next = { ...prev, ...partial };
      persist(next);
      return next;
    });
  }, []);

  /** Save last visit timestamp + inputs after an outfit generation */
  const recordGeneration = useCallback((inputs, results) => {
    setData(prev => {
      const next = {
        ...prev,
        lastInputs: inputs,
        lastResults: results,
        lastVisit: Date.now(),
        createdAt: prev.createdAt || Date.now(),
      };
      persist(next);
      return next;
    });
  }, []);

  /** Clear all session memory (user explicitly resets) */
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
    setData({ ...DEFAULT_SESSION });
  }, []);

  /** Is this a returning visit? (has previous data + within stale window) */
  const isReturning = data.lastVisit != null && (Date.now() - data.lastVisit < STALE_AFTER_MS);

  /** Human-readable "last seen" */
  const lastSeenAgo = useCallback(() => {
    if (!data.lastVisit) return null;
    const diff = Date.now() - data.lastVisit;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }, [data.lastVisit]);

  return { data, save, recordGeneration, clear, isReturning, lastSeenAgo };
}
