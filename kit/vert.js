// vert.js —— 直式（1080×1920）場景庫。學自IG「小Lin說」三條直式解讀（refs/2026-11-13_IG_直式解讀參考）。
// 入口頁先寫 <script>window.STAGE={w:1080,h:1920}</script>，載入順序：stage25d → film_base → moves → kit → vert → film.js。
// film.js：const K=await KIT.use(F); await KIT_VERT.use(K,{skin:'dark',brand:'欄目名',host:{name:'host',fps:30}}); await K.film([...]); return K.go();
// 版面：畫面區 0–1574（上 82%），底下 18% 是黑條（平臺的標題、按鈕壓在那裡）；內容放在 y 130–1270；字幕中線 y≈1363。
// 接法：鏡頭之間一律硬切（enter 不寫）；一句話出一樣東西，出來的東西留在畫面上；東西出現 = 0.3 秒淡入 + 上移。
// 每個場景的引數寫在 help 裡；怎麼選場景看 kit/VERTICAL.md。
(()=>{
const {C,IO,E,lerp,f1,f3,col,num,numHTML,fitPx,stage,appear,hashf}=KIT;
const W=1080,H=1920,ZH=1574;
const A=v=>v==null?[]:Array.isArray(v)?v:[v];
const plain=s=>String(s??'').replace(/<[^>]+>/g,'');
const V={skin:'dark',brand:'',bar:true,K:null,pattern:'chart'};
const HOST={on:false,name:'host',fps:30,frames:0,cut:false,cx0:960,faceY:330,sw:1920,sh:1080,bright:1};

// ---------- 小工具 ----------
// 出現：還沒到時刻返回 null（不畫），到了返回 style 片段
const pop=(t,ta,d=.3,r=30,extra='')=>{const a=appear(t,ta,d,r);return a.k<=0?null:`opacity:${f3(a.o)};transform:translateY(${f1(a.dy)}px)${extra}`;};
// 一組東西各自的出現時刻：寫了 at 用 at，沒寫就在這一鏡裡均勻排開
const times=(c,list,lead=.25)=>{const n=list.length,gap=Math.min(1.1,Math.max(.25,(c.d-lead-.5)/Math.max(1,n)));return list.map((it,i)=>(it&&typeof it==='object'?c.at(it.at):null)??c.t0+lead+i*gap);};
const fitH=(s,size,maxW)=>fitPx(plain(s),'han',size,maxW,.04);
const fitU=(s,size,maxW)=>fitPx(plain(s),'ui',size,maxW,.03);
const numSpan=(v,size,cls='',o)=>`<span class="v-num ${cls}" style="font-size:${f1(size)}px">${/^\s*\+/.test(String(v))?'+':''}${numHTML(num(v),o).replace('<span class="g w">.</span>','<span class="g">.</span>')}</span>`;
const numW=(v,size)=>{const p=num(v),s=plain(numHTML(p));return KIT.textW(s,`${size}px ${KIT.FAM.num}`)*1.06+(p.unit?p.unit.length*size*.2:0);};
const fitN=(v,size,maxW)=>{const w=numW(v,size);return w>maxW?Math.floor(size*maxW/w):size;};
const ICON={no:'<svg viewBox="0 0 40 40"><path d="M9 9L31 31M31 9L9 31" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',ok:'<svg viewBox="0 0 40 40"><path d="M7 21L16 30L33 10" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>'};

// 底紋：一個主題線條小圖示平鋪在黑底上（隔行錯開半格）。KIT_VERT.use(K,{pattern:'gold'})
const PAT={
 chart:'<path d="M4 38L20 24L32 31L56 8M44 8H56V20"/>',
 gold:'<path d="M4 42L13 24H51L60 42Z"/><path d="M20 24L26 8H38L44 24"/>',
 coin:'<circle cx="32" cy="22" r="19"/><path d="M39 15C37 11 27 10 26 16C25 23 39 21 38 28C37 34 27 33 25 29M32 7V37"/>',
 oil:'<rect x="16" y="4" width="32" height="38" rx="5"/><path d="M16 16H48M16 30H48"/>',
 car:'<path d="M11 32H4V24L14 22L22 10H42L50 22L60 25V32H53M21 32H43"/><circle cx="16" cy="33" r="5"/><circle cx="48" cy="33" r="5"/>',
 rocket:'<path d="M32 2C42 10 42 24 38 32H26C22 24 22 10 32 2ZM26 26L16 36H26M38 26L48 36H38M29 37L32 43L35 37"/><circle cx="32" cy="16" r="4"/>',
 bag:'<path d="M12 14H52L48 42H16ZM23 14C23 2 41 2 41 14"/>',
};
const patCSS=name=>{const g=PAT[name],ic=(x,y)=>`<g transform="translate(${x} ${y})">${g}</g>`;
 return `.v-bgt{--v-pat:url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="216" height="300" fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ic(22,52)}${ic(130,202)}</svg>`)}')}`;};
// 白紙卡上用的顏色（比深底上的低一檔飽和度）
const CC={gold:'#cf962a',red:'#b5484d',green:'#3d8a66',navy:'#3b4a6b',steel:'#6f8494',blue:'#4a6fa5',teal:'#3f8f8c',purple:'#8a6bb0'};
const ccard=n=>CC[n]??col(n);
// 卡片類場景的內容從哪開始：有她的圓頭像時至少讓到 330
const topOf=p=>Math.max(150+headH(p)+(headH(p)?36:0),p._av?336:0);
const ARCS=`<svg width="1080" height="1574" style="position:absolute;left:0;top:0" fill="none" stroke="#8fb0c0">${[260,420,600,800,1020,1260,1520].map((r,i)=>`<circle cx="1010" cy="1480" r="${r}" stroke-opacity="${(.3-i*.03).toFixed(2)}" stroke-width="${i%2?1.5:3}"/>`).join('')}</svg>`;

// ---------- 整幀外殼：底 + 內容 + 底下黑條 ----------
function root(p,inner,o={}){
 const skin=p.skin??V.skin;
 const bg=o.bg??(skin==='paper'?'<div class="v-bg v-bgp"></div>':'<div class="v-bg v-bgt"></div>');
 const bar=V.bar?`<div class="v-bar"></div><div class="v-seam"></div>${V.brand?`<div class="v-brandpill">${V.brand}</div>`:''}`:'';
 return `<div class="v-root v-${skin}">${bg}${inner}${bar}</div>`;
}
// 眉題 + 標題（左上，標題從右邊滑進來）
const headH=p=>(p.brow?58:0)+(p.title?String(p.title).split('\n').length*106:0);
function head(p,c,t,y=p._av?(p.brow?150:212):150,size=88,maxW=p._av?720:960){
 const k=E(C((t-c.t0)/.3)),dx=(1-k)*60;let h='';
 if(p.brow)h+=`<div class="v-brow" style="left:62px;top:${y}px;opacity:${f3(k)}">${p.brow}</div>`;
 if(p.title)String(p.title).split('\n').forEach((l,i)=>{h+=`<div class="v-h v-shadow" style="left:60px;top:${y+(p.brow?58:0)+i*106}px;font-size:${fitH(l,size,maxW)}px;opacity:${f3(k)};transform:translateX(${f1(dx)}px)">${l}</div>`;});
 return h;
}
const source=(p,y=1240)=>p.source?`<div class="v-cap" style="left:62px;top:${y}px">${p.source}</div>`:'';

// ---------- 口播（16:9 原片裁進直式）----------
const fi=t=>Math.max(1,Math.min(HOST.frames,Math.round(t*HOST.fps)+1));
const roomSrc=t=>`assets/clips/${HOST.name}/${String(fi(t)).padStart(4,'0')}.jpg`;
const cutSrc=t=>`assets/cut/${HOST.name}/${String(fi(t)).padStart(4,'0')}.png`;
const needHost=c=>{if(!HOST.on)throw Error(`${c.tag}：這個場景要口播素材。film.js 裡 KIT_VERT.use(K,{host:{name:'host',fps:30}})，並且 assets/clips/counts.json 裡登記了口播幀數`);};
// 景別：z 放大倍數（1 = 人高正好鋪滿畫面區），x 人往左右挪（-1..1）。臉落在畫面區 31% 高的地方
const hfil=()=>HOST.bright!==1?`;filter:brightness(${HOST.bright}) saturate(1.06)`:'';
function hgeo(z=1,x=0){
 const s=ZH/HOST.sh*z;let l=W/2-HOST.cx0*s+x*250,tp=ZH*.31-HOST.faceY*s;
 l=Math.min(0,Math.max(W-HOST.sw*s,l));tp=Math.min(0,Math.max(ZH-HOST.sh*s,tp));
 return `position:absolute;left:${f1(l)}px;top:${f1(tp)}px;width:${f1(HOST.sw*s)}px;height:${f1(HOST.sh*s)}px${hfil()}`;
}
// zoom：數字，或 [{at,s,x}]（換檔是硬切）；檔位之間每秒慢推 0.4%
function zoomer(p,c){
 const ks=[{t:-1e9,s:1,x:0},...(typeof p.zoom==='number'?[{t:c.t0,s:p.zoom,x:0}]:A(p.zoom).map(z=>({t:c.at(z.at)??c.t0,s:z.s??1,x:z.x??0})))].sort((a,b)=>a.t-b.t);
 return t=>{let k=ks[0];for(const z of ks)if(t>=z.t)k=z;return {s:k.s*(1+.004*Math.max(0,t-Math.max(c.t0,k.t))),x:k.x};};
}
const hostBox=(t,z,x,mid='')=>`<div class="v-hbox" style="left:0;top:0;width:${W}px;height:${ZH}px"><img src="${roomSrc(t)}" style="${hgeo(z,x)}">${mid}${mid&&HOST.cut?`<img src="${cutSrc(t)}" style="${hgeo(z,x)}">`:''}</div>`;
// 角上的圓頭像：全屏素材時她留在畫面裡
function avatar(t,cx=902,cy=350,d=236,cls='ring'){
 const s=d/600,l=d/2-HOST.cx0*s,tp=d/2-(HOST.faceY+40)*s;
 return `<div class="v-hbox ${cls}" style="left:${f1(cx-d/2)}px;top:${f1(cy-d/2)}px;width:${d}px;height:${d}px;border-radius:${cls==='ring'?'50%':'22px'}"><img src="${roomSrc(t)}" style="position:absolute;left:${f1(l)}px;top:${f1(tp)}px;width:${f1(HOST.sw*s)}px${hfil()}"></div>`;
}

// ---------- 登記：S(名字, {…, draw(p,c) → t=>內容 HTML}) ----------
function S(name,def){
 const {draw,host,...rest}=def;
 KIT.scene(name,{vert:true,code:[draw,head,source,zoomer],...rest,
  make(p,c){if(host)needHost(c);p._av=!!def.av&&HOST.on&&p.avatar!==false;const f=draw(p,c);return t=>{KIT_VERT._bot=0;const inner=f(t)+(p._av?avatar(t,925,300,210):''),b=KIT_VERT._bot,dy=b?Math.round(Math.max(0,Math.min(260,(1236-b)/2))):0;
   const th=t-c.t0,hit=p.hero&&th>=0&&th<.36,body=dy?`<div class="v-abs" style="left:0;top:${dy}px;width:1080px;height:1920px">${inner}</div>`:inner;
   return root(p,hit?`<div class="v-abs" style="left:0;top:0;width:1080px;height:1574px;transform-origin:50% 45%;transform:scale(${f3(1+.07*(1-E(th/.36)))})">${body}</div>${th<.26?`<div class="v-abs" style="left:0;top:0;width:1080px;height:1574px;background:#fff;opacity:${f3(.7*(1-th/.26))}"></div>`:''}`:body,{bg:def.bg?.(p,c,t)});};}});
}

// =============== 一、她在講（口播鋪滿畫面區）===============
S('v-host',{host:true,real:()=>true,
 says:'她對著鏡頭講：開頭打招呼、拋問題、說觀點、結尾收話',use:'沒有別的東西要給觀眾看的句子；每段證據之後回到她',avoid:'一口氣超過 8 秒不換景別、不出東西',
 help:{zoom:"景別：1.25 這樣的數字，或 [{at:'@b02',s:1.3,x:0}] 中途硬切換檔",name:'名字條（第一次出場寫一次）',role:'名字條第二行：身份',nameAt:'名字條出現的時刻',caption:'她頭頂的一行小標題'},
 beats:p=>A(p.zoom).length+(p.name?1:0),
 draw(p,c){const zf=zoomer(p,c),tn=c.at(p.nameAt)??c.t0+.5;
  return t=>{const z=zf(t);let h=hostBox(t,z.s,z.x);
   if(p.caption)h+=`<div class="v-topfade"></div><div class="v-pill" style="left:60px;top:150px;font-size:38px">${p.caption}</div>`;
   if(p.name){const st=pop(t,tn,.3,0);if(st){const k=E(C((t-tn)/.3));h+=`<div class="v-name" style="top:1120px;opacity:${f3(k)};transform:translateX(${f1((k-1)*50)}px)"><b>${p.name}</b>${p.role?`<i>${p.role}</i>`:''}</div>`;}}
   return h;};}
});

S('v-host-cards',{host:true,real:()=>true,minDur:1.6,
 says:'她一邊講，胸前一張一張出卡片：幾個選項、幾家公司、幾個要點',use:'並列的 2–3 樣東西，她唸到哪個出哪個',avoid:'超過 3 張（改 v-list）；卡上寫長句',
 need:['items'],
 help:{items:"[{title, sub, img, value, color, at:'@b03:詞'}]，最多 3 張（bar 最多 4 條）",shape:"'row' 半透明矮卡一排，title 是卡頂的小標籤、value 是卡里的大字（預設）/ 'tall' 豎高卡（帶圖）/ 'bar' 橫條一條一條往下摞",title:'頭頂一行小標題',zoom:'景別，同 v-host'},
 beats:p=>A(p.items).length,
 check(p,c){const n=A(p.items).length,m=p.shape==='bar'?4:3;if(n>m)c.warn(`${n} 張卡太多，胸前放不下：最多 ${m} 張，多了改 v-list`);},
 draw(p,c){const zf=zoomer(p,c),its=A(p.items),ts=times(c,its),n=its.length,sh=p.shape??(its.some(i=>i.img)?'tall':'row');
  return t=>{const z=zf(t);let h=hostBox(t,z.s,z.x)+'<div class="v-botfade"></div>';
   if(p.title){h+=`<div class="v-topfade"></div><div class="v-pill" style="left:60px;top:150px;font-size:38px">${p.title}</div>`;}
   its.forEach((it,i)=>{
    let x,y,w,hh;
    if(sh==='bar'){w=900;hh=118;x=90;y=1224-n*(hh+18)+i*(hh+18);}
    else{const g=sh==='tall'?24:28;w=Math.min(sh==='tall'?340:413,(940-(n-1)*g)/n);hh=sh==='tall'?440:285;x=W/2-(n*w+(n-1)*g)/2+i*(w+g);y=1250-hh;}
    const st=pop(t,ts[i]);if(!st)return;
    const cc=it.color?` col" style="--c:${col(it.color)};`:'" style="';
    const tt=it.title?`<div class="tt" style="font-size:${fitH(it.title,sh==='bar'?56:60,w-(sh==='bar'&&it.value?330:36))}px">${it.title}</div>`:'';
    const vv=it.value?numSpan(it.value,fitN(it.value,sh==='bar'?84:108,sh==='bar'?280:w-30),'white'):'';
    const ss=it.sub?`<div class="ss" style="font-size:${fitU(it.sub,34,w-30)}px">${it.sub}</div>`:'';
    h+=sh==='bar'
     ?`<div class="v-chip${cc}left:${x}px;top:${f1(y)}px;width:${w}px;height:${hh}px;flex-direction:row;justify-content:space-between;padding:0 34px;${st}"><div style="text-align:left">${tt}${ss}</div>${vv}</div>`
     :sh==='tall'?`<div class="v-chip${cc}left:${f1(x)}px;top:${y}px;width:${f1(w)}px;height:${hh}px;${st}">${it.img?`<img src="${it.img}">`:''}${vv}${tt}${ss}</div>`
     :`<div class="v-hcard" style="left:${f1(x)}px;top:${y}px;width:${f1(w)}px;height:${hh}px;${it.color?`--c:${col(it.color)};`:''}${st}">${it.value&&it.title?`<div class="tab">${it.title}</div>`:''}<div class="mm${it.value?'':' han'}" style="font-size:${it.value?Math.min(128,Math.floor(128*(w-50)/Math.max(1,numW(it.value,128)))):fitH(it.title??'',66,w-60)}px">${it.value??it.title??''}</div>${ss}</div>`;
   });
   return h;};}
});

S('v-host-num',{host:true,real:()=>true,minDur:1.2,
 says:'她說出一個大數，數字拍在她胸前',use:'這句話的主角是一個數：漲了多少、虧了多少、多少錢',avoid:'一句裡兩個數（改 v-data）',
 need:['value'],
 help:{value:"'6.9%' '$104' '3.6億'",label:'數字下面一行說明',at:'數字出現的時刻',color:"'red' / 'green'，預設金色",roll:'true = 從 0 滾到這個數',behind:'true = 數字放到她身後（要摳像；數字中間會被頭擋住，只適合 5 位以上的長數）',zoom:'景別，同 v-host'},
 beats:()=>1,
 draw(p,c){const zf=zoomer(p,c),ta=c.at(p.at)??c.t0+.2,P=num(p.value),bk=!!p.behind&&HOST.cut,fs=fitN(p.value,bk?460:330,bk?1000:900),ny=bk?96:(p.label?1196:1270)-fs*1.08;
  return t=>{const z=zf(t),k=C((t-ta)/.32),e=E(k);let mid='';
   if(k>0){const n=p.roll&&P.n!=null?P.n*E(C((t-ta)/.55)):undefined;
    mid=`<div class="${bk?'':'v-hfront'}" style="position:absolute;left:0;top:${f1(ny+(1-e)*(bk?120:0))}px;width:${W}px;text-align:center;opacity:${f3(C(k*2))};${bk?'':`transform:perspective(1400px) rotateY(-14deg) rotate(-3deg) scale(${f3(1+(1-e)*.35)})`}">${numSpan(p.value,fs,bk?p.color??'':'x3 v-x3 '+(p.color??''),{n,fixed:!!p.roll})}</div>`;}
   let h=bk?hostBox(t,z.s,z.x,mid||' '):hostBox(t,z.s,z.x)+'<div class="v-botfade"></div>'+mid;
   if(p.label){const st=pop(t,ta+.25);if(st)h+=`${bk?'<div class="v-botfade"></div>':''}<div style="position:absolute;left:0;width:${W}px;top:1150px;text-align:center;${st}"><span class="v-tag acc" style="position:static;display:inline-block;font-size:${fitU(p.label,52,900)}px">${p.label}</span></div>`;}
   return h;};}
});

S('v-host-words',{host:true,real:()=>true,minDur:1.2,
 says:'她說到關鍵詞，大字一個一個拍在她胸前',use:'一句話裡有 1–3 個要觀眾記住的詞；反問、口頭禪、結論',avoid:'整句話都打出來（那是字幕的事）',
 need:['words'],
 help:{words:"[{text:'反而跌', at:'@b03:反而', hl:true}]，最多 3 個，每個不超過 6 個字；hl:true 的那個更大、金色；中文詞會逐字錯開一點大小和角度",zoom:'景別，同 v-host'},
 beats:p=>A(p.words).length,
 check(p,c){if(A(p.words).length>3)c.warn('大字超過 3 個，會蓋住她');},
 draw(p,c){const zf=zoomer(p,c),ws=A(p.words).map(w=>typeof w==='string'?{text:w}:w),ts=times(c,ws,.15),n=ws.length,fss=ws.map(w=>fitH(w.text,n===1?230:w.hl?205:165,820)),ys=[];
  {let y=1275;for(let i=n-1;i>=0;i--){y-=fss[i]*1.12;ys[i]=y;}}
  return t=>{const z=zf(t);let h=hostBox(t,z.s,z.x)+'<div class="v-botfade"></div>';
   const chars=(w,i)=>{const cs=[...w.text];if(/[A-Za-z0-9]/.test(w.text)||cs.length<2)return w.text;return cs.map((ch,j)=>{const big=w.hl&&j===cs.length-1,r=big?-7:[-5,4,-3,6][(i+j)%4],dy=[0,-.07,.05,-.03][(i*2+j)%4];return `<span style="transform:translateY(${dy}em) rotate(${r}deg) scale(${big?1.13:1});margin:0 ${big?.09:.015}em">${ch}</span>`;}).join('');};
   ws.forEach((w,i)=>{const k=C((t-ts[i])/.2);if(k<=0)return;const sc=1+(1-E(k))*.5,x=i%2?0:-50;
    h+=`<div class="v-word v-x3${w.hl?' hl':''}" style="left:${x}px;top:${f1(ys[i])}px;width:${W-60}px;text-align:center;font-size:${fss[i]}px;opacity:${f3(C(k*2))};transform:perspective(1200px) rotateY(-18deg) rotateX(6deg) rotate(-3deg) scale(${f3(sc)})">${chars(w,i)}</div>`;});
   return h;};}
});

S('v-host-bubbles',{host:true,real:()=>true,minDur:1.5,
 says:'她轉述別人的話、網友的問題：氣泡在她頭兩邊冒出來',use:'"有人說……""你可能會問……"；幾種常見說法',avoid:'氣泡裡寫超過 14 個字',
 need:['items'],
 help:{items:"[{text:'亂世買黃金', mark:'？', at:'@b02:亂世'}]，最多 4 個；mark 是氣泡角上的大符號（'？' '！'），這句話後面要被推翻就寫 '？'",zoom:'景別，同 v-host'},
 beats:p=>A(p.items).length,
 draw(p,c){const zf=zoomer(p,c),its=A(p.items).map(w=>typeof w==='string'?{text:w}:w),ts=times(c,its,.2),PS=[[70,84,'l'],[570,150,'r'],[40,640,'l'],[590,700,'r']];
  return t=>{const z=zf(t);let h=hostBox(t,z.s,z.x);
   its.slice(0,4).forEach((it,i)=>{const k=C((t-ts[i])/.22);if(k<=0)return;const [x,y,sd]=PS[i],e=E(k);
    h+=`<div class="v-bub ${sd}" style="left:${x}px;top:${y}px;width:450px;opacity:${f3(C(k*2))};transform:scale(${f3(.7+.3*e)}) rotate(${sd==='l'?-5:4}deg);transform-origin:${sd==='l'?'90% 100%':'10% 100%'}">${it.text}${it.mark?`<div class="v-bmark" style="${sd==='l'?'right:-96px':'left:-96px'};top:-58px;transform:rotate(${sd==='l'?16:-16}deg)">${it.mark}</div>`:`<svg width="90" height="90" style="position:absolute;${sd==='l'?'right:-78px':'left:-78px;transform:scaleX(-1)'};top:-26px" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M14 60L30 40M40 70L70 52M22 26L28 8"/></svg>`}</div>`;});
   return h;};}
});

S('v-host-sides',{host:true,real:()=>true,minDur:1.5,
 says:'她提到的人 / 公司，照片卡立在她兩邊',use:'講到一兩個當事人、兩家對手',avoid:'沒有照片（改 v-host-cards）',
 need:['items'],
 help:{items:"[{img, name, tag, at}]，1–2 張：第一張在左，第二張在右",zoom:'景別，同 v-host'},
 beats:p=>A(p.items).length,
 draw(p,c){const zf=zoomer(p,c),its=A(p.items).slice(0,2),ts=times(c,its,.2);
  return t=>{const z=zf(t);let h=hostBox(t,z.s,z.x);
   its.forEach((it,i)=>{const k=C((t-ts[i])/.28);if(k<=0)return;const e=E(k),x=i?740:40,dx=(1-e)*(i?80:-80);
    h+=`<div class="v-side" style="left:${x}px;top:660px;width:300px;height:400px;opacity:${f3(C(k*2))};transform:translateX(${f1(dx)}px) rotate(${i?2:-2}deg)"><img src="${it.img}">${it.tag?`<i>${it.tag}</i>`:''}${it.name?`<b style="font-size:${fitH(it.name,40,270)}px">${it.name}</b>`:''}</div>`;});
   return h;};}
});

window.KIT_VERT={S,V,HOST,PAT,CC,ccard,topOf,ARCS,W,H,ZH,A,plain,pop,times,fitH,fitU,numSpan,numW,fitN,ICON,root,head,headH,source,roomSrc,cutSrc,hgeo,zoomer,hostBox,avatar,needHost,
 async use(K,o={}){
  V.K=K;V.skin=o.skin??'dark';V.brand=o.brand??'';V.bar=o.bar!==false;V.pattern=o.pattern??'chart';
  if(!PAT[V.pattern])throw Error(`KIT_VERT.use 的 pattern 只能是 ${Object.keys(PAT).join(' / ')}，現在是 ${V.pattern}`);
  {let st=document.getElementById('v-pat');if(!st){st=document.createElement('style');st.id='v-pat';document.head.appendChild(st);}st.textContent=patCSS(V.pattern);}
  if(!['dark','paper'].includes(V.skin))throw Error(`KIT_VERT.use 的 skin 只能是 'dark' 或 'paper'，現在是 ${V.skin}`);
  if((window.STAGE?.w??1920)!==W)throw Error('直式片的 index.html 裡要先寫 <script>window.STAGE={w:1080,h:1920}</script>（用 new_film.mjs --vertical 建的影片自帶）');
  if(o.host){const h=o.host===true?{}:o.host;
   HOST.name=h.name??'host';HOST.fps=h.fps??30;if(h.faceY)HOST.faceY=h.faceY;HOST.bright=h.bright??1;
   HOST.frames=K.F.CL[HOST.name]??0;if(!HOST.frames)throw Error(`口播幀沒有登記：assets/clips/counts.json 裡要有 "${HOST.name}": 幀數（ffmpeg 按原片幀率抽到 assets/clips/${HOST.name}/0001.jpg…）`);
   let box=null;try{const r=await fetch(`assets/cut/${HOST.name}/box.json`);if(r.ok)box=await r.json();}catch{}
   HOST.cut=!!box;HOST.sw=box?.src_w??h.w??1920;HOST.sh=box?.src_h??h.h??1080;
   const cx=(box?.cx??[]).filter(v=>v!=null).sort((a,b)=>a-b);HOST.cx0=h.cx??(cx.length?cx[cx.length>>1]:HOST.sw/2);
   HOST.on=true;
  }
  // 字幕一行放不下的句子：直式一行 12–14 個字
  for(const b of K.F.T.beats??[])for(const part of String(b.text).split(/(?<=[，？：])/))if(plain(part).replace(/[，。？：]$/,'').length>15)K.warns.push(`句子 ${b.id} 裡「${part}」有 ${part.length} 個字，直式字幕一行放不下（12–14 個字）：文案里加個逗號拆開`);
  const film0=K.film;
  K.film=async list=>{
   const out=await film0(list);
   const hz=out.filter(s=>!SCN(s.scene)).map(s=>s.scene);if(hz.length)K.warns.push(`直式片裡用了橫式場景（${[...new Set(hz)].join('、')}）：它們按 1920×1080 畫，在直式裡會出框，換成 v- 開頭的場景`);
   if(HOST.on){let run=0;for(const s of out){const has=s.scene.startsWith('v-host')||s.p._av||s.p._hostOn||((s.scene==='v-clip'||s.scene==='v-full')&&s.p.avatar!==false&&(s.scene==='v-clip'||s.p.avatar));
     if(has)run=0;else{run+=s.t1-s.t0;if(run>9)K.warns.push(`${s.t1.toFixed(1)} 秒前有 ${run.toFixed(1)} 秒完全沒有她：參考片她佔一半時間，隔幾秒回到 v-host，或用 v-clip（角上有她的圓頭像）`);}}}
   if(window.KIT_VPRO?.checkFilm)KIT_VPRO.checkFilm(out,m=>K.warns.push(m));
   return out;
  };
  return K;
 }};
const SCN=n=>n==='custom'||!!KIT.SCENES[n]?.vert;
if(!KIT.SCENES.custom)KIT.scene('custom',{vert:true,says:'沒有合適的模板時手寫這一鏡',need:['render'],help:{render:'(t, c) => 這一幀的 HTML（1080×1920；外殼用 KIT_VERT.root(p, 內容)）'},make(p,c){return t=>p.render(t,c);}});
})();

// =============== 二、給觀眾看證據（實拍、截圖、照片）===============
(()=>{
const {C,E,f1,f3,col,num,hashf,loadImg}=KIT,{S,V,HOST,W,ZH,A,plain,pop,times,fitH,fitU,numSpan,fitN,head,headH,source,avatar}=KIT_VERT;
// 素材：clip（幀序列名，from 從第幾秒起，rate 倍速）或 img（靜圖，慢慢放大一點）
const media=(p,c)=>t=>p.clip?V.K.F.fr(p.clip,((p.from??0)+(t-c.t0)*(p.rate??1))*30+1):p.img;
const mimg=(p,c,t)=>`<img class="m" src="${media(p,c)(t)}" style="${p.pos?`object-position:${p.pos};`:''}${p.clip?'':`transform:scale(${f3(1+.012*(t-c.t0))})`}">`;
const needMedia=(p,c)=>{if(!p.clip&&!p.img)throw Error(`${c.tag}：要寫 clip（實拍幀序列名）或 img（圖片路徑）`);};
const tagsHTML=(tags,ts,t,x,yb)=>{let h='';const n=tags.length;tags.forEach((g,i)=>{const st=pop(t,ts[i],.25,24);if(!st)return;
 h+=`<div class="v-tag${g.kind?' '+g.kind:i===n-1&&n>1?' acc':''}" style="left:${g.x??x}px;top:${g.y??yb-(n-1-i)*88}px;${st}">${g.text}</div>`;});return h;};
const norm=a=>A(a).map(x=>typeof x==='string'?{text:x}:x);

S('v-clip',{real:()=>true,minDur:1.2,
 says:'實拍 / 照片放在中間一條寬頻裡，上面一行標題，帶子上疊標籤、數字、人',use:'這句話有現成的畫面可看：新聞現場、產品、當事人、地方',avoid:'素材和這句話沒關係（只為了不空著）',
 help:{clip:'實拍幀序列名（assets/clips/<名字>/）',img:'或者一張圖',from:'實拍從第幾秒開始',rate:'倍速',pos:"裁切位置，如 '50% 20%'",title:'帶子上面的標題（可以用 \\n 分兩行，<em>重點</em>）',brow:'標題上面的小字',
  tags:"帶子上的白底標籤，一句出一個，留著不走：[{text:'售價 3 萬', at:'@b03:三萬'}]",
  num:"帶子中間的大數字，可以原地變：{from:'$209', to:'$108', at:'@b04:跌', label:'油價'}",
  person:"右下角的摳像人：{img:'x.png', name:'某某', grayAt:'@b05'}（grayAt 之後變灰 = 出局）",
  strip:"帶子底下的一排小格：[{title:'成本', value:'$2萬', at}]，最多 4 格",avatar:'角上要不要她的圓頭像（有口播時預設要，false 關掉）',source:'素材來源小字'},
 beats:p=>A(p.tags).length+A(p.strip).length+(p.num?1:0)+(p.person?.grayAt?1:0),
 check:needMedia,
 draw(p,c){const hh=headH(p),by=hh?150+hh+38:250,bh=1232-by,tags=norm(p.tags),ts=times(c,tags,.35),strip=A(p.strip),ss=times(c,strip,.4),av=HOST.on&&p.avatar!==false;
  const N=p.num,na=N?c.at(N.at)??c.t0+c.d*.5:0,ga=c.at(p.person?.grayAt);
  return t=>{let h=head(p,c,t,150,88,av?720:960),b=mimg(p,c,t);
   if(p.person){const g=ga!=null?C((t-ga)/.3):0;b+=`<img src="${p.person.img}" style="position:absolute;right:20px;bottom:0;height:${f1(bh*.62)}px;filter:grayscale(${f3(g)}) brightness(${f3(1-g*.45)})">${p.person.name?`<div class="v-tag dark" style="right:40px;bottom:24px;font-size:38px">${p.person.name}</div>`:''}`;}
   if(N){const after=N.to!=null&&t>=na,v=after?N.to:N.from??N.to,k=after?C((t-na)/.22):1,fs=fitN(v,300,900);
    b+=`<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.28)"></div><div style="position:absolute;left:0;width:100%;top:${f1(bh/2-fs*.56)}px;text-align:center;transform:scale(${f3(1+(1-E(k))*.25)})">${numSpan(v,fs,after?N.color??'':'white')}</div>`;
    if(N.label)b+=`<div style="position:absolute;left:0;width:100%;top:${f1(bh/2-fs*.56-90)}px;text-align:center"><span class="v-tag dark" style="position:static;display:inline-block;font-size:40px">${N.label}</span></div>`;}
   b+=tagsHTML(tags,ts,t,40,bh-(strip.length?230:100));
   if(strip.length){const n=Math.min(4,strip.length),w=(W-80-(n-1)*14)/n;strip.slice(0,4).forEach((s,i)=>{const st=pop(t,ss[i],.25,20);if(!st)return;
     b+=`<div class="v-chip" style="left:${f1(40+i*(w+14))}px;bottom:24px;width:${f1(w)}px;height:124px;gap:2px;${st}">${s.value?numSpan(s.value,fitN(s.value,58,w-24),'white'):''}<div class="ss" style="font-size:${fitU(s.title,30,w-20)}px">${s.title??''}</div></div>`;});}
   if(p.source)b+=`<div class="v-cap" style="${av?'left':'right'}:24px;top:16px">${p.source}</div>`;
   h+=`<div class="v-band" style="top:${by}px;height:${bh}px">${b}</div>`;
   if(av)h+=avatar(t,902,by+10);
   return h;};}
});

S('v-full',{real:()=>true,minDur:1,
 says:'一張圖 / 一段實拍鋪滿整個畫面區，字壓在上面',use:'畫面本身夠震撼、夠好看，值得整屏看；開場的第一眼',avoid:'連著用兩次；圖上已經有很多字',
 help:{clip:'實拍幀序列名',img:'或者一張圖',from:'實拍從第幾秒開始',rate:'倍速',pos:'裁切位置',title:'壓在上面的標題',brow:'小字',tags:'標籤，同 v-clip',avatar:'true = 左下角放她的圓頭像',dim:'壓暗多少（0–1，預設 .25）',source:'來源小字'},
 beats:p=>A(p.tags).length,
 check:needMedia,
 draw(p,c){const tags=norm(p.tags),ts=times(c,tags,.35);
  return t=>`<div class="v-band" style="top:0;height:${ZH}px;box-shadow:none">${mimg(p,c,t)}<div style="position:absolute;inset:0;background:rgba(0,0,0,${p.dim??.25})"></div></div><div class="v-topfade"></div>${head(p,c,t,150,104)}${tagsHTML(tags,ts,t,60,1180)}${p.source?`<div class="v-cap" style="left:62px;top:1500px">${p.source}</div>`:''}${p.avatar&&HOST.on?avatar(t,170,1110,220):''}`;}
});

S('v-chapter',{minDur:1,
 says:'換話題：一張章節卡，告訴觀眾"下面講第二件事"',use:'長片（60 秒以上）裡兩三個大段落之間',avoid:'30 秒以內的短片；一支片超過 3 張',
 need:['title'],help:{no:"序號 '01'",title:'這一段的名字',sub:'一行補充'},
 draw(p,c){return t=>{const k=E(C((t-c.t0)/.35)),fs=fitH(p.title,150,940);
  return `${p.no?`<div style="position:absolute;left:60px;top:330px;font:420px/1 Num,sans-serif;color:rgba(255,255,255,.16);-webkit-text-stroke:5px rgba(255,255,255,.75);opacity:${f3(k)}">${p.no}</div>`:''}<div class="v-h v-shadow" style="left:60px;top:700px;font-size:${fs}px;opacity:${f3(k)};transform:translateX(${f1((1-k)*80)}px)">${p.title}</div><div style="position:absolute;left:62px;top:${f1(720+fs*1.2)}px;height:8px;width:${f1(k*320)}px;background:var(--v-on)"></div>${p.sub?`<div style="position:absolute;left:62px;top:${f1(760+fs*1.2)}px;font:500 46px Mi,sans-serif;letter-spacing:3px;color:#fffc;opacity:${f3(k)}">${p.sub}</div>`:''}`;};}
});

S('v-meme',{real:()=>true,minDur:1,
 says:'一張梗圖 / 表情 / 截圖拍在中間，配一句吐槽',use:'調侃、自嘲、網友反應：讓觀眾笑一下',avoid:'一支片超過兩次；嚴肅的資料',
 need:['img'],help:{img:'圖片',caption:'圖下面的一句話（大字）',title:'圖上面的標題',brow:'小字',rot:'歪幾度（預設 -2）'},
 async prep(p){const im=await loadImg(p.img);p._ar=im.naturalWidth/im.naturalHeight;},
 draw(p,c){const top=150+headH(p)+(headH(p)?40:60),maxH=(p.caption?1060:1240)-top,w=Math.min(860,maxH*p._ar),hh=w/p._ar;
  return t=>{KIT_VERT._bot=top+hh+(p.caption?190:20);const k=C((t-c.t0)/.22),e=E(k),st=pop(t,c.t0+.3);
   return `${head(p,c,t)}<div class="v-pic" style="left:${f1(W/2-w/2)}px;top:${f1(top)}px;width:${f1(w)}px;height:${f1(hh)}px;box-shadow:0 0 0 14px #fff,0 30px 70px rgba(0,0,0,.55);border-radius:6px;opacity:${f3(C(k*2))};transform:rotate(${p.rot??-2}deg) scale(${f3(1.25-.25*e)})"><img src="${p.img}"></div>${p.caption&&st?`<div class="v-h v-shadow" style="left:0;width:${W}px;text-align:center;top:${f1(top+hh+70)}px;font-size:${fitH(p.caption,96,960)}px;${st}">${p.caption}</div>`:''}`;};}
});

S('v-doc',{real:()=>true,minDur:1.5,av:true,
 says:'把原文擺出來：新聞、財報、公告的截圖放在白卡上，重點句刷黃',use:'"據某某報道""財報裡寫著"：讓觀眾看到出處',avoid:'截圖上的字小到手機上看不清（先裁到只剩那一段）',
 need:['img'],help:{img:'截圖（先裁好）',title:'上面的標題',brow:'小字（如 來源名）',hl:"刷黃的地方：[{x:.1,y:.3,w:.8,h:.08,at:'@b04:最低'}]，x y w h 是佔截圖寬高的比例",zh:"外文原文的中文：{text:'黃金跌到一年多來最低', at}",source:'來源小字',pos:'截圖太長時顯示哪一段（0 頂部–1 底部）',flat:'true = 截圖平著放（預設斜放，上下邊虛一點）',avatar:'角上要不要她的圓頭像（有口播時預設要，false 關掉）'},
 beats:p=>A(p.hl).length+(p.zh?1:0),
 async prep(p){const im=await loadImg(p.img);p._ar=im.naturalWidth/im.naturalHeight;},
 draw(p,c){const top=Math.max(KIT_VERT.topOf(p),p._av?424:0),zh=p.zh?(typeof p.zh==='string'?{text:p.zh}:p.zh):null,sc=p.flat?1:1.03,maxH=((zh?1040:1220)-top)/sc,ih=960/p._ar,bh=Math.min(ih,maxH),ex=bh*(sc-1)/2,off=-(ih-bh)*(p.pos??0);
  const hl=A(p.hl),ts=times(c,hl,.5),tz=zh?c.at(zh.at)??c.t0+c.d*.55:0;
  return t=>{KIT_VERT._bot=top+bh*sc+(zh?184:0);const k=E(C((t-c.t0)/.3));let h=head(p,c,t);
   h+=`<div class="v-doc${p.flat?'':' tilt'}" style="left:60px;top:${f1(top+ex+(1-k)*40)}px;width:960px;height:${f1(bh)}px;opacity:${f3(k)};${p.flat?'':'scale:'+sc}"><div style="position:absolute;left:0;top:${f1(off)}px;width:960px;height:${f1(ih)}px"><img src="${p.img}" style="position:absolute;left:0;top:0;width:100%;height:100%">${hl.map((b,i)=>{const g=E(C((t-ts[i])/.35));return g<=0?'':`<div class="v-hl" style="left:${f1(b.x*960)}px;top:${f1(b.y*ih)}px;width:${f1(b.w*960*g)}px;height:${f1(b.h*ih)}px"></div>`;}).join('')}</div>${p.flat?'':`<img class="blur" src="${p.img}" style="position:absolute;left:0;top:${f1(off)}px;width:960px;height:${f1(ih)}px">`}</div>`;
   if(zh){const st=pop(t,tz);if(st)h+=`<div class="v-ans" style="left:60px;right:60px;top:${f1(top+bh*sc+34)}px;height:150px;font-size:${fitH(zh.text,72,880)}px;${st}">${zh.text}</div>`;}
   return h+source(p,top+bh*sc+(zh?200:20));};}
});

S('v-stack',{real:p=>A(p.items).some(i=>i.img),minDur:1.5,
 says:'一條接一條的新聞 / 截圖，啪啪啪摞上來：這事到處都在報',use:'"最近全網都在說""一個月裡出了三件事"',avoid:'每張要觀眾細讀（改 v-doc）',
 need:['items'],help:{items:"[{img:'截圖', at}] 或沒有截圖時 [{title:'新聞標題', source:'媒體名', at}]，3–5 張，每張約 1 秒",title:'上面的標題',brow:'小字'},
 beats:p=>A(p.items).length,
 draw(p,c){const its=A(p.items),ts=times(c,its,.15),top=150+headH(p)+70;
  return t=>{KIT_VERT._bot=top+(its.length-1)*46+(its.some(i=>i.img)?560:420)+30;let h=head(p,c,t);
   its.forEach((it,i)=>{const k=C((t-ts[i])/.2);if(k<=0)return;const e=E(k),rot=(hashf(i,3)-.5)*9,x=90+(hashf(i,7)-.5)*70,y=top+i*46+(hashf(i,5)-.5)*30,later=its.filter((_,j)=>j>i&&t>=ts[j]).length;
    h+=`<div class="v-news" style="left:${f1(x)}px;top:${f1(y)}px;width:900px;height:${it.img?560:420}px;opacity:${f3(C(k*2))};transform:rotate(${f1(rot)}deg) scale(${f3(1.3-.3*e)});filter:brightness(${f3(1-Math.min(.45,later*.18))})">${it.img?`<img src="${it.img}">`:`<div class="sr">${it.source??''}</div><div class="tt" style="font-size:${plain(it.title).length>26?46:54}px">${it.title}</div>`}</div>`;});
   return h;};}
});

S('v-collage',{real:()=>true,minDur:1.5,
 says:'幾張照片拼在一起，一張一張貼上來：這一類東西長這樣',use:'舉幾個例子（幾款車、幾個地方、幾個人）',avoid:'超過 4 張；照片之間沒有並列關係',
 need:['items'],help:{items:"[{img, label, at}]，2–4 張",title:'上面的標題',brow:'小字'},
 beats:p=>A(p.items).length,
 draw(p,c){const its=A(p.items).slice(0,4),n=its.length,ts=times(c,its,.3),top=150+headH(p)+(headH(p)?40:0),ah=1240-top,rows=n<=2?n:2,cols=n<=2?1:2,g=22,cw=(960-(cols-1)*g)/cols,ch=(ah-(rows-1)*g)/rows;
  return t=>{let h=head(p,c,t);
   its.forEach((it,i)=>{const k=C((t-ts[i])/.24);if(k<=0)return;const e=E(k),r=Math.floor(i/cols),cl=i%cols,wide=n===3&&i===2;
    h+=`<div class="v-pic" style="left:${f1(60+cl*(cw+g))}px;top:${f1(top+r*(ch+g))}px;width:${f1(wide?960:cw)}px;height:${f1(ch)}px;opacity:${f3(C(k*2))};transform:scale(${f3(1.18-.18*e)})"><img src="${it.img}"${it.pos?` style="object-position:${it.pos}"`:''}>${it.label?`<b>${it.label}</b>`:''}</div>`;});
   return h;};}
});

S('v-phone',{real:()=>true,minDur:1.5,
 says:'一部手機立在中間，螢幕裡是 App / 網頁 / 聊天截圖，可以往下滑',use:'"開啟某某 App 你會看到""評論區都在問"',avoid:'橫版截圖（改 v-doc）',
 need:['img'],help:{img:'豎版截圖',scroll:'這一鏡裡往下滑多少（佔截圖高度的比例，0–1）',title:'上面的標題',brow:'小字',tags:'手機兩邊的標籤：[{text, at}]，左右交替，最多 4 個'},
 beats:p=>A(p.tags).length+(p.scroll?1:0),
 async prep(p){const im=await loadImg(p.img);p._ar=im.naturalWidth/im.naturalHeight;},
 draw(p,c){const top=150+headH(p)+(headH(p)?30:0),ph=1250-top,tags=norm(p.tags).slice(0,4),pw=Math.min(tags.length?480:640,ph*.56),sw=pw-28,ih=sw/p._ar,sh=ph-28,ts=times(c,tags,.5);
  return t=>{const k=E(C((t-c.t0)/.35)),sc=Math.max(0,ih-sh)*Math.min(1,p.scroll??0)*KIT.IO(C((t-c.t0-.4)/Math.max(.5,c.d-.8)));let h=head(p,c,t);
   h+=`<div class="v-phone" style="left:${f1(W/2-pw/2)}px;top:${f1(top+(1-k)*80)}px;width:${f1(pw)}px;height:${f1(ph)}px;opacity:${f3(k)}"><div class="scr"><img src="${p.img}" style="top:${f1(-sc)}px"></div></div>`;
   tags.forEach((g,i)=>{const st=pop(t,ts[i],.25,24);if(!st)return;const L=i%2===0;h+=`<div class="v-tag${i===tags.length-1?' acc':''}" style="${L?'left:40px':'right:40px'};top:${f1(top+ph*(.2+.18*i))}px;${st}">${g.text}</div>`;});
   return h;};}
});
})();

// =============== 三、把賬算給觀眾看（卡片、清單、數字、圖表）===============
(()=>{
const {C,E,IO,f1,f3,col,num,loadImg}=KIT,{S,W,A,plain,pop,times,fitH,fitU,numSpan,fitN,ICON,head,headH,source}=KIT_VERT;
const top0=KIT_VERT.topOf,ccard=KIT_VERT.ccard;
const card=(y,h,inner,k=1)=>(KIT_VERT._bot=y+h,`<div class="v-card tilt" style="left:60px;top:${f1(y+(1-k)*40)}px;width:960px;height:${f1(h)}px;opacity:${f3(k)}">${inner}</div>`);
const kin=(c,t)=>E(C((t-c.t0)/.28));
const obj=v=>v==null?null:typeof v==='object'?v:{text:v};

S('v-list',{av:true,minDur:1.5,
 says:'一張清單卡：幾條原因 / 幾個選項 / 幾步，念一條出一條；最後可以落一塊答案',use:'"有三個原因""要看這幾樣"；排除法（前幾條打叉，最後一條是答案）',avoid:'超過 5 條；每條超過 14 個字',
 need:['items'],
 help:{title:'卡片上面的標題',brow:'小字',items:"[{text:'打仗推高油價', sub:'小字補充', mark:'no'|'ok', hl:true, at:'@b06:油價'}]，2–5 條",answer:"最底下的答案塊：{text:'問題出在利率', at:'@b05:利率'}",source:'來源小字'},
 beats:p=>A(p.items).length+(p.answer?1:0),
 check(p,c){if(A(p.items).length>5)c.warn('清單超過 5 條，手機上字會太小：拆成兩鏡');},
 draw(p,c){const its=A(p.items).map(obj),n=its.length,ts=times(c,its,.3),ans=obj(p.answer),ta=ans?c.at(ans.at)??c.t0+c.d*.8:0,y=top0(p),avail=1236-y,g=16;
  const rh=Math.min(184,(avail-60-(ans?176:0)-(n-1)*g)/n),ch=60+n*rh+(n-1)*g+(ans?176:0);
  return t=>{let b='';
   its.forEach((it,i)=>{const st=pop(t,ts[i],.28,26);if(!st)return;const mk=it.mark?`<div class="v-badge ${it.mark}">${ICON[it.mark]??''}</div>`:`<div class="v-badge">${i+1}</div>`;
    b+=`<div class="v-row${it.hl?' hl':''}" style="top:${f1(30+i*(rh+g))}px;height:${f1(rh)}px;${st}">${mk}<div class="tx" style="font-size:${fitU(it.text,it.sub?54:62,720)}px${it.mark==='no'?';opacity:.72;text-decoration:line-through':''}">${it.text}${it.sub?`<small>${it.sub}</small>`:''}</div></div>`;});
   if(ans){const st=pop(t,ta);if(st)b+=`<div class="v-ans" style="top:${f1(ch-176)}px;height:146px;font-size:${fitH(ans.text,76,800)}px;${st}">${ans.text}</div>`;}
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-data',{av:true,minDur:1.5,
 says:'幾行"名字 + 數字"：左邊是什麼，右邊是多少',use:'一句話裡報了 2–4 個數；幾個指標並排看',avoid:'只有一個數（v-number / v-host-num）；要比大小（v-bars）',
 need:['rows'],
 help:{title:'標題',brow:'小字',rows:"[{label:'通脹', value:'3.6%', note:'小字', color:'red'|'green', hl:true, at}]，2–4 行",source:'來源小字'},
 beats:p=>A(p.rows).length,
 draw(p,c){const rs=A(p.rows),n=rs.length,ts=times(c,rs,.3),y=top0(p),avail=1236-y,g=16,rh=Math.min(230,(avail-60-(n-1)*g)/n),ch=60+n*rh+(n-1)*g;
  return t=>{let b='';
   rs.forEach((r,i)=>{const st=pop(t,ts[i],.28,26);if(!st)return;const fs=fitN(r.value,Math.min(150,rh*.66),500);
    b+=`<div class="v-row${r.hl?' hl':''}" style="top:${f1(30+i*(rh+g))}px;height:${f1(rh)}px;${st}"><div class="tx" style="font-size:${fitU(r.label,58,400)}px">${r.label}${r.note?`<small>${r.note}</small>`:''}</div>${numSpan(r.value,fs,r.color??(r.hl?'acc':''))}</div>`;});
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-bars',{av:true,minDur:1.8,
 says:'橫條比大小：誰多誰少一眼看出來',use:'幾樣東西比同一個數（銷量、價格、佔比）',avoid:'數字差不多大（比不出來）；超過 6 條',
 need:['items'],
 help:{title:'標題',brow:'小字',items:"[{label:'黃金', value:'-6.9%', color:'gold', hl:true, at}]，2–6 條",source:'來源小字'},
 beats:p=>A(p.items).length,
 draw(p,c){const its=A(p.items),n=its.length,ts=times(c,its,.3),y=top0(p),avail=1236-y,rh=Math.min(200,(avail-50)/n),ch=50+n*rh,vs=its.map(i=>{const q=num(i.value);return (q.neg?-1:1)*(q.n??0);});
  const neg=Math.max(0,...vs.map(v=>-v)),pos=Math.max(0,...vs),mixed=neg>0&&pos>0,span=mixed?470:600,x0=50+(mixed?span*neg/(neg+pos):0),mx=mixed?neg+pos:Math.max(neg,pos)||1;
  return t=>{let b=mixed?`<div style="position:absolute;left:${f1(x0-1.5)}px;top:30px;width:3px;height:${f1(ch-60)}px;background:var(--v-ink);opacity:.4"></div>`:'';
   its.forEach((it,i)=>{const k=C((t-ts[i])/.5);if(k<=0)return;const v=vs[i],bw=Math.max(10,span*Math.abs(v)/mx)*E(k),yy=25+i*rh,bh=Math.min(70,rh*.36),left=mixed&&v<0?x0-bw:mixed?x0:50,lx=mixed?Math.max(x0,left+bw)+20:70+bw;
    b+=`<div style="position:absolute;left:50px;top:${f1(yy+rh*.1)}px;font:600 ${fitU(it.label,48,700)}px Mi,sans-serif;opacity:${f3(C(k*3))}">${it.label}</div><div style="position:absolute;left:${f1(left)}px;top:${f1(yy+rh*.1+66)}px;width:${f1(bw)}px;height:${f1(bh)}px;border-radius:10px;background:${it.color?ccard(it.color):it.hl?'var(--v-acc)':'var(--v-ink2)'}"></div><div style="position:absolute;left:${f1(lx)}px;top:${f1(yy+rh*.1+66+bh/2-bh*.62)}px;opacity:${f3(C(k*3))}">${numSpan(it.value,bh*1.3,it.hl?'acc':'')}</div>`;});
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-vs',{av:true,minDur:2,
 says:'上下兩塊對著比：A 是這樣，B 是那樣',use:'兩種選擇、兩家公司、以前和現在',avoid:'三樣以上（v-table）',
 need:['left','right'],
 help:{title:'標題',brow:'小字',left:"上面那塊：{title:'存銀行', value:'4.9%', sub:'每年有利息', color:'navy', img}",right:"下面那塊，同上；再寫 at（它出現的時刻）",verdict:"最後的結論塊：{text:'利率越高越吃虧', at}"},
 beats:p=>1+(p.verdict?1:0),
 draw(p,c){const y=top0(p),vd=obj(p.verdict),avail=1236-y-(vd?170:0),bh=(avail-70)/2,tr=c.at(p.right.at)??c.t0+c.d*.4,tv=vd?c.at(vd.at)??c.t0+c.d*.75:0;
  const blk=(o,yy,st)=>`<div class="v-link" style="left:60px;top:${f1(yy)}px;width:960px;height:${f1(bh)}px;--c:${col(o.color??'navy')};${st}">${o.img?`<img src="${o.img}" style="width:${f1(bh)}px">`:''}<div class="bd"><div class="tt" style="font-size:${fitH(o.title,72,o.value?420:820)}px">${o.title}</div>${o.sub?`<div class="ss">${o.sub}</div>`:''}</div>${o.value?`<div style="padding-right:40px">${numSpan(o.value,fitN(o.value,Math.min(190,bh*.6),400),o.vcolor??'')}</div>`:''}</div>`;
  return t=>{let h=head(p,c,t);const s1=pop(t,c.t0+.1),s2=pop(t,tr);
   if(s1)h+=blk(p.left,y,s1);
   if(s2)h+=blk(p.right,y+bh+70,s2)+`<div class="v-badge" style="position:absolute;left:${W/2-48}px;top:${f1(y+bh-13)}px;width:96px;height:96px;font-size:50px;box-shadow:0 0 0 6px rgba(0,0,0,.35)">VS</div>`;
   if(vd){const st=pop(t,tv);if(st)h+=`<div class="v-ans" style="left:60px;right:60px;top:${f1(y+avail+24)}px;height:146px;font-size:${fitH(vd.text,76,860)}px;${st}">${vd.text}</div>`;}
   return h;};}
});

S('v-pie',{av:true,minDur:1.8,
 says:'一個圓環分成幾塊：錢 / 人 / 份額是怎麼分的',use:'佔比、構成（加起來是 100%）',avoid:'超過 5 塊；不是"構成"的數',
 need:['items'],
 help:{title:'標題',brow:'小字',items:"[{label:'利息', value:60, color:'gold', at}]，2–5 塊，value 是數字",center:'環中間的字',source:'來源小字'},
 beats:p=>A(p.items).length,
 draw(p,c){const its=A(p.items),ts=times(c,its,.3),y=top0(p),sum=its.reduce((a,i)=>a+(+i.value||0),0)||1,PAL=['gold','blue','green','red','steel'],d=Math.min(620,1236-y-60-Math.ceil(its.length/2)*84),ch=d+70+Math.ceil(its.length/2)*84;
  return t=>{let acc=0,seg=[],lg='';
   its.forEach((it,i)=>{const k=E(C((t-ts[i])/.45)),a=(+it.value||0)/sum*360,cc=ccard(it.color??PAL[i%5]);seg.push(`${cc} ${f1(acc)}deg ${f1(acc+a*k)}deg`,`rgba(128,128,128,.14) ${f1(acc+a*k)}deg ${f1(acc+a)}deg`);acc+=a;
    if(k>0)lg+=`<div style="position:absolute;left:${50+(i%2)*440}px;top:${f1(d+56+Math.floor(i/2)*84)}px;display:flex;align-items:center;gap:16px;font:600 44px Mi,sans-serif;opacity:${f3(k)}"><i style="width:30px;height:30px;border-radius:8px;background:${cc}"></i>${it.label} <span style="color:var(--v-ink2)">${Math.round((+it.value||0)/sum*100)}%</span></div>`;});
   const b=`<div style="position:absolute;left:${f1(480-d/2)}px;top:30px;width:${d}px;height:${d}px;border-radius:50%;background:conic-gradient(${seg.join(',')});-webkit-mask:radial-gradient(circle,transparent 42%,#000 42.5%);mask:radial-gradient(circle,transparent 42%,#000 42.5%)"></div>${p.center?`<div class="v-h" style="left:0;width:960px;text-align:center;top:${f1(30+d/2-40)}px;font-size:${fitH(p.center,70,d*.5)}px">${p.center}</div>`:''}${lg}`;
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-move',{av:true,minDur:1.5,
 says:'一個數原地變成另一個數：從多少到多少',use:'漲了、跌了、砍半、翻倍：變化本身是這句話的意思',avoid:'只有一個數（v-number）',
 need:['from','to'],
 help:{title:'標題',brow:'小字',label:'這個數是什麼',from:"原來的數 '4186'",to:"變成的數 '3898'",at:'變的時刻',delta:"變了多少的標籤 '-6.9%'",color:"變完的顏色 'red' / 'green'",source:'來源小字'},
 beats:()=>1,
 draw(p,c){const y=top0(p),ta=c.at(p.at)??c.t0+c.d*.45,ch=Math.min(760,1236-y),fs=Math.min(fitN(p.from,330,860),fitN(p.to,330,860));
  return t=>{const k=C((t-ta)/.3),e=E(k),A0=num(p.from),B0=num(p.to),roll=A0.n!=null&&B0.n!=null;
   let b=p.label?`<div class="v-brow" style="left:50px;top:40px;font-size:42px">${p.label}</div>`:'';
   b+=`<div style="position:absolute;left:0;width:960px;text-align:center;top:${f1(ch*.5-fs*.55-e*(ch*.24))}px;opacity:${f3(1-e*.55)};transform:scale(${f3(1-e*.55)})${k>=1?';text-decoration:line-through':''}">${numSpan(p.from,fs,'white')}</div>`;
   if(k>0){b+=`<div style="position:absolute;left:0;width:960px;text-align:center;top:${f1(ch*.5-fs*.42+(1-e)*40)}px;opacity:${f3(C(k*2))}">${numSpan(p.to,fs,p.color??'',roll?{n:A0.n+(B0.n-A0.n)*E(C((t-ta)/.7)),fixed:true}:undefined)}</div>`;
    const st=p.delta?pop(t,ta+.5):null;if(st)b+=`<div style="position:absolute;left:0;width:960px;text-align:center;top:${f1(ch-150)}px;${st}"><span class="v-tag acc" style="position:static;display:inline-block;font-size:54px">${p.delta}</span></div>`;}
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-sum',{av:true,minDur:2,
 says:'一筆一筆加起來，底下落一個總數',use:'算賬：幾項成本、幾筆收入加起來是多少',avoid:'不是加法關係的幾個數（v-data）',
 need:['items','total'],
 help:{title:'標題',brow:'小字',items:"[{label:'門票', value:'$45萬', at}]，2–4 項",total:"{label:'一共', value:'$60萬', at}",source:'來源小字'},
 beats:p=>A(p.items).length+1,
 draw(p,c){const its=A(p.items),n=its.length,ts=times(c,its,.3),tt=c.at(p.total.at)??c.t0+c.d*.8,y=top0(p),rh=Math.min(180,(1236-y-270)/n),ch=40+n*rh+230;
  return t=>{let b='';
   its.forEach((it,i)=>{const st=pop(t,ts[i],.28,24);if(!st)return;b+=`<div class="v-row" style="top:${f1(30+i*rh)}px;height:${f1(rh-14)}px;background:none;${st}"><div class="tx" style="font-size:${fitU(it.label,54,460)}px">${i?'+ ':''}${it.label}</div>${numSpan(it.value,fitN(it.value,rh*.62,380),'white')}</div>`;});
   const k=E(C((t-tt+.2)/.3));if(k>0)b+=`<div class="v-rule" style="left:50px;top:${f1(36+n*rh)}px;width:860px;transform:scaleX(${f3(k)})"></div>`;
   const st=pop(t,tt);if(st)b+=`<div class="v-ans" style="top:${f1(60+n*rh)}px;height:170px;justify-content:space-between;padding:0 40px;font-size:${fitH(p.total.label??'合計',70,340)}px;${st}"><span>${p.total.label??'合計'}</span><span style="font:${fitN(p.total.value,130,480)}px/1 Num,sans-serif;padding-top:8px">${plain(KIT.numHTML(num(p.total.value)))}</span></div>`;
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-table',{av:true,minDur:2,
 says:'一張對比表：幾樣東西按幾個方面比，一行一行出',use:'三樣以上的東西橫著比；片尾的總結表',avoid:'超過 4 列、6 行；格子裡寫句子',
 need:['cols','rows'],
 help:{title:'標題',brow:'小字',cols:"表頭 ['', '黃金', '美債']",rows:"每行一個陣列 [['利息','沒有','4.9%'], …]",rowAt:"每行出現的時刻 ['@b08','@b09']（不寫就均勻排開）",hlCol:'高亮第幾列（從 0 數）',hlRow:'高亮第幾行',source:'來源小字'},
 beats:p=>A(p.rows).length,
 draw(p,c){const cols=A(p.cols),rows=A(p.rows),nr=rows.length,nc=cols.length||rows[0].length,ts=rows.map((_,i)=>c.at(A(p.rowAt)[i])??c.t0+.4+i*Math.min(1,(c.d-1)/nr)),y=top0(p),hh=cols.length?96:0,rh=Math.min(184,(1236-y-hh-50)/nr),ch=hh+nr*rh+50,w0=nc>2?250:320,cw=(880-w0)/(nc-1);
  const X=j=>40+(j?w0+(j-1)*cw:0),Wd=j=>j?cw:w0;
  return t=>{let b='';
   if(p.hlCol!=null)b+=`<div style="position:absolute;left:${f1(X(p.hlCol)+6)}px;top:14px;width:${f1(Wd(p.hlCol)-12)}px;height:${f1(ch-28)}px;border-radius:18px;background:color-mix(in srgb,var(--v-acc) 16%,transparent);box-shadow:inset 0 0 0 2.5px var(--v-acc)"></div>`;
   cols.forEach((h,j)=>{b+=`<div class="v-cell v-th" style="left:${f1(X(j))}px;top:20px;width:${f1(Wd(j))}px;height:${hh}px;font-size:${fitU(h,48,Wd(j)-16)}px${j===p.hlCol?';color:var(--v-acc);font-weight:700':''}">${h}</div>`;});
   rows.forEach((r,i)=>{const st=pop(t,ts[i],.28,22);if(!st)return;const yy=20+hh+i*rh;
    b+=`<div style="position:absolute;left:40px;top:${f1(yy)}px;width:880px;height:${f1(rh)}px;border-top:2px solid var(--v-line);${i===p.hlRow?'background:var(--v-rowbg);':''}${st}">${A(r).map((v,j)=>`<div class="v-cell" style="left:${f1(X(j)-40)}px;top:0;width:${f1(Wd(j))}px;height:100%;font-size:${fitU(v,j?56:48,Wd(j)-16)}px${j?'':';color:var(--v-ink2)'}">${v}</div>`).join('')}</div>`;});
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-line',{av:true,minDur:2,
 says:'一條走勢線從左畫到右：漲上去、掉下來，關鍵的點標出來',use:'價格、利率、銷量隨時間的變化',avoid:'只有兩三個點（v-move）',
 help:{title:'標題',brow:'小字',points:"[['9月',3592],['10月',4186],…]（至少 4 個點）",data:"或者一個 json 檔案：{points:[[日期,數值],…]}",color:"線的顏色 'red'（預設）/ 'gold' / 'green' / 'navy'",marks:"標出來的點：[{i:12, text:'10 月初 4186', at:'@b04:十月'}]（i 是第幾個點，-1 = 最後一個）",drawTo:'線畫完的時刻（預設這一鏡的 60%）',unit:'數值的單位（寫在最新值後面）',source:'來源小字'},
 beats:p=>1+A(p.marks).length,
 check(p,c){if(!p.points&&!p.data)throw Error(`${c.tag}：要寫 points 或 data`);},
 async prep(p,c){let pts=p.points;if(!pts){const r=await fetch(p.data);if(!r.ok)throw Error(`${c.tag}：讀不到 ${p.data}`);const j=await r.json();pts=j.points??j;}
  p._pts=pts.map(q=>Array.isArray(q)?[String(q[0]),+q[1]]:[String(q.label??q.date??''),+(q.value??q.v)]);if(p._pts.length<4)throw Error(`${c.tag}：走勢線至少要 4 個點`);},
 draw(p,c){const P=p._pts,n=P.length,y=top0(p),ch=Math.min(900,1236-y),pw=860,phh=ch-230,vs=P.map(q=>q[1]),lo=Math.min(...vs),hi=Math.max(...vs),pad=(hi-lo)*.12||1,te=c.at(p.drawTo)??c.t0+c.d*.6,cc=ccard(p.color??'red');
  const X=i=>50+i/(n-1)*pw,Y=v=>150+phh-(v-lo+pad)/(hi-lo+2*pad)*phh,marks=A(p.marks).map(m=>({...m,i:m.i<0?n+m.i:m.i})),ts=marks.map(m=>c.at(m.at)??null);
  const path=P.map((q,i)=>`${i?'L':'M'}${f1(X(i))} ${f1(Y(q[1]))}`).join(''),id='vl'+c.i;
  return t=>{const k=IO(C((t-c.t0-.2)/Math.max(.4,te-c.t0-.2))),xi=k*(n-1),i0=Math.min(n-1,Math.floor(xi)),i1=Math.min(n-1,i0+1),cv=P[i0][1]+(P[i1][1]-P[i0][1])*(xi-i0),cx=X(xi),cy=Y(cv);
   let b=`<svg width="960" height="${f1(ch)}" style="position:absolute;left:0;top:0"><defs><clipPath id="${id}"><rect x="0" y="0" width="${f1(cx)}" height="${f1(ch)}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cc}" stop-opacity=".35"/><stop offset="1" stop-color="${cc}" stop-opacity="0"/></linearGradient></defs>
<line x1="50" x2="910" y1="${150+phh}" y2="${150+phh}" stroke="currentColor" stroke-opacity=".25" stroke-width="2"/><g clip-path="url(#${id})"><path d="${path}L${X(n-1)} ${150+phh}L50 ${150+phh}Z" fill="url(#${id}g)"/><path d="${path}" fill="none" stroke="${cc}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></g><circle cx="${f1(cx)}" cy="${f1(cy)}" r="13" fill="${cc}" stroke="#fff" stroke-width="4"/></svg>`;
   b+=`<div style="position:absolute;left:50px;top:30px">${numSpan(Math.round(cv*10)/10>=1000?Math.round(cv):Math.round(cv*10)/10,104,'acc')}${p.unit?`<span style="font:600 40px Mi,sans-serif;margin-left:10px;color:var(--v-ink2)">${p.unit}</span>`:''}</div>`;
   b+=`<div style="position:absolute;left:50px;top:${f1(160+phh)}px;font:500 30px Mi,sans-serif;color:var(--v-ink2)">${P[0][0]}</div><div style="position:absolute;right:50px;top:${f1(160+phh)}px;font:500 30px Mi,sans-serif;color:var(--v-ink2)">${P[n-1][0]}</div>`;
   marks.forEach((m,j)=>{const ta=ts[j]??c.t0+.2+(te-c.t0-.2)*m.i/(n-1),st=pop(t,ta,.25,16);if(!st)return;const mx=X(m.i),my=Y(P[m.i][1]),R=mx>560,low=R&&P[m.i][1]<P[Math.max(0,m.i-Math.ceil(n*.12))][1];
    b+=`<div style="position:absolute;left:${f1(mx-11)}px;top:${f1(my-11)}px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 0 0 5px ${cc}"></div><div class="v-tag${j===marks.length-1?' acc':''}" style="${R?`right:${f1(960-mx+(low?36:24))}px`:`left:${f1(mx+24)}px`};top:${f1(low?my-12:my<260?Math.max(my-48,150):my-96)}px;font-size:38px;${st}">${m.text}</div>`;});
   return head(p,c,t)+card(y,ch,b,kin(c,t))+source(p,y+ch+32);};}
});

S('v-chain',{av:true,minDur:2,
 says:'因果鏈從上往下一環扣一環：因為 A，所以 B，所以 C',use:'解釋"為什麼"：一步一步推過去',avoid:'並列關係（v-list）；超過 4 環',
 need:['items'],
 help:{title:'標題',brow:'小字',items:"[{title:'打仗推高油價', value:'$104', sub:'油價', img:'白底插畫', color:'red'|'teal'|'purple'|'navy'|'gold', at:'@b06:打仗'}]，2–4 環；value 是這一環的數（大字放右邊）；img 是白底的小插畫（放在色卡左邊）；最後一環預設金色"},
 beats:p=>A(p.items).length,
 real:p=>A(p.items).some(i=>i.img),
 draw(p,c){const its=A(p.items).slice(0,4),n=its.length,ts=times(c,its,.3),y=top0(p),g=46,bh=Math.min(270,(1236-y-60-(n-1)*g)/n),ch=60+n*bh+(n-1)*g,pic=its.some(i=>i.img),iw=pic?Math.min(250,bh*1.1):0,x0=30+(pic?iw+20:0),cw=930-x0;
  return t=>{let b='';
   its.forEach((it,i)=>{const st=pop(t,ts[i],.3,-40);if(!st)return;const yy=30+i*(bh+g),last=i===n-1&&n>1,vw=it.value?KIT.textW(String(it.value),`128px ${KIT.FAM.num}`)+40:0;
    if(i)b+=`<svg width="60" height="${g}" style="position:absolute;left:${f1(x0+cw/2-30)}px;top:${f1(yy-g+2)}px;opacity:${f3(C((t-ts[i]+.15)/.2))}"><path d="M30 6V${g-16}M14 ${g-24}L30 ${g-8}L46 ${g-24}" fill="none" stroke="#39414f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if(it.img)b+=`<img class="v-ill" src="${it.img}" style="left:30px;top:${f1(yy)}px;width:${f1(iw)}px;height:${f1(bh)}px;${st}">`;
    b+=`<div class="v-base" style="top:${f1(yy+bh-1)}px;opacity:${f3(C((t-ts[i])/.3))}"></div><div class="v-step" style="left:${f1(x0)}px;top:${f1(yy+8)}px;width:${f1(cw)}px;height:${f1(bh-16)}px;--c:${ccard(it.color??(last?'gold':'navy'))};${st}"><div class="bd"><div class="tt" style="font-size:${fitH(it.title,last?72:64,cw-60-vw)}px">${it.title}</div>${it.sub?`<div class="ss">${it.sub}</div>`:''}</div>${it.value?`<div class="vv">${it.value}</div>`:''}</div>`;});
   return head(p,c,t)+card(y,ch,b,kin(c,t));};}
});
})();

// =============== 四、整屏大字、提問、品牌、引語 ===============
(()=>{
const {C,E,f1,f3,col,num}=KIT,{S,W,A,pop,times,fitH,fitU,numSpan,fitN,head,headH,source}=KIT_VERT;
const top0=p=>150+headH(p)+(headH(p)?36:0);

S('v-title',{minDur:1,
 says:'整屏斜體大字：片名、一句核心問題、一句結論',use:'開頭拋問題；中間夾在兩段證據之間的一句答案；全片最多三次',avoid:'一行超過 7 個字；連著用',
 need:['lines'],
 help:{lines:"['打仗了', '黃金<em>反而跌</em>？']，1–3 行，一行一行拍上來",brow:'上面的小字',en:"大字下面一行英文小字 'INTEREST RATE'",pic:'大字下面開一扇通欄的窗放一張圖 / 插畫（有它時大字最多 2 行）',img:'整屏墊一張壓暗的圖（和 pic 二選一；都不寫就是純底）',at:"每行出現的時刻 ['@b03','@b03:反而']（不寫就均勻排開）",sub:'最底下一行小字'},
 beats:p=>A(p.lines).length,
 real:p=>!!(p.img||p.pic),
 bg:()=>`<div class="v-bg v-bga">${KIT_VERT.ARCS}</div>`,
 draw(p,c){const ls=A(p.lines),n=ls.length,ts=ls.map((_,i)=>c.at(A(p.at)[i])??c.t0+.05+i*Math.min(.7,(c.d-.6)/n)),fss=ls.map(l=>fitH(l,n===1?230:p.pic?180:200,900)),tot=fss.reduce((a,b)=>a+b*1.22,0),wy=p.pic?Math.max(740,Math.min(770,330+tot+(p.en?90:30))):0,y0=p.pic?Math.max(250,(wy+150)/2-tot/2+10):700-tot/2;
  return t=>{let h=p.img?`<div class="v-band" style="top:0;height:1574px;box-shadow:none"><img class="m" src="${p.img}" style="transform:scale(${f3(1.04+.01*(t-c.t0))});filter:brightness(.38) saturate(.8)"></div>`:'',y=y0;
   h+=`<div style="position:absolute;left:76px;top:150px;width:190px;height:4px;background:#cfd8de"></div><div style="position:absolute;left:280px;top:143px;width:18px;height:18px;transform:rotate(45deg);border:3px solid #cfd8de"></div>`;
   if(p.pic){const kw=E(C((t-c.t0)/.4));h+=`<div class="v-win" style="top:${wy}px;height:${1290-wy}px;opacity:${f3(kw)}"><img src="${p.pic}" style="transform:scale(${f3(1.03+.012*(t-c.t0))})"></div>`;}
   if(p.brow)h+=`<div class="v-brow" style="left:76px;top:${f1(y0-80)}px;font-size:40px">${p.brow}</div>`;
   ls.forEach((l,i)=>{const k=C((t-ts[i])/.2);if(k>0)h+=`<div class="v-slant v-x3" style="left:70px;top:${f1(y)}px;font-size:${fss[i]}px;opacity:${f3(C(k*2))};transform:rotate(-4deg) scale(${f3(1+(1-E(k))*.35)})">${l}</div>`;y+=fss[i]*1.22;});
   if(p.en){const st=pop(t,ts[n-1]+.2,.3,0);if(st)h+=`<div class="v-en" style="left:80px;top:${f1(y+14)}px;${st}">${p.en}</div>`;}
   if(p.sub&&!p.pic){const st=pop(t,ts[n-1]+.35);if(st)h+=`<div style="position:absolute;left:76px;top:${f1(y+50)}px;font:500 46px Mi,sans-serif;letter-spacing:3px;color:#fffc;${st}">${p.sub}</div>`;}
   return h;};}
});

S('v-quiz',{minDur:2,
 says:'一道選擇題：先給選項讓觀眾猜，再亮答案',use:'開頭勾人："你猜是哪個？"；反常識的事實',avoid:'答案顯而易見；一支片超過一次',
 need:['q','options'],
 help:{q:'問題（可以 \\n 分兩行）',options:"['漲', '跌', '不動']，2–4 個",answer:'第幾個是答案（從 0 數）',at:'亮答案的時刻',brow:'小字'},
 beats:p=>A(p.options).length+(p.answer!=null?1:0),
 draw(p,c){const ops=A(p.options),n=ops.length,ql=String(p.q).split('\n'),y=150+(p.brow?58:0)+ql.length*118+60,oh=Math.min(200,(1236-y-(n-1)*24)/n),ta=c.at(p.at)??c.t0+c.d*.7;
  return t=>{KIT_VERT._bot=y+n*oh+(n-1)*24;let h=head({brow:p.brow,title:p.q},c,t,150,100);
   ops.forEach((o,i)=>{const st=pop(t,c.t0+.35+i*.18,.25,24);if(!st)return;const on=p.answer===i&&t>=ta,off=p.answer!=null&&p.answer!==i&&t>=ta;
    h+=`<div class="v-opt${on?' on':''}" style="top:${f1(y+i*(oh+24))}px;height:${f1(oh)}px;font-size:${fitU(o,72,720)}px;${st}${off?';filter:brightness(.72)':''}${on?`;transform:scale(${f3(1+.06*(1-E(C((t-ta)/.3))))})`:''}"><div class="v-badge">${'ABCD'[i]}</div>${o}</div>`;});
   return h;};}
});

S('v-brand',{minDur:1.5,
 says:'一牆色塊：幾家公司 / 幾個品牌 / 幾個國家，說到誰亮誰',use:'"這個行業有這幾家"；點名',avoid:'超過 6 個；要比數字（v-bars）',
 need:['items'],
 help:{title:'標題',brow:'小字',items:"[{name:'美聯儲', sub:'小字', img:'logo.png', color:'navy', at}]，2–6 個",dimAt:'這個時刻之後，沒寫 keep:true 的色塊變暗（只剩主角）'},
 beats:p=>A(p.items).length+(p.dimAt?1:0),
 draw(p,c){const its=A(p.items).slice(0,6),n=its.length,ts=times(c,its,.3),y=top0(p),cols=n<=3?1:2,rows=Math.ceil(n/cols),g=22,cw=(960-(cols-1)*g)/cols,ch=Math.min(cols===1?300:340,(1236-y-(rows-1)*g)/rows),td=c.at(p.dimAt);
  return t=>{KIT_VERT._bot=y+rows*ch+(rows-1)*g;let h=head(p,c,t);
   its.forEach((it,i)=>{const k=C((t-ts[i])/.25);if(k<=0)return;const dim=td!=null&&t>=td&&!it.keep;
    h+=`<div class="v-tile" style="left:${f1(60+(i%cols)*(cw+g))}px;top:${f1(y+Math.floor(i/cols)*(ch+g))}px;width:${f1(cw)}px;height:${f1(ch)}px;--c:${col(it.color??it.name)};font-size:${fitH(it.name??'',cols===1?92:72,cw-50)}px;opacity:${f3(C(k*2))};transform:scale(${f3(1.12-.12*E(k))});filter:brightness(${dim?.55:1}) saturate(${dim?.5:1})">${it.img?`<img src="${it.img}">`:''}${it.name??''}${it.sub?`<small>${it.sub}</small>`:''}</div>`;});
   return h;};}
});

S('v-quote',{minDur:1.8,
 says:'一句引語：誰說的，原話是什麼',use:'當事人、官方、報告裡的一句關鍵原話',avoid:'轉述（直接讓她說）；超過 30 個字',
 need:['text'],
 help:{text:'原話（\\n 換行，<em>重點</em>）',who:'誰說的',role:'身份 / 出處',photo:'頭像',at:'出處出現的時刻',brow:'小字'},
 beats:()=>1,
 real:p=>!!p.photo,
 draw(p,c){const ls=String(p.text).split('\n'),fs=Math.min(...ls.map(l=>fitH(l,104,840))),lh=fs*1.34,ch=150+ls.length*lh+(p.who?220:50),y=Math.max(p.brow?230:150,690-ch/2),tw=c.at(p.at)??c.t0+Math.min(1.2,c.d*.5);
  return t=>{const k=E(C((t-c.t0)/.3));let b=`<div class="v-qm" style="left:44px;top:20px;font-size:270px;color:var(--v-acc);opacity:.6">“</div>`;
   ls.forEach((l,i)=>{const st=pop(t,c.t0+.1+i*.22);if(st)b+=`<div class="v-h" style="left:60px;top:${f1(130+i*lh)}px;font-size:${fs}px;${st}">${l}</div>`;});
   const st=p.who?pop(t,tw):null;
   if(st)b+=`<div style="position:absolute;left:60px;top:${f1(150+ls.length*lh+20)}px;display:flex;align-items:center;gap:26px;${st}">${p.photo?`<img src="${p.photo}" style="width:140px;height:140px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 5px var(--v-acc)">`:'<i style="width:70px;height:6px;background:var(--v-acc)"></i>'}<div><div style="font:58px Shu,sans-serif;letter-spacing:3px">${p.who}</div>${p.role?`<div style="font:500 36px Mi,sans-serif;color:var(--v-ink2);margin-top:6px;letter-spacing:2px">${p.role}</div>`:''}</div></div>`;
   return (p.brow?`<div class="v-brow" style="left:62px;top:${f1(y-70)}px;opacity:${f3(k)}">${p.brow}</div>`:'')+`<div class="v-card" style="left:60px;top:${f1(y+(1-k)*40)}px;width:960px;height:${f1(ch)}px;opacity:${f3(k)}">${b}</div>`;};}
});

S('v-number',{minDur:1.2,
 says:'整屏只有一個大數',use:'全片最重要的那個數；沒有口播素材時代替 v-host-num',avoid:'一支片超過兩次',
 need:['value'],
 help:{value:"'6.9%' '$7250億'",brow:'數字上面：這是什麼數',label:'數字下面一行說明',roll:'true = 從 0 滾上來',color:"'red' / 'green'，預設金色",at:'說明出現的時刻',source:'來源小字'},
 beats:p=>p.label?1:0,
 draw(p,c){const P=num(p.value),fs=fitN(p.value,520,980),tl=c.at(p.at)??c.t0+.6;
  return t=>{const k=C((t-c.t0)/.3),e=E(k),n=p.roll&&P.n!=null?P.n*E(C((t-c.t0)/1)):undefined;
   let h=p.brow?`<div class="v-brow" style="left:0;width:${W}px;text-align:center;top:${f1(640-fs*.62)}px;font-size:44px;opacity:${f3(k)}">${p.brow}</div>`:'';
   h+=`<div style="position:absolute;left:0;width:${W}px;text-align:center;top:${f1(700-fs*.5)}px;opacity:${f3(C(k*2))};transform:scale(${f3(1.2-.2*e)})">${numSpan(p.value,fs,p.color??'',{n,fixed:!!p.roll})}</div>`;
   const st=p.label?pop(t,tl):null;if(st)h+=`<div class="v-h v-shadow" style="left:0;width:${W}px;text-align:center;top:${f1(700+fs*.56)}px;font-size:${fitH(p.label,76,940)}px;${st}">${p.label}</div>`;
   return h+source(p,1240);};}
});
})();
