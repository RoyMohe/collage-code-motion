#!/usr/bin/env python3
"""Assemble <project>/index.html = engine (core, presets) + project (config, timeline) + engine.js.
Usage: python3 scripts/build.py <project_dir>
Open index.html over http (see render.js) — it auto-plays; add ?still to stop autoplay."""
import sys, os
here = os.path.dirname(os.path.abspath(__file__)); eng = os.path.join(here, '..', 'engine')
proj = sys.argv[1] if len(sys.argv) > 1 else '.'
parts = [os.path.join(proj, 'config.js'), os.path.join(eng, 'core.js'), os.path.join(eng, 'presets.js'),
         os.path.join(proj, 'timeline.js'), os.path.join(eng, 'engine.js')]
for p in parts:
    if not os.path.exists(p): sys.exit(f'missing {p}')
js = '\n'.join(f'// ===== {os.path.basename(p)} =====\n' + open(p, encoding='utf-8').read() for p in parts)
html = ('<!doctype html><html><head><meta charset="utf-8"><title>collage-code-motion</title>'
        '<style>html,body{margin:0;background:#0a0a0a}canvas{display:block;width:100vw;height:auto}</style></head>'
        '<body><canvas id="c" width="1920" height="1080"></canvas><script>\n' + js + '\n</script></body></html>')
open(os.path.join(proj, 'index.html'), 'w', encoding='utf-8').write(html)
print('built', os.path.join(proj, 'index.html'))
