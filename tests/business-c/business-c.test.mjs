import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT=path.resolve('.');
const base=JSON.parse(fs.readFileSync('tests/business-c/case.json','utf8'));
function build(mutator){
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'uncle-business-c-'));
 fs.mkdirSync(path.join(d,'assets','img'),{recursive:true});
 const c=structuredClone(base);if(mutator)mutator(c);
 const spec=path.join(d,'case.json');fs.writeFileSync(spec,JSON.stringify(c));
 const art=spawnSync(process.execPath,['scripts/make_cash_story_art.mjs',d],{cwd:ROOT,encoding:'utf8'});
 assert.equal(art.status,0,art.stderr);
 const run=spawnSync(process.execPath,['scripts/build_cash_story_c.mjs',spec,d],{cwd:ROOT,encoding:'utf8'});
 return {d,run};
}
test('positive: ten native scenes with valid cash shortage and original visuals',()=>{
 const {d,run}=build();assert.equal(run.status,0,run.stderr);
 const qa=JSON.parse(fs.readFileSync(path.join(d,'STORY_DIRECTOR.json')));
 assert.equal(qa.status,'FICTIONAL_STORY_DIRECTOR_PASS');
 assert.equal(qa.model.cash_shortfall,500000);
 assert.equal(qa.model.pre_collection_outflow,700000);
 assert.equal(qa.scenes,10);
 assert.ok(qa.scene_types.length>=8);
 assert.ok(qa.explanatory_scenes>=4);
 assert.equal(qa.publish_allowed,false);
 for(const name of ['factory','cash','calendar'])assert.ok(fs.statSync(path.join(d,'assets','img',name+'.svg')).size>2500);
 const js=fs.readFileSync(path.join(d,'film.js'),'utf8');
 assert.match(js,/await K\.film\(\[/);
 assert.match(js,/vp-chain/);
 assert.match(js,/vp-timeline/);
 assert.doesNotMatch(js,/NASA|NVIDIA|vp-paper|v-full/);
});
test('block inconsistent 50萬 funding-gap arithmetic',()=>{
 const {run}=build(c=>{c.scenario.bridge_need=400000});
 assert.notEqual(run.status,0);assert.match(run.stderr,/CASH_STORY_BLOCK.*Inconsistent cash arithmetic/);
});
test('block false assertion that order contract is already cash',()=>{
 const {run}=build(c=>{c.scenario.order_contract_amount=200000});
 assert.notEqual(run.status,0);assert.match(run.stderr,/Wrong order baseline/);
});
test('block exact payment timing drift',()=>{
 const {run}=build(c=>{c.scenario.payment_days_after_acceptance=30});
 assert.notEqual(run.status,0);assert.match(run.stderr,/Payment timing changed/);
});
test('block unsupported claim the company definitely went bankrupt',()=>{
 const {run}=build(c=>{c.script[9].text='公司一定倒閉，已經倒閉了。'});
 assert.notEqual(run.status,0);assert.match(run.stderr,/Unjustified bankruptcy claim/);
});
test('block a fraudulent real-company origin label',()=>{
 const {run}=build(c=>{c.type='real_news_article'});
 assert.notEqual(run.status,0);assert.match(run.stderr,/Fiction label missing/);
});
test('block missing word anchoring after an unchecked script rewrite',()=>{
 const {run}=build(c=>{c.script[2].text='客戶付款需要很久。'});
 assert.notEqual(run.status,0);assert.match(run.stderr,/Invalid beat anchor/);
});
test('preserve facts as hypothetical assumptions rather than audited accounting facts',()=>{
 const {d,run}=build();assert.equal(run.status,0);
 const qa=JSON.parse(fs.readFileSync(path.join(d,'STORY_DIRECTOR.json')));
 assert.match(qa.note,/Original generative SVG/);
 assert.equal(qa.is_fiction,true);
 assert.equal(qa.voice,'STUB_ONLY');
 assert.ok(qa.warnings.some(w=>w.includes('Order signing')));
});
