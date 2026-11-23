// vpro.js —— 直式"精裝"元件（v2.6，2026-11-20）。載入順序：vert.js 後面；樣式在 vpro.css。
// 來歷：《英偉達拒絕老黃迴歸》直式改了九版，使用者點頭的那一版（examples/nvda-vertical/）。對標小Lin說直式片量出來、試出來的五條：
//   1 口播畫面保持亮，不壓黑          2 強調色從口播畫面裡取（她的衣服、佈景），全片一套顏色、一種卡
//   3 東西做大、敢出框                4 會動的是真東西的摳圖或生圖道具，不用程式碼畫
//   5 每樣東西只做一個有意思的動作，落定後一個畫素不動（不彈、不晃、不飄、鏡頭不頓）
// 二十個元件，有她沒她都能用：前 8 個是講故事的（有口播時她是底），後 12 個是算賬、比較、引用、分段的圖形鏡頭（有口播時她在角上的圓頭像裡）。
// 有口播素材就墊她的實拍，沒有（或寫 host:false）就墊 bg 那張圖。一支片裡每個元件最多用一兩次，進場別重複。
// 用法：film.js 裡 await KIT_VERT.use(K,{…}) 之後寫一句 KIT_VPRO.theme({accent:'#8a86ee'})，主色取自口播畫面；然後鏡頭表裡寫 scene:'vp-words' 這些。
// 顏色：一個主色（卡的底、細邊、大字）+ 三個伴色（青綠、杏橙、天藍，按主色自動配、飽和度壓低，theme({palette:[…]}) 可以自己定）。
//       圖形鏡頭裡每樣東西輪著用這四個顏色（每項寫 c:0–3 可以指定），所以一屏不是一個顏色，但都在一個家族裡。
(()=>{
const {S,W,ZH,A,plain,fitH,fitU,fitN,hostBox,avatar,roomSrc,HOST}=KIT_VERT;
const {hashf}=KIT;
const c01=x=>Math.max(0,Math.min(1,x)),f1=x=>(+x).toFixed(1),f3=x=>(+x).toFixed(3),lerp=(a,b,k)=>a+(b-a)*k;
const oc=k=>1-Math.pow(1-c01(k),3);                                   // 減速
const oe=k=>{k=c01(k);return k>=1?1:1-Math.pow(2,-10*k);};            // 急停（砸）
const ei=k=>c01(k)**2;                                                // 加速（下落）
const io=k=>{k=c01(k);return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;};   // 推鏡頭
const tail=(tau,half=.14)=>tau<=0?0:1-Math.pow(.5,tau/half);          // 急衝進來、拖長尾巴（參考片名卡量的：剩餘距離每 0.14 秒減半）
const wipe=k=>`clip-path:inset(-20% ${f1(100*(1-k))}% -20% -5%)`;

// ---------- 主題：給一個強調色，其餘自己配 ----------
const hex=c=>{const m=/^#([0-9a-f]{6})$/i.exec(c);if(!m)throw Error(`KIT_VPRO.theme：顏色要寫成 '#8a86ee' 這樣，收到 ${c}`);return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16));};
const mix=(a,b,k)=>'#'+hex(a).map((v,i)=>Math.round(lerp(v,hex(b)[i],k)).toString(16).padStart(2,'0')).join('');
const TH={};let PUFF={};
const hsv2hex=(h,sv,v)=>{h=((h%360)+360)%360;const f=n=>{const k=(n+h/60)%6;return Math.round(255*(v-v*sv*Math.max(0,Math.min(k,4-k,1))));};return '#'+[f(5),f(3),f(1)].map(x=>x.toString(16).padStart(2,'0')).join('');};
const hueOf=c=>{const [r,g,b]=hex(c).map(x=>x/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;return 60*(mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4);};
const tri=c=>({b:c,hi:mix(c,'#ffffff',.62),lo:mix(c,'#05061c',.56)});
// 第 i 樣東西用第幾個顏色：0 主色，1–3 伴色，輪著用
const KV=i=>{const k=TH.pal[((i%TH.pal.length)+TH.pal.length)%TH.pal.length];return `--k:${k.b};--kh:${k.hi};--kl:${k.lo};`;};
function theme(o={}){
 const a=o.accent??'#8a86ee';
 Object.assign(TH,{accent:a,hi:o.hi??mix(a,'#ffffff',.7),lo:o.lo??mix(a,'#05061c',.58),card1:o.card1??mix(a,'#0b0d2c',.7),card2:o.card2??mix(a,'#05061c',.9),ink:o.ink??'#f4f2ff',
  num1:o.num1??mix(a,'#ffffff',.18),num2:o.num2??mix(a,'#05061c',.5),num3:o.num3??mix(a,'#05061c',.72),up1:o.up1??'#7fe0cc',up2:o.up2??'#2a8f84',cool:o.cool??'#a9c4ff',bg:o.bg??TH.bg??null});
 {const h=hueOf(a);TH.pal=(o.palette??[a,hsv2hex(h-68,.38,.78),hsv2hex(h+140,.40,.92),hsv2hex(h-28,.30,.90)]).map(tri);}   // 伴色：青綠、杏橙、天藍，參考片量到的那幾個調子；飽和度壓在四成以下，亮度和主色齊，放在一起不搶
 PUFF={white:['#ffffff',mix('#ffffff',a,.12),mix(a,'#05061c',.55)],accent:[TH.hi,a,TH.lo],cool:[mix(TH.cool,'#ffffff',.8),TH.cool,mix(TH.cool,'#05061c',.55)],gray:['#dfe2e7','#8a8f9a','#474b55']};
 TH.pal.forEach((k,i)=>{PUFF['c'+i]=[k.hi,k.b,k.lo];});
 const [r,g,b]=hex(TH.hi);let st=document.getElementById('vp-theme');if(!st){st=document.createElement('style');st.id='vp-theme';document.head.appendChild(st);}
 st.textContent=`:root{--vp-accent:${a};--vp-hi:${TH.hi};--vp-lo:${TH.lo};--vp-card1:${TH.card1};--vp-card2:${TH.card2};--vp-ink:${TH.ink};--vp-line:rgba(${r},${g},${b},.78);--vp-num1:${TH.num1};--vp-num2:${TH.num2};--vp-num3:${TH.num3};--vp-up1:${TH.up1};--vp-up2:${TH.up2}}.v-root{--v-on:${mix(a,'#ffffff',.45)}}`;
 return TH;}
theme();

// ---------- 立體字：鼓起來的面 + 薄厚度 + 外包一圈深色細邊，每個字各歪一點，末字更大 ----------
const pch=(ch,col,st='')=>{const c=PUFF[col]??PUFF.white;return `<span class="vp-p" style="--c1:${c[0]};--c2:${c[1]};--e:${c[2]};${st}"><i class="b">${ch}</i><i class="f">${ch}</i></span>`;};
const TILT=[-5,4,-3,6],LIFT=[0,-.06,.05,-.03];
const pword=(text,col,fx,big=true)=>{const cs=[...text];return cs.map((ch,j)=>{const last=big&&j===cs.length-1&&cs.length>1,o=fx?fx(j,cs.length):{};if(o.hide)return `<span style="opacity:0;display:inline-block">${ch}</span>`;
  return pch(ch,o.col??col,`margin:0 ${last?.07:.012}em;transform:${o.pre??''} translateY(${f3(LIFT[j%4]+(o.dy??0))}em) rotate(${f1((last?-7:TILT[j%4])+(o.rot??0))}deg) scale(${f3((last?1.14:1)*(o.sc??1))});opacity:${f3(o.op??1)}`);}).join('');};
const line=(html,y,fs,x=-20,extra='')=>`<div class="vp-word" style="left:${x}px;top:${f1(y)}px;width:${W}px;font-size:${f1(fs)}px;${extra}">${html}</div>`;

// ---------- 底：有她墊她，沒她墊圖 ----------
const useHost=p=>HOST.on&&p.host!==false;
// 景別隻在指定的詞上硬切，檔位之間不慢推
const zoomS=(p,c)=>{const ks=[{t:-1e9,s:1,x:0},...(typeof p.zoom==='number'?[{t:c.t0,s:p.zoom,x:0}]:A(p.zoom).map(z=>({t:c.at(z.at)??c.t0,s:z.s??1,x:z.x??0})))].sort((a,b)=>a.t-b.t);return t=>{let k=ks[0];for(const z of ks)if(t>=z.t)k=z;return {s:k.s,x:k.x};};};
const BGPOS=['50% 30%','24% 42%','76% 36%','50% 62%','34% 22%'];
const bgOf=p=>p.bg??TH.bg;
const bgPos=(p,c)=>p.bgpos??(p.bg?'50% 30%':BGPOS[Math.floor(hashf(Math.round(c.t0*10),4)*BGPOS.length)]);
const bgHTML=(p,c,t,o={})=>(bgOf(p)?`<div class="v-band" style="top:0;height:${ZH}px;box-shadow:none"><img class="m" src="${bgOf(p)}" style="object-position:${bgPos(p,c)};transform:scale(${f3((o.s??(p.bg?1.1:1.1+.25*hashf(Math.round(c.t0*10),6)))+.012*(t-c.t0))});filter:blur(${o.blur??0}px) brightness(${o.bri??.55}) saturate(.6)"></div>`:'')+'<div class="vp-tint"></div><div class="vp-dots"></div>';
function stage(p,c,zf,t,mid=''){if(useHost(p)){p._hostOn=true;const z=zf(t);return hostBox(t,z.s,z.x,mid)+'<div class="v-botfade"></div>';}return bgHTML(p,c,t)+mid;}
const ava=(p,t,cx=932,cy=196,d=176)=>{if(HOST.on&&p.avatar!==false){p._hostOn=true;return avatar(t,cx,cy,d);}return '';};
const markHost=p=>{if(useHost(p))p._hostOn=true;};
const markAva=p=>{if(HOST.on&&p.avatar!==false)p._hostOn=true;};

// ---------- 道具：一張摳好的圖做一個動作，做完就停。任何元件都能掛：props:[{kind,…}] ----------
// obj    {img,at,x,y,w,rot}                從近的那一邊滑進來到 (x,y)，長尾巴減速
// pour   {img,at,x,y,w,rot,hide}           從右上滑進來，圖的下面 hide% 從上往下露出來（倒水、撒東西）
// hammer {img,at,x,y,w,ar,block,bw,by}     舉起—砸在 block 上—收走；img 是槌頭在左、柄朝右的橫圖，(x,y) 是柄尾
// bills  {img,at,n,big}                    一張張從下面噴上來、在空中翻（big:true = 鏡頭前虛的幾張）
// layer：'front'（預設，壓在字前）/ 'back'（字後面）/ 'behind'（她身後，要口播摳像）
const hf=(i,s=1)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
const PROP={
 obj(o,c,t){const ta=c.at(o.at)??c.t0+.5,k=tail(t-ta+.12,.16);if(k<=0)return '';const w=o.w??460,x=o.x??-80,y=o.y??780;
  return `<img class="vp-obj" src="${o.img}" style="left:${f1(x-(1-k)*(x<540?720:-720))}px;top:${f1(y)}px;width:${w}px;transform:rotate(${o.rot??-8}deg)">`;},
 pour(o,c,t){const ta=c.at(o.at)??c.t0+1,k=tail(t-ta+.42,.1);if(k<=0)return '';const w=o.w??600,x=o.x??560,y=o.y??420,g=oc((t-ta+.06)/.3);
  return `<img class="vp-obj" src="${o.img}" style="left:${f1(x+(1-k)*760)}px;top:${f1(y-(1-k)*280)}px;width:${w}px;transform:rotate(${o.rot??0}deg);clip-path:inset(0 0 ${f1((o.hide??60)*(1-g))}% 0)">`;},
 hammer(o,c,t){const ts=(c.at(o.at)??c.t0+1)+.1,t0=ts-.62,t1=ts+.16;if(t<t0||t>t1+.3)return '';
  const w=o.w??640,ar=o.ar??.43,px=(o.x??1010)+(1-tail(t-t0,.09))*760+oc((t-t1)/.22)*980,py=o.y??880,bw=o.bw??380;
  const ang=t<ts-.2?lerp(46,66,oc((t-t0-.2)/.2)):t<ts?lerp(66,0,ei((t-(ts-.2))/.2)):0;
  let h=o.block?`<img class="vp-obj" src="${o.block}" style="left:${f1(px-w*.84-bw/2)}px;top:${f1(py+(o.by??w*.13))}px;width:${bw}px">`:'';
  h+=`<img class="vp-obj" src="${o.img}" style="left:${f1(px-w*.96)}px;top:${f1(py-w*ar/2)}px;width:${w}px;transform-origin:96% 48%;transform:rotate(${f1(ang)}deg)">`;
  if(t>=ts&&t-ts<.36){const r=(t-ts)/.36;h+=`<i class="vp-hit" style="left:${f1(px-w*.84-300*r)}px;top:${f1(py+w*.2-70*r)}px;width:${f1(600*r)}px;height:${f1(140*r)}px;opacity:${f3(.7*(1-r))}"></i>`;}
  return h;},
 bills(o,c,t){const ta=c.at(o.at)??c.t0+1,big=!!o.big,n=o.n??(big?5:36),life=1.7;let h='';
  for(let i=0;i<n;i++){const u=t-ta-i*(big?.19:.05);if(u<=0)continue;const cyc=Math.floor(u/life),tau=u-cyc*life,s=i+cyc*17+(big?100:0);
   const a=big?(hf(s,1)<.5?-Math.PI*.62:-Math.PI*.38):-Math.PI*(.2+.6*hf(s,1)),v=(big?1500:1050)+520*hf(s,2),x0=big?(hf(s,1)<.5?150:930):540+160*(hf(s,3)-.5),y0=big?1650:(o.y??1260);
   const x=x0+Math.cos(a)*v*tau*.62,y=y0+Math.sin(a)*v*tau+560*tau*tau,w=big?330:210+70*hf(s,4),op=c01(tau*8)*c01((life-tau)*4);
   h+=`<div class="vp-bill" style="left:${f1(x-w/2)}px;top:${f1(y-w*.21)}px;width:${f1(w)}px;height:${f1(w*.42)}px;background-image:url(${o.img});opacity:${f3(op)};transform:perspective(700px) rotateX(${f1(360*hf(s,5)+tau*(260+240*hf(s,6)))}deg) rotateY(${f1(tau*(140+200*hf(s,7))-60)}deg) rotateZ(${f1(360*hf(s,8)+tau*120)}deg)${big?';filter:blur(5px)':''}"></div>`;}
  return h;},
};
const props=(p,c,t,layer)=>A(p.props).filter(o=>(o.layer??'front')===layer).map(o=>{if(!PROP[o.kind])throw Error(`${c.tag}：props 裡的 kind 寫了 '${o.kind}'，只有 obj / pour / hammer / bills`);return PROP[o.kind](o,c,t);}).join('');
const PH="會動的道具 [{kind:'obj'|'pour'|'hammer'|'bills', img:'摳好的圖', at, x, y, w, layer:'front'|'back'|'behind'}]，一鏡最多一樣；圖用真照片摳（scripts/cut_img.py）或生圖（scripts/gen_prop.sh），不用程式碼畫";

// ====== 1 vp-words：關鍵詞卡著字出現在她胸口（沒她就在畫面中間） ======
S('vp-words',{real:()=>true,minDur:1.2,
 says:'一兩個關鍵詞卡著她說的字出現，大、立體、各歪一點；要"翻轉"意思的那個詞整行翻一下',use:'開場鉤子；一句話裡有 1–2 個要記住的詞',avoid:'整句都打出來（那是字幕的事）；一支片用三次以上',
 need:['words'],help:{words:"[{text:'又反轉了', at:'@b01:又', col:'accent'|'white'|'cool', fx:'cut'|'flip'}]，最多兩個，每個不超過 5 個字；最後一個最大",en:'詞下面一行英文小字',zoom:"景別：數字，或 [{at,s}] 在重音的詞上硬切一檔",bg:'沒有口播時墊的圖',y:'詞的底邊在哪（預設有她 1270、沒她 1060；沒她時常把詞放上面、道具放下面）',props:PH},
 beats:p=>A(p.words).length,
 check(p,c){if(A(p.words).length>2)c.warn('關鍵詞超過 2 個：參考片一次只亮一兩個詞，多了蓋住她');},
 draw(p,c){markHost(p);const zf=zoomS(p,c),ws=A(p.words).map(w=>typeof w==='string'?{text:w}:w),ts=ws.map((w,i)=>c.at(w.at)??c.t0+.6+i*.9),n=ws.length,fss=ws.map((w,i)=>fitH(w.text,i===n-1?252:178,900)),ys=[];
  let y=(p.y??(useHost(p)?1270:1060))-(p.en?64:0);for(let i=n-1;i>=0;i--){y-=fss[i]*1.14;ys[i]=y;}
  return t=>{let h=stage(p,c,zf,t,props(p,c,t,'behind'))+props(p,c,t,'back');
   ws.forEach((w,i)=>{const k=(t-ts[i]+.03)/.24;if(k<=0)return;
    const tf=w.fx==='flip'?`transform-origin:50% 96%;transform:perspective(900px) rotateY(-13deg) rotate(-3deg) rotateX(${f1(-90*(1-oe(k)))}deg)`:`transform:perspective(1200px) rotateY(-13deg) rotateX(5deg) rotate(-3deg) scale(${f3(1+.06*(1-oe(k*2.4)))})`;
    h+=line(pword(w.text,w.col??(i===n-1?'accent':'white')),ys[i],fss[i],i%2?10:-36,tf);});
   if(p.en){const k=oc((t-ts[n-1]-.5)/.36);if(k>0)h+=`<div class="vp-en" style="top:${f1(y+fss.reduce((a,b)=>a+b*1.14,0)+16)}px;${wipe(k)}"><i style="width:${f1(70*k)}px"></i>${p.en}<i style="width:${f1(70*k)}px"></i></div>`;}
   return h+props(p,c,t,'front');};}
});

// ====== 2 vp-newspile：斜桌面上，新聞卡從鏡頭前飛下去摞起來 ======
S('vp-newspile',{real:()=>true,minDur:1.5,
 says:'一個往後仰的桌面，新聞卡從鏡頭前一張張飛下去落成一摞，後落的把先落的壓暗；最後可以蓋一塊牌',use:'"到處都在報""一週裡出了三件事"',avoid:'每張要細讀（改 vp-paper）；超過 4 張',
 need:['items'],help:{items:"[{img:'臺標+標題的橫條截圖（寬:高≈3:1，scripts/snap_news.mjs 截）', pic:'卡下半的圖（可不寫）', pos:'圖的裁切', at}]，2–4 張",bg:'壓暗虛化墊底的圖（下一鏡要出現的人或物最好）',brow:'左上小字',stamp:"{text:'辭職', en:'RESIGNED', at}：最後蓋上去的牌",cw:'卡寬，預設 990（比畫面略窄，歪著就出框）',tiltX:'桌面後仰多少度，預設 17',props:PH},
 beats:p=>A(p.items).length+(p.stamp?1:0),
 draw(p,c){const its=A(p.items),cw=p.cw??990,sh=cw/3,ph=p.ph??cw*.36,D=.5,ts=its.map((it,i)=>c.at(it.at)??c.t0+.1+i*.9),st=ts.map(x=>Math.max(c.t0,x-D*.6)),ld=st.map(x=>x+D);
  const geo=its.map((it,i)=>{const sd=i%2?1:-1;return {sd,h:sh+(it.pic?ph:0),x:(W-cw)/2+sd*52,y:(p.top??200)+i*(p.step??sh+4),r:-sd*(3.2+2*hashf(i,3)),z:i*40};});
  const sp=p.stamp,tsp=sp?c.at(sp.at)??c.t0+c.d-.8:0;
  markAva(p);return t=>{const th=t-c.t0;let h=bgOf(p)?`<div class="v-band" style="top:0;height:${ZH}px;box-shadow:none"><img class="m" src="${bgOf(p)}" style="object-position:${bgPos(p,c)};transform:scale(${f3(1.16+.012*th)});filter:blur(16px) brightness(.34) saturate(.7)"></div><div class="vp-vig"></div>`:'';
   if(p.brow){const k=oc((th-.1)/.35);if(k>0)h+=`<div class="v-brow" style="left:62px;top:118px;${wipe(k)}">${p.brow}</div>`;}
   h+=props(p,c,t,'back')+`<div class="v-abs" style="left:0;top:0;width:${W}px;height:${ZH}px;perspective:1500px;perspective-origin:50% 36%"><div class="v-abs" style="left:0;top:0;width:${W}px;height:${ZH}px;transform-style:preserve-3d;transform-origin:50% 46%;transform:rotateX(${p.tiltX??17}deg) rotateY(-4deg) rotateZ(-2deg) scale(.99)">`;
   its.forEach((it,i)=>{const g=geo[i],tau=(t-st[i])/D;if(tau<=0)return;const e=oe(tau*1.15),fl=1-e,push=its.reduce((a,_,j)=>j>i?a+oc((t-(ld[j]-.07))/.22):a,0);
    h+=`<div class="vp-nc" style="left:${f1(g.x)}px;top:${f1(g.y)}px;width:${cw}px;height:${f1(g.h)}px;opacity:${f3(c01(tau*8))};transform:translate3d(${f1(g.sd*-420*fl)}px,${f1(-330*fl)}px,${f1(g.z+1050*fl)}px) rotateX(${f1(-34*fl)}deg) rotateZ(${f1(g.r+g.sd*-24*fl)}deg);filter:brightness(${f3(1-Math.min(.34,push*.16))})${fl>.03?` blur(${f1(6*fl)}px)`:''};box-shadow:0 4px 0 #c9cdd3,0 9px 0 #aeb3bb,0 ${f1(lerp(30,120,fl))}px ${f1(lerp(60,170,fl))}px rgba(0,0,0,${f3(lerp(.66,.28,fl))})"><img class="s" src="${it.img}" style="height:${f1(sh)}px">${it.pic?`<div class="p" style="top:${f1(sh)}px;height:${f1(ph)}px"><img src="${it.pic}" style="object-position:${it.pos??'50% 30%'}"></div>`:''}</div>`;});
   h+='</div></div>';
   if(sp&&t>tsp-.02){const k=(t-tsp)/.16;h+=`<div class="vp-stamp" style="left:${sp.x??470}px;top:${sp.y??690}px;opacity:${f3(c01(k*3))};transform:rotate(-13deg) scale(${f3(1+2.1*(1-oe(k)))})"><b>${pword(sp.text,'accent',null,false)}</b>${sp.en?`<u>${sp.en}</u>`:''}</div>`;}
   return h+props(p,c,t,'front')+ava(p,t);};}
});

// ====== 3 vp-person：摳出來的當事人站在前面，引語卡打字，巨字從他身後滑出來 ======
S('vp-person',{real:()=>true,minDur:2,
 says:'摳出來的當事人從下面升起；一張引語卡斜著飛進來、原話一個字一個字打出來；然後卡退場，兩行立體巨字從他身後沿斜線滑出來',use:'"某某說……"，那句話裡有半句是重點',avoid:'沒有能摳的人像；原話超過 20 個字',
 need:['cut','lines'],help:{cut:'摳好的人像（透明 PNG，scripts/cut_img.py）',bg:'墊在最後面壓暗虛化的圖（常用同一張原圖）',name:'引語卡上的名字',sub:'名字旁的小字',quote:'原話（核過出處的），在卡上打字打出來',cardOut:'引語卡退場的時刻',lines:"['願意重返','CEO崗位']：從他身後滑出來的巨字，最後一行是強調色",at:'兩行各自的時刻',brow:'左上小字',source:'照片出處小字',cw:'人像寬，預設 860'},
 beats:p=>1+(p.quote?1:0)+A(p.lines).length,
 async prep(p){const im=new Image();im.src=p.cut;await im.decode();p._ar=im.naturalWidth/im.naturalHeight;},
 draw(p,c){const cwid=p.cw??860,ch=cwid/p._ar,cx=(W-cwid)/2+(p.cx??0),cy=ZH-ch+(p.cy??96),ls=A(p.lines),at=A(p.at),ts=ls.map((_,i)=>c.at(at[i])??c.t0+c.d*.5+i*.5),fss=ls.map(l=>fitH(l,p.size??236,940)),tout=c.at(p.cardOut)??ts[0]-.35,q=[...plain(p.quote??'')],tq0=c.t0+.55,cps=p.cps??13;
  markAva(p);return t=>{const th=t-c.t0;let h=bgHTML(p,c,t,{s:1.22,blur:22,bri:.3});
   if(p.brow){const k=oc((th-.1)/.35);if(k>0)h+=`<div class="v-brow" style="left:62px;top:112px;${wipe(k)}">${p.brow}</div>`;}
   let y=p.top??176;ls.forEach((l,i)=>{const k=tail(t-ts[i],.12);if(k>0)h+=`<div class="vp-word vp-it" style="left:${f1(46+(1-k)*1150)}px;top:${f1(y-(1-k)*150)}px;width:auto;font-size:${fss[i]}px;transform:rotate(-7deg);transform-origin:0 60%;filter:brightness(${f3(.5+.5*c01((t-ts[i])/.4))})">${pword(l,i===ls.length-1?'accent':'white',null,false)}</div>`;y+=fss[i]*1.06;});
   const kc=tail(th-.12,.11),ko=oc((t-tout)/.3);if(p.quote&&kc>0&&ko<1){const nch=Math.max(0,Math.min(q.length,Math.floor((t-tq0)*cps)));
    h+=`<div class="vp-qc" style="left:${f1(52-(1-kc)*760-ko*900)}px;top:${f1(214-ko*60)}px;transform:perspective(1300px) rotateY(${f1(lerp(46,15,kc))}deg) rotateZ(${f1(-3-ko*6)}deg);opacity:${f3(1-ko*.4)}"><div class="hd"><span class="av"><img src="${p.bg??p.cut}" style="${p.bg?'':'transform:none;object-position:50% 12%'}"></span><b>${p.name??''}</b><u>${p.sub??''}</u></div><div class="tx">${q.slice(0,nch).join('')}${nch<q.length?'<i></i>':''}</div></div>`;}
   const kr=tail(th,.16);h+=`<img class="vp-cut" src="${p.cut}" style="left:${f1(cx)}px;top:${f1(cy+(1-kr)*260)}px;width:${cwid}px"><div class="vp-floor"></div>`;
   if(p.source)h+=`<div class="v-cap" style="left:62px;top:1512px">${p.source}</div>`;
   return h+ava(p,t,940,820,164);};}
});

// ====== 4 vp-reject：一個詞砸在胸口；下一個詞從頭頂一個字一個字掉下來 ======
S('vp-reject',{real:()=>true,minDur:1.5,
 says:'一個詞砸在她胸口；下一個詞是冷色，從頭頂一個字一個字掉下來',use:'"不買賬""潑冷水""被拒了"這種轉折；配一個 pour 道具最好',avoid:'連著兩鏡用',
 need:['stamp'],help:{stamp:"{text:'不買賬', at, col}",drop:"{text:'潑冷水', at, col:'cool'}",zoom:'景別',bg:'沒有口播時墊的圖',props:PH},
 beats:p=>1+(p.drop?1:0),
 draw(p,c){markHost(p);const zf=zoomS(p,c),s=p.stamp,d=p.drop,t1=c.at(s.at)??c.t0+.8,t2=d?c.at(d.at)??t1+1.2:1e9,fs1=fitH(s.text,244,880),fs2=d?fitH(d.text,204,860):0,base=useHost(p)?1268:1150,y2=base-fs2*1.12,y1=y2-fs1*1.2-56;
  return t=>{let h=stage(p,c,zf,t,props(p,c,t,'behind'))+props(p,c,t,'back');
   if(t>t1-.02){const k=(t-t1)/.16;h+=`<div class="vp-seal" style="top:${f1(y1)}px;font-size:${fs1}px;opacity:${f3(c01(k*3))};transform:rotate(-6deg) scale(${f3(1+1.9*(1-oe(k)))})">${pword(s.text,s.col??'accent',null,false)}</div>`;}
   if(d&&t>t2-.02)h+=line(pword(d.text,d.col??'cool',j=>{const k=(t-t2-j*.085)/.26;if(k<=0)return {hide:1};return {dy:-7.5*(1-ei(k)),rot:(1-ei(k))*(j%2?16:-16),op:c01(k*8)};}),y2,fs2,-10,'transform:rotate(-2deg)');
   return h+props(p,c,t,'front');};}
});

// ====== 5 vp-paper：帶報頭的原文紙像開門一樣轉正，推到那一行刷黃，貼上"誰說的" ======
S('vp-paper',{real:()=>true,minDur:1.5,
 says:'一頁帶報頭的原文紙像開門一樣從側面轉正；唸到那句話時鏡頭推到那一行、熒光筆刷過去，再貼一張"誰說的"標籤',use:'"財報會上說""據某某報道"',avoid:'截圖上的字推近了也看不清',
 need:['img'],help:{img:'原文截圖（scripts/snap_news.mjs 截，先裁到只剩那一段）',mast:'報頭大字（媒體名）',mastSub:'報頭小字',title:'上面的標題',brow:'小字',hl:'[{x,y,w,h,at}]：刷黃的地方，佔截圖寬高的比例；鏡頭推到第一處',tag:"{text:'董事長 哈維·瓊斯', at}",zoomTo:'推近倍數，預設 1.4'},
 beats:p=>A(p.hl).length+(p.tag?1:0),
 async prep(p){const im=new Image();im.src=p.img;await im.decode();p._ar=im.naturalWidth/im.naturalHeight;},
 draw(p,c){const cw=960,x0=60,top=330,mh=p.mast?92:0,ih=cw/p._ar,bh=Math.min(ih,1250-top-mh),hl=A(p.hl),ts=hl.map((b,i)=>c.at(b.at)??c.t0+1+i*.6),zs=p.zoomTo??1.4;
  const f=hl[0],hx=f?(f.x+f.w/2)*cw:cw/2,hy=f?(f.y+f.h/2)*ih:bh/2,tz=(ts[0]??c.t0+1)-.22,tg=p.tag,ttg=tg?c.at(tg.at)??(ts[0]??c.t0+1)+.5:0;
  markAva(p);return t=>{const th=t-c.t0,k=tail(th,.13),m=io((t-tz)/.75),s=lerp(1,zs,m);
   const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),tx=cl((cw/2-hx)*m,cw-hx-(cw-hx)*s,hx*(s-1)),ty=cl((bh*.42-hy)*m,bh-hy-(ih-hy)*s,hy*(s-1));
   let h=p.brow?`<div class="v-brow" style="left:62px;top:150px;${wipe(oc(th/.3))}">${p.brow}</div>`:'';
   if(p.title)h+=`<div class="v-h v-shadow" style="left:60px;top:208px;font-size:${fitH(p.title,88,720)}px;${wipe(oc((th-.1)/.35))}">${p.title}</div>`;
   h+=`<div class="v-abs" style="left:0;top:0;width:${W}px;height:${ZH}px;perspective:1400px;perspective-origin:50% 44%"><div class="vp-pp" style="left:${x0}px;top:${top}px;width:${cw}px;height:${f1(bh+mh)}px;transform-origin:0 50%;transform:rotateY(${f1(lerp(78,9,k)*(1-m))}deg) rotateX(${f1(4*(1-m))}deg) rotateZ(${f1(-1.6*(1-m))}deg);opacity:${f3(c01(th*10))}">${p.mast?`<div class="mast" style="height:${mh}px"><b>${p.mast}</b><u>${p.mastSub??''}</u></div>`:''}<div class="pg" style="top:${mh}px;height:${f1(bh)}px"><div style="position:absolute;left:0;top:0;width:${cw}px;height:${f1(ih)}px;transform-origin:${f1(hx)}px ${f1(hy)}px;transform:translate(${f1(tx)}px,${f1(ty)}px) scale(${f3(s)})"><img src="${p.img}" style="position:absolute;left:0;top:0;width:100%;height:100%">${hl.map((b,i)=>{const g=oc((t-ts[i])/.42);return g<=0?'':`<div class="v-hl" style="left:${f1(b.x*cw-6)}px;top:${f1(b.y*ih)}px;width:${f1((b.w*cw+12)*g)}px;height:${f1(b.h*ih)}px"></div>`;}).join('')}</div></div></div></div>`;
   if(tg&&t>ttg-.02){const kk=oe((t-ttg)/.22);h+=`<div class="vp-tag k" style="${KV(tg.c??2)}left:${tg.x??470}px;top:${f1(top+mh+bh-58)}px;transform:rotate(4deg) scale(${f3(kk)})"><i></i>${tg.text}</div>`;}
   return h+ava(p,t);};}
});

// ====== 6 vp-verdict：全片最重的一鏡 ======
S('vp-verdict',{minDur:1.2,real:p=>!!(p.bg??TH.bg),
 says:'第一行斜體立體字沿斜線衝進來；（可以先讓一個道具演一下，比如法槌）當事人摳像升起，第二行砸在他額前，他變灰下沉；最後一張原話卡從他胸前滑進來',use:'全片的結論，只用一次',avoid:'一行超過 6 個字',
 need:['lines'],help:{lines:"['董事會拍板','不讓回']",bg:'底圖',cut:'當事人摳像（可不寫）',at:'兩行的時刻',en:'英文小字',sub:'出處小字',note:"{label:'董事長原話', text:'無意讓他<em>恢復CEO職務</em>'}：核過的原話",props:PH},
 beats:p=>A(p.lines).length+(p.note?1:0),
 async prep(p){if(p.cut){const im=new Image();im.src=p.cut;await im.decode();p._ar=im.naturalWidth/im.naturalHeight;}},
 draw(p,c){const ls=A(p.lines),at=A(p.at),ts=ls.map((_,i)=>c.at(at[i])??c.t0+.05+i*1.2),fs0=fitH(ls[0],176,860),fs1=fitH(ls[1]??'',300,800),land=ts[1]+.16,cwid=p.cw??860,chh=p.cut?cwid/p._ar:0,Y0=p.top??(p.cut||p.note?196:470);
  return t=>{const th=t-c.t0,gk=oc((t-land)/.5);
   let h=bgHTML(p,c,t,{s:1.08,bri:.55})+`<div class="vp-brush" style="transform:rotate(-8deg) translateX(${f1(-1300*(1-tail(th,.1)))}px)"></div>`+props(p,c,t,'back');
   const k0=tail(t-ts[0],.12);if(k0>0)h+=`<div class="vp-word vp-it" style="left:${f1(60+(1-k0)*1150)}px;top:${f1(Y0-(1-k0)*160)}px;width:auto;font-size:${fs0}px;transform-origin:0 60%;transform:rotate(-7deg)">${pword(ls[0],'white',null,false)}</div>`;
   if(p.cut&&t>ts[1]-.3){const kr=tail(t-(ts[1]-.3),.09);h+=`<img class="vp-cut" src="${p.cut}" style="left:${f1((W-cwid)/2+70)}px;top:${f1(ZH-chh+(1-kr)*1250+gk*46)}px;width:${cwid}px;filter:grayscale(${f3(gk)}) brightness(${f3(1-.4*gk)})">`;}
   if(ls[1]&&t>ts[1]-.02){const k=(t-ts[1])/.16;h+=`<div class="vp-word vp-it" style="left:54px;top:${f1(Y0+fs0*1.12)}px;width:auto;font-size:${fs1}px;opacity:${f3(c01(k*4))};transform-origin:36% 55%;transform:rotate(-7deg) scale(${f3(1+1.8*(1-oe(k)))})">${pword(ls[1],'accent',null,false)}</div>`;}
   if(p.note){const kt=tail(t-land-.12,.11);if(kt>0)h+=`<div class="vp-note" style="top:${p.noteY??1150}px;transform:rotate(-6deg) translateX(${f1(-1200*(1-kt))}px)"><u>${p.note.label??''}</u><b>${p.note.text}</b></div>`;}
   if(p.en){const k=oc((t-land-.2)/.36);if(k>0)h+=`<div class="v-en" style="left:74px;top:${f1(Y0+fs0*1.12+fs1*1.16+10)}px;font-size:32px;transform:rotate(-7deg);transform-origin:0 50%;${wipe(k)}">${p.en}</div>`;}
   if(t>=land&&t-land<.45){const r=(t-land)/.45;h+=`<i class="vp-shock" style="left:${f1(430-700*r)}px;top:${f1(560-700*r)}px;width:${f1(1400*r)}px;height:${f1(1400*r)}px;opacity:${f3(.5*(1-r))}"></i>`;}
   if(t>=land&&t-land<.18)h+=`<div class="v-abs" style="left:0;top:0;width:${W}px;height:${ZH}px;background:var(--vp-hi);opacity:${f3(.26*(1-(t-land)/.18))}"></div>`;
   if(p.sub)h+=`<div class="v-cap" style="left:62px;top:1512px">${p.sub}</div>`;
   return h+props(p,c,t,'front');};}
});

// ====== 7 vp-voices：圓徽章滾進來各說一句，被一根橫槓壓下去 ======
S('vp-voices',{real:()=>true,minDur:2,
 says:'兩三枚大小不一的圓徽章像硬幣一樣從兩邊滾進來，各冒一句話；唸到轉折時徽章變灰下沉，一根寫著結論的橫槓從上面落下來',use:'"連某某都替他說話，也沒用"；列舉幾個表態的人',avoid:'超過 3 枚；每人的話超過 6 個字',
 need:['items'],help:{items:"[{img, name, tag:'身份', say:'一句核過的原話', at, pos}]，第一枚最大",deny:'{at}：這時徽章變灰下沉',bar:"{text:'立規矩', at, en}：落下來的橫槓",zoom:'景別',bg:'沒有口播時墊的圖',props:PH},
 beats:p=>A(p.items).length+(p.deny?1:0)+(p.bar?1:0),
 draw(p,c){markHost(p);const zf=zoomS(p,c),its=A(p.items),ts=its.map((it,i)=>c.at(it.at)??c.t0+.3+i*.7),td=p.deny?c.at(p.deny.at)??c.t0+c.d*.6:1e9,b=p.bar,tb=b?c.at(b.at)??td+.5:1e9,fsb=b?fitH(b.text,170,620):0,hy=useHost(p)?0:-170;
  const geo=its.map((it,i)=>{const sd=i%2?1:-1,d=i?330:400;return {sd,d,x:sd<0?16+d/2:W-16-d/2,y:(i?770:900)+hy};});
  return t=>{let h=stage(p,c,zf,t,props(p,c,t,'behind'))+props(p,c,t,'back');
   its.forEach((it,i)=>{const g=geo[i],k=tail(t-ts[i]+.1,.1);if(k<=0)return;const dn=oc((t-td-i*.07)/.4);
    h+=`<div class="vp-coin" style="${KV(it.c??i+1)}left:${f1(g.x-g.d/2+g.sd*640*(1-k)+g.sd*34*dn)}px;top:${f1(g.y-g.d/2+70*dn)}px;width:${g.d}px;height:${g.d}px;transform:rotate(${f1(g.sd*-250*(1-k)+g.sd*15*dn)}deg);filter:grayscale(${f3(dn)}) brightness(${f3(1-.45*dn)})"><img src="${it.img}" style="object-position:${it.pos??'50% 20%'}"></div>`;
    const kn=oc((t-ts[i]-.28)/.3);if(kn>0)h+=`<div class="vp-coinname" style="left:${f1(g.x-150+g.sd*34*dn)}px;top:${f1(g.y+g.d/2-30+70*dn)}px;opacity:${f3(kn*(1-.5*dn))}"><b>${it.name}</b><u>${it.tag??''}</u></div>`;
    if(it.say){const ks=oe((t-ts[i]-.42)/.22)*(1-oc((t-td)/.18));if(ks>0)h+=`<div class="vp-say ${g.sd<0?'l':'r'}" style="${g.sd<0?'left':'right'}:44px;top:${f1(g.y-g.d/2-118)}px;transform:rotate(${g.sd*-4}deg) scale(${f3(ks)})">${it.say}<s></s></div>`;}});
   if(b&&t>tb-.02){const k=tail(t-tb,.07);h+=`<div class="vp-bar" style="top:${f1(lerp(-260,(p.barY??1052)+hy,k))}px;transform:rotate(-3deg)"><i></i><span style="font-size:${fsb}px">${pword(b.text,'accent',null,false)}</span>${b.en?`<u>${b.en}</u>`:''}<i></i></div>`;}
   return h+props(p,c,t,'front');};}
});

// ====== 8 vp-number：用一個數收尾 ======
S('vp-number',{real:()=>true,minDur:2,
 says:'一個頂滿寬的巨數升起來、邊升邊數（有口播摳像時真的在她身後）；下面滑上來一張讀數卡，柱子往上長，把漲幅露出來',use:'用一個數收尾；一句話的主角就是這個數',avoid:'一句裡兩個數',
 need:['value'],help:{value:"'1158' '-6.9%' '$104'：數字前後可以帶符號，小數照寫",unit:'單位，寫在讀數卡上',label:'讀數卡上的說明',pct:"漲幅 '+103%'（可不寫）",at:'出現的時刻',zoom:'景別，建議 1.0',bg:'沒有口播時墊的圖',lit:'巨數用亮色還是深色：不寫就自己量（她身後的牆暗就用亮色，牆亮就用深色；沒有她用亮色），true / false 可以硬定',props:PH+"；收尾常掛 bills（layer:'behind'）"},
 beats:()=>2,
 async prep(p){if(p.lit!=null||!useHost(p))return;try{const im=new Image();im.src=roomSrc(1);await im.decode();const cv=document.createElement('canvas');cv.width=32;cv.height=32;const g=cv.getContext('2d');g.drawImage(im,0,0,32,32);const d=g.getImageData(0,0,32,12).data;let s=0;for(let i=0;i<d.length;i+=4)s+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];p._lit=s/(d.length/4)/255<.42;}catch{p._lit=false;}},
 draw(p,c){markHost(p);const zf=zoomS(p,c),ta=(c.at(p.at)??c.t0+.4)-.1,M=/^([^\d]*)([\d.,]+)(.*)$/.exec(String(p.value))??['','',String(p.value),''],N=parseFloat(M[2].replace(/,/g,'')),dec=(M[2].split('.')[1]??'').length,fs=Math.min(p.size??610,fitN(p.value,610,1130)),tc=ta+.55,host=useHost(p);
  const fmt=v=>isNaN(N)?p.value:M[1]+v.toFixed(dec).padStart(M[2].replace(/,/g,'').length,' ')+M[3];
  return t=>{const k=tail(t-ta,.2),n=N*oe((t-ta)/1.15);
   const num=k>0?`<div class="vp-back${(p.lit??p._lit??!host)?' lit':''}" style="top:${f1(lerp(620,p.top??(host?36:300),k))}px;font-size:${fs}px;opacity:${f3(c01((t-ta)*5))}">${fmt(n)}</div>`:'';
   let h=stage(p,c,zf,t,(num||' ')+props(p,c,t,'behind'))+props(p,c,t,'back');
   const kc=tail(t-tc,.11);if(kc>0){const g=oc((t-tc-.15)/1.0);
    h+=`<div class="vp-read" style="top:${f1((host?1076:980)+(1-kc)*420)}px;transform:rotate(-2deg)">${p.pct?`<div class="col"><i style="height:${f1(150*g)}px"></i><b style="clip-path:inset(${f1(100*(1-g))}% 0 0 0)">${p.pct}</b></div>`:''}<div class="tx"><b>${p.value}<em>${p.unit??''}</em></b><u>${p.label??''}</u></div></div>`;}
   return h+props(p,c,t,'front');};}
});

// ====================================================================================================
// 第二批：算賬、比較、講道理、引用、分段用的 12 個元件（和上面 8 個同一套顏色、同一種卡、同一種進場手感）
// 這批都是"圖形鏡頭"：有口播時她在右上角的圓頭像裡，沒有口播就沒有頭像；底是 bg（或主題裡那張）壓暗虛化。
// ====================================================================================================
const hasAva=p=>HOST.on&&p.avatar!==false;
const hd=(p,th)=>(p.brow?`<div class="v-brow" style="left:62px;top:150px;${wipe(oc(th/.3))}">${p.brow}</div>`:'')+(p.title?`<div class="v-h v-shadow" style="left:60px;top:208px;font-size:${fitH(p.title,88,hasAva(p)?720:960)}px;${wipe(oc((th-.1)/.35))}">${p.title}</div>`:'');
const base=(p,c,t)=>bgHTML(p,c,t,{s:1.14,blur:14,bri:.44}).replace('class="vp-tint"','class="vp-tint g"');   // 圖形鏡頭的底：灰藍、比講故事的鏡頭亮一檔（參考片資料卡的底是 #5F6A88 一類）
const tsOf=(c,its,lead=.35,gap=.7)=>its.map((it,i)=>c.at(it.at)??c.t0+lead+i*Math.min(gap,Math.max(.25,(c.d-lead-.5)/Math.max(1,its.length))));
// 數字從 0 數到位：'$104' '3.6%' '-6.9%' 都認，前後的符號留著
const cnt=(v,k)=>{const m=/^([^\d]*)([\d.,]+)(.*)$/.exec(String(v));if(!m)return String(v);const n=parseFloat(m[2].replace(/,/g,'')),dec=(m[2].split('.')[1]??'').length;return m[1]+(n*k).toFixed(dec)+m[3];};
const numOf=v=>{const m=/([\d.,]+)/.exec(String(v));return m?parseFloat(m[1].replace(/,/g,'')):0;};
const TOP=p=>p.title?350:(p.brow?230:170);
// 斜檯面：圖形鏡頭的內容放在一張有透視的檯面上，進場時從更斜的角度擺到位，然後不動。p.flat:true 可以關掉
const T3=(th,inner,p,o={})=>{if(p.flat)return inner;const k=tail(th,.15),rx=o.rx??10,ry=o.ry??-11;return `<div class="v-abs" style="left:0;top:0;width:${W}px;height:${ZH}px;perspective:1600px;perspective-origin:50% 40%"><div class="v-abs" style="left:0;top:0;width:${W}px;height:${ZH}px;transform-style:preserve-3d;transform-origin:50% 50%;transform:rotateX(${f1(rx+16*(1-k))}deg) rotateY(${f1(ry-24*(1-k))}deg) rotateZ(${o.rz??1.6}deg) scale(${o.s??.95})">${inner}</div></div>`;};
const Z=n=>`translateZ(${n}px)`;

// ====== 9 vp-bars：幾根柱子比大小 ======
S('vp-bars',{real:()=>false,minDur:1.5,
 says:'幾根柱子從底線往上長，數字跟著數上去；最要緊的那根是強調色',use:'幾個數比大小：四家公司的投入、三年的營收',avoid:'超過 5 根；數差不多大（看不出高低）',
 need:['items'],help:{items:"[{label:'微軟', value:'800', hl:true, at}]，2–5 根；value 可帶符號和單位",unit:'左上角的單位小字',flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',bg:'墊底的圖'},
 beats:p=>A(p.items).length,
 draw(p,c){markAva(p);const its=A(p.items),n=its.length,ts=tsOf(c,its),top=TOP(p)+90,by=1170,mh=by-top-70,mx=Math.max(...its.map(i=>numOf(i.value)),1e-9),w=Math.min(210,(900-(n-1)*36)/n),x0=(W-(n*w+(n-1)*36))/2;
  return t=>{const th=t-c.t0;let h=(p.unit?`<div class="v-cap" style="left:64px;top:${TOP(p)+10}px">${p.unit}</div>`:'')+`<div class="vp-base" style="left:60px;top:${by}px;width:${f1(960*oc(th/.4))}px"></div>`;
   its.forEach((it,i)=>{const k=oc((t-ts[i])/.8);if(k<=0)return;const hh=Math.max(14,mh*numOf(it.value)/mx)*k,x=x0+i*(w+36);
    h+=`<div class="vp-col${it.hl?' hl':''}" style="${KV(it.c??i)}left:${f1(x)}px;top:${f1(by-hh)}px;width:${f1(w)}px;height:${f1(hh)}px"><i></i><b></b></div><div class="vp-colv${it.hl?' hl':''}" style="${KV(it.c??i)}left:${f1(x-40)}px;top:${f1(by-hh-116)}px;width:${f1(w+80)}px;transform:${Z(50)}">${cnt(it.value,k)}</div><div class="vp-coll" style="left:${f1(x-40)}px;top:${by+18}px;width:${f1(w+80)}px;font-size:${fitU(it.label,44,w+70)}px;opacity:${f3(c01((t-ts[i])*5))}">${it.label}</div>`;});
   return base(p,c,t)+hd(p,th)+T3(th,h,p)+ava(p,t);};}
});

// ====== 10 vp-versus：兩邊對著看 ======
S('vp-versus',{real:p=>!!(p.left?.img||p.right?.img),minDur:1.5,
 says:'兩張卡從兩邊滑進來對著放，中間一個 VS；可以在某個時刻讓一邊贏',use:'"黃金不生利息，美債一年 4.9%"：兩樣東西對比',avoid:'三樣以上（改 vp-bars / vp-rank）',
 need:['left','right'],help:{left:"{name:'黃金', value:'0%', sub:'不生利息', img, at}",right:'同 left',win:"{side:'right', at}：這時贏的一邊亮起、另一邊變灰",flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',bg:'墊底的圖'},
 beats:p=>2+(p.win?1:0),
 draw(p,c){markAva(p);const L=p.left,Rr=p.right,tl=c.at(L.at)??c.t0+.3,tr=c.at(Rr.at)??c.t0+1,tw=p.win?c.at(p.win.at)??tr+.8:1e9,top=TOP(p)+60,ch=p.left.img||p.right.img?780:660;
  const card=(o,sd,ta,t)=>{const k=tail(t-ta+.08,.11);if(k<=0)return '';const win=oc((t-tw)/.3),lose=p.win&&p.win.side!==(sd<0?'left':'right'),hit=p.win&&!lose;
   return `<div class="vp-vs${hit&&win>0?' on':''}" style="${KV(o.c??(sd<0?1:0))}left:${f1((sd<0?44:556)+sd*620*(1-k))}px;top:${top}px;height:${ch}px;transform:rotateY(${sd*-17}deg) rotate(${sd*-2}deg) ${Z(hit&&win>0?70*win:0)};filter:grayscale(${f3(lose?win:0)}) brightness(${f3(1-(lose?.4*win:0))})">${o.img?`<div class="ph"><img src="${o.img}"></div>`:''}<b style="font-size:${fitH(o.name,72,420)}px">${o.name}</b><em style="font-size:${fitU(String(o.value),150,420)}px">${cnt(o.value,oe((t-ta)/.9))}</em><u>${o.sub??''}</u></div>`;};
  return t=>{const th=t-c.t0,kv=oe((t-tr)/.2);return base(p,c,t)+hd(p,th)+T3(th,card(L,-1,tl,t)+card(Rr,1,tr,t)+(t>tr-.02?`<div class="vp-vsb" style="top:${top+ch/2-64}px;transform:${Z(90)} scale(${f3(1+1.4*(1-kv))});opacity:${f3(c01((t-tr)*8))}">VS</div>`:''),p,{ry:0,rx:8,rz:0})+ava(p,t);};}
});

// ====== 11 vp-chain：一環扣一環 ======
S('vp-chain',{real:p=>A(p.items).some(i=>i.img),minDur:2,
 says:'三四張卡從上往下一張接一張滑進來，中間的箭頭長出來；最後一張是強調色',use:'因果鏈："打仗 → 油價漲 → 通脹 → 加息"',avoid:'超過 4 環；每環的字超過 8 個',
 need:['items'],help:{items:"[{title:'打仗推高油價', value:'$104', sub:'國際油價', img, at}]，3–4 環",flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',bg:'墊底的圖'},
 beats:p=>A(p.items).length,
 draw(p,c){markAva(p);const its=A(p.items),n=its.length,ts=tsOf(c,its),top=TOP(p)+30,gap=56,ch=Math.min(210,(1230-top-(n-1)*gap)/n);
  return t=>{const th=t-c.t0;let h='';
   its.forEach((it,i)=>{const k=tail(t-ts[i]+.08,.1);if(k<=0)return;const y=top+i*(ch+gap),last=i===n-1;
    if(i)h+=`<div class="vp-arrow" style="left:520px;top:${f1(y-gap+6)}px;height:${f1((gap-12)*oc((t-ts[i]+.1)/.25))}px"><i></i></div>`;
    h+=`<div class="vp-link${last?' hl':''}" style="${KV(it.c??i)}left:${f1(70+(i%2?1:-1)*900*(1-k))}px;top:${f1(y)}px;height:${f1(ch)}px;transform:${Z(last?60:i*14)}">${it.img?`<span class="ph"><img src="${it.img}"></span>`:`<span class="no">${i+1}</span>`}<div><b style="font-size:${fitH(it.title,74,it.value?480:700)}px">${it.title}</b><u>${it.sub??''}</u></div>${it.value?`<em>${cnt(it.value,oe((t-ts[i])/.8))}</em>`:''}</div>`;});
   return base(p,c,t)+hd(p,th)+T3(th,h,p)+ava(p,t);};}
});

// ====== 12 vp-list：幾條要點 ======
S('vp-list',{real:()=>false,minDur:1.5,
 says:'幾條要點一條條翻出來，前面一個圓牌（序號、對勾或叉）',use:'"三個原因""兩條出路""該做的和不該做的"',avoid:'超過 4 條；每條超過 12 個字',
 need:['items'],help:{items:"[{text:'利率還在漲', sub:'小字', mark:'ok'|'no'|'1', hl:true, at}]，2–4 條",flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',bg:'墊底的圖'},
 beats:p=>A(p.items).length,
 draw(p,c){markAva(p);const its=A(p.items),n=its.length,ts=tsOf(c,its),top=TOP(p)+40,rh=Math.min(236,(1220-top)/n-24);
  return t=>{const th=t-c.t0;let h='';
   its.forEach((it,i)=>{const k=(t-ts[i]+.04)/.3;if(k<=0)return;const m=it.mark??String(i+1);
    h+=`<div class="vp-row${it.hl?' hl':''}" style="${KV(it.c??i)}left:60px;top:${f1(top+i*(rh+24))}px;height:${f1(rh)}px;opacity:${f3(c01(k*4))};transform:${Z(it.hl?56:0)} rotateX(${f1(-88*(1-oe(k)))}deg)"><span class="bd ${m==='ok'?'ok':m==='no'?'no':''}">${m==='ok'?'✓':m==='no'?'✕':m}</span><div><b style="font-size:${fitH(it.text,80,760)}px">${it.text}</b>${it.sub?`<u>${it.sub}</u>`:''}</div></div>`;});
   return base(p,c,t)+hd(p,th)+T3(th,h,p)+ava(p,t);};}
});

// ====== 13 vp-line：走勢線 ======
S('vp-line',{real:()=>true,minDur:2,
 says:'一條走勢線從左畫到右，畫到哪標到哪；線下面一層淡淡的顏色',use:'"金價一路掉回一年前""股價三個月翻倍"',avoid:'兩條以上的線；沒有真資料（不許編走勢）',
 need:['data'],help:{data:"數字陣列 [3200,3260,…]，或一個 json 檔案（數字陣列，或 [{v:…}] 這類物件陣列，取第一個數字欄位）",marks:"[{i:103, text:'1月最高 $5,318', at}]：i 是第幾個點，-1 是最後一個",drawTo:'畫完的時刻（預設 1.6 秒畫完）',unit:'單位小字',down:'true = 跌的走勢，線和麵用冷色',flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',source:'資料來源小字（要寫）',bg:'墊底的圖'},
 beats:p=>1+A(p.marks).length,
 async prep(p){let d=p.data;if(typeof d==='string')d=await (await fetch(d)).json();if(d&&!Array.isArray(d))d=Object.values(d).find(Array.isArray)??[];p._d=d.map(x=>typeof x==='number'?x:Array.isArray(x)?+x[x.length-1]:+Object.values(x).find(v=>typeof v==='number')).filter(x=>!isNaN(x));},
 check(p,c){if(!p.source)c.warn('走勢線沒寫 source：資料從哪來的要寫在畫面上');},
 draw(p,c){markAva(p);const d=p._d??[],n=d.length,top=TOP(p)+30,cw=960,chh=1210-top,pad=44,mn=Math.min(...d),mx=Math.max(...d),X=i=>pad+(cw-2*pad)*i/Math.max(1,n-1),Y=v=>pad+60+(chh-2*pad-90)*(1-(v-mn)/Math.max(1e-9,mx-mn));
  const pts=d.map((v,i)=>`${f1(X(i))},${f1(Y(v))}`),t1=c.at(p.drawTo)??c.t0+1.9,mk=A(p.marks).map(m=>({...m,i:m.i<0?n+m.i:m.i})),tm=mk.map((m,j)=>c.at(m.at)??lerp(c.t0+.3,t1,m.i/Math.max(1,n-1)));
  return t=>{const th=t-c.t0,k=tail(th,.12),g=c01((t-c.t0-.3)/Math.max(.3,t1-c.t0-.3)),m=Math.max(1,Math.round(g*(n-1)));
   let h=`<div class="vp-chart${p.down?' down':''}" style="${KV(p.c??(p.down?2:1))}left:60px;top:${f1(top+(1-k)*120)}px;width:${cw}px;height:${f1(chh)}px;opacity:${f3(c01(th*8))}">${p.unit?`<u class="un">${p.unit}</u>`:''}<svg width="${cw}" height="${f1(chh)}" viewBox="0 0 ${cw} ${f1(chh)}"><defs><linearGradient id="vpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".42"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>${[.25,.5,.75].map(q=>`<line x1="${pad}" x2="${cw-pad}" y1="${f1(pad+60+(chh-2*pad-90)*q)}" y2="${f1(pad+60+(chh-2*pad-90)*q)}" stroke="rgba(255,255,255,.1)" stroke-width="2"/>`).join('')}${g>0&&n>1?`<polygon points="${pts.slice(0,m+1).join(' ')} ${f1(X(m))},${f1(chh-pad)} ${pad},${f1(chh-pad)}" fill="url(#vpg)"/><polyline points="${pts.slice(0,m+1).join(' ')}" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${f1(X(m))}" cy="${f1(Y(d[m]))}" r="13" fill="#fff" stroke="currentColor" stroke-width="6"/>`:''}</svg>${mk.map((mm,j)=>{const kk=oe((t-tm[j])/.22);if(kk<=0||mm.i>m)return '';const lx=X(mm.i),ly=Y(d[mm.i]);return `<i class="pt" style="left:${f1(lx-9)}px;top:${f1(ly-9)}px"></i><span class="mk" style="${lx>cw/2?`right:${f1(cw-lx-10)}px`:`left:${f1(lx-10)}px`};top:${f1(ly<170?ly+26:ly-78)}px;transform:scale(${f3(kk)})">${mm.text}</span>`;}).join('')}</div>`;
   if(p.source)h+=`<div class="v-cap" style="left:62px;top:1238px">${p.source}</div>`;
   return base(p,c,t)+hd(p,th)+T3(th,h,p,{rx:12,ry:-13})+ava(p,t);};}
});

// ====== 14 vp-photo：一張圖當主角 ======
S('vp-photo',{real:()=>true,minDur:1.2,
 says:'一張圖裝在大窗裡，從側面轉進來停住；下面一條條標籤貼上去',use:'"這就是那座工廠""現場是這樣的"：讓觀眾看見東西本身',avoid:'圖裡的東西很小；連著用兩次',
 need:['img'],help:{img:'圖',pos:"裁切位置，預設 '50% 40%'",title:'標題',brow:'小字',tags:"[{text:'油價衝上 $104', at}]，最多 3 條",source:'出處小字',hh:'窗高，預設 760',bg:'墊底的圖（不寫就用這張圖自己虛化）'},
 beats:p=>A(p.tags).length,
 draw(p,c){markAva(p);const tags=A(p.tags).map(x=>typeof x==='string'?{text:x}:x),ts=tsOf(c,tags,.6,.8),top=TOP(p)+20,hh=Math.min(p.hh??760,1180-top);
  return t=>{const th=t-c.t0,k=tail(th,.13);let h=bgHTML({...p,bg:p.bg??p.img},c,t,{s:1.2,blur:20,bri:.3})+hd(p,th);
   h+=`<div class="v-abs" style="left:0;top:0;width:${W}px;height:${ZH}px;perspective:1500px"><div class="vp-win" style="left:50px;top:${top}px;width:980px;height:${hh}px;transform-origin:100% 50%;transform:rotateY(${f1(-62*(1-k)-5)}deg) rotateZ(1.2deg);opacity:${f3(c01(th*9))}"><img src="${p.img}" style="object-position:${p.pos??'50% 40%'}"></div></div>`;
   tags.forEach((g,i)=>{const kk=oe((t-ts[i])/.22);if(kk>0)h+=`<div class="vp-tag" style="left:${78+i*26}px;top:${f1(top+hh-70-(tags.length-1-i)*96)}px;transform:rotate(${i%2?2:-2}deg) scale(${f3(kk)})"><i></i>${g.text}</div>`;});
   if(p.source)h+=`<div class="v-cap" style="left:62px;top:${top+hh+26}px">${p.source}</div>`;
   return h+ava(p,t);};}
});

// ====== 15 vp-quote：一句引語（沒有摳像時用） ======
S('vp-quote',{real:p=>!!p.img,minDur:1.5,
 says:'一對大引號先落下，原話一行行擦出來，最後名牌從左邊滑進來',use:'引一句核過出處的原話，手裡只有頭像或者沒有照片',avoid:'有能摳的人像（用 vp-person 更好）；原話超過 3 行',
 need:['lines','name'],help:{lines:"['買得越多','<em>省得越多</em>']，1–3 行，<em> 是重點",name:'誰說的',tag:'身份',img:'頭像（可不寫）',at:'每行的時刻',brow:'小字',bg:'墊底的圖'},
 beats:p=>A(p.lines).length+1,
 draw(p,c){markAva(p);const ls=A(p.lines),n=ls.length,ts=ls.map((_,i)=>c.at(A(p.at)[i])??c.t0+.4+i*.6),fs=Math.min(...ls.map(l=>fitH(l,128,900))),y0=560-n*fs*.6,tn=ts[n-1]+.45;
  return t=>{const th=t-c.t0,kq=oe(th/.25);let h=base(p,c,t)+(p.brow?`<div class="v-brow" style="left:62px;top:150px;${wipe(oc(th/.3))}">${p.brow}</div>`:'')+`<div class="vp-qm" style="${KV(p.c??1)}left:56px;top:${f1(y0-250)}px;transform:scale(${f3(1+.9*(1-kq))});opacity:${f3(c01(th*6))}">“</div>`;
   ls.forEach((l,i)=>{const k=oc((t-ts[i])/.4);if(k>0)h+=`<div class="vp-ql" style="left:74px;top:${f1(y0+i*fs*1.3)}px;font-size:${fs}px;${wipe(k)}">${l}</div>`;});
   const kn=tail(t-tn,.1);if(kn>0)h+=`<div class="vp-plate" style="left:${f1(70-(1-kn)*700)}px;top:${f1(y0+n*fs*1.3+70)}px">${p.img?`<span><img src="${p.img}"></span>`:''}<div><b>${p.name}</b><u>${p.tag??''}</u></div></div>`;
   return h+ava(p,t);};}
});

// ====== 16 vp-timeline：時間線 ======
S('vp-timeline',{real:()=>false,minDur:2,
 says:'一條豎線往下長，走到哪個日子，圓點亮起、那天的事從右邊滑進來',use:'"9 月加了一次息，12 月可能再加"：幾個有日期的節點',avoid:'超過 4 個節點；沒有先後順序的事（改 vp-list）',
 need:['items'],help:{items:"[{date:'11月12日', text:'黃仁勳辭職', sub, hl:true, at}]，2–4 個",flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',bg:'墊底的圖'},
 beats:p=>A(p.items).length,
 draw(p,c){markAva(p);const its=A(p.items),n=its.length,ts=tsOf(c,its),top=TOP(p)+50,sp=Math.min(260,(1210-top)/n);
  return t=>{const th=t-c.t0;let h='';const reach=its.reduce((a,_,i)=>Math.max(a,(i+oc((t-ts[i]+.3)/.4))*sp),0);
   h+=`<div class="vp-tl" style="left:128px;top:${top}px;height:${f1(Math.min(reach,(n-1)*sp+60))}px"></div>`;
   its.forEach((it,i)=>{const k=tail(t-ts[i]+.05,.1);if(k<=0)return;const y=top+i*sp;
    h+=`<i class="vp-dot${it.hl?' hl':''}" style="${KV(it.c??i)}left:106px;top:${f1(y+26)}px;transform:scale(${f3(oe((t-ts[i]+.05)/.2))})"></i><div class="vp-tli${it.hl?' hl':''}" style="${KV(it.c??i)}left:${f1(190+(1-k)*900)}px;top:${f1(y)}px;height:${f1(sp-40)}px;transform:${Z(it.hl?56:0)}"><u>${it.date}</u><b style="font-size:${fitH(it.text,70,750)}px">${it.text}</b>${it.sub?`<s>${it.sub}</s>`:''}</div>`;});
   return base(p,c,t)+hd(p,th)+T3(th,h,p)+ava(p,t);};}
});

// ====== 17 vp-share：佔比（一個圓環） ======
S('vp-share',{real:()=>false,minDur:1.5,
 says:'一個粗圓環畫到那個百分比停住，中間的數跟著數上去',use:'"市場押 75% 會加息""四家佔了全行業六成"',avoid:'要比三樣以上的佔比（改 vp-bars / vp-rank）',
 need:['value'],help:{value:"'75%'",label:'圓環中間數字下面的字',note:'圓環下面一行說明',at:'開始畫的時刻',flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',bg:'墊底的圖'},
 beats:()=>1,
 draw(p,c){markAva(p);const ta=c.at(p.at)??c.t0+.35,v=Math.min(100,numOf(p.value)),r=290,C=2*Math.PI*r,cy=TOP(p)+60+r+50;
  return t=>{const th=t-c.t0,k=oc((t-ta)/1.1),kk=tail(th,.12);
   let h=`<svg class="vp-ring" style="${KV(p.c??2)}left:${540-r-50}px;top:${f1(cy-r-50+(1-kk)*80)}px;opacity:${f3(c01(th*7))}" width="${2*r+100}" height="${2*r+100}" viewBox="0 0 ${2*r+100} ${2*r+100}"><circle cx="${r+50}" cy="${r+72}" r="${r}" fill="none" stroke="rgba(4,5,24,.55)" stroke-width="78"/><circle cx="${r+50}" cy="${r+50}" r="${r}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="78"/><circle class="th" cx="${r+50}" cy="${r+72}" r="${r}" fill="none" stroke-width="78" stroke-linecap="round" stroke-dasharray="${f1(C*v/100*k)} ${f1(C)}" transform="rotate(-90 ${r+50} ${r+72})"/><circle cx="${r+50}" cy="${r+50}" r="${r}" fill="none" stroke="currentColor" stroke-width="78" stroke-linecap="round" stroke-dasharray="${f1(C*v/100*k)} ${f1(C)}" transform="rotate(-90 ${r+50} ${r+50})"/></svg><div class="vp-ringn" style="top:${f1(cy-160)}px;transform:${Z(70)}">${cnt(p.value,k)}</div>${p.label?`<div class="vp-ringl" style="top:${f1(cy+96)}px;font-size:${fitU(p.label,50,440)}px">${p.label}</div>`:''}`;
   if(p.note){const kn=oc((t-ta-.9)/.4);if(kn>0)h+=`<div class="vp-ringl" style="top:${f1(cy+r+90)}px;font-size:48px;${wipe(kn)}">${p.note}</div>`;}
   return base(p,c,t)+hd(p,th)+T3(th,h,p,{rx:16,ry:-14})+ava(p,t);};}
});

// ====== 18 vp-rank：排行 ======
S('vp-rank',{real:()=>false,minDur:1.5,
 says:'幾行橫條一行行出來，條的長短就是大小，數字跟在條尾；最要緊的那行是強調色',use:'"虧損榜第一""四家裡誰花得最多"：有名次的比較',avoid:'超過 5 行',
 need:['items'],help:{items:"[{name:'微軟', value:'800億', hl:true, at}]，3–5 行，照名次排好",flat:'true = 不要斜檯面，平著放',title:'標題',brow:'小字',bg:'墊底的圖'},
 beats:p=>A(p.items).length,
 draw(p,c){markAva(p);const its=A(p.items),n=its.length,ts=tsOf(c,its,.35,.5),top=TOP(p)+40,rh=Math.min(214,(1220-top)/n-22),mx=Math.max(...its.map(i=>numOf(i.value)),1e-9);
  return t=>{const th=t-c.t0;let h='';
   its.forEach((it,i)=>{const k=tail(t-ts[i]+.05,.1);if(k<=0)return;const g=oc((t-ts[i])/.8),bw=Math.max(30,620*numOf(it.value)/mx)*g;
    h+=`<div class="vp-rk${it.hl?' hl':''}" style="${KV(it.c??i)}left:${f1(60-(1-k)*900)}px;top:${f1(top+i*(rh+22))}px;height:${f1(rh)}px;transform:${Z(it.hl?56:0)}"><span>${i+1}</span><b style="font-size:${fitH(it.name,66,250)}px">${it.name}</b><i style="width:${f1(bw)}px"></i><em>${cnt(it.value,g)}</em></div>`;});
   return base(p,c,t)+hd(p,th)+T3(th,h,p)+ava(p,t);};}
});

// ====== 19 vp-chapter：分段的小標題 ======
S('vp-chapter',{real:()=>false,minDur:.8,
 says:'一個大序號、一條線、一個標題：告訴觀眾換話題了',use:'兩分鐘以上的影片分段；"第一個原因""再看另一邊"',avoid:'30 秒的短片（不用分段）；一支片超過 3 次',
 need:['title'],help:{no:"序號 '01'（可不寫）",title:'這一段叫什麼（6 個字以內）',en:'英文小字',bg:'墊底的圖'},
 beats:()=>1,
 draw(p,c){const fs=fitH(p.title,210,900);
  return t=>{const th=t-c.t0,k=tail(th,.11),kl=oc(th/.45);
   return base(p,c,t)+(p.no?`<div class="vp-word vp-it vp-chno" style="left:${f1(64-(1-k)*500)}px;top:400px;width:auto">${pword(p.no,'c1',null,false)}</div>`:'')+`<div class="vp-chl" style="${KV(1)}left:64px;top:${p.no?700:560}px;width:${f1(952*kl)}px"></div><div class="vp-word vp-it" style="left:${f1(60+(1-k)*1100)}px;top:${p.no?740:600}px;width:auto;font-size:${fs}px;text-align:left;transform:rotate(-4deg);transform-origin:0 60%">${pword(p.title,'accent',null,false)}</div>${p.en?`<div class="v-en" style="left:70px;top:${(p.no?740:600)+fs*1.2+30}px;font-size:32px;${wipe(oc((th-.35)/.4))}">${p.en}</div>`:''}`;};}
});

// ====== 20 vp-ask：把問題拋給觀眾 ======
S('vp-ask',{real:()=>true,minDur:1.2,
 says:'一個巨大的問號先轉進來壓在後面，問題一兩行砸在前面',use:'開頭拋問題；講到一半反問一句"那錢從哪來？"',avoid:'後面不回答的問題；連著兩鏡用',
 need:['lines'],help:{lines:"['黃金為什麼','反而跌']，1–2 行，不用寫問號",at:'每行的時刻',zoom:'景別',bg:'沒有口播時墊的圖',props:PH},
 beats:p=>A(p.lines).length,
 draw(p,c){markHost(p);const zf=zoomS(p,c),ls=A(p.lines),n=ls.length,ts=ls.map((_,i)=>c.at(A(p.at)[i])??c.t0+.35+i*.6),fss=ls.map((l,i)=>fitH(l,i===n-1?240:176,900)),host=useHost(p),ys=[];let y=host?1270:1010;for(let i=n-1;i>=0;i--){y-=fss[i]*1.14;ys[i]=y;}
  return t=>{const th=t-c.t0,kq=tail(th-.05,.12);const qm=`<div class="vp-askq" style="left:${host?560:400}px;top:${host?120:160}px;transform:rotate(${f1(14+46*(1-kq))}deg) scale(${f3(.6+.4*kq)});opacity:${f3(c01(th*6)*(host?.9:.8))}">？</div>`;
   let h=stage(p,c,zf,t,host&&HOST.cut?qm:' ')+(host&&HOST.cut?'':qm)+props(p,c,t,'back');
   ls.forEach((l,i)=>{const k=(t-ts[i])/.16;if(k>0)h+=line(pword(l,i===n-1?'accent':'white'),ys[i],fss[i],i%2?10:-30,`opacity:${f3(c01(k*3))};transform:perspective(1200px) rotateY(-13deg) rotateX(5deg) rotate(-3deg) scale(${f3(1+1.2*(1-oe(k)))})`);});
   return h+props(p,c,t,'front');};}
});

// ---------- 全片自檢（--check 時 vert.js 會來調）：都是提醒，不攔 ----------
const STAGE=new Set(['vp-words','vp-reject','vp-voices','vp-number','vp-ask']);
const zEnds=p=>{const z=p.zoom;if(z==null)return [1,1];if(typeof z==='number')return [z,z];const a=A(z).map(x=>x.s??1);return [a[0]??1,a[a.length-1]??1];};
function checkFilm(shots,warn){
 const cnt={};shots.forEach((s,i)=>{if(!s.scene.startsWith('vp-'))return;(cnt[s.scene]??=[]).push(i+1);
  if(i&&shots[i-1].scene===s.scene)warn(`第 ${i} 鏡和第 ${i+1} 鏡連著用了 ${s.scene}：進場一樣，看著像套模板；換一個元件，或者中間插一鏡別的`);});
 for(const k in cnt)if(cnt[k].length>2)warn(`${k} 用了 ${cnt[k].length} 次（第 ${cnt[k].join('、')} 鏡）：一支片裡每個元件最多一兩次，多了觀眾會看出是同一個動作`);
 shots.forEach((s,i)=>{const p=s.p,tag=`第 ${i+1} 鏡（${s.scene}）`;if(!s.scene.startsWith('vp-'))return;
  if(STAGE.has(s.scene)&&!useHost(p)&&!bgOf(p))warn(`${tag}沒有口播，也沒寫 bg：這一鏡的底是空的。寫一張圖，或者在 KIT_VPRO.theme({bg:'…'}) 裡給全片一張預設的底`);
  if(s.scene==='vp-verdict'&&!bgOf(p))warn(`${tag}沒寫 bg：最重的一鏡墊一張和結論有關的圖（公司、現場）更壓得住`);
  const kinds=new Set(A(p.props).map(o=>o.kind));if(kinds.size>1)warn(`${tag}掛了 ${kinds.size} 種道具（${[...kinds].join('、')}）：一鏡只演一樣東西`);
  A(p.props).forEach(o=>{if(o.kind!=='bills'&&!/\.(png|webp)(\?|$)/i.test(o.img??''))warn(`${tag}的道具 ${o.img} 不是透明 PNG：先用 scripts/cut_img.py 摳出來，不然會帶著一塊底`);});
  if(i&&STAGE.has(s.scene)&&STAGE.has(shots[i-1].scene)&&useHost(p)&&useHost(shots[i-1].p)){const a=zEnds(shots[i-1].p)[1],b=zEnds(p)[0];if(Math.abs(a-b)<.1)warn(`第 ${i} 鏡和第 ${i+1} 鏡都是她，景別 ${a} 接 ${b} 差得太少，切過去像沒切：差 0.15 以上，或者中間插一鏡證據`);}
 });
 const n=shots.filter(s=>s.scene.startsWith('vp-')).length,pr=shots.filter(s=>A(s.p.props).length).length;
 if(n>=5&&!pr)warn('全片沒有一樣會動的道具（props）：只有字和卡，會顯得少點東西。挑一兩個口播裡的詞演出來（一件真東西的摳圖就行）');
}
window.KIT_VPRO={theme,TH,PROP,pword,tail,oc,oe,checkFilm};
})();
