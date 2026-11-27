// v1.3 visual reasoning, readability, safe area and terminology planning.
import {present,rationale} from './attention.mjs';
export function validateVisual(visual,script,timeline){
 const errors=[],warnings=[];const fail=s=>errors.push(s);
 if(!visual||visual.version!==1)return {errors:['缺少 visual-plan.json 或版本錯誤'],warnings};
 const lines=new Map(script.lines.map(l=>[l.id,l.text])),times=new Map(timeline.beats.map(b=>[b.id,b]));
 if(!Array.isArray(visual.shots)||!visual.shots.length)return {errors:['缺少視覺鏡頭計畫'],warnings};
 const used=new Set();let previous=-1;
 for(const [i,s] of visual.shots.entries()){
  if(!s||!Array.isArray(s.lineIds)||!s.lineIds.length||!rationale(s.says)||!rationale(s.visual)||!rationale(s.motionReason)||!rationale(s.connection)||!rationale(s.audioRelation)){fail('鏡頭 '+i+' 缺少畫面功能、承接或音畫關係');continue;}
  for(const id of s.lineIds){const j=script.lines.findIndex(l=>l.id===id);if(j<=previous||used.has(id)||!lines.has(id))fail('鏡頭引用重複、逆序或未知句子 '+id);else{used.add(id);previous=j;}}
  if(!['pov','comparison','diagram','evidence','character','text','object','experiment','other'].includes(s.kind))fail('鏡頭 '+i+' 缺少視覺類型');
  if(!Number.isInteger(s.focusCount)||s.focusCount<1)fail('鏡頭 '+i+' 缺少主要焦點數');
  else if(s.focusCount>2)warnings.push({id:'focus:'+i,message:'多重視覺焦點可能提高認知負荷'});
  if(!Array.isArray(s.cards))fail('鏡頭 '+i+' cards 須明確提供，無額外字卡用空陣列');
  else for(const [j,c] of s.cards.entries()){
   if(!present(c?.text)||!Number.isFinite(c.seconds)||c.seconds<=0||!Number.isFinite(c.fontPx)||c.fontPx<=0||!c.box||!['x','y','w','h'].every(k=>Number.isFinite(c.box[k]))||c.box.w<=0||c.box.h<=0){fail('字卡 '+i+':'+j+' 格式錯誤');continue;}
   const b=c.box, dur=(times.get(s.lineIds.at(-1))?.end??0)-(times.get(s.lineIds[0])?.start??0);
   if(c.seconds>dur+.05)fail('字卡 '+i+':'+j+' 停留超過鏡頭規劃時間');
   if(c.fontPx<48||b.x<60||b.y<250||b.x+b.w>1020||b.y+b.h>1520)warnings.push({id:'read:'+i+':'+j,message:'字級或直式安全區需實際審片確認'});
   if([...c.text].length/c.seconds>7)warnings.push({id:'speed:'+i+':'+j,message:'字卡閱讀速度偏快'});
  }
  if(s.kind==='pov'&&s.simulation===true&&!present(s.disclaimer))fail('視覺模擬須規劃非診斷聲明');
 }
 if(used.size!==lines.size)fail('仍有旁白未納入視覺鏡頭計畫');
 if(!Array.isArray(visual.terms))fail('須列出專有名詞轉譯，無則空陣列');
 else for(const t of visual.terms){if(!present(t?.term)||!rationale(t.plain)||!lines.has(t.lineId)||!lines.get(t.lineId).includes(t.plain))fail('專有名詞須提供實際旁白中的白話解釋');}
 return {errors,warnings};
}
