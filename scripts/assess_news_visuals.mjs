// Independent QA for editorial film structure: a rendered MP4 is NOT automatically a good video.
// Counts real moving footage, official evidence, source variety and overused graphics.
// Does NOT judge actual aesthetics or legally certify source rights.
import fs from 'node:fs';
import path from 'node:path';
const film=process.argv[2];if(!film)throw Error('Usage: node scripts/assess_news_visuals.mjs <film-directory>');
const D=path.resolve(film),text=fs.readFileSync(path.join(D,'film.js'),'utf8');
const start=text.indexOf('await K.film(');
if(start<0)throw Error('Unable to find native K.film scene list');
const begin=text.indexOf('[',start),end=text.lastIndexOf(');',text.indexOf('return K.go()',begin));
if(begin<0||end<0)throw Error('Native scene array parsing bounds missing');
const json=text.slice(begin,end).trim();
let shots;try{shots=JSON.parse(json)}catch(e){throw Error('Scene array must be compiler-generated JSON, not arbitrary eval: '+e.message)}
const manifest=JSON.parse(fs.readFileSync(path.join(D,'NEWS_MANIFEST.json'),'utf8'));
const nasa=JSON.parse(fs.readFileSync(path.join(D,'NASA_MOTION_CREDITS.json'),'utf8'));
const legal=new Set((nasa.sources||[]).filter(s=>s.source_kind==='NASA_HISTORICAL_REAL_BROLL'&&s.frames>=180).map(s=>s.name));
const blocks=[],warn=[];
const motion=shots.filter(s=>['v-full','v-clip'].includes(s.scene)&&s.clip);
const proof=shots.filter(s=>s.scene==='vp-paper'&&s.img);
const photographs=shots.filter(s=>s.scene==='vp-photo'&&s.img);
const textHeavy=shots.filter(s=>['vp-ask','vp-words','vp-list','vp-verdict','vp-chapter'].includes(s.scene));
const visuals=[...motion,...proof,...photographs];
const uniqueClips=[...new Set(motion.map(s=>s.clip))];
if(shots.length<9)blocks.push('Less than 9 distinct narrative scenes');
if(motion.length<2)blocks.push('Needs at least 2 REAL moving footage scenes, not Ken Burns image effects');
if(uniqueClips.length<2)blocks.push('Needs at least 2 independently sourced video files');
if(proof.length<1)blocks.push('Missing actual native vp-paper source screenshot');
if(visuals.length/shots.length<.35)blocks.push('Evidence and physical imagery must occupy at least 35% of scenes');
if(textHeavy.length/shots.length>.6)blocks.push('Too many generic title, verdict, list and word-only scenes');
if(new Set(shots.map(s=>s.scene)).size<6)blocks.push('Scene type variety is insufficient');
for(const s of motion){
 if(!legal.has(s.clip))blocks.push('Unlicensed or missing video clip source: '+s.clip);
 if(!String(s.source||'').includes('NASA')||!/非 NVIDIA|not NVIDIA/i.test(s.source+' '+(s.brow||'')))
   blocks.push('Video scene lacks historical source and non-NVIDIA context');
}
for(const s of shots)if(!s.says || s.says.trim().length<9)blocks.push('Narrative purpose is missing from a shot');
if(!manifest.evidence?.url?.includes('investor.nvidia.com'))blocks.push('No verified NVIDIA official source URI');
if(!Array.isArray(manifest.motion_broll) || manifest.motion_broll.length<2)blocks.push('Motion provenance missing from story manifest');
if(!shots.some(s=>s.hero===true))warn.push('No explicit hero shot');
const script=JSON.parse(fs.readFileSync(path.join(D,'script.json'),'utf8'));
for(const l of script.lines||[]){
 const chunks=l.text.split(/[，。！？、：；]/).map(x=>x.trim()).filter(Boolean);
 const over=chunks.filter(x=>x.length>15);
 if(over.length)warn.push(l.id+': '+over.length+' caption phrases over 15 characters; revise before publishing');
}
const summary={status:blocks.length?'BLOCK':'STRUCTURAL_PASS',publish_allowed:false,scope:'INTERNAL_ONLY',
 narrative_scenes:shots.length,scene_types:[...new Set(shots.map(s=>s.scene))],
 real_video_scenes:motion.length,unique_video_sources:uniqueClips.length,
 official_evidence_scenes:proof.length,photographic_scenes:photographs.length,
 physical_evidence_ratio:+(visuals.length/shots.length).toFixed(2),
 generic_text_ratio:+(textHeavy.length/shots.length).toFixed(2),
 blockers:blocks,warnings:warn,
 human_review_required:['Every visible 2010 NASA clip is unmistakably credited as illustrative, never an NVIDIA site','Evaluate subtitle legibility','Watch for jump cuts and distracting motion','Check screenshot highlight actually tracks the intended revenue value','Recheck copyright and news commentary basis before public use']};
fs.mkdirSync(path.join(D,'out'),{recursive:true});
fs.writeFileSync(path.join(D,'out','EDITORIAL_QA.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(blocks.length)process.exitCode=1;
