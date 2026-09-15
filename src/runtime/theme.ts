import { useSyncExternalStore } from 'react';

export type Theme = 'day' | 'night';
const storageKey = 'daniel-theme';
let current: Theme = 'day';
const listeners = new Set<() => void>();
export const getTheme = () => current;
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, (): Theme => 'day');
}

function applyTheme(theme: Theme) {
  current = theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#191923' : '#fff9f0');
  listeners.forEach(listener => listener());
}

/** The inline head script applies a saved palette before the first paint. */
export function initializeTheme() {
  applyTheme(document.documentElement.dataset.theme === 'night' ? 'night' : 'day');
  // Paint the initial palette without animating from the server's day default.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.dataset.themeReady = 'true';
  }));
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) applyTheme(event.newValue === 'night' ? 'night' : 'day');
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

export function toggleTheme() {
  const theme = current === 'day' ? 'night' : 'day';
  applyTheme(theme);
  try { localStorage.setItem(storageKey, theme); } catch { /* The toggle still works without storage. */ }
}

/** Read the browser's interpolated value, including a mid-transition reversal.
 * CSS colors and Three.js lighting therefore follow the same native timeline.
 * Older browsers without registered properties still receive the final theme.
 */
export function getNightMix() {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--night-mix'));
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : current === 'night' ? 1 : 0;
}
