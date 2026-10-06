import { expect, test, type Page } from '@playwright/test';

const kinds = ['hero', 'about', 'skills', 'projects', 'experience'] as const;
const shortPhones = [
  { width: 320, height: 568 }, { width: 375, height: 667 },
  { width: 667, height: 375 }, { width: 844, height: 390 },
];

async function visit(page: Page) {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.addInitScript(() => localStorage.setItem('daniel-motion', 'paused'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-explore-kind="hero"]')).toBeEnabled();
}

test('all five mobile viewers keep Close tappable after scrolling expanded notes', async ({ page }) => {
  test.setTimeout(120000);
  await visit(page);
  for (const viewport of shortPhones) {
    await page.setViewportSize(viewport);
    for (const kind of kinds) {
      const trigger = page.locator(`[data-explore-kind="${kind}"]`);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      const dialog = page.locator('dialog.scene-explorer');
      await expect(dialog.locator('.scene-explorer-stage')).toHaveAttribute('data-rendered', 'true');
      await dialog.locator('[data-prop-button]').first().click();
      await expect(dialog.locator('[data-prop-note]')).toBeVisible();
      await dialog.locator('.scene-explorer-panel').evaluate(node => { node.scrollTop = node.scrollHeight; });
      const close = dialog.getByRole('button', { name: 'Close scene viewer', exact: true });
      const bounds = await close.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.y, `${kind} at ${viewport.width}: Close stays visible after scrolling`).toBeGreaterThanOrEqual(0);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
      expect(await close.evaluate(node => {
        const rect = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      }), 'The 3D canvas and notes do not cover the close button').toBeTruthy();
      // Coordinate click deliberately avoids Playwright scrolling the hidden control back into view.
      await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    }
  }
});

test('touch rotation, viewer scrolling, and orientation changes coexist on a landscape phone', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await visit(page);
  const trigger = page.locator('[data-explore-kind="skills"]');
  await trigger.click();
  const dialog = page.locator('dialog.scene-explorer');
  const stage = dialog.locator('.scene-explorer-stage');
  await expect(stage).toHaveAttribute('data-rendered', 'true');
  const camera = () => page.evaluate(() => window.__portfolio.exploration());
  const initial = await camera();
  const session = await page.context().newCDPSession(page);
  async function swipe(x: number, y: number, dx: number, dy: number) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 10; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * step / 10, y: y + dy * step / 10 }] });
      await page.waitForTimeout(25);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  const rect = await stage.boundingBox();
  await swipe(rect!.x + rect!.width * .35, rect!.y + rect!.height * .5, 90, -25);
  await expect.poll(async () => (await camera())?.azimuth).not.toBe(initial!.azimuth);
  await expect(dialog.locator('[data-prop-note]')).toHaveCount(0);
  expect(await dialog.locator('.scene-explorer-panel').evaluate(node => node.scrollTop)).toBe(0);
  const rotated = await camera();
  const props = await dialog.locator('.scene-prop-details').boundingBox();
  await swipe(props!.x + props!.width * .75, Math.min(props!.y + 40, 340), 0, -160);
  await expect.poll(() => dialog.locator('.scene-explorer-panel').evaluate(node => node.scrollTop)).toBeGreaterThan(50);
  expect(await camera()).toEqual(rotated);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect.poll(() => stage.evaluate(node => node.getBoundingClientRect().width)).toBeLessThan(375);
  expect(await camera()).toEqual(rotated);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await dialog.getByRole('button', { name: 'Close scene viewer', exact: true }).click();
  await expect(trigger).toBeFocused();
  await session.detach();
});

test('phone layouts expose the introduction and offer usable links without overflow when details expand', async ({ page }) => {
  await visit(page);
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 568 });
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
    for (const selector of ['#hero-title', '.hero-actions a', '.hero-resume']) {
      for (const element of await page.locator(selector).all()) {
        const rect = await element.boundingBox();
        expect(rect!.y, `${selector} is visible on first screen at ${width}px`).toBeGreaterThanOrEqual(0);
        expect(rect!.y + rect!.height, `${selector} fits in the short phone screen`).toBeLessThanOrEqual(568);
      }
    }
    // Open every disclosure first so controls inside More Projects are measured too.
    await page.locator('details').evaluateAll(nodes => nodes.forEach(node => { (node as HTMLDetailsElement).open = true; }));
    await expect(page.locator('details:not([open])')).toHaveCount(0);
    await expect(page.locator('.project-card--transit .project-link')).toBeVisible();
    const controls = page.locator('.main-nav a, .brand, .site-header .motion-button, .hero-actions a, .resume-link, .project-link, .contact-email, .site-footer nav a, summary');
    for (const control of await controls.all()) {
      const rect = await control.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect!.height, `${await control.textContent()} is a comfortable touch target`).toBeGreaterThanOrEqual(44);
      expect(rect!.width).toBeGreaterThanOrEqual(44);
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const overflows = await page.locator('.hero-value, .job-content, .project-body, .education-card, .contact-email').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.className));
    expect(overflows).toEqual([]);
  }
});
