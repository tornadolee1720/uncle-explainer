// Read-only preparation: prints a fingerprint and risk list, never approves.
import fs from 'node:fs';
import path from 'node:path';
import {validateRetention} from './retention.mjs';
import {reviewFingerprint,diagnoseRetention} from './retention-semantic.mjs';
try{
 const dir=process.argv[2];if(!dir)throw Error('用法：node scripts/retention-review.mjs <影片目錄>');
 const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
 const p=read('retention.json'),s=read('script.json'),t=read('timeline.json');
 const base=validateRetention(p,s,t);
 if(base.errors.length)throw Error(base.errors.join('\n'));
 console.log(JSON.stringify({fingerprint:reviewFingerprint(p,s,t),...diagnoseRetention(p,s,t)},null,2));
}catch(e){console.error(e.message);process.exitCode=2;}
