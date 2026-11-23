// 打仗了，黃金為什麼反而跌（28 秒，真人口播）。t = 口播的 t。
// 主線：一個反常（打仗了金價卻跌）→ 那條金價線 → 一個詞（利率）→ 為什麼（鏈條、不生息）→ 還有一個推手（美股）→ 回到開頭那句話。
// v4（2026-11-05，使用者："參考小lin說的節奏就行 不用改特效 而是節奏不對"）：特效全按 v2，只重排她換樣子的時機。
//   五段：她講 0–4.9 / 證據 4.9–17.2（圓窗一直不動，底下換五刀）/ 她講 17.2–20.6 / 證據 20.6–24.2 / 她講 24.2–28.8。
//   她的視窗只在段落門上挪 4 次（v2 是 7 次，最短一段 1.3 秒）。導演表 ../shots_v4.md；v2 鏡頭表 film_v2.js，v3 film_v3.js。
window.ready=(async()=>{
const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS});
const K=await KIT.use(F);
await KIT_HOST.use(K,{faceY:330,fps:30,calm:false})   // 幀目錄是 30fps 抽的；影片按口播原片 24fps 渲染，按時間取幀正好是原片每一幀。calm:false = v2 的縮排、長出、慢漂原樣
const gold=await fetch('assets/data/gold.json').then(r=>r.json());
// 牆上的兩張照片：開頭那句"亂世買黃金"，結尾原樣回來。挨著她的頭髮，頭髮壓在照片前面
const WAR={img:'assets/img/smoke.jpg',label:'亂世',x:440,y:300,w:560,h:376};
const GOLD={img:'assets/img/goldbars.jpg',label:'黃金',x:1490,y:300,w:560,h:376};
// "利率"整屏巨字：和結尾她身後換世界同一個樣子（舞臺、巨字從 1.12 倍長到 1、推 2%），只是她在左下圓窗裡說。字往右挪，給圓窗讓位
const {f1,f3,E,col,mixc,stage}=KIT;
const RATE=(t,c)=>{
 const g=E((t-c.t0)/.3),s=1+.02*E((t-c.t0)/.5),cl=col('gold'),m=[mixc('#ffffff',cl,.12),mixc('#ffffff',cl,.42)];
 const hx=1010,gap=24,top=190,size=560,sc=S25.lerp(1.12,1,g);
 const words=S25.mega('利',{x:hx-gap,y:top,size,anchor:'r',m,s:sc,o:g})+S25.mega('率',{x:hx+gap,y:top,size,anchor:'l',m,s:sc,o:g});
 const bw=`<div class="s25brow" style="left:${f1(hx-gap-KIT.megaW('利',size)+16)}px;top:${f1(top+size*.62)}px;opacity:${f3(g)}"><b>問題出在</b><i>INTEREST RATES</i></div>`;
 return `<div class="k-full" style="transform:scale(${f3(s)});transform-origin:50% 45%">${stage({tone:'navy',glow:'#c9a25a',gx:'50%',gy:'38%',go:.3})}${words}${bw}</div><div class="k-full" style="z-index:12;background:radial-gradient(ellipse 60% 70% at 50% 45%,transparent 50%,#000a)"></div>`;
};

await K.film([
 // 一 她講：開口，黃金、亂世兩張照片掛上牆
 {scene:'host',until:'@b02',says:'她開口：黃金最近怎麼樣',
  items:[{...GOLD,at:'@b01:黃'}]},
 {scene:'host',until:'@b03:這-0.1',says:'大家都信的那句話：亂世買黃金',
  items:[{...GOLD,at:0},{...WAR,at:'@b02:亂'}]},
 // 二 證據：她縮排左下圓窗，一直到 17 秒不挪；底下換五刀（戰火、金價線、利率、鏈條、原文）
 {scene:'footage',until:'@b03:黃+0.05',host:'pip',says:'這次真的在打仗',clip:'smoke',from:.5,push:[1,1.05]},
 {scene:'line',until:'@b05',host:'pip',says:'可金價從一月的最高點一路跌回了一年多前',data:gold,title:'黃金價格 · 美元/盎司',en:'GOLD · USD / OZ',
  draw:{at:'@b03:黃+0.05',until:'@b03:最'},
  marks:[{at:'@b03:反',date:'max',text:'1月 歷史最高',value:'$5,318'}],
  level:{at:'@b03:最',text:'一年多來最低'},
  focus:{at:'@b04:光',from:'2026-10-01',value:'-6.9%',brow:'光 10 月'}},
 {scene:'custom',until:'@b06',host:'pip',says:'答案就一個詞：利率（整屏巨字，她在圓窗裡說）',render:RATE},
 {scene:'chain',until:'@b07:1',host:'pip',x0:400,gap:64,says:'打仗怎麼走到利率：油價 → 通脹 → 利率',
  items:[{title:'打仗',img:'assets/img/smoke.jpg',at:'@b06:打'},
         {title:'油價',value:'$104',color:'amber',at:'@b06:油'},
         {title:'通脹',value:'3.6%',color:'brick',at:'@b06:通'},
         {title:'利率',value:'↑',color:'navy',at:'@b06:住'}]},
 {scene:'article',until:'@b08',host:'pip',says:'12 月還要加：市場押 75%',img:'assets/img/cnbc.png',hl:[641.2,412.7,303.5,18],zoom:'@b07:1',hlAt:'@b07:1+0.35'},
 // 三 她講：長回全屏，黃金掛左邊，國債利息掛右邊，一比
 {scene:'host',until:'@b10:加-0.2',enter:'grow',says:'黃金不生息：利率越高，拿著越吃虧',
  items:[{...GOLD,x:440,label:'黃金：沒利息',at:'@b08:黃',gray:'@b09:吃'},
         {at:'@b09:利',vlabel:'美國 10 年國債',value:'4.9%',color:'#1f6b45',x:1490,y:280,w:500,h:300}]},
 // 四 證據：縮排圓窗，美股、原文兩刀，圓窗不動
 {scene:'footage',until:'@b10:著',host:'pip',says:'再加上美股大跌',clip:'nyse',push:[1,1.05]},
 {scene:'article',until:'@b11',host:'pip',says:'急用錢，先賣最好賣的黃金：原文寫的就是這個',img:'assets/img/kitco.png',hl:[[1036.6,139,272.7,41],[410,178,289.5,41]],zoomS:1.9,zoom:'@b10:著+0.05',hlAt:'@b10:著+0.5'},
 // 五 她講：回到開頭那句話，兩張照片原樣回來；"看一眼利率"身後換世界（和第 5 鏡同一個"利率"）
 {scene:'host',enter:'grow',says:'回到開頭那句話：下次先看一眼利率',
  items:[{...WAR,at:'@b11:亂'},{...GOLD,at:'@b11:黃'}],
  swap:{at:'@b11:看',words:['利','率']}},
]);
return K.go();
})();
