import test from 'node:test';
import assert from 'node:assert/strict';
import {directNews} from '../scripts/director_engine.mjs';

function sample(){
 const intents=['hook','evidence','scale','share','object','mechanism','correction','forecast','caveat','takeaway'];
 const texts=[
 '到底誰在收這些錢？',
 'NVIDIA 官方公布營收是多少。',
 '今年營收比去年成長百分之一百零三。',
 '資料中心占比是推算值。',
 '晶片和伺服器設備看得見。',
 '後面是一排排的機櫃。',
 '公司營收不是全球投資。',
 '下一季預估一千三百億，還不是實績。',
 '而且多了一週，不能直接比較。',
 '投資還能持續多久？'];
 const types=['v-full','vp-paper','vp-number','vp-share','vp-photo','v-clip','vp-words','vp-versus','vp-list','vp-verdict'];
 const roles=['motion','official','graphic','graphic','photo','motion','graphic','graphic','graphic','graphic'];
 const assets=['nccs_racks','nvidia_press',null,null,'photo','nccs_wall',null,null,null,null];
 const facts=[[],['revenue'],['yoy'],['share'],[],[],['scope'],['forecast'],['week'],[]];
 const shots=[
  {scene:'v-full',clip:'nccs_racks',until:'@b02',says:'A real, historical rack opens with a visually tangible question',source:'NASA/Goddard｜非 NVIDIA 現場',brow:'NASA 2010'},
  {scene:'vp-paper',img:'proof.png',until:'@b03',says:'Show verifiable newsroom report not an imaginary source page',hl:[{x:.1,y:.1,w:.5,h:.1,at:'@b02:營收'}]},
  {scene:'vp-number',until:'@b04',says:'Explain actual year-over-year growth number visually',value:'103%',at:'@b03:成長'},
  {scene:'vp-share',until:'@b05',says:'Reveal a derived value and transparent arithmetic evidence',note:'官方數字推算',value:'92.9%',at:'@b04:占比'},
  {scene:'vp-photo',img:'photo',until:'@b06',says:'Show a historical rack still with clear non-NVIDIA editorial context',brow:'非 NVIDIA 機房'},
  {scene:'v-clip',clip:'nccs_wall',until:'@b07',says:'Show genuinely moving archival footage of server-related infrastructure',source:'NASA/Goddard｜非 NVIDIA 機房'},
  {scene:'vp-words',until:'@b08',says:'Contrast company revenue against global investment statements',words:[{text:'不是總投資',at:'@b07:不是'}]},
  {scene:'vp-versus',until:'@b09',says:'Keep forecast visually distinct from realized earnings',right:{value:'130B USD',sub:'預估/非實績'},at:'@b08:預估'},
  {scene:'vp-list',until:'@b10',says:'Explain apples-to-oranges comparison created by the extra week',items:[{text:'多一週',at:'@b09:多了一週'}]},
  {scene:'vp-verdict',says:'Close with a useful question rather than investing advice',lines:['算力投資','還能多久']},
 ];
 const beats=intents.map((intent,i)=>({id:'b'+String(i+1).padStart(2,'0'),intent,text:texts[i],
  viewer_gain:'觀眾必須理解這句旁白真正想說明的意義和限制',
  options:[{shot:shots[i],media_role:roles[i],asset_id:assets[i],fact_ids:facts[i],why:'Ground a meaning in the required visual evidence'}]}));
 const inventory={
  official:{asset:'proof.png',url:'https://investor.nvidia.com/news/press-release-details/2026/xxxx',sha256:'verified_hash',verified:true},
  motion:{nccs_racks:{frames:255,provenance_verified:true,historical_label:true},nccs_wall:{frames:255,provenance_verified:true,historical_label:true}},
  photos:{photo:{sha256:'photo_hash',provenance_verified:true}},
  facts:{
   revenue:{source_verified:true},yoy:{source_verified:true},
   share:{source_verified:true,derived:true},
   scope:{source_verified:true},forecast:{source_verified:true,estimate:true},week:{source_verified:true}
  }
 };
 return {beats,inventory};
}
test('positive: plan selects ten useful scenes, never authorizes publication',()=>{
 const x=directNews(sample());
 assert.equal(x.plan.summary.status,'DIRECTOR_PLAN_PASS');
 assert.equal(x.scenes.length,10);
 assert.equal(x.plan.summary.real_video_scenes,2);
 assert.equal(x.plan.summary.official_evidence_scenes,1);
 assert.equal(x.plan.summary.physical_visual_ratio,.4);
 assert.equal(x.plan.summary.release_authorized,false);
 assert.equal(x.scenes.filter(s=>s.hero).length,1);
});
test('official screenshot cannot be imaginary or absent',()=>{
 const x=sample();x.inventory.official.verified=false;
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK.*Original publication evidence/);
});
test('a NASA clip cannot be represented without historical provenance',()=>{
 const x=sample();x.inventory.motion.nccs_racks.historical_label=false;
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK/);
});
test('a data chart cannot assert an unsupported factual number',()=>{
 const x=sample();x.inventory.facts.yoy.source_verified=false;
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK/);
});
test('calculated share must remain clearly identified as a derivation',()=>{
 const x=sample();x.inventory.facts.share.derived=false;
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK.*Derived/);
});
test('forecast cannot be relabeled as already realized earnings',()=>{
 const x=sample();x.beats[7].options[0].shot.right.sub='已經實現';
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK.*Forecast/);
});
test('anchors referencing missing words are refused',()=>{
 const x=sample();x.beats[2].options[0].shot.at='@b03:火星';
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK.*anchor/);
});
test('source-quality fallback cannot be falsely counted as real moving footage',()=>{
 const x=sample();
 x.beats[0].options.push({shot:{scene:'vp-ask',until:'@b02',says:'An abstract question card, but not a real video source',lines:['AI 的錢']},media_role:'graphic',fact_ids:[]});
 delete x.inventory.motion.nccs_racks;
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK.*moving footage/);
});
test('misleading alternative is dropped while a documented and approved option remains',()=>{
 const x=sample();
 x.beats[9].options.unshift({shot:{scene:'v-full',clip:'pretend_news',says:'Make generic footage pretend to be NVIDIA breaking news',source:'NVIDIA 2026'},
  media_role:'motion',asset_id:'pretend_news'});
 const d=directNews(x);
 assert.equal(d.scenes[9].scene,'vp-verdict');
 assert.ok(d.plan.summary.notes.some(s=>s.startsWith('b10:')));
});
test('three consecutive text-only scenes fail the attention-rhythm gate',()=>{
 const x=sample();
 x.beats[7].options[0].shot={scene:'vp-words',until:'@b09',says:'Editorial text pretending to explain earnings outlook',words:[{text:'預估',at:'@b08:預估'}]};
 x.beats[8].options[0].shot={scene:'vp-list',until:'@b10',says:'Another list that explains why future quarters differ',items:[{text:'多一週'}]};
 x.beats[9].options[0].shot={scene:'vp-verdict',says:'Just an ending title without a visual explanation',lines:['記得']};
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK.*Text card streak/);
});
test('a claim cannot use bogus official URL metadata',()=>{
 const x=sample();x.inventory.official.url='https://random-website.invalid/fake-article';
 assert.throws(()=>directNews(x),/DIRECTOR_BLOCK.*Original publication/);
});
