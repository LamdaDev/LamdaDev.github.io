import { expect, test, type Page } from '@playwright/test';

const kinds = ['hero', 'about', 'skills', 'projects', 'experience'] as const;
type Kind = typeof kinds[number];

// Independent acceptance checklist from Daniel's brief; intentionally not imported from the UI data.
const expectedSkills = [
  'Go', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'SQL', 'C#', 'Dart', 'Kotlin',
  'React', 'React Native', 'Expo', 'HTML/CSS', 'Flutter',
  'Node.js', 'Express.js', 'REST APIs', 'Kubernetes', 'Docker', 'Kafka', 'Linux', 'CI/CD',
  'AWS', 'Microsoft Azure', 'Databricks', 'Snowflake', 'PostgreSQL', 'SQL Server', 'MySQL', 'MongoDB', 'GraphQL',
  'Git', 'GitLab', 'Gerrit', 'Jenkins', 'SonarCloud', 'Jest', 'Postman', 'Agile/Scrum',
  'Figma', 'Power BI', 'Azure DevOps', 'AMPScript', 'Salesforce Marketing Cloud', 'GeoJSON', 'GTFS', 'Google Maps', 'Google Calendar',
];

async function openPortfolio(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('Daniel');
}
async function waitForScene(page: Page, kind: Kind) {
  const slot = page.locator(`[data-scene-kind="${kind}"]`);
  await expect(slot).toHaveAttribute('data-rendered', 'true', { timeout: 25000 });
  await expect(slot).toHaveAttribute('data-visible', 'true');
  return slot;
}
async function elapsed(page: Page, kind: Kind) {
  return page.evaluate(scene => window.__portfolio.snapshot().find(item => item.kind === scene)!.elapsed, kind);
}
async function jumpTo(page: Page, selector: string) {
  await page.locator(selector).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
}

test.beforeEach(async ({ page }) => {
  // The functional suite must not depend on a third-party font service.
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test('renders complete factual content, native anchors and valid local downloads', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openPortfolio(page);
  await waitForScene(page, 'hero');
  expect(await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id)))
    .toEqual(['top', 'about', 'skills', 'projects', 'experience', 'contact']);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.skill-card')).toHaveCount(6);
  const skillText = await page.locator('.skill-card li').allTextContents();
  expect(skillText.sort()).toEqual([...expectedSkills].sort());
  expect(skillText).toHaveLength(49);
  await expect(page.locator('.project-card')).toHaveCount(2);
  await expect(page.locator('.project-card h3')).toHaveText(['TransitOps Montreal', 'GitToCampus']);
  await expect(page.locator('.project-date')).toHaveText(['July 2026 – Present', 'January 2026 – April 2026']);
  await expect(page.locator('.project-status')).toHaveText(['In progress', '1st in cohort']);
  await expect(page.locator('.project-card').first()).toContainText('still in the design stage');
  await expect(page.locator('.project-card').last()).toContainText('11-member Agile team');
  await expect(page.locator('.project-card').last()).toContainText('first place in the cohort by the professor');
  await expect(page.locator('.concept-label')).toHaveText(['Concept preview', 'Concept preview']);
  expect(await page.locator('.project-link').evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute('href')))).toEqual([
    'https://github.com/LamdaDev/TransitOps-Montreal', 'https://github.com/LamdaDev/GitToCampus',
  ]);
  await expect(page.locator('.experience-entry h3')).toHaveText(['Ericsson', 'The CSL Group Inc.', 'Ubisoft', 'Categen Ventures']);
  await expect(page.locator('.experience-date')).toHaveText([
    'January 2026 – August 2026', 'May 2024 – August 2024 and May 2025 – August 2025',
    'September 2023 – December 2023', 'April 2022 – July 2022',
  ]);
  for (const fact of ['6 raise/clear alarm events', '3 fault conditions', '99% code coverage', '10,000+ XREF records', '10+ Power BI datasets', '60 minutes per run']) {
    await expect(page.locator('#experience')).toContainText(fact);
  }
  await expect(page.locator('.education-card')).toContainText('September 2022 – Present');
  for (const course of ['Computer Architecture', 'Data Structures & Algorithms', 'Operating Systems', 'Artificial Intelligence', 'Deep Learning', 'Databases', 'Object-Oriented Programming']) {
    await expect(page.locator('.education-card')).toContainText(course);
  }
  await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:lam.daniel.123@hotmail.com');
  await expect(page.locator('footer a[href="https://github.com/LamdaDev"]')).toHaveCount(1);
  await expect(page.locator('footer a[href="https://www.linkedin.com/in/lamdaniel1/"]')).toHaveCount(1);
  const invalidAnchors = await page.locator('a[href^="#"]').evaluateAll(anchors => anchors
    .map(anchor => anchor.getAttribute('href')!).filter(href => href.length < 2 || !document.getElementById(href.slice(1))));
  expect(invalidAnchors).toEqual([]);
  const duplicates = await page.locator('[id]').evaluateAll(elements => {
    const ids = elements.map(element => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicates).toEqual([]);
  await expect(page.locator('.resume-link')).toHaveAttribute('href', '/assets/Daniel_Lam_CV_SWE.pdf');
  const pdf = await request.get('/assets/Daniel_Lam_CV_SWE.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  for (const kind of kinds) {
    const preview = await request.get(`/previews/${kind}.png`);
    expect(preview.ok(), `${kind} PNG fallback exists`).toBeTruthy();
    expect((await preview.body()).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);
  expect(errors).toEqual([]);
});

for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 760]]) {
  test(`layout fits ${width}px with greeting and primary CTA on the opening screen`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openPortfolio(page);
    await waitForScene(page, 'hero');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const selector of ['h1', '.hero .scene-slot', '.hero-actions']) {
      const bounds = await page.locator(selector).boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
    }
    for (const section of ['#about', '#skills', '#projects', '#experience', '#contact']) {
      await jumpTo(page, section);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    const gym = await page.locator('[data-scene-kind="experience"]').boundingBox();
    expect(gym!.width, 'Gym illustration fills its column instead of shrinking to the caption').toBeGreaterThanOrEqual(Math.min(width - 70, 300));
  });
}

test('keyboard focus, skip navigation and native details remain operable', async ({ page }) => {
  await openPortfolio(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  expect(parseFloat(await skip.evaluate(element => getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  const about = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true });
  await about.focus();
  await expect(about).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#about$/);
  const coursework = page.locator('.education-card summary');
  await coursework.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.education-card details')).toHaveAttribute('open', '');
  await expect(page.locator('.education-card details p')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.education-card details')).not.toHaveAttribute('open', '');
});

test('production content and PNG previews work without JavaScript', async ({ browser, baseURL, request }) => {
  const html = await request.get('/');
  const body = await html.text();
  expect(body).toContain('TransitOps Montreal');
  expect(body).toContain('Software Developer Intern');
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 390, height: 844 } });
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  const page = await context.newPage();
  try {
    await openPortfolio(page);
    await expect(page.locator('.project-card')).toHaveCount(2);
    await expect(page.locator('.experience-entry')).toHaveCount(4);
    await expect(page.locator('#motion-toggle')).toBeHidden();
    await expect(page.locator('canvas')).toHaveCount(0);
    for (const kind of kinds) {
      const image = page.locator(`[data-scene-kind="${kind}"] img`);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth), { timeout: 10000 }).toBeGreaterThan(0);
    }
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('.contact-email')).toBeVisible();
    await page.locator('.education-card summary').click();
    await expect(page.locator('.education-card details')).toHaveAttribute('open', '');
  } finally { await context.close(); }
});

test('pause freezes clocks, persists across reload, and resumes correctly', async ({ page }) => {
  await openPortfolio(page);
  const hero = await waitForScene(page, 'hero');
  await expect.poll(() => elapsed(page, 'hero')).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause animations', exact: true }).click();
  await expect(hero).toHaveAttribute('data-running', 'false');
  const pausedAt = await elapsed(page, 'hero');
  // A real observation interval catches timers that continue advancing while visually paused.
  await page.waitForTimeout(350);
  expect(await elapsed(page, 'hero')).toBe(pausedAt);
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('daniel-motion'))).toBe('paused');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForScene(page, 'hero');
  const play = page.getByRole('button', { name: 'Play animations', exact: true });
  await expect(play).toBeVisible();
  await expect(page.locator('[data-scene-kind="hero"]')).toHaveAttribute('data-running', 'false');
  const reloadedAt = await elapsed(page, 'hero');
  await page.waitForTimeout(250);
  expect(await elapsed(page, 'hero')).toBe(reloadedAt);
  await play.click();
  await expect.poll(() => elapsed(page, 'hero')).toBeGreaterThan(reloadedAt);
  expect(await page.evaluate(() => localStorage.getItem('daniel-motion'))).toBe('running');
});

test('offscreen clocks stop and the completed boba introduction stays complete', async ({ page }) => {
  await openPortfolio(page);
  await waitForScene(page, 'hero');
  await jumpTo(page, '[data-scene-kind="about"]');
  const about = await waitForScene(page, 'about');
  await expect(about).toHaveAttribute('data-action', 'sip', { timeout: 20000 });
  await jumpTo(page, '#contact');
  await expect(about).toHaveAttribute('data-visible', 'false');
  const hiddenAt = await elapsed(page, 'about');
  await page.waitForTimeout(400);
  expect(await elapsed(page, 'about')).toBe(hiddenAt);
  await jumpTo(page, '[data-scene-kind="about"]');
  await waitForScene(page, 'about');
  await expect(about).toHaveAttribute('data-action', 'sip');
  await expect.poll(() => elapsed(page, 'about')).toBeGreaterThan(hiddenAt);
  expect(await page.evaluate(() => window.__portfolio.stats().contexts)).toBe(1);
});

test('simulated hidden-tab visibility events freeze clocks and resume without a time jump', async ({ page }) => {
  await openPortfolio(page);
  const hero = await waitForScene(page, 'hero');
  await expect.poll(() => elapsed(page, 'hero')).toBeGreaterThan(0);
  // Headless windows do not consistently change visibility when another tab opens.
  // Exercise the actual event handler with a controlled document.hidden getter instead.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(hero).toHaveAttribute('data-running', 'false');
  const hiddenAt = await elapsed(page, 'hero');
  await page.waitForTimeout(450);
  expect(await elapsed(page, 'hero')).toBe(hiddenAt);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(hero).toHaveAttribute('data-running', 'true');
  await expect.poll(() => elapsed(page, 'hero')).toBeGreaterThan(hiddenAt);
});

test('reduced motion selects representative static poses and stops clock advancement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openPortfolio(page);
  const expected = { hero: 'wave', about: 'sip', skills: 'game', projects: 'code', experience: 'rest' };
  await expect(page.locator('#motion-toggle')).toBeDisabled();
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  for (const kind of kinds) {
    await jumpTo(page, `[data-scene-kind="${kind}"]`);
    const scene = await waitForScene(page, kind);
    await expect(scene).toHaveAttribute('data-action', expected[kind]);
    await expect(scene).toHaveAttribute('data-running', 'false');
  }
  const before = await page.evaluate(() => window.__portfolio.snapshot().map(scene => scene.elapsed));
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.__portfolio.snapshot().map(scene => scene.elapsed))).toEqual(before);
  expect(before.every(time => time === 0)).toBeTruthy();
});

test('WebGL-unavailable devices retain artwork and functioning portfolio links', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (/webgl/i.test(type)) return null;
        return Reflect.apply(original, this, [type, ...args]);
      }, configurable: true,
    });
  });
  await openPortfolio(page);
  await expect(page.locator('.scene-webgl-layer')).toHaveCount(1);
  const heroImage = page.locator('[data-scene-kind="hero"] .scene-fallback');
  await expect(heroImage).toBeVisible();
  await expect.poll(() => heroImage.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('[data-rendered="true"]')).toHaveCount(0);
  await page.getByRole('link', { name: 'View my work', exact: true }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('.project-card h3')).toHaveText(['TransitOps Montreal', 'GitToCampus']);
});

test('a scene factory error preserves its preview and the DOM content', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (type === '2d') throw new Error('Injected offscreen text texture failure');
        return Reflect.apply(original, this, [type, ...args]);
      }, configurable: true,
    });
  });
  await openPortfolio(page);
  const hero = page.locator('[data-scene-kind="hero"]');
  await expect(hero).toHaveAttribute('data-scene-error', 'true', { timeout: 25000 });
  await expect(hero).not.toHaveAttribute('data-rendered', 'true');
  await expect(hero.locator('img')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(2);
});

test('losing the actual WebGL context restores the static preview', async ({ page }) => {
  await openPortfolio(page);
  const hero = await waitForScene(page, 'hero');
  await expect(hero.locator('img')).toBeHidden();
  const supported = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-engine]');
    const context = canvas?.getContext('webgl2');
    const extension = context?.getExtension('WEBGL_lose_context');
    if (!extension) return false;
    extension.loseContext();
    return true;
  });
  test.skip(!supported, 'This browser does not expose WEBGL_lose_context.');
  await expect(hero).not.toHaveAttribute('data-rendered', 'true');
  await expect(hero.locator('img')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View my work', exact: true })).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(2);
});
