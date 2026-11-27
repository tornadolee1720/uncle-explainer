// v2.0: explicit source mappings, missingness and comparable-cohort diagnostics.
const number=v=>v===null||v===undefined||v===''?null:typeof v==='number'||typeof v==='string'?Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null:null;
const percentage=v=>{const n=number(v);return n!==null&&n<=100?n:null};
export const FIELDS={
 facebook:['FBRE03','FBRE06','FBRE10','FBRE11','FBRE12','FBRE13'],
 instagram:['IGRE04','IGRE11','IGRE21','IGRE23','IGRE24','IGRE27','IGRE28','IGRE30']
};
export function normalizeMetricool(platform,fields,payload){
 if(!FIELDS[platform]||JSON.stringify(fields)!==JSON.stringify(FIELDS[platform]))throw Error('Metricool 欄位順序或平台不符合契約');
 const rows=payload?.rows;if(!Array.isArray(rows))throw Error('缺少 rows');
 const seen=new Set();
 return rows.map(row=>{
  if(!Array.isArray(row)||row.length!==fields.length||typeof row[0]!=='string'||!row[0].trim()||seen.has(row[0]))throw Error('列格式、貼文 ID 缺漏或重複');
  seen.add(row[0]);
  if(platform==='facebook')return {id:row[0],platform,permalink:row[1],views:number(row[2]),reach:number(row[3])===0&&number(row[2])>0?null:number(row[3]),reachFlag:number(row[3])===0&&number(row[2])>0?'zero-with-views':null,watchTotalRaw:number(row[4]),watchAverageRaw:number(row[5]),watchUnit:'unverified',shares:null,retentionPct:null,view3Pct:null,skip3Pct:null,traffic:'unknown'};
  return {id:row[0],platform,reach:number(row[1]),shares:number(row[2]),views:number(row[3]),watchAverageRaw:number(row[4]),watchUnit:'unverified',retentionPct:percentage(row[5]),view3Pct:percentage(row[6]),skip3Pct:percentage(row[7]),traffic:'organic'};
 });
}
export function summarizeSnapshot(rows){
 const metrics=['views','reach','shares','watchAverageRaw','retentionPct','view3Pct','skip3Pct'];
 return {count:rows.length,coverage:Object.fromEntries(metrics.map(k=>[k,rows.filter(r=>Number.isFinite(r[k])).length])),warnings:[...new Set(rows.flatMap(r=>[r.reachFlag?'觸及為零但有觀看，暫視為不可用':null,r.watchUnit==='unverified'?'觀看時間單位未確認，不換算':null].filter(Boolean)))],rows:rows.map(r=>({...r,sharesPerReach:r.reach>0&&Number.isFinite(r.shares)?r.shares/r.reach:null}))};
}
const median=a=>{const s=[...a].sort((a,b)=>a-b);return s.length?s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2:null};
export function compareCohort(target,baseline){
 const notes=[],recommendations=[];
 if(!target||!Array.isArray(baseline))throw Error('需要目標與基準陣列');
 const dimensions=['platform','accountKey','traffic','durationBand','topicGroup','ageHours','metricDefinition'];
 if(dimensions.some(k=>target[k]===null||target[k]===undefined||target[k]===''||target[k]==='unknown')||!Number.isFinite(target.ageHours)||target.ageHours<0)return {status:'insufficient-context',notes:['缺少同平台、帳號、流量、片長、題材、觀察齡或指標定義'],recommendations};
 const matched=baseline.filter(r=>r&&r.id!==target.id&&dimensions.every(k=>r[k]===target[k]));
 const unique=new Map(matched.map(r=>[r.id,r]));
 if(unique.size!==matched.length)return {status:'duplicate-baseline',notes:['同一貼文重複，須去重'],recommendations};
 const results={};
 for(const key of ['view3Pct','skip3Pct','retentionPct','sharesPerReach']){
  const a=matched.map(r=>r[key]).filter(Number.isFinite);
  if(!Number.isFinite(target[key])||a.length<5){results[key]={status:'insufficient',n:a.length};continue;}
  const base=median(a),delta=target[key]-base;
  results[key]={status:'descriptive',n:a.length,median:base,target:target[key],delta};
  if(key==='view3Pct'&&delta< -5)recommendations.push('測試首幀、三重鉤子或受眾匹配；無法確認流失原因');
  if(key==='retentionPct'&&delta< -5)recommendations.push('測試更早價值、縮短資訊空窗；不能定位逐秒流失');
  if(key==='sharesPerReach'&&delta<0)recommendations.push('測試利他、共鳴與實用分享動機');
 }
 notes.push('至少五支可比基準才做描述性比較；非顯著性檢驗、非因果歸因。不得直接修改製作規則。');
 return {status:'descriptive',matched:unique.size,results,notes,recommendations};
}
export function inspectRetentionCurve(points,beats){
 if(!Array.isArray(points)||points.length<2)return {status:'unavailable',notes:['未取得逐秒或分段留存，禁止虛構流失位置']};
 if(!Array.isArray(beats)||!beats.length||beats.some(b=>!Number.isFinite(b?.start)||!Number.isFinite(b?.end)||b.end<=b.start))throw Error('時間線無效');
 const duration=Math.max(...beats.map(b=>b.end));
 for(let i=0;i<points.length;i++){const p=points[i];if(!Number.isFinite(p?.second)||p.second<0||p.second>duration||percentage(p.pct)!==p.pct||(i&&p.second<=points[i-1].second))throw Error('留存曲線時間或百分比無效');}
 return {status:'descriptive',segments:points.slice(1).map((p,i)=>({from:points[i].second,to:p.second,delta:p.pct-points[i].pct,lineIds:beats.filter(b=>b.start<p.second&&b.end>points[i].second).map(b=>b.id)})),notes:['只對齊觀察區間；回看造成的上升允許存在，不等於因果。']};
}
