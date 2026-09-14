import * as THREE from 'three';
import { createCharacter, type CharacterAction } from './character';
import { createProps } from './props';

export type SceneKind = 'hero' | 'about' | 'skills' | 'projects' | 'experience';
export type Diorama = {
  root: THREE.Group;
  camera: { position: [number, number, number]; target: [number, number, number]; span: number };
  update: (action: CharacterAction, time: number) => void;
  dispose: () => void;
};

/** Original, editable geometry: every room is a little collectible desk toy. */
export function createDiorama(kind: SceneKind): Diorama {
  const p = createProps();
  const c = p.palette;
  const root = new THREE.Group();
  root.name = `diorama-${kind}`;
  const character = createCharacter();
  character.root.name = 'Daniel';
  root.add(character.root);
  const camera: Diorama['camera'] = { position: [7, 5.7, 11], target: [0, 1.25, 0], span: 5.4 };
  let animate: (action: CharacterAction, time: number) => void = () => undefined;
  const add = (...items: THREE.Object3D[]) => root.add(...items);
  const at = <T extends THREE.Object3D>(item: T, x: number, y: number, z: number) => { item.position.set(x, y, z); return item; };
  const ink = '#534c66';

  function base(color: string, width = 6.1, depth = 4.4) {
    add(p.box(width, .28, depth, color, [0, -.18, 0], .13));
    add(p.box(width - .12, .08, depth - .12, c.cream, [0, -.025, 0], .035));
    const floorShadow = p.shadow(width * .39, depth * .37, .065); add(floorShadow);
  }
  function wall(color: string, backZ = -1.82) {
    add(p.box(5.8, 3.0, .12, color, [0, 1.48, backZ], .055));
    add(p.box(5.8, .13, .17, c.white, [0, .1, backZ + .10]));
    // A low side return gives an open, dollhouse-like silhouette.
    add(p.box(.13, 1.65, 1.3, color, [-2.83, .8, backZ + .67]));
  }
  function picture(label: string, x: number, y: number, z: number, color: string, width = 1.0) {
    add(p.box(width, .72, .08, c.white, [x, y, z]));
    add(p.box(width - .1, .62, .035, color, [x, y, z + .05], .018));
    add(at(p.text(label, width - .13, .4, ink, undefined, 100), x, y, z + .075));
  }
  function sparkle(x: number, y: number, z: number, size: number, color: string) {
    const object = p.star(size, color); at(object, x, y, z); object.rotation.z = -.15; add(object); return object;
  }
  function barbell() {
    const group = new THREE.Group(); group.name = 'weighted-barbell';
    const bar = p.cylinder(.045, .045, 3.35, '#bcc2c4'); bar.rotation.z = Math.PI / 2; group.add(bar);
    for (const sign of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        const plate = p.cylinder(.36 - i * .06, .36 - i * .06, .13, i ? ink : c.purple, [sign * (1.14 + i * .15), 0, 0]);
        plate.rotation.z = Math.PI / 2; group.add(plate);
        const ring = p.torus(.235 - i * .06, .015, '#b6a7d4', [sign * (1.215 + i * .15), 0, 0]); ring.rotation.y = Math.PI / 2; group.add(ring);
      }
      const collar = p.cylinder(.075, .075, .08, '#e4e4df', [sign * 1.5, 0, 0]); collar.rotation.z = Math.PI / 2; group.add(collar);
    }
    return group;
  }
  function keyboard() {
    const group = new THREE.Group();
    group.add(p.box(1.05, .07, .42, '#e7dff3', [0, 0, 0], .025));
    for (let row = 0; row < 3; row++) for (let col = 0; col < 10; col++) {
      group.add(p.box(.073, .026, .065, col === 0 || col === 9 ? c.lavender : c.white, [(col - 4.5) * .094, .046, (row - 1) * .104], .008));
    }
    group.add(p.box(.36, .025, .042, c.white, [0, .046, .174], .007));
    return group;
  }
  function monitor(gaming: boolean) {
    const group = new THREE.Group();
    group.add(p.box(.64, .065, .4, ink, [0, .04, 0]));
    group.add(p.box(.105, .35, .09, ink, [0, .21, -.06]));
    group.add(p.box(1.75, 1.13, .15, ink, [0, .92, -.04]));
    group.add(p.box(1.59, .94, .025, '#343249', [0, .95, .05], .012));
    group.add(p.ball(.022, c.mint, [.71, .415, .042]));
    group.add(at(p.text(gaming ? 'STAR QUEST' : 'daniel / workspace', 1.25, .16, '#cbbdeb', undefined, 60), 0, 1.35, .071));
    const active = new THREE.Group(); active.position.set(0, .95, .085); group.add(active);
    if (gaming) {
      // An original little pixel world, built from real low-poly meshes.
      for (const [x, y, w] of [[-.55, -.25, .43], [.13, -.06, .45], [.55, .13, .31]]) {
        active.add(p.box(w, .055, .02, c.lavender, [x, y, 0], .006));
      }
      for (const [x, y] of [[-.31, .22], [.17, .18], [.55, .35]]) {
        const star = p.star(.063, '#f4d997'); star.position.set(x, y, .003); star.scale.z = .15; active.add(star);
      }
      const player = new THREE.Group(); player.name = 'arcade-player';
      player.add(p.box(.11, .12, .025, c.mint, [0, 0, 0], .008));
      player.add(p.box(.15, .065, .025, c.mint, [0, -.06, 0], .007));
      player.add(p.ball(.01, ink, [.025, .025, .026])); active.add(player);
      return { group, player };
    }
    const lineColors = ['#b8d8c2', '#cab7ee', '#efc591', '#b9cfe8'];
    for (let i = 0; i < 7; i++) {
      const indent = i === 1 || i === 2 || i === 5 ? .12 : 0;
      active.add(p.box(.22 + (i % 3) * .08, .03, .014, lineColors[i % 4], [-.47 + indent, .22 - i * .075, 0], .004));
      active.add(p.box(.25 + (i % 2) * .17, .03, .014, lineColors[(i + 1) % 4], [-.04 + indent, .22 - i * .075, 0], .004));
    }
    const cursor = p.box(.055, .045, .02, c.cream, [.4, -.23, .01], .005); active.add(cursor);
    return { group, player: cursor };
  }

  if (kind === 'hero') {
    base('#dac9f0', 4.55, 3.15);
    add(p.cylinder(1.34, 1.42, .18, '#dfd2f3', [0, .07, .15], 64));
    add(p.cylinder(1.29, 1.29, .035, '#f2e9fd', [0, .178, .15], 64));
    character.root.position.set(-.05, .2, .15); character.root.rotation.y = .04;
    const greeting = new THREE.Group();
    greeting.add(p.box(1.72, .62, .16, c.white, [0, 0, 0], .11));
    greeting.add(at(p.text('hi, I\'m Daniel!', 1.5, .4, ink, undefined, 62), 0, 0, .09));
    greeting.add(p.box(.18, .18, .12, c.white, [-.44, -.32, 0], .025));
    greeting.position.set(-1.75, 3.65, .18); greeting.rotation.y = .1; add(greeting);
    sparkle(1.53, 2.87, -.55, .23, '#f2c681');
    sparkle(-1.82, 1.24, .23, .14, c.mint);
    sparkle(1.74, .86, .4, .16, c.lavender);
    const toy = new THREE.Group();
    toy.add(p.box(.7, .42, .24, c.purple, [0, 0, 0], .1));
    toy.add(p.box(.19, .045, .03, c.cream, [-.18, .02, .13], .008));
    toy.add(p.box(.045, .19, .03, c.cream, [-.18, .02, .13], .008));
    toy.add(p.ball(.04, c.peach, [.17, .045, .14]));
    toy.add(p.ball(.04, c.mint, [.26, -.025, .14]));
    toy.position.set(1.77, .4, 1.0); toy.rotation.set(-.15, -.35, .08); add(toy);
    const plant = p.plant(.72); plant.position.set(-1.82, .03, -.73); add(plant);
    // Framing includes every animated mesh with >=5% per-edge padding at 1.2.
    camera.position = [5.4, 4.2, 12]; camera.target = [0, 1.75, .05]; camera.span = 5.5;
  }

  if (kind === 'about') {
    base('#edc2a8');
    add(p.box(4.65, 3.04, .15, '#f7d4bd', [-.56, 1.5, -1.52]));
    add(p.box(4.72, .15, 1.35, c.cream, [-.56, 3.02, -.95], .07));
    for (let i = 0; i < 12; i++) {
      const x = -2.72 + i * .392;
      add(p.box(.392, .075, 1.27, i % 2 ? c.cream : '#eda889', [x, 3.13, -.94], .022));
      add(p.ball(.195, i % 2 ? c.cream : '#eda889', [x, 2.985, -.28], [1, .62, .25]));
    }
    add(p.box(2.4, .43, .14, c.cream, [-1.38, 2.65, -.38]));
    add(at(p.text('BOBA CLUB', 2.1, .31, '#81564d', undefined, 92), -1.38, 2.65, -.299));
    add(p.box(2.46, 1.06, 1.03, '#eac0a2', [-1.32, .55, -.16], .09));
    add(p.box(2.66, .12, 1.18, c.cream, [-1.32, 1.14, -.12]));
    for (let i = 0; i < 9; i++) add(p.box(.055, .77, .025, '#f7d9c3', [-2.35 + i * .25, .57, .37], .01));
    add(at(p.text('a little cup of joy', 1.95, .27, '#87604e', undefined, 67), -1.32, .64, .396));
    add(p.box(1.43, 1.0, .07, '#986c57', [-1.85, 1.91, -1.4]));
    add(p.box(1.32, .9, .025, c.cream, [-1.85, 1.91, -1.35]));
    add(at(p.text(['MILK TEA', 'MATCHA  /  TARO', 'extra pearls? yes.'], 1.21, .76, '#80604f', undefined, 55), -1.85, 1.91, -1.333));
    const shelf = p.box(1.11, .08, .43, c.cream, [-.19, 1.8, -1.27]); add(shelf);
    for (let i = 0; i < 3; i++) { const cup = p.drink('boba'); cup.scale.setScalar(.7); cup.position.set(-.51 + i * .31, 1.85, -1.26); add(cup); }
    const shopPlant = p.plant(.82); shopPlant.position.set(-2.51, 1.21, -.4); add(shopPlant);
    character.root.position.set(1.2, 0, .44); character.root.rotation.y = -.15;
    const rug = p.box(1.65, .025, 1.45, '#edc5af', [1.12, .008, .5], .012); add(rug);
    const customerShadow = p.shadow(.55, .45, .1); customerShadow.position.set(1.2, .027, .44); add(customerShadow);
    const inHand = p.drink('boba'); inHand.position.set(0, -.12, 0); character.hands.right.add(inHand);
    const servedCup = p.drink('boba'); add(servedCup);
    const handPosition = new THREE.Vector3();
    const counterPosition = new THREE.Vector3(-.37, 1.2, .11);
    const happy = sparkle(2.18, 2.37, .41, .11, '#e3a372');
    animate = (action, time) => {
      inHand.visible = action === 'sip'; servedCup.visible = action === 'order';
      if (servedCup.visible) {
        character.hands.right.getWorldPosition(handPosition); root.worldToLocal(handPosition);
        handPosition.y -= .12;
        const reach = THREE.MathUtils.smoothstep(time, .8, 2.2);
        servedCup.position.copy(counterPosition).lerp(handPosition, reach);
      }
      happy.scale.setScalar(action === 'sip' ? 1 + Math.sin(time * 2) * .12 : .8);
    };
    camera.position = [7, 5.7, 12]; camera.target = [0, 1.42, -.05]; camera.span = 6.45;
  }

  if (kind === 'skills' || kind === 'projects') {
    const gaming = kind === 'skills';
    base(gaming ? '#b4c5df' : '#c9b6e5'); wall(gaming ? '#dae5f4' : '#e6ddf2');
    picture(gaming ? 'PLAY / REPEAT' : 'MAKE GOOD THINGS', -1.75, 2.39, -1.71, gaming ? '#c1d4ed' : '#d3c2e9', 1.45);
    add(p.box(1.02, .09, .34, c.white, [1.65, 2.4, -1.54]));
    const shelfPlant = p.plant(.68); shelfPlant.scale.setScalar(.65); shelfPlant.position.set(1.87, 2.45, -1.52); add(shelfPlant);
    for (let i = 0; i < 3; i++) add(p.box(.1, .37 - i * .025, .21, [c.peach, c.lavender, c.mint][i], [1.25 + i * .13, 2.62, -1.52], .016));
    // An L-shaped surface keeps the torso clear while the input devices sit
    // directly under the articulated fingertips, rather than out of reach.
    add(p.box(2.3, .14, 1.43, c.cream, [-.85, 1.14, .17], .06));
    add(p.box(2.10, .14, .78, c.cream, [.20, 1.14, 1.0], .06));
    for (const [x, z] of [[-1.77, -.31], [-1.77, .69], [.06, -.31], [1.09, 1.23]]) add(p.box(.095, 1.04, .095, '#a598ae', [x, .55, z], .027));
    add(p.box(1.41, .025, .64, gaming ? '#a9b9d9' : '#beabda', [.57, 1.23, .97], .012));
    const keys = keyboard(); keys.position.set(.615, 1.27, .93); keys.rotation.y = -.35; add(keys);
    const mouse = p.ball(.115, c.white, [1.13, 1.29, .713], [.72, .45, 1]); add(mouse);
    const screen = monitor(gaming); screen.group.position.set(-1.13, 1.23, -.35); screen.group.rotation.y = .57; add(screen.group);
    // Cable routed under the desk, so all objects read as a connected setup.
    add(p.rod([-1.1, 1.19, -.41], [-1.15, .2, -.58], .017, ink));
    const tower = new THREE.Group();
    tower.add(p.box(.57, 1.0, .83, ink, [0, .51, 0]));
    tower.add(p.box(.49, .88, .025, gaming ? '#b9c8e1' : '#cdbfe0', [0, .52, .43], .02));
    for (const y of [.3, .69]) {
      tower.add(p.torus(.139, .026, gaming ? c.lavender : c.peach, [0, y, .45]));
      tower.add(p.cylinder(.075, .075, .016, ink, [0, y, .45]));
      const hub = p.ball(.06, ink, [0, y, .47], [1, 1, .2]); tower.add(hub);
    }
    tower.position.set(-2.22, .04, .0); add(tower);
    const chair = new THREE.Group();
    chair.add(p.box(.85, .17, .77, ink, [0, .64, 0], .07));
    chair.add(p.box(.81, 1.05, .18, gaming ? '#aaa1d0' : '#afa0c6', [0, 1.23, -.37], .075));
    chair.add(p.box(.55, .62, .065, ink, [0, 1.22, -.245], .026));
    chair.add(p.cylinder(.06, .06, .4, ink, [0, .35, 0]));
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * .4;
      chair.add(p.rod([0, .16, 0], [Math.sin(angle) * .5, .1, Math.cos(angle) * .5], .035, ink));
      chair.add(p.ball(.07, ink, [Math.sin(angle) * .5, .075, Math.cos(angle) * .5], [1, 1, .65]));
    }
    chair.rotation.y = -.35; chair.position.set(.93, 0, .09); add(chair);
    character.root.position.set(.89, -.3, .24); character.root.rotation.y = -.35;
    const underChair = p.shadow(.8, .66, .08); underChair.position.set(.93, .019, .16); add(underChair);
    if (gaming) {
      const headset = new THREE.Group(); headset.name = 'gaming-headset';
      const band = p.torus(.82, .065, ink, [0, .1, -.03], Math.PI); headset.add(band);
      for (const sign of [-1, 1]) {
        headset.add(p.box(.17, .42, .36, ink, [sign * .82, -.01, 0], .075));
        headset.add(p.box(.055, .31, .26, c.lavender, [sign * .925, -.01, .005], .025));
      }
      headset.add(p.rod([-.83, -.15, .16], [-.49, -.42, .55], .027, ink));
      headset.add(p.ball(.055, ink, [-.49, -.42, .55], [1.3, .8, .8]));
      character.head.add(headset);
      animate = (_action, time) => {
        const phase = (time % 4.5) / 4.5;
        screen.player.position.set(-.59 + phase * 1.16, -.14 + Math.abs(Math.sin(phase * Math.PI * 3)) * .25, .02);
        mouse.position.x = 1.13 + Math.sin(time * 1.4) * .033;
        mouse.position.z = .713 + Math.sin(time * 1.4) * .012;
      };
    } else {
      // A small articulated task lamp and a real modeled can.
      add(p.cylinder(.2, .2, .05, c.purple, [.37, 1.25, -.37]));
      add(p.rod([.37, 1.27, -.37], [.32, 1.98, -.45], .035, c.purple));
      add(p.rod([.32, 1.98, -.45], [-.07, 2.17, -.31], .035, c.purple));
      const shade = p.cylinder(.105, .23, .23, c.purple, [-.08, 2.10, -.31]); shade.rotation.z = -.35; add(shade);
      const bulb = p.ball(.09, '#ffe5aa', [-.11, 2.01, -.31]); add(bulb);
      const deskCoke = p.drink('coke'); deskCoke.position.set(-.2, 1.23, 1.08); add(deskCoke);
      const handCoke = p.drink('coke'); handCoke.position.set(0, -.17, 0); character.hands.right.add(handCoke);
      const zzz = new THREE.Group();
      for (let i = 0; i < 3; i++) zzz.add(at(p.text(i === 0 ? 'Z' : 'z', .28 + i * .06, .36 + i * .06, c.purple, undefined, 700), i * .22, i * .29, 0));
      zzz.position.set(1.32, 2.85, 1.15); add(zzz);
      animate = (action, time) => {
        handCoke.visible = action === 'drink'; deskCoke.visible = action !== 'drink';
        handCoke.rotation.x = -.25 * (.5 - .5 * Math.cos(time * Math.PI));
        zzz.visible = action === 'nap'; zzz.position.y = 2.85 + Math.sin(time * 1.5) * .06;
        screen.player.visible = action === 'code' ? Math.sin(time * 3) > -.25 : true;
      };
    }
    camera.position = [5.1, 5.8, 12.5]; camera.target = [0, 1.34, -.02]; camera.span = 6.3;
  }

  if (kind === 'experience') {
    base('#a7c8b5'); wall('#dcebe0', -2.08);
    picture('ONE MORE REP', -1.6, 2.45, -1.97, '#b6d4c2', 1.55);
    const clock = p.cylinder(.32, .32, .075, c.white, [1.79, 2.46, -1.94]); clock.rotation.x = Math.PI / 2; add(clock);
    add(p.rod([1.79, 2.46, -1.89], [1.79, 2.66, -1.89], .017, ink));
    add(p.rod([1.79, 2.46, -1.89], [1.94, 2.39, -1.89], .017, ink));
    add(p.box(3.85, .025, 3.15, '#b9d5c3', [0, .012, .15], .01));
    // Bench length runs along Z. Character lies with head towards the rack.
    add(p.box(.88, .17, 2.68, ink, [0, .77, .16], .07));
    add(p.box(.8, .08, 2.56, '#8aa89b', [0, .89, .16], .035));
    // A raised torso bolster supports the chibi proportions while the larger
    // head rests on the lower rear cushion. It stays in both activity states.
    add(p.box(.72, .22, 1.15, '#8aa89b', [0, 1.04, .16], .06));
    for (const z of [-.68, .99]) {
      add(p.box(.09, .61, .11, '#8a9992', [0, .39, z], .025));
      add(p.box(1.15, .075, .16, ink, [0, .09, z], .028));
    }
    const rackZ = -.35;
    for (const x of [-1.04, 1.04]) {
      add(p.box(.11, 2.18, .13, '#8a9992', [x, 1.13, rackZ], .025));
      add(p.box(.57, .095, 1.13, ink, [x, .095, rackZ], .028));
      add(p.box(.19, .08, .34, ink, [x, 2.15, rackZ + .1], .022));
      add(p.box(.19, .18, .06, ink, [x, 2.23, rackZ + .25], .022));
      for (let i = 0; i < 7; i++) add(p.ball(.02, '#4d6258', [x, .64 + i * .16, rackZ + .071], [1, 1, .5]));
    }
    add(p.rod([-1.04, .4, rackZ], [1.04, .4, rackZ], .05, '#8a9992'));
    const liftedBar = barbell(); add(liftedBar);
    const rackedBar = barbell(); rackedBar.position.set(0, 2.235, rackZ + .09); add(rackedBar);
    const towel = p.box(.44, .055, .65, c.cream, [1.86, .065, .45], .025); towel.rotation.y = -.2; add(towel);
    add(p.box(.38, .025, .57, '#f0e4d8', [1.86, .103, .44], .011));
    const standingWater = p.drink('water'); standingWater.position.set(1.91, .06, .98); add(standingWater);
    const handWater = p.drink('water'); handWater.position.set(0, -.14, 0); handWater.children[2].visible = false; character.hands.right.add(handWater);
    const dumbbell = new THREE.Group(); dumbbell.add(p.rod([-.3, 0, 0], [.3, 0, 0], .035, '#a9afae'));
    for (const x of [-.28, .28]) { const weight = p.cylinder(.15, .15, .13, c.purple, [x, 0, 0], 8); weight.rotation.z = Math.PI / 2; dumbbell.add(weight); }
    dumbbell.position.set(-1.9, .17, 1.1); dumbbell.rotation.y = -.3; add(dumbbell);
    const left = new THREE.Vector3(); const right = new THREE.Vector3(); const direction = new THREE.Vector3();
    const axis = new THREE.Vector3(1, 0, 0);
    animate = (action, time) => {
      const bench = action === 'bench';
      liftedBar.visible = bench; rackedBar.visible = !bench; handWater.visible = !bench; standingWater.visible = bench;
      handWater.rotation.x = -.2 * (.5 - .5 * Math.cos(time * Math.PI / 2));
      if (bench) {
        character.root.rotation.set(-Math.PI / 2, 0, 0); character.root.position.set(0, 1.46, 1.3);
        root.updateWorldMatrix(true, true);
        character.hands.left.getWorldPosition(left); character.hands.right.getWorldPosition(right);
        root.worldToLocal(left); root.worldToLocal(right);
        liftedBar.position.copy(left).add(right).multiplyScalar(.5);
        direction.copy(right).sub(left).normalize();
        liftedBar.quaternion.setFromUnitVectors(axis, direction);
      } else {
        character.root.rotation.set(0, -.25, 0); character.root.position.set(0, -.12, 1.09);
      }
    };
    camera.position = [7.2, 6.2, 12]; camera.target = [0, 1.25, .0]; camera.span = 6.45;
  }

  function update(action: CharacterAction, time: number) {
    character.update(action, time);
    root.updateWorldMatrix(true, true);
    animate(action, time);
  }
  const initial: Record<SceneKind, CharacterAction> = { hero: 'wave', about: 'sip', skills: 'game', projects: 'code', experience: 'rest' };
  update(initial[kind], 0);
  return { root, camera, update, dispose() { p.dispose(); character.dispose(); } };
}
