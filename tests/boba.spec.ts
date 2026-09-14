import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

async function visitBoba(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const picker = page.getByRole('group', { name: 'Choose Daniel’s boba' });
  await picker.scrollIntoViewIfNeeded();
  await expect(picker.getByRole('button', { name: 'Milk tea', exact: true })).toBeEnabled();
  return { picker, scene: page.locator('[data-scene-kind="about"]') };
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test('all flavors change the rendered cup while paused without restarting the boba introduction', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const { picker, scene } = await visitBoba(page);
  await expect(scene).toHaveAttribute('data-action', 'sip', { timeout: 25000 });
  await page.getByRole('button', { name: 'Pause animations', exact: true }).click();
  await expect(scene).toHaveAttribute('data-running', 'false');
  const clockBefore = await page.evaluate(() => window.__portfolio.snapshot().find(item => item.kind === 'about')!.elapsed);
  // Hold one pose to ensure screenshot differences come from color, not animation.
  await page.evaluate(() => window.__portfolio.pose('about', 'sip', 1.4));
  const renders = new Set<string>();
  for (const [flavor, label] of [['milk-tea', 'Milk tea'], ['matcha', 'Matcha'], ['taro', 'Taro']]) {
    await picker.getByRole('button', { name: label, exact: true }).click();
    await expect(scene).toHaveAttribute('data-boba-flavor', flavor);
    await expect(picker.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(picker.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(scene).toHaveAttribute('aria-label', new RegExp(label.toLowerCase()));
    await expect(scene).toHaveAttribute('data-running', 'false');
    expect(await page.evaluate(() => window.__portfolio.snapshot().find(item => item.kind === 'about')!.elapsed)).toBe(clockBefore);
    renders.add(createHash('sha256').update(await scene.screenshot()).digest('hex'));
  }
  expect(renders.size, 'Three distinct WebGL cup colors at the same pose').toBe(3);
  await page.locator('#contact').evaluate(node => node.scrollIntoView({ behavior: 'instant' }));
  await picker.scrollIntoViewIfNeeded();
  await expect(picker.getByRole('button', { name: 'Taro', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => window.__portfolio.resume());
  await page.getByRole('button', { name: 'Play animations', exact: true }).click();
  await expect(scene).toHaveAttribute('data-action', 'sip');
  expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);
  expect(errors).toEqual([]);
});

test('flavors support keyboard selection and reduced motion at narrow phone width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { picker, scene } = await visitBoba(page);
  const matcha = picker.getByRole('button', { name: 'Matcha', exact: true });
  await matcha.focus();
  await page.keyboard.press('Space');
  await expect(matcha).toBeFocused();
  await expect(matcha).toHaveAttribute('aria-pressed', 'true');
  await expect(scene).toHaveAttribute('data-boba-flavor', 'matcha');
  await expect(scene).toHaveAttribute('data-running', 'false');
  expect(await page.evaluate(() => window.__portfolio.snapshot().find(item => item.kind === 'about')!.elapsed)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  for (const button of await picker.getByRole('button').all()) {
    const rect = await button.boundingBox();
    expect(rect!.height).toBeGreaterThanOrEqual(44);
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(320);
  }
});

test('flavor-specific static previews work when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /webgl/i.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      }, configurable: true,
    });
  });
  const { picker, scene } = await visitBoba(page);
  const image = scene.locator('img');
  for (const [flavor, label] of [['matcha', 'Matcha'], ['taro', 'Taro'], ['milk-tea', 'Milk tea']]) {
    await picker.getByRole('button', { name: label, exact: true }).click();
    await expect(image).toHaveAttribute('src', flavor === 'milk-tea' ? '/previews/about.png' : `/previews/about-${flavor}.png`);
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBeTruthy();
  }
});
