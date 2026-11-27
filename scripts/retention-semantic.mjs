// v1.1: evidence-linked editorial review and deterministic risk diagnostics.
import {createHash} from 'node:crypto';
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
export const reviewFingerprint=(plan,script,timeline)=>hash({plan,script,timeline});
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const grams=s=>new Set(Array.from({length:Math.max(0,s.length-1)},(_,i)=>s.slice(i,i+2)));
const sim=(a,b)=>{const A=grams(norm(a)),B=grams(norm(b));return A.size&&B.size?2*[...A].filter(x=>B.has(x)).length/(A.size+B.size):0};
const meaningful=s=>typeof s==='string'&&norm(s).length>=8;
const limits={ugc:{hook:1,first:10,loop:8,gap:8,max:18},short:{hook:1,first:8,loop:12,gap:10,max:45},explainer:{hook:3,first:12,loop:25,gap:15,max:150},long:{hook:5,first:20,loop:60,gap:35,max:Infinity}};
export function diagnoseRetention(plan,script,timeline){
 const risks=[],metrics={};const add=(id,message)=>risks.push({id,message});
 const L=limits[plan.mode];if(!L)return {risks,metrics};
 const map=new Map(timeline.beats.map(b=>[b.id,b]));
 const parts=plan.beats.map((b,i)=>({...b,i,start:map.get(b.lineIds[0]).start,end:map.get(b.lineIds.at(-1)).end}));
 const values=parts.filter(b=>b.role==='value'),hook=parts[0];
 const text=b=>b.lineIds.map(id=>script.lines.find(l=>l.id===id).text).join('');
 metrics.hookStart=hook.start;metrics.firstValue=values[0]?.start??null;metrics.duration=timeline.duration;
 if(hook.start>L.hook)add('late-hook','主鉤子旁白開始偏晚（視覺首幀須另查）');
 if(values[0]?.start>L.first)add('late-value','第一個價值段開始偏晚');
 if(timeline.duration>L.max)add('mode-duration','片長可能不符合選擇的模式');
 const opens=new Map();metrics.loops=[];
 for(const b of parts){if(b.role==='loop')opens.set(b.loopId,b);for(const id of b.closes??[]){const a=opens.get(id);if(!a)continue;const wait=b.start-a.end;metrics.loops.push({id,wait,answerStart:b.start});if(wait>L.loop)add('loop:'+id,'懸念等待過久：'+wait.toFixed(2)+' 秒');}}
 const points=[{start:0,end:0},...values,{start:timeline.duration,end:timeline.duration}];
 metrics.maxValueGap=0;for(let i=1;i<points.length;i++){const gap=Math.max(0,points[i].start-points[i-1].end);metrics.maxValueGap=Math.max(metrics.maxValueGap,gap);if(gap>L.gap)add('gap:'+i,'價值段間空窗：'+gap.toFixed(2)+' 秒（故事/示範可合理例外）');}
 for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++){const a=values[i],b=values[j];if(Math.max(sim(a.value,b.value),sim(text(a),text(b)))>=.70)add('repeat:'+a.i+':'+b.i,'價值段字面高度相似，須檢查是否有新資訊');}
 return {risks,metrics};
}
export function validateSemanticReview(plan,script,timeline,review){
 const errors=[],warnings=[];const fail=m=>errors.push(m);const {risks,metrics}=diagnoseRetention(plan,script,timeline);
 if(!review||review.version!==1)return {errors:['缺少 v1.1 審查紀錄 retention-review.json'],warnings,risks,metrics};
 if(review.fingerprint!==reviewFingerprint(plan,script,timeline))fail('文案、留存台帳或時間線已變動，須重新審查');
 if(!['human','ai'].includes(review.reviewer?.type)||!String(review.reviewer?.name??'').trim()||!Number.isFinite(Date.parse(review.reviewedAt??'')))fail('缺少審查者身分或日期');
 if(review.decision!=='pass')fail('尚未通過語意審查');
 const lines=new Map(script.lines.map(l=>[l.id,l.text]));
 const refs=(items,allowed)=>Array.isArray(items)&&items.length>0&&items.every(r=>r&&allowed.includes(r.lineId)&&typeof r.quote==='string'&&norm(r.quote).length>=2&&lines.get(r.lineId)?.includes(r.quote));
 const check=(entry,allowed,label)=>{if(!entry||entry.decision!=='pass'||!meaningful(entry.reason)||!refs(entry.refs,allowed))fail(label+'：須有通過判斷、具體理由及原句引用');};
 const values=plan.beats.filter(b=>b.role==='value');
 const valueIds=values.flatMap(b=>b.lineIds);
 check(review.promise,valueIds,'承諾兌現');
 check(review.safety,script.lines.map(l=>l.id),'安全界線');
 check(review.evidence,script.lines.map(l=>l.id),'證據界線');
 const cta=plan.beats.find(b=>b.role==='cta');
 check(review.cta,cta?cta.lineIds:script.lines.map(l=>l.id),'CTA 或自然結尾');
 for(const b of values)check(review.values?.[b.lineIds[0]],b.lineIds,'價值新意 '+b.lineIds[0]);
 for(const b of plan.beats.filter(b=>b.role==='loop')){const answer=values.find(v=>v.closes?.includes(b.loopId));check(review.loops?.[b.loopId],answer?.lineIds??[],'懸念答案 '+b.loopId);}
 for(const risk of risks){const r=review.risks?.[risk.id];if(r?.decision!=='accept'||!meaningful(r.reason))fail('未處理風險 '+risk.id+'：'+risk.message);else warnings.push(risk.id+'：已記錄例外理由');}
 warnings.push('審查紀錄可追溯但不等於真實語意、來源正確或流量已驗證；字面相似僅供提醒。');
 return {errors,warnings,risks,metrics};
}
