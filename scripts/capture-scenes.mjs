import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../public/previews/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__portfolio, undefined, { timeout: 30000 });
  await page.addStyleTag({ content: '.scene-slot { aspect-ratio: 1.3 !important; } html { scroll-behavior: auto !important; }' });
  for (const [kind, action, time] of [['hero', 'wave', .8], ['about', 'sip', 1.4], ['skills', 'game', 1], ['projects', 'code', 1], ['experience', 'rest', 1]]) {
    const slot = page.locator(`[data-scene-kind="${kind}"]`);
    await slot.scrollIntoViewIfNeeded();
    await page.evaluate(({ kind, action, time }) => window.__portfolio.pose(kind, action, time), { kind, action, time });
    await page.waitForFunction(kind => document.querySelector(`[data-scene-kind="${kind}"]`)?.getAttribute('data-rendered') === 'true', kind);
    await page.waitForTimeout(150);
    await slot.screenshot({ path: `${output}/${kind}.png` });
    console.log(`Saved actual 3D render: public/previews/${kind}.png`);
  }
} finally { await browser.close(); }
