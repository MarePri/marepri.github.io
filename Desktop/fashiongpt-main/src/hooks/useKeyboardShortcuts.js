import { useEffect, useState, useCallback } from 'react';

/**
 * useKeyboardShortcuts — global keyboard shortcuts for power users.
 *
 * Shortcuts:
 *   g → Navigate to Outfit Generator
 *   h → Navigate to Home
 *   s → Save current look
 *   l → Navigate to Saved Looks
 *   d → Navigate to Discover
 *   1 → Select first look
 *   2 → Select second look
 *   3 → Select third look
 *   ? → Toggle shortcuts help overlay
 *   Escape → Close help overlay
 *
 * @param {{
 *   onNavigate?: (tab: string) => void,
 *   onSelectLook?: (index: number) => void,
 *   onSave?: () => void,
 * }} handlers
 * @returns {{ showHelp: boolean, setShowHelp: (v: boolean) => void }}
 */
export default function useKeyboardShortcuts(handlers = {}) {
  const { onNavigate, onSelectLook, onSave } = handlers;
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e) => {
    // Ignore if user is typing in an input/textarea
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const key = e.key.toLowerCase();

    // Help toggle
    if (key === '?' || (key === 'escape' && showHelp)) {
      e.preventDefault();
      setShowHelp(prev => !prev);
      return;
    }

    // If help is open, only Escape works (handled above)
    if (showHelp) return;

    switch (key) {
      case 'g':
        e.preventDefault();
        onNavigate?.('outfit');
        break;
      case 'h':
        e.preventDefault();
        onNavigate?.('home');
        break;
      case 's':
        e.preventDefault();
        onSave?.();
        break;
      case 'l':
        e.preventDefault();
        onNavigate?.('looks');
        break;
      case 'd':
        e.preventDefault();
        onNavigate?.('discover');
        break;
      case '1':
        e.preventDefault();
        onSelectLook?.(0);
        break;
      case '2':
        e.preventDefault();
        onSelectLook?.(1);
        break;
      case '3':
        e.preventDefault();
        onSelectLook?.(2);
        break;
    }
  }, [onNavigate, onSelectLook, onSave, showHelp]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}
