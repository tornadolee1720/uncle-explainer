// Produce three original story-illustration SVGs. No stock / AI generated media.
import fs from 'node:fs';
import path from 'node:path';
const D=path.resolve(process.argv[2]||'');
if(!process.argv[2])throw Error('Usage: node scripts/make_cash_story_art.mjs <film-directory>');
const out=path.join(D,'assets','img');fs.mkdirSync(out,{recursive:true});
function shell(content,label){
 return [
 '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">',
 '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1b343b"/><stop offset=".65" stop-color="#364a47"/><stop offset="1" stop-color="#83684e"/></linearGradient>',
 '<radialGradient id="glow"><stop stop-color="#f1ca86" stop-opacity=".30"/><stop offset="1" stop-color="#f1ca86" stop-opacity="0"/></radialGradient>',
 '<pattern id="dots" width="33" height="33" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#f1e0ba" opacity=".2"/></pattern></defs>',
 '<rect width="1080" height="1920" fill="url(#bg)"/>',
 '<rect width="1080" height="1920" fill="url(#dots)"/>',
 '<ellipse cx="535" cy="855" rx="700" ry="660" fill="url(#glow)"/>',
 '<path d="M0 1500L1080 1080V1920H0Z" fill="#11262d" opacity=".43"/>',
 content,
 '<g font-family="Noto Sans TC,sans-serif"><text x="75" y="1650" font-size="27" fill="#e8d8b4" letter-spacing="6">UNCLE / BUSINESS STORIES</text>',
 '<text x="75" y="1710" font-size="28" fill="#e8d8b4">虛構案例 · 原創商業插畫</text>',
 '<text x="75" y="1780" font-size="24" fill="#b2c6c1">'+label+'</text></g>',
 '</svg>'].join('');
}
const boxes=[];
for(let i=0;i<8;i++){const x=420+(i%4)*125,y=900+Math.floor(i/4)*128;boxes.push('<path d="M'+x+' '+y+'l60 -32 67 31 -61 35z" fill="#e5bc7f" stroke="#a98555" stroke-width="5"/><path d="M'+x+' '+y+'l66 34v75l-66 -37z" fill="#b69770"/>');}
const factory=[
 '<g transform="translate(90 390)">',
 '<path d="M10 485L450 268L944 480L502 705Z" fill="#101c1f" opacity=".45"/>',
 '<path d="M74 265L440 60L825 270L458 486Z" fill="#d3bd98"/>',
 '<path d="M74 265L458 486V720L74 502Z" fill="#937958"/>',
 '<path d="M458 486L825 270V508L458 720Z" fill="#af9270"/>',
 '<path d="M128 257L449 92L741 275L446 438Z" fill="#ece1c5"/>',
 '<g fill="#456e6b"><rect x="154" y="329" width="83" height="118" rx="6"/><rect x="291" y="410" width="88" height="95" rx="6"/><rect x="558" y="389" width="133" height="108" rx="6"/></g>',
 '<path d="M62 519l270 138v80L62 597z" fill="#315d60"/>',
 '<path d="M113 544l45 23M200 592l45 24M289 644l36 18" stroke="#f0d5a6" stroke-width="10" stroke-linecap="round"/>',
 '</g>',boxes.join('')].join('');
const cash=[
 '<g transform="translate(70 420)">',
 '<rect x="72" y="150" width="790" height="700" rx="38" fill="#ae9475" transform="rotate(-8 467 475)"/>',
 '<rect x="110" y="90" width="790" height="700" rx="38" fill="#f4ebdc" transform="rotate(7 490 440)"/>',
 '<rect x="200" y="215" width="560" height="42" rx="18" fill="#6e9a95" opacity=".85"/>',
 '<path d="M225 353H740M225 422H740M225 491H650" stroke="#c7b9a3" stroke-width="17" stroke-linecap="round"/>',
 '<rect x="300" y="685" width="470" height="252" rx="34" fill="#3e7b74" transform="rotate(-8 540 805)"/>',
 '<ellipse cx="539" cy="810" rx="112" ry="96" fill="#b4d2c0" opacity=".85"/>',
 '<path d="M540 748v125M502 773c55-43 111 24 45 43c-56 16-74 59 19 74" stroke="#3a776e" stroke-width="17" fill="none" stroke-linecap="round"/>',
 '<g fill="#d8a85d"><circle cx="165" cy="890" r="72"/><circle cx="870" cy="815" r="65"/></g>',
 '</g>'].join('');
const days=[];
for(let i=0;i<12;i++){let x=212+(i%3)*218,y=420+Math.floor(i/3)*116;days.push('<rect x="'+x+'" y="'+y+'" width="160" height="74" rx="14" fill="'+(i===11?'#e8b572':'#cfbea1')+'"/>');}
const calendar=[
 '<g transform="translate(90 420)">',
 '<rect x="90" y="160" width="810" height="875" rx="43" fill="#ebdfc7" stroke="#948467" stroke-width="15"/>',
 '<path d="M90 200h810v210H90z" fill="#598783"/>',
 '<path d="M265 125v167M723 125v167" stroke="#e6b06a" stroke-width="40" stroke-linecap="round"/>',
 days.join(''),'<path d="M535 825l80 83 135-165" fill="none" stroke="#b96e47" stroke-width="27" stroke-linecap="round"/>',
 '</g>'].join('');
for(const [name,art,caption] of [['factory',factory,'包裝工廠示意'],['cash',cash,'現金與帳單示意'],['calendar',calendar,'付款日期示意']]){
 const dest=path.join(out,name+'.svg');fs.writeFileSync(dest,shell(art,caption));
 const size=fs.statSync(dest).size;if(size<2500)throw Error('SVG generator incomplete: '+name);
 console.log('ORIGINAL_SVG '+name+' '+size+' bytes');
}
