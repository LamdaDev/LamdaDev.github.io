# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Daniel Lam's bilingual (English/French) portfolio, deployed to GitHub Pages at https://lamdadev.github.io/. Vite, React 19 and TypeScript, with Three.js (through `@react-three/fiber`) rendering five animated chibi "diorama" scenes. All 3D content is procedural TypeScript; the repository contains no model files.

## Standing rule: new résumé PDF means a site-wide text update

Whenever a new version of Daniel's résumé (`Daniel_Lam_CV_SWE.pdf`) is uploaded, update the website so all résumé-derived text matches the new PDF, in both languages:

- The served copy is `public/assets/Daniel_Lam_CV_SWE.pdf` (URL `/assets/Daniel_Lam_CV_SWE.pdf`, used by `links.resume` and the tests). If a new copy is dropped elsewhere, such as `public/`, move it there so the public URL stays stable.
- Read the whole PDF. Link targets (project sites, Devpost, GitHub) live in compressed PDF streams and do not appear in the extracted text; decompress the streams to find them rather than guessing URLs.
- Update `src/content.ts` and `src/content.fr.ts`: experience (`description`, `highlight`, `details`), projects, skills, coursework and education dates. Then check copy that restates résumé facts elsewhere: inline `text('English', 'Français')` strings in `src/App.tsx` (About paragraph, education card) and the scene notes in `src/sceneDetails.ts` / `src/sceneDetails.fr.ts`.
- Update the hard-coded fact assertions in `tests/portfolio.spec.ts` and `tests/language-music.spec.ts` (they intentionally do not import the content files), and add a dated entry to `docs/VERIFICATION.md`, which records the PDF's SHA-256.

## Commands

```bash
npm run dev        # Vite dev server at http://127.0.0.1:5173 (strict port)
npm run typecheck  # tsc --noEmit; there is no linter
npm test           # node:test animation-timing tests (src/runtime/sequence.test.ts)
npm run build      # typecheck + vite build + scripts/prerender.mjs (dist/index.html and dist/fr/index.html)
npm run preview    # serve dist at http://127.0.0.1:4173 (strict port)
npm run verify     # Playwright suite; requires `npm run preview` running
```

- Single browser test: `npx playwright test tests/portfolio.spec.ts -g "More Projects"`. The suite runs against the production build (`PREVIEW_URL` overrides the 4173 base URL), so rebuild after source changes. `CHROMIUM_EXECUTABLE` points Playwright and the scripts at a specific Chromium when the bundled version is not installed (`npx playwright install chromium`).
- With the dev server running: `node scripts/check-models.mjs` (geometry and pose assertions through the scene studio), `node scripts/check-night-models.mjs`, `node scripts/inspect-scenes.mjs`, `node scripts/inspect-page.mjs`, and `npm run capture`, which regenerates the fallback PNGs in `public/previews/` from the live scenes. Re-capture after changing a diorama.
- Scene studio: open `/scripts/scene-studio.html` on the dev server to pick a scene and action, scrub pose time, orbit, and export the current pose as a GLB.
- CI (`.github/workflows/deploy.yml`): pushes to `main` run `npm ci`, `npm test` and `npm run build`, then deploy `dist/`. Playwright does not run in CI.

## Architecture

### Two React trees joined by tiny stores

`src/main.tsx` hydrates the prerendered content tree (`App.tsx`), then lazily imports `runtime/mountScenes.tsx`, which mounts a separate React root with one fullscreen `<Canvas>` inside a fixed, click-through `.scene-webgl-layer`. The trees share no React context; they communicate through subscribe/notify modules read with `useSyncExternalStore`: `runtime/registry.ts` (scene slots), `motion.ts`, `theme.ts`, `boba.ts`, `explorer.ts` (enlarged scene dialog) and `sceneProps.ts` (clickable props).

Progressive enhancement is a hard requirement. Each `SceneSlot` holds a static PNG that stays visible until WebGL paints the slot (`data-rendered="true"`); missing WebGL, context loss or a scene-factory error restore it. Content and disclosures must work without JavaScript (tests check this), so disclosures are native `<details>`.

### One renderer for every scene

`runtime/Compositor.tsx` renders all five scenes with a single WebGL context: each frame it reads every registered slot's `getBoundingClientRect()` and draws that scene into a scissored viewport with its own `OrthographicCamera`. The canvas uses `frameloop="demand"`; scroll, resize and store changes request frames, and frames continue only while something animates. `window.__portfolio` (`snapshot`, `pose`, `resume`, `stats`, `exploration`, `theme`) is the debug hook the tests rely on.

### Procedural models and pure-function animation

- `three/character.ts` builds the articulated character from primitives (scaled shared spheres, a lathed shirt, swept hair-lock geometry, tube glasses) and poses it procedurally in `update(action, time)`, including a two-segment arm solver.
- `three/dioramas.ts` builds each room (`hero`, `about`, `skills`, `projects`, `experience`), its camera framing, per-scene prop animation, night-lighting effects and `propTargets` for clickable props. `three/props.ts` is the cached geometry and material library.
- `runtime/sequence.ts` is the timeline: `activityAt(kind, elapsed, reduced)` maps a scene clock to `{ action, time }`. Clocks advance only while a scene is visible and unpaused. Keep `sequence.test.ts` in step with timing changes.
- Scene kinds and action names are declared in both `runtime/sequence.ts` and `three/dioramas.ts` / `three/character.ts`; change both together.

### Day/night theme

`runtime/theme.css` registers `--night-mix` (0 to 1) and lets the browser transition it. `getNightMix()` reads the computed value every frame, so CSS colors, `runtime/lighting.ts` and each diorama's `setNightMix` follow one timeline. Night palettes are `html[data-theme='night'] …` overrides in `src/styles.css`; new colored UI needs a night variant and, to fade smoothly, a place in the theme-transition rules there.

### Content, i18n and styling

- `src/content.fr.ts` spreads each English entry from `src/content.ts` by array index and overrides translated fields, so keep the arrays in the same order. Featured projects are `projects`; further work is `moreProjects`, shown in the "More Projects" `<details>` at the end of the Projects section. Project links are typed (`site`, `devpost`, `repo`) and labeled in `App.tsx`, where each project id also maps to a preview component and status icon. An optional `awards` list (emoji, name, note) renders in the card's main text.
- Other copy is inline `text('English', 'Français')` via `useLanguage()` (`src/i18n.tsx`). The URL selects the language (`/` or `/fr/`); a saved preference applies on a plain root visit. The prerender writes both pages.
- Site copy contains no em dashes (a French-page test asserts this); date ranges use en dashes. French copy puts a regular space before `:`, `!`, `?` and `%`.
- Plain CSS in `src/styles.css` and `src/runtime/*.css`. Later rules in `styles.css` intentionally override earlier ones (for example, the project grid ends up single-column with horizontal cards). The global `details` list rules are child-scoped (`details > ul`) so cards nested inside a disclosure keep their own styles, and `summary > span` is the +/× indicator. Tests enforce 44px touch targets on phones and no horizontal overflow from 320px up.

## Testing notes

- Playwright uses one worker and SwiftShader WebGL; the full suite takes about two to three minutes.
- `tests/theme.spec.ts` "…quick reversal continues from its current color" is intermittently flaky: the scene's final night mix can settle near 1e-9 instead of exactly 0. It fails occasionally on unmodified code too.
- In JavaScript-disabled contexts, do not act on elements that move during a CSS transition (for example, right after opening "More Projects"); Playwright's stability check never settles there.
