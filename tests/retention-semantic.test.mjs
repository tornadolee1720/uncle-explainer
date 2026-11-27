import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRetention} from '../scripts/retention.mjs';
import {reviewFingerprint,diagnoseRetention,validateSemanticReview} from '../scripts/retention-semantic.mjs';
import {stub} from '../scripts/timeline_stub.mjs';
export function fixture(){
 const script={lines:[{id:'a',text:'同一盞燈，怎麼看起來不一樣？'},{id:'b',text:'比較兩種畫面就能看懂差異。'},{id:'c',text:'模糊的光點看起來可能比較大。'},{id:'d',text:'光點變大就能判斷原因嗎？'},{id:'e',text:'不行，這只是示意，不能單靠光點判斷原因。'}]};
 const timeline=stub(script);
 const plan={version:1,mode:'short',promise:'比較畫面',editorial:{safety:'pass',promise:'pass',singleAction:'pass',evidence:'not-applicable'},beats:[{role:'hook',lineIds:['a'],intent:'疑問'},{role:'promise',lineIds:['b'],intent:'比較'},{role:'value',lineIds:['c'],intent:'示意',value:'光點外觀差異'},{role:'loop',lineIds:['d'],intent:'原因',loopId:'L1'},{role:'value',lineIds:['e'],intent:'界線',value:'模擬不可診斷',closes:['L1']}]};
 const entry=(id,quote,reason)=>({decision:'pass',refs:[{lineId:id,quote}],reason});
 const review={version:1,fingerprint:reviewFingerprint(plan,script,timeline),reviewer:{type:'ai',name:'synthetic regression fixture'},reviewedAt:'2026-11-28T00:00:00Z',decision:'pass',promise:entry('c','光點看起來可能比較大','示例比較了模糊光點的外觀'),safety:entry('e','不能單靠光點判斷原因','結尾說明示意不具診斷能力'),evidence:entry('e','這只是示意','本例為示意而不是實證聲稱'),cta:entry('e','不能單靠光點判斷原因','此處自然收尾沒有要求行動'),values:{c:entry('c','光點看起來可能比較大','先給光點外觀的具體描述'),e:entry('e','不能單靠光點判斷原因','再補充示意不能判斷原因')},loops:{L1:entry('e','不能單靠光點判斷原因','直接回答是否能判斷原因')},risks:{}};
 for(const r of diagnoseRetention(plan,script,timeline).risks)review.risks[r.id]={decision:'accept',reason:'測試範例特意保留此時間配置'};
 return {plan,script,timeline,review};
}
const cases=[
 ['valid evidence-linked review',()=>{},false],
 ['bare pass rejected',f=>f.review={decision:'pass'},true],
 ['script edited',f=>f.script.lines[0].text+='改',true],
 ['plan edited',f=>f.plan.promise+='改',true],
 ['timeline changed',f=>f.timeline.duration+=1,true],
 ['invented quote',f=>f.review.values.c.refs[0].quote='不存在的原文',true],
 ['wrong answer segment',f=>f.review.loops.L1.refs=[{lineId:'c',quote:'模糊的光點'}],true],
 ['missing value rationale',f=>delete f.review.values.e,true],
 ['missing reviewer',f=>delete f.review.reviewer,true],
 ['unresolved timing risk',f=>{f.timeline.beats.forEach(b=>{b.start+=10;b.end+=10});f.timeline.duration+=10;f.review.fingerprint=reviewFingerprint(f.plan,f.script,f.timeline);f.review.risks={}},true],
 ['explicit timing exception',f=>{f.timeline.beats.forEach(b=>{b.start+=10;b.end+=10});f.timeline.duration+=10;f.review.fingerprint=reviewFingerprint(f.plan,f.script,f.timeline);for(const r of diagnoseRetention(f.plan,f.script,f.timeline).risks)f.review.risks[r.id]={decision:'accept',reason:'測試故意保留時間例外說明'}},false],
 ['missing promise evidence',f=>delete f.review.promise,true],
 ['missing safety evidence',f=>delete f.review.safety,true],
 ['missing cta review',f=>delete f.review.cta,true],
 ['missing evidence review',f=>delete f.review.evidence,true]
];
for(const [name,change,bad] of cases)test(name,()=>{const f=fixture();assert.deepEqual(validateRetention(f.plan,f.script,f.timeline).errors,[]);change(f);const r=validateSemanticReview(f.plan,f.script,f.timeline,f.review);assert.equal(Boolean(r.errors.length),bad,JSON.stringify(r));});
test('near-duplicate value flags risk',()=>{const f=fixture();f.plan.beats[4].value=f.plan.beats[2].value+'。';assert.ok(diagnoseRetention(f.plan,f.script,f.timeline).risks.some(r=>r.id.startsWith('repeat:')));});
test('canonical fingerprint stable under object key reorder',()=>{const f=fixture();assert.equal(reviewFingerprint(f.plan,f.script,f.timeline),reviewFingerprint({...f.plan,version:1},f.script,f.timeline));});
