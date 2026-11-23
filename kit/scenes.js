// scenes.js —— 場景模板庫。每個場景：說的是什麼、什麼時候用、什麼時候別用、要填什麼。
// 在鏡頭表裡寫 {scene:'名字', until:'@句id', says:'這一鏡讓觀眾多懂了什麼', ...引數}。引數和例子見 kit/README.md。
// 模板只管動作和版式；內容（字、數、圖、顏色）全由鏡頭表給。沒有合適的模板就用 scene:'custom' 手寫這一鏡。
(()=>{
const K=KIT,{C,IO,E,lerp,f1,f3,col,mixc,alpha,num,full,numText,fitPx,textW,FAM,track,appear,fit,unionBox,camSeq,stage,disc,card,tag,pill,mark,label,bignum,brow,frame,edges,person,halo}=K;
const {L}=S25;
const arr=v=>v==null?[]:Array.isArray(v)?v:[v];
const browOf=(b,en)=>b==null?null:typeof b==='string'?{zh:b,en}:b;
const clipOrImg=(o,t,t0)=>o.clip?FB.fr(o.clip,Math.floor(Math.max(0,t-t0+(o.from??0))*30*(o.rate??1))+1):o.img;
// 底下壓暗的實拍（montage / title / statement 用）：只給一段 → 連續放（"一段連續實拍壓暗退成底"）；幾段 → step 秒一換，
// 同一段輪到第二次時接著往後放，不從頭重放（不會像卡住）
function underlay(items,k,step,o){
 if(!items.length)return '';k=Math.max(0,k);
 const one=items.length===1,i=one?0:Math.floor(k/step),it=items[i%items.length],u=one?k:k-i*step,lap=one?0:Math.floor(i/items.length);
 let src=it.img;if(it.clip){const n=FB.CL?.[it.clip]??1e9,f0=one?0:(lap*step*30)%Math.max(1,n-step*30);src=FB.fr(it.clip,1+f0+Math.floor(((it.from??0)+u)*30*(it.rate??1)));}
 return S25.demote(src,o);
}
const glass=(x,y,lab,val,st,o={})=>`<div class="k-glass" style="left:${f1(x)}px;top:${f1(y)}px;${K.fx(st,'translate(0,0)')}"><b style="font-size:${o.ls??30}px">${lab}</b><div class="v" style="font-size:${o.vs??110}px">${K.unitHTML(num(val))}</div></div>`;

// =====================================================================================
// number：一個決定性的數
// =====================================================================================
K.scene('number',{
 says:'一個決定性的數（金額、估值、市值）放大成畫面主角，帶上單位和"這是什麼"',
 use:'這句話的落點就是一個數；"加起來/累計"時配 roll 滾上去；說到一個小得多的數可以用 sub 在旁邊冒一張小卡對比',
 avoid:'一句話裡要比兩三個數（用 bars 或 discs 的 scale:area）；數後面馬上要拆成誰給誰、錢怎麼流（用 network / board）。拆成兩三樣有畫面的東西（現金 / 算力）不算，接 frames，用 pin 釘住這個數',
 need:['value'],
 help:{value:"'$7250億'、'5.2萬億'、'-2780億'、'30%'",brow:"眉題：這個數是什麼，'四家 · 2026 AI 資本開支'",en:'眉題下面一行英文小字（可省）',
  full:'true = 寫滿位數 $725,000,000,000（滾數時預設滿位）',roll:"{from:'$1800億', at:'@b03:加起來', stop:'@b03:七千'}：從第一筆滾到這個數，話說到那個數時正好停",
  sub:"{label:'收入', value:'$360億', at:'@b06:收入'}：旁邊冒一張小卡，大數退一步", color:"'gold'（預設）/'red'（虧損）/'white'",tone:"底色：'navy'（預設）/'charcoal'/'wine'（算總賬、虧錢那一段，一支片最多一段）", glow:'顏色光：預設沒有（只有 person 預設有），寫公司名或顏色名才畫'},
 defaults:{tone:'navy'},minDur:1.2,flat:true,
 beats:p=>(p.roll?1:0)+(p.sub?1:0),
 check(p,c){if(p.roll&&!p.roll.from)c.warn('roll 要寫 from（從哪一筆開始滾）');if(K.vw(typeof p.brow==='string'?p.brow:p.brow?.zh)>14)c.warn('眉題太長（超過 14 個字寬），壓成一短句：誰 · 什麼');},
 make(p,c){
  const v0=num(p.value),showFull=p.full??!!p.roll,pv=showFull?full(v0):v0,fromN=p.roll?(showFull?full(num(p.roll.from)):num(p.roll.from)).n:0;
  const ta=c.at(p.at)??c.t0,rt0=p.roll?(c.at(p.roll.at)??ta):0,rt1=p.roll?(c.at(p.roll.stop)??rt0+1.6):0;
  const hasSub=!!p.sub,subAt=hasSub?(c.at(p.sub.at)??c.t0+c.d*.45):1e9;
  const size=fitPx(numText(pv),'num',p.size??(showFull?210:300),hasSub?1000:1560);
  const nx=hasSub?860:960,ny=500,bw=browOf(p.brow,p.en);
  const keys=[{t:c.t0,cam:{x:960,y:540,s:1}}];if(hasSub)keys.push({t:subAt,cam:{x:1050,y:560,s:1.035},d:.6});
  const cam=camSeq(keys,.022);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),flat=c.enter==='flat';
   const ap=flat?appear(t,c.t0+.35,.45,60):appear(t,ta,.25,0);
   const n=p.roll?lerp(fromN,pv.n,E((t-rt0)/Math.max(.2,rt1-rt0))):pv.n,hit=p.roll&&t>=rt1?Math.max(0,1-(t-rt1)/.35):0;
   const fk=hasSub?IO((t-subAt)/.6):0;
   let h=bignum({x:nx,y:ny,value:pv,n,size,rolling:!!p.roll,color:p.color,anchor:'c'},{o:ap.o,dy:ap.dy,br:lerp(1,.55,fk)+hit*.22,blur:fk*4,sc:1+hit*.012});
   const hb=bw?brow({x:nx,y:ny-size*.42-86,zh:bw.zh,en:bw.en},{o:ap.o*lerp(1,.55,fk),dy:ap.dy}):'';
   if(hasSub){const q=appear(t,subAt+.2,.3,20);if(q.o>0)h+=glass(nx+Math.min(560,textW(numText(pv),`${size}px ${FAM.num}`)/2)+70,ny-40,p.sub.label??'',p.sub.value,{o:q.o,dy:q.dy});}
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+(hb?L(cc,cp,.9,hb):'')+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// board：同一個世界裡換機位。東西擺在世界裡，唸到誰鏡頭去找誰；狀態在原地變（變灰、打勾、巢狀、連線亮起）
// 預設：discs（公司圓盤一排）、flow（流程卡片）、network（關係網/資金迴圈）、timeline（時間線）
// =====================================================================================
const NODE={disc:{r:120},card:{w:300,h:150},num:{size:150},pill:{size:40},img:{w:520,h:292},label:{size:40},person:{h:560},event:{w:420,h:170},pin:{}};
function boardMake(p,c){
 const t0=c.t0,nodes=(p.nodes??p.items??[]).map((n,i)=>({...NODE[n.type??p.type??'disc'],type:p.type??'disc',...n,id:n.id??`n${i}`,i}));
 if(!nodes.length)throw Error(`${c.tag}：nodes 是空的`);
 const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
 // 比真實大小：圓盤面積按數值（versus 對比時用）
 if(p.scale==='area'){const vs=nodes.map(n=>num(n.size??n.tag?.value??n.value)?.n??1),mx=Math.max(...vs),R=p.maxR??190;nodes.forEach((n,i)=>{if(n.type==='disc')n.r=Math.max(16,R*Math.sqrt(vs[i]/mx));});}
 // ---- 擺位 ----
 nodes.forEach(n=>{if(n.lon!=null&&n.lat!=null){const [x,y]=K.lonlat(n.lon,n.lat);n.x??=x;n.y??=y;}});
 const lay=p.layout??(nodes.every(n=>n.x!=null)?'free':nodes.some(n=>n.pos)?'grid':'row');
 const sz=n=>n.type==='disc'?[2*n.r,2*n.r+(n.tag?n.r*.4+40:0)]:n.type==='card'||n.type==='event'||n.type==='img'?[n.w,n.h]:n.type==='num'?[textW(numText(num(n.value)),`${n.size}px ${FAM.num}`),n.size]:[220,90];
 const CY=p.cy??470;
 if(lay==='row'){const ws=nodes.map(n=>sz(n)[0]),g=p.gap??(nodes[0].type==='disc'?Math.max(110,nodes[0].r*.85):110),tot=ws.reduce((a,b)=>a+b,0)+g*(nodes.length-1);let x=960-tot/2;
  nodes.forEach((n,i)=>{n.x=n.x??x+ws[i]/2;n.y=n.y??CY-(n.type==='disc'&&n.tag?n.r*.2:0);x+=ws[i]+g;});}
 else if(lay==='ring'||lay==='hub'){const ring=lay==='hub'?nodes.slice(1):nodes,m=Math.max(...ring.map(n=>sz(n)[0])),R=p.radius??Math.max(lay==='hub'?360:300,ring.length*(m+130)/(2*Math.PI));
  if(lay==='hub'){nodes[0].x??=960;nodes[0].y??=CY;}
  ring.forEach((n,i)=>{const a=(p.start??-90)*Math.PI/180+i*2*Math.PI/ring.length;n.x??=960+R*Math.cos(a)*(p.sx??1.25);n.y??=CY+R*Math.sin(a)*(p.sy??.8);});}
 else if(lay==='grid'){const cs=nodes.map(n=>(n.pos??[0,0])[0]),rs=nodes.map(n=>(n.pos??[0,0])[1]),mw=Math.max(...nodes.map(n=>sz(n)[0])),mh=Math.max(...nodes.map(n=>sz(n)[1]));
  const gx=p.gx??mw+150,gy=p.gy??mh+130,cm=(Math.min(...cs)+Math.max(...cs))/2,rm=(Math.min(...rs)+Math.max(...rs))/2;
  nodes.forEach(n=>{const [cc,rr]=n.pos??[0,0];n.x??=960+(cc-cm)*gx;n.y??=CY+(rr-rm)*gy;});}
 else if(lay==='line'){const g=p.gap??540;nodes.forEach((n,i)=>{n.x??=960+(i-(Math.min(nodes.length,3)-1)/2)*g;n.y??=p.cy??540;});}
 const box=n=>{const [w,h]=sz(n);if(n.type==='area')return [n.x-(n.r??120),n.y-(n.r??120),n.x+(n.r??120),n.y+(n.r??120)];if(n.type==='pin')return [n.x-24,n.y-40,n.x+40+K.vw(n.label)*(n.size??38),n.y+40];if(n.type==='disc')return [n.x-n.r,n.y-n.r,n.x+n.r,n.y+n.r+(n.tag?n.r*.36+50:0)];
  if(n.type==='event')return [n.x-n.w/2,n.y-n.h-190,n.x+n.w/2,n.y+120];
  if(n.type==='img')return [n.x-n.w/2,n.y-n.h/2-(n.label?80:0),n.x+n.w/2,n.y+n.h/2];
  return [n.x-w/2,n.y-h/2,n.x+w/2,n.y+h/2];};
 // ---- 連線 ----
 const links=(p.links??[]).map((l,i)=>({...l,id:l.id??`${l.from}>${l.to}`,i}));
 for(const l of links){if(!byId[l.from]||!byId[l.to])throw Error(`${c.tag}：連線 ${l.id} 的兩頭要是 nodes 裡的 id（${Object.keys(byId).join(' ')}）`);}
 const lById=Object.fromEntries(links.map(l=>[l.id,l]));
 const ends=l=>{const a=byId[l.from],b=byId[l.to],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
  const cut=n=>n.type==='disc'?n.r+16:n.type==='card'||n.type==='img'||n.type==='event'?Math.min(Math.abs((n.w/2+14)/(ux||1e-6)),Math.abs((n.h/2+14)/(uy||1e-6))):60;
  return {a:[a.x+ux*cut(a),a.y+uy*cut(a)],b:[b.x-ux*cut(b),b.y-uy*cut(b)]};};
 // ---- 步驟：節點自己寫 at = 唸到它的時候（atDo：'focus' 鏡頭找它 / 'light' 只是亮起、鏡頭不動 / 'show' 只是出現）----
 const atDo=p.atDo??'focus';
 const steps=[...arr(p.steps),...nodes.filter(n=>n.at!=null).map(n=>({at:n.at,[atDo]:n.id,_auto:1}))].map(s=>({...s,t:s.at==null?t0:c.at(s.at)})).sort((a,b)=>a.t-b.t);
 for(const s of steps)for(const k of ['show','focus','light','gray','color','hide'])for(const id of arr(s[k]))if(id!=='all'&&!byId[id]&&!lById[id])throw Error(`${c.tag}：steps 裡 ${k}:'${id}' 不是 nodes/links 裡的 id`);
 const born={};const seen=id=>born[id]!=null;
 for(const s of steps)for(const id of [...arr(s.show),...arr(s.focus),...arr(s.light)])if(byId[id]&&!seen(id))born[id]=s.t;
 const pre=p.pre??'hide';
 nodes.forEach(n=>{if(born[n.id]==null||born[n.id]<=t0+.05)born[n.id]=t0;});
 if(pre==='hide'&&!p.under&&nodes.every(n=>born[n.id]>t0+.05))c.warn(`第一幀是空的（所有東西都等唸到才出現）：加 pre:'gray' 先灰著佔位，或者讓第一樣東西一開場就在`);
 const vis={},dim={},gray={},nest={},marks={},tags={},rolls={};
 nodes.forEach(n=>{const b=born[n.id];vis[n.id]=track(b<=t0||pre==='gray'?1:0);if(b>t0&&pre!=='gray')vis[n.id].set(b,1,.25);dim[n.id]=track(0);gray[n.id]=track(n.gray?1:(b>t0&&pre==='gray'?1:0));if(b>t0&&pre==='gray')gray[n.id].set(b,0,.35);
  tags[n.id]=n.tag?[[t0,n.tag]]:[];});
 const lk={},lfl={};links.forEach(l=>{lk[l.id]=null;lfl[l.id]=track(0);});
 const loops=[],pops=[];
 // 鏡頭：每一步算一個落點
 const visAt=(t,id)=>pre==='gray'||born[id]<=t+1e-6;
 const keyBox=(ids,t)=>{const bs=[];for(const id of ids){if(byId[id])bs.push(box(byId[id]));else if(lById[id]){const l=lById[id];bs.push(box(byId[l.from]),box(byId[l.to]));}}return bs.length?unionBox(bs):null;};
 const allVis=t=>nodes.filter(n=>visAt(t,n.id)).map(n=>n.id);
 const fitO={pad:p.pad??70,max:p.maxZoom??1.7,min:.38};
 const first=steps.find(s=>s.t<=t0+.15&&s.focus!=null);
 let curCam=fit(keyBox(first&&first.focus!=='all'?arr(first.focus):(allVis(t0).length?allVis(t0):nodes.map(n=>n.id)),t0),fitO);
 if(p.cam0)curCam={...curCam,...p.cam0};
 const intro=p.intro??(['cut','flat','blur','through'].includes(c.enter)?(first&&first.focus!=='all'?'push':'pull'):'none');   // 先看一個 = 往裡推，先看整體 = 往外拉
 const keys=[{t:t0,cam:intro==='push'?{x:curCam.x,y:curCam.y+12/curCam.s,s:curCam.s*.93}:intro==='pull'?{...curCam,s:curCam.s*1.08}:curCam}];
 if(intro!=='none')keys.push({t:t0,cam:curCam,d:.8});
 const sameCam=(a,b)=>Math.abs(a.x-b.x)<14/a.s&&Math.abs(a.y-b.y)<14/a.s&&Math.abs(Math.log(a.s/b.s))<.05;
 let focusSet=null;
 for(const s of steps){
  const t=s.t;
  for(const id of arr(s.hide)){if(byId[id])vis[id].set(t,0,.25);}
  for(const id of arr(s.gray))if(byId[id])gray[id].set(t,1,.35);
  for(const id of arr(s.color))if(byId[id])gray[id].set(t,0,.35);
  for(const id of arr(s.link))if(lById[id]&&lk[id]==null)lk[id]=t;
  for(const id of arr(s.flow))if(lById[id]){if(lk[id]==null)lk[id]=t;lfl[id].set(t,1,.3);}
  if(s.loop){const ids=arr(s.loop).filter(id=>lById[id]);ids.forEach(id=>{if(lk[id]==null)lk[id]=t-.5;});loops.push({t,ids,d:s.dur??Math.max(1.2,ids.length*.55)});}
  if(s.nest){const [a,b]=s.nest;if(!byId[a]||!byId[b])throw Error(`${c.tag}：nest 要寫 [裡面的id, 外面的id]`);nest[a]={out:b,t,d:.7};}
  if(s.mark)for(const id in s.mark)if(byId[id])marks[id]={kind:s.mark[id],t};
  if(s.tag)for(const id in s.tag)if(byId[id])tags[id].push([t,typeof s.tag[id]==='object'?s.tag[id]:{...(tags[id].at(-1)?.[1]??{}),value:s.tag[id]}]);
  if(s.pop){const q=s.pop;pops.push({...q,t,back:c.at(q.back)??Math.min(c.t1-.3,t+2.2)});}
  if(s.roll){const r=s.roll;if(!byId[r.id])throw Error(`${c.tag}：roll 要寫 id（滾哪一個數）`);rolls[r.id]={t,t1:c.at(r.until)??t+1.6,from:r.from};}
  // 焦點：focus 的亮著、鏡頭去找；light 的亮著、鏡頭不動；其餘壓暗
  let tgt=null;
  const setOf=ids=>new Set(ids.flatMap(id=>lById[id]?[lById[id].from,lById[id].to]:[id]));
  if(s.focus!=null){const ids=s.focus==='all'?allVis(t):arr(s.focus);focusSet=s.focus==='all'?null:setOf(ids);
   for(const n of nodes)if(visAt(t,n.id)||(focusSet&&focusSet.has(n.id)))dim[n.id].set(t,s.dim===false||!focusSet||focusSet.has(n.id)?0:1,.35);
   tgt=keyBox(ids,t);}
  else if(s.light!=null){const ids=s.light==='all'?allVis(t):arr(s.light);focusSet=s.light==='all'?null:setOf(ids);
   for(const n of nodes)if(visAt(t,n.id)||focusSet?.has(n.id))dim[n.id].set(t,!focusSet||focusSet.has(n.id)?0:1,.3);}
  else if(s.show!=null){for(const id of arr(s.show))if(byId[id]&&focusSet&&!focusSet.has(id))dim[id].set(t,0,.3);tgt=keyBox(allVis(t),t);}
  if(s.cam)curCam={...curCam,...s.cam},keys.push({t,cam:curCam,d:s.d});
  else if(tgt&&!(s._auto&&s.t<=t0+.15)){const nc=fit(tgt,{...fitO,...(s.fit??{})});if(!sameCam(nc,curCam)){keys.push({t,cam:nc,d:s.d});curCam=nc;}}
 }
 links.forEach(l=>{if(lk[l.id]==null)lk[l.id]=Math.max(born[l.from],born[l.to]);});
 const cam=camSeq(keys,p.drift??.022);
 const axis=p.axis;   // 時間線的軸
 const T0=c.t0;
 return t=>{
  const cc=cam(t),cp=cam(t-1/30);
  // 連線
  const es=links.map(l=>{const st=lk[l.id],k=st<=T0+.01?1:E((t-st)/.5),fl=lfl[l.id].at(t),w=(l.w??(p.lineW??7))*(1+fl*.35),pe=ends(l);
   let pulse=null;for(const lp of loops){const j=lp.ids.indexOf(l.id);if(j<0)continue;const u=(t-lp.t)/lp.d*lp.ids.length-j;if(u>0&&u<1)pulse=u;}
   const dimL=Math.max(dim[l.from].at(t),dim[l.to].at(t))*(1-fl);
   return {...pe,curve:l.curve??p.curve??0,color:l.color??p.lineColor??'gold',style:l.style??p.lineStyle??'dots',w,k,flow:(t-T0)*(26+fl*40),arrow:l.arrow??p.arrows??true,o:Math.min(vis[l.from].at(t),vis[l.to].at(t))*lerp(1,.35,dimL),pulse,text:l.text};});
  let h='';
  if(axis!==false&&lay==='line'){const xs=nodes.map(n=>n.x),y=nodes[0].y;h+=`<div style="position:absolute;left:${f1(Math.min(...xs)-700)}px;top:${f1(y-2)}px;width:${f1(Math.max(...xs)-Math.min(...xs)+1400)}px;height:4px;background:linear-gradient(90deg,transparent,rgba(236,208,138,.75) 12%,rgba(236,208,138,.75) 88%,transparent);box-shadow:0 0 14px rgba(236,208,138,.5)"></div>`;}
  if(p.under){const u=p.under;h+=`<img src="${u.img}" style="position:absolute;left:${f1(u.x??0)}px;top:${f1(u.y??0)}px;width:${f1(u.w??1920)}px;height:${f1(u.h??1080)}px;object-fit:cover;filter:brightness(${u.br??.6}) saturate(${u.sat??.8});opacity:${u.o??1}">`;}
  h+=edges(es);
  const blurOf=n=>{if(p.dof===false||cc.s<1.15)return 0;const d=Math.hypot(n.x-cc.x,n.y-cc.y)*cc.s;return Math.min(1.8,Math.max(0,d-820)/260);};
  const order=[...nodes].sort((a,b)=>(nest[a.id]?1:0)-(nest[b.id]?1:0)||(a.type==='area'?-1:0)-(b.type==='area'?-1:0));
  for(const n of order){
   const o=vis[n.id].at(t);if(o<=.003)continue;
   const dm=dim[n.id].at(t),g=gray[n.id].at(t),ap=born[n.id]>T0?appear(t,born[n.id],.25,14):{dy:0};
   let x=n.x,y=n.y,sc=1;
   if(nest[n.id]){const ns=nest[n.id],ob=byId[ns.out],k=IO((t-ns.t)/ns.d);x=lerp(n.x,ob.x,k);y=lerp(n.y,ob.y+ob.r*.38,k);sc=lerp(1,(ob.r*.46)/n.r,k);}
   for(const id in nest)if(nest[id].out===n.id)sc*=lerp(1,1.06,IO((t-nest[id].t)/nest[id].d));
   const st={o,dy:ap.dy,br:lerp(1,.42,dm),sat:lerp(1,.5,dm),blur:blurOf(n)+dm*.5,sc};
   const draw=(gr,oo)=>{const s2={...st,o:oo},q={...n,x,y,gray:gr};
    if(n.type==='disc'){let hh=disc(q,s2);const tg=tags[n.id];if(tg.length&&!gr){for(let j=0;j<tg.length;j++){const [tt,tv]=tg[j],nx=tg[j+1]?.[0]??1e9,a=tt<=T0+.01?1:C((t-tt)/.25),b=1-C((t-nx)/.25);if(a*b>0)hh+=tag({x,y:y+n.r*sc+16,label:tv.label,value:tv.value,size:Math.max(30,Math.min(52,n.r*.36))*Math.min(1,sc*1.15)},{...s2,o:oo*a*b,dy:ap.dy});}}return hh;}
    if(n.type==='card')return card(q,s2);
    if(n.type==='num'){const r=rolls[n.id],pv=num(n.value),val=r?lerp(num(r.from).n,pv.n,E((t-r.t)/Math.max(.2,r.t1-r.t))):pv.n;return bignum({x,y,value:pv,n:val,size:n.size,rolling:!!r,color:n.color},s2)+(n.brow?brow({x,y:y-n.size*.5-96,zh:n.brow,en:n.en},{o:oo,dy:ap.dy}):'');}
    if(n.type==='pill')return pill(q,s2);
    if(n.type==='img')return frame({x,y,w:n.w,h:n.h,src:n.src??n.img,label:n.label},s2);
    if(n.type==='label')return label({x,y,text:n.text,en:n.en,size:n.size},s2);
    if(n.type==='area'){const ac=K.col(n.color??'gold'),r=n.r??120;return `<div style="position:absolute;left:${f1(x-r)}px;top:${f1(y-r)}px;width:${f1(2*r)}px;height:${f1(2*r)}px;border-radius:50%;background:radial-gradient(circle,${alpha(ac,.55)} 0%,${alpha(ac,.22)} 45%,${alpha(ac,0)} 70%);mix-blend-mode:screen;${K.fx(s2,'translate(0,0)')}"></div>`+(n.label?label({x,y:y+r*.15,text:n.label,en:n.en,size:n.size??40},s2):'');}
    if(n.type==='pin'){const pc=K.col(n.color??'gold');return `<div style="position:absolute;left:${f1(x-13)}px;top:${f1(y-13)}px;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#fff 0 30%,${pc} 45%,${alpha(pc,0)} 72%);box-shadow:0 0 22px ${pc};${K.fx(s2,'translate(0,0)')}"></div>`+(n.label?`<div class="k-label" style="left:${f1(x+30)}px;top:${f1(y)}px;font-size:${n.size??38}px;${K.fx(s2,'translate(0,-50%)')}">${n.label}${n.en?`<i style="text-align:left">${n.en}</i>`:''}</div>`:'');}
    if(n.type==='person')return person({src:n.src,x,top:y,h:n.h},s2);
    if(n.type==='event'){const yr=`<div class="k-year" style="left:${f1(x)}px;top:${f1(y+26)}px;font-size:${n.ysize??104}px;${K.fx(s2,'translate(-50%,0)')}">${n.year??''}</div>`;
     const dot=`<div style="position:absolute;left:${f1(x-11)}px;top:${f1(y-11)}px;width:22px;height:22px;border-radius:50%;background:#f3e3b0;box-shadow:0 0 18px #f3d37a;opacity:${f3(oo)}"></div>`;
     return dot+yr+(n.title?card({...q,y:y-n.h/2-56,color:n.color??p.color??'steel'},s2):'');}
    return '';};
   if(g>.003&&g<.997)h+=draw(false,o*(1-g))+draw(true,o*g);else h+=draw(g>=.997,o);
   const mk=marks[n.id];if(mk&&t>=mk.t){const q=appear(t,mk.t,.22,0),ms=n.type==='disc'?Math.max(44,n.r*.42)*sc:52;const [mx,my]=n.type==='disc'?[x+n.r*.74*sc,y-n.r*.74*sc]:[x+(n.w??200)/2-8,y-(n.h??100)/2+8];
    h+=mark({x:mx,y:my,kind:mk.kind,s:ms},{o:q.o*o,sc:lerp(.85,1,E(q.k)),br:lerp(1,.6,dm)});}
  }
  const bw=browOf(p.brow,p.en);if(bw){const q=appear(t,T0+.1,.3,0);h+=brow({x:p.browX??960,y:p.browY??(Math.min(...nodes.map(n=>box(n)[1]))-112),zh:bw.zh,en:bw.en},{o:q.o});}
  let top='';
  for(const q of pops){if(t<q.t)continue;let fr=[860,440,200,112];
   const src=q.from?(byId[q.from]?[byId[q.from].x,byId[q.from].y]:lById[q.from]?K.qpt(ends(lById[q.from]),.5):null):null;
   if(Array.isArray(q.from)&&q.from.length===4)fr=q.from;else if(src)fr=[(src[0]-cc.x)*cc.s+960-90,(src[1]-cc.y)*cc.s+540-50,180,100];
   top+=MV.popWindow(t,{t0:q.t,t1:q.back,from:fr,to:q.to??[400,120,1120,630],html:`<img src="${q.clip?FB.fr(q.clip,Math.floor((t-q.t)*30)+1):q.img}" style="width:100%;height:100%;object-fit:cover">`,dim:.42,why:p.says});}
  return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow,rings:p.rings})+L(cc,cp,1,h,{mbMax:p.mbMax})+top;
 };
}
const boardDoc={need:['nodes'],minDur:1.5,code:[boardMake],beats:p=>arr(p.steps).length+(p.nodes??p.items??[]).filter(n=>n.at!=null).length,
 help:{nodes:"[{id:'nvda', name:'英偉達', color:'nvidia', photo:'assets/img/jensen.jpg', tag:{label:'市值', value:'$5.2萬億'}, at:'@b06:英偉達'}, ...]：圓盤有 photo 就是照片圓盤（照片鋪滿、名字壓在盤上），沒有就是品牌色實心盤 + 名字",
  links:"[{from:'nvda', to:'oai', text:'投資', color:'green'}]",steps:"[{at:'@b07:轉了一圈', loop:['nvda>oai','oai>orcl','orcl>nvda']}, {at:'@b08', focus:'nvda'}]",
  layout:"'row' 一排 / 'ring' 一圈 / 'hub' 中心加一圈 / 'grid'（節點寫 pos:[列,行]）/ 'free'（節點寫 x,y）/ 'line' 時間線",
  pre:"'gray'（discs、flow、network、timeline 預設：先灰著佔位，唸到才上色）/ 'hide'（board、map 預設：唸到才出現）"}};
K.scene('board',{...boardDoc,says:'一個世界裡的幾樣東西和它們的關係：唸到誰，鏡頭去找誰；狀態在原地變',use:'幾樣東西要放在一起講（並列、流向、包含、出局）',avoid:'只有一個數（用 number）；要看清一段實拍（用 footage）',make:boardMake});
K.scene('discs',{...boardDoc,need:['items'],says:'幾家公司 / 幾個人：一家一個照片圓盤（沒有照片就是品牌色實心盤 + 名字），唸到誰亮誰；收購 = 巢狀，出局 = 變灰',use:'幾家公司並列、比大小（scale:area 按數值面積）、收購、誰出局',avoid:'它們之間有流向（用 network）',
 defaults:{type:'disc',layout:'row',pre:'gray',atDo:'light',maxZoom:1.3,pad:110},make:(p,c)=>{const n=arr(p.items).length,r=n<=2?190:n===3?170:n===4?150:n===5?132:112;return boardMake({...p,nodes:p.items.map(it=>({r,...it}))},c);}});
K.scene('versus',{...boardDoc,need:['items'],says:'兩樣本該相配的東西按真實比例並排，差得離譜一眼可見（估值 vs 收入）',use:'反差：投入和回報、估值和收入、市值和利潤',avoid:'差別不大（看不出來就別比）',
 defaults:{type:'disc',layout:'row',scale:'area',maxR:200,gap:150,atDo:'show'},make:(p,c)=>boardMake({...p,nodes:p.items},c)});
K.scene('flow',{...boardDoc,says:'流程 / 結構：卡片和虛線箭頭，一步步亮起，對的打勾、錯的打叉',use:'一件事分幾步、錢分幾路、幾個條件成不成立',avoid:'只是並列幾樣東西（用 discs）',
 defaults:{type:'card',lineColor:'blue',pre:'gray',maxZoom:1.35},make:boardMake});
K.scene('network',{...boardDoc,says:'關係網 / 資金迴圈：節點之間的流向，錢流到哪鏡頭跟到哪，"轉了一圈"有亮點跑一圈',use:'誰投了誰、錢怎麼轉、幾方之間的關係',avoid:'沒有方向的並列（用 discs）',
 defaults:{type:'disc',layout:'ring',curve:.16,lineColor:'gold',maxZoom:1.45,pre:'gray'},make:boardMake});
K.scene('timeline',{...boardDoc,says:'時間線：年份排在一條光軸上，唸到哪年鏡頭推到哪年',use:'按時間講幾件事（發展史、幾輪融資）',avoid:'只有兩個時間點（用 versus 或 bars）',
 defaults:{type:'event',layout:'line',maxZoom:1.35,pad:110,pre:'gray'},make:boardMake});

// =====================================================================================
// person：人站在巨字前面（當事人摳像 + 身後兩組巨字 + 顏色光）
// =====================================================================================
K.scene('person',{
 says:'這個人 = 這個詞：當事人站在兩組巨字前面（市值、估值、帝國、權），人比字近',
 use:'第一次讓一個關鍵人物和他的數/身份綁在一起；同一個人換一個說法用 flip；他說到的小數用 cards 在肩旁冒出來',
 avoid:'沒有這個人的摳像（只有照片就用 discs 的 photo 圓盤）；字超過兩組、每組超過 4 個字',
 need:['img'],
 help:{img:"人像摳圖（透明 PNG）：assets/cut/jensen.png。從實拍摳：scripts/matte.py；從照片摳也行",words:"['5.2','萬億']：頭兩側各一組，每組 1–4 個字",
  color:'這個人對應的公司顏色（公司名或顏色名）：身後的織物染成這個顏色，中間一團同色的光（谷歌那鏡：藍織物 + 一團藍光）',brow:"眉題，比如 '英偉達 · 市值'",
  glow:'身後那團光：預設就是 color；false = 不要光（只留染色的織物）',tone:"寫了 navy / charcoal / wine 就不染品牌色，用這個底色",
  flip:"[{at:'@b07:全世界', words:['全球','第一']}]：同一個人換一個說法，舊字往下滑出、新字從上面落下",
  cards:"[{at:'@b08:收入', label:'今年收入', value:'$360億'}]：他說到的小數在肩旁冒一張小卡，身後的巨字退一步",
  from:"人身後換背景：先放原照片/實拍（和摳圖同尺寸），{img:'assets/img/jensen.jpg', at:'@b06:市值'} 那一刻換成舞臺 + 巨字，人挪到構圖位置",
  h:'人像整張圖在畫面裡的高度（預設 1250：頭肩在上半屏，下半身出畫）',top:'頭頂落在 y 多少（預設 190）'},
 defaults:{color:'steel'},minDur:1.5,glow:true,
 beats:p=>arr(p.flip).length+arr(p.cards).length+(p.from?1:0),
 check(p,c){for(const w of [...arr(p.words),...arr(p.flip).flatMap(f=>arr(f.words))])if(String(w).length>4)c.warn(`巨字「${w}」超過 4 個字：一組只放一兩個詞`);if(arr(p.words).length>2)c.warn('words 只放兩組（頭兩側各一組）');},
 async prep(p){await K.measure(p.img);},
 make(p,c){
  const m=K.MEAS[p.img],color=col(p.color),h=p.h??1250,top=p.top??190,hx=p.x??960,sc=h/m.h;
  const headW=(m.box[2]-m.box[0])*sc*.42,gap=p.gap??Math.max(120,Math.min(260,headW*.62));
  const sets=[{t:-1e9,words:arr(p.words)},...arr(p.flip).map(f=>({t:c.at(f.at),words:arr(f.words)}))].sort((a,b)=>a.t-b.t);
  const size=Math.min(...sets.flatMap(s=>s.words.map(w=>K.megaFit(w,p.size??520,hx-gap-80)))),my=top-size*.06;
  const ta=c.at(p.at)??(p.from?c.at(p.from.at):c.t0+.08),gm=[mixc('#ffffff',color,.1),mixc('#ffffff',color,.32)];
  const cards=arr(p.cards).map((q,i)=>({...q,t:c.at(q.at)??c.t0+1+i*.8,i}));
  const swap=p.from?{t:c.at(p.from.at)??c.t0+.6,img:p.from.img}:null;
  const keys=[{t:c.t0,cam:{x:960,y:540,s:1}}];if(cards.length)keys.push({t:cards[0].t,cam:{x:1010,y:550,s:1.035},d:.6});
  const cam=camSeq(keys,.02);
  // 原照片里人的位置（cover 鋪滿）→ 構圖位置
  const cov=Math.max(1920/m.w,1080/m.h),ox=(1920-m.w*cov)/2,oy=(1080-m.h*cov)/2;
  return t=>{
   const cc=cam(t),cp=cam(t-1/30);
   if(swap&&t<swap.t){const k=(t-c.t0)/Math.max(.5,swap.t-c.t0);return `<div class="k-full" style="transform:scale(${f3(1+.03*k)})"><img src="${swap.img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>`;}
   const fk=cards.length?IO((t-cards[0].t)/.6):0,grow=E((t-ta)/.3);
   let mg='';const groups=(ws,o,dy)=>{if(ws.length===1)return S25.mega(ws[0],{x:hx,y:my+dy,size,anchor:'c',m:gm,o,s:lerp(1.12,1,grow),b:fk*7});
    return S25.mega(ws[0],{x:hx-gap,y:my+dy,size,anchor:'r',m:gm,o,s:lerp(1.12,1,grow),b:fk*7})+S25.mega(ws[1],{x:hx+gap,y:my+dy,size,anchor:'l',m:gm,o,s:lerp(1.12,1,grow),b:fk*7});};
   for(let i=0;i<sets.length;i++){const s=sets[i],nx=sets[i+1];const kin=i===0?1:E((t-s.t)/.24),kout=nx?E((t-nx.t)/.24):0;if(t<s.t||kout>=1)continue;
    mg+=groups(s.words,C(grow*.98+.02)*kin*(1-kout)*lerp(1,.5,fk),(1-kin)*-150+kout*150);}
   // 眉題跟左邊那組字左對齊（右對齊會鑽到人身後）；flip 換成寬窄不一樣的字時，跟著新字的左邊緣滑過去
   let bw='';const B=browOf(p.brow,p.en);if(B){const lx=ws=>ws.length===1?hx-K.megaW(ws[0],size)/2:hx-gap-K.megaW(ws[0]??'',size);
    let bx0=lx(sets[0].words);for(let i=1;i<sets.length;i++)bx0=lerp(bx0,lx(sets[i].words),E((t-sets[i].t)/.3));
    bw=brow({x:Math.max(90,bx0+size*.03),y:my+size*.84+18,zh:B.zh,en:B.en,anchor:'l'},{o:C(grow)*lerp(1,.5,fk)});}
   const sk=swap?IO((t-swap.t-.05)/.6):1;
   const pl=lerp(ox+m.head[0]*cov,hx,sk),ps=lerp(cov,sc,sk),ptop=lerp(oy+m.top*cov,top,sk);
   const ph=`<img src="${p.img}" style="position:absolute;left:${f1(pl-m.head[0]*ps)}px;top:${f1(ptop-m.top*ps)}px;width:${f1(m.w*ps)}px;height:${f1(m.h*ps)}px;filter:contrast(1.04) saturate(.96)">`;
   let cd='';for(const q of cards){const a=appear(t,q.t+.2,.3,20);if(a.o>0)cd+=glass(hx+gap*.55+170,430+q.i*250,q.label??'',q.value,{o:a.o,dy:a.dy},{vs:96});}
   const tinted=!(p.tone&&K.TONE[p.tone]);
   return c.bg(t,cc,cp,{tone:p.tone,tint:tinted?color:null,glow:p.glow===false?null:(p.glow??color),go:.36,gx:`${f1(50+(hx-960)/38.4)}%`,gy:'46%'})+L(cc,cp,.7,mg+bw)+L(cc,cp,1,ph)+L(cc,cp,1.04,cd);
  };
 }
});

// =====================================================================================
// footage：一段實拍 / 一張照片全屏，鏡頭朝一個點慢推；可以釘一個圓盤徽章在角上
// =====================================================================================
K.scene('footage',{
 says:'實拍就是在講的東西：人、地方、產品、釋出會，全屏、乾淨，不壓字',
 use:'這句話說到的東西有真畫面；一鏡只講一個物件',
 avoid:'畫面裡認不出是誰、是什麼（加身份：logo、人臉、標題）；想在上面加字（字只用 person 的巨字或 montage/title 的退成底）',
 help:{img:'一張圖（照片、截圖）',clip:'實拍幀序列名（footage.py extract 抽的 assets/clips/<名>/）',from:'實拍從第幾秒開始（預設 0）',rate:'播放速度（預設 1，最慢 0.8）',
  push:'[起, 止] 放大倍數（預設 [1, 1.06]，慢慢往裡推）',focus:'[x,y] 往哪一點推（1920×1080 座標，預設畫面中心）',settle:'true = 開頭從 1.08 收到 1（接 frames 的 fill 推滿屏）',
  badge:"{name:'英偉達', color:'nvidia', at:'@b05:它'}：上一鏡的圓盤縮成徽章釘在左上角，底下的實拍在換"},
 minDur:1.5,
 check(p,c){if(!p.img&&!p.clip)throw Error(`${c.tag}：footage 要 img 或 clip`);},
 make(p,c){
  const [s0,s1]=p.push??[1,1.06],[fx0,fy0]=p.focus??[960,540],ba=p.badge?c.at(p.badge.at)??c.t0:null;
  return t=>{
   const k=(t-c.t0)/c.d,s=lerp(s0,s1,k)*(p.settle?lerp(1.08,1,E((t-c.t0)/.35)):1);
   let h=`<div class="k-full" style="transform-origin:${fx0}px ${fy0}px;transform:scale(${f3(s)})"><img src="${clipOrImg(p,t,c.t0)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>`;
   if(p.badge&&t>=ba){const q=appear(t,ba,.25,0);h+=disc({...p.badge,x:p.badge.x??190,y:p.badge.y??180,r:p.badge.r??92},{o:q.o});}
   return h;
  };
 }
});

// =====================================================================================
// montage：釘住一個東西，底下換實拍（這件事 = 這些畫面）
// =====================================================================================
K.scene('montage',{
 says:'這件事 = 這些畫面：前景釘住一個視線落點（一個數、一個標題、一個圓盤），底下的實拍壓暗去色，0.4 秒一換',
 use:'"這些錢都變成了這些樓"這類：前景的東西不變，底下用很多實拍說明它',
 avoid:'前景沒有視線落點（那就別快切）；底下的實拍需要觀眾看清（用 footage）',
 need:['items'],
 help:{items:"實拍：['assets/img/dc1.jpg', {clip:'dc2'}, ...]，至少 3 段（同一段輪到第二次時接著往後放）；只給一段就連續放",step:'幾秒一換（預設 0.42）',pin:"前景：{value:'$7250億', brow:'...'} 或 {title:'AI到底有多燒錢'} 或 {disc:{name,color}}"},
 minDur:1.2,
 check(p,c){if(arr(p.items).length<3)c.warn('montage 底下至少放 3 段實拍，少了就像卡住');if(!p.pin)c.warn('montage 沒有 pin：前景沒有視線落點時不要快切');},
 make(p,c){
  const items=arr(p.items).map(x=>typeof x==='string'?{img:x}:x),step=p.step??.42,pin=p.pin??{};
  return t=>{
   const k=t-c.t0;
   let h=`<div class="k-full" style="transform:scale(${f3(1.04+.012*k)})">${underlay(items,k,step,{br:p.br??.36,sat:p.sat??.5,bl:1.2})}</div>`;
   const s=1+.012*k;let fg='';
   if(pin.value!=null){const pv=pin.full?full(num(pin.value)):num(pin.value),size=fitPx(numText(pv),'num',pin.size??230,1500);fg+=bignum({x:960,y:500,value:pv,size},{sc:s});if(pin.brow)fg+=brow({x:960,y:500-size*.42-86,zh:pin.brow,en:pin.en},{sc:s});}
   if(pin.title)fg+=chrome(pin.title,{brow:pin.brow,en:pin.en,size:pin.size,s});
   if(pin.disc)fg+=disc({r:150,...pin.disc,x:960,y:470},{sc:s});
   return h+fg;
  };
 }
});
// 金屬片名：數黑體，上面眉題，下面一行英文
function chrome(title,o={}){
 const size=fitPx(title,'han',o.size??168,1600,.08),s=o.s??1;
 return `<div class="k-title" style="font-size:${size}px;transform:translate(-50%,-50%) scale(${f3(s)});opacity:${f3(o.o??1)}">${o.brow?`<small>${o.brow}</small>`:''}<b>${title}</b>${o.en?`<i>${o.en}</i>`:''}</div>`;
}
K.chrome=chrome;

// =====================================================================================
// title：片名 / 章節卡（字是主角，底下實拍壓暗退成底，或者就是舞臺）
// =====================================================================================
K.scene('title',{
 says:'片名或章節：這支片（這一段）要回答什麼問題',
 use:'片名（開頭鉤子之後）、換章節（階段一 · 劇烈震盪期 · 2022）',
 avoid:'片名前面空等（第一句話說完就進）；一支片超過 3 張章節卡',
 need:['title'],
 help:{title:'片名，一句問題：AI到底有多燒錢',brow:'片名上面一行（常是剛數出來的那個數）',en:'下面一行英文小字',items:'底下壓暗去色的實拍：一段 = 連續放（一段實拍退成底）；幾段 = step 秒一換；不給就用舞臺',step:'底下幾秒一換（預設 0.42）',kind:"'film' 片名 / 'chapter' 章節卡",num:"章節卡左上的小字：'階段一'",year:"章節卡的年份：'2022'"},
 minDur:1.2,flat:p=>!arr(p.items).length,
 make(p,c){
  const items=arr(p.items).map(x=>typeof x==='string'?{img:x}:x),step=p.step??.42;
  return t=>{
   const k=t-c.t0,q=appear(t,c.t0,.3,0);
   let bg;if(items.length)bg=`<div class="k-full" style="transform:scale(${f3(1.04+.012*k)})">${underlay(items,k,step,{br:p.br??.34,sat:.5,bl:1.4})}</div>`;
   else{const cc={x:960,y:540,s:1+.02*k};bg=c.bg(t,cc,cc,{tone:p.tone,glow:p.glow});}
   let fg;
   if(p.kind==='chapter')fg=`<div class="k-chap" style="opacity:${f3(q.o)};transform:translate(-50%,-50%) scale(${f3(1.03-.03*E(k/.6)+.01*k)})">${p.num?`<small>${p.num}</small>`:''}<b>${p.title}</b>${p.year?`<span>${p.year}</span>`:''}${p.en?`<i>${p.en}</i>`:''}</div>`;
   else fg=chrome(p.title,{brow:p.brow,en:p.en,size:p.size,s:1.03-.03*E(k/.6)+.012*k,o:q.o});
   return bg+fg;
  };
 }
});
// =====================================================================================
// chart：白底圖表卡（趨勢、按年累計），線跟著話畫出來，累計數跟著線滾
// =====================================================================================
function ticks(lo,hi,n=4){const span=hi-lo||1,s0=span/n,mag=10**Math.floor(Math.log10(s0)),e=s0/mag,step=(e>=7.5?10:e>=3.5?5:e>=1.5?2:1)*mag;
 const a=Math.floor(lo/step)*step,b=Math.ceil(hi/step)*step,out=[];for(let v=a;v<=b+step*1e-6;v+=step)out.push(+v.toFixed(8));return out;}
K.scene('chart',{
 says:'一條趨勢（按年虧損、收入增長）畫在白底圖表卡上：線跟著話畫出來，累計數跟著線滾',
 use:'按時間變化的一串數；"到 2030 年累計虧 2780 億"這種按年累加',
 avoid:'只有一個數（number）；兩三個數比大小（bars 更有衝擊力）',
 need:['values'],
 help:{values:'[-50,-90,-140,...]：每個點的值（單位自己定，和 unit 一致）',x:"['2026','2027',...]：橫軸標籤，和 values 一樣多",title:"圖表標題：'OpenAI 累計淨燒錢（預測）'",en:'標題下一行英文小字（以前叫 sub，還能用；number 的 sub 是另一回事：對比小卡）',
  kind:"'line'（預設）/'area' 線下面鋪一層 / 'bar' 柱",color:"線的顏色：'red'（虧損，預設）/'green'/公司名",unit:"縱軸單位：'億'",draw:"{at:'@b08:它還準備', until:'@b08:兩千七百'}：線從第一個點畫到最後一個點的時間",
  total:"{label:'累計淨燒', from:'$0', to:'-$2780億'}：跟著線滾的累計數，放線上讓出來的那塊空白裡",mark:"[{at:'@b09:2030', i:4, text:'2030'}]：在第 i 個點上亮一下"},
 defaults:{kind:'area',color:'red'},minDur:1.8,flat:true,
 beats:p=>1+arr(p.mark).length,
 check(p,c){if(p.x&&p.x.length!==p.values.length)c.warn(`x 有 ${p.x.length} 個、values 有 ${p.values.length} 個，要一樣多`);},
 make(p,c){
  const V=p.values,n=V.length,X=p.x??V.map((_,i)=>String(i+1)),cw=1340,ch=760,cx=960-cw/2,cy=96,pl=150,pr=80,pt=170,pb=96,pw=cw-pl-pr,ph=ch-pt-pb;
  const lo=Math.min(0,...V),hi=Math.max(0,...V),tk=ticks(lo,hi,4),y0=tk[0],y1=tk[tk.length-1];
  const px=i=>pl+(n===1?pw/2:i*pw/(n-1)),py=v=>pt+(y1-v)/(y1-y0||1)*ph,lc=K.col(p.color)==='#c63038'?'#d6343c':K.col(p.color);
  const d0=c.at(p.draw?.at)??c.t0+.35,d1=c.at(p.draw?.until)??Math.min(c.t1-.4,d0+1.6),marks=arr(p.mark).map(m=>({...m,t:c.at(m.at)}));
  const desc=V[n-1]<V[0],tot=p.total?{l:p.total.label,a:num(p.total.from??0),b:num(p.total.to)}:null;
  const keys=[{t:c.t0,cam:{x:960,y:520,s:.94}},{t:c.t0,cam:{x:960,y:500,s:1},d:.8}];
  const cam=camSeq(keys,.02);
  const grid=tk.map(v=>`<line x1="${pl}" x2="${pl+pw}" y1="${f1(py(v))}" y2="${f1(py(v))}" stroke="${v===0?'#9a9ea6':'#cfd2d8'}" stroke-width="${v===0?2.5:1.6}" ${v===0?'':'stroke-dasharray="7 8"'}/><text x="${pl-18}" y="${f1(py(v)+7)}" text-anchor="end" font-family="${FAM.en}" font-weight="600" font-size="21" fill="#9a9ea6">${v}${p.unit??''}</text>`).join('')+
   X.map((l,i)=>`<text x="${f1(px(i))}" y="${pt+ph+52}" text-anchor="middle" font-family="${FAM.en}" font-weight="600" font-size="24" fill="#7d828b">${l}</text>`).join('');
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),k=E((t-d0)/Math.max(.2,d1-d0)),u=k*(n-1),j=Math.min(n-2,Math.floor(u)),fr=u-j;
   const pts=[];for(let i=0;i<n;i++){if(i<=u)pts.push([px(i),py(V[i])]);}if(n>1&&u<n-1&&u>0)pts.push([px(j)+(px(j+1)-px(j))*fr,py(V[j]+(V[j+1]-V[j])*fr)]);
   const head=pts[pts.length-1]??[px(0),py(V[0])];
   let svg='';
   if(p.kind==='bar'){const bw=Math.min(90,pw/n*.5);V.forEach((v,i)=>{const g=E((t-d0-i*(d1-d0)/n*.7)/.5),yv=py(0)+(py(v)-py(0))*g;svg+=`<rect x="${f1(px(i)-bw/2)}" y="${f1(Math.min(yv,py(0)))}" width="${f1(bw)}" height="${f1(Math.abs(yv-py(0)))}" rx="6" fill="${lc}"/>`;});}
   else if(pts.length>1){const d=pts.map((q,i)=>`${i?'L':'M'}${f1(q[0])} ${f1(q[1])}`).join(' ');
    if(p.kind==='area')svg+=`<path d="${d} L${f1(head[0])} ${f1(py(0))} L${f1(pts[0][0])} ${f1(py(0))} Z" fill="url(#ka)" opacity=".9"/>`;
    svg+=`<path d="${d}" fill="none" stroke="${lc}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;}
   if(p.kind!=='bar'&&t>=d0)svg+=`<circle cx="${f1(head[0])}" cy="${f1(head[1])}" r="12" fill="${lc}" stroke="#fff" stroke-width="4"/><circle cx="${f1(head[0])}" cy="${f1(head[1])}" r="26" fill="${lc}" opacity=".18"/>`;
   for(const m of marks){if(t<m.t)continue;const q=appear(t,m.t,.25,0),mx=px(m.i),my=py(V[m.i]);svg+=`<g opacity="${f3(q.o)}"><circle cx="${f1(mx)}" cy="${f1(my)}" r="17" fill="none" stroke="${lc}" stroke-width="4"/>${m.text?`<text x="${f1(mx)}" y="${f1(my-30)}" text-anchor="middle" font-family="${FAM.han}" font-size="30" fill="#2a2c31">${m.text}</text>`:''}</g>`;}
   let tt='';if(tot&&t>=d0-.05){const val=lerp(tot.a.n*(tot.a.neg?-1:1),tot.b.n*(tot.b.neg?-1:1),k),pv={...tot.b,neg:val<0,n:Math.abs(val)};
    tt=`<div style="position:absolute;${desc?`right:${pr+10}px`:`left:${pl+30}px`};top:${pt-6}px;text-align:${desc?'right':'left'}"><div style="font:32px ${FAM.han};color:#4a4d55;letter-spacing:.08em">${tot.l??''}</div><div class="k-num ${val<0||p.color==='red'?'red':''}" style="position:relative;font-size:118px;margin-top:6px;filter:none;justify-content:${desc?'flex-end':'flex-start'}">${K.numHTML(pv,{fixed:true})}</div></div>`;}
   const su=c.enter==='flat'?E((t-c.t0-.3)/.55):1;   // 接 flat：上一鏡倒成桌面，圖表從桌面上立起來
   const card=`<div class="k-chart" style="left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;transform-origin:50% 100%;transform:translateY(${f1((1-su)*420)}px) perspective(2400px) rotateX(${f1((1-su)*26)}deg) rotateY(-2deg);opacity:${f3(C(su*2.2))}">${p.title?`<div class="ct">${p.title}</div>`:''}${(p.en??p.sub)?`<div class="cs">${p.en??p.sub}</div>`:''}<svg width="${cw}" height="${ch}" style="position:absolute;left:0;top:0"><defs><linearGradient id="ka" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lc}" stop-opacity="${desc?.06:.32}"/><stop offset="1" stop-color="${lc}" stop-opacity="${desc?.32:.04}"/></linearGradient></defs>${grid}${svg}</svg>${tt}</div>`;
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,1,card);
  };
 }
});

// =====================================================================================
// bars：兩三個數立成柱子（低機位），柱子長出來時鏡頭跟著往上；"差一大截"鏡頭沿著差的那一段往上抬，括號跟著畫出來
// =====================================================================================
K.scene('bars',{
 says:'兩三個數按真實高度立成柱子（低機位、地面有倒影和一抹光）：投入 vs 回報、幾家的規模；差距由鏡頭沿著柱子走出來',
 use:'"每年砸進去七千多億，收回來的差一大截"這種對比',
 avoid:'超過 5 根（用 ranking）；差距小到看不出來',
 need:['bars'],
 help:{bars:"[{label:'每年砸進去', value:'$7250億', color:'red', at:'@b15:每年'}, {label:'收回來的', value:'?', n:900, color:'gray', at:'@b15:收回來'}]：value 是柱頂的金色數字；高度按 value 的數，寫 '?' 的要給 n（估一個高度用的數）；不寫 at 的一開場就立著",
  gap:"{at:'@b15:差著', a:0, b:1, text:'差一大截'}：從矮的柱頂到高的柱頂畫一道括號，鏡頭沿著它往上抬",
  tone:"底色：'navy'（預設）；'wine' 留給算總賬 / 虧錢那一段（一支片最多一段）",floor:'false = 不要地面的倒影和光'},
 defaults:{tone:'navy'},minDur:1.8,
 beats:p=>arr(p.bars).filter(b=>b.at).length+(p.gap?1:0),
 make(p,c){
  const B=arr(p.bars).map((b,i)=>{const v=num(b.value);return {...b,i,v,n:b.n??(v?.text?null:v.n),t:c.at(b.at)??c.t0};});
  if(B.some(b=>b.n==null))throw Error(`${c.tag}：value 寫成 '?' 的柱子要給 n（估一個高度用的數）`);
  const mx=Math.max(...B.map(b=>b.n)),H=p.barH??500,base=790,bw=p.barW??220,g=p.barGap??Math.max(200,Math.min(320,1000/B.length)),tot=B.length*bw+(B.length-1)*g;
  B.forEach((b,i)=>{b.x=960-tot/2+bw/2+i*(bw+g);b.h=Math.max(14,H*b.n/mx);});
  const gp=p.gap?{...p.gap,t:c.at(p.gap.at)}:null,fl=p.floor!==false,vs=Math.round(Math.min(112,Math.max(80,bw*.5)));
  const top=b=>base-b.h-vs*1.05,all=[B[0].x-bw*.9,Math.min(...B.map(top))-20,B.at(-1).x+bw*.9,base+70],fa={max:1.15,pad:50};   // 看全：柱子佔滿畫面高度（原版、谷歌那條都是大柱子）
  // 機位：柱子一開場就在 → 看全；要等唸到才長 → 先低低地看著地面，長的時候鏡頭跟著往上，最後（或者 gap 時）看全
  const late=B.filter(b=>b.t>c.t0+.05);
  const keys=[{t:c.t0,cam:late.length?fit([B[0].x-bw,base-320,B.at(-1).x+bw,base+90],{max:1.2}):fit(all,fa)}];
  const soft=cm=>({...cm,x:lerp(960,cm.x,.45)});   // 跟著柱子往上走，橫向只挪一半（挪滿了畫面會糊）
  for(const b of late){keys.push({t:b.t,cam:soft(fit([b.x-bw*1.4,base-b.h*.6-160,b.x+bw*1.4,base+90],{max:1.25})),d:1});keys.push({t:b.t+.7,cam:soft(fit([b.x-bw*1.5,top(b)-30,b.x+bw*1.5,base+80],{max:1.2})),d:1.1});}
  if(gp){const a=B[gp.a??1],bb=B[gp.b??0],lo=Math.min(a.h,bb.h),hi=Math.max(a.h,bb.h),gx=(a.x+bb.x)/2;
   keys.push({t:gp.t,cam:fit([gx-460,base-lo-200,gx+460,base-lo+130],{max:1.35}),d:.8});keys.push({t:gp.t+.7,cam:fit([gx-520,base-hi-vs-60,gx+520,base-lo+90],{max:1.3}),d:1.1});}
  else if(late.length&&late.at(-1).t+1.7<c.t1-.6)keys.push({t:late.at(-1).t+1.7,cam:fit(all,fa),d:1});
  const cam=camSeq(keys,.02);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),ry=lerp(-7,-2.5,IO((t-c.t0)/Math.max(1.5,c.d)));
   // 地面：一抹光 + 一道細地平線；柱子帶地面倒影（-webkit-box-reflect）
   let h=fl?`<div style="position:absolute;left:-240px;top:${base}px;width:2400px;height:320px;background:radial-gradient(ellipse 46% 62% at 50% 0%,rgba(150,176,226,.17),transparent 74%)"></div>`:'';
   h+=`<div style="position:absolute;left:${f1(all[0]-200)}px;top:${base-1}px;width:${f1(all[2]-all[0]+400)}px;height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3) 14%,rgba(255,255,255,.3) 86%,transparent)"></div>`;
   for(const b of B){
    const gk=b.t<=c.t0+.05?1:E((t-b.t)/.9),hh=b.h*gk,cl=K.col(b.color??'red');
    if(gk>0)h+=`<div style="position:absolute;left:${f1(b.x-bw/2)}px;top:${f1(base-hh)}px;width:${bw}px;height:${f1(hh)}px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,${mixc(cl,'#ffffff',.16)} 0%,${cl} 46%,${mixc(cl,'#000000',.24)} 100%);box-shadow:0 18px 40px rgba(0,0,0,.42)${fl?';-webkit-box-reflect:below 2px linear-gradient(transparent 60%,rgba(255,255,255,.26))':''}"></div>`;
    const vo=C((gk-.6)/.4);
    if(vo>0)h+=b.v.text?`<div style="position:absolute;left:${f1(b.x)}px;top:${f1(base-hh-vs*1.25)}px;transform:translateX(-50%);font:${Math.round(vs*1.15)}px ${FAM.num};line-height:1;color:#f3efe4;opacity:${f3(vo)};text-shadow:0 6px 20px #000a">${b.v.text}</div>`
     :bignum({x:b.x,y:base-hh-vs*.56,value:b.v,size:vs},{o:vo});
    if(b.label)h+=`<div style="position:absolute;left:${f1(b.x)}px;top:${base+22}px;transform:translateX(-50%);font:500 32px ${FAM.ui};color:#dfe5ef;letter-spacing:1px;white-space:nowrap;text-shadow:0 2px 8px #0009;opacity:${f3(lerp(.45,1,C(gk*2)))}">${b.label}</div>`;
   }
   if(gp&&t>=gp.t){const a=B[gp.a??1],bb=B[gp.b??0],lo=Math.min(a.h,bb.h),hi=Math.max(a.h,bb.h),sm=a.h<bb.h?a:bb,bx=sm.x+(sm===a?(bb.x>a.x?1:-1):(a.x>bb.x?1:-1))*(bw/2+60),k=E((t-gp.t-.15)/1.1),y1=base-lo,y2=base-lo-(hi-lo)*k;
    h+=`<svg class="k-full" width="1920" height="1080" style="overflow:visible"><path d="M${f1(bx-20)} ${f1(y1)} L${f1(bx)} ${f1(y1)} L${f1(bx)} ${f1(y2)} L${f1(bx-20)} ${f1(y2)}" fill="none" stroke="#efe4c4" stroke-width="3.5" stroke-linejoin="round"/><line x1="${f1(sm.x-bw/2)}" x2="${f1(bx)}" y1="${f1(base-hi)}" y2="${f1(base-hi)}" stroke="#efe4c4" stroke-width="2.5" stroke-dasharray="8 9" opacity="${f3(k*.8)}"/></svg>`;
    if(gp.text)h+=label({x:bx+(bx>sm.x?150:-150),y:(y1+base-hi)/2,text:gp.text,size:46},{o:C((t-gp.t-.5)/.4)});}
   const grp=`<div class="k-full" style="transform:perspective(2400px) rotateX(5deg) rotateY(${f1(ry)}deg);transform-origin:960px ${base}px">${h}</div>`;
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow,gy:'52%'})+L(cc,cp,1,grp,{mbMax:6});
  };
 }
});

// =====================================================================================
// share：整體裡的一部分（佔比、份額）：一個厚環，講到的那一塊亮起來、往外推一點
// =====================================================================================
K.scene('share',{
 says:'整體裡的一部分有多大：一個環，講到的那一塊亮起來、往外推一點，中間寫這一塊的數',
 use:'佔比、份額、"市面上只有三成"',
 avoid:'超過 5 塊（合併成"其他"）；要比幾個整體的大小（用 versus）',
 need:['parts'],
 help:{parts:"[{label:'流通股', value:30, color:'gold'}, {label:'大股東', value:70, color:'gray'}]：value 是佔比（加起來不用正好 100）",focus:"[{at:'@b05:三成', i:0}]：講到哪一塊",
  center:"{value:'30%', label:'流通'}：環中間的字（不寫就顯示講到的那一塊）",title:'環上方一行眉題'},
 defaults:{tone:'navy'},minDur:1.6,
 beats:p=>arr(p.focus).length,
 make(p,c){
  const P=arr(p.parts),sum=P.reduce((a,b)=>a+(+b.value),0),R=290,W=118,CX=960,CY=470,foc=arr(p.focus).map(f=>({...f,t:c.at(f.at)})).sort((a,b)=>a.t-b.t);
  let a0=-90;const seg=P.map(q=>{const a=360*q.value/sum,s={...q,a0,a1:a0+a};a0+=a;return s;});
  const cam=camSeq([{t:c.t0,cam:{x:960,y:520,s:.93}},{t:c.t0,cam:{x:960,y:500,s:1},d:.8}],.02);
  const arc=(r1,r2,b0,b1)=>{const A=d=>d*Math.PI/180,p1=(r,d)=>[CX+r*Math.cos(A(d)),CY+r*Math.sin(A(d))],lg=b1-b0>180?1:0,[x1,y1]=p1(r2,b0),[x2,y2]=p1(r2,b1),[x3,y3]=p1(r1,b1),[x4,y4]=p1(r1,b0);
   return `M${f1(x1)} ${f1(y1)} A${r2} ${r2} 0 ${lg} 1 ${f1(x2)} ${f1(y2)} L${f1(x3)} ${f1(y3)} A${r1} ${r1} 0 ${lg} 0 ${f1(x4)} ${f1(y4)} Z`;};
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),sw=E((t-c.t0-.1)/.8)*360,cur=[...foc].reverse().find(f=>t>=f.t),fk=cur?IO((t-cur.t)/.4):0;
   let svg='';
   for(const [i,s] of seg.entries()){const b1=Math.min(s.a1,-90+sw);if(b1<=s.a0)continue;const on=cur&&cur.i===i,mid=(s.a0+s.a1)/2*Math.PI/180,off=on?22*fk:0,cl=K.col(s.color??['gold','steel','teal','wine','slate'][i%5]);
    const dm=cur&&!on?lerp(1,.38,fk):1;
    svg+=`<g transform="translate(${f1(Math.cos(mid)*off)} ${f1(Math.sin(mid)*off)})" style="filter:brightness(${f3(dm)}) saturate(${f3(cur&&!on?lerp(1,.5,fk):1)})"><path d="${arc(R-W,R,s.a0,b1)}" fill="url(#sg${i})" stroke="rgba(255,255,255,.35)" stroke-width="2"/></g>
     <defs><radialGradient id="sg${i}" cx="${CX}" cy="${CY}" r="${R}" gradientUnits="userSpaceOnUse"><stop offset="${f3((R-W)/R)}" stop-color="${mixc(cl,'#000',.35)}"/><stop offset=".9" stop-color="${cl}"/><stop offset="1" stop-color="${mixc(cl,'#fff',.3)}"/></radialGradient></defs>`;
    if(sw>=360){const lx=CX+Math.cos(mid)*(R+90+off),ly=CY+Math.sin(mid)*(R+70+off),lo=C((t-c.t0-.9)/.3)*dm;svg+=`<g opacity="${f3(lo)}"><text x="${f1(lx)}" y="${f1(ly)}" text-anchor="${Math.cos(mid)>.2?'start':Math.cos(mid)<-.2?'end':'middle'}" font-family="${FAM.han}" font-size="40" fill="#f1ead2">${s.label??''}</text><text x="${f1(lx)}" y="${f1(ly+58)}" text-anchor="${Math.cos(mid)>.2?'start':Math.cos(mid)<-.2?'end':'middle'}" font-family="${FAM.num}" font-size="56" fill="#f3e3b0">${Math.round(100*s.value/sum)}%</text></g>`;}}
   const ce=p.center??(cur?{value:`${Math.round(100*P[cur.i].value/sum)}%`,label:P[cur.i].label}:null);
   let h=`<svg class="k-full" width="1920" height="1080" style="overflow:visible">${svg}</svg>`;
   if(ce){const q=cur?appear(t,cur.t,.3,0):appear(t,c.t0+.6,.3,0);h+=bignum({x:CX,y:CY-6,value:ce.value,size:150},{o:q.o})+label({x:CX,y:CY+82,text:ce.label??'',size:34},{o:q.o});}
   const bw=browOf(p.title,p.en);if(bw)h+=brow({x:960,y:CY-R-128,zh:bw.zh,en:bw.en});
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow,rings:p.rings})+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// ranking：一排數從大到小，鏡頭從末尾往上走到第一名
// =====================================================================================
K.scene('ranking',{
 says:'一排數從大到小：鏡頭從末尾往上走到第一名，差距由鏡頭走出來；講到誰誰亮',
 use:'排行榜、"全球前十里有六家是……"、幾家的規模一字排開',
 avoid:'只有兩三家（用 bars 或 versus）',
 need:['rows'],
 help:{rows:"[{name:'英偉達', value:'$5.2萬億', color:'nvidia'}, ...]：從大到小排好",title:'表頭一行眉題',focus:"[{at:'@b05:蘋果', i:1}]：講到第幾名（從 0 開始）",climb:"'@b04:第一'：鏡頭從末尾往上走到第一名的時刻（預設這一鏡一開始就慢慢往上走）"},
 defaults:{tone:'navy'},minDur:2,
 beats:p=>arr(p.focus).length+1,
 make(p,c){
  const R=arr(p.rows),rh=118,gap=24,x0=520,bwMax=1000,y0=170,vals=R.map(r=>num(r.value).n),mx=Math.max(...vals);
  const foc=arr(p.focus).map(f=>({...f,t:c.at(f.at)})).sort((a,b)=>a.t-b.t),last=y0+(R.length-1)*(rh+gap);
  const ct=c.at(p.climb)??c.t0;
  const keys=R.length>5?[{t:c.t0,cam:fit([300,last-3*(rh+gap),1700,last+rh],{max:1.15})},{t:ct+.2,cam:fit([300,y0-90,1700,y0+4*(rh+gap)],{max:1.15}),d:Math.max(1.2,Math.min(3,(c.t1-ct)*.5))}]
   :[{t:c.t0,cam:{...fit([300,y0-110,1700,last+rh],{max:1.1}),s:fit([300,y0-110,1700,last+rh],{max:1.1}).s*.94}},{t:c.t0,cam:fit([300,y0-110,1700,last+rh],{max:1.1}),d:.8}];
  for(const f of foc)keys.push({t:f.t,cam:fit([300,y0+f.i*(rh+gap)-rh*1.5,1700,y0+f.i*(rh+gap)+rh*2.5],{max:1.25}),d:.7});
  const cam=camSeq(keys,.018);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),cur=[...foc].reverse().find(f=>t>=f.t),fk=cur?IO((t-cur.t)/.35):0;
   let h='';const bw=browOf(p.title,p.en);if(bw)h+=brow({x:x0,y:y0-128,zh:bw.zh,en:bw.en,anchor:'l'});
   R.forEach((r,i)=>{const y=y0+i*(rh+gap),cl=K.col(r.color??'steel'),w=Math.max(30,bwMax*vals[i]/mx),dm=cur&&cur.i!==i?lerp(1,.4,fk):1,gk=E((t-c.t0-.1-i*.04)/.6);
    h+=`<div style="position:absolute;left:0;top:${y}px;width:1920px;height:${rh}px;filter:brightness(${f3(dm)}) saturate(${f3(cur&&cur.i!==i?lerp(1,.5,fk):1)})">
     <div style="position:absolute;left:${x0-330}px;top:0;width:90px;height:${rh}px;display:flex;align-items:center;justify-content:center;font:72px ${FAM.num};color:${i===0?'#f3d37a':'#cfd3da'}">${i+1}</div>
     <div style="position:absolute;left:${x0-240}px;top:0;width:220px;height:${rh}px;display:flex;align-items:center;justify-content:flex-end;font:44px ${FAM.han};color:#f4efdc;letter-spacing:.06em;white-space:nowrap">${r.name}</div>
     <div style="position:absolute;left:${x0}px;top:${rh*.18}px;width:${f1(w*gk)}px;height:${rh*.64}px;border-radius:8px;background:linear-gradient(180deg,${mixc(cl,'#fff',.25)},${cl} 55%,${mixc(cl,'#000',.35)});box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.25),0 10px 26px rgba(0,0,0,.45)"></div>
     <div style="position:absolute;left:${f1(x0+w*gk+24)}px;top:0;height:${rh}px;display:flex;align-items:center;font:68px ${FAM.num};color:#f6ebc6;white-space:nowrap;opacity:${f3(C((gk-.7)/.3))}">${K.unitHTML(num(r.value)).replace(/class="u"/g,`style="font:28px ${FAM.han};margin-left:6px;color:#f2e27e"`).replace(/class="c"/g,'style="font-size:.55em;margin-right:2px"')}</div></div>`;});
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// article：新聞 / 報告原文（可能被質疑的數先給出處）：整頁 → 硬切到那一句的特寫 → 熒光筆刷過
// =====================================================================================
// 按寬度折行；keep（要刷黃的那串字）不拆開，整串一起換到下一行
// 標點不放行首：折行時要落到行首的標點，把前一個字（詞）一起帶到下一行
const NOHEAD=/^[，。、：；！？,.:;!?）)」』”’》〉】…—～%]/;
function wrapLines(text,font,maxW,keep){const out=[];let cur=[];
 const parts=keep&&String(text).includes(keep)?String(text).split(keep).flatMap((x,i,a)=>i<a.length-1?[x,keep]:[x]):[String(text)];
 const toks=parts.flatMap(x=>x===keep?[x]:(x.match(/[A-Za-z0-9$€%.,'’\-]+\s*|\s+|./gu)??[]));
 for(const tok of toks){
  if(cur.length&&textW([...cur,tok].join(''),font)>maxW){const carry=[];
   if(NOHEAD.test(tok)&&cur.length>1){carry.unshift(cur.pop());if(/^\s+$/.test(carry[0])&&cur.length>1)carry.unshift(cur.pop());}
   out.push(cur.join('').trimEnd());cur=carry.length?[...carry,tok]:[tok.trimStart()];}
  else cur.push(tok);}
 if(cur.length)out.push(cur.join(''));return out;}
K.scene('article',{
 says:'可能被質疑的數先給出處：原文截圖攤在織物上（略斜、四周壓暗），鏡頭推向那一句，熒光筆從左往右刷過',
 use:'估值、虧損、投資額這類觀眾可能不信的數；"據外媒報道"',
 avoid:'原文要細讀很久（壓成一句再刷）；沒有核實過的數',
 help:{img:'原文截圖（snap_news.mjs 截的，寬一點沒關係）',hl:'[[x,y,w,h],...]：截圖上要刷黃的框。snap_news.mjs 列印的框直接用（它的截圖是 3200 寬、框按 1600 寬的網頁座標，模板會換算）；別的截圖寫圖片畫素；折行就給兩段',
  mock:"{source:'報道', date:'2026-10-02', title:'OpenAI 預計到 2030 年累計燒掉約 2800 億美元', body:['第一段……','第二段……'], mark:'2800 億美元'}：截不到原文時用核實過的文字排一頁（通用樣式，不放任何真實網站的標誌）",
  zoom:"'@b08:兩千七百'：鏡頭開始推向刷黃處的時刻（預設這一鏡過了三成）",still:'true = 只推一次：開頭不收、推到位不再慢推（真人口播片預設這樣寫）',hlAt:'熒光筆刷過的時刻（預設鏡頭快推到位的時候）',
  cssW:'hl 按多寬的網頁座標算（一般不用寫：3200 寬的截圖按 1600，別的按圖片寬）',tilt:'截圖斜幾度（預設 -1.2；0 = 擺正）'},
 defaults:{tone:'navy'},minDur:1.8,
 beats:()=>2,
 check(p,c){if(!p.img&&!p.mock)throw Error(`${c.tag}：article 要 img（原文截圖）或 mock（自己排一頁）`);if(p.img&&!p.hl)c.warn('有截圖沒給 hl：不知道刷哪一句');if(p.mock&&p.mock.mark&&![p.mock.title,...arr(p.mock.body)].some(x=>String(x).includes(p.mock.mark)))throw Error(`${c.tag}：mock.mark「${p.mock.mark}」要原樣出現在 title 或 body 裡`);},
 async prep(p){if(p.img)p._im=await K.loadImg(p.img);},
 make(p,c){
  const PW=p.img?1560:1320,X0=960-PW/2,Y0=70,tilt=p.tilt??-1.2;let page='',PH=0,boxes=[];
  if(p.mock){const m=p.mock,pad=74,iw=PW-2*pad,tf=`700 58px ${FAM.ui}`,bf=`500 31px ${FAM.ui}`;let y=pad+58,els='';
   els+=`<div style="position:absolute;left:${pad}px;top:${pad}px"><span class="src">${m.source??'報道'}</span><span class="dt">${m.date??''}</span></div>`;
   const put=(text,font,size,lh,weight,color)=>{for(const ln of wrapLines(text,font,iw,m.mark)){const i=m.mark?ln.indexOf(m.mark):-1;
    let html=ln;if(m.mark&&i>=0){const bx=pad+textW(ln.slice(0,i),font),bw=textW(m.mark,font);boxes.push([bx,y,bw,lh]);html=ln.slice(0,i)+`<span class="mk"><u data-k></u>${m.mark}</span>`+ln.slice(i+m.mark.length);}
    els+=`<div style="position:absolute;left:${pad}px;top:${f1(y)}px;font:${weight} ${size}px/${lh}px ${FAM.ui};color:${color};white-space:nowrap">${html}</div>`;y+=lh;}};
   put(m.title,tf,58,80,700,'#17191d');y+=26;
   for(const para of arr(m.body)){put(para,bf,31,56,500,'#3b3e45');y+=22;}
   PH=Math.max(900,y+pad);page=els;}
  if(p.img){const iw=p._im.naturalWidth,ih=p._im.naturalHeight,k=PW/(p.cssW??(iw===3200?1600:iw));PH=ih*PW/iw;
   boxes=(Array.isArray(p.hl?.[0])?p.hl:p.hl?[p.hl]:[]).map(([x,y,w,h])=>[x*k,y*k,w*k,h*k]);}
  const zb=boxes.length?K.unionBox(boxes.map(([x,y,w,h])=>[x,y,x+w,y+h])):[PW*.1,PH*.12,PW*.7,PH*.22];
  // 頁面繞自己的中心斜一點：頁面上的點 → 世界座標
  const ang=tilt*Math.PI/180,W2=(u,v)=>{const dx=u-PW/2,dy=v-PH/2;return [X0+PW/2+dx*Math.cos(ang)-dy*Math.sin(ang),Y0+PH/2+dx*Math.sin(ang)+dy*Math.cos(ang)];};
  const [zx,zy]=W2((zb[0]+zb[2])/2,(zb[1]+zb[3])/2),tz=Math.max(c.t0+.3,c.at(p.zoom)??c.t0+c.d*.3),th=c.at(p.hlAt)??tz+.6;
  if(c.t1-(th+.45)<1)c.warn(`刷黃以後只停了 ${Math.max(0,c.t1-th-.45).toFixed(1)} 秒就切走：證據至少停 1 秒（zoom / hlAt 提前，或者 until 往後）`);
  // 機位：先看整頁的上半（兩邊露出織物）→ 推向刷黃的那一句，停下來以後慢慢往裡推
  const sA=Math.min(.92,1680/PW),camA={x:960,y:Y0+480/sA,s:sA},camZ={x:zx,y:zy,s:p.zoomS??Math.max(1.2,Math.min(1.8,1100/(zb[2]-zb[0]+300)))};   // zoomS：推近到幾倍（預設按刷黃那句的寬度算）
  // still:true —— 只推一次（推向刷黃那句），開頭不收、停下來不再慢推（真人口播片裡她的視窗已經在畫面上，證據別再多動）
  const cam=p.still?camSeq([{t:c.t0,cam:camA},{t:tz,cam:camZ,d:1.05}],0):camSeq([{t:c.t0,cam:{...camA,s:camA.s*.96}},{t:c.t0,cam:camA,d:.9},{t:tz,cam:camZ,d:1.05}],.02);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),hk=C((t-th)/.45),zk=IO((t-tz)/1.05);
   let inner=p.img?`<img src="${p.img}" style="position:absolute;left:0;top:0;width:${PW}px;height:${f1(PH)}px">`:page.replace(/<u data-k><\/u>/g,`<u style="transform:scaleX(${f3(hk)})"></u>`);
   if(p.img)for(const [x,y,w,h] of boxes)inner+=`<div style="position:absolute;left:${f1(x-4)}px;top:${f1(y)}px;width:${f1((w+8)*hk)}px;height:${f1(h)}px;background:#ffd84a;mix-blend-mode:multiply"></div>`;
   const pg=`<div class="k-page" style="left:${X0}px;top:${Y0}px;width:${PW}px;height:${f1(PH)}px;transform:rotate(${f3(tilt)}deg)">${inner}</div>`;
   const vig=`<div class="k-full" style="z-index:40;background:radial-gradient(ellipse 70% 66% at 50% 47%,transparent ${f1(lerp(44,32,zk))}%,rgba(4,7,12,${f3(lerp(.62,.78,zk))}) 100%)"></div>`;
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,1,pg,{mb:false})+vig;
  };
 }
});

// =====================================================================================
// frames：兩三樣東西並列，實拍裝進白邊畫框，一樣一樣甩進來；可以把一個畫框推滿屏接下一鏡
// =====================================================================================
K.scene('frames',{
 says:'兩三樣東西並列（晶片和資料中心）：實拍裝進白邊畫框，唸到一樣甩進來一樣，各帶一箇中文標籤',
 use:'一句話裡並列兩三樣有畫面的東西；"錢分兩路"（pin 釘一個數在上面）',
 avoid:'只有一樣（用 footage 全屏）；超過 3 樣（太碎）',
 need:['items'],
 help:{items:"[{img:'assets/img/chip.jpg', label:'晶片', at:'@b05:晶片'}, {clip:'dc', label:'資料中心', at:'@b05:資料中心'}]",pin:"{value:'$7250億', brow:'...'}：畫框上方釘一個數，線分到各個畫框（一個數分成兩路）",
  fill:"{i:0, at:'@b06'}：從這一刻起把第 i 個畫框推滿屏（下一鏡用同一份素材的 footage，寫 settle:true 接上）"},
 defaults:{tone:'navy'},minDur:1.5,
 beats:p=>arr(p.items).length,
 check(p,c){const n=arr(p.items).length;if(n<1||n>3)c.warn(`frames 放 1–3 個畫框，現在 ${n} 個`);},
 make(p,c){
  const I=arr(p.items).map((it,i)=>({...it,i,t:c.at(it.at)??c.t0})),n=I.length,pin=p.pin;
  const L3={1:[[960,520,1120]],2:[[505,560,780],[1415,560,780]],3:[[400,560,540],[960,560,540],[1520,560,540]]}[n]??[[960,520,1120]];
  const fl=p.fill?{...p.fill,t:c.at(p.fill.at)}:null;
  const cam=camSeq([{t:c.t0,cam:{x:960,y:540,s:.96}},{t:c.t0,cam:{x:960,y:540,s:1},d:.8}],.02);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),fk=fl?IO((t-fl.t)/Math.max(.3,Math.min(.6,c.t1-fl.t))):0;
   let h='';
   if(pin&&pin.value!=null){const pv=num(pin.value),t1st=Math.min(...I.map(it=>it.t)),up=t1st<=c.t0+.05?1:IO((t-t1st)/.5),y=lerp(470,150,up),sz=lerp(230,110,up);h+=bignum({x:960,y,value:pv,size:sz},{o:1-fk});if(pin.brow)h+=brow({x:960,y:y-sz*.42-lerp(86,52,up),zh:pin.brow,size:lerp(30,24,up)},{o:1-fk});}
   const es=[];
   for(const it of I){if(t<it.t)continue;const [x,y,w]=L3[it.i],hh=w*9/16,src=clipOrImg(it,t,it.t);
    const wi=it.t<=c.t0+.05?{k:1,html:null}:null,dir=x<960?-1:x>960?1:(it.i%2?1:-1),m=it.t<=c.t0+.05?1:E((t-it.t)/.32),mp=it.t<=c.t0+.05?1:E((t-1/30-it.t)/.32),dx=(1-m)*1500*dir,mb=S25.mbF(dx-(1-mp)*1500*dir,0);
    const on=fl&&fl.i===it.i,X=on?lerp(x,960,fk):x,Y=on?lerp(y,540,fk):y,W=on?lerp(w,1930,fk):w,H=on?lerp(hh,1086,fk):hh;
    const fr=frame({x:X,y:Y,w:W,h:H,src,label:fk>.2&&on?null:it.label,bw:on?lerp(6,0,fk):6,r:on?lerp(12,0,fk):12},{o:on?1:1-fk});
    h+=`<div class="k-full" style="transform:translateX(${f1(dx)}px);${mb?`filter:${mb}`:''};z-index:${on?30:20}">${fr}</div>`;
    if(pin&&m>.6)es.push({a:[960,214],b:[x,y-hh/2-90],color:'gold',k:E((t-it.t-.15)/.4),o:1-fk,curve:dir*.12,arrow:false});}
   if(es.length)h=edges(es)+h;
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// desk：幾篇報道（截圖）平鋪在透視桌面上，唸到哪篇鏡頭沿桌面滑到哪篇，唸到才亮
// =====================================================================================
K.scene('desk',{
 says:'幾篇報道（截圖）攤在桌面上（透視）：唸到哪篇鏡頭沿桌面滑過去、那篇亮起來；唸到證據時桌面抬平，推近看刷黃的那一句',
 use:'幾家公司各自的新聞、幾篇報道一起說明一件事（截圖的標題裡寫著公司名和金額，身份自己說清）',
 avoid:'截圖上的字太小、看不出是哪家（換截圖或用 discs）；只有一篇（用 article）',
 need:['items'],
 help:{items:"[{img:'assets/img/news_goog.png', at:'@b02:谷歌', hl:[[x,y,w,h]]}, ...]：2–5 張截圖；hl 是這張上要刷黃的框（座標和 article 一樣：snap_news.mjs 列印的直接用）",
  all:"'@b02:這四家'：抬高機位看全部",read:"{i:1, at:'@b03:兩百億'}：唸到證據時桌面抬平、推近看第 i 張（從 0 數），刷黃它的 hl",
  tilt:'桌面傾角（預設 54°；50–58 之間最像）'},
 defaults:{tone:'navy'},minDur:1.6,
 beats:p=>arr(p.items).length+(p.read?1:0),
 check(p,c){const n=arr(p.items).length;if(n<2||n>5)c.warn(`desk 放 2–5 張截圖，現在 ${n} 張`);if(p.read&&!arr(p.items)[p.read.i])throw Error(`${c.tag}：read.i=${p.read.i} 超出了 items（從 0 數）`);if(p.read&&!arr(p.items)[p.read.i].hl)c.warn('read 的那張沒寫 hl：桌面抬平了，但不知道刷哪一句');},
 async prep(p){for(const it of arr(p.items))it._im=await K.loadImg(it.img);},
 make(p,c){
  const P=1500,CY=560,W=p.docW??1280,tilt=p.tilt??54,n=arr(p.items).length,gx=W*.8;
  const I=arr(p.items).map((it,i)=>{const im=it._im,iw=im.naturalWidth,ih=im.naturalHeight,h=Math.round(Math.max(W*.5,Math.min(W*.7,W*ih/iw))),s=Math.max(W/iw,h/ih),ox=(W-iw*s)/2,ks=K.cssScale(im,it.cssW);
   const hl=(Array.isArray(it.hl?.[0])?it.hl:it.hl?[it.hl]:[]).map(([a,b,w2,h2])=>[ox+a*ks*s,b*ks*s,w2*ks*s,h2*ks*s]);
   return {...it,i,x:(i-(n-1)/2)*gx,y:[0,-60,44,-36,50][i%5],w:W,h,rot:[-3.5,2.8,-1.6,2.2,-2.8][i%5],hl,t:c.at(it.at)};});
  // 張 d 上的點（從左上角量的 u,v）→ 桌面座標（每張略斜）
  const onDesk=(d,u,v)=>{const a=d.rot*Math.PI/180,dx=u-d.w/2,dy=v-d.h/2;return [d.x+dx*Math.cos(a)-dy*Math.sin(a),d.y+dx*Math.sin(a)+dy*Math.cos(a)];};
  const zoomZ=s=>P*(1-1/s);   // 看著的那一點放大 s 倍要推多近
  const ta=c.at(p.all),rd=p.read?{...p.read,t:c.at(p.read.at)}:null;
  if(rd&&c.t1-(rd.t+1.05)<1)c.warn(`read 刷黃以後只停了 ${Math.max(0,c.t1-rd.t-1.05).toFixed(1)} 秒就切走：證據至少停 1 秒`);
  // 機位 {fx,fy 看著桌面上哪一點, rx 桌面傾角, dz 推近}：開場略高略遠 → 唸到哪張滑到哪張 → all 抬高看全 → read 抬平推近看刷黃
  const kk=[{t:c.t0,cam:{fx:I[0].x+gx*.35,fy:-40,rx:tilt+4,dz:zoomZ(.74)},d:0}];
  for(const it of I)if(it.t!=null)kk.push({t:it.t,cam:{fx:it.x,fy:it.y-40,rx:tilt,dz:zoomZ(1)},d:.5});
  if(ta!=null)kk.push({t:ta,cam:{fx:0,fy:-30,rx:tilt-8,dz:zoomZ(Math.min(.82,2600/((n-1)*gx+W)))},d:.85});
  if(rd){const d=I[rd.i],bx=d.hl.length?K.unionBox(d.hl.map(([a,b,w2,h2])=>[a,b,a+w2,b+h2])):[d.w*.1,d.h*.1,d.w*.9,d.h*.3],[hx,hy]=onDesk(d,(bx[0]+bx[2])/2,(bx[1]+bx[3])/2);
   kk.push({t:rd.t,cam:{fx:hx,fy:hy,rx:12,dz:zoomZ(Math.max(1.1,Math.min(1.6,1200/(bx[2]-bx[0]+340))))},d:.8});}
  const ks=[kk[0],...kk.slice(1).sort((a,b)=>a.t-b.t)];
  const cam=t=>{let k=ks[0].cam;for(let i=1;i<ks.length;i++){const a=ks[i];if(t<a.t)break;const u=IO((t-a.t)/a.d),pr=k;k={};for(const q in a.cam)k[q]=lerp(pr[q],a.cam[q],u);}return {...k,dz:k.dz+(t-c.t0)*28};};
  return t=>{
   const cm=cam(t),cur=I.filter(it=>it.t!=null&&t>=it.t).sort((a,b)=>a.t-b.t).pop(),all=ta!=null&&t>=ta,rk=rd?IO((t-rd.t)/.8):0,hk=rd?C((t-rd.t-.6)/.45):0;
   let docs='';
   for(const it of I){const lit=all||(cur?cur.i===it.i:it.i===0),on=rd&&rd.i===it.i;let b=lit?1:.5;if(rd)b=lerp(b,on?1:.36,rk);
    let hl='';if(on&&hk>0)for(const [x,y,w,h] of it.hl)hl+=`<div style="position:absolute;left:${f1(x-4)}px;top:${f1(y)}px;width:${f1((w+8)*hk)}px;height:${f1(h)}px;background:#ffd84a;mix-blend-mode:multiply"></div>`;
    docs+=`<div style="position:absolute;left:${f1(it.x-it.w/2)}px;top:${f1(it.y-it.h/2)}px;width:${it.w}px;height:${it.h}px;transform:rotate(${it.rot}deg);background:#fff;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.6);filter:brightness(${f3(b)})"><img src="${it.img}" style="position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:50% 0">${hl}</div>`;}
   const plane=`<div class="k-full" style="perspective:${P}px;perspective-origin:960px ${CY}px;z-index:20"><div style="position:absolute;left:960px;top:${CY}px;width:0;height:0;transform-style:preserve-3d;transform:translateZ(${f1(cm.dz)}px) rotateX(${f3(cm.rx)}deg) translate(${f1(-cm.fx)}px,${f1(-cm.fy)}px)">${docs}</div></div>`;
   const vig=`<div class="k-full" style="z-index:30;background:radial-gradient(ellipse 76% 72% at 50% ${f1(lerp(40,47,rk))}%,transparent 42%,rgba(4,7,12,.7) 100%)"></div>`;
   const cc={x:960,y:540,s:1+.01*(t-c.t0)};
   return c.bg(t,cc,cc,{tone:p.tone,glow:p.glow})+plane+vig;
  };
 }
});

// =====================================================================================
// flash：開頭鉤子"全網都在說"：一個關鍵詞釘在正中，周圍的出處每 5 幀換一張
// =====================================================================================
const hash=(i,s=1)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
K.scene('flash',{
 says:'開頭鉤子：一個關鍵詞釘在螢幕正中，周圍的出處每 5 幀換一張——"全網都在說"',
 use:'話題本身夠熱、大家都在討論；墊在第一句話下面',
 avoid:'話題不熱（編不出真的出處）；關鍵詞超過 4 個字',
 need:['keyword','items'],
 help:{keyword:'2–4 個字（影片自己的詞）',items:"[{cat:'資訊 · 2026-10-01', left:'大模型', right:'競賽：算力', sum:'一行灰色摘要'}, ...]：每條是 左半句 + 關鍵詞 + 右半句，至少 8 條；內容要來自核實過的報道或開放式問題，不編資料、不模擬實網站",every:'幾幀換一張（預設 5）'},
 minDur:1,
 check(p,c){if(String(p.keyword).length>4)c.warn('關鍵詞超過 4 個字');if(arr(p.items).length<8)c.warn('items 少於 8 條：閃不出"很多"');},
 make(p,c){
  const I=arr(p.items),kw=p.keyword,ks=130,kw2=textW(kw,`700 ${ks}px ${FAM.ui}`),ev=(p.every??5)/30;
  return t=>{
   const i=Math.floor(Math.max(0,t-c.t0)/ev),it=I[i%I.length],j=hash(i,3),br=.9+hash(i,7)*.16;
   const pg=(bl)=>`<div class="k-snip" style="${bl?`filter:blur(10px)`:''}">
    <div class="cat" style="left:${f1(560+j*220)}px;top:${f1(330+hash(i,5)*30)}px">${it.cat??''}</div>
    <div class="ttl" style="right:${f1(960+kw2/2+6)}px;text-align:right">${it.left??''}</div>
    <div class="ttl kw" style="left:${f1(960-kw2/2)}px">${kw}</div>
    <div class="ttl" style="left:${f1(960+kw2/2+6)}px">${it.right??''}</div>
    <div class="sum" style="left:${f1(520+j*160)}px;top:640px">${it.sum??''}</div>
    <div class="sum" style="left:${f1(560+hash(i,9)*200)}px;top:700px;opacity:.7">${it.sum2??''}</div></div>`;
   return `<div class="k-full" style="filter:brightness(${f3(br)})">${pg(true)}<div class="k-full" style="-webkit-mask-image:radial-gradient(ellipse 34% 26% at 50% 50%,#000 55%,transparent 100%);mask-image:radial-gradient(ellipse 34% 26% at 50% 50%,#000 55%,transparent 100%)">${pg(false)}</div></div>
    <div class="k-full" style="background:repeating-linear-gradient(0deg,rgba(0,0,0,.07) 0 2px,transparent 2px 4px)"></div>
    <div class="k-full" style="background:radial-gradient(ellipse 70% 62% at 50% 50%,transparent 45%,rgba(0,0,0,.72) 100%)"></div>`;
  };
 }
});

// =====================================================================================
// popup：證據小卡 / 反應窗：上一鏡凍住壓暗，從相關的地方撐開一個視窗，看完縮回去
// =====================================================================================
K.scene('popup',{
 says:'從上一鏡裡拎出一份證據或一句原聲：上一鏡凍住壓暗，從相關的地方撐開一個視窗，看完縮回去',
 use:'"英偉達投錢給 OpenAI"彈出那條新聞的實拍；原聲反應梗',
 avoid:'證據要細讀很久（給全屏 footage / article）；第一鏡（沒有上一鏡可凍）',
 help:{img:'視窗裡的圖',clip:'視窗裡的實拍（幀序列名）',from:'[x,y,w,h] 從哪裡撐開（圓盤、箭頭在螢幕上的位置；預設畫面中間一個小框）',to:'[x,y,w,h] 視窗（預設 1120×630，居中偏上）',back:"'@b12'：開始縮回的時刻（預設這一鏡結束前 0.3 秒）"},
 minDur:1.2,
 check(p,c){if(!p.img&&!p.clip)throw Error(`${c.tag}：popup 要 img 或 clip`);if(!c.prev)c.warn('popup 是第一鏡：沒有上一鏡可凍，只能放在舞臺上');},
 make(p,c){
  const to=p.to??[400,130,1120,630],from=p.from??[860,440,200,112],back=c.at(p.back)??c.t1-.3;
  return t=>{
   const under=c.prev?tt=>c.prev(c.t0-.01):tt=>c.bg(tt,{x:960,y:540,s:1},null,{tone:'navy'});
   return MV.popWindow(t,{t0:c.t0,t1:back,from,to,html:`<img src="${clipOrImg(p,t,c.t0)}" style="width:100%;height:100%;object-fit:cover">`,under,dim:.4,blur:4,why:p.says});
  };
 }
});

// =====================================================================================
// cards3d：一組並列的東西擺成 3D 臺階，鏡頭斜著慢推；講到重點時其餘飛走、主角轉正
// =====================================================================================
K.scene('cards3d',{
 says:'一組並列的東西（幾個國家、幾家機構）平鋪成一排排卡片；講到重點時拎出一張放大前移，其餘壓暗，上面壓一句大字',
 use:'"這些國家都……，但這一筆……"：先看一群，再拎出一個',
 avoid:'只有兩三樣（用 discs）；不需要拎出主角（用 discs 一排）',
 need:['cards'],
 help:{cards:"[{title:'美國', color:'navy'}, ...]：4–9 張，平鋪成一排排（每排最多 4 張），不轉 3D",key:'主角的序號（從 0 開始）',keyAt:"'@b20:但是'：拎出主角的時刻（放大前移，其餘壓暗）",text:"{zh:'神聖不可侵犯', at:'@b20:神聖'}：拎出主角後壓在上面的一句大字"},
 defaults:{tone:'navy'},minDur:2,
 beats:p=>(p.keyAt?1:0)+(p.text?1:0),
 check(p,c){const n=arr(p.cards).length;if(n<3)c.warn(`只有 ${n} 張卡片：兩三樣用 discs`);if(n>9)c.warn(`${n} 張卡片太多：挑 9 張以內`);},
 make(p,c){
  const Cd=arr(p.cards),n=Cd.length,per=n<=4?n:n<=6?3:4,rows=Math.ceil(n/per),cw=320,chh=180,gx=cw+40,gy=chh+40,key=Math.min(n-1,p.key??0),kt=c.at(p.keyAt);
  const txt=p.text?{...p.text,t:c.at(p.text.at)??(kt??c.t0)+.5}:null,CY=500,KS=1.6,KY=txt?610:530;
  const pos=Cd.map((_,i)=>{const r=Math.floor(i/per),k=i%per,row=Math.min(per,n-r*per);return {x:960+(k-(row-1)/2)*gx,y:CY+(r-(rows-1)/2)*gy};});
  const all=[960-per*gx/2,CY-rows*gy/2,960+per*gx/2,CY+rows*gy/2],f0=fit(all,{max:1.2,pad:90});
  const keys=[{t:c.t0,cam:{...f0,s:f0.s*.95}},{t:c.t0,cam:f0,d:.9}];
  if(kt!=null)keys.push({t:kt,cam:fit([960-cw*KS/2-170,txt?190:KY-chh*KS/2-60,960+cw*KS/2+170,KY+chh*KS/2+50],{max:1.2,pad:50}),d:.8});
  const cam=camSeq(keys,.022);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),kk=kt!=null?IO((t-kt)/.6):0;
   let h='',top='';
   Cd.forEach((cd,i)=>{const q=pos[i],on=i===key;
    const st=on?{sc:lerp(1,KS,kk)}:{br:lerp(1,.34,kk),sat:lerp(1,.5,kk),blur:kk*1.6,sc:lerp(1,.96,kk)};
    const html=card({x:on?lerp(q.x,960,kk):q.x,y:on?lerp(q.y,KY,kk):q.y,w:cw,h:chh,color:cd.color??'navy',title:cd.title,en:cd.en,flag:cd.flag,value:cd.value,img:cd.img},st);
    if(on)top=html;else h+=html;});   // 拎出主角時其餘的退到遠一層
   if(txt&&t>=txt.t){const q=appear(t,txt.t,.3,0);top+=`<div class="k-title" style="top:262px;font-size:132px;transform:translate(-50%,-50%) scale(${f3(lerp(1.04,1,E(q.k)))});opacity:${f3(q.o)}"><b style="background:linear-gradient(180deg,#fff4d2,#f6dc8e 55%,#dcb058);-webkit-background-clip:text;background-clip:text">${txt.zh}</b></div>`;}
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,lerp(1,.86,kk),h)+L(cc,cp,1,top);
  };
 }
});

// =====================================================================================
// custom：沒有合適的模板時手寫這一鏡
// =====================================================================================
K.scene('custom',{
 says:'沒有合適的模板時手寫這一鏡（仍然要寫 says；鏡頭和層次照 references/motion.md）',
 use:'模板都對不上這句話的意思',avoid:'只是想換個花樣（先找最對得上的模板）',
 need:['render'],
 help:{render:'(t, c) => 這一幀的 HTML。c 裡有 t0、t1、at(\'@b05:詞\')、bg(t,機位,上一幀機位,{tone})、prev（上一鏡）；工具在 S25（camPath、L、mega…）、MV（手法庫）、KIT（disc、card、bignum…）'},
 make(p,c){return t=>p.render(t,c);}
});

// =====================================================================================
// equation：算一筆賬（幾個數和運算子一項項出來，結果用金色）
// =====================================================================================
const OPS={'+':'+','-':'−','−':'−','x':'×','*':'×','×':'×','/':'÷','÷':'÷','=':'=','≈':'≈'};
K.scene('equation',{
 says:'算一筆賬：幾個數和運算子一項項出來，最後的結果用金色、下面畫一道線',
 use:'"一年七千二百五十億，攤到每天就是二十億"這種換算；"三家加起來"',
 avoid:'超過 5 項（拆成兩步算）；結果不是這句話的落點',
 need:['terms'],
 help:{terms:"[{value:'$7250億', label:'一年', at:'@b02:一年'}, {op:'÷'}, {value:'365', label:'天'}, {op:'='}, {value:'$20億', label:'每天', at:'@b02:二十億'}]：最後一個數是結果（金色）；op 可以是 + − × ÷ = ≈；運算子跟著它後面那一項一起出來",brow:'上面一行眉題'},
 defaults:{tone:'navy'},minDur:1.6,flat:true,
 beats:p=>arr(p.terms).filter(x=>x.at).length,
 make(p,c){
  const T=arr(p.terms),lastV=T.map((x,i)=>x.op?-1:i).filter(i=>i>=0).pop();
  let size=p.size??200;const w=x=>x.op?size*.62:textW(numText(num(x.value)),`${size*(x===T[lastV]?1.15:1)}px ${FAM.num}`)+size*.12;
  let tot=T.reduce((a,x)=>a+w(x),0);if(tot>1600){size=Math.floor(size*1600/tot);tot=T.reduce((a,x)=>a+w(x),0);}
  let x=960-tot/2;const P=T.map(it=>{const ww=w(it),o={...it,cx:x+ww/2,w:ww};x+=ww;return o;});
  // 每一項什麼時候出來：自己寫了 at 就用；運算子跟著下一項；都沒寫就一開場在
  let nextT=c.t0;for(let i=P.length-1;i>=0;i--){if(P[i].at!=null){P[i].t=c.at(P[i].at);nextT=P[i].t;}else P[i].t=P[i].op?nextT:null;}
  let prevT=c.t0;P.forEach(q=>{if(q.t==null)q.t=prevT;prevT=q.t;});
  const R=P[lastV],Y=480,bw=browOf(p.brow,p.en),by=Y-size*.5-104;
  if(P.every(q=>q.t>c.t0+.3))c.warn('第一幀只有眉題：第一項不寫 at（一開場就在），後面的項唸到再出來');
  // 機位：先框住已經出來的幾項，每出來一項鏡頭往外讓一點去找它（東西在原地出現，鏡頭去找）
  const boxOf=q=>[q.cx-q.w/2,Y-size*.62,q.cx+q.w/2,Y+size*.62+(q.label?56:0)];
  const camFor=tt=>{const b=unionBox(P.filter(q=>q.t<=tt+1e-3).map(boxOf));if(bw)b[1]=Math.min(b[1],by-10);return fit(b,{max:1.3,pad:120});};
  const c0=camFor(c.t0),keys=[{t:c.t0,cam:{...c0,s:c0.s*.95}},{t:c.t0,cam:c0,d:.8}];
  for(const tt of [...new Set(P.map(q=>q.t))].filter(tt=>tt>c.t0+.05).sort((a,b)=>a-b))keys.push({t:tt-.12,cam:camFor(tt),d:.7});
  const cam=camSeq(keys,.022);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30);let h='';
   for(const q of P){if(t<q.t-.001)continue;const a=q.t<=c.t0+.01?{o:1,dy:0}:appear(t,q.t,.25,14);
    if(q.op)h+=`<div style="position:absolute;left:${f1(q.cx)}px;top:${Y}px;transform:translate(-50%,-50%) translateY(${f1(a.dy)}px);font:${f1(size*.7)}px ${FAM.en};font-weight:300;color:#d9dde4;opacity:${f3(a.o)}">${OPS[q.op]??q.op}</div>`;
    else{const isR=q===R;h+=bignum({x:q.cx,y:Y,value:q.value,size:isR?size*1.15:size,color:isR?'gold':'white'},{o:a.o,dy:a.dy});
     if(q.label)h+=label({x:q.cx,y:Y+size*.62+20,text:q.label,size:Math.max(30,size*.22)},{o:a.o});
     if(isR&&t>=q.t+.15){const k=E((t-q.t-.15)/.45);h+=`<div style="position:absolute;left:${f1(q.cx-q.w*.42)}px;top:${f1(Y+size*.5)}px;width:${f1(q.w*.84*k)}px;height:5px;border-radius:3px;background:linear-gradient(90deg,#f7e3a0,#e2bf5e);box-shadow:0 0 14px #e8c96a"></div>`;}}}
   const hb=bw?brow({x:P[0].cx-P[0].w/2+size*.05,y:by,zh:bw.zh,en:bw.en,anchor:'l'},{o:appear(t,c.t0,.3,0).o}):'';
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+(hb?L(cc,cp,.9,hb):'')+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// change：一個數從多少變成多少（舊的灰、箭頭畫過去、新的金色、上面寫倍數）
// =====================================================================================
K.scene('change',{
 says:'一個數從多少變成多少：左邊舊的（灰），箭頭畫過去，右邊新的（金色），箭頭上寫漲了幾倍',
 use:'"從三百億漲到五萬多億"、"一年跌了九成"',
 avoid:'中間還有好幾個階段（用 chart 或 timeline）',
 need:['from','to'],
 help:{from:"{value:'$300億', label:'2020 年'}",to:"{value:'$5.2萬億', label:'2026 年', at:'@b04:五萬'}：新數出來的時刻",mult:"'×17'：箭頭上的倍數（可省）",color:"新數的顏色：'gold'（漲，預設）/'red'（跌）"},
 defaults:{tone:'navy'},minDur:1.6,flat:true,
 beats:()=>1,
 make(p,c){
  const A=num(p.from.value),B=num(p.to.value),ta=c.at(p.to.at)??c.t0+Math.min(1,c.d*.35);
  const sA=fitPx(numText(A),'num',p.size??190,600),sB=fitPx(numText(B),'num',Math.round((p.size??190)*1.32),800);
  const wA=textW(numText(A),`${sA}px ${FAM.num}`),wB=textW(numText(B),`${sB}px ${FAM.num}`),gap=280,tot=wA+gap+wB,xA=960-tot/2+wA/2,xB=960+tot/2-wB/2,ax0=xA+wA/2+50,ax1=xB-wB/2-50,Y=500;
  const bw=browOf(p.brow,p.en),bx=xA-wA/2+sA*.04,by=Y-sB*.5-100;
  // 機位：先只看舊的數（和眉題），新數出來之前鏡頭往右讓開、拉到看全
  const fa=fit([xA-wA/2,bw?by-10:Y-sA*.62,Math.max(xA+wA/2,bw?bx+K.vw(bw.zh)*54:0),Y+sA*.62+56],{max:1.3,pad:130}),fb=fit([xA-wA/2,bw?by-10:Y-sB*.62,xB+wB/2,Y+sB*.62+60],{max:1.15,pad:110});
  const cam=camSeq([{t:c.t0,cam:{...fa,s:fa.s*.95}},{t:c.t0,cam:fa,d:.8},{t:Math.max(c.t0+.05,ta-.2),cam:fb,d:.9}],.022);
  const cl=p.color==='red'?'red':'gold';
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),k=E((t-ta)/.5),q=appear(t,ta+.15,.3,16);
   let h=bignum({x:xA,y:Y,value:A,size:sA,color:'white'},{br:lerp(1,.6,k)})+(p.from.label?label({x:xA,y:Y+sA*.6+16,text:p.from.label,size:36},{o:lerp(1,.6,k)}):'');
   if(k>0)h+=`<svg class="k-full" width="1920" height="1080" style="overflow:visible"><line x1="${f1(ax0)}" y1="${Y}" x2="${f1(ax0+(ax1-ax0)*k)}" y2="${Y}" stroke="#e9d9a6" stroke-width="6" stroke-linecap="round" style="filter:drop-shadow(0 0 8px #e9d9a688)"/>${k>.9?`<path d="M${f1(ax1-26)} ${Y-18} L${f1(ax1+4)} ${Y} L${f1(ax1-26)} ${Y+18}" fill="none" stroke="#e9d9a6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`:''}</svg>`;
   if(p.mult&&k>.6)h+=pill({x:(ax0+ax1)/2,y:Y-66,value:p.mult,size:50,kind:cl==='red'?'red':'gold'},{o:C((k-.6)/.3)});
   if(t>=ta+.15)h+=bignum({x:xB,y:Y,value:B,size:sB,color:cl},{o:q.o,dy:q.dy})+(p.to.label?label({x:xB,y:Y+sB*.58+18,text:p.to.label,size:40},{o:q.o}):'');
   const hb=bw?brow({x:bx,y:by,zh:bw.zh,en:bw.en,anchor:'l'},{o:appear(t,c.t0,.3,0).o}):'';
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+(hb?L(cc,cp,.9,hb):'')+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// quote：當事人的原話（照片圓盤 + 一句中文原話，關鍵幾個字刷金，下面英文原文和出處）
// =====================================================================================
function hlLines(lines,font,hl,X,Y,lh,k,color,hlColor){let h='';
 lines.forEach((ln,i)=>{const y=Y+i*lh,j=hl?ln.indexOf(hl):-1;
  if(j<0){h+=`<div style="position:absolute;left:${f1(X)}px;top:${f1(y)}px;font:${font};color:${color};white-space:nowrap">${ln}</div>`;return;}
  const bx=textW(ln.slice(0,j),font),bw=textW(hl,font);
  h+=`<div style="position:absolute;left:${f1(X+bx-4)}px;top:${f1(y+lh*.62)}px;width:${f1((bw+8)*k)}px;height:${f1(lh*.2)}px;background:${alpha(hlColor,.55)};border-radius:4px"></div>`;
  h+=`<div style="position:absolute;left:${f1(X)}px;top:${f1(y)}px;font:${font};color:${color};white-space:nowrap">${ln.slice(0,j)}<span style="color:${k>0?hlColor:color}">${hl}</span>${ln.slice(j+hl.length)}</div>`;});
 return h;}
K.quoteLines=hlLines;K.wrapLines=wrapLines;
K.scene('quote',{
 says:'當事人的原話：照片圓盤 + 一句中文原話（關鍵幾個字刷金），下面一行英文原文和出處',
 use:'沒有能用的原聲畫面，但原話本身很有力；"黃仁勳說過一句話"',
 avoid:'有原聲畫面（用 footage 放原聲更真，前面加鋪墊句）；話太長（壓到 30 字以內）',
 need:['text'],
 help:{text:'中文原話（30 字以內最好）',who:"{name:'黃仁勳', title:'英偉達 CEO', photo:'assets/img/jensen.jpg', color:'nvidia'}",orig:'英文原文（可省）',hl:'要刷金的那幾個字（原樣出現在 text 裡）',hlAt:'刷金的時刻（預設這一鏡過了一半）',source:"出處：'2024 年 GTC 演講'"},
 defaults:{tone:'navy'},minDur:2,
 beats:p=>p.hl?1:0,
 check(p,c){if(String(p.text).length>36)c.warn(`原話 ${String(p.text).length} 個字：壓到 30 字以內`);if(p.hl&&!String(p.text).includes(p.hl))throw Error(`${c.tag}：hl「${p.hl}」要原樣出現在 text 裡`);},
 make(p,c){
  const W=p.who??{},n=String(p.text).length,qs=p.size??(n<=12?84:n<=22?74:64),font=`${qs}px ${FAM.han}`,lh=qs*1.42,lines=wrapLines(p.text,font,880,p.hl),X=W.name||W.photo?820:520,Y0=Math.max(220,470-lines.length*lh/2);
  const tH=c.at(p.hlAt)??c.t0+c.d*.5;
  const cam=camSeq([{t:c.t0,cam:{x:930,y:530,s:.96}},{t:c.t0,cam:{x:960,y:520,s:1},d:.9}],.022);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),q=appear(t,c.t0+.1,.3,12),k=E((t-tH)/.4);
   let h='',hd='';
   if(W.photo||W.name)hd+=disc({x:500,y:450,r:200,color:W.color??'steel',photo:W.photo,name:W.photo?null:W.name},{})+(W.photo&&W.name?label({x:500,y:720,text:W.name,size:48},{}):'')+(W.title?`<div style="position:absolute;left:500px;top:${W.photo?780:690}px;transform:translateX(-50%);font:30px ${FAM.han};color:#bfc4cc;letter-spacing:.1em;white-space:nowrap">${W.title}</div>`:'');
   h+=`<div style="position:absolute;left:${X-30}px;top:${f1(Y0-150)}px;font:260px ${FAM.han};color:#e8cf86;opacity:${f3(.5*q.o)};line-height:1">“</div>`;
   h+=`<div style="position:absolute;inset:0;opacity:${f3(q.o)};transform:translateY(${f1(q.dy)}px)">${hlLines(lines,font,p.hl,X,Y0,lh,k,'#f4efdc','#f0cf6a')}</div>`;
   let y=Y0+lines.length*lh+18;
   if(p.orig){h+=`<div style="position:absolute;left:${X}px;top:${f1(y)}px;width:900px;font:italic 500 28px/1.5 ${FAM.en};color:rgba(255,255,255,.58);opacity:${f3(q.o)}">“${p.orig}”</div>`;y+=Math.ceil(textW(p.orig,`italic 500 28px ${FAM.en}`)/900)*42+20;}
   if(p.source)h+=`<div style="position:absolute;left:${X}px;top:${f1(y)}px;font:28px ${FAM.han};color:#9aa0a8;letter-spacing:.08em;opacity:${f3(q.o)}">—— ${p.source}</div>`;
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow,gx:'38%'})+L(cc,cp,.9,hd)+L(cc,cp,1,h);   // 人（照片圓盤）在稍遠一層，原話在前
  };
 }
});

// =====================================================================================
// profile：人物第一次出場（照片或摳像 + 名字 + 身份 + 兩三條要緊的事）
// =====================================================================================
K.scene('profile',{
 says:'人物第一次出場：照片（或摳像）+ 名字 + 身份 + 兩三條要緊的事，一條條冒出來',
 use:'一個關鍵人物第一次出現；之後再出現就縮成圓盤頭像（discs 的 photo）',
 avoid:'這個人只出現一次、不重要（一句話帶過）',
 need:['name'],
 help:{name:'中文名',en:'英文名',title:"身份：'英偉達創始人、CEO'",photo:'照片（放進圓盤）',img:'人像摳圖（透明 PNG，用它就不用 photo）',color:'這個人對應的公司顏色',
  facts:"[{text:'1993 年創立英偉達', at:'@b03:創立'}, ...]：最多 3 條，每條 16 字以內",tag:"{label:'身家', value:'$1500億'}：名字下面一個價籤"},
 defaults:{tone:'navy'},minDur:2,
 beats:p=>arr(p.facts).length,
 async prep(p){if(p.img)await K.measure(p.img);},
 make(p,c){
  const F=arr(p.facts).map((f,i)=>({...(typeof f==='string'?{text:f}:f),i})).map(f=>({...f,t:c.at(f.at)??c.t0+.8+f.i*.6}));
  const X=930,ns=fitPx(p.name,'han',110,820,.06);
  const cam=camSeq([{t:c.t0,cam:{x:930,y:540,s:.95}},{t:c.t0,cam:{x:960,y:520,s:1},d:.9},...(F.length?[{t:F[0].t,cam:{x:1000,y:540,s:1.02},d:.8}]:[])],.022);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),q=appear(t,c.t0+.05,.3,0);
   let h='',far='',hp='';
   if(p.img){if(p.glow)far+=halo(560,420,520,p.glow,.22);hp=person({src:p.img,x:560,top:170,h:p.h??1150},{});}
   else hp=disc({x:560,y:470,r:250,color:p.color??'steel',photo:p.photo,name:p.photo?null:p.name},{});
   h+=`<div style="position:absolute;left:${X}px;top:250px;opacity:${f3(q.o)};white-space:nowrap"><div style="font:${ns}px ${FAM.han};color:#fff;letter-spacing:.06em;text-shadow:0 4px 18px rgba(0,0,0,.6)">${p.name}</div>${p.en?`<div style="font:600 26px ${FAM.en};letter-spacing:.3em;color:rgba(255,255,255,.55);margin-top:14px;text-transform:uppercase">${p.en}</div>`:''}${p.title?`<div style="display:inline-block;margin-top:22px;font:34px ${FAM.han};color:#f1e3b4;letter-spacing:.1em;padding:10px 22px 8px;border:1.5px solid #c9a95a;border-radius:8px;background:rgba(20,20,24,.6)">${p.title}</div>`:''}</div>`;
   if(p.tag)h+=tag({x:X+150,y:p.title?520:440,label:p.tag.label,value:p.tag.value,size:52},{o:q.o,dy:0});
   // 幾條要緊的事一條條冒出來；排不下就擠一點，最後一條不壓進字幕帶（y≥900）
   const tight=p.tag&&F.length>2,gF=tight?84:104,fs=tight?30:34,fy=Math.min(p.tag?620:(p.title?560:470),850-F.length*gF);
   for(const f of F){const a=appear(t,f.t,.28,16);if(a.o<=0)continue;
    h+=`<div class="k-glass" style="left:${X}px;top:${fy+f.i*gF}px;padding:${tight?13:16}px 28px ${tight?11:14}px;opacity:${f3(a.o)};transform:translateY(${f1(a.dy)}px)"><b style="font-size:${fs}px">${f.text}</b></div>`;}
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow,gx:'30%'})+(far?L(cc,cp,.8,far):'')+L(cc,cp,.9,hp)+L(cc,cp,1,h);   // 人在稍遠一層，名字和幾條事在前
  };
 }
});

// =====================================================================================
// statement：一句判斷壓成金句（一兩行大字，關鍵詞刷金）
// =====================================================================================
K.scene('statement',{
 says:'一句判斷壓成金句：一兩行大字，關鍵詞刷金。結尾、或者一段講完收一句',
 use:'結尾的判斷；一大段講完壓一句話（"賣鏟子的，最賺錢"）',
 avoid:'放一段話（只放一兩行、每行 10 字以內）；每段都來一句（一支片兩三次）',
 need:['lines'],
 help:{lines:"['賣鏟子的', '最賺錢']：一兩行",hl:"['最賺錢']：要刷金的詞",at:"['@b20', '@b20:最賺錢']：每一行出來的時刻（不寫就一起出來）",brow:"上面一行小字：'所以'",items:'底下壓暗的實拍（可省）：一段 = 連續放（谷歌那條的結尾：Safari 實拍壓暗退成底 + 金句）；幾段 = 0.6 秒一換',color:"刷金的顏色：'gold'（預設）/'red'"},
 defaults:{tone:'navy'},minDur:1.4,flat:p=>!arr(p.items).length,
 beats:p=>arr(p.at).length,
 check(p,c){for(const l of arr(p.lines))if(K.vw(l)>12)c.warn(`金句一行「${l}」太長：每行 10 字左右`);},
 make(p,c){
  const Ls=arr(p.lines),hl=arr(p.hl),ats=arr(p.at).map(a=>c.at(a)),size=Math.min(...Ls.map(l=>fitPx(l,'han',p.size??150,1600,.06))),lh=size*1.32,Y0=480-(Ls.length-1)*lh/2;
  const items=arr(p.items).map(x=>typeof x==='string'?{img:x}:x),gc=p.color==='red'?'linear-gradient(180deg,#ffd6d0,#ff7b72 55%,#d8443c)':'linear-gradient(180deg,#fff4d2,#f6dc8e 55%,#dcb058)';
  return t=>{
   const k=t-c.t0;let bg;
   if(items.length)bg=`<div class="k-full" style="transform:scale(${f3(1.04+.01*k)})">${underlay(items,k,.6,{br:p.br??.3,sat:.45,bl:2})}</div>`;
   else{const cc={x:960,y:540,s:1+.015*k};bg=c.bg(t,cc,cc,{tone:p.tone,glow:p.glow});}
   let h='';const B=browOf(p.brow);if(B)h+=`<div style="position:absolute;left:960px;top:${f1(Y0-size*.5-90)}px;transform:translateX(-50%);font:40px ${FAM.han};letter-spacing:.4em;color:#cfd3da;opacity:${f3(appear(t,c.t0,.3,0).o)}">${B.zh}</div>`;
   Ls.forEach((ln,i)=>{const ta=ats[i]??ats[0]??c.t0+.05,a=appear(t,ta,.3,14);if(a.o<=0)return;
    let html=ln;for(const w of hl)html=html.split(w).join(`<span style="background:${gc};-webkit-background-clip:text;background-clip:text;color:transparent">${w}</span>`);
    h+=`<div style="position:absolute;left:960px;top:${f1(Y0+i*lh)}px;transform:translate(-50%,-50%) translateY(${f1(a.dy)}px) scale(${f3(1+.012*k)});font:${size}px ${FAM.han};letter-spacing:.06em;color:#fff;white-space:nowrap;opacity:${f3(a.o)};filter:drop-shadow(0 6px 22px rgba(0,0,0,.7))">${html}</div>`;});
   const lt=(ats.at(-1)??c.t0)+.35,lk=E((t-lt)/.5);if(lk>0)h+=`<div style="position:absolute;left:${f1(960-260*lk)}px;top:${f1(Y0+(Ls.length-1)*lh+size*.72)}px;width:${f1(520*lk)}px;height:4px;background:linear-gradient(90deg,transparent,#e8cf86,transparent)"></div>`;
   return bg+`<div class="k-full" style="z-index:30">${h}</div>`;
  };
 }
});

// =====================================================================================
// headlines：一牆新聞標題齊刷刷出來，然後只亮起其中一句、推近、刷黃
// =====================================================================================
const SRC_COL=['#b8282f','#1f5fa8','#2c7a4b','#8a5a14','#5b3d9e','#9a2a5e'];
K.scene('headlines',{
 says:'各家都在說：一條條新聞標題平鋪出來（像攤開的剪報），然後只亮起最關鍵的那一條，鏡頭推近、刷黃',
 use:'開頭鉤子或轉折：說法很多，但有一句最要緊',
 avoid:'標題編不出真的（要來自核實過的報道，外文的翻成中文）；只有兩三條（用 desk）',
 need:['items'],
 help:{items:"[{src:'資訊', title:'……', date:'10-02'}, ...]：src 寫類別（資訊、評論、問答），不寫真實媒體名；6–12 條，標題 30 字以內（最多折兩行）",pick:"{i:3, at:'@b02:但是'}：亮起第幾條（從 0 開始）",mark:'被亮起那條裡要刷黃的字（原樣出現在它的 title 裡）',every:'標題一條條出來的間隔秒數（預設 0.08；0 = 一起出來）'},
 defaults:{tone:'navy'},minDur:1.6,
 beats:p=>p.pick?1:0,
 check(p,c){const I=arr(p.items),n=I.length;if(n<6)c.warn(`標題只有 ${n} 條：少於 6 條撐不起"各家都在說"`);for(const it of I)if(String(it.title??'').length>30)c.warn(`標題「${it.title}」超過 30 字：壓短，最多折兩行`);
  if(p.pick&&p.mark&&!String(I[p.pick.i]?.title??'').includes(p.mark))throw Error(`${c.tag}：mark「${p.mark}」要原樣出現在第 ${p.pick.i} 條的 title 裡`);},
 make(p,c){
  const I=arr(p.items),n=I.length,cols=n<=5?1:n<=10?2:3,W=cols===1?1160:cols===2?800:560,fs=cols===3?32:38,lh=Math.round(fs*1.36),pad=26,tagH=30,tf=`700 ${fs}px ${FAM.ui}`;
  const LS=I.map((it,i)=>wrapLines(it.title,tf,W-2*pad-8,i===p.pick?.i?p.mark:null).slice(0,2));
  const nl=Math.max(1,...LS.map(l=>l.length)),SH=pad*2+tagH+14+nl*lh,gx=W+34,gy=SH+24,rows=Math.ceil(n/cols);
  const P=I.map((it,i)=>{const col=i%cols,row=Math.floor(i/cols);return {...it,i,x:960+(col-(cols-1)/2)*gx,y:470+(row-(rows-1)/2)*gy,lines:LS[i]};});
  const ev=p.every??.08,pk=p.pick?{...p.pick,t:c.at(p.pick.at)}:null,all=[960-cols*gx/2,470-rows*gy/2,960+cols*gx/2,470+rows*gy/2];
  const f0=fit(all,{max:1.15,pad:60}),keys=[{t:c.t0,cam:{...f0,s:f0.s*1.05}},{t:c.t0,cam:f0,d:1}];
  if(pk){const q=P[pk.i];keys.push({t:pk.t,cam:fit([q.x-W/2,q.y-SH/2,q.x+W/2,q.y+SH/2],{max:1.9,pad:70}),d:.75});}
  const cam=camSeq(keys,.02);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),pkk=pk?IO((t-pk.t)/.5):0,mk=pk?E((t-pk.t-.6)/.45):0;let h='',top='';
   for(const q of P){const a=appear(t,c.t0+q.i*ev,.22,12);if(a.o<=0)continue;const on=pk&&pk.i===q.i;
    const body=q.lines.map(ln=>{let hl='';if(on&&p.mark&&ln.includes(p.mark)){const bx=textW(ln.slice(0,ln.indexOf(p.mark)),tf),bw=textW(p.mark,tf);hl=`<span style="position:absolute;left:${f1(bx-3)}px;top:${f1(lh*.14)}px;width:${f1((bw+6)*mk)}px;height:${f1(lh*.74)}px;background:#ffd84a;mix-blend-mode:multiply"></span>`;}
     return `<div style="position:relative;font:${tf};line-height:${lh}px;color:#17191d;white-space:nowrap">${hl}${ln}</div>`;}).join('');
    const st=on?{o:a.o,dy:a.dy,sc:1+.03*pkk}:{o:a.o,dy:a.dy,br:pk?lerp(1,.36,pkk):1,blur:pk?pkk*1.4:0};
    const html=`<div style="position:absolute;left:${f1(q.x)}px;top:${f1(q.y)}px;width:${W}px;height:${SH}px;padding:${pad}px ${pad+4}px;box-sizing:border-box;background:#fbfaf7;border-radius:8px;box-shadow:0 16px 36px rgba(0,0,0,.5);${K.fx(st)}"><div style="display:flex;align-items:center;gap:14px;height:${tagH}px;margin-bottom:14px"><span style="font:700 20px ${FAM.ui};color:#fff;background:${SRC_COL[Math.floor(K.hashf(q.i,9)*SRC_COL.length)]};padding:3px 12px;border-radius:4px">${q.src??'報道'}</span><span style="font:500 20px ${FAM.ui};color:#8a8e96">${q.date??''}</span></div>${body}</div>`;
    if(on)top=html;else h+=html;}
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,lerp(1,.88,pkk),h)+L(cc,cp,1,top);   // 亮起一條時其餘的退到遠一層
  };
 }
});

// =====================================================================================
// compare：兩邊對比（左右兩欄，一行行比下去，贏的一邊亮）
// =====================================================================================
K.scene('compare',{
 says:'兩邊對比：左右兩欄各一個表頭（公司、國家、時代），一行行比下去，贏的那邊亮、輸的那邊暗',
 use:'"英偉達 vs AMD"、"十年前 vs 現在"，比兩到四項',
 avoid:'超過 4 行（挑最要緊的）；只比一項（用 versus 或 bars）',
 need:['left','right','rows'],
 help:{left:"{title:'英偉達', color:'nvidia'}",right:"{title:'AMD', color:'red'}",rows:"[{label:'市值', left:'$5.2萬億', right:'$3000億', win:'left', at:'@b05:市值'}, ...]：win 寫 'left'/'right'（不寫就不分輸贏）",brow:'表頭上面一行眉題（可省）',size:'數字字號（預設 110）'},
 defaults:{tone:'navy'},minDur:2,
 beats:p=>arr(p.rows).filter(r=>r.at).length,
 check(p,c){if(arr(p.rows).length>4)c.warn(`比了 ${arr(p.rows).length} 行：挑最要緊的 4 行以內`);},
 make(p,c){
  const bw=browOf(p.brow,p.en),HY=bw?250:200,rh=150,Y0=HY+130,XL=600,XR=1320,NS=p.size??110;
  const R=arr(p.rows).map((r,i)=>({...r,i,y:Y0+i*rh+60,t:c.at(r.at)??c.t0+.3+i*.15})),n=R.length;
  const f0=fit([300,HY-(bw?180:80),1620,Y0+(n-1)*rh+130],{max:1.1});
  const cam=camSeq([{t:c.t0,cam:{...f0,s:f0.s*.95}},{t:c.t0,cam:f0,d:.9}],.022);
  const head=(o,x)=>card({x,y:HY,w:560,h:128,color:o.color??'steel',title:o.title,en:o.en,size:54},{});
  return t=>{
   const cc=cam(t),cp=cam(t-1/30);let h=head(p.left,XL)+head(p.right,XR)+`<div style="position:absolute;left:960px;top:${HY}px;transform:translate(-50%,-50%);font:88px ${FAM.num};color:#e8d39a;text-shadow:0 4px 14px rgba(0,0,0,.6)">VS</div>`;
   if(bw)h+=brow({x:960,y:HY-170,zh:bw.zh,en:bw.en},{o:appear(t,c.t0,.3,0).o});
   for(const r of R){const a=appear(t,r.t,.25,12);if(a.o<=0)continue;const y=r.y,wk=r.win?E((t-r.t-.25)/.3):0;
    h+=`<div style="position:absolute;left:300px;top:${f1(y-rh/2+8)}px;width:1320px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);opacity:${f3(a.o)}"></div>`;
    h+=label({x:960,y:y+8,text:r.label,size:40},{o:a.o,dy:a.dy});
    for(const side of ['left','right']){const win=r.win===side,lose=r.win&&!win,v=num(r[side]),x=side==='left'?XL:XR;
     h+=bignum({x,y:y+8,value:v,size:win?lerp(NS,NS*1.14,wk):NS,color:win?'gold':'white'},{o:a.o,dy:a.dy,br:lose?lerp(1,.5,wk):1});
     if(win)h+=mark({x:x+textW(numText(v),`${NS*1.14}px ${FAM.num}`)/2+52,y:y+4,kind:'ok',s:46},{o:wk,sc:lerp(.85,1,wk)});}}
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// stats：幾個數一字排開（2–4 個），唸到哪個哪個亮
// =====================================================================================
K.scene('stats',{
 says:'幾個數一字排開（2–4 個）：每個數上面一行小字說它是什麼，唸到哪個哪個出來',
 use:'"營收、利潤、市值三個數"、四家各自的投入',
 avoid:'要比大小（用 bars，高度一眼可見）；只有一個數（用 number）',
 need:['items'],
 help:{items:"[{label:'營收', value:'$1300億', at:'@b03:營收', color:'nvidia', photo:'assets/img/jensen.jpg'}, ...]：寫了 photo / logo / lt（盤裡一兩個字）就在數上面放一個品牌色小圓盤",brow:'上面一行眉題',light:'true = 唸到哪個只亮哪個，其餘壓暗（預設念過的都亮著）'},
 defaults:{tone:'navy'},minDur:1.6,flat:true,
 beats:p=>arr(p.items).filter(x=>x.at).length,
 make(p,c){
  const I=arr(p.items),n=I.length,cw=Math.min(520,1640/n),x0=960-(n-1)*cw/2,P=I.map((it,i)=>({...it,i,x:x0+i*cw,t:c.at(it.at)??c.t0}));
  const size=Math.min(...P.map(q=>fitPx(numText(num(q.value)),'num',p.size??150,cw-60))),hasLogo=P.some(q=>q.lt||q.logo||q.photo),Y=hasLogo?540:500;
  const cam=camSeq([{t:c.t0,cam:{x:960,y:520,s:.95}},{t:c.t0,cam:{x:960,y:520,s:1},d:.9},...P.filter(q=>q.t>c.t0+.05).map(q=>({t:q.t-.1,cam:{x:960+(q.x-960)*.12,y:520,s:1.03},d:.7}))],.022);
  return t=>{
   // 小字（和小圓盤）一開場就在、先暗著，數唸到才出來：第一幀不空，觀眾先知道要比哪幾樣
   const cc=cam(t),cp=cam(t-1/30),cur=[...P].filter(q=>t>=q.t).pop(),la=appear(t,c.t0,.3,0).o;let h='';
   P.forEach((q,i)=>{const a=q.t<=c.t0+.01?{o:1,dy:0}:appear(t,q.t,.25,14),dm=p.light&&cur&&cur.i!==q.i?.42:1,lb=lerp(.5,1,a.o)*dm;
    if(hasLogo&&(q.lt||q.logo||q.photo))h+=disc({x:q.x,y:Y-size*.5-150,r:56,color:q.color??'steel',lt:q.lt,logo:q.logo,photo:q.photo},{o:la,br:lb});
    h+=label({x:q.x,y:Y-size*.5-40,text:q.label??'',size:40},{o:la,br:lb});
    if(a.o>0)h+=bignum({x:q.x,y:Y+10,value:q.value,size,color:p.color??'gold'},{o:a.o,dy:a.dy,br:dm});
    if(i>0)h+=`<div style="position:absolute;left:${f1(q.x-cw/2)}px;top:${f1(Y-size*.75)}px;width:1.5px;height:${f1(size*1.4)}px;background:linear-gradient(180deg,transparent,rgba(232,207,134,.35),transparent);opacity:${f3(la)}"></div>`;});
   const bw=browOf(p.brow,p.en),hb=bw?brow({x:960,y:hasLogo?140:200,zh:bw.zh,en:bw.en}):'';
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+(hb?L(cc,cp,.9,hb):'')+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// agenda：目錄 / 章節進度（長片用）
// =====================================================================================
K.scene('agenda',{
 says:'目錄 / 章節進度：幾個章節排成一列，現在講到的那一章亮起來（"一口氣了解"這種長片）',
 use:'長片開頭列目錄；每一章開頭回到目錄、亮起這一章',
 avoid:'一兩分鐘的短片（不用目錄）',
 need:['items'],
 help:{items:"['錢從哪來', '錢去哪了', '誰在賺錢', '能不能賺回來']：3–6 章",cur:'現在講到第幾章（從 0 開始；不寫 = 列目錄，按 at 一章章亮過去）',title:"目錄上面一行：'一口氣了解 AI 燒錢'",at:"['@b01:錢從哪來', ...]：列目錄時每一章亮起的時刻"},
 defaults:{tone:'navy'},minDur:1.5,
 beats:p=>p.cur==null?arr(p.at).length:1,
 make(p,c){
  const I=arr(p.items),n=I.length,rh=Math.min(140,560/n),Y0=520-(n-1)*rh/2,X=600,ats=arr(p.at).map(a=>c.at(a));
  const curAt=t=>p.cur!=null?p.cur:ats.reduce((a,ta,i)=>t>=ta?i:a,-1);
  const cy=p.cur!=null?Y0+p.cur*rh:520;
  const cam=camSeq([{t:c.t0,cam:{x:1000,y:cy+20,s:.94}},{t:c.t0,cam:{x:1000,y:540+(cy-520)*.3,s:1},d:.9}],.022);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30),cu=curAt(t);let h='';
   if(p.title)h+=`<div style="position:absolute;left:${X}px;top:${f1(Y0-rh-90)}px;font:44px ${FAM.han};letter-spacing:.2em;color:#e8dcb5">${p.title}</div><div style="position:absolute;left:${X}px;top:${f1(Y0-rh-24)}px;width:120px;height:3px;background:#c9a95a"></div>`;
   I.forEach((it,i)=>{const on=i===cu,ta=p.cur!=null?c.t0:(ats[i]??c.t0),k=on?IO((t-ta)/.35):0,y=Y0+i*rh,b=cu<0?.85:on?1:.42;
    h+=`<div style="position:absolute;left:${X}px;top:${f1(y)}px;transform:translateY(-50%) scale(${f3(1+.06*k)});transform-origin:0 50%;display:flex;align-items:baseline;gap:34px;white-space:nowrap;filter:brightness(${f3(lerp(b,1,k))})">
     <span style="font:${f1(rh*.82)}px ${FAM.num};color:${on?'#f0d589':'#aeb4bd'}">${String(i+1).padStart(2,'0')}</span><span style="font:${f1(rh*.5)}px ${FAM.han};color:#f4efdc;letter-spacing:.08em">${it}</span></div>`;
    if(on)h+=`<div style="position:absolute;left:${X-46}px;top:${f1(y-rh*.32)}px;width:8px;height:${f1(rh*.64*k)}px;background:linear-gradient(180deg,#f7e3a0,#c9a24a);border-radius:4px;box-shadow:0 0 16px #e8c96a"></div>`;});
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,1,h);
  };
 }
});

// =====================================================================================
// device：產品介面裝進手機 / 電腦外框，鏡頭推近到要看的那一塊，框出來
// =====================================================================================
K.scene('device',{
 says:'產品介面：截圖裝進正面擺著的手機（或電腦）外框，鏡頭推近到要看的那一塊，框出來，旁邊寫一個短標籤',
 use:'講一個 App / 網站 / AI 產品的介面',
 avoid:'截圖上沒有要看的東西（用 footage 放錄屏）',
 need:['img'],
 help:{img:'介面截圖（手機直式 / 電腦橫式）',kind:"'phone'（預設）/'laptop'",hl:'[x,y,w,h]：截圖上要框出來的那一塊（截影象素；snap_news.mjs 截的 3200 寬網頁圖按 1600 寬的網頁座標，或者寫 cssW；截圖比例和螢幕不一樣時按鋪滿螢幕、頂對齊換算）',zoom:"'@b05:這裡'：推近到 hl 的時刻（預設這一鏡過了四成）",label:'短標籤：手機寫在右邊、電腦寫在框上方，鏡頭推近時一起框進來'},
 defaults:{tone:'navy'},minDur:1.6,
 beats:p=>p.hl?1:0,
 check(p,c){if(p.label&&!p.hl)c.warn('寫了 label 沒寫 hl：標籤要跟著框出來的那一塊');},
 async prep(p){p._im=await K.loadImg(p.img);},
 make(p,c){
  const ph=(p.kind??'phone')==='phone',iw=p._im.naturalWidth,ih=p._im.naturalHeight;
  // 螢幕：手機 760 高（19.5:9），中心 y=480；電腦 690 高（16:10）。截圖按鋪滿螢幕、頂對齊（cover）放，hl 也按這個換算
  const SH=ph?760:690,SW=ph?Math.round(SH*9/19.5):Math.round(SH*16/10),CY=ph?480:445,SX=960-SW/2,SY=CY-SH/2,bz=ph?16:20;
  const s=Math.max(SW/iw,SH/ih),ox=(SW-iw*s)/2,ks=K.cssScale(p._im,p.cssW);
  const hb=p.hl?[SX+ox+p.hl[0]*ks*s,SY+p.hl[1]*ks*s,SX+ox+(p.hl[0]+p.hl[2])*ks*s,SY+(p.hl[1]+p.hl[3])*ks*s].map(v=>Math.round(v)):null;
  const lw=p.label?textW(p.label,`36px ${FAM.han}`)+40:0;
  const lab=hb&&p.label?(ph?{x:SX+SW+bz+52,y:(hb[1]+hb[3])/2,l:true}:{x:(hb[0]+hb[2])/2,y:hb[1]-48,l:false}):null;
  const lbox=lab?(lab.l?[lab.x-10,lab.y-32,lab.x+lw,lab.y+32]:[lab.x-lw/2,lab.y-32,lab.x+lw/2,lab.y+32]):null;
  const tz=hb?(c.at(p.zoom)??c.t0+c.d*.4):null;
  const f0=fit([SX-bz,SY-bz,SX+SW+bz,SY+SH+bz+(ph?0:26)],{max:1.15,pad:60}),keys=[{t:c.t0,cam:{...f0,s:f0.s*.95}},{t:c.t0,cam:f0,d:.9}];
  if(hb)keys.push({t:tz,cam:fit(lbox?unionBox([hb,lbox]):hb,{max:2,pad:80}),d:.85});
  const cam=camSeq(keys,.02);
  const scr=`<img src="${p.img}" style="position:absolute;left:${f1(ox)}px;top:0;width:${f1(iw*s)}px;height:${f1(ih*s)}px">`;
  const body=`<div style="position:absolute;left:${SX-bz}px;top:${SY-bz}px;width:${SW+2*bz}px;height:${SH+2*bz}px;border-radius:${ph?58:20}px;background:linear-gradient(160deg,#30333a,#111216);box-shadow:0 36px 80px rgba(0,0,0,.65),inset 0 0 0 2px rgba(255,255,255,.14)"></div><div style="position:absolute;left:${SX}px;top:${SY}px;width:${SW}px;height:${SH}px;border-radius:${ph?44:4}px;overflow:hidden;background:#000">${scr}</div>`
   +(ph?`<div style="position:absolute;left:${960-52}px;top:${SY+12}px;width:104px;height:28px;border-radius:14px;background:#050506"></div>`:`<div style="position:absolute;left:${SX-110}px;top:${SY+SH+bz}px;width:${SW+220}px;height:24px;border-radius:0 0 16px 16px;background:linear-gradient(180deg,#3a3d44,#16171b)"></div>`);
  return t=>{
   const cc=cam(t),cp=cam(t-1/30);let hl='';
   if(hb&&t>=tz+.45){const g=C((t-tz-.45)/.3);
    hl=`<div style="position:absolute;left:${hb[0]-8}px;top:${hb[1]-8}px;width:${hb[2]-hb[0]+16}px;height:${hb[3]-hb[1]+16}px;border:3px solid #f0cf6a;border-radius:12px;box-shadow:0 0 18px rgba(240,207,106,.4);opacity:${f3(g)}"></div>`;
    if(lab){if(lab.l)hl+=`<div style="position:absolute;left:${hb[2]+10}px;top:${f1(lab.y-1)}px;width:${f1(Math.max(0,lab.x-16-hb[2]-10)*g)}px;height:2px;background:#f0cf6a"></div>`;
     hl+=`<div class="k-label" style="left:${f1(lab.x)}px;top:${f1(lab.y)}px;font-size:36px;${K.fx({o:g},lab.l?'translate(0,-50%)':'translate(-50%,-50%)')}">${p.label}</div>`;}}
   return c.bg(t,cc,cp,{tone:p.tone,glow:p.glow})+L(cc,cp,1,body+hl);
  };
 }
});

// =====================================================================================
// map：示意地圖（點陣世界地圖，只有陸地、不畫國界），按經緯度標點、畫航線，唸到哪裡鏡頭飛到哪裡
// =====================================================================================
K.scene('map',{...boardDoc,
 says:'示意地圖：點陣世界地圖（只有陸地、不畫國界），按經緯度標點、畫航線，唸到哪裡鏡頭飛到哪裡',
 use:'國家、城市之間的事：貿易、石油、錢流向哪、工廠在哪',
 avoid:'要精確的國界（中國平臺發的地圖要合規：用標準地圖服務 bzdt.ch.mnr.gov.cn 的底圖，放進 board 的 under）',
 help:{...boardDoc.help,nodes:"[{id:'us', lon:-98, lat:39, label:'美國', at:'@b03:美國'}, {id:'tw', lon:121, lat:24, label:'臺灣 · 臺積電'}, {id:'me', type:'area', lon:45, lat:26, r:260, label:'中東'}]：pin 是點、area 是一團光（標一個區域）",
  links:"[{from:'tw', to:'us', text:'晶片'}]：航線（預設彎的虛線）"},
 defaults:{type:'pin',layout:'free',mbMax:8,curve:.22,lineColor:'gold',lineStyle:'dash',maxZoom:2.2,pad:170,tone:'navy',glow:false,pre:'hide',atDo:'focus'},
 make:(p,c)=>boardMake({...p,under:{...K.MAP,br:p.mapBr??1,sat:1,...(p.under??{})}},c)});
})();
