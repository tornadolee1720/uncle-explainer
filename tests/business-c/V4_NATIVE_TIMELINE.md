# C 題 V4｜原版 vpro 的聲音驅動畫面（實驗中）

## 核心改變

V3 先以估算時間軸產生 53 秒影片，再依實際音訊長度經 FFmpeg 調速剪回十鏡。**V4 改由十句音檔長度先生成真正的 `timeline.json`，原版 `render.mjs` 直接使用該時間軸生成各鏡**，避免只是對成品做大幅變速。

程式：`scripts/business-c-v4/native_voice_timeline.py`。

### 目前測試及狀態
- 本機已使用十句不同長度實體 WAV（非 Fish、合成測試音）通過時間軸生成與五項防呆測試。
- 這輪 GitHub CI `business-story-c.yml` 新增 `--test-tones`、`render.mjs --check`、`render.mjs --sheet`，不將合成測試音誤標成正式 Fish。
- **目前尚無由真正 Fish MP3 生成的 V4 有聲影片**。GitHub 成功代表引擎可行，不代表配音已完成。

### 真正 Fish 模式輸入
在有網路、可下載 Fish MP3 的安全電腦，從前一版 `one_click_fish_v3.py --fetch-only` 取得十個 `b01.mp3` … `b10.mp3`；短效 URL 失效必須重新生成。執行：

```bash
python scripts/business-c-v4/native_voice_timeline.py \
  --film-dir /private/film \
  --source-voice-dir /private/voice \
  --fish-manifest /private/fish_manifest.json
node scripts/render.mjs --dir /private/film --check
node scripts/render.mjs --dir /private/film --video --h 720
python scripts/mix.py /private/film
```

程式會在正式模式核對十句 `id`、逐字稿、實體 MP3 檔案大小及 SHA-256；不符就拒絕。

### 錯誤標籤與發布禁制

- `timeline.json` 的每句開始／結束取自物理音檔，但**句內每字時間仍是依字重線性估計**，不是 Whisper、forced alignment 或人工逐字校正。影片可作內部審核，不可說已達逐字精準同步。
- 仍需人工檢查角色對話由男聲旁白配音是否自然、數字是否念對、字幕不遮擋人物與鏡頭。
- 不提交 Fish API Key、授權 MP3、短效 URL；不在 GitHub 公開 artifacts 放入 Fish 聲軌，不合併 main、不發布社群、不修改正式 MCP。
