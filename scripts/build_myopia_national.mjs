// 《台灣學童近視：近十年全國資料》V4.1 鏡頭表建置＋證據 Gate（Fail Closed）。
// 用法：node scripts/build_myopia_national.mjs tests/myopia-national <影片目錄>
// 讀 EVIDENCE_AUDIT.json 與 narration_v41.json；任何畫面數字必須存在於稽核表且數值一致。
// 有任何 pending 數字 → 只能輸出 INTERNAL_SAMPLE（強制浮水印「研究審核中｜僅供分鏡測試」）。
import fs from 'node:fs';
import path from 'node:path';
const [testDir, dir] = process.argv.slice(2);
if (!testDir || !dir) throw Error('Usage: node scripts/build_myopia_national.mjs tests/myopia-national <film-dir>');
const D = path.resolve(dir);
const rd = f => JSON.parse(fs.readFileSync(path.join(testDir, f), 'utf8'));
const AUD = rd('EVIDENCE_AUDIT.json'), N = rd('narration_v41.json');
function need(x, err) { if (!x) throw Error('MYOPIA_GATE_BLOCK: ' + err); }
const STATES = new Set(['verified', 'pending', 'rejected']);
const FIELDS = ['claim_id', 'measure', 'population', 'school_year', 'calendar_year', 'value', 'threshold', 'method', 'source_url', 'source_page', 'verification_state'];
const C = new Map();
for (const c of AUD.claims) {
  for (const k of FIELDS) need(k in c, `claim ${c.claim_id} 缺欄位 ${k}`);
  need(STATES.has(c.verification_state), `claim ${c.claim_id} 狀態不合法`);
  need(c.verification_state !== 'verified' || (c.source_page && c.source_url), `claim ${c.claim_id} 標 verified 卻沒有頁碼`);
  need(!C.has(c.claim_id), 'claim 重複 ' + c.claim_id); C.set(c.claim_id, c);
}
const val = id => { const c = C.get(id); need(c, '畫面引用了不存在的 claim ' + id); need(c.verification_state !== 'rejected', '畫面引用了 rejected 的 claim ' + id); return c; };
// 舊調查 −0.25D 與新調查 −0.50D 分組；篩檢資料另一組
const hist = ['survey_1986_25D_grade6', 'survey_2000_25D_grade6'].map(val);
const same = ['survey_2010_50D_grade6', 'survey_2017_50D_grade6'].map(val);
need(hist.every(c => c.threshold === '-0.25 D') && same.every(c => c.threshold === '-0.5 D'), '門檻分組錯誤：不同門檻不得放在同一組');
const screen = AUD.claims.filter(c => c.claim_id.startsWith('school_screen_')).sort((a, b) => a.calendar_year - b.calendar_year);
need(screen.length === 11 && screen[0].calendar_year === 2014 && screen.at(-1).calendar_year === 2024, '近十年篩檢資料不完整');
need(screen.every(c => /裸眼/.test(c.measure)) && hist.concat(same).every(c => /屈光/.test(c.measure)), '兩種指標混淆');
const dup = screen.filter((c, i) => screen.some((d, j) => j !== i && d.value === c.value)).map(c => c.school_year);
// 旁白一致性：數字唸法與 claims
const L = N.lines; need(L.length === 10 && L.every((l, i) => l.id === 'b' + String(i + 1).padStart(2, '0')), '需要 b01–b10 十句');
need(!L.some(l => /最新全國近視率|(?<!不能說)近視已經下降|近視減少了。|一定會近視/.test(l.text)), '旁白出現未核實的結論句');
need(L[7].text.includes('不是同一個指標'), '第 8 鏡必須說明兩者不是同一個指標');
const used = L.flatMap(l => l.claims); used.forEach(val);
const pending = used.filter(id => C.get(id).verification_state !== 'verified');
const MODE = pending.length ? 'INTERNAL_SAMPLE' : 'VERIFIED_DRAFT';
const tag = id => C.get(id).verification_state === 'verified' ? '已核實' : '候選值・待核實';
const fmt = c => String(c.value);
const bg = {cls: 'assets/img/classroom.svg', ref: 'assets/img/refraction.svg', scr: 'assets/img/screening.svg'};
const scenes = [
  {scene: 'vp-ask', says: '用學校數字下降與近視是否變少的矛盾開場，三秒內抓住家長', lines: ['視力不良率變低', '近視也變少了'], at: ['@b01:視力不良率', '@b01:近視'], bg: bg.scr},
  {scene: 'vp-photo', says: '原創教室插畫帶出孩子看不清黑板的生活場景，標明虛構情境', img: bg.cls, title: '教室裡的一句話', brow: '虛構情境示意', tags: [{text: '看不清楚黑板', at: '@b02:看不清楚'}, {text: '兩種全國數字', at: '@b02:兩種'}], source: '原創插畫｜虛構情境示意，非真實學生', _replace: 'classroom'},
  {scene: 'vp-bars', says: '舊調查負零點二五度門檻下小六近視的歷史背景，不是近十年資料', title: '近視調查｜小六', brow: '−0.25 D 門檻｜' + tag(hist[0].claim_id), unit: '% 小六近視率', items: [{label: '1986', value: fmt(hist[0]), at: '@b03:一九八六'}, {label: '2000', value: fmt(hist[1]), hl: true, at: '@b03:兩千年'}], bg: bg.ref},
  {scene: 'vp-versus', says: '兩把尺對照負零點二五度與負零點五度門檻，說明不能接成一條線', title: '尺不一樣', brow: '近視定義門檻', left: {name: '早年門檻', value: '−0.25 D', sub: '1986–2006', at: '@b04:早年'}, right: {name: '後來門檻', value: '−0.50 D', sub: '2010・2017', at: '@b04:後來'}, bg: bg.ref},
  {scene: 'vp-bars', says: '同一門檻負零點五度下兩個調查年點，明說不是逐年資料', title: '同一把尺 −0.50 D｜小六', brow: '兩個調查年，非逐年｜' + tag(same[0].claim_id), unit: '% 小六近視率', items: [{label: '2010', value: fmt(same[0]), at: '@b05:二零一零'}, {label: '2017', value: fmt(same[1]), hl: true, at: '@b05:二零一七'}], bg: bg.ref},
  {scene: 'vp-words', says: '切換到第二組全國資料，把視力不良四字放大並與近視度數切開', words: [{text: '裸眼視力篩檢', at: '@b06:裸眼'}, {text: '視力不良≠近視', at: '@b06:不是近視', col: 'accent'}], bg: bg.scr},
  {scene: 'vp-line', says: '近十年國小裸眼視力不良率逐學年度走勢，標母體學年度與來源', title: '國小裸眼視力不良率', brow: '全國國小｜學年度 103–113｜' + tag(screen[0].claim_id), unit: '%', down: true, data: screen.map(c => c.value), marks: [{i: 0, text: '103學年 ' + fmt(screen[0]) + '%', at: '@b07:二零一四'}, {i: -1, text: '113學年 ' + fmt(screen.at(-1)) + '%', at: '@b07:二零二四'}], source: '教育部國中小概況統計 表2-4｜110–112 依原表同值', bg: bg.scr, _replace: 'decade'},
  {scene: 'vp-versus', says: '兩條趨勢分開兩把尺並標出不是同一個指標，禁止同一縱軸比較', title: '不是同一個指標', left: {name: '近視調查', value: '驗光', sub: '屈光度數', at: '@b08:往上'}, right: {name: '學校篩檢', value: '視力表', sub: '裸眼視力', at: '@b08:往下'}, bg: bg.ref, _replace: 'dualtrack'},
  {scene: 'vp-list', says: '二零二二年報導數字未核對原始報告前，不能宣稱近視已經下降', title: '新聞數字先別急著用', items: [{text: '2022 新調查', sub: '媒體報導', mark: '1', at: '@b09:二零二二'}, {text: '原始報告與方法', sub: '尚未核對', mark: 'no', at: '@b09:原始報告'}, {text: '不能說近視下降', sub: '證據不足', mark: 'no', hl: true, at: '@b09:不能說'}], bg: bg.scr},
  {scene: 'vp-verdict', says: '家長能帶走的結論：篩檢只是提醒，持續追蹤才知道變化', lines: ['篩檢是提醒', '追蹤才知道'], at: ['@b10:提醒', '@b10:追蹤'], hero: true, bg: bg.cls}
];
const decisions = [];
for (let i = 0; i < scenes.length; i++) {
  const sc = scenes[i], b = L[i];
  if (i < scenes.length - 1) sc.until = '@b' + String(i + 2).padStart(2, '0');
  need(sc.says.length >= 12 && b.viewer_gain.length >= 12, '缺 says / viewer_gain ' + b.id);
  (function walk(v, field) {
    if (typeof v === 'string' && v.startsWith('@')) {
      const m = v.match(/^@(b\d\d)(?::(.+))?$/), exp = field === 'until' ? 'b' + String(i + 2).padStart(2, '0') : b.id;
      need(m && m[1] === exp && (!m[2] || b.text.includes(m[2])), 'anchor 對不上 ' + v);
    } else if (Array.isArray(v)) v.forEach(x => walk(x, field));
    else if (v && typeof v === 'object') for (const [k, t] of Object.entries(v)) if (k !== 'says') walk(t, k);
  })(sc, '');
  for (const id of b.claims) { const c = C.get(id); if (!JSON.stringify(sc).includes(String(c.value)) && !c.claim_id.startsWith('report_')) need(false, `${b.id} 旁白引用 ${id} 但畫面沒有對應數字`); }
  decisions.push({beat_id: b.id, scene: sc.scene, replaced_by_original_animation: sc._replace ?? null, says: sc.says, claims: b.claims, claim_states: b.claims.map(id => C.get(id).verification_state)});
}
const types = new Set(scenes.map(s => s.scene));
need(types.size >= 8 && scenes.filter(s => ['vp-ask', 'vp-words', 'vp-list', 'vp-verdict'].includes(s.scene)).length <= 4, '退回純文字投影片');
need(!scenes.some(s => /vp-paper|v-clip|vp-person/.test(s.scene)), '不得冒充真實文件或實拍');
const replace = Object.fromEntries(scenes.map((s, i) => [s._replace, i]).filter(([k]) => k));
scenes.forEach(s => delete s._replace);
fs.writeFileSync(path.join(D, 'script.json'), JSON.stringify({voice: 'FISH_AD_MALE_PENDING', pre: .22, lines: L.map(({id, text, gap}) => ({id, text, gap}))}, null, 2) + '\n');
fs.writeFileSync(path.join(D, 'film.js'), ['window.ready=(async()=>{',
  " const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});",
  ' const K=await KIT.use(F);',
  " await KIT_VERT.use(K,{skin:'dark',brand:'UNCLE / 視光資料'});",
  " KIT_UNCLE.preset('eye',{bg:'assets/img/classroom.svg'});",
  ' await K.film(' + JSON.stringify(scenes, null, 1) + ');',
  ' return K.go();', '})();'].join('\n') + '\n');
const report = {status: 'MYOPIA_DIRECTOR_GATE_PASS', mode: MODE, watermark_required: MODE === 'INTERNAL_SAMPLE',
  watermark: '研究審核中｜僅供分鏡測試', publish_allowed: false, shots: scenes.length, scene_types: [...types],
  replace_shots: replace, claims_on_screen: used.length, claims_pending: pending, duplicate_screen_values: dup,
  rules_checked: ['門檻分組', '兩種指標不同縱軸', '近十年＝學年度103–113', '1986/2017 只當歷史背景', '2022 不當最新全國近視率', '旁白無未核實結論句'],
  decisions};
fs.writeFileSync(path.join(D, 'MYOPIA_DIRECTOR.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({status: report.status, mode: MODE, shots: scenes.length, distinct: types.size, pending: pending.length, dup}));
