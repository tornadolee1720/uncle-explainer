// Retention v1: deterministic structural checks, not semantic or performance claims.
export function validateRetention(plan,script,timeline){
 const errors=[],warnings=[]; const fail=m=>errors.push(m); const good=s=>typeof s==="string"&&s.trim().length>0;
 if(!plan||plan.version!==1||!["ugc","short","explainer","long"].includes(plan.mode)) return {errors:["retention.json 版本或模式不正確"],warnings};
 const lines=script?.lines, beats=timeline?.beats;
 if(!Array.isArray(lines)||!lines.length||!Array.isArray(beats)||!beats.length)return {errors:["缺少 script.lines 或 timeline.beats"],warnings};
 const ids=lines.map(x=>x?.id); if(ids.some(x=>!good(x))||new Set(ids).size!==ids.length)fail("script ID 缺漏或重複");
 const index=new Map(ids.map((id,i)=>[id,i])); const time=new Map(beats.map(x=>[x.id,x]));
 if(beats.length!==lines.length||beats.some((b,i)=>b.id!==ids[i]||b.text!==lines[i].text||!Number.isFinite(b.start)||!Number.isFinite(b.end)||b.start<0||b.end<=b.start||(i>0&&b.start<beats[i-1].end-0.001)))fail("時間線與文案不一致或時間重疊");
 if(!Number.isFinite(timeline.duration)||timeline.duration<=0||beats.some(b=>b.end>timeline.duration+0.001))fail("片長無效或超出片長");
 if(!good(plan.promise))fail("缺少觀眾承諾");
 if(!Array.isArray(plan.beats)||!plan.beats.length)return {errors:[...errors,"缺少留存段落"],warnings};
 const seen=new Set(), values=[],loops=new Map(),closed=new Set(),ctas=[]; let last=-1, hooks=0;
 for(const b of plan.beats){
  if(!b||!Array.isArray(b.lineIds)||!b.lineIds.length||!["hook","promise","value","loop","cta","story","safety","brand"].includes(b.role)||!good(b.intent)) {fail("留存段落欄位不完整");continue;}
  for(const id of b.lineIds){const i=index.get(id);if(i===undefined||seen.has(id)||i<=last)fail("段落引用未知、重複或逆序的文案 ID："+id);else {seen.add(id);last=i;}}
  if(b.role==="hook")hooks++;
  if(b.role==="value"){if(!good(b.value))fail("價值段缺少具體交付");else values.push(b); }
  if(b.role==="loop"){if(!good(b.loopId)||loops.has(b.loopId))fail("懸念 ID 缺漏或重複");else loops.set(b.loopId,b);}
  if(b.closes!==undefined){if(!Array.isArray(b.closes)||b.role!=="value")fail("懸念只能由價值段兌現");else for(const id of b.closes){if(!loops.has(id)||closed.has(id))fail("懸念未建立或重複兌現："+id);else closed.add(id);}}
  if(b.role==="cta"){ctas.push(b);if(!good(b.action))fail("CTA 缺少單一行動");if(!values.length||loops.size!==closed.size)fail("CTA 早於價值或懸念尚未兌現");}
 }
 if(seen.size!==ids.length)fail("有文案未納入留存台帳");
 if(hooks!==1||plan.beats[0]?.role!=="hook")fail("首段必須為唯一主鉤子");
 if(!values.length)fail("缺少價值或故事回收段");
 if(new Set(values.map(b=>b.value.trim())).size!==values.length)fail("價值段文字重複");
 for(const id of loops.keys())if(!closed.has(id))fail("未兌現懸念："+id);
 if(ctas.length>1)fail("只能有一個 CTA 段");
 if(ctas.length&&plan.beats.slice(plan.beats.indexOf(ctas[0])+1).some(b=>b.role!=="brand"))fail("CTA 後只能有品牌署名");
 if(plan.mode!=="ugc"&&!plan.beats.some(b=>b.role==="promise"))fail("知識影片缺少明確承諾段");
 if(plan.mode==="ugc"&&loops.size>1)fail("UGC 不強塞多重懸念");
 if(values.length){const t=time.get(values[0].lineIds[0])?.start;const limit=plan.mode==="ugc"?timeline.duration:plan.mode==="short"?8:plan.mode==="explainer"?Math.min(23,timeline.duration*.30):timeline.duration*.20;if(Number.isFinite(t)&&t>limit)warnings.push("第一價值點偏晚，請人工確認："+t+" 秒");}
 if(timeline.stub)warnings.push("目前為估算時間線，正式配音後須重驗");
 if(!["pass","not-applicable"].includes(plan.editorial?.safety)||plan.editorial?.promise!=="pass"||plan.editorial?.singleAction!=="pass"||plan.editorial?.evidence!=="pass"&&plan.editorial?.evidence!=="not-applicable")fail("缺少人工語意、單一行動、安全與證據核對結果");
 warnings.push("結構通過不等於語意、音畫、實際留存或醫療證據已驗證；仍須人工審查。");
 return {errors,warnings};
}
