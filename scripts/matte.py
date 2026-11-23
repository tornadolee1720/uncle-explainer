# -*- coding: utf-8 -*-
"""實拍逐幀摳人（人摳像壓巨字、人身後換背景用）。輸出帶透明的 PNG 序列 + box.json。
要 onnxruntime-gpu（或 onnxruntime）+ numpy + Pillow；模型用 rembg 下載好的 onnx（~/.rembg/models/<名>/<名>.onnx）。
  python matte.py 幀目錄 輸出目錄 [--m isnet-general-use] [--w 1920] [--from 12] [--to 160]
    幀目錄：0001.jpg… 30fps（footage.py extract 抽出來的）
    --m   isnet-general-use（預設，GPU 上約 0.25 秒/幀，邊緣夠用）| birefnet-portrait（頭髮更乾淨，但 8GB 影片記憶體的卡上 10 秒以上一幀）
    --from/--to 只摳這一段（含兩端，按幀號）。先看下面的切點提示再定
摳完接著跑 matte_clean.py（去掉細線、椅背這類零碎，算每幀頭肩的中心）。
注意：
  - 原片裡藏著切點（採訪片常常前幾幀還是主持人），會一起被摳出來。指令碼會提示可疑的切點，按提示用 --from 跳過。
  - 時間上做了 1:2:1 平滑，只作用在半透明邊緣，實心區域不糊。
  - 只存整段人物外框（所有幀的並集）那一塊，偏移寫進 box.json。"""
import sys, os, glob, time, json
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
try:
    import onnxruntime as ort
    if hasattr(ort, 'preload_dlls'): ort.preload_dlls()      # GPU 版要先載 CUDA/cuDNN 的 DLL，不然會悄悄跑在 CPU 上
except ImportError:
    sys.exit('要 onnxruntime-gpu（或 onnxruntime）')
import numpy as np
from PIL import Image
a = sys.argv
src, dst = a[1], a[2]; os.makedirs(dst, exist_ok=True)
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
W = opt('--w', 1920); name = opt('--m', 'isnet-general-use'); f0 = opt('--from', 1); f1 = opt('--to', 10 ** 9)
M = os.path.join(os.path.expanduser('~'), '.rembg', 'models', name, name + '.onnx')
if not os.path.exists(M):
    sys.exit(f'沒找到模型 {M}：先跑一次 `python -c "from rembg import new_session; new_session(\'{name}\')"` 讓 rembg 下載')
so = ort.SessionOptions(); so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
prov = [('CUDAExecutionProvider', {'cudnn_conv_algo_search': 'HEURISTIC', 'arena_extend_strategy': 'kSameAsRequested'}), 'CPUExecutionProvider']
s = ort.InferenceSession(M, so, providers=prov); inp = s.get_inputs()[0]
R = inp.shape[2] if isinstance(inp.shape[2], int) else 1024
print('providers', s.get_providers()[0], 'input', R)
if 'isnet' in name: mean, std = np.array([.5, .5, .5], np.float32), np.ones(3, np.float32)
else: mean, std = np.array([.485, .456, .406], np.float32), np.array([.229, .224, .225], np.float32)
files = sorted(glob.glob(os.path.join(src, '*.jpg')))
# 切點提示
prev = None; sus = []
for i, f in enumerate(files):
    g = np.asarray(Image.open(f).convert('L').resize((160, 90)), np.int16)
    if prev is not None and np.abs(g - prev).mean() > 12: sus.append(i + 1)
    prev = g
if sus: print('可疑切點（這一幀和上一幀差很多，可能是換鏡頭）:', sus)
files = [f for f in files if f0 <= int(os.path.basename(f)[:-4]) <= f1]
alphas = []; t0 = time.time()
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB')
    x = (np.asarray(im.resize((R, R), Image.BICUBIC), np.float32) / 255 - mean) / std
    y = s.run(None, {inp.name: x.transpose(2, 0, 1)[None]})[0][0, 0]
    al = (y - y.min()) / max(1e-6, y.max() - y.min()) if 'isnet' in name else 1 / (1 + np.exp(-y))
    alphas.append(np.asarray(Image.fromarray((al * 255).astype(np.uint8)).resize(im.size, Image.BICUBIC), np.float32) / 255)
    if i == 2: print('秒/幀', round((time.time() - t0) / 3, 3), flush=True)
sm = []
for i in range(len(files)):
    al = alphas[i]; p = alphas[max(0, i - 1)]; n = alphas[min(len(files) - 1, i + 1)]
    edge = (al > .03) & (al < .97); sm.append(np.where(edge, (p + 2 * al + n) / 4, al))
U = np.max(np.stack([x > .05 for x in sm]), axis=0); ys, xs = np.where(U)
H0, W0 = U.shape; m = 24
x0, x1, y0, y1 = max(0, xs.min() - m), min(W0, xs.max() + m), max(0, ys.min() - m), min(H0, ys.max() + m)
k = W / W0
for i, f in enumerate(files):
    rgba = np.dstack([np.asarray(Image.open(f).convert('RGB')), (np.clip(sm[i], 0, 1) * 255).astype(np.uint8)])[y0:y1, x0:x1]
    Image.fromarray(rgba, 'RGBA').resize((round((x1 - x0) * k), round((y1 - y0) * k)), Image.LANCZOS).save(os.path.join(dst, f'{i + 1:04d}.png'), compress_level=3)
json.dump({'src_w': W0, 'src_h': H0, 'scale': k, 'x': round(x0 * k), 'y': round(y0 * k), 'w': round((x1 - x0) * k), 'h': round((y1 - y0) * k),
           'frames': len(files), 'from': f0}, open(os.path.join(dst, 'box.json'), 'w'))
print(len(files), '幀', round(time.time() - t0, 1), '秒 →', dst)
