// 《台灣學童近視》50 秒精簡版鏡頭表＋證據 Gate（Fail Closed）。
// 用法：node scripts/build_myopia_short.mjs tests/myopia-national <影片目錄>
import fs from 'node:fs';
import path from 'node:path';
const [testDir, dir] = process.argv.slice(2);
if (!testDir || !dir) throw Error('Usage: node scripts/build_myopia_short.mjs tests/myopia-national <film-dir>');
const D = path.resolve(dir);
const rd = f => JSON.parse(fs.readFileSync(path.join(testDir, f), 'utf8'));
const AUD = rd('EVIDENCE_AUDIT.json'), L = rd('narration_short.json').lines;
const need = (x, e) => { if (!x) throw Error('MYOPIA_SHORT_GATE_BLOCK: ' + e); };
const C = new Map(AUD.claims.map(c => [c.claim_id, c]));
const val = id => { const c = C.get(id); need(c && c.verification_state !== 'rejected', 'claim ' + id); need(c.verification_state !== 'verified' || c.source_page, id + ' verified 缺頁碼'); return c; };
L.flatMap(l => l.claims).forEach(val);
need(!L.some(l => /最新全國近視率|近視已經下降|一定會近視|驗光所|門市|預約/.test(l.text)), '旁白出現未核實結論或招攬字眼');
const screen = AUD.claims.filter(c => c.claim_id.startsWith('school_screen_')).sort((a, b) => a.calendar_year - b.calendar_year);
const same = ['survey_2010_50D_grade6', 'survey_2017_50D_grade6'].map(val);
need(same.every(c => c.threshold === '-0.5 D'), '只能用同一門檻 −0.50 D 的調查年');
const tag = c => c.verification_state === 'verified' ? '已核實' : '候選值・待核實';
const bg = {cls: 'assets/img/classroom.svg', ref: 'assets/img/refraction.svg', scr: 'assets/img/screening.svg'};
const scenes = [
  {scene: 'vp-ask', says: '學校說視力不良變少，近視是否也變少的矛盾鉤子', lines: ['視力不良變少了', '近視也變少了'], at: ['@b01:視力不良', '@b01:近視'], bg: bg.scr},
  {scene: 'vp-photo', says: '大叔觀點：家長常說學校零點八應該沒事', img: bg.cls, title: '家長最常說', brow: '虛構情境示意', tags: [{text: '學校說 0.8', at: '@b02:零點八'}, {text: '應該沒事吧？', at: '@b02:沒事'}], _replace: 'parent'},
  {scene: 'vp-versus', says: '學校看裸眼視力，近視看度數，是兩把不一樣的尺', title: '兩把不一樣的尺', left: {name: '學校篩檢', value: '裸眼視力', sub: '看視力表', at: '@b03:裸眼'}, right: {name: '近視', value: '度數', sub: '屈光檢查', at: '@b03:近視度數'}, bg: bg.ref},
  {scene: 'vp-line', says: '教育部已核實的近十年國小視力不良比例，固定縱軸', title: '國小裸眼視力不良率', brow: tag(screen[0]), unit: '%', down: true, data: screen.map(c => c.value), marks: [{i: 0, text: screen[0].value + '%', at: '@b04:一百零三'}, {i: -1, text: screen.at(-1).value + '%', at: '@b04:一百一十三'}], bg: bg.scr, _replace: 'decade'},
  {scene: 'vp-bars', says: '另一把尺：同一門檻下小六近視比例超過一半', title: '另一把尺｜小六近視', brow: '−0.50 D｜' + tag(same[0]), unit: '% 小六近視', items: [{label: '2010', value: String(same[0].value), at: '@b05:另一把尺'}, {label: '2017', value: String(same[1].value), hl: true, at: '@b05:超過一半'}], bg: bg.ref},
  {scene: 'vp-versus', says: '一條往下一條往上，兩把尺分開，不能放在一起比', title: '不是同一個指標', left: {name: '近視研究', value: '往上', sub: '屈光度數', at: '@b06:往上'}, right: {name: '學校篩檢', value: '往下', sub: '裸眼視力', at: '@b06:往下'}, bg: bg.ref, _replace: 'dualtrack'},
  {scene: 'vp-words', says: '中段鉤子：篩檢過了不代表沒近視', words: [{text: '篩檢過了', at: '@b07:篩檢過了'}, {text: '≠ 沒近視', at: '@b07:不一定', col: 'accent'}], bg: bg.scr},
  {scene: 'vp-list', says: '家長的具體下一步：沒過去檢查，過了也要追蹤', title: '家長可以這樣做', items: [{text: '篩檢沒過', sub: '帶去做完整檢查', mark: '1', at: '@b08:篩檢沒過'}, {text: '篩檢過了', sub: '也要定期追蹤', mark: '2', hl: true, at: '@b08:篩檢過了'}], bg: bg.cls}
];
need(scenes.length === L.length, '鏡頭數與句數不符');
scenes.forEach((sc, i) => {
  if (i < scenes.length - 1) sc.until = '@' + L[i + 1].id;
  (function walk(v) {
    if (typeof v === 'string' && v.startsWith('@')) { const m = v.match(/^@(b\d\d)(?::(.+))?$/); need(m && (!m[2] || L.find(l => l.id === m[1]).text.includes(m[2])), 'anchor ' + v); }
    else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  })(sc);
});
const replace = Object.fromEntries(scenes.map((s, i) => [s._replace, i]).filter(([k]) => k));
scenes.forEach(s => delete s._replace);
const pending = L.flatMap(l => l.claims).filter(id => C.get(id).verification_state !== 'verified');
fs.writeFileSync(path.join(D, 'script.json'), JSON.stringify({voice: 'taiwan_ad_male', pre: .22, lines: L.map(({id, text, gap}) => ({id, text, gap}))}, null, 2) + '\n');
fs.writeFileSync(path.join(D, 'film.js'), ['window.ready=(async()=>{',
  " const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
  ' const K=await KIT.use(F);', " await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / 視光資料'});",
  " KIT_UNCLE.preset('eye',{bg:'assets/img/classroom.svg'});",
  ' await K.film(' + JSON.stringify(scenes, null, 1) + ');', ' return K.go();', '})();'].join('\n') + '\n');
fs.writeFileSync(path.join(D, 'MYOPIA_DIRECTOR.json'), JSON.stringify({status: 'MYOPIA_SHORT_GATE_PASS', mode: pending.length ? 'INTERNAL_SAMPLE' : 'VERIFIED_DRAFT', watermark_required: pending.length > 0, watermark: '研究審核中｜僅供分鏡測試', publish_allowed: false, shots: scenes.length, replace_shots: replace, claims_pending: pending}, null, 2) + '\n');
console.log(JSON.stringify({shots: scenes.length, replace, pending}));
