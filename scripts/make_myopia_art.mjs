// 《台灣學童近視：近十年全國資料》原創背景插畫（程式產生 SVG，非照片、非 AI 生圖、非真實學校）。
// 用法：node scripts/make_myopia_art.mjs <影片目錄>
import fs from 'node:fs';
import path from 'node:path';
const D = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!D) throw Error('Usage: node scripts/make_myopia_art.mjs <film-directory>');
const out = path.join(D, 'assets', 'img'); fs.mkdirSync(out, {recursive: true});
// V4.1 視覺 DNA：海軍藍底、深藍綠、暖琥珀、紙感點紋；品牌黃只做重點
function shell(content, label) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">',
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#18263A"/><stop offset=".6" stop-color="#1d3a40"/><stop offset="1" stop-color="#6e5a43"/></linearGradient>',
    '<radialGradient id="glow"><stop stop-color="#FFD45C" stop-opacity=".22"/><stop offset="1" stop-color="#FFD45C" stop-opacity="0"/></radialGradient>',
    '<pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#F5F1E6" opacity=".16"/></pattern></defs>',
    '<rect width="1080" height="1920" fill="url(#bg)"/><rect width="1080" height="1920" fill="url(#dots)"/>',
    '<ellipse cx="540" cy="860" rx="700" ry="640" fill="url(#glow)"/>',
    content,
    '<g font-family="Noto Sans TC,sans-serif"><text x="75" y="1660" font-size="27" fill="#F5F1E6" letter-spacing="6" opacity=".8">UNCLE / 視光資料</text>',
    '<text x="75" y="1716" font-size="28" fill="#F5F1E6" opacity=".8">原創示意插畫・虛構情境</text>',
    '<text x="75" y="1780" font-size="24" fill="#b9cbc6">' + label + '</text></g>',
    '</svg>'].join('');
}
// 教室：黑板＋課桌＋學生背影（不畫臉，不冒充真實學生）
const kids = [];
for (let i = 0; i < 6; i++) {
  const x = 230 + (i % 3) * 310, y = 1080 + Math.floor(i / 3) * 230, c = ['#d9a66b', '#5f8f8a', '#c98a5e'][i % 3];
  kids.push(`<g transform="translate(${x} ${y})"><rect x="-120" y="70" width="240" height="26" rx="10" fill="#a9845a"/><path d="M-62 70c0-70 124-70 124 0z" fill="${c}"/><circle cx="0" cy="-8" r="46" fill="#2d2622"/></g>`);
}
const classroom = [
  '<rect x="110" y="380" width="860" height="470" rx="26" fill="#2f5a4c" stroke="#a9845a" stroke-width="22"/>',
  '<g stroke="#F5F1E6" stroke-width="10" stroke-linecap="round" opacity=".8"><path d="M200 500h300M200 590h420M200 680h250"/></g>',
  '<g fill="#F5F1E6" opacity=".85"><circle cx="760" cy="560" r="40"/><rect x="720" y="640" width="80" height="16" rx="8"/></g>',
  '<rect x="140" y="855" width="800" height="18" rx="8" fill="#8c6b46"/>',
  kids.join('')].join('');
// 屈光檢查：簡化的驗光儀與鏡片（簡化光學示意）
const refraction = [
  '<g transform="translate(540 820)">',
  '<rect x="-380" y="-170" width="760" height="340" rx="150" fill="#e9e1cf" stroke="#9c8a6a" stroke-width="12"/>',
  '<circle cx="-180" cy="0" r="120" fill="#18263A" stroke="#5f8f8a" stroke-width="22"/><circle cx="180" cy="0" r="120" fill="#18263A" stroke="#5f8f8a" stroke-width="22"/>',
  '<circle cx="-180" cy="0" r="62" fill="#FFD45C" opacity=".35"/><circle cx="180" cy="0" r="62" fill="#FFD45C" opacity=".35"/>',
  '<rect x="-30" y="-300" width="60" height="140" rx="20" fill="#b9a988"/>',
  '</g>',
  '<g font-family="Noto Sans TC,sans-serif"><text x="540" y="1120" font-size="40" fill="#F5F1E6" text-anchor="middle" opacity=".85">簡化光學示意</text></g>'].join('');
// 視力篩檢：E 字視力表（原創排列）
const rows = [[160, 1], [120, 2], [90, 3], [66, 4], [48, 5], [34, 6]];
let ys = 470, es = [];
for (const [s, n] of rows) {
  const w = n * s * 1.5, x0 = 540 - w / 2 + s * .25;
  for (let j = 0; j < n; j++) {
    const r = [0, 90, 180, 270][(j * 3 + n) % 4], x = x0 + j * s * 1.5;
    es.push(`<g transform="translate(${x + s / 2} ${ys + s / 2}) rotate(${r})"><path d="M${-s / 2} ${-s / 2}h${s}v${s / 5}h${-s * .8}v${s / 5}h${s * .8}v${s / 5}h${-s * .8}v${s / 5}h${s * .8}v${s / 5}h${-s}z" fill="#18263A"/></g>`);
  }
  ys += s + 46;
}
const screening = ['<rect x="190" y="400" width="700" height="980" rx="24" fill="#F5F1E6" stroke="#a9845a" stroke-width="14"/>', es.join('')].join('');
for (const [name, art, caption] of [['classroom', classroom, '教室示意（非真實學校）'], ['refraction', refraction, '屈光檢查示意'], ['screening', screening, '學校視力篩檢示意']]) {
  const dest = path.join(out, name + '.svg'); fs.writeFileSync(dest, shell(art, caption));
  const xml = fs.readFileSync(dest, 'utf8');
  if (xml.length < 1300 || !xml.includes('viewBox="0 0 1080 1920"') || !xml.endsWith('</svg>')) throw Error('SVG structure invalid: ' + name);
  console.log('ORIGINAL_SVG ' + name + ' ' + xml.length + ' bytes');
}
