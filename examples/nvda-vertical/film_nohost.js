// 《英偉達拒絕老黃迴歸》直式無人版（沒有真人出鏡，配音是豆包 TTS）。和真人口播版同一份文案、同一套 vpro 元件，底從她的實拍換成圖。
// 導演表 ../shots.md。2026-11-20。
// film.js —— 直式片（1080×1920）的鏡頭表。一鏡一個物件：選一個 v- 開頭的場景（kit/VERTICAL.md 查），填這一鏡的內容。
// 先寫導演表（每一鏡：畫面上是什麼、觀眾多懂了什麼、接住上一鏡的什麼），再按導演表填這張表。
// 每一鏡都要寫：
//   scene  場景名（v-host / v-clip / v-list …，全部見 kit/VERTICAL.md 的"這句話在說什麼 → 用哪個場景"）
//   until  這一鏡到哪一刻結束：'@b02'（下一句開口）、'@b02:利率'（唸到這個詞）。最後一鏡不寫 = 到片尾
//   says   這一鏡讓觀眾多懂了什麼（一句話；說不出來就重想這一鏡）
// 直式的接法只有硬切：不寫 enter。東西一句出一樣（items 裡寫 at:'@b03:詞'，不寫就自動均勻排開），出來了就留著。
// 時刻一律寫 '@句id:詞'，不寫秒數。文案一個分句不超過 14 個字（直式字幕一行放不下，--check 會提醒）。
// 寫完：node <skill>/scripts/render.mjs --dir . --check（查表）→ --sheet（看圖）→ --video --h 720（720×1280 預覽）
window.ready=(async()=>{
const F=await FB.init({
 counts:['assets/clips/counts.json'],   // 實拍、口播的幀數登記；沒有也留著（空的 {}）
 fonts:KIT.FONTS,
 subMax:12,                             // 直式字幕一行 12 個字，多了按逗號拆
});
const K=await KIT.use(F);
await KIT_VERT.use(K,{
 skin:'dark',                           // 'dark' 深藍織物 + 金數字（財經）/ 'paper' 灰紫底 + 米白卡 + 綠重點（生活、消費）；單鏡可以寫 skin 換
 brand:'',                              // 黑條上沿的小欄目名，不要就留空
 // host:{name:'host',fps:30},          // 有真人口播時開啟：assets/clips/host/0001.jpg…（16:9 原片按幀抽），counts.json 裡登記幀數；有摳像（assets/cut/host/）才能用 v-host-num
});
KIT_VPRO.theme({accent:'#8a86ee'});   // 和真人口播版同一個強調色（那一版取自她的開衫），兩條片是一套

await K.film([
 {scene:'vp-words', until:'@b02', says:'英偉達又出事了，而且是反轉',
  bg:'assets/img/hq_raw.jpg', en:'PLOT TWIST', y:760,
  props:[{kind:'obj', img:'assets/img/cut/chip.png', at:'@b01', x:170, y:800, w:740, rot:-8, layer:'back'}],
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
  bg:'assets/img/hq_raw.jpg',
  stamp:{text:'不買賬', at:'@b04:不'}, drop:{text:'潑冷水', at:'@b04:潑'},
  props:[{kind:'pour', img:'assets/img/cut/bucket.png', at:'@b04:潑', x:500, y:120, w:620, hide:62, layer:'back'}]},
 {scene:'vp-paper', until:'@b06', says:'這話是董事長在財報會上親口說的',
  img:'assets/img/snap/d_eeo2.png', mast:'經濟觀察網', mastSub:'EEO.COM.CN', brow:'財報電話會 · 11月17日', title:'董事長<em>親口說</em>',
  hl:[{x:.1474,y:.2898,w:.5043,h:.0841,at:'@b05:董'}], tag:{text:'董事長 哈維·瓊斯', at:'@b05:直'}},
 {scene:'vp-verdict', until:'@b07', says:'結論：不讓回', hero:true,
  lines:['董事會拍板','不讓回'], bg:'assets/img/hq_raw.jpg', cut:'assets/img/cut/huang.png', at:['@b06','@b06:無'],
  en:'THE BOARD SAYS NO', sub:'英偉達董事長 · 11月17日財報電話會',
  note:{label:'董事長原話', text:'無意讓他<em>恢復CEO職務</em>'},
  props:[{kind:'hammer', img:'assets/img/cut/gavel.png', at:'@b06:拍', x:1010, y:880, w:640, block:'assets/img/cut/block.png', bw:380, ar:.431}]},
 {scene:'vp-voices', until:'@b08', says:'有大人物替他說話，也沒用',
  bg:'assets/img/hq_raw.jpg',
  props:[{kind:'obj', img:'assets/img/cut/huang.png', at:'@b07', x:300, y:520, w:480, rot:0, layer:'back'}],
  items:[{img:'assets/img/ackman.jpg', name:'阿克曼', tag:'潘興廣場創始人', say:'錯上加錯', at:'@b07:圈'},
         {img:'assets/img/cz.jpg', name:'趙長鵬', tag:'幣安創始人', say:'是個錯誤', at:'@b07:聲'}],
  deny:{at:'@b07:鐵'}, bar:{text:'立規矩', en:'RULES', at:'@b07:立'}},
 {scene:'vp-number', says:'人走了，錢照賺：單季營收 1158 億美元',
  bg:'assets/img/hq_raw.jpg', value:'1158', unit:'億美元', label:'單季營收 · 同比', pct:'+103%', at:'@b08:炸',
  props:[{kind:'bills', img:'assets/img/bill100.jpg', at:'@b08:印', y:1400, layer:'back'},{kind:'bills', img:'assets/img/bill100.jpg', at:'@b08:印', big:true}]},
]);
return K.go();
})();
