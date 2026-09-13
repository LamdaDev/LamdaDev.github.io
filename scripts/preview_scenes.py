"""Render every avatar activity to a temporary contact sheet for visual QA."""

import html
import json
import os
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(os.environ.get("TEMP", "/tmp")) / "daniel-portfolio-qa"
CHROMIUM = Path(r"C:\Users\lamda\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe")
ACTIVITIES = [
    ("hero", "wave"), ("about", "order"), ("about", "sip"),
    ("skills", "game"), ("projects", "code"), ("projects", "drink"),
    ("projects", "nap"), ("experience", "bench"), ("experience", "rest"),
]


def main():
    scenes = json.loads((ROOT / "src/scenes.json").read_text(encoding="utf-8-sig"))
    definitions = (ROOT / "src/scene-defs.html").read_text(encoding="utf-8")
    css = (ROOT / "src/scenes.css").read_text(encoding="utf-8")
    cards = []
    for scene, state in ACTIVITIES:
        svg = re.sub(r'data-state="[^"]*"', f'data-state="{state}"', scenes[scene], count=1)
        # Prefix scene-local IDs when repeated states share the same artwork.
        ids = re.findall(r'\bid="([^"]+)"', svg)
        for local_id in ids:
            svg = svg.replace(f'id="{local_id}"', f'id="{state}-{local_id}"')
            svg = svg.replace(f'#{local_id}', f'#{state}-{local_id}')
            svg = svg.replace(f'aria-labelledby="{local_id}"', f'aria-labelledby="{state}-{local_id}"')
        cards.append(f'<article><h2>{html.escape(scene)} / {html.escape(state)}</h2>{svg}</article>')
    page_html = f'''<!doctype html><html lang="en" data-motion="paused"><meta charset="utf-8">
      <title>Avatar scene visual QA</title><style>
      body{{margin:0;padding:24px;background:#fff9f0;color:#292638;font:16px sans-serif}}
      main{{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}}
      article{{border:1px solid #cabfd6;border-radius:16px;overflow:hidden;background:white}}
      h2{{font-size:16px;padding:0 18px;margin:18px 0 0}}
      {css}</style><body>{definitions}<main>{''.join(cards)}</main></body></html>'''
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = OUTPUT / "scene-contact-sheet.html"
    source.write_text(page_html, encoding="utf-8")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=str(CHROMIUM) if CHROMIUM.exists() else None)
        page = browser.new_page(viewport={"width": 1680, "height": 1100}, device_scale_factor=1)
        page.goto(source.as_uri(), wait_until="load")
        page.screenshot(path=str(OUTPUT / "scene-contact-sheet.png"), full_page=True)
        for scene, state in ACTIVITIES:
            page.locator(f'[data-scene="{scene}"][data-state="{state}"]').screenshot(
                path=str(OUTPUT / f"scene-static-{scene}-{state}.png"))
        bench = page.locator('[data-scene="experience"][data-state="bench"]')
        bench.evaluate("""node => node.getAnimations({subtree:true}).forEach(animation => {
          if (animation.animationName.startsWith('bench-')) animation.currentTime = 825;
        })""")
        bench.screenshot(path=str(OUTPUT / "scene-static-experience-bench-bottom.png"))
        coding = page.locator('[data-scene="projects"][data-state="code"]')
        coding.evaluate("""node => node.getAnimations({subtree:true}).forEach(animation => {
          if (animation.animationName === 'little-blink') animation.currentTime = 5500;
        })""")
        coding.screenshot(path=str(OUTPUT / "scene-static-projects-code-blink.png"))
        browser.close()
    print(OUTPUT / "scene-contact-sheet.png")


if __name__ == "__main__":
    main()
