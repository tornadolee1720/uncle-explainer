// uncle.js —— 大叔講清楚（uncle-explainer）的台灣在地主題
// 用法：film.js 裡 KIT_VERT.use(...) 之後寫一句
//   KIT_UNCLE.preset('eye')   // 視光衛教：海軍藍 #18263A + 黃 #FFD45C
//   KIT_UNCLE.preset('shop')  // 小店的帳：深咖啡木色底 + 暖橘，講開店成本、行銷、AI 工具
// 可再加參數覆蓋：KIT_UNCLE.preset('eye',{bg:'assets/img/主圖.jpg'})
(function(){
const PRESETS={
 eye:{accent:'#FFD45C',bg0:'#18263A',bg1:'#22354f',ink:'#F5F1E6',ink2:'#aab6c8',label:'目鏡大叔'},
 shop:{accent:'#F2994A',bg0:'#2a211b',bg1:'#3a2e25',ink:'#F7F0E4',ink2:'#c2b3a2',label:'大叔開店筆記'},
};
function preset(name='eye',o={}){
 const P=Object.assign({},PRESETS[name]??PRESETS.eye,o);
 if(window.KIT_VPRO)KIT_VPRO.theme({accent:P.accent,ink:P.ink,bg:o.bg,card1:o.card1,card2:o.card2});
 let st=document.getElementById('uncle-theme');
 if(!st){st=document.createElement('style');st.id='uncle-theme';document.head.appendChild(st);}
 st.textContent=`
 #stage{background:${P.bg0}}
 .v-root{--v-ink:${P.ink};--v-ink2:${P.ink2};--v-acc:${P.accent};--v-on:${P.accent};--v-ans:${P.accent};
   --v-cardbg:linear-gradient(165deg,${P.bg1} 0%,${P.bg0} 100%)}
 .v-bgt{background-color:${P.bg0}!important;background-image:radial-gradient(ellipse 85% 55% at 50% 38%,rgba(255,255,255,.06),rgba(255,255,255,0) 70%)!important}
 .v-bgt::after{opacity:.35}
 .k-num .g,.k-num .c,.k-num .cm,.k-num .u{background:none!important;color:${P.accent}!important;-webkit-text-fill-color:${P.accent}!important}
 /* 字幕：老花也看得清楚。放在底部 400px 安全區上方，深色圓角框 */
 .sub{top:auto!important;bottom:430px!important;font-size:68px!important;line-height:1.3!important;
   -webkit-text-stroke:0!important;text-shadow:none!important;color:${P.ink}!important;
   background:rgba(8,14,24,.78);border-radius:22px;padding:14px 28px;left:60px!important;right:60px!important}
 `;
 window.KIT_UNCLE.current=P;return P;}
window.KIT_UNCLE={preset,PRESETS,current:null};
})();
