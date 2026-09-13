/* One clock per vignette. Time only advances while its SVG is actually visible.
 * display-based states create intentional hard cuts between complete poses. */
(() => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...document.querySelectorAll('svg[data-scene]')].map(svg => ({
    svg, kind: svg.dataset.scene, elapsed: 0, visible: false, ordered: false
  }));
  const staticStates = { hero: 'wave', about: 'sip', skills: 'game', projects: 'code', experience: 'rest' };
  let lastTime = 0;
  let request = 0;
  const paused = () => document.hidden || document.documentElement.dataset.motion === 'paused' || motionQuery.matches;
  function stateFor(item) {
    if (motionQuery.matches) return staticStates[item.kind];
    const time = item.elapsed;
    if (item.kind === 'about') {
      if (time >= 2400) item.ordered = true;
      return item.ordered ? 'sip' : 'order';
    }
    if (item.kind === 'projects') return time % 11000 < 6000 ? 'code' : time % 11000 < 8000 ? 'drink' : 'nap';
    if (item.kind === 'experience') return time % 9000 < 5000 ? 'bench' : 'rest';
    return staticStates[item.kind];
  }
  function update(item) {
    const state = stateFor(item);
    if (item.svg.dataset.state !== state) item.svg.dataset.state = state;
    item.svg.dataset.running = String(item.visible && !paused());
  }
  function frame(now) {
    const delta = lastTime ? Math.min(now - lastTime, 100) : 0;
    lastTime = now;
    items.forEach(item => {
      if (item.visible && !paused()) item.elapsed += delta;
      update(item);
    });
    if (!paused() && items.some(item => item.visible)) request = requestAnimationFrame(frame);
    else { request = 0; lastTime = 0; }
  }
  function refresh() {
    items.forEach(update);
    if (!request && !paused() && items.some(item => item.visible)) request = requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { const item = items.find(candidate => candidate.svg === entry.target); item.visible = entry.isIntersecting; });
      refresh();
    }, { threshold: 0 });
    items.forEach(item => observer.observe(item.svg));
  } else { items.forEach(item => { item.visible = true; }); }
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  document.addEventListener('visibilitychange', () => { lastTime = 0; refresh(); });
  motionQuery.addEventListener('change', refresh);
  Object.defineProperty(window, 'portfolioScenes', { get: () => items.map(({ kind, elapsed, visible, ordered, svg }) => ({ kind, elapsed, visible, ordered, state: svg.dataset.state, running: svg.dataset.running === 'true' })) });
  refresh();
})();
