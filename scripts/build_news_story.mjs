import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 來源先行：只准用已通過官方截圖驗證的實際 PNG，不接受替代新聞頁。
// Usage: node scripts/build_news_story.mjs <jobs.json> <existing-film-directory>
const [jobsFile,dir] = process.argv.slice(2);
if (!jobsFile || !dir) throw Error('Usage: node scripts/build_news_story.mjs <jobs.json> <film-directory>');
const D=path.resolve(dir),base=path.dirname(path.resolve(jobsFile));
const m=JSON.parse(fs.readFileSync(path.join(base,'docs','capture_report.json'),'utf8'));
if(m.fixture || m.status!=='CAPTURE_CHECK_PASSED' || !m.selected?.valid)throw Error('官方來源驗收未成功，停止影片製作');
const chosen=m.selected;
const png=fs.readFileSync(chosen.image);
if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('截圖不是有效 PNG');
const rect=chosen.hit?.rect;
if(!Array.isArray(rect) || rect.length!==4 || rect.some(x=>!Number.isFinite(x)))throw Error('缺少可見的關鍵字座標');
const rel={x:rect[0]/1600,y:rect[1]/1000,w:rect[2]/1600,h:rect[3]/1000,at:'@b02:營收'};
if(Object.values(rel).some((n)=>typeof n==='number' && (n<0||n>1)))throw Error('高亮座標超出截圖範圍');
fs.mkdirSync(path.join(D,'assets','img'),{recursive:true});
fs.writeFileSync(path.join(D,'assets','img','official_nvidia.png'),png);
const lines=[
{id:'b01',text:'你以為 AI 最值錢的是聊天視窗？先看看 NVIDIA 公布的官方財報。',gap:.35},
{id:'b02',text:'二〇二七財年第三季，單季營收一千一百五十八億美元。',gap:.35},
{id:'b03',text:'比一年前成長百分之一百零三。這不是普通的成長速度。',gap:.35},
{id:'b04',text:'真正的大頭來自資料中心業務，營收一千零七十六億美元。',gap:.35},
{id:'b05',text:'從晶片、伺服器到整座資料中心，人工智慧需要大量實體運算設備。',gap:.35},
{id:'b06',text:'但要注意，這是 NVIDIA 一家公司的營收，不是全球人工智慧的全部投資。',gap:.35},
{id:'b07',text:'公司還預估下一季營收約一千三百億美元。這只是展望，不是已經賺到的錢。',gap:.35},
{id:'b08',text:'而且下一季比一般季度多了一週，不能直接比較兩季數字就判斷成長速度。',gap:.35},
{id:'b09',text:'真正值得追的，是企業未來還願意為算力投入多少錢。',gap:.45},
];
const script={voice:'zh-TW-YunJheNeural',rate:'+0%',pre:.25,lines};
fs.writeFileSync(path.join(D,'script.json'),JSON.stringify(script,null,2)+'\n');
const js=[
 'window.ready=(async()=>{',
 " const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
 ' const K=await KIT.use(F);',
 " await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / NEWS EXPLAINER'});",
 " KIT_UNCLE.preset('shop',{bg:'assets/img/official_nvidia.png'});",
 ' await K.film([',
 " {scene:'vp-ask',until:'@b02',says:'用真實 AI 使用情境引出 NVIDIA 財報',bg:'assets/img/official_nvidia.png',lines:['AI 的錢','流向哪裡？'],at:['@b01','@b01:財報']},",
 " {scene:'vp-paper',until:'@b03',says:'NVIDIA 官方公布單季營收；只有這鏡是官網實際截圖',img:'assets/img/official_nvidia.png',mast:'NVIDIA Investor Relations',brow:'2026-11-17 / OFFICIAL',title:'財報原始證據',hl:["+JSON.stringify(rel)+"]},",
 " {scene:'vp-number',until:'@b04',says:'總營收同比成長 103%，與財報官方數據一致',bg:'assets/img/official_nvidia.png',value:'103%',unit:'年增',label:'相較去年同期',at:'@b03:成長'},",
 " {scene:'vp-number',until:'@b05',says:'資料中心營收107.6 billion美元',bg:'assets/img/official_nvidia.png',value:'107.6',unit:'B USD',label:'資料中心單季營收',at:'@b04:資料中心'},",
 " {scene:'vp-chain',until:'@b06',says:'原理示意：晶片到伺服器與資料中心，非新聞現場實拍',bg:'assets/img/official_nvidia.png',title:'從硬體到算力',items:[{title:'運算晶片',sub:'示意圖',at:'@b05:晶片'},{title:'伺服器',sub:'部署設備',at:'@b05:伺服器'},{title:'資料中心',sub:'基礎設施',at:'@b05:資料中心'}]},",
 " {scene:'vp-words',until:'@b07',says:'區分一家公司的營收與全球AI產業總支出',bg:'assets/img/official_nvidia.png',words:[{text:'NVIDIA 營收',at:'@b06:NVIDIA'},{text:'不是全球投資',at:'@b06:不是'}]},",
 " {scene:'vp-versus',until:'@b08',says:'130B是下一季展望並非實績',bg:'assets/img/official_nvidia.png',title:'實績 vs 預估',left:{name:'本季實績',value:'115.8B',sub:'FY27 Q3',at:'@b07'},right:{name:'下一季預估',value:'130B',sub:'FY27 Q4 · ±3%',at:'@b07:預估'}},",
 " {scene:'vp-list',until:'@b09',says:'提醒下季多一週，不能把預測當作已完成的營收',bg:'assets/img/official_nvidia.png',title:'財報比較要注意',items:[{text:'下季多一週',at:'@b08:多了一週',mark:'1'},{text:'展望不是實績',at:'@b08:不能',mark:'2'}]},",
 " {scene:'vp-ask',says:'用追蹤問題而非預測或投資建議作結尾',bg:'assets/img/official_nvidia.png',lines:['算力投資','還能持續？'],at:['@b09','@b09:投入']}",
 ' ]);',
 ' return K.go();',
 '})();'
].join('\n');
fs.writeFileSync(path.join(D,'film.js'),js+'\n');
const manifest={
status:'INTERNAL_EVIDENCE_VIDEO_NOT_PUBLISHED',voice_status:'EDGE_TTS_TEMPORARY_UNTIL_FISH_APPROVED',
official_page:chosen.url,source_image_sha256:crypto.createHash('sha256').update(png).digest('hex'),
highlight:rel,script_line_count:lines.length,source_screenshot_verified:true,human_review_required:true,
expected_presentation:'Original vpro scene rendering with a single true-source vp-paper shot and clearly labeled schematic scenes'
};
fs.writeFileSync(path.join(D,'EVIDENCE_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Created source-bound story with '+lines.length+' voice lines; source='+chosen.url);
