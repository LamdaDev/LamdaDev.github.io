import { useEffect } from 'react';
import { initializeMotion, toggleMotion, useMotion } from '../runtime/motion';
import { useLanguage } from '../i18n';

export function MotionButton() {
  const motion = useMotion();
  const { text } = useLanguage();
  useEffect(initializeMotion, []);
  const paused = motion.paused || motion.reduced;
  const label = motion.reduced ? text('Animations reduced by your device setting', 'Animations réduites selon le réglage de votre appareil') : paused ? text('Play animations', 'Lancer les animations') : text('Pause animations', 'Mettre les animations en pause');
  return <button id="motion-toggle" className="motion-button" type="button" hidden={!motion.initialized} disabled={motion.reduced} onClick={toggleMotion} aria-pressed={paused} aria-label={label} title={label}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span></button>;
}
