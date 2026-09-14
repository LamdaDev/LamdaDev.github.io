import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('test-results/page', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const report = [];
try {
  for (const [width, height] of [[1440,1000],[768,1024],[390,844],[320,760]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173');
    await page.waitForFunction(() => !!window.__portfolio, undefined, { timeout: 30000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `test-results/page/hero-${width}.png` });
    const result = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, stats: window.__portfolio.stats(), scenes: window.__portfolio.snapshot() }));
    report.push({ ...result, errors });
    if (width === 1440 || width === 390) {
      for (const [kind, action] of [['about','sip'], ['skills','game'], ['projects','nap'], ['experience','bench']]) {
        await page.locator(`[data-scene-kind="${kind}"]`).evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.evaluate(({kind, action}) => window.__portfolio.pose(kind, action, 1.7), {kind, action});
        await page.waitForFunction(kind => document.querySelector(`[data-scene-kind="${kind}"]`)?.getAttribute('data-rendered') === 'true', kind);
        await page.waitForTimeout(100);
        await page.screenshot({ path: `test-results/page/${kind}-${width}.png` });
      }
    }
    // A fixed shared canvas cannot paint offscreen scenes in a full-page capture.
    // Use the real static renders for the full-page layout evidence instead.
    await page.addStyleTag({ content: '.scene-webgl-layer{visibility:hidden!important}.scene-fallback{visibility:visible!important}' });
    await page.screenshot({ path: `test-results/page/full-${width}.png`, fullPage: true });
    console.log(JSON.stringify(report.at(-1)));
    await page.close();
  }
  await writeFile('test-results/page/layout.json', JSON.stringify(report, null, 2));
} finally { await browser.close(); }
