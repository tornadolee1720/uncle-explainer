// License-checked actual data-center photo for internal documentary illustration.
// Prefer Wikimedia Commons CC0; when its CDN returns 429, fall back to a
// NASA/Goddard-operated source under NASA media usage guidelines.
// No unlicensed stock photo and never imply that this is an NVIDIA facility.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const film=process.argv[2];
if(!film)throw Error('Usage: node scripts/fetch_news_broll.mjs <film-dir>');
const out=path.join(path.resolve(film),'assets','img');
fs.mkdirSync(out,{recursive:true});
const userAgent='UncleExplainer/1.0 (+https://github.com/tornadolee1720/uncle-explainer; editorial imagery research)';
const commonsPage='https://commons.wikimedia.org/wiki/File:Rear_of_rack_at_NERSC_data_center_-_closeup.jpg';
const nasaPage='https://www.nas.nasa.gov/SC23/research/project31.html';
const nasaFile='https://www.nas.nasa.gov/SC23/assets/images/content/31_Carriere_L_SC23_Discover_SCU17_small.jpg';
const candidates=[];

function validJpg(buf){return buf.length>10000 && buf[0]===0xff && buf[1]===0xd8 && buf[buf.length-2]===0xff && buf[buf.length-1]===0xd9;}
async function getBytes(url){
 const u=new URL(url);
 if(u.protocol!=='https:' || !['upload.wikimedia.org','www.nas.nasa.gov'].includes(u.hostname))
  throw Error('Unexpected image host: '+u.hostname);
 const rsp=await fetch(url,{headers:{'User-Agent':userAgent,'Accept':'image/jpeg,image/*;q=0.9'},
    signal:AbortSignal.timeout(40000)});
 if(!rsp.ok)throw Error('HTTP '+rsp.status+' at '+u.hostname);
 const bytes=Buffer.from(await rsp.arrayBuffer());
 if(!validJpg(bytes))throw Error('Image bytes invalid or incomplete for '+u.hostname);
 return bytes;
}
try{
 const title='File:Rear of rack at NERSC data center - closeup.jpg';
 const api='https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1280&titles='+encodeURIComponent(title);
 const rsp=await fetch(api,{headers:{'User-Agent':userAgent,'Accept':'application/json'},
  signal:AbortSignal.timeout(30000)});
 if(!rsp.ok)throw Error('Wikimedia metadata HTTP '+rsp.status);
 const data=await rsp.json();
 const info=Object.values(data.query?.pages||{})[0]?.imageinfo?.[0];
 const lic=String(info?.extmetadata?.LicenseShortName?.value||'').toLowerCase();
 if(!lic.includes('cc0'))throw Error('Commons not CC0: '+lic);
 const urls=[info?.thumburl,info?.url].filter(Boolean);
 for(const url of urls){
  try{
   const bytes=await getBytes(url);
   candidates.push({bytes,record:{
    source_kind:'WIKIMEDIA_CC0',source_page:commonsPage,raw_url:url,
    attribution:'Derrick Coetzee',license:'CC0 1.0',
    depiction:'Generic data center equipment (2011), NOT NVIDIA facilities',
    editorial_label:'資料中心示意｜非 NVIDIA 實際機房'}});
   break;
  }catch(e){console.warn('Commons image variant unavailable: '+e.message);}
 }
 if(!candidates.length)throw Error('No reachable CC0 variant');
}catch(e){console.warn('Wikimedia source unavailable, using preapproved NASA source: '+e.message)}
if(!candidates.length){
 const bytes=await getBytes(nasaFile);
 candidates.push({bytes,record:{
   source_kind:'NASA_EDITORIAL',source_page:nasaPage,raw_url:nasaFile,
   attribution:'Bruce Pfaff / NASA Goddard',
   license:'NASA media usage guidelines (generally US public domain; check third-party/brand exclusions)',
   depiction:'NASA Discover supercomputer racks, 2023; NOT NVIDIA facilities or 2026 NVIDIA footage',
   editorial_label:'NASA 資料中心示意｜非 NVIDIA 機房',
   usage_guidelines:'https://www.nasa.gov/nasa-brand-center/images-and-media/',
   non_endorsement:'NASA does not endorse this video'}});
}
const {bytes,record}=candidates[0];
const dest=path.join(out,'data_center_cc0.jpg');fs.writeFileSync(dest,bytes);
Object.assign(record,{local_file:'assets/img/data_center_cc0.jpg',
 sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
 original_size_bytes:bytes.length});
fs.writeFileSync(path.join(path.resolve(film),'BROLL_CREDITS.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({status:'LICENSE_SCREENED_IMAGE_DOWNLOADED',source:record.source_kind,file:dest,bytes:bytes.length}));
