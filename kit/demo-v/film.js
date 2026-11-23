// 直式模板示例片：不帶口播的 23 個場景各用一次。照著抄寫法；素材全是佔點陣圖（assets/kit/ph/），新片換成真的。
// 帶口播的 6 個場景（v-host、v-host-cards、v-host-num、v-host-words、v-host-bubbles、v-host-sides）要口播幀，寫法看 kit/VERTICAL.md。
window.ready=(async()=>{
const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});
const K=await KIT.use(F);
await KIT_VERT.use(K,{skin:'dark',pattern:'chart',brand:'直式示例'});
const PH='assets/kit/ph/';

await K.film([
 {scene:'v-title', until:'@d02', says:'丟出反常的事：打仗了金價反而跌',
  lines:['打仗了','黃金<em>反而跌</em>？'], brow:'一句話問題', at:['@d01','@d01:黃金']},

 {scene:'v-clip', until:'@d03', says:'現場長這樣：油輪冒煙，金價往下',
  img:PH+'site.jpg', title:'中東還在<em>打</em>', brow:'現場',
  tags:[{text:'油輪還在冒煙', at:'@d02:油輪'},{text:'金價掉頭往下', at:'@d02:金價'}], source:'佔點陣圖'},

 {scene:'v-full', until:'@d04', says:'華爾街都在盯這件事',
  img:PH+'city.jpg', title:'華爾街\n都在看', tags:[{text:'紐約', at:'@d03:華爾街'}]},

 {scene:'v-chapter', until:'@d05', says:'換話題：先講跌了多少',
  no:'01', title:'跌了多少', sub:'先看數'},

 {scene:'v-move', until:'@d06', says:'一個月從 4186 掉到 3898',
  title:'金價', label:'美元 / 盎司', from:'4186', to:'3898', at:'@d05:月底', delta:'-6.9%', color:'red'},

 {scene:'v-number', until:'@d07', says:'一個月跌了快 7%',
  value:'6.9%', brow:'10 月跌幅', label:'一個月跌掉的', color:'red', roll:true},

 {scene:'v-line', until:'@d08', says:'走勢：一月見頂，十月跳水',
  title:'金價走勢', points:[['25/9',3592],['10',3890],['11',4150],['12',4480],['26/1',5318],['2',5010],['3',4760],['4',4620],['5',4700],['6',4540],['7',4420],['8',4350],['9',4187],['10',3899]],
  marks:[{i:4,text:'1 月見頂', at:'@d07:一月'},{i:-1,text:'10 月跳水', at:'@d07:十月'}], unit:'美元', source:'示意資料'},

 {scene:'v-doc', until:'@d09', says:'外媒原文：一年多來最低',
  img:PH+'news_a.jpg', brow:'外媒報道', title:'原文怎麼寫', hl:[{x:.06,y:.3,w:.7,h:.1,at:'@d08:一年'}], zh:{text:'一年多來<em>最低</em>', at:'@d08:最低'}},

 {scene:'v-stack', until:'@d10', says:'到處都在報同一件事',
  title:'全網都在報', items:[{img:PH+'news_b.jpg', at:'@d09'},{img:PH+'news_c.jpg', at:'@d09:兩條'},{title:'金價創一年多新低，市場押注美聯儲 12 月再加息', source:'財經快訊', at:'@d09:三條'}]},

 {scene:'v-meme', until:'@d11', says:'網友的反應：看不懂',
  img:PH+'crowd.jpg', title:'網友：？？？', caption:'說好的亂世買黃金呢'},

 {scene:'v-quiz', until:'@d12', says:'讓觀眾先猜：問題出在哪',
  q:'問題出在哪？', options:['戰爭','美元','利率'], answer:2, at:'@d11:利率'},

 {scene:'v-list', until:'@d13', says:'排除法：不是戰爭、不是美元，是利率',
  title:'到底<em>怪誰</em>', items:[{text:'戰爭', mark:'no', at:'@d12'},{text:'美元', mark:'no', at:'@d12:不是美元'},{text:'利率', mark:'ok', hl:true, at:'@d12:是利率'}], answer:{text:'問題出在利率', at:'@d12:利率'}},

 {scene:'v-chain', until:'@d14', says:'因果鏈：打仗 → 油價 → 通脹 → 加息',
  title:'一環扣一環', items:[{title:'打仗推高油價', color:'red', at:'@d13'},{title:'通脹壓不住', color:'steel', at:'@d13:通脹'},{title:'只能加息', at:'@d13:只能'}]},

 {scene:'v-data', until:'@d15', says:'三個數：油價、通脹、美債利率',
  title:'三個數', rows:[{label:'油價', value:'$104', at:'@d14'},{label:'通脹', value:'3.6%', at:'@d14:通脹'},{label:'美債利率', value:'4.9%', hl:true, at:'@d14:美債'}]},

 {scene:'v-vs', until:'@d16', says:'黃金沒利息，美債有 4.9%',
  title:'錢放哪', left:{title:'黃金', value:'0%', sub:'不生利息', color:'gold'}, right:{title:'美債', value:'4.9%', sub:'每年穩拿', color:'navy', at:'@d15:美債'}, verdict:{text:'利率越高，黃金越吃虧', at:'@d15:四點九'}},

 {scene:'v-table', until:'@d17', says:'三樣東西橫著比',
  title:'放一起比', cols:['','黃金','美債','美股'], rows:[['利息','沒有','4.9%','看分紅'],['風險','中','低','高'],['好賣','最好賣','好賣','好賣']], rowAt:['@d16:利息','@d16:風險','@d16:好不好賣'], hlCol:1},

 {scene:'v-bars', until:'@d18', says:'誰跌得多（示意）',
  title:'10 月誰跌得多', items:[{label:'黃金', value:'-6.9%', hl:true, at:'@d17:黃金'},{label:'美股', value:'-5.2%', at:'@d17:美股'},{label:'原油', value:'+8%', at:'@d17:還是'}], source:'示意資料'},

 {scene:'v-pie', until:'@d19', says:'急用錢時先賣什麼（示意）',
  title:'先賣什麼', items:[{label:'黃金', value:45},{label:'美債', value:30},{label:'股票', value:25}], center:'急用錢', source:'示意資料'},

 {scene:'v-sum', until:'@d20', says:'算一筆賬：少賺的利息加跌價',
  title:'100 萬黃金', items:[{label:'少賺利息', value:'4.9萬', at:'@d19:少賺'},{label:'跌價', value:'6.9萬', at:'@d19:再加'}], total:{label:'一共虧', value:'11.8萬', at:'@d19:跌價'}},

 {scene:'v-brand', until:'@d21', says:'誰決定利率',
  title:'誰說了算', items:[{name:'美聯儲', sub:'加不加息', color:'navy', keep:true},{name:'財政部', sub:'發多少債', color:'steel'},{name:'華爾街', sub:'押哪邊', color:'charcoal'}], dimAt:'@d20:這幾家'},

 {scene:'v-phone', until:'@d22', says:'行情軟體裡滿屏下跌',
  img:PH+'app.jpg', title:'開啟軟體', scroll:.6, tags:[{text:'黃金 -6.9%', at:'@d21:滿屏'},{text:'全是綠的', at:'@d21:綠'}]},

 {scene:'v-collage', until:'@d23', says:'金條、油輪、交易所是連著的',
  title:'一根線上', items:[{img:PH+'chip.jpg', label:'金條', at:'@d22'},{img:PH+'site.jpg', label:'油輪', at:'@d22:油輪'},{img:PH+'stage.jpg', label:'交易所', at:'@d22:交易所'}]},

 {scene:'v-quote', until:'@d24', says:'有人預計 12 月還要加息',
  text:'十二月\n<em>可能還要加</em>', who:'市場預期', role:'利率期貨：75% 機率', photo:PH+'face_a.jpg', brow:'引語', skin:'paper'},

 {scene:'v-number', says:'記住 4.9 這個數',
  value:'4.9%', brow:'美債利率', label:'黃金的對手', skin:'paper'},
]);
return K.go();
})();
