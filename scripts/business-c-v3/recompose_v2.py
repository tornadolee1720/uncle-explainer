#!/usr/bin/env python3
"""Recompose two new programmatic-character scenes into ORIGINAL vpro V1 footage.
This is an external FFmpeg overlay/compositing layer, not a native vpro scene.
Timeline: 1597 original frames at 30fps; replace 0..210, 884..1020.
"""
import json,subprocess,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('Usage: recompose_v2.py <v1.mp4> <intro.mp4> <cash.mp4> <v2.mp4>')
v1,intro,cash,out=map(lambda x:Path(x).resolve(),sys.argv[1:])
out.parent.mkdir(parents=True,exist_ok=True)
def run(x):
 p=subprocess.run(x,capture_output=True,text=True)
 if p.returncode:raise RuntimeError(p.stderr[-1300:])
 return p.stdout
def info(f):
 x=json.loads(run(['ffprobe','-v','error','-count_frames','-select_streams','v:0',
    '-show_entries','stream=width,height,r_frame_rate,nb_read_frames:format=duration',
    '-of','json',str(f)]))
 s=x['streams'][0]
 if (s['width'],s['height'],s['r_frame_rate'])!=(720,1280,'30/1'):raise RuntimeError('Video codec dimensions/fps drift: '+str(f))
 return int(s['nb_read_frames']),float(x['format']['duration'])
for file,n in [(v1,1597),(intro,211),(cash,137)]:
 if not file.is_file():raise RuntimeError('Missing file: '+str(file))
 actual,seconds=info(file)
 if actual!=n:raise RuntimeError(f'Frame count unexpected: {file} {actual}, required {n}')
segments=out.parent/'segments';segments.mkdir(exist_ok=True)
def cut(start,end,name):
 dest=segments/(name+'.mp4')
 vf=f'trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,fps=30,format=yuv420p'
 run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(v1),
      '-vf',vf,'-frames:v',str(end-start),'-an','-c:v','libx264','-preset','veryfast',
      '-crf','21','-r','30',str(dest)])
 frames,_=info(dest)
 if frames!=end-start:raise RuntimeError('Cut scene count mismatch')
 return dest
mid=cut(211,884,'vpro_middle_2_to_6')
end=cut(1021,1597,'vpro_last_8_to_10')
files=[intro,mid,cash,end]
listfile=out.parent/'v2_concat.txt'
listfile.write_text(''.join("file '"+str(x)+"'\n" for x in files))
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listfile),
     '-c','copy','-an','-movflags','+faststart',str(out)])
frames,duration=info(out)
if frames!=1597 or abs(duration-53.233333)>.07:raise RuntimeError(f'V2 output failed: {frames} frames {duration:.3f}s')
qa={'status':'V2_VPRO_BACKED_COMPOSITE_PASS','voice':'NONE','publish_allowed':False,
    'original_vpro_scenes_preserved':8,'replaced_scenes':2,'illustration':'Pillow-original-not-real-people',
    'duration_s':duration,'fps':30,'frames':frames,'source':'original-vpro-film + external original Python animated overlays'}
(out.parent/'V2_REPRO_QA.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2))
print(json.dumps(qa,ensure_ascii=False))
