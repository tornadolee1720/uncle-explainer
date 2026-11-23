#!/usr/bin/env python3
"""Safely mux a source-backed native-vpro preview and REAL spoken sentence audio.
For the automatic PR run the narrator is zh-TW-YunJheNeural TEMPORARY; never label it Fish.
A Fish master must be imported and aligned separately before promoting voice_provider.
"""
import json, subprocess, sys
from pathlib import Path

def media(path):
    proc=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],text=True,capture_output=True,check=True)
    return json.loads(proc.stdout)

def main():
    if len(sys.argv)!=3: raise SystemExit('Usage: python scripts/mux_news_av.py <film_dir> <voice_provider>')
    d=Path(sys.argv[1]).resolve()
    provider=sys.argv[2]
    if provider not in ['edge_tts_temporary','fish_project_voice']:
        raise SystemExit('Unknown voice_provider; never guess source')
    t=json.loads((d/'timeline.json').read_text(encoding='utf-8'))
    if t.get('stub'): raise SystemExit('REFUSE: stub timeline cannot be called word synced')
    beats=t.get('beats',[])
    if len(beats)<3: raise SystemExit('REFUSE: missing voiced sentences')
    for b in beats:
        wav=(d/b['wav']).resolve()
        if not wav.exists() or wav.stat().st_size<1024: raise SystemExit(f"Missing physical narration WAV: {wav}")
        chars=b.get('chars',[])
        if not chars or not any(isinstance(p[1],(int,float)) for p in chars):
            raise SystemExit(f"No physical narration character anchors: {b['id']}")
        if b['start'] >= b['end']: raise SystemExit(f"Invalid voice interval: {b['id']}")
    if provider=='fish_project_voice' and not (d/'FISH_VOICE_PROVENANCE.json').exists():
        raise SystemExit('Fish audio must supply explicit provenance manifest')
    v=d/'out'/'visual_720.mp4'
    a=d/'mix_master.wav'
    if not v.exists() or not a.exists(): raise SystemExit('Missing video or mixed narration: run real render and mix first')
    out=d/'out'/f'news_preview_{provider}.mp4'
    duration=float(t['duration'])
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(v),'-i',str(a),
         '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k',
         '-af',f'apad,atrim=0:{duration:.3f}','-t',f'{duration:.3f}',
         '-metadata',f'comment=Internal preview, {provider}, not authorized for publication',str(out)]
    subprocess.run(cmd,check=True)
    vd=media(out)
    kinds={s['codec_type']:s['codec_name'] for s in vd['streams']}
    actual=float(vd['format']['duration'])
    if kinds.get('video')!='h264' or kinds.get('audio')!='aac':
        raise SystemExit(f'Incorrect codecs: {kinds}')
    if abs(actual-duration)>.30:raise SystemExit(f'A/V duration drift: {actual} vs {duration}')
    fps=[s for s in vd['streams'] if s['codec_type']=='video'][0]['r_frame_rate']
    if fps!='30/1':raise SystemExit(f'Incorrect frame rate: {fps}')
    report={'status':'AV_TECHNICAL_PASS','voice_provider':provider,'fish_sync_verified':provider=='fish_project_voice',
            'duration_s':round(actual,3),'target_duration_s':duration,'sentences':len(beats),'codecs':kinds,
            'video':str(out),'publish_allowed':False,
            'notes':'A/V check only: source rights, scientific context and picture quality still need human review.'}
    (d/'out'/'AV_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
