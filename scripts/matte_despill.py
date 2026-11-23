# -*- coding: utf-8 -*-
"""摳像去色邊（要 opencv）：原片背景的顏色滲進了軟邊（比如會場的藍幕），人一放到別的底上就是一圈藍光，很廉價。
  1. 軟邊換色：邊上的半透明畫素改用離它最近的實心畫素的顏色（從裡往外推），背景色就不在了；
  2. 收邊：alpha 往裡收 choke 畫素再羽化一點，去掉最外面那圈最髒的；比 --thin 細的部分（耳麥、髮絲）不收，免得變成鬼影；
  3. 壓溢色：整個人 B 通道不超過 max(R,G)+spill（藍幕反到臉上、衣服上的那層藍也壓掉）。--spill-ch g 換成壓綠。
不覆蓋原圖：寫到 輸出目錄，box.json 一起拷過去。先看 --check 單幀，再全量跑。
  python matte_despill.py assets/cut/musk_a assets/cut/musk_a_dsp [--choke 2] [--feather 1.5] [--spill 6] [--spill-ch b] [--check 100]
看是不是這個問題：軟邊平均色和實心平均色差很多（musk_a：軟邊 40,45,124，實心 39,33,41）。"""
import sys, glob, json, os, shutil, cv2, numpy as np
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
a = sys.argv; src, dst = a[1], a[2]
opt = lambda k, v, f=float: f(a[a.index(k) + 1]) if k in a else v
CH, FE, SP, CK = opt('--choke', 2, int), opt('--feather', 1.5), opt('--spill', 6), opt('--check', 0, int)
TH = opt('--thin', 11, int)   # 比這個寬度（畫素）細的部分不收邊；0 = 全收
SC = {'b': 0, 'g': 1, 'r': 2}[opt('--spill-ch', 'b', str)]   # OpenCV 是 BGR


def fix(im):
    bgr = im[:, :, :3].astype(np.float32); al = im[:, :, 3].astype(np.float32) / 255; a0 = al.copy(); org = bgr.copy()
    # 細的東西（耳麥、髮絲、話筒杆）：不換色、不收邊，只壓溢色。換色會被塗成旁邊臉的顏色（發灰），收邊會變成半透明的鬼影
    tw = np.zeros_like(al)
    if TH > 0:
        m = (a0 > .5).astype(np.uint8); k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (TH, TH))
        thick = cv2.dilate(cv2.morphologyEx(m, cv2.MORPH_OPEN, k), np.ones((5, 5), np.uint8))
        tw = np.clip(cv2.GaussianBlur(((a0 > .02) & (thick == 0)).astype(np.float32), (0, 0), 2) * 2, 0, 1)
    # 1. 軟邊換色：實心區域（alpha>0.95，再往裡收 2 畫素保險）的顏色往外推，用逐級模糊 + 歸一化填滿軟邊
    solid = cv2.erode((al > .95).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32)
    acc, w = bgr * solid[..., None], solid.copy(); out = bgr.copy(); need = (al > 0) & (al <= .95)
    for r in (3, 7, 15, 31, 63):
        A = cv2.GaussianBlur(acc, (0, 0), r); W = cv2.GaussianBlur(w, (0, 0), r)
        ok = need & (W > 1e-3); out[ok] = A[ok] / W[ok][:, None]; need &= ~ok
        if not need.any(): break
    edge = (al > 0) & (al <= .95); bgr[edge] = out[edge]
    bgr = bgr * (1 - tw[..., None]) + org * tw[..., None]
    # 2. 收邊 + 羽化（細的部分保留原 alpha）
    if CH > 0: al = cv2.erode(al, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * CH + 1, 2 * CH + 1)))
    if FE > 0: al = cv2.GaussianBlur(al, (0, 0), FE)
    al = al * (1 - tw) + a0 * tw
    # 3. 壓溢色
    oth = [c for c in range(3) if c != SC]; lim = np.maximum(bgr[:, :, oth[0]], bgr[:, :, oth[1]]) + SP
    bgr[:, :, SC] = np.minimum(bgr[:, :, SC], lim)
    return np.dstack([np.clip(bgr, 0, 255), np.clip(al * 255, 0, 255)]).astype(np.uint8)


def stats(im):
    al = im[:, :, 3]; e = (al > 25) & (al < 200); s = al > 240
    return im[e][:, :3][:, ::-1].mean(0).round(0), im[s][:, :3][:, ::-1].mean(0).round(0)


os.makedirs(dst, exist_ok=True)
fs = sorted(glob.glob(os.path.join(src, '*.png')))
if CK:
    f = fs[CK - 1]; im = cv2.imread(f, cv2.IMREAD_UNCHANGED); o = fix(im)
    print('改前 軟邊/實心 RGB', *stats(im)); print('改後 軟邊/實心 RGB', *stats(o))
    # 放在紅底上對比（左改前，右改後），看邊
    def on(x, c=(40, 40, 150)):
        bg = np.zeros_like(x[:, :, :3], np.float32); bg[:] = c; al = x[:, :, 3:4].astype(np.float32) / 255
        return (x[:, :, :3] * al + bg * (1 - al)).astype(np.uint8)
    cv2.imwrite(os.path.join(dst, '_check.jpg'), np.hstack([on(im), on(o)])); print('對比圖', os.path.join(dst, '_check.jpg'))
    sys.exit()
for i, f in enumerate(fs):
    cv2.imwrite(os.path.join(dst, os.path.basename(f)), fix(cv2.imread(f, cv2.IMREAD_UNCHANGED)))
    if i % 50 == 0: print(i, '/', len(fs))
shutil.copy(os.path.join(src, 'box.json'), os.path.join(dst, 'box.json'))
print('done', len(fs), '幀 →', dst)
