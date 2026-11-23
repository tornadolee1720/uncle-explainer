# -*- coding: utf-8 -*-
"""生成 map 場景用的點陣世界地圖（只畫陸地，不畫國界：示意用，避開邊界問題）。產物已經提交，只在改樣式時重跑。
  python kit/assets/make_map.py <world-atlas 的 land-50m.json>
  land-50m.json 來自 npm 包 world-atlas@2（Natural Earth 資料，公有領域）：npm pack world-atlas@2 --registry=https://registry.npmmirror.com
輸出 worldmap.png：等距圓柱投影，經度 -180..180 → x 0..3600，緯度 84..-58 → y 0..1420（每度 10 畫素）。
kit.js 的 KIT.lonlat(lon, lat) 用同一套換算把經緯度變成地圖上的座標。"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

D = os.path.dirname(os.path.abspath(__file__))
PX, LAT0, LAT1 = 10, 84, -58
W, H = 360 * PX, (LAT0 - LAT1) * PX
topo = json.load(open(sys.argv[1], encoding='utf-8'))
sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
arcs = []
for a in topo['arcs']:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def ring(idx):
    out = []
    for i in idx:
        pts = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(pts if not out else pts[1:])
    return out


def to_px(lon, lat):
    return ((lon + 180) * PX, (LAT0 - lat) * PX)


S = 2  # 先畫 2 倍大再縮，邊緣平滑
mask = Image.new('L', (W * S, H * S), 0); d = ImageDraw.Draw(mask)


def unwrap(pts):
    """跨 180° 經線的環：經度連續展開（不然會橫著拉出一條帶子），畫的時候左右各平移一圈"""
    out, off = [], 0
    for i, (lon, lat) in enumerate(pts):
        if i:
            dl = lon + off - out[-1][0]
            if dl > 180: off -= 360
            elif dl < -180: off += 360
        out.append((lon + off, lat))
    return out


for g in topo['objects']['land']['geometries']:
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    for poly in polys:
        for k, r in enumerate(poly):
            ll = unwrap(ring(r))
            for shift in (-360, 0, 360):
                pts = [(x * S, y * S) for x, y in (to_px(lon + shift, lat) for lon, lat in ll)]
                if len(pts) > 2:
                    d.polygon(pts, fill=0 if k else 255)
m = np.asarray(mask.resize((W, H), Image.BILINEAR), np.float32) / 255

# 點陣：每 12 畫素一個點，點在陸地上才畫
step, rad = 12, 3.3
img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(img)
for y in range(step // 2, H, step):
    for x in range(step // 2, W, step):
        if m[y, x] > .5:
            dd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=(196, 212, 230, 190))
img.save(os.path.join(D, 'worldmap.png'), optimize=True)
print('worldmap.png', W, H, os.path.getsize(os.path.join(D, 'worldmap.png')) // 1024, 'KB')
