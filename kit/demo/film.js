// 模板示例片：每個場景用一次。用來看模板長什麼樣、照著學鏡頭表的寫法；不要照著它的鏡頭順序做新片。
// 素材全是 assets/kit/ph/ 裡的佔點陣圖（face_*.jpg 是頭像照片的佔位）；數字取自《AI到底有多燒錢》第六版文案，排行榜和圖表的分年資料是示意。
window.ready=(async()=>{
const F=await FB.init({fonts:KIT.FONTS});
const K=await KIT.use(F);
const PH='assets/kit/ph/';

await K.film([
 // ---------- 開頭鉤子：關鍵詞快閃 ----------
 {scene:'flash', until:'@d01', says:'開頭：全網都在說"燒錢"',
  keyword:'燒錢', items:[
   {cat:'資訊 · 2026-10-02', left:'大模型的', right:'競賽', sum:'示例摘要：幾家公司的投入都在漲'},
   {cat:'問答 · 2026-10-05', left:'AI 到底有多', right:'？', sum:'示例摘要：一個開放式的問題'},
   {cat:'影片 · 2026-10-08', left:'資料中心', right:'進入千億級', sum:'示例摘要：資料中心的規模'},
   {cat:'資訊 · 2026-10-11', left:'不', right:'就會掉隊', sum:'示例摘要：公司為什麼停不下來'},
   {cat:'討論 · 2026-10-13', left:'這樣', right:'值不值', sum:'示例摘要：大家在爭論'},
   {cat:'資訊 · 2026-10-16', left:'算力', right:'沒有盡頭', sum:'示例摘要：算力需求'},
   {cat:'問答 · 2026-10-20', left:'誰在', right:'誰在賺錢', sum:'示例摘要：錢流向了誰'},
   {cat:'影片 · 2026-10-24', left:'一年', right:'七千億', sum:'示例摘要：四家的總投入'},
  ]},

 // ---------- 並列幾家：圓盤一排，先灰著佔位，唸到誰亮誰 ----------
 {scene:'discs', until:'@d02', says:'砸錢的是這四家',
  items:[
   {id:'goog', name:'谷歌', color:'google', at:'@d01:谷歌'},
   {id:'msft', name:'微軟', color:'microsoft', at:'@d01:微軟'},
   {id:'amzn', name:'亞馬遜', color:'amazon', at:'@d01:亞馬遜'},
   {id:'meta', name:'Meta', color:'meta', at:'@d01:Meta'},
  ],
  steps:[{at:'@d01:這四家', light:'all'}]},

 // ---------- 一個數：上一鏡倒成桌面，數立在上面滾到總數 ----------
 {scene:'number', until:'@title', enter:'flat', says:'四家加起來一年 7250 億',
  value:'$7250億', brow:'四家 · 2026 AI 資本開支', en:'BIG FOUR · AI CAPEX 2026',
  roll:{from:'$1800億', at:'@d02:加起來', stop:'@d02:七千'}},

 // ---------- 片名：底下換實拍 ----------
 {scene:'title', until:'@d03', says:'這支片要算這筆賬',
  title:'AI到底有多燒錢', brow:'$725,000,000,000', en:'How much is AI burning',
  items:[PH+'servers.jpg', PH+'site.jpg', PH+'city.jpg', PH+'chip.jpg']},

 // ---------- 兩樣東西並列：畫框甩進來，一個數分成兩路；最後晶片畫框推滿屏 ----------
 {scene:'frames', until:'@d04', says:'錢的大頭流向晶片和資料中心',
  pin:{value:'$7250億'},
  items:[{img:PH+'chip.jpg', label:'晶片', at:'@d03:晶片'}, {img:PH+'servers.jpg', label:'資料中心', at:'@d03:資料中心'}],
  fill:{i:0, at:'@d03:END-0.1'}},

 // ---------- 全屏實拍：接住推滿屏的畫框 ----------
 {scene:'footage', until:'@d04:市值', says:'賣晶片的就是英偉達',
  img:PH+'chip.jpg', settle:true, push:[1,1.05]},

 // ---------- 人站在巨字前面，字隨話翻 ----------
 {scene:'person', until:'@d05', says:'英偉達 = 全球市值第一',
  img:PH+'person.png', color:'nvidia', words:['5.2','萬億'], brow:'英偉達 · 市值', en:'NVIDIA · MARKET CAP',
  flip:[{at:'@d04:全世界', words:['全球','第一']}]},

 // ---------- 反差：按真實面積並排 ----------
 {scene:'versus', until:'@d06', says:'OpenAI 估值很高，收入很小',
  items:[
   {id:'val', name:'估值', color:'openai', tag:{label:'OpenAI 估值', value:'$8520億'}},
   {id:'rev', name:'收入', color:'openai', tag:{label:'今年收入', value:'$360億'}, at:'@d05:收入'},
  ]},

 // ---------- 出處：原文整頁 → 特寫 → 熒光筆 ----------
 {scene:'article', until:'@d06:淨燒', says:'虧損的數有出處',
  mock:{source:'報道', date:'2026-10-02', title:'OpenAI 預計 2030 年前累計燒錢約 2780 億美元',
   body:['（示例排版：截不到原文時，用核實過的文字排一頁通用樣式，不放任何真實網站的標誌。）','報道稱，這家公司在算力上的投入會繼續增加，收入的增長暫時追不上支出。'],
   mark:'2780 億美元'},
  zoom:'@d06:從今年'},

 // ---------- 白底圖表：線跟著話畫，累計數跟著滾 ----------
 {scene:'chart', until:'@d07', enter:'flat', says:'到 2030 年累計要虧 2780 億',
  title:'OpenAI 累計淨燒錢（示意）', en:'Cumulative cash burn',
  x:['2026','2027','2028','2029','2030'], values:[-120,-380,-860,-1600,-2780], unit:'億',
  draw:{at:'@d06:淨燒', until:'@d06:兩千七百'}, total:{label:'累計淨燒', from:'$0', to:'-$2780億'}},

 // ---------- 關係網：錢流到哪鏡頭跟到哪，中間彈出一張證據小卡 ----------
 {scene:'network', until:'@d09', says:'錢在三家之間轉了一圈，回到英偉達',
  nodes:[
   {id:'nvda', name:'英偉達', color:'nvidia', photo:PH+'face_a.jpg'},
   {id:'oai', name:'OpenAI', color:'openai', photo:PH+'face_b.jpg'},
   {id:'orcl', name:'甲骨文', color:'oracle', photo:PH+'face_c.jpg'},
  ],
  links:[{from:'nvda', to:'oai', text:'投資'}, {from:'oai', to:'orcl', text:'買算力'}, {from:'orcl', to:'nvda', text:'買晶片'}],
  steps:[
   {at:'@d07', focus:'nvda'},
   {at:'@d07:投錢', link:'nvda>oai', focus:['nvda','oai']},
   {at:'@d07:投錢+0.5', pop:{img:PH+'tv.jpg', from:'nvda>oai', back:'@d07:花錢'}},
   {at:'@d07:花錢', link:'oai>orcl', focus:['oai','orcl']},
   {at:'@d07:拿錢', link:'orcl>nvda', focus:['orcl','nvda']},
   {at:'@d08:轉了一圈', focus:'all', loop:['nvda>oai','oai>orcl','orcl>nvda']},
   {at:'@d08:英偉達', focus:'nvda'},
  ]},

 // ---------- 佔比：一個環，講到的那一塊亮起來 ----------
 {scene:'share', until:'@d10', says:'英偉達一家佔了八成左右',
  title:'全球 AI 晶片', parts:[{label:'英偉達', value:80, color:'nvidia'}, {label:'其他', value:20, color:'slate'}],
  focus:[{at:'@d09:八成', i:0}]},

 // ---------- 時間線：唸到哪年鏡頭推到哪年 ----------
 {scene:'timeline', until:'@d11', says:'三年裡錢越砸越多',
  nodes:[
   {id:'y22', year:'2022', title:'ChatGPT 上線', color:'openai', at:'@d10:二〇二二'},
   {id:'y24', year:'2024', title:'英偉達市值破三萬億', color:'nvidia', at:'@d10:二〇二四'},
   {id:'y26', year:'2026', title:'四家砸 7250 億', color:'red', at:'@d10:今年'},
  ]},

 // ---------- 一群裡拎出一個：平鋪的卡片，主角放大前移、其餘壓暗 ----------
 {scene:'cards3d', until:'@d13', says:'各國都在砸錢，最大的是美國',
  cards:[{title:'美國'},{title:'歐盟'},{title:'日本'},{title:'英國'},{title:'法國'},{title:'德國'},{title:'韓國'},{title:'印度'}],
  key:0, keyAt:'@d12:還是', text:{zh:'出手最大', at:'@d12:美國'}},

 // ---------- 排行榜：鏡頭從末尾走到第一名（示例資料） ----------
 {scene:'ranking', until:'@d14', says:'排個隊，差距一眼可見（示例資料）',
  title:'示例資料 · 不是真實排名',
  rows:[{name:'公司甲',value:'$1800億',color:'blue'},{name:'公司乙',value:'$1500億',color:'steel'},{name:'公司丙',value:'$1200億',color:'amber'},
   {name:'公司丁',value:'$900億',color:'teal'},{name:'公司戊',value:'$500億',color:'brick'},{name:'公司己',value:'$300億',color:'slate'}],
  climb:'@d13:差距'},

 // ---------- 柱子：長出來時鏡頭跟著往上，括號沿著差距畫出來 ----------
 {scene:'bars', until:'@d15', says:'投入和回報差一大截',
  bars:[{label:'每年砸進去', value:'$7250億', color:'red', at:'@d14:砸進去'},{label:'收回來的', value:'?', n:900, color:'slate', at:'@d14:收回來'}],
  gap:{at:'@d14:差著', a:1, b:0, text:'差一大截'}},

 // ---------- 流程：一步步亮起，打勾；最後一環灰著 ----------
 {scene:'flow', until:'@d16', says:'鏈條的最後一環還不知道',
  nodes:[
   {id:'c1', title:'算力', color:'steel', pos:[0,0], at:'@d15:算力'},
   {id:'c2', title:'模型', color:'navy', pos:[1,0], at:'@d15:模型'},
   {id:'c3', title:'應用', color:'teal', pos:[2,0], at:'@d15:應用'},
   {id:'c4', title:'收回錢', color:'red', pos:[3,0], at:'@d15:賺回來'},
  ],
  links:[{from:'c1',to:'c2'},{from:'c2',to:'c3'},{from:'c3',to:'c4'}],
  steps:[{at:'@d15:訓出', mark:{c1:'ok'}}, {at:'@d15:做成', mark:{c2:'ok'}}, {at:'@d15:能不能', mark:{c3:'ok'}}, {at:'@d15:沒人知道', focus:'c4', gray:'c4'}]},

 // ---------- 新聞攤在桌面上：鏡頭沿桌面滑過去，抬高看全，唸到證據時抬平刷黃 ----------
 {scene:'desk', until:'@d17:追著問', says:'各家還在加碼',
  items:[{img:PH+'news_a.jpg', at:'@d16:各家'}, {img:PH+'news_b.jpg', at:'@d16:最近', hl:[176,306,272,80]}, {img:PH+'news_c.jpg', at:'@d16:新聞'}, {img:PH+'news_d.jpg'}],
  all:'@d16:還都', read:{i:1, at:'@d16:加碼'}},

 // ---------- 反應窗：上一鏡凍住壓暗，撐開一個視窗 ----------
 {scene:'popup', until:'@d18', says:'連新聞臺都在問',
  img:PH+'tv.jpg', back:'@d17:END'},

 // ---------- 釘住一個數，底下換實拍 ----------
 {scene:'montage', until:'@d19', says:'這七千多億 = 這些樓和晶片',
  pin:{value:'$7250億', brow:'一年'}, items:[PH+'site.jpg', PH+'servers.jpg', PH+'chip.jpg', PH+'city.jpg']},

 // ---------- 手寫一鏡（模板對不上時）：這裡是一張簡單的結尾卡 ----------
 {scene:'custom', says:'結尾',
  render:(t,c)=>{const q=KIT.appear(t,c.t0+.1,.4,0);return c.bg(t,{x:960,y:540,s:1+.02*(t-c.t0)},null,{tone:'charcoal',glow:false})+KIT.chrome('下期見',{en:'See you next time',size:150,o:q.o});}},
]);
return K.go();
})();
