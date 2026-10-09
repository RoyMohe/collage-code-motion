// Starter timeline: 6 shots, 72 frames (3 s). Presets take text overrides; custom shots draw directly.
const SH = [
{ name:'title', dur:12, bg:'CREAM', text:'"BREW"', hero:'None', tag:[96,150],
  draw: preset('intro', 2.4, { word:'BREW', kicker:'BREW COFFEE CO. — SEASON 01', tagline:'WAKE UP LOUD.', badge:'S.01', badgeSub:'FRESH ROAST' }),
  lines:[[0,'film.at(@).drop("BREW", stagger=1, patches=[RED, YELLOW, TEAL, INK])']] },
{ name:'drop', dur:12, bg:'RED', text:'"NEW ROAST"', hero:'"cup"', tag:[250,500], punch:true,
  draw: preset('drop', 2.5, { top:'NEW', bottom:'ROAST', label:'NO.07' }),
  lines:[[0,'film.at(@).slide_in(cup, from_="left", speedlines=True)']] },
{ name:'stickers', dur:12, bg:'GREEN', text:'"WIDE AWAKE"', hero:'"stickers"', tag:[90,880], punch:true,
  lines:[[0,'stickers = asset.emoji(["bolt", "fire", "star"])', {label:'stickers · emoji', items:['emo:⚡','emo:🔥','emo:⭐','emo:☕']}],
         [0,'film.at(@).scatter(stickers, every=1, outline=WHITE)']],
  draw(g, l, f) { g.fillStyle = P.GREEN; g.fillRect(0, 0, S, S); halftone(g, 0, 0, S, S, 'rgba(255,255,255,.18)', 20, () => 4);
    g.fillStyle = '#fff'; g.font = `900 72px ${DISPLAY}`; g.fillText('WIDE AWAKE', 40, 110);
    ['⚡','🔥','⭐','💥','⚡','⭐'].forEach((ch, i) => { const r = rng(i + 3); if (l < i) return; emoji(g, ch, 150 + r() * 700, 220 + r() * 620, 220 * eBack(pr(l, i, i + 3)), (r() - .5) * .8); });
    if (l >= 6) emoji(g, '☕', 500, 540, 480 * eBack(pr(l, 6, 10)), -.1); } },
{ name:'jump', dur:12, bg:'GREEN', text:'"SIP!"', hero:'None', tag:[180,480], punch:true,
  draw: preset('jump', 2.5, { word:'SIP!' }), lines:[[0,'film.at(@).burst_type("SIP!", colors=[WHITE, NAVY, ORANGE])']] },
{ name:'marquee', dur:12, bg:'RED', text:'"BREW "', hero:'"cup"', tag:[150,140],
  draw: preset('marquee', 2.5, { word:'BREW', caption:'roast 07 — "LOUD"' }), lines:[[0,'film.at(@).marquee("BREW ", bands=3, color=YELLOW)']] },
{ name:'end', dur:12, bg:'CREAM', text:'"醒来，大声一点"', hero:'"logo"', tag:[300,720], punch:true,
  draw: preset('end', 2, { word:'BREW', tagline:'醒来，大声一点', badge:'SEASON 01 — 2026' }),
  lines:[[0,'film.at(@).lockup("BREW", tag="醒来，大声一点")']] },
];
const SFX = { title: [[0, 'ticks', 4, 2]], stickers: [[0, 'ticks', 6, 1]], end: [[0, 'chord']] };
SH.forEach(s => { s.sfx = SFX[s.name] || []; });
