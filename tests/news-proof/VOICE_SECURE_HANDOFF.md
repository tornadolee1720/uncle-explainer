# Uncle News Explainer｜60 秒版聲畫驗收交接

目前 Draft PR #1 已有原版 vpro 真實新聞＋NASA 實景移動畫面合成，沒有把 Fish API Key 放在 GitHub，也沒有對外發布。

## 已驗證

- NVIDIA 官方 IR 真正網頁截圖、關鍵字高亮、來源資訊
- NASA Goddard 2010 年超級電腦及視覺化設備 B-roll：兩個不同原始影片，各 255 張 30fps 影格；皆須標示「非 NVIDIA 機房」
- 原版 `v-full`、`v-clip`、`vp-paper`、`vp-number` 等十鏡原生動畫
- 67.333 秒 720×1280 30fps H.264 **無旁白** MP4
- `EDITORIAL_QA.json`：`STRUCTURAL_PASS`、實景證據比例 40%、原始影片來源 2 個、新聞原文 1 鏡

## 目前未通過

- 10 段 Fish MP3 仍未進入 GitHub Actions。Pull request 的影像綠燈不是有聲片驗收成功。
- 逐字 ASR、真實時間軸、音效、最終 AAC 混音及人工審片尚未完成。
- 製作期間的 NVIDIA 原始財報及 NASA B-roll，發布前仍應再核對來源、情境與使用條件。

## 只需一次的受控音檔匯入（不交付 Fish API Key）

1. 先透過已授權的 Fish Audio project voice `taiwan_ad_male` 生成 **與 script.json 10 句相符**的 MP3。
2. 把該 MP3 **短效 HTTPS 下載網址**暫時設為此倉庫的 GitHub Actions repository secret：`UNCLE_FISH_AUDIO_URL`。網址必須符合 `https://uncle-seo-mcp.onrender.com/downloads/audio/*.mp3`。
3. 進入 Actions → **60s documentary news visual smoke (no publishing)** → Run workflow → 選擇 `experiment/nvidia-news-proof-20261123`，保持 `require_fish_voice=true`。
4. GitHub runner 從私密 secret 下載 MP3，FFmpeg 解碼、faster-whisper 配對台灣華語、產生真實 `timeline.json`、重新用原版 vpro 渲染、執行混音與 AV QA。
5. `require_fish_voice=true` 時若沒有 secret 就 **失敗**，絕不把無聲片當有聲成功。

**注意**：下載網址過期，重新生成並更新 secret。測完請從 GitHub Secrets 刪除短效網址。只提交程式碼與非敏感驗收摘要，不把 MP3、API Key、簽章網址、不可撤回 Git Blob SHA 加進公開倉庫。

## 重要品質與安全限制

- NASA 影片是 2010 年歷史示意資料，絕不可暗示是 NVIDIA 2026 年廠區。
- 不使用 NASA 原影片任何可能另有授權的音樂，僅抽取無聲影格。
- 影片影格與 ASR 技術成功，不代表影片具有新聞編輯品質；必須人工看十鏡預覽。
- 公開使用前應再評估聲線使用權、來源引用、口語資訊正確性和平台政策。
- PR 只可供 review，勿合併或連結任何公開發布接口。

## 技術來源

- [NVIDIA Investor Relations](https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Third-Quarter-Fiscal-2027/default.aspx)
- [NASA Goddard NCCS Video Files](https://svs.gsfc.nasa.gov/10568/)
- [NASA Images and Media Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
