// 一條命令建影片（模板檔）：頁面 + 底座 + 模板庫 + 紋理 + 字型 + 估出來的時間線，建完就能 render.mjs --stills。
//   node scripts/new_film.mjs <影片目錄>            新片：film.js 是帶註釋的鏡頭表起點，script.json 是三句示例
//   node scripts/new_film.mjs <影片目錄> --demo     示例片：每個場景用一次（kit/demo/），看模板長什麼樣、照著抄寫法
//   node scripts/new_film.mjs <影片目錄> --demo2    示例片二：後加的 11 個場景各用一次（kit/demo2/）
//   node scripts/new_film.mjs <影片目錄> --vertical 直式新片（1080×1920）：starter-v/ 起步，場景查 kit/VERTICAL.md
//   node scripts/new_film.mjs <影片目錄> --demo-v   直式示例片：不帶口播的直式場景各用一次（kit/demo-v/）
//   node scripts/new_film.mjs <影片目錄> --sync     老影片：只把 lib/ 和 assets/kit/ 更新到 skill 的最新版（film.js、素材不動）
// 字型不拷：fonts/ 是指向字型目錄的聯接，聯接建不了才拷。字型目錄寫在 scripts/local.json 的 fonts_dir（沒寫就用 skill 裡的 fonts/）。
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
import {stub} from './timeline_stub.mjs';

const SK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), dst = args.find(a => !a.startsWith('--')), DEMO2 = args.includes('--demo2'), DEMOV = args.includes('--demo-v'), VERT = DEMOV || args.includes('--vertical'), DEMO = DEMO2 || DEMOV || args.includes('--demo'), SYNC = args.includes('--sync');
if (!dst) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 8).join('\n')); process.exit(1); }
const D = path.resolve(dst);
let local = {}; try { local = JSON.parse(fs.readFileSync(path.join(SK, 'scripts/local.json'), 'utf8')); } catch {}
const FONTS = path.resolve(local.fonts_dir ?? path.join(SK, 'fonts'));
const LIB = ['scripts/stage25d.js', 'scripts/film_base.js', 'scripts/moves.js', 'kit/kit.js', 'kit/scenes.js', 'kit/scenes_plus.js', 'kit/host.js', 'kit/kit.css', 'kit/vert.js', 'kit/vert.css', 'kit/vpro.js', 'kit/vpro.css', 'kit/uncle.js'];
const cp = (a, b) => { fs.mkdirSync(path.dirname(b), {recursive: true}); fs.copyFileSync(a, b); };

function copyLib() {
  for (const f of LIB) cp(path.join(SK, f), path.join(D, 'lib', path.basename(f)));
  for (const f of ['fabric.jpg', 'grain.png', 'worldmap.png']) cp(path.join(SK, 'kit/assets', f), path.join(D, 'assets/kit', f));
  for (const f of fs.readdirSync(path.join(SK, 'kit/assets/ph'))) cp(path.join(SK, 'kit/assets/ph', f), path.join(D, 'assets/kit/ph', f));
}
function linkFonts() {
  const to = path.join(D, 'fonts');
  if (fs.existsSync(to)) return;
  if (!fs.existsSync(FONTS)) { console.warn(`沒找到字型目錄 ${FONTS}：會退到系統字型（Noto Sans TC / 微軟雅黑），樣子不對。在 scripts/local.json 裡寫 fonts_dir，字型清單見 README`); return; }
  try { fs.symlinkSync(FONTS, to, 'junction'); }
  catch { fs.mkdirSync(to); for (const f of fs.readdirSync(FONTS)) if (/\.(ttf|otf|woff2?)$/i.test(f)) fs.copyFileSync(path.join(FONTS, f), path.join(to, f)); }
}

if (SYNC) {
  if (!fs.existsSync(path.join(D, 'index.html'))) { console.error(`${D} 不是影片目錄（沒有 index.html）`); process.exit(1); }
  copyLib(); linkFonts();
  console.log(`已更新 ${D}\\lib 和 assets\\kit 到 skill 的最新版。先 --stills 看幾幀，確認老鏡頭沒有變樣。`);
  process.exit(0);
}
if (fs.existsSync(D) && fs.readdirSync(D).length) { console.error(`目標已存在且不是空的：${D}`); process.exit(1); }
fs.mkdirSync(D, {recursive: true});
const src = path.join(SK, DEMOV ? 'kit/demo-v' : VERT ? 'starter-v' : DEMO2 ? 'kit/demo2' : DEMO ? 'kit/demo' : 'starter'), ST = VERT ? 'starter-v' : 'starter';
cp(path.join(SK, ST, 'index.html'), path.join(D, 'index.html'));
cp(path.join(SK, ST, 'film.css'), path.join(D, 'film.css'));
cp(path.join(src, 'film.js'), path.join(D, 'film.js'));
cp(path.join(src, 'script.json'), path.join(D, 'script.json'));
copyLib(); linkFonts();
if (!DEMO) {
  fs.writeFileSync(path.join(D, '.retention-required'), '3\n');
  fs.writeFileSync(path.join(D, 'attention-plan.json'), JSON.stringify({version:1,attention:null,visual:null,viral:null,review:null},null,2)+'\n');
  fs.writeFileSync(path.join(D, 'retention.json'), JSON.stringify({version:1,mode:'explainer',promise:'',beats:[],editorial:{}}, null, 2)+'\n');
}
for (const d of ['assets/img', 'assets/clips', 'assets/cut', 'voice', 'out']) fs.mkdirSync(path.join(D, d), {recursive: true});
fs.writeFileSync(path.join(D, 'assets/clips/counts.json'), '{}');
const tl = stub(JSON.parse(fs.readFileSync(path.join(D, 'script.json'), 'utf8')));
fs.writeFileSync(path.join(D, 'timeline.json'), JSON.stringify(tl, null, 1));
const R = path.join(SK, 'scripts/render.mjs'), TS = path.join(SK, 'scripts/timeline_stub.mjs');
console.log(`建好了：${D}（估出來的時間線 ${tl.duration} 秒，還沒有配音）`);
console.log('下一步：');
const steps = DEMO ? [] : [
  `寫 script.json（文案，一句一個 id，寫法見 kit/README.md「文案 script.json」）`,
  `node "${TS}" "${path.join(D, 'script.json')}"    重算時間線（每改一次 script.json 就重跑一次）`,
  `寫 film.js（每鏡先想 says，再從 ${VERT ? 'kit/VERTICAL.md' : 'kit/README.md'} 的表裡選場景）`];
steps.push(`node "${R}" --dir "${D}" --check            查鏡頭表（幾秒鐘，不渲染），改到零錯誤`,
  `node "${R}" --dir "${D}" --sheet            每鏡三幀拼一張圖（out/sheet.png），自己先看一遍`,
  `node "${R}" --dir "${D}" --video --h 720    渲 720p 預覽（沒聲音${VERT ? '，直式出來是 720×1280' : ''}）`);
steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
if (DEMO) console.log('  示例片的寫法在 film.js，每個場景的引數見 ' + (VERT ? 'kit/VERTICAL.md' : 'kit/README.md'));
console.log(`注意：fonts\\ 是指向字型目錄的聯接。刪這個影片目錄前先拆聯接（只刪聯接，不刪字型）：node -e "require('fs').rmdirSync(process.argv[1])" "${path.join(D, 'fonts')}"，再刪目錄。`);
