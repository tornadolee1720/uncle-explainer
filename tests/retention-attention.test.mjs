import test from 'node:test';
import assert from 'node:assert/strict';
import {attentionFingerprint,validateAttentionBundle} from '../scripts/attention-engine.mjs';
import {attentionFixture} from './attention-fixture.mjs';
import {FIELDS,normalizeMetricool,summarizeSnapshot,compareCohort,inspectRetentionCurve} from '../scripts/attention-feedback.mjs';
const script={lines:[{id:'a',text:'看這個圓點'},{id:'b',text:'圓點變大了'}]};
const timeline={duration:4,beats:[{...script.lines[0],start:0,end:1},{...script.lines[1],start:1,end:4}]};
const plan={mode:'ugc',beats:[{role:'hook',lineIds:['a']},{role:'value',lineIds:['b']}]};
const cases=[
 ['valid attention plan',()=>{},false],
 ['missing hook visual',b=>delete b.attention.hook.visual,true],
 ['invented hook quote',b=>b.attention.hook.quote='不存在的字',true],
 ['reveal is not value',b=>b.attention.prediction.revealLineId='a',true],
 ['missing micro hooks',b=>b.attention.micro=[],true],
 ['missing visual explanation',b=>delete b.visual.shots[0].motionReason,true],
 ['unmapped visual narration',b=>b.visual.shots[0].lineIds=['a'],true],
 ['unlabeled simulation',b=>{b.visual.shots[0].kind='pov';b.visual.shots[0].simulation=true},true],
 ['untranslated terminology',b=>b.visual.terms=[{term:'測試',plain:'這個解釋不在原句裡',lineId:'a'}],true],
 ['missing share value',b=>b.viral.share.valueLineId='a',true],
 ['replay without bridge',b=>b.viral.replay.mode='natural',true],
 ['repeated route without rationale',b=>b.viral.recentRoutes=['experiment','experiment','experiment'],true],
 ['multiple focuses without review',b=>b.visual.shots[0].focusCount=3,true],
 ['multiple focuses with documented exception',b=>{b.visual.shots[0].focusCount=3;b.review.risks['focus:0']={decision:'accept',reason:'比較三個物件本身就是實驗目標'}},false],
 ['unsafe card without review',b=>b.visual.shots[0].cards=[{text:'閱讀測試文字',seconds:2,fontPx:20,box:{x:0,y:0,w:50,h:20}}],true]
];
for(const [name,change,bad] of cases)test(name,()=>{const b=attentionFixture(plan,script,timeline);change(b);b.review.fingerprint=attentionFingerprint(b,plan,script,timeline);assert.equal(Boolean(validateAttentionBundle(b,plan,script,timeline).errors.length),bad);});
test('visual edit invalidates review fingerprint',()=>{const b=attentionFixture(plan,script,timeline);b.visual.shots[0].visual+='改';assert.match(validateAttentionBundle(b,plan,script,timeline).errors.join(' '),/過期/);});
test('FB zero reach with views is not used as denominator',()=>{const x=normalizeMetricool('facebook',FIELDS.facebook,{rows:[['test','https://example.invalid',100,0,1000,10]]});const r=summarizeSnapshot(x);assert.equal(r.rows[0].reach,null);assert.equal(r.rows[0].sharesPerReach,null);assert.equal(r.rows[0].watchUnit,'unverified');});
test('IG null retention preserved and rates validated',()=>{const x=normalizeMetricool('instagram',FIELDS.instagram,{rows:[['test',100,3,200,4,null,55,45]]});const r=summarizeSnapshot(x);assert.equal(r.rows[0].retentionPct,null);assert.equal(r.rows[0].sharesPerReach,.03);assert.equal(r.coverage.view3Pct,1);});
test('wrong field order and duplicate IDs rejected',()=>{assert.throws(()=>normalizeMetricool('facebook',FIELDS.facebook.slice().reverse(),{rows:[]}));const row=['test',100,3,200,4,null,55,45];assert.throws(()=>normalizeMetricool('instagram',FIELDS.instagram,{rows:[row,row]}));});
test('noncomparable baseline excluded and missing context refused',()=>{const t={id:'x',platform:'instagram',accountKey:'demo',traffic:'organic',durationBand:'12s',topicGroup:'optics',ageHours:72,metricDefinition:'v1',view3Pct:30};const b=Array.from({length:5},(_,i)=>({...t,id:String(i),view3Pct:50}));assert.equal(compareCohort(t,b).results.view3Pct.delta,-20);assert.equal(compareCohort(t,b.map(r=>({...r,ageHours:48}))).results.view3Pct.status,'insufficient');assert.equal(compareCohort({...t,traffic:'unknown'},b).status,'insufficient-context');});
test('curve absent does not invent drop points; actual points map to overlapping lines',()=>{assert.equal(inspectRetentionCurve(null,timeline.beats).status,'unavailable');const r=inspectRetentionCurve([{second:0,pct:100},{second:1,pct:80},{second:4,pct:70}],timeline.beats);assert.deepEqual(r.segments[1].lineIds,['b']);assert.equal(r.segments[1].delta,-10);assert.throws(()=>inspectRetentionCurve([{second:2,pct:80},{second:1,pct:90}],timeline.beats));});
