import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/scenes', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', error => console.log('PAGE ERROR', error.message));
page.on('console', message => { if (message.type() === 'error') console.log('CONSOLE', message.text()); });
try {
  await page.goto('http://127.0.0.1:5173/scripts/scene-studio.html');
  await page.waitForTimeout(2500);
  for (const [kind, poses] of Object.entries({ hero: ['wave'], about: ['order','sip'], skills: ['game'], projects: ['code','drink','nap'], experience: ['bench','rest'] })) {
    await page.getByLabel('Scene', { exact: true }).selectOption(kind);
    for (const pose of poses) {
      await page.getByLabel('Activity', { exact: true }).selectOption(pose);
      await page.waitForTimeout(500);
      await page.locator('#stage').screenshot({ path: `test-results/scenes/${kind}-${pose}.png` });
      console.log(`Captured ${kind}/${pose}`);
    }
  }
} finally { await browser.close(); }
