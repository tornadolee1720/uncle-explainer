# C 題｜有訂單卻周轉不過來的包裝工廠

這是 **完全虛構的商業敘事實驗**，不是新聞報導、真實企業案例或財務建議。目標是驗證不依賴新聞與實拍影像時，原版 `vpro` 能否用原創 SVG、因果圖、時間軸與資料對比說完一個故事。

## 敘事骨架

1. **矛盾開場**：簽了 100 萬訂單，為什麼沒錢發薪？
2. **假設情境**：一家小型包裝工廠剛接下訂單。
3. **危險條款**：交貨驗收後 90 天才收到款項。
4. **現金先流出**：材料款先付 45 萬。
5. **固定負擔**：薪資與廠房費再付 25 萬。
6. **驚人揭露**：目前手上只有 20 萬。
7. **視覺推理**：70 萬前期支出減 20 萬可用現金，形成 50 萬缺口。
8. **認知反轉**：訂單不等於今日已收到的現金。
9. **可帶走的對策**：協商訂金、付款期限，或評估備用周轉資金。
10. **情感收束**：訂單是生意的機會，但得先撐到錢進來。

## 核心財務條件

- 合約訂單面額 `1,000,000 TWD`：**簽約不等於已收款或已認列收入**。
- 前期付款 `450,000 + 250,000 = 700,000 TWD`。
- 可動用現金 `200,000 TWD`。
- 簡化資金缺口 `700,000 - 200,000 = 500,000 TWD`。
- 付款條件：完成交貨且驗收後再等 `90 天`，不是接單後 90 天。
- 這不代表確定倒閉，也沒有推論淨利或法律破產狀態。

## 媒體與製片策略

- **原版 wallstreet-explainer vpro**：十鏡 `vp-ask/photo/timeline/number/bars/number/chain/versus/list/verdict`。
- **原創素材**：`scripts/make_cash_story_art.mjs` 生成工廠、帳單與日曆三組 SVG；不是影像生成影片，也沒有真實公司照片。
- **無聲試驗**：GitHub Actions 由 `timeline_stub.mjs` 先估時；配音未接入前不可宣稱逐字同步。
- **Fish Audio**：正式聲線為已註冊的 `taiwan_ad_male`，但只有實際音檔匯入、Whisper 對齊、渲染及混音 QA 成功，才能稱為有聲版。

## 一鍵重跑

```bash
node --test tests/business-c/business-c.test.mjs
npm ci
npx playwright install chromium
node scripts/new_film.mjs /tmp/business-c --vertical
node scripts/make_cash_story_art.mjs /tmp/business-c
node scripts/build_cash_story_c.mjs tests/business-c/case.json /tmp/business-c
node scripts/timeline_stub.mjs /tmp/business-c/script.json
node scripts/render.mjs --dir /tmp/business-c --check
node scripts/render.mjs --dir /tmp/business-c --sheet
node scripts/render.mjs --dir /tmp/business-c --video --h 720
```

## 驗收

`STORY_DIRECTOR.json` 必須顯示 `FICTIONAL_STORY_DIRECTOR_PASS`、缺口 50 萬、10 鏡，並保留虛構標籤。GitHub Actions 輸出 MP4、十鏡分鏡圖及 `REPRO_QA.json`。正式發片之前仍須人工評估字幕字級、速度、敘事真實感和金融解讀界線。

概念參考來源：澳洲政府 [cash flow guide](https://business.gov.au/guide/guide-to-managing-cash-flow)、[payment terms](https://business.gov.au/finance/payments-and-invoicing/payment-terms)、美國小企業署 [cash flow and planning](https://www.sba.gov/blog/2016/2016-07/5-things-business-owners-do-better-lean-business-planning/)。這些來源支持**財務原理**，不是虛構案例的特定數字。
