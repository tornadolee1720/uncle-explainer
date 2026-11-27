import fs from 'node:fs';
import {normalizeMetricool,summarizeSnapshot,compareCohort,inspectRetentionCurve} from './attention-feedback.mjs';
try {
 const p=process.argv[2];if(!p)throw Error('用法：node scripts/attention-feedback-cli.mjs <本機快照.json>');
 const x=JSON.parse(fs.readFileSync(p,'utf8'));
 const rows=normalizeMetricool(x.platform,x.fields,x.payload);
 const report=summarizeSnapshot(rows);
 if(x.target&&x.baseline)report.comparison=compareCohort(x.target,x.baseline);
 if(x.timeline)report.curve=inspectRetentionCurve(x.points,x.timeline.beats);
 console.log(JSON.stringify(report,null,2));
}catch(e){console.error(e.message);process.exitCode=2;}
