// v1.2 attention planning: structural checks and explicit editorial rationale.
export const present=s=>typeof s==='string'&&s.trim().length>0;
export const rationale=s=>present(s)&&s.replace(/\s/g,'').length>=8;
export const MODES=['contradiction','sensory','mystery','character','experiment','story','data','challenge','decision','exploration'];
export function validateAttention(attention,script,timeline,retention){
 const errors=[],warnings=[];const fail=s=>errors.push(s);
 const lines=new Map(script.lines.map(l=>[l.id,l.text]));
 const times=new Map(timeline.beats.map(b=>[b.id,b]));
 const ref=(id,quote)=>lines.has(id)&&present(quote)&&lines.get(id).includes(quote);
 if(!attention||attention.version!==1)return {errors:['缺少 attention.json 或版本錯誤'],warnings};
 if(!MODES.includes(attention.route)||!rationale(attention.audience)||!rationale(attention.stakes))fail('缺少敘事路線、受眾與切身關聯');
 const h=attention.hook;
 if(!h||!ref(h.lineId,h.quote)||h.lineId!==retention.beats[0].lineIds[0]||!rationale(h.visual)||!rationale(h.audio)||!rationale(h.alignment))fail('三重鉤子必須引用開頭原句、視覺、聲音與協同理由（自然聲或留白亦可）');
 const p=attention.prediction;
 if(!p||!rationale(p.before)||!rationale(p.after)||!rationale(p.mechanism)||!lines.has(p.revealLineId)||!retention.beats.some(b=>b.role==='value'&&b.lineIds.includes(p.revealLineId)))fail('缺少觀眾預期、認知變化、機制或真實回收位置');
 if(!Array.isArray(attention.micro)||!attention.micro.length)fail('缺少微型鉤子');
 else{
  const seen=new Set();let previous=-1;
  for(const m of attention.micro){
   const t=times.get(m?.lineId)?.start;
   if(!Number.isFinite(t)||t<=previous||seen.has(m.lineId)||!['contrast','question','demo','number','reveal','emotion','pause','example'].includes(m.kind)||!rationale(m.newReason)||!rationale(m.visual))fail('微型鉤子須依時間排序、引用有效句子並提供新觀看理由');
   else{seen.add(m.lineId);previous=t;}
  }
  const max=retention.mode==='ugc'?12:retention.mode==='short'?10:retention.mode==='explainer'?15:35;
  const points=[0,...attention.micro.map(m=>times.get(m?.lineId)?.start).filter(Number.isFinite),timeline.duration];
  for(let i=1;i<points.length;i++)if(points[i]-points[i-1]>max)warnings.push({id:'micro-gap:'+i,message:'注意力更新空窗 '+(points[i]-points[i-1]).toFixed(1)+' 秒'});
 }
 return {errors,warnings};
}
