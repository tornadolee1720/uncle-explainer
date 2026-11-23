// film_base.js —— 每條片都一樣的底座（不是鏡頭）：讀時間線、按字取時刻、實拍取幀、鏡頭登記、按時刻找鏡頭、字幕、預載入。
// 載入順序：stage25d.js → film_base.js → moves.js → film.js。畫面一律在 film.js 裡按這支片自己現寫。
// 用法（film.js）：
//   window.ready=(async()=>{
//     const F=await FB.init({counts:['assets/clips/counts.json'],cuts:['jensen'],preload:['stage_navy.jpg'],fonts:['60px Shu','60px Num']});
//     const {cue,B,fr,clipSrc,shot}=F;
//     shot(0,B('b02'),t=>`...這一鏡的畫面...`);
//     ...
//     return F.go({frame:h=>`<div style="position:absolute;inset:0">${h}</div>`});   // frame 可選：給整幀統一包一層（調色、顆粒）
//   })();
// 時刻一律寫成 cue(句id,'詞')，不寫死秒數；同一個 t 永遠畫出同一幀。
(()=>{
const C=x=>Math.max(0,Math.min(1,x));
const lat=s=>s.replace(/([A-Za-z0-9][A-Za-z0-9 .,$%-]*[A-Za-z0-9]|[A-Za-z0-9])/g,'<span class="lat">$1</span>');

async function init(o={}){
 const A=o.assets??'assets/';
 const T=await fetch(o.timeline??'timeline.json').then(r=>r.json());
 const stage=document.querySelector(o.stage??'#stage');
 const SW=window.STAGE?.w??1920,SH=window.STAGE?.h??1080;   // 舞臺尺寸：直式片在 index.html 裡寫 window.STAGE={w:1080,h:1920}
 const fit=()=>stage.style.transform=`scale(${Math.min(innerWidth/SW,innerHeight/SH)})`;addEventListener('resize',fit);fit();

 // 時間線：B(句) 開口、BE(句) 說完、cue(句,'詞') 那個字的時刻；INS 原聲插段
 const BT=Object.fromEntries(T.beats.map(b=>[b.id,b]));
 const need=id=>{if(!BT[id])throw Error(`timeline.json 裡沒有句子 ${id}`);return BT[id];};
 const B=id=>need(id).start,BE=id=>need(id).end;
 const cue=(id,s)=>{const b=need(id),i=b.text.indexOf(s);if(i<0)throw Error(`${id} 裡找不到「${s}」`);return b.chars[i][1];};
 const INS=Object.fromEntries((T.inserts||[]).map(i=>[i.id,i]));

 // 實拍幀序列（footage.py extract 寫的 counts.json）；沒登記的片段直接報錯，不出黑屏
 const CL={};
 for(const p of o.counts??[])Object.assign(CL,await fetch(p).then(r=>{if(!r.ok)throw Error('讀不到 '+p);return r.json();}));
 const fr=(n,f)=>{if(!CL[n])throw Error(`實拍 ${n} 沒有登記幀數（counts.json）`);return `${A}clips/${n}/${String(Math.max(1,Math.min(CL[n],Math.round(f)))).padStart(4,'0')}.jpg`;};
 const clipSrc=(n,t,t0,rate=1)=>fr(n,Math.floor(Math.max(0,t-t0)*30*rate)+1);

 // 摳像（matte.py + matte_clean.py 寫的 box.json），之後用 S25.cutP
 if(o.cuts?.length)await S25.loadCuts(o.cuts,A+'cut/');
 await Promise.all((o.preload??[]).map(n=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=A+n;})));
 await Promise.all((o.fonts??[]).map(f=>document.fonts.load(f)));

 // 字幕：一句超過 maxLen 個字就按逗號拆成短語，卡著字的時刻替換；原聲插段用它自己的中文字幕
 const maxLen=o.subMax??20;
 const SUBS=T.beats.map(b=>({start:b.start,end:b.end+.15,text:b.text,id:b.id}));
 for(const i of T.inserts||[])for(const p of i.parts)SUBS.push({start:p.start,end:p.end,text:p.sub,id:null});
 SUBS.sort((a,b)=>a.start-b.start);for(let i=0;i<SUBS.length-1;i++)SUBS[i].end=Math.min(SUBS[i].end,SUBS[i+1].start);
 function subText(s,t){
  if(s.text.length<=maxLen||!s.id)return s.text.replace(/[。]$/,'');
  const parts=s.text.split(/(?<=[，？：])/).filter(Boolean),chunks=[];let cur='';
  for(const p of parts){if((cur+p).length>maxLen&&cur){chunks.push(cur);cur=p}else cur+=p}if(cur)chunks.push(cur);
  const bb=BT[s.id];let idx=0,acc=0;for(let i=0;i<chunks.length;i++){if(t>=bb.chars[acc][1]-.05)idx=i;acc+=chunks[i].length}
  return chunks[idx].replace(/[，。：]$/,'');}
 const subAt=t=>{const s=SUBS.find(x=>t>=x.start&&t<x.end);return s?{text:s.text,html:`<div class="sub">${lat(subText(s,t))}</div>`}:null;};

 // 鏡頭登記：shot(起, 止, t=>這一幀的 HTML)
 const shots=[];const shot=(t0,t1,f)=>{shots.push({t0,t1,f});return f;};

 function go(g={}){
  // 鏡頭之間不能有空檔或重疊（空檔那一段會落到最後一鏡上，畫面跳）
  const ss=[...shots].sort((a,b)=>a.t0-b.t0),eps=1e-3;
  if(!ss.length)console.error('film.js 一個鏡頭都沒有登記');
  else{if(ss[0].t0>eps)console.error(`0–${ss[0].t0.toFixed(2)} 秒沒有鏡頭`);
   for(let i=0;i<ss.length-1;i++){const a=ss[i],b=ss[i+1];
    if(b.t0>a.t1+eps)console.error(`鏡頭之間有空檔：${a.t1.toFixed(2)}–${b.t0.toFixed(2)}`);
    if(b.t0<a.t1-eps)console.error(`鏡頭重疊：${b.t0.toFixed(2)} 開始的鏡頭和上一鏡（到 ${a.t1.toFixed(2)}）疊在一起`);}
   if(ss.at(-1).t1<T.duration-eps)console.error(`最後一鏡在 ${ss.at(-1).t1.toFixed(2)} 結束，片長 ${T.duration}`);}
  const frame=g.frame??(h=>h),defs=g.defs??S25.DEFS;
  window.timeline=T;window.duration=T.duration;
  // dry=true：只算一遍這一幀（render.mjs --moves 用），不寫進頁面、不等圖片
  window.seek=async(t,dry=false)=>{
   t=Math.max(0,Math.min(T.duration-1/300,t));
   const i=shots.findIndex(x=>t>=x.t0&&t<x.t1),k=i<0?shots.length-1:i,s=shots[k];
   FB.cur={shot:k,t};
   let h=s.f(t);const sub=subAt(t);if(sub)h+=sub.html;
   if(dry)return {time:t,shot:k};
   stage.innerHTML=defs+frame(h);
   await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));await document.fonts.ready;
   return {time:t,shot:k,sub:sub?.text??''};
  };
  return window.seek(0);
 }

 const F={T,A,stage,C,B,BE,cue,INS,CL,fr,clipSrc,shot,shots,go,subAt};
 Object.assign(FB,{T,A,fr,clipSrc,CL,shots});
 return F;
}
window.FB={init,cur:{shot:0,t:0}};
})();
