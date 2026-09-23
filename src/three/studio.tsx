import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createDiorama } from './dioramas';
import type { CharacterAction } from './character';
import { GREETING_PREVIEW_TIME, sceneKinds, type SceneKind } from '../runtime/sequence';

const actions: Record<SceneKind, CharacterAction[]> = { hero: ['wave'], about: ['order','sip'], skills: ['game'], projects: ['code','drink','nap'], experience: ['bench','rest'] };
function Model({ kind, action, time, play }: { kind: SceneKind; action: CharacterAction; time: number; play: boolean }) {
  const model = useMemo(() => createDiorama(kind), [kind]);
  const clock = useRef(time);
  const { camera } = useThree();
  useEffect(() => { camera.position.fromArray(model.camera.position); camera.lookAt(...model.camera.target); }, [model, camera]);
  useEffect(() => { clock.current = time; }, [time, action]);
  useEffect(() => () => model.dispose(), [model]);
  useEffect(() => {
    const exportModel = async () => {
      const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
      const buffer = await new GLTFExporter().parseAsync(model.root, { binary: true });
      const url = URL.createObjectURL(new Blob([buffer as ArrayBuffer], { type: 'model/gltf-binary' }));
      const link = document.createElement('a'); link.href = url; link.download = `daniel-${kind}-${action}.glb`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const listener = () => { void exportModel(); };
    window.addEventListener('export-model', listener);
    return () => window.removeEventListener('export-model', listener);
  }, [model, kind, action]);
  useFrame((_, delta) => { if (play) clock.current += Math.min(delta, .1); model.update(action, clock.current); });
  return <><primitive object={model.root}/><OrbitControls makeDefault target={model.camera.target}/></>;
}
function Studio() {
  const [kind, setKind] = useState<SceneKind>('hero');
  const [action, setAction] = useState<CharacterAction>('wave');
  const [time, setTime] = useState(GREETING_PREVIEW_TIME);
  const [play, setPlay] = useState(false);
  return <><header><h1>Daniel · scene studio</h1><select aria-label="Scene" value={kind} onChange={event => { const k = event.target.value as SceneKind; setKind(k); setAction(actions[k][0]); setTime(k === 'hero' ? GREETING_PREVIEW_TIME : .8); }}>{sceneKinds.map(k => <option key={k}>{k}</option>)}</select><select aria-label="Activity" value={action} onChange={event => setAction(event.target.value as CharacterAction)}>{actions[kind].map(a => <option key={a}>{a}</option>)}</select><label>Time <input aria-label="Pose time" type="range" min="0" max="6" step=".01" value={time} onChange={event => { setPlay(false); setTime(Number(event.target.value)); }}/>{time.toFixed(2)}s</label><button onClick={() => setPlay(!play)}>{play ? 'Pause' : 'Play'}</button><button onClick={() => window.dispatchEvent(new Event('export-model'))}>Export pose as GLB</button><small>Drag to orbit · scroll to zoom · animations live in TypeScript</small></header><div id="stage"><Canvas orthographic camera={{ zoom: 125, near: .1, far: 100 }} dpr={[1,1.5]} gl={{ antialias: true, preserveDrawingBuffer: true }}><ambientLight color="#fff9f0" intensity={.8}/><hemisphereLight args={['#fff9ef','#a394ad',.8]}/><directionalLight position={[-4,8,6]} color="#fff4e4" intensity={2.5}/><directionalLight position={[5,4,-3]} color="#dcd6ff" intensity={.8}/><Model kind={kind} action={action} time={time} play={play}/></Canvas></div></>;
}
createRoot(document.getElementById('studio')!).render(<Studio/>);
