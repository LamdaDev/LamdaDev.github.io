import { useSyncExternalStore } from 'react';

type Motion = { paused: boolean; reduced: boolean; hidden: boolean; initialized: boolean };
const initial: Motion = { paused: false, reduced: false, hidden: false, initialized: false };
let current = initial;
const listeners = new Set<() => void>();
export const getMotion = () => current;
const serverMotion = () => initial;
export function subscribeMotion(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function change(next: Partial<Motion>) { current = { ...current, ...next }; listeners.forEach(listener => listener()); }
export function useMotion() { return useSyncExternalStore(subscribeMotion, getMotion, serverMotion); }
export function initializeMotion() {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('daniel-motion') === 'paused'; } catch { /* Storage can be unavailable. */ }
  const onVisibility = () => change({ hidden: document.hidden });
  const onPreference = () => change({ reduced: media.matches });
  change({ initialized: true, paused, reduced: media.matches, hidden: document.hidden });
  document.addEventListener('visibilitychange', onVisibility);
  media.addEventListener('change', onPreference);
  return () => { document.removeEventListener('visibilitychange', onVisibility); media.removeEventListener('change', onPreference); };
}
export function toggleMotion() {
  const paused = !current.paused;
  change({ paused });
  try { localStorage.setItem('daniel-motion', paused ? 'paused' : 'running'); } catch { /* Preference is still applied in memory. */ }
}
