/** Small DOM bridge: the content UI does not import Three.js or wait for WebGL. */
type Picker = (clientX: number, clientY: number) => string | null;
const pickers = new Map<HTMLElement, Picker>();

export function registerScenePropPicker(element: HTMLElement, pick: Picker) {
  pickers.set(element, pick);
  element.dataset.propsReady = 'true';
}

export function pickSceneProp(element: HTMLElement, clientX: number, clientY: number) {
  if (element.dataset.rendered !== 'true' || element.dataset.propsReady !== 'true') return null;
  return pickers.get(element)?.(clientX, clientY) ?? null;
}

export function clearScenePropSurface(element: HTMLElement) {
  pickers.delete(element);
  delete element.dataset.propsReady;
  delete element.dataset.hoverProp;
  element.querySelectorAll<HTMLElement>('[data-prop-marker]').forEach(marker => {
    marker.style.visibility = 'hidden';
  });
}

export function clearScenePropPickers() {
  for (const element of pickers.keys()) clearScenePropSurface(element);
}
