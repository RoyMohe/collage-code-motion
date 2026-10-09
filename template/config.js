// Starter project — copy this folder, then edit config.js + timeline.js.
const CONFIG = {
  brand: 'BREW',
  project: 'brew_vol01',
  file: 'brew.py',
  fps: 24,
  bpm: 120,
  layout: 'showcase',            // or 'film' for a clean 1080x1080 film without the code panel
  badge: { title: 'BREW', sub: 'CODE MOTION · VOL.01', bg: 'YELLOW' },
  palette: { RED: '#D7262B', CREAM: '#F4EDE1' },
  fonts: {},
  // Swap the hero for every preset: any (g, x, y, scale, palette, opts) drawing function.
  hero: (g, x, y, s, pal, o = {}) => emoji(g, '☕', x, y, 430 * s * (o.sy || 1), o.rot || 0),
  assetDir: 'assets/',
  assets: [],                    // e.g. ['product.jpg', 'product_duo.jpg'] made with scripts/prep_assets.py
};
