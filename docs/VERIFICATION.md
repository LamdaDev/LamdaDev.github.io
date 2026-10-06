# Verification record

This record describes checks on the local portfolio implementation. It does not establish accessibility conformance, cross-browser certification, or production performance guarantees.

## Résumé refresh, Babbli and More Projects - October 6, 2026

Read the new one-page `Daniel_Lam_CV_SWE.pdf`, supplied at `public/Daniel_Lam_CV_SWE.pdf`, and moved it to `public/assets/` so the existing download URL and filename are unchanged. The public and built résumé downloads match the supplied file: SHA-256 `77fbd753730a020e5f1c99d2d05110814e9948ed4dd1bd8324b01b4df8348ddd`.

All four employers' summaries, highlights and role details now follow its bullets in English and French. Figures the résumé no longer states were removed: the six alarm events and three fault conditions, SonarCloud as the coverage source, the 10+ Power BI datasets and the Dart ramp-up note. New facts include the network-slicing microservice, 130+ Robot Framework tests at a 100% passing rate, 30M+ real-time shipment records with runtime cut by 60 minutes, 12 validated Power BI dashboards, CRM campaigns for 7+ major Ubisoft releases, and Categen's point-of-sale delivery system. The AMPscript skill chip follows the résumé's spelling, and highlight phrases wrap only at their `·` separators. Education, coursework, the five résumé skill groups and the GitToCampus facts already matched.

Babbli replaces TransitOps Montreal as the first featured project. Its card's main text lists the four Hack the Hill III awards Daniel supplied (Winner of General Challenge: Third Place; Best Project Built with ElevenLabs; Best Educational Project; Best UI/UX), and "Inside the build" holds the résumé's three build bullets. Its links and date come from the résumé and its Devpost page (`https://babbli.study/`, `https://devpost.com/software/babbli`, `https://github.com/LamdaDev/Babbli`; Hack the Hill III, September 25 to 27, 2026). The preview, without a device label, is Devpost's main image, the Parisian café barista scene: a 1920×989 PNG of 561,207 bytes, SHA-256 `cff12c973946a660f71c6295a355d02337620f9a561bbb650967174294ba74b5`. TransitOps Montreal moved into a native "More Projects" disclosure after the featured cards. It opens without JavaScript and animates its height in browsers that support `::details-content`.

Type checking, the production build, all six sequence tests and all 47 browser tests passed (one new More Projects check; browser suite: 2.1 minutes), using Chromium/software WebGL. Day and night, English and French captures of the project cards, the open disclosure and the expanded experience timeline were inspected at 1440, 1100, 768, 390 and 320px; the suite was rerun in full after the awards list was added. The theme test "…quick reversal continues from its current color" is intermittently flaky: across 18 repeated runs it failed 4 times on this change and once on an untouched build of the previous commit, each time because the final scene night mix settled near 1e-9 instead of exactly 0. No model geometry or animation changed, so the model checks were not rerun.

## Resume and punctuation refresh - October 1, 2026

Read the supplied one-page `Daniel_Lam_CV_SWE.pdf` and compared all four employment entries against its text and rendered page. Updated CSL's migration count to 30,000,000+ production shipment records into Snowflake and corrected the 10,000+ record source to SharePoint. Other employers' roles, dates, and accomplishments already match. The education date now ends in May 2027, labeled expected because it is a future date.

The public and built resume downloads are byte-for-byte copies of the supplied PDF. All three SHA-256 hashes match: `ceca92de754ba3c6ed8dd335bb0f17d667132a395b056ee5e0f45bb3acb5621a`. Both existing download links retain their filenames and URLs.

Removed em dashes from site copy, metadata, scene accessibility labels, documentation, and human-readable model names, with matching model-check lookups updated. En dashes in date ranges remain. Source and production-output scans found no em dashes.

Type checking, production build, all model assertions, and six focused browser checks passed. These cover factual content, downloads, four responsive opening layouts, and prerendered content without JavaScript. The existing animation changes remain intact. These checks were completed on `boba-three-js` before merging the reviewed changes into `main`.

## Platform and desk animation fixes - October 1, 2026

Two follow-up animation corrections were made on `boba-three-js`. The monitor's three platforms now share a level; the player follows adjacent landings left -> middle -> right -> middle -> left, with grounded pauses, a visible jump arc, and direction changes at rest. The soda activity uses a higher wrist path and raised elbow poses for both arms, keeping the held can and hands above the desk and keyboard while preserving mouth contact. Existing activity timing and hard cuts are unchanged.

Geometry-based regression checks sample actual meshes rather than repeat the animation formulas:

- 541 game frames at 120 Hz: equal platform tops, landing order `0 -> 1 -> 2 -> 1 -> 0`, planted pauses on every platform, airborne gap crossings, no platform penetration, and zero loop position/velocity error.
- 241 soda frames at 120 Hz: 24 arm, hand, and can meshes clear the desk by at least .13266 units and the keyboard by .02600 units within their footprints. The can opening remains .02187 units from the mouth at the peak.
- Existing greeting, gym, boba, disposal, and GLB export checks continue to pass.

Actual WebGL drinking poses were reviewed at nine times from default, front, and side views; nine game takeoff/airborne/landing poses were reviewed in the full scene and a monitor close-up. No new face/head clipping or page errors were observed. The corrected gaming fallback PNG was refreshed; other fallback images were preserved.

Type checking, production build, six sequence tests, all model assertions, and all 37 local browser checks passed (browser suite: 2.8 minutes). These checks were performed locally with Chromium/software WebGL before publication.

## Animation audit - October 1, 2026

The published portfolio passed all 37 browser checks. Real-time observation confirmed the boba ordering handoff, the 6/8/11-second coding-drink-nap cycle, the 5/9-second bench/rest cycle, continuous greeting and gaming, and the existing motion, theme, flavor, and scene-viewer controls. Nine actual WebGL activity poses were inspected; no site JavaScript errors or same-origin failed requests were observed.

Four improvements were made locally on `boba-three-js`: drinks now approach the mouth rather than the cheek, bench arms retain their length at extension, gym resting feet contact the mat, and the arcade character returns through its level without teleporting. The greeting and hard cuts between different activities were preserved.

After these changes, type checking, the production build, all six sequence tests, and all 37 browser checks passed (local suite: 1.7 minutes). Expanded model checks measured:

- 151 bench frames: all four arm segments stay at .48 units, with finite transforms and zero bar-to-hand-axis error.
- Peak straw/can/bottle-to-mouth gaps: .02972, .02187, and .01906 units, respectively (all below .05).
- 121 gym rest frames: soles stay .0005 units above the mat, with no penetration.
- 271 arcade frames: zero loop position error and no wrap position step; wrap velocity difference is .000247.
- Existing 733-frame greeting, boba material/disposal, nap eyes, static GLB export, and all five night-lighting/resource checks passed.

Default, front, and side renders of the changed poses were reviewed. Changed action transforms sampled at 120 Hz remained finite and continuous within each activity. Five affected fallback PNGs were refreshed: three boba flavors, gaming, and gym rest. The greeting and coding fallback PNGs were preserved.

This is headless Chromium/software WebGL evidence, not a frame-rate or battery measurement on a physical phone. The animation improvements were verified locally before publication.

## Deployment verification ? October 1, 2026

The user-supplied TransitOps and GitToCampus screenshots replace both concept illustrations and their badges. The production build, type checking, all six sequence tests, and all 37 browser regression tests passed. Both images loaded with their original dimensions and `object-fit: contain`; desktop (1440px) and phone (390px) captures showed complete images and no horizontal overflow. The Pages workflow runs sequence tests and the production build before deploying pushes to `main`.

## Completed checks

| Check | Observed result |
| --- | --- |
| TypeScript | Type checking passed. |
| Production build | Vite build and HTML prerender completed. |
| Sequence unit tests | All six tests passed, including the six-second greeting cycle and its reduced-motion pose. |
| Browser regression suite | All 37 tests passed in 1.8 minutes after the initial greeting update. After the front-to-up lift and delayed wave update, three focused checks for pause persistence, reduced motion and scene-viewer controls passed. |
| Mobile layout audit | Phone widths 320, 375, 390 and 430px, tablet width 768px, and landscape sizes 667×375 and 844×390 were inspected. Expanded content has no horizontal overflow; the introduction, primary links and résumé fit the first screen on short 568px-high phones. |
| Mobile touch targets | Navigation, motion control, résumé, project/contact/social links, and disclosure summaries have at least 44px-high tap areas. Narrow navigation labels remain separated. |
| Short mobile viewers | All five viewers at four short portrait/landscape sizes keep Close visible and tappable after expanding notes and scrolling to the bottom. Real coordinate clicks confirm no overlapping layer blocks it; focus returns to the launch button. |
| Touch and orientation | Touch drag rotates a scene without opening a prop or scrolling the panel; a swipe outside the 3D surface scrolls the viewer without rotating. Changing from landscape to portrait preserves the camera and fits the new viewport. |
| Clickable scene props | Pointer picks select the corresponding real prop in all five paused scenes; all 15 named buttons work with Enter/Space, one note at a time, and restore focus on dismissal. The renderer retains one WebGL context. |
| Prop gestures and fallback | Dragging rotates the explorer without opening notes; a 320px touch swipe scrolls without selecting, followed by a successful deliberate tap. Reduced motion, night mode, no-WebGL buttons, and readable no-JavaScript note content passed. |
| Unobstructed props | Page and enlarged-view anchors have no text, child artwork, background, border, shadow, or pseudo-content. Real object clicks and generous touch targets still work without visible plus overlays. |
| Night shift | Five browser tests passed: intermediate CSS/3D color interpolation, reversal, paused clocks, all five viewers, stored preference before hydration, 320px reduced-motion controls, and tinted fallback previews. Selected text/background pairs meet 4.5:1 contrast. |
| Hero résumé link | After adding the top download link, build/type checking and five targeted content/responsive checks passed. Both links resolve to the intended PDF; the hero link stays on the opening screen at 1440, 768, 390, and 320px. |
| Boba flavor controls | Three distinct WebGL renders at a fixed pose, no clock restart, selected state maintained across scrolling, keyboard selection at 320px, reduced motion, and all three fallback image choices passed. |
| Enlarged scene viewers | All five open from the keyboard, retain the same canvas/context, contain focus, and restore trigger focus on Escape. Camera rotation changes an actual frozen render; keyboard, mouse drag, wheel zoom, and reset passed. |
| Viewer continuity and fallback | The selected boba flavor and sipping sequence continue, other scene clocks stop, page scroll restores on close, and both missing WebGL and context loss preserve an enlarged preview and operable close controls. |
| Viewer on a narrow phone | At 320px, controls fit within the viewport; deliberate touch rotation works with reduced motion while animation clocks stay fixed. |
| Boba materials | Both moving cups have the expected tea/top colors. Flavor changes preserve other materials, geometry, poses, and order-to-sip handoff. Six cached tea materials are reused and each is disposed once. |
| Desktop layout, 1440px wide | No horizontal overflow observed. |
| Tablet layout, 768px wide | No horizontal overflow observed. |
| Phone layout, 390px wide | No horizontal overflow observed. |
| Narrow layout, 320px wide | No horizontal overflow observed. |
| Actual scene rendering | Three.js renders were captured and visually inspected using Chromium software WebGL. |
| Character pose geometry | All nine activity poses produced finite bounds; targeted character TypeScript checking passed. |
| Bench-press grip alignment | 151 sampled poses across five seconds; maximum measured perpendicular hand-to-bar-axis error was 0 model units. |
| Resting bar | The lifting bar is hidden and the racked bar is visible at the expected rack height. |
| Facial and greeting poses | Nap hides open eyes and shows closed eyes. Across 733 greeting samples at 120 Hz, feet stay planted and the six-second loop closes without a position jump. Both arms remain straight, with connected joints, a 0.72-unit reach and 0.36-unit segments: 25% shorter than their previous 0.96-unit total length. |
| Greeting direction and timing | Mid-lift forward movement is 0.708 units versus 0.100 sideways. The raised wrist stays at least 0.572 units above its shoulder, with fingers within 23 degrees of screen-up and the hand beside the face. It settles from 1.45 to 1.65 seconds with no wrist movement, then waves. The approved idle pose and resting arm are retained. |
| Static GLB export | The updated greeting exports successfully; the `glTF` signature, version 2 header, and declared file length passed checks. |
| Model night lighting | All five dioramas passed ten lighting samples, including interpolation, clamping and reset; geometry, ordinary colors, active poses and resource disposal remained correct. |
| Static fallbacks | All five PNGs were regenerated from the actual Three.js scenes after final framing and gym layout corrections. |
| Boba fallback variants | About previews were regenerated for milk tea, matcha, and taro; seven total scene preview assets are available. |
| Greeting fallback | Hero preview regenerated from the raised-hand pose at 1.9 seconds, with HTML controls and decorations excluded from the image. |
| Content and local assets | 49 skills, three projects (two featured and one under More Projects), four employers, both CSL date ranges, the résumé PDF, and the five scene PNGs passed browser checks. |
| Opening layouts | The avatar and primary CTA are visible in the checked desktop, tablet, phone, and narrow layouts; no horizontal overflow was detected. |
| Keyboard behavior | Skip link, visible focus, and expandable details passed the browser checks. |
| Text contrast spot checks | WCAG luminance calculations: main copy 14.04:1, secondary copy 6.19:1, white primary-button text 5.86:1, purple section labels 4.66:1. The scroll cue and contact-art label were darkened after review. This is a check of selected CSS pairs, not a full accessibility audit. |
| No JavaScript | Prerendered content, links, and static scene artwork remain available. |
| Motion control | Pause persistence, resume, offscreen pausing, and the once-only boba ordering introduction passed. |
| Hidden-page handling | A simulated page-visibility event stopped the clocks as expected. |
| Reduced motion | Representative static poses passed the checks. |
| WebGL failure handling | Disabled WebGL, an injected scene-factory failure, and an actual WebGL context-loss event retained or restored static previews. |
| Visual regression comparison | No prior visual baseline exists; a comparison is inconclusive. Current page and scene screenshots were inspected. |

The sequence tests cover the six-second greeting, coding transitions at 6/8/11 seconds, the once-only boba introduction, gym transitions at 5/9 seconds, paused and offscreen clocks, delayed-frame clamping, and stable reduced-motion selections.

Visual inspection prompted adjustments to keyboard and mouse placement, hand heights, distinct drink heights, the closed-eye nap pose, bent bench-press legs, foot placement, and scene props. These are stylized illustrations rather than a biomechanical simulation or a photogrammetric reconstruction of the supplied portrait.

The model checks are implemented in `scripts/check-models.mjs`. They verify the stated properties; the GLB check validates its header and successful export, not compatibility with every external 3D application or baked animation playback. Responsive full-page captures use the generated scene previews because a fixed WebGL canvas cannot paint offscreen sections; the individual section captures show live WebGL renders.

## Observed build sizes

The final production build and prerender completed with these reported output sizes. Values can change after subsequent source edits.

| Output | Uncompressed | Gzip |
| --- | ---: | ---: |
| Lazy Three.js scene chunk | 951.80 kB | 255.69 kB |
| Core application JavaScript | 241.04 kB | 75.46 kB |
| CSS | 58.05 kB | 12.45 kB |
| Prerendered HTML | 44,770 bytes | Not measured |

The scene chunk is substantial and loads separately from the portfolio content. The page uses one shared WebGL context, device pixel ratio 1 at viewport widths up to 600px, and a cap of 1.5 on larger viewports. These are build artifact sizes and rendering settings, not network timings, frame-rate results, or a Lighthouse score.

## Final verification status

The initial greeting update passed production build/type checking, six sequence tests, all 37 browser tests, and the character and night-lighting model checks. The front-to-up lift passed three focused browser checks. The subsequent higher, upright wave passed a fresh production build and character model checks across 733 frames. Raised poses and both wave extremes were visually inspected; the static hero preview was regenerated to match.

Manual Chromium mobile emulation used the loaded Google Fonts and touch input. Page sections, expanded details, night mode, and short landscape viewers were inspected. Improvements address previously undersized links, primary hero links below the first screen on short phones, and the viewer's Close button scrolling out of view. The introduction now precedes the illustration in the document as well as the mobile layout, preserving a sensible keyboard order. Desktop remains side by side. Tests also confirm that clickable props remain free of visible plus overlays.

These checks use browser emulation, not a physical iPhone or Android phone, and do not establish Safari compatibility or mobile GPU/battery performance. No publishing or deployment was performed.

## Reproduce the checks

From the repository root in PowerShell, use the `.cmd` launchers if script execution policy blocks `npm.ps1`. These commands do not require changing execution policy:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Keep the production preview running. In a second terminal:

```powershell
npx.cmd playwright install chromium
npm.cmd run verify
```

For scene inspection, run `npm.cmd run dev` and open `http://127.0.0.1:5173/scripts/scene-studio.html`. Select each scene and activity; scrub the pose time, play the gesture, and orbit around the model. The studio's GLB export preserves the selected static pose, not the procedural animation loops.

Model verification and local screenshot helpers, with the development server running:

```powershell
node scripts/check-models.mjs
node scripts/inspect-scenes.mjs
node scripts/inspect-page.mjs
```

## Limits of this evidence

- Software WebGL confirms that geometry and rendering paths function in the test browser. It does not measure frame rate, battery use, or GPU performance on a physical phone.
- The hidden-page test simulates the page-visibility event; it does not establish behavior under every operating system's background throttling policy.
- No historical screenshot baseline was available, so visual regression against a previous design remains inconclusive.
- Automated checks and selected keyboard observations do not replace a complete screen-reader and accessibility audit.
- The three project images are user-supplied screenshots; Babbli's is the main image from its Devpost page. The TransitOps frame trims its source image's page gutters/header; the GitToCampus phone and Babbli browser frames preserve their full images.
- Factual portfolio content is based on the supplied prompt and documents. The implementation does not independently certify employment history or project outcomes.
- No publishing or deployment is part of these checks.

## English/French and café music verification

The final bilingual and café music release passed the production build/typecheck, all 46 Chromium browser tests (37 existing checks plus nine new acceptance checks), and all six animation sequence tests. No model geometry or animation choreography changed.

- English and French both have prerendered content, document language, titles, descriptions, alternate-language links and native language navigation. `/fr/` remains readable without JavaScript.
- Language selection persists across visits. Explicit English links override a saved French preference; browser history, query parameters and section hashes remain consistent.
- Translation preserves the existing canvas, paused scene clocks, selected boba, theme, open disclosures, personal notes and music playback. Résumé facts, company names, technology names, logos, screenshots and external links retain their meaning. The French résumé link identifies the downloadable PDF as English.
- French layout checks covered 320, 390, 768, 900, 1024 and 1440px widths. Independent scene review at 320×568 and 667×375 checked all 15 notes and five viewers, including focus, rotation, Escape and focus restoration. A shorter French gym viewer title keeps Close within the 320px panel.
- The original 51.9-second instrumental MP3 is local and is requested only after Play. Actual native playback, looping, keyboard seek/volume, mute, pause, silent reload, hidden-page pause, canceled loading and failure/retry all passed. Switching language keeps the same audio element and current playback.
- The player is hidden until hydration, respects reduced motion and exposes labeled controls. It sits directly to the left of About in the main navigation; its panel opens below the header, so the former floating-player footer padding has been removed. Day/night player and French page screenshots were inspected.

The build reports core JavaScript at 264.02 kB (83.60 kB gzip), CSS at 62.58 kB (13.22 kB gzip), and the lazy scene chunk at 952.28 kB (255.90 kB gzip). The audio asset is 1,039,217 bytes and is not part of initial media loading. These sizes are build outputs, not measured connection or rendering performance.

Verification uses Chromium and software WebGL, not a physical phone or Safari. The audio was decoded and tested for playback and signal clipping; its musical feel still benefits from a human listen. Decorative text on the original 3D props remains part of the scene artwork; descriptions, controls and personal notes are translated. The downloadable résumé remains the supplied English PDF.

Release publication uses the existing GitHub Pages workflow on `main`. The README remains unchanged.
The navigation placement follow-up passed a fresh production build/typecheck, 12 targeted language/music/mobile browser tests, and five final responsive layout checks after the small-phone panel adjustment. English and French screenshots were inspected at widths from 320 to 1440px. Independent 1440×1000 and 667×375 checks verified Escape and focus restoration, outside-click and focus-leave dismissal, uninterrupted playback when controls close, and a stable audio element during language changes. No new audio asset or dependencies were introduced by the move. The final position to the left of About passed checks in both languages across ten desktop/mobile layouts, followed by the complete 46-test browser suite and six animation tests before publication.