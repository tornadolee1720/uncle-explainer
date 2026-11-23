// 新聞/報告原文截圖 + 關鍵詞位置（畫熒光筆用）。
//   node snap_news.mjs jobs.json [只截的id…]
// jobs.json：[{"id":"burn","url":"https://…","find":["$280 billion by 2030","$278 billion"],"off":140}]
//   要截正文中段：加 "to":"正文裡的一句話"，頁面滾到那句話離頂 off 畫素（不寫 to = 滾到標題）
// 輸出：<jobs 同目錄>/docs/<id>.png（1600×1000 視口、2 倍畫素）和 docs/news.json：
//   {id:{url,title,h1:[x,y,w,h],hits:[{k,tag,rects:[[x,y,w,h],…]}]}}，座標是網頁 CSS 畫素，折行的詞會有多個框。
// 做法：攔廣告和同意彈窗的域名 → 去掉所有 fixed/sticky 的大浮層 → 標題滾到離頂 off 畫素 → 等字型 → 量 → 截。
// 先量後截、都在字型載入完以後，不然熒光筆和字會對不齊。頁面被驗證碼攔住就別硬截：用核實過的文字自己排版，不放真實網站的標誌和名字。
import {createRequire} from 'node:module'; import fsSync from 'node:fs'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
function loadPlaywright() {
  const here = path.dirname(fileURLToPath(import.meta.url)); let local = {};
  try { local = JSON.parse(fsSync.readFileSync(path.join(here, 'local.json'), 'utf8')); } catch {}
  for (const t of [process.env.PLAYWRIGHT_FROM, local.playwright_from, path.join(process.cwd(), 'package.json'), fileURLToPath(import.meta.url)].filter(Boolean)) {
    try { return createRequire(t)('playwright'); } catch {}
  }
  throw new Error('找不到 playwright：npm i playwright，或在 scripts/local.json 寫 playwright_from 指向裝了它的 package.json');
}
const {chromium} = loadPlaywright();
const jobsPath = path.resolve(process.argv[2]); const ONLY = process.argv.slice(3);
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8')); const outDir = path.join(path.dirname(jobsPath), 'docs');
fs.mkdirSync(outDir, {recursive: true});
const metaPath = path.join(outDir, 'news.json'); const out = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
const AD = /doubleclick|googlesyndication|googletagservices|iclick|adservice|adsystem|taboola|outbrain|criteo|pubmatic|rubicon|teads|innity|adnxs|smartadserver|onesignal|survey|admanager|prebid|consent|cookielaw|onetrust|privacy-mgmt|sp-prod|piano|tinypass/;
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 1600, height: 1000}, deviceScaleFactor: 2, locale: 'en-US',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});
await ctx.route('**/*', r => AD.test(new URL(r.request().url()).hostname) ? r.abort() : r.continue());
const strip = () => { for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if ((cs.position === 'fixed' || cs.position === 'sticky') && e.getBoundingClientRect().height > 40) e.remove(); }
  document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto'; document.body.style.filter = 'none'; };
for (const j of jobs) {
  if (ONLY.length && !ONLY.includes(j.id)) continue;
  const p = await ctx.newPage();
  try { await p.goto(j.url, {waitUntil: 'domcontentloaded', timeout: 45000}); } catch (e) { console.log(j.id, '打不開', e.message.split('\n')[0]); }
  await p.waitForTimeout(5000);
  for (let k = 0; k < 3; k++) { try { await p.evaluate(strip); } catch {} await p.waitForTimeout(800); }
  // 預設把標題滾到離頂 off 畫素；寫了 to（正文裡的一句話）就滾到那句話（要證據在正文中段時用）
  await p.evaluate(([o, to]) => { let el = document.querySelector('h1');
    if (to) { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.includes(to)) { el = n.parentElement; break; } }
    if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - o)); }, [j.off ?? 140, j.to ?? null]);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500); try { await p.evaluate(strip); } catch {}
  const info = await p.evaluate(words => {
    const h = document.querySelector('h1'); const hr = h ? h.getBoundingClientRect() : null; const hits = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) for (const k of words) { const i = n.textContent.indexOf(k); if (i < 0) continue;
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + k.length); const bb = r.getBoundingClientRect();
      if (bb.width > 0 && bb.top > 0 && bb.top < innerHeight) hits.push({k, tag: n.parentElement.tagName, rects: [...r.getClientRects()].map(q => [q.left, q.top, q.width, q.height].map(v => Math.round(v * 10) / 10))}); }
    return {h1: hr ? [hr.left, hr.top, hr.width, hr.height].map(Math.round) : null, h1text: h ? h.innerText : '', hits};
  }, j.find ?? []);
  await p.screenshot({path: path.join(outDir, `${j.id}.png`)});
  const title = await p.title(); out[j.id] = {url: j.url, title, ...info};
  const blocked = /驗證|captcha|apolog|blocked|access denied/i.test(title + info.h1text);
  console.log(j.id, blocked ? '【可能被攔了，看截圖】' : '', '|', (info.h1text || title).slice(0, 80), '| 命中', info.hits.length);
  await p.close();
}
fs.writeFileSync(metaPath, JSON.stringify(out, null, 1)); await b.close();
