// 把英數字型從 npm 套件複製到 fonts/（npm install 時自動跑）。中文字型用系統的 Noto Sans TC，或自己放進 fonts/。
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const SK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), F = path.join(SK, 'fonts'), NM = path.join(SK, 'node_modules');
fs.mkdirSync(F, {recursive: true});
const L = [['@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2', 'BebasNeue-Regular.woff2'],
  ['@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2', 'Montserrat-VF.woff2'],
  ['@fontsource-variable/montserrat/files/montserrat-latin-wght-italic.woff2', 'Montserrat-Italic-VF.woff2']];
for (const [a, b] of L) { const s = path.join(NM, a); if (fs.existsSync(s)) { fs.copyFileSync(s, path.join(F, b)); console.log('字型 OK：', b); } else console.warn('找不到', a); }
