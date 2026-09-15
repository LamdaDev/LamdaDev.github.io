import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

const kinds = ['hero', 'about', 'skills', 'projects', 'experience'] as const;
type Kind = typeof kinds[number];
const triggerFor = (page: Page, kind: Kind) => page.locator(`.explore-scene-button[data-explore-kind="${kind}"]`);
const dialogFor = (page: Page) => page.locator('dialog.scene-explorer');
const stageFor = (page: Page) => dialogFor(page).locator('.scene-explorer-stage');
const camera = (page: Page) => page.evaluate(() => window.__portfolio.exploration());
const clocks = (page: Page) => page.evaluate(() => window.__portfolio.snapshot().map(({ kind, elapsed }) => ({ kind, elapsed })));

async function expectCameraReset(page: Page, initial: NonNullable<Awaited<ReturnType<typeof camera>>>) {
  for (const property of ['azimuth', 'polar', 'zoom'] as const) {
    await expect.poll(async () => (await camera(page))?.[property]).toBeCloseTo(initial[property], 7);
  }
}

async function visit(page: Page, paused = false) {
  if (paused) await page.addInitScript(() => localStorage.setItem('daniel-motion', 'paused'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(triggerFor(page, 'hero')).toBeEnabled();
}

async function openScene(page: Page, kind: Kind, live = true) {
  const trigger = triggerFor(page, kind);
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = dialogFor(page);
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('open', '');
  if (live) await expect(stageFor(page)).toHaveAttribute('data-rendered', 'true', { timeout: 25000 });
  return { dialog, stage: stageFor(page), trigger };
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test('all five scenes open by keyboard, contain focus, and restore their trigger and shared renderer on Escape', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await visit(page, true);
  await expect(page.locator('[data-scene-kind="hero"]')).toHaveAttribute('data-rendered', 'true', { timeout: 25000 });
  const originalCanvas = await page.locator('canvas[data-engine]').elementHandle();
  expect(originalCanvas).not.toBeNull();
  await expect(page.locator('.explore-scene-button')).toHaveCount(5);

  for (const kind of kinds) {
    const { dialog, trigger } = await openScene(page, kind);
    await expect(dialog).toHaveAccessibleName(/.+/);
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBeTruthy();
    expect(await originalCanvas!.evaluate(node => !!node.closest('dialog[open]'))).toBeTruthy();
    expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);
    expect((await camera(page))?.kind).toBe(kind);

    if (kind === 'about') {
      const focusable = dialog.locator('button:enabled:visible, [tabindex="0"]:visible');
      const first = focusable.first();
      const last = focusable.last();
      await first.focus();
      await page.keyboard.press('Shift+Tab');
      await expect(last).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(first).toBeFocused();
      // showModal makes the underlying portfolio inert, including script-requested focus.
      await page.locator('.hero-actions a').first().evaluate(node => (node as HTMLElement).focus());
      expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBeTruthy();
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(await camera(page)).toBeNull();
    expect(await originalCanvas!.evaluate(node => node.isConnected && !node.closest('dialog'))).toBeTruthy();
    await expect(page.locator(`[data-scene-kind="${kind}"]`)).toHaveAttribute('data-rendered', 'true');
  }
  expect(errors).toEqual([]);
});

test('keyboard, pointer drag, and zoom change the actual diorama view, and Reset restores its framing', async ({ page }) => {
  await visit(page, true);
  const { dialog, stage } = await openScene(page, 'projects');
  await stage.focus();
  const initial = await camera(page);
  expect(initial).not.toBeNull();
  const initialImage = createHash('sha256').update(await stage.screenshot()).digest('hex');

  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await camera(page))?.azimuth).not.toBe(initial!.azimuth);
  const rotatedImage = createHash('sha256').update(await stage.screenshot()).digest('hex');
  expect(rotatedImage, 'The render changes with the camera, while character animation is paused').not.toBe(initialImage);
  await page.keyboard.press('ArrowUp');
  await expect.poll(async () => (await camera(page))?.polar).not.toBe(initial!.polar);
  await page.keyboard.press('+');
  await expect.poll(async () => (await camera(page))?.zoom).toBeGreaterThan(initial!.zoom);
  await page.keyboard.press('Home');
  await expectCameraReset(page, initial!);

  const bounds = await stage.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + bounds!.width * .5;
  const y = bounds!.y + bounds!.height * .5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 100, y + 35, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await camera(page))?.azimuth).not.toBe(initial!.azimuth);
  await page.mouse.wheel(0, -180);
  await expect.poll(async () => (await camera(page))?.zoom).toBeGreaterThan(initial!.zoom);
  await dialog.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expectCameraReset(page, initial!);
  await dialog.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await expect.poll(async () => (await camera(page))?.zoom).toBeLessThan(initial!.zoom);
  await dialog.getByRole('button', { name: 'Close scene viewer', exact: true }).click();
  await expect(triggerFor(page, 'projects')).toBeFocused();
});

test('the enlarged boba shop retains its flavor and animation, pauses other scenes, and restores page scroll', async ({ page }) => {
  await visit(page);
  const picker = page.locator('#about').getByRole('group', { name: /Choose Daniel.*boba/ });
  await picker.getByRole('button', { name: 'Taro', exact: true }).click();
  const original = page.locator('[data-scene-kind="about"]');
  await expect(original).toHaveAttribute('data-action', 'sip', { timeout: 25000 });
  const trigger = triggerFor(page, 'about');
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Enter');
  const dialog = dialogFor(page);
  const stage = stageFor(page);
  await expect(stage).toHaveAttribute('data-rendered', 'true');
  await expect(stage).toHaveAttribute('data-boba-flavor', 'taro');
  await expect(stage).toHaveAttribute('data-action', 'sip');
  const before = await clocks(page);
  await page.waitForTimeout(350);
  const after = await clocks(page);
  expect(after.filter(item => item.kind !== 'about')).toEqual(before.filter(item => item.kind !== 'about'));
  expect(after.find(item => item.kind === 'about')!.elapsed).toBeGreaterThan(before.find(item => item.kind === 'about')!.elapsed);

  const scrollLocked = await page.evaluate(() => window.scrollY);
  await page.mouse.move(5, 5);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollLocked);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollBefore, 0);
  await expect(original).toHaveAttribute('data-action', 'sip');
  await expect(original).toHaveAttribute('data-boba-flavor', 'taro');
  await expect(picker.getByRole('button', { name: 'Taro', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('a narrow phone viewer fits its controls and allows deliberate touch rotation with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await visit(page);
  const { dialog, stage } = await openScene(page, 'experience');
  await expect(stage).toHaveAttribute('data-action', 'rest');
  const before = await clocks(page);
  const initial = await camera(page);
  expect(initial).not.toBeNull();
  expect(await dialog.evaluate(node => node.scrollWidth)).toBeLessThanOrEqual(320);
  for (const control of await dialog.locator('button:visible').all()) {
    const bounds = await control.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(760);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  const bounds = await stage.boundingBox();
  const x = bounds!.x + bounds!.width * .4;
  const y = bounds!.y + bounds!.height * .5;
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 5; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + step * 10, y: y + step * 2 }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
  await expect.poll(async () => (await camera(page))?.azimuth).not.toBe(initial!.azimuth);
  expect(await clocks(page)).toEqual(before);
  await dialog.getByRole('button', { name: 'Close scene viewer', exact: true }).click();
  await expect(triggerFor(page, 'experience')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test('without WebGL, an enlarged flavor-specific preview and keyboard close remain available', async ({ page }) => {
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
  const { dialog, stage, trigger } = await openScene(page, 'about', false);
  const image = stage.locator('img');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', '/previews/about-matcha.png');
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(dialog.getByRole('button', { name: 'Reset view', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Close scene viewer', exact: true })).toBeEnabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('[data-scene-kind="about"] img')).toBeVisible();
});

test('losing WebGL while exploring restores the enlarged preview without trapping the visitor', async ({ page }) => {
  await visit(page, true);
  const { dialog, stage, trigger } = await openScene(page, 'skills');
  const supported = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-engine]');
    const extension = canvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context');
    if (!extension) return false;
    extension.loseContext();
    return true;
  });
  test.skip(!supported, 'This browser does not expose WEBGL_lose_context.');
  await expect(stage).not.toHaveAttribute('data-rendered', 'true');
  await expect(stage.locator('img')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Reset view', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Close scene viewer', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('[data-scene-kind="skills"] img')).toBeVisible();
});
