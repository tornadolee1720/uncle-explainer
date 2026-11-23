# -*- coding: utf-8 -*-
"""把一張圖裡的人摳出來，存成透明 PNG：python cut_img.py <圖> <輸出.png> [最長邊，預設 1400]
用的是本機已有的 isnet 模型（和 matte_span.py 同一個），不聯網。"""
import sys, os, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]; mx = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
M = os.path.join(os.path.expanduser('~'), '.rembg', 'models', 'isnet-general-use', 'isnet-general-use.onnx')
s = ort.InferenceSession(M, providers=['CPUExecutionProvider']); inp = s.get_inputs()[0]
im = Image.open(src).convert('RGB')
if max(im.size) > mx:
    k = mx / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
x = (np.asarray(im.resize((1024, 1024), Image.BICUBIC), np.float32) / 255 - .5)
y = s.run(None, {inp.name: x.transpose(2, 0, 1)[None]})[0][0, 0]; y = (y - y.min()) / max(1e-6, y.max() - y.min())
a = Image.fromarray((y * 255).astype(np.uint8)).resize(im.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(.8))
out = im.convert('RGBA'); out.putalpha(a); out.save(dst)
al = np.asarray(a, np.float32) / 255
print(dst, out.size, '人佔畫面 %.0f%%' % (100 * (al > .5).mean()), '半透明邊 %.1f%%' % (100 * ((al > .05) & (al < .95)).mean()))
