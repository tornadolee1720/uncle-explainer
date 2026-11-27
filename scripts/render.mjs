// 逐幀渲染：頁面暴露 window.ready（Promise）和 window.seek(t)（畫出 t 秒那一幀），Playwright 截圖，ffmpeg 編碼。
// 放在影片目錄外也行：--dir 指向含 index.html + timeline.json 的目錄（預設當前目錄）。
//   node render.mjs --dir film --stills 0.5,3.2,10       # 看幀（out/still_*.png）
//   node render.mjs --dir film --video --h 720            # 預覽整片（out/visual_720.mp4，無聲）
//   node render.mjs --dir film --video --h 720 --range 0:18   # 只渲一段（out/visual_720_range.mp4）
//   node render.mjs --dir film --video --h 1080           # 成片畫面
//   node render.mjs --dir film --moves [--prev 上一條/out/moves.json]   # 手法用量：每鏡用了哪些手法、有沒有連著用、和上一支片像不像（out/moves.json）
//   node render.mjs --dir film --check                    # 模板檔：查鏡頭表（每鏡的場景、時長、says、提醒），幾秒鐘，不渲染
//   node render.mjs --dir film --sheet                    # 每一鏡的開頭、中間、末尾三幀拼一張圖（out/sheet.png），交片前自己先看
//   --page index2.html 換一個入口頁；--out 目錄 換輸出目錄（預設 <dir>/out）
// 頁面要求：seek 是確定的（同一個 t 永遠畫出同一幀，不依賴播放時間、不用 CSS 動畫），並且 await 圖片解碼與字型。
// ffmpeg：PATH 裡的 ffmpeg，或環境變數 FFMPEG，或 scripts/local.json 的 ffmpeg。沒裝 Playwright 自帶的 Chromium 時自動改用本機 Edge。
import fs from 'node:fs/promises'; import path from 'node:path'; import http from 'node:http';
import {spawn} from 'node:child_process'; import {once} from 'node:events';
import {createRequire} from 'node:module'; import fsSync from 'node:fs'; import {fileURLToPath} from 'node:url';
import {stub} from './timeline_stub.mjs';
import {validateRetention} from './retention.mjs';

const arg = k => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : null; };
const has = k => process.argv.includes(k);
function loadPlaywright() {
  const here = path.dirname(fileURLToPath(import.meta.url)); let local = {};
  try { local = JSON.parse(fsSync.readFileSync(path.join(here, 'local.json'), 'utf8')); } catch {}
  for (const t of [process.env.PLAYWRIGHT_FROM, local.playwright_from, path.join(process.cwd(), 'package.json'), fileURLToPath(import.meta.url)].filter(Boolean)) {
    try { return createRequire(t)('playwright'); } catch {}
  }
  throw new Error('找不到 playwright：npm i playwright，或在 scripts/local.json 寫 playwright_from 指向裝了它的 package.json');
}
let LOCAL = {}; try { LOCAL = JSON.parse(fsSync.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'local.json'), 'utf8')); } catch {}
const FF = process.env.FFMPEG ?? LOCAL.ffmpeg ?? 'ffmpeg';
const here = path.resolve(arg('--dir') ?? '.'), PAGE = arg('--page') ?? 'index.html';
// 舞臺尺寸寫在入口頁裡：window.STAGE={w:1080,h:1920} 是直式，沒寫就是 1920×1080。--h 一律是短邊：橫式 720 → 1280×720，直式 720 → 720×1280
let SW = 1920, SH = 1080; try { const m = fsSync.readFileSync(path.join(here, PAGE), 'utf8').match(/STAGE\s*=\s*\{\s*w\s*:\s*(\d+)\s*,\s*h\s*:\s*(\d+)/); if (m) { SW = +m[1]; SH = +m[2]; } } catch {}
const VERT = SH > SW, H = Number(arg('--h') ?? 720), VW = VERT ? H : Math.round(H * SW / SH / 2) * 2, VH = VERT ? Math.round(H * SH / SW / 2) * 2 : H, out = arg('--out') ? path.resolve(arg('--out')) : path.join(here, 'out');
await fs.mkdir(out, {recursive: true});
const T = JSON.parse(await fs.readFile(path.join(here, 'timeline.json'), 'utf8'));
// 文案和時間線對不對得上：script.json 改過、timeline.json 沒重算時，後面報的"句子裡找不到某個詞"全是誤導（報的是舊句子），先在這裡攔住
const TS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'timeline_stub.mjs');
function staleTimeline() {
  const sp = path.join(here, 'script.json'); if (!fsSync.existsSync(sp)) return null;
  let S; try { S = JSON.parse(fsSync.readFileSync(sp, 'utf8')); } catch (e) { return {err: true, msg: `script.json 不是合法的 JSON（${e.message}）：逗號、引號、括號對一下`}; }
  if (T.stub) {
    let E; try { E = stub(S); } catch (e) { return {err: true, msg: e.message}; }
    const sig = t => JSON.stringify([t.pre, t.title, t.beats.map(b => [b.id, b.text, b.start, b.end]), (t.inserts ?? []).map(i => [i.id, i.start, i.end])]);
    if (sig(E) !== sig(T)) return {err: true, msg: `script.json 改過了，timeline.json 還是按舊文案估的：先重跑 node "${TS}" "${sp}"，再查（每改一次 script.json 都要重跑）`};
  } else {
    const a = (S.lines ?? []).map(l => `${l.id}|${l.text}|${l.bite ? 1 : 0}`).join('\n') + `|${S.title?.after ?? ''}`;
    const b = T.beats.map(x => `${x.id}|${x.text}|${(T.inserts ?? []).some(i => i.after === x.id) ? 1 : 0}`).join('\n') + `|${T.title ? (S.title?.after ?? '') : ''}`;
    if (a !== b) return {err: false, msg: 'script.json 的文案（句子、原聲插段、片名位置）和配音出的時間線（timeline.json）對不上：改了文案就要重新配音、重出時間線（temp_voice.py，或豆包配音後再對齊）'};
  }
  return null;
}
// New films have a retention plan. Legacy/demo films remain compatible.
if (!arg('--worker') && (has('--check') || has('--video'))) {
  const rp = path.join(here, 'retention.json');
  if (fsSync.existsSync(rp)) {
    try {
      const plan = JSON.parse(fsSync.readFileSync(rp, 'utf8'));
      const script = JSON.parse(fsSync.readFileSync(path.join(here, 'script.json'), 'utf8'));
      const report = validateRetention(plan, script, T);
      await fs.writeFile(path.join(out, 'retention-check.json'), JSON.stringify(report,null,2));
      for (const msg of report.warnings) console.warn('[retention] '+msg);
      if (report.errors.length) {
        for (const msg of report.errors) console.error('[retention] '+msg);
        process.exit(2);
      }
      console.log('[retention] 結構檢查通過；仍須人工語意與成片審查');
    } catch (e) { console.error('[retention] '+e.message); process.exit(2); }
  } else if (fsSync.existsSync(path.join(here, '.retention-required'))) {
    console.error('[retention] 新片缺少 retention.json'); process.exit(2);
  } else console.warn('[retention] 舊片或示例沒有留存台帳，未執行留存檢查');
}
const STALE = arg('--worker') ? null : staleTimeline();
if (STALE) console.log((STALE.err ? '時間線要先重算：' : '注意：') + STALE.msg);
if (STALE?.err && has('--check')) process.exit(2);
const {chromium} = loadPlaywright();
const mime = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.TTF': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2'};
const worker = arg('--worker');
let server, port = Number(arg('--port'));
if (!worker) {
  server = http.createServer(async (q, r) => {
    try { const p = path.join(here, decodeURIComponent(new URL(q.url, 'http://x').pathname)); const b = await fs.readFile(p); r.writeHead(200, {'Content-Type': mime[path.extname(p)] ?? 'application/octet-stream'}).end(b); }
    catch { r.writeHead(404).end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r)); port = server.address().port;
}
async function page() {
  const opt = {args: ['--force-color-profile=srgb', '--disable-lcd-text']};
  let b; try { b = await chromium.launch(opt); } catch (e) { b = await chromium.launch({...opt, channel: 'msedge'}).catch(() => { throw e; }); }
  const p = await b.newPage({viewport: {width: VW, height: VH}}); const errs = [], warns = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); else if (m.type() === 'warning' && /^\[(moves|kit)\]/.test(m.text())) warns.push(m.text()); });
  p.on('requestfailed', q => errs.push('請求失敗 ' + q.url())); p.on('response', s => { if (s.status() >= 400) errs.push(s.status() + ' ' + s.url()); });
  await p.goto(`http://127.0.0.1:${port}/${PAGE}`);
  try { await p.evaluate(() => window.ready); }
  catch (e) {
    // Playwright 包的那層（page.evaluate: Error: ……）和程式碼位置不給人看，只留我們自己寫的那句話
    const msg = e.message.replace(/^page\.evaluate:\s*/, '').replace(/^(Uncaught\s+)?(Type|Reference|Syntax|Range)?Error:\s*/, '').split('\n').filter(l => !/^\s+at /.test(l)).slice(0, 30).join('\n');
    const more = [...new Set(errs)].map(m => m.replace(/^(Uncaught\s+)?Error:\s*/, '')).filter(m => !msg.includes(m.split('\n')[0]));
    console.error('頁面沒跑起來，先改這裡：\n' + msg + (more.length ? '\n另外頁面還報了：\n- ' + more.slice(0, 8).join('\n- ') : ''));
    await b.close(); process.exit(3);
  }
  return {b, p, errs, warns};
}
if (arg('--stills')) {
  const {b, p, errs, warns} = await page(); const ts = arg('--stills').split(',').map(Number);
  for (const t of ts) { await p.evaluate(t => window.seek(t), t); await p.screenshot({path: path.join(out, `still_${t.toFixed(2)}.png`)}); }
  await b.close(); server.close(); if (errs.length) console.log('頁面報錯（先修再看幀）：', [...new Set(errs)].slice(0, 8));
  if (warns.length) console.log([...new Set(warns)].join('\n')); console.log('stills', ts.length); process.exit(0);
}
// ---------- 模板檔：查鏡頭表（kit.js 的 K.film 登記的） ----------
if (has('--check')) {
  const {b, p, errs} = await page();
  const r = await p.evaluate(() => window.KIT_REPORT ?? null);
  await b.close(); server.close();
  if (errs.length) console.log('頁面報錯（先修）：\n- ' + [...new Set(errs)].slice(0, 8).join('\n- '));
  if (!r) { console.log('頁面裡沒有鏡頭表：film.js 沒用 K.film（手寫的影片用 --moves 查手法）'); process.exit(0); }
  fsSync.writeFileSync(path.join(out, 'check.json'), JSON.stringify(r, null, 1));   // 同一份鏡頭表和提醒，給別的指令碼讀（kit/gallery/make.py）
  console.log('鏡  時間            時長   場景        接法       says');
  for (const s of r.shots) console.log(`${String(s.i + 1).padStart(2)}  ${s.t0.toFixed(1).padStart(5)}–${s.t1.toFixed(1).padEnd(6)} ${(s.t1 - s.t0).toFixed(1).padStart(4)}s  ${s.scene.padEnd(10)} ${s.enter.padEnd(10)} ${s.says || '（沒寫）'}`);
  console.log(r.warns.length ? `\n要看一眼（${r.warns.length} 條）：\n- ` + r.warns.join('\n- ') : '\n沒有要提醒的。');
  console.log('過了不等於好看：再跑 --sheet 看圖。');
  process.exit(errs.length ? 2 : 0);
}
// ---------- 模板檔：每一鏡開頭、中間、末尾三幀拼一張圖 ----------
if (has('--sheet')) {
  const {b, p, errs, warns} = await page();
  const shots = await p.evaluate(() => window.KIT_REPORT?.shots ?? (window.FB?.shots ?? []).map((s, i) => ({i, t0: s.t0, t1: s.t1, scene: '', says: ''})));
  const cells = [];
  for (const s of shots) for (const [k, t] of [['開頭', Math.min(s.t1 - .05, s.t0 + .35)], ['中間', (s.t0 + s.t1) / 2], ['末尾', Math.max(s.t0, s.t1 - .12)]]) {
    await p.evaluate(t => window.seek(t), t);
    cells.push({i: s.i, k, t, src: 'data:image/jpeg;base64,' + (await p.screenshot({type: 'jpeg', quality: 80})).toString('base64')});
  }
  const esc = x => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = shots.map(s => `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #333"><div style="width:230px;font-size:15px;line-height:1.45"><b style="font-size:20px;color:#fff">${s.i + 1} ${esc(s.scene)}</b><br>${s.t0.toFixed(1)}–${s.t1.toFixed(1)} 秒<br>${esc(s.says)}</div>` +
    cells.filter(c => c.i === s.i).map(c => `<div style="position:relative"><img src="${c.src}" style="width:${VERT ? 240 : 480}px;height:${VERT ? 427 : 270}px;display:block"><span style="position:absolute;left:6px;top:4px;font-size:13px;background:#000a;padding:1px 6px">${c.k} ${c.t.toFixed(2)}</span></div>`).join('') + '</div>').join('');
  const sp = await b.newPage({viewport: {width: VERT ? 990 : 1720, height: 600}});
  await sp.setContent(`<html><body style="margin:0;background:#111;color:#ccc;font-family:'Microsoft JhengHei',sans-serif">${rows}</body></html>`, {waitUntil: 'load'});
  await sp.screenshot({path: path.join(out, 'sheet.png'), fullPage: true});
  await b.close(); server.close();
  if (errs.length) console.log('頁面報錯（先修再看圖）：\n- ' + [...new Set(errs)].slice(0, 8).join('\n- '));
  if (warns.length) console.log([...new Set(warns)].join('\n'));
  console.log(`${shots.length} 鏡 → ${path.join(out, 'sheet.png')}`); process.exit(0);
}
// ---------- 手法用量（moves.js 記下的） ----------
const TRANS = new Set(['pushSwap', 'pushThrough', 'blurToBase', 'frameFill']);   // 進場的轉場
function lcs(a, b) { const d = Array.from({length: a.length + 1}, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]);
  return d[a.length][b.length]; }
function movesReport({log, shots}) {
  const order = [...shots.keys()].sort((a, b) => shots[a][0] - shots[b][0]), by = new Map();
  for (const e of log) { if (!by.has(e.shot)) by.set(e.shot, []); by.get(e.shot).push(e); }
  for (const es of by.values()) es.sort((a, b) => a.t - b.t);
  const uses = k => by.get(k) ?? [];
  console.log('鏡   時間            用了哪些手法（why）');
  order.forEach((k, i) => console.log(`${String(i + 1).padStart(2)}  ${shots[k][0].toFixed(1).padStart(5)}–${shots[k][1].toFixed(1).padEnd(6)}  ${uses(k).length ? uses(k).map(e => `${e.move}（${e.why || '沒寫 why'}）`).join('；') : '手寫'}`));
  const flags = [];
  for (let i = 1; i < order.length; i++) { const a = uses(order[i - 1]).map(e => e.move);
    for (const e of uses(order[i])) if (TRANS.has(e.move) && a.includes(e.move)) flags.push(`第 ${i}、${i + 1} 鏡連著用 ${e.move} 進場：同一種接法連用，觀眾會看出套路`); }
  for (const m of new Set(log.map(e => e.move))) { let r = 0, prev = false;
    for (const k of order) { const on = uses(k).some(e => e.move === m); if (on && !prev) r++; prev = on; }
    if (r >= 3) flags.push(`${m} 用了 ${r} 段：每一處的意思都對得上嗎？對不上的改成手寫`); }
  const nowhy = log.filter(e => !e.why); if (nowhy.length) flags.push(`${nowhy.length} 處沒寫 why（${[...new Set(nowhy.map(e => e.move))].join('、')}）：說不出這一下在說什麼，就別用`);
  const lib = order.filter(k => by.has(k)).length;
  console.log(`\n${order.length} 鏡：${lib} 鏡用了手法庫，${order.length - lib} 鏡全手寫`);
  if (order.length >= 8 && lib === order.length) flags.push('沒有一鏡是手寫的：檢查有沒有為了套手法去改畫面');
  const seq = order.flatMap(k => uses(k).map(e => e.move));
  if (arg('--prev')) { const pv = JSON.parse(fsSync.readFileSync(arg('--prev'), 'utf8')).seq ?? [], m = Math.min(seq.length, pv.length), r = m ? lcs(seq, pv) / m : 0;
    console.log(`和上一支片的手法順序重合 ${(r * 100).toFixed(0)}%`);
    if (m >= 5 && r >= .6) flags.push(`手法順序和上一支片重合 ${(r * 100).toFixed(0)}%：鏡頭是不是照著上一條排的？`); }
  fsSync.writeFileSync(path.join(out, 'moves.json'), JSON.stringify({seq, log, shots}, null, 1));
  console.log(flags.length ? '\n要看一眼：\n- ' + flags.join('\n- ') : '\n沒有要提醒的。');
  console.log('過了不等於用對：每一處還要對得上那句話的意思。');
}
if (has('--moves')) {
  const {b, p, errs} = await page();
  const r = await p.evaluate(async () => { const T = window.timeline, n = Math.ceil(T.duration * 30);
    for (let f = 0; f < n; f++) await window.seek(f / 30, true);
    return {log: window.MV?.LOG ?? null, shots: (window.FB?.shots ?? []).map(s => [s.t0, s.t1])}; });
  await b.close(); server.close();
  if (errs.length) console.log('頁面報錯（先修）：', [...new Set(errs)].slice(0, 8));
  if (!r.log) console.log('頁面裡沒有載入 moves.js，沒有可查的手法'); else movesReport(r);
  process.exit(0);
}
const fps = T.fps ?? 30, N = Math.ceil(T.duration * fps);
if (worker) {
  const [a, z] = worker.split(':').map(Number); const {b, p, errs} = await page();
  const enc = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(fps), '-i', 'pipe:0', '-c:v', 'libx264', '-preset', 'medium', '-threads', String(arg('--threads') ?? 4),   // 工作室規矩：ffmpeg 限 4 執行緒
    '-crf', H >= 1080 ? '14' : '18', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(out, `seg_${H}_${a}.mp4`)], {stdio: ['pipe', 'ignore', 'inherit']});
  for (let f = a; f < z; f++) { await p.evaluate(t => window.seek(t), f / fps); const buf = await p.screenshot({type: 'jpeg', quality: H >= 1080 ? 96 : 92}); if (!enc.stdin.write(buf)) await once(enc.stdin, 'drain'); }
  enc.stdin.end(); await once(enc, 'exit'); await b.close(); if (errs.length) { console.error([...new Set(errs)].slice(0, 5)); process.exit(2); } process.exit(0);
}
if (!has('--video')) { console.log('用 --stills 或 --video'); server.close(); process.exit(1); }
const RG = arg('--range'), F0 = RG ? Math.round(Number(RG.split(':')[0]) * fps) : 0, F1 = RG ? Math.min(N, Math.round(Number(RG.split(':')[1]) * fps)) : N;
// 併發路數：每路一個瀏覽器頁 + 一個 ffmpeg。1080p 一路開渲幾秒內就多佔約 2G（2026-11-05 實測：記憶體提交 85% → 95%，ffmpeg 限 4 執行緒也一樣），開之前留夠餘量。16G 記憶體的機器預設 2 路
const K = Number(arg('--workers') ?? 2), size = Math.ceil((F1 - F0) / K), starts = []; const t0 = Date.now();
await Promise.all(Array.from({length: K}, (_, i) => { const a = F0 + i * size, z = Math.min(F1, a + size); if (a >= z) return null; starts.push(a);
  return new Promise((res, rej) => { const c = spawn(process.execPath, [fileURLToPath(import.meta.url), '--dir', here, '--page', PAGE, '--out', out, '--worker', `${a}:${z}`, '--port', String(port), '--h', String(H)], {stdio: 'inherit'}); c.on('exit', x => x === 0 ? res() : rej(new Error('worker ' + a))); }); }));
starts.sort((a, b) => a - b);
await fs.writeFile(path.join(out, `list_${H}.txt`), starts.map(s => `file 'seg_${H}_${s}.mp4'`).join('\n'));
const vout = path.join(out, RG ? `visual_${H}_range.mp4` : `visual_${H}.mp4`);
await new Promise((res, rej) => { const c = spawn(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(out, `list_${H}.txt`), '-c', 'copy', vout], {stdio: 'inherit'}); c.on('exit', x => x === 0 ? res() : rej()); });
server.close(); console.log('rendered', F1 - F0, 'frames in', ((Date.now() - t0) / 1000).toFixed(1), 's ->', vout);
// 空畫面檢查：一段畫面幾乎是純色（標籤沒閉合把一鏡套進上一鏡一起藏了、圖片 404、時刻算錯都會這樣）。
// 《谷歌給蘋果的兩百億》1080p 結尾 3.5 秒就是這樣空著交出去的：改頁面後只看了兩張靜幀。看不了圖也能靠這條提醒發現。
await new Promise(res => {
  const c = spawn(FF, ['-v', 'error', '-i', vout, '-vf', 'scale=64:36', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], {stdio: ['ignore', 'pipe', 'inherit']});
  const bufs = []; c.stdout.on('data', d => bufs.push(d));
  c.on('exit', () => {
    const all = Buffer.concat(bufs), n = 64 * 36, runs = []; let s = -1, f = 0;
    for (; (f + 1) * n <= all.length; f++) {
      let m = 0, q = 0; for (let i = f * n; i < (f + 1) * n; i++) { m += all[i]; q += all[i] * all[i]; }
      m /= n; const blank = Math.sqrt(Math.max(0, q / n - m * m)) < 3;
      if (blank && s < 0) s = f; else if (!blank && s >= 0) { runs.push([s, f]); s = -1; }
    }
    if (s >= 0) runs.push([s, f]);
    const bad = runs.filter(([a, z]) => z - a >= fps * .3).map(([a, z]) => `${((F0 + a) / fps).toFixed(2)}–${((F0 + z) / fps).toFixed(2)} 秒`);
    if (bad.length) console.log(`畫面是空的（幾乎純色，什麼都沒有）：${bad.join('、')}。查這幾秒的鏡頭：是不是被上一鏡的容器套住一起藏了（HTML 標籤沒閉合）、圖片路徑 404、時刻算錯。`);
    res();
  });
});
