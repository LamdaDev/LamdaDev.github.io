import { useSyncExternalStore } from 'react';
import type { SceneKind } from './sequence';

export type Exploration = { kind: SceneKind; element: HTMLElement; host: HTMLDialogElement };
export type ExplorationCommand = 'left' | 'right' | 'up' | 'down' | 'zoom-in' | 'zoom-out' | 'reset';
type Status = 'loading' | 'ready' | 'unavailable';

let current: Exploration | null = null;
let rendererStatus: Status = 'loading';
let status: Status = 'loading';
const listeners = new Set<() => void>();
const statusListeners = new Set<() => void>();
const commandListeners = new Set<(command: ExplorationCommand) => void>();

export const getExploration = () => current;
export function subscribeExploration(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function setExplorationStatus(next: Status) {
  if (status === next) return;
  status = next;
  statusListeners.forEach(listener => listener());
}
export function setRendererStatus(next: Status) {
  rendererStatus = next;
  if (next !== 'ready') {
    current?.element.removeAttribute('data-rendered');
    setExplorationStatus(next);
  }
}
export function openExploration(exploration: Exploration) {
  current = exploration;
  setExplorationStatus(rendererStatus === 'unavailable' ? 'unavailable' : 'loading');
  listeners.forEach(listener => listener());
}
export function closeExploration() {
  if (!current) return;
  current.element.removeAttribute('data-rendered');
  current = null;
  listeners.forEach(listener => listener());
  setExplorationStatus('loading');
}
export function useExplorationStatus() {
  return useSyncExternalStore(listener => {
    statusListeners.add(listener);
    return () => { statusListeners.delete(listener); };
  }, () => status, (): Status => 'loading');
}
export function subscribeExplorationControls(listener: (command: ExplorationCommand) => void) {
  commandListeners.add(listener);
  return () => { commandListeners.delete(listener); };
}
export function controlExploration(command: ExplorationCommand) {
  if (current && status === 'ready') commandListeners.forEach(listener => listener(command));
}
