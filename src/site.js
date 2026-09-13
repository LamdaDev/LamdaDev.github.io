(() => {
  const toggle = document.getElementById('motion-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('daniel-motion') === 'paused'; } catch (_) {}

  function updateMotion() {
    const paused = userPaused || reduced.matches;
    document.documentElement.dataset.motion = paused ? 'paused' : 'running';
    toggle.hidden = false;
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    const label = reduced.matches ? 'Animations reduced by your device settings' : paused ? 'Play animations' : 'Pause animations';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.querySelector('.motion-glyph').textContent = paused ? '▷' : 'Ⅱ';
  }

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('daniel-motion', userPaused ? 'paused' : 'running'); } catch (_) {}
    updateMotion();
  });
  reduced.addEventListener('change', updateMotion);
  updateMotion();

  const links = [...document.querySelectorAll('.nav-links a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).at(-1);
      if (!current) return;
      links.forEach(link => {
        if (link.hash === '#' + current.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();
