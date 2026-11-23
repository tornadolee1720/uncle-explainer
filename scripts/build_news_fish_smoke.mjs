import fs from 'node:fs';
import path from 'node:path';
const [jobs,film]=process.argv.slice(2);
if(!jobs||!film)throw Error('Usage: node scripts/build_news_fish_smoke.mjs <jobs.json> <film_dir>');
const d=path.resolve(film),report=JSON.parse(fs.readFileSync(path.join(path.dirname(path.resolve(jobs)),'docs','capture_report.json'),'utf-8'));
if(report.status!=='CAPTURE_CHECK_PASSED'||report.fixture||!report.selected?.valid)throw Error('No verified real NVIDIA source');
const img=path.join(d,'assets','img','nvidia_actual.png');
if(!fs.existsSync(img))throw Error('Missing real-source image from build_news_proof.mjs');
const r=report.selected.hit.rect;
const hl={x:r[0]/1600,y:r[1]/1000,w:r[2]/1600,h:r[3]/1000,at:'@b02:營收'};
const script={voice:'FISH_PROJECT_TAIWAN_AD_MALE',pre:0,lines:[
{id:'b01',text:'你以為 AI 最值錢的是聊天視窗？先看 NVIDIA 公布的財報。',gap:0},
{id:'b02',text:'單季營收一千一百五十八億美元，年增百分之一百零三。',gap:0},
{id:'b03',text:'其中資料中心就有一千零七十六億美元。',gap:0},
{id:'b04',text:'這是 NVIDIA 一家公司的營收，不是全球 AI 的全部投資。',gap:0}
]};
fs.writeFileSync(path.join(d,'script.json'),JSON.stringify(script,null,2)+'\n');
const filmjs=[
'window.ready=(async()=>{',
" const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
' const K=await KIT.use(F);',
" await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / NVIDIA NEWS'});",
" KIT_UNCLE.preset('shop',{bg:'assets/img/nvidia_actual.png'});",
' await K.film([',
" {scene:'vp-ask',until:'@b02',says:'問題開場：AI 背後的硬體與資本',bg:'assets/img/nvidia_actual.png',lines:['AI 的錢','流向誰？'],at:['@b01','@b01:財報']},",
" {scene:'vp-paper',until:'@b03',says:'NVIDIA 官方財報截圖，單季營收是真實來源數字',img:'assets/img/nvidia_actual.png',mast:'NVIDIA Investor Relations',title:'官方財報',brow:'2026-11-17 / OFFICIAL',hl:["+JSON.stringify(hl)+"]},",
" {scene:'vp-number',until:'@b04',says:'資料中心 107.6B 美元來自官方財報',bg:'assets/img/nvidia_actual.png',value:'107.6',unit:'B USD',label:'資料中心營收',at:'@b03:資料中心'},",
" {scene:'vp-words',says:'區分單一公司營收與全球 AI 的全部投資',bg:'assets/img/nvidia_actual.png',words:[{text:'NVIDIA 營收',at:'@b04:營收'},{text:'不等於全球投資',at:'@b04:不是'}]}",
' ]);','return K.go();','})();'
].join('\n');
fs.writeFileSync(path.join(d,'film.js'),filmjs+'\n');
fs.writeFileSync(path.join(d,'FISH_INPUT_EXPECTED.json'),JSON.stringify({mode:'full_fish_master',voice_key:'taiwan_ad_male',lines:script.lines.map(x=>({id:x.id,text:x.text})),actual_voice_not_yet_imported:true,scope:'INTERNAL_ONLY'},null,2));
console.log('Fish 4-line proof prepared with verified source and vpro: '+d);
