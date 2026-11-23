// 《英偉達拒絕老黃迴歸》直式真人口播（1080×1920，28.7 秒），用 kit/vpro.js 的元件寫的鏡頭表。導演表 shots.md。
// 口播是使用者給的直式原片（720×1280），先裁成畫面區的比例再放大到 1080×1574，所以景別 1.0 正好鋪滿。
window.ready=(async()=>{
const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});
const K=await KIT.use(F);
await KIT_VERT.use(K,{skin:'dark',pattern:'chart',brand:'',host:{name:'host',fps:30,w:1080,h:1574,faceY:488,cx:515}});
KIT_VPRO.theme({accent:'#8a86ee'});   // 強調色取自她的紫灰開衫
await K.film([
 {scene:'vp-words', until:'@b02', says:'英偉達又出事了，而且是反轉',
  zoom:[{at:'@b01',s:1.0},{at:'@b01:又',s:1.13}], en:'PLOT TWIST',
  props:[{kind:'obj', img:'assets/img/cut/chip.png', at:'@b01:英', x:-120, y:742, w:470, rot:-10, layer:'back'}],
  words:[{text:'英偉達', at:'@b01:英', col:'white'},{text:'又反轉了', at:'@b01:又', col:'accent', fx:'flip'}]},
 {scene:'vp-newspile', until:'@b03', says:'上週的事：老黃辭職，到處都在報',
  bg:'assets/img/huang_raw.jpg', brow:'上週 · 11月12日',
  items:[{img:'assets/img/snap3/c1.png', pic:'assets/img/huang_raw.jpg', pos:'50% 24%', at:'@b02'},
         {img:'assets/img/snap3/c2.png', at:'@b02:因'},
         {img:'assets/img/snap3/c3.png', pic:'assets/img/hq_raw.jpg', pos:'50% 40%', at:'@b02:突'}],
  stamp:{text:'辭職', en:'RESIGNED', at:'@b02:辭'}},
 {scene:'vp-person', until:'@b04', says:'他自己想回來',
  cut:'assets/img/cut/huang.png', bg:'assets/img/huang_raw.jpg', brow:'黃仁勳 · 辭職後首次公開發聲',
  name:'黃仁勳', sub:'昨天 · 公開發文', quote:'若符合公司利益，願意重返CEO崗位', cardOut:'@b03:暗',
  lines:['願意重返','CEO崗位'], at:['@b03:願','@b03:重'],
  source:'照片：Anders Eidesvik / CC BY-SA 4.0'},
 {scene:'vp-reject', until:'@b05', says:'轉折：董事會不答應',
  zoom:[{at:'@b04',s:1.12},{at:'@b04:潑',s:1.27}],
  stamp:{text:'不買賬', at:'@b04:不'}, drop:{text:'潑冷水', at:'@b04:潑'},
  props:[{kind:'pour', img:'assets/img/cut/bucket.png', at:'@b04:潑', x:560, y:420, w:600, hide:62, layer:'back'}]},
 {scene:'vp-paper', until:'@b06', says:'這話是董事長在財報會上親口說的',
  img:'assets/img/snap/d_eeo2.png', mast:'經濟觀察網', mastSub:'EEO.COM.CN', brow:'財報電話會 · 11月17日', title:'董事長<em>親口說</em>',
  hl:[{x:.1474,y:.2898,w:.5043,h:.0841,at:'@b05:董'}], tag:{text:'董事長 哈維·瓊斯', at:'@b05:直'}},
 {scene:'vp-verdict', until:'@b07', says:'結論：不讓回', hero:true,
  lines:['董事會拍板','不讓回'], bg:'assets/img/hq_raw.jpg', cut:'assets/img/cut/huang.png', at:['@b06','@b06:無'],
  en:'THE BOARD SAYS NO', sub:'英偉達董事長 · 11月17日財報電話會',
  note:{label:'董事長原話', text:'無意讓他<em>恢復CEO職務</em>'},
  props:[{kind:'hammer', img:'assets/img/cut/gavel.png', at:'@b06:拍', x:1010, y:880, w:640, block:'assets/img/cut/block.png', bw:380, ar:.431}]},
 {scene:'vp-voices', until:'@b08', says:'有大人物替他說話，也沒用',
  zoom:[{at:'@b07',s:1.12},{at:'@b07:鐵',s:1.24}],
  items:[{img:'assets/img/ackman.jpg', name:'阿克曼', tag:'潘興廣場創始人', say:'錯上加錯', at:'@b07:圈'},
         {img:'assets/img/cz.jpg', name:'趙長鵬', tag:'幣安創始人', say:'是個錯誤', at:'@b07:聲'}],
  deny:{at:'@b07:鐵'}, bar:{text:'立規矩', en:'RULES', at:'@b07:立'}},
 {scene:'vp-number', says:'人走了，錢照賺：單季營收 1158 億美元',
  zoom:1.0, value:'1158', unit:'億美元', label:'單季營收 · 同比', pct:'+103%', at:'@b08:炸',
  props:[{kind:'bills', img:'assets/img/bill100.jpg', at:'@b08:印', layer:'behind'},{kind:'bills', img:'assets/img/bill100.jpg', at:'@b08:印', big:true}]},
]);
return K.go();
})();
