# -*- coding: utf-8 -*-
"""臨時配音 + 時間線：script.json → voice/<id>.wav + timeline.json（畫面全部掛在這份時間線的字上）

配音一律：切首尾靜音、原速（不用 atempo 事後加速——切掉靜音後再加速會很急促）。句間停頓只由 gap 決定。
預設用 edge-tts 出臨時配音，它自帶逐詞時間，不用識別就能給每個字一個時刻。
有正式配音（任何 TTS、克隆音色或真人錄音，存成 voice/<id>.final.wav）時自動換上，並用 --asr 重新逐字對齊。

script.json 例：
{
  "voice": "zh-TW-YunJheNeural", "rate": "+0%", "pre": 0.3,
  "title": {"after": "s01", "len": 1.7},
  "lines": [
    {"id": "s01", "text": "今年，光是谷歌、微軟、亞馬遜、Meta 這四家……", "gap": 0.35},
    {"id": "s10b", "text": "難怪黃仁勳總愛說這句：", "gap": 0.5,
     "bite": {"pre": 0.15, "post": 0.4, "parts": [["footage/jensen.m4a", 101.60, 1.95, "買得越多，省得越多", 2.5]]}}
  ]
}
- say：只給 TTS 讀的寫法（數字、英文怎麼念），不改畫面上的 text
- bite：這句之後插一段原聲，parts = [原始檔, 入點秒, 時長, 中文字幕, 增益dB]；原始檔相對 script.json
- pre：開頭先空多久再開口（開頭快閃墊在下面）；title：哪句後面留片名的時間

  python temp_voice.py film/script.json            # 缺的句子用 edge-tts 補，已有的不重做
  python temp_voice.py film/script.json --redo     # 全部重做臨時配音
  python temp_voice.py film/script.json --asr      # 用 faster-whisper 給所有句子逐字對齊（換成正式配音後用）
"""
import asyncio, difflib, json, subprocess, sys
from pathlib import Path

SP = Path(sys.argv[1]).resolve(); D = SP.parent
S = json.loads(SP.read_text('utf-8'))
REDO, ASR = '--redo' in sys.argv, '--asr' in sys.argv
VOICE, RATE = S.get('voice', 'zh-TW-YunJheNeural'), S.get('rate', '+0%')
(D / 'voice').mkdir(exist_ok=True)
TRIM = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03"


def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]))


def lead_silence(f):
    """切掉的開頭靜音有多長（逐字時間要減掉它）"""
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(f), '-af', 'silencedetect=n=-45dB:d=0.02', '-f', 'null', '-'], capture_output=True, text=True).stderr
    for ln in out.splitlines():
        if 'silence_end' in ln and 'silence_start: 0' in out.split('silence_end')[0][-60:]:
            return max(0.0, float(ln.split('silence_end:')[1].split('|')[0]) - .03)
    return 0.0


async def edge(text, mp3):
    import edge_tts
    words = []
    com = edge_tts.Communicate(text, VOICE, rate=RATE, boundary='WordBoundary')
    with open(mp3, 'wb') as fp:
        async for ch in com.stream():
            if ch['type'] == 'audio': fp.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append([ch['text'], ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7])
    return words


def char_times(caption, words):
    """把逐詞時間對到畫面上文字的每個字；對不上的字（標點、寫法不同的數字）按前後插值"""
    seq = []
    for w, s, e in words:
        w = w.strip()
        for i, ch in enumerate(w): seq.append((ch, s + (e - s) * i / max(1, len(w))))
    a, b = list(caption), [c for c, _ in seq]; tm = [None] * len(a)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size): tm[blk.a + k] = seq[blk.b + k][1]
    known = [i for i, x in enumerate(tm) if x is not None]
    for i in range(len(tm)):
        if tm[i] is None:
            p = max([k for k in known if k < i], default=None); n = min([k for k in known if k > i], default=None)
            tm[i] = (0 if p is None and n is None else (tm[n] - .12 * (n - i)) if p is None else (tm[p] + .12 * (i - p)) if n is None
                     else tm[p] + (tm[n] - tm[p]) * (i - p) / (n - p))
    for i in range(1, len(tm)): tm[i] = max(tm[i], tm[i - 1])
    return [max(0.0, x) for x in tm]


whisper = None
def asr_words(wav):
    global whisper
    if whisper is None:
        from faster_whisper import WhisperModel
        import os; M = os.environ.get('WHISPER_MODEL', 'large-v3')   # 可以寫本機的模型資料夾：寫名字要連網去核對，網不好會一直等
        try: whisper = WhisperModel(M, device='cuda', compute_type='float16')
        except Exception: whisper = WhisperModel(M, device='cpu', compute_type='int8')
    segs, _ = whisper.transcribe(str(wav), language='zh', word_timestamps=True)
    return [[w.word, float(w.start), float(w.end)] for s in segs for w in s.words]


t = .15 + S.get('pre', 0.0); beats, inserts, title = [], [], None
meta_p = D / 'voice' / 'words.json'; meta = json.loads(meta_p.read_text('utf-8')) if meta_p.exists() else {}
for ln in S['lines']:
    lid, text = ln['id'], ln['text']; wav = D / 'voice' / f'{lid}.wav'; final = D / 'voice' / f'{lid}.final.wav'
    src_key = f"{ln.get('say', text)}|{VOICE}|{RATE}|{final.exists()}"
    if REDO or not wav.exists() or meta.get(lid, {}).get('key') != src_key:
        if final.exists():                       # 正式配音：只切靜音，不變速
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(final), '-af', f'{TRIM},areverse,{TRIM},areverse', '-ar', '48000', '-ac', '1', str(wav)], check=True)
            words = asr_words(wav)
        else:                                    # 臨時配音：edge-tts
            mp3 = D / 'voice' / f'{lid}.edge.mp3'; words = asyncio.run(edge(ln.get('say', text), mp3))
            lead = lead_silence(mp3)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(mp3), '-af', f'{TRIM},areverse,{TRIM},areverse', '-ar', '48000', '-ac', '1', str(wav)], check=True)
            words = [[w, s - lead, e - lead] for w, s, e in words]
        meta[lid] = {'key': src_key, 'words': words}
    elif ASR:
        meta[lid]['words'] = asr_words(wav)
    d = dur(wav); tm = char_times(text, meta[lid]['words'])
    beats.append({'id': lid, 'text': text, 'start': round(t, 4), 'end': round(t + d, 4), 'wav': f'voice/{lid}.wav',
                  'chars': [[c, round(t + x, 4)] for c, x in zip(text, tm)]})
    t += d + ln.get('gap', .35)
    if 'bite' in ln:                              # 這句後面插原聲
        bt = ln['bite']; t += bt.get('pre', .15) - ln.get('gap', .35); t0 = t; parts = []
        for src, a, l, sub, g in bt['parts']:
            parts.append({'src': src, 'in': a, 'dur': l, 'gain_db': g, 'start': round(t, 4), 'end': round(t + l, 4), 'sub': sub}); t += l
        inserts.append({'id': f'bite_{lid}', 'after': lid, 'start': round(t0, 4), 'end': round(t, 4), 'parts': parts}); t += bt.get('post', .4)
    if S.get('title', {}).get('after') == lid:
        title = {'start': round(t, 4), 'end': round(t + S['title']['len'], 4)}; t += S['title']['len']
meta_p.write_text(json.dumps(meta, ensure_ascii=False, indent=1), 'utf-8')
tl = {'fps': 30, 'duration': round(t + .95, 4), 'pre': S.get('pre', 0.0), 'title': title, 'beats': beats, 'inserts': inserts}
(D / 'timeline.json').write_text(json.dumps(tl, ensure_ascii=False, indent=1), 'utf-8')
for b in beats: print(f"{b['id']:6s} {b['start']:7.2f}–{b['end']:6.2f}  {b['text'][:28]}")
for i in inserts: print(f"{i['id']:6s} {i['start']:7.2f}–{i['end']:6.2f}  原聲 {len(i['parts'])} 段")
print('總長', tl['duration'], '秒；片名', title)
