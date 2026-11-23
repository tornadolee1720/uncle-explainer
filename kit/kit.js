// kit.js —— 模板檔的核心：一支片 = 一張鏡頭表。每鏡選一個場景模板（scenes.js），只填這一鏡的內容；
// 鏡頭怎麼走、東西怎麼出現、前後層、運動模糊、字號顏色，都由模板管。同一個 t 永遠畫出同一幀。
// 載入順序：stage25d.js → film_base.js → moves.js → kit.js → scenes.js → film.js（kit.css 放在 <head>）
// 用法（film.js）：
//   window.ready=(async()=>{
//     const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS});
//     const K=await KIT.use(F);
//     await K.film([
//       {scene:'number', until:'@b03', says:'四家加起來一年砸七千多億', value:'$7250億', brow:'四家 · 2026 AI 資本開支'},
//       {scene:'discs',  says:'錢流向誰', items:[...], steps:[...]},   // 最後一鏡不寫 until = 到片尾
//     ]);
//     return K.go();
//   })();
// 時刻一律寫成字串：'@b03'（這句開口）、'@b03:英偉達'（唸到這個詞）、'@b03:END'（這句說完）、'@b03:英偉達#2'（第二次出現）、
// 可以帶偏移 '@b03:英偉達+0.2'；原聲插段 '@bite_b10b' / '@bite_b10b:END'；片名 '@title' / '@title:END'。
// 場景清單、引數和例子：kit/README.md。規則：references/rules.md。
(()=>{
const {C,IO,lerp,camPath,L,mbF}=S25;
const E=x=>1-(1-C(x))**3, EI=x=>C(x)**3;
const f1=v=>(+v).toFixed(1),f2=v=>(+v).toFixed(2),f3=v=>(+v).toFixed(3);
const A=v=>v==null?[]:Array.isArray(v)?v:[v];
const SAFE={x0:100,x1:1820,y0:80,y1:870};   // 字幕帶 y≥900 不放內容

// ---------- 顏色：名字 → 色值；公司名 → 品牌色（全片同一家同一個顏色） ----------
const COLORS={blue:'#2f6bd1',sky:'#3b8ee0',steel:'#4d6f99',navy:'#22407e',amber:'#d68a1f',orange:'#de6a2c',gold:'#c7a03c',green:'#3c9a3e',lime:'#6fae1e',
 teal:'#1d8b7b',cyan:'#1a9db3',brick:'#b5482f',red:'#c63038',wine:'#7c2230',purple:'#6a3fb3',violet:'#8a52d6',pink:'#cf4f8a',gray:'#6a707b',slate:'#475263',black:'#2a2d33'};
const BRAND={google:'blue',谷歌:'blue',microsoft:'steel',微軟:'steel',amazon:'amber',亞馬遜:'amber',meta:'blue',nvidia:'green',英偉達:'green',openai:'teal',
 oracle:'brick',甲骨文:'brick',apple:'gray',蘋果:'gray',tesla:'red',特斯拉:'red',spacex:'slate',xai:'black',anthropic:'orange',alibaba:'orange',阿里:'orange',阿里巴巴:'orange',
 tencent:'sky',騰訊:'sky',bytedance:'cyan',位元組:'cyan',位元組跳動:'cyan',huawei:'red',華為:'red',tsmc:'brick',臺積電:'brick',amd:'red',intel:'sky',英特爾:'sky',
 broadcom:'red',博通:'red',samsung:'navy',三星:'navy',softbank:'gold',軟銀:'gold',美聯儲:'navy',fed:'navy'};
// 舞臺底色（中心、四周）。整屏底色只有這三種：navy 預設；charcoal 中性的炭灰；wine 壓暗、低飽和的酒紅，一支片最多一段（算總賬 / 虧錢）。
// 都是同一張斜紋織物染色。公司的品牌色不當整屏底色，只在 person（人身後）染織物；寫了別的 tone 按 navy 畫，--check 提醒。
const TONE={navy:['#2e3a55','#0b1019'],charcoal:['#36393f','#0b0b0d'],wine:['#5a2f3c','#120a0d']};
const col=c=>{if(!c)return COLORS.steel;if(c[0]==='#'||c.startsWith('rgb'))return c;const k=String(c).toLowerCase();return COLORS[k]??COLORS[BRAND[k]??BRAND[c]]??COLORS.steel;};
const rgb=h=>{h=col(h).replace('#','');if(h.length===3)h=[...h].map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};
const mixc=(a,b,k)=>{const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*k).toString(16).padStart(2,'0')).join('');};
const alpha=(c,a)=>`rgba(${rgb(c).join(',')},${a})`;
const shade=c=>{const b=col(c);return `--c:${b};--hi:${mixc(b,'#ffffff',.42)};--lo:${mixc(b,'#000000',.58)};--gl:${alpha(b,.3)}`;};

// ---------- 數字：'$7250億' '5.2萬億' '€75,000,000,000' '30%' '-2780億' 725e9 ----------
const UNIT={'萬':1e4,'億':1e8,'萬億':1e12,'千億':1e11,'百億':1e10,'十億':1e9,K:1e3,M:1e6,B:1e9,T:1e12};
function num(v){
 if(v==null)return null;
 if(typeof v==='object'&&'n' in v)return v;
 if(typeof v==='number')return {neg:v<0,cur:'',n:Math.abs(v),unit:'',dec:(String(v).split('.')[1]||'').length,sep:Math.abs(v)>=1e5};
 const m=String(v).trim().match(/^([+\-−]?)([$€¥£₩]?)\s*([\d,]*\.?\d+)\s*(.*)$/);
 if(!m)return {text:String(v)};
 const s=m[3].replace(/,/g,'');
 return {neg:m[1]==='-'||m[1]==='−',cur:m[2],n:+s,unit:m[4].trim(),dec:(s.split('.')[1]||'').length,sep:m[3].includes(',')};
}
// 換成滿位數：7250億 → 725,000,000,000（跳動的位數本身在說"有多大"）
const full=p=>{const k=UNIT[p.unit];return k?{...p,n:p.n*k,unit:'',dec:0,sep:true}:{...p,sep:true};};
function fmtN(p,n=p.n,rolling=false){
 let x=n;if(rolling&&p.sep&&x>=1e10)x=Math.round(x/1e9)*1e9;   // 滿位數滾的時候按十億取整，後面全是 0
 return x.toLocaleString('en-US',{minimumFractionDigits:p.dec,maximumFractionDigits:p.dec,useGrouping:!!p.sep});
}
const numText=(p,n)=>p.text??`${p.neg?'-':''}${p.cur}${fmtN(p,n)}${p.unit}`;
// 大數字的 HTML：o.n 當前值（滾的時候傳），o.fixed 每一位等寬（滾的時候不抖）
function numHTML(p,o={}){
 if(p.text)return `<span class="g">${p.text}</span>`;
 const s=fmtN(p,o.n??p.n,o.rolling),dg=[...s].map(ch=>ch===','?`<span class="cm">,</span>`:`<span class="g${o.fixed?' w':''}">${ch}</span>`).join('');
 return `${p.neg?'<span class="g">-</span>':''}${p.cur?`<span class="c">${p.cur}</span>`:''}${dg}${p.unit?`<span class="u">${p.unit}</span>`:''}`;
}
const unitHTML=p=>p.text??`${p.neg?'-':''}${p.cur?`<span class="c">${p.cur}</span>`:''}${fmtN(p)}${p.unit?`<span class="u">${p.unit}</span>`:''}`;

// ---------- 量字寬（字型已載入，結果確定） ----------
const vw=s=>[...String(s??'')].reduce((a,ch)=>a+(/[㐀-鿿　-〿＀-￯]/.test(ch)?1:.55),0);   // 看起來有幾個字寬（中文 1，英文數字 0.55）
const cv=document.createElement('canvas').getContext('2d');
const textW=(s,font)=>{cv.font=font;return cv.measureText(String(s)).width;};
const FAM={num:"Num,'Bebas Neue',Bahnschrift,Impact",han:"Shu,'Noto Sans TC','Noto Sans TC','Microsoft JhengHei'",ui:"Mi,'Noto Sans TC','Microsoft JhengHei'",en:"Mont,Montserrat,'Segoe UI'"};   // 單引號：要塞進 style="..." 裡
// 巨字寬度（和 S25.mega 一樣拆：數字用 Num、字號 size；漢字用數黑體、0.6 倍）和讓它不超過 maxW 的字號
function megaW(txt,size){let w=0;String(txt).replace(/([0-9.,$−+]+)|([^0-9.,$−+]+)/g,(m,d,h)=>{w+=d?textW(d,`${size}px ${FAM.num}`):textW(h,`${size*.6}px ${FAM.han}`)+size*.036;return m;});return w;}
const megaFit=(txt,size,maxW)=>{const w=megaW(txt,size);return w>maxW?Math.floor(size*maxW/w):size;};
// 讓一段字不超過 maxW：返回字號
const fitPx=(s,fam,size,maxW,ls=0)=>{const w=textW(s,`${size}px ${FAM[fam]??fam}`)+ls*size*String(s).length;return w>maxW?Math.floor(size*maxW/w):size;};

// ---------- 時刻 ----------
function timer(T){
 const BT=Object.fromEntries(T.beats.map(b=>[b.id,b])),INS=Object.fromEntries((T.inserts||[]).map(i=>[i.id,i]));
 return v=>{
  if(typeof v==='number')return v;
  if(typeof v!=='string'||v[0]!=='@')throw Error(`時刻要寫成 '@句id' 或 '@句id:詞'，現在是 ${JSON.stringify(v)}`);
  let s=v.slice(1),off=0;const om=s.match(/^(.*?)([+-]\d*\.?\d+)$/);
  if(om&&om[1]&&!om[1].endsWith(':')){off=+om[2];s=om[1];}   // '@b03:-2780' 裡的 -2780 是詞，不是偏移
  let nth=1;const hm=s.match(/#(\d+)$/);if(hm){nth=+hm[1];s=s.slice(0,-hm[0].length);}
  const i=s.indexOf(':'),id=i<0?s:s.slice(0,i),w=i<0?null:s.slice(i+1);
  if(id==='title'){if(!T.title)throw Error(`timeline.json 裡沒有片名的位置，用不了 ${v}：script.json 里加 "title":{"after":"片名前那句的 id","len":片名停幾秒}，再重跑 timeline_stub.mjs`);return (w==='END'?T.title.end:T.title.start)+off;}
  if(INS[id])return (w==='END'?INS[id].end:INS[id].start)+off;
  const b=BT[id];if(!b)throw Error(`timeline.json 裡沒有句子 ${id}（${v}）。有的句子：${Object.keys(BT).join(' ')}${/^bite_/.test(id)?'（原聲插段寫在 script.json 那一句的 bite 裡，再重跑 timeline_stub.mjs）':''}`);
  if(w==null||w==='')return b.start+off;if(w==='END')return b.end+off;
  let k=-1;for(let n=0;n<nth;n++){k=b.text.indexOf(w,k+1);if(k<0)break;}
  if(k<0)throw Error(`句子 ${id} 裡找不到「${w}」${nth>1?`第 ${nth} 次`:''}（${v}）。timeline.json 裡這句是：${b.text}。詞要照這句一字不差地抄（念法：'一百三十億' 不是 '130億'，'〇' 不是 '零'）`);
  return b.chars[k][1]+off;
 };
}

// ---------- 狀態隨時間變：set(時刻, 值, 過渡秒數)，at(t) 取值（兩頭緩） ----------
function track(v0){const ev=[];return {set(t,v,d=.3){ev.push([t,v,d]);ev.sort((a,b)=>a[0]-b[0]);return this;},
 at(t){let v=v0;for(const [te,ve,de] of ev){if(t<te)break;v=de>0?v+(ve-v)*IO((t-te)/de):ve;}return v;},ev};}
// 東西出現：淡入 0.25 秒加十幾畫素上移（樸素，不彈、不回彈、不打字機）
const appear=(t,ta,d=.25,rise=14)=>{const k=C((t-ta)/d);return {o:k,dy:(1-E(k))*rise,k};};

// ---------- 機位：框住這幾樣東西（世界座標的框 [x0,y0,x1,y1]），避開字幕帶 ----------
function fit(box,o={}){
 const pad=o.pad??70,w=Math.max(1,box[2]-box[0]+2*pad),h=Math.max(1,box[3]-box[1]+2*pad);
 const aw=SAFE.x1-SAFE.x0,ah=SAFE.y1-SAFE.y0,cyS=o.cy??(SAFE.y0+SAFE.y1)/2;
 const s=Math.max(o.min??.42,Math.min(o.max??2.2,Math.min(aw/w,ah/h)*(o.fill??1)));
 return {x:(box[0]+box[2])/2,y:(box[1]+box[3])/2+(540-cyS)/s,s};
}
const unionBox=bs=>bs.reduce((a,b)=>[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])],[1e9,1e9,-1e9,-1e9]);
// 一次換位多長：距離越遠、縮放差越大越長，0.55–1.1 秒（參考片 0.5–1 秒）
const moveDur=(a,b)=>Math.max(.55,Math.min(1.1,.5+Math.hypot(a.x-b.x,a.y-b.y)*Math.min(a.s,b.s)/2600+Math.abs(Math.log(b.s/a.s))*.7));
// 關鍵機位序列 → 每一刻的機位。keys=[{t,cam,d?}]：第一項是起點，後面每一項是一次換位（d 秒，兩頭緩）。
// 上一次還沒走完、下一次就開始時，新的一次從"正在走的那條路"上平滑接過去（位置和速度都連續），不跳、不頓。
// 停下來以後慢慢往裡推（drift 每秒，參考片約 3%/秒）。縮放按對數插值，推拉速度均勻。
// 遠距離換位（地圖上跨大洲、世界舞臺的兩頭）：中途先拉遠再推近，像地圖軟體裡"飛過去"，螢幕上走的路不超過一屏多，不會糊成一片。
function camSeq(keys,drift=.02){
 const ks=keys.map((k,i)=>{if(!i)return {...k,d:0,arc:0};
  const a=keys[i-1].cam,b=k.cam,dd=Math.hypot(a.x-b.x,a.y-b.y),arc=k.arc??Math.max(0,(Math.log(a.s)+Math.log(b.s))/2-Math.log(Math.max(.3,1250/Math.max(1,dd))));
  return {...k,arc:arc>.05?arc:0,d:Math.max(.05,k.d??(arc>.05?Math.min(1.6,Math.max(moveDur(a,b),.9+arc*.4)):moveDur(a,b)))};});
 const hold=(k,t0)=>t=>({...k.cam,s:k.cam.s*(1+drift*Math.max(0,t-t0))});
 const at=(i,t)=>{
  const k=ks[i];
  if(i===0)return hold(k,k.t)(t);
  const u=(t-k.t)/k.d;
  if(u>=1)return hold(k,k.t+k.d)(t);
  const a=at(i-1,t),e=k.arc?.5-.5*Math.cos(Math.PI*C(u)):IO(u);
  return {x:lerp(a.x,k.cam.x,e),y:lerp(a.y,k.cam.y,e),s:Math.exp(lerp(Math.log(a.s),Math.log(k.cam.s),e)-k.arc*Math.sin(Math.PI*e))};
 };
 return t=>{let i=ks.length-1;while(i>0&&t<ks[i].t)i--;return at(i,t);};
}

// ---------- 畫面零件（都返回 HTML，位置是世界座標；st 是狀態 {o,dy,sc,br,sat,blur}） ----------
function fx(st={},base='translate(-50%,-50%)'){
 const f=[];if(st.br!=null&&Math.abs(st.br-1)>.005)f.push(`brightness(${f3(st.br)})`);if(st.sat!=null&&Math.abs(st.sat-1)>.005)f.push(`saturate(${f3(st.sat)})`);
 if((st.blur??0)>.3)f.push(`blur(${f1(st.blur)}px)`);
 const tr=`${base}${st.dy?` translateY(${f1(st.dy)}px)`:''}${st.dx?` translateX(${f1(st.dx)}px)`:''}${st.sc!=null&&Math.abs(st.sc-1)>.0005?` scale(${f3(st.sc)})`:''}`;
 return `transform:${tr};${f.length?`filter:${f.join(' ')};`:''}${st.o!=null&&st.o<.999?`opacity:${f3(C(st.o))};`:''}`;
}
// 舞臺底：斜紋織物染成這一段的底色，中間略亮、四周壓暗。
// o.tone 底色（navy / charcoal / wine，別的按 navy）；o.tint 品牌色染織物（person 用）；o.glow 顏色光（預設沒有，給了公司名/顏色名才畫）；o.gx/o.gy 光的中心
function stage(o={}){
 let a,b;
 if(o.tint){const c=col(o.tint);a=mixc(c,'#04060b',.46);b=mixc(c,'#020306',.9);}
 else [a,b]=TONE[o.tone]??TONE.navy;
 const g=o.glow?col(o.glow):null;
 return `<div class="k-stage" style="--a:${a};--b:${b};--gx:${o.gx??'50%'};--gy:${o.gy??'48%'}${g?`;--g:${alpha(mixc(g,'#ffffff',.3),o.go??.34)}`:''}"><div class="tex"></div>${g?'<div class="glow"></div>':''}${o.rings?'<div class="rings"></div>':''}</div>`;
}
// 照片圓盤：{x,y,r,color,name,en,photo,pos(照片的 object-position),logo(白色單色 logo 圖),gray}
// 品牌色實心盤；有 photo 時照片鋪滿盤、底部壓一層品牌色，名字壓在盤的下半。lt（文字 logo）不再畫，只在沒有 name 時當名字用。
// 盤太小（r<72）、名字又放不下時，名字寫在盤下面
function disc(o,st={}){
 const r=o.r??120,c=col(o.gray?'#6b707a':o.color),nm=o.name??o.lt??'',small=r<72,inside=!small||vw(nm)<=2.4;
 const s2=o.gray?{...st,sat:0,br:(st.br??1)*.62}:st;
 let h='';
 if(o.photo)h+=`<div class="ph"><img src="${o.photo}"${o.pos?` style="object-position:${o.pos}"`:''}></div>`;
 else if(o.logo)h+=`<img class="lg" src="${o.logo}"${nm?'':' style="top:50%"'}>`;
 if(nm&&inside){
  const ny=o.photo?.75:o.logo?.7:(o.en&&!small?.46:.5);
  const fs=o.photo?fitPx(nm,'han',r*.27,r*1.36,.06):small?fitPx(nm,'han',r*.6,r*1.5,.04):fitPx(nm,'han',r*.34,r*1.5,.06);
  h+=`<div class="nm" style="top:${f1(2*r*ny)}px;font-size:${f1(fs)}px">${nm}</div>`;
  if(o.en&&!o.photo&&!o.logo&&!small)h+=`<div class="en" style="top:${f1(2*r*(ny+.15))}px">${o.en}</div>`;
 }else if(nm)h+=`<div class="out">${nm}${o.en?`<i>${o.en}</i>`:''}</div>`;
 return `<div class="k-disc" style="left:${f1(o.x)}px;top:${f1(o.y)}px;--r:${f1(r)}px;--rim:${f1(Math.max(1.5,r*.022))}px;--c:${c};--hi:${mixc(c,'#ffffff',.12)};--lo:${mixc(c,'#000000',.28)};--sh:${alpha(c,.6)};${fx(s2)}">${h}</div>`;
}
// 卡片（平的品牌色塊）：{x,y,w,h,color,title,en,img(底圖),flag(小旗圖片),value('$500億')}
function card(o,st){
 const w=o.w??300,h=o.h??150,ts=fitPx(o.title??'','han',o.size??Math.min(52,h*.3),w*.82,.14),v=o.value?num(o.value):null,b=mixc(col(o.gray?'#555a63':o.color),'#2b303a',.18);
 return `<div class="k-card${o.gray?' gray':''}" style="left:${f1(o.x)}px;top:${f1(o.y)}px;width:${w}px;height:${h}px;--c:${mixc(b,'#000000',.14)};--hi:${mixc(b,'#ffffff',.06)};${fx(st)}">${o.img?`<div class="bi" style="background-image:url(${o.img})"></div>`:''}${o.title?`<div class="tt" style="font-size:${ts}px">${o.title}</div>`:''}${o.en?`<div class="en">${o.en}</div>`:''}${o.flag?`<img class="fl" src="${o.flag}">`:''}${v?`<div class="vl" style="font-size:${Math.round(h*.34)}px">${unitHTML(v)}</div>`:''}</div>`;
}
// 價籤（盤下面）：{x,y(頂),label,value,size}
const tag=(o,st)=>{const v=num(o.value);return `<div class="k-tag" style="left:${f1(o.x)}px;top:${f1(o.y)}px;font-size:${o.size??46}px;${fx(st,'translate(-50%,0)')}">${o.label?`<small>${o.label}</small>`:''}${unitHTML(v)}</div>`;};
// 小牌（流程圖裡的金額）：{x,y,value,size,kind:'green'|'red'|'gold'|'dark'}
const pill=(o,st)=>`<div class="k-pill ${o.kind??''}" style="left:${f1(o.x)}px;top:${f1(o.y)}px;font-size:${o.size??40}px;${fx(st)}">${unitHTML(num(o.value))}</div>`;
const MARK={ok:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.3 4.3L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 no:'<svg viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>'};
const mark=(o,st)=>`<div class="k-mark ${o.kind==='no'?'no':'ok'}" style="left:${f1(o.x)}px;top:${f1(o.y)}px;width:${o.s??56}px;height:${o.s??56}px;${fx(st)}">${MARK[o.kind==='no'?'no':'ok']}</div>`;
const label=(o,st)=>`<div class="k-label" style="left:${f1(o.x)}px;top:${f1(o.y)}px;font-size:${o.size??40}px;${fx(st)}">${o.text}${o.en?`<i>${o.en}</i>`:''}</div>`;
// 大數字：{x,y(中線),value,n(當前值),size,anchor:'c'|'l'|'r',color:'gold'|'red'|'white',maxW}
function bignum(o,st){
 const p=typeof o.value==='object'&&o.value&&'n' in o.value?o.value:num(o.value),size=o.maxW?fitPx(numText(p),'num',o.size??260,o.maxW*.92):o.size??260;
 const ax=o.anchor==='l'?'0':o.anchor==='r'?'-100%':'-50%';
 return `<div class="k-num ${o.color&&o.color!=='gold'?o.color:''}" style="left:${f1(o.x)}px;top:${f1(o.y)}px;font-size:${size}px;transform-origin:${o.anchor==='l'?'0':o.anchor==='r'?'100%':'50%'} 50%;${fx(st,`translate(${ax},-50%)`)}">${numHTML(p,{n:o.n,fixed:o.rolling,rolling:o.rolling})}</div>`;
}
// 眉題：{x,y,zh,en,anchor}
const brow=(o,st)=>{const ax=o.anchor==='l'?'0':o.anchor==='r'?'-100%':'-50%';
 return `<div class="k-brow" style="left:${f1(o.x)}px;top:${f1(o.y)}px;text-align:${{l:'left',r:'right'}[o.anchor]??'center'};${fx(st,`translate(${ax},0)`)}"><b${o.size?` style="font-size:${o.size}px"`:''}>${o.zh}</b>${o.en?`<i>${o.en}</i>`:''}</div>`;};
// 白邊畫框：{x,y(中心),w,h,src,label}
const frame=(o,st)=>`<div class="k-frame" style="left:${f1(o.x-o.w/2)}px;top:${f1(o.y-o.h/2)}px;width:${f1(o.w)}px;height:${f1(o.h)}px;${o.bw!=null?`border-width:${f1(o.bw)}px;`:''}${o.r!=null?`border-radius:${f1(o.r)}px;`:''}${fx(st,'translate(0,0)')}">${o.html??`<img src="${o.src}"${o.pos?` style="object-position:${o.pos}"`:''}>`}</div>`+
 (o.label?label({x:o.x,y:o.y-o.h/2-46,text:o.label,size:o.lsize??38},{o:st?.o}):'');

// 連線（一組，世界座標）：e={a:[x,y],b:[x,y],curve,color,style:'dots'|'dash'|'solid',w,k(畫出來的進度),flow(流動偏移),arrow,o,pulse(0..1 亮點位置)}
let UID=0;
const qpt=(e,u)=>{const [ax,ay]=e.a,[bx,by]=e.b,[cx,cy]=ctrl(e);return [(1-u)**2*ax+2*(1-u)*u*cx+u*u*bx,(1-u)**2*ay+2*(1-u)*u*cy+u*u*by];};
function ctrl(e){const [ax,ay]=e.a,[bx,by]=e.b,mx=(ax+bx)/2,my=(ay+by)/2,dx=bx-ax,dy=by-ay,c=e.curve??0;return [mx-dy*c,my+dx*c];}
const ECOL={blue:'#8ab6f2',green:'#6bd28f',red:'#f07f8c',gold:'#ecd08a',white:'#f2f2f2',purple:'#b48cf0',teal:'#6fd6c6'};
function edges(es){
 let defs='',body='';
 for(const e of es){
  if((e.k??1)<=0||(e.o??1)<=0)continue;
  const [cx,cy]=ctrl(e),d=`M${f1(e.a[0])} ${f1(e.a[1])} Q${f1(cx)} ${f1(cy)} ${f1(e.b[0])} ${f1(e.b[1])}`,c=ECOL[e.color]??col(e.color??'#d8dde6'),w=e.w??7,id='km'+(++UID);
  const dash=e.style==='solid'?'':e.style==='dash'?`stroke-dasharray:${f1(w*2.6)} ${f1(w*1.7)};`:`stroke-dasharray:0.01 ${f1(w*2.3)};`;
  const k=e.k??1,mk=k<1?` mask="url(#${id})"`:'';
  if(k<1)defs+=`<mask id="${id}" maskUnits="userSpaceOnUse" x="-6000" y="-6000" width="16000" height="16000"><path d="${d}" pathLength="1" stroke="#fff" stroke-width="${w*4}" fill="none" stroke-dasharray="${f3(k)} 2"/></mask>`;
  body+=`<path d="${d}"${mk} fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" style="${dash}stroke-dashoffset:${f1(-(e.flow??0))};opacity:${f3(e.o??1)};filter:drop-shadow(0 0 ${f1(w*.6)}px ${alpha(c,.32)})"/>`;
  if(e.arrow!==false&&k>.85){const [px,py]=qpt(e,.985),[qx,qy]=e.b,a=Math.atan2(qy-py,qx-px)*180/Math.PI,s=w*2.3;
   body+=`<path d="M${f1(-s*1.1)} ${f1(-s)} L${f1(s*.5)} 0 L${f1(-s*1.1)} ${f1(s)} Z" fill="${c}" transform="translate(${f1(qx)} ${f1(qy)}) rotate(${f1(a)})" style="opacity:${f3((e.o??1)*C((k-.85)/.15))}"/>`;}
  if(e.pulse!=null&&e.pulse>0&&e.pulse<1){const [px,py]=qpt(e,e.pulse);body+=`<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(w*1.9)}" fill="#fff" style="filter:drop-shadow(0 0 ${f1(w*2.5)}px ${c}) drop-shadow(0 0 ${f1(w*5)}px ${c})"/>`;}
  if(e.text&&k>.6){const [px,py]=qpt(e,e.tpos??.5);body+=`<foreignObject x="${f1(px-260)}" y="${f1(py-40)}" width="520" height="80" style="overflow:visible;opacity:${f3(C((k-.6)/.3)*(e.o??1))}"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;justify-content:center;align-items:center;height:80px"><span style="font:${e.ts??40}px ${FAM.han};color:#f4efdc;letter-spacing:.08em;background:rgba(10,12,16,.72);padding:6px 18px 4px;border-radius:8px;box-shadow:0 0 0 1.5px ${alpha(c,.7)};white-space:nowrap">${e.text}</span></div></foreignObject>`;}
 }
 return `<svg class="k-full" width="1920" height="1080" style="overflow:visible">${defs?`<defs>${defs}</defs>`:''}${body}</svg>`;
}

// 人像摳圖（一張透明 PNG）：自動找頭和肩（量圖片的透明通道），按 headX/headY 放；h = 人在畫面裡多高（畫素）
const MEAS={};
async function measure(src){
 if(MEAS[src])return MEAS[src];
 const im=await loadImg(src),w=im.naturalWidth,h=im.naturalHeight,k=Math.min(1,400/Math.max(w,h)),cw=Math.max(1,Math.round(w*k)),ch=Math.max(1,Math.round(h*k));
 const c=document.createElement('canvas');c.width=cw;c.height=ch;const g=c.getContext('2d');g.drawImage(im,0,0,cw,ch);
 const a=g.getImageData(0,0,cw,ch).data;let x0=cw,x1=-1,y0=ch,y1=-1;
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(a[(y*cw+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0){MEAS[src]={w,h,box:[0,0,w,h],head:[w/2,h*.2],top:0};return MEAS[src];}
 // 頭：外框上面兩成裡不透明畫素的水平中心
 let sx=0,n=0;const yh=y0+(y1-y0)*.2;for(let y=y0;y<=yh;y++)for(let x=x0;x<=x1;x++)if(a[(y*cw+x)*4+3]>40){sx+=x;n++;}
 MEAS[src]={w,h,box:[x0/k,y0/k,(x1+1)/k,(y1+1)/k],head:[(n?sx/n:(x0+x1)/2)/k,(y0+(y1-y0)*.12)/k],top:y0/k};
 return MEAS[src];
}
// person({src,x,y?,h,...}) x = 頭的中心落在哪，top = 頭頂落在哪（預設 150），h = 人像整張圖在畫面裡的高度
function person(o,st){
 const m=MEAS[o.src];if(!m)throw Error(`人像 ${o.src} 沒有量過（K.film 會自動量；手寫鏡頭先 await KIT.measure(src)）`);
 const sc=(o.h??1250)/m.h,left=o.x-m.head[0]*sc,top=(o.top??150)-m.top*sc;
 return `<img src="${o.src}" style="position:absolute;left:${f1(left)}px;top:${f1(top)}px;width:${f1(m.w*sc)}px;height:${f1(m.h*sc)}px;filter:contrast(1.04) saturate(.96)${o.rim?` drop-shadow(0 0 ${o.rimR??50}px ${o.rim})`:''};${fx(st,'translate(0,0)')}">`;
}
const halo=(x,y,r,c,o=.2)=>`<div class="k-halo" style="left:${f1(x-r)}px;top:${f1(y-r)}px;width:${f1(2*r)}px;height:${f1(2*r)}px;background:radial-gradient(circle,${col(c)} 0%,${alpha(col(c),0)} 70%);opacity:${f3(o)}"></div>`;

// 前景浮塵（K.dust）已經去掉：不是原版的東西，前後層用實拍和摳像來做。函式留著（老影片呼叫不報錯），返回空，用了就提醒一次
const hashf=(i,s=1)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
let dustWarned=false;
function dust(){if(!dustWarned){dustWarned=true;const m='K.dust（前景浮塵）已經去掉了，現在什麼都不畫：前後層用實拍和摳像來做';console.warn('[kit] '+m);window.KIT_REPORT?.warns?.push(m);}return '';}
// 地圖：worldmap.png（等距圓柱，每度 10 畫素）鋪在世界裡，經緯度 0,0 落在 (960,540)
const MAP={img:'assets/kit/worldmap.png',x:960-1800,y:540-840,w:3600,h:1420};
const lonlat=(lon,lat)=>[960+lon*10,540-lat*10];
// 截圖上的框（hl）按多寬的座標算：snap_news.mjs 截的圖是 2 倍畫素（3200 寬），它列印的框是網頁座標（1600 寬）；別的截圖按圖片畫素。cssW 可以自己寫
const cssScale=(im,cssW)=>im.naturalWidth/(cssW??(im.naturalWidth===3200?1600:im.naturalWidth));

// ---------- 素材 ----------
const IMG={};
function loadImg(src){
 if(!IMG[src])IMG[src]=new Promise((res,rej)=>{const im=new Image();im.onload=()=>im.decode().then(()=>res(im),()=>res(im));im.onerror=()=>rej(Error(`找不到圖片 ${src}（路徑相對影片目錄，比如 assets/img/xx.jpg）`));im.src=src;});
 return IMG[src];
}
// 鏡頭表裡所有圖片路徑（.jpg/.png/.webp）：先全部載入，缺了直接報錯，不出黑屏
// 只走普通物件和陣列；'_' 開頭的是模板自己存的東西（比如載入好的圖片元素），不走進去
function scanImgs(v,out=new Set()){if(typeof v==='string'){if(/\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(v))out.add(v);}else if(Array.isArray(v))v.forEach(x=>scanImgs(x,out));else if(v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype)for(const k in v)if(k[0]!=='_')scanImgs(v[k],out);return out;}

// ---------- 場景登記（scenes.js 用） ----------
const SCENES={};
// def = {says,use,avoid 說明; need 必填引數; help 引數說明; defaults; check(p,c); prep(p,c) 非同步準備（量圖片）; make(p,c) → t=>HTML}
const scene=(name,def)=>{SCENES[name]=def;return def;};

// ---------- 開場的接法：enter ----------
// 'cut' 直接切（預設）· 'push' / 'push-right' 橫推換人 · 'through' 推過鏡頭 · 'blur' 上一鏡虛化當底 · 'flat' 上一鏡倒成桌面當底
// 'whip' / 'whip-left' 新畫面甩進來蓋住上一鏡 · 'fade' 0.3 秒疊化（少用）
const ENTERS=['cut','push','push-right','through','blur','flat','whip','whip-left','fade'];
function wrapEnter(f,c){
 const e=c.enter,prev=c.prev,t0=c.t0,why=c.p.says??'';
 if(!prev||e==='cut'||e==='flat')return f;
 if(e==='push'||e==='push-right')return t=>MV.pushSwap(t,{t0,d:.42,dir:e==='push'?-1:1,from:prev,to:tt=>f(tt),why});
 if(e==='through')return t=>MV.pushThrough(t,{t0,d:.3,from:prev,to:f,s:c.p.throughScale??1.6,at:c.p.throughAt,why});
 if(e==='blur')return t=>MV.blurToBase(t,{t0,d:.45,from:prev,to:f,why});
 if(e==='fade')return t=>{const k=C((t-t0)/.3);return k>=1?f(t):`<div class="k-full">${MV.still(prev,t0-.01)}</div><div class="k-full" style="opacity:${f3(k)}">${f(t)}</div>`;};
 if(e==='whip'||e==='whip-left')return t=>{if(t>=t0+.34)return f(t);const w=MV.whipIn(t,{t0,d:.32,dir:e==='whip'?1:-1,html:f(t),why});return `<div class="k-full">${MV.still(prev,t0-.01)}</div>${w.html}`;};
 throw Error(`enter 只能是：${ENTERS.join(' / ')}，現在是 ${e}`);
}

// ---------- 繫結一支片 ----------
async function use(F){
 const T=timer(F.T);
 F.stage.style.setProperty('--s25-grain','url(assets/kit/grain.png)');
 await Promise.all(['assets/kit/fabric.jpg','assets/kit/grain.png'].map(s=>loadImg(s).catch(()=>{throw Error(`缺模板庫紋理 ${s}：用 scripts/new_film.mjs 建影片，或從 kit/assets 拷到 assets/kit/`);})));
 const K={F,T,warns:[],shots:[]};
 const warn=m=>{K.warns.push(m);console.warn('[kit] '+m);};
 // 鏡頭表裡的 '@...' 先全部解析一遍：哪一鏡哪一處寫錯了，一次報出來
 function checkTimes(v,path,errs){
  if(typeof v==='string'&&v[0]==='@'){try{T(v);}catch(e){errs.push(`${path}：${e.message}`);}}
  else if(Array.isArray(v))v.forEach((x,i)=>checkTimes(x,`${path}[${i}]`,errs));
  else if(v&&typeof v==='object')for(const k in v)checkTimes(v[k],`${path}.${k}`,errs);
 }
 // ---------- 引數名查一遍：寫錯的引數（lable、untill）模板不認識，會被靜默丟掉，看不了圖的模型根本發現不了 ----------
 // 每個場景只認自己的引數：help、defaults、need 裡寫了的，加上模板程式碼裡讀到的 p.xxx（board 家族的程式碼在 def.code 裡）。
 // 巢狀在 items / nodes / steps 裡的欄位名，對照模板程式碼裡出現過的所有名字。note 隨便寫備註，'_' 開頭的不查，custom 不查。
 const FREE=['scene','until','says','enter','tone','glow','dust','throughAt','throughScale','note','host','pipIn','skin','hero'];   // host：'pip' / 'window'，真人口播層（host.js）
 let VOCAB;
 async function vocab(){
  if(VOCAB!==undefined)return VOCAB;
  const urls=[...document.scripts].map(s=>s.src).filter(s=>/\/(stage25d|film_base|moves|kit|scenes|scenes_plus|host|vert|vpro)\.js(\?.*)?$/.test(s));
  try{const set=new Set();for(const u of urls){const t=await (await fetch(u)).text();for(const m of t.matchAll(/[A-Za-z_$][\w$]*/g))set.add(m[0]);}VOCAB=urls.length>=2&&set.size>500?set:null;}
  catch{VOCAB=null;}   // 雙擊直接開啟（file://）讀不到原始碼：這一項不查
  return VOCAB;
 }
 const knownOf=def=>def._known??=new Set([...FREE,...Object.keys(def.help??{}),...Object.keys(def.defaults??{}),...(def.need??[]),
  ...[def.make,def.prep,def.check,def.beats,def.flat,...A(def.code)].filter(f=>typeof f==='function').flatMap(f=>[...String(f).matchAll(/\bp\.([A-Za-z_$][\w$]*)/g)].map(m=>m[1]))]);
 const osa=(a,b)=>{const d=[];for(let i=0;i<=a.length;i++){d[i]=[i];for(let j=1;j<=b.length;j++)d[i][j]=i?Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1),i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]?d[i-2][j-2]+1:1e9):j;}return d[a.length][b.length];};
 const guess=(k,cands)=>{let best=null,bd=1e9;for(const c of cands){if(c===k||c.length<2)continue;const d=osa(k.toLowerCase(),c.toLowerCase())+(c[0]===k[0]?0:.5);if(d<bd){bd=d;best=c;}}return bd<=(k.length<=4?1:2)?best:null;};
 async function checkKeys(list){
  const V=await vocab(),errs=[],warns=[];if(!V)return {errs,warns};
  const fields=[...V].filter(x=>/^[a-z][A-Za-z]*$/.test(x));
  // mark:{c1:'ok'} 這種按節點 id 當鍵的：鍵是 id（或者 'a>b' 這種連線名），不是欄位名，不查
  const idsOf=(v,s=new Set())=>{if(Array.isArray(v))v.forEach(x=>idsOf(x,s));else if(v&&typeof v==='object'){if(typeof v.id==='string')s.add(v.id);for(const k in v)idsOf(v[k],s);}return s;};
  let ids=new Set();
  const walk=(v,path)=>{
   if(Array.isArray(v))v.forEach((x,i)=>walk(x,`${path}[${i}]`));
   else if(v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype)for(const k in v){if(k[0]==='_')continue;
    if(!V.has(k)&&!ids.has(k)&&/^[A-Za-z_$][\w$]*$/.test(k)){const g=guess(k,fields);errs.push(`${path}.${k}：模板裡沒有 ${k} 這個欄位，寫了會被丟掉${g?`，是不是 ${g}？`:''}`);}
    walk(v[k],`${path}.${k}`);}
  };
  list.forEach((sp,i)=>{
   const def=SCENES[sp?.scene];if(!def||sp.scene==='custom')return;
   ids=idsOf(sp);
   const known=knownOf(def),tag=`第 ${i+1} 鏡（${sp.scene}）`,can=()=>[...known].filter(x=>!FREE.includes(x)&&def.help?.[x]!=null).join('、');
   for(const k in sp){if(k[0]==='_')continue;
    if(!known.has(k)){const g=guess(k,known);
     if(!V.has(k)||g)errs.push(`${tag}：不認識引數 ${k}${g?`，是不是 ${g}？`:''}（${sp.scene} 能寫的：${can()}；通用的：until、says、enter、tone、note）`);
     else warns.push(`${tag}：${sp.scene} 不讀引數 ${k}，寫了也不會畫出來（${sp.scene} 能寫的：${can()}）`);}
    else walk(sp[k],`${tag}.${k}`);}
  });
  return {errs,warns};
 }
 K.film=async list=>{
  if(!Array.isArray(list)||!list.length)throw Error('K.film([...]) 要一張鏡頭表（陣列，每一鏡一個物件）');
  const errs=[];list.forEach((sp,i)=>checkTimes(sp,`第 ${i+1} 鏡`,errs));
  const ck=await checkKeys(list);
  if(ck.errs.length)errs.push(...ck.errs);
  if(errs.length)throw Error(`鏡頭表有 ${errs.length} 處寫錯了：\n`+errs.join('\n'));
  ck.warns.forEach(warn);
  await Promise.all([...scanImgs(list)].map(loadImg));
  let t0=0;const out=[];
  for(let i=0;i<list.length;i++){
   const sp=list[i],tag=`第 ${i+1} 鏡（${sp.scene??'?'}${sp.says?`：${sp.says}`:''}）`,def=SCENES[sp.scene];
   if(!def)throw Error(`${tag}：沒有這個場景。能用的：${Object.keys(SCENES).join('、')}`);
   const last=i===list.length-1;
   if(sp.until==null&&!last)throw Error(`${tag}：要寫 until（這一鏡到哪一刻結束，比如 '@b05'——下一句開口）`);
   const t1=sp.until==null?F.T.duration:T(sp.until);
   if(t1<=t0+.3)throw Error(`${tag}：until ${sp.until} = ${t1.toFixed(2)} 秒，比這一鏡開始的 ${t0.toFixed(2)} 秒早，或者短於 0.3 秒`);
   const p={...(def.defaults??{}),...sp};
   for(const k of def.need??[])if(p[k]==null)throw Error(`${tag}：缺引數 ${k}${def.help?.[k]?`（${def.help[k]}）`:''}`);
   const enter=sp.enter??'cut';if(!ENTERS.includes(enter))throw Error(`${tag}：enter 只能是 ${ENTERS.join(' / ')}`);
   const c={i,t0,t1,d:t1-t0,T,K,p,enter,prev:out[i-1]?.f??null,tag,warn:m=>warn(`${tag}：${m}`)};
   c.at=v=>v==null?null:T(v);
   // 畫風的硬規矩：寫了也照預設畫，只提醒
   if(sp.tone!=null&&!TONE[sp.tone])c.warn(`tone:'${sp.tone}' 不再當整屏底色，按 navy 畫（底色只有 navy / charcoal / wine；公司顏色寫在 color 裡）`);
   if(p.glow&&!def.glow)c.warn(`開了 glow（顏色光）：原版只有人物鏡頭（person）身後有一團品牌色，別的場景開了像零幾年的 PPT；確定要就留著`);
   if(sp.dust)c.warn('dust（前景浮塵）已經去掉了，寫了也不畫：前後層用實拍和摳像來做');
   const enN=[...A(sp.nodes),...A(sp.items),...A(sp.cards),sp.left,sp.right].filter(n=>n&&typeof n==='object'&&n.en).length;
   if(enN&&!def.vert)c.warn(`${enN} 個圓盤 / 節點 / 卡片 / 表頭寫了 en（英文小字）：英文小字只跟著眉題和片名，別處刪掉`);
   if(sp.brow&&A(sp.nodes).some(n=>n.type==='num'&&n.brow))c.warn('整張圖的 brow 和 num 節點的 brow 同時寫了：一幀最多一組眉題');
   if(enter==='flat'&&c.prev&&!(typeof def.flat==='function'?def.flat(p):def.flat))c.warn(`enter:'flat'（上一鏡倒成桌面）只給"站在桌面上"的場景用（${Object.keys(SCENES).filter(k=>SCENES[k].flat).join('、')}；title、statement 不帶 items 時）；${sp.scene} 鋪滿畫面，會和倒下去的上一鏡疊在一起，改用 cut 或 blur`);
   // 背景：enter:'flat' 時是上一鏡倒下去的桌面，否則是這一鏡自己的舞臺
   c.bg=(t,cam,camp,o={})=>enter==='flat'&&c.prev?MV.layFlat(t,{t0:c.t0,d:.7,html:MV.still(c.prev,c.t0-.01),why:sp.says}):L(cam,camp,o.z??.25,o.html??stage(o),{zi:0});   // 底層 z-index:0，寫在後面的東西自然蓋在上面
   if(def.prep)await def.prep(p,c);
   def.check?.(p,c);
   const f=wrapEnter(def.make(p,c),c);
   F.shot(t0,t1,f);
   out.push({i,scene:sp.scene,t0,t1,says:sp.says??'',enter,f,p});
   t0=t1;
  }
  lint(out);
  K.shots=out;
  window.KIT_REPORT={shots:out.map(s=>({i:s.i,scene:s.scene,t0:+s.t0.toFixed(2),t1:+s.t1.toFixed(2),says:s.says,enter:s.enter})),warns:K.warns};
  return out;
 };
 // 整片的提醒（不是禁令：每一條答得上"為什麼這裡就該這樣"就留著）
 function lint(out){
  const dur=F.T.duration;
  out.forEach((s,i)=>{
   const tag=`第 ${i+1} 鏡（${s.scene}）`,d=s.t1-s.t0,def=SCENES[s.scene];
   if(!s.says)warn(`${tag}沒寫 says：這一鏡讓觀眾多懂了什麼？說不出來就重想這一鏡`);
   if(def.minDur&&d<def.minDur)warn(`${tag}只有 ${d.toFixed(1)} 秒，${s.scene} 至少要 ${def.minDur} 秒觀眾才看得清`);
   const beats=def.beats?def.beats(s.p):0;
   if(d>6.5&&beats<1)warn(`${tag}有 ${d.toFixed(1)} 秒，中間沒有新的落點（steps）：觀眾會走神，拆成兩鏡，或者加一兩個 step`);
   if(i>=2&&out[i-1].scene===s.scene&&out[i-2].scene===s.scene)warn(`第 ${i-1}–${i+1} 鏡連著三個 ${s.scene}：同一種畫面連著出現，觀眾會膩；能合成一個場景的多個 steps 就合`);
   if(i>=1&&s.enter!=='cut'&&s.enter===out[i-1].enter)warn(`第 ${i}、${i+1} 鏡連著用 enter:'${s.enter}'：同一種接法連用，觀眾會看出套路`);
   if(s.enter.startsWith('push')&&s.scene!=='person')warn(`${tag}用了 push（橫推）：橫推是"換一個並列的主角來說"（人換人最典型，兩鏡都是 person 最穩；公司換公司、並列的兩件事也算）。這一鏡是換主角嗎？是就留著，不是就改 cut 或 blur`);
   const ph=[...scanImgs(s.p)].filter(x=>x.includes('assets/kit/ph/'));if(ph.length)warn(`${tag}還在用 ${ph.length} 個佔位素材（assets/kit/ph/）：成片之前換成真素材`);
  });
  const rolls=out.filter(s=>s.p.roll||s.p.total||(s.p.steps??[]).some(x=>x.roll)).length;
  if(rolls>2)warn(`全片有 ${rolls} 處滾數（number.roll、chart.total、board 的 roll）：只在"累加"本身就是意思的時候滾，一支片一兩次`);
  const wine=out.filter((s,i)=>s.p.tone==='wine'&&!(i&&out[i-1].p.tone==='wine')).length;
  if(wine>1)warn(`全片有 ${wine} 段酒紅底（tone:'wine'）：酒紅一支片最多一段，留給"算總賬 / 虧錢"那一段，其餘用 navy`);
  // 開口要快
  const b0=F.T.beats?.[0];
  if(b0&&b0.start>.5)warn(`第一句 ${b0.start.toFixed(2)} 秒才開口：0.5 秒內就要開口（script.json 的 pre 不超過 0.35）`);
  else if((F.T.pre??0)>.35)warn(`script.json 的 pre 是 ${F.T.pre}：開頭留白不超過 0.35 秒`);
  // 真素材要夠：原版一半左右的畫面是實拍、新聞原文、當事人。只用了佔點陣圖（assets/kit/ph/）的鏡頭不算
  const onlyPh=s=>{const im=[...scanImgs(s.p)];return im.length>0&&im.every(x=>x.includes('assets/kit/ph/'));};
  const real=s=>!onlyPh(s)&&(!!SCENES[s.scene].real?.(s.p)||['footage','montage','frames','popup','person','desk','device'].includes(s.scene)||(s.scene==='article'&&s.p.img)||(['title','statement'].includes(s.scene)&&A(s.p.items).length)||(s.scene==='profile'&&(s.p.img||s.p.photo))||(s.scene==='quote'&&s.p.who?.photo));
  const nr=out.filter(real).length;
  if(out.length>=5&&nr<out.length*.4)warn(`真素材的鏡頭只有 ${nr}/${out.length}（footage、person、desk、article 截圖、montage、frames……；只用了佔點陣圖的不算）：少於四成就會"全是圖形"，原版一半左右是實拍、原文和當事人`);
  // 同一家公司全片同一個顏色
  const seen={},note=(name,color,i)=>{if(!name||!color)return;const k=String(name).trim(),cc=col(color);((seen[k]??={})[cc]??=[]).push(i+1);};
  out.forEach((s,i)=>{const p=s.p;for(const n of [...A(p.nodes),...A(p.items),...A(p.cards)])if(n&&typeof n==='object')note(n.name??n.title,n.color,i);
   note(p.left?.title,p.left?.color,i);note(p.right?.title,p.right?.color,i);note(p.who?.name,p.who?.color,i);if(s.scene==='profile')note(p.name,p.color,i);});
  for(const k in seen){const cs=Object.keys(seen[k]);if(cs.length>1)warn(`「${k}」在不同鏡頭裡用了 ${cs.length} 種顏色（${cs.map(cc=>`${cc}：第 ${[...new Set(seen[k][cc])].join('、')} 鏡`).join('；')}）：同一家公司全片同一個顏色，color 直接寫公司名最穩`);}
  const nst=out.filter(s=>s.scene==='statement').length;if(nst>3)warn(`全片 ${nst} 句金句（statement）：一支片兩三次，多了就不金了`);
  const nch=out.filter(s=>s.scene==='title'&&s.p.kind==='chapter').length;if(nch>3)warn(`全片 ${nch} 張章節卡：一支片最多三張`);
  // 直式片的導演自檢：全片最重的一鏡、她露臉的比例、證據別連太多、質感靠圖
  if(out.length>=5&&out.every(s=>SCENES[s.scene].vert)){
   const hs=out.map((s,i)=>s.p.hero?i+1:0).filter(Boolean);
   if(!hs.length)warn("全片沒有標最重的一鏡（hero:true）：觀眾看完只會記住一個畫面，先定是哪一鏡（通常是答案、最大的那個數），在那一鏡寫 hero:true，它進場會多一下重拍");
   else if(hs.length>1)warn(`第 ${hs.join('、')} 鏡都寫了 hero:true：最重的一鏡全片只能有一個，都重等於都不重`);
   const isH=s=>s.scene.startsWith('v-host');
   if(out.some(isH)){
    const ht=out.filter(isH).reduce((a,s)=>a+s.t1-s.t0,0),r=ht/dur;
    if(r<.3)warn(`她全屏出鏡只佔 ${Math.round(r*100)}%：少於三成，觀眾會忘了是誰在講；證據之間多回到她`);
    if(r>.62)warn(`她全屏出鏡佔了 ${Math.round(r*100)}%：超過六成就是純口播了，把能看見的東西（數、原文、實拍）拿出來單獨給鏡頭`);
    let run=0,from=0;out.forEach((s,i)=>{if(isH(s)){if(run>3)warn(`第 ${from}–${i} 鏡連著 ${run} 鏡沒回到她：每段證據最多 3 鏡，中間插一鏡她`);run=0;}else{if(!run)from=i+1;run++;}});
    for(let i=1;i<out.length;i++){const a=out[i-1],b=out[i],z=s=>JSON.stringify(s.p.zoom??1);if(isH(a)&&isH(b)&&z(a)===z(b))warn(`第 ${i}、${i+1} 鏡她的景別一樣（zoom）：連著兩鏡都是她，景別要換一檔，不然像沒剪`);}
   }
   out.forEach((s,i)=>{const tag=`第 ${i+1} 鏡（${s.scene}）`;
    if(s.scene==='v-chain'&&!A(s.p.items).some(x=>x.img))warn(`${tag}每一環都沒有插畫（img）：白板上只有色卡會顯得平，照 VERTICAL.md"質感靠圖"給每環配一幅白底小插畫`);
    if(s.scene==='v-title'&&!s.p.pic&&!s.p.img)warn(`${tag}只有字：下半屏會空，寫 pic（下面開窗放一張圖）或 img（整屏墊圖）`);});
  }
  const kinds=new Set(out.map(s=>s.scene));
  if(dur>40&&kinds.size<4)warn(`全片只用了 ${kinds.size} 種場景（${[...kinds].join('、')}）：畫面太單一`);
  if(out[0]&&out[0].t1>8)warn(`第一鏡到 ${out[0].t1.toFixed(1)} 秒才換：開頭要快，第一句話說完就進主體`);
 }
 // 整幀外面再包一層：暗角 + 每幀換位置的顆粒
 K.go=()=>F.go({frame:h=>{const f=Math.round((FB.cur.t??0)*30);return h+`<div class="k-vig" style="z-index:85"></div><div class="k-grain" style="z-index:86;background-position:${(f*137)%360}px ${(f*71)%360}px"></div>`;}});
 return K;
}

window.KIT={use,scene,SCENES,FONTS:['500 60px Mi','600 60px Mi','60px Shu','60px Num','600 30px Mont','italic 600 30px Mont'],
 C,IO,E,EI,lerp,f1,f2,f3,SAFE,COLORS,BRAND,TONE,col,rgb,mixc,alpha,shade,num,full,fmtN,numText,numHTML,unitHTML,textW,fitPx,megaW,megaFit,vw,FAM,timer,track,appear,
 fit,unionBox,moveDur,camSeq,fx,stage,disc,card,tag,pill,mark,label,bignum,brow,frame,edges,qpt,person,halo,measure,loadImg,MEAS,ENTERS,hashf,dust,MAP,lonlat,cssScale};
})();
