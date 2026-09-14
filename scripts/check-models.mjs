import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('test-results/models', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/scripts/scene-studio.html');
  await page.locator('canvas').waitFor();
  const result = await page.evaluate(async () => {
    const { createDiorama } = await import('/src/three/dioramas.ts');
    const gym = createDiorama('experience');
    const bars = gym.root.children.filter(node => node.name === 'weighted-barbell');
    const left = gym.root.getObjectByName('Left wrist attachment');
    const right = gym.root.getObjectByName('Right wrist attachment');
    let worstGripError = 0;
    for (let frame = 0; frame <= 150; frame++) {
      gym.update('bench', frame / 30);
      gym.root.updateWorldMatrix(true, true);
      const bar = bars.find(node => node.visible);
      const center = bar.getWorldPosition(bar.position.clone());
      const axis = center.clone().set(1, 0, 0).applyQuaternion(bar.getWorldQuaternion(bar.quaternion.clone()));
      for (const hand of [left, right]) {
        const offset = hand.getWorldPosition(hand.position.clone()).sub(center);
        const distance = offset.clone().addScaledVector(axis, -offset.dot(axis)).length();
        worstGripError = Math.max(worstGripError, distance);
      }
    }
    gym.update('rest', 1);
    const rackedBarSecured = !bars[0].visible && bars[1].visible && Math.abs(bars[1].position.y - 2.235) < .001;
    gym.dispose();

    const desk = createDiorama('projects');
    desk.update('nap', 1);
    const closedEyes = desk.root.getObjectByName('Eyes — closed').visible;
    const openEyes = desk.root.getObjectByName('Eyes — open').visible;
    desk.dispose();

    const hero = createDiorama('hero');
    const wrist = hero.root.getObjectByName('Right wrist attachment');
    const head = hero.root.getObjectByName('Head — expression and neck pivot');
    hero.update('wave', 0);
    const firstWrist = wrist.position.clone();
    const firstHead = head.position.clone();
    hero.update('wave', .2);
    const articulatedWave = wrist.position.distanceTo(firstWrist) > .03;
    const stableHead = head.position.distanceTo(firstHead) < .001;
    hero.dispose();

    const boba = createDiorama('about');
    const cups = ['boba-served', 'boba-in-hand'].map(name => boba.root.getObjectByName(name));
    const teaParts = cups.flatMap(cup => ['boba-tea', 'boba-top'].map(name => cup.getObjectByName(name)));
    const originalMeshes = [];
    boba.root.traverse(node => {
      if (node.isMesh) originalMeshes.push({ node, geometry: node.geometry, material: node.material });
    });
    const pose = () => {
      const values = [];
      boba.root.traverse(node => values.push([node.id, ...node.position.toArray(), ...node.quaternion.toArray(), ...node.scale.toArray(), node.visible]));
      return JSON.stringify(values);
    };
    const cachedTeaMaterials = new Map([['milk-tea', teaParts.map(part => part.material)]]);
    const teaMaterials = new Set(teaParts.map(part => part.material));
    const flavorColors = {};
    let geometryStable = true;
    let nonTeaMaterialsUnchanged = true;
    let selectionPreservesPose = true;
    let flavorMaterialsReused = true;
    let repeatedSelectionIsIdempotent = true;
    boba.update('order', 1.4);
    for (const flavor of ['matcha', 'taro', 'milk-tea', 'matcha', 'taro']) {
      const beforePose = pose();
      boba.setBobaFlavor(flavor);
      selectionPreservesPose &&= beforePose === pose();
      geometryStable &&= originalMeshes.every(({ node, geometry }) => node.geometry === geometry);
      nonTeaMaterialsUnchanged &&= originalMeshes.every(({ node, material }) => teaParts.includes(node) || node.material === material);
      const assigned = teaParts.map(part => part.material);
      if (cachedTeaMaterials.has(flavor)) {
        flavorMaterialsReused &&= assigned.every((material, index) => material === cachedTeaMaterials.get(flavor)[index]);
      } else cachedTeaMaterials.set(flavor, assigned);
      assigned.forEach(material => teaMaterials.add(material));
      boba.setBobaFlavor(flavor);
      repeatedSelectionIsIdempotent &&= assigned.every((material, index) => material === teaParts[index].material) && beforePose === pose();
      flavorColors[flavor] = cups.map(cup => ({
        cup: cup.name,
        tea: `#${cup.getObjectByName('boba-tea').material.color.getHexString()}`,
        top: `#${cup.getObjectByName('boba-top').material.color.getHexString()}`,
      }));
    }
    const orderCupVisible = cups[0].visible && !cups[1].visible;
    boba.update('sip', 1);
    const sipCupVisible = !cups[0].visible && cups[1].visible;
    const handoffKeepsFlavor = teaParts.every((part, index) => part.material === cachedTeaMaterials.get('taro')[index]);
    const disposalCounts = new Map();
    teaMaterials.forEach(material => {
      disposalCounts.set(material, 0);
      material.addEventListener('dispose', () => disposalCounts.set(material, disposalCounts.get(material) + 1));
    });
    boba.dispose();
    const flavorMaterialsDisposedOnce = [...disposalCounts.values()].every(count => count === 1);
    return {
      samples: 151, worstGripError, rackedBarSecured, closedEyes, openEyes, articulatedWave, stableHead,
      boba: { flavorColors, geometryStable, nonTeaMaterialsUnchanged, selectionPreservesPose,
        flavorMaterialsReused, repeatedSelectionIsIdempotent, orderCupVisible, sipCupVisible,
        handoffKeepsFlavor, flavorMaterialsDisposedOnce, cachedTeaMaterialCount: teaMaterials.size },
    };
  });
  assert.ok(result.worstGripError < .0001, 'Both hands must stay on the bar throughout a full lifting activity');
  assert.ok(result.rackedBarSecured, 'The resting bar must sit on the rack');
  assert.ok(result.closedEyes && !result.openEyes, 'Napping must close both eyes');
  assert.ok(result.articulatedWave && result.stableHead, 'The greeting must move its hand independently of the head');
  const expectedFlavors = {
    'milk-tea': { tea: '#d7af88', top: '#ead0a8' },
    matcha: { tea: '#82a95b', top: '#b6cf8f' },
    taro: { tea: '#b28ad0', top: '#d6bbea' },
  };
  for (const [flavor, expected] of Object.entries(expectedFlavors)) {
    assert.deepEqual(result.boba.flavorColors[flavor], ['boba-served', 'boba-in-hand'].map(cup => ({ cup, ...expected })), `${flavor} must match on both sides of the handoff`);
  }
  assert.ok(result.boba.geometryStable, 'Flavor selection must reuse existing cup geometry');
  assert.ok(result.boba.nonTeaMaterialsUnchanged, 'Shelf cups, lids, straws, pearls, character and furniture must keep their materials');
  assert.ok(result.boba.selectionPreservesPose, 'Flavor selection must preserve the current pose and cup visibility');
  assert.ok(result.boba.flavorMaterialsReused && result.boba.repeatedSelectionIsIdempotent, 'Changing back or reselecting a flavor must reuse its cached materials');
  assert.ok(result.boba.orderCupVisible && result.boba.sipCupVisible && result.boba.handoffKeepsFlavor, 'The order-to-sip handoff must retain the selected tea');
  assert.equal(result.boba.cachedTeaMaterialCount, 6, 'Only two tea materials per flavor are needed for both cups');
  assert.ok(result.boba.flavorMaterialsDisposedOnce, 'Every cached tea material must be disposed exactly once');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export pose as GLB' }).click();
  const download = await downloading;
  await download.saveAs('test-results/models/hero.glb');
  const glb = await readFile('test-results/models/hero.glb');
  assert.equal(glb.toString('ascii', 0, 4), 'glTF');
  assert.equal(glb.readUInt32LE(4), 2);
  assert.equal(glb.readUInt32LE(8), glb.length);
  const report = { ...result, glbBytes: glb.length, exportedFilename: download.suggestedFilename() };
  await writeFile('test-results/models/results.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
