// v1.4 share motivation, diversity and replay integrity.
import {MODES,present,rationale} from './attention.mjs';
export function validateVirality(viral,attention,script,retention){
 const errors=[],warnings=[];const fail=s=>errors.push(s);
 if(!viral||viral.version!==1)return {errors:['缺少 viral-plan.json 或版本錯誤'],warnings};
 const valueIds=new Set(retention.beats.filter(b=>b.role==='value').flatMap(b=>b.lineIds));
 const share=viral.share;
 if(!share||!['altruism','resonance','new-insight','social','utility','surprise','none'].includes(share.motive)||!rationale(share.reason)||!rationale(share.recipient)||!valueIds.has(share.valueLineId))fail('分享動機須連到觀眾、具體用途與價值段；無分享目標亦須說明');
 if(!['share','comment','save','follow','visit','none','other'].includes(viral.goal))fail('須指定一個主要成效目標');
 const replay=viral.replay;
 if(!replay||!['natural','none'].includes(replay.mode)||!rationale(replay.reason))fail('重播設計須說明自然機制或不適用原因');
 else if(replay.mode==='natural'&&(!script.lines.some(l=>l.id===replay.endLineId)||!rationale(replay.bridge)))fail('自然重播須有結尾與開頭的具體連接，不得截斷承諾');
 if(!Array.isArray(viral.recentRoutes)||viral.recentRoutes.length>10||viral.recentRoutes.some(r=>!MODES.includes(r)))fail('最近影片路線須為有效陣列，最多十支');
 else if(viral.recentRoutes.length>=3&&viral.recentRoutes.slice(0,3).every(r=>r===attention.route))warnings.push({id:'route-repeat',message:'前三支同樣敘事路線，確認題材是否值得延續'});
 if(!rationale(viral.routeReason))fail('須說明為何選用此敘事路線');
 return {errors,warnings};
}
