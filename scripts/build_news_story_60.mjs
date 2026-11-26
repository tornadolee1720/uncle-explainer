import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {directNews} from './director_engine.mjs';

// Build a cinematic multi-format-native 9:16 news film; do not swap verified screenshots for mockups.
// Requires validated official screenshot + separately verified CC0 documentary still.
// Usage: node scripts/build_news_story_60.mjs <jobs.json> <fresh film directory>
const [jobsFile,dir]=process.argv.slice(2);
if(!jobsFile||!dir)throw Error('Usage: node scripts/build_news_story_60.mjs <jobs.json> <film-dir>');
const D=path.resolve(dir),base=path.dirname(path.resolve(jobsFile));
const report=JSON.parse(fs.readFileSync(path.join(base,'docs','capture_report.json'),'utf8'));
if(report.status!=='CAPTURE_CHECK_PASSED'||report.fixture||!report.selected?.valid)throw Error('Official NVIDIA screenshot not verified');
const shot=report.selected,rect=shot.hit?.rect;
if(!Array.isArray(rect)||rect.length!==4)throw Error('No real text coordinates');
const hl={x:rect[0]/1600,y:rect[1]/1000,w:rect[2]/1600,h:rect[3]/1000,at:'@b02:營收'};
const verifiedImage=fs.readFileSync(shot.image);
if(verifiedImage.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Source screenshot is not PNG');
fs.mkdirSync(path.join(D,'assets','img'),{recursive:true});
fs.writeFileSync(path.join(D,'assets','img','nvidia_press_real.png'),verifiedImage);
const broll=JSON.parse(fs.readFileSync(path.join(D,'BROLL_CREDITS.json'),'utf8'));
if(!['WIKIMEDIA_CC0','NASA_EDITORIAL'].includes(broll.source_kind) || broll.original_size_bytes<10000 || !/^https:\/\/(commons\.wikimedia\.org|www\.nas\.nasa\.gov)\//.test(broll.source_page))throw Error('Broll source provenance invalid');
const brollPath=path.join(D,broll.local_file);
if(!fs.existsSync(brollPath) || crypto.createHash('sha256').update(fs.readFileSync(brollPath)).digest('hex')!==broll.sha256)
 throw Error('CC0 photo checksum mismatch');
const motion=JSON.parse(fs.readFileSync(path.join(D,'NASA_MOTION_CREDITS.json'),'utf8'));
const motionSources=motion.sources||[];
for(const name of ['nccs_racks','nccs_wall']){
 const m=motionSources.find(x=>x.name===name);
 const frames=path.join(D,'assets','clips',name);
 if(!m || m.source_kind!=='NASA_HISTORICAL_REAL_BROLL' || m.frames<180 ||
    !fs.existsSync(path.join(frames,'0001.jpg')))
   throw Error('Actual source-verified NASA motion not present: '+name);
}
const lines=[
 {id:'b01',text:'你每天問 AI 一個問題，背後到底是誰，在收算力的錢？',gap:.28},
 {id:'b02',text:'NVIDIA，十一月十七日公布財報，單季營收一千一百五十八億美元。',gap:.28},
 {id:'b03',text:'和去年同期相比，成長百分之一百零三，幾乎翻了一倍。',gap:.30},
 {id:'b04',text:'這筆營收九成以上來自資料中心，一季就有一千零七十六億美元。',gap:.3},
 {id:'b05',text:'這些錢不是憑空出現，是企業在買晶片、伺服器和運算設備。',gap:.28},
 {id:'b06',text:'你看到的 AI 服務，背後是一排排機櫃、網路和電力。',gap:.3},
 {id:'b07',text:'但這是 NVIDIA，一家公司的營收，不是全世界投在 AI 的錢。',gap:.35},
 {id:'b08',text:'下一季公司預估約一千三百億美元，上下百分之三。注意，這還不是實績。',gap:.35},
 {id:'b09',text:'而且下一季多了一週，不能只看季增金額，就認為成長突然加速。',gap:.28},
 {id:'b10',text:'真正值得追問的是，企業對算力的投資，還能持續多久？',gap:.38}
];
const script={voice:'PENDING_APPROVED_FISH_MASTER',pre:.22,rate:'+0%',lines};
fs.writeFileSync(path.join(D,'script.json'),JSON.stringify(script,null,2)+'\n');
// Five actual-news facts; one derived share is explicitly labeled as calculated.
// 10 shots, intentionally alternating documentary still, original source, 2.5D explanation and numeric models.
const B='assets/img/data_center_cc0.jpg',I='assets/img/nvidia_press_real.png';
const scenes=[
{scene:'v-full',until:'@b02',says:'真實運動影像：NASA 2010 NCCS 超級電腦 B-roll；讓觀眾先看見硬體，非 NVIDIA 現場',clip:'nccs_racks',from:0,rate:1,title:'AI 的錢<em>流向哪裡？</em>',brow:'2010 NASA 資料中心實景示意',source:'NASA/Goddard｜非 NVIDIA 實際機房',avatar:false,dim:.31,hero:true},
{scene:'vp-paper',until:'@b03',says:'真實 NVIDIA 原始頁面與來源日期；高亮原文實際文字',img:I,title:'官方財報原文',mast:'NVIDIA Investor Relations',brow:'2026-11-17 / VERIFIED',hl:[hl]},
{scene:'vp-number',until:'@b04',says:'官方同比成長百分之一百零三',bg:I,title:'跟去年比',value:'103%',unit:'年增',label:'FY27 Q3 總營收 115.8B USD',at:'@b03:成長'},
{scene:'vp-share',until:'@b05',says:'根據官方 107.6/115.8 計算資料中心營收占比約92.9%',bg:B,value:'92.9%',label:'資料中心占總營收',note:'107.6 ÷ 115.8B USD（推算）',at:'@b04:資料中心'},
{scene:'vp-photo',until:'@b05:伺服器',says:'展示有授權的真實機櫃照片，清楚標非 NVIDIA 現場',img:B,title:'資料中心硬體',brow:'實景示意 / 非 NVIDIA 機房',source:broll.attribution+' / '+(broll.source_kind==='WIKIMEDIA_CC0'?'CC0':'NASA 媒體使用規範'),tags:[{text:'真正的硬體設備',at:'@b05:晶片'}]},
{scene:'v-clip',until:'@b07',says:'NASA Goddard 2010 NCCS 視覺化牆真實移動影片，說明算力基建；不冒充 NVIDIA 機房',clip:'nccs_wall',from:0,rate:1,title:'AI 的<em>實體基建</em>',brow:'NASA Goddard 2010 歷史影像',source:'NASA/Goddard｜示意非 NVIDIA 機房',tags:[{text:'機櫃、網路與電力',at:'@b06:機櫃'}],avatar:false},
{scene:'vp-words',until:'@b08',says:'澄清 NVIDIA 的單一公司營收不是全球 AI 總投資',bg:I,words:[
 {text:'單一公司',at:'@b07:NVIDIA'},
 {text:'不等於全球',at:'@b07:不是',fx:'flip'}]},
{scene:'vp-versus',until:'@b09',says:'以視覺比較區分已實現的 FY27Q3 和公司預測 FY27Q4',bg:I,title:'實績與展望不同',left:{name:'第三季實績',value:'115.8B',sub:'USD / 已公布',at:'@b08'},right:{name:'第四季預估',value:'130B',sub:'USD ±3% / 非實績',at:'@b08:預估'}},
{scene:'vp-list',until:'@b10',says:'避免把多一週的季數直接比較為成長加速',bg:B,title:'比較財報時注意',items:[
 {text:'下季多一週',mark:'1',at:'@b09:多了一週',hl:true},
 {text:'不能直接比增速',mark:'2',at:'@b09:不能'}
]},
{scene:'vp-verdict',says:'收尾提出值得觀察的下一個產業問題，不是投資建議',bg:B,lines:['AI 投資','還能走多遠？'],at:['@b10:投資','@b10:多久']}
];

// The choices below are narrative hypotheses, NOT arbitrary scene choreography.
// Director V1 scores original-vpro candidates, verifies roles/sources/anchors,
// and refuses an all-text fallback. Claude Code may later author equivalent briefs.
const intents=['hook','evidence','scale','share','object','mechanism','correction','forecast','caveat','takeaway'];
const gains=[
 '觀眾先看見實體運算設備，知道 AI 並非只是一個聊天視窗',
 '看見 NVIDIA 官方原文，而不是接受沒有來源的大數字',
 '理解營收成長速度，且知道 103% 是同比而非季度增長',
 '理解資料中心收入占比約 92.9%，且看見推算方式',
 '看見真實機櫃外觀，同時理解這不是 NVIDIA 工廠畫面',
 '讓雲端算力與機櫃網路電力的實體世界建立連結',
 '釐清 NVIDIA 公司營收與全球 AI 投資不能直接畫等號',
 '區分已發生的單季營收與下一季公司的展望數字',
 '理解多出一週會影響季度直接比較，避免錯誤推論',
 '記住下一個值得追蹤的問題，而不是被誘導投資'
];
const roles=['motion','official','graphic','graphic','photo','motion','graphic','graphic','graphic','graphic'];
const assetIds=['nccs_racks','nvidia_press',null,null,B,'nccs_wall',null,null,null,null];
const factIds=[[],['revenue'],['yoy'],['datacenter_share'],[],[],['company_scope'],['guidance'],['extra_week'],[]];
const inventory={
 official:{asset:I,url:shot.url,sha256:crypto.createHash('sha256').update(verifiedImage).digest('hex'),verified:true},
 motion:Object.fromEntries(motionSources.map(x=>[x.name,{frames:x.frames,provenance_verified:x.source_kind==='NASA_HISTORICAL_REAL_BROLL',historical_label:/非 NVIDIA/.test(x.label||'')} ])),
 photos:{[B]:{sha256:broll.sha256,provenance_verified:true}},
 facts:{
  revenue:{source_verified:true,value:'115.8B USD',source:shot.url},
  yoy:{source_verified:true,value:'103%',source:shot.url},
  datacenter_share:{source_verified:true,derived:true,value:'107.6/115.8=92.9%',source:shot.url},
  company_scope:{source_verified:true,value:'company revenue not total global AI investment',source:shot.url},
  guidance:{source_verified:true,estimate:true,value:'130B USD ±3%',source:shot.url},
  extra_week:{source_verified:true,value:'FY27Q4 has one additional week',source:shot.url}
 }
};
const brief=scenes.map((scene,i)=>({
 id:lines[i].id,text:lines[i].text,intent:intents[i],viewer_gain:gains[i],
 options:[{shot:scene,media_role:roles[i],asset_id:assetIds[i],fact_ids:factIds[i],
  why:'Use '+intents[i]+' to explain '+gains[i],editorial_strength:2}]
}));
// Real alternatives matter: the director can reject missing/invalid footage,
// diversify repetitive scenes, or block an ungrounded topic.
brief[0].options.push({shot:{scene:'vp-ask',until:'@b02',says:'用問題吸引觀眾，但失去真實設備運動畫面的證明力',bg:B,
  lines:['AI 的錢','流向哪裡？'],at:['@b01','@b01:算力']},media_role:'graphic',
  why:'Question-only fallback if source footage is not available'});
brief[4].options.push({shot:{scene:'v-clip',until:'@b05:伺服器',
  says:'用實際的 NASA 2010 年機房影片展示實體硬體，但比照片更容易重複',clip:'nccs_racks',
  title:'資料中心硬體',brow:'NASA 2010 非 NVIDIA',source:'NASA/Goddard｜非 NVIDIA 機房',avatar:false},
  media_role:'motion',asset_id:'nccs_racks',why:'Physical-motion alternative to a licensed still'});
brief[5].options.push({shot:{scene:'vp-chain',until:'@b07',says:'使用抽象因果鏈代替實拍來解釋算力硬體',bg:B,
   title:'算力背後的硬體',items:[{title:'晶片',at:'@b05:晶片'},{title:'伺服器',at:'@b05:伺服器'},
    {title:'資料中心',at:'@b06:機櫃'}]},media_role:'graphic',fact_ids:['company_scope'],
   why:'Only if footage source is genuinely unavailable'});
brief[8].options.push({shot:{scene:'vp-words',until:'@b10',says:'用強對比兩段文字提醒觀眾季度多出一週',bg:B,
 words:[{text:'多一週',at:'@b09:多了一週'},{text:'別直接比',at:'@b09:不能'}]},media_role:'graphic',fact_ids:['extra_week'],
 why:'More forceful fact-text alternative to checklist'});
brief[9].options.push({shot:{scene:'vp-ask',says:'以問題結束，不應跳到投資預測',bg:B,
  lines:['算力投資','還能持續？'],at:['@b10','@b10:多久']},media_role:'graphic',
  why:'Question-only ending is viable but less conclusive'});
const decision=directNews({beats:brief,inventory,
 policy:{min_motion:2,min_proof:1,min_physical_share:.35,min_scene_types:6,max_text_streak:2}});
const directedScenes=decision.scenes;
const directorPlan={...decision.plan,script_version:'NVIDIA_FY27_Q3_2026_NOV17',input_count:brief.length,
 guardrails:['No simulation passes as factual documentary still','No global spend claim from company revenue',
 'No projection presented as realized earnings','All NASA historical clips labeled NOT NVIDIA'],
 proof_source_sha256:inventory.official.sha256};
fs.writeFileSync(path.join(D,'DIRECTOR_BRIEF.json'),JSON.stringify({beats:brief,source_refs:inventory,policy:'strict_news'},null,2)+'\n');
fs.writeFileSync(path.join(D,'DIRECTOR_PLAN.json'),JSON.stringify(directorPlan,null,2)+'\n');
const film=[
'window.ready=(async()=>{',
" const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
' const K=await KIT.use(F);',
" await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / NEWS EXPLAINER'});",
" KIT_UNCLE.preset('news',{bg:'assets/img/data_center_cc0.jpg'});",
' await K.film('+JSON.stringify(directedScenes,null,2)+');',
' return K.go();','})();'
].join('\n');
fs.writeFileSync(path.join(D,'film.js'),film+'\n');
const manifest={
status:'INTERNAL_PREVIEW_ONLY',format:'9:16',film_engine:'native_wallstreet_vpro',scenes:directedScenes.length,lines:lines.length,
director_status:directorPlan.summary.status,director_plan_file:'DIRECTOR_PLAN.json',voice_state:'MISSING_SECURE_FISH_60_MASTER',motion_scene_count:2,news_proof_scene_count:1,may_publish:false,human_review_required:true,
evidence:{url:shot.url,sha256:crypto.createHash('sha256').update(verifiedImage).digest('hex'),highlight:hl},
motion_broll:motionSources.map(x=>({source:x.source_page,asset:x.raw_url,scene:x.name,frames:x.frames,credit:x.at,license:x.license})),
broll:{source:broll.source_page,author:broll.attribution,license:broll.license,description:broll.depiction,sha256:broll.sha256},
facts:[{claim:'FY27 Q3 revenue',usd_b:115.8},{claim:'YoY growth',pct:103},{claim:'Data center revenue',usd_b:107.6},{claim:'Data center share (derived)',pct:92.9},{claim:'FY27 Q4 revenue guidance',usd_b:130,estimated:true,band_pct:3}],
note:'Real official NVIDIA screenshot; separate clearly credited historical data-center illustration not NVIDIA facility; no third-party stock footage used.'
};
fs.writeFileSync(path.join(D,'NEWS_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(D,'NEWS_SOURCE_CREDITS.md'),
'# 新聞片來源與製作註記\n\n'+
'* [NVIDIA 官方財報]('+shot.url+')，2026-11-17，引用數字與截圖供內部評論測試\n'+
'* [NASA 2010 年真實影片]('+motionSources[0].source_page+')，NASA/Goddard Space Flight Center，僅使用無聲影片畫面，不含影片原配樂；非 NVIDIA 機房，依 NASA Media Usage Guidelines 使用\n'+
'* [機櫃實景示意]('+broll.source_page+')，'+broll.attribution+'，'+broll.license+'；'+broll.depiction+'；已做裁切與動畫；不代表 NVIDIA 現場或 NASA 背書\n'+
'* 資料中心比重：107.6 ÷ 115.8 ≈ 92.9%，為官方數字衍生計算，不是 NVIDIA 單獨公布的比重\n'+
'* 下一季 130B ±3% 為公司預估，且比一般季度多一週，非實際營收\n');
console.log(JSON.stringify({status:'DIRECTOR_SELECTED_AND_10_SHOT_STORY_READY',director:directorPlan.summary.status,scenes:directedScenes.length,lines:lines.length,source:shot.url,broll:broll.source_page,voice:'NOT_YET_ATTACHED'}));
