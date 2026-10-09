// =====================================================================
//  collage-code-motion · engine.js — timeline resolution, stage compositor
//  (punch-in, white flash, torn-paper wipe, grain, vignette, badge),
//  live code panel, and the frame renderer used by scripts/render.js.
//  You normally never edit this file: edit config.js + timeline.js.
// =====================================================================
const imgReady = Promise.all((CONFIG.assets || []).map(file => new Promise(res => {
  const key = file.replace(/\.[a-z0-9]+$/i, ''), im = new Image();
  im.onload = res; im.onerror = () => { console.log('MISSING ASSET ' + file); res(); };
  im.src = (CONFIG.assetDir || 'assets/') + file; IMG[key] = im; })));
const BADGE = (g, f) => { if (CONFIG.badge === false) return; const b = CONFIG.badge || {}; g.save(); g.translate(796, 26); g.rotate(-.02);
  g.fillStyle = P[b.bg] || b.bg || P.YELLOW; g.fillRect(0, 0, 180, 60); g.strokeStyle = P.INK; g.lineWidth = 3; g.strokeRect(0, 0, 180, 60);
  g.fillStyle = P.INK; g.font = `italic 900 30px ${DISPLAY}`; g.textBaseline = 'top'; g.fillText(b.title || CONFIG.brand || 'BRAND', 12, 6);
  g.font = `700 11px ${MONO}`; g.fillText(b.sub || 'CODE MOTION · VOL.01', 12, 41); g.restore(); };
let acc = 0; SH.forEach((s, i) => { s.i = i; s.a = acc; s.b = acc + s.dur - 1; acc += s.dur;
  s.lines = s.lines.map(([d, c, asset]) => ({ at: s.a + d, c: c.replace('@', s.a + d), asset })); });
N = acc; if (CONFIG.frames && CONFIG.frames !== acc) console.log(`NOTE: timeline is ${acc} frames, CONFIG.frames says ${CONFIG.frames}`);
const SC = SH;
const sceneAt = f => SC.findIndex(s => f >= s.a && f <= s.b);

// ---------- stage compositor ----------
function drawScene(g, si, l, f) { const sc = SC[si]; g.save();
  if (sc.punch && l < 4) { const k = lerp(1.09, 1, eOut(l / 4)); g.translate(500, 500); g.scale(k, k); g.translate(-500, -500); }
  sc.draw(g, l, f); g.restore(); }
function drawStage(f) {
  const si = sceneAt(f), sc = SC[si], l = f - sc.a;
  G.setTransform(1, 0, 0, 1, 0, 0); G.filter = 'none'; G.globalAlpha = 1;
  drawScene(G, si, l, f);
  if (sc.trans === 'tear' && l < 5 && si > 0) {
    const pv = SC[si - 1]; T.setTransform(1, 0, 0, 1, 0, 0); drawScene(T, si - 1, pv.dur - 1, pv.b);
    const t = eIO(pr(l, 0, 4.5)), bx = lerp(S + 80, -120, t), r = rng(si * 31), edge = []; for (let y = -20; y <= S + 20; y += 14) edge.push([bx + (r() - .5) * 26 + Math.sin(y * .02) * 18, y]);
    G.save(); G.shadowColor = 'rgba(0,0,0,.35)'; G.shadowBlur = 26; G.shadowOffsetX = 10; G.fillStyle = '#fbf8f1'; poly(G, [[-50, -20], ...edge.map(([x, y]) => [x + 14 + (y * 7 % 11), y]), [-50, S + 20]]); G.fill(); G.restore();
    G.save(); poly(G, [[-50, -20], ...edge, [-50, S + 20]]); G.clip(); G.drawImage(tmp, 0, 0); G.restore();
  } else if (l === 0 && si > 0) { G.fillStyle = 'rgba(255,255,255,.18)'; G.fillRect(0, 0, S, S); }
  addGrain(G, 1, f);
  const vg = G.createRadialGradient(500, 500, 380, 500, 500, 760); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)'); G.fillStyle = vg; G.fillRect(0, 0, S, S);
  BADGE(G, f);
  G.fillStyle = 'rgba(15,15,15,.82)'; rr(G, 24, 944, 124, 34, 17); G.fill(); G.fillStyle = P.ORANGE; G.beginPath(); G.arc(44, 961, 6, 0, 7); G.fill();
  G.fillStyle = '#eee'; G.font = `700 16px ${MONO}`; G.textBaseline = 'middle'; G.fillText((f / FPS).toFixed(3).padStart(6, '0'), 58, 962); G.textBaseline = 'alphabetic';
}

// ---------- thumbnails ----------
const TW = Math.floor((800 - 44) / SC.length) - 2;
let thumbs = [], assetThumb = {};
function buildThumbs() {
  thumbs = SC.map((s, i) => { const c = mk(TW, 46), g = c.getContext('2d'); T.setTransform(1, 0, 0, 1, 0, 0); drawScene(T, i, Math.floor(s.dur * .7), s.a + Math.floor(s.dur * .7));
    const sw = 1000 * TW / 46; g.drawImage(tmp, 500 - sw / 2, 0, sw, 1000, 0, 0, TW, 46); return c; });
  SC.forEach(s => s.lines.forEach(ln => ln.asset && ln.asset.items.forEach(it => { if (assetThumb[it]) return; const c = mk(54), g = c.getContext('2d'); g.fillStyle = '#262626'; g.fillRect(0, 0, 54, 54);
    const [k, v] = it.split(':'); if (k === 'img') { g.save(); g.translate(27, 27); cover(g, IMG[v], 54, 54); g.restore(); } else if (k === 'cw') sneaker(g, 27, 28, .11, CW[+v], { rot: -.08, sticker: false });
    else emoji(g, v, 27, 27, 50); assetThumb[it] = c; })));
}

// ---------- code panel ----------
const PROJ = CONFIG.project || 'motion_vol01', FILE = CONFIG.file || 'film.py', BPM = CONFIG.bpm || 120;
const PX = 40, PY = 40, PW = 800, PH = 1000, CR = { y: PY + 304, h: 612 };
const TOK = /(#.*$)|(f?"[^"]*")|(\b\d+(?:\.\d+)?\b)|(\.[a-z_]+(?=\())|(\b[A-Z][A-Z_]{2,}\b)|(\b(?:True|False|None)\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;
function codeText(g, s, x, y) { let m; TOK.lastIndex = 0; const cw = g.measureText('M').width;
  while ((m = TOK.exec(s))) { let col = '#cfcfcf', t = m[0];
    if (m[1]) col = '#6c6c6c'; else if (m[2]) col = '#e2c290'; else if (m[3]) col = '#ef9a5e'; else if (m[4]) col = '#f3d27a'; else if (m[6]) col = '#c792ea';
    else if (m[5]) { col = P[t] ? '#ffffff' : '#ff8a72'; if (P[t]) { g.fillStyle = P[t]; g.fillRect(x + 1, y - 10, 9, 9); g.strokeStyle = '#555'; g.lineWidth = 1; g.strokeRect(x + 1, y - 10, 9, 9); x += 13; col = '#e8e8e8'; } }
    else if (m[9]) col = '#8d8d8d';
    g.fillStyle = col; g.fillText(t, x, y); x += g.measureText(t).width; }
  return x; }
const LEAD = 10;
function buildRows(f) { const rows = []; let num = 9, active = null;
  SC.forEach((sc, si) => { const firstStart = sc.lines[0].at - LEAD - 2; if (si > 0 && f < firstStart) return;
    rows.push({ k:'hdr', h:30, sc });
    sc.lines.forEach(ln => { const start = ln.at - LEAD, done = ln.at - 2; const n = num++; if (si > 0 && f < start) return;
      const vis = (ln.at < LEAD || f >= done) ? ln.c.length : Math.floor(ln.c.length * pr(f, start, done));
      const row = { k:'code', h:24, ln, n, vis, sc }; rows.push(row); if (ln.at <= f) active = row;
      if (ln.asset && f >= done) rows.push({ k:'asset', h:78, ln }); }); });
  let y = 0; rows.forEach(r => { r.y = y; y += r.h; }); return { rows, active, total: y }; }
function scrollFor(f) { const { active, total } = buildRows(f); if (!active) return 0; return clamp(active.y + 12 - CR.h * .62, 0, Math.max(0, total - CR.h + 40)); }
let lastMs = 0;
function drawPanel(f) {
  const si = sceneAt(f), sc = SC[si];
  X.save(); X.fillStyle = '#121212'; rr(X, PX, PY, PW, PH, 18); X.fill(); X.strokeStyle = '#2a2a2a'; X.lineWidth = 1.5; X.stroke(); X.clip();
  X.font = `14px ${MONO}`; X.textBaseline = 'alphabetic';
  const tabs = [FILE, 'motion.py', 'assets.py', 'render.sh']; let tx = PX + 26;
  tabs.forEach((t, i) => { X.fillStyle = i ? '#555' : P.ORANGE; X.beginPath(); X.arc(tx, PY + 25, 3.5, 0, 7); X.fill(); X.fillStyle = i ? '#7a7a7a' : '#f1f1f1'; X.fillText(t, tx + 10, PY + 30);
    const w = X.measureText(t).width; if (!i) { X.fillStyle = P.ORANGE; X.fillRect(tx - 8, PY + 40, w + 26, 2); } tx += w + 42; });
  X.fillStyle = (f >> 3) % 2 ? '#ff4b3a' : '#a8302a'; X.beginPath(); X.arc(PX + PW - 64, PY + 25, 4, 0, 7); X.fill(); X.fillStyle = '#bbb'; X.fillText('live', PX + PW - 54, PY + 30);
  X.fillStyle = '#1f1f1f'; X.fillRect(PX, PY + 46, PW, 1);
  X.fillStyle = P.ORANGE; X.beginPath(); X.arc(PX + 26, PY + 66, 3.5, 0, 7); X.fill(); X.fillStyle = '#e8e8e8'; X.fillText('state.py', PX + 36, PY + 71); X.fillStyle = '#777'; X.fillText('hot-reload', PX + 118, PY + 71);
  const hdr = `t ${(f / FPS).toFixed(3).padStart(6, '0')}    f ${f}/${N}    shot ${String(si + 1).padStart(2, '0')}/${SC.length}`; X.fillStyle = '#9a9a9a'; X.textAlign = 'right'; X.fillText(hdr, PX + PW - 24, PY + 71); X.textAlign = 'left';
  const sx = PX + 22, sy = PY + 86, sw = PW - 44;
  SC.forEach((s, i) => { const x = sx + s.a / N * sw, w = s.dur / N * sw; if (i <= si + 1) { X.globalAlpha = i <= si ? 1 : .45; X.drawImage(thumbs[i], x + 1, sy, w - 2, 46); X.globalAlpha = 1; }
    else { X.fillStyle = '#1e1e1e'; X.fillRect(x + 1, sy, w - 2, 46); X.strokeStyle = '#2c2c2c'; X.strokeRect(x + 1.5, sy + .5, w - 3, 45); } });
  X.fillStyle = 'rgba(0,0,0,.5)'; const nx = sx + (sc.b + 1) / N * sw; X.fillRect(nx, sy, sx + sw - nx, 46);
  const phx = sx + (f + .5) / N * sw; X.fillStyle = '#fff'; X.fillRect(phx - 1, sy - 6, 2, 58); X.beginPath(); X.moveTo(phx - 6, sy - 10); X.lineTo(phx + 6, sy - 10); X.lineTo(phx, sy - 2); X.fill();
  X.font = `15px ${MONO}`; const cw = X.measureText('M').width; const fx = (((sc.lines.filter(x => x.at <= f).pop() || sc.lines[0]).c.match(/\.([a-z_]+)\(/g) || []).filter(m => m !== '.at(')[0] || '.draw(').slice(1, -1);
  const st = [['SHOT', `"${sc.name}"`, `# ${String(si + 1).padStart(2, '0')}/${SC.length} · f ${sc.a}–${sc.b} · ${sc.dur}f`], ['FRAME', `${f}`, `# of ${N} · ${FPS} fps · ${BPM} bpm`],
    ['BG', sc.bg, P[sc.bg] ? `# ${P[sc.bg]}` : '# photo layer'], ['TEXT', sc.text, '# type layer'], ['HERO', sc.hero, '# asset on top'], ['FX', `"${fx}"`, '# motion op']];
  const by = PY + 168; st.forEach(([k, v, c], i) => { const y = by + i * 22; X.fillStyle = '#4d4d4d'; X.textAlign = 'right'; X.fillText(String(3 + i), PX + 46, y); X.textAlign = 'left';
    X.fillStyle = '#ef8a5a'; X.fillText(k.padEnd(6), PX + 66, y); X.fillStyle = '#8d8d8d'; X.fillText('=', PX + 66 + cw * 6, y);
    const vx = PX + 66 + cw * 8; const ex = codeText(X, v, vx, y);
    if ((k === 'FX') || (k === 'TEXT' && v !== 'None')) { X.strokeStyle = P.ORANGE; X.lineWidth = 1.4; rr(X, vx - 5, y - 15, ex - vx + 10, 21, 4); X.stroke(); }
    X.fillStyle = '#5f5f5f'; X.font = `italic 13.5px ${MONO}`; X.textAlign = 'right'; X.fillText(c, PX + PW - 24, y); X.textAlign = 'left'; X.font = `15px ${MONO}`; });
  X.fillStyle = '#232323'; X.fillRect(PX, CR.y - 8, PW, 1);
  const { rows, active } = buildRows(f); let sc0 = 0; for (let k = 0; k < 4; k++) sc0 += scrollFor(Math.max(0, f - k)); const scroll = sc0 / 4;
  X.save(); X.beginPath(); X.rect(PX, CR.y, PW, CR.h); X.clip(); let activeY = null;
  rows.forEach(r => { const y = CR.y + r.y - scroll; if (y > CR.y + CR.h + 40 || y + r.h < CR.y - 40) return;
    if (r.k === 'hdr') { const s = r.sc; X.font = `13.5px ${MONO}`; X.fillStyle = '#6e6e6e'; X.fillText(`~/${PROJ}/${FILE}  ·  ${String(s.i + 1).padStart(2, '0')} ${s.name}`, PX + 66, y + 21);
      X.textAlign = 'right'; if (f > s.b) { X.fillStyle = '#86c48a'; X.fillText(`✓ f ${s.a}–${s.b}`, PX + PW - 24, y + 21); }
      else if (f >= s.a) { X.fillStyle = P.ORANGE; X.fillText(`▶ on screen · f ${f}`, PX + PW - 24, y + 21); }
      else { X.fillStyle = '#8a8a8a'; X.font = `italic 13.5px ${MONO}`; X.fillText('writing…', PX + PW - 24, y + 21); } X.textAlign = 'left'; }
    else if (r.k === 'code') { X.font = `15px ${MONO}`; const yy = y + 17;
      if (r === active) { X.fillStyle = 'rgba(255,106,26,.16)'; X.fillRect(PX, y, PW, r.h); X.fillStyle = P.ORANGE; X.fillRect(PX, y, 3, r.h); X.beginPath(); X.moveTo(PX + 12, yy - 11); X.lineTo(PX + 20, yy - 5); X.lineTo(PX + 12, yy + 1); X.fill(); activeY = y + r.h / 2; }
      X.fillStyle = r === active ? '#d0d0d0' : '#4d4d4d'; X.textAlign = 'right'; X.fillText(String(r.n), PX + 52, yy); X.textAlign = 'left';
      const ex = codeText(X, r.ln.c.slice(0, r.vis), PX + 66, yy);
      if (r.vis < r.ln.c.length) { X.fillStyle = P.ORANGE; X.fillRect(ex + 1, yy - 14, 9, 18); }
      else if (ex < PX + PW - 80) { X.fillStyle = '#5a5a5a'; X.textAlign = 'right'; X.fillText(`# f${r.ln.at}`, PX + PW - 24, yy); X.textAlign = 'left'; } }
    else if (r.k === 'asset') { const a = r.ln.asset; X.font = `13px ${MONO}`; X.fillStyle = '#86c48a'; X.fillText('✓', PX + 86, y + 13); X.fillStyle = '#9a9a9a'; X.fillText(a.label, PX + 104, y + 13);
      a.items.forEach((it, i) => { const x = PX + 86 + i * 60, im = assetThumb[it]; if (im) X.drawImage(im, x, y + 20, 54, 54); X.strokeStyle = '#333'; X.lineWidth = 1; X.strokeRect(x + .5, y + 20.5, 53, 53); }); } });
  const fade = X.createLinearGradient(0, CR.y, 0, CR.y + 50); fade.addColorStop(0, '#121212'); fade.addColorStop(1, 'rgba(18,18,18,0)'); X.fillStyle = fade; X.fillRect(PX, CR.y, PW, 50);
  X.restore();
  X.fillStyle = '#232323'; X.fillRect(PX, PY + PH - 76, PW, 1); X.font = `14.5px ${MONO}`;
  X.fillStyle = '#8d8d8d'; X.fillText('$', PX + 26, PY + PH - 46); X.fillStyle = '#e6e6e6'; X.fillText(`python3 ${FILE} --live --fps ${FPS} --bpm ${BPM}`, PX + 44, PY + PH - 46);
  X.fillStyle = '#8d8d8d'; X.fillText(`▸ preview f ${f}/${N}`, PX + 26, PY + PH - 22); X.fillStyle = '#86c48a'; X.fillText('✓', PX + 26 + X.measureText(`▸ preview f ${f}/${N} `).width, PY + PH - 22);
  X.fillStyle = '#8d8d8d'; X.fillText(`shot ${sc.name}    fx ${fx}    ${(lastMs / 1000).toFixed(2)} s`, PX + 300, PY + PH - 22);
  X.restore();
  return { activeY, fx };
}

// ---------- master ----------
const OX = 880, OY = 40;
function renderFrame(f) {
  const t0 = performance.now();
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.filter = 'none';
  if (FILM) { drawStage(f); X.drawImage(stage, 0, 0, W, H); lastMs = performance.now() - t0; return; }
  X.fillStyle = '#0a0a0a'; X.fillRect(0, 0, W, H);
  drawStage(f);
  X.save(); X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 40; X.fillStyle = '#000'; rr(X, OX, OY, S, S, 22); X.fill(); X.restore();
  X.save(); rr(X, OX, OY, S, S, 22); X.clip(); X.drawImage(stage, OX, OY); X.restore();
  const { activeY, fx } = drawPanel(f);
  const sc = SC[sceneAt(f)], tx = OX + sc.tag[0], ty = OY + sc.tag[1];
  X.font = `700 13px ${MONO}`; const label = `FX · ${fx}`, lw = X.measureText(label).width + 20;
  X.fillStyle = 'rgba(15,15,15,.85)'; rr(X, tx, ty - 14, lw, 28, 5); X.fill(); X.strokeStyle = P.ORANGE; X.lineWidth = 1.5; X.stroke(); X.fillStyle = P.ORANGE; X.textBaseline = 'middle'; X.fillText(label, tx + 10, ty + 1); X.textBaseline = 'alphabetic';
  X.strokeStyle = P.ORANGE; X.lineWidth = 1.6;
  if (activeY != null) { const x0 = PX + PW - 8; X.beginPath(); X.moveTo(x0, activeY); X.bezierCurveTo(x0 + 60, activeY, tx - 80, ty, tx, ty); X.stroke(); X.fillStyle = P.ORANGE; X.beginPath(); X.arc(x0, activeY, 4, 0, 7); X.fill(); }
  X.fillStyle = '#fff'; X.beginPath(); X.arc(tx, ty, 3, 0, 7); X.fill();
  lastMs = performance.now() - t0;
}
window.renderFrame = renderFrame; window.N = N;
window.TIMELINE = { fps: FPS, bpm: BPM, frames: N, shots: SC.map(s => ({ name: s.name, a: s.a, dur: s.dur, trans: s.trans || null, punch: !!s.punch, sfx: s.sfx || [] })) };
window.ready = Promise.all([imgReady, ...[`900 100px ${DISPLAY}`, `italic 900 100px ${DISPLAY}`, `900 100px ${CJK}`, `15px ${MONO}`, `700 15px ${MONO}`, `italic 15px ${MONO}`, `100px ${EMOJI}`].map(s => document.fonts.load(s, (CONFIG.fontProbe || '') + '跳出你的节奏ジャンプJUMP🔥👟'))])
  .then(() => { buildThumbs(); renderFrame(0); });
if (!navigator.webdriver && !/[?&]still/.test(location.search)) { let f = 0; window.ready.then(() => setInterval(() => { renderFrame(f); f = (f + 1) % N; }, 1000 / FPS)); }
