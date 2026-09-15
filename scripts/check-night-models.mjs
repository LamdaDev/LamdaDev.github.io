import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

// Check model transitions independently of the UI, animation clocks, and renderer.
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage();
  await page.goto(`${process.env.DEV_URL || 'http://127.0.0.1:5173'}/scripts/scene-studio.html`);
  const results = await page.evaluate(async () => {
    const { createDiorama } = await import('/src/three/dioramas.ts');
    const actions = { hero: 'wave', about: 'order', skills: 'game', projects: 'nap', experience: 'bench' };
    const all = [];
    for (const [kind, action] of Object.entries(actions)) {
      const model = createDiorama(kind);
      model.update(action, 1.25);
      model.setBobaFlavor?.('taro');
      const meshes = [];
      const resources = new Set();
      const nightMaterials = new Set();
      model.root.traverse(object => {
        if (!object.isMesh) return;
        meshes.push({ object, geometry: object.geometry, material: object.material });
        resources.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          resources.add(material);
          if (material.name.startsWith('night-')) nightMaterials.add(material);
          for (const property of Object.values(material)) if (property?.isTexture) resources.add(property);
        }
      });
      const pose = () => {
        const states = [];
        model.root.traverse(object => states.push([object.id, ...object.position.toArray(), ...object.quaternion.toArray(), ...object.scale.toArray(), object.visible]));
        return JSON.stringify(states);
      };
      const materialState = material => JSON.stringify({ color: material.color?.getHexString(), emissive: material.emissive?.getHexString(), emission: material.emissiveIntensity, opacity: material.opacity });
      const baselinePose = pose();
      const ordinaryMaterials = new Map(meshes.filter(({ material }) => !nightMaterials.has(material)).map(({ material }) => [material, materialState(material)]));
      const samples = [];
      let posePreserved = true;
      let resourcesReused = true;
      let ordinaryColorsPreserved = true;
      const nodeCount = JSON.parse(baselinePose).length;
      for (const mix of [0, .25, .5, .75, 1, -3, 4, 0, 1, 0]) {
        model.setNightMix(mix);
        posePreserved &&= pose() === baselinePose;
        resourcesReused &&= meshes.every(({ object, geometry, material }) => object.geometry === geometry && object.material === material);
        ordinaryColorsPreserved &&= [...ordinaryMaterials].every(([material, initial]) => materialState(material) === initial);
        const lights = {};
        model.root.traverse(object => { if (object.isPointLight) lights[object.name] = object.intensity; });
        samples.push({ mix, lights, screenEmission: model.root.getObjectByName('night-monitor-screen')?.material.emissiveIntensity,
          bulbEmission: model.root.getObjectByName('night-desk-bulb')?.material.emissiveIntensity,
          monitorHalo: model.root.getObjectByName('night-monitor-halo')?.material.opacity,
          deskHalo: model.root.getObjectByName('night-desk-halo')?.material.opacity });
      }
      const disposalCounts = new Map([...resources].map(resource => [resource, 0]));
      resources.forEach(resource => resource.addEventListener('dispose', () => disposalCounts.set(resource, disposalCounts.get(resource) + 1)));
      model.dispose();
      all.push({ kind, nodeCount, meshCount: meshes.length, resourceCount: resources.size, posePreserved, resourcesReused, ordinaryColorsPreserved,
        resourcesDisposedOnce: [...disposalCounts.values()].every(count => count === 1), samples });
    }
    return all;
  });
  for (const result of results) {
    assert.ok(result.posePreserved, `${result.kind}: theme changes must preserve the entire pose and visibility state`);
    assert.ok(result.resourcesReused, `${result.kind}: theme changes must reuse materials and geometry`);
    assert.ok(result.ordinaryColorsPreserved, `${result.kind}: character, furniture, and selected taro must keep their materials`);
    assert.ok(result.resourcesDisposedOnce, `${result.kind}: every attached geometry, material, and texture must be disposed exactly once`);
    for (const sample of result.samples) {
      const mix = Math.min(1, Math.max(0, sample.mix));
      if (result.kind === 'skills' || result.kind === 'projects') {
        assert.deepEqual(sample.lights, { 'night-monitor-light': .85 * mix, 'night-desk-light': 1.25 * mix });
        assert.equal(sample.screenEmission, .28 * mix);
        assert.equal(sample.bulbEmission, 1.3 * mix);
        assert.equal(sample.monitorHalo, .14 * mix);
        assert.equal(sample.deskHalo, .18 * mix);
      } else assert.deepEqual(sample.lights, {});
    }
  }
  console.log(JSON.stringify({ status: 'passed', models: results }, null, 2));
} finally {
  await browser.close();
}
