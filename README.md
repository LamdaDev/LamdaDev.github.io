# Daniel Lam's portfolio

A responsive React and TypeScript portfolio with five animated Three.js dioramas: a greeting, a boba shop, a gaming station, a coding desk, and a gym. The character is an editable procedural interpretation of Daniel's supplied chibi portrait.

This is a local draft. The build writes `dist/`; none of the project scripts publish the site, and no automatic deployment workflow is included.

## Run locally

Use Node.js **22.12 or newer** and npm. The PowerShell examples use `npm.cmd` and `npx.cmd`, which work when the `npm.ps1` launcher is blocked by execution policy. No execution-policy change is needed. On macOS or Linux, use `npm` and `npx` instead.

```powershell
cd "C:\Users\lamda\Documents\repos\School\LamdaDev.github.io"
npm.cmd ci
npm.cmd run dev
```

Open **http://127.0.0.1:5173**. Press **Ctrl+C** in the terminal to stop the server. Vite uses a fixed port and reports an error if another server already occupies it.

To check the production version:

```powershell
npm.cmd run build
npm.cmd run preview
```

Open **http://127.0.0.1:4173**. Production output is prerendered: portfolio text, anchor navigation, contact links, and static artwork are present in `dist/index.html` before JavaScript runs. Use the preview server to inspect this behavior; the development server initializes the page with React.

The website uses React, TypeScript, Vite, Three.js, React Three Fiber, and selected Drei helpers. There is no Python build step, backend, database, account service, or API key to configure.

## Where to make changes

| File or folder | Purpose |
| --- | --- |
| [`src/content.ts`](src/content.ts) | Skills, projects, experience, coursework, contact links, and résumé URL |
| [`src/App.tsx`](src/App.tsx) | Page sections, copy, navigation, project cards, and project concept previews |
| [`src/styles.css`](src/styles.css) | Page layout, responsive rules, typography, colors, and spacing |
| [`src/components/SceneSlot.tsx`](src/components/SceneSlot.tsx) | Accessible scene descriptions and static preview images |
| [`src/components/SceneExplorer.tsx`](src/components/SceneExplorer.tsx) | Explore buttons, modal viewer, focus management, and camera controls |
| [`src/runtime/explorer.ts`](src/runtime/explorer.ts) | Viewer state shared by the page and renderer |
| [`src/runtime/explorationCamera.ts`](src/runtime/explorationCamera.ts) | Orbit controls, zoom limits, and reset framing |
| [`src/sceneDetails.ts`](src/sceneDetails.ts) | Labels and short personal notes for the 15 interactive props |
| [`src/components/ScenePropDetails.tsx`](src/components/ScenePropDetails.tsx) | Prop buttons, gesture handling, notes, and keyboard dismissal |
| [`src/three/propPicking.ts`](src/three/propPicking.ts) | Mesh picking and hints projected through the live scene camera |
| [`src/components/MotionButton.tsx`](src/components/MotionButton.tsx) | Global animation control |
| [`src/components/BobaPicker.tsx`](src/components/BobaPicker.tsx) | Keyboard-accessible milk tea, matcha, and taro buttons |
| [`src/boba.ts`](src/boba.ts) | Flavor names, tea colors, and fallback image paths |
| [`src/runtime/boba.ts`](src/runtime/boba.ts) | Page-local flavor state shared by React and the renderer |
| [`src/three/character.ts`](src/three/character.ts) | Character geometry, facial expressions, limbs, and activity poses |
| [`src/three/dioramas.ts`](src/three/dioramas.ts) | Scene environments, furniture, props, cameras, and prop choreography |
| [`src/three/props.ts`](src/three/props.ts) | Reusable modeled objects, materials, labels, and decorative shapes |
| [`src/runtime/sequence.ts`](src/runtime/sequence.ts) | Activity sequence boundaries and elapsed-time rules |
| [`src/runtime/Compositor.tsx`](src/runtime/Compositor.tsx) | One shared WebGL renderer, visible scene viewports, and render scheduling |
| [`src/runtime/motion.ts`](src/runtime/motion.ts) | Reduced motion, page visibility, and the saved pause preference |
| [`scripts/prerender.mjs`](scripts/prerender.mjs) | Adds server-rendered React content to the production HTML |
| [`public/assets/`](public/assets/) | Portrait reference and downloadable résumé |
| [`public/previews/`](public/previews/) | Static renders of the actual dioramas |

Keep factual dates, results, and development statuses in `content.ts` accurate. TransitOps is presented as ongoing work, its LLM analyst as design work, and the two project pictures as concepts rather than product screenshots.

## Character and animation editing

The character uses real Three.js geometry: a rounded head and body, tapered swept hair locks, rectangular glasses, eyes and eyelids, articulated arms, hands with fingers, and posed legs. It has complete three-dimensional surfaces and can be inspected from different angles. The portrait is a visual reference, not a texture billboard, exact scan, supplied rig, or pretrained avatar model.

`createCharacter()` exposes `root`, `head`, `hands.left`, `hands.right`, `update(action, time)`, and `dispose()`. Times are in seconds. The coordinate system is **+Y up and +Z forward**. The diorama controls the root transform; the character updates its local joints and expressions. Drinks attach to wrist groups, and the lifting bar follows the two hand positions.

To adjust the character's appearance, edit the palette, proportions, hair sweep control points, frame curves, and facial geometry in `character.ts`. To adjust a gesture, edit its branch in `update()`. Edit furniture, monitor art, camera placement, cup offsets, and barbell positioning in `dioramas.ts` and `props.ts`. These files are the editable source assets; no external modeling application is required.

| Scene | Sequence |
| --- | --- |
| Hero | Four-second wave-and-pause loop |
| About | Order and receive boba for 2.4 visible seconds once, then continue sipping |
| Skills | Continuous gaming, keyboard taps, mouse movement, and blinking |
| Projects | Code for 6 seconds, drink Coke Zero for 2 seconds, nap for 3 seconds, repeat |
| Experience | Bench press for 5 seconds, rest and drink water for 4 seconds, repeat |

Activity changes are immediate cuts. Gestures animate within each activity. To change activity durations, edit `activityAt()` in `src/runtime/sequence.ts` and its boundary tests. Keep gesture periods in `character.ts` and prop movement in `dioramas.ts` consistent with the sequence.

The production page uses one WebGL canvas with scissored viewports. Models initialize as their sections become visible. Rendering uses a device pixel ratio of 1 at viewport widths up to 600px and caps it at 1.5 on larger viewports. Hidden and offscreen scenes stop advancing; reduced motion selects a static representative pose. The global pause preference is stored in `localStorage` when available. Failed or unavailable WebGL leaves the static previews accessible.

### Explore every scene

The expand button in each scene window, including the greeting, opens an enlarged interactive diorama. Drag with a mouse or one finger to rotate; use the mouse wheel or pinch to zoom. The visible arrow, zoom, and **Reset view** buttons provide the same controls. With the scene focused, use the arrow keys to rotate, `+` / `-` to zoom, and `Home` to reset.

The native modal dialog moves focus inside, keeps Tab navigation within its controls, and closes with **Escape** or the close button. Closing restores focus to the original expand button and restores the page's scroll position. The viewer's animation button shares the header's pause preference; device reduced-motion settings are respected while deliberate camera movement remains available.

The existing canvas moves into the dialog's top layer and renders the same model with a separate orbit camera. No additional WebGL context or duplicate model is created. Background scene clocks stop while exploring; the selected animation and boba flavor continue. Closing restores the card's original camera. Unavailable WebGL displays an enlarged static preview with camera controls disabled. Without JavaScript, explore buttons are disabled and all portfolio content remains available.

### Clickable little details

Tap a prop in any scene, or choose its labeled button underneath, to open a short personal note. There are no icons over the artwork; a pointer cursor identifies clickable objects on hover. There are three details in each of the five scenes: the greeting sign, gamepad and gold star; boba menu, drink and sample shelf; gaming monitor, PC tower and keyboard; coding monitor, Coke Zero and desk lamp; barbell, water bottle and gym towel.

The same interactions work inside **Explore this scene**. Dragging still rotates the camera, and scrolling the page or pinching the viewer does not open a note. Click targets follow moving props and the orbit camera. The labeled buttons remain available even when a prop is out of view or WebGL is unavailable. Use **Enter** or **Space** on a button to read a detail. **Escape** dismisses a note before closing the scene viewer; the note's close button returns focus to its prop button. Details are local to each scene view and do not use storage or tracking.

Edit the copy in `src/sceneDetails.ts`. Each model's `propTargets` in `src/three/dioramas.ts` links those IDs to existing mesh objects and small, invisible position anchors. The picker uses the shared renderer and current camera; it adds no WebGL context, physics engine, or external service. Animations can be paused, reduced, or in night mode while the props remain usable. Without JavaScript, controls are disabled and the notes appear as readable text alongside the portfolio and scene previews.

### Night shift and company marks

The header and enlarged scene viewer include a **Night shift** toggle. It remembers the selected palette locally, fades page colors and scene lighting together, and adds warm task lighting and monitor glow to the gaming and coding desks. A saved choice applies before the app loads. Reduced motion switches immediately, and switching the theme does not restart animations or clear the chosen boba flavor.

Employer marks are local PNGs in `public/assets/companies/`, displayed proportionally on consistent light badges in both themes. Original sources and asset processing are recorded in [company-logos.md](docs/company-logos.md).

### Choose Daniel’s boba

The About scene includes three flavor buttons: **Milk tea**, **Matcha**, and **Taro**. Selecting a flavor changes Daniel’s drink during ordering and sipping without restarting the animation. It also works with paused or reduced motion and updates the fallback image when WebGL is unavailable. The selected button has a checkmark and an accessible pressed state. The choice stays selected while browsing the page and resets to milk tea on reload; no browser storage is used for flavor choices. Without JavaScript, the default artwork remains and the buttons are disabled.

Edit flavor names and colors in `src/boba.ts`; the material setter in `src/three/dioramas.ts` updates only the served and held cups. Shelf cups, pearls, lids, straws, and the rest of the scene keep their materials. After changing colors, regenerate the three About previews with the development server running:

```powershell
npm.cmd run capture -- --boba
npm.cmd run build
```

The static assets are `public/previews/about.png`, `about-matcha.png`, and `about-taro.png`. The normal `npm.cmd run capture` command also refreshes these variants. Boba browser coverage lives in `tests/boba.spec.ts`; `scripts/check-models.mjs` checks actual cup materials, unchanged geometry, and material reuse/disposal.

### Inspect and export the models

With `npm.cmd run dev` running, open:

**http://127.0.0.1:5173/scripts/scene-studio.html**

The development studio lets you select a scene and activity, scrub the gesture time, play or pause, drag to orbit, and scroll to zoom. Its implementation is [`src/three/studio.tsx`](src/three/studio.tsx).

**Export pose as GLB** downloads the current diorama geometry, materials, and pose. This is a **static pose export**: it does not bake the TypeScript animation loops into glTF animation clips or export a skeletal animation rig. Keep the procedural source to retain editable motion. The studio is a development tool and is not an entry point in the portfolio's production build.

The scene geometry, monitor graphics, and decorative artwork are generated in this repository. The portrait and résumé are user-supplied. Google Fonts supplies DM Sans and Press Start 2P; the site uses system fallbacks if font loading is unavailable. Installed library licenses remain with their packages.

## Replace the project concept previews

The project pictures are separate from the animated coding scene.

1. Add real screenshots under `public/assets/projects/`, for example `transitops.webp` and `gittocampus.webp`.
2. Edit **`TransitPreview()`** and **`CampusPreview()`** in [`src/App.tsx`](src/App.tsx).
3. Replace each function's concept artwork with its screenshot. Preserve the IDs `transit-preview` and `campus-preview` if existing links or checks use them.
4. Replace the concept-specific accessible label with an accurate screenshot description and remove the visible “Concept preview” label.

For example, the TransitOps component can return:

```tsx
return (
  <div className="project-preview project-preview--screenshot" id="transit-preview">
    <img
      src="/assets/projects/transitops.webp"
      alt="TransitOps dashboard showing route health and vehicle activity"
      width="1600"
      height="1000"
      loading="lazy"
    />
  </div>
);
```

Add the corresponding rule to `src/styles.css`:

```css
.project-preview--screenshot { padding: 0; }
.project-preview--screenshot img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

The preview area uses a **16:10** aspect ratio. `contain` preserves the full screenshot; use `cover` only if cropping is appropriate. Adjust the example alternative text to describe the actual image.

### Résumé and portrait

The résumé can be downloaded beneath the hero buttons and again in Contact. Both links use the same `links.resume` asset path.

- Résumé: [`public/assets/Daniel_Lam_CV_SWE.pdf`](public/assets/Daniel_Lam_CV_SWE.pdf). Replace the PDF with the same filename, or update `links.resume` in `src/content.ts` and the download filename in `src/App.tsx`.
- Portrait reference: [`public/assets/chibi.jpg`](public/assets/chibi.jpg). Replacing this file alone does not remodel the procedural character; update `character.ts` to reflect changes to the reference.

### Refresh the static scene previews

The fallback PNGs are captures of the actual Three.js scenes, including two additional boba flavor variants. With the development server running:

```powershell
npx.cmd playwright install chromium
npm.cmd run capture
```

This writes `hero.png`, `about.png`, `about-matcha.png`, `about-taro.png`, `skills.png`, `projects.png`, and `experience.png` under `public/previews/`. Rebuild afterward so `dist/` receives the updated assets. Commit the previews with source changes that alter a scene's appearance.

## Design tokens

The source of truth is [`src/styles.css`](src/styles.css), with scene-layer rules in [`src/runtime/scene.css`](src/runtime/scene.css).

| Token | Value |
| --- | --- |
| Main typeface | DM Sans; sans-serif fallback |
| Accent typeface | Press Start 2P; monospace fallback, used for short decorative labels |
| Hero heading | 52px on the narrowest layout; fluid 55–72px on mobile; 104–134px on desktop |
| Section headings | 32–49px, depending on section and breakpoint |
| Main prose | 14–18px; supporting text generally 11–14px |
| Cream / white | `#FFF9F0` / `#FFFFFF` |
| Primary / secondary text | `#292638` / `#615B70` |
| Primary accent | `#6D4CCF` |
| Lavender / mint / peach / blue | `#EAE1FF` / `#DFF5E6` / `#FFE2CF` / `#E2EFFF` |
| Standard border | `#E6DFD5` |
| Spacing variables | 4, 8, 12, 16, 24, 32, 48, 64, 96px |
| Content width | 1160px maximum; 20px side gutters, reduced to 16px on narrow phones |
| Section padding | 65px mobile; 100px desktop; 110px at 1200px and above |
| Main radii | 9px buttons, 13px compact cards, 19px project cards, 20px scene windows, 23px contact panel |
| Button shadow | `3px 3px 0 #292638`; collapses on press |
| Focus indicator | 3px purple outline with 5px offset |
| Main layout breakpoints | 560px, 900px, 1200px; an additional rule below 360px |

## Verification commands

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

For browser checks, first run `npm.cmd run preview` in a separate terminal, then:

```powershell
npx.cmd playwright install chromium
npm.cmd run verify
```

Browser tests default to `http://127.0.0.1:4173`. If needed, set `PREVIEW_URL` to a different running preview address. To use an already installed compatible Chromium executable, set `CHROMIUM_EXECUTABLE` to its absolute path. The checked-in Playwright configuration enables software WebGL for automated scene inspection.

For manual visual review, `node scripts/inspect-scenes.mjs` captures all activity poses from the development studio and `node scripts/inspect-page.mjs` captures responsive page layouts. `node scripts/check-models.mjs` checks bar-to-hand alignment across a lifting activity, the racked bar, closed nap eyes, the independent wave, and a static GLB export. These scripts require the development server on port 5173. Local evidence is written under the ignored `test-results/` folder.

See [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for the latest sequence and browser test results, model checks, measured build sizes, and the limits of that evidence. Viewer coverage lives in `tests/explorer.spec.ts`.
