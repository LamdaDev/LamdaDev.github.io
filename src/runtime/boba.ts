import { useSyncExternalStore } from 'react';
import { defaultBobaFlavor, type BobaFlavor } from '../boba';

// Shared by the DOM controls and the separately mounted Three.js renderer.
// A page-local choice keeps prerendering deterministic and never resets scene clocks.
let selected: BobaFlavor = defaultBobaFlavor;
const listeners = new Set<() => void>();
export const getBobaFlavor = () => selected;
const getServerFlavor = () => defaultBobaFlavor;
export function subscribeBoba(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function selectBobaFlavor(flavor: BobaFlavor) {
  if (flavor === selected) return;
  selected = flavor;
  listeners.forEach(listener => listener());
}
export function useBobaFlavor() {
  return useSyncExternalStore(subscribeBoba, getBobaFlavor, getServerFlavor);
}
