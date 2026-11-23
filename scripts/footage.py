# -*- coding: utf-8 -*-
"""素材工具：找片 → 下片 → 看片 → 挑入點 → 抽幀 → 剪原聲。每一步都是看過才往下走。

  python footage.py search "NVIDIA Blackwell b-roll" [-n 8]        # YouTube 搜尋：id | 時長 | 頻道 | 標題（優先官方頻道）
  python footage.py get <id或url> [--section 01:11:40-01:12:12] [--audio] [-o 名字]   # 1080p 下載；只要一段就 --section；--audio 只下音訊
  python footage.py sheet <影片> [--step 2] [--from 0 --to 60]      # 帶時間碼的聯絡表 → sheets/<名>.jpg，用眼睛挑鏡頭
  python footage.py scenes <影片> [--from 0 --to 60] [--th .3]      # 鏡頭切點：入點出點都要落在同一個鏡頭裡
  python footage.py extract clips.json [名字…]                      # 抽成 30fps 幀序列 film/assets/clips/<名>/0001.jpg，輸出幀數
  python footage.py wave <音訊或影片> <起秒> <止秒>                 # 每 50ms 的響度/峰值：找原聲開口、句尾、數字靜音、爆音

clips.json：{"out": "film/assets/clips", "clips": {"jensen_gtc": ["src.mp4", 59.6, 2.4], "bite": ["src.mp4", 101.6, 1.95, {"zoom": 1.2, "ax": .85, "ay": 0}]}}
  zoom/ax/ay：放大裁掉臺標或角標，ax/ay 是保留的錨點（0 左/上，1 右/下）

踩過的坑：
- yt-dlp 過 90 天就會被 YouTube 403，先 pip install -U yt-dlp。
- --section 下的片段偶爾音軌有解碼錯誤（ffmpeg 報 aac decode_band_types），原聲一定用 wave 查一遍；壞了就 --audio 單獨再下。
- Whisper 給的詞時間會提前或推後零點幾秒，原聲的入點出點以 wave 為準：開口前留 0.05 秒，句尾等最後一個字的能量落下去。
- 原片裡可能有一段數字靜音（-80dB 以下），截進去會突然“斷電”，聽著像異響。
- 抽幀的出點別壓在鏡頭切點上，最後一幀會露出下一個鏡頭；停住時就停在這最後一幀上。
"""
import json, subprocess, sys
from pathlib import Path

def run(cmd, **kw): return subprocess.run(cmd, **kw)
def ffdur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]))
def opt(name, default=None, cast=str):
    a = sys.argv
    return cast(a[a.index(name) + 1]) if name in a else default

cmd = sys.argv[1] if len(sys.argv) > 1 else ''
if cmd == 'search':
    q, n = sys.argv[2], opt('-n', 8, int)
    run(['yt-dlp', '--flat-playlist', '--no-warnings', '--print', '%(id)s | %(duration_string)s | %(channel)s | %(title)s', f'ytsearch{n}:{q}'])
elif cmd == 'get':
    vid = sys.argv[2]; url = vid if vid.startswith('http') else f'https://www.youtube.com/watch?v={vid}'
    name = opt('-o', vid if not vid.startswith('http') else 'clip')
    fmt = 'bestaudio[ext=m4a]/bestaudio' if '--audio' in sys.argv else 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]'
    c = ['yt-dlp', '-f', fmt, '-o', f'{name}.%(ext)s', '--no-warnings']
    if opt('--section'): c += ['--download-sections', '*' + opt('--section')]
    run(c + [url])
elif cmd == 'sheet':
    f = Path(sys.argv[2]); a, b = opt('--from', 0.0, float), opt('--to', None, float); d = (b or ffdur(f)) - a
    step = opt('--step', max(1.0, round(d / 48, 1)), float); n = int(d / step) + 1; cols = 8; rows = (n + cols - 1) // cols
    Path('sheets').mkdir(exist_ok=True); out = Path('sheets') / f'{f.stem}_{int(a)}.jpg'
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-t', str(d), '-i', str(f), '-vf',
         f"fps=1/{step},scale=320:-2,drawtext=text='%{{pts\\:hms}}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile={cols}x{rows}",
         '-frames:v', '1', str(out)], stderr=subprocess.DEVNULL)
    print(out, f'（時間碼從 {a} 秒起算）')
elif cmd == 'scenes':
    f = sys.argv[2]; a, b, th = opt('--from', 0.0, float), opt('--to', None, float), opt('--th', .3, float)
    c = ['ffmpeg', '-hide_banner', '-ss', str(a)] + (['-t', str(b - a)] if b else []) + ['-i', f, '-vf', f"scale=320:-2,select='gt(scene,{th})',showinfo", '-an', '-f', 'null', '-']
    err = subprocess.run(c, capture_output=True, text=True, errors='replace').stderr
    ts = [a + float(x.split('pts_time:')[1].split()[0]) for x in err.splitlines() if 'pts_time:' in x]
    print('切點：', ' '.join(f'{t:.2f}' for t in ts) or '（這段裡沒有切點，是一整個鏡頭）')
elif cmd == 'extract':
    cfg = json.loads(Path(sys.argv[2]).read_text('utf-8')); base = Path(sys.argv[2]).parent; out = base / cfg.get('out', 'film/assets/clips')
    only = sys.argv[3:]; counts = {}
    for name, spec in cfg['clips'].items():
        if only and name not in only: continue
        src, t, d = spec[:3]; o = spec[3] if len(spec) > 3 else {}; z, ax, ay = o.get('zoom', 1), o.get('ax', .5), o.get('ay', .5)
        dst = out / name; dst.mkdir(parents=True, exist_ok=True)
        for p in dst.glob('*.jpg'): p.unlink()
        vf = (f'crop=iw/{z}:ih/{z}:(iw-iw/{z})*{ax}:(ih-ih/{z})*{ay},' if z != 1 else '') + 'scale=1920:1080:flags=lanczos,fps=30'
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', str(base / src), '-t', f'{d:.3f}', '-vf', vf, '-q:v', '3', str(dst / '%04d.jpg')], check=True)
        counts[name] = len(list(dst.glob('*.jpg'))); print(name, counts[name], '幀')
    cp = out / 'counts.json'; old = json.loads(cp.read_text()) if cp.exists() else {}; old.update(counts); cp.write_text(json.dumps(old, indent=1))
elif cmd == 'wave':
    import numpy as np
    f, a, b = sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-t', str(b - a), '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float) / 32768; w = 800
    for i in range(0, len(x) - w, w):
        s = x[i:i + w]; r = 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9); p = 20 * np.log10(np.abs(s).max() + 1e-9)
        tag = '  數字靜音' if r < -75 else '  爆音?' if p > -3 else ''
        print(f'{a + i / 16000:7.2f}  rms {r:6.1f}  pk {p:6.1f}  ' + '#' * max(0, int((r + 60) / 2)) + tag)
else:
    print(__doc__)
