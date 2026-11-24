// node --test tests/myopia-national/gate.test.mjs
import test from 'node:test'; import assert from 'node:assert'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import {execFileSync} from 'node:child_process';
const run = (td, fd) => execFileSync('node', ['scripts/build_myopia_national.mjs', td, fd], {encoding: 'utf8', stdio: 'pipe'});
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'myo-'));
test('pending evidence forces INTERNAL_SAMPLE + watermark', () => {
  const fd = tmp(); const r = JSON.parse(run('tests/myopia-national', fd).trim());
  assert.equal(r.mode, 'INTERNAL_SAMPLE');
  const rep = JSON.parse(fs.readFileSync(path.join(fd, 'MYOPIA_DIRECTOR.json'), 'utf8'));
  assert.equal(rep.watermark_required, true); assert.equal(rep.publish_allowed, false);
});
function mutated(fn) {
  const td = tmp(); for (const f of ['EVIDENCE_AUDIT.json', 'narration_v41.json']) fs.copyFileSync(path.join('tests/myopia-national', f), path.join(td, f));
  fn(td); return td;
}
test('mixing thresholds fails closed', () => {
  const td = mutated(td => { const p = path.join(td, 'EVIDENCE_AUDIT.json'), a = JSON.parse(fs.readFileSync(p)); a.claims.find(c => c.claim_id === 'survey_2017_50D_grade6').threshold = '-0.25 D'; fs.writeFileSync(p, JSON.stringify(a)); });
  assert.throws(() => run(td, tmp()), /門檻分組/);
});
test('verified without page number fails closed', () => {
  const td = mutated(td => { const p = path.join(td, 'EVIDENCE_AUDIT.json'), a = JSON.parse(fs.readFileSync(p)); a.claims[0].verification_state = 'verified'; fs.writeFileSync(p, JSON.stringify(a)); });
  assert.throws(() => run(td, tmp()), /頁碼/);
});
test('unverified decline claim in narration fails closed', () => {
  const td = mutated(td => { const p = path.join(td, 'narration_v41.json'), n = JSON.parse(fs.readFileSync(p)); n.lines[8].text = '最新全國近視率已經改善，近視已經下降。'; fs.writeFileSync(p, JSON.stringify(n)); });
  assert.throws(() => run(td, tmp()), /未核實的結論句/);
});
