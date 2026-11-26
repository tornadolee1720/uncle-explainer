import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
// NASA Goddard 2010 public B-roll, NOT 2026 NVIDIA premises.
// https://svs.gsfc.nasa.gov/10568/
// https://www.nasa.gov/nasa-brand-center/images-and-media/
// Official SVS page explicitly describes both source clips as "no audio".
// No soundtrack or interview sections are captured or reused.
const film=process.argv[2];if(!film)throw Error('Usage: node scripts/fetch_nasa_motion_broll.mjs <film-dir>');
const D=path.resolve(film),dir=path.join(D,'assets','clips');
fs.mkdirSync(dir,{recursive:true});
const root='https://svs.gsfc.nasa.gov/vis/a010000/a010500/a010568/';
const specs=[
 {name:'nccs_racks',filename:'broll_supercomputer-ipod_lg.m4v',description:'2010 NASA NCCS supercomputer equipment',at:'NASA/Goddard Space Flight Center',start:0,sec:8.5},
 {name:'nccs_wall',filename:'broll_vis_wall-ipod_lg.m4v',description:'2010 NASA NCCS hyperwall visualization theater',at:'NASA/Goddard Space Flight Center',start:0,sec:8.5}
];
function cmd(binary,args){const p=spawnSync(binary,args,{encoding:'utf8',timeout:60000,maxBuffer:8_000_000});if(p.status!==0)throw Error(binary+' failed: '+String(p.stderr).slice(-1200));return p.stdout||'';}
const credits=[];
for(const spec of specs){
 const u=root+spec.filename;
 const response=await fetch(u,{headers:{'User-Agent':'UncleExplainer/1.0 (+https://github.com/tornadolee1720/uncle-explainer)','Accept':'video/mp4,video/*;q=0.9'},signal:AbortSignal.timeout(65000)});
 if(!response.ok)throw Error(spec.name+' official NASA source unavailable: HTTP '+response.status);
 const file=path.join(D,spec.name+'.m4v');const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length<500000 || bytes.subarray(4,8).toString()!=='ftyp')throw Error(spec.name+' invalid MP4 / QuickTime bytes');
 fs.writeFileSync(file,bytes);
 const media=JSON.parse(cmd('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file]));
 const duration=Number(media.format?.duration);
 if(!Number.isFinite(duration)||duration<6.5)throw Error(spec.name+' movie too short: '+duration);
 const target=Math.min(duration-.2,spec.sec);
 const dst=path.join(dir,spec.name);fs.mkdirSync(dst,{recursive:true});
 cmd('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(spec.start),'-i',file,'-t',String(target),
    '-vf','fps=30,scale=960:540:flags=lanczos','-q:v','5',path.join(dst,'%04d.jpg')]);
 const frames=fs.readdirSync(dst).filter(x=>/^\d{4}\.jpg$/.test(x)).length;
 if(frames<180)throw Error('Too few physical video frames for '+spec.name+': '+frames);
 credits.push({...spec,source_page:'https://svs.gsfc.nasa.gov/10568/',
    raw_url:u,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    source_kind:'NASA_HISTORICAL_REAL_BROLL',license:'NASA Media Usage Guidelines / review for third-party elements',
    label:'NASA 2010 歷史機房實景｜非 NVIDIA 現場',original_duration_s:duration,frames,has_source_audio:false});
 fs.unlinkSync(file); // no unapproved audio, keep only silent visual frames
 console.log(JSON.stringify({name:spec.name,frames,source:'NASA Goddard 2010',bytes:bytes.length}));
}
const cp=path.join(dir,'counts.json');const old=fs.existsSync(cp)?JSON.parse(fs.readFileSync(cp,'utf8')):{};
for(const c of credits)old[c.name]=c.frames;
fs.writeFileSync(cp,JSON.stringify(old,null,2)+'\n');
fs.writeFileSync(path.join(D,'NASA_MOTION_CREDITS.json'),JSON.stringify({sources:credits,non_endorsement:true,
 use:'Internal explainer documentary illustration; never imply NVIDIA or NASA participation; never use source audio'},null,2)+'\n');
console.log(JSON.stringify({status:'NASA_REAL_MOTION_FRAMES_READY',clips:credits.length,frames:credits.reduce((n,x)=>n+x.frames,0)}));
