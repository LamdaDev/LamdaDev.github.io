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
    return { samples: 151, worstGripError, rackedBarSecured, closedEyes, openEyes, articulatedWave, stableHead };
  });
  assert.ok(result.worstGripError < .0001, 'Both hands must stay on the bar throughout a full lifting activity');
  assert.ok(result.rackedBarSecured, 'The resting bar must sit on the rack');
  assert.ok(result.closedEyes && !result.openEyes, 'Napping must close both eyes');
  assert.ok(result.articulatedWave && result.stableHead, 'The greeting must move its hand independently of the head');
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
