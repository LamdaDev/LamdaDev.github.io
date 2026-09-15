import { OrthographicCamera } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Exploration, ExplorationCommand } from './explorer';

/** A separate camera, attached to the dialog's interactive surface, shares the existing model. */
export function createExplorationCamera(
  exploration: Exploration,
  original: OrthographicCamera,
  target: [number, number, number],
  invalidate: () => void,
) {
  const camera = original.clone();
  const controls = new OrbitControls(camera, exploration.element);
  controls.target.fromArray(target);
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.minPolarAngle = .15;
  controls.maxPolarAngle = Math.PI / 2 - .03;
  controls.minZoom = .65;
  controls.maxZoom = 2.2;
  controls.rotateSpeed = .65;
  controls.zoomSpeed = .7;
  controls.cursorStyle = 'grab';
  controls.update();
  controls.saveState();
  controls.addEventListener('change', invalidate);
  return {
    exploration,
    camera,
    command(command: ExplorationCommand) {
      const step = Math.PI / 12;
      switch (command) {
        case 'left': controls.rotateLeft(step); break;
        case 'right': controls.rotateLeft(-step); break;
        case 'up': controls.rotateUp(step); break;
        case 'down': controls.rotateUp(-step); break;
        case 'zoom-in': controls.dollyIn(1 / 1.15); break;
        case 'zoom-out': controls.dollyOut(1 / 1.15); break;
        case 'reset': controls.reset(); break;
      }
    },
    snapshot: () => ({ kind: exploration.kind, azimuth: controls.getAzimuthalAngle(), polar: controls.getPolarAngle(), zoom: camera.zoom }),
    dispose() {
      controls.removeEventListener('change', invalidate);
      controls.dispose();
    },
  };
}
