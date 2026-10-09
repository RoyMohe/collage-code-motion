#!/usr/bin/env python3
"""Synthesize a beat-synced soundtrack from <project>/timeline.json (written by render.js).
Kick on every beat, clap on 2 & 4, 16th hats, bass pulse, a blip on every cut,
a whoosh before every 'tear' shot, plus per-shot cues from timeline.js SFX.
Drums stop when the last shot starts (finale = chord). Usage: python3 scripts/audio.py <project_dir>"""
import json, sys, os, wave
import numpy as np
proj = sys.argv[1] if len(sys.argv) > 1 else '.'
tl = json.load(open(os.path.join(proj, 'timeline.json')))
FPS, BPM, NF = tl['fps'], tl['bpm'], tl['frames']; SR = 44100; D = NF / FPS; n = int(SR * D)
L = np.zeros(n); R = np.zeros(n); rs = np.random.default_rng(3); fr = lambda f: f / FPS
def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR)
    if i >= n or i < 0: return
    s = sig[:n - i] * g; L[i:i + len(s)] += s * (1 - pan) ** .5; R[i:i + len(s)] += s * (1 + pan) ** .5
def env(d, dec): t = np.arange(int(d * SR)) / SR; return t, np.exp(-t / dec)
def noise(m): return rs.standard_normal(m)
def lp(x, k):
    y = np.zeros_like(x); a = 0.0; kk = np.broadcast_to(k, x.shape)
    for i in range(len(x)): a += kk[i] * (x[i] - a); y[i] = a
    return y
def kick(): t, e = env(.4, .1); f = 48 + 110 * np.exp(-t / .025); return np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * e)
def clap(): t, e = env(.22, .05); return np.diff(noise(len(t)), prepend=0) * e * .55
def hat(): t, e = env(.05, .01); return np.diff(noise(len(t)), prepend=0) * e * .22
def blip(f0=900, d=.1, g=.3): t, e = env(d, d / 3); return np.sin(2 * np.pi * f0 * t * (1 + .6 * np.exp(-t / .015))) * e * g
def whoosh(d=.3): t = np.arange(int(d * SR)) / SR; return lp(noise(len(t)), np.linspace(.02, .5, len(t))) * np.sin(np.pi * t / d) ** 2 * 1.4
def boom(): t, e = env(1.0, .3); f = 32 + 80 * np.exp(-t / .05); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 1.2 + noise(len(t)) * np.exp(-t / .03) * .5) * e
def bass(f0, d): t = np.arange(int(d * SR)) / SR; e = np.minimum(1, t / .005) * np.exp(-t / .18); return lp(np.sign(np.sin(2 * np.pi * f0 * t)), .08) * e * .5
def scratch(): t = np.arange(int(.18 * SR)) / SR; f = 300 + 900 * np.abs(np.sin(t * 40)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * lp(noise(len(t)), .3) * 3 * np.exp(-t / .08)
def rise(d=.75): t = np.arange(int(d * SR)) / SR; return lp(noise(len(t)), np.linspace(.02, .6, len(t))) * np.linspace(0, 1, len(t)) ** 2 * 1.5
def chord(): t = np.arange(int(3 * SR)) / SR; return sum(np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t) for f in [220, 277.2, 329.6, 440]) * np.exp(-t / 1.1) * .16
shots = tl['shots']; beat = 60 / BPM; end_t = fr(shots[-1]['a']) if len(shots) > 1 else D
b = 0
while b * beat < min(end_t, D):
    t = b * beat; add(kick(), t, 0, .95)
    if b % 2: add(clap(), t, .1, .85)
    for h in range(4): add(hat(), t + h * beat / 4, (-.4, .4)[h % 2], .5 + .5 * (h == 2))
    nf = [55, 55, 82.4, 73.4][b % 4] * (1 if t < D / 2 else 1.122); add(bass(nf, .24), t); add(bass(nf * 2, .12), t + beat / 2, 0, .6)
    b += 1
for i, s in enumerate(shots):
    t0 = fr(s['a'])
    if i: add(blip(500 + (s['a'] % 7) * 90, .07, .18), t0, ((s['a'] % 5) - 2) * .2)
    if s.get('trans') == 'tear': add(whoosh(.25), t0 - .12, .3, .9)
    for cue in s.get('sfx', []):
        d, kind, *a = cue; t = fr(s['a'] + d)
        if kind == 'blip': add(blip(a[0] if a else 900, .4, .2), t)
        elif kind == 'beep': add(blip(a[0] if a else 880, .22, .35), t)
        elif kind == 'whoosh': add(whoosh(.4), t - .1, 0, 1)
        elif kind == 'boom': add(boom(), t)
        elif kind == 'scratch': add(scratch(), t, 0, .6)
        elif kind == 'rise': add(rise(), t)
        elif kind == 'chord': add(chord(), t); add(kick(), t); add(boom() * .6, t)
        elif kind == 'ticks':
            cnt, ev = (a + [8, 1])[:2]
            for k in range(int(cnt)): add(blip(1000 + k * 60, .05, .16), fr(s['a'] + d + k * ev), ((k % 3) - 1) * .5)
        elif kind == 'roll':
            cnt, ev = (a + [12, 2])[:2]
            for k in range(int(cnt)): add(clap() * .7, fr(s['a'] + d + k * ev), ((k % 2) - .5) * .6, .5 + k * .04)
mx = np.max(np.abs(np.r_[L, R])) or 1; L /= mx * 1.08; R /= mx * 1.08
fl = int(.35 * SR); L[-fl:] *= np.linspace(1, 0, fl); R[-fl:] *= np.linspace(1, 0, fl)
w = wave.open(os.path.join(proj, 'audio.wav'), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes()); w.close(); print('wrote', os.path.join(proj, 'audio.wav'))
