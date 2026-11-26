#!/usr/bin/env python3
"""Real sentence audio -> native vpro timeline. INTERNAL ONLY.
Never claims word-perfect alignment: character anchors are duration-weighted estimates.
--test-tones exercises logic only; output MUST NOT be labeled Fish.
"""
import argparse,hashlib,json,math,subprocess,sys,wave
from array import array
from pathlib import Path
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for block in iter(lambda:f.read(1048576),b''):h.update(block)
 return h.hexdigest()
def weight(ch):
 if '\u3400'<=ch<='\u9fff' or ch=='〇':return 1.
 if ch.isdigit():return .8
 if ch.isascii() and ch.isalpha():return .42
 if ch in '，、：；,:;':return .48
 if ch in '。！？!?…':return .65
 if ch.isspace():return .12
 return .5
def tone(file,seconds,hz):
 n=round(seconds*48000);a=array('h')
 for i in range(n):
  t=i/48000;ramp=min(1,t/.05,max(0,(seconds-t)/.06))
  a.append(int(4000*ramp*math.sin(2*math.pi*hz*t)))
 with wave.open(str(file),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes(a.tobytes())
def duration(wav):
 with wave.open(str(wav),'rb') as w:
  if (w.getnchannels(),w.getsampwidth(),w.getframerate())!=(1,2,48000):raise RuntimeError('Invalid PCM '+wav.name)
  sec=w.getnframes()/48000;a=array('h');a.frombytes(w.readframes(min(w.getnframes(),48000*10)))
 if not(.6<=sec<=18):raise RuntimeError('Unreasonable clip duration')
 rms=math.sqrt(sum(v*v for v in a[::100])/max(len(a[::100]),1))
 if rms<65:raise RuntimeError('Silent narration '+wav.name)
 return sec,round(rms,2)
def build(args):
 D=args.film_dir.resolve();S=json.loads((D/'script.json').read_text(encoding='utf8'))
 lines=S['lines'];ids=[f'b{i:02}' for i in range(1,args.beats+1)]
 if [l['id'] for l in lines]!=ids:raise RuntimeError(f'{args.beats} ordered numbered beats required')
 if not args.test_tones and (not args.fish_manifest or not args.source_voice_dir):
  raise RuntimeError('Real Fish needs PRIVATE audio directory and provenance manifest')
 manifest={}
 if not args.test_tones:
  M=json.loads(args.fish_manifest.read_text(encoding='utf8'))
  if M.get('voice_key')!='taiwan_ad_male' or [x['id'] for x in M.get('clips',[])]!=ids:
   raise RuntimeError('Wrong voice or voice beat identity')
  manifest={x['id']:x for x in M['clips']}
 V=D/'voice';V.mkdir(parents=True,exist_ok=True)
 t=.15+float(S.get('pre',0));beats=[];audit=[]
 for i,line in enumerate(lines):
  lid=line['id'];wav=V/f'{lid}.wav'
  if args.test_tones:
   seconds=max(1.5,min(11,sum(weight(c) for c in line['text'])*.255))*(.96+.07*(i%3))
   tone(wav,seconds,310+23*i)
   source='TEST_SYNTHETIC_TONE_NOT_FISH'
  else:
   c=manifest[lid];p=args.source_voice_dir/(lid+'.mp3')
   if line['text']!=c.get('text'):raise RuntimeError('Text mismatch '+lid)
   if not p.is_file():raise RuntimeError('Physical private Fish MP3 missing '+lid)
   source=digest(p)
   if source!=c['sha256_verified_by_provider_probe'] or p.stat().st_size!=c['size_bytes_reported_by_fish']:
    raise RuntimeError('Fish SHA256 or size mismatch '+lid)
   sub=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(p),
    '-ar','48000','-ac','1','-c:a','pcm_s16le',str(wav)],capture_output=True,text=True)
   if sub.returncode:raise RuntimeError('Decode failure: '+sub.stderr[-600:])
  seconds,rms=duration(wav);start=t;end=t+seconds
  chars=[];x=0.;ww=[weight(ch) for ch in line['text']];total=sum(ww)
  for ch,w in zip(line['text'],ww):
   chars.append([ch,round(start+(x/total)*seconds,4)]);x+=w
  beats.append({'id':lid,'text':line['text'],'start':round(start,4),'end':round(end,4),
    'wav':f'voice/{lid}.wav','chars':chars})
  audit.append({'id':lid,'audio_seconds':round(seconds,4),'rms':rms,'source':source})
  t=end+float(line.get('gap',.35))
 for i,b in enumerate(beats):
  if b['start']>=b['end'] or (i>0 and b['start']<=beats[i-1]['end']):
   raise RuntimeError('Beat order or length invalid')
  if any(not(b['start']<=time<b['end']) for _,time in b['chars']):
   raise RuntimeError('Character anchors outside physical audio')
 T={'fps':30,'duration':round(t+.95,4),'pre':S.get('pre',0),'title':None,
   'beats':beats,'inserts':[],'stub':False,'sync_level':'physical_sentence_audio_only',
   'word_cues':'duration_weighted_estimate_NOT_ASR'}
 (D/'timeline.json').write_text(json.dumps(T,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 QA={'status':'NATIVE_VPRO_PHYSICAL_AUDIO_TIMELINE_PASS',
  'voice':'SYNTHETIC_TEST_TONES_NOT_FISH' if args.test_tones else 'taiwan_ad_male',
  'sentence_audio_verified':True,'per_word_alignment_verified':False,
  'duration_seconds':T['duration'],'beat_count':len(beats),'clips':audit,
  'human_listening_required':True,'publish_allowed':False}
 (D/'NATIVE_VOICE_QA.json').write_text(json.dumps(QA,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'status':QA['status'],'voice':QA['voice'],'duration':QA['duration_seconds']},ensure_ascii=False))
if __name__=='__main__':
 p=argparse.ArgumentParser()
 p.add_argument('--beats',type=int,default=10)
 p.add_argument('--film-dir',required=True,type=Path)
 p.add_argument('--source-voice-dir',type=Path)
 p.add_argument('--fish-manifest',type=Path)
 p.add_argument('--test-tones',action='store_true')
 try:build(p.parse_args())
 except Exception as e:print('VOICE_TIMELINE_BLOCK:',e,file=sys.stderr);sys.exit(1)
