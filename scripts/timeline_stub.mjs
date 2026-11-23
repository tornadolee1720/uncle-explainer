// 沒有配音時先估一個時間線：script.json → timeline.json（和 temp_voice.py 同一個格式），畫面先掛在估出來的字上。
// 配好音以後跑 temp_voice.py 覆蓋它就行：鏡頭表裡寫的是 '@句id:詞'，不寫秒數，所以不用改。
//   node scripts/timeline_stub.mjs <影片目錄>/script.json
// 估法：中文每字約 0.235 秒（edge-tts 雲希原速，"二〇一九"的〇也算漢字），數字 0.17，英文字母 0.075，逗號停 0.2，句號停 0.28；句間按 gap。
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';

const per = ch => /[㐀-鿿〇]/.test(ch) ? .235 : /[0-9]/.test(ch) ? .17 : /[A-Za-z]/.test(ch) ? .075
  : /[，、：；,:;]/.test(ch) ? .2 : /[。！？!?…]/.test(ch) ? .28 : /\s/.test(ch) ? .06 : .1;

export function stub(S) {
  let t = .15 + (S.pre ?? 0); const beats = [], inserts = []; let title = null;
  for (const ln of S.lines ?? []) {
    if (!ln.id || !ln.text) throw Error(`script.json 的每一句都要有 id 和 text：${JSON.stringify(ln)}`);
    const chars = []; let x = 0;
    for (const ch of ln.text) { chars.push([ch, +(t + x).toFixed(4)]); x += per(ch); }
    beats.push({id: ln.id, text: ln.text, start: +t.toFixed(4), end: +(t + x).toFixed(4), wav: null, chars});
    t += x + (ln.gap ?? .35);
    if (ln.bite) {
      const bt = ln.bite; t += (bt.pre ?? .15) - (ln.gap ?? .35); const t0 = t, parts = [];
      for (const [src, a, l, sub, g] of bt.parts) { parts.push({src, in: a, dur: l, gain_db: g, start: +t.toFixed(4), end: +(t + l).toFixed(4), sub}); t += l; }
      inserts.push({id: `bite_${ln.id}`, after: ln.id, start: +t0.toFixed(4), end: +t.toFixed(4), parts}); t += bt.post ?? .4;
    }
    if (S.title?.after === ln.id) { title = {start: +t.toFixed(4), end: +(t + S.title.len).toFixed(4)}; t += S.title.len; }
  }
  return {fps: 30, duration: +(t + .95).toFixed(4), pre: S.pre ?? 0, title, beats, inserts, stub: true};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sp = process.argv[2];
  if (!sp) { console.log('用法：node scripts/timeline_stub.mjs <影片目錄>/script.json'); process.exit(1); }
  const S = JSON.parse(fs.readFileSync(sp, 'utf8')), tl = stub(S), out = path.join(path.dirname(path.resolve(sp)), 'timeline.json');
  if (fs.existsSync(out) && !JSON.parse(fs.readFileSync(out, 'utf8')).stub && !process.argv.includes('--force')) {
    console.log(`${out} 是配音出的正式時間線，不覆蓋（要覆蓋加 --force）`); process.exit(1);
  }
  fs.writeFileSync(out, JSON.stringify(tl, null, 1));
  for (const b of tl.beats) console.log(`${b.id.padEnd(6)} ${b.start.toFixed(2).padStart(6)}–${b.end.toFixed(2).padEnd(6)} ${b.text.slice(0, 30)}`);
  console.log(`估出來的時間線（沒有配音）：總長 ${tl.duration} 秒 → ${out}`);
}
