import { Component, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Compositor } from './Compositor';

function restoreFallbacks() { document.querySelectorAll('[data-rendered]').forEach(node => node.removeAttribute('data-rendered')); }
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { restoreFallbacks(); }
  render() { return this.state.failed ? null : this.props.children; }
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
    frameloop="demand" dpr={smallScreen ? 1 : [1, 1.5]}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false }}
    fallback={null}
    onCreated={({ gl }) => {
      gl.setClearColor(0x000000, 0);
      gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); restoreFallbacks(); });
      gl.domElement.addEventListener('webglcontextrestored', () => window.dispatchEvent(new Event('resize')));
    }}
  ><Compositor /></Canvas>;
}
export function mountScenes() {
  const layer = document.createElement('div');
  layer.className = 'scene-webgl-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  const root = createRoot(layer);
  root.render(<SceneBoundary><SceneCanvas /></SceneBoundary>);
  return () => { root.unmount(); layer.remove(); restoreFallbacks(); };
}
