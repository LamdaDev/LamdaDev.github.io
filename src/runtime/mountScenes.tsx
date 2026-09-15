import { Component, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Compositor } from './Compositor';
import { getExploration, setRendererStatus, subscribeExploration } from './explorer';

function restoreFallbacks() { document.querySelectorAll('[data-rendered]').forEach(node => node.removeAttribute('data-rendered')); }
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { restoreFallbacks(); setRendererStatus('unavailable'); }
  render() { return this.state.failed ? null : this.props.children; }
}
function Unavailable() {
  useEffect(() => { setRendererStatus('unavailable'); }, []);
  return null;
}
function SceneCanvas() {
  const [smallScreen, setSmallScreen] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    const update = () => setSmallScreen(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <Canvas
    style={{ pointerEvents: 'none' }}
    frameloop="demand" dpr={smallScreen ? 1 : [1, 1.5]}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false }}
    fallback={<Unavailable />}
    onCreated={({ gl }) => {
      gl.setClearColor(0x000000, 0);
      setRendererStatus('ready');
      gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); restoreFallbacks(); setRendererStatus('unavailable'); });
      gl.domElement.addEventListener('webglcontextrestored', () => { setRendererStatus('ready'); window.dispatchEvent(new Event('resize')); });
    }}
  ><Compositor /></Canvas>;
}
export function mountScenes() {
  const layer = document.createElement('div');
  layer.className = 'scene-webgl-layer';
  layer.setAttribute('aria-hidden', 'true');
  // A modal is in the browser's top layer. Move the renderer's outer DOM host
  // into that layer without remounting Canvas, creating a context, or resetting models.
  const syncHost = () => {
    restoreFallbacks();
    (getExploration()?.host ?? document.body).append(layer);
    window.dispatchEvent(new Event('resize'));
  };
  syncHost();
  const unsubscribe = subscribeExploration(syncHost);
  const root = createRoot(layer);
  root.render(<SceneBoundary><SceneCanvas /></SceneBoundary>);
  return () => { unsubscribe(); root.unmount(); layer.remove(); restoreFallbacks(); setRendererStatus('unavailable'); };
}
