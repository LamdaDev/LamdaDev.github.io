import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const file = resolve(root, 'dist/index.html');
  const template = await readFile(file, 'utf8');
  if (!template.includes('<!--app-html-->')) throw new Error('Prerender slot is missing');
  await writeFile(file, template.replace('<!--app-html-->', render()));
  console.log('Prerendered portfolio content into dist/index.html');
} finally { await server.close(); }
