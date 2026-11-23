# -*- coding: utf-8 -*-
"""從一幀畫面裡挑強調色（給 KIT_VPRO.theme({accent}) 用）：python pick_accent.py <圖> [<圖> ...]
有口播：給她的一兩幀（assets/clips/host/0100.jpg）。沒有口播：給主圖。
做法：看畫面中間偏下那一塊（她的衣服一般在這），把有顏色的畫素按色相分堆，報最大的三堆；
每堆給一個"原色"和一個"能當強調色用的"（提亮、飽和度拉到夠在深色卡上看清）。挑和主體最貼的那個，不要挑膚色和木頭色（橙棕）。"""
import sys, colorsys
import numpy as np
from PIL import Image


def pick(path):
    im = Image.open(path).convert('RGB'); im.thumbnail((480, 480)); a = np.asarray(im, np.float32) / 255
    h, w, _ = a.shape; reg = a[int(h * .42):int(h * .9), int(w * .2):int(w * .8)].reshape(-1, 3)
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in reg[::3]])
    keep = hsv[(hsv[:, 1] > .14) & (hsv[:, 2] > .22) & (hsv[:, 2] < .95)]
    if len(keep) < 50: return []
    bins = (keep[:, 0] * 24).astype(int) % 24; out = []
    for b in np.argsort(-np.bincount(bins, weights=keep[:, 1], minlength=24))[:3]:
        g = keep[bins == b]; share = len(g) / len(keep)
        if share < .06: continue
        hh, ss, vv = np.median(g[:, 0]), np.median(g[:, 1]), np.median(g[:, 2])
        ha = hh + (.67 - hh) * .6 if .70 < hh < .95 else hh          # 紫紅往藍紫收一檔：參考片的強調色偏冷，粉紫顯得甜
        raw = colorsys.hsv_to_rgb(hh, ss, vv); acc = colorsys.hsv_to_rgb(ha, min(.62, max(.42, ss * 1.5)), .93)
        hx = lambda c: '#' + ''.join(f'{round(x * 255):02x}' for x in c)
        skin = .02 < hh < .12
        out.append((share, hx(raw), hx(acc), '（像膚色或木頭色，一般不選）' if skin else ''))
    return out


for p in sys.argv[1:]:
    print(p)
    for share, raw, acc, note in pick(p) or [(0, '-', '-', '畫面裡沒什麼顏色：用預設的 #8a86ee，或自己定一個冷色')]:
        print(f'  佔 {share:4.0%}  原色 {raw}  →  強調色 {acc}  {note}')
