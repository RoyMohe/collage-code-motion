#!/usr/bin/env python3
"""Turn any photo / AI-generated image into collage-ready assets.

Usage:
  python3 scripts/prep_assets.py <image> --out <project>/assets [--name cat] [--crop x,y,w,h] [--width 900]
        --treat color bw halftone duotone:#3a0a2a:#FF8FB1 circle silhouette cutout

Treatments (one output file each, named <name>_<treat>.jpg|png; 'color' → <name>.jpg):
  color        resized original (+ light unsharp)            → <name>.jpg
  bw           high-contrast black & white with film grain     → <name>_bw.jpg
  halftone[:N] newsprint dot screen, N = dot pitch (default 7) → <name>_ht.jpg
  duotone:D:L  map shadows→D, highlights→L (hex colors)        → <name>_duo.jpg
  circle[:cx,cy,r] circular cut-out with alpha (sticker/plate)  → <name>_circle.png
  silhouette   dark subject on light bg → solid black w/ alpha → <name>_sil.png
  cutout       light/white background removed (threshold)      → <name>_cut.png
--crop is applied first (source pixels), e.g. an eye: --crop 120,60,190,136.
The asset key used in timeline.js is the filename without extension (IMG['cat_duo']).
"""
import argparse, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps

def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)
def grainy(im, amt=12):
    a = np.asarray(im.convert('RGB')).astype(float); a += np.random.default_rng(1).normal(0, amt, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def duotone(im, dark, light, contrast=1.4):
    g = ImageEnhance.Contrast(ImageOps.autocontrast(im.convert('L'), cutoff=1)).enhance(contrast); a = np.asarray(g) / 255.0
    d, l = hexrgb(dark), hexrgb(light); return Image.fromarray((d + (l - d) * a[..., None]).astype(np.uint8))
def halftone(im, step=7, ink=(20, 20, 20), paper=(242, 235, 221), angle=15, scale=3):
    g = ImageOps.autocontrast(im.convert('L'), cutoff=1).filter(ImageFilter.GaussianBlur(step / 3))
    W, H = g.size; a = np.asarray(g) / 255.0; big = Image.new('RGB', (W * scale, H * scale), paper); d = ImageDraw.Draw(big)
    c, s = np.cos(np.radians(angle)), np.sin(np.radians(angle)); R = int((W + H) / step) + 2
    for v in range(-R, R):
        for u in range(-R, R):
            X = (u * c - v * s) * step; Y = (u * s + v * c) * step
            if not (0 <= X < W and 0 <= Y < H): continue
            r = ((1 - a[int(Y), int(X)]) ** 0.9) * step * 0.72
            if r >= 0.35: d.ellipse([(X - r) * scale, (Y - r) * scale, (X + r) * scale, (Y + r) * scale], fill=ink)
    return big.resize((W, H), Image.LANCZOS)

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('image'); ap.add_argument('--out', required=True); ap.add_argument('--name')
ap.add_argument('--crop'); ap.add_argument('--width', type=int, default=900)
ap.add_argument('--treat', nargs='+', default=['color'])
A = ap.parse_args(); os.makedirs(A.out, exist_ok=True)
name = A.name or os.path.splitext(os.path.basename(A.image))[0]
im = Image.open(A.image); im = ImageOps.exif_transpose(im).convert('RGBA')
if A.crop: x, y, w, h = map(int, A.crop.split(',')); im = im.crop((x, y, x + w, y + h))
im = im.resize((A.width, round(im.height * A.width / im.width)), Image.LANCZOS if A.width < im.width else Image.BICUBIC)
rgb = Image.new('RGB', im.size, 'white'); rgb.paste(im, mask=im.split()[3]); rgb = rgb.filter(ImageFilter.UnsharpMask(2, 80, 2))
for t in A.treat:
    k, *args = t.split(':')
    if k == 'color': p = f'{name}.jpg'; rgb.save(os.path.join(A.out, p), quality=92)
    elif k == 'bw': p = f'{name}_bw.jpg'; grainy(ImageEnhance.Contrast(ImageOps.grayscale(rgb)).enhance(1.6), 14).save(os.path.join(A.out, p), quality=92)
    elif k == 'halftone': p = f'{name}_ht.jpg'; halftone(rgb, int(args[0]) if args else 7).save(os.path.join(A.out, p), quality=92)
    elif k == 'duotone':
        dk, lt = (args + ['#2a0a12', '#FF8FB1'])[:2]; p = f'{name}_duo.jpg'; duotone(rgb, dk, lt).save(os.path.join(A.out, p), quality=92)
    elif k == 'circle':
        W, H = rgb.size
        cx, cy, r = (map(int, args[0].split(',')) if args else (W // 2, H // 2, min(W, H) // 2))
        m = Image.new('L', rgb.size, 0); ImageDraw.Draw(m).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
        o = rgb.copy(); o.putalpha(m); p = f'{name}_circle.png'; o.crop((cx - r, cy - r, cx + r, cy + r)).save(os.path.join(A.out, p))
    elif k == 'silhouette':
        g = np.asarray(ImageOps.autocontrast(rgb.convert('L'))).astype(float); a = np.clip((200 - g) * 2.5, 0, 255).astype(np.uint8)
        o = Image.new('RGBA', rgb.size, (10, 10, 10, 255)); o.putalpha(Image.fromarray(a).filter(ImageFilter.GaussianBlur(.7))); p = f'{name}_sil.png'; o.save(os.path.join(A.out, p))
    elif k == 'cutout':
        if im.split()[3].getextrema()[0] < 255: o = im
        else:
            g = np.asarray(rgb.convert('L')).astype(float); a = np.clip((245 - g) * 6, 0, 255).astype(np.uint8)
            o = rgb.copy(); o.putalpha(Image.fromarray(a).filter(ImageFilter.GaussianBlur(1)))
        p = f'{name}_cut.png'; o.save(os.path.join(A.out, p))
    else: raise SystemExit(f'unknown treatment {t}')
    print(f'  {p}  →  IMG[{os.path.splitext(p)[0]!r}]  (add "{p}" to CONFIG.assets)')
