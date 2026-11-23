// 模板示例片二：後加的 11 個場景各用一次（equation change quote profile statement headlines compare stats agenda device map）。
// 用來看模板長什麼樣、照著學鏡頭表的寫法；不要照著它的鏡頭順序做新片。
// 素材全是 assets/kit/ph/ 裡的佔點陣圖（face_*.jpg 是頭像照片的佔位）。四家投入、市值、估值取自《AI到底有多燒錢》第六版文案；對比的兩家公司、標題牆、App 介面是示例。
window.ready=(async()=>{
const F=await FB.init({fonts:KIT.FONTS});
const K=await KIT.use(F);
const PH='assets/kit/ph/';

await K.film([
 // ---------- 開頭鉤子：算一筆賬，一項項出來，結果金色、下面畫線 ----------
 {scene:'equation', until:'@e01', says:'一年七千多億，攤到每天將近二十億',
  brow:'四家 · 2026 AI 資本開支', en:'BIG FOUR · AI CAPEX',
  terms:[{value:'$7250億', label:'一年'}, {op:'÷'}, {value:'365', label:'天', at:'@e00:每一天'}, {op:'≈'}, {value:'$20億', label:'每天', at:'@e00:將近'}]},

 // ---------- 目錄：唸到哪一章亮哪一章（長片在鉤子後面列目錄） ----------
 {scene:'agenda', until:'@e02', says:'這支片要講四件事',
  title:'AI 這筆錢，分四段講', items:['錢從哪來','錢去哪了','誰在賺錢','能不能賺回來'],
  at:['@e01:錢從哪來','@e01:錢去哪了','@e01:誰在賺錢','@e01:能不能']},

 // ---------- 示意地圖：唸到哪裡鏡頭飛到哪裡，航線畫出來 ----------
 {scene:'map', until:'@e03:創始人', enter:'through', says:'一顆晶片要跨三個地方才造得出來',
  nodes:[
   {id:'ca', lon:-121.96, lat:37.35, label:'加州 · 設計', at:'@e02:加州'},
   {id:'hc', lon:120.97, lat:24.8, label:'新竹 · 製造', at:'@e02:新竹'},
   {id:'nl', lon:5.4, lat:51.41, label:'荷蘭 · 光刻機'},
  ],
  links:[{from:'ca', to:'hc', text:'設計圖'}, {from:'nl', to:'hc', text:'光刻機'}],
  steps:[{at:'@e02:新竹', link:'ca>hc'}, {at:'@e02:荷蘭', show:'nl', link:'nl>hc', focus:'all'}, {at:'@e03', focus:'ca'}]},

 // ---------- 人物第一次出場：摳像 + 名字 + 身份 + 三條要緊的事 ----------
 {scene:'profile', until:'@e04', says:'設計晶片的是英偉達，掌舵的是黃仁勳',
  name:'黃仁勳', en:'Jensen Huang', title:'英偉達創始人、CEO', img:PH+'person.png', color:'nvidia',
  facts:[{text:'1993 年和兩位朋友創立英偉達', at:'@e03:一九九三'}, {text:'從遊戲顯示卡做起', at:'@e03:遊戲顯示卡'}, {text:'當了三十多年 CEO', at:'@e03:三十多年'}]},

 // ---------- 原話：照片圓盤 + 一句話，關鍵幾個字刷金 ----------
 {scene:'quote', until:'@e05', says:'他自己說：買得越多，省得越多',
  text:'買得越多，省得越多。', hl:'省得越多', hlAt:'@e04:省得',
  who:{name:'黃仁勳', title:'英偉達 CEO', photo:PH+'face_a.jpg', color:'nvidia'},
  orig:'The more you buy, the more you save.', source:'2023 年臺北電腦展主題演講'},

 // ---------- 從多少變成多少：舊的灰、箭頭畫過去、新的金色 ----------
 {scene:'change', until:'@e06', enter:'blur', says:'兩年裡英偉達市值漲了七成多',
  brow:'英偉達 · 市值', en:'NVIDIA · MARKET CAP',
  from:{value:'$3萬億', label:'2024 年'}, to:{value:'$5.2萬億', label:'2026 年', at:'@e05:五萬'}, mult:'×1.7'},

 // ---------- 幾個數一字排開：唸到哪個哪個出來 ----------
 {scene:'stats', until:'@e07', says:'投入、估值、市值放在一起看',
  items:[{label:'四家一年投入', value:'$7250億', at:'@e06:四家'}, {label:'OpenAI 估值', value:'$8520億', at:'@e06:OpenAI'}, {label:'英偉達市值', value:'$5.2萬億', at:'@e06:英偉達'}]},

 // ---------- 兩邊對比：一行行比下去，贏的一邊亮（示例資料） ----------
 {scene:'compare', until:'@e08', enter:'whip', says:'甲賺得多，乙長得快（示例資料）',
  brow:'示例資料 · 不是真實公司',
  left:{title:'公司甲', color:'green'}, right:{title:'公司乙', color:'red'},
  rows:[{label:'營收', left:'$600億', right:'$250億', win:'left', at:'@e07:營收'},
   {label:'利潤率', left:'55%', right:'10%', win:'left', at:'@e07:利潤率'},
   {label:'增速', left:'20%', right:'60%', win:'right', at:'@e07:增速'}]},

 // ---------- 標題牆：齊刷刷出來，再只亮起最要緊的一句 ----------
 {scene:'headlines', until:'@e09', says:'說法很多，要緊的只有一句：什麼時候賺回來',
  items:[
   {src:'示例 · 資訊', date:'10-02', title:'AI 晶片還要排多久的隊'},
   {src:'示例 · 評論', date:'10-05', title:'資料中心的電從哪裡來'},
   {src:'示例 · 資訊', date:'10-08', title:'大模型價格戰打到了幾分錢'},
   {src:'示例 · 問答', date:'10-11', title:'這錢什麼時候能賺回來？'},
   {src:'示例 · 影片', date:'10-13', title:'一年砸七千億，到底值不值'},
   {src:'示例 · 資訊', date:'10-16', title:'算力租金還在漲'},
   {src:'示例 · 討論', date:'10-20', title:'AI 應用到底誰在用'},
   {src:'示例 · 資訊', date:'10-24', title:'各家都說明年還要加碼'},
  ],
  pick:{i:3, at:'@e08:最要緊'}, mark:'什麼時候能賺回來'},

 // ---------- 產品介面：裝進手機外框，推近到要看的那一塊 ----------
 {scene:'device', until:'@e10', enter:'through', says:'錢要從應用裡賺回來：看有沒有人掏錢',
  img:PH+'app.jpg', hl:[48,1150,984,250], zoom:'@e09:願不願意', label:'掏錢的人（示意）'},

 // ---------- 金句：一兩行大字，關鍵詞刷金 ----------
 {scene:'statement', says:'結論：賣鏟子的最賺錢',
  brow:'說到底', lines:['賣鏟子的','最賺錢'], hl:['最賺錢'], at:['@e10:賣鏟子','@e10:最賺錢'],
  items:[PH+'site.jpg', PH+'servers.jpg', PH+'chip.jpg']},
]);
return K.go();
})();
