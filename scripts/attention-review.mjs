import fs from 'node:fs';
import path from 'node:path';
import {validateRetention} from './retention.mjs';
import {attentionFingerprint,validateAttentionBundle} from './attention-engine.mjs';
try{
 const dir=process.argv[2];if(!dir)throw Error('用法：node scripts/attention-review.mjs <影片目錄>');
 const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
 const p=read('retention.json'),s=read('script.json'),t=read('timeline.json'),b=read('attention-plan.json');
 const base=validateRetention(p,s,t);if(base.errors.length)throw Error(base.errors.join('\n'));
 console.log(JSON.stringify({fingerprint:attentionFingerprint(b,p,s,t),...validateAttentionBundle(b,p,s,t)},null,2));
}catch(e){console.error(e.message);process.exitCode=2;}
