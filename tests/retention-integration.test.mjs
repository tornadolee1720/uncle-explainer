import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const run=(script,...args)=>spawnSync(process.execPath,[path.join(root,script),...args],{encoding:'utf8',cwd:root});
test('new film rejects incomplete and deleted retention plan before browser launch',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'uncle-retention-'));
 const dir=path.join(tmp,'film');
 try{
 const created=run('scripts/new_film.mjs',dir,'--vertical');
 assert.equal(created.status,0,created.stderr);
 assert.equal(fs.readFileSync(path.join(dir,'.retention-required'),'utf8').trim(),'3');
 assert.ok(fs.existsSync(path.join(dir,'retention.json')));
 assert.ok(fs.existsSync(path.join(dir,'attention-plan.json')));
 for(const mode of ['--check','--video']){
 const invalid=run('scripts/render.mjs','--dir',dir,mode);
 assert.equal(invalid.status,2,invalid.stderr);
 assert.match(invalid.stderr,/\[retention\]/);
 const report=JSON.parse(fs.readFileSync(path.join(dir,'out','retention-check.json'),'utf8'));
 assert.ok(report.errors.length);
 }
 fs.unlinkSync(path.join(dir,'retention.json'));
 const missing=run('scripts/render.mjs','--dir',dir,'--check');
 assert.equal(missing.status,2,missing.stderr);
 assert.match(missing.stderr,/缺少 retention.json/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
