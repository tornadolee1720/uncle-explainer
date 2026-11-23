// host.js —— 真人口播層：主持人是這支片的"地面"，觀眾每離開她一會兒就回到她身邊（學自小Lin說，refs/2026-11-02_YouTube_小Lin說口播/分析.md）。
// 載入順序：… kit.js → scenes.js → host.js → film.js。口播就是配音：時間線由 scripts/host_timeline.py 從口播裡逐字對齊，影片的 t = 口播的 t。
// 素材：assets/clips/host/0001.jpg…（按口播原片幀率抽，和 timeline.json 的 fps 一致）+ assets/cut/host/0001.png…（matte.py + matte_clean.py 逐幀摳像，同尺寸）。
//
// 她在畫面裡的七種樣子（從重到輕），在鏡頭表裡這樣寫：
//   1 房間全屏          {scene:'host'}                                 她在自己房間裡講；zoom 寫景別跳
//   2 東西進她的房間    {scene:'host', items:[…]}                      照片、價籤、卡片掛在她身後的牆上（她的頭髮、肩膀壓在它們前面）
//   3 身後換世界        {scene:'host', swap:{at, words:['利','率']}}    說到關鍵詞那一刻，房間換成舞臺，巨字夾在她和底之間
//   4 和圖形並排        任何場景加 host:'window'                        圖形縮排左邊的板子，她在右邊豎窗裡（從房間縮排去）
//   5 角上圓窗          任何場景加 host:'pip'                           全屏實拍/圖形時她縮成左下角一個圓，跨過底下幾刀不動
//   6 完全沒有她        不寫 host                                      最多 3–4 秒就回來，或者先變成圓窗
//   回到房間            {scene:'host', enter:'grow'}（從圓窗/豎窗長回全屏）或 enter:'drop'（上一鏡的圖形往下掉，露出一直在後面的她）
(()=>{
const {C,IO,lerp,L}=S25,{f1,f3,E,col,mixc,alpha,stage,brow:browK,appear,label}=KIT;
const A=v=>v==null?[]:Array.isArray(v)?v:[v];
const HOST={name:'host',fps:30,frames:0,box:null,calm:false};   // calm:true（選項，預設關）：視窗定住——不漂、不跟頭、換樣子一律硬切。"視窗一直動來動去"的毛病不在這些特效，在換得太勤：先按 references/presenter.md"節奏照小Lin說"重排（2026-11-05，《打仗黃金反而跌》v4）
// 影片的 t → 第幾幀（口播從 0 秒開始，和時間線同一個鍾）
const fi=t=>Math.max(1,Math.min(HOST.frames,Math.round(t*HOST.fps)+1));   // 四捨五入：幀目錄和影片幀率不同時（30fps 目錄、24fps 影片）也正好取到原片每一幀，不會一幀用兩次
const roomSrc=t=>`assets/clips/${HOST.name}/${String(fi(t)).padStart(4,'0')}.jpg`;
const cutSrc=t=>`assets/cut/${HOST.name}/${String(fi(t)).padStart(4,'0')}.png`;
// 頭肩中心（matte_clean.py 寫的 cx，按幀）：圓窗、豎窗跟著她
const headX=t=>HOST.box?.cx?.[fi(t)-1]??960;
// 圓窗、豎窗裡落在中心的點：calm 時用全片她頭的中位數，視窗裡的房間不跟著她晃
const winX=t=>HOST.calm&&HOST.cx0!=null?HOST.cx0:headX(t);
const FACE={y:330};   // 她臉的中心在原片裡大概的高度（1080 座標）：host.face 可以改

// ---------- 房間：原片按機位 {x,y,s} 放大（x,y = 原片裡落在畫面中心的點）。東西掛在牆上、她的摳像壓在最上面，三者用同一個機位，不會錯位 ----------
function roomHTML(t,cam,o={}){
 const s=cam.s,tx=960-cam.x*s,ty=540-cam.y*s;
 const tr=`transform-origin:0 0;transform:translate(${f1(tx)}px,${f1(ty)}px) scale(${f3(s)})`;
 const back=o.back??`<img src="${roomSrc(t)}" style="position:absolute;left:0;top:0;width:1920px;height:1080px">`;
 const mid=o.mid??'';
 const cut=(o.cut??!!mid)?`<img src="${cutSrc(t)}" style="position:absolute;left:0;top:0;width:1920px;height:1080px">`:'';
 return `<div class="k-full" style="overflow:hidden"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;${tr}">${back}${mid}${cut}</div></div>`;
}
// 景別：口播原片只有一個機位，在剪輯裡裁出幾檔；換檔是硬切（跳一下），不推不拉。檔位之間慢漂（每秒 0.4%），人一直在動，畫面不會死
// zoom:[{at, s, x}]：s 放大倍數（1 = 原片），x 往左/右讓位（-1..1，正數 = 人往左挪、右邊空出來）
function zoomCam(zs,t0){
 const keys=[{t:-1e9,s:1,x:0},...zs].sort((a,b)=>a.t-b.t);
 return t=>{let k=keys[0];for(const z of keys)if(t>=z.t)k=z;const s=(k.s??1)*(1+(HOST.calm?0:.004)*Math.max(0,t-Math.max(t0,k.t)));
  const room=(1-1/s)*960,x=960+C(Math.abs(k.x??0))*room*Math.sign(k.x??0),y=540-(1-1/s)*540*(k.y??.35);
  return {x,y,s};};
}

// ---------- 掛在牆上的東西（在她身後）：照片 / 實拍畫框、價籤小卡 ----------
// {at, img|clip|html, label, value, x, y, w, h, rot, out}：座標是原片 1920×1080 裡的位置（牆上那塊空地），鏡頭跳景別時跟著房間走
function wallItem(it,t,o={}){
 const k=C((t-it.t)/.28),e=E(k),ko=it.tout!=null?C((t-it.tout)/.25):0;if(k<=0||ko>=1)return '';
 const w=it.w??470,h=it.h??(it.value&&!it.img&&!it.clip?230:320),rot=it.rot??(it.side==='r'?1.6:-1.6);
 const op=e*(1-ko),dy=(1-e)*18+ko*10,gray=it.grayAt!=null&&t>=it.grayAt?C((t-it.grayAt)/.3):0;
 const media=it.html??(it.img||it.clip?`<img src="${it.clip?KIT_HOST.clipSrc(it.clip,t,it.t,it.from):it.img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover${it.pos?`;object-position:${it.pos}`:''}">`:'');
 const val=it.value?`<div class="h-val">${it.vlabel?`<small>${it.vlabel}</small>`:''}${KIT.unitHTML(KIT.num(it.value))}</div>`:'';
 // 房間是暖光：牆上的東西壓一點暖、一點暗，邊上投一塊軟影，像真掛在那面牆上
 return `<div class="h-wall${it.img||it.clip||it.html?' pic':' tag'}" style="left:${f1(it.x-w/2)}px;top:${f1(it.y-h/2)}px;width:${w}px;height:${h}px;transform:translateY(${f1(dy)}px) rotate(${rot}deg);opacity:${f3(op)};filter:sepia(.12) brightness(${f3(.9-gray*.35)}) saturate(${f3(1-gray*.85)})${it.color?`;--c:${col(it.color)}`:''}">${media}${val}${it.label?`<div class="h-lab">${it.label}</div>`:''}${it.no&&t>=it.no?`<div class="h-no" style="opacity:${f3(C((t-it.no)/.18))}"></div>`:''}</div>`;
}

// ---------- 圓窗 / 豎窗的位置 ----------
const PIP={cx:215,cy:792,d:292};                     // 左下角（字幕在中間那一行，左邊讓給她）
const WIN={x:1372,y:150,w:476,h:684,r:16};             // 右邊豎窗
const PANEL={x:72,y:150,w:1216,h:684,r:16};            // 左邊圖形板（16:9 的畫面縮排來）
// 一個"窗"：box={x,y,w,h,r}，裡面是房間原片；c 是原片裡落在窗中心的點，s 是原片放大倍數
function winHTML(t,box,o={}){
 const s=o.s,cx=o.c[0],cy=o.c[1],l=box.w/2-cx*s,tp=box.h/2-cy*s;
 return `<div class="h-win${o.ring===false?'':' ring'}" style="left:${f1(box.x)}px;top:${f1(box.y)}px;width:${f1(box.w)}px;height:${f1(box.h)}px;border-radius:${f1(box.r)}px;${o.style??''}"><img src="${roomSrc(t)}" style="position:absolute;left:${f1(l)}px;top:${f1(tp)}px;width:${f1(1920*s)}px;height:${f1(1080*s)}px"></div>`;
}
// 一整幀畫面（上一鏡/這一鏡的樣子：牆上的東西、換了的世界）按同樣的對映放進框裡：縮排去、長出來時框裡就是真正的樣子，不會到頭再跳
function lookIn(box,v,html,o={}){
 const l=box.w/2-v.c[0]*v.s,tp=box.h/2-v.c[1]*v.s;
 return `<div class="h-win${o.ring?' ring':''}" style="left:${f1(box.x)}px;top:${f1(box.y)}px;width:${f1(box.w)}px;height:${f1(box.h)}px;border-radius:${f1(box.r)}px"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;transform:translate(${f1(l)}px,${f1(tp)}px) scale(${f3(v.s)})">${html}</div></div>`;
}
const pipView=t=>{const d=PIP.d,s=d/760;return {box:{x:PIP.cx-d/2,y:PIP.cy-d/2,w:d,h:d,r:d/2},c:[winX(t),FACE.y+60],s};};
const winView=t=>{const s=WIN.h/1080*1.12;return {box:{...WIN},c:[winX(t)+10,FACE.y+215],s};};
const fullView=()=>({box:{x:0,y:0,w:1920,h:1080,r:0},c:[960,540],s:1});
// 兩個"窗"之間插值（她從全屏縮排圓窗、從豎窗長回全屏）：框、圓角、原片放大倍數、落在中心的點一起走
function morph(a,b,e){
 const bx={x:lerp(a.box.x,b.box.x,e),y:lerp(a.box.y,b.box.y,e),w:lerp(a.box.w,b.box.w,e),h:lerp(a.box.h,b.box.h,e),r:lerp(a.box.r,b.box.r,e)};
 return {box:bx,c:[lerp(a.c[0],b.c[0],e),lerp(a.c[1],b.c[1],e)],s:Math.exp(lerp(Math.log(a.s),Math.log(b.s),e))};
}

// ---------- 繫結到 K ----------
async function use(K,o={}){
 HOST.name=o.name??'host';
 HOST.fps=o.fps??window.timeline?.fps??30;   // 口播幀按原片幀率抽，影片也按這個幀率渲染（host_timeline.py 寫進 timeline.json）
 const F=K.F;
 HOST.frames=F.CL[HOST.name]??0;if(!HOST.frames)throw Error(`口播幀沒有登記：assets/clips/counts.json 裡要有 "${HOST.name}": 幀數（footage.py extract 或 ffmpeg 按原片幀率抽）`);
 try{HOST.box=await fetch(`assets/cut/${HOST.name}/box.json`).then(r=>r.json());}catch{HOST.box=null;}
 if(!HOST.box)console.warn('[host] 沒有摳像（assets/cut/host/box.json）：掛牆上的東西、身後換世界都要摳像，先跑 matte.py + matte_clean.py');
 if(o.faceY)FACE.y=o.faceY;
 if(o.calm!=null)HOST.calm=!!o.calm;
 {const cx=(HOST.box?.cx??[]).filter(v=>v!=null).sort((a,b)=>a-b);HOST.cx0=cx.length?cx[cx.length>>1]:null;}
 window.KIT_HOST.clipSrc=F.clipSrc;
 // 每一鏡加 host:'pip' / 'window'：把那一鏡的畫面包一層
 const film0=K.film;
 K.film=async list=>{
  const out=await film0(list);
  for(let i=0;i<out.length;i++){
   const s=out[i],form=s.p.host;if(!form)continue;
   if(!['pip','window'].includes(form))throw Error(`第 ${i+1} 鏡：host 只能寫 'pip' 或 'window'（全屏口播用 scene:'host'）`);
   const prev=out[i-1],pf=s.p.pipIn==='fade'?null:prev?.p.host??(prev?.scene==='host'?'room':null);
   const base=s.f,t0=s.t0;
   const f=form==='pip'?pipWrap(base,t0,pf,prev):winWrap(base,t0,pf,prev?.f);
   s.f=f;const sh=F.shots.find(x=>x.t0===s.t0);if(sh)sh.f=f;
  }
  // 提醒：完全沒有她的時間
  let run=0,last=0;for(const s of out){const has=s.scene==='host'||s.p.host;if(has){run=0;}else{run+=s.t1-s.t0;if(run>4.5)K.warns.push(`${s.t1.toFixed(1)} 秒前有 ${run.toFixed(1)} 秒完全沒有她：參考片沒有她的一段只有 2.5–4.5 秒，加 host:'pip' 或回到房間`);}last=s.t1;}
  // 提醒：她的樣子換得太勤（小Lin說是一大段她講、一大段證據，她的樣子只在段落門上換；《打仗黃金反而跌》v2 換 7 次、最短 1.3 秒，看的人說"視窗一直動來動去"）
  const segs=[];for(const s of out){const f=s.scene==='host'?'room':s.p.host??'none',g=segs[segs.length-1];if(g&&g.f===f)g.t1=s.t1;else segs.push({f,t0:s.t0,t1:s.t1});}
  const NM={room:'在房間',pip:'在圓窗',window:'在豎窗',none:'不在'};
  segs.forEach((g,i)=>{if(i>0&&i<segs.length-1&&g.t1-g.t0<3)K.warns.push(`${g.t0.toFixed(1)}–${g.t1.toFixed(1)} 秒她${NM[g.f]}只停了 ${(g.t1-g.t0).toFixed(1)} 秒就換：並進前後的段裡（一段證據底下換幾刀都用同一個窗；夾在兩段證據中間的一句答案，做成整屏大字、她留在窗裡說）`);});
  if(last>0&&(segs.length-1)/last*30>5)K.warns.push(`她 ${last.toFixed(0)} 秒裡換了 ${segs.length-1} 次樣子（每 30 秒 ${((segs.length-1)/last*30).toFixed(1)} 次）：小Lin說是一大段她講、一大段證據，換隻在段落門上，30 秒 4–5 次以內`);
  return out;
 };
 // 圓窗：底下是這一鏡自己的畫面。上一鏡是房間：她從全屏縮排圓裡（0.5 秒）；上一鏡已經有圓窗：圓不動（跨刀的那根線）；其他：淡入
 function pipWrap(base,t0,pf,prev){
  const prevF=prev?.f,s0fade=!prev;
  return t=>{
   const u=t-t0;let h=base(t);
   if(HOST.calm){const v=pipView(t),k=pf===null&&s0fade?C(u/.3):1;return h+`<div class="k-full" style="z-index:70;opacity:${f3(k)}">${winHTML(t,v.box,{s:v.s,c:v.c})}</div>`;}
   if(pf==='room'&&u<.5){const e=IO(u/.5),v=morph(fullView(),pipView(t),e),k=C(u/.32);
    return h+`<div class="k-full" style="z-index:70">${winHTML(t,v.box,{s:v.s,c:v.c,ring:e>.15})}</div>`+(k<1?`<div class="k-full" style="z-index:71;opacity:${f3(1-k)}">${lookIn(v.box,v,MV.still(prevF,t))}</div>`:'');}
   if(pf==='window'&&u<.45){const e=IO(u/.45),v=morph(winView(t),pipView(t),e);return h+`<div class="k-full" style="z-index:70">${winHTML(t,v.box,{s:v.s,c:v.c})}</div>`;}
   const v=pipView(t),k=pf==='pip'?1:C(u/.3);
   return h+`<div class="k-full" style="z-index:70;opacity:${f3(k)}">${winHTML(t,v.box,{s:v.s,c:v.c})}</div>`;
  };
 }
 // 豎窗：這一鏡的畫面縮排左邊的板子（像一塊螢幕），她在右邊豎窗裡。上一鏡是房間：她從全屏縮排豎窗，板子從左邊滑進來
 function winWrap(base,t0,pf,prevF){
  const P=PANEL,sc=P.w/1920;
  return t=>{
   const u=t-t0;if(HOST.calm){const v=winView(t);return `<div class="k-full">${stage({tone:'navy'})}</div><div class="k-full" style="background:radial-gradient(ellipse at 50% 50%,transparent 40%,#0008)"></div><div class="h-panel" style="left:${f1(P.x)}px;top:${f1(P.y)}px;width:${P.w}px;height:${P.h}px;border-radius:${P.r}px"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;transform:scale(${f3(sc)})">${base(t)}</div></div><div class="k-full" style="z-index:70">${winHTML(t,v.box,{s:v.s,c:v.c})}</div>`;}
   const pk=pf==='window'?1:E(C((u-.12)/.42)),v=pf==='room'&&u<.5?morph(fullView(),winView(t),IO(u/.5)):pf==='pip'&&u<.45?morph(pipView(t),winView(t),IO(u/.45)):winView(t);
   const k=C(u/.32),from=pf==='room'&&k<1&&prevF?`<div class="k-full" style="z-index:71;opacity:${f3(1-k)}">${lookIn(v.box,v,MV.still(prevF,t))}</div>`:'';
   const panel=`<div class="h-panel" style="left:${f1(P.x)}px;top:${f1(P.y)}px;width:${P.w}px;height:${P.h}px;border-radius:${P.r}px;opacity:${f3(pk)};transform:translateX(${f1((1-pk)*-90)}px)"><div style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;transform:scale(${f3(sc)})">${base(t)}</div></div>`;
   return `<div class="k-full">${stage({tone:'navy'})}</div><div class="k-full" style="background:radial-gradient(ellipse at 50% 50%,transparent 40%,#0008)"></div>${panel}<div class="k-full" style="z-index:70">${winHTML(t,v.box,{s:v.s,c:v.c})}</div>${from}`;
  };
 }
 return K;
}

// ---------- 場景：host（她在房間裡：全屏 / 東西掛牆上 / 身後換世界） ----------
KIT.scene('host',{
 says:'她自己在講：開場、每一段的問題和答案、態度、轉折',
 use:'她在講道理、表態、提問的時候；東西掛到她身後的牆上（items）= 她拿出來給你看；最重要的那個詞用 swap 身後換世界（一支片一兩次）',
 avoid:'一段數字、關係、證據要細看（用圖形場景 + host:\'window\' 或 \'pip\'）',
 help:{zoom:"[{at:'@b03:可', s:1.18, x:.3}]：景別跳（硬切）。s 放大倍數（原片 = 1，最多 1.35），x 人往左(+)/右(-)讓位 0..1。參考片 6–8 秒跳一檔，跳在句子轉折處",
  items:"[{at:'@b02:亂世', img:'assets/img/war.jpg', label:'亂世', x:330, y:260, w:420, h:280}]：掛在她身後牆上的照片（img / clip 實拍 / html）或價籤（value、vlabel）。x,y 是原片裡牆上空地的中心；out 什麼時候摘下；gray 變灰；no 打叉；fill:{clip:'smoke'} 這一鏡最後 0.5 秒鏡頭衝進這張照片、照片推滿屏變成實拍（下一鏡寫同一段實拍的 footage，from:0.5，pipIn:'fade'）",
  swap:"{at:'@b05:利率', words:['利','率'], color:'gold', brow:'問題出在', en:'INTEREST RATES'}：那一刻房間換成舞臺，巨字夾在她和底之間；同一鏡裡她不動，景別不變",
  enter:"'grow'：從上一鏡的圓窗 / 豎窗長回全屏；'drop'：上一鏡的畫面往下掉，露出一直在後面的她；不寫 = 硬切"},
 minDur:1,
 beats:p=>A(p.items).length+A(p.zoom).length+(p.swap?1:0),
 make(p,c){
  const T=c.at,zoomK=zoomCam(A(p.zoom).map(z=>({...z,t:T(z.at)??c.t0})),c.t0);
  const items=A(p.items).map((it,i)=>({...it,t:T(it.at)??c.t0+.3+i*.6,tout:it.out!=null?T(it.out):null,grayAt:it.gray!=null?T(it.gray):null,no:it.no!=null?T(it.no):null,side:it.side??(it.x<960?'l':'r'),
   fillD:it.fill?.d??.5,fillT:it.fill?c.t1-(it.fill.d??.5):null}));
  const sw=p.swap?{...p.swap,t:T(p.swap.at)??c.t0}:null;
  if(sw&&!HOST.box)c.warn('swap 要她的摳像（assets/cut/host/），沒有就只換不了背景');
  const color=col(sw?.color??'gold');
  return t=>{
   let cam=zoomK(t);
   const mid=items.map(it=>wallItem(it,t)).join('');
   let back;
   if(sw&&t>=sw.t){
    // 身後換世界：舞臺（暖色的光對著她的主光）+ 巨字（0.3 秒從 1.12 倍長到 1，夾在人和底之間）
    const g=E((t-sw.t)/.3),ws=A(sw.words),size=sw.size??560,hx=headX(t),gap=sw.gap??310,top=sw.top??190;
    const gm=[mixc('#ffffff',color,.12),mixc('#ffffff',color,.42)];
    let mg='';if(ws.length===1)mg=S25.mega(ws[0],{x:hx,y:top,size,anchor:'c',m:gm,s:lerp(1.12,1,g),o:g});
    else mg=S25.mega(ws[0],{x:hx-gap,y:top,size,anchor:'r',m:gm,s:lerp(1.12,1,g),o:g})+S25.mega(ws[1],{x:hx+gap,y:top,size,anchor:'l',m:gm,s:lerp(1.12,1,g),o:g});
    const bw=sw.brow?`<div class="s25brow" style="left:${f1(hx-gap-K2.megaW(ws[0]??'',size)+16)}px;top:${f1(top+size*.62)}px;opacity:${f3(g)}"><b>${sw.brow}</b>${sw.en?`<i>${sw.en}</i>`:''}</div>`:'';
    back=`<div style="position:absolute;left:-480px;top:-270px;width:2880px;height:1620px">${stage({tone:'navy',glow:sw.glow??'#c9a25a',gx:'50%',gy:'38%',go:.3})}</div>${mg}${bw}`;
    // 換的那一幀推一下（參考片：換背景時機位沒動，只是字從小長大；這裡加 2% 的推，讓"換"這一下有重量）
    if(!HOST.calm)cam={...cam,s:cam.s*(1+.02*E((t-sw.t)/.5))};
    return roomHTML(t,cam,{back,mid:' ',cut:true})+`<div class="k-full" style="z-index:12;background:radial-gradient(ellipse 60% 70% at 50% 45%,transparent 50%,#000a)"></div>`;
   }
   const fl=items.find(it=>it.fillT!=null&&t>=it.fillT);
   if(fl){
    // 鏡頭往那張照片衝過去（房間跟著推、虛掉），照片從牆上的位置長到滿屏，邊框退掉、擺正，裡面換成實拍
    const u=C((t-fl.fillT)/fl.fillD),e=IO(u),w=fl.w??470,h=fl.h??320;
    const camF={x:lerp(cam.x,fl.x,e*.6),y:lerp(cam.y,fl.y,e*.6),s:cam.s*(1+.5*e)};
    const sx=(fl.x-camF.x)*camF.s+960,sy=(fl.y-camF.y)*camF.s+540,sw2=w*camF.s,sh2=h*camF.s;
    const bx=lerp(sx-sw2/2,0,e),by=lerp(sy-sh2/2,0,e),bw=lerp(sw2,1920,e),bh=lerp(sh2,1080,e),rot=lerp(fl.rot??(fl.side==='r'?1.6:-1.6),0,e);
    const src=fl.fill.clip?KIT_HOST.clipSrc(fl.fill.clip,t,fl.fillT):fl.img;
    const vel=(IO(C((t+1/30-fl.fillT)/fl.fillD))-e)*1920;
    return `<div class="k-full" style="filter:blur(${f1(e*10)}px) brightness(${f3(1-e*.5)})">${roomHTML(t,camF,{mid:items.filter(x=>x!==fl).map(it=>wallItem(it,t)).join('')})}</div>`+
     `<div class="h-wall pic" style="z-index:60;left:${f1(bx)}px;top:${f1(by)}px;width:${f1(bw)}px;height:${f1(bh)}px;transform:rotate(${f3(rot)}deg);border-width:${f1(7*(1-e))}px;border-radius:${f1(6*(1-e))}px;filter:sepia(${f3(.12*(1-e))}) brightness(${f3(lerp(.9,1,e))})${vel>40?` blur(${f1(Math.min(6,vel/60))}px)`:''}"><img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>`;
   }
   return roomHTML(t,cam,{mid});
  };
 }
});
const K2=KIT;

// enter:'grow' / 'drop'：在 K.film 裡接上一鏡（kit.js 的 wrapEnter 不認識這兩個，這裡先把它們換成 cut，再自己包）
const film1=KIT.use;
KIT.use=async F=>{
 const K=await film1(F);
 const film0=K.film;
 K.film=async list=>{
  const ent=list.map(sp=>sp&&['grow','drop'].includes(sp.enter)?sp.enter:null);
  const out=await film0(list.map((sp,i)=>ent[i]?{...sp,enter:'cut'}:sp));
  out.forEach((s,i)=>{if(!ent[i])return;s.enter=ent[i];const prev=out[i-1];if(!prev)return;
   if(s.scene!=='host')throw Error(`第 ${i+1} 鏡：enter:'${ent[i]}' 只給 scene:'host'（回到她的房間）用`);
   const base=s.f,t0=s.t0,pf=prev.p.host,pfun=prev.f;
   s.f=ent[i]==='grow'?t=>{const u=t-t0;if(u>=.5||!pf||HOST.calm)return base(t);
     const e=IO(u/.5),from=pf==='window'?winView(t):pipView(t),v=morph(from,fullView(),e);
     return `<div class="k-full">${MV.still(pfun,t0-.01)}</div><div class="k-full" style="z-index:70">${lookIn(v.box,v,base(t),{ring:e<.85})}</div>`;}
    :t=>{const u=t-t0;if(u>=.42)return base(t);
     // 上一鏡整張往下掉（帶豎向運動模糊），她的房間一直在後面。裡面那層裁到畫面大小：舞臺、原文頁都比畫面大，不裁就從上面露出來
     const e=C(u/.42)**2.2,dy=e*1150,v=(C((u+1/30)/.42)**2.2-e)*1150;
     return base(t)+`<div class="k-full" style="z-index:80;transform:translateY(${f1(dy)}px);filter:${S25.mbF(0,v,14)}drop-shadow(0 -20px 40px #0009)"><div class="k-full" style="overflow:hidden">${MV.still(pfun,t0-.01)}</div></div>`;};
   const sh=F.shots.find(x=>x.t0===s.t0);if(sh)sh.f=s.f;});
  return out;
 };
 return K;
};

const css=`.h-wall{position:absolute;box-shadow:14px 22px 40px rgba(0,0,0,.55),0 2px 6px rgba(0,0,0,.4);transform-origin:50% 0}
.h-wall.pic{border:7px solid #efe8da;border-radius:6px;background:#111;overflow:hidden}
.h-wall.tag{border-radius:12px;background:linear-gradient(180deg,#fbf6ea,#e9e0cc);border:1.5px solid #fff8}
.h-wall .h-lab{position:absolute;left:0;right:0;bottom:-2px;padding:10px 0 8px;text-align:center;font:44px Shu,'Noto Sans TC',sans-serif;letter-spacing:6px;color:#fff;background:linear-gradient(180deg,transparent,rgba(0,0,0,.72));text-shadow:0 2px 8px #000}
.h-wall.tag .h-lab{position:absolute;top:18px;bottom:auto;background:none;color:#5b4a2c;text-shadow:none;font-size:36px}
.h-wall .h-val{position:absolute;left:0;right:0;bottom:26px;text-align:center;font:96px Num,'Bebas Neue',sans-serif;color:var(--c,#2b2418);line-height:1}
.h-wall .h-val .c{font-size:.5em;vertical-align:.55em;margin-right:4px}.h-wall .h-val .u{font:.36em Shu,sans-serif;margin-left:4px}
.h-wall .h-val small{display:block;font:28px Shu,sans-serif;letter-spacing:4px;color:#7a6a4c;margin-bottom:6px}
.h-wall .h-no{position:absolute;inset:0;background:linear-gradient(45deg,transparent 47%,#d6333d 47%,#d6333d 53%,transparent 53%),linear-gradient(-45deg,transparent 47%,#d6333d 47%,#d6333d 53%,transparent 53%);background-size:46% 46%;background-position:50% 50%;background-repeat:no-repeat;filter:drop-shadow(0 2px 4px #0008)}
.h-win{position:absolute;overflow:hidden;background:#111;box-shadow:0 24px 60px rgba(0,0,0,.75)}
.h-win.ring{box-shadow:0 0 0 4px #f4f1ea,0 24px 60px rgba(0,0,0,.75)}
.h-panel{position:absolute;overflow:hidden;background:#0b1019;box-shadow:0 0 0 1.5px rgba(255,255,255,.16),0 30px 80px rgba(0,0,0,.8)}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
window.KIT_HOST={use,lookIn,HOST,roomSrc,cutSrc,headX,roomHTML,winHTML,morph,pipView,winView,fullView,PIP,WIN,PANEL,FACE,wallItem};
})();
