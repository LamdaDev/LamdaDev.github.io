import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, HemisphereLight, OrthographicCamera, Scene } from 'three';
import { createDiorama } from '../three/dioramas';
import { entries, subscribeRegistry } from './registry';
import { getMotion, subscribeMotion } from './motion';
import { activityAt, advanceElapsed, type Action, type SceneKind } from './sequence';

type Model = ReturnType<typeof createDiorama>;
type View = { model: Model; scene: Scene; camera: OrthographicCamera };
declare global {
  interface Window {
    __portfolio: {
      snapshot: () => { kind: SceneKind; elapsed: number; visible: boolean; action: string; rendered: boolean }[];
      pose: (kind: SceneKind, action: Action, time?: number) => void;
      resume: () => void;
      stats: () => { frames: number; contexts: number; triangles: number; calls: number };
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

  useEffect(() => {
    const wake = () => { last.current = 0; invalidate(); };
    const observer = new ResizeObserver(wake);
    observer.observe(document.body);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    const unsubMotion = subscribeMotion(wake);
    const unsubRegistry = subscribeRegistry(wake);
    window.__portfolio = {
      snapshot: () => [...entries.values()].map(entry => ({ kind: entry.kind, elapsed: entry.elapsed, visible: entry.visible, action: entry.element.dataset.action ?? '', rendered: entry.element.dataset.rendered === 'true' })),
      pose: (kind, action, time = 0) => { const entry = entries.get(kind); if (entry) entry.override = { action, time }; wake(); },
      resume: () => { entries.forEach(entry => { entry.override = undefined; }); wake(); },
      stats: () => ({ frames: frames.current, contexts: document.querySelectorAll('canvas[data-engine]').length, ...stats.current }),
    };
    wake();
    return () => {
      observer.disconnect(); window.removeEventListener('scroll', wake); window.removeEventListener('resize', wake);
      unsubMotion(); unsubRegistry();
      views.current.forEach(view => view.model.dispose()); views.current.clear();
    };
  }, [invalidate]);

  useFrame(() => {
    if (gl.getContext().isContextLost()) {
      entries.forEach(entry => entry.element.removeAttribute('data-rendered'));
      last.current = 0;
      return;
    }
    const now = performance.now() / 1000;
    const delta = last.current ? now - last.current : 0;
    last.current = now;
    const motion = getMotion();
    const paused = motion.paused || motion.reduced || motion.hidden;
    gl.setScissorTest(false); gl.setViewport(0, 0, size.width, size.height); gl.clear(true, true, true);
    gl.setScissorTest(true);
    let animate = false;
    let triangles = 0;
    let calls = 0;
    entries.forEach(entry => {
      const rect = entry.element.getBoundingClientRect();
      entry.visible = rect.bottom > 0 && rect.top < size.height && rect.right > 0 && rect.left < size.width && rect.width > 0;
      entry.element.dataset.visible = String(entry.visible);
      entry.element.dataset.running = String(entry.visible && !paused && !entry.override);
      entry.elapsed = advanceElapsed(entry.elapsed, delta, entry.visible, paused || !!entry.override);
      if (!entry.visible || motion.hidden || entry.element.dataset.sceneError === 'true') return;
      let view = views.current.get(entry.kind);
      if (!view) {
        let model: Model;
        try { model = createDiorama(entry.kind); }
        catch (error) {
          entry.element.dataset.sceneError = 'true';
          entry.element.removeAttribute('data-rendered');
          console.warn('Scene unavailable; keeping the static preview.', error);
          return;
        }
        const scene = new Scene();
        scene.add(model.root, new AmbientLight('#fff9f0', .8), new HemisphereLight('#fff9ef', '#a394ad', .8));
        const key = new DirectionalLight('#fff4e4', 2.5); key.position.set(-4, 8, 6); scene.add(key);
        const fill = new DirectionalLight('#dcd6ff', .8); fill.position.set(5, 4, -3); scene.add(fill);
        const camera = new OrthographicCamera(-4, 4, 3, -3, .1, 100);
        camera.position.fromArray(model.camera.position); camera.lookAt(...model.camera.target);
        view = { model, scene, camera }; views.current.set(entry.kind, view);
      }
      const activity = entry.override ?? activityAt(entry.kind, entry.elapsed, motion.reduced);
      entry.element.dataset.action = activity.action;
      entry.element.dataset.running = String(!paused && !entry.override);
      view.model.update(activity.action, activity.time);
      const half = view.model.camera.span / 2;
      const aspect = rect.width / rect.height;
      view.camera.left = -half * aspect; view.camera.right = half * aspect;
      view.camera.top = half; view.camera.bottom = -half; view.camera.updateProjectionMatrix();
      gl.setViewport(rect.left, size.height - rect.bottom, rect.width, rect.height);
      gl.setScissor(Math.max(0, rect.left), Math.max(0, size.height - rect.bottom), Math.min(rect.right, size.width) - Math.max(0, rect.left), Math.min(rect.bottom, size.height) - Math.max(0, rect.top));
      gl.render(view.scene, view.camera);
      triangles += gl.info.render.triangles; calls += gl.info.render.calls;
      entry.element.dataset.rendered = 'true';
      if (!paused && !entry.override) animate = true;
    });
    gl.setScissorTest(false);
    frames.current++; stats.current = { triangles, calls };
    if (animate) invalidate(); else last.current = 0;
  }, 1);
  return null;
}
