# Verification record

This record describes checks on the local portfolio implementation. It does not establish accessibility conformance, cross-browser certification, or production performance guarantees.

## Completed checks

| Check | Observed result |
| --- | --- |
| TypeScript | Type checking passed. |
| Production build | Vite build and HTML prerender completed. |
| Sequence unit tests | All five tests passed. |
| Browser regression suite | All 37 tests passed in 1.9 minutes after the mobile layout fixes. No tests were skipped. |
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
| Facial and greeting poses | Nap hides open eyes and shows closed eyes; the waving wrist changes independently while the head position remains stable. |
| Static GLB export | 665,784-byte export after adding invisible prop anchors; the `glTF` signature, version 2 header, and declared file length passed checks. |
| Model night lighting | All five dioramas passed ten lighting samples, including interpolation, clamping and reset; geometry, ordinary colors, active poses and resource disposal remained correct. |
| Static fallbacks | All five PNGs were regenerated from the actual Three.js scenes after final framing and gym layout corrections. |
| Boba fallback variants | About previews were regenerated for milk tea, matcha, and taro; seven total scene preview assets are available. |
| Content and local assets | 49 skills, two projects, four employers, both CSL date ranges, the résumé PDF, and the five scene PNGs passed browser checks. |
| Opening layouts | The avatar and primary CTA are visible in the checked desktop, tablet, phone, and narrow layouts; no horizontal overflow was detected. |
| Keyboard behavior | Skip link, visible focus, and expandable details passed the browser checks. |
| Text contrast spot checks | WCAG luminance calculations: main copy 14.04:1, secondary copy 6.19:1, white primary-button text 5.86:1, purple section labels 4.66:1. The scroll cue and contact-art label were darkened after review. This is a check of selected CSS pairs, not a full accessibility audit. |
| No JavaScript | Prerendered content, links, and static scene artwork remain available. |
| Motion control | Pause persistence, resume, offscreen pausing, and the once-only boba ordering introduction passed. |
| Hidden-page handling | A simulated page-visibility event stopped the clocks as expected. |
| Reduced motion | Representative static poses passed the checks. |
| WebGL failure handling | Disabled WebGL, an injected scene-factory failure, and an actual WebGL context-loss event retained or restored static previews. |
| Visual regression comparison | No prior visual baseline exists; a comparison is inconclusive. Current page and scene screenshots were inspected. |

The sequence tests cover coding transitions at 6/8/11 seconds, the once-only boba introduction, gym transitions at 5/9 seconds, paused and offscreen clocks, delayed-frame clamping, and stable reduced-motion selections.

Visual inspection prompted adjustments to keyboard and mouse placement, hand heights, distinct drink heights, the closed-eye nap pose, bent bench-press legs, foot placement, and scene props. These are stylized illustrations rather than a biomechanical simulation or a photogrammetric reconstruction of the supplied portrait.

The model checks are implemented in `scripts/check-models.mjs`. They verify the stated properties; the GLB check validates its header and successful export, not compatibility with every external 3D application or baked animation playback. Responsive full-page captures use the generated scene previews because a fixed WebGL canvas cannot paint offscreen sections; the individual section captures show live WebGL renders.

## Observed build sizes

The final production build and prerender completed with these reported output sizes. Values can change after subsequent source edits.

| Output | Uncompressed | Gzip |
| --- | ---: | ---: |
| Lazy Three.js scene chunk | 950.40 kB | 255.21 kB |
| Core application JavaScript | 241.04 kB | 75.46 kB |
| CSS | 58.05 kB | 12.45 kB |
| Prerendered HTML | 44,770 bytes | Not measured |

The scene chunk is substantial and loads separately from the portfolio content. The page uses one shared WebGL context, device pixel ratio 1 at viewport widths up to 600px, and a cap of 1.5 on larger viewports. These are build artifact sizes and rendering settings, not network timings, frame-rate results, or a Lighthouse score.

## Final verification status

The mobile update passed production build/type checking and all 37 browser tests, including three new mobile regression cases. The previous five sequence tests and model checks remain applicable; no animation or model code changed in this update.

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
- The two project previews are intentionally labeled concepts; they are not screenshots of deployed products.
- Factual portfolio content is based on the supplied prompt and documents. The implementation does not independently certify employment history or project outcomes.
- No publishing or deployment is part of these checks.
