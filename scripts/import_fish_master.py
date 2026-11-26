#!/usr/bin/env python3
"""Fish MP3 -> actual word-timed script lines -> voice WAVs and native wallstreet timeline.
No guessed fixed cuts. Refuse if ASR-to-script correspondence is too weak.
Run: python scripts/import_fish_master.py film path/to/master.mp3 --blob-sha <sha>
Dependencies for alignment: faster-whisper, opencc-python-reimplemented, ffmpeg.
"""
import argparse
import difflib
import hashlib
import json
import subprocess
import unicodedata
from pathlib import Path

def run(*cmd):
    return subprocess.run(cmd,check=True,capture_output=True,text=True).stdout
def probe_duration(f):
    data=json.loads(run('ffprobe','-v','error','-show_format','-of','json',str(f)))
    return float(data['format']['duration'])
def permitted(s):
    # punctuation is not an anchor; preserve script glyphs in final timeline.
    return s.isalnum() or ('\u3400'<=s<='\u9fff')
def norm(text,cc):
    t=unicodedata.normalize('NFKC',cc.convert(text)).lower()
    return ''.join(c for c in t if permitted(c))
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('film_dir');ap.add_argument('fish_mp3')
    ap.add_argument('--blob-sha',default='')
    ap.add_argument('--whisper-model',default='base')
    ap.add_argument('--min-match',type=float,default=.46)
    args=ap.parse_args()
    d=Path(args.film_dir).resolve()
    master=Path(args.fish_mp3).resolve()
    if not master.is_file() or master.stat().st_size<5000: raise SystemExit('Fish master MP3 not found')
    script=json.loads((d/'script.json').read_text(encoding='utf-8'))
    ls=script['lines']
    if not (3<=len(ls)<=25):raise SystemExit('3-25 script lines are required')
    from faster_whisper import WhisperModel
    from opencc import OpenCC
    cc=OpenCC('s2t')
    duration=probe_duration(master)
    model=WhisperModel(args.whisper_model,device='cpu',compute_type='int8',cpu_threads=4)
    # Use the already tested FFmpeg decoder instead of PyAV's version-sensitive
    # metadata_errors argument (new PyAV builds may reject it).
    import numpy as np
    pcm=subprocess.run(['ffmpeg','-v','error','-i',str(master),'-ac','1','-ar','16000','-f','f32le','-'],
                       check=True,capture_output=True).stdout
    if len(pcm)<32000:raise SystemExit('Decoded Fish master is too short')
    waveform=np.frombuffer(pcm,dtype=np.float32)
    segments,info=model.transcribe(waveform,language='zh',word_timestamps=True,
           beam_size=5,condition_on_previous_text=False,vad_filter=False)
    recognized=[]
    for segment in segments:
        for w in segment.words or []:
            chars=list(norm(w.word,cc))
            if not chars:continue
            length=max(.015,float(w.end)-float(w.start))
            for i,c in enumerate(chars):
                st=max(0.,float(w.start)+length*i/len(chars))
                en=min(duration,float(w.start)+length*(i+1)/len(chars))
                recognized.append((c,st,en))
    if len(recognized)<15:raise SystemExit('ASR returned too few spoken words')
    source=[]
    # map normalized character back to its displayed script character index
    for li,line in enumerate(ls):
        for ci,ch in enumerate(line['text']):
            for c in norm(ch,cc):
                source.append((c,li,ci))
    if not source:raise SystemExit('Empty script')
    matcher=difflib.SequenceMatcher(None,[x[0] for x in source],[x[0] for x in recognized],autojunk=False)
    mapped={}
    for op in matcher.get_matching_blocks():
        for k in range(op.size):
            i=op.a+k;j=op.b+k
            mapped[i]=(recognized[j][1],recognized[j][2])
    ratio=len(mapped)/len(source)
    if ratio<args.min_match:
        raise SystemExit(f'FAIL_CLOSED weak Fish ASR alignment {ratio:.1%}, required {args.min_match:.1%}')
    # unmatched symbols are interpolated between actual physical ASR times;
    # mark each inferred character's status in report; no synthetic entire sentence.
    aligned=[None]*len(source)
    known=sorted(mapped)
    for i in range(len(source)):
        if i in mapped:
            aligned[i]=mapped[i];continue
        lo=next((j for j in reversed(known) if j<i),None)
        hi=next((j for j in known if j>i),None)
        if lo is None:
            st=max(0.,mapped[hi][0]-(hi-i)*.12)
        elif hi is None:
            st=min(duration-.02,mapped[lo][1]+(i-lo)*.12)
        else:
            t0=mapped[lo][1];t1=mapped[hi][0]
            st=t0+(t1-t0)*(i-lo)/max(1,hi-lo)
        st=max(0.,min(duration-.02,st))
        aligned[i]=(st,min(duration,st+.12))
    by_line={}
    for i,(_,li,ci) in enumerate(source):
        by_line.setdefault(li,{})[ci]=aligned[i]
    bounds=[]
    for li,line in enumerate(ls):
        times=by_line.get(li,{})
        anchored=[mapped[i] for i,(_,L,_) in enumerate(source) if L==li and i in mapped]
        if len(anchored)<max(3,int(len(times)*.25)):
            raise SystemExit(f"FAIL_CLOSED too few real aligned words for {line['id']}")
        st=max(0.,min(t[0] for t in anchored)-.04)
        en=min(duration,max(t[1] for t in anchored)+.08)
        bounds.append([st,en])
    for i in range(len(bounds)-1):
        bounds[i][1]=min(bounds[i][1],bounds[i+1][0]-.015)
    voice=d/'voice';voice.mkdir(exist_ok=True)
    beats=[]
    for li,line in enumerate(ls):
        st,en=bounds[li]
        if en<=st+.2:raise SystemExit(f"FAIL_CLOSED nonpositive audio slice: {line['id']}")
        out=voice/(line['id']+'.wav')
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(master),'-ss',f'{st:.5f}','-t',f'{en-st:.5f}',
            '-ac','1','-ar','48000','-c:a','pcm_s16le',str(out)],check=True)
        # Restore timing for punctuation without inventing new words.
        t=by_line[li]
        coords=[]
        for ci,ch in enumerate(line['text']):
            if ci in t: tm=t[ci][0]
            else:
                before=max((j for j in t if j<ci),default=None)
                after=min((j for j in t if j>ci),default=None)
                tm=t[before][1] if before is not None else (t[after][0] if after is not None else st)
            coords.append([ch,round(max(st,min(en,tm)),4)])
        beats.append({'id':line['id'],'text':line['text'],'start':round(st,4),'end':round(en,4),
                      'wav':'voice/'+out.name,'chars':coords})
    timeline={'fps':30,'duration':round(duration+.55,4),'pre':0,'title':None,'beats':beats,'inserts':[],
             'alignment_method':'Fish Audio master + faster-whisper physical word positions',
             'stub':False}
    (d/'timeline.json').write_text(json.dumps(timeline,ensure_ascii=False,indent=2),encoding='utf-8')
    mhash=hashlib.sha256(master.read_bytes()).hexdigest()
    provenance={'voice_key':'taiwan_ad_male','voice_display_name':'台灣廣告男性聲線',
                'project_authorization':'project_registered','render_scope':'INTERNAL_ONLY',
                'mp3_sha256':mhash,'github_blob_sha':args.blob_sha,
                'asr_model':args.whisper_model,'matched_chars':len(mapped),'script_chars':len(source),
                'matched_ratio':round(ratio,4),'master_duration_s':duration,'publish_allowed':False}
    (d/'FISH_VOICE_PROVENANCE.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'status':'FISH_PHYSICAL_AUDIO_ALIGNED','match_ratio':round(ratio,3),
                     'duration_s':round(duration,2),'beats':len(beats),'transcript_language':info.language},ensure_ascii=False))
if __name__=='__main__':main()
