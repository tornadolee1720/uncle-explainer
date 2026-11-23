# NVIDIA 新聞證據與原版 vpro｜隔離驗收

這是 **獨立技術驗收**，不是已完成的商用影片。不得自動部署、發布、排程、上傳第三方平台，也不得使用專案既有的 Fish API 密鑰。

## 驗收範圍

1. **本地測試頁**：Playwright 截圖、meta.json 讀取與文字位置驗證。結果只能標為 `FIXTURE_ONLY`，不能作為真實新聞來源。
2. **原版動畫引擎**：以 `new_film.mjs` 建立直式影片、`render.mjs --check`、`--stills`、`--video --h 720 --range 0:4` 直接渲染 native `vpro`，不採替代字卡引擎。
3. **真實新聞**：僅取 NVIDIA 官方 IR 或 NVIDIA Newsroom 來源；`snap_news.mjs` 取得 PNG 與新聞文字座標後，`verify_news_capture.mjs` 檢查網址、頁面標題、圖片、可見關鍵字。若失敗則標為 `BLOCKED`，不得假造新聞截圖。
4. **證據進畫面**：`build_news_proof.mjs` 將已驗證的截圖和關鍵字正規化座標寫入 `vp-paper` 的 `hl`，再以原版 `render.mjs` 渲染 4 秒來源證據粗剪。

## 執行

開立本分支的 PR 後，參考 GitHub Actions 的 **News evidence + native vpro smoke (internal only)**。下載內部 artifact 查閱 `capture_report.json`、PNG、`EVIDENCE_MANIFEST.json`、`visual_720_range.mp4`。

本地可使用：

```bash
npm ci
npx playwright install chromium
node scripts/snap_news.mjs tests/news-proof/nvidia_jobs.json
node scripts/verify_news_capture.mjs tests/news-proof/nvidia_jobs.json
node scripts/new_film.mjs /tmp/news-real-proof --vertical
node scripts/build_news_proof.mjs tests/news-proof/nvidia_jobs.json /tmp/news-real-proof
node scripts/timeline_stub.mjs /tmp/news-real-proof/script.json
node scripts/render.mjs --dir /tmp/news-real-proof --check
node scripts/render.mjs --dir /tmp/news-real-proof --video --h 720 --range 0:4
```

## 尚未通過的部分

- 真正的官方截圖需看 GitHub Actions 的遠端執行結果；連結可開啟不代表 Playwright 擷取成功。
- 截圖通過技術驗證仍須人工核對畫面、來源和引用權利。
- 目前使用 **stub 時間軸** 測畫面，不是 Fish Audio 的真實逐字時間線。
- 這次只做 4 秒渲染驗收；**沒有製作完成 60 秒有聲影片**，也沒有任何社群發布行為。

官方資料：2026-11-17 NVIDIA FY27 Q3 `Revenue $115.8 billion`，本地影片僅作工程試驗；確切數字和時間範圍以 NVIDIA IR 為準。
