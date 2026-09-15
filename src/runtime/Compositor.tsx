import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Scene } from 'three';
import { createDiorama } from '../three/dioramas';
import { entries, subscribeRegistry } from './registry';
import { getMotion, subscribeMotion } from './motion';
import { getBobaFlavor, subscribeBoba } from './boba';
import { activityAt, advanceElapsed, type Action, type SceneKind } from './sequence';
import { getExploration, setExplorationStatus, subscribeExploration, subscribeExplorationControls } from './explorer';
import { createExplorationCamera } from './explorationCamera';
import { getNightMix, getTheme, subscribeTheme } from './theme';
import { createLighting } from './lighting';

type Model = ReturnType<typeof createDiorama>;
type View = { model: Model; scene: Scene; camera: OrthographicCamera; lighting: ReturnType<typeof createLighting> };
declare global {
  interface Window {
    __portfolio: {
      snapshot: () => { kind: SceneKind; elapsed: number; visible: boolean; action: string; rendered: boolean; nightMix: number }[];
      pose: (kind: SceneKind, action: Action, time?: number) => void;
      resume: () => void;
      stats: () => { frames: number; contexts: number; triangles: number; calls: number };
      exploration: () => { kind: SceneKind; azimuth: number; polar: number; zoom: number } | null;
      theme: () => { mode: 'day' | 'night'; mix: number };
    };
  }
}

/** One renderer; each visible card gets a scissored viewport and its own camera. */
export function Compositor() {
  const { gl, invalidate, size } = useThree();
  const views = useRef(new Map<SceneKind, View>());
  const last = useRef(0);
  const frames = useRef(0);
  const stats = useRef({ triangles: 0, calls: 0 });
  const explorationCamera = useRef<ReturnType<typeof createExplorationCamera> | null>(null);

  useEffect(() => {
    const wake = () => { last.current = 0; invalidate(); };
    const observer = new ResizeObserver(wake);
    observer.observe(document.body);
    window.addEventListener('scroll', wake, { passive: true, capture: true });
    window.addEventListener('resize', wake);
    const unsubMotion = subscribeMotion(wake);
    const unsubRegistry = subscribeRegistry(wake);
    const unsubBoba = subscribeBoba(wake);
    const unsubTheme = subscribeTheme(wake);
    const sceneObserver = new ResizeObserver(wake);
    const changeExploration = () => {
      explorationCamera.current?.dispose();
      explorationCamera.current = null;
      sceneObserver.disconnect();
      const exploration = getExploration();
      if (exploration) sceneObserver.observe(exploration.element);
      wake();
    };
    const unsubExploration = subscribeExploration(changeExploration);
    const unsubControls = subscribeExplorationControls(command => explorationCamera.current?.command(command));
    changeExploration();
    window.__portfolio = {
      snapshot: () => [...entries.values()].map(entry => ({ kind: entry.kind, elapsed: entry.elapsed, visible: entry.visible, action: entry.element.dataset.action ?? '', rendered: entry.element.dataset.rendered === 'true', nightMix: Number(entry.element.dataset.nightMix ?? 0) })),
      pose: (kind, action, time = 0) => { const entry = entries.get(kind); if (entry) entry.override = { action, time }; wake(); },
      resume: () => { entries.forEach(entry => { entry.override = undefined; }); wake(); },
      stats: () => ({ frames: frames.current, contexts: document.querySelectorAll('canvas[data-engine]').length, ...stats.current }),
      exploration: () => explorationCamera.current?.snapshot() ?? null,
      theme: () => ({ mode: getTheme(), mix: getNightMix() }),
    };
    wake();
    return () => {
      observer.disconnect(); window.removeEventListener('scroll', wake, true); window.removeEventListener('resize', wake);
      unsubMotion(); unsubRegistry(); unsubBoba(); unsubExploration(); unsubControls(); unsubTheme();
      sceneObserver.disconnect(); explorationCamera.current?.dispose(); explorationCamera.current = null;
      views.current.forEach(view => view.model.dispose()); views.current.clear();
    };
  }, [invalidate]);

  useFrame(() => {
    if (gl.getContext().isContextLost()) {
      entries.forEach(entry => entry.element.removeAttribute('data-rendered'));
      getExploration()?.element.removeAttribute('data-rendered');
      setExplorationStatus('unavailable');
      last.current = 0;
      return;
    }
    const now = performance.now() / 1000;
    const delta = last.current ? now - last.current : 0;
    last.current = now;
    const motion = getMotion();
    const paused = motion.paused || motion.reduced || motion.hidden;
    const nightMix = getNightMix();
    const themeTransitioning = Math.abs(nightMix - (getTheme() === 'night' ? 1 : 0)) > .00001;
    const exploration = getExploration();
    gl.setScissorTest(false); gl.setViewport(0, 0, size.width, size.height); gl.clear(true, true, true);
    gl.setScissorTest(true);
    let animate = false;
    let triangles = 0;
    let calls = 0;
    entries.forEach(entry => {
      const exploring = exploration?.kind === entry.kind;
      const element = exploring ? exploration.element : entry.element;
      const rect = element.getBoundingClientRect();
      // A short landscape dialog can scroll internally. Its canvas must clip to
      // the panel, even though the shared renderer is fixed to the viewport.
      const panel = exploring ? element.parentElement?.getBoundingClientRect() : undefined;
      const left = Math.max(0, rect.left, panel?.left ?? 0);
      const right = Math.min(size.width, rect.right, panel?.right ?? size.width);
      const top = Math.max(0, rect.top, panel?.top ?? 0);
      const bottom = Math.min(size.height, rect.bottom, panel?.bottom ?? size.height);
      entry.visible = (!exploration || exploring) && right > left && bottom > top;
      entry.element.dataset.visible = String(entry.visible);
      entry.element.dataset.running = String(entry.visible && !paused && !entry.override);
      entry.elapsed = advanceElapsed(entry.elapsed, delta, entry.visible, paused || !!entry.override);
      if (!entry.visible || motion.hidden) return;
      if (entry.element.dataset.sceneError === 'true') {
        if (exploring) setExplorationStatus('unavailable');
        return;
      }
      let view = views.current.get(entry.kind);
      if (!view) {
        let model: Model;
        try { model = createDiorama(entry.kind); }
        catch (error) {
          entry.element.dataset.sceneError = 'true';
          entry.element.removeAttribute('data-rendered');
          if (exploring) setExplorationStatus('unavailable');
          console.warn('Scene unavailable; keeping the static preview.', error);
          return;
        }
        const scene = new Scene();
        scene.add(model.root);
        const lighting = createLighting(scene);
        const camera = new OrthographicCamera(-4, 4, 3, -3, .1, 100);
        camera.position.fromArray(model.camera.position); camera.lookAt(...model.camera.target);
        view = { model, scene, camera, lighting }; views.current.set(entry.kind, view);
      }
      view.lighting.update(nightMix);
      view.model.setNightMix(nightMix);
      entry.element.dataset.nightMix = String(nightMix);
      element.dataset.nightMix = String(nightMix);
      // Flavor changes request a frame even when motion is paused or reduced.
      if (view.model.setBobaFlavor) {
        view.model.setBobaFlavor(getBobaFlavor());
        entry.element.dataset.bobaFlavor = getBobaFlavor();
        element.dataset.bobaFlavor = getBobaFlavor();
      }
      const activity = entry.override ?? activityAt(entry.kind, entry.elapsed, motion.reduced);
      entry.element.dataset.action = activity.action;
      entry.element.dataset.running = String(!paused && !entry.override);
      element.dataset.action = activity.action;
      element.dataset.running = String(!paused && !entry.override);
      view.model.update(activity.action, activity.time);
      const aspect = rect.width / rect.height;
      // The original card camera stays untouched while the visitor explores.
      if (exploring && !explorationCamera.current) {
        explorationCamera.current = createExplorationCamera(exploration, view.camera, view.model.camera.target, invalidate);
      }
      const camera = exploring ? explorationCamera.current!.camera : view.camera;
      const half = view.model.camera.span / 2 * (exploring ? Math.max(1, 1.3 / aspect) : 1);
      camera.left = -half * aspect; camera.right = half * aspect;
      camera.top = half; camera.bottom = -half; camera.updateProjectionMatrix();
      gl.setViewport(rect.left, size.height - rect.bottom, rect.width, rect.height);
      gl.setScissor(left, size.height - bottom, right - left, bottom - top);
      gl.render(view.scene, camera);
      triangles += gl.info.render.triangles; calls += gl.info.render.calls;
      element.dataset.rendered = 'true';
      if (exploring) setExplorationStatus('ready');
      if ((!paused && !entry.override) || themeTransitioning) animate = true;
    });
    gl.setScissorTest(false);
    frames.current++; stats.current = { triangles, calls };
    if (animate) invalidate(); else last.current = 0;
  }, 1);
  return null;
}
