#!/usr/bin/env python3
"""V4.1 national-myopia composite (INTERNAL, SILENT).
- Keeps 8 native vpro shots untouched (frame-exact trim).
- Redraws 2 ORIGINAL Pillow animations at the physical beat lengths:
  shot 2 classroom (fictional children, backs only, no faces) and
  shot 8 dual-track (two separate axes, 0-100%, never one shared trend line).
- Burns watermark 「研究審核中｜僅供分鏡測試」 + 無聲測試版 when evidence is not verified.
Numbers are read from EVIDENCE_AUDIT.json, never typed here.
"""
import argparse, json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 720, 1280, 30
NAVY, PAPER, YEL = (24, 38, 58), (245, 241, 230), (255, 212, 92)
TEAL, AMBER, GREY = (95, 143, 138), (214, 160, 98), (170, 184, 190)

def font(size, weight='Black'):
    here = Path(__file__).resolve().parents[2]
    for p in [here / 'fonts' / f'NotoSansTC-{weight}.ttf', here / 'fonts' / 'NotoSansTC-Bold.ttf',
              Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc')]:
        if p.is_file():
            f = ImageFont.truetype(str(p), size, index=2 if p.suffix == '.ttc' else 0)
            try: f.set_variation_by_name(weight)  # CI fonts are variable TTFs that default to Thin
            except Exception: pass
            return f
    raise RuntimeError('CJK font missing: run scripts/prepare_ci_fonts_fast.mjs')

def call(argv):
    p = subprocess.run([str(x) for x in argv], capture_output=True, text=True)
    if p.returncode: raise RuntimeError('FFMPEG_BLOCK ' + p.stderr[-1500:])
    return p.stdout

def nframes(f):
    d = json.loads(call(['ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-of', 'json', f]))
    v = [s for s in d['streams'] if s['codec_type'] == 'video']
    if any(s['codec_type'] == 'audio' for s in d['streams']): raise RuntimeError('Must be silent')
    if len(v) != 1 or (v[0]['width'], v[0]['height'], v[0]['r_frame_rate']) != (W, H, '30/1'):
        raise RuntimeError('Need 720x1280 30fps H264: ' + str(f))
    return int(v[0]['nb_read_frames'])

ease = lambda x: 1 - (1 - max(0, min(1, x))) ** 3
def back(x):
    x = max(0, min(1, x)); c = 1.7
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def bg():
    im = Image.new('RGB', (W, H), NAVY); d = ImageDraw.Draw(im)
    for y in range(H):
        k = y / H; d.line([(0, y), (W, y)], fill=(int(24 + 6 * k), int(38 + 20 * k), int(58 + 6 * k)))
    for y in range(0, H, 24):
        for x in range(0, W, 24): d.point((x, y), fill=(60, 78, 96))
    return im

def chip(d, xy, text, f, fill=YEL, ink=NAVY):
    x, y = xy; w = d.textlength(text, font=f)
    d.rounded_rectangle([x, y, x + w + 28, y + f.size + 18], 14, fill=fill); d.text((x + 14, y + 6), text, font=f, fill=ink)

def subtitle(im, beat, t):
    """Big presbyopia-friendly subtitle chunk at time t (seconds), above bottom 267px safe zone."""
    text = beat['text']; parts, cur = [], ''
    for ch in text:
        cur += ch
        if ch in '，。；？！': parts.append(cur.rstrip('，。；？！')); cur = ''
    if cur.strip(): parts.append(cur)
    tot = sum(len(p) for p in parts); acc = beat['start']; span = beat['end'] - beat['start']; s = parts[-1]
    for p in parts:
        dur = span * len(p) / tot
        if t < acc + dur: s = p; break
        acc += dur
    if t > beat['end'] + .25: return
    d = ImageDraw.Draw(im, 'RGBA'); f = font(44); w = d.textlength(s, font=f)
    x = (W - w) / 2; y = 935
    d.rounded_rectangle([x - 22, y - 12, x + w + 22, y + 62], 18, fill=(10, 16, 26, 215)); d.text((x, y), s, font=f, fill=PAPER)

def classroom(t, T, beat, claims):
    """Fictional classroom: blackboard chalk draws on, one child leans in, question bubble, then two data cards split."""
    im = bg(); d = ImageDraw.Draw(im, 'RGBA'); p = t / T
    chip(d, (40, 142), '虛構情境示意｜非真實學生', font(24), fill=(245, 241, 230, 230))
    bx, by = 70, 200; d.rounded_rectangle([bx, by, W - 70, by + 280], 18, fill=(47, 90, 76), outline=(169, 132, 90), width=14)
    for i, (L, y) in enumerate([(330, 300), (430, 360), (250, 420)]):
        k = ease((p - .03 - i * .07) / .12)
        if k > 0: d.line([(bx + 50, by + y - 230), (bx + 50 + L * k, by + y - 230)], fill=(245, 241, 230, int(220 * (1 - .8 * ease((p - .7) / .08)))), width=8)
    d.rectangle([90, by + 280, W - 90, by + 292], fill=(140, 107, 70))
    lean = math.sin(min(1, p / .3) * math.pi / 2) * 18
    for i in range(6):
        cx = 150 + (i % 3) * 210; cy = 700 + (i // 3) * 140; me = (i == 1)
        dy = -lean if me else 0; col = [AMBER, TEAL, (201, 138, 94)][i % 3]
        d.rounded_rectangle([cx - 80, cy + 50, cx + 80, cy + 66], 6, fill=(169, 132, 90))
        d.pieslice([cx - 44, cy - 2 + dy, cx + 44, cy + 86 + dy], 180, 360, fill=col)
        d.ellipse([cx - 32, cy - 52 + dy, cx + 32, cy + 12 + dy], fill=(45, 38, 34))
    kb = back((p - .22) / .12)
    if kb > 0:
        cx, cy = 420, 590; r = 70 * kb
        d.ellipse([cx - r, cy - r * .7, cx + r, cy + r * .7], fill=(245, 241, 230, 240))
        d.polygon([(cx - 30, cy + r * .5), (cx - 70, cy + r * .9), (cx - 5, cy + r * .6)], fill=(245, 241, 230, 240))
        if kb > .8: d.text((cx - 20, cy - 42), '？', font=font(62), fill=NAVY)
    kt = ease((p - .30) / .1)
    if kt > 0 and p < .56: chip(d, (40, 505 - 40 * (1 - kt)), '看不清楚黑板', font(30))
    for j, (name, sub, col, side) in enumerate([('近視調查', '驗光量度數', TEAL, -1), ('視力篩檢', '看視力表', AMBER, 1)]):
        k = ease((p - .55 - j * .08) / .14)
        if k <= 0: continue
        x0 = (40 if side < 0 else 375) + side * (1 - k) * 420
        d.rounded_rectangle([x0, 505, x0 + 305, 675], 20, fill=col + (245,), outline=PAPER, width=4)
        d.text((x0 + 24, 522), name, font=font(46), fill=NAVY); d.text((x0 + 24, 600), sub, font=font(28, 'Medium'), fill=NAVY)
    kh = ease((p - .72) / .1)
    if kh > 0:
        f = font(54); s = '兩種全國數字'; w = d.textlength(s, font=f)
        d.text(((W - w) / 2, 300 - 20 * (1 - kh)), s, font=f, fill=YEL + (int(255 * kh),))
    subtitle(im, beat, beat['_t0'] + t)
    return im

def dualtrack(t, T, beat, claims):
    """Two measures on two independent 0-100% axes; a ≠ stamp between them. Never one shared trend line."""
    im = bg(); d = ImageDraw.Draw(im, 'RGBA'); p = t / T
    f_t = font(54); s = '不是同一個指標'; w = d.textlength(s, font=f_t)
    d.text(((W - w) / 2, 175), s, font=f_t, fill=YEL)
    survey = [c for c in claims if c['claim_id'] in ('survey_2010_50D_grade6', 'survey_2017_50D_grade6')]
    screen = sorted([c for c in claims if c['claim_id'].startswith('school_screen_')], key=lambda c: c['calendar_year'])
    def panel(y0, y1, title, tag, col, k):
        x0 = 40; d.rounded_rectangle([x0, y0, W - 40, y1], 20, fill=(14, 24, 38, 230), outline=col, width=4)
        d.text((x0 + 22, y0 + 14), title, font=font(30), fill=PAPER)
        d.text((x0 + 22, y0 + 54), tag, font=font(22, 'Medium'), fill=GREY)
        ax0, ax1, ay0, ay1 = x0 + 70, W - 80, y0 + 100, y1 - 46
        for v in (0, 50, 100):
            yy = ay1 - (ay1 - ay0) * v / 100
            d.line([(ax0, yy), (ax1, yy)], fill=(255, 255, 255, 40), width=2); d.text((x0 + 16, yy - 14), f'{v}%', font=font(20, 'Medium'), fill=GREY)
        return ax0, ax1, ay0, ay1
    k1 = ease((p - .05) / .15)
    if k1 > 0:
        st = '候選值・待核實' if any(c['verification_state'] != 'verified' for c in survey) else '已核實'
        ax0, ax1, ay0, ay1 = panel(250, 540, '尺 1｜屈光近視調查・小六', f'−0.50 D 門檻・兩個調查年・{st}', TEAL, k1)
        for i, c in enumerate(survey):
            kk = ease((p - .12 - i * .08) / .16); h = (ay1 - ay0) * c['value'] / 100 * kk
            x = ax0 + 90 + i * 230; d.rectangle([x, ay1 - h, x + 120, ay1], fill=TEAL)
            d.text((x + 4, ay1 + 8), str(c['calendar_year']), font=font(24), fill=PAPER)
            if kk > .9: d.text((x, ay1 - h - 44), f"{c['value']}%", font=font(32), fill=PAPER)
        if p > .35: d.text((W - 110, 250), '↑', font=font(56), fill=TEAL)
    k2 = ease((p - .30) / .15)
    if k2 > 0:
        st = '候選值・待核實' if any(c['verification_state'] != 'verified' for c in screen) else '已核實'
        ax0, ax1, ay0, ay1 = panel(630, 905, '尺 2｜學校裸眼視力不良・全體國小', f'學年度 103–113・{st}', AMBER, k2)
        n = len(screen); m = max(1, int(ease((p - .38) / .3) * (n - 1)) + 1)
        pts = [(ax0 + (ax1 - ax0) * i / (n - 1), ay1 - (ay1 - ay0) * c['value'] / 100) for i, c in enumerate(screen)]
        if m > 1: d.line(pts[:m], fill=AMBER, width=7, joint='curve')
        for i in (0, n - 1):
            if i < m:
                d.ellipse([pts[i][0] - 8, pts[i][1] - 8, pts[i][0] + 8, pts[i][1] + 8], fill=PAPER)
                d.text((pts[i][0] - (0 if i == 0 else 100), pts[i][1] - 48), f"{screen[i]['value']}%", font=font(26), fill=PAPER)
                d.text((pts[i][0] - (0 if i == 0 else 50), ay1 + 8), str(screen[i]['calendar_year']), font=font(22), fill=GREY)
        if p > .7: d.text((W - 110, 630), '↓', font=font(56), fill=AMBER)
    ks = back((p - .55) / .12)
    if ks > 0:
        shake = math.sin(p * 90) * 6 * max(0, 1 - (p - .55) / .1)
        f = font(int(96 * ks)); d.rounded_rectangle([W / 2 - 62 * ks + shake, 585 - 42 * ks, W / 2 + 62 * ks + shake, 585 + 42 * ks], 30, fill=YEL)
        d.text((W / 2 - 30 * ks + shake, 585 - 66 * ks), '≠', font=f, fill=NAVY)
    subtitle(im, beat, beat['_t0'] + t)
    return im

def draw_shot(fn, n, beat, claims, dest):
    argv = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30',
            '-i', 'pipe:0', '-an', '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', '30', str(dest)]
    pr = subprocess.Popen(argv, stdin=subprocess.PIPE, stderr=subprocess.PIPE); T = n / FPS
    for i in range(n): pr.stdin.write(fn(i / FPS, T, beat, claims).convert('RGB').tobytes())
    pr.stdin.close(); err = pr.stderr.read()
    if pr.wait(): raise RuntimeError(err.decode()[-800:])
    if nframes(dest) != n: raise RuntimeError('frame count drift ' + str(dest))

def keep(src, a, b, dest):
    call(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-vf', f'trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,format=yuv420p',
          '-frames:v', b - a, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', '30', dest])
    if nframes(dest) != b - a: raise RuntimeError('native trim drift')

def watermark(path, lines):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # bottom strip: native vpro leaves it empty, so the banner never hides on-screen pending labels
    d.rectangle([0, 1150, W, 1262], fill=(120, 20, 20, 215))
    f1, f2 = font(36), font(24, 'Medium')
    for f, s, y in ((f1, lines[0], 1158), (f2, lines[1], 1216)):
        w = d.textlength(s, font=f); d.text(((W - w) / 2, y), s, font=f, fill=(255, 240, 200, 255))
    tile = Image.new('RGBA', (W, H), (0, 0, 0, 0)); td = ImageDraw.Draw(tile)
    for y in range(160, H, 260):
        for x in (-80, 300): td.text((x, y), lines[0], font=font(30), fill=(255, 255, 255, 34))
    im.alpha_composite(tile.rotate(24, resample=Image.BICUBIC)); im.save(path)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--film-dir', type=Path, required=True)
    ap.add_argument('--audit', type=Path, default=Path('tests/myopia-national/EVIDENCE_AUDIT.json'))
    ap.add_argument('--output', type=Path, required=True)
    a = ap.parse_args(); D = a.film_dir.resolve(); out = a.output.resolve(); root = out.parent; root.mkdir(parents=True, exist_ok=True)
    T = json.loads((D / 'timeline.json').read_text(encoding='utf8')); R = json.loads((D / 'MYOPIA_DIRECTOR.json').read_text(encoding='utf8'))
    A = json.loads(a.audit.read_text(encoding='utf8')); claims = A['claims']
    beats = T['beats']
    if [b['id'] for b in beats] != [f'b{i:02}' for i in range(1, 11)] or T.get('stub'): raise RuntimeError('Need 10 physical beats')
    native = D / 'out' / 'visual_720.mp4'; N = nframes(native)
    if abs(N / FPS - T['duration']) > .2: raise RuntimeError('native duration mismatch')
    st = [round(b['start'] * FPS) for b in beats]; st[0] = 0; bounds = st + [N]
    rep = {R['replace_shots']['classroom']: classroom, R['replace_shots']['dualtrack']: dualtrack}
    segs = []
    for i in range(10):
        a0, a1 = bounds[i], bounds[i + 1]; f = root / f'seg_{i + 1:02}.mp4'
        if i in rep:
            b = dict(beats[i]); b['_t0'] = a0 / FPS; draw_shot(rep[i], a1 - a0, b, claims, f)
        else: keep(native, a0, a1, f)
        segs.append(f)
    lst = root / 'segments.txt'; lst.write_text(''.join(f"file '{s}'\n" for s in segs))
    joined = root / 'joined_silent.mp4'
    call(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-an', '-c', 'copy', joined])
    wm_needed = R['watermark_required'] or A['summary']['verified'] < A['summary']['total']
    wm = root / 'watermark.png'
    watermark(wm, [R['watermark'] if wm_needed else '資料已核實・內部審片', '無聲測試版｜尚未匯入 Fish 正式配音'])
    call(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', joined, '-i', wm, '-filter_complex', '[0:v][1:v]overlay=0:0,format=yuv420p',
          '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', '30', '-movflags', '+faststart', out])
    fn = nframes(out)
    qa = {'status': 'MYOPIA_V41_SILENT_COMPOSITE_PASS' if fn == N else 'FRAME_DRIFT', 'frames': fn, 'native_frames': N,
          'duration_seconds': round(fn / FPS, 3), 'format': 'H264 720x1280 30fps, no audio',
          'native_shots_kept': 10 - len(rep), 'original_animation_shots': sorted(i + 1 for i in rep),
          'original_animation_frames': {str(i + 1): bounds[i + 1] - bounds[i] for i in rep},
          'watermark_burned': wm_needed, 'subtitles': 'vpro native in 8 shots; Pillow-drawn in shots 2 and 8 (time-proportional, not ASR)'}
    if fn != N: raise RuntimeError('final frame drift')
    (root / 'COMPOSITE_QA.json').write_text(json.dumps(qa, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(json.dumps(qa, ensure_ascii=False))

if __name__ == '__main__': main()
