// Fetch verified source illustrations without inventing news locations or identities.
// CC0 generic server-rack photo is NOT an NVIDIA data-center photo.
// Public file page: https://commons.wikimedia.org/wiki/File:Rear_of_rack_at_NERSC_data_center_-_closeup.jpg
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const film=process.argv[2];
if(!film)throw Error('Usage: node scripts/fetch_news_broll.mjs <film-dir>');
const out=path.join(path.resolve(film),'assets','img');fs.mkdirSync(out,{recursive:true});
const title='File:Rear of rack at NERSC data center - closeup.jpg';
const api='https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata&titles='+encodeURIComponent(title);
const agent={'User-Agent':'UncleExplainerResearch/1.0 (video-source provenance; Wikimedia Commons)','Accept':'application/json'};
const res=await fetch(api,{headers:agent,signal:AbortSignal.timeout(35000)});
if(!res.ok)throw Error('Wikimedia metadata API blocked: HTTP '+res.status);
const data=await res.json();
const p=Object.values(data.query?.pages||{})[0];const info=p?.imageinfo?.[0];
if(!info?.url||!/^https:\/\/upload\.wikimedia\.org\//.test(info.url))throw Error('Wikimedia image URL missing or untrusted');
const lic=String(info.extmetadata?.LicenseShortName?.value||'');
if(!lic.toLowerCase().includes('cc0'))throw Error('Image license not CC0: '+lic);
const img=await fetch(info.url,{headers:{'User-Agent':'UncleExplainerResearch/1.0'},signal:AbortSignal.timeout(40000)});
if(!img.ok)throw Error('Wikimedia original image blocked: HTTP '+img.status);
const bytes=Buffer.from(await img.arrayBuffer());
if(bytes.length<10000 || bytes[0]!==0xff||bytes[1]!==0xd8)throw Error('Unexpected image bytes');
const dest=path.join(out,'data_center_cc0.jpg');fs.writeFileSync(dest,bytes);
const record={
  local_file:'assets/img/data_center_cc0.jpg',
  depiction:'General data-center server racks; 2011 image, NOT NVIDIA premises, NOT FY27 Q3 footage',
  attribution:'Derrick Coetzee',
  license:'CC0 1.0',
  source_page:'https://commons.wikimedia.org/wiki/File:Rear_of_rack_at_NERSC_data_center_-_closeup.jpg',
  raw_url:info.url,
  sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
  editorial_label:'資料中心示意｜非 NVIDIA 實際機房',
  original_size_bytes:bytes.length
};
fs.writeFileSync(path.join(path.resolve(film),'BROLL_CREDITS.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({status:'LICENSE_CHECKED_AND_IMAGE_DOWNLOADED',file:dest,bytes:bytes.length,license:lic}));
