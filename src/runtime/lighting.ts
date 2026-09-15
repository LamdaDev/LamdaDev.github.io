import { AmbientLight, Color, DirectionalLight, HemisphereLight, Scene } from 'three';

/** Day keeps the original lighting; night adds a warm key and a soft violet rim. */
export function createLighting(scene: Scene) {
  const ambient = new AmbientLight('#fff9f0', .8);
  const hemisphere = new HemisphereLight('#fff9ef', '#a394ad', .8);
  const key = new DirectionalLight('#fff4e4', 2.5);
  key.position.set(-4, 8, 6);
  const fill = new DirectionalLight('#dcd6ff', .8);
  fill.position.set(5, 4, -3);
  ambient.name = 'room-ambient'; hemisphere.name = 'room-hemisphere';
  key.name = 'room-warm-key'; fill.name = 'room-violet-fill';
  scene.add(ambient, hemisphere, key, fill);
  const day = {
    ambient: ambient.color.clone(), sky: hemisphere.color.clone(), ground: hemisphere.groundColor.clone(),
    key: key.color.clone(), fill: fill.color.clone(),
  };
  const night = {
    ambient: new Color('#b7b1e3'), sky: new Color('#a6a0db'), ground: new Color('#49364c'),
    key: new Color('#ffd3a2'), fill: new Color('#969ef2'),
  };
  let previous = -1;
  return {
    update(mix: number) {
      if (mix === previous) return;
      previous = mix;
      ambient.color.lerpColors(day.ambient, night.ambient, mix);
      hemisphere.color.lerpColors(day.sky, night.sky, mix);
      hemisphere.groundColor.lerpColors(day.ground, night.ground, mix);
      key.color.lerpColors(day.key, night.key, mix);
      fill.color.lerpColors(day.fill, night.fill, mix);
      ambient.intensity = .8 + (.24 - .8) * mix;
      hemisphere.intensity = .8 + (.36 - .8) * mix;
      key.intensity = 2.5 + (.9 - 2.5) * mix;
      fill.intensity = .8 + (.65 - .8) * mix;
    },
  };
}
