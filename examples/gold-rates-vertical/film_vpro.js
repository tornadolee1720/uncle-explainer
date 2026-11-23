// 試片：拿《打仗黃金反而跌》直式的口播和素材，只用 skill 裡的東西（vpro 元件 + 原有的圖表場景）重做一遍。
// 目的：驗證 vpro 換一個題目還能不能做出同一檔的效果。沒有為這支片寫任何新場景。
window.ready=(async()=>{
const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});
const K=await KIT.use(F);
await KIT_VERT.use(K,{skin:'dark',pattern:'gold',brand:'',host:{name:'host',fps:30,faceY:330,bright:1.18}});
KIT_VPRO.theme({accent:'#ad8aed',bg:'assets/img/rate.jpg'});   // scripts/pick_accent.py 從她的畫面裡挑的

await K.film([
 {scene:'vp-words', until:'@b03', says:'大家都信的那句老話：亂世買黃金',
  zoom:[{at:'@b01',s:1.0},{at:'@b02',s:1.15}], en:'SAFE HAVEN?',
  props:[{kind:'obj', img:'assets/img/cut/gold.png', at:'@b02:亂', x:-90, y:800, w:520, rot:-9, layer:'back'}],
  words:[{text:'亂世', at:'@b02:亂', col:'white'},{text:'買黃金', at:'@b02:買', col:'accent', fx:'flip'}]},
 {scene:'v-clip', until:'@b03:黃', says:'這次是真在打仗',
  clip:'smoke', from:.5, title:'這次<em>真在打</em>', tags:[{text:'油價衝上 $104', at:'@b03:打'}], source:'新聞實拍'},
 {scene:'v-line', until:'@b04', says:'金價從一月最高點一路掉回一年多前',
  title:'金價走勢', data:'assets/data/gold.json', unit:'美元/盎司', drawTo:'@b03:一',
  marks:[{i:103, text:'1月最高 $5,318'},{i:-1, text:'一年多來最低', at:'@b03:最'}], source:'COMEX 黃金期貨日收盤價'},
 {scene:'vp-number', until:'@b05', says:'光十月就跌了快 7%',
  zoom:1.0, value:'-6.9%', unit:'', label:'黃金 · 10月跌幅', at:'@b04:跌'},
 {scene:'vp-verdict', until:'@b06', says:'答案就一個詞：利率', hero:true,
  lines:['問題出在','利率'], bg:'assets/img/rate.jpg', at:['@b05','@b05:利'], en:'INTEREST RATE'},
 {scene:'v-chain', until:'@b07:1', says:'打仗怎麼走到利率：油價 → 通脹 → 加息',
  title:'一環扣一環', items:[{title:'打仗推高油價', value:'$104', sub:'國際油價', img:'assets/img/ill_oil.jpg', color:'red', at:'@b06'},{title:'通脹壓不住', value:'3.6%', sub:'美國通脹', img:'assets/img/ill_cart.jpg', color:'teal', at:'@b06:通'},{title:'美聯儲加息', sub:'9月加過一次', img:'assets/img/ill_fed.jpg', color:'gold', at:'@b07'}]},
 {scene:'vp-paper', until:'@b08', says:'12 月還要加：市場押 75%',
  img:'assets/img/doc_cnbc.png', mast:'CNBC', mastSub:'MARKETS', brow:'市場怎麼押', title:'12月<em>還要加</em>',
  hl:[{x:.04,y:.35,w:.875,h:.1,at:'@b07:1+0.3'},{x:.046,y:.455,w:.462,h:.1,at:'@b07:可'}], tag:{text:'再加息機率 75%', at:'@b07:還'}},
 {scene:'vp-reject', until:'@b10', says:'黃金沒利息，利率越高拿著越吃虧',
  zoom:[{at:'@b08',s:1.12},{at:'@b09',s:1.26}],
  stamp:{text:'不生利息', at:'@b08:不'}, drop:{text:'越拿越虧', at:'@b09:拿', col:'cool'}},
 {scene:'v-clip', until:'@b10:急', says:'還有一個推手：美股大跌',
  clip:'nyse', title:'還有一個<em>推手</em>', tags:[{text:'紐約證券交易所', at:'@b10:美'}], source:'紐交所實拍'},
 {scene:'vp-paper', until:'@b11', says:'急用錢的先賣最好賣的黃金，原文就這麼寫',
  img:'assets/img/doc_kitco.png', mast:'KITCO', mastSub:'NEWS', brow:'原文怎麼寫', title:'先賣<em>最好賣的</em>',
  hl:[{x:.68,y:.06,w:.285,h:.108,at:'@b10:急'},{x:.025,y:.16,w:.31,h:.108,at:'@b10:先'}], zoomTo:1.25},
 {scene:'vp-words', says:'回到開頭那句話：下次先看一眼利率',
  zoom:[{at:'@b11',s:1.0},{at:'@b11:你',s:1.2}], words:[{text:'先看一眼', at:'@b11:先', col:'white'},{text:'利率', at:'@b11:利', col:'accent'}]},
]);
return K.go();
})();
