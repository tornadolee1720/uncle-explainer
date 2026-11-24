#!/usr/bin/env python3
"""Uncle Business C: voice-led retiming of a ten-scene V2 silent MP4.

Production needs ten actual voice/b01..b10.mp3/WAV files and a private,
SHA-256-pinned provenance JSON. Does not fetch TTS, open an API key, or publish.
Sentence starts are physical-audio aligned; word-level ASR is NOT claimed.
--test-tone tests the mechanism without impersonating Fish Audio.
"""
import argparse, array, hashlib, json, math, re, subprocess, sys, wave
from pathlib import Path

def call(argv, capture=False):
    p=subprocess.run(argv,capture_output=capture,text=True)
    if p.returncode:
        raise RuntimeError('Command failed: '+' '.join(map(str,argv[:8]))+'\n'+(p.stderr or '')[-1600:])
    return p.stdout if capture else ''

def inspect(f):
    x=json.loads(call(['ffprobe','-v','error','-show_entries',
      'format=duration:stream=codec_name,codec_type,width,height,r_frame_rate','-of','json',str(f)],True))
    return float(x['format']['duration']),x['streams']

def per(ch):
    if '\u3400'<=ch<='\u9fff' or ch=='〇':return .235
    if ch.isdigit():return .17
    if ch.isascii() and ch.isalpha():return .075
    if ch in '，、：；,:;':return .2
    if ch in '。！？!?…':return .28
    return .06 if ch.isspace() else .1

def old_stub(script):
    t=.15+script.get('pre',0);out=[]
    for l in script['lines']:
        st=t;t+=sum(per(c) for c in l['text'])
        out.append({'id':l['id'],'start':st,'end':t,'gap':l.get('gap',.35)})
        t+=l.get('gap',.35)
    return out,t+.95

def wave_tone(file,seconds,freq):
    # Tests ONLY. Never use it in a published or Fish-labeled video.
    import math
    rate=48000;N=round(seconds*rate)
    with wave.open(str(file),'wb') as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate)
        samples=array.array('h')
        for n in range(N):
            t=n/rate
            ramp=min(1,t/.04,max(0,(seconds-t)/.04))
            samples.append(int(32767*.09*ramp*math.sin(2*math.pi*freq*t)))
        wav.writeframes(samples.tobytes())

def to_pcm(file, dest):
    call(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(file),
          '-ac','1','-ar','48000','-c:a','pcm_s16le',str(dest)])
    with wave.open(str(dest),'rb') as w:
        if (w.getframerate(),w.getnchannels(),w.getsampwidth())!=(48000,1,2):
            raise RuntimeError('Wrong PCM audio format')
        count=w.getnframes()
        data=array.array('h',w.readframes(count))
        if count<28800 or math.sqrt(sum(v*v for v in data)/len(data))<65:
            raise RuntimeError('Voice empty or effectively silent: '+str(file))
        return data,count/48000

def srt_time(sec):
    n=round(sec*1000);h,n=divmod(n,3600000);m,n=divmod(n,60000);s,ms=divmod(n,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'

def run():
    ap=argparse.ArgumentParser()
    ap.add_argument('--video',required=True,type=Path)
    ap.add_argument('--script',required=True,type=Path)
    ap.add_argument('--voice-dir',required=True,type=Path)
    ap.add_argument('--out',required=True,type=Path)
    ap.add_argument('--provenance',type=Path)
    ap.add_argument('--test-tone',action='store_true')
    ap.add_argument('--quick',action='store_true',help='Timeline/QA only; no MP4')
    a=ap.parse_args()
    a.out.mkdir(parents=True,exist_ok=True);a.voice_dir.mkdir(parents=True,exist_ok=True)
    S=json.loads(a.script.read_text(encoding='utf8'))
    lines=S['lines']
    if [x['id'] for x in lines]!=[f'b{i:02}' for i in range(1,11)]:
        raise RuntimeError('Must provide 10 known beat IDs in order')
    old,duration=old_stub(S)
    source,streams=inspect(a.video)
    if abs(duration-source)>.09:raise RuntimeError(f'V2 source timeline drift: {source} vs {duration}')
    videos=[s for s in streams if s['codec_type']=='video']
    if len(videos)!=1 or videos[0]['width']!=720 or videos[0]['height']!=1280 or videos[0]['r_frame_rate']!='30/1':
        raise RuntimeError('Expected original 720x1280 30fps vpro-backed V2 MP4')
    provenance={'voice_key':'NOT_FISH','origin':'SYNTHETIC_QA_TONE'} if a.test_tone else None
    if not a.test_tone:
        if not a.provenance or not a.provenance.is_file():raise RuntimeError('Fish provenance manifest missing')
        provenance=json.loads(a.provenance.read_text(encoding='utf8'))
        if provenance.get('voice_key')!='taiwan_ad_male' or provenance.get('scope')!='internal' or provenance.get('line_ids')!=[x['id'] for x in lines]:
            raise RuntimeError('Untrusted or mismatched Fish voice provenance')
    pcm=[];rows=[]
    for i,l in enumerate(lines):
        aid=l['id']
        if a.test_tone:
            f=a.voice_dir/(aid+'.wav')
            d=(old[i]['end']-old[i]['start'])*(.89+.05*(i%5))
            wave_tone(f,max(1.5,d),355+43*i)
        else:
            f=next((a.voice_dir/(aid+ext) for ext in ('.mp3','.wav','.m4a') if (a.voice_dir/(aid+ext)).exists()),None)
            if not f:raise RuntimeError('Missing physical voice audio '+aid)
            actual=hashlib.sha256(f.read_bytes()).hexdigest()
            if actual!=provenance.get('sha256',{}).get(aid):raise RuntimeError('Fish voice checksum mismatch '+aid)
        samples,seconds=to_pcm(f,a.out/(aid+'_48k.wav'))
        pcm.append(samples)
        rows.append({'id':aid,'duration':seconds,'gap':l.get('gap',.35),'text':l['text']})
    pre=old[0]['start'];tail=.95
    scene_seconds=[pre+rows[0]['duration']+rows[0]['gap']]+[r['duration']+r['gap'] for r in rows[1:-1]]+[rows[-1]['duration']+rows[-1]['gap']+tail]
    bounds=[0]+[x['start'] for x in old[1:]]+[source]
    base_seconds=[bounds[i+1]-bounds[i] for i in range(10)]
    factor=[t/s for t,s in zip(scene_seconds,base_seconds)]
    if any(f<.55 or f>1.75 for f in factor):raise RuntimeError('Scene retime too large; re-render from source needed')
    beats=[];subtitle=[];sound=array.array('h',[0]*round(pre*48000))
    for i,(l,samples) in enumerate(zip(rows,pcm)):
        st=len(sound)/48000;sound.extend(samples);en=len(sound)/48000
        subtitle.append(f'{i+1}\n{srt_time(st)} --> {srt_time(en)}\n{l["text"]}\n')
        beats.append({'id':l['id'],'actual_audio_start':round(st,3),'actual_audio_end':round(en,3),'text':l['text']})
        sound.extend(array.array('h',[0]*round(l['gap']*48000)))
    sound.extend(array.array('h',[0]*round(tail*48000)))
    outwav=a.out/'voice_mix.wav'
    with wave.open(str(outwav),'wb') as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(48000);wav.writeframes(sound.tobytes())
    (a.out/'sentence_captions.srt').write_text('\n'.join(subtitle),encoding='utf8')
    frames=[max(1,round(x*30)) for x in scene_seconds]
    summary={'status':'BEAT_TIMING_COMPUTED','voice_identity':'SYNTHETIC_TONE_NOT_FISH' if a.test_tone else 'taiwan_ad_male',
      'physical_sentence_boundaries':beats,'per_word_alignment_verified':False,
      'scene_seconds':[round(x,3) for x in scene_seconds],'original_scene_starts':[round(x,3) for x in bounds],
      'audio_master_duration':round(len(sound)/48000,3),'target_video_duration':round(sum(frames)/30,3),
      'source_video':str(a.video),'publish_allowed':False}
    (a.out/'VOICE_QA.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8')
    if a.quick:
        print(json.dumps({'status':summary['status'],'voice':summary['voice_identity'],'audio_s':summary['audio_master_duration']}))
        return
    seg=a.out/'scenes';seg.mkdir(exist_ok=True)
    for i in range(10):
        want=frames[i]/30;ratio=want/base_seconds[i]
        dest=seg/f'{i+1:02}.mp4'
        vf=f'setpts={ratio:.9f}*(PTS-STARTPTS),fps=30,tpad=stop_mode=clone:stop_duration=1,trim=duration={want:.6f},format=yuv420p'
        # "-t" before "-i" is essential: it bounds INPUT, not the retimed OUTPUT.
        call(['ffmpeg','-hide_banner','-loglevel','error','-y',
          '-ss',f'{bounds[i]:.6f}','-t',f'{base_seconds[i]:.6f}','-i',str(a.video),
          '-an','-vf',vf,'-frames:v',str(frames[i]),'-c:v','libx264','-preset','veryfast',
          '-crf','21','-r','30',str(dest)])
        produced,_=inspect(dest)
        if abs(produced-want)>.08:raise RuntimeError('Scene output duration drift '+rows[i]['id'])
    playlist=a.out/'concat.txt'
    playlist.write_text(''.join("file '"+str((seg/f'{i+1:02}.mp4').resolve())+"'\n" for i in range(10)))
    visual=a.out/'retimed_visual.mp4'
    call(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0',
          '-i',str(playlist),'-an','-c','copy',str(visual)])
    vdur,_=inspect(visual);adur,_=inspect(outwav)
    if abs(vdur-adur)>.25:raise RuntimeError(f'A/V mix mismatch: {vdur} vs {adur}')
    target=a.out/('C_V3_TEST_TONE_NOT_FISH.mp4' if a.test_tone else 'C_V3_Fish_Beat_Synced_INTERNAL.mp4')
    call(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(visual),'-i',str(outwav),
          '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','160k',
          '-af',f'apad,atrim=0:{vdur:.6f}','-t',f'{vdur:.6f}',str(target)])
    final,stream=inspect(target)
    codecs={x['codec_type']:x['codec_name'] for x in stream}
    if codecs.get('video')!='h264' or codecs.get('audio')!='aac' or abs(final-vdur)>.1:
        raise RuntimeError('Final audiovisual file verification failed')
    summary.update({'status':'TEST_TONE_AV_PASS' if a.test_tone else 'FISH_SENTENCE_SYNC_TECHNICAL_PASS',
        'output':str(target),'duration':round(final,3),'av_delta_s':round(abs(vdur-adur),4),'codecs':codecs})
    (a.out/'VOICE_QA.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'status':summary['status'],'duration_s':summary['duration'],'av_delta_s':summary['av_delta_s']},ensure_ascii=False))
if __name__=='__main__':run()
