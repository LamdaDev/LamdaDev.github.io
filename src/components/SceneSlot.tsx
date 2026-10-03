import { useEffect, useRef } from 'react';
import { registerScene } from '../runtime/registry';
import type { SceneKind } from '../runtime/sequence';
import { bobaFlavors, bobaPreview } from '../boba';
import { useBobaFlavor } from '../runtime/boba';
import { useLanguage } from '../i18n';
import { ScenePropDetails } from './ScenePropDetails';

const descriptions: Record<SceneKind, string> = {
  hero: 'A 3D chibi Daniel with wavy dark hair, glasses, and a black shirt waves hello.',
  about: 'Daniel orders a cup in a miniature boba shop, then enjoys an endless boba break.',
  skills: 'Daniel wears a headset and plays an original arcade game at his PC.',
  projects: 'Daniel codes at his desk, sips Coke Zero, and takes a short nap.',
  experience: 'Daniel bench presses a weighted barbell, then rests and drinks water.',
};
const descriptionsFr: Record<SceneKind, string> = {
  hero: 'Daniel en version chibi 3D, avec des cheveux foncés ondulés, des lunettes et un t-shirt noir, fait un signe de la main pour dire bonjour.',
  about: 'Daniel commande un gobelet dans une petite boutique de boba, puis profite d’une pause boba sans fin.',
  skills: 'Daniel porte un casque et joue à un jeu d’arcade original sur son PC.',
  projects: 'Daniel code à son bureau, boit du Coke Zero et fait une petite sieste.',
  experience: 'Daniel fait du développé couché avec une barre lestée, puis se repose et boit de l’eau.',
};
export function SceneSlot({ kind }: { kind: SceneKind }) {
  const ref = useRef<HTMLDivElement>(null);
  const flavor = useBobaFlavor();
  const { text } = useLanguage();
  const description = kind === 'about'
    ? text(`Daniel orders ${bobaFlavors[flavor].label.toLowerCase()} in a miniature boba shop, then enjoys an endless boba break.`,
      `Daniel commande un ${flavor === 'milk-tea' ? 'thé au lait' : flavor === 'matcha' ? 'thé au matcha' : 'thé au taro'} dans une petite boutique de boba, puis profite d’une pause boba sans fin.`)
    : text(descriptions[kind], descriptionsFr[kind]);
  useEffect(() => ref.current ? registerScene(kind, ref.current) : undefined, [kind]);
  return <><div ref={ref} className={`scene-slot scene-${kind}`} data-scene-kind={kind} role="group" aria-label={description} tabIndex={-1}>
    <img className="scene-fallback" src={kind === 'about' ? bobaPreview(flavor) : `/previews/${kind}.png`} alt="" aria-hidden="true" width="780" height="600" loading={kind === 'hero' ? 'eager' : 'lazy'} />
  </div><ScenePropDetails kind={kind} surfaceRef={ref} /></>;
}
