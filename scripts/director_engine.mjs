// Uncle Visual Director V1: deterministic, inspectable editorial decisions.
// Input proposals are author-supplied (or Claude-authored) narrative choices.
// This is NOT automated factual research or a universal scene generator.
// Safety: fail closed for unverified sources, invented facts, unsupported future
// certainty, inadequate physical imagery, or misleading historical footage.
export const INTENT_PREFS=Object.freeze({
 hook:['v-full','v-clip','vp-ask'],
 evidence:['vp-paper'],
 scale:['vp-number','vp-share','vp-bars'],
 share:['vp-share','vp-number'],
 object:['vp-photo','v-clip','v-full'],
 mechanism:['v-clip','vp-chain','v-full'],
 correction:['vp-words','vp-verdict'],
 forecast:['vp-versus','vp-number'],
 caveat:['vp-list','vp-words'],
 takeaway:['vp-verdict','vp-ask']
});
const PHOTO=new Set(['vp-photo','v-photo']);
const MOVING=new Set(['v-full','v-clip']);
const PROOF=new Set(['vp-paper','v-doc']);
const TEXT=new Set(['vp-ask','vp-words','vp-list','vp-verdict','v-chapter']);
const ALLOWED=new Set(Object.values(INTENT_PREFS).flat());
const fail=(msg)=>{throw new Error('DIRECTOR_BLOCK: '+msg)};
const refBeat=(s)=>String(s||'').match(/^@(b\d\d)(?::(.+))?$/);
function isObviousForecast(scene){
 // Assess only what viewers can actually see. A prompt's hidden "says" notes
 // do NOT establish that the future number is visibly labeled a projection.
 const visible=scene.scene==='vp-versus'
  ? [scene.right?.name,scene.right?.sub].join(' ')
  : scene.scene==='vp-words'
  ? (scene.words||[]).map(w=>w.text).join(' ')
  : [scene.title,scene.label,scene.unit,scene.brow].join(' ');
 return /預估|展望|預測|非實績/.test(visible) &&
   !/已經實現|已實現|確定賺到|已入帳|已實現營收/.test(visible);
}
function shotClass(scene) {
 if(MOVING.has(scene))return 'real_motion';
 if(PROOF.has(scene))return 'official_evidence';
 if(PHOTO.has(scene))return 'documentary_photo';
 if(TEXT.has(scene))return 'editorial_text';
 return 'data_explanation';
}
function referencedAnchors(v,out=[]){
 if(typeof v==='string'){
  if(v.startsWith('@'))out.push(v);
  return out;
 }
 if(Array.isArray(v)){for(const x of v)referencedAnchors(x,out);return out;}
 if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))if(k!=='says')referencedAnchors(x,out);
 return out;
}
function hasFact(inv,id){
 return inv.facts?.[id] && inv.facts[id].source_verified===true;
}
function validatedOption(option,beat,inventory,allBeatIds){
 const shot=option.shot,role=option.media_role||'graphic',asset=option.asset_id||null;
 if(!shot||!ALLOWED.has(shot.scene))return 'Unsupported original-vpro scene: '+shot?.scene;
 if(!shot.says||shot.says.length<9)return 'Missing narrative function';
 if(role==='motion'){
  if(!MOVING.has(shot.scene)||shot.clip!==asset)return 'Motion role and clip mismatch';
  const m=inventory.motion?.[asset];
  if(!m||m.frames<150||!m.provenance_verified||!m.historical_label||!String(shot.source||'').includes('NASA')||!/非 NVIDIA/i.test(String(shot.source||'')+' '+String(shot.brow||'')))
   return 'Physical source not authorized or historically labeled';
 }else if(role==='official'){
  if(!PROOF.has(shot.scene)||shot.img!==inventory.official?.asset)return 'Official evidence image/role mismatch';
  if(!inventory.official?.verified||!inventory.official?.sha256||!inventory.official?.url?.startsWith('https://investor.nvidia.com/'))
   return 'Original publication evidence is unverified';
  if(!Array.isArray(shot.hl)||!shot.hl.length)return 'News document has no visible highlighted source text';
 }else if(role==='photo'){
  if(!PHOTO.has(shot.scene)||shot.img!==asset)return 'Historical photo asset mismatch';
  const m=inventory.photos?.[asset];
  if(!m||!m.provenance_verified||!m.sha256)return 'Photograph license/provenance not verified';
  if(!/非 NVIDIA/i.test(String(shot.brow||'')+' '+String(shot.source||'')))return 'Photo missing explicit non-NVIDIA context';
 }else if(role==='graphic'){
  if(MOVING.has(shot.scene)||PHOTO.has(shot.scene)||PROOF.has(shot.scene))return 'Graphic role cannot impersonate original media';
 }else return 'Unknown media role: '+role;
 const facts=option.fact_ids||[];
 if(role==='graphic' && !facts.length && beat.intent!=='takeaway' && beat.intent!=='hook')return 'Unsupported graphic claim without cited facts';
 for(const id of facts)if(!hasFact(inventory,id))return 'Unverified claimed fact '+id;
 if(beat.intent==='forecast' && (!facts.some(id=>inventory.facts[id]?.estimate===true)||!isObviousForecast(shot)))
  return 'Forecast must be attributed and visually labeled as estimate';
 if(beat.intent==='share' && (!facts.some(id=>inventory.facts[id]?.derived===true)||!JSON.stringify(shot).includes('推算')))
  return 'Derived share must disclose calculation';
 // All anchors must reference a real beat; keyword anchors must match verbatim text.
 for(const a of referencedAnchors(shot)){
  const matched=refBeat(a);
  if(!matched||!allBeatIds.has(matched[1]))return 'Invalid narration anchor '+a;
  const line=allBeatIds.get(matched[1]);
  if(matched[2]&&!line.includes(matched[2]))return 'Narration anchor keyword absent '+a;
 }
 return null;
}
function scoreOption(beat,option,already){
 const shot=option.shot;
 const order=INTENT_PREFS[beat.intent]||[];
 const rank=order.indexOf(shot.scene);
 let score=rank<0?0:16-rank*4;
 score+=({motion:7,official:9,photo:5,graphic:2})[option.media_role]||0;
 score+=Math.max(0,Math.min(3,Number(option.editorial_strength||0)));
 if(already.length){
  const last=already[already.length-1];
  if(last.shot.scene===shot.scene)score-=8;
  if(shotClass(last.shot.scene)===shotClass(shot.scene))score-=3;
  if(last.asset_id && last.asset_id===option.asset_id)score-=4;
 }
 return score;
}
export function directNews({beats,inventory,policy={}}){
 if(!Array.isArray(beats)||beats.length<5)fail('Expected at least 5 editorial beats');
 if(!inventory||typeof inventory!=='object')fail('Missing inventory');
 const ids=new Map();
 for(const beat of beats){
  if(!/^b\d\d$/.test(beat.id)||ids.has(beat.id)||!beat.text?.trim())fail('Invalid, repeated or empty script beat '+beat.id);
  if(!INTENT_PREFS[beat.intent])fail('Unknown narrative intent '+beat.intent);
  if(!beat.viewer_gain || beat.viewer_gain.trim().length<12)fail('Need viewer understanding goal for '+beat.id);
  if(!Array.isArray(beat.options)||!beat.options.length)fail('No scene candidates for '+beat.id);
  ids.set(beat.id,beat.text);
 }
 const decisions=[],notes=[];
 for(const beat of beats){
  const rejects=[],choices=[];
  for(let i=0;i<beat.options.length;i++){
   const o=beat.options[i],reason=validatedOption(o,beat,inventory,ids);
   if(reason){rejects.push({candidate:i,scene:o.shot?.scene,reason});continue}
   choices.push({o,i,score:scoreOption(beat,o,decisions)});
  }
  if(!choices.length)fail(beat.id+' has no authorized and supported shot: '+JSON.stringify(rejects));
  choices.sort((a,b)=>b.score-a.score||a.i-b.i);
  const top=choices[0];
  decisions.push({id:beat.id,intent:beat.intent,viewer_gain:beat.viewer_gain,
     shot:structuredClone(top.o.shot),asset_role:top.o.media_role,asset_id:top.o.asset_id||null,
     fact_ids:top.o.fact_ids||[],source_reason:top.o.why||'',score:top.score,
     rejected:rejects,alternative_count:choices.length-1});
  if(rejects.length)notes.push(beat.id+': '+rejects.length+' source/anchor-ineligible candidates rejected');
 }
 const scenes=decisions.map(x=>x.shot);
 const physical=decisions.filter(x=>['motion','official','photo'].includes(x.asset_role));
 const moving=decisions.filter(x=>x.asset_role==='motion');
 const uniqueClips=new Set(moving.map(x=>x.asset_id));
 const proof=decisions.filter(x=>x.asset_role==='official');
 const textOnly=decisions.filter(x=>shotClass(x.shot.scene)==='editorial_text');
 const sourceCount=[...new Set(physical.map(x=>x.asset_id))].length;
 const constraints={
  min_motion:policy.min_motion??2,min_proof:policy.min_proof??1,
  min_physical_share:policy.min_physical_share??0.35,
  min_scene_types:policy.min_scene_types??6,
  max_text_streak:policy.max_text_streak??2
 };
 const violations=[];
 if(moving.length<constraints.min_motion)violations.push('Insufficient verified moving footage');
 if(uniqueClips.size<constraints.min_motion)violations.push('Repeated B-roll does not count as independent sources');
 if(proof.length<constraints.min_proof)violations.push('Missing actual news page evidence');
 if(physical.length/scenes.length<constraints.min_physical_share)violations.push('Excessive pure infographic / text scenes');
 if(new Set(scenes.map(x=>x.scene)).size<constraints.min_scene_types)violations.push('Insufficient scene diversity');
 let textStreak=0;
 for(const s of scenes){
  if(shotClass(s.scene)==='editorial_text')textStreak++;else textStreak=0;
  if(textStreak>constraints.max_text_streak){violations.push('Text card streak exceeds '+constraints.max_text_streak);break}
 }
 if(violations.length)fail(violations.join('; '));
 // The heavy visual beat is chosen once, not handed to every scene.
 if(!scenes.some(x=>x.hero))scenes[0].hero=true;
 if(scenes.filter(x=>x.hero).length!==1)fail('Exactly one narrative hero visual is required');
 const summary={
  status:'DIRECTOR_PLAN_PASS',decision_method:'deterministic_v1_not_llm_auto_fact_check',
  narrative_beats:scenes.length,source_count:sourceCount,real_video_scenes:moving.length,
  official_evidence_scenes:proof.length,physical_visual_ratio:+(physical.length/scenes.length).toFixed(2),
  text_only_ratio:+(textOnly.length/scenes.length).toFixed(2),
  distinct_scene_types:new Set(scenes.map(x=>x.scene)).size,critical_violations:[],
  notes,release_authorized:false,
  human_review_required:['Confirm visual/voice rhythm','Verify historic footage labeling','Review text safe areas','Confirm every numerical source and publication rights']};
 return {scenes,plan:{summary,decisions:decisions.map(({shot,...keep})=>({...keep,chosen_scene:shot.scene,chosen_visual_class:shotClass(shot.scene)}))}};
}
