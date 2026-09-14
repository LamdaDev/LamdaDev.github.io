import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', timeout: 60000, workers: 1,
  use: {
    baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
      args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
  },
});
