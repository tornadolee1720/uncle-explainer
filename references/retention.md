# Uncle Retention Engine v1.0

來源：使用者提供的 28 秒影片，提出 Hook → Promise → Value → Open Loop → Value → Open Loop → Value → CTA。沒有成效對照，不能稱爆款保證。原例 0–1、1–3、3–8、約8、8–14、約14、14–25、最後3秒；不是固定秒數。先給予再索取；原片結尾本身有截圖及留言兩選項，單一 CTA 是本技能的採納原則。

## 寫稿與導演表
- Hook：熟悉痛點、矛盾或感官差異。Promise：具體可信的觀看收益。Value：先給可理解答案，再補機制、對照或限制。
- Open Loop：只有真的有新問題才開；每個獨立 ID 由後續價值回答，不靠空洞吊胃口。最後完整交付承諾。CTA 可省略，若使用僅一個主要行動，品牌署名不算 CTA。安全指示應及早出現。
- 12 秒 UGC：情境／衝突 0–2、推進 2–8、反轉／回收 8–12；承諾可隱含，不塞兩個懸念。15–30 秒：前 3 秒建立期待、約 8 秒前首個價值。60–90 秒：可用兩次懸念，90 秒示意 0–3、3–8、8–23、23–28、28–45、45–51、51–83、83–90。長片用章節式價值循環。實際秒數以配音為準。
- 每鏡有功能，優先同場景狀態變化、比較、焦點移動；無意義快切、刺激性閃爍與讀字不足皆避免。進度指示僅用真實分步內容；不複製來源構圖。
- 保留台灣華語、既有聲線、證據來源、個體差異、示意非診斷與法規界線。安全警訊不可延後，虛構案例不得聲稱真實。不得為公式修改母帶。

## retention.json（每個新工程）
按 script.json 原句 ID 順序對應全部句子（每句一次；可多句合一）。mode: ugc / short / explainer / long。role: hook / promise / value / loop / cta / story / safety / brand。value 要具體描述交付，loopId 必須唯一，closes 指向先前 loop，action 是單一主要行動。安全告知以 safety 段表達；若第一句就是安全告知，兼任 hook。無 CTA 不需加空段。editorial 欄位只可在實際核對後標 pass；不適用的 safety/evidence 可標 not-applicable。

```json
{
  "version": 1,
  "mode": "short",
  "promise": "理解為何驗光時可能暫時看模糊",
  "beats": [
    {"role":"hook","lineIds":["b01"],"intent":"視標突然模糊"},
    {"role":"promise","lineIds":["b02"],"intent":"說明其用意"},
    {"role":"value","lineIds":["b03"],"intent":"解釋眼睛調焦","value":"眼睛會不自覺調節"},
    {"role":"loop","lineIds":["b04"],"intent":"清楚就等於度數準確嗎？","loopId":"L1"},
    {"role":"value","lineIds":["b05"],"intent":"回答問題","value":"霧視有助減少不必要調節；清楚不等於適合","closes":["L1"]},
    {"role":"cta","lineIds":["b06"],"intent":"邀請分享經驗","action":"留言是否曾遇過"},
    {"role":"brand","lineIds":["b07"],"intent":"品牌署名"}
  ],
  "editorial":{"safety":"pass","promise":"pass","singleAction":"pass","evidence":"pass"}
}
```
此 JSON 只是欄位示例，非已核實衛教成片；實際專案必須用真實句子、來源及人工審查結果，不可照抄 pass。另交付導演表含視覺、音效、承接、實證與懸念回收；標明未核實項目。

## QA 與成效
結構檢查：node scripts/render.mjs --dir <影片目錄> --check；有錯不進正式渲染。正式配音後重檢。另做 --sheet、音畫審查與原有流程。結構檢查不能證明語意、證據、CTA 實際措辭或視覺品質。分數由人工審稿：Hook 15、承諾及早期價值 20、價值遞進 20、懸念回收 15、音畫 15、結尾 10、信任 5。建議 85 分且適用硬門檻全過；主觀內部標準，不是成效預測。實際成片未測標明未測。
發布後比較相同平台、長度、題材、受眾、觀測窗口、自然/付費流量；記錄分母及定義。3 秒留存、首價值與各回收點流失、平均觀看時間與比例、完播、分享、CTA 行動。A/B 只改一個主要變因；不同貼文比較是觀察性資料，不宣稱因果。不得自行發布。
