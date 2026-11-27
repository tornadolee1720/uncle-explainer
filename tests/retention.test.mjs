import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRetention} from '../scripts/retention.mjs';
const sample={"version":1,"mode":"short","promise":"回答問題","editorial":{"safety":"not-applicable","promise":"pass","singleAction":"pass","evidence":"not-applicable"},"beats":[{"role":"hook","lineIds":["a"],"intent":"問題"},{"role":"promise","lineIds":["b"],"intent":"承諾"},{"role":"value","lineIds":["c"],"intent":"答案","value":"第一層"},{"role":"loop","lineIds":["d"],"intent":"下一問","loopId":"L1"},{"role":"value","lineIds":["e"],"intent":"回收","value":"第二層","closes":["L1"]},{"role":"cta","lineIds":["f"],"intent":"互動","action":"留言"}]};
const script={"lines":[{"id":"a","text":"a"},{"id":"b","text":"b"},{"id":"c","text":"c"},{"id":"d","text":"d"},{"id":"e","text":"e"},{"id":"f","text":"f"}]};
const timeline={"duration":12,"beats":[{"id":"a","text":"a","start":0,"end":2},{"id":"b","text":"b","start":2,"end":4},{"id":"c","text":"c","start":4,"end":6},{"id":"d","text":"d","start":6,"end":8},{"id":"e","text":"e","start":8,"end":10},{"id":"f","text":"f","start":10,"end":12}]};
const cases=[["valid",()=>{},false],
["unclosed",p=>delete p.beats[4].closes,true],
["early CTA",p=>p.beats[2].role="cta",true],
["duplicate ID",p=>p.beats[2].lineIds=["b"],true],
["missing safety",p=>delete p.editorial.safety,true],
["duplicate value",p=>p.beats[4].value="第一層",true],
["UGC no forced loops",p=>{p.mode="ugc"},false],
["stale timeline",(p,s,t)=>t.beats[0].text="changed",true],
["multiple CTA",p=>p.beats[4].role="cta",true],
["no CTA allowed",p=>{p.beats[5].role="brand";delete p.beats[5].action},false]];
for(const [name,mut,bad] of cases)test(name,()=>{const p=structuredClone(sample),s=structuredClone(script),t=structuredClone(timeline);mut(p,s,t);assert.equal(Boolean(validateRetention(p,s,t).errors.length),bad);});
