import { useEffect, useRef } from 'react';
import { registerScene } from '../runtime/registry';
import type { SceneKind } from '../runtime/sequence';

const descriptions: Record<SceneKind, string> = {
  hero: 'A 3D chibi Daniel with wavy dark hair, glasses, and a black shirt waves hello.',
  about: 'Daniel orders a cup in a miniature boba shop, then enjoys an endless boba break.',
  skills: 'Daniel wears a headset and plays an original arcade game at his PC.',
  projects: 'Daniel codes at his desk, sips Coke Zero, and takes a short nap.',
  experience: 'Daniel bench presses a weighted barbell, then rests and drinks water.',
};
export function SceneSlot({ kind }: { kind: SceneKind }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current ? registerScene(kind, ref.current) : undefined, [kind]);
  return <div ref={ref} className={`scene-slot scene-${kind}`} data-scene-kind={kind} role="img" aria-label={descriptions[kind]}>
    <img className="scene-fallback" src={`/previews/${kind}.png`} alt="" aria-hidden="true" width="780" height="600" loading={kind === 'hero' ? 'eager' : 'lazy'} />
  </div>;
}
