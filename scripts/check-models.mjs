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
    const character = hero.root.getObjectByName('Daniel');
    const wrist = hero.root.getObjectByName('Right wrist attachment');
    const restingWrist = hero.root.getObjectByName('Left wrist attachment');
    const head = hero.root.getObjectByName('Head — expression and neck pivot');
    const upperBody = hero.root.getObjectByName('Upper body greeting sway');
    const joints = [], feet = [], upperArms = [], forearms = [];
    character.traverse(node => {
      joints.push(node);
      if (node.name === 'Cream sneaker') feet.push(node);
      if (node.name === 'Upper arm') upperArms.push(node);
      if (node.name === 'Forearm') forearms.push(node);
    });
    const worldPosition = node => node.getWorldPosition(node.position.clone());
    const worldRotation = node => node.getWorldQuaternion(node.quaternion.clone());
    const capture = () => joints.map(node => ({ position: worldPosition(node), rotation: worldRotation(node) }));
    const cameraBack = wrist.position.clone().set(...hero.camera.position).sub(wrist.position.clone().set(...hero.camera.target));
    const cameraRight = cameraBack.clone().set(cameraBack.z, 0, -cameraBack.x).normalize();
    const cameraUp = cameraBack.clone().cross(cameraRight).normalize();
    const glassesFrames = joints.filter(node => node.name === 'Rounded rectangular glasses frame');
    function screenXBounds(objects) {
      let minimum = Infinity, maximum = -Infinity;
      for (const object of objects) object.traverse(node => {
        if (!node.isMesh || !node.visible) return;
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        const { min, max } = node.geometry.boundingBox;
        for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
          const projected = node.position.clone().set(x, y, z).applyMatrix4(node.matrixWorld).dot(cameraRight);
          minimum = Math.min(minimum, projected); maximum = Math.max(maximum, projected);
        }
      });
      return { minimum, maximum };
    }
    const wave = {
      samples: 0, finiteTransforms: true, maximumStep: 0, maximumRotationStep: 0,
      maximumStepAt: null, maximumRotationStepAt: null,
      maximumHeadMovement: 0, maximumHeadTurn: 0, relativeWristMovement: 0,
      maximumFootMovement: 0, maximumFootTurn: 0, minimumReach: Infinity, maximumReach: 0,
      minimumSegmentLength: Infinity, maximumSegmentLength: 0, maximumElbowDeviation: 0, maximumJointGap: 0,
      minimumRestingWristHeight: Infinity, maximumRestingWristHeight: 0,
      minimumWavingHandForward: Infinity, maximumWavingHandForward: -Infinity,
      middleLiftForward: 0, middleLiftSideways: 0, minimumRaisedHandHeight: Infinity,
      minimumRaisedHandSideways: Infinity, maximumRaisedHandSideways: -Infinity,
      minimumRaisedHandScreenSideways: Infinity, maximumRaisedHandScreenSideways: -Infinity,
      minimumRaisedFingerUp: Infinity, maximumFingerScreenTilt: 0, minimumGlassesScreenClearance: Infinity,
      settlingPositionDrift: 0, settlingRotationDrift: 0, wristWaveAfterSettling: 0,
      restingFingersDown: true, loopPositionError: 0, loopRotationError: 0,
      feetCount: feet.length, armsCount: upperArms.length, glassesFrameCount: glassesFrames.length,
    };
    hero.update('wave', 0); hero.root.updateWorldMatrix(true, true);
    const firstPose = capture();
    const firstHead = worldPosition(head), firstHeadRotation = worldRotation(head);
    const firstRelativeWrist = head.worldToLocal(worldPosition(wrist));
    const firstFeet = feet.map(node => ({ position: worldPosition(node), rotation: worldRotation(node) }));
    let previous = firstPose;
    let settledWristPosition, settledWristRotation;
    // Sample the complete greeting and continue through the wrap. This catches
    // snapping at phase boundaries without reproducing the animation's easing.
    for (let frame = 0; frame <= 732; frame++) {
      hero.update('wave', frame / 120); hero.root.updateWorldMatrix(true, true);
      const pose = capture();
      wave.samples++;
      for (const [index, node] of joints.entries()) {
        wave.finiteTransforms &&= [...node.matrixWorld.elements, ...node.scale.toArray()].every(Number.isFinite);
        const step = pose[index].position.distanceTo(previous[index].position);
        const rotationStep = pose[index].rotation.angleTo(previous[index].rotation);
        if (step > wave.maximumStep) { wave.maximumStep = step; wave.maximumStepAt = { node: node.name, time: frame / 120 }; }
        if (rotationStep > wave.maximumRotationStep) { wave.maximumRotationStep = rotationStep; wave.maximumRotationStepAt = { node: node.name, time: frame / 120 }; }
        if (frame === 720) {
          wave.loopPositionError = Math.max(wave.loopPositionError, pose[index].position.distanceTo(firstPose[index].position));
          wave.loopRotationError = Math.max(wave.loopRotationError, pose[index].rotation.angleTo(firstPose[index].rotation));
        }
      }
      wave.maximumHeadMovement = Math.max(wave.maximumHeadMovement, worldPosition(head).distanceTo(firstHead));
      wave.maximumHeadTurn = Math.max(wave.maximumHeadTurn, worldRotation(head).angleTo(firstHeadRotation));
      wave.relativeWristMovement = Math.max(wave.relativeWristMovement, head.worldToLocal(worldPosition(wrist)).distanceTo(firstRelativeWrist));
      feet.forEach((foot, index) => {
        wave.maximumFootMovement = Math.max(wave.maximumFootMovement, worldPosition(foot).distanceTo(firstFeet[index].position));
        wave.maximumFootTurn = Math.max(wave.maximumFootTurn, worldRotation(foot).angleTo(firstFeet[index].rotation));
      });
      [restingWrist, wrist].forEach((hand, index) => {
        // Cylinder ends describe the real shoulder, independent of rig parents.
        const shoulder = upperArms[index].localToWorld(hand.position.clone().set(0, -.5, 0));
        const elbow = upperArms[index].localToWorld(hand.position.clone().set(0, .5, 0));
        const forearmStart = forearms[index].localToWorld(hand.position.clone().set(0, -.5, 0));
        const forearmEnd = forearms[index].localToWorld(hand.position.clone().set(0, .5, 0));
        const handPosition = worldPosition(hand);
        const armAxis = handPosition.clone().sub(shoulder);
        const reach = armAxis.length();
        wave.minimumReach = Math.min(wave.minimumReach, reach);
        wave.maximumReach = Math.max(wave.maximumReach, reach);
        armAxis.normalize();
        const elbowOffset = elbow.clone().sub(shoulder);
        wave.maximumElbowDeviation = Math.max(wave.maximumElbowDeviation, elbowOffset.clone().addScaledVector(armAxis, -elbowOffset.dot(armAxis)).length());
        wave.maximumJointGap = Math.max(wave.maximumJointGap, elbow.distanceTo(forearmStart), forearmEnd.distanceTo(handPosition));
      });
      wave.minimumSegmentLength = Math.min(wave.minimumSegmentLength, ...upperArms.map(node => node.scale.y), ...forearms.map(node => node.scale.y));
      wave.maximumSegmentLength = Math.max(wave.maximumSegmentLength, ...upperArms.map(node => node.scale.y), ...forearms.map(node => node.scale.y));
      const restingPosition = character.worldToLocal(worldPosition(restingWrist));
      wave.minimumRestingWristHeight = Math.min(wave.minimumRestingWristHeight, restingPosition.y);
      wave.maximumRestingWristHeight = Math.max(wave.maximumRestingWristHeight, restingPosition.y);
      const wavingPosition = character.worldToLocal(worldPosition(wrist));
      wave.minimumWavingHandForward = Math.min(wave.minimumWavingHandForward, wavingPosition.z);
      wave.maximumWavingHandForward = Math.max(wave.maximumWavingHandForward, wavingPosition.z);
      const shoulderPosition = upperArms[1].localToWorld(wrist.position.clone().set(0, -.5, 0));
      const handScreenSideways = worldPosition(wrist).sub(shoulderPosition).dot(cameraRight);
      const armOffset = upperBody.worldToLocal(worldPosition(wrist)).sub(upperBody.worldToLocal(shoulderPosition));
      if (frame === 102) { // Halfway through the .25–1.45 second lift.
        wave.middleLiftForward = armOffset.z;
        wave.middleLiftSideways = armOffset.x;
      }
      if (frame === 174) { // The hand has reached its raised pose at 1.45s.
        settledWristPosition = wrist.position.clone();
        settledWristRotation = wrist.quaternion.clone();
      }
      if (frame >= 174 && frame <= 198) {
        wave.settlingPositionDrift = Math.max(wave.settlingPositionDrift, wrist.position.distanceTo(settledWristPosition));
        wave.settlingRotationDrift = Math.max(wave.settlingRotationDrift, wrist.quaternion.angleTo(settledWristRotation));
      }
      if (frame >= 234 && frame <= 384) { // Observe the full waves, after settling.
        wave.minimumRaisedHandHeight = Math.min(wave.minimumRaisedHandHeight, armOffset.y);
        wave.minimumRaisedHandSideways = Math.min(wave.minimumRaisedHandSideways, armOffset.x);
        wave.maximumRaisedHandSideways = Math.max(wave.maximumRaisedHandSideways, armOffset.x);
        wave.minimumRaisedHandScreenSideways = Math.min(wave.minimumRaisedHandScreenSideways, handScreenSideways);
        wave.maximumRaisedHandScreenSideways = Math.max(wave.maximumRaisedHandScreenSideways, handScreenSideways);
        const fingerAxis = wrist.localToWorld(wrist.position.clone().set(0, 1, 0)).sub(worldPosition(wrist)).normalize();
        wave.minimumRaisedFingerUp = Math.min(wave.minimumRaisedFingerUp, fingerAxis.y);
        wave.maximumFingerScreenTilt = Math.max(wave.maximumFingerScreenTilt, Math.atan2(Math.abs(fingerAxis.dot(cameraRight)), fingerAxis.dot(cameraUp)));
        wave.minimumGlassesScreenClearance = Math.min(wave.minimumGlassesScreenClearance, screenXBounds([wrist]).minimum - screenXBounds(glassesFrames).maximum);
        wave.wristWaveAfterSettling = Math.max(wave.wristWaveAfterSettling, wrist.quaternion.angleTo(settledWristRotation));
      }
      const fingersDirection = restingWrist.localToWorld(restingWrist.position.clone().set(0, 1, 0)).sub(worldPosition(restingWrist)).normalize();
      wave.restingFingersDown &&= fingersDirection.y < -.5;
      previous = pose;
    }
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
      samples: 151, worstGripError, rackedBarSecured, closedEyes, openEyes, wave,
      boba: { flavorColors, geometryStable, nonTeaMaterialsUnchanged, selectionPreservesPose,
        flavorMaterialsReused, repeatedSelectionIsIdempotent, orderCupVisible, sipCupVisible,
        handoffKeepsFlavor, flavorMaterialsDisposedOnce, cachedTeaMaterialCount: teaMaterials.size },
    };
  });
  assert.ok(result.worstGripError < .0001, 'Both hands must stay on the bar throughout a full lifting activity');
  assert.ok(result.rackedBarSecured, 'The resting bar must sit on the rack');
  assert.ok(result.closedEyes && !result.openEyes, 'Napping must close both eyes');
  assert.equal(result.wave.feetCount, 2, 'Both feet must be included in the greeting check');
  assert.equal(result.wave.armsCount, 2, 'Both articulated arms must be included in the greeting check');
  assert.equal(result.wave.glassesFrameCount, 2, 'Both front glasses frames must be included in the hand-clearance check');
  assert.ok(result.wave.finiteTransforms, 'All greeting transforms must remain finite');
  assert.ok(result.wave.relativeWristMovement > .7, 'The greeting must raise and lower the hand independently of the head');
  assert.ok(result.wave.maximumHeadTurn > .005 && result.wave.maximumHeadTurn < .25 && result.wave.maximumHeadMovement < .15, 'The greeting must include a restrained nod or tilt without displacing the head from its neck');
  assert.ok(result.wave.maximumFootMovement < .00001 && result.wave.maximumFootTurn < .00001, 'Both feet must stay planted while the upper body greets');
  assert.ok(result.wave.minimumRestingWristHeight > .86 && result.wave.maximumRestingWristHeight < 1 && result.wave.restingFingersDown, 'The shortened idle arm must hang near the waist with fingers pointing down');
  assert.ok(Math.abs(result.wave.minimumReach - .72) < .000001 && Math.abs(result.wave.maximumReach - .72) < .000001, 'Both greeting arms must keep their shorter .72-unit shoulder-to-wrist length throughout the loop');
  assert.ok(Math.abs(result.wave.minimumSegmentLength - .36) < .000001 && Math.abs(result.wave.maximumSegmentLength - .36) < .000001, 'Upper arms and forearms must each retain their .36-unit length');
  assert.ok(result.wave.maximumElbowDeviation < .000001 && result.wave.maximumJointGap < .000001, 'Both greeting arms must stay straight and connected at the elbow and wrist');
  assert.ok(result.wave.minimumWavingHandForward > -.03 && result.wave.maximumWavingHandForward > .1, 'The greeting must lift forward from the shoulder instead of travelling behind the body');
  assert.ok(result.wave.middleLiftForward > Math.abs(result.wave.middleLiftSideways) + .3, 'The hand must rise through the front of the body rather than sweep out sideways');
  assert.ok(result.wave.minimumRaisedHandHeight > .55 && result.wave.minimumRaisedFingerUp > .85 && result.wave.maximumFingerScreenTilt < .5, `The hand must reach high beside the head with its fingers pointing mostly upward throughout the waves: ${JSON.stringify(result.wave)}`);
  assert.ok(result.wave.minimumGlassesScreenClearance > .03, 'The raised hand must remain visibly outside the front glasses frames in the default scene view');
  assert.ok(result.wave.settlingPositionDrift < .000001 && result.wave.settlingRotationDrift < .000001, 'The hand must settle at the top of the lift before any wrist waves begin');
  assert.ok(result.wave.wristWaveAfterSettling > .1, 'The raised hand must wave after its settling pause');
  assert.ok(result.wave.maximumStep < .06 && result.wave.maximumRotationStep < .16, `The greeting must move continuously at 120 Hz, including its phase boundaries and wrap: ${JSON.stringify(result.wave)}`);
  assert.ok(result.wave.loopPositionError < .000001 && result.wave.loopRotationError < .000001, 'The greeting must return to its starting pose at the six-second loop boundary');
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
