import { useEffect } from 'react';
import { initializeMotion, toggleMotion, useMotion } from '../runtime/motion';

export function MotionButton() {
  const motion = useMotion();
  useEffect(initializeMotion, []);
  const paused = motion.paused || motion.reduced;
  const label = motion.reduced ? 'Animations reduced by your device setting' : paused ? 'Play animations' : 'Pause animations';
  return <button id="motion-toggle" className="motion-button" type="button" hidden={!motion.initialized} disabled={motion.reduced} onClick={toggleMotion} aria-pressed={paused} aria-label={label} title={label}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span></button>;
}
