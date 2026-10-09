// =====================================================================
//  collage-code-motion · core.js — canvas, palette, easing, textures,
//  procedural assets (sneaker, engraved eye) and collage helpers.
//  Everything is drawn on a 1000x1000 "stage" (S); the engine composites it.
// =====================================================================
const C = document.getElementById('c'), X = C.getContext('2d');
const FPS = CONFIG.fps || 24, S = 1000;
const FILM = CONFIG.layout === 'film', W = FILM ? 1080 : 1920, H = 1080; C.width = W; C.height = H;
let N = 0; // total frames, set by engine from the timeline
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; };
const stage = mk(S), G = stage.getContext('2d');
const tmp = mk(S), T = tmp.getContext('2d');

const P = Object.assign({ RED:'#E8321E', GREEN:'#19C98A', CREAM:'#F2EBDD', INK:'#151515', YELLOW:'#FFD21F', TEAL:'#1D8CA8',
  ORANGE:'#FF6A1A', NAVY:'#1E3B73', WHITE:'#FFFFFF', PINK:'#FF8FB1', KRAFT:'#C89A62', CONCRETE:'#8E8C88' }, CONFIG.palette || {});
const FONTS = Object.assign({
  display: '"Inter Display","Inter","Archivo Black","Helvetica Neue","Arial Black",sans-serif',
  cjk: '"Noto Sans CJK SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK JP",sans-serif',
  mono: '"JetBrains Mono","DejaVu Sans Mono","SF Mono","Menlo","Consolas",monospace',
  emoji: '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif' }, CONFIG.fonts || {});
const DISPLAY = FONTS.display, CJK = FONTS.cjk, MONO = FONTS.mono, EMOJI = FONTS.emoji;

// ---------- utils ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pr = (f, a, b) => clamp((f - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eIn = t => t * t * t;
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eBack = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const qb = (x0, y0, x1, y1, x2, y2, t) => [(1-t)*(1-t)*x0 + 2*(1-t)*t*x1 + t*t*x2, (1-t)*(1-t)*y0 + 2*(1-t)*t*y1 + t*t*y2];
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function poly(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }

// ---------- textures ----------
const grain = mk(512); { const g = grain.getContext('2d'), id = g.createImageData(512, 512), r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i+1] = id.data[i+2] = v; id.data[i+3] = 46; } g.putImageData(id, 0, 0); }
function addGrain(g, amt, f) { g.save(); g.globalAlpha = .55 * amt; g.globalCompositeOperation = 'overlay';
  const k = f >> 1, ox = (k * 137) % 512, oy = (k * 91) % 512; g.translate(-ox, -oy);
  for (let x = 0; x < S + 512; x += 512) for (let y = 0; y < S + 512; y += 512) g.drawImage(grain, x, y); g.restore(); }
const concrete = mk(S); { const g = concrete.getContext('2d'), r = rng(42); g.fillStyle = P.CONCRETE; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 500; i++) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${.02 + r() * .05})` : `rgba(0,0,0,${.02 + r() * .06})`; g.beginPath(); g.arc(r() * S, r() * S, 10 + r() * 120, 0, 7); g.fill(); }
  for (let i = 0; i < 26000; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.3)'; g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2); } }
function newsprint(g, seed, col = 'rgba(20,20,20,.07)') { const r = rng(seed); g.fillStyle = col;
  for (let y = 36; y < S; y += 17) { let x = 28; while (x < S - 28) { const w = 18 + r() * 90; g.fillRect(x, y, Math.min(w, S - 28 - x), 6); x += w + 9; } } }
function halftone(g, x, y, w, h, col, step, fn) { g.fillStyle = col; let row = 0;
  for (let yy = y; yy < y + h; yy += step, row++) for (let xx = x + (row % 2 ? step / 2 : 0); xx < x + w; xx += step) {
    const r = fn(xx, yy); if (r > .3) { g.beginPath(); g.arc(xx, yy, r, 0, 6.2832); g.fill(); } } }
function sunburst(g, cx, cy, n, cols, rot) { const R = 1600, da = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) { const a = rot + i * da; g.fillStyle = cols[i % cols.length]; g.beginPath(); g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a + da) * R, cy + Math.sin(a + da) * R); g.closePath(); g.fill(); } }
function tornPts(x, y, w, h, seed, j = 7, step = 15) { const r = rng(seed), p = [];
  for (let i = 0; i <= w; i += step) p.push([x + i, y + (r() - .5) * j * 2]);
  for (let i = 0; i <= h; i += step) p.push([x + w + (r() - .5) * j * 2, y + i]);
  for (let i = w; i >= 0; i -= step) p.push([x + i, y + h + (r() - .5) * j * 2]);
  for (let i = h; i >= 0; i -= step) p.push([x + (r() - .5) * j * 2, y + i]); return p; }
function tornCard(g, cx, cy, w, h, rot, col, seed, inner, sc = 1) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(sc, sc); const pts = tornPts(-w / 2, -h / 2, w, h, seed);
  g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 22; g.shadowOffsetY = 10; g.fillStyle = '#fbf8f1'; poly(g, tornPts(-w/2-6, -h/2-6, w+12, h+12, seed + 99, 6)); g.fill(); g.restore();
  g.fillStyle = col; poly(g, pts); g.fill(); if (inner) { g.save(); poly(g, pts); g.clip(); inner(g); g.restore(); } g.restore(); }
function extruded(g, txt, x, y, font, face, side, outline, depth, dx = 1, dy = 1, olw = 22) {
  g.save(); g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (outline) { g.strokeStyle = outline; g.lineWidth = olw; for (let i = depth; i >= 0; i -= 2) g.strokeText(txt, x + i * dx, y + i * dy); }
  g.fillStyle = side; for (let i = depth; i > 0; i--) g.fillText(txt, x + i * dx, y + i * dy);
  g.fillStyle = face; g.fillText(txt, x, y); g.restore(); }
function shakeXY(l, a, amt, dur = 8) { const t = l - a; if (t < 0 || t > dur) return [0, 0]; const k = amt * (1 - t / dur); return [Math.sin(t * 9.1) * k, Math.cos(t * 7.3) * k]; }
function bolt(g, x, y, s, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  poly(g, [[-30,-60],[20,-60],[2,-12],[32,-12],[-22,62],[-6,8],[-36,8]]); g.fillStyle = col; g.fill(); g.lineWidth = 4 / s; g.strokeStyle = P.INK; g.stroke(); g.restore(); }

// ---------- procedural assets: sneaker ----------
const SN = {
  sole: new Path2D('M-205 38 L175 38 Q218 38 214 60 Q210 78 182 78 L-188 78 Q-212 78 -210 58 Q-209 38 -205 38 Z'),
  upper: new Path2D('M-198 40 L-202 -38 Q-204 -84 -168 -88 L-118 -84 Q-104 -64 -78 -66 L-58 -112 L-24 -116 L-14 -80 Q50 -52 132 -22 Q206 2 208 40 Z'),
  toe: new Path2D('M128 40 Q112 -2 150 -14 Q204 2 208 40 Z'),
  heel: new Path2D('M-198 40 L-201 -24 Q-150 -30 -128 40 Z'),
  bolt: new Path2D('M-150 20 L-60 -30 L-66 -10 L34 -52 L-50 10 L-44 -8 Z'),
  tab: new Path2D('M-176 -86 L-182 -112 L-156 -110 L-150 -86 Z'),
};
const CW = [
  { upper:'#ffffff', accent:P.YELLOW, accent2:P.INK, sole:'#f4f0e6' },
  { upper:P.RED, accent:'#ffffff', accent2:P.INK, sole:'#f4f0e6' },
  { upper:P.TEAL, accent:P.ORANGE, accent2:'#ffffff', sole:'#f4f0e6' },
  { upper:'#222222', accent:P.GREEN, accent2:'#ffffff', sole:'#f4f0e6' },
  { upper:P.YELLOW, accent:P.NAVY, accent2:P.RED, sole:'#ffffff' },
  { upper:P.PINK, accent:P.INK, accent2:'#ffffff', sole:'#ffffff' },
  { upper:'#ffffff', accent:P.RED, accent2:P.NAVY, sole:'#2a2a2a' },
  { upper:P.GREEN, accent:P.INK, accent2:P.YELLOW, sole:'#ffffff' },
  { upper:P.NAVY, accent:P.YELLOW, accent2:P.ORANGE, sole:'#f4f0e6' },
];
function sneaker(g, x, y, s, pal = CW[0], o = {}) {
  const p = Object.assign({ ink:P.INK, lace:'#ffffff' }, pal);
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s * (o.flip ? -1 : 1) * (o.sx || 1), s * (o.sy || 1));
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (o.sticker !== false) { g.save(); g.shadowColor = 'rgba(0,0,0,.32)'; g.shadowBlur = 18; g.shadowOffsetY = 12; g.lineWidth = 28; g.strokeStyle = g.fillStyle = '#fff';
    g.stroke(SN.upper); g.stroke(SN.sole); g.fill(SN.upper); g.fill(SN.sole); g.restore(); }
  g.lineWidth = 6; g.strokeStyle = p.ink;
  g.fillStyle = p.upper; g.fill(SN.upper);
  g.fillStyle = p.accent; g.fill(SN.heel); g.fill(SN.toe);
  g.save(); g.clip(SN.upper); g.globalAlpha = .2; halftone(g, -210, -120, 430, 170, '#000', 9, (xx, yy) => clamp((yy + 30) / 80) * 3.6); g.restore();
  g.stroke(SN.toe); g.stroke(SN.heel);
  g.fillStyle = p.accent2; g.fill(SN.bolt); g.stroke(SN.bolt);
  g.stroke(SN.upper);
  g.fillStyle = p.accent; g.fill(SN.tab); g.stroke(SN.tab);
  g.fillStyle = p.sole; g.fill(SN.sole);
  g.save(); g.clip(SN.sole); g.lineWidth = 4; g.beginPath(); g.moveTo(-220, 56); g.lineTo(220, 56); g.stroke();
  g.lineWidth = 2; for (let i = -190; i < 200; i += 16) { g.beginPath(); g.moveTo(i, 62); g.lineTo(i + 6, 78); g.stroke(); } g.restore();
  g.stroke(SN.sole);
  for (let i = 0; i < 6; i++) { const [px, py] = qb(-52, -86, 30, -50, 112, -20, .06 + i * .17); const d = i % 2 ? 1 : -1;
    g.lineWidth = 9; g.strokeStyle = p.ink; g.beginPath(); g.moveTo(px - 13, py - 10 * d); g.lineTo(px + 13, py + 10 * d); g.stroke();
    g.lineWidth = 4; g.strokeStyle = p.lace; g.beginPath(); g.moveTo(px - 13, py - 10 * d); g.lineTo(px + 13, py + 10 * d); g.stroke(); }
  g.setLineDash([6, 8]); g.lineWidth = 2.5; g.strokeStyle = p.ink; g.globalAlpha = .55; g.beginPath(); g.moveTo(-188, 26); g.quadraticCurveTo(0, 14, 196, 28); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
  g.restore();
}
function sneakerSketch(g, x, y, s, p) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = g.lineCap = 'round'; g.strokeStyle = P.INK; g.lineWidth = 3.2;
  const parts = [SN.upper, SN.sole, SN.toe, SN.heel, SN.bolt, SN.tab];
  parts.forEach((pa, i) => { const q = clamp(p * 1.4 - i * .08); if (q <= 0) return; g.setLineDash([1400 * q, 4000]); g.stroke(pa); });
  g.setLineDash([]);
  if (p > .6) { const q = pr(p, .6, 1); for (let i = 0; i < Math.floor(6 * q); i++) { const [px, py] = qb(-52, -86, 30, -50, 112, -20, .06 + i * .17); const d = i % 2 ? 1 : -1;
    g.beginPath(); g.moveTo(px - 13, py - 10 * d); g.lineTo(px + 13, py + 10 * d); g.stroke(); } }
  g.restore();
}
// ---------- procedural assets: engraved eye ----------
function eye(g, cx, cy, w, open, iris, look = 0) {
  g.save(); g.translate(cx, cy);
  const al = new Path2D(); al.moveTo(-w, 0); al.quadraticCurveTo(0, -w * 1.05 * open, w, 0); al.quadraticCurveTo(0, w * .9, -w, 0);
  g.fillStyle = '#efe9df'; g.fill(al);
  g.save(); g.clip(al);
  const ix = look * w * .25, iy = w * .03, R = w * .44;
  const gr = g.createRadialGradient(ix, iy, R * .2, ix, iy, R); gr.addColorStop(0, iris); gr.addColorStop(1, '#1d1d1d');
  g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, R, 0, 7); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2; for (let i = 0; i < 80; i++) { const a = i / 80 * 6.283; g.beginPath(); g.moveTo(ix + Math.cos(a) * R * .35, iy + Math.sin(a) * R * .35); g.lineTo(ix + Math.cos(a) * R * .95, iy + Math.sin(a) * R * .95); g.stroke(); }
  g.lineWidth = 7; g.strokeStyle = '#111'; g.beginPath(); g.arc(ix, iy, R, 0, 7); g.stroke();
  g.fillStyle = '#0b0b0b'; g.beginPath(); g.arc(ix, iy, R * .38, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(ix - R * .3, iy - R * .32, R * .15, 0, 7); g.fill();
  const sh = g.createLinearGradient(0, -w * .6, 0, w * .1); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(-w, -w, 2 * w, w * 1.1);
  g.restore();
  g.lineWidth = Math.max(1.5, w * .028); g.strokeStyle = '#141414'; g.stroke(al);
  g.lineWidth = Math.max(1.2, w * .016); for (let i = 0; i <= 14; i++) { const t = .1 + i * .057, [px, py] = qb(-w, 0, 0, -w * 1.05 * open, w, 0, t); const a = -Math.PI / 2 + (t - .5) * 1.6;
    g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * w * .1, py + Math.sin(a) * w * .12); g.stroke(); }
  g.restore();
}


// ---------- collage helpers ----------
const IMG = {};      // filled by engine from CONFIG.assets
function cover(g, im, w, h, zoom = 1, ox = 0, oy = 0, flip = false) {
  const s = Math.max(w / im.width, h / im.height) * zoom; g.save(); if (flip) g.scale(-1, 1);
  g.drawImage(im, ox - im.width * s / 2, oy - im.height * s / 2, im.width * s, im.height * s); g.restore(); }
function fullCover(g, im, zoom = 1, dx = 0, dy = 0) { g.save(); g.translate(500 + dx, 500 + dy); cover(g, im, S, S, zoom); g.restore(); }
function photoCard(g, key, cx, cy, w, h, rot, seed, sc = 1, zoom = 1, flip = false) { tornCard(g, cx, cy, w, h, rot, '#111', seed, gg => cover(gg, IMG[key], w, h, zoom, 0, 0, flip), sc); }
const EMO = {};
function emo(ch) { if (EMO[ch]) return EMO[ch];
  const s = mk(300), q = s.getContext('2d'); q.font = `200px ${EMOJI}`; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(ch, 150, 165);
  const w = mk(300), wg = w.getContext('2d'); wg.drawImage(s, 0, 0); wg.globalCompositeOperation = 'source-in'; wg.fillStyle = '#fff'; wg.fillRect(0, 0, 300, 300);
  const o = mk(300), og = o.getContext('2d'); for (let a = 0; a < 20; a++) og.drawImage(w, Math.cos(a / 20 * 6.283) * 11, Math.sin(a / 20 * 6.283) * 11);
  const c = mk(300), g = c.getContext('2d'); g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 14; g.shadowOffsetY = 9; g.drawImage(o, 0, 0); g.restore(); g.drawImage(s, 0, 0);
  return EMO[ch] = c; }
function emoji(g, ch, x, y, size, rot = 0) { const c = emo(ch); g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(c, -size / 2, -size / 2, size, size); g.restore(); }
function sticker(g, txt, x, y, rot, bg, fg, size = 56, sc = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.font = `900 ${size}px ${DISPLAY}`;
  const w = g.measureText(txt).width + size * .7, h = size * 1.25; g.fillStyle = P.INK; g.fillRect(-w / 2 + 6, -h / 2 + 7, w, h); g.fillStyle = bg; g.fillRect(-w / 2, -h / 2, w, h);
  g.strokeStyle = P.INK; g.lineWidth = 4; g.strokeRect(-w / 2, -h / 2, w, h); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, size * .06); g.restore(); }
function speedlines(g, f, n, vertical, col = 'rgba(255,255,255,.75)') { const r = rng(f * 7 + 1); g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = r() * S, b = r() * S, len = 80 + r() * 260; g.lineWidth = 2 + r() * 5; g.beginPath();
    if (vertical) { g.moveTo(a, b); g.lineTo(a, b + len); } else { g.moveTo(b, a); g.lineTo(b + len, a); } g.stroke(); } }
function tape(g, x, y, rot, w = 170) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = 'rgba(240,232,210,.82)'; poly(g, tornPts(-w / 2, -22, w, 44, Math.floor(x + y), 3, 10)); g.fill(); g.restore(); }

function countdown(n, bg, face, side, key) { return (g, l, f) => {
  g.fillStyle = bg; g.fillRect(0, 0, S, S); sunburst(g, 500, 500, 22, ['rgba(0,0,0,0)', 'rgba(0,0,0,.09)'], f * .03);
  halftone(g, 0, 0, S, S, 'rgba(0,0,0,.12)', 18, (x, y) => clamp(Math.hypot(x - 500, y - 500) / 700) * 7);
  const side_ = n === 2 ? -1 : 1, ce = eOut(pr(l, 0, 4));
  photoCard(g, key, 500 + side_ * 270, 520 + (1 - ce) * 700 * side_, 300, 860, side_ * .07, 70 + n);
  const t = eOut(pr(l, 0, 3)), sc = lerp(1.9, 1, t);
  g.save(); g.translate(470 - side_ * 40, 520); g.rotate(-side_ * .08); g.scale(sc, sc); extruded(g, String(n), 0, 0, `900 600px ${DISPLAY}`, face, side, '#fff', 26, 1.3, 1.5, 30); g.restore();
  g.fillStyle = P.INK; g.font = `700 22px ${MONO}`; g.fillText(`T-MINUS 0${n}` + (CONFIG.countdownLabel ? ' · ' + CONFIG.countdownLabel : ''), 170, 965); }; }

