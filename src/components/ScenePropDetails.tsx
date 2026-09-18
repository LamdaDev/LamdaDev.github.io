import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { sceneDetails, sceneDetailLabels } from '../sceneDetails';
import { pickSceneProp } from '../runtime/sceneProps';
import { registryChanged } from '../runtime/registry';
import type { SceneKind } from '../runtime/sequence';

type Props = { kind: SceneKind; surfaceRef: RefObject<HTMLDivElement | null> };
type Gesture = { pointerId: number; x: number; y: number; started: number; moved: boolean };

export function ScenePropDetails({ kind, surfaceRef }: Props) {
  const details = sceneDetails[kind];
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const lastButton = useRef<HTMLButtonElement | null>(null);
  const noteId = `scene-detail-${useId()}`;
  const selected = details.find(detail => detail.id === selectedId);

  // Notes can move later scene windows even while their animation clocks are paused.
  useEffect(() => { if (surface) registryChanged(); }, [surface, selectedId]);

  function select(id: string, button?: HTMLButtonElement) {
    lastButton.current = button ?? buttons.current.get(id) ?? null;
    const next = selectedRef.current === id ? null : id;
    selectedRef.current = next;
    setSelectedId(next);
  }

  function dismiss() {
    const target = lastButton.current ?? buttons.current.get(selectedRef.current ?? '');
    selectedRef.current = null;
    setSelectedId(null);
    if (target?.isConnected && !target.disabled) target.focus({ preventScroll: true });
  }

  function closeOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || !selectedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    dismiss();
  }

  useEffect(() => {
    const element = surfaceRef.current;
    if (!element) return;
    setSurface(element);
    let gesture: Gesture | null = null;
    const pointers = new Set<number>();
    let hover: string | null = null;
    const updateHover = (id: string | null) => {
      if (id) element.dataset.hoverProp = id;
      else delete element.dataset.hoverProp;
      if (hover === id) return;
      hover = id;
    };
    const down = (event: PointerEvent) => {
      pointers.add(event.pointerId);
      if (pointers.size > 1 || !event.isPrimary || event.button !== 0) {
        gesture = null;
        updateHover(null);
        return;
      }
      gesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, started: performance.now(), moved: false };
    };
    const move = (event: PointerEvent) => {
      if (gesture?.pointerId === event.pointerId) {
        gesture.moved ||= Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 7;
      }
      if (pointers.size > 1 || gesture?.moved || event.pointerType === 'touch') updateHover(null);
      else updateHover(pickSceneProp(element, event.clientX, event.clientY));
    };
    const up = (event: PointerEvent) => {
      const tap = gesture;
      gesture = null;
      pointers.delete(event.pointerId);
      if (!tap || tap.pointerId !== event.pointerId || tap.moved || pointers.size || !event.isPrimary || event.button !== 0
        || performance.now() - tap.started > 600 || Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 7) return;
      const id = pickSceneProp(element, event.clientX, event.clientY);
      if (!id || !details.some(detail => detail.id === id)) return;
      select(id);
      // Keep Escape available after a pointer selection, without moving the page or camera.
      element.focus({ preventScroll: true });
    };
    const cancel = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (gesture?.pointerId === event.pointerId) gesture = null;
      updateHover(null);
    };
    const leave = (event: PointerEvent) => {
      updateHover(null);
      if (!element.hasPointerCapture(event.pointerId)) cancel(event);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || !selectedRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    };
    // Capture lets us observe OrbitControls' gestures without owning pointer capture,
    // preventing default scrolling, or interfering with camera handlers.
    const options = { passive: true, capture: true };
    element.addEventListener('pointerdown', down, options);
    element.addEventListener('pointermove', move, options);
    element.addEventListener('pointerup', up, options);
    element.addEventListener('pointercancel', cancel, options);
    element.addEventListener('lostpointercapture', cancel, options);
    element.addEventListener('pointerleave', leave, options);
    const escapeTarget = element.closest('dialog') ?? element;
    escapeTarget.addEventListener('keydown', escape as EventListener, true);
    return () => {
      element.removeEventListener('pointerdown', down, true);
      element.removeEventListener('pointermove', move, true);
      element.removeEventListener('pointerup', up, true);
      element.removeEventListener('pointercancel', cancel, true);
      element.removeEventListener('lostpointercapture', cancel, true);
      element.removeEventListener('pointerleave', leave, true);
      escapeTarget.removeEventListener('keydown', escape as EventListener, true);
      delete element.dataset.hoverProp;
    };
  }, [kind, surfaceRef, details]);

  return <>
    {surface && createPortal(details.map(detail => <span key={detail.id} className="scene-prop-marker" data-prop-marker={detail.id} aria-hidden="true" />), surface)}
    <div className={`scene-prop-details scene-prop-details--${kind}`} data-prop-kind={kind} onKeyDown={closeOnEscape}>
      <p className="scene-prop-hint"><strong>Little details</strong><span aria-hidden="true"> · </span>Tap a prop or choose below.</p>
      <div className="scene-prop-buttons" role="group" aria-label={`Personal details in the ${sceneDetailLabels[kind]}`}>
        {details.map(detail => <button key={detail.id} type="button" data-prop-button={detail.id}
          ref={element => { if (element) buttons.current.set(detail.id, element); else buttons.current.delete(detail.id); }}
          disabled={!surface} aria-expanded={selectedId === detail.id} aria-controls={noteId}
          onClick={event => select(detail.id, event.currentTarget)}>
          <span className="scene-prop-button-dot" aria-hidden="true">{selectedId === detail.id ? '−' : '+'}</span>{detail.label}
        </button>)}
      </div>
      <div className="scene-prop-announcement" id={noteId} aria-live="polite" aria-atomic="true">
        {selected && <div className="scene-prop-note" data-prop-note={selected.id}>
          <div><p className="scene-prop-note-title">{selected.title}</p><p className="scene-prop-note-body">{selected.body}</p></div>
          <button type="button" className="scene-prop-dismiss" aria-label="Close personal detail" onClick={dismiss}><span aria-hidden="true">×</span></button>
        </div>}
      </div>
      <noscript><div className="scene-prop-noscript"><p>JavaScript is off. Here are the little details from this scene:</p><ul>{details.map(detail => <li key={detail.id}><strong>{detail.title}</strong> {detail.body}</li>)}</ul></div></noscript>
    </div>
  </>;
}
