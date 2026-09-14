import type { SceneKind, Action } from './sequence';

export interface SceneEntry {
  kind: SceneKind;
  element: HTMLElement;
  elapsed: number;
  visible: boolean;
  override?: { action: Action; time: number };
}
export const entries = new Map<SceneKind, SceneEntry>();
const listeners = new Set<() => void>();
export function registryChanged() { listeners.forEach(listener => listener()); }
export function subscribeRegistry(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function registerScene(kind: SceneKind, element: HTMLElement) {
  const entry: SceneEntry = { kind, element, elapsed: 0, visible: false };
  entries.set(kind, entry);
  registryChanged();
  return () => { entries.delete(kind); registryChanged(); };
}
