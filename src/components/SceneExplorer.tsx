import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { bobaPreview } from '../boba';
import { useBobaFlavor } from '../runtime/boba';
import { closeExploration, controlExploration, openExploration, useExplorationStatus } from '../runtime/explorer';
import { toggleMotion, useMotion } from '../runtime/motion';
import type { SceneKind } from '../runtime/sequence';
import { ThemeButton } from './ThemeButton';
import { ScenePropDetails } from './ScenePropDetails';
import { useLanguage } from '../i18n';

const scenes: Record<SceneKind, { title: string; trigger: string; description: string }> = {
  hero: { title: 'Hello, world!', trigger: 'Explore the welcome scene', description: 'Daniel waves hello from his little lavender stage.' },
  about: { title: 'The boba break', trigger: 'Explore the boba shop', description: 'A miniature boba shop, a freshly made drink, and Daniel taking a little break.' },
  skills: { title: 'The gaming corner', trigger: 'Explore the gaming corner', description: 'Daniel settles in at his gaming PC, headset on and game in progress.' },
  projects: { title: 'The coding desk', trigger: 'Explore the coding desk', description: 'A closer look at Daniel’s desk, with code, Coke Zero, and a little room to recharge.' },
  experience: { title: 'The training room', trigger: 'Explore the training room', description: 'Daniel puts in a few reps on the bench, then rests with a drink of water.' },
};

const scenesFr: typeof scenes = {
  hero: { title: 'Bonjour, tout le monde !', trigger: 'Explorer la scène d’accueil', description: 'Daniel vous salue depuis sa petite scène lavande.' },
  about: { title: 'La pause boba', trigger: 'Explorer la boutique de boba', description: 'Une petite boutique de boba, une boisson fraîchement préparée et Daniel qui prend une pause.' },
  skills: { title: 'Le coin jeux', trigger: 'Explorer le coin jeux', description: 'Daniel s’installe devant son PC de jeu, casque sur la tête et partie en cours.' },
  projects: { title: 'Le bureau de code', trigger: 'Explorer le bureau de code', description: 'Un regard de plus près sur le bureau de Daniel, avec du code, du Coke Zero et un petit espace pour refaire le plein d’énergie.' },
  experience: { title: 'Le petit gym', trigger: 'Explorer la salle d’entraînement', description: 'Daniel fait quelques répétitions de développé couché, puis se repose avec un peu d’eau.' },
};

type Selection = { kind: SceneKind; trigger: HTMLButtonElement };
const ExplorerContext = createContext<((selection: Selection) => void) | null>(null);

export function SceneExplorerProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection | null>(null);
  return <ExplorerContext.Provider value={setSelection}>
    {children}
    {selection && <SceneExplorer selection={selection} onDismiss={() => setSelection(null)} />}
  </ExplorerContext.Provider>;
}

export function ExploreSceneButton({ kind, className = '' }: { kind: SceneKind; className?: string }) {
  const { language, text } = useLanguage();
  const open = useContext(ExplorerContext);
  const scene = language === 'fr' ? scenesFr[kind] : scenes[kind];
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <button type="button" className={`explore-scene-button ${className}`} data-explore-kind={kind} disabled={!ready || !open}
    aria-label={scene.trigger} aria-haspopup="dialog" title={text('Explore this scene', 'Explorer cette scène')}
    onClick={event => open?.({ kind, trigger: event.currentTarget })}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4 10 14M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></svg>
  </button>;
}

/** Lock the page without moving the scene or losing the visitor's scroll position. */
function lockPageScroll() {
  const body = document.body;
  const properties = ['position', 'top', 'left', 'width', 'overflow', 'padding-right'] as const;
  const previous = properties.map(property => [property, body.style.getPropertyValue(property), body.style.getPropertyPriority(property)] as const);
  const { scrollX, scrollY } = window;
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  const paddingRight = parseFloat(getComputedStyle(body).paddingRight) || 0;
  body.style.position = 'fixed';
  body.style.top = `${-scrollY}px`;
  body.style.left = `${-scrollX}px`;
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  body.style.paddingRight = `${paddingRight + gutter}px`;
  return () => {
    previous.forEach(([property, value, priority]) => value ? body.style.setProperty(property, value, priority) : body.style.removeProperty(property));
    const root = document.documentElement;
    const behavior = root.style.getPropertyValue('scroll-behavior');
    const priority = root.style.getPropertyPriority('scroll-behavior');
    root.style.setProperty('scroll-behavior', 'auto');
    window.scrollTo(scrollX, scrollY);
    if (behavior) root.style.setProperty('scroll-behavior', behavior, priority);
    else root.style.removeProperty('scroll-behavior');
  };
}

function SceneExplorer({ selection: { kind, trigger }, onDismiss }: { selection: Selection; onDismiss: () => void }) {
  const { language, text } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const status = useExplorationStatus();
  const flavor = useBobaFlavor();
  const motion = useMotion();
  const ready = status === 'ready';
  const paused = motion.paused || motion.reduced;
  const scene = language === 'fr' ? scenesFr[kind] : scenes[kind];

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const element = stageRef.current;
    if (!dialog || !element) return;
    const unlock = lockPageScroll();
    dialog.showModal();
    openExploration({ kind, element, host: dialog });
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      // The shared canvas must leave the dialog before its top layer disappears.
      closeExploration();
      if (dialog.open) dialog.close();
      unlock();
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [kind, trigger]);

  function dismiss() {
    closeExploration();
    dialogRef.current?.close();
    onDismiss();
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled):not([hidden]), [tabindex="0"]'));
    const first = focusable[0];
    const last = focusable.at(-1);
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus({ preventScroll: true });
    }
  }

  function moveCamera(event: KeyboardEvent<HTMLDivElement>) {
    if (!ready || event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    const commands = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'zoom-in', '=': 'zoom-in', '-': 'zoom-out', '_': 'zoom-out', Home: 'reset' } as const;
    const command = commands[event.key as keyof typeof commands];
    if (command) { event.preventDefault(); controlExploration(command); }
  }

  return <dialog ref={dialogRef} className="scene-explorer" aria-modal="true" aria-labelledby="scene-explorer-title" aria-describedby="scene-explorer-description"
    onCancel={event => { event.preventDefault(); dismiss(); }} onKeyDown={containFocus}>
    <div className={`scene-explorer-panel explorer-tone-${kind}`}>
      <header className="scene-explorer-header">
        <div><p className="scene-explorer-eyebrow">{text('A LITTLE CLOSER', 'D’UN PEU PLUS PRÈS')}</p><h2 id="scene-explorer-title">{scene.title}</h2></div>
        <div className="scene-explorer-header-actions">
          <ThemeButton compact />
          <button ref={closeRef} className="scene-explorer-close" type="button" onClick={dismiss} aria-label={text('Close scene viewer', 'Fermer la vue de la scène')} title={text('Close (Escape)', 'Fermer (Échap)')}><span aria-hidden="true">×</span></button>
        </div>
      </header>
      <p id="scene-explorer-description" className="sr-only">{scene.description}</p>
      <div ref={stageRef} className="scene-explorer-stage" role="group" aria-label={`${scene.title}: ${ready ? text('interactive 3D view', 'vue 3D interactive') : text('scene preview', 'aperçu de la scène')}`}
        aria-describedby="scene-explorer-instructions" tabIndex={ready ? 0 : -1} data-interactive={ready} onKeyDown={moveCamera}>
        <img src={kind === 'about' ? bobaPreview(flavor) : `/previews/${kind}.png`} alt="" aria-hidden="true" className="scene-explorer-preview" width="780" height="600" />
      </div>
      <ScenePropDetails kind={kind} surfaceRef={stageRef} />
      <div className="scene-explorer-tools">
        <p id="scene-explorer-instructions" className="scene-explorer-instructions">{ready ? <>{text('Drag to rotate · Scroll or pinch to zoom', 'Glissez pour faire tourner · Défilez ou pincez pour zoomer')}<br /><span>{text('Keyboard: focus the scene, then use arrows, + / −, or Home.', 'Clavier : sélectionnez la scène, puis utilisez les flèches, + / − ou la touche Début.')}</span></> : scene.description}</p>
        <p className="scene-explorer-status" role="status">{status === 'loading' ? text('Loading the 3D view…', 'Chargement de la vue 3D…') : status === 'unavailable' ? text('3D interaction is unavailable here. Enjoy the scene preview.', 'L’interaction 3D n’est pas disponible ici. Profitez de l’aperçu de la scène.') : ''}</p>
        <div className="scene-explorer-controls" role="group" aria-label={text('Camera controls', 'Commandes de la caméra')}>
          <div className="scene-explorer-control-group">
            <button type="button" onClick={() => controlExploration('left')} disabled={!ready} aria-label={text('Rotate left', 'Tourner à gauche')} title={text('Rotate left', 'Tourner à gauche')}>←</button>
            <button type="button" onClick={() => controlExploration('right')} disabled={!ready} aria-label={text('Rotate right', 'Tourner à droite')} title={text('Rotate right', 'Tourner à droite')}>→</button>
            <button type="button" onClick={() => controlExploration('up')} disabled={!ready} aria-label={text('Rotate up', 'Tourner vers le haut')} title={text('Rotate up', 'Tourner vers le haut')}>↑</button>
            <button type="button" onClick={() => controlExploration('down')} disabled={!ready} aria-label={text('Rotate down', 'Tourner vers le bas')} title={text('Rotate down', 'Tourner vers le bas')}>↓</button>
          </div>
          <div className="scene-explorer-control-group">
            <button type="button" onClick={() => controlExploration('zoom-in')} disabled={!ready} aria-label={text('Zoom in', 'Zoom avant')} title={text('Zoom in', 'Zoom avant')}>+</button>
            <button type="button" onClick={() => controlExploration('zoom-out')} disabled={!ready} aria-label={text('Zoom out', 'Zoom arrière')} title={text('Zoom out', 'Zoom arrière')}>−</button>
            <button type="button" className="scene-explorer-reset" onClick={() => controlExploration('reset')} disabled={!ready}>{text('Reset view', 'Réinitialiser la vue')}</button>
          </div>
        </div>
        <footer className="scene-explorer-footer">
          <button type="button" className="scene-explorer-motion" onClick={toggleMotion} disabled={!ready || motion.reduced} aria-pressed={paused}>
            <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{motion.reduced ? text('Reduced motion is on', 'Mouvements réduits activés') : paused ? text('Play animations', 'Lancer les animations') : text('Pause animations', 'Mettre les animations en pause')}
          </button>
          <span className="scene-explorer-escape"><kbd>{text('Esc', 'Échap')}</kbd>{text(' to close', ' pour fermer')}</span>
        </footer>
      </div>
    </div>
  </dialog>;
}
