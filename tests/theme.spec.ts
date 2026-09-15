import { expect, test, type Page } from '@playwright/test';

const kinds = ['hero', 'about', 'skills', 'projects', 'experience'] as const;
const headerToggle = (page: Page) => page.locator('.site-header').getByRole('button', { name: 'Night shift', exact: true });
const mix = (page: Page) => page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--night-mix')));
const clocks = (page: Page) => page.evaluate(() => window.__portfolio.snapshot().map(({ kind, elapsed }) => ({ kind, elapsed })));

async function visit(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(headerToggle(page)).toBeEnabled();
  await expect(page.locator('html')).toHaveAttribute('data-theme-ready', 'true');
}

async function rendered(page: Page, kind: typeof kinds[number]) {
  const slot = page.locator(`[data-scene-kind="${kind}"]`);
  await slot.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(slot).toHaveAttribute('data-rendered', 'true', { timeout: 25000 });
  return slot;
}

async function settled(page: Page, target: 0 | 1) {
  await expect.poll(() => mix(page)).toBeCloseTo(target, 4);
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test('day and night interpolate the UI and paused diorama, and a quick reversal continues from its current color', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('daniel-motion', 'paused'));
  await visit(page);
  const hero = await rendered(page, 'hero');
  const originalCanvas = await page.locator('canvas[data-engine]').elementHandle();
  const before = await clocks(page);

  // Sample actual painted CSS values, not just the target theme attribute.
  const transition = await page.evaluate(async () => {
    const root = document.documentElement;
    const button = document.querySelector<HTMLButtonElement>('.site-header button[aria-label="Night shift"]')!;
    const read = () => ({
      mix: Number.parseFloat(getComputedStyle(root).getPropertyValue('--night-mix')),
      sceneMix: Number(document.querySelector<HTMLElement>('[data-scene-kind="hero"]')!.dataset.nightMix),
      background: getComputedStyle(root).backgroundColor,
    });
    const initial = read();
    button.click();
    const frames = [read()];
    const deadline = performance.now() + 5000;
    while (performance.now() < deadline && frames.at(-1)!.mix < .9999) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      frames.push(read());
    }
    return { initial, frames };
  });
  expect(transition.initial.mix).toBe(0);
  expect(transition.frames[0].mix, 'The first paint does not snap to night').toBeLessThan(.05);
  expect(transition.frames.at(-1)!.mix).toBeCloseTo(1, 4);
  const intermediate = transition.frames.filter(frame => frame.mix > .05 && frame.mix < .95);
  expect(intermediate.length, 'Visitors see intermediate colors').toBeGreaterThan(0);
  expect(transition.frames.some(frame => frame.sceneMix > .05 && frame.sceneMix < .95), 'The paused 3D lighting also renders intermediate states').toBeTruthy();
  expect(intermediate.some(frame => frame.background !== transition.initial.background && frame.background !== transition.frames.at(-1)!.background)).toBeTruthy();
  await expect.poll(() => hero.evaluate(node => Number((node as HTMLElement).dataset.nightMix))).toBe(1);
  await expect.poll(() => page.evaluate(() => window.__portfolio.theme().mix)).toBe(1);
  expect(await clocks(page)).toEqual(before);
  expect(await originalCanvas!.evaluate(node => node.isConnected)).toBeTruthy();
  expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);

  const reversal = await page.evaluate(async () => {
    const button = document.querySelector<HTMLButtonElement>('.site-header button[aria-label="Night shift"]')!;
    const read = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--night-mix'));
    button.click(); // Begin returning to day.
    const deadline = performance.now() + 5000;
    while (performance.now() < deadline && read() > .7) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
    const beforeReverse = read();
    button.click(); // Change our mind before the previous fade finishes.
    const immediatelyAfter = read();
    const frames = [immediatelyAfter];
    while (performance.now() < deadline && frames.at(-1)! < .9999) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      frames.push(read());
    }
    return { beforeReverse, immediatelyAfter, frames };
  });
  expect(reversal.beforeReverse).toBeGreaterThan(.05);
  expect(reversal.beforeReverse).toBeLessThan(.95);
  expect(Math.abs(reversal.immediatelyAfter - reversal.beforeReverse), 'Reversing has no jump to either endpoint').toBeLessThan(.05);
  expect(reversal.frames.at(-1)!).toBeCloseTo(1, 4);
  expect(await clocks(page)).toEqual(before);
  await headerToggle(page).click();
  await settled(page, 0);
  await expect.poll(() => hero.evaluate(node => Number((node as HTMLElement).dataset.nightMix))).toBe(0);
});

test('all five enlarged scenes share the night setting, preserve the boba choice, and keep readable text', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('daniel-motion', 'paused'));
  await visit(page);
  await page.locator('#about').getByRole('button', { name: 'Taro', exact: true }).click();
  await headerToggle(page).click();
  await settled(page, 1);
  const before = await clocks(page);

  for (const kind of kinds) {
    const original = await rendered(page, kind);
    await expect.poll(() => original.evaluate(node => Number((node as HTMLElement).dataset.nightMix))).toBe(1);
    const trigger = page.locator(`.explore-scene-button[data-explore-kind="${kind}"]`);
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('dialog.scene-explorer');
    const stage = dialog.locator('.scene-explorer-stage');
    await expect(stage).toHaveAttribute('data-rendered', 'true');
    await expect.poll(() => stage.evaluate(node => Number((node as HTMLElement).dataset.nightMix))).toBe(1);
    const toggle = dialog.getByRole('button', { name: 'Night shift', exact: true });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    if (kind === 'about') await expect(stage).toHaveAttribute('data-boba-flavor', 'taro');
    if (kind === 'projects') {
      await toggle.click();
      await settled(page, 0);
      await expect.poll(() => stage.evaluate(node => Number((node as HTMLElement).dataset.nightMix))).toBe(0);
      await toggle.click();
      await settled(page, 1);
      await expect.poll(() => stage.evaluate(node => Number((node as HTMLElement).dataset.nightMix))).toBe(1);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(headerToggle(page)).toHaveAttribute('aria-pressed', 'true');
  }
  expect(await clocks(page)).toEqual(before);
  expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);
  await expect(page.locator('#about').getByRole('button', { name: 'Taro', exact: true })).toHaveAttribute('aria-pressed', 'true');

  // Representative solid-background text pairs; this is not a full accessibility audit.
  const contrast = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const luminance = (rgb: number[]) => rgb.slice(0, 3).map(channel => {
      const normalized = channel / 255;
      return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
    }).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
    return ['.hero-value', '.skill-card li', '.main-nav a'].map(selector => {
      const element = document.querySelector<HTMLElement>(selector)!;
      const ancestors: HTMLElement[] = [];
      for (let node: HTMLElement | null = element; node; node = node.parentElement) ancestors.unshift(node);
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = '#fff';
      context.fillRect(0, 0, 1, 1);
      for (const node of ancestors) {
        context.fillStyle = getComputedStyle(node).backgroundColor;
        context.fillRect(0, 0, 1, 1);
      }
      const background = luminance(Array.from(context.getImageData(0, 0, 1, 1).data));
      context.fillStyle = getComputedStyle(element).color;
      context.fillRect(0, 0, 1, 1);
      const foreground = luminance(Array.from(context.getImageData(0, 0, 1, 1).data));
      return { selector, ratio: (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05) };
    });
  });
  for (const { selector, ratio } of contrast) expect(ratio, `${selector} night text contrast`).toBeGreaterThanOrEqual(4.5);
});

test('the keyboard toggle persists and restores night colors before application JavaScript loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text()); });
  await visit(page);
  const toggle = headerToggle(page);
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await settled(page, 1);
  expect(await page.evaluate(() => localStorage.getItem('daniel-theme'))).toBe('night');
  const nightBackground = await page.locator('html').evaluate(node => getComputedStyle(node).backgroundColor);

  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/assets\/[^/?]+\.js(?:\?.*)?$/, async route => { await hold; await route.continue(); });
  try {
    await page.reload({ waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await expect.poll(() => page.locator('html').evaluate(node => getComputedStyle(node).backgroundColor)).toBe(nightBackground);
    expect(await mix(page)).toBe(1);
    expect(await page.evaluate(() => typeof window.__portfolio)).toBe('undefined');
  } finally { release(); }
  await expect(headerToggle(page)).toBeEnabled();
  await expect(headerToggle(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme-ready', 'true');
  await rendered(page, 'hero');
  expect(errors).toEqual([]);
});

test('reduced motion switches immediately and both theme controls fit a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await visit(page);
  await rendered(page, 'hero');
  const before = await clocks(page);
  await headerToggle(page).focus();
  await page.keyboard.press('Enter');
  expect(await mix(page)).toBe(1);
  expect(await page.locator('html').evaluate(node => node.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  const headerBounds = await headerToggle(page).boundingBox();
  expect(headerBounds!.x).toBeGreaterThanOrEqual(0);
  expect(headerBounds!.x + headerBounds!.width).toBeLessThanOrEqual(320);
  expect(headerBounds!.height).toBeGreaterThanOrEqual(44);

  const trigger = page.locator('.explore-scene-button[data-explore-kind="projects"]');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('dialog.scene-explorer');
  const stage = dialog.locator('.scene-explorer-stage');
  await expect(stage).toHaveAttribute('data-rendered', 'true');
  const toggle = dialog.getByRole('button', { name: 'Night shift', exact: true });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeFocused();
  expect(await mix(page)).toBe(0);
  await expect.poll(() => stage.evaluate(node => Number((node as HTMLElement).dataset.nightMix))).toBe(0);
  expect(await clocks(page)).toEqual(before);
  for (const button of await dialog.locator('button:visible').all()) {
    const bounds = await button.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(760);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(headerToggle(page)).toHaveAttribute('aria-pressed', 'false');
});

test('without WebGL the night palette and tinted flavor previews still work in the page and viewer', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /webgl/i.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      }, configurable: true,
    });
  });
  await visit(page);
  await page.locator('#about').getByRole('button', { name: 'Matcha', exact: true }).click();
  const preview = page.locator('[data-scene-kind="about"] img');
  await expect(preview).toBeVisible();
  const dayFilter = await preview.evaluate(node => getComputedStyle(node).filter);
  await headerToggle(page).click();
  await settled(page, 1);
  await expect(preview).toHaveAttribute('src', '/previews/about-matcha.png');
  await expect.poll(() => preview.evaluate(node => getComputedStyle(node).filter)).not.toBe(dayFilter);
  const trigger = page.locator('.explore-scene-button[data-explore-kind="about"]');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('dialog.scene-explorer');
  const enlarged = dialog.locator('.scene-explorer-preview');
  await expect(enlarged).toBeVisible();
  await expect(enlarged).toHaveAttribute('src', '/previews/about-matcha.png');
  await expect.poll(() => enlarged.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await enlarged.evaluate(node => getComputedStyle(node).filter)).not.toBe(dayFilter);
  await expect(dialog.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  const toggle = dialog.getByRole('button', { name: 'Night shift', exact: true });
  await expect(toggle).toBeEnabled();
  await toggle.click();
  await settled(page, 0);
  await expect.poll(() => enlarged.evaluate(node => getComputedStyle(node).filter)).toBe(dayFilter);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(preview).toBeVisible();
});
