// =====================================================================
//  timeline.js — the film. One object per shot, played in order.
//  { name, dur (frames), bg/text/hero (labels shown in the code panel),
//    tag: [x, y] where the FX label sits on the stage,
//    punch: true (zoom-in on the cut) | trans: 'tear' (torn-paper wipe),
//    lines: [[frameOffset, 'code shown in panel, @ = absolute frame', asset?]],
//    draw(g, l, f)  — g = stage ctx (1000x1000), l = local frame, f = global frame }
//  asset rows: { label, items: ['img:<key>', 'cw:<colorway>', 'emo:<emoji>'] }
// =====================================================================
const SH = [
{ name:'title', dur:12, bg:'CREAM', text:'"JUMP"', hero:'None', tag:[96,150], draw: preset('intro', 2.4),
  lines:[[0,'film.at(@).paper(CREAM, grain=0.35, news=True)'],[1,'film.at(@).drop("JUMP", stagger=1, patches=[RED, YELLOW, TEAL, INK])']] },
{ name:'count3', dur:6, bg:'RED', text:'"3"', hero:'"rocket"', tag:[640,180], punch:true, draw: countdown(3, P.RED, P.YELLOW, P.INK, 'rocket_duo'),
  lines:[[0,'rocket = asset.photo("rocket.jpg", treat=["duotone", "halftone"])', {label:'rocket · launch photo · public domain', items:['img:rocket_color','img:rocket_duo','img:rocket_ht']}],
         [0,'film.at(@).count(3, bg=RED, strip=rocket.duo)']] },
{ name:'count2', dur:6, bg:'YELLOW', text:'"2"', hero:'"rocket"', tag:[200,180], punch:true, draw: countdown(2, P.YELLOW, P.RED, P.INK, 'rocket_ht'),
  lines:[[0,'film.at(@).count(2, bg=YELLOW, strip=rocket.halftone)']] },
{ name:'count1', dur:6, bg:'TEAL', text:'"1"', hero:'"rocket"', tag:[640,180], punch:true, draw: countdown(1, P.TEAL, '#fff', P.NAVY, 'rocket_color'),
  lines:[[0,'film.at(@).count(1, bg=TEAL, strip=rocket.color)']] },
{ name:'liftoff', dur:12, bg:'"hubble"', text:'"LIFT OFF"', hero:'"rocket"', tag:[120,520],
  lines:[[0,'space = asset.photo("hubble_deep_field.jpg")', {label:'space · hubble deep field · public domain', items:['img:hubble']}],
         [0,'film.at(@).bg(space, zoom=1.12).launch(rocket, speedlines=True)'],[3,'film.at(@).sticker("LIFT OFF", YELLOW, rot=-6)']],
  draw(g, l, f) { fullCover(g, IMG.hubble, 1.05 + l * .012); speedlines(g, f, 22, true);
    const y = lerp(560, 150, eIn(pr(l, 0, 11))) + Math.sin(f * 2.1) * 4;
    for (let k = 3; k >= 0; k--) emoji(g, '🔥', 500 + Math.sin(f + k) * 8, y + 450 + k * 70, 230 - k * 30 + (f % 2) * 20, Math.PI + Math.sin(f * 3 + k) * .1);
    photoCard(g, 'rocket_color', 500, y, 300, 820, -.03, 81);
    if (l >= 3) sticker(g, 'LIFT OFF', 760, 230, -.1, P.YELLOW, P.INK, 64, eBack(pr(l, 3, 6)));
    g.fillStyle = '#fff'; g.font = `700 20px ${MONO}`; g.fillText('MISSION JMP-01 · ALT 000.4 KM', 170, 965); } },
{ name:'drop', dur:12, bg:'RED', text:'"NEW DROP"', hero:'"shoe"', tag:[250,500], punch:true, draw: preset('drop', 2.5),
  lines:[[0,'shoe = draw.sneaker(upper=WHITE, accent=YELLOW, laces=6)', {label:'shoe · 3 colorways · procedural', items:['cw:0','cw:1','cw:2']}],
         [0,'film.at(@).slide_in(shoe, from_="left", speedlines=True)']] },
{ name:'unbox', dur:12, bg:'ORANGE', text:'None', hero:'"shoe"', tag:[500,300], punch:true, draw: preset('unbox', 2.5),
  lines:[[0,'film.at(@).box(KRAFT).pop(shoe, rise=360, confetti=40)']] },
{ name:'fasttrack', dur:12, bg:'CREAM', text:'"FAST TRACK"', hero:'"horse"', tag:[640,120], punch:true,
  lines:[[0,'horse = asset.cutout("horse.png")', {label:'horse · silhouette · CC0', items:['img:horse']}],
         [0,'film.at(@).stripes([TEAL, PINK], angle=-30).gallop(horse)'],[5,'film.at(@).tag("FAST TRACK", TEAL)']],
  draw(g, l, f) { g.fillStyle = P.CREAM; g.fillRect(0, 0, S, S); newsprint(g, 12);
    tornCard(g, 500, 500, 900, 640, -.04, P.TEAL, 90, gg => { gg.save(); gg.rotate(-.5); for (let i = -14; i < 14; i++) { gg.fillStyle = i % 2 ? P.PINK : P.TEAL; gg.fillRect(i * 80 + (f * 10) % 160, -900, 80, 1800); } gg.restore();
      gg.fillStyle = 'rgba(255,255,255,.95)'; gg.font = `900 330px ${DISPLAY}`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('JUMP', 0, -10); });
    const x = lerp(820, 430, eOut(pr(l, 0, 11))), bob = -Math.abs(Math.sin(l * 1.1)) * 22;
    g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 20; g.shadowOffsetY = 12; g.drawImage(IMG.horse, x - 380, 190 + bob, 760, 623); g.restore();
    g.globalAlpha = .25; g.drawImage(IMG.horse, x - 380 + 70, 190, 760, 623); g.globalAlpha = 1;
    if (l >= 5) sticker(g, 'FAST TRACK', 700, 830, -.06, P.TEAL, '#fff', 54, eBack(pr(l, 5, 8))); } },
{ name:'lookout', dur:12, bg:'CREAM', text:'"Lookout"', hero:'"eyes[9]"', tag:[620,90], punch:true,
  lines:[[0,'eyes = asset.photo("chelsea.png").crop("eyes", n=9)', {label:'eyes · cat photo crops · CC0', items:['img:cateye0','img:cateye1','img:cateye0_bw','img:cateye1_bw']}],
         [0,'film.at(@).grid(eyes, 3, stagger=1, title="Lookout")'],[6,'film.at(@).frame(TEAL, track="eyes")']],
  draw(g, l, f) { g.fillStyle = P.CREAM; g.fillRect(0, 0, S, S); newsprint(g, 14);
    g.fillStyle = P.INK; g.font = `900 100px ${DISPLAY}`; g.fillText('Lookout', 48, 140); g.font = `700 18px ${MONO}`; g.fillText('SEE IT FIRST — 9 SIGHTINGS — PLATE 07', 52, 182);
    const keys = ['cateye0_bw','cateye1','cateye0_bw','cateye1_bw','cateye0','cateye1_bw','cateye0_bw','cateye1_bw','cateye0'];
    for (let i = 0; i < 9; i++) { if (l < i * .9) continue; const c = i % 3, r = Math.floor(i / 3), x = 48 + c * 306, y = 212 + r * 258, e = eBack(pr(l, i * .9, i * .9 + 3));
      g.save(); g.translate(x + 147, y + 122); g.scale(e, e); g.beginPath(); g.rect(-147, -122, 294, 244); g.clip(); cover(g, IMG[keys[i]], 294, 244, 1 + (i % 3) * .15, 0, 0, i % 2 === 1); g.restore();
      g.strokeStyle = P.INK; g.lineWidth = 3; g.strokeRect(x, y, 294, 244); }
    const ft = pr(l, 6, 10); if (ft > 0) { const x = lerp(-300, 354, eOut(ft)); g.save(); g.translate(x + 147, 470 + 122); g.rotate(-.05 + (1 - ft) * .3); g.lineWidth = 24; g.strokeStyle = P.TEAL; g.strokeRect(-170, -142, 340, 284); g.restore(); } } },
{ name:'cateye', dur:12, bg:'RED', text:'None', hero:'"eyes[0]"', tag:[700,150], trans:'tear',
  lines:[[0,'film.at(@).tear(RED).card(eyes[0], zoom=1.15)'],[2,'film.at(@).dots(from_="pupil", angle=-32)'],[7,'film.at(@).cut(eyes[1])']],
  draw(g, l, f) { g.fillStyle = P.RED; g.fillRect(0, 0, S, S); halftone(g, 0, 0, S, S, '#C9230F', 22, (x, y) => 4 + Math.sin(x * .01 + y * .008) * 3);
    const k = l < 7 ? 0 : 1; tornCard(g, 500, 500, 900, 660, k ? .03 : -.035, '#000', 95 + k, gg => cover(gg, IMG['cateye' + k + '_wide'], 900, 660, 1.0 + (l % 7) * .025));
    const n = Math.floor(pr(l, 1, 10) * 22); for (let i = 0; i <= n; i++) { const [x, y] = qb(500, 500, 700, 520, 900, 790, i / 22); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, i === n ? 15 : 6, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.font = `700 18px ${MONO}`; g.fillText(k ? 'PLATE 09 — RIGHT' : 'PLATE 08 — LEFT', 170, 965); } },
{ name:'cards', dur:12, bg:'RED', text:'None', hero:'"cat"', tag:[100,250], punch:true,
  lines:[[0,'cat = asset.photo("chelsea.png", treat=["duotone", "halftone"])', {label:'cat · photo · CC0 · 2 treatments', items:['img:cat_color','img:cat_duo','img:cat_ht','img:coins_ht']}],
         [0,'film.at(@).cards([cat.duo, shoe, coins, ...], every=2, bg=RED)']],
  draw(g, l, f) { g.fillStyle = P.RED; g.fillRect(0, 0, S, S); halftone(g, 0, 0, S, S, '#C9230F', 20, () => 4);
    const items = [{ k:'cat_duo' }, { sn:1, bg:P.CREAM }, { k:'coins_ht' }, { sn:3, bg:P.YELLOW }, { k:'cat_ht' }, { sn:4, bg:P.TEAL }];
    items.forEach((it, i) => { const t = pr(l, i * 2, i * 2 + 3); if (t <= 0) return; const e = eOut(t), x = 320 + (i % 3) * 180, y = 450 + (i % 2) * 110, rot = (i % 2 ? .13 : -.11) + (1 - e) * .8;
      tornCard(g, x, y + (1 - e) * 800, 430, 540, rot, it.bg || '#111', 110 + i, gg => { if (it.k) cover(gg, IMG[it.k], 430, 540, 1.1); else { halftone(gg, -220, -280, 440, 560, 'rgba(0,0,0,.12)', 12, () => 3); sneaker(gg, 0, 0, .85, CW[it.sn], { rot: -.1 }); } }); });
    if (l >= 10) sticker(g, 'REPLAY.', 500, 880, -.04, '#fff', P.INK, 70, eBack(pr(l, 10, 12))); } },
{ name:'grid', dur:12, bg:'CREAM', text:'None', hero:'"variants[9]"', tag:[500,140], punch:true, draw: preset('grid', 2.5),
  lines:[[0,'variants = shoe.variants(9, palette=PALETTE)', {label:'variants · 9 colorways · procedural', items:['cw:0','cw:1','cw:2','cw:3','cw:4','cw:5','cw:6','cw:7','cw:8']}],
         [0,'film.at(@).grid(variants, 3, stagger=1)'],[6,'film.at(@).circle(variants[4], RED, scribble=True)']] },
{ name:'fuel', dur:12, bg:'YELLOW', text:'"FUEL UP."', hero:'"cup"', tag:[560,140], punch:true,
  lines:[[0,'cup = asset.cutout("coffee.png", shape="circle")', {label:'cup · photo · CC0', items:['img:coffee_cut','img:coffee_ht']}],
         [0,'film.at(@).spin(cup, sticker=True).type("FUEL UP.")']],
  draw(g, l, f) { g.fillStyle = P.YELLOW; g.fillRect(0, 0, S, S); halftone(g, 0, 0, S, S, 'rgba(255,106,26,.45)', 20, (x, y) => clamp(Math.hypot(x - 500, y - 450) / 650) * 8);
    photoCard(g, 'coffee_ht', 230, 260, 400, 300, -.12, 120, eOut(pr(l, 0, 4)));
    const t = eBack(pr(l, 0, 5)); g.save(); g.translate(560, 460); g.rotate(l * .09); g.scale(t, t);
    g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 24; g.shadowOffsetY = 14; g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 318, 0, 7); g.fill(); g.restore();
    g.drawImage(IMG.coffee_cut, -305, -305, 610, 610); g.restore();
    g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineCap = 'round'; for (let k = 0; k < 3; k++) { g.beginPath(); for (let y = 0; y < 140; y += 6) { const x = 470 + k * 60 + Math.sin(y * .06 + f * .6 + k) * 16; y ? g.lineTo(x, 120 - y + 40) : g.moveTo(x, 160); } g.globalAlpha = .8 * pr(l, 2, 5); g.stroke(); } g.globalAlpha = 1;
    const tt = pr(l, 3, 8); if (tt > 0) { g.save(); g.translate(470, 880); g.rotate(-.05); const e = eBack(tt); g.scale(e, e); extruded(g, 'FUEL UP.', 0, 0, `900 140px ${DISPLAY}`, P.RED, P.INK, '#fff', 14, 1, 1.2, 20); g.restore(); }
    if (l >= 6) sneaker(g, 840, 700, .42 * eBack(pr(l, 6, 9)), CW[3], { rot: -.2 }); } },
{ name:'jump', dur:18, bg:'GREEN', text:'"JUMP!"', hero:'None', tag:[180,480], punch:true, draw: preset('jump', 30 / 18),
  lines:[[0,'film.at(@).burst_type("JUMP!", colors=[WHITE, NAVY, ORANGE])'],[4,'film.at(@).orbit(dots=64, rx=0.42, ry=0.20)'],[13,'film.at(@).exit("left", blur=24)']] },
{ name:'tiao', dur:12, bg:'GREEN', text:'"跳!"', hero:'None', tag:[760,560], draw: preset('tiao', 2.5),
  lines:[[0,'film.at(@).type("跳!", RED, jitter=2).trail(dots=True)']] },
{ name:'fly', dur:12, bg:'RED', text:'"MADE TO FLY"', hero:'"shoe"', tag:[500,880], trans:'tear', draw: preset('fly', 2.5),
  lines:[[0,'film.at(@).tear(RED).bounce(shoe.recolor(TEAL), period=6)'],[1,'film.at(@).ring_text("MADE TO FLY · JUMP ATHLETICS · ")']] },
{ name:'marquee', dur:12, bg:'RED', text:'"JUMP "', hero:'"shoe"', tag:[150,140], punch:true, draw: preset('marquee', 2.5),
  lines:[[0,'film.at(@).marquee("JUMP ", bands=3, color=YELLOW).bolts(WHITE)'],[3,'film.at(@).polaroid(shoe.recolor(RED), tilt=4)']] },
{ name:'stickers', dur:12, bg:'GREEN', text:'"ALL SYSTEMS GO"', hero:'"stickers"', tag:[90,880], punch:true,
  lines:[[0,'stickers = asset.emoji(["bolt", "fire", "boom", "star", "rocket", "eyes"])', {label:'stickers · Noto emoji · OFL', items:['emo:⚡','emo:🔥','emo:💥','emo:⭐','emo:🚀','emo:👀','emo:🎧','emo:👟']}],
         [0,'film.at(@).scatter(stickers, every=1, outline=WHITE)']],
  draw(g, l, f) { const o = (f * 6) % 250; for (let i = -1; i < 9; i++) for (let j = -1; j < 9; j++) { g.fillStyle = (i + j) % 2 ? P.GREEN : '#12B57B'; g.fillRect(i * 125 + o / 2, j * 125 - o / 2, 126, 126); }
    g.fillStyle = '#fff'; g.font = `900 64px ${DISPLAY}`; g.fillText('ALL SYSTEMS GO', 40, 100);
    const E = ['⚡','🔥','💥','⭐','🚀','👀','🎧','💯'], r = rng(5);
    E.forEach((ch, i) => { const x = 140 + r() * 720, y = 200 + r() * 650, rot = (r() - .5) * .8; if (l < i) return; emoji(g, ch, x, y, 230 * eBack(pr(l, i, i + 3)), rot); });
    if (l >= 7) emoji(g, '👟', 500, 540, 520 * eBack(pr(l, 7, 11)), -.15); } },
{ name:'wall', dur:12, bg:'"brick"', text:'"JUMP"', hero:'"shoe.pair()"', tag:[90,250], trans:'tear',
  lines:[[0,'wall = asset.texture("brick.png", tint=RED)', {label:'wall · brick texture · CC0', items:['img:brick']}],
         [0,'film.at(@).spray("JUMP", YELLOW, drips=True)'],[1,'film.at(@).hang(shoe.pair(), swing=0.18)']],
  draw(g, l, f) { fullCover(g, IMG.brick, 1.1); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, S, S);
    g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 110); g.quadraticCurveTo(500, 150, 1000, 90); g.stroke();
    [[620, 128, CW[1], 1], [790, 118, CW[6], -1.2]].forEach(([x, y, cw, k]) => { const sw = Math.sin(l * .6 + k) * .2 * k; g.save(); g.translate(x, y); g.rotate(sw);
      g.strokeStyle = '#eee'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 150); g.stroke(); sneaker(g, -20, 280, .6, cw, { rot: 1.35 }); g.restore(); });
    const p = eOut(pr(l, 0, 6)); g.save(); g.beginPath(); g.rect(0, 0, 60 + p * 940, S); g.clip(); g.translate(430, 650); g.rotate(-.08);
    g.font = `italic 900 250px ${DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 34; g.strokeStyle = P.INK; g.strokeText('JUMP', 0, 0);
    const r = rng(9); g.fillStyle = P.YELLOW; for (let i = 0; i < 16; i++) { const x = -300 + r() * 600, len = pr(l, 3, 12) * (40 + r() * 140); g.fillRect(x, 60, 9, len); g.beginPath(); g.arc(x + 4.5, 60 + len, 7, 0, 7); g.fill(); }
    g.fillText('JUMP', 0, 0); for (let i = 0; i < 260; i++) { const a = r() * 6.283, d = 300 + r() * 120; g.fillRect(Math.cos(a) * d * 1.1, Math.sin(a) * d * .45, 3, 3); }
    g.restore(); g.fillStyle = '#fff'; g.font = `700 20px ${MONO}`; g.fillText('STREET LEVEL · NO LOITERING', 40, 965); } },
{ name:'sketch', dur:12, bg:'WHITE', text:'"STREET CLUB"', hero:'"shoe.lineart"', tag:[620,700], punch:true, draw: preset('sketch', 2.5),
  lines:[[0,'film.at(@).paper(WHITE, ruled=True).sketch(shoe, dur=6)'],[6,'film.at(@).stitch(RED, path="sole", zigzag=True)']] },
{ name:'moon', dur:12, bg:'"space"', text:'"LOW-G MODE"', hero:'"shoe"', tag:[120,400], trans:'tear',
  lines:[[0,'film.at(@).bg(space).planet(asset.photo("moon.png"))', {label:'moon · surface photo · scikit-image', items:['img:moon']}],[0,'film.at(@).float(shoe.recolor(NAVY), g=0.16)']],
  draw(g, l, f) { fullCover(g, IMG.hubble, 1.2, -l * 3, 0); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, S, S);
    g.save(); g.beginPath(); g.arc(500, 1290, 800, 0, 7); g.clip(); g.drawImage(IMG.moon, -300 + l * 3, 480, 1600, 1600); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 6; g.beginPath(); g.arc(500, 1290, 800, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    sneaker(g, 500, 470 + Math.sin(l * .5) * 18, 1.1, CW[8], { rot: -.35 + l * .04 });
    [[180, 260], [820, 330], [700, 140]].forEach(([x, y], i) => emoji(g, '⭐', x, y, 90 + Math.sin(f * .8 + i) * 20, i));
    g.fillStyle = '#fff'; g.font = `900 92px ${DISPLAY}`; g.textAlign = 'center'; g.fillText('LOW-G MODE', 500, 130); g.textAlign = 'left';
    g.font = `700 20px ${MONO}`; g.fillText('GRAVITY 0.16 g · AIRTIME ×6', 40, 965); } },
{ name:'flip', dur:12, bg:'RED', text:'None', hero:'"variants"', tag:[430,430],
  lines:[[0,'film.at(@).split(4).flip(variants, every=2)']],
  draw(g, l, f) { const bgs = [P.RED, P.YELLOW, P.TEAL, P.PINK];
    for (let q = 0; q < 4; q++) { const x = (q % 2) * 500, y = (q >> 1) * 500; g.fillStyle = bgs[(q + (l >> 2)) % 4]; g.fillRect(x, y, 500, 500);
      halftone(g, x, y, 500, 500, 'rgba(0,0,0,.1)', 16, () => 3); const k = Math.floor((l + q) / 2), c = Math.cos((l + q) * Math.PI / 4);
      sneaker(g, x + 250, y + 265, .62, CW[(k + q * 2) % 9], { sx: Math.abs(c) < .15 ? .15 * Math.sign(c || 1) : c, rot: -.08 }); }
    g.fillStyle = P.INK; g.fillRect(495, 0, 10, S); g.fillRect(0, 495, S, 10);
    if (l >= 5) { const e = eBack(pr(l, 5, 8)); g.save(); g.translate(500, 500); g.scale(e, e); g.rotate(-.1); g.fillStyle = P.INK; g.beginPath(); g.arc(5, 6, 110, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.fill();
      g.fillStyle = P.INK; g.font = `900 52px ${DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PICK', 0, -20); g.fillText('ONE', 0, 30); g.restore(); } } },
{ name:'reflex', dur:12, bg:'RED', text:'"CAT-LIKE REFLEXES"', hero:'"cat"', tag:[90,700], punch:true,
  lines:[[0,'film.at(@).card(cat.duo, tape=2).cut(cat.halftone, at=6)'],[2,'film.at(@).type("CAT-LIKE REFLEXES", stack=True)']],
  draw(g, l, f) { g.fillStyle = P.RED; g.fillRect(0, 0, S, S); sunburst(g, 500, 450, 24, ['rgba(0,0,0,0)', 'rgba(0,0,0,.08)'], f * .02);
    const k = l < 6; photoCard(g, k ? 'cat_duo' : 'cat_ht', 500, 430, 820, 560, k ? -.05 : .03, k ? 140 : 141, 1, 1.02 + l * .015);
    tape(g, 160, 170, -.6); tape(g, 850, 680, -.5);
    const t = pr(l, 2, 6); if (t > 0) { const e = eBack(t); g.save(); g.translate(500, 800); g.rotate(-.05); g.scale(e, e); extruded(g, 'CAT-LIKE', 0, -40, `900 120px ${DISPLAY}`, '#fff', P.INK, null, 10, 1, 1.2);
      extruded(g, 'REFLEXES', 0, 80, `900 120px ${DISPLAY}`, P.YELLOW, P.INK, null, 10, 1, 1.2); g.restore(); } } },
{ name:'stamp', dur:12, bg:'CONCRETE', text:'"JUMP"', hero:'"shoe"', tag:[220,330], punch:true, draw: preset('stamp', 2.5),
  lines:[[0,'film.at(@).paper(CONCRETE).stamp("JUMP", shake=12)'],[5,'film.at(@).drop(shoe.recolor(RED), shake=8)']] },
{ name:'replay', dur:24, bg:'None', text:'"VOL.01"', hero:'"shots[1:23]"', tag:[400,640],
  lines:[[0,'film.at(@).replay(shots[1:23], every=2, jitter=True)'],[12,'film.at(@).flash(WHITE, every=4)']],
  draw(g, l, f) { const picks = [4, 10, 7, 13, 17, 9, 19, 11, 16, 21, 8, 22]; const idx = picks[Math.floor(l / 2) % picks.length], sh = SH[idx], r = rng((l >> 1) + 3);
    g.save(); g.translate(500, 500); g.rotate((r() - .5) * .16); const z = 1.04 + r() * .12; g.scale(z, z); g.translate(-500, -500); sh.draw(g, Math.floor(sh.dur * .7), sh.a + Math.floor(sh.dur * .7)); g.restore();
    if (l >= 12 && l % 4 === 0) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(0, 0, S, S); }
    g.save(); g.font = `900 280px ${DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#fff'; g.strokeText('VOL.01', 500, 520);
    if ((l >> 1) % 3 === 0) { g.fillStyle = P.YELLOW; g.fillText('VOL.01', 500, 520); } g.restore();
    g.fillStyle = '#fff'; g.font = `700 22px ${MONO}`; g.fillText(`REPLAY ${String((l >> 1) + 1).padStart(2, '0')}/12`, 40, 965); } },
{ name:'higher', dur:18, bg:'"space"', text:'"JUMP HIGHER"', hero:'"shoe"', tag:[640,860], punch:true,
  lines:[[0,'film.at(@).bg(space).launch(shoe, trail="fire")'],[2,'film.at(@).type("JUMP HIGHER", stack=True)']],
  draw(g, l, f) { fullCover(g, IMG.hubble, 1.1 + l * .01); speedlines(g, f, 26, true);
    const y = l < 6 ? lerp(1250, 600, eOut(l / 6)) : l < 13 ? 600 + Math.sin(l * 1.3) * 7 : lerp(600, -500, eIn(pr(l, 13, 17)));
    for (let k = 4; k >= 0; k--) emoji(g, '🔥', 640 + Math.sin(f * 2 + k) * 10, y + 230 + k * 85, 210 - k * 26 + (f % 2) * 18, Math.PI);
    sneaker(g, 640, y, 1.0, CW[0], { rot: -1.25 });
    g.save(); g.lineJoin = 'round'; g.font = `900 175px ${DISPLAY}`; const a = eOut(pr(l, 2, 6)), b = eOut(pr(l, 4, 8));
    [['JUMP', 60 - (1 - a) * 700, 300], ['HIGHER', 60 - (1 - b) * 900, 470]].forEach(([t, x, yy]) => { g.fillStyle = P.INK; g.fillText(t, x + 10, yy + 12); g.lineWidth = 14; g.strokeStyle = '#fff'; g.strokeText(t, x, yy); g.fillStyle = t === 'JUMP' ? P.YELLOW : '#fff'; g.fillText(t, x, yy); });
    g.restore(); } },
{ name:'end', dur:42, bg:'CREAM', text:'"跳出你的节奏"', hero:'"logo"', tag:[300,720], punch:true, draw: preset('end', 1),
  lines:[[0,'film.at(@).lockup("JUMP", tag="跳出你的节奏")'],[10,'film.at(@).sticker("VOL.01 — 2026.10", rot=6)'],[18,'film.render("jump_vol01.mp4", fps=24, size=(1920, 1080))']] },
];

// Sound design: per-shot cues read by scripts/audio.py (via timeline.json).
// [frameOffset, type, ...args]  types: blip(freq) beep(freq) whoosh boom scratch rise chord ticks(count, every) roll(count, every)
const SFX = {
  title:  [[0, 'ticks', 4, 2]],
  count3: [[0, 'beep', 880]], count2: [[0, 'beep', 988]], count1: [[0, 'beep', 1175]],
  liftoff:[[0, 'whoosh'], [2, 'boom']],
  lookout:[[0, 'ticks', 9, 1]],
  cards:  [[0, 'ticks', 6, 2]],
  jump:   [[13, 'whoosh']],
  tiao:   [[0, 'scratch']],
  stickers:[[0, 'ticks', 8, 1]],
  stamp:  [[2, 'boom'], [6, 'boom']],
  replay: [[0, 'scratch'], [0, 'roll', 12, 2]],
  higher: [[0, 'rise'], [12, 'whoosh']],
  end:    [[0, 'chord'], [10, 'blip', 1760]],
};
SH.forEach(s => { s.sfx = SFX[s.name] || []; });
