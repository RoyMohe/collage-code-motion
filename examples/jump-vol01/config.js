// Project config — everything brand-specific lives here and in timeline.js.
const CONFIG = {
  brand: 'JUMP',
  project: 'jump_vol01',          // shown in the code panel path
  file: 'jump.py',                // shown as the active tab / run command
  fps: 24,
  bpm: 120,                       // 1 beat = 12 frames at 24 fps → cut on multiples of 6
  layout: 'showcase',             // 'showcase' = 1920x1080 code panel + film · 'film' = 1080x1080 film only
  badge: { title: 'JUMP', sub: 'CODE MOTION · VOL.01', bg: 'YELLOW' },
  countdownLabel: 'JMP-01 LAUNCH',
  palette: {},                    // override/add colors, e.g. { RED: '#FF3B30', MINT: '#7FFFD4' }
  fonts: {},                      // override font stacks: { display, cjk, mono, emoji }
  assetDir: 'assets/',
  assets: ['cat_color.jpg','cat_ht.jpg','cat_duo.jpg','cateye0.jpg','cateye1.jpg','cateye0_bw.jpg','cateye1_bw.jpg',
           'cateye0_wide.jpg','cateye1_wide.jpg','coffee_cut.png','coffee_ht.jpg','rocket_color.jpg','rocket_duo.jpg',
           'rocket_ht.jpg','hubble.jpg','horse.png','brick.jpg','moon.jpg','coins_ht.jpg'],
};
