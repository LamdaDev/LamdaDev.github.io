# Daniel Lam — personal portfolio

A minimalist, whimsical portfolio with five animated chibi scenes: a waving greeting, a boba shop, a gaming setup, a coding desk, and a gym. Professional content comes from Daniel's supplied résumé and project descriptions.

## Preview

Open `index.html` in a browser. The file contains its own styles, scripts, avatar artwork, project illustrations, and downloadable résumé. Google Fonts are the only optional external assets; system fonts work offline.

For a local HTTP preview, run this command from the repository and visit `http://localhost:8000`:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

The root `index.html` and `.nojekyll` are ready for static hosting with GitHub Pages. Publishing requires committing and pushing the files and configuring Pages for the branch containing them.

## Edit and build

The source files make editing easier; the finished website still needs only `index.html`.

| File | Purpose |
| --- | --- |
| `src/template.html` | Page structure, hero/about/contact copy, and project preview slots |
| `src/content.json` | Skills, projects, and experience, including exact dates and supported metrics |
| `src/site.css` | Layout, colors, typography, responsive styles, and focus states |
| `src/site.js` | Navigation highlighting and the persistent animation pause control |
| `scripts/generate_scenes.py` | Source of the five SVG scenes, gestures, and sequence controller |
| `src/scenes.json`, `scene-defs.html`, `scenes.css`, `scenes.js` | Generated scene modules consumed by the page build |
| `assets/chibi.jpg` | Supplied portrait, embedded unchanged and clipped with an SVG silhouette |
| `assets/Daniel_Lam_CV_SWE.pdf` | Supplied résumé, embedded in the download link |

After editing the page or content, rebuild with Python 3 (standard library only):

```sh
python scripts/build.py
```

If changing avatar artwork, poses, or animation behavior, edit the scene generator, then run:

```sh
python scripts/generate_scenes.py
python scripts/build.py
```

The boba introduction plays once per page load. Coding cycles through 6 seconds of typing, 2 seconds of Coke Zero, and 3 seconds of napping. The gym cycles through 5 seconds of bench pressing and 4 seconds of rest with water. Activities switch immediately. All scene clocks and gestures pause offscreen or in a hidden tab. The navigation pause button remembers the visitor's preference. Reduced-motion settings show static poses; content and anchor navigation also work without JavaScript.

## Design tokens

| Token | Value |
| --- | --- |
| Body and headings | DM Sans, with a system sans-serif fallback |
| Small arcade accents | Press Start 2P, with a monospace fallback |
| Type scale | Hero 49–126px; section headings 32–49px; card headings 19–27px; body 14–18px; compact labels 10–13px |
| Background / surface | Warm cream `#FFF9F0` / white `#FFFFFF` |
| Main / secondary text | Dark plum `#292638` / muted plum `#615B70` |
| Main accent | Purple `#6D4CCF` |
| Pastel surfaces | Lavender `#EAE1FF`, mint `#DFF5E6`, peach `#FFE2CF`, blue `#E3EEF9` |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64px rhythm; section padding 65–105px |
| Content width | Maximum 1160px; mobile page gutters 16–20px |
| Radii | Buttons 9px; skill panels 13px; project cards 17px; scenes 20px; contact 23px |
| Shadows | Buttons: crisp 3px × 3px dark-plum shadow; scenes: restrained 4px bottom shadow |

## Replace the project previews

Both slots are in `src/template.html`, with comments beginning `SCREENSHOT SLOT`. They use a consistent **16:10** aspect ratio.

- **TransitOps Montreal:** replace the children of `#transit-preview`.
- **GitToCampus:** replace the children of `#campus-preview`.

For an actual screenshot, use an embedded image and remove the concept illustration and `Concept preview` label. Remove the wrapper's `role="img"` and `aria-label` so the image's meaningful `alt` is used. For example:

```html
<div id="transit-preview" class="project-preview transit-preview">
  <img src="data:image/webp;base64,YOUR_BASE64_IMAGE" alt="Describe the actual screen shown here">
</div>
```

Keep image data embedded if the HTML must remain portable. The existing CSS fills the preview area with `object-fit: cover`; use `contain` if showing the whole screenshot matters more than filling the frame. Rebuild after replacing a preview.

## Résumé

The **Download résumé** button already works using the supplied PDF. Replace `assets/Daniel_Lam_CV_SWE.pdf` and rebuild to update it. To use a hosted PDF instead, change the résumé link's `href` in `src/template.html` and remove the unused `{{RESUME}}` replacement from `scripts/build.py`.

## Browser verification

QA uses Playwright as an optional development tool:

```sh
python -m pip install playwright
python -m playwright install chromium
python scripts/verify_portfolio.py
```

The script checks desktop and narrow mobile layouts, anchors, supplied skills, embedded assets, reduced motion, JavaScript-free navigation, animation sequences, offscreen pausing, and the pause control. It saves screenshots and a JSON report to the system temporary directory under `daniel-portfolio-qa`. Use `--output` to choose another location and `--browser` to select a Chromium executable. `scripts/preview_scenes.py` creates a separate contact sheet of the avatar poses.
