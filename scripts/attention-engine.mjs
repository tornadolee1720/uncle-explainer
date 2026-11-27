import {validateAttention,rationale} from './attention.mjs';
import {validateVisual} from './attention-visual.mjs';
import {validateVirality} from './attention-viral.mjs';
import {reviewFingerprint} from './retention-semantic.mjs';
export const attentionFingerprint=(bundle,retention,script,timeline)=>reviewFingerprint({attention:bundle.attention,visual:bundle.visual,viral:bundle.viral,retention},script,timeline);
export function validateAttentionBundle(bundle,retention,script,timeline){
 if(!bundle||bundle.version!==1)return {errors:['缺少 attention-plan.json 或版本錯誤'],warnings:[],risks:[]};
 const a=validateAttention(bundle.attention,script,timeline,retention),v=validateVisual(bundle.visual,script,timeline);
 const z=a.errors.length?{errors:['先修正注意力計畫'],warnings:[]}:validateVirality(bundle.viral,bundle.attention,script,retention);
 const errors=[...a.errors,...v.errors,...z.errors],risks=[...a.warnings,...v.warnings,...z.warnings],warnings=[];
 const review=bundle.review;
 if(!review||review.fingerprint!==attentionFingerprint(bundle,retention,script,timeline)||review.decision!=='pass'||!['human','ai'].includes(review.reviewer?.type)||!rationale(review.reason)||!String(review.reviewer?.name??'').trim()||!Number.isFinite(Date.parse(review.reviewedAt??'')))errors.push('缺少新版審查、理由、審查者或計畫指紋已過期');
 for(const r of risks){const decision=review?.risks?.[r.id];if(decision?.decision!=='accept'||!rationale(decision.reason))errors.push('未處理注意力風險 '+r.id+'：'+r.message);else warnings.push(r.id+'：已記錄例外');}
 warnings.push('本報告只檢查計畫與審查紀錄，不是實際首幀、字幕、聲音、成片或流量測量。');
 return {errors,warnings,risks};
}
