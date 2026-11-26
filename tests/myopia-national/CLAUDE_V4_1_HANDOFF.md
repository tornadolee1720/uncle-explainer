# Claude Code 製片交接｜台灣學童近視：近十年全國資料（Uncle Explainer V4.1）
**狀態：可進入「資料審核＋無聲影片試製」，不可直接視為可發布的衛教成片。**

## 專案定位
- Repo: `tornadolee1720/uncle-explainer`
- 唯一允許寫入的分支: `experiment/taiwan-myopia-national-20261124`
- 初稿與整理數據: `tests/myopia-national/national-evidence-and-script.json`
- 參考成功的 C 題 V4.1 架構: `scripts/business-c-v4/native_voice_timeline.py`、`scripts/business-c-v4/compose_voice_first_story.py`、`.github/workflows/business-c-v4-native-smoke.yml`
- **請勿照抄 C 題固定現金流、虛構工廠、70/20/50 萬敘事、動畫文字；這次是不同的醫事／資料影片。**
- **禁止更動** main、C 題分支或正式 MCP；不得 merge、deploy 或發布 FB／YouTube／Threads。

## 核心問題與內容邊界
片名候選：`學校視力不良率下降，代表台灣孩子近視減少了嗎？`
故事不是硬說「近視持續上升／下降」，而是帶觀眾認清：
1. 全國屈光近視調查（依檢測法與近視度數門檻定義）與
2. 教育部逐年學校裸眼視力不良統計
是**不同分母、不同量測目的與不同指標**。禁止疊成同一條線、算成同一個年增減率；裸眼視力不良下降不能推出近視盛行率下降。

### 必須先過的資料 Gate（Fail Closed）
- 開啟上述 JSON，但它是**待審研究筆記，不等於證據已核實**。逐筆回查原始官方 PDF/統計年報，確認：年份/學年度、全國與地方、年級、分母、樣本、是否散瞳、屈光門檻和來源頁碼。
- 1986–2006 舊調查採 `-0.25 D`，2010 及 2017 候選值另列 `-0.50 D`；若不能證明方法可比，分組呈現並加明顯註記，**絕不可畫成無縫十年近視趨勢線**。
- JSON 2022 `grade6_pct=62.66` 目前 `primary_report_verified:false`，不得當成同尺度更新年點；也不可用「最新全國近視率」稱呼它。若找不到原始研究，僅於來源限制頁註明「待核實」，或完全省略。
- JSON 2021、2022、2023 `45.23` 數值重複；必須回核原始官方表格，不能假設三年完全相同。
- 2014–2024 `annual_school_vision_failure` 是**全國國小學年度裸眼視力不良率**候選資料；只有官方原始頁或年報逐項核查後，才能在正式旁白和標題數據中使用。
- 不得以 1986 與 2017 冒充「近十年數據」，必須拆為「長期歷史背景」和「近十年教育視力篩檢趨勢」。
- 所有數值建立 `EVIDENCE_AUDIT.json`，每一筆欄位包含 `claim_id/measure/population/school_year/calendar_year/value/threshold/method/source_url/source_page/verification_state`。`verification_state` 僅允許 verified / pending / rejected。
- **缺少足夠 verified 數據時，不可產出貌似正式科學結論的影片**；允許暫時做清楚浮水印 `研究審核中｜僅供分鏡測試` 的內部樣片。

## 畫面導演規格｜保留現有 V4.1 視覺 DNA
- 9:16 直式，720×1280，30fps，H.264；素材原創、手機老花友善的大字、重要數字與日期清晰。
- 基礎色：海軍藍 `#18263A`、米白 `#F5F1E6`、重點黃 `#FFD45C`；結合 V4.1 深藍綠、暖琥珀與柔和紙感。避免高飽和科技霓虹、模板 PTT 字卡連播。
- 延續「矛盾開場→人物情境→可視化歷史→資料定義反轉→家長能理解的結論」節奏。圖表必須真的變化，包含年份標籤及統計母體，而非靜態卡片加大字幕。
- 原創虛構台灣學童／家長／教室示意，不得冒充真實學生或機構拍攝。以孩子看黑板與視力篩檢形成場景，但**不能暗示模擬畫面是某種近視度數的臨床真實視覺**。
- 不要照搬 V4.1 商業故事的老闆、員工、金幣與 50 萬現金動畫。應改成：教室黑板→屈光檢查→百分比圖層→標準對照→不同測量工具的雙軌圖解。
- 使用 vpro 現有原生場景，僅在有明確教育價值時用 Pillow／FFmpeg 畫原創外層動畫；保留原版 Scene API 與 CI 能力，不做無意義的大改造。

## 10 鏡規劃（供 Claude 優化，但不能自行捏造資料）
1. Hook（0–5 秒）：`學校視力不良率變低，難道台灣孩子近視也變少？` 大型標籤「先別急著下結論」。
2. 台灣國小生活現場：孩子在教室看黑板，畫面標示「虛構情境示意」。
3. 歷史全國近視調查：一兩個**verified** 年份數字，明顯呈現年級與近視門檻；資料缺失不補值。
4. 方法警報：`-0.25 D 與 -0.50 D` 的門檻差，用兩個尺規／分岔示意視覺化，不接成一條趨勢線。
5. 在定義確實一致的前提下呈現 2010 與 2017 年全國近視調查；不能宣稱是連續年度資料。
6. 切換第二組全國資料：學校逐年裸眼視力篩檢，將「視力不良」字樣加大顯示。
7. 近十年學年度年度條形／折線動畫（僅 verified 數值），注明母體、年份、篩檢標準、來源。
8. 兩個看似矛盾的趨勢疊開，標出「兩者不是同一個指標」；**禁止在同一個縱軸直接比較絕對盛行率**。
9. 2022 後可能存在其他新研究，但若方法和原始報告未核實，不得聲稱「最新數據顯示近視已下降」。
10. 專業收尾：`一次視力篩檢是提醒，不代表已知道近視度數。孩子的眼睛，更需要持續了解與追蹤。` 以家長看得懂的判斷方式落地。

## 工程交付標準
A. `tests/myopia-national/EVIDENCE_AUDIT.json`：來源、逐項查核與未核查清單。不可只把來源 URL 貼在 JSON 不查。
B. `tests/myopia-national/DIRECTOR.md`：十鏡逐鏡 hook／觀眾收穫／視覺對象／數字來源／高亮時間／醫事風險。
C. `scripts/build_myopia_national.mjs` 和 `scripts/make_myopia_art.mjs`：每鏡 anchor 與 `script.json` 一一驗證；做全新視光影片，不覆蓋 C 題程式。
D. 獨立 workflow `.github/workflows/myopia-national-v41.yml`：Node tests → 原版 vpro render --check、--sheet、--video → ffprobe 9:16 H264 30fps/片長 → 研究證據 Gate → 內部 artifact（MP4、分鏡、QA）。
E. 配音採原有 `taiwan_ad_male` 廣告男聲為首選，但**未拿到實際 Fish 音檔絕不可宣稱完成正式有聲片**；若要測聲音先行渲染可用 `SYNTHETIC_TEST_TONE_NOT_FISH`，不可混淆。
F. 請交付 `QA.json`：`render_verified`、`data_verified`、`fish_voice_embedded`、`human_medical_review_required:true`、`publish_allowed:false`，且不因程式跑過便將全部標成 true。
G. GitHub 僅保留新主題專用**實驗分支**，Draft PR，不合併 `main`、不發布或上傳社群；不能改動正式 SEO MCP。

## 成功的定義
不是十個漂亮的幻燈片。必須有：一個新觀眾能被吸引的 3 秒衝突、一段清晰可見的兩種指標差別動畫、原始證據可追溯、真正可重複渲染的 MP4，以及毫不含糊的未完成項目。**資料查核若未過，最多只算樣片，不算衛教成片。**
