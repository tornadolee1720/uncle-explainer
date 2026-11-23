import fs from 'node:fs';
import path from 'node:path';
// Fictional shop cashflow story; no real business, copyrighted photos, or news.
const [caseFile,dir]=process.argv.slice(2);
if(!caseFile||!dir)throw Error('Usage: node scripts/build_cash_story_c.mjs tests/business-c/case.json <film-dir>');
const D=path.resolve(dir), C=JSON.parse(fs.readFileSync(caseFile,'utf8')),q=C.scenario;
function need(x,err){if(!x)throw Error('CASH_STORY_BLOCK: '+err)}
need(C.type==='fictional_educational_scenario' && C.disclaimer.includes('虛構'),'Fiction label missing');
need(q.currency==='TWD'&&q.order_contract_amount===1000000,'Wrong order baseline');
need(q.initial_unrestricted_cash===200000&&q.prepaid_material_cost===450000&&q.pre_collection_payroll_overhead===250000,'Assumptions altered');
const out=q.prepaid_material_cost+q.pre_collection_payroll_overhead;
const bridge=Math.max(0,out-q.initial_unrestricted_cash);
need(out===q.max_precollection_cash_out&&bridge===q.bridge_need&&bridge===500000,'Inconsistent cash arithmetic');
need(q.payment_days_after_acceptance===90&&q.delivery_and_acceptance_day===20,'Payment timing changed');
need(Array.isArray(C.script)&&C.script.length===10,'Expected 10 lines');
need(!C.script.some(x=>/已經倒閉|確定破產|一定倒閉/.test(x.text)),'Unjustified bankruptcy claim');
const bg={factory:'assets/img/factory.svg',cash:'assets/img/cash.svg',calendar:'assets/img/calendar.svg'};
const scenes=[
 {scene:'vp-ask',says:'先制造一百萬訂單卻付不出薪水的強烈矛盾',lines:['有一百萬訂單','竟然沒錢？'],at:['@b01:一百萬','@b01:付不出來'],bg:bg.cash,hero:true},
 {scene:'vp-photo',says:'原創工廠插畫建立虛構故事現場，絕不暗示真實工廠',img:bg.factory,title:'這家工廠',brow:'虛構商業案例',tags:[{text:'100 萬訂單',at:'@b02:一百萬元'}],source:'原創插畫／非真實公司'},
 {scene:'vp-timeline',says:'交付完成和90日延後收款的時序，凸顯現金入帳時間差',title:'訂單不是現金',brow:'情境假設',items:[{date:'接單',text:'尚未收款',at:'@b03:客戶'},{date:'驗收後',text:'開始計時',at:'@b03:交貨驗收'},{date:'再等 90 天',text:'客戶才付錢',hl:true,at:'@b03:九十天'}],bg:bg.calendar},
 {scene:'vp-number',says:'45萬材料款在客戶付款前就要支出，先顯示第一筆負擔',value:'45',unit:'萬',label:'材料費先付',at:'@b04:四十五萬',title:'先買材料',brow:'假設金額',bg:bg.factory},
 {scene:'vp-bars',says:'兩筆支出45萬和25萬堆出70萬前期資金需求',unit:'萬元／假設',title:'錢先往外流',items:[{label:'材料',value:'45',at:'@b05:員工'},{label:'薪資與廠房',value:'25',hl:true,at:'@b05:二十五萬'}],bg:bg.cash},
 {scene:'vp-number',says:'帳戶僅剩20萬而非有100萬現金，顯示流動性危機',value:'20',unit:'萬',label:'目前帳戶現金',at:'@b06:二十萬',title:'真正的問題',brow:'情境假設',bg:bg.cash},
 {scene:'vp-chain',says:'用70萬先付減20萬現金等於50萬缺口的因果圖而非一句空話',title:'現金缺口怎麼來？',items:[{title:'要先付 70 萬',sub:'材料＋薪資／廠房',at:'@b07:客戶'},{title:'手上只有 20 萬',sub:'可動用現金',at:'@b07:還沒'},{title:'還差 50 萬',sub:'需要額外周轉',value:'50萬',at:'@b07:五十萬'}],bg:bg.factory},
 {scene:'vp-versus',says:'一百萬訂單的合約面額不能跟今天可用現金劃等號',title:'接單不等於收款',left:{name:'訂單金額',value:'100 萬',sub:'今天尚未收到',at:'@b08:訂單'},right:{name:'可用現金',value:'20 萬',sub:'現在能支付',at:'@b08:今天'},bg:bg.calendar},
 {scene:'vp-list',says:'具體引導觀眾想到訂金付款期限和備用周轉額度',title:'怎麼撐過空窗？',items:[{text:'談訂金',sub:'先收一部分款項',mark:'1',at:'@b09:訂金'},{text:'調整付款期限',sub:'依合約協商',mark:'2',at:'@b09:付款期限'},{text:'備妥周轉資金',sub:'先算成本與風險',mark:'3',hl:true,at:'@b09:周轉資金'}],bg:bg.cash},
 {scene:'vp-verdict',says:'以訂單代表機會現金流決定能否撐過空窗作結論',lines:['訂單是機會','現金流是命'],at:['@b10:訂單','@b10:現金流'],sub:'虛構案例，非真實公司',bg:bg.factory}
];
const intents=C.script.map(x=>x.intent);
const validTypes=new Set(['vp-ask','vp-photo','vp-timeline','vp-number','vp-bars','vp-chain','vp-versus','vp-list','vp-verdict']);
let decision=[];
for(let i=0;i<scenes.length;i++){
 const sc=scenes[i],b=C.script[i];
 need(b.id==='b'+String(i+1).padStart(2,'0')&&b.viewer_gain?.length>12,'Missing intent/understanding contract');
 need(validTypes.has(sc.scene)&&sc.says?.length>=12,'Unsupported scene or missing explanation');
 function walk(v){
  if(typeof v==='string'&&v.startsWith('@')){
   const m=v.match(/^@(b\d\d)(?::(.+))?$/);
   need(m&&m[1]===b.id&&(!m[2]||b.text.includes(m[2])),'Invalid beat anchor '+v);
  }else if(Array.isArray(v))v.forEach(walk);
  else if(v&&typeof v==='object')for(const [k,t] of Object.entries(v))if(k!=='says')walk(t);
 }
 walk(sc);
 decision.push({beat_id:b.id,intent:intents[i],viewer_gain:b.viewer_gain,choice:sc.scene,
   explanation:sc.says,media_origin:'ORIGINAL_PROGRAMMATIC_VISUAL',no_fake_photography:true});
}
const textTypes=new Set(['vp-ask','vp-list','vp-verdict','vp-words']);
const textCount=scenes.filter(x=>textTypes.has(x.scene)).length;
const explainCount=scenes.filter(x=>['vp-timeline','vp-bars','vp-chain','vp-versus'].includes(x.scene)).length;
need(new Set(scenes.map(x=>x.scene)).size>=8&&textCount<=3&&explainCount>=4,'Reverted to text-only template');
need(!scenes.some(x=>/vp-paper|v-full|v-clip/.test(x.scene)),'Cannot impersonate news or real footage');
const script={voice:'FISH_AD_MALE_PENDING',pre:.22,lines:C.script.map(({id,text,gap})=>({id,text,gap}))};
fs.writeFileSync(path.join(D,'script.json'),JSON.stringify(script,null,2)+'\n');
const film=[
'window.ready=(async()=>{',
" const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
' const K=await KIT.use(F);',
" await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / BUSINESS STORY'});",
" KIT_UNCLE.preset('story',{bg:'assets/img/factory.svg'});",
' await K.film('+JSON.stringify(scenes,null,2)+');',
' return K.go();','})();'
].join('\n');
fs.writeFileSync(path.join(D,'film.js'),film+'\n');
const report={status:'FICTIONAL_STORY_DIRECTOR_PASS',is_fiction:true,publish_allowed:false,
 model:{contract_amount:q.order_contract_amount,initial_cash:q.initial_unrestricted_cash,
  pre_collection_outflow:out,cash_shortfall:bridge,days_after_acceptance_to_payment:q.payment_days_after_acceptance},
 scenes:scenes.length,scene_types:[...new Set(scenes.map(x=>x.scene))],explanatory_scenes:explainCount,text_only_scenes:textCount,
 assets:['assets/img/factory.svg','assets/img/cash.svg','assets/img/calendar.svg'],
 voice:'STUB_ONLY',note:'Original generative SVG artwork, not recorded company footage',
 warnings:['Order signing is not booked as cash or necessarily recognized revenue',
 'Liquidity shortfall does not prove legal bankruptcy','Avoid treating fictional numbers as evidence about actual industry'],
 decisions:decision};
fs.writeFileSync(path.join(D,'STORY_DIRECTOR.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(D,'ASSET_CREDITS.md'),
'# 素材與事實界線\n\n所有場景背景是本倉庫程式產生的原創 SVG 示意圖；不是實際工廠拍攝。現金流數字為虛構教學假設。原理參考 tests/business-c/case.json 中的政府資料，但該資料不支持虛構金額本身。\n');
console.log(JSON.stringify({status:report.status,shots:scenes.length,distinct:report.scene_types.length,shortfall:bridge,stub_voice:true}));
