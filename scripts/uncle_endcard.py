"""目鏡大叔固定品牌結尾卡：做一段 1.5 秒的結尾 MP4，接到成片後面。

用法：
  python scripts/uncle_endcard.py <成片.mp4> <輸出.mp4> --line "一句重點" [--sec 1.5] [--font 字型路徑]

畫面每支都一樣：海軍藍 #18263A 全螢幕、置中米白細線眼鏡圖示、
「我是驗光師」米白中字、黃色 #FFD45C 大字「目鏡大叔」、灰色一句重點。不放店名。
"""
import argparse, subprocess, tempfile, os, glob
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
NAVY, INK, YEL, GREY = '#18263A', '#F5F1E6', '#FFD45C', '#9aa6b8'


def find_font(weight):
    pats = {'black': ['*NotoSansTC-Black*', '*NotoSansCJK-Black*'],
            'medium': ['*NotoSansTC-Medium*', '*NotoSansCJK-Medium*', '*NotoSansTC-Regular*', '*NotoSansCJK-Regular*']}[weight]
    roots = ['fonts', '/usr/share/fonts', os.path.expanduser('~/.fonts'), '/Library/Fonts', 'C:/Windows/Fonts']
    for r in roots:
        for p in pats:
            hit = glob.glob(os.path.join(r, '**', p), recursive=True)
            if hit:
                return hit[0]
    raise SystemExit('找不到 Noto Sans TC 字型，請用 --font 指定')


def font(path, size, ttc_tc=True):
    # NotoSansCJK 的 .ttc 裡 TC 是第 2 個（index 2）
    idx = 2 if path.lower().endswith('.ttc') else 0
    f = ImageFont.truetype(path, size, index=idx)
    try:  # CI 的 Noto Sans TC 是可變字型，預設 Thin；依檔名套用正確字重
        f.set_variation_by_name('Black' if 'Black' in os.path.basename(path) else 'Medium')
    except Exception:
        pass
    return f


def card(line, fblack, fmed):
    im = Image.new('RGB', (W, H), NAVY)
    d = ImageDraw.Draw(im)
    cx, cy, r = W // 2, 700, 92
    for dx in (-130, 130):
        d.ellipse([cx + dx - r, cy - r, cx + dx + r, cy + r], outline=INK, width=8)
    d.arc([cx - 46, cy - 40, cx + 46, cy + 30], 200, 340, fill=INK, width=8)
    d.line([cx - 130 - r, cy - 10, cx - 300, cy - 40], fill=INK, width=8)
    d.line([cx + 130 + r, cy - 10, cx + 300, cy - 40], fill=INK, width=8)

    def center(text, f, y, col):
        w = d.textlength(text, font=f)
        d.text((cx - w / 2, y), text, font=f, fill=col)
    center('我是驗光師', font(fmed, 64), 880, INK)
    center('目鏡大叔', font(fblack, 176), 975, YEL)
    if line:
        center(line, font(fmed, 54), 1250, GREY)
    return im


def main():
    a = argparse.ArgumentParser()
    a.add_argument('src'); a.add_argument('out')
    a.add_argument('--line', default=''); a.add_argument('--sec', type=float, default=1.5)
    a.add_argument('--font', default=None)
    o = a.parse_args()
    fb = o.font or find_font('black'); fm = o.font or find_font('medium')
    with tempfile.TemporaryDirectory() as t:
        png = os.path.join(t, 'card.png'); card(o.line, fb, fm).save(png)
        end = os.path.join(t, 'end.mp4')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', str(o.sec), '-i', png,
                        '-f', 'lavfi', '-t', str(o.sec), '-i', 'anullsrc=r=48000:cl=stereo',
                        '-vf', 'fps=30,format=yuv420p,fade=in:st=0:d=0.25', '-c:v', 'libx264', '-c:a', 'aac',
                        '-shortest', end], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', o.src, '-i', end, '-filter_complex',
                        '[0:v]fps=30,scale=1080:1920,format=yuv420p,setsar=1[v0];[1:v]setsar=1[v1];'
                        '[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];[1:a]aformat=channel_layouts=stereo[a1];'
                        '[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]', '-map', '[v]', '-map', '[a]',
                        '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-c:a', 'aac', o.out], check=True)
    print('完成：', o.out)


if __name__ == '__main__':
    main()
