import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const { languageMetadata } = await server.ssrLoadModule('/src/i18n.tsx');
  const template = await readFile(resolve(root, 'dist/index.html'), 'utf8');
  if (!template.includes('<!--app-html-->')) throw new Error('Prerender slot is missing');
  const alternateLinks = '<link rel="alternate" hreflang="en" href="https://lamdadev.github.io/" />\n    <link rel="alternate" hreflang="fr" href="https://lamdadev.github.io/fr/" />\n    <link rel="alternate" hreflang="x-default" href="https://lamdadev.github.io/" />';
  const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  for (const language of ['en', 'fr']) {
    const metadata = languageMetadata[language];
    const html = template
      .replace('<html lang="en">', `<html lang="${language}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttribute(metadata.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeAttribute(metadata.description)}" />`)
      .replace('</head>', `    ${alternateLinks}\n  </head>`)
      .replace('<!--app-html-->', render(language));
    const directory = resolve(root, language === 'fr' ? 'dist/fr' : 'dist');
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), html);
  }
  console.log('Prerendered English and French portfolio content into dist/index.html and dist/fr/index.html');
} finally { await server.close(); }
