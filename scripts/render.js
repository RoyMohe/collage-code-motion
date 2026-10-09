#!/usr/bin/env node
// Render frames of a built project with headless Chromium (Playwright).
// Usage: node scripts/render.js <project_dir> [--frames 0,12,40] [--out <dir>]
// Serves the project over a tiny local HTTP server (canvas must not be tainted),
// writes <project>/timeline.json (for audio.py) and PNG frames f0000.png …
const http = require('http'), fs = require('fs'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch { console.error('npm i playwright  (and: npx playwright install chromium)'); process.exit(1); }
const args = process.argv.slice(2), proj = path.resolve(args[0] || '.');
const opt = k => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : null; };
const out = path.resolve(opt('--out') || path.join(proj, 'frames')), only = opt('--frames');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml' };
const server = http.createServer((q, r) => { const p = path.join(proj, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(proj) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port; fs.mkdirSync(out, { recursive: true });
  const exe = process.env.CHROMIUM_PATH; const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => console.log('page:', m.text())); p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?still`); await p.evaluate(() => window.ready);
  const tl = await p.evaluate(() => window.TIMELINE); fs.writeFileSync(path.join(proj, 'timeline.json'), JSON.stringify(tl, null, 1));
  const list = only ? only.split(',').map(Number) : [...Array(tl.frames).keys()];
  const t0 = Date.now();
  for (const f of list) { const d = await p.evaluate(f => { renderFrame(f); return document.getElementById('c').toDataURL('image/png'); }, f);
    fs.writeFileSync(path.join(out, `f${String(f).padStart(4, '0')}.png`), Buffer.from(d.split(',')[1], 'base64'));
    if (!only && f % 60 === 0) process.stdout.write(`  frame ${f}/${tl.frames}\n`); }
  console.log(`rendered ${list.length} frame(s) → ${out} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await b.close(); server.close();
});
