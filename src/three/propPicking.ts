import { Mesh, Raycaster, Vector2, Vector3, type Camera, type Intersection, type Object3D } from 'three';
import type { Diorama } from './dioramas';
import { registerScenePropPicker } from '../runtime/sceneProps';

/** Pick the real visible meshes; project touch anchors through the render camera. */
export function createPropPicking(model: Diorama) {
  const ray = new Raycaster();
  const pointer = new Vector2();
  const world = new Vector3();
  const hits: Intersection[] = [];
  const meshes: Mesh[] = [];
  model.root.traverse(object => { if (object instanceof Mesh) meshes.push(object); });
  const projected = new Map<string, { x: number; y: number }>();
  let camera: Camera;
  let surface: HTMLElement;

  function visible(object: Object3D) {
    let current: Object3D | null = object;
    while (current) {
      if (!current.visible) return false;
      current = current.parent;
    }
    return true;
  }

  function propId(object: Object3D) {
    let current: Object3D | null = object;
    while (current) {
      if (typeof current.userData.sceneProp === 'string') return current.userData.sceneProp as string;
      current = current.parent;
    }
    return null;
  }

  function hitAt(x: number, y: number, width: number, height: number) {
    pointer.set(x / width * 2 - 1, 1 - y / height * 2);
    ray.setFromCamera(pointer, camera);
    hits.length = 0;
    ray.intersectObjects(meshes, false, hits);
    for (const hit of hits) {
      if (!visible(hit.object)) continue;
      const mesh = hit.object as Mesh;
      const mat = Array.isArray(mesh.material) ? mesh.material[hit.face?.materialIndex ?? 0] : mesh.material;
      if (!mat?.visible || mat.opacity <= .01) continue;
      const id = propId(mesh);
      // Light halos, soft shadows and noninteractive labels must not block a prop.
      if (!id && mat.transparent && (!mat.depthWrite || mat.opacity < .55)) continue;
      return id;
    }
    return null;
  }

  const pick = (clientX: number, clientY: number) => {
    const rect = surface.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const direct = hitAt(x, y, rect.width, rect.height);
    if (direct) return direct;
    // Give small props a forgiving 44px touch target without visible overlays.
    let nearest: string | null = null;
    let distance = 22;
    for (const [id, point] of projected) {
      const next = Math.hypot(x - point.x, y - point.y);
      if (next < distance) { nearest = id; distance = next; }
    }
    return nearest;
  };

  return {
    update(element: HTMLElement, nextCamera: Camera, width: number, height: number) {
      surface = element;
      camera = nextCamera;
      projected.clear();
      for (const target of model.propTargets) {
        if (!visible(target.anchor) || !target.objects.some(visible)) continue;
        target.anchor.getWorldPosition(world).project(camera);
        const x = (world.x + 1) * width / 2, y = (1 - world.y) * height / 2;
        if (world.z < -1 || world.z > 1 || x < 12 || x > width - 12 || y < 12 || y > height - 12) continue;
        // Never enlarge the hit area of a prop hidden behind Daniel or a wall.
        if (hitAt(x, y, width, height) !== target.id) continue;
        projected.set(target.id, { x, y });
      }
      element.querySelectorAll<HTMLElement>('[data-prop-marker]').forEach(marker => {
        const point = projected.get(marker.dataset.propMarker!);
        marker.style.visibility = point ? 'visible' : 'hidden';
        if (point) {
          marker.style.left = `${point.x.toFixed(2)}px`;
          marker.style.top = `${point.y.toFixed(2)}px`;
        }
      });
      registerScenePropPicker(element, pick);
    },
  };
}
