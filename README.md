# 大叔講清楚（uncle-explainer）

讓 AI 幫你做「把一件事講清楚」的直式短影片：真的資料當證據，大數字、原文刷黃、轉折砸字，每一鏡都接住上一鏡。全繁體中文，講台灣人聽得懂的話。

這是給 Claude Code 用的技能（Skill），以 [HeyChengC/wallstreet-explainer](https://github.com/HeyChengC/wallstreet-explainer)（MIT）為基底改成台灣在地版。

## 兩種主題

| 主題 | 寫法 | 適合講什麼 |
|---|---|---|
| 視光衛教（目鏡大叔） | `KIT_UNCLE.preset('eye')` | 近視、老花、藍光、散光迷思，用數字和研究破解 |
| 小店的帳 | `KIT_UNCLE.preset('shop')` | 開一間店要花多少錢、行銷怎麼算、AI 工具省了多少時間 |

兩種主題共用同一套 20 個直式元件（`kit/VERTICAL.md`），只換顏色和語氣。

## 跟原版不一樣的地方

- 全部文件、提示、錯誤訊息都是繁體中文、台灣用語
- 字型改成 Noto Sans TC（思源黑體繁中），字幕放大給老花也看得清楚
- 固定品牌色和結尾卡（`scripts/uncle_endcard.py`），每支片尾長一樣
- 臨時配音改成台灣口音（edge-tts `zh-TW-YunJheNeural`）；正式旁白用你自己錄的 Fish TTS，原檔不動
- 衛教片不抓別人的影片當素材，改用自製圖形和官方公開資料

## 安裝（Claude Code）

```bash
git clone https://github.com/tornadolee1720/uncle-explainer.git ~/.claude/skills/uncle-explainer
cd ~/.claude/skills/uncle-explainer
pip install -r requirements.txt
npm install && npx playwright install chromium
```

另外要裝 ffmpeg 並放進 PATH。

字型：到 Google Fonts 下載 Noto Sans TC，把 Regular、Medium、Bold、Black 放進 `fonts/`。電腦裡已經裝好 Noto Sans TC 的話可以不用放，程式會直接抓系統字型。

## 使用

重啟 Claude Code，直接說：

> 用 uncle-explainer 做一支視光主題的片子，講「台灣小學生近視率到底有多高」，旁白是附件這個 MP3

或：

> 用 uncle-explainer 的小店主題，把「開一間眼鏡行第一年要花多少錢」這筆帳講清楚

## 做片流程

1. `node scripts/new_film.mjs <影片目錄> --vertical` 建工程
2. 寫文案和導演表（每一鏡：觀眾多懂了什麼、畫面上有什麼）
3. 對齊旁白：`python scripts/temp_voice.py <影片目錄>/script.json`
4. 填 `film.js` 鏡頭表 → `node scripts/render.mjs --dir <影片目錄> --check` 改到沒有提醒
5. `--sheet` 看聯絡表 → `--video` 出片 → `python scripts/mix.py <影片目錄>` 混音
6. `python scripts/uncle_endcard.py 成片.mp4 最終.mp4 --line "一句重點"` 接品牌結尾卡

## 注意力留存（v1）
新建正式影片會產生 retention.json；在寫文案、導演表時依 [留存引擎](references/retention.md) 填寫。--check 與 --video 會攔截未完成或結構不合格的台帳，並輸出 out/retention-check.json。舊片和示例不受強制遷移；缺少台帳時會提示未驗證。執行 `node --test tests/retention.test.mjs` 測試結構檢查器。這不是完播率保證，也不取代人工審片。

## v1.1 語意審查
新工程必須依 [語意審查規範](references/retention-semantic.md) 建立 retention-review.json；先用 `node scripts/retention-review.mjs <影片目錄>` 取得指紋及風險，再做實際審查。文案、時間線或台帳變更即失效。v1 舊片相容，但不標示為 v1.1 通過。執行 `node --test tests/retention*.test.mjs`。

## 目錄

| 位置 | 內容 |
|---|---|
| `SKILL.md` | AI 讀的入口（最前面是台灣版規則） |
| `kit/uncle.js` | 兩種主題的顏色、字幕樣式 |
| `kit/VERTICAL.md` | 直式元件說明 |
| `scripts/` | 對齊旁白、渲染、混音、結尾卡 |
| `references/` | 做片的方法和規矩（上游，已轉繁體） |
| `examples/` | 上游樣片的程式（第三方畫面版權屬原作者，僅供學習） |

## 授權

程式和文件為 MIT 授權，原作者版權聲明保留在 [LICENSE](LICENSE)。`examples/` 裡的第三方畫面、截圖、logo 和人物不在 MIT 範圍內。
