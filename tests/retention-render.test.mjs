import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {reviewFingerprint,diagnoseRetention} from '../scripts/retention-semantic.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const run=(script,...args)=>spawnSync(process.execPath,[path.join(root,script),...args],{encoding:'utf8',cwd:root,timeout:60000});
test('v1.1 gate rejects missing or stale review; approved synthetic clip renders when browser installed',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'uncle-semantic-'));
 const write=(n,x)=>fs.writeFileSync(path.join(dir,n),JSON.stringify(x));
 try{
 const script={lines:[{id:'a',text:'看這個圓點'},{id:'b',text:'圓點變大了'}]};
 const timeline={fps:30,duration:0.6,beats:[{...script.lines[0],start:0,end:0.25},{...script.lines[1],start:0.3,end:0.6}]};
 const plan={version:1,mode:'ugc',promise:'展示圓點變化',editorial:{safety:'not-applicable',promise:'pass',singleAction:'pass',evidence:'not-applicable'},beats:[{role:'hook',lineIds:['a'],intent:'注意圓點'},{role:'value',lineIds:['b'],intent:'狀態變化',value:'圓點尺寸增加'}]};
 const entry={decision:'pass',reason:'測試專用的合成動畫示意內容',refs:[{lineId:'b',quote:'圓點變大了'}]};
 const review={version:1,decision:'pass',fingerprint:reviewFingerprint(plan,script,timeline),reviewer:{type:'ai',name:'synthetic smoke fixture'},reviewedAt:'2026-11-28T00:00:00Z',promise:entry,safety:entry,evidence:entry,cta:entry,values:{b:entry},loops:{},risks:{}};
 assert.equal(diagnoseRetention(plan,script,timeline).risks.length,0);
 fs.writeFileSync(path.join(dir,'.retention-required'),'2\n');
 write('script.json',script);write('timeline.json',timeline);write('retention.json',plan);
 fs.writeFileSync(path.join(dir,'index.html'),'<html><body style="background:white"><div id="dot" style="background:black;border-radius:50%;width:20px;height:20px"></div><script>window.STAGE={w:1080,h:1920};window.ready=Promise.resolve();window.seek=t=>{document.getElementById("dot").style.width=(20+100*t)+"px";};</script></body></html>');
 for(const mode of ['--check','--video']){
 const missing=run('scripts/render.mjs','--dir',dir,mode);assert.equal(missing.status,2,missing.stderr);assert.match(missing.stderr,/retention-review.json/);
 }
 write('retention-review.json',{...review,fingerprint:'stale'});
 const stale=run('scripts/render.mjs','--dir',dir,'--video');assert.equal(stale.status,2,stale.stderr);assert.match(stale.stderr,/須重新審查/);
 write('retention-review.json',review);
 const prepare=run('scripts/retention-review.mjs',dir);assert.equal(prepare.status,0,prepare.stderr);assert.equal(JSON.parse(prepare.stdout).fingerprint,review.fingerprint);
 if(process.env.RETENTION_RENDER_SMOKE==='1'){
 const result=run('scripts/render.mjs','--dir',dir,'--video','--h','108','--workers','1');
 assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
 assert.ok(fs.statSync(path.join(dir,'out','visual_108.mp4')).size>0);
 const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height','-of','json',path.join(dir,'out','visual_108.mp4')],{encoding:'utf8'});
 assert.equal(probe.status,0,probe.stderr);assert.equal(JSON.parse(probe.stdout).streams[0].codec_name,'h264');
 }else console.log('Browser smoke not enabled; structural CLI verified only');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
