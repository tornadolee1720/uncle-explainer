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
KIT_UNCLE.preset('eye',{bg:'assets/kit/ph/city.jpg'});   // 'eye' 視光衛教（海軍藍＋黃）/ 'shop' 小店的帳（木色＋暖橘）   // 強調色：python scripts/pick_accent.py <她的一幀或主圖> 挑；bg：沒有她的鏡頭預設墊的圖
const PH='assets/kit/ph/';              // 佔位素材：先跑通，成片之前全部換掉（--check 會提醒）

await K.film([
 {scene:'vp-words', until:'@b02', says:'先丟出最反常的那件事',
  words:[{text:'這支片的', at:'@b01:第'},{text:'問題', at:'@b01:丟', fx:'flip'}]},   // vp- 開頭的是精裝元件，新片預設用它們（kit/VERTICAL.md 最前面）

 {scene:'v-clip', until:'@b03', says:'這件事長什麼樣',
  img:PH+'city.jpg', title:'先看<em>現場</em>', tags:[{text:'第一個事實', at:'@b02:誰'},{text:'第二個事實', at:'@b02:多大'}]},

 {scene:'v-list', says:'回到問題，給一句判斷',
  title:'為什麼？', items:['第一個原因','第二個原因'], answer:'一句話答案'},
]);
return K.go();
})();
