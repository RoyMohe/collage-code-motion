// =====================================================================
//  presets.js — 12 ready-made 30-frame shots. Use via preset(name, k, opts):
//    k    = speed multiplier (k = 2.5 → the shot plays in 12 frames)
//    opts = text overrides (every literal is TT('key', default)) and
//           opts.hero(g, x, y, scale, palette, o) to replace the sneaker.
//  Names: intro drop unbox look grid jump tiao fly marquee sketch stamp end
// =====================================================================
let PO = {};
const TT = (key, def) => (PO[key] !== undefined ? PO[key] : def);
const HERO = (...a) => (PO.hero || CONFIG.hero || sneaker)(...a);
const HEROSKETCH = (...a) => (PO.heroSketch || CONFIG.heroSketch || sneakerSketch)(...a);
const PRESETS_LIST = [
{ name:'intro', a:0, b:29, bg:'CREAM', text:'"JUMP"', hero:'None', tag:[96,150],
  lines:[{at:0, c:'film.at(0).paper(CREAM, grain=0.35, news=True)'},
         {at:2, c:'film.at(2).drop("JUMP", stagger=4, patches=[RED, YELLOW, TEAL, INK])'},
         {at:20, c:'film.at(20).sticker("VOL.01", rot=-8)'}],
  draw(g, l, f) {
    g.fillStyle = P.CREAM; g.fillRect(0, 0, S, S); newsprint(g, 3);
    halftone(g, 0, 560, 520, 440, P.RED, 16, (x, y) => clamp((y - 560) / 440) * clamp(1 - x / 520) * 7.5);
    g.fillStyle = P.INK; g.font = `700 18px ${MONO}`; g.fillText(TT('kicker', 'JUMP ATHLETICS — FW/2026 — ISSUE 01'), 40, 60);
    const L = [...TT('word', 'JUMP')].slice(0, 4), cols = [P.RED, P.YELLOW, P.TEAL, P.INK], tc = ['#fff', P.INK, '#fff', P.YELLOW];
    for (let i = 0; i < 4; i++) { const t = pr(l, 2 + i * 4, 11 + i * 4); if (t <= 0) continue; const e = eBack(t);
      const x = 170 + i * 220, y = lerp(-320, 470 + (i % 2 ? 18 : -14), e), rot = (i % 2 ? 1 : -1) * (.06 + (1 - t) * .3);
      tornCard(g, x, y, 212, 310, rot, cols[i], 10 + i, gg => { gg.fillStyle = tc[i]; gg.font = `900 230px ${DISPLAY}`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(L[i], 0, 12); }); }
    const st = pr(l, 20, 27); if (st > 0) { const e = eBack(st); g.save(); g.translate(790, 760); g.rotate(-.14); g.scale(e, e);
      g.fillStyle = P.INK; g.beginPath(); g.arc(4, 6, 92, 0, 7); g.fill(); g.fillStyle = P.YELLOW; g.beginPath(); g.arc(0, 0, 92, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = P.INK; g.stroke();
      g.fillStyle = P.INK; g.textAlign = 'center'; g.font = `900 46px ${DISPLAY}`; g.fillText(TT('badge', 'VOL.01'), 0, 8); g.font = `700 13px ${MONO}`; g.fillText(TT('badgeSub', 'NEW SEASON'), 0, 36); g.restore(); }
    const tl = pr(l, 18, 26); if (tl > 0) { g.fillStyle = P.INK; g.font = `900 34px ${DISPLAY}`; g.fillText(TT('tagline', 'MADE TO MOVE.').slice(0, Math.ceil(TT('tagline', 'MADE TO MOVE.').length * tl)), 60, 900); }
  } },
{ name:'drop', a:30, b:59, bg:'RED', text:'"NEW DROP"', hero:'"shoe"', tag:[250,500], punch:true,
  lines:[{at:30, c:'shoe = draw.sneaker(upper=WHITE, accent=YELLOW, laces=6)', asset:{label:'shoe · 3 colorways · procedural', items:[0,1,2]}},
         {at:30, c:'film.at(30).sunburst(RED, rays=24, spin=0.4)'},
         {at:33, c:'film.at(33).slide_in(shoe, from_="left", speedlines=True)'},
         {at:44, c:'film.at(44).squash(shoe, 0.86).hover(amp=8)'}],
  draw(g, l, f) {
    sunburst(g, 500, 540, 28, [P.RED, '#CF2915'], f * .012);
    const tt = pr(l, 0, 8); g.save(); g.globalAlpha = tt; g.font = `900 210px ${DISPLAY}`; g.textAlign = 'center'; g.lineJoin = 'round';
    g.lineWidth = 5; g.strokeStyle = '#fff'; g.strokeText(TT('top', 'NEW'), 500, 300 - (1 - eOut(tt)) * 60); g.strokeText(TT('bottom', 'DROP'), 500, 830 + (1 - eOut(tt)) * 60); g.restore();
    const t = pr(l, 3, 14), x = lerp(-420, 500, eOut(t)), v = (1 - t) * (t > 0 ? 1 : 0);
    if (t > 0 && t < 1) { g.strokeStyle = '#fff'; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const yy = 420 + i * 28, len = 120 + (i * 53 % 160);
      g.globalAlpha = .8 * v; g.lineWidth = 6 + (i % 3) * 3; g.beginPath(); g.moveTo(x - 260 - len - (i * 37 % 90), yy); g.lineTo(x - 230, yy); g.stroke(); } g.globalAlpha = 1; }
    let sy = 1, sx = 1, yy = 540; const q = pr(l, 13, 20); if (q > 0 && q < 1) { const k = Math.sin(q * Math.PI) * .14; sy = 1 - k; sx = 1 + k * .8; }
    if (l > 20) yy += Math.sin((l - 20) * .5) * 8;
    if (t > 0) { for (let k = 3; k >= 1 && v > .05; k--) { g.globalAlpha = .12 * v; HERO(g, x - k * 70 * v, yy, 1.45, CW[0], { sticker:false, rot:-.08 }); } g.globalAlpha = 1;
      HERO(g, x, yy + (1 - sy) * 80, 1.45, CW[0], { rot: -.08 * (1 - q * .6), sx, sy }); }
    if (l > 16) { const e = eBack(pr(l, 16, 23)); g.save(); g.translate(720, 330); g.rotate(.1); g.scale(e, e); g.fillStyle = P.YELLOW; g.fillRect(-90, -26, 180, 52); g.strokeStyle = P.INK; g.lineWidth = 3; g.strokeRect(-90, -26, 180, 52);
      g.fillStyle = P.INK; g.font = `900 26px ${DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(TT('label', 'JMP-01'), 0, 2); g.restore(); }
  } },
{ name:'unbox', a:60, b:89, bg:'ORANGE', text:'None', hero:'"shoe"', tag:[500,300],
  lines:[{at:60, c:'film.at(60).sunburst([ORANGE, CREAM, TEAL, CREAM], rays=24)'},
         {at:62, c:'film.at(62).box(KRAFT).lid(fly=True)'},
         {at:70, c:'film.at(70).pop(shoe, rise=360, confetti=40)'}],
  draw(g, l, f) {
    sunburst(g, 500, 640, 24, [P.ORANGE, P.CREAM, P.TEAL, P.CREAM], -f * .01);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(500, 880, 260, 34, 0, 0, 7); g.fill();
    g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = P.INK;
    poly(g, [[320,600],[680,600],[640,560],[360,560]]); g.fillStyle = '#5c3e22'; g.fill(); g.stroke();
    const st = pr(l, 8, 19), sy = lerp(800, 400, eBack(st)), srot = lerp(.2, -.12, st);
    g.save(); g.beginPath(); g.rect(0, 0, S, 620); g.clip(); if (st > 0) HERO(g, 500, sy, 1.25, CW[0], { rot: srot }); g.restore();
    poly(g, [[320,600],[680,600],[660,860],[340,860]]); g.fillStyle = P.KRAFT; g.fill(); g.stroke();
    g.fillStyle = P.INK; g.font = `italic 900 64px ${DISPLAY}`; g.textAlign = 'center'; g.fillText(TT('word', 'JUMP'), 500, 720); g.font = `700 16px ${MONO}`; g.fillText(TT('boxLabel', 'JMP-01 · SIZE 42 · FRAGILE'), 500, 760);
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.strokeRect(372, 790, 256, 40); g.fillStyle = 'rgba(0,0,0,.6)'; for (let i = 0; i < 30; i++) g.fillRect(382 + i * 8, 798, (i % 3 ? 2 : 4), 24);
    const lt = pr(l, 2, 12); g.save(); g.translate(500 + eIn(lt) * 420, 560 - eIn(lt) * 620 - Math.sin(lt * 3) * 40); g.rotate(eIn(lt) * 1.1);
    poly(g, [[-200,-12],[200,-12],[204,34],[-204,34]]); g.fillStyle = '#b5864f'; g.fill(); g.lineWidth = 6; g.strokeStyle = P.INK; g.stroke(); g.restore();
    if (l >= 12) { const r = rng(77), cols = [P.RED, P.YELLOW, P.TEAL, P.INK, '#fff', P.GREEN]; const tt = (l - 12) / 24 * 1.6;
      for (let i = 0; i < 40; i++) { const vx = (r() - .5) * 900, vy = -500 - r() * 700, x = 500 + vx * tt, y = 560 + vy * tt + 900 * tt * tt, rot = r() * 6 + tt * 10 * (r() - .5);
        g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = cols[i % 6]; if (i % 3) g.fillRect(-9, -5, 18, 10); else { g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); } g.restore(); } }
  } },
{ name:'look', a:90, b:119, bg:'RED', text:'None', hero:'"eye"', tag:[740,250], trans:'tear',
  lines:[{at:90, c:'eye = draw.eye(style="engraving", iris=GREY)', asset:{label:'eye · engraving · procedural', eye:true}},
         {at:90, c:'film.at(90).tear(RED, vertical=True).card(eye, tilt=-6)'},
         {at:96, c:'film.at(96).frame(TEAL, track="iris")'},
         {at:104, c:'film.at(104).blink().iris(GREEN)'}],
  draw(g, l, f) {
    g.fillStyle = P.RED; g.fillRect(0, 0, S, S);
    halftone(g, 0, 0, S, S, '#C9230F', 22, (x, y) => 4 + Math.sin(x * .01 + y * .008) * 3);
    const blink = pr(l, 14, 20), open = 1 - Math.sin(blink * Math.PI) * .95, iris = l > 17 ? '#22C47F' : '#8a8a8a', look = Math.sin(l * .18) * .9;
    const ce = eOut(pr(l, 0, 7));
    tornCard(g, 500, 500 + (1 - ce) * 80, 680, 470, -.1, '#ECE5D7', 31, gg => {
      gg.strokeStyle = 'rgba(20,20,20,.28)'; gg.lineWidth = 1.6;
      for (let y = -240; y < 240; y += 7) { gg.beginPath(); for (let x = -350; x <= 350; x += 10) { const yy = y + 34 * Math.exp(-(x * x) / (2 * 200 * 200)) * Math.sign(y || 1) * Math.exp(-(y * y) / 30000); x === -350 ? gg.moveTo(x, yy) : gg.lineTo(x, yy); } gg.stroke(); }
      gg.lineWidth = 5; gg.strokeStyle = '#1a1a1a'; for (let i = 0; i < 40; i++) { const [px, py] = qb(-260, -120, 0, -230, 260, -150, i / 40); gg.beginPath(); gg.moveTo(px, py); gg.lineTo(px + 18, py - 26 + (i % 3) * 5); gg.stroke(); }
      eye(gg, 0, 20, 250, open, iris, look);
      gg.fillStyle = '#1a1a1a'; gg.font = `700 14px ${MONO}`; gg.fillText(TT('caption', 'PLATE 07 — "THE LOOKOUT"'), -320, 210); }, lerp(.92, 1, ce));
    const ft = pr(l, 6, 14); if (ft > 0) { const e = eBack(ft), sz = 380 * e; g.save(); g.translate(500 + look * 52, 520); g.rotate(-.06 + (1 - ft) * .5);
      g.lineWidth = 26; g.strokeStyle = P.TEAL; g.strokeRect(-sz / 2, -sz / 2, sz, sz); g.restore(); }
    if (l > 17) { g.fillStyle = '#fff'; g.font = `900 40px ${DISPLAY}`; g.save(); g.translate(70, 940); g.rotate(-Math.PI / 2); g.fillText(TT('side', 'KEEP AN EYE OUT'), 0, 0); g.restore(); }
  } },
{ name:'grid', a:120, b:149, bg:'CREAM', text:'None', hero:'"variants[9]"', tag:[500,140], punch:true,
  lines:[{at:120, c:'variants = shoe.variants(9, palette=PALETTE)', asset:{label:'variants · 9 colorways · procedural', items:[0,1,2,3,4,5,6,7,8]}},
         {at:120, c:'film.at(120).grid(variants, cols=3, stagger=2)'},
         {at:136, c:'film.at(136).circle(variants[4], RED, scribble=True)'}],
  draw(g, l, f) {
    g.fillStyle = P.CREAM; g.fillRect(0, 0, S, S); newsprint(g, 9, 'rgba(20,20,20,.05)');
    const tiles = [P.TEAL, P.CREAM, P.YELLOW, P.RED, '#fff', P.NAVY, P.GREEN, P.PINK, P.ORANGE];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const i = r * 3 + c, t = pr(l, (r + c) * 2, (r + c) * 2 + 7); if (t <= 0) continue; const e = eBack(t);
      const x = 190 + c * 310, y = 190 + r * 310;
      tornCard(g, x, y, 282, 282, ((i * 37) % 7 - 3) * .012, tiles[i], 50 + i, gg => { if (i % 2) halftone(gg, -150, -150, 300, 300, 'rgba(0,0,0,.14)', 12, () => 3.2); }, e);
      HERO(g, x, y + 10, .56 * e, CW[i], { rot: -.08 }); }
    const sp = pr(l, 16, 27); if (sp > 0) { g.save(); g.strokeStyle = P.RED; g.lineWidth = 10; g.lineCap = g.lineJoin = 'round'; g.beginPath(); const n = Math.floor(320 * sp);
      for (let i = 0; i <= n; i++) { const t = i / 320, a = -2.2 + t * 2.25 * 6.283, k = 1 + .06 * Math.sin(t * 19) + .05 * t, x = 500 + Math.cos(a) * 178 * k, y = 505 + Math.sin(a) * 160 * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); }
    if (l > 24) { const e = eBack(pr(l, 24, 29)); g.save(); g.translate(700, 330); g.rotate(-.12); g.scale(e, e); g.fillStyle = P.RED; g.font = `900 52px ${DISPLAY}`; g.fillText(TT('callout', 'THIS ONE.'), 0, 0); g.restore(); }
  } },
{ name:'jump', a:150, b:179, bg:'GREEN', text:'"JUMP!"', hero:'None', tag:[180,480], punch:true,
  lines:[{at:150, c:'film.at(150).bg(GREEN).edges("paper_torn")'},
         {at:151, c:'film.at(151).burst_type("JUMP!", colors=[WHITE, NAVY, ORANGE])'},
         {at:156, c:'film.at(156).orbit(dots=64, rx=0.42, ry=0.20)'},
         {at:172, c:'film.at(172).exit("left", blur=24)'}],
  draw(g, l, f) {
    g.fillStyle = P.GREEN; g.fillRect(0, 0, S, S);
    g.fillStyle = '#fbf8f1'; poly(g, tornPts(-40, -40, S + 80, 120, 61, 12)); g.fill(); poly(g, tornPts(-40, 920, S + 80, 140, 62, 12)); g.fill();
    const ex = pr(l, 22, 29), dx = -eIn(ex) * 1300; g.save(); if (ex > 0) g.filter = `blur(${(ex * 24).toFixed(1)}px)`; g.translate(dx, 0);
    const dt = pr(l, 6, 16); if (dt > 0) { const n = Math.floor(64 * dt); for (let i = 0; i < n; i++) { const a = i / 64 * 6.283 + f * .05, z = Math.sin(a);
      const x = 500 + Math.cos(a) * 420, y = 520 + z * 200 - Math.cos(a) * 60; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 7 + (z + 1) * 5, 0, 7); g.fill(); } }
    const t = pr(l, 1, 9), e = eBack(t); if (t > 0) { g.save(); g.translate(500, 500); g.rotate(-.13 + (1 - t) * .4); g.scale(e, e);
      extruded(g, TT('word', 'JUMP!'), 0, 0, `900 250px ${DISPLAY}`, P.ORANGE, P.NAVY, '#fff', 22, 1.1, 1.3, 26); g.restore(); }
    g.restore();
  } },
{ name:'tiao', a:180, b:209, bg:'GREEN', text:'"跳!"', hero:'None', tag:[760,560],
  lines:[{at:180, c:'film.at(180).type("跳!", RED, jitter=2, outline=WHITE)'},
         {at:184, c:'film.at(184).trail(dots=True, curve="arc")'},
         {at:190, c:'film.at(190).caption("ジャンプ", vertical=True)'}],
  draw(g, l, f) {
    g.fillStyle = P.GREEN; g.fillRect(0, 0, S, S);
    g.fillStyle = '#fbf8f1'; poly(g, tornPts(-40, 900, S + 80, 160, 63, 12)); g.fill();
    halftone(g, 560, 0, 440, 440, 'rgba(255,255,255,.3)', 18, (x, y) => clamp(1 - Math.hypot(x - 1000, y) / 440) * 7);
    const dt = pr(l, 4, 20); if (dt > 0) { const n = Math.floor(46 * dt); for (let i = 0; i <= n; i++) { const t = i / 46, [x, y] = qb(80, 860, 500, -120, 930, 520, t);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, i === n ? 18 : 7, 0, 7); g.fill(); } }
    const k = Math.floor(f / 2), r = rng(k * 13 + 5), jx = (r() - .5) * 12, jy = (r() - .5) * 12, sc = lerp(1.5, 1, eOut(pr(l, 0, 6)));
    g.save(); g.translate(470 + jx, 520 + jy); g.scale(sc, sc); g.rotate(-.06 + (r() - .5) * .03); g.font = `900 600px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.fillStyle = P.INK; g.fillText(TT('glyph', '跳'), 16, 22); g.lineWidth = 26; g.strokeStyle = '#fff'; g.strokeText(TT('glyph', '跳'), 0, 0); g.fillStyle = P.RED; g.fillText(TT('glyph', '跳'), 0, 0);
    g.font = `900 260px ${DISPLAY}`; g.fillStyle = P.INK; g.fillText('!', 330, 120); g.restore();
    const ct = pr(l, 10, 18); if (ct > 0) { g.fillStyle = P.INK; g.font = `900 56px ${CJK}`; const s = [...TT('vertical', 'ジャンプ')], n = Math.ceil(s.length * ct); for (let i = 0; i < n; i++) g.fillText(s[i], 900, 150 + i * 64); }
    g.fillStyle = P.INK; g.font = `700 18px ${MONO}`; g.fillText(TT('caption', 'TIÀO / v. to jump'), 170, 965);
  } },
{ name:'fly', a:210, b:239, bg:'RED', text:'"MADE TO FLY"', hero:'"shoe"', tag:[500,880], trans:'tear',
  lines:[{at:210, c:'film.at(210).tear(RED, vertical=True)'},
         {at:212, c:'film.at(212).bounce(shoe.recolor(TEAL), height=220, period=14)'},
         {at:214, c:'film.at(214).ring_text("MADE TO FLY · JUMP ATHLETICS · ", spin=-1)'}],
  draw(g, l, f) {
    g.fillStyle = P.RED; g.fillRect(0, 0, S, S);
    sunburst(g, 500, 500, 36, ['rgba(0,0,0,0)', 'rgba(0,0,0,.06)'], f * .006);
    const rt = pr(l, 2, 10); g.save(); g.translate(500, 500); g.rotate(-f * .025); g.globalAlpha = rt; g.font = `900 50px ${DISPLAY}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const str = TT('ring', 'MADE TO FLY · JUMP ATHLETICS · ').repeat(3), R = 380; let a = 0; for (const ch of str) { const w = g.measureText(ch).width / R; if (a + w > 6.283 * rt) break;
      g.save(); g.rotate(a + w / 2); g.translate(0, -R); g.fillText(ch, 0, 0); g.restore(); a += w + .004; } g.restore();
    const ph = Math.max(0, l - 2), h = Math.abs(Math.sin(ph * Math.PI / 14)) * 220, ground = 640, land = h < 22 && l > 2;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(500, ground + 88, 190 * (1 - h / 500), 22 * (1 - h / 400), 0, 0, 7); g.fill();
    if (land) { g.strokeStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 7; i++) { const a = Math.PI + .25 + i * .44; g.beginPath(); g.moveTo(500 + Math.cos(a) * 250, ground + 88 + Math.sin(a) * 70); g.lineTo(500 + Math.cos(a) * 310, ground + 88 + Math.sin(a) * 95); g.stroke(); } }
    const vel = Math.cos(ph * Math.PI / 14) * Math.sign(Math.sin(ph * Math.PI / 14) || 1);
    HERO(g, 500, ground - h, 1.15, CW[2], { rot: -vel * .14, sy: land ? .88 : 1, sx: land ? 1.08 : 1 });
  } },
{ name:'marquee', a:240, b:269, bg:'RED', text:'"JUMP "', hero:'"shoe"', tag:[150,140], punch:true,
  lines:[{at:240, c:'film.at(240).marquee("JUMP ", bands=3, angle=-8, color=YELLOW)'},
         {at:244, c:'film.at(244).bolts(WHITE, n=6, flicker=True)'},
         {at:248, c:'film.at(248).polaroid(shoe.recolor(RED), tilt=4)'}],
  draw(g, l, f) {
    g.fillStyle = P.RED; g.fillRect(0, 0, S, S);
    g.save(); g.translate(500, 500); g.rotate(-.14);
    for (let b = -1; b <= 1; b++) { const y = b * 300; g.fillStyle = P.YELLOW; g.fillRect(-900, y - 78, 1800, 156); g.fillStyle = P.INK; g.fillRect(-900, y - 78, 1800, 7); g.fillRect(-900, y + 71, 1800, 7);
      g.font = `900 124px ${DISPLAY}`; g.textBaseline = 'middle'; const MQ = TT('word', 'JUMP') + ' ', tw = g.measureText(MQ).width, off = ((b % 2 ? 1 : -1) * f * 16) % tw; for (let x = -900 - tw + off; x < 900; x += tw) g.fillText(MQ, x, y + 6); }
    g.restore();
    const bp = [[140,250,.0],[860,190,.4],[120,760,-.3],[880,800,.2],[300,520,.6],[720,520,-.5]];
    bp.forEach(([x, y, r], i) => { if (l < 4 + i) return; if (((f >> 1) + i) % 3 === 0) return; bolt(g, x, y, 1.1, r, '#fff'); });
    const pt = pr(l, 8, 16); if (pt > 0) { const e = eBack(pt); g.save(); g.translate(500, 510); g.rotate(.07 + (1 - pt) * .4); g.scale(e, e);
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 14; g.fillStyle = '#fbfaf6'; g.fillRect(-200, -230, 400, 470); g.shadowColor = 'transparent';
      g.fillStyle = P.TEAL; g.fillRect(-176, -206, 352, 352); g.save(); g.beginPath(); g.rect(-176, -206, 352, 352); g.clip();
      halftone(g, -180, -210, 360, 360, 'rgba(0,0,0,.2)', 12, (x, y) => 2 + clamp((y + 210) / 360) * 4); HERO(g, 0, -20, .74, CW[1], { rot: -.1 }); g.restore();
      g.fillStyle = P.INK; g.font = `700 22px ${MONO}`; g.textAlign = 'center'; g.fillText(TT('caption', 'drop 01 — JMP-01 "RED"'), 0, 196); g.restore(); }
  } },
{ name:'sketch', a:270, b:299, bg:'WHITE', text:'"STREET CLUB"', hero:'"shoe.lineart"', tag:[620,700], trans:'tear',
  lines:[{at:270, c:'film.at(270).paper(WHITE, margin=RED, ruled=True)'},
         {at:272, c:'film.at(272).sketch(shoe, ink=INK, dur=16)'},
         {at:284, c:'film.at(284).stitch(RED, path="sole", zigzag=True)'}],
  draw(g, l, f) {
    g.fillStyle = '#FAF9F4'; g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(40,90,180,.16)'; g.lineWidth = 2; for (let y = 60; y < S; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke(); }
    g.strokeStyle = P.RED; g.lineWidth = 3; g.beginPath(); g.moveTo(130, 0); g.lineTo(130, S); g.stroke();
    g.save(); g.translate(82, 900); g.rotate(-Math.PI / 2); g.fillStyle = P.INK; g.font = `700 26px ${MONO}`; g.fillText(TT('side', 'STREET CLUB · ALL WEATHER · JMP-01'), 0, 0); g.restore();
    const sp = pr(l, 2, 18); HEROSKETCH(g, 560, 500, 1.6, sp);
    const zp = pr(l, 14, 28); if (zp > 0) { g.save(); g.translate(560, 500); g.scale(1.6, 1.6); g.strokeStyle = P.RED; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath();
      const n = Math.floor(52 * zp); for (let i = 0; i <= n; i++) { const x = -198 + i * 8, y = 58 + (i % 2 ? -9 : 9); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      if (n > 0) { const x = -198 + n * 8; g.beginPath(); g.moveTo(x, 58); g.bezierCurveTo(x + 30, 110, x + 70, 60, x + 100, 120); g.stroke(); } g.restore(); }
    const at = pr(l, 18, 24); if (at > 0) { g.globalAlpha = at; g.strokeStyle = P.INK; g.lineWidth = 2; g.beginPath(); g.moveTo(820, 260); g.lineTo(760, 370); g.stroke();
      g.fillStyle = P.INK; g.font = `700 20px ${MONO}`; g.fillText(TT('fig', 'fig.01 — "RUNNER"'), 720, 240); g.fillText(TT('note', 'vulcanized sole'), 740, 830); g.beginPath(); g.moveTo(800, 806); g.lineTo(760, 620); g.stroke(); g.globalAlpha = 1; }
    g.strokeStyle = P.INK; g.lineWidth = 2; [[200,140],[900,140],[200,900],[900,900]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.moveTo(x, y - 14); g.lineTo(x, y + 14); g.stroke(); });
  } },
{ name:'stamp', a:300, b:329, bg:'CONCRETE', text:'"JUMP"', hero:'"shoe"', tag:[220,330],
  lines:[{at:300, c:'film.at(300).paper(CONCRETE, grain=0.8)'},
         {at:304, c:'film.at(304).stamp("JUMP", shake=12)'},
         {at:314, c:'film.at(314).drop(shoe.recolor(RED), shake=8)'}],
  draw(g, l, f) {
    const [s1x, s1y] = shakeXY(l, 8, 14), [s2x, s2y] = shakeXY(l, 19, 10); g.save(); g.translate(s1x + s2x, s1y + s2y);
    g.drawImage(concrete, -20, -20, S + 40, S + 40);
    const t = pr(l, 4, 8); if (t > 0) { const sc = lerp(2.4, 1, eIn(t)); g.save(); g.globalAlpha = clamp(t * 2); g.translate(500, 250); g.scale(sc, sc); g.rotate(-.04);
      g.strokeStyle = '#f3f1ec'; g.lineWidth = 12; g.strokeRect(-330, -120, 660, 240); g.fillStyle = '#f3f1ec'; g.font = `900 200px ${DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(TT('word', 'JUMP'), 0, 8);
      const r = rng(5); g.fillStyle = P.CONCRETE; for (let i = 0; i < 700; i++) { g.globalAlpha = .7; g.fillRect(-340 + r() * 680, -130 + r() * 260, 2 + r() * 6, 2 + r() * 4); } g.restore(); }
    const d = pr(l, 14, 19); if (d > 0) { const y = lerp(-300, 690, eIn(d)), land = d >= 1, q = pr(l, 19, 24), k = land ? Math.sin(q * Math.PI) * .12 : 0;
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(500, 790, 260 * d, 30 * d, 0, 0, 7); g.fill();
      HERO(g, 500, y, 1.35, CW[1], { rot: -.06, sy: 1 - k, sx: 1 + k * .8 }); }
    g.restore();
    g.fillStyle = '#f3f1ec'; g.font = `700 18px ${MONO}`; g.fillText(TT('caption', 'APPROVED FOR CONCRETE'), 700, 962);
  } },
{ name:'end', a:330, b:359, bg:'CREAM', text:'"跳出你的节奏"', hero:'"logo"', tag:[300,720], punch:true,
  lines:[{at:330, c:'film.at(330).lockup("JUMP", tag="跳出你的节奏")'},
         {at:340, c:'film.at(340).sticker("VOL.01 — 2026.10", rot=6)'},
         {at:346, c:'film.render("jump_vol01.mp4", fps=24, size=(1920, 1080))'}],
  draw(g, l, f) {
    g.fillStyle = P.CREAM; g.fillRect(0, 0, S, S); newsprint(g, 21);
    const ct = eOut(pr(l, 0, 10)); g.fillStyle = P.YELLOW; g.beginPath(); g.arc(500, 450, 400 * ct, 0, 7); g.fill();
    halftone(g, 100, 50, 800, 800, P.ORANGE, 18, (x, y) => { const d = Math.hypot(x - 500, y - 450); return d < 400 * ct ? clamp((d - 200) / 200) * 6 : 0; });
    const lt = pr(l, 2, 10); if (lt > 0) { const e = eBack(lt); g.save(); g.translate(500, 410); g.rotate(-.06); g.scale(e, e);
      extruded(g, TT('word', 'JUMP'), 0, 0, `italic 900 270px ${DISPLAY}`, P.RED, P.INK, '#fff', 20, 1, 1.2, 24); g.restore(); }
    const tt = pr(l, 6, 13); if (tt > 0) { g.save(); g.globalAlpha = tt; g.fillStyle = P.INK; g.font = `900 66px ${CJK}`; g.textAlign = 'center'; g.fillText(TT('tagline', '跳出你的节奏'), 500, 640 + (1 - eOut(tt)) * 30); g.restore(); }
    const sp = pr(l, 12, 18); if (sp > 0) HERO(g, 500, 800, .55 * eBack(sp), CW[0], { rot: -.08 });
    const st = pr(l, 10, 16); if (st > 0) { const e = eBack(st); g.save(); g.translate(790, 820); g.rotate(.1); g.scale(e, e); g.fillStyle = P.INK; g.fillRect(-120, -26, 240, 52);
      g.fillStyle = '#fff'; g.font = `700 20px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(TT('badge', 'VOL.01 — 2026.10'), 0, 1); g.restore(); }
  } },
];
const PRESETS = Object.fromEntries(PRESETS_LIST.map(o => [o.name, o]));
/** preset(name, k, opts) → draw(g, l, f). k = playback speed (2.5 → 12 frames). */
const preset = (name, k = 1, opts = {}) => (g, l, f) => { const prev = PO; PO = opts; try { PRESETS[name].draw(g, l * k, f); } finally { PO = prev; } };
