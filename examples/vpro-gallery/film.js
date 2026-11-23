// 第二批 12 個元件的樣張（無人版）：每個元件一鏡，內容用英偉達和黃金兩條片裡核過的數。
window.ready=(async()=>{
const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});
const K=await KIT.use(F);
await KIT_VERT.use(K,{skin:'dark',brand:''});
KIT_VPRO.theme({accent:'#8a86ee',bg:'assets/img/hq_raw.jpg'});
await K.film([
 {scene:'vp-ask', until:'@b02', says:'拋問題', lines:['黃金為什麼','反而跌']},
 {scene:'vp-bars', until:'@b03', says:'幾個數比大小', title:'單季<em>營收</em>', brow:'英偉達 · 億美元', unit:'億美元',
  items:[{label:'去年同期',value:'570'},{label:'上季',value:'1010'},{label:'本季',value:'1158',hl:true}]},
 {scene:'vp-versus', until:'@b04', says:'兩樣東西對比', title:'拿著哪個<em>划算</em>', brow:'一年能拿多少',
  left:{name:'黃金',value:'0%',sub:'不生利息'}, right:{name:'美債',value:'4.9%',sub:'每年穩拿'}, win:{side:'right'}},
 {scene:'vp-chain', until:'@b05', says:'因果鏈', title:'一環<em>扣一環</em>',
  items:[{title:'打仗推高油價',value:'$104',sub:'國際油價'},{title:'通脹壓不住',value:'3.6%',sub:'美國通脹'},{title:'美聯儲加息',sub:'9月加過一次'}]},
 {scene:'vp-list', until:'@b06', says:'幾條要點', title:'董事會的<em>三句話</em>',
  items:[{text:'一致接受辭職',mark:'ok'},{text:'無意讓他復職',mark:'no',hl:true},{text:'業務照常推進',sub:'單季營收 1158 億美元',mark:'ok'}]},
 {scene:'vp-line', until:'@b07', says:'走勢', title:'金價<em>走勢</em>', unit:'美元/盎司', down:true, source:'示意資料，只用來看版式',
  data:[3900,3960,4100,4300,4480,4700,4950,5180,5318,5200,5050,4800,4620,4500,4380,4210,4100,3990,3920,3899],
  marks:[{i:8,text:'1月最高 $5,318'},{i:-1,text:'一年多來最低'}]},
 {scene:'vp-photo', until:'@b08', says:'一張圖當主角', img:'assets/img/hq_raw.jpg', title:'英偉達<em>總部</em>', brow:'加州 · 聖克拉拉',
  tags:['董事會在這裡開的會','11月17日'], source:'照片：Coolcaesar / CC BY-SA 4.0'},
 {scene:'vp-quote', until:'@b09', says:'一句引語', brow:'辭職後首次公開發聲', lines:['若符合公司利益','<em>願意重返CEO崗位</em>'], name:'黃仁勳', tag:'英偉達創始人', img:'assets/img/huang_raw.jpg'},
 {scene:'vp-timeline', until:'@b10', says:'時間線', title:'這<em>一週</em>',
  items:[{date:'11月12日',text:'黃仁勳辭職'},{date:'11月17日',text:'董事長：無意讓他復職',hl:true},{date:'11月18日',text:'他說願意回來'}]},
 {scene:'vp-share', until:'@b11', says:'佔比', title:'市場<em>怎麼押</em>', value:'75%', label:'押 12 月再加息', note:'CME FedWatch'},
 {scene:'vp-rank', until:'@b12', says:'排行', title:'誰<em>替他說話</em>', brow:'示意，只用來看版式',
  items:[{name:'阿克曼',value:'3條',hl:true},{name:'趙長鵬',value:'2條'},{name:'其他人',value:'1條'}]},
 {scene:'vp-chapter', says:'分段', no:'02', title:'錢照賺', en:'BUSINESS AS USUAL'},
]);
return K.go();
})();
