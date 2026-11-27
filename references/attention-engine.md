# Attention Engine v2.0｜注意力、視覺、傳播、數據回饋

## 開工順序
先讀原 SKILL、留存 v1.0、語意 v1.1。新工程標記 3，會生成 attention-plan.json；在腳本與時間線完成後填寫下列三個區塊。必須通過 v1.0 結構、v1.1 語意紀錄以及本計畫檢查才能 --check / --video。舊標記 1、2 維持相容；不得降級來規避。使用真實內容，先修文案及鏡頭再更新指紋，不得把範例當真實批准。

### v1.2 注意力
先決定觀眾是誰、為什麼值得看、原本相信什麼、要帶走什麼。三重鉤子是畫面、聲音、實際旁白的協同，不是三個不相干刺激；無聲或自然聲有合理原因也可以。微型鉤子要更新觀看理由，不用為節奏而亂切。故事與 UGC 可保留自然停頓。敘事 route 可選 contradiction/sensory/mystery/character/experiment/story/data/challenge/decision/exploration。

### v1.3 視覺
一鏡一件主要認知任務。動態與焦點都要有理由，連接上個畫面，與旁白互補而不是重複塞資訊。視光術語先用白話，再視需要引入名稱；例：調節＝眼睛自己調整焦距的能力。模擬不等於實際檢測；不把單一視覺症狀當診斷。每個字卡規劃實際停留秒數、1080×1920 的字級及邊界。小於 48px、超出初版安全區或每秒多於七字只是風險提醒，須用實際畫面與裝置複核；非普遍平台規則。聲音素材、配音、字幕、原始來源及逐鏡審片遵循原 SKILL。

### v1.4 傳播
先選一個主要成效目標：share/comment/save/follow/visit/none/other。明確分享者與接收者的用途，綁定實際價值段。不要為互動扣留答案，不強制 CTA、不誘導留言、不宣稱能診斷。最近路線依真實紀錄最新在前，未知用空陣列且不宣稱已做跨片反套路比較。可自然重播但不得截斷承諾或安全訊息。

## attention-plan.json 欄位
完整可執行的合成範例見 tests/attention-fixture.mjs；它只供測試，正式影片不能抄審查結果。
- version:1；attention、visual、viral 各 version:1。
- attention: route, audience, stakes, hook:{lineId,quote,visual,audio,alignment}, prediction:{before,after,mechanism,revealLineId}, micro:[{lineId,kind,newReason,visual}]。kind: contrast/question/demo/number/reveal/emotion/pause/example。
- visual: shots:[{lineIds,says,visual,motionReason,connection,audioRelation,kind,focusCount,cards:[{text,seconds,fontPx,box:{x,y,w,h}}],simulation,disclaimer}], terms:[{term,plain,lineId}]。kind: pov/comparison/diagram/evidence/character/text/object/experiment/other。cards/terms 無內容用 []；白話解釋需出現在所引旁白中。視覺模擬須標記 simulation:true。
- viral: share:{motive,reason,recipient,valueLineId}, goal, replay:{mode,reason,endLineId,bridge}, recentRoutes, routeReason。motive: altruism/resonance/new-insight/social/utility/surprise/none；replay mode: natural/none。
- review:{fingerprint,decision:"pass",reviewer:{type:"ai" 或 "human",name},reviewedAt,reason,risks:{風險ID:{decision:"accept",reason}}}。只在實際審查後填。AI 審查須標 AI，未看真實影片不得宣稱已審片。

執行 node scripts/attention-review.mjs <影片目錄>，輸出指紋、缺口與風險，不會自動批准。完成審查後重跑；接著依原流程 --check、--sheet、--video、音畫審查。旁白或計畫修改後重新審查。實際畫面、光路、聲音、醫學內容以及觀眾效果仍需人工與資料驗證。

## v2.0 發布後回饋（唯讀）
在有權限的 ChatGPT/Claude 工具中讀 Metricool；先查可用指標、帳號及時間範圍，不自行發文。Facebook reels 依序 FBRE03,06,10,11,12,13；Instagram reels 依序 IGRE04,11,21,23,24,27,28,30。完整 ID 見 scripts/attention-feedback.mjs 的 FIELDS。透過工具回傳的 rows 與原順序共同保存至本機私密資料；不要把私人數據、帳號 ID、憑證、影片個資提交公開 GitHub。不同來源不能混作同一指標。時間單位未有明確定義不換算；有觀看但零觸及視為待查，不用作分母。IG retention null 保留 null；view3/skip3 只代表起始觀看，不是逐秒曲線。

本機檔格式 {platform,fields,payload:{rows},target?,baseline?,timeline?,points?}，執行 node scripts/attention-feedback-cli.mjs <本機快照.json>。輸出覆蓋率、每篇有效指標和可選的比較。target/baseline 是已核對的 normalized rows 及 accountKey,traffic,durationBand,topicGroup,ageHours,metricDefinition；ageHours 是同觀察齡，不能只用同一日曆區間替代。最少五支不同可比基準才做描述性比較，不是因果或顯著性檢驗。曲線 points 是實際同一支影片的 {second,pct}；與時間線同起點，需人工確認片頭/片尾/實際長度一致。若拿不到曲線，禁止造數據或指定流失位置。只提出下一次單變因實驗假設，經人批准才變更規則。實際自動排程與跨影片 ID 綁定需另外設置；CLI 不自行連線、不保存數據、不發布。

測試：node --test tests/retention*.test.mjs；有 Chromium、FFmpeg 時 RETENTION_RENDER_SMOKE=1 node --test tests/retention-render.test.mjs。這是合成影片管線煙霧測試，非真實內容效果測試。
