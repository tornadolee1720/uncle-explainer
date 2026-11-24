#!/usr/bin/env python3
"""Voice-first dynamic story composition for Uncle C.
Two ORIGINAL illustrated shots are redrawn at physical sentence-time lengths.
Eight untouched native-vpro shots are retained. Silent visual review only.
Do NOT call this a native-vpro Scene API; composite is Pillow + FFmpeg.
"""
import argparse, importlib.util, json, subprocess
from pathlib import Path
FPS=30
def call(argv):
 p=subprocess.run([str(x) for x in argv],capture_output=True,text=True)
 if p.returncode:raise RuntimeError('FFMPEG_CALL_BLOCK: '+str(argv[:6])+'\n'+p.stderr[-1700:])
 return p.stdout
def media(file):
 return json.loads(call(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',file]))
def frames(file):
 d=media(file);streams=d['streams'];v=[s for s in streams if s.get('codec_type')=='video']
 if len(v)!=1 or v[0].get('width')!=720 or v[0].get('height')!=1280 or v[0].get('r_frame_rate')!='30/1':
  raise RuntimeError('Video format must be 720x1280 30fps: '+str(file))
 if any(s.get('codec_type')=='audio' for s in streams):
  raise RuntimeError('Source contains sound: audio should be mixed after visual verification')
 return int(v[0]['nb_read_frames'])
def draw(name,draw_frame,n,base_seconds,dest):
 if not 30<=n<=750:raise RuntimeError('Narrative shot duration outside safe frame range')
 argv=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24',
   '-s','540x960','-r','30','-i','pipe:0','-vf','scale=720:1280:flags=lanczos,format=yuv420p',
   '-an','-c:v','libx264','-preset','veryfast','-crf','20','-r','30','-movflags','+faststart',str(dest)]
 proc=subprocess.Popen(argv,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
 try:
  for i in range(n):
   # REDRAW original artwork at the new actual sentence duration.
   # No setpts/atempo or speed change of a prerecorded animation.
   source_time=i/n*base_seconds
   result=draw_frame(source_time)
   image=result[0] if isinstance(result,tuple) else result
   if image.size!=(540,960):raise RuntimeError('Wrong source image dimensions')
   proc.stdin.write(image.convert('RGB').tobytes())
  proc.stdin.close();err=proc.stderr.read();status=proc.wait()
 except Exception:
  proc.kill();proc.wait();raise
 if status:raise RuntimeError('Render failure '+name+': '+err.decode(errors='replace')[-1200:])
 if frames(dest)!=n:raise RuntimeError('Incorrect original animation frame count '+name)
def keep_native(src,a,b,dest):
 if b<=a:raise RuntimeError('Invalid native vpro segment range')
 call(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',src,
   '-vf',f'trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,fps=30,format=yuv420p',
   '-frames:v',str(b-a),'-an','-c:v','libx264','-preset','veryfast','-crf','20','-r','30',dest])
 if frames(dest)!=(b-a):raise RuntimeError('Native scene frame count changed')
def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--native-video',type=Path,required=True)
 ap.add_argument('--timeline',type=Path,required=True)
 ap.add_argument('--art-source',type=Path,default=Path('scripts/business-c-v3/illustrate_v2.py'))
 ap.add_argument('--output',type=Path,required=True)
 a=ap.parse_args();root=a.output.parent.resolve();root.mkdir(parents=True,exist_ok=True)
 t=json.loads(a.timeline.read_text(encoding='utf8'))
 beats=t.get('beats',[])
 if [b['id'] for b in beats]!=[f'b{i:02}' for i in range(1,11)] or t.get('stub') or t.get('fps')!=30:
  raise RuntimeError('Ten original ordered physical audio beats required')
 if t.get('sync_level')!='physical_sentence_audio_only':
  raise RuntimeError('Unknown or unverified native timeline source')
 source_n=frames(a.native_video)
 if abs(source_n/FPS-t['duration'])>.18:raise RuntimeError('Audio-first vpro visual length mismatch')
 starts={b['id']:round(b['start']*FPS) for b in beats}
 first=starts['b02'];cash_a=starts['b07'];cash_b=starts['b08']
 if not 0<first<cash_a<cash_b<source_n:raise RuntimeError('Narration beats in invalid order')
 p=a.art_source.resolve()
 if not p.is_file():raise RuntimeError('Original illustration source missing')
 spec=importlib.util.spec_from_file_location('uncle_original_story_art',p)
 art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
 if not callable(art.intro) or not callable(art.cash):
  raise RuntimeError('Original illustration has no frame-drawing routines')
 intro=root/'01_intro_dynamic.mp4';mid=root/'02_eight_original_a.mp4'
 cash=root/'03_cash_dynamic.mp4';outro=root/'04_eight_original_b.mp4'
 draw('intro',art.intro,first,211/30,intro)
 draw('cash',art.cash,cash_b-cash_a,137/30,cash)
 keep_native(a.native_video,first,cash_a,mid)
 keep_native(a.native_video,cash_b,source_n,outro)
 playlist=root/'segments.txt'
 playlist.write_text(''.join("file '"+str(f.resolve()).replace("'","'\\''")+"'\n" for f in (intro,mid,cash,outro)))
 call(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0',
  '-i',playlist,'-an','-c','copy','-movflags','+faststart',a.output])
 final_n=frames(a.output)
 if final_n!=source_n:raise RuntimeError('Final visual frames differ from native vpro')
 result={'status':'V4_1_AUDIO_FIRST_STORY_MERGE_PASS',
  'format':'H264/720x1280/30fps','frames':final_n,'duration_seconds':round(final_n/FPS,4),
  'difference_from_original_native_frames':final_n-source_n,
  'scene_1_original_animation_frames':first,
  'scene_7_original_animation_frames':cash_b-cash_a,
  'native_other_scenes_preserved':8,
  'original_art':'programmatic V2 fictional characters and moving cash',
  'source_engine':'native vpro + external Pillow/FFmpeg original-animation composition',
  'sync_basis':'physical sentence durations; estimated in-word positions NOT ASR',
  'soundtrack':'NONE (VISUAL REVIEW ONLY)','fish_audio_imported':False,
  'human_review_required':True,'publish_allowed':False}
 (root/'V4_1_QA.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps(result,ensure_ascii=False))
if __name__=='__main__':main()
