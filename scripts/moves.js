// moves.js —— 手法庫：一個手法 = 一個動作怎麼動（時長、方向、前後層、模糊）。不是鏡頭，不是模板。
// 畫面裡的人、字、顏色、位置全部由這支片自己傳進來，這裡不給預設畫面。
// 什麼時候用、什麼時候不適配：references/motion.md 的手法清單。意思對得上才用；對不上，或者要大改引數才塞得進去，就在 film.js 裡手寫。
// 載入順序：stage25d.js → film_base.js → moves.js → film.js。用法：const M=MV;
// 每次呼叫都要寫 why：這一下在說什麼（"換一個人來說：黃仁勳 → Altman"）。render.mjs --moves 會列出全片用了哪些手法、有沒有連著用、和上一支片像不像。
//
// 三類返回值：
//   轉場（pushSwap / pushThrough / blurToBase / frameFill）：返回整幀 HTML，from 是上一鏡（函式，畫它最後一刻），to 是這一鏡（函式）。
//   包一層（layFlat / standUp / whipIn / popWindow / montage）：把你給的畫面按這一刻的動作包起來，返回 HTML。
//   給數值（bgSwap / megaFlip / cardFocus / roll）：只返回位置、透明度、虛化這些數，畫面你自己畫。
(()=>{
const {C,IO,lerp,mbF}=S25;
const E=x=>1-(1-C(x))**3;
const full='position:absolute;inset:0';
const f3=v=>v.toFixed(3),f1=v=>v.toFixed(1),f4=v=>v.toFixed(4);

// ---------- 用量登記（render.mjs --moves 讀） ----------
const LOG=[],seen=new Set(),nowhy=new Set();let quiet=0;
function use(name,o){
 if(quiet)return;
 const s=window.FB?.cur??{shot:-1,t:0},key=s.shot+'|'+name;
 if(seen.has(key))return;seen.add(key);
 LOG.push({shot:s.shot,t:+s.t.toFixed(2),move:name,why:o.why??''});
 if(!o.why&&!nowhy.has(name)){nowhy.add(name);console.warn(`[moves] ${name} 沒寫 why：這一下在說什麼？說不出來就別用這個手法`);}
}
// 畫別的鏡頭的某一刻（上一鏡的末態、凍住的背景）：裡面用到的手法不算這一鏡的用量
function still(fn,t){quiet++;try{return fn(t);}finally{quiet--;}}

// ---------- 轉場：返回整幀 ----------

// 橫推換人：整組（底 + 字 + 人）橫推出畫，新的一組從另一邊推進來，兩組帶方向模糊。說的是"換一個人、換一件事"。
// o: t0 開始, d 時長(.42), dir -1 往左推 / 1 往右推, from(t) 上一組（畫 t0 前一刻）, to(t,{moving}) 新一組
function pushSwap(t,o){
 const d=o.d??.42,dir=o.dir??-1;
 if(t>=o.t0+d)return o.to(t,{moving:false});
 use('pushSwap',o);
 const W=(window.STAGE?.w??1920)*dir,k=IO((t-o.t0)/d),kp=IO((t-1/30-o.t0)/d),dx=W*k,mbv=mbF(dx-W*kp,0),fl=mbv?`filter:${mbv}`:'';
 return `<div style="${full};transform:translateX(${f1(dx)}px);${fl}">${still(o.from,o.t0-.01)}</div>`+
  `<div style="${full};transform:translateX(${f1(dx-W)}px);${fl}">${o.to(t,{moving:true})}</div>`;
}

// 推過鏡頭：上一鏡最後一幀放大、虛掉、淡出，蓋在新一鏡上。說的是"衝進下一個世界"，用在換舞臺、又沒有東西能帶過去的時候。
// o: t0, d(.3), from(t), to(t), s 放大到(1.6), blur(14), at [x,y] 放大中心（對準要衝進去的那個東西）, zi(80)
function pushThrough(t,o){
 const d=o.d??.3,z=C((t-o.t0)/d);let h=o.to(t);
 if(z>=1)return h;
 use('pushThrough',o);
 const org=o.at?`transform-origin:${o.at[0]}px ${o.at[1]}px;`:'';
 return h+`<div style="${full};${org}transform:scale(${f3(lerp(1,o.s??1.6,E(z)))});filter:blur(${f1(z*(o.blur??14))}px);opacity:${1-z};z-index:${o.zi??80}">${still(o.from,o.t0-.01)}</div>`;
}

// 上一鏡虛化當底：上一鏡最後一幀在 d 秒裡虛掉、壓暗，退成新一鏡出現的那一刻。用在兩個世界之間、又沒有物件可帶的時候。
// o: t0, d(.45), from(t), to(t), blur(26), br 壓暗到(.4), zi(80)
function blurToBase(t,o){
 const d=o.d??.45,z=C((t-o.t0)/d);let h=o.to(t);
 if(z>=1)return h;
 use('blurToBase',o);
 return h+`<div style="${full};z-index:${o.zi??80};opacity:${f3(1-z)};filter:blur(${f1(z*(o.blur??26))}px) brightness(${f3(lerp(1,o.br??.4,z))})">${still(o.from,o.t0-.01)}</div>`;
}

// 畫框推滿屏：畫框裡的那份東西推到滿屏，接著就是下一鏡。推近的是同一份東西，不換成一張相似的圖。
// o: t0 開始推, t1 推滿（下一鏡的畫面從這裡接手）, from(t) 畫框所在的上一鏡, box [cx,cy,w] 畫框起始位置（16:9）,
//    frame(t,[cx,cy,w],{bw,r,blur}) 畫這個畫框, to(t) 推滿以後的畫面, settle 推滿後從多大收到 1(1.08), sd 收的時長(.35), bw(6) r(12) 畫框起始邊寬和圓角, blur 中途最虛(5)
function frameFill(t,o){
 if(t>=o.t1){const x=E((t-o.t1)/(o.sd??.35)),s=lerp(o.settle??1.08,1,x);
  return x>=1?o.to(t):`<div style="${full};transform:scale(${f4(s)})">${o.to(t)}</div>`;}
 use('frameFill',o);
 const k=IO((t-o.t0)/(o.t1-o.t0)),[cx,cy,w]=o.box;
 return `<div style="${full};opacity:${f3(1-k)}">${still(o.from,o.t0-.01)}</div>`+
  o.frame(t,[lerp(cx,960,k),lerp(cy,540,k),lerp(w,1940,k)],{bw:lerp(o.bw??6,0,k),r:lerp(o.r??12,0,k),blur:Math.sin(k*Math.PI)*(o.blur??5)});
}

// ---------- 包一層：返回 HTML ----------

// 證據小卡、反應窗：從相關的地方（箭頭、圓盤、畫框）撐開成一個視窗，背景壓暗；看完縮回原處，背景沒有離場。
// 不要切成全屏打斷上一鏡的那張圖。
// o: t0 撐開, t1 開始縮回, d(.35) 撐開時長, dout(.3) 縮回時長, from [x,y,w,h] 起點（圓盤就寫外接方框，配 r0=半徑）,
//    to [x,y,w,h] 視窗, html 視窗裡的東西, r0/r1 起止圓角(12/12), border(6px #f4f1ea, 寫 'none' 不要邊),
//    dim 背景壓到多暗(.5), under(t) 給了就把背景凍成這一幀再壓暗虛化（blur 畫素），不給就只疊一層黑, fade 視窗淡入的快慢(3)
function popWindow(t,o){
 const a=E((t-o.t0)/(o.d??.35)),z=E((t-o.t1)/(o.dout??.3)),k=a*(1-z);
 let h='';
 if(o.under)h+=`<div style="${full};filter:brightness(${f3(lerp(1,o.dim??.5,k))}) blur(${f1(k*(o.blur??0))}px)">${still(o.under,o.t0-.01)}</div>`;
 if(k<=.01)return h;
 use('popWindow',o);
 const [x0,y0,w0,h0]=o.from,[x1,y1,w1,h1]=o.to;
 if(!o.under)h+=`<div style="${full};background:#000;opacity:${f3((1-(o.dim??.5))*k)};z-index:70"></div>`;
 const bd=o.border==='none'?'':`border:${o.border??'6px solid #f4f1ea'};`;
 return h+`<div style="position:absolute;left:${f1(lerp(x0,x1,k))}px;top:${f1(lerp(y0,y1,k))}px;width:${f1(lerp(w0,w1,k))}px;height:${f1(lerp(h0,h1,k))}px;${bd}border-radius:${f1(lerp(o.r0??12,o.r1??12,k))}px;overflow:hidden;box-shadow:0 30px 80px #000c;opacity:${C(k*(o.fade??3))};z-index:75">${o.html}</div>`;
}

// 平面倒成桌面：前面的東西講完了、還要留作背景時，整層轉到透視平面上、下沉、壓暗；新主角接著從下面立起來（standUp）。
// o: t0, d(.7), html 要倒下去的那一層（一般是上一鏡凍住的畫面）, rx 倒到多少度(62), drop 下沉(330), s [起,止] 放大(1.06→1.25), br 壓暗到(.28), persp(1500), origin 透視中心('50% 20%')
function layFlat(t,o){
 const k=IO((t-o.t0)/(o.d??.7));
 if(k>0)use('layFlat',o);
 const [s0,s1]=o.s??[1.06,1.25];
 return `<div style="position:absolute;inset:0;perspective:${o.persp??1500}px;perspective-origin:${o.origin??'50% 20%'}"><div style="${full};transform:translateY(${f1(k*(o.drop??330))}px) rotateX(${(k*(o.rx??62)).toFixed(2)}deg) scale(${f4(lerp(s0,s1,k))});transform-origin:50% 100%;filter:brightness(${f3(lerp(1,o.br??.28,k))})">${o.html}</div></div>`+
  `<div style="${full};background:radial-gradient(ellipse at 50% 40%,#0000 30%,#000c 100%);opacity:${f3(k)}"></div>`;
}
// 立起來：新主角從下面立起來（跟在 layFlat 後面，或者從桌面上站起來）。
// o: t0, d(.5), rect [x,y,w,h], html, rise 從多低(520), tilt 起始後仰(24°), end 停下時的傾角(3°), persp(2200)
function standUp(t,o){
 const q=E((t-o.t0)/(o.d??.5)),[x,y,w,h]=o.rect;
 if(q>0)use('standUp',o);
 return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:translateY(${f1(lerp(o.rise??520,0,q))}px) perspective(${o.persp??2200}px) rotateX(${lerp(o.tilt??24,o.end??3,q).toFixed(2)}deg);transform-origin:50% 100%;opacity:${f3(C(q*2))}">${o.html}</div>`;
}

// 甩進來：畫框、卡片從畫外甩到位，帶方向模糊。說的是"又來了一樣東西"，兩樣東西要同時停在畫面上時用。
// o: t0, d(.32), dir -1 從左 / 1 從右（豎向用 axis:'y'）, dist 從多遠(1500), html。返回 {k,html}：k 是到位的進度，配套的線、標籤可以跟著它淡入
function whipIn(t,o){
 if(t<o.t0)return {k:0,html:''};
 use('whipIn',o);
 const d=o.d??.32,dist=(o.dist??1500)*(o.dir??1),m=E((t-o.t0)/d),mp=E((t-1/30-o.t0)/d);
 const v=lerp(dist,0,m),vp=lerp(dist,0,mp),y=o.axis==='y',mbv=y?mbF(0,v-vp):mbF(v-vp,0);
 return {k:m,html:`<div style="${full};transform:translate${y?'Y':'X'}(${f1(v)}px);${mbv?`filter:${mbv}`:''}">${o.html}</div>`};
}

// 釘住一個東西、底下換實拍：前景（片名、那個數、圓盤徽章）不動，底下的實拍壓暗去色，step 秒一換。說的是"這件事 = 這些畫面"。
// 前景必須有一個視線落點；沒有落點就不要這麼快地換實拍。
// o: t0, clips [實拍名…], step(.42), br/sat/bl 壓暗去色略虛, s0 起始放大(1.04), drift 每秒放大(.012)
function montage(t,o){
 use('montage',o);
 const k=t-o.t0,step=o.step??.42,cl=o.clips,i=Math.floor(Math.max(0,k)/step),n=cl[i%cl.length],u=k-i*step;
 const src=FB.fr(n,(Math.floor(i/cl.length)*9)%Math.max(1,FB.CL[n]-14)+1+u*30);
 return `<div style="${full};transform:scale(${f4((o.s0??1.04)+(o.drift??.012)*k)})">${S25.demote(src,o)}</div>`;
}

// ---------- 給數值：畫面自己畫 ----------

// 人身後換背景：說到關鍵詞那一刻，實拍原片換成同一個人的摳像壓在新底上（位置一模一樣，看不出接縫），再挪到構圖位置、放大。
// 說的是"話題換到另一個世界，人還是那個人"。摳像要從沒有切點的實拍裡逐幀摳（matte.py）。
// o: t0 換的那一刻, delay 換完停多久再挪(.05), d 挪過去的時長(.6), ax/ay 原片裡的對齊點(960/1080), to {x,y,sc} 構圖位置, from {x,y,sc} 原片在畫面裡的位置（預設全屏原位）
// 返回 S25.cutP 的引數 {x,y,ax,ay,sc,track}；在 t0 之前畫實拍，t0 之後畫新底 + cutP(名,幀,返回值)
function bgSwap(t,o){
 if(t>=o.t0)use('bgSwap',o);
 const pk=IO((t-o.t0-(o.delay??.05))/(o.d??.6)),ax=o.ax??960,ay=o.ay??1080,f=o.from??{x:ax,y:ay,sc:1};
 return {x:lerp(f.x,o.to.x,pk),y:lerp(f.y,o.to.y,pk),ax,ay,sc:lerp(f.sc??1,o.to.sc,pk),track:Math.max(1e-3,pk),pk};
}

// 巨字隨話翻：同一個人、同一個底，字換一句。舊字往下滑出，新字從上面落下。說的是"同一個人，換一個說法"。
// o: t0 開始翻, d(.24), dist 滑多遠(150)。返回 {out:{o,dy}, in:{o,dy}, k}：舊字用 out，新字用 in
function megaFlip(t,o){
 const k=E((t-o.t0)/(o.d??.24)),dist=o.dist??150;
 if(k>0)use('megaFlip',o);
 return {k,out:{o:1-k,dy:k*dist},in:{o:k,dy:(1-k)*-dist}};
}

// 卡片在人旁邊冒出來，焦點移過去：說到"他說的這樣東西"時，人旁邊冒一張小卡；身後的巨字同時虛掉、壓暗。大字和小卡同框，大小對比自己說話。
// 鏡頭往卡片那邊挪一點：在 camPath 里加一次移動，時刻對上 t0。
// o: t0 焦點開始移, d(.6) 移的時長, delay 卡片晚多少出來(.2), cd 卡片淡入(.3), rise 卡片上移(20), dim 巨字壓到(.5), blur 巨字虛到(7), pulse 卡片在這個時刻輕輕一跳（可選）
// 返回 {big:{o,b}, card:{o,dy,s}}：big.o 乘到巨字透明度上，card.dy 加到卡片的 top 上
function cardFocus(t,o){
 const foc=IO((t-o.t0)/(o.d??.6)),dl=o.delay??.2,q=t>=o.t0+dl?E((t-o.t0-dl)/(o.cd??.3)):0;
 if(foc>0)use('cardFocus',o);
 const pul=o.pulse!=null?1+.05*Math.sin(C((t-o.pulse)/.3)*Math.PI):1;
 return {big:{o:lerp(1,o.dim??.5,foc),b:foc*(o.blur??7)},card:{o:q,dy:lerp(o.rise??20,0,q),s:pul},foc};
}

// 累加滾數：只在"累加、越來越多"本身就是意思的時候用（幾家加起來、按年累計），一支片最多一兩次。
// 從第一筆開始，話說到那個數時正好停；顯示時寫滿位、按十億取整（S25.fmtB）。
// o: t0, t1 停在哪一刻（cue 那個數）, from 第一筆, to 總數, ease 曲線（預設先快後慢）, k 直接給進度（跟著曲線畫的時候）
function roll(t,o){
 const k=o.k??C((t-o.t0)/(o.t1-o.t0));
 if(k>0)use('roll',o);
 return lerp(o.from??0,o.to,(o.ease??E)(k));
}

window.MV={pushSwap,pushThrough,blurToBase,frameFill,popWindow,layFlat,standUp,whipIn,montage,bgSwap,megaFlip,cardFocus,roll,still,LOG};
})();
