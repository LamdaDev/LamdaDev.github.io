import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { bobaPreview } from '../boba';
import { useBobaFlavor } from '../runtime/boba';
import { closeExploration, controlExploration, openExploration, useExplorationStatus } from '../runtime/explorer';
import { toggleMotion, useMotion } from '../runtime/motion';
import type { SceneKind } from '../runtime/sequence';
import { ThemeButton } from './ThemeButton';

const scenes: Record<SceneKind, { title: string; trigger: string; description: string }> = {
  hero: { title: 'Hello, world!', trigger: 'Explore the welcome scene', description: 'Daniel waves hello from his little lavender stage.' },
  about: { title: 'The boba break', trigger: 'Explore the boba shop', description: 'A miniature boba shop, a freshly made drink, and Daniel taking a little break.' },
  skills: { title: 'The gaming corner', trigger: 'Explore the gaming corner', description: 'Daniel settles in at his gaming PC, headset on and game in progress.' },
  projects: { title: 'The coding desk', trigger: 'Explore the coding desk', description: 'A closer look at Daniel’s desk, with code, Coke Zero, and a little room to recharge.' },
  experience: { title: 'The training room', trigger: 'Explore the training room', description: 'Daniel puts in a few reps on the bench, then rests with a drink of water.' },
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
  const open = useContext(ExplorerContext);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <button type="button" className={`explore-scene-button ${className}`} data-explore-kind={kind} disabled={!ready || !open}
    aria-label={scenes[kind].trigger} aria-haspopup="dialog" title="Explore this scene"
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const status = useExplorationStatus();
  const flavor = useBobaFlavor();
  const motion = useMotion();
  const ready = status === 'ready';
  const paused = motion.paused || motion.reduced;
  const scene = scenes[kind];

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
    if (!ready || event.altKey || event.ctrlKey || event.metaKey) return;
    const commands = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'zoom-in', '=': 'zoom-in', '-': 'zoom-out', '_': 'zoom-out', Home: 'reset' } as const;
    const command = commands[event.key as keyof typeof commands];
    if (command) { event.preventDefault(); controlExploration(command); }
  }

  return <dialog ref={dialogRef} className="scene-explorer" aria-modal="true" aria-labelledby="scene-explorer-title" aria-describedby="scene-explorer-description"
    onCancel={event => { event.preventDefault(); dismiss(); }} onKeyDown={containFocus}>
    <div className={`scene-explorer-panel explorer-tone-${kind}`}>
      <header className="scene-explorer-header">
        <div><p className="scene-explorer-eyebrow">A LITTLE CLOSER</p><h2 id="scene-explorer-title">{scene.title}</h2></div>
        <div className="scene-explorer-header-actions">
          <ThemeButton compact />
          <button ref={closeRef} className="scene-explorer-close" type="button" onClick={dismiss} aria-label="Close scene viewer" title="Close (Escape)"><span aria-hidden="true">×</span></button>
        </div>
      </header>
      <p id="scene-explorer-description" className="sr-only">{scene.description}</p>
      <div ref={stageRef} className="scene-explorer-stage" role="group" aria-label={`${scene.title} — ${ready ? 'interactive 3D view' : 'scene preview'}`}
        aria-describedby="scene-explorer-instructions" tabIndex={ready ? 0 : -1} data-interactive={ready} onKeyDown={moveCamera}>
        <img src={kind === 'about' ? bobaPreview(flavor) : `/previews/${kind}.png`} alt="" aria-hidden="true" className="scene-explorer-preview" width="780" height="600" />
      </div>
      <div className="scene-explorer-tools">
        <p id="scene-explorer-instructions" className="scene-explorer-instructions">{ready ? <>Drag to rotate · Scroll or pinch to zoom<br /><span>Keyboard: focus the scene, then use arrows, + / −, or Home.</span></> : scene.description}</p>
        <p className="scene-explorer-status" role="status">{status === 'loading' ? 'Loading the 3D view…' : status === 'unavailable' ? '3D interaction is unavailable here. Enjoy the scene preview.' : ''}</p>
        <div className="scene-explorer-controls" role="group" aria-label="Camera controls">
          <div className="scene-explorer-control-group">
            <button type="button" onClick={() => controlExploration('left')} disabled={!ready} aria-label="Rotate left" title="Rotate left">←</button>
            <button type="button" onClick={() => controlExploration('right')} disabled={!ready} aria-label="Rotate right" title="Rotate right">→</button>
            <button type="button" onClick={() => controlExploration('up')} disabled={!ready} aria-label="Rotate up" title="Rotate up">↑</button>
            <button type="button" onClick={() => controlExploration('down')} disabled={!ready} aria-label="Rotate down" title="Rotate down">↓</button>
          </div>
          <div className="scene-explorer-control-group">
            <button type="button" onClick={() => controlExploration('zoom-in')} disabled={!ready} aria-label="Zoom in" title="Zoom in">+</button>
            <button type="button" onClick={() => controlExploration('zoom-out')} disabled={!ready} aria-label="Zoom out" title="Zoom out">−</button>
            <button type="button" className="scene-explorer-reset" onClick={() => controlExploration('reset')} disabled={!ready}>Reset view</button>
          </div>
        </div>
        <footer className="scene-explorer-footer">
          <button type="button" className="scene-explorer-motion" onClick={toggleMotion} disabled={!ready || motion.reduced} aria-pressed={paused}>
            <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{motion.reduced ? 'Reduced motion is on' : paused ? 'Play animations' : 'Pause animations'}
          </button>
          <span className="scene-explorer-escape"><kbd>Esc</kbd> to close</span>
        </footer>
      </div>
    </div>
  </dialog>;
}
