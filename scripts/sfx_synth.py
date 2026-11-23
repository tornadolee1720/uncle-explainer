# -*- coding: utf-8 -*-
"""合成幾樣基礎音效（不用下載、沒有版權問題）：python sfx_synth.py <輸出目錄>
  whoosh_soft.wav  軟風聲 0.45 秒：轉場（推滿屏、她縮排圓窗/豎窗、長回全屏、圖形往下掉）
  whoosh_up.wav    往上揚的風聲 0.6 秒：身後換世界（巨字長出來那一下）
  impact_low.wav   低沉的撞擊 1.2 秒：決定性的大數字落定（-6.9%）
  tick_soft.wav    很輕的"嗒" 0.12 秒：東西掛上牆、卡片亮起、熒光筆刷過
口味照 audio.md：軟 whoosh、低沉撞擊；不用金幣、收銀機、卡通音。"""
import sys, wave
from pathlib import Path
import numpy as np
SR = 48000
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)

def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(str(out / name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())

def bandnoise(n, f_lo, f_hi):
    """頻率隨時間掃過的帶通噪聲（FFT 分塊做，每塊一個通帶）"""
    x = rng.standard_normal(n); y = np.zeros(n); blk = 1024; win = np.hanning(blk * 2)
    for i in range(0, n - blk, blk):
        seg = x[i:i + blk * 2] if i + blk * 2 <= n else np.pad(x[i:], (0, i + blk * 2 - n))
        F = np.fft.rfft(seg * win); fr = np.fft.rfftfreq(blk * 2, 1 / SR); k = i / n
        lo, hi = f_lo(k), f_hi(k); F[(fr < lo) | (fr > hi)] *= 0.05
        y[i:i + blk * 2] += np.fft.irfft(F)[: min(blk * 2, n - i)]
    return y

def env(n, a, peak_at):
    t = np.linspace(0, 1, n); p = peak_at
    return np.where(t < p, (t / p) ** a, np.exp(-(t - p) / (1 - p) * 4.5))

n = int(.45 * SR); w = bandnoise(n, lambda k: 300 + 900 * k, lambda k: 1800 + 4200 * k) * env(n, 2.2, .55)
pan = np.linspace(-.35, .35, n); save('whoosh_soft.wav', np.stack([w * (1 - pan), w * (1 + pan)], 1))

n = int(.6 * SR); w = bandnoise(n, lambda k: 200 + 1400 * k, lambda k: 1200 + 7000 * k) * env(n, 2.8, .78)
save('whoosh_up.wav', w)

n = int(1.2 * SR); t = np.arange(n) / SR
f = 46 + 70 * np.exp(-t * 18); ph = 2 * np.pi * np.cumsum(f) / SR
body = np.sin(ph) * np.exp(-t * 3.2) + 0.35 * np.sin(2 * ph) * np.exp(-t * 6)
click = bandnoise(n, lambda k: 80, lambda k: 2500) * np.exp(-t * 60) * .5
save('impact_low.wav', body + click)

n = int(.12 * SR); t = np.arange(n) / SR
tick = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 70) * .6 + bandnoise(n, lambda k: 1500, lambda k: 6000) * np.exp(-t * 90) * .4
save('tick_soft.wav', tick)
print('寫好', ', '.join(p.name for p in sorted(out.glob('*.wav'))), '→', out)
