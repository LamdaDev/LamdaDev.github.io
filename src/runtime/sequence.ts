export const sceneKinds = ['hero', 'about', 'skills', 'projects', 'experience'] as const;
export type SceneKind = typeof sceneKinds[number];
export type Action = 'wave' | 'order' | 'sip' | 'game' | 'code' | 'drink' | 'nap' | 'bench' | 'rest';
export interface Activity { action: Action; time: number }
export const GREETING_DURATION = 6;
export const GREETING_PREVIEW_TIME = 1.9;

/** Elapsed seconds advance only while visible. Boundaries are deliberate hard cuts. */
export function activityAt(kind: SceneKind, elapsed: number, reduced = false): Activity {
  if (reduced) return { action: { hero: 'wave', about: 'sip', skills: 'game', projects: 'code', experience: 'rest' }[kind] as Action, time: kind === 'hero' ? GREETING_PREVIEW_TIME : 1 };
  const t = Math.max(0, elapsed);
  if (kind === 'hero') return { action: 'wave', time: t % GREETING_DURATION };
  if (kind === 'skills') return { action: 'game', time: t };
  if (kind === 'about') return t < 2.4 ? { action: 'order', time: t } : { action: 'sip', time: (t - 2.4) % 4 };
  if (kind === 'projects') {
    const phase = t % 11;
    return phase < 6 ? { action: 'code', time: phase } : phase < 8 ? { action: 'drink', time: phase - 6 } : { action: 'nap', time: phase - 8 };
  }
  const phase = t % 9;
  return phase < 5 ? { action: 'bench', time: phase } : { action: 'rest', time: phase - 5 };
}

export function advanceElapsed(elapsed: number, delta: number, visible: boolean, paused: boolean) {
  return visible && !paused ? elapsed + Math.max(0, Math.min(delta, .1)) : elapsed;
}
