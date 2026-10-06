import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.addInitScript(() => localStorage.setItem('daniel-motion', 'paused'));
});

test('language changes translate real content without resetting scene or disclosure state', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?lang=en', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-scene-kind="hero"]')).toHaveAttribute('data-rendered', 'true', { timeout: 25000 });
  const originalCanvas = await page.locator('canvas[data-engine]').elementHandle();
  await page.locator('[data-prop-kind="hero"] [data-prop-button="hero-star"]').click();
  await page.locator('.site-header .theme-button').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  const about = page.locator('[data-scene-kind="about"]');
  await about.scrollIntoViewIfNeeded();
  await expect(about).toHaveAttribute('data-rendered', 'true');
  await page.getByRole('button', { name: 'Taro', exact: true }).click();
  await page.locator('.education-card summary').click();
  await page.locator('.project-details').first().locator('summary').click();
  const clocks = await page.evaluate(() => window.__portfolio.snapshot().map(({ kind, elapsed }) => ({ kind, elapsed })));
  await page.getByRole('link', { name: 'Français', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Français', exact: true })).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page).toHaveTitle('Daniel Lam · Développeur et esprit curieux');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /étudiant en génie logiciel/);
  await expect(page.locator('.main-nav')).toContainText('Compétences');
  await expect(page.locator('#about')).toContainText('Université Concordia');
  await expect(page.locator('.skill-card h3').nth(3)).toHaveText('Infonuagique et données');
  await expect(page.locator('.project-date').first()).toHaveText('Septembre 2026');
  await expect(page.locator('.more-projects > summary')).toHaveText('Plus de projets');
  await expect(page.locator('#experience')).toContainText('plus de 30 millions d’enregistrements');
  await expect(page.locator('#experience')).toContainText('99 % de couverture');
  await expect(page.locator('#experience')).toContainText('130+ tests Robot Framework');
  await expect(page.locator('#experience')).toContainText('Temps d’exécution réduit de 60 minutes');
  await expect(page.locator('.experience-entry h3')).toHaveText(['Ericsson', 'The CSL Group Inc.', 'Ubisoft', 'Categen Ventures']);
  await expect(page.locator('.hero-resume')).toContainText('PDF · EN');
  await expect(page.locator('.hero-resume')).toHaveAttribute('aria-label', /en anglais/);
  await expect(page.locator('[data-prop-note="hero-star"]')).toContainText('Un travail d’équipe à célébrer');
  await expect(page.locator('.education-card details')).toHaveAttribute('open', '');
  await expect(page.locator('.project-details').first()).toHaveAttribute('open', '');
  await expect(about).toHaveAttribute('data-boba-flavor', 'taro');
  await expect(about).toHaveAttribute('aria-label', /thé au taro/);
  await expect(page.locator('.site-header .theme-button')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.__portfolio.snapshot().map(({ kind, elapsed }) => ({ kind, elapsed })))).toEqual(clocks);
  expect(await originalCanvas!.evaluate(node => node.isConnected)).toBe(true);
  expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);
  expect(await page.locator('body').innerText()).not.toContain('\u2014');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.project-date').first()).toHaveText('September 2026');
  await expect(page.locator('[data-prop-note="hero-star"]')).toContainText('A team effort worth celebrating');
  expect(errors).toEqual([]);
});

test('saved language, explicit links, hashes and browser history stay consistent', async ({ page }) => {
  await page.goto('/?lang=en');
  await expect(page.locator('.language-option[aria-current="true"]')).toHaveText('EN');
  await page.evaluate(() => localStorage.setItem('daniel-language', 'fr'));
  await page.goto('/?ref=portfolio#about');
  await expect(page).toHaveURL(/\/fr\/\?ref=portfolio#about$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('link', { name: 'English', exact: true })).toHaveAttribute('href', '/?ref=portfolio&lang=en#about');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL(/\?ref=portfolio&lang=en#about$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('daniel-language'))).toBe('en');
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.goForward();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'Français', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('French has useful static content and native language links without JavaScript', async ({ browser, baseURL, request }) => {
  const response = await request.get('/fr/');
  const html = await response.text();
  expect(response.ok()).toBe(true);
  expect(html).toContain('<html lang="fr">');
  expect(html).toContain('Stagiaire en développement logiciel');
  expect(html).toContain('hreflang="fr" href="https://lamdadev.github.io/fr/"');
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  try {
    const page = await context.newPage();
    await page.goto('/fr/');
    await expect(page.locator('#about')).toContainText('Université Concordia');
    await expect(page.locator('[data-prop-kind="hero"] .scene-prop-noscript')).toContainText('Bonjour de Montréal');
    await expect(page.locator('.music-player')).toBeHidden();
    await page.getByRole('link', { name: 'English', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.hero-resume')).toContainText('Download résumé');
  } finally { await context.close(); }
});

test('French navigation and player fit narrow phones through desktop widths', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/fr/');
  for (const width of [320, 390, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 560 ? 568 : 1000 });
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const control of await page.locator('.language-option, .main-nav a, .hero-actions a, .music-player button:visible').all()) {
      const rect = await control.boundingBox();
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 1);
      if (width < 900) expect(rect!.height).toBeGreaterThanOrEqual(44);
      expect(await control.evaluate(node => {
        const r = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }), `${await control.textContent()} remains unobscured`).toBe(true);
    }
    await page.locator('details').evaluateAll(nodes => nodes.forEach(node => { (node as HTMLDetailsElement).open = true; }));
    const overflow = await page.locator('.job-content, .project-body, .education-card, .contact-email').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.className));
    expect(overflow).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(page.locator('.nav-about .music-player')).toHaveCount(1);
  await page.locator('.music-expand-button').click();
  const panel = await page.locator('.music-controls').boundingBox();
  const header = await page.locator('.site-header').boundingBox();
  expect(panel!.x).toBeGreaterThanOrEqual(0);
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(320);
  expect(panel!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(568);
  await page.getByRole('link', { name: 'English', exact: true }).focus();
  await expect(page.locator('.music-controls')).toBeHidden();
  await expect(page.getByRole('link', { name: 'English', exact: true })).toBeFocused();
  await page.locator('.music-expand-button').click();
  await page.locator('.main-nav a[href="#about"]').click();
  await expect(page.locator('.music-controls')).toBeHidden();
  await expect(page).toHaveURL(/#about$/);
  await page.locator('footer').evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'end' }));
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const lastLink = page.locator('.site-footer nav a').last();
  expect(await lastLink.evaluate(node => { const r = node.getBoundingClientRect(); return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); })).toBe(true);
});

test('music is opt-in, decodes and loops, preserves playback across translation, and supports keyboard controls', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().includes('/assets/audio/')) requests.push(request.url()); });
  await page.goto('/?lang=en');
  const audio = page.locator('.music-player audio');
  await expect(page.locator('.music-play-button')).toBeVisible();
  await page.waitForTimeout(200);
  expect(requests).toEqual([]);
  expect(await audio.evaluate((node: HTMLAudioElement) => ({ paused: node.paused, time: node.currentTime, autoplay: node.autoplay }))).toEqual({ paused: true, time: 0, autoplay: false });
  await page.locator('.music-expand-button').click();
  await expect(page.getByRole('slider', { name: 'Track position' })).toBeDisabled();
  await page.locator('.music-play-button').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(.25);
  expect(requests.length).toBeGreaterThan(0);
  expect(await audio.evaluate((node: HTMLAudioElement) => node.duration)).toBeGreaterThan(50);
  const originalAudio = await audio.elementHandle();
  const beforeLanguage = await audio.evaluate((node: HTMLAudioElement) => node.currentTime);
  await page.getByRole('link', { name: 'Français', exact: true }).click();
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-label', 'Mettre la musique en pause');
  expect(await originalAudio!.evaluate(node => node.isConnected)).toBe(true);
  expect(await audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThanOrEqual(beforeLanguage);
  expect(await audio.evaluate((node: HTMLAudioElement) => node.paused)).toBe(false);
  await page.locator('.music-expand-button').click();
  await page.getByRole('button', { name: 'Couper le son', exact: true }).click();
  expect(await audio.evaluate((node: HTMLAudioElement) => node.muted)).toBe(true);
  await page.getByRole('button', { name: 'Rétablir le son', exact: true }).click();
  const volume = page.getByRole('slider', { name: 'Volume', exact: true });
  await volume.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(volume).toHaveValue('0.01');
  expect(await audio.evaluate((node: HTMLAudioElement) => node.volume)).toBe(.01);
  await page.getByRole('slider', { name: 'Position dans la piste' }).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(0);
  await audio.evaluate((node: HTMLAudioElement) => { node.currentTime = node.duration - .15; });
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeLessThan(2);
  expect(await audio.evaluate((node: HTMLAudioElement) => node.paused || !!node.error)).toBe(false);
  await page.locator('.music-play-button').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-pressed', 'false');
  const stoppedAt = await audio.evaluate((node: HTMLAudioElement) => node.currentTime);
  await page.waitForTimeout(200);
  expect(await audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBe(stoppedAt);
  await page.reload();
  await expect(page.locator('.music-play-button')).toBeVisible();
  expect(await audio.evaluate((node: HTMLAudioElement) => ({ paused: node.paused, time: node.currentTime, volume: node.volume }))).toEqual({ paused: true, time: 0, volume: .01 });
});

test('music pauses while the page is hidden and waits for an explicit resume', async ({ page }) => {
  await page.goto('/?lang=en');
  await page.locator('.music-play-button').click();
  const audio = page.locator('.music-player audio');
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(.1);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-pressed', 'false');
  const stoppedAt = await audio.evaluate((node: HTMLAudioElement) => node.currentTime);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(200);
  expect(await audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBe(stoppedAt);
  await page.locator('.music-expand-button').click();
  await expect(page.locator('.music-note')).toContainText('Paused while you were away');
  await page.locator('.music-play-button').click();
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(stoppedAt);
});

test('a rejected play request exposes an honest retry that can recover', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let rejectFirst = true;
    HTMLMediaElement.prototype.play = function () {
      if (rejectFirst) { rejectFirst = false; return Promise.reject(new DOMException('Injected playback rejection', 'NotAllowedError')); }
      return play.call(this);
    };
  });
  await page.goto('/fr/');
  await page.locator('.music-play-button').click();
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-label', 'Réessayer la musique');
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('.music-expand-button').click();
  await expect(page.locator('.music-status')).toContainText('Musique indisponible');
  await page.locator('.music-play-button').click();
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.locator('.music-player audio').evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(.1);
});
test('canceling a pending download never starts music afterward', async ({ page, request }) => {
  const track = await request.get('/assets/audio/cafe-loop.mp3');
  const trackBody = await track.body();
  let releaseTrack!: () => void;
  const released = new Promise<void>(resolve => { releaseTrack = resolve; });
  await page.route('**/assets/audio/cafe-loop.mp3', async route => {
    await released;
    await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: trackBody });
  });
  await page.goto('/?lang=en');
  await page.locator('.music-play-button').click();
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-label', 'Cancel music loading');
  await page.locator('.music-play-button').click();
  releaseTrack();
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-label', 'Play café music');
  await page.waitForTimeout(250);
  expect(await page.locator('.music-player audio').evaluate((node: HTMLAudioElement) => ({ paused: node.paused, time: node.currentTime }))).toEqual({ paused: true, time: 0 });
});

test('a failed track download is recoverable through the visible retry control', async ({ page }) => {
  let failDownload = true;
  await page.route('**/assets/audio/cafe-loop.mp3', route => {
    if (failDownload) { failDownload = false; return route.abort('failed'); }
    return route.continue();
  });
  await page.goto('/?lang=en');
  await page.locator('.music-play-button').click();
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-label', 'Retry café music');
  await page.locator('.music-expand-button').click();
  await expect(page.locator('.music-status')).toHaveText('Music unavailable');
  await page.locator('.music-play-button').click();
  await expect(page.locator('.music-play-button')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.locator('.music-player audio').evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(.1);
  await page.locator('.music-expand-button').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('.music-controls')).toBeHidden();
  await expect(page.locator('.music-expand-button')).toBeFocused();
});