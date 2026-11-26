# V4.1｜聲音先行、人物及金流重繪的跨引擎整合

## 這一刀真正改變的地方

V4 原版 `vpro` 能依實體 WAV 音訊長度產生 `timeline.json` 並直接渲染十鏡，先前已通過 GitHub Actions。V2 的原創人物與金流動畫則仍使用固定秒數。

V4.1 建立 **同一份時間軸控制兩個渲染器** 的流程：

```text
十句實體 WAV（本輪是合成測試音，並非 Fish）
    ↓
native_voice_timeline.py -> timeline.json
    ↓
原版 vpro render.mjs -> native_720.mp4（聲音先行重建十鏡）
    ↓                                 ↘
讀 b02、b07、b08 的實際句首         保留其他八個 native scene
    ↓
重新繪製人物衝突／金流動畫（逐影格原創渲染，不縮放舊影片的時間）
    ↓
compose_voice_first_story.py -> V4_1_story_audio_first_silent.mp4
    ↓
ffprobe 影格總數、長度、格式、來源／財務 QA
```

**工程界線**：原本的 `vpro` scene engine 未被替換，新的兩段是 Pillow 原創逐影格動畫與 FFmpeg 外層合成。這不是把它們宣稱為原生 vpro scene。

## 檔案

- `scripts/business-c-v3/illustrate_v2.py`：維持原版 V2 的人物與金流場景繪圖函式，只做可安全 import 的相容性改造
- `scripts/business-c-v4/compose_voice_first_story.py`：依十句實體時間軸決定兩段動畫的確切影格數、重繪並重新組合
- `.github/workflows/business-c-v4-native-smoke.yml`：從原始素材重建 V4.1，驗收結果上傳 7 日內部 artifacts，**不包含 WAV 或 Fish MP3**

## 2026-11-24 本機實測

- 真正來源：之前 GitHub 驗收過的 `V4` 原生 H.264 影片（1675 frames／55.834 秒）
- 讀取同一個測試 WAV 建立的十句 `timeline.json`，對齊 `b02`、`b07`、`b08` 的句首
- 第 1 鏡人物衝突：**208 個重新生成的畫格**
- 第 7 鏡現金流動：**136 個重新生成的畫格**
- 其他八鏡保留原版 vpro 的內容（保留畫面、為相容編碼重編中間兩段）
- 最終：**1675 frames；720×1280／30fps；55.833 秒／H.264；音軌無**
- 已目視檢查十二格審片圖，確認人物轉場及最後揭露 50 萬缺口
- 標籤：`V4_1_AUDIO_FIRST_STORY_MERGE_PASS`；發片許可 `false`。

## 仍未完成

1. **正式 Fish 音檔未實際匯入**；雖然 Fish 音檔短效 URL 曾由服務端驗證可下載，這個受限的容器無法直接 DNS 解析該主機，不能宣稱已完成 Fish 有聲片。
2. 句首／句尾由實體音訊建立，但**逐字時間目前依字重估算，尚未 ASR 對齊**。
3. 影片為內部無聲審片版本。對話框是虛構情境，不是不同角色的真實錄音。
4. 100 萬合約、45 萬材料、25 萬薪資廠房、20 萬現金、50 萬缺口是虛構教學數字，**接單不等於收入或入帳現金；缺口不代表已破產**。
5. 上線前仍須人耳審核、手機可讀字級、鏡頭節奏及字幕；不得擅自合併或社群發布。

## 下一道正式製片 Gate

透過安全的 Fish 下載方式取得十句實體 MP3 → 驗證每段 SHA256 與來源文字 → 使用同一份 `native_voice_timeline.py` 生真實時間軸 → 完整渲染 native vpro → 重繪第 1 與第 7 鏡 → 安全混入授權聲音 → MP4 的實際 A/V 偏差及逐句聆聽驗收。**不能把合成音和 Fish 混淆。**
