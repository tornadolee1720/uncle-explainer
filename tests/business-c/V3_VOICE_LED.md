# C 題 V3｜聲音控制鏡頭（獨立驗收）

這是分支 `experiment/cashflow-story-c-20261124` 的內部技術實驗，保持 Draft PR，不合併 main，不上傳社群。

## 已通過的本機測試

在 53.233 秒的原版 vpro＋人物金流動畫 V2 無聲影片上，將十句**不同長度的合成測試音**作為時間來源，再重新分段剪接與混音。結果產出 **52.800 秒 H.264＋AAC 測試影片**，實測音畫長度誤差 **0.0585 秒**。聲音來源明確標示為 `SYNTHETIC_TONE_NOT_FISH`，不可當作真正 Fish 配音。

`scripts/business-c-v3/voice_led.py` 預期十個實際音檔 `b01.mp3` … `b10.mp3`（也接受 WAV/M4A），使用音檔長度控制十個鏡頭的時間，再產生 `VOICE_QA.json`、`sentence_captions.srt` 與內部有聲影片。字詞級 ASR **未完成**；只能驗證句子級聲畫同步。

## 取得 Fish 真正有聲版所需輸入

1. 以已授權的 Fish Audio project voice `taiwan_ad_male` 逐句產生對應 `tests/business-c/case.json` 的十個 MP3，檔名為 b01 至 b10。
2. **不可**把 API Key、MP3、短效下載網址或授權音訊 Git Blob 放在公開 GitHub。將音訊保存在私人本地資料夾。
3. 執行 `python scripts/business-c-v3/make_private_provenance.py <voice_dir> <private_manifest.json>`，產生完整性 SHA-256 記錄。
4. 執行：

```bash
python scripts/business-c-v3/voice_led.py \
  --video Business_C_V2_story_motion_silent.mp4 \
  --script script.json --voice-dir ./voice \
  --provenance ./private_manifest.json --out ./final
```

5. 審核聲線、每句語音與實際字幕和畫面關係，再檢查 H.264、AAC、30fps 和音畫偏差。**此階段尚未有正式 Fish V3 MP4。**

## V2 重現方式

`scripts/business-c-v3/illustrate_v2.py` 程式化生成原創人物衝突動畫及金流動作；`recompose_v2.py` 把兩段替換到經原版 `render.mjs` 驗證的 V1 十鏡片中。這是 **FFmpeg 外層合成**，不是聲稱新場景已經變成 vpro 原生 Scene API。

現金流模型維持：100 萬假設合約、70 萬前期支出、20 萬可用現金、50 萬收款前缺口；付款條件為**交貨驗收後 90 天**。資金不足不等於已經倒閉或法律上破產。

## 發布前必須通過
- 正式 MP3 的私密存放、真實聲線與文本校對
- 十句逐句校對，無不合理變速、超速字幕或音畫不同步
- 人物為原創虛構插畫，畫面可辨識，不冒充真實公司
- 金流差額與全部字幕檢核
- 不修改正式 SEO MCP、未完成前不發布影片
