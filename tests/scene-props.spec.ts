import { expect, test, type Locator, type Page } from '@playwright/test';

const props = {
  hero: ['hero-greeting', 'hero-gamepad', 'hero-star'],
  about: ['about-menu', 'about-drink', 'about-shelf'],
  skills: ['skills-monitor', 'skills-tower', 'skills-keyboard'],
  projects: ['projects-monitor', 'projects-drink', 'projects-lamp'],
  experience: ['experience-barbell', 'experience-water', 'experience-towel'],
} as const;
type Kind = keyof typeof props;
const kinds = Object.keys(props) as Kind[];
const detailsFor = (page: Page, kind: Kind) => page.locator(`main .scene-prop-details[data-prop-kind="${kind}"]`);
const noteFor = (scope: Locator, id?: string) => scope.locator(id ? `[data-prop-note="${id}"]` : '[data-prop-note]');
const clocks = (page: Page) => page.evaluate(() => window.__portfolio.snapshot().map(({ kind, elapsed }) => ({ kind, elapsed })));

async function visit(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(detailsFor(page, 'hero').locator('[data-prop-button]').first()).toBeEnabled();
}

async function scene(page: Page, kind: Kind) {
  const surface = page.locator(`[data-scene-kind="${kind}"]`);
  await surface.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(surface).toHaveAttribute('data-rendered', 'true', { timeout: 25000 });
  // A paused renderer still needs a paint to reproject props after a scroll.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  return surface;
}

async function waitForScrollToSettle(page: Page) {
  const settled = await page.evaluate(() => new Promise<boolean>(resolve => {
    let lastY = window.scrollY;
    let stableFrames = 0;
    const deadline = performance.now() + 3000;
    const observe = () => {
      const nextY = window.scrollY;
      stableFrames = Math.abs(nextY - lastY) < .1 ? stableFrames + 1 : 0;
      lastY = nextY;
      if (stableFrames >= 8) resolve(true);
      else if (performance.now() >= deadline) resolve(false);
      else requestAnimationFrame(observe);
    };
    requestAnimationFrame(observe);
  }));
  expect(settled, 'The native touch fling finishes before a deliberate tap is located').toBeTruthy();
}

// These empty projection anchors have no painted UI. Their coordinates identify
// eligible model surfaces for exercising the visitor's pointer/raycast path.
async function eligibleProjectedAnchor(surface: Locator) {
  const read = () => surface.locator('[data-prop-marker]').evaluateAll(markers => {
    for (const marker of markers) {
      const style = getComputedStyle(marker);
      const rect = marker.getBoundingClientRect();
      const parent = marker.closest('[data-scene-kind], .scene-explorer-stage')!.getBoundingClientRect();
      const x = rect.x + rect.width / 2;
      const y = rect.y + rect.height / 2;
      if (style.visibility === 'hidden' || style.display === 'none' || !rect.width || !rect.height) continue;
      if (x <= Math.max(0, parent.left) || x >= Math.min(innerWidth, parent.right)) continue;
      if (y <= Math.max(0, parent.top) || y >= Math.min(innerHeight, parent.bottom)) continue;
      return { id: (marker as HTMLElement).dataset.propMarker!, x, y };
    }
    return null;
  });
  await expect.poll(read, { message: 'At least one eligible projected anchor is present in this camera view', timeout: 15000 }).not.toBeNull();
  return (await read())!;
}

async function expectUnobstructedArtwork(surface: Locator) {
  const anchors = await surface.locator('[data-prop-marker]').evaluateAll(nodes => nodes.map(node => {
    const style = getComputedStyle(node);
    return {
      text: node.textContent?.trim(), children: node.childElementCount,
      background: style.backgroundColor, backgroundImage: style.backgroundImage,
      shadow: style.boxShadow, borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(parseFloat),
      before: getComputedStyle(node, '::before').content, after: getComputedStyle(node, '::after').content,
    };
  }));
  expect(anchors).toHaveLength(3);
  for (const anchor of anchors) {
    expect(anchor.text, 'No plus-sign or other overlay text covers the prop').toBe('');
    expect(anchor.children).toBe(0);
    expect(anchor.background).toBe('rgba(0, 0, 0, 0)');
    expect(anchor.backgroundImage).toBe('none');
    expect(anchor.shadow).toBe('none');
    expect(anchor.borders).toEqual([0, 0, 0, 0]);
    expect(['none', 'normal']).toContain(anchor.before);
    expect(['none', 'normal']).toContain(anchor.after);
  }
}

async function openScene(page: Page, kind: Kind, live = true) {
  const trigger = page.locator(`.explore-scene-button[data-explore-kind="${kind}"]`);
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('dialog.scene-explorer');
  await expect(dialog).toBeVisible();
  const surface = dialog.locator('.scene-explorer-stage');
  if (live) await expect(surface).toHaveAttribute('data-rendered', 'true', { timeout: 25000 });
  return { dialog, surface, trigger };
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test('clicking real props in all five paused dioramas reveals the corresponding personal detail', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('daniel-motion', 'paused'));
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await visit(page);
  await scene(page, 'hero');
  const before = await clocks(page);

  for (const kind of kinds) {
    const surface = await scene(page, kind);
    const target = await eligibleProjectedAnchor(surface);
    await expectUnobstructedArtwork(surface);
    await page.mouse.click(target.x, target.y);
    const details = detailsFor(page, kind);
    const note = noteFor(details, target.id);
    await expect(note).toBeVisible();
    await expect(note).toContainText(/\S/);
    await expect(details.locator(`[data-prop-button="${target.id}"]`)).toHaveAttribute('aria-expanded', 'true');
    await expect(details.locator('.scene-prop-announcement')).toHaveAttribute('aria-live', 'polite');
    await expect(noteFor(details)).toHaveCount(1);
    await note.getByRole('button', { name: 'Close personal detail', exact: true }).click();
    await expect(note).toHaveCount(0);
    await expect(details.locator(`[data-prop-button="${target.id}"]`)).toBeFocused();
  }

  expect(await clocks(page)).toEqual(before);
  expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);
  expect(errors).toEqual([]);
});

test('all fifteen details have named keyboard alternatives, one note at a time, and predictable focus restoration', async ({ page }) => {
  await visit(page);
  await expect(page.locator('main [data-prop-button]')).toHaveCount(15);
  for (const kind of kinds) {
    const details = detailsFor(page, kind);
    for (const [index, id] of props[kind].entries()) {
      const button = details.locator(`[data-prop-button="${id}"]`);
      await expect(button).toHaveAccessibleName(/\S/);
      await button.focus();
      await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
      const note = noteFor(details, id);
      await expect(note).toBeVisible();
      await expect(noteFor(details)).toHaveCount(1);
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      const controlledId = await button.getAttribute('aria-controls');
      expect(controlledId).toBeTruthy();
      expect(await page.evaluate(controlled => !!document.getElementById(controlled!), controlledId)).toBeTruthy();
      await note.getByRole('button', { name: 'Close personal detail', exact: true }).focus();
      await page.keyboard.press(index % 2 ? 'Enter' : 'Escape');
      await expect(note).toHaveCount(0);
      await expect(button).toBeFocused();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  }

  const hero = detailsFor(page, 'hero');
  await hero.locator('[data-prop-button="hero-greeting"]').click();
  await hero.locator('[data-prop-button="hero-gamepad"]').click();
  await expect(noteFor(hero, 'hero-greeting')).toHaveCount(0);
  await expect(noteFor(hero, 'hero-gamepad')).toBeVisible();
  await hero.locator('[data-prop-button="hero-gamepad"]').click();
  await expect(noteFor(hero)).toHaveCount(0);
});

test('explorer rotation never opens an accidental note and Escape dismisses a detail before the viewer', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('daniel-motion', 'paused'));
  await visit(page);
  const { dialog, surface, trigger } = await openScene(page, 'about');
  const before = await eligibleProjectedAnchor(surface);
  const cameraBefore = await page.evaluate(() => window.__portfolio.exploration());
  // Start directly on a prop: moving the pointer must be a rotation, never a click.
  await page.mouse.move(before.x, before.y);
  await page.mouse.down();
  await page.mouse.move(before.x + 75, before.y + 15, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.__portfolio.exploration()?.azimuth)).not.toBe(cameraBefore!.azimuth);
  await expect(noteFor(dialog)).toHaveCount(0);
  await surface.focus();
  await page.keyboard.press('ArrowRight');
  const after = await eligibleProjectedAnchor(surface);
  expect(Math.hypot(after.x - before.x, after.y - before.y), 'Eligible projected anchors follow the camera').toBeGreaterThan(2);
  await expectUnobstructedArtwork(surface);
  await page.mouse.click(after.x, after.y);
  await expect(noteFor(dialog, after.id)).toBeVisible();
  await expect(noteFor(dialog)).toHaveCount(1);

  // A real keyboard Escape invokes the native dialog cancellation path, rather
  // than calling a component handler directly.
  await surface.focus();
  await page.keyboard.press('Escape');
  await expect(noteFor(dialog)).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(`[data-prop-button="${after.id}"]`)).toBeFocused();
  const duplicates = await page.locator('[id]').evaluateAll(nodes => {
    const ids = nodes.map(node => node.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicates).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(noteFor(detailsFor(page, 'about'))).toHaveCount(0);
});

test('a 320px phone can scroll across props and deliberately tap them with reduced motion and night shift', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('daniel-theme', 'night'));
  await visit(page);
  const surface = await scene(page, 'about');
  const first = await eligibleProjectedAnchor(surface);
  const before = await clocks(page);
  const initialScroll = await page.evaluate(() => window.scrollY);
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: first.x, y: first.y }] });
    for (let step = 1; step <= 5; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: first.x, y: first.y - step * 18 }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialScroll);
    await expect(noteFor(detailsFor(page, 'about'))).toHaveCount(0);
    await waitForScrollToSettle(page);
    await scene(page, 'about');
    const target = await eligibleProjectedAnchor(surface);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: target.x, y: target.y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(noteFor(detailsFor(page, 'about'), target.id)).toBeVisible();
  } finally { await session.detach(); }

  for (const kind of kinds) {
    const details = detailsFor(page, kind);
    for (const button of await details.locator('[data-prop-button]').all()) {
      const bounds = await button.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    }
    await details.locator('[data-prop-button]').first().click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  expect(await clocks(page)).toEqual(before);
  const { dialog } = await openScene(page, 'experience');
  const button = dialog.locator('[data-prop-button="experience-water"]');
  await button.click();
  await expect(noteFor(dialog, 'experience-water')).toBeVisible();
  expect(await dialog.evaluate(node => node.scrollWidth)).toBeLessThanOrEqual(320);
  await expect(dialog.getByRole('button', { name: 'Night shift', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await noteFor(dialog).getByRole('button', { name: 'Close personal detail', exact: true }).click();
  await expect(button).toBeFocused();
});

test('without WebGL, personal details work in every section and in the enlarged preview', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /webgl/i.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      }, configurable: true,
    });
  });
  await visit(page);
  for (const kind of kinds) {
    const details = detailsFor(page, kind);
    const id = props[kind][0];
    const button = details.locator(`[data-prop-button="${id}"]`);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(noteFor(details, id)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(noteFor(details)).toHaveCount(0);
    await expect(button).toBeFocused();
  }
  await expect(page.locator('[data-prop-marker]:visible')).toHaveCount(0);
  const { dialog, surface, trigger } = await openScene(page, 'skills', false);
  await expect(surface.locator('img')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Rotate right', exact: true })).toBeDisabled();
  const button = dialog.locator('[data-prop-button="skills-monitor"]');
  await expect(button).toBeEnabled();
  await button.focus();
  await page.keyboard.press('Space');
  await expect(noteFor(dialog, 'skills-monitor')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(button).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('the prerendered page does not offer enabled personal-detail controls without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 390, height: 844 } });
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  const page = await context.newPage();
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main [data-prop-button]')).toHaveCount(15);
    for (const button of await page.locator('main [data-prop-button]').all()) await expect(button).toBeDisabled();
    await expect(page.locator('[data-prop-marker]:visible')).toHaveCount(0);
    for (const kind of kinds) {
      const fallback = detailsFor(page, kind).locator('.scene-prop-noscript');
      await expect(fallback).toBeVisible();
      await expect(fallback).toContainText(/JavaScript is off/i);
      await expect(fallback.locator('li')).toHaveCount(3);
    }
    await expect(page.locator('.project-card')).toHaveCount(3);
    await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:lam.daniel.123@hotmail.com');
  } finally { await context.close(); }
});
