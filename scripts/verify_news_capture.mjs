import fs from 'node:fs';
import path from 'node:path';

// 這是「真實截圖候選」閘門，不是授權或內容真實性的最終人工認證。
// Usage: node scripts/verify_news_capture.mjs <jobs.json> [--fixture]
const jobsFile = process.argv[2];
if (!jobsFile) { console.error('Usage: node scripts/verify_news_capture.mjs <jobs.json> [--fixture]'); process.exit(2); }
const fixture = process.argv.includes('--fixture');
const base = path.dirname(path.resolve(jobsFile));
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
const metadataFile = path.join(base, 'docs', 'news.json');
const metadata = fs.existsSync(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile, 'utf8')) : {};
const reportFile = path.join(base, 'docs', 'capture_report.json');
fs.mkdirSync(path.dirname(reportFile), {recursive:true});
const requiredHostnames = new Set(['investor.nvidia.com', 'nvidianews.nvidia.com']);
const checked = [];
function pngOK(file) {
 if(!fs.existsSync(file) || fs.statSync(file).size < 1000) return false;
 const h = fs.readFileSync(file).subarray(0,8).toString('hex');
 return h === '89504e470d0a1a0a';
}
for (const job of jobs) {
 const m=metadata[job.id] || {};
 const errors=[];
 let url;
 try {url=new URL(job.url);} catch {errors.push('BAD_URL');}
 if(url) {
   if(fixture) {if(url.protocol!=='file:')errors.push('FIXTURE_MUST_BE_FILE_URL');}
   else if(url.protocol!=='https:' || !requiredHostnames.has(url.hostname)) errors.push('NOT_APPROVED_OFFICIAL_HOST');
 }
 if(!m.url || m.url!==job.url)errors.push('METADATA_SOURCE_MISMATCH');
 if(!/nvidia/i.test(String(m.title||'')+' '+String(m.h1text||'')))errors.push('PAGE_TITLE_NOT_NVIDIA');
 if(/captcha|access denied|blocked|verify you are human|403 forbidden/i.test(String(m.title||'')+' '+String(m.h1text||'')))errors.push('BLOCK_PAGE');
 const image=path.join(base,'docs',job.id+'.png');
 if(!pngOK(image))errors.push('NO_VALID_PNG');
 const hits=(m.hits||[]).filter(h=>(job.find||[]).includes(h.k) && Array.isArray(h.rects) && h.rects.some(r=>
  Array.isArray(r)&&r.length===4&&r[0]>=0&&r[1]>=0&&r[0]+r[2]<=1602&&r[1]+r[3]<=1002&&r[2]>2&&r[3]>5));
 if(!hits.length)errors.push('KEYWORD_NOT_VISIBLE_IN_SCREENSHOT');
 checked.push({id:job.id,url:job.url,image,valid:!errors.length,errors,
  hit:hits.length ? {keyword:hits[0].k,rect:hits[0].rects[0]} : null});
}
const ok=checked.filter(x=>x.valid);
const status=ok.length ? (fixture?'FIXTURE_ONLY':'CAPTURE_CHECK_PASSED') : 'BLOCKED';
const report={status,fixture,checked,selected:ok[0]||null,
 note:'CAPTURE_CHECK_PASSED 代表可讀且與預期新聞關鍵字匹配，仍需人工審閱截圖、內容與使用授權；FIXTURE_ONLY 不得當作新聞素材。'};
fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
console.log(JSON.stringify({status,checked:checked.map(x=>({id:x.id,valid:x.valid,errors:x.errors})),reportFile},null,2));
if(!ok.length) process.exitCode=1;
