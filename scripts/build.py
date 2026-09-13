"""Build the portable HTML using only Python's standard library."""
from pathlib import Path
import base64
import html
import json

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'

def icon(name):
    return f'<svg class="icon" aria-hidden="true"><use href="#icon-{name}"/></svg>'

def bullets(items, css=''):
    return f'<ul class="{css}">' + ''.join(f'<li>{html.escape(item)}</li>' for item in items) + '</ul>'

def build():
    data = json.loads((SRC / 'content.json').read_text(encoding='utf-8'))
    scenes = json.loads((SRC / 'scenes.json').read_text(encoding='utf-8-sig'))
    skills = ''.join(f'<article class="skill-card"><h3>{icon(s["icon"])}{html.escape(s["name"])}</h3>{bullets(s["items"], "skill-list")}</article>' for s in data['skills'])
    projects = {}
    for p in data['projects']:
        e = {key: html.escape(value, quote=True) for key, value in p.items() if isinstance(value, str)}
        projects[p['id']] = f'''<div class="project-body">
<div class="project-meta"><span class="status {e['status_class']}"><span aria-hidden="true">✦</span> {e['status']}</span><span>{e['dates']}</span></div>
<h3>{e['name']}</h3><p class="project-caption">{e['caption']}</p><p>{e['description']}</p>
{bullets(p['tech'], 'tech-badges')}
<details><summary>Inside the build <span aria-hidden="true">+</span></summary>{bullets(p['details'])}</details>
<a class="project-link" href="{e['url']}" target="_blank" rel="noopener noreferrer">Explore the code {icon('external')}<span class="sr-only"> for {e['name']} (opens in a new tab)</span></a></div>'''
    experiences = []
    for job in data['experience']:
        e = {key: html.escape(value, quote=True) for key, value in job.items() if isinstance(value, str)}
        experiences.append(f'''<li><article class="experience-entry"><div class="experience-heading"><span class="company-tile {e['color']}" aria-hidden="true">{e['initials']}</span><div><p class="experience-date">{e['dates']}</p><h3>{e['company']}</h3><p class="job-role">{e['role']} <span>· {e['location']}</span></p></div></div><p>{e['summary']}</p><p class="result-note"><span aria-hidden="true">↗</span> {e['result']}</p><details><summary>More about the role <span aria-hidden="true">+</span></summary>{bullets(job['details'])}</details></article></li>''')
    replacements = {
        '{{PAGE_CSS}}': (SRC / 'site.css').read_text(encoding='utf-8'),
        '{{SCENE_CSS}}': (SRC / 'scenes.css').read_text(encoding='utf-8'),
        '{{SCENE_DEFS}}': (SRC / 'scene-defs.html').read_text(encoding='utf-8'),
        '{{PAGE_JS}}': (SRC / 'site.js').read_text(encoding='utf-8'),
        '{{SCENE_JS}}': (SRC / 'scenes.js').read_text(encoding='utf-8'),
        '{{SKILLS}}': skills,
        '{{TRANSIT_CONTENT}}': projects['transit'],
        '{{CAMPUS_CONTENT}}': projects['campus'],
        '{{EXPERIENCE}}': ''.join(experiences),
        '{{RESUME}}': 'data:application/pdf;base64,' + base64.b64encode((ROOT / 'assets' / 'Daniel_Lam_CV_SWE.pdf').read_bytes()).decode('ascii'),
    }
    for key, value in scenes.items():
        replacements['{{SCENE_' + key.upper() + '}}'] = value
    page = (SRC / 'template.html').read_text(encoding='utf-8')
    for key, value in replacements.items():
        if key not in page:
            raise ValueError('Missing template slot: ' + key)
        page = page.replace(key, value)
    if '{{' in page:
        raise ValueError('Unfilled template slot remains')
    dest = ROOT / 'index.html'
    dest.write_text(page, encoding='utf-8')
    print(f'Built {dest} ({dest.stat().st_size:,} bytes)')

if __name__ == '__main__':
    build()
