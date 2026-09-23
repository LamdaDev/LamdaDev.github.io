import * as THREE from 'three';
import { GREETING_DURATION } from '../runtime/sequence';

export type CharacterAction = 'wave' | 'order' | 'sip' | 'game' | 'code' | 'drink' | 'nap' | 'bench' | 'rest';
export interface ChibiCharacter {
  root: THREE.Group;
  head: THREE.Group;
  hands: { left: THREE.Group; right: THREE.Group };
  update(action: CharacterAction, time: number): void;
  dispose(): void;
}

type Point = [number, number, number];
const TAU = Math.PI * 2;
const GREETING_ARM_LENGTH = .72;
const Y_AXIS = new THREE.Vector3(0, 1, 0);

/**
 * Daniel's portrait interpreted as a small, entirely three-dimensional vinyl figure.
 * Coordinates: +Y up, +Z forward, standing soles at Y=0. The root transform is
 * exclusively owned by the diorama. All materials and geometry are local assets
 * generated in code; this module needs neither a DOM nor an external model.
 */
export function createCharacter(): ChibiCharacter {
  const root = new THREE.Group();
  root.name = 'Daniel — articulated chibi';
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const geometry = <T extends THREE.BufferGeometry>(g: T): T => { geometries.add(g); return g; };
  const material = (color: string, roughness = 0.68, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    materials.add(m); return m;
  };
  const skin = material('#edb58d', 0.8);
  const earSkin = material('#d98f76', 0.88);
  const blush = material('#df9885', 0.9);
  const hair = material('#292221', 0.67);
  const hairLight = material('#3b302c', 0.68);
  const hairGlint = material('#534039', 0.7);
  const tee = material('#27272c', 0.88);
  const seam = material('#3d3b41', 0.85);
  const trousers = material('#777182', 0.85);
  const white = material('#fff8e9', 0.7);
  const sole = material('#e4dbd0', 0.84);
  const ink = material('#302223', 0.52);
  const lens = material('#f5e8d7', 0.1, { transparent: true, opacity: 0.07, depthWrite: false });

  // All ellipsoids share one moderately tessellated sphere.
  const sphere = geometry(new THREE.SphereGeometry(1, 24, 16));
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 12));
  function ellipsoid(parent: THREE.Object3D, name: string, pos: Point, scale: Point, mat: THREE.Material) {
    const mesh = new THREE.Mesh(sphere, mat);
    mesh.name = name; mesh.position.set(...pos); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function line(parent: THREE.Object3D, name: string, points: Point[], width: number, mat: THREE.Material, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed, 'centripetal');
    const mesh = new THREE.Mesh(geometry(new THREE.TubeGeometry(curve, Math.max(16, points.length * 5), width, 6, closed)), mat);
    mesh.name = name; mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  function segment(name: string, radius: number, mat: THREE.Material, parent: THREE.Object3D = root): THREE.Mesh {
    const mesh = new THREE.Mesh(cylinder, mat);
    mesh.name = name; mesh.scale.set(radius, 1, radius);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }

  // T-shirt is a smooth lathed silhouette, flattened front-to-back.
  const shirtOutline = [
    [0, 0], [.32, 0], [.40, .05], [.43, .20], [.46, .54], [.44, .66], [.33, .75], [.17, .77], [0, .77],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const shirt = new THREE.Mesh(geometry(new THREE.LatheGeometry(shirtOutline, 24)), tee);
  shirt.name = 'Black short-sleeve T-shirt'; shirt.position.y = .96; shirt.scale.z = .68;
  shirt.castShadow = true; shirt.receiveShadow = true; root.add(shirt);
  const neck = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.16, .175, .29, 16)), skin);
  neck.name = 'Neck'; neck.position.y = 1.82; root.add(neck);
  const collar = new THREE.Mesh(geometry(new THREE.TorusGeometry(.17, .022, 6, 24)), seam);
  collar.name = 'T-shirt collar seam'; collar.rotation.x = Math.PI / 2; collar.position.y = 1.739; root.add(collar);
  ellipsoid(root, 'Collar neckline', [0, 1.742, 0], [.162, .045, .162], skin);
  line(root, 'Shirt hem seam', [[-.36, 1.035, .17], [0, 1.015, .275], [.36, 1.035, .17]], .009, seam);
  ellipsoid(root, 'Trouser hips', [0, 1.00, -.005], [.365, .19, .245], trousers);

  const head = new THREE.Group();
  head.name = 'Head — expression and neck pivot'; head.position.y = 2.48; root.add(head);
  ellipsoid(head, 'Warm rounded face', [0, -.02, .015], [.755, .775, .595], skin);
  ellipsoid(head, 'Soft chin', [0, -.43, .085], [.455, .275, .37], skin);
  for (const side of [-1, 1]) {
    ellipsoid(head, `${side < 0 ? 'Left' : 'Right'} ear`, [side * .743, -.055, .025], [.137, .195, .122], skin);
    ellipsoid(head, 'Ear inset', [side * .785, -.05, .115], [.064, .111, .034], earSkin);
    ellipsoid(head, 'Warm cheek', [side * .425, -.22, .485], [.119, .052, .014], blush);
  }

  // Complete scalp and back of hair remain volumetric from every camera angle.
  ellipsoid(head, 'Sculpted back hair', [0, .15, -.31], [.77, .75, .42], hair);
  const cap = new THREE.Mesh(geometry(new THREE.SphereGeometry(1, 32, 16, 0, TAU, 0, 1.58)), hair);
  cap.name = 'Rounded crown'; cap.position.set(0, .17, -.035); cap.scale.set(.80, .72, .66); cap.castShadow = true; head.add(cap);

  /** A tapered elliptical sweep forms a broad sculpted lock, rather than beads. */
  function lock(name: string, points: Point[], width: number, depth: number, mat: THREE.Material) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal');
    const positions: number[] = [], indices: number[] = [];
    const steps = 24, sides = 10;
    const normal = new THREE.Vector3();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = curve.getPoint(t), tangent = curve.getTangent(t);
      normal.set(-tangent.y, tangent.x, 0).normalize();
      const taper = Math.max(.015, Math.pow(Math.sin(Math.PI * (.07 + t * .93)), .6));
      for (let j = 0; j <= sides; j++) {
        const angle = j / sides * TAU;
        positions.push(p.x + normal.x * Math.cos(angle) * width * taper,
          p.y + normal.y * Math.cos(angle) * width * taper,
          p.z + Math.sin(angle) * depth * taper);
        if (i < steps && j < sides) {
          const a = i * (sides + 1) + j, b = a + sides + 1;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    const g = geometry(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, mat); mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true; head.add(mesh);
  }
  for (const side of [-1, 1]) {
    const mirror = (points: Point[]) => points.map(([x, y, z]): Point => [x * side, y, z]);
    lock('Center-part swept fringe', mirror([[.035, .66, .40], [.24, .65, .60], [.49, .38, .63], [.57, .13, .57], [.74, .09, .41]]), .20, .125, hair);
    lock('Outer wavy lock', mirror([[.12, .79, .15], [.48, .70, .38], [.68, .40, .39], [.74, .13, .26], [.84, .20, .15]]), .20, .14, hairLight);
    lock('Temple curl', mirror([[.61, .49, .19], [.76, .24, .17], [.77, -.04, .10], [.67, -.18, .03]]), .12, .12, hair);
    lock('Back side sweep', mirror([[.24, .73, -.28], [.62, .48, -.43], [.77, .13, -.27], [.79, .05, -.02]]), .14, .13, hair);
    line(head, 'Fine hair sheen', mirror([[.10, .705, .49], [.28, .675, .681], [.43, .50, .72], [.48, .34, .717]]), .010, hairGlint);
    line(head, 'Outer lock seam', mirror([[.37, .756, .36], [.57, .60, .48], [.69, .38, .48]]), .009, hairGlint);
  }

  // Eyes have separate open and closed meshes so naps and blinks read at small sizes.
  const openEyes = new THREE.Group(); openEyes.name = 'Eyes — open'; head.add(openEyes);
  const closedEyes = new THREE.Group(); closedEyes.name = 'Eyes — closed'; head.add(closedEyes);
  const brows: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const x = side * .268;
    ellipsoid(openEyes, 'Ivory eye', [x, -.045, .583], [.139, .150, .042], white);
    ellipsoid(openEyes, 'Dark iris', [x + .012, -.051, .619], [.080, .111, .026], ink);
    ellipsoid(openEyes, 'Eye catchlight', [x - .014, -.014, .647], [.025, .03, .008], white);
    line(closedEyes, 'Closed eyelid', [[x - .104, -.065, .627], [x, -.10, .644], [x + .104, -.065, .627]], .016, ink);
    const brow = new THREE.Group(); brow.name = 'Expressive eyebrow'; brow.position.set(x, .15, .602); head.add(brow); brows.push(brow);
    line(brow, 'Eyebrow', [[-.115, -.005, -.02], [0, .025, 0], [.113, -.01, -.02]], .026, hair);
  }
  ellipsoid(head, 'Button nose', [0, -.17, .606], [.090, .113, .109], skin);
  line(head, 'Nose underside', [[-.05, -.234, .671], [0, -.251, .688], [.037, -.242, .677]], .009, earSkin);
  const smile = line(head, 'Quiet friendly smile', [[-.185, -.354, .531], [-.065, -.389, .567], [.07, -.385, .566], [.185, -.342, .531]], .013, ink);
  const sippingMouth = ellipsoid(head, 'Sipping mouth', [0, -.35, .577], [.032, .039, .015], ink);
  sippingMouth.visible = false;

  // Rounded rectangular frames and temple arms, modeled as actual 3D tubes.
  function roundedRect(cx: number, cy: number, width: number, height: number, z: number): Point[] {
    const r = .060, hw = width / 2, hh = height / 2;
    return [
      [cx - hw + r, cy + hh, z], [cx + hw - r, cy + hh, z], [cx + hw, cy + hh - r, z],
      [cx + hw, cy - hh + r, z], [cx + hw - r, cy - hh, z], [cx - hw + r, cy - hh, z],
      [cx - hw, cy - hh + r, z], [cx - hw, cy + hh - r, z],
    ];
  }
  const glasses = new THREE.Group(); glasses.name = 'Dark rectangular glasses'; head.add(glasses);
  for (const side of [-1, 1]) {
    line(glasses, 'Rounded rectangular glasses frame', roundedRect(side * .286, -.052, .516, .344, .676), .021, ink, true);
    ellipsoid(glasses, 'Clear lens', [side * .286, -.052, .669], [.232, .153, .010], lens);
    line(glasses, 'Glasses temple arm', [[side * .553, .062, .676], [side * .678, .063, .42], [side * .755, .015, .075]], .020, ink);
    ellipsoid(glasses, 'Frame hinge pin', [side * .527, .083, .692], [.012, .012, .009], sole);
    line(glasses, 'Lens glint', [[side * .286 - .13, .026, .694], [side * .286 - .095, .065, .694]], .009, white);
  }
  line(glasses, 'Glasses bridge', [[-.033, .018, .676], [0, .040, .693], [.033, .018, .676]], .021, ink);

  // Limb segments update their position and quaternion without allocating geometry.
  const direction = new THREE.Vector3(), bend = new THREE.Vector3(), elbow = new THREE.Vector3();
  const upperEnd = new THREE.Vector3();
  function connect(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
    direction.subVectors(b, a);
    const length = direction.length();
    mesh.position.copy(a).addScaledVector(direction, .5);
    mesh.scale.y = Math.max(.001, length);
    mesh.quaternion.setFromUnitVectors(Y_AXIS, direction.normalize());
  }
  function makeHand(side: number, parent: THREE.Object3D) {
    const group = new THREE.Group(); group.name = `${side < 0 ? 'Left' : 'Right'} wrist attachment`; parent.add(group);
    ellipsoid(group, 'Palm', [0, 0, 0], [.103, .115, .061], skin);
    const fingers: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const finger = new THREE.Group(); finger.name = `Finger ${i + 1} knuckle`; finger.position.set((i - 1.5) * .043, .067, .003); group.add(finger);
      ellipsoid(finger, 'Rounded finger', [0, .065, 0], [.028, .087 - Math.abs(i - 1.5) * .012, .029], skin);
      fingers.push(finger);
    }
    const thumb = ellipsoid(group, 'Thumb', [-side * .098, .009, .027], [.045, .083, .045], skin); thumb.rotation.z = side * .6;
    return { group, fingers };
  }
  function makeArm(side: number) {
    const shoulder = new THREE.Group();
    shoulder.name = `${side < 0 ? 'Left' : 'Right'} shoulder pivot`;
    shoulder.position.set(side * .435, 1.62, 0); root.add(shoulder);
    const origin = new THREE.Vector3();
    const upper = segment('Upper arm', .106, skin, shoulder);
    const sleeve = segment('Black T-shirt sleeve', .166, tee, shoulder);
    const forearm = segment('Forearm', .095, skin, shoulder);
    const elbowMesh = ellipsoid(shoulder, 'Rounded elbow', [0, 0, 0], [.106, .106, .106], skin);
    const hand = makeHand(side, shoulder);
    const target = new THREE.Vector3();
    const sleeveStart = new THREE.Vector3();
    const handCompensation = new THREE.Quaternion();
    function poseArm(fingers: number, handRoll: number, coverShoulder = false) {
      hand.group.position.copy(target); hand.group.rotation.set(0, 0, handRoll);
      for (const finger of hand.fingers) finger.rotation.x = fingers;
      elbowMesh.position.copy(elbow);
      connect(upper, origin, elbow); connect(forearm, elbow, target);
      // Separate the sleeve and skin caps to prevent shoulder flickering.
      sleeveStart.copy(elbow).normalize().multiplyScalar(coverShoulder ? -.018 : 0);
      upperEnd.copy(elbow).multiplyScalar(.62); connect(sleeve, sleeveStart, upperEnd);
    }
    function set(x: number, y: number, z: number, fingers: number, handRoll = 0) {
      shoulder.rotation.set(0, 0, 0);
      target.set(x - shoulder.position.x, y - shoulder.position.y, z);
      direction.copy(target);
      const distance = Math.max(.001, direction.length()); direction.divideScalar(distance);
      const armLength = .48;
      const height = Math.sqrt(Math.max(.002, armLength * armLength - distance * distance * .25));
      bend.set(side, -.36, -.28)
        .addScaledVector(direction, -bend.dot(direction)).normalize();
      elbow.copy(target).multiplyScalar(.5).addScaledVector(bend, height);
      poseArm(fingers, handRoll);
    }
    function greetDirection(sideways: number, vertical: number, forward: number, fingers: number, handRoll: number) {
      shoulder.rotation.set(0, Math.PI, 0);
      // A fixed-length straight arm swings as one piece from the shoulder.
      // Negative local Z becomes forward after the shoulder's half-turn.
      target.set(-side * sideways, vertical, -forward)
        .normalize().multiplyScalar(GREETING_ARM_LENGTH);
      elbow.copy(target).multiplyScalar(.5);
      poseArm(fingers, handRoll, true);
    }
    function greet(angle: number, forward: number, fingers: number, handRoll: number) {
      greetDirection(Math.sin(angle), -Math.cos(angle), forward, fingers, handRoll);
    }
    function preserveHandFacing() {
      // Keep the approved palm orientation after turning the parent shoulder.
      handCompensation.copy(shoulder.quaternion).invert();
      hand.group.quaternion.premultiply(handCompensation);
    }
    return { set, greet, greetDirection, preserveHandFacing, hand: hand.group };
  }
  const left = makeArm(-1), right = makeArm(1);
  // Move the torso, neck and arms together, leaving the legs and feet planted.
  const upperBody = new THREE.Group();
  upperBody.name = 'Upper body greeting sway';
  upperBody.add(...root.children.slice());
  root.add(upperBody);
  function makeLeg(side: number) {
    const hip = new THREE.Vector3(side * .215, 1.0, 0);
    const knee = new THREE.Vector3(), ankle = new THREE.Vector3();
    const thigh = segment('Trouser thigh', .155, trousers), shin = segment('Trouser calf', .132, trousers);
    const kneeMesh = ellipsoid(root, 'Rounded knee', [0, 0, 0], [.155, .155, .155], trousers);
    const shoe = new THREE.Group(); shoe.name = 'Cream sneaker'; root.add(shoe);
    ellipsoid(shoe, 'Sneaker sole', [0, -.052, .058], [.179, .069, .280], sole);
    ellipsoid(shoe, 'Sneaker upper', [0, .018, .045], [.170, .106, .254], white);
    line(shoe, 'Sneaker trim', [[-.14, .02, .155], [0, .05, .267], [.14, .02, .155]], .012, seam);
    for (let i = 0; i < 3; i++) line(shoe, 'Sneaker lace', [[-.076, .102 - i * .005, i * .05], [.076, .102 - i * .005, i * .05]], .010, sole);
    function set(seated: boolean, bench: boolean) {
      if (seated) { knee.set(side * .235, .98, .53); ankle.set(side * .235, .48, .60); }
      else if (bench) {
        // The diorama rotates the rig onto its back: negative local Z is down.
        // Splay the knees outside the bench before dropping the shins to the floor.
        knee.set(side * .58, .60, -.47); ankle.set(side * .60, .67, -1.30);
      }
      else { knee.set(side * .235, .57, .015); ankle.set(side * .245, .122, .025); }
      connect(thigh, hip, knee); connect(shin, knee, ankle); kneeMesh.position.copy(knee);
      shoe.position.copy(ankle);
      shoe.rotation.set(bench ? Math.PI / 2 : 0, side * .035, 0);
    }
    return { set };
  }
  const leftLeg = makeLeg(-1), rightLeg = makeLeg(1);

  function update(action: CharacterAction, time: number) {
    const t = Math.max(0, time);
    const seated = ['game', 'code', 'drink', 'nap', 'rest'].includes(action);
    leftLeg.set(seated, action === 'bench'); rightLeg.set(seated, action === 'bench');
    upperBody.position.set(0, 0, 0); upperBody.rotation.set(0, 0, 0);
    head.position.set(0, 2.48, 0); head.rotation.set(0, 0, 0);
    const blinking = (t + .6) % 4.4 > 4.23;
    openEyes.visible = action !== 'nap' && !blinking;
    closedEyes.visible = !openEyes.visible;
    smile.visible = true; sippingMouth.visible = false;
    brows[0].rotation.z = action === 'code' ? -.13 : 0;
    brows[1].rotation.z = action === 'code' ? .13 : 0;
    left.set(-.61, .99, .08, .75); right.set(.61, .99, .08, .75);

    if (action === 'wave') {
      const phase = t % GREETING_DURATION;
      // Quintic easing keeps both speed and acceleration soft at each hand-off.
      const ease = (start: number, end: number) => THREE.MathUtils.smootherstep(phase, start, end);
      const lift = ease(.25, 1.45) * (1 - ease(3.8, 4.9));
      // Reach the raised pose, settle, and only then begin the wrist waves.
      const waving = ease(1.65, 1.95) * (1 - ease(3.2, 3.6));
      const beat = (phase - 1.65) * TAU / .9;
      const wave = -Math.sin(beat) * waving;
      const follow = -Math.sin(beat - .42) * waving;
      const breath = Math.sin(phase / GREETING_DURATION * TAU);
      const nod = ease(.6, 1.25) * (1 - ease(1.55, 2.3));

      // Short, straight arms stay beside the torso; fingers point down at rest.
      left.greet(.14 + breath * .012, .055, .36, Math.PI + .06);
      left.hand.rotation.y = -.16;
      // Pitch through the front (YZ plane), rather than lifting out to the side.
      // Keep the idle vector and front-first lift, then reach higher beside the head.
      const restPitch = Math.atan2(.055, Math.cos(.14));
      const planeRadius = Math.hypot(Math.cos(.14), .055);
      const pitch = restPitch + (2.85 - restPitch) * lift + .018 * follow;
      // Add clearance late in the lift so the upright hand stays outside the face.
      const headClearance = THREE.MathUtils.smootherstep(lift, .55, 1);
      right.greetDirection(Math.sin(.14) * (1 - headClearance) + .66 * headClearance + .018 * follow,
        -Math.cos(pitch) * planeRadius, Math.sin(pitch) * planeRadius,
        .36 * (1 - lift) + .055 * lift,
        -Math.PI - .16 * lift - .23 * wave);
      right.hand.rotation.y = .14 * (1 - lift) + .075 * follow;
      // Point the open hand toward the sky once the arm reaches its raised pose.
      right.hand.rotation.x = -(Math.PI - .1) * lift + .04 * follow;
      // Roll around each hand's own finger axis, preserving the wave direction.
      left.hand.rotateY(Math.PI);
      right.hand.rotateY(Math.PI);
      left.preserveHandFacing();
      right.preserveHandFacing();

      upperBody.rotation.z = -.012 * lift + .006 * breath;
      upperBody.rotation.y = .016 * lift;
      upperBody.position.y = .004 * breath;
      head.rotation.x = .045 * nod;
      head.rotation.y = -.035 * lift;
      head.rotation.z = .025 * lift + .006 * breath;
    } else if (action === 'order') {
      const reach = Math.min(1, t / 1.3);
      right.set(.45 - reach * .16, 1.34, .45 + reach * .28, .5);
      head.rotation.y = -.06;
    } else if (action === 'sip' || action === 'drink' || action === 'rest') {
      const period = action === 'drink' ? 2 : 4;
      const lift = .5 - .5 * Math.cos(Math.min(1, (t % period) / period) * TAU);
      const top = action === 'drink' ? 1.94 : action === 'rest' ? 1.83 : 1.65;
      const forward = action === 'sip' ? .765 : .65;
      right.set(.16 + (1 - lift) * .18, 1.42 + lift * (top - 1.42), .79 + lift * (forward - .79), 1.1);
      left.set(-.46, seated ? 1.04 : 1.03, seated ? .48 : .18, .9);
      head.rotation.z = -.025 * lift;
      if (lift > .62) { smile.visible = false; sippingMouth.visible = true; }
    } else if (action === 'game' || action === 'code') {
      const tap = Math.sin(t * 19) * .017;
      left.set(-.29, 1.60 + tap, .72, 1.14);
      right.set(action === 'game' ? .51 + Math.sin(t * 1.4) * .035 : .24, 1.60 - tap, action === 'game' ? .69 : .73, 1.16);
      head.rotation.x = .06;
      if (action === 'game') head.rotation.y = Math.sin(t * .7) * .025;
    } else if (action === 'nap') {
      left.set(-.18, 1.58, .72, 1.15); right.set(.16, 1.58, .73, 1.15);
      head.position.set(0, 2.14, .42);
      head.rotation.x = .65;
      head.rotation.z = -.065;
    } else if (action === 'bench') {
      const lift = .5 - .5 * Math.cos(t * TAU / 1.65);
      const z = .65 + lift * .55;
      left.set(-.48, 1.65, z, 1.42); right.set(.48, 1.65, z, 1.42);
      brows[0].rotation.z = -.06; brows[1].rotation.z = .06;
    }
    root.userData.action = action;
  }
  update('wave', 0);
  let disposed = false;
  return {
    root, head, hands: { left: left.hand, right: right.hand }, update,
    dispose() {
      if (disposed) return; disposed = true;
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
    },
  };
}
