// 打仗了，黃金為什麼反而跌（直式版 1080×1920，28.8 秒，真人口播）。導演表 ../shots.md
// 口播是 2026-11-02 那條 16:9 原片裁進直式；聲音用原片的 mix_master.wav，所以每鏡都卡在她原來說話的字上。
// 五段：她講 0–4.3 / 證據 4.3–8.3 / 她講 8.3–10.7 / 證據 10.7–17.2 / 她講 17.2–20.1 / 證據 20.1–24.2 / 她講 24.2–28.8
window.ready=(async()=>{
const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});
const K=await KIT.use(F);
await KIT_VERT.use(K,{skin:'dark',pattern:'gold',brand:'橙C',host:{name:'host',fps:30,faceY:330,bright:1.18}});

await K.film([
 {scene:'v-host', until:'@b02', says:'她開口：大黃最近有事',
  zoom:1.0, name:'今天聊黃金', nameAt:'@b01:最'},

 {scene:'v-host-bubbles', until:'@b03', says:'大家都信的那句老話：亂世買黃金',
  zoom:1.15, items:[{text:'亂世買黃金', mark:'？', at:'@b02:亂'}]},

 {scene:'v-clip', until:'@b03:黃', says:'這次是真在打仗',
  clip:'smoke', from:.5, title:'這次<em>真在打</em>', tags:[{text:'油價衝上 $104', at:'@b03:打'}], source:'新聞實拍'},

 {scene:'v-line', until:'@b04', says:'金價從一月最高點一路掉回一年多前',
  title:'金價走勢', data:'assets/data/gold.json', unit:'美元/盎司', drawTo:'@b03:一',
  marks:[{i:103, text:'1月最高 $5,318'},{i:-1, text:'一年多來最低', at:'@b03:最'}], source:'COMEX 黃金期貨日收盤價'},

 {scene:'v-host-num', until:'@b05', says:'光十月就跌了快 7%',
  value:'-6.9%', label:'10月跌幅', color:'red', roll:true, at:'@b04:跌'},

 {scene:'v-title', until:'@b06', says:'答案就一個詞：利率', hero:true,
  lines:['問題出在','<em>利率</em>'], en:'INTEREST RATE', pic:'assets/img/rate.jpg', at:['@b05','@b05:利']},

 {scene:'v-chain', until:'@b07:1', says:'打仗怎麼走到利率：油價 → 通脹 → 加息',
  title:'一環扣一環', items:[{title:'打仗推高油價', value:'$104', sub:'國際油價', img:'assets/img/ill_oil.jpg', color:'red', at:'@b06'},{title:'通脹壓不住', value:'3.6%', sub:'美國通脹', img:'assets/img/ill_cart.jpg', color:'teal', at:'@b06:通'},{title:'美聯儲加息', sub:'9月加過一次', img:'assets/img/ill_fed.jpg', at:'@b07'}]},

 {scene:'v-doc', until:'@b08', says:'12 月還要加：市場押 75%',
  img:'assets/img/doc_cnbc.png', brow:'CNBC 報道', title:'市場怎麼押',
  hl:[{x:.04,y:.35,w:.875,h:.1,at:'@b07:1+0.3'},{x:.046,y:.455,w:.462,h:.1,at:'@b07:可'}], zh:{text:'12 月再加息：<em>75%</em> 機率', at:'@b07:還'}},

 {scene:'v-host-cards', until:'@b10', says:'黃金沒利息，美債一年 4.9%，利率越高黃金越吃虧',
  zoom:1.1, items:[{title:'黃金', value:'0%', sub:'不生利息', color:'gold', at:'@b08'},{title:'美債', value:'4.9%', sub:'每年穩拿', color:'green', at:'@b09'}]},

 {scene:'v-clip', until:'@b10:急', says:'還有一個推手：美股大跌',
  clip:'nyse', title:'還有一個<em>推手</em>', tags:[{text:'紐約證券交易所', at:'@b10:美'}], source:'紐交所實拍'},

 {scene:'v-doc', until:'@b11', says:'急用錢的先賣最好賣的黃金，原文就這麼寫',
  img:'assets/img/doc_kitco.png', brow:'Kitco 報道', title:'原文怎麼寫',
  hl:[{x:.68,y:.06,w:.285,h:.108,at:'@b10:急'},{x:.025,y:.16,w:.31,h:.108,at:'@b10:先'}], zh:{text:'美股大跌，<em>觸發拋售</em>', at:'@b10:最'}},

 {scene:'v-host-words', says:'回到開頭那句話：下次先看一眼利率',
  zoom:[{at:'@b11',s:1.0},{at:'@b11:你',s:1.2}], words:[{text:'先看一眼', at:'@b11:先'},{text:'利率', at:'@b11:利', hl:true}]},
]);
return K.go();
})();
