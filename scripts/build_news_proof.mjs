import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 經過 verify_news_capture.mjs 才能把真實網站的 PNG 送入原版 vpro。
// Usage: node scripts/build_news_proof.mjs <jobs.json> <film-directory>
const [jobsFile, filmDir] = process.argv.slice(2);
if(!jobsFile || !filmDir)throw Error('Usage: node scripts/build_news_proof.mjs <jobs.json> <film-directory>');
const base=path.dirname(path.resolve(jobsFile)), d=path.resolve(filmDir);
const proof=JSON.parse(fs.readFileSync(path.join(base,'docs','capture_report.json'),'utf8'));
if(proof.status!=='CAPTURE_CHECK_PASSED' || !proof.selected || proof.fixture)throw Error('真實新聞驗證未通過；禁止生成正式來源鏡頭');
const s=proof.selected, r=s.hit.rect;
const round=v=>Math.round(v*10000)/10000;
const hl={x:round(r[0]/1600),y:round(r[1]/1000),w:round(r[2]/1600),h:round(r[3]/1000),at:'@b01:營收'};
if([hl.x,hl.y,hl.w,hl.h].some(n=>!Number.isFinite(n)) || hl.w<=0 || hl.h<=0)throw Error('關鍵字座標不合法');
fs.mkdirSync(path.join(d,'assets','img'),{recursive:true});
fs.copyFileSync(s.image,path.join(d,'assets','img','nvidia_actual.png'));
const script={
 voice:'zh-TW-YunJheNeural',pre:0.15,
 lines:[
  {id:'b01',text:'NVIDIA 官方財報，單季營收一千一百五十八億美元。',gap:0.3},
  {id:'b02',text:'這份財報的資料中心業務，更是重要的營收來源。',gap:0.3},
  {id:'b03',text:'這是一家公司的營收，不是全球人工智慧的全部支出。',gap:0.4}
 ]};
fs.writeFileSync(path.join(d,'script.json'),JSON.stringify(script,null,2)+'\n');
const lines=[
 'window.ready=(async()=>{',
 " const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
 ' const K=await KIT.use(F);',
 " await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / NEWS PROOF'});",
 " KIT_UNCLE.preset('shop',{bg:'assets/img/nvidia_actual.png'});",
 ' await K.film([',
 "  {scene:'vp-paper',until:'@b02',says:'官方財報的原始頁面顯示營收數字，並高亮真正的新聞原文',img:'assets/img/nvidia_actual.png',mast:'NVIDIA Investor Relations',brow:'2026-11-17 / OFFICIAL SOURCE',title:'官方財報',hl:["+JSON.stringify(hl)+"]},",
 "  {scene:'vp-number',until:'@b03',says:'NVIDIA 官方公布 FY27 Q3 總營收 115.8 billion 美元',bg:'assets/img/nvidia_actual.png',value:'115.8',unit:'B USD',label:'FY27 Q3 營收',at:'@b02:資料中心'},",
 "  {scene:'vp-verdict',says:'NVIDIA 一家公司營收不可當成全球 AI 投資總額',lines:['一家公司的營收','不是全球支出'],at:['@b03:一家','@b03:不是'],bg:'assets/img/nvidia_actual.png',hero:true}",
 ' ]);',
 ' return K.go();',
 '})();'
];
fs.writeFileSync(path.join(d,'film.js'),lines.join('\n')+'\n');
const image=fs.readFileSync(path.join(d,'assets','img','nvidia_actual.png'));
const manifest={status:'INTERNAL_ONLY_NOT_PUBLISHED',real_source_url:s.url,source_image_sha256:crypto.createHash('sha256').update(image).digest('hex'),highlight:hl,keyword:s.hit.keyword,source_review:'CAPTURE_CHECK_PASSED; human review still required',render_status:'NOT_YET_RENDERED'};
fs.writeFileSync(path.join(d,'EVIDENCE_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('影片來源已接入 vpro:',manifest.real_source_url);
