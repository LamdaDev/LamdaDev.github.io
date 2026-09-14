import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { bobaFlavors, type BobaFlavor } from '../boba';

/** Small, locally owned geometry library. No browser APIs run at module import. */
export function createProps() {
  const geometry = new Map<string, THREE.BufferGeometry>();
  const materials = new Map<string, THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const palette = { cream: '#fff7e9', ink: '#34303f', lavender: '#c9b7ef', purple: '#7554bb', peach: '#f4b494', mint: '#a6ceba', blue: '#b6c9e5', white: '#fffefa', wood: '#d6ac85' };
  function material(color: string, roughness = .73, metalness = 0) {
    const key = `${color}/${roughness}/${metalness}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness, metalness }));
    return materials.get(key)!;
  }
  function mesh(key: string, make: () => THREE.BufferGeometry, color: string, position: number[] = [0, 0, 0]) {
    if (!geometry.has(key)) geometry.set(key, make());
    const item = new THREE.Mesh(geometry.get(key), material(color));
    item.position.set(position[0], position[1], position[2]);
    return item;
  }
  function box(w: number, h: number, d: number, color: string, position: number[] = [0, 0, 0], radius = .06) {
    const r = Math.min(radius, w / 2 - .001, h / 2 - .001, d / 2 - .001);
    return mesh(`box/${w}/${h}/${d}/${r}`, () => new RoundedBoxGeometry(w, h, d, 2, Math.max(.001, r)), color, position);
  }
  function ball(r: number, color: string, position: number[] = [0, 0, 0], scale: number[] = [1, 1, 1]) {
    const item = mesh(`sphere/${r}`, () => new THREE.SphereGeometry(r, 16, 12), color, position);
    item.scale.set(scale[0], scale[1], scale[2]); return item;
  }
  function cylinder(top: number, bottom: number, height: number, color: string, position: number[] = [0, 0, 0], segments = 24) {
    return mesh(`cylinder/${top}/${bottom}/${height}/${segments}`, () => new THREE.CylinderGeometry(top, bottom, height, segments), color, position);
  }
  function torus(radius: number, tube: number, color: string, position: number[] = [0, 0, 0], arc = Math.PI * 2) {
    return mesh(`torus/${radius}/${tube}/${arc}`, () => new THREE.TorusGeometry(radius, tube, 8, 36, arc), color, position);
  }
  function rod(a: number[], b: number[], radius: number, color: string) {
    const start = new THREE.Vector3(...a as [number, number, number]);
    const end = new THREE.Vector3(...b as [number, number, number]);
    const delta = end.clone().sub(start);
    const item = cylinder(radius, radius, delta.length(), color);
    item.position.copy(start.add(end).multiplyScalar(.5));
    item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return item;
  }
  function text(lines: string | string[], width: number, height: number, color = palette.ink, background?: string, size = 52) {
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = Math.max(128, Math.round(768 * height / width));
    const context = canvas.getContext('2d')!;
    if (background) { context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.fillStyle = color; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.font = `700 ${size}px ui-monospace, Consolas, monospace`;
    const all = typeof lines === 'string' ? [lines] : lines;
    all.forEach((line, i) => context.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (all.length - 1) / 2) * size * 1.5, 720));
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: !background, side: THREE.DoubleSide, depthWrite: !!background });
    materials.set(`label-${materials.size}`, mat);
    const plane = new THREE.PlaneGeometry(width, height); geometry.set(`label-${geometry.size}`, plane);
    return new THREE.Mesh(plane, mat);
  }
  function shadow(width: number, depth: number, opacity = .09) {
    const mat = new THREE.MeshBasicMaterial({ color: '#55455f', transparent: true, opacity, depthWrite: false });
    materials.set(`shadow-${materials.size}`, mat);
    const geo = new THREE.CircleGeometry(1, 48); geometry.set(`shadow-${geometry.size}`, geo);
    const item = new THREE.Mesh(geo, mat); item.rotation.x = -Math.PI / 2; item.scale.set(width, depth, 1); item.position.y = .016;
    return item;
  }
  function star(size: number, color: string) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI / 2 + i * Math.PI / 5;
      const r = i % 2 ? size * .46 : size;
      if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    shape.closePath();
    return mesh(`star/${size}`, () => new THREE.ExtrudeGeometry(shape, { depth: .09, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2, steps: 1 }), color);
  }
  function plant(height = .9, color = palette.mint) {
    const group = new THREE.Group();
    group.add(cylinder(.22, .16, .32, palette.peach, [0, .16, 0]));
    group.add(cylinder(.225, .225, .06, palette.cream, [0, .31, 0]));
    group.add(cylinder(.19, .19, .02, '#856a55', [0, .345, 0]));
    group.add(rod([0, .32, 0], [0, height, 0], .025, '#73916b'));
    for (let i = 0; i < 6; i++) {
      const angle = i * 2.4;
      const leaf = ball(.2, color, [Math.cos(angle) * .13, .47 + i * .065, Math.sin(angle) * .13], [1, .5, 1.5]);
      leaf.rotation.z = Math.cos(angle) * .6; leaf.rotation.y = angle; group.add(leaf);
    }
    return group;
  }
  /** Reassign cached materials so a cup never recolors other props sharing them. */
  function setBobaFlavor(cup: THREE.Group, flavor: BobaFlavor) {
    const colors = bobaFlavors[flavor];
    const tea = cup.getObjectByName('boba-tea');
    const top = cup.getObjectByName('boba-top');
    if (tea instanceof THREE.Mesh) tea.material = material(colors.tea);
    if (top instanceof THREE.Mesh) top.material = material(colors.top);
  }
  /** Origin is cup bottom. Opaque tea and modeled pearls remain full. */
  function drink(kind: 'boba' | 'coke' | 'water') {
    const group = new THREE.Group();
    if (kind === 'boba') {
      group.name = 'boba-cup';
      const tea = cylinder(.16, .12, .37, bobaFlavors['milk-tea'].tea, [0, .185, 0]); tea.name = 'boba-tea';
      const lid = cylinder(.174, .174, .035, palette.cream, [0, .387, 0]); lid.name = 'boba-lid';
      const top = cylinder(.158, .158, .012, bobaFlavors['milk-tea'].top, [0, .407, 0]); top.name = 'boba-top';
      group.add(tea, lid, top);
      for (let i = 0; i < 11; i++) {
        const angle = i * 2.4;
        const pearl = ball(.025, '#493436', [Math.sin(angle) * .13, .055 + (i % 3) * .045, Math.cos(angle) * .13]);
        pearl.name = `boba-pearl-${i}`; group.add(pearl);
      }
      const straw = rod([.03, .39, 0], [.03, .61, -.16], .018, palette.purple); straw.name = 'boba-straw'; group.add(straw);
    } else if (kind === 'coke') {
      group.add(cylinder(.115, .115, .35, '#25232e', [0, .175, 0]));
      group.add(cylinder(.105, .105, .025, '#c7c4c1', [0, .36, 0]));
      const tab = torus(.025, .008, palette.ink, [0, .375, 0]); tab.rotation.x = Math.PI / 2; group.add(tab);
      const label = text(['Coke', 'ZERO'], .18, .2, '#f5786f', undefined, 150); label.position.set(0, .18, .117); group.add(label);
    } else {
      group.add(cylinder(.11, .105, .35, '#b5d4de', [0, .175, 0]));
      group.add(cylinder(.065, .11, .09, '#b5d4de', [0, .395, 0]));
      group.add(cylinder(.065, .065, .065, palette.purple, [0, .467, 0]));
      group.add(cylinder(.114, .114, .12, palette.cream, [0, .2, 0]));
    }
    return group;
  }
  function dispose() {
    geometry.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
  }
  return { palette, box, ball, cylinder, torus, rod, text, shadow, star, plant, drink, setBobaFlavor, dispose };
}
