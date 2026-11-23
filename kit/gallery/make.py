# -*- coding: utf-8 -*-
"""重出模板相簿：兩個示例片裡每個場景截一幀（<場景名>.jpg，640×360），再拼一張總覽 00_sheet.jpg。產物已經提交在這個目錄裡。
  node scripts/new_film.mjs <目錄1> --demo        # 先建好兩個示例片（建過的用 --sync 更新到最新 kit）
  node scripts/new_film.mjs <目錄2> --demo2
  python kit/gallery/make.py <目錄1> <目錄2>
kit 改了畫風、改了示例片就重跑一次。截哪一刻：AT 裡寫了的場景取那一鏡的幾成處（東西出齊、拎出來的那一下），沒寫的取中間。
只要 node（render.mjs 用的 Playwright），不用 ffmpeg。"""
import json, os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
G = os.path.dirname(os.path.abspath(__file__))
RENDER = os.path.join(os.path.dirname(os.path.dirname(G)), 'scripts', 'render.mjs')
TW, TH = 640, 360

AT = {'discs': .93, 'number': .95, 'frames': .9, 'versus': .95, 'article': .93, 'chart': .6, 'share': .93, 'cards3d': .93,
      'ranking': .95, 'bars': .93, 'desk': .45, 'equation': .96, 'profile': .96, 'quote': .95, 'change': .96, 'stats': .96,
      'compare': .96, 'headlines': .6, 'device': .71, 'statement': .96}
SKIP = {'custom'}
# 總覽的順序和短名：跟 kit/README.md「選場景」的五組一樣
ORDER = [('number', '一個數'), ('equation', '算一筆賬'), ('change', '從多少變多少'), ('stats', '幾個數排開'), ('bars', '柱子對比'),
         ('versus', '真實比例的反差'), ('chart', '圖表'), ('share', '佔比'), ('ranking', '排行榜'), ('compare', '逐項對比'),
         ('discs', '幾家並列'), ('network', '關係網'), ('flow', '流程'), ('timeline', '時間線'), ('map', '地圖'), ('cards3d', '拎出一個'),
         ('person', '人站在巨字前'), ('profile', '人物出場'), ('quote', '原話'),
         ('footage', '全屏實拍'), ('montage', '釘住換實拍'), ('frames', '畫框並列'), ('article', '原文刷黃'), ('desk', '新聞桌面'),
         ('popup', '反應窗'), ('headlines', '標題牆'), ('device', '產品介面'),
         ('title', '片名'), ('agenda', '目錄'), ('statement', '金句'), ('flash', '開頭快閃')]


def node(*a):
    r = subprocess.run(['node', RENDER, *a], capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        print(r.stdout[-3000:], r.stderr[-3000:]); sys.exit(r.returncode)


def font(px):
    for p in ('C:/Windows/Fonts/msjhbd.ttc', 'C:/Windows/Fonts/msjh.ttc', '/System/Library/Fonts/PingFang.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'):
        if os.path.exists(p):
            return ImageFont.truetype(p, px)
    return ImageFont.load_default()


if len(sys.argv) < 2:
    print(__doc__); sys.exit(1)
done = {}
for d in sys.argv[1:]:
    tmp = tempfile.mkdtemp(prefix='gallery_')
    node('--dir', d, '--check', '--out', tmp)
    shots = json.load(open(os.path.join(tmp, 'check.json'), encoding='utf-8'))['shots']
    pick = []
    for s in shots:
        sc = s['scene']
        if sc in SKIP or sc in done or any(sc == p[0] for p in pick):
            continue
        pick.append((sc, round(s['t0'] + AT.get(sc, .5) * (s['t1'] - s['t0']), 2)))
    node('--dir', d, '--stills', ','.join(f'{t:.2f}' for _, t in pick), '--h', '720', '--out', tmp)
    for sc, t in pick:
        im = Image.open(os.path.join(tmp, f'still_{t:.2f}.png')).convert('RGB').resize((TW, TH), Image.LANCZOS)
        im.save(os.path.join(G, f'{sc}.jpg'), quality=86)
        done[sc] = t
        print(f'{sc:10s} {t:7.2f} 秒  ← {os.path.basename(os.path.normpath(d))}')
    shutil.rmtree(tmp, ignore_errors=True)

missing = [n for n, _ in ORDER if n not in done]
if missing:
    print('示例片裡沒用到、相簿缺這幾張：', '、'.join(missing))
# 總覽：6 列，每格 320×180，下面一行寫場景名
C, cw, ch, lh = 6, 320, 180, 30
cells = [(n, z) for n, z in ORDER if n in done]
sheet = Image.new('RGB', (C * cw, -(-len(cells) // C) * (ch + lh)), (17, 17, 17))
dr, f = ImageDraw.Draw(sheet), font(17)
for i, (n, z) in enumerate(cells):
    x, y = i % C * cw, i // C * (ch + lh)
    sheet.paste(Image.open(os.path.join(G, f'{n}.jpg')).resize((cw, ch), Image.LANCZOS), (x, y))
    dr.text((x + 10, y + ch + 5), f'{n}  {z}', font=f, fill=(225, 225, 225))
sheet.save(os.path.join(G, '00_sheet.jpg'), quality=84)
print(f'{len(done)} 張 + 00_sheet.jpg → {G}')
