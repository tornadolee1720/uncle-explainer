// A smaller CI-only font bootstrap. Font assets are downloaded dynamically,
// never committed, published or added to user artifacts.
// License: Noto Sans TC from Google Fonts SIL OFL 1.1, package WOFF2 under OFL.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const dir=path.join(root,'fonts');fs.mkdirSync(dir,{recursive:true});
const url='https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf';
const r=await fetch(url,{headers:{'User-Agent':'UncleExplainer-Internal-Render/1.0'},signal:AbortSignal.timeout(60000)});
if(!r.ok)throw Error('Official Noto TC variable TTF unavailable HTTP '+r.status);
const font=Buffer.from(await r.arrayBuffer());
const sig=font.subarray(0,4).toString('hex');
if(font.length<300000||!['00010000','4f54544f'].includes(sig))throw Error('Downloaded font signature / length invalid');
const reg=path.join(dir,'NotoSansTC-Regular.ttf');
fs.writeFileSync(reg,font);
for(const dest of ['NotoSansTC-Medium.ttf','NotoSansTC-Bold.ttf','NotoSansTC-Black.ttf']){
 const d=path.join(dir,dest);if(fs.existsSync(d))fs.unlinkSync(d);fs.symlinkSync('NotoSansTC-Regular.ttf',d);
}
function fromPackage(pkg,search,dest){
 const folder=path.join(root,'node_modules',pkg,'files');
 if(!fs.existsSync(folder))throw Error('Missing npm font package '+pkg);
 const f=fs.readdirSync(folder).find(x=>search.test(x));
 if(!f)throw Error('No font woff2 found in '+pkg);
 fs.copyFileSync(path.join(folder,f),path.join(dir,dest));
 console.log('Font asset ready',dest);
}
fromPackage('@fontsource/bebas-neue',/latin-400-normal\.woff2$/,'BebasNeue-Regular.woff2');
fromPackage('@fontsource-variable/montserrat',/latin-wght-normal\.woff2$/,'Montserrat-VF.woff2');
fromPackage('@fontsource-variable/montserrat',/latin-wght-italic\.woff2$/,'Montserrat-Italic-VF.woff2');
console.log('FAST CI FONT SETUP READY: Google Fonts OFL Noto TC variable TTF + npm fontsource assets, not included in artifacts');
