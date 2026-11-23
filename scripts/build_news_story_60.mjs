import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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
const lines=[
 {id:'b01',text:'你每天問 AI 一個問題，背後到底是誰，在收算力的錢？',gap:.28},
 {id:'b02',text:'NVIDIA 十一月十七日公布財報，單季營收一千一百五十八億美元。',gap:.28},
 {id:'b03',text:'和去年同期相比，成長百分之一百零三，幾乎翻了一倍。',gap:.30},
 {id:'b04',text:'這筆營收九成以上來自資料中心，一季就有一千零七十六億美元。',gap:.3},
 {id:'b05',text:'這些錢不是憑空出現，是企業在買晶片、伺服器和運算設備。',gap:.28},
 {id:'b06',text:'你看到的 AI 服務，背後是一排排機櫃、網路和電力。',gap:.3},
 {id:'b07',text:'但這是 NVIDIA 一家公司的營收，不是全世界投在 AI 的錢。',gap:.35},
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
{scene:'vp-ask',until:'@b02',says:'從觀眾每天使用 AI 的情境提出真正的產業問題',bg:B,lines:['AI 的錢','流向哪裡？'],at:['@b01','@b01:算力']},
{scene:'vp-paper',until:'@b03',says:'真實 NVIDIA 原始頁面與來源日期；高亮原文實際文字',img:I,title:'官方財報原文',mast:'NVIDIA Investor Relations',brow:'2026-11-17 / VERIFIED',hl:[hl]},
{scene:'vp-number',until:'@b04',says:'官方同比成長百分之一百零三',bg:I,title:'跟去年比',value:'103%',unit:'年增',label:'FY27 Q3 總營收 115.8B USD',at:'@b03:成長'},
{scene:'vp-share',until:'@b05',says:'根據官方 107.6/115.8 計算資料中心營收占比約92.9%',bg:B,value:'92.9%',label:'資料中心占總營收',note:'107.6 ÷ 115.8B USD（推算）',at:'@b04:資料中心'},
{scene:'vp-photo',until:'@b05:伺服器',says:'展示有授權的真實機櫃照片，清楚標非 NVIDIA 現場',img:B,title:'資料中心硬體',brow:'實景示意 / 非 NVIDIA 機房',source:broll.attribution+' / '+(broll.source_kind==='WIKIMEDIA_CC0'?'CC0':'NASA 媒體使用規範'),tags:[{text:'真正的硬體設備',at:'@b05:晶片'}]},
{scene:'vp-chain',until:'@b07',says:'把抽象雲端服務翻譯成硬體供給流程，示意圖不能當紀錄片實景',bg:B,title:'算力背後的硬體',items:[
 {title:'運算晶片',sub:'處理資料',at:'@b05:晶片'},
 {title:'伺服器',sub:'裝載與運算',at:'@b05:伺服器'},
 {title:'資料中心',sub:'電力與網路',img:B,at:'@b06:機櫃'}
]},
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
const film=[
'window.ready=(async()=>{',
" const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
' const K=await KIT.use(F);',
" await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / NEWS EXPLAINER'});",
" KIT_UNCLE.preset('news',{bg:'assets/img/data_center_cc0.jpg'});",
' await K.film('+JSON.stringify(scenes,null,2)+');',
' return K.go();','})();'
].join('\n');
fs.writeFileSync(path.join(D,'film.js'),film+'\n');
const manifest={
status:'INTERNAL_PREVIEW_ONLY',format:'9:16',film_engine:'native_wallstreet_vpro',scenes:scenes.length,lines:lines.length,
voice_state:'MISSING_SECURE_FISH_60_MASTER',may_publish:false,human_review_required:true,
evidence:{url:shot.url,sha256:crypto.createHash('sha256').update(verifiedImage).digest('hex'),highlight:hl},
broll:{source:broll.source_page,author:broll.attribution,license:broll.license,description:broll.depiction,sha256:broll.sha256},
facts:[{claim:'FY27 Q3 revenue',usd_b:115.8},{claim:'YoY growth',pct:103},{claim:'Data center revenue',usd_b:107.6},{claim:'Data center share (derived)',pct:92.9},{claim:'FY27 Q4 revenue guidance',usd_b:130,estimated:true,band_pct:3}],
note:'Real official NVIDIA screenshot; separate clearly credited historical data-center illustration not NVIDIA facility; no third-party stock footage used.'
};
fs.writeFileSync(path.join(D,'NEWS_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(D,'NEWS_SOURCE_CREDITS.md'),
'# 新聞片來源與製作註記\n\n'+
'* [NVIDIA 官方財報]('+shot.url+')，2026-11-17，引用數字與截圖供內部評論測試\n'+
'* [機櫃實景示意]('+broll.source_page+')，'+broll.attribution+'，'+broll.license+'；'+broll.depiction+'；已做裁切與動畫；不代表 NVIDIA 現場或 NASA 背書\n'+
'* 資料中心比重：107.6 ÷ 115.8 ≈ 92.9%，為官方數字衍生計算，不是 NVIDIA 單獨公布的比重\n'+
'* 下一季 130B ±3% 為公司預估，且比一般季度多一週，非實際營收\n');
console.log(JSON.stringify({status:'10_SHOT_NEWS_STORY_READY',scenes:scenes.length,lines:lines.length,source:shot.url,broll:broll.source_page,voice:'NOT_YET_ATTACHED'}));
