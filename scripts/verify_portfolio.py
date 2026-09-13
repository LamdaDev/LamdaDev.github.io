"""Exercise the self-contained portfolio in Chromium; save evidence outside the repo.

Install the optional QA dependency with `python -m pip install playwright` and
`python -m playwright install chromium`, then run `python scripts/verify_portfolio.py`.
No browser dependency is required to open the finished index.html.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import async_playwright


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BROWSER = Path(
    r"C:\Users\lamda\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
)
ALLOWED_HOSTS = {"fonts.googleapis.com", "fonts.gstatic.com"}
SECTION_IDS = ["about", "skills", "projects", "experience", "contact"]
SCENE_NAMES = ["hero", "about", "skills", "projects", "experience"]
REQUIRED_SKILLS = [
    "Go", "TypeScript", "JavaScript", "Python", "Java", "C++", "SQL", "C#", "Dart", "Kotlin",
    "React", "React Native", "Expo", "HTML/CSS", "Flutter", "Node.js", "Express.js", "REST APIs",
    "Kubernetes", "Docker", "Kafka", "Linux", "CI/CD", "AWS", "Microsoft Azure", "Databricks",
    "Snowflake", "PostgreSQL", "SQL Server", "MySQL", "MongoDB", "GraphQL", "Git", "GitLab",
    "Gerrit", "Jenkins", "SonarCloud", "Jest", "Postman", "Agile/Scrum",
]


def check(condition, message):
    if not condition:
        raise AssertionError(message)


async def inspect_document(page):
    return await page.evaluate("""() => {
      const ids = [...document.querySelectorAll('[id]')].map(n => n.id);
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        missingAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .map(n => n.getAttribute('href')).filter(h => h.length < 2 || !document.getElementById(decodeURIComponent(h.slice(1)))),
        duplicateIds: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))],
        brokenImages: [...document.images].filter(n => !n.complete || !n.naturalWidth).map(n => n.alt),
        externalScripts: [...document.querySelectorAll('script[src]')].map(n => n.src),
        h1Count: document.querySelectorAll('h1').length,
        scenes: [...document.querySelectorAll('[data-scene]')].map(n => ({
          name: n.dataset.scene, state: n.dataset.state, running: n.dataset.running,
          width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height
        })),
        overflowElements: [...document.body.querySelectorAll('*')].filter(n => {
          const r = n.getBoundingClientRect();
          return getComputedStyle(n).position !== 'fixed' && r.width > 0 &&
            (r.right > innerWidth + 2 || r.left < -2) &&
            !n.closest('svg') && getComputedStyle(n).visibility !== 'hidden';
        }).slice(0, 12).map(n => n.tagName + '.' + String(n.className)),
        headings: [...document.querySelectorAll('h1,h2,h3')].map(n => n.textContent.trim())
      };
    }""")


async def open_page(browser, url, viewport, *, reduced_motion=False, java_script=True):
    context = await browser.new_context(
        viewport=viewport,
        device_scale_factor=1,
        reduced_motion="reduce" if reduced_motion else "no-preference",
        java_script_enabled=java_script,
    )
    page = await context.new_page()
    errors, requests = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url))
    await page.goto(url, wait_until="load")
    await page.wait_for_timeout(250)
    return context, page, errors, requests


async def layout_check(browser, url, output, width, height):
    context, page, errors, requests = await open_page(browser, url, {"width": width, "height": height})
    try:
        evidence = await inspect_document(page)
        check(evidence["scrollWidth"] <= width + 1 and evidence["bodyWidth"] <= width + 1,
              f"Horizontal overflow at {width}px: {evidence}")
        check(not evidence["missingAnchors"], f"Broken anchors: {evidence['missingAnchors']}")
        check(not evidence["duplicateIds"], f"Duplicate IDs: {evidence['duplicateIds']}")
        check(not evidence["brokenImages"], f"Unloaded images: {evidence['brokenImages']}")
        check(not evidence["externalScripts"], "The single-file website loads external scripts")
        check(evidence["h1Count"] == 1, "Expected exactly one main heading")
        check(sorted(s["name"] for s in evidence["scenes"]) == sorted(SCENE_NAMES),
              "Expected the five specified scenes")
        for section in SECTION_IDS:
            check(await page.locator(f"#{section}").count() == 1, f"Missing {section} section")
        skills = await page.locator("#skills").text_content()
        missing_skills = [skill for skill in REQUIRED_SKILLS if skill not in skills]
        check(not missing_skills, f"Missing supplied skills: {missing_skills}")
        for repository in ["TransitOps-Montreal", "GitToCampus"]:
            check(await page.locator(f'a[href="https://github.com/LamdaDev/{repository}"]').count() > 0,
                  f"Missing project repository link: {repository}")
        external_requests = [u for u in requests if urlparse(u).scheme in {"http", "https"}
                             and urlparse(u).hostname not in ALLOWED_HOSTS]
        check(not external_requests, f"Unexpected external assets: {external_requests}")
        local_assets = [u for u in requests if urlparse(u).scheme == "file" and
                        urlparse(u).path != urlparse(url).path]
        check(not local_assets, f"HTML depends on separate local assets: {local_assets}")
        check(not errors, f"JavaScript errors: {errors}")
        hero = await page.locator('[data-scene="hero"]').bounding_box()
        check(hero is not None and hero["y"] < height and hero["y"] + hero["height"] > 0,
              f"Hero avatar is entirely below the fold at {width}px")
        await page.screenshot(path=str(output / f"portfolio-{width}-full.png"), full_page=True)
        await page.screenshot(path=str(output / f"portfolio-{width}-hero.png"))
        if width == 1440:
            await page.keyboard.press("Tab")
            focus = await page.evaluate("""() => ({
              tag: document.activeElement.tagName,
              href: document.activeElement.getAttribute('href'),
              outline: getComputedStyle(document.activeElement).outlineStyle
            })""")
            check(focus["tag"] == "A" and (focus["href"] or "").startswith("#"),
                  "The first keyboard stop should be a skip link")
            evidence["firstKeyboardFocus"] = focus
            for name in ["hero", "skills"]:
                scene = page.locator(f'[data-scene="{name}"]')
                await scene.scroll_into_view_if_needed()
                await scene.screenshot(path=str(output / f"scene-{name}.png"))
        return evidence
    finally:
        await context.close()


async def fallback_check(browser, url, output, *, reduced_motion=False, java_script=True):
    label = "reduced-motion-no-javascript" if reduced_motion and not java_script else "reduced-motion" if reduced_motion else "no-javascript"
    context, page, errors, _ = await open_page(
        browser, url, {"width": 390, "height": 844},
        reduced_motion=reduced_motion, java_script=java_script,
    )
    try:
        for section in SECTION_IDS:
            check(await page.locator(f"#{section}").is_visible(), f"{section} missing in {label}")
        check(await page.locator('a[href="mailto:lam.daniel.123@hotmail.com"]').count() > 0,
              f"Contact email unavailable in {label}")
        if reduced_motion:
            await page.locator('[data-scene="about"]').scroll_into_view_if_needed()
            await page.wait_for_timeout(200)
            active = await page.evaluate("""() => document.getAnimations().filter(a =>
              a.playState === 'running' && a.effect?.getComputedTiming().duration > 1
            ).map(a => ({name:a.animationName, target:a.effect.target?.tagName}))""")
            check(not active, f"Animation continues under reduced motion: {active}")
        for name in SCENE_NAMES:
            pose = await page.locator(f'[data-scene="{name}"]').evaluate("""node => {
              const states = [...node.querySelectorAll('.scene-state')];
              return {state:node.dataset.state, count:states.length,
                visible:states.filter(n=>getComputedStyle(n).display !== 'none').length};
            }""")
            check(pose["count"] == 0 or pose["visible"] > 0, f"Blank {name} pose in {label}: {pose}")
        if not java_script:
            await page.locator('a[href="#projects"]').first.click()
            check(page.url.endswith("#projects"), "Anchor navigation failed without JavaScript")
        await page.screenshot(path=str(output / f"portfolio-{label}.png"), full_page=True)
        check(not errors, f"JavaScript errors in {label}: {errors}")
        return {"mode": label, "passed": True}
    finally:
        await context.close()


async def scene_check(browser, url, output, name, expected, duration):
    context, page, errors, _ = await open_page(browser, url, {"width": 1440, "height": 1000})
    try:
        scene = page.locator(f'[data-scene="{name}"]')
        await scene.scroll_into_view_if_needed()
        await page.wait_for_function(
            "name => document.querySelector(`[data-scene=\"${name}\"]`).dataset.running === 'true'", arg=name
        )
        samples = []
        started = asyncio.get_running_loop().time()
        while asyncio.get_running_loop().time() - started < duration:
            state = await scene.get_attribute("data-state")
            if not samples or samples[-1]["state"] != state:
                samples.append({"state": state, "seconds": round(asyncio.get_running_loop().time() - started, 2)})
                await scene.screenshot(path=str(output / f"scene-{name}-{state}.png"))
            await page.wait_for_timeout(150)
        actual = [s["state"] for s in samples]
        check(actual[:len(expected)] == expected, f"{name} sequence: expected {expected}, observed {actual}")
        await page.evaluate("""name => window.scrollTo({
          top: name === 'about' ? document.documentElement.scrollHeight : 0,
          behavior:'instant'
        })""", name)
        await page.wait_for_timeout(350)
        check(await scene.get_attribute("data-running") == "false", f"{name} did not pause offscreen")
        running = await scene.evaluate("n => n.getAnimations({subtree:true}).filter(a => a.playState === 'running').length")
        check(running == 0, f"{name} has {running} CSS animations running offscreen")
        before = await page.evaluate("name => window.portfolioScenes.find(s => s.kind === name).elapsed", name)
        await page.wait_for_timeout(250)
        after = await page.evaluate("name => window.portfolioScenes.find(s => s.kind === name).elapsed", name)
        check(before == after, f"{name} sequence clock continued offscreen: {before} -> {after}")
        if name == "about":
            await scene.scroll_into_view_if_needed()
            await page.wait_for_timeout(350)
            check(await scene.get_attribute("data-state") == "sip", "Boba ordering introduction restarted on revisit")
        check(not errors, f"JavaScript errors in {name}: {errors}")
        return {"scene": name, "samples": samples, "offscreenPause": True}
    finally:
        await context.close()


async def pause_check(browser, url):
    context, page, errors, _ = await open_page(browser, url, {"width": 1440, "height": 1000})
    try:
        toggle = page.locator('[data-motion-toggle], #motion-toggle')
        if not await toggle.count():
            toggle = page.get_by_role("button", name=re.compile(r"pause.*(motion|animation)|pause scene", re.I))
        check(await toggle.count() == 1, "Expected a discoverable animation pause control")
        await toggle.click()
        await page.wait_for_timeout(350)
        check(await page.locator("html").get_attribute("data-motion") == "paused", "Pause control did not pause motion")
        active = await page.evaluate("() => document.getAnimations().filter(a => a.playState === 'running').length")
        check(active == 0, f"{active} animations continue after user pause")
        await toggle.click()
        await page.wait_for_timeout(150)
        check(await page.locator("html").get_attribute("data-motion") == "running", "Pause control did not resume motion")
        check(not errors, f"JavaScript errors during pause test: {errors}")
        return {"pauseAndResume": True}
    finally:
        await context.close()


async def contrast_check(browser, url):
    context, page, errors, _ = await open_page(browser, url, {"width": 1440, "height": 1000})
    try:
        result = await page.evaluate("""() => {
          const rgba = value => {
            const channels = value.match(/[\\d.]+/g).map(Number);
            return [...channels.slice(0,3), channels[3] ?? 1];
          };
          const blend = (front, back) => front.slice(0,3).map((v,i) => v * front[3] + back[i] * (1-front[3]));
          const luminance = rgb => rgb.map(v => {
            v /= 255;
            return v <= .04045 ? v / 12.92 : ((v+.055)/1.055) ** 2.4;
          }).reduce((sum,v,i) => sum + v * [.2126,.7152,.0722][i], 0);
          const checks = [];
          for (const node of document.querySelectorAll('body *')) {
            if (node.closest('svg,[aria-hidden="true"],[role="img"],.sr-only') ||
                ![...node.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())) continue;
            const style = getComputedStyle(node), box = node.getBoundingClientRect();
            if (!box.width || !box.height || style.visibility === 'hidden' || style.display === 'none') continue;
            const ancestors = [];
            for (let ancestor=node; ancestor; ancestor=ancestor.parentElement) ancestors.unshift(ancestor);
            let background = [255,255,255];
            for (const ancestor of ancestors) background = blend(rgba(getComputedStyle(ancestor).backgroundColor), background);
            const foreground = blend(rgba(style.color), background);
            const l1=luminance(foreground), l2=luminance(background);
            const ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
            const large=parseFloat(style.fontSize) >= 24 ||
              (parseFloat(style.fontSize) >= 18.66 && parseFloat(style.fontWeight) >= 700);
            checks.push({text:node.textContent.trim().slice(0,80), ratio:Number(ratio.toFixed(2)), threshold:large?3:4.5});
          }
          return {count:checks.length, minimum:Math.min(...checks.map(c=>c.ratio)),
            failures:checks.filter(c=>c.ratio < c.threshold)};
        }""")
        check(not result["failures"], f"HTML text contrast below AA: {result['failures']}")
        check(not errors, f"JavaScript errors during contrast test: {errors}")
        return result
    finally:
        await context.close()


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", type=Path, default=ROOT / "index.html")
    parser.add_argument("--output", type=Path,
                        default=Path(os.environ.get("TEMP", "/tmp")) / "daniel-portfolio-qa")
    parser.add_argument("--browser", type=Path,
                        default=DEFAULT_BROWSER if DEFAULT_BROWSER.exists() else None)
    parser.add_argument("--skip-sequences", action="store_true", help="Skip the 14-second real-time sequence checks")
    args = parser.parse_args()
    check(args.html.is_file(), f"Portfolio is missing: {args.html}")
    args.output.mkdir(parents=True, exist_ok=True)
    url = args.html.resolve().as_uri()
    report = {"html": str(args.html.resolve()), "htmlBytes": args.html.stat().st_size,
              "htmlModified": args.html.stat().st_mtime, "checks": [], "failures": []}
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=True, executable_path=str(args.browser) if args.browser else None,
        )
        jobs = [
            (f"layout-{width}", layout_check(browser, url, args.output, width, height))
            for width, height in [(1440, 1000), (390, 844), (320, 760)]
        ]
        jobs.extend([
            ("reduced-motion", fallback_check(browser, url, args.output, reduced_motion=True)),
            ("no-javascript", fallback_check(browser, url, args.output, java_script=False)),
            ("reduced-motion-no-javascript", fallback_check(browser, url, args.output, reduced_motion=True, java_script=False)),
            ("pause-control", pause_check(browser, url)),
            ("text-contrast", contrast_check(browser, url)),
        ])
        if not args.skip_sequences:
            jobs.extend([
                ("boba-sequence", scene_check(browser, url, args.output, "about", ["order", "sip"], 5)),
                ("coding-sequence", scene_check(browser, url, args.output, "projects", ["code", "drink", "nap", "code"], 14)),
                ("gym-sequence", scene_check(browser, url, args.output, "experience", ["bench", "rest", "bench"], 12)),
            ])
        results = await asyncio.gather(*(job for _, job in jobs), return_exceptions=True)
        for (label, _), result in zip(jobs, results):
            if isinstance(result, BaseException):
                report["failures"].append({"check": label, "error": str(result)})
                print(f"FAIL {label}: {result}")
            else:
                report["checks"].append({"check": label, "evidence": result})
                print(f"PASS {label}")
        await browser.close()
    report_name = "report-layout.json" if args.skip_sequences else "report.json"
    (args.output / report_name).write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Evidence: {args.output}")
    if report["failures"]:
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
