// film.js —— 這支片的鏡頭表。一鏡一個物件：選一個場景（kit/README.md 查），填這一鏡的內容。
// 先寫導演表（每一鏡：畫面上是什麼、觀眾多懂了什麼、接住上一鏡的什麼），再按導演表填這張表。
// 每一鏡都要寫：
//   scene  場景名（下面的例子：number / discs / person …，全部見 kit/README.md）
//   until  這一鏡到哪一刻結束：'@b02'（下一句開口）、'@b02:英偉達'（唸到這個詞）。最後一鏡不寫 = 到片尾
//   says   這一鏡讓觀眾多懂了什麼（一句話；說不出來就重想這一鏡）
//   enter  可選，這一鏡怎麼接上一鏡：'cut'（預設）/'push'（橫推換人）/'through'（推過鏡頭）/'blur'/'flat'（上一鏡倒成桌面）/'whip'
// 時刻一律寫 '@句id:詞'，不寫秒數：換了配音全片自動跟著走。詞照念法寫（'@b02:一百三十億'，不是 '130億'），script.json 裡怎麼寫這裡就怎麼寫。
// 每改一次 script.json，先重跑 node <skill>/scripts/timeline_stub.mjs script.json（重算時間線），再查表。
// 寫完：node <skill>/scripts/render.mjs --dir . --check（查表）→ --sheet（看圖）→ --video --h 720（看動起來）
window.ready=(async()=>{
const F=await FB.init({
 counts:['assets/clips/counts.json'],   // footage.py extract 寫的實拍幀數；沒有實拍也留著（空的 {}）
 cuts:[],                               // matte.py 摳的實拍人像序列名（手寫鏡頭用 S25.cutP；模板檔的 person 用透明 PNG）
 fonts:KIT.FONTS,
});
const K=await KIT.use(F);
const PH='assets/kit/ph/';              // 佔位素材：先跑通，成片之前全部換掉（--check 會提醒）

await K.film([
 {scene:'number', until:'@b02', says:'先丟出最反常的那個數',
  value:'$7250億', brow:'這個數是什麼', en:'WHAT IT IS'},

 {scene:'discs', until:'@b03', says:'這個數是誰的',
  items:[
   {id:'a', name:'公司甲', color:'blue', at:'@b02:誰'},
   {id:'b', name:'公司乙', color:'green', at:'@b02:多大'},
  ]},

 {scene:'title', says:'回到問題，給一句判斷',
  title:'這支片的問題', en:'THE QUESTION', items:[PH+'servers.jpg', PH+'site.jpg', PH+'city.jpg']},
]);
return K.go();
})();
