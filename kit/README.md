# 模板庫（kit）

**一支片 = 一張鏡頭表。** 每一鏡選一個場景，填這一鏡的內容（字、數、圖、顏色、唸到哪個字）。鏡頭怎麼走、東西怎麼出現、前後層、運動模糊、字號顏色，模板全管了。這樣設計，是想讓換什麼模型來寫，動效都一樣穩；這一點還沒實測過。

**畫風的基準是成片，不是模板。** 基準是原版《AI到底有多燒錢》的每秒一幀（`examples/ai-burn-money/frames_1fps.jpg`），和用真素材手寫的《谷歌給蘋果的兩百億》（`examples/google-apple-20b/`）。**實拍和新聞是主角**：當事人實拍、新聞原文截圖、官方釋出會和廣告畫面；圖形只用來演錢和關係。**示例片裡的圖全是佔點陣圖**（`assets/kit/ph/`），只為看寫法；正式片裡一張都不能留，必須換成真素材。

- 場景是詞彙，不是鏡頭順序：先想這一鏡要讓觀眾多懂什麼（`says`），再在下面的「選場景」表裡找意思對得上的那個。
- 每個場景的樣子：`gallery/`（`00_sheet.jpg` 是 31 個場景的總覽，`<場景名>.jpg` 是單張，都是示例片裡截的、用的佔點陣圖）。動起來什麼樣：`gallery/gif/`（幾段 5 秒左右的動圖，見文末「檔案」）。想看一鏡從開頭到末尾怎麼變，建示例片跑 `--sheet`。
- 能跑的完整例子：`demo/film.js`（前 22 個場景各用一次）、`demo2/film.js`（後加的 11 個）。`node scripts/new_film.mjs <目錄> --demo`（或 `--demo2`）建出來就能渲。
- 規則（必須守的，帶編號、能檢查）和"這句話 → 場景"的決策表：`references/rules.md`。為什麼這麼設計：`references/thinking.md`、`references/motion.md`。

## 選場景：這句話在說什麼

先寫這一鏡的 `says`，再在下面找意思對得上的那一行。每個場景"什麼時候別用、換成什麼"見 `references/rules.md` 的決策表。

**數和錢**

| 這句話在說什麼 | 場景 | 最要緊的引數 |
|---|---|---|
| 一個決定性的數（金額、估值、市值） | `number` | `value` `brow`；累加時 `roll`；旁邊比一個小數 `sub` |
| 一筆賬：幾個數一算得出結果（攤到每天、幾家相加） | `equation` | `terms`（數和 `op` 交替，最後一個是結果） |
| 同一個數從多少變成多少（漲了幾倍、跌了九成） | `change` | `from` `to`（`to.at`：新數出來的時刻）`mult` |
| 兩到四個數排開認一認（營收、利潤、市值） | `stats` | `items`（`label` `value` `at`） |
| 兩三個數比高低，"差一大截" | `bars` | `bars` `gap`（`floor:false` 不要倒影） |
| 兩樣本該相配的東西差得離譜（估值 vs 收入） | `versus` | `items`（`tag.value` 決定圓盤面積） |
| 一串數按年變化、按年累計 | `chart` | `x` `values` `draw` `total` |
| 整體裡的一部分（佔比、份額） | `share` | `parts` `focus` |
| 五家以上排個隊 | `ranking` | `rows` `climb` `focus` |
| 甲 vs 乙逐項比（兩到四項） | `compare` | `left` `right` `rows`（`win`）`size` |

**關係和結構**

| 這句話在說什麼 | 場景 | 最要緊的引數 |
|---|---|---|
| 幾家公司 / 幾個人並列；誰收購誰、誰出局 | `discs` | `items`（`photo`；`at`：唸到誰亮誰） |
| 錢 / 關係怎麼流（誰投了誰、轉了一圈） | `network` | `nodes` `links` `steps`（`link` `flow` `loop` `focus` `pop`） |
| 一件事分幾步、幾個條件成不成立 | `flow` | `nodes`（`pos:[列,行]`）`links` `steps`（`mark`） |
| 三到六件事按時間排 | `timeline` | `nodes`（`year` `title` `at`） |
| 國家、城市之間的事（在哪設計、在哪造、錢流向哪） | `map` | `nodes`（`lon` `lat` `label` `at`）`links` `steps` |
| 一群裡拎出一個 | `cards3d` | `cards` `key` `keyAt` `text` |
| 上面都對不上，又要把幾樣東西放在一個世界裡講 | `board` | `nodes`（`type` 混著用）`links` `steps` `layout` |

**人**

| 這句話在說什麼 | 場景 | 最要緊的引數 |
|---|---|---|
| 這個人 = 這個數 / 這個身份 | `person` | `img`（摳像）`words` `color` `flip` `cards` `from` |
| 關鍵人物第一次出場：是誰、什麼身份、兩三件事 | `profile` | `name` `title` `img` 或 `photo` `facts` |
| 當事人的一句原話（沒有能用的原聲畫面） | `quote` | `text` `who` `hl` |

**真畫面和證據**

| 這句話在說什麼 | 場景 | 最要緊的引數 |
|---|---|---|
| 一段真畫面（人、地方、產品、釋出會） | `footage` | `img` 或 `clip`，`push` `focus` `badge` |
| 這件事 = 這些畫面（前景釘一個東西） | `montage` | `items` `pin` |
| 兩三樣有畫面的東西並列（晶片和資料中心） | `frames` | `items`（`label` `at`）`pin` `fill` |
| 觀眾可能不信的數：給出處 | `article` | `img` + `hl`（截不到用 `mock`），`zoom` `hlAt` |
| 幾家各自的新聞（截圖） | `desk` | `items`（`img` `at` `hl`）`all` `read` |
| 從上一鏡拎出一份證據 / 一句原聲 | `popup`（board 系列裡用 `pop` 步驟更好） | `img`/`clip` `back` |
| 說法很多，最要緊的只有一句 | `headlines` | `items` `pick` `mark` |
| 一個 App / 網站 / AI 產品的介面 | `device` | `img` `hl` `zoom` `label` |

**結構和包裝**

| 這句話在說什麼 | 場景 | 最要緊的引數 |
|---|---|---|
| 片名 / 章節 | `title` | `title` `brow` `items` |
| 長片的目錄、講到第幾章 | `agenda` | `items`；列目錄用 `at`，回到目錄用 `cur` |
| 一句判斷壓成金句（結尾、一段講完收一句） | `statement` | `lines` `hl` `at` `items` |
| 開頭鉤子：全網都在說一個詞 | `flash` | `keyword` `items` |
| 都對不上 | `custom` | `render` |

對不上就別硬塞：換一個更對得上的，或者用 `custom` 手寫（手寫也要寫 `says`）。

## 真人口播層（`host.js`）和新場景（`scenes_plus.js`）

為什麼這麼設計、什麼時候用哪種：`references/presenter.md`。影片的 t 就是口播的 t（`scripts/host_timeline.py` 對齊），口播幀在 `assets/clips/host/`，摳像在 `assets/cut/host/`。`film.js` 裡在 `KIT.use` 之後加一行 `await KIT_HOST.use(K,{faceY:330})`（她臉的中心在原片裡的 y，圓窗、豎窗按它裁）。

| 她在哪 | 寫法 | 例子（《打仗黃金反而跌》） |
|---|---|---|
| 房間全屏，景別跳 | `{scene:'host', zoom:[{at, s, x}]}`：`s` 放大（≤1.35，720p 原片 ≤1.2），`x` 往左(+)右(-)讓位 | `zoom:[{at:0,s:1.16},{at:'@b01:黃',s:1}]` 近景開口，說到"黃金"跳中景 |
| 東西掛在她身後的牆上 | `items:[{at, img/clip/html 或 value+vlabel, label, x, y, w, h, out, gray, no, fill}]`，座標是原片裡牆上空地的中心，挨著她的頭髮放 | `{img:'assets/img/goldbars.jpg', label:'黃金', x:1490, y:300, w:560, h:376, at:'@b01:黃'}` |
| 牆上照片推滿屏變成實拍 | 那張的 `fill:{clip:'smoke'}`（這一鏡最後 0.5 秒）；下一鏡 `{scene:'footage', clip:'smoke', from:.5, host:'pip', pipIn:'fade'}` | "亂世" → 真的戰火 |
| 身後換世界 | `swap:{at, words:['利','率'], brow, en, color, size, gap, top}`：房間換成織物舞臺，巨字夾在她和底之間；牆上的東西跟房間一起沒了 | `swap:{at:'@b05:問+0.1', words:['利','率'], brow:'問題出在', en:'INTEREST RATES'}` |
| 角上圓窗 | 任何場景加 `host:'pip'`（上一鏡是房間：她縮排去；上一鏡已經是圓窗：不動；`pipIn:'fade'` 淡入） | 戰火、金價圖、兩篇原文、紐交所 |
| 豎窗 + 圖形板 | 任何場景加 `host:'window'`：這一鏡的畫面縮排左邊的板子（16:9），她在右邊豎窗 | 因果鏈、美聯儲主席 |
| 回到房間 | `{scene:'host', enter:'grow'}`（框長回全屏，框裡就是這一鏡的樣子）或 `enter:'drop'`（上一鏡往下掉） | 每段證據講完 |

`--check` 多查一條：沒有她的畫面連著超過 4.5 秒會提醒。

**line：一條真實的走勢（日線）** `{scene:'line', data:{points:[['2025-09-02',3592.2],…]}, title, en, draw:{at,until}, marks:[{at, date:'max'|'last'|'2026-01-29', text, value}], level:{at, text}, focus:{at, from, value, brow}}`
- 開場先貼近線的起點，邊畫邊拉遠看整年（`intro:'none'` 不要）；`level` 從最後一個點往回拉虛線，停在上一次這麼低的那天（= "一年多來最低"）；`focus` 推到最近一段，線變紅，虛線下面立大數。
- 資料要有出處（《打仗黃金反而跌》用的是 Yahoo Finance GC=F 日收盤，寫進 brief）。

**chain：一條因果鏈** `{scene:'chain', items:[{at, title, img 或 value, color, sub}]}`
- 3–4 張豎卡一字排開，唸到哪張亮哪張，箭頭跟著畫出來；鏡頭只慢推，適合放進 `host:'window'` 的板子裡（一句話裡連著說三四環，鏡頭追著跑會糊）。

## 鏡頭表怎麼寫

```js
await K.film([
 {scene:'number', until:'@b03', says:'四家加起來一年砸七千多億', value:'$7250億', brow:'四家 · 2026 AI 資本開支'},
 {scene:'discs',  until:'@b05', says:'砸錢的是這四家', items:[...]},
 {scene:'title',  says:'片名', title:'AI到底有多燒錢'},     // 最後一鏡不寫 until = 到片尾
]);
```

每一鏡都有的四個欄位：

| 欄位 | 寫什麼 |
|---|---|
| `scene` | 場景名（上表） |
| `until` | 這一鏡到哪一刻結束。一般寫下一句開口 `'@b05'`，或唸到某個詞 `'@b05:英偉達'`。下一鏡從這裡開始，不會有空檔 |
| `says` | 這一鏡讓觀眾多懂了什麼（一句話）。說不出來，就是這一鏡還沒想清楚 |
| `enter` | 可選，這一鏡怎麼接上一鏡，見下面「接法」。不寫 = 直接切 |

### 時刻一律寫成字串

| 寫法 | 意思 |
|---|---|
| `'@b05'` | 句子 b05 開口 |
| `'@b05:英偉達'` | b05 唸到「英偉達」 |
| `'@b05:英偉達#2'` | 第二次唸到 |
| `'@b05:END'` | b05 說完 |
| `'@b05:英偉達+0.3'` | 唸到以後再過 0.3 秒（可以是負數） |
| `'@bite_b10'` / `'@bite_b10:END'` | b10 後面插的原聲開始 / 結束 |
| `'@title'` / `'@title:END'` | script.json 裡留的片名時間 |

詞要和 script.json 裡的原文一字不差（標點不算）。寫錯了 `--check` 會直接告訴你哪一鏡、哪個詞、原句是什麼。

### 接法（enter）：先問"帶過去的是什麼"

| enter | 說的是 | 什麼時候用 |
|---|---|---|
| `'cut'`（預設） | 直接切 | 大多數時候 |
| `'flat'` | 上一鏡講完了，倒成桌面當底，新東西站在上面 | 新聞、原文、圓盤講完 → 立起一個數（`number`）或一張圖表（`chart`，圖表從桌面上立起來） |
| `'push'` / `'push-right'` | 橫推換人：換一個人來說 | `person` → `person`。`push` 往左推走，`push-right` 往右 |
| `'through'` | 推過鏡頭：衝進下一個世界 | 換舞臺、又沒有東西能帶過去。`throughAt:[x,y]` 對準要衝進去的那個東西（上一鏡畫面上的座標），`throughScale` 放大到幾倍（預設 1.6） |
| `'blur'` | 上一鏡虛化當底 | 兩個世界之間，沒有能帶過去的東西 |
| `'whip'` / `'whip-left'` | 新畫面甩進來蓋住上一鏡 | 又來了一樣東西。`whip` 從右邊甩進來，`whip-left` 從左邊 |
| `'fade'` | 0.3 秒疊化 | 少用 |

- 同一種接法不要連著用；能"帶過"同一個東西時（同一個數、同一個人、同一個畫框）優先帶過，比任何轉場都好。
- `flat` 只接"一個東西立在中間"的場景：`number`、`chart`、`equation`、`change`、`stats`，和不帶 `items` 的 `title`、`statement`（原版和谷歌那條只用過 `number`、`chart`）。別的場景鋪滿畫面，會和倒下去的上一鏡疊在一起，寫了 `--check` 會提醒，改成 `cut` 或 `blur`。

### 顏色和底色

底只有一張很細的斜紋深藍織物（模板庫的 `assets/fabric.jpg`，`assets/make.py` 生成；中間略亮、四周壓暗）。原版和谷歌那條從頭到尾都是它；顏色只在當事人身後出現。

`tone`（舞臺底色）只有三個。有色底也是同一張織物染色，不是平塗漸變：

| tone | 什麼時候 |
|---|---|
| `navy`（預設） | 幾乎所有鏡頭 |
| `charcoal` | 中性的炭灰 |
| `wine` | 壓暗、低飽和的酒紅：只給"算總賬 / 虧錢"那一段（原版柱子那段就是酒紅底）。**一支片最多一段** |

寫別的（purple blue teal green gold red……）會按 navy 畫，`--check` 提醒。所有場景不寫 `tone` 都是 navy，一般不用寫。

- `glow`（顏色光）：預設關。只有 `person` 預設開：當事人身後是品牌色染的織物，中間一團品牌色光（谷歌那條：皮查伊身後一片谷歌藍 + 一團藍光），顏色跟著它的 `color`。其他場景不寫 `glow`：寫了照樣畫，但 `--check` 會提醒。
- `color`：公司名直接寫（`'nvidia'` `'英偉達'` `'openai'` `'google'` `'microsoft'` `'amazon'` `'meta'` `'oracle'` `'apple'` `'tesla'` `'tsmc'` `'alibaba'` `'tencent'` `'bytedance'` `'huawei'`……），或顏色名 `blue sky steel navy amber orange gold green lime teal cyan brick red wine purple violet pink gray slate black`，或 `'#2f6bd1'`。顏色名只用來給圓盤、柱子、卡片上色，不當整屏底色。
  - **同一家公司全片同一個顏色**：每一鏡都寫同一個值，最好就寫公司名。不要這一鏡寫 `'google'`、下一鏡寫 `'blue'`。人用他公司的顏色（皮查伊寫 `color:'google'`）。`--check` 按名字認（圓盤的 `name`、卡片和表頭的 `title`、`quote` 的 `who.name`、`profile` 的 `name`），同一個名字在不同鏡裡顏色不一樣就提醒，所以同一家公司每鏡的名字也寫成一樣。
  - 兩家撞色又要同框（谷歌和 Meta 都是藍，甲骨文和臺積電都是磚紅）：給其中一家定一個顏色名（比如 Meta 寫 `'sky'`），全片每一鏡都寫這個。
- 不要：整屏紫、青、金底；大團彩色光；前景浮塵（`K.dust` 已經停用，寫了會提醒）。

## 世界舞臺：board 系列（discs / versus / network / flow / timeline / map / board）

東西擺在一個世界裡，**唸到誰，鏡頭去找誰；狀態在原地變**（變灰、打勾、連線亮起、巢狀）。鏡頭機位模板自己算，不用寫座標。`board` 是不帶預設的那一個：節點型別混著用（圓盤 + 大數字 + 畫框），`layout` 自己選。

### 節點 nodes（discs、versus 裡叫 items）

```js
{id:'nvda', name:'英偉達', color:'nvidia', photo:'assets/img/nvidia_hq.jpg', tag:{label:'市值', value:'$5.2萬億'}, at:'@b06:英偉達'}
```

| 欄位 | 寫什麼 |
|---|---|
| `id` | 節點的名字（連線、步驟裡用） |
| `type` | `disc` 圓盤（discs/network 預設）· `card` 卡片（flow 預設）· `num` 大數字 · `pill` 小金額牌 · `img` 畫框 · `label` 一個短標籤 · `pin` 地圖上的點（map 預設）· `area` 地圖上一團光（標一個區域）· `event` 時間線的一年（timeline 預設） |
| `name` | 中文名，壓在盤上或盤下 |
| `photo` | 鋪滿圓盤的照片：當事人照片、公司大樓、產品圖示（優先用；原版和谷歌那條的圓盤都是照片）。`pos` 調照片在盤裡的位置（CSS 的 object-position，比如 `'50% 20%'` 讓臉往上） |
| `logo` | 沒有照片時，盤裡放一張白色單色的 logo 圖。都沒有就只寫 `name`：品牌色實心盤 + 名字 |
| `lt` | 舊寫法，不再畫字母 logo（厚玻璃 + 字母 logo 有 PPT 味）；只在沒寫 `name` 時當名字用 |
| `en` | 一行英文小字。圓盤、節點、卡片上不寫（英文小字只跟著眉題和片名，見 `rules.md`；寫了 `--check` 會提醒） |
| `tag` | 圓盤下面的價籤 `{label:'估值', value:'$8520億'}` |
| `title` `value` `img` `flag` | 卡片的標題、金額、底圖、小旗 |
| `at` | 唸到它的時候：出現 + 亮起（discs 只亮不動鏡頭，network/flow/timeline/map 鏡頭會去找它） |
| `pos:[列,行]` | flow 裡按格子擺（`[0,0]` `[1,0]` `[1,1]`……），間距自動 |
| `lon` `lat` | 地圖上的經緯度（map 裡用） |
| `x` `y` | 想自己擺就寫世界座標（1920×1080 為準，可以超出），一般不用 |

### 連線 links

```js
{from:'nvda', to:'oai', text:'投資', color:'green'}     // id 自動是 'nvda>oai'
```
`style`：`'dots'`（預設，圓點虛線，一直在流）`'dash'` `'solid'`；`curve`：彎曲（0.15 左右）；`arrow:false` 不要箭頭。

### 步驟 steps：每一步寫唸到哪個字、發生什麼

```js
steps:[
 {at:'@b11:投錢', link:'nvda>oai', focus:['nvda','oai']},
 {at:'@b11:投錢+0.5', pop:{img:'assets/img/cnbc.jpg', from:'nvda>oai', back:'@b11:花錢'}},
 {at:'@b12:轉了一圈', focus:'all', loop:['nvda>oai','oai>orcl','orcl>nvda']},
 {at:'@b12:英偉達', focus:'nvda'},
]
```

| 動作 | 意思 |
|---|---|
| `focus: id / [ids] / 'all'` | 鏡頭去找它們，它們亮著、其餘壓暗（看這個 / 看整體） |
| `light: id / [ids] / 'all'` | 只是亮起，鏡頭不動（一口氣念幾家的時候用） |
| `show: id / [ids]` | 出現（淡入），鏡頭放寬到看得見所有東西 |
| `gray: id` / `color: id` | 變灰（出局、不講了）/ 恢復顏色 |
| `hide: id` | 淡出 |
| `mark: {id:'ok'}` / `{id:'no'}` | 打勾 / 打叉（成立 / 不成立） |
| `link: 連線id` | 這條線畫出來 |
| `flow: 連線id` | 這條線變亮、流得更快（錢在走） |
| `loop: [連線id...]` | 一個亮點按順序沿這幾條線跑一圈（"轉了一圈"） |
| `nest: [裡面的id, 外面的id]` | 小盤被大盤套住（收購） |
| `tag: {id:'$687億'}` | 換掉圓盤下面價籤的數 |
| `roll: {id, from:'$0', until:'@b05:七千'}` | `num` 節點從 from 滾到它的 value |
| `pop: {img/clip, from:節點或連線id, back:'@...'}` | 從這個節點/連線撐開一張證據小卡，到 back 縮回去，舞臺不離場 |
| `cam: {s:1.2}` | 手動改機位（一般不用） |

其他引數：`layout`（`'row'` 一排 · `'ring'` 一圈 · `'hub'` 第一個在中間 · `'grid'` 按 pos · `'line'` 時間線 · `'free'` 按 x,y）；`pre`（`'gray'` 先灰著佔位、唸到才上色——discs/flow/network/timeline 預設；`'hide'` 唸到才出現——board、map 預設）；`brow`（整張圖上面一行眉題；寫了它，`num` 節點就別再寫自己的 `brow`）；`scale:'area'`（圓盤面積按數值算，versus 預設）；`under`（世界裡墊一張圖，比如地圖：`{img, x, y, w, h}`，再用 `pin` 節點標點）。開場"先看一個往裡推、先看整體往外拉"、慢漂、景深、運動模糊都是自動的。

## 各場景：數和錢

下面每個場景：說的是什麼、什麼時候別用、引數、例子。例子來自 `demo/film.js` 和 `demo2/film.js`（`PH` = `'assets/kit/ph/'`，佔點陣圖），建出示例片就能跑；寫 `assets/img/…` 的是你自己的素材路徑。引數的完整說明也寫在 `scenes.js` 每個場景的 `help` 裡。

### number：一個決定性的數　`gallery/number.jpg`
- 說的是：這句話的落點就是一個數（帶單位、物件、年份）。金色漸變的大數字，中文單位用數黑體，上面一行字距拉開的小號眉題。
- 別用：一句話要比兩三個數（用 `bars`/`stats`）；數後面馬上要拆構成（用 board 系列）。
- 引數：`value`（必填，`'$7250億'` `'5.2萬億'` `'-2780億'` `'30%'`）`brow`（眉題："誰 · 什麼"，14 個字寬以內）`en`（眉題下面一行英文，可省）`roll:{from, at, stop}` `full`（滿位數，滾數時預設）`sub:{label, value, at}`（旁邊冒一張小卡對比，大數退一步）`color:'gold'`（預設）`|'red'`（虧損）`|'white'` `tone`。
```js
{scene:'number', until:'@title', enter:'flat', says:'四家加起來一年 7250 億',
 value:'$7250億', brow:'四家 · 2026 AI 資本開支', en:'BIG FOUR · AI CAPEX 2026',
 roll:{from:'$1800億', at:'@d02:加起來', stop:'@d02:七千'}}
```
滾數只在"加起來、累計"本身就是意思的時候用，一支片最多兩次；從第一筆開始滾，話說到那個數正好停。前面的東西講完了還要留作底，就寫 `enter:'flat'`：上一鏡倒成桌面，數從下面立起來（原版"四家加起來"、谷歌那條"兩百億"都是這樣）。

### equation：算一筆賬　`gallery/equation.jpg`
- 說的是：幾個數和運算子一項項出來，最後的結果用金色、大一號，下面畫一道線。"一年七千二百五十億，攤到每天將近二十億"這種換算；"三家加起來"。
- 別用：超過 5 項（拆成兩步算）；結果不是這句話的落點（用 `number`）。
- 引數：`terms`（必填）：數和運算子交替，數寫 `{value, label, at}`，運算子寫 `{op:'÷'}`（`+ − × ÷ = ≈`）；最後一個數是結果。`brow` `en`（眉題，左對齊在第一項上方）`size`（預設 200，太寬會自動縮）。
- 什麼時候出來：第一項不寫 `at`，一開場就在（第一幀不空）；後面的數寫 `at`，唸到再出來；運算子不用寫 `at`，跟著它後面那個數一起出來。每出來一項，鏡頭往外讓一點去找它。
```js
{scene:'equation', until:'@e01', says:'一年七千多億，攤到每天將近二十億',
 brow:'四家 · 2026 AI 資本開支', en:'BIG FOUR · AI CAPEX',
 terms:[{value:'$7250億', label:'一年'}, {op:'÷'}, {value:'365', label:'天', at:'@e00:每一天'}, {op:'≈'}, {value:'$20億', label:'每天', at:'@e00:將近'}]}
```
結果要自己算對（7250 億 ÷ 365 ≈ 19.9 億），約數用 `≈`。

### change：從多少變成多少　`gallery/change.jpg`
- 說的是：同一個數從多少變成多少：左邊舊的（白，箭頭畫過去時壓暗），箭頭畫過去，右邊新的（金色、大三成），箭頭上寫漲了幾倍。鏡頭先只看舊的數，新數出來前往右讓開、拉到看全。
- 別用：中間還有好幾個階段（用 `chart` 或 `timeline`）；兩個數不是同一樣東西（用 `bars` 或 `versus`）。
- 引數：`from:{value, label}`、`to:{value, label, at}`（必填；`to.at` 是新數出來的時刻，不寫就開場後 1 秒左右）`mult`（箭頭上的倍數，`'×1.7'`，可省）`color:'gold'`（漲，預設）`|'red'`（跌）`brow` `en` `size`（舊數的字號，預設 190）。
```js
{scene:'change', until:'@e06', enter:'blur', says:'兩年裡英偉達市值漲了七成多',
 brow:'英偉達 · 市值', en:'NVIDIA · MARKET CAP',
 from:{value:'$3萬億', label:'2024 年'}, to:{value:'$5.2萬億', label:'2026 年', at:'@e05:五萬'}, mult:'×1.7'}
```
`mult` 自己算對（5.2 ÷ 3 ≈ 1.7）；跌的寫 `color:'red'`，倍數寫成 `'-90%'` 這類。

### stats：幾個數一字排開　`gallery/stats.jpg`
- 說的是：兩到四個數一字排開，每個數上面一行小字說它是什麼。小字一開場就在（先暗著，觀眾先知道要看哪幾樣），數唸到才出來，鏡頭往唸到的那個偏一點。
- 別用：要比大小（用 `bars`，高度一眼可見）；只有一個數（用 `number`）；超過 4 個。
- 引數：`items:[{label, value, at}]`（必填，2–4 個）`brow` `light:true`（唸到哪個只亮哪個，其餘壓暗；預設念過的都亮著）`color`（數的顏色，預設金）`size`（預設 150，自動縮到放得下）。每一項寫了 `photo`（或 `logo`、`lt`：盤裡一兩個字）再加 `color`，就在數上面放一個品牌色小圓盤。
```js
{scene:'stats', until:'@e07', says:'投入、估值、市值放在一起看',
 items:[{label:'四家一年投入', value:'$7250億', at:'@e06:四家'}, {label:'OpenAI 估值', value:'$8520億', at:'@e06:OpenAI'}, {label:'英偉達市值', value:'$5.2萬億', at:'@e06:英偉達'}]}
```

### bars：柱子對比（低機位）　`gallery/bars.jpg`
- 說的是：兩三個數按真實高度立成柱子，柱子佔滿畫面高度。深藍織物底，低機位、略帶透視，柱子站在地面上（有倒影和地面一抹光），柱頂是金色的數。不寫 `at` 的柱子一開場就立著（鏡頭看全）；寫了 `at` 的唸到才長，長的時候鏡頭跟著往上。"差一大截"時鏡頭沿著差的那一段往上抬，括號跟著畫出來。
- 別用：超過 5 根（用 `ranking`）；差距小到看不出來。
- 引數：`bars:[{label, value, color, at}]`（必填；`value` 是柱頂寫的字，高度按它的數；寫 `'?'` 的要給 `n`：估一個高度用的數）`gap:{at, a, b, text}`（從矮柱頂到高柱頂畫括號，鏡頭沿著它抬）`tone` `floor:false`（不要地面的倒影和光）。尺寸一般不用改：`barH`（最高那根多高，預設 500）`barW`（柱寬，預設 220）`barGap`（柱間距，按根數自動 200–320）。
- 算總賬、虧錢那一段要壓一壓氣氛：寫 `tone:'wine'`（原版柱子那段就是酒紅底）。一支片最多一段。
```js
{scene:'bars', until:'@d15', says:'投入和回報差一大截',
 bars:[{label:'每年砸進去', value:'$7250億', color:'red', at:'@d14:砸進去'}, {label:'收回來的', value:'?', n:900, color:'slate', at:'@d14:收回來'}],
 gap:{at:'@d14:差著', a:1, b:0, text:'差一大截'}}
```

### versus：按真實比例的反差　`gallery/versus.jpg`
- 說的是：兩樣本該相配的東西並排，小的小到幾乎看不見。圓盤面積按 `tag.value` 的數算。
- 別用：差別不大（看不出來就別比）；要讀出具體差多少（用 `bars`）。
```js
{scene:'versus', until:'@d06', says:'OpenAI 估值很高，收入很小',
 items:[{id:'val', name:'估值', color:'openai', tag:{label:'OpenAI 估值', value:'$8520億'}},
        {id:'rev', name:'收入', color:'openai', tag:{label:'今年收入', value:'$360億'}, at:'@d05:收入'}]}
```

### chart：白底圖表　`gallery/chart.jpg`
- 說的是：一條趨勢畫在白底圖表卡上（原版就是白底卡，略帶透視），線跟著話畫出來，累計數跟著線滾。
- 別用：只有一個數（用 `number`）；兩三個數比大小（用 `bars`，更有衝擊力）。
```js
{scene:'chart', until:'@d07', enter:'flat', says:'到 2030 年累計要虧 2780 億',
 title:'OpenAI 累計淨燒錢（示意）', x:['2026','2027','2028','2029','2030'], values:[-120,-380,-860,-1600,-2780], unit:'億',
 draw:{at:'@d06:淨燒', until:'@d06:兩千七百'}, total:{label:'累計淨燒', from:'$0', to:'-$2780億'}}
```
`kind:'line'|'area'|'bar'`，`color`（虧損預設紅），`mark:[{at, i, text}]`。資料要有出處；示意的要在標題裡寫"示意"。`total` 跟著線滾，也算一次滾數（一支片最多兩次，`--check` 連它一起數）。接 `enter:'flat'` 時，圖表卡從倒下去的上一鏡上立起來（原版"原文倒成桌面、圖表立起來"）。

### share：佔比　`gallery/share.jpg`
- 說的是：整體裡的一部分有多大：一個環，講到的那一塊亮起、往外推一點，中間寫這一塊的數。
- 別用：超過 5 塊（合併成"其他"）；要比幾個整體的大小（用 `versus`）。
- 引數：`parts:[{label, value, color}]`（必填，最多 5 塊；`value` 是佔比，加起來不用正好 100）`focus:[{at, i}]`（講到哪一塊）`center:{value, label}`（環中間的字，不寫就顯示講到的那一塊）`title`（環上方一行眉題）`rings:true`（環後面加一圈圈很淡的同心細線，預設沒有）。

### ranking：排行榜　`gallery/ranking.jpg`
- 說的是：一排數從大到小，講到誰誰亮。超過 5 行時鏡頭從末尾開始，往上走到第一名，差距由鏡頭走出來。
- 別用：只有兩三家（用 `bars` 或 `versus`）。
- 引數：`rows:[{name, value, color}]`（必填，從大到小排好）`title` `climb`（鏡頭從末尾往上走到第一名的時刻）`focus:[{at, i}]`（從 0 開始）。

### compare：兩邊逐項對比　`gallery/compare.jpg`
- 說的是：左右兩欄各一個表頭（公司、國家、時代），中間一個 VS，一行行比下去：贏的那邊變金色、打勾，輸的那邊壓暗。
- 別用：超過 4 行（挑最要緊的）；只比一項（用 `versus` 或 `bars`）；要看出差多少（用 `bars`）。
- 引數：`left:{title, color}`、`right:{title, color}`（必填，表頭；`color` 寫公司名）`rows:[{label, left, right, win, at}]`（必填；`win` 寫 `'left'` 或 `'right'`，不寫就不分輸贏；不寫 `at` 就開場後一行行自己出來）`brow`（表頭上面一行眉題）`size`（數字字號，預設 110）。超過 4 行 `--check` 提醒。
```js
{scene:'compare', until:'@e08', enter:'whip', says:'甲賺得多，乙長得快（示例資料）',
 brow:'示例資料 · 不是真實公司',
 left:{title:'公司甲', color:'green'}, right:{title:'公司乙', color:'red'},
 rows:[{label:'營收', left:'$600億', right:'$250億', win:'left', at:'@e07:營收'},
  {label:'利潤率', left:'55%', right:'10%', win:'left', at:'@e07:利潤率'},
  {label:'增速', left:'20%', right:'60%', win:'right', at:'@e07:增速'}]}
```

## 各場景：關係和結構

### discs：幾家公司 / 幾個人並列　`gallery/discs.jpg`
- 說的是：一家一個照片圓盤：品牌色的圓，照片鋪滿盤（底部壓一層品牌色），名字壓在盤上或盤下，細亮邊加投影。先灰著佔位，唸到誰亮誰；收購 = 巢狀（`nest`），出局 = 變灰（`gray`）。
- 別用：它們之間有流向（用 `network`）。
- 照片：公司用認得出的大樓、門店、產品圖示，人用他的照片（谷歌那條：谷歌大樓 + Safari 圖示兩個盤）。沒有照片就給一張白色單色 logo 圖（`logo`），再沒有就只寫 `name`：品牌色實心盤 + 名字。
```js
{scene:'discs', until:'@d02', says:'砸錢的是這四家',
 items:[{id:'goog', name:'谷歌', color:'google', photo:'assets/img/google.jpg', at:'@d01:谷歌'},
        {id:'msft', name:'微軟', color:'microsoft', photo:'assets/img/microsoft.jpg', at:'@d01:微軟'}, ...],
 steps:[{at:'@d01:這四家', light:'all'}]}
```
`photo` 換成你自己的圖。示例片裡這一鏡沒有照片，是品牌色實心盤 + 名字。

### network：關係網 / 資金迴圈　`gallery/network.jpg`
- 說的是：節點之間的流向。錢流到哪鏡頭跟到哪，"轉了一圈"有亮點跑一圈；中間可以彈出一張證據小卡（`pop`），舞臺不離場。
- 別用：沒有方向的並列（用 `discs`）。
- 例子見上面「步驟」；完整的在 `demo/film.js` 第 11 鏡（三個照片圓盤用的是 `face_a/b/c.jpg` 佔位頭像）。節點預設是照片圓盤，寫法同 `discs`。

### flow：流程 / 條件　`gallery/flow.jpg`
- 說的是：卡片和虛線箭頭，一步步亮起，對的打勾、錯的打叉，最後不確定的那一環變灰。
- 別用：只是並列幾樣東西（用 `discs`）；按時間先後（用 `timeline`）。
```js
{scene:'flow', until:'@d16', says:'鏈條的最後一環還不知道',
 nodes:[{id:'c1', title:'算力', color:'steel', pos:[0,0], at:'@d15:算力'}, ...,
        {id:'c4', title:'收回錢', color:'red', pos:[3,0], at:'@d15:賺回來'}],
 links:[{from:'c1',to:'c2'},{from:'c2',to:'c3'},{from:'c3',to:'c4'}],
 steps:[{at:'@d15:訓出', mark:{c1:'ok'}}, {at:'@d15:沒人知道', focus:'c4', gray:'c4'}]}
```

### timeline：時間線　`gallery/timeline.jpg`
- 說的是：年份排在一條光軸上，唸到哪年鏡頭推到哪年。三到六個點最好。
- 別用：只有兩個時間點（用 `change` 或 `bars`）。
```js
{scene:'timeline', until:'@d11', says:'三年裡錢越砸越多',
 nodes:[{id:'y22', year:'2022', title:'ChatGPT 上線', color:'openai', at:'@d10:二〇二二'}, ...]}
```

### map：示意地圖　`gallery/map.jpg`
- 說的是：點陣世界地圖（只有陸地、不畫國界），按經緯度標點、畫航線。唸到哪裡，鏡頭飛到哪裡；隔得遠會先拉遠再推近，像地圖軟體裡"飛過去"。
- 別用：要精確的國界（在中國平臺發的地圖要合規：用標準地圖服務 bzdt.ch.mnr.gov.cn 的底圖，放進 `board` 的 `under`）；只是"這家公司在美國"（一句話的事，不用地圖）。
- 引數：和 board 系列一樣（`nodes` `links` `steps`）。節點寫 `lon` `lat`（經緯度）、`label`（中文地名）、`at`；`type:'area'` 加 `r` 是一團光（標一個區域，比如中東）。連線預設是彎的金色虛線。節點預設唸到才出現，底圖一開場就在，第一幀不空。
- 一鏡裡要讓觀眾看到一次全貌：最後一個地方出現的那一步寫 `show` + `focus:'all'`（出現，同時鏡頭拉到看全），不要等這一鏡快結束了才拉全。
```js
{scene:'map', until:'@e03:創始人', enter:'through', says:'一顆晶片要跨三個地方才造得出來',
 nodes:[
  {id:'ca', lon:-121.96, lat:37.35, label:'加州 · 設計', at:'@e02:加州'},
  {id:'hc', lon:120.97, lat:24.8, label:'新竹 · 製造', at:'@e02:新竹'},
  {id:'nl', lon:5.4, lat:51.41, label:'荷蘭 · 光刻機'},
 ],
 links:[{from:'ca', to:'hc', text:'設計圖'}, {from:'nl', to:'hc', text:'光刻機'}],
 steps:[{at:'@e02:新竹', link:'ca>hc'}, {at:'@e02:荷蘭', show:'nl', link:'nl>hc', focus:'all'}, {at:'@e03', focus:'ca'}]}
```
唸到"荷蘭"時它出現、線畫出來、鏡頭拉到看全三個地方；下一句"設計它的公司"飛回加州，下一鏡從"創始人"接上。地點做什麼寫進 `label`（"加州 · 設計"），不寫 `en`。

### cards3d：一群裡拎出一個　`gallery/cards3d.jpg`
- 說的是：一組並列的東西（幾個國家、幾家機構）平鋪成一排排卡片（4–9 張，每排最多 4 張）。唸到 `keyAt`，主角那張放大、往前移，其餘壓暗、退到遠一層；`text` 再在上面壓一句大字。名字裡的"3D"是舊叫法，現在是平的。
- 別用：只有兩三樣（用 `discs`）；不需要拎出主角（用 `discs` 一排）。少於 3 張、多於 9 張 `--check` 提醒。
- 引數：`cards:[{title, color, flag, value}]`（必填）`key`（主角序號，從 0 開始）`keyAt`（拎出主角的時刻）`text:{zh, at}`。卡片顏色不寫就是統一的深色，主角亮起來才顯眼；別每張一個顏色。
```js
{scene:'cards3d', until:'@d13', says:'各國都在砸錢，最大的是美國',
 cards:[{title:'美國'}, {title:'歐盟'}, {title:'日本'}, {title:'英國'}, {title:'法國'}, {title:'德國'}, {title:'韓國'}, {title:'印度'}],
 key:0, keyAt:'@d12:還是', text:{zh:'出手最大', at:'@d12:美國'}}
```

## 各場景：人

### person：人站在巨字前面　`gallery/person.jpg`
- 說的是：這個人 = 這個詞。當事人的摳像站在兩組巨字前面（字在人和底之間）；身後是品牌色染的織物，中間一團品牌色光（谷歌那條：皮查伊身後一片谷歌藍，頭兩側"36 | %"）。全片的顏色光只給這裡。
- 要素材：人像摳圖（透明 PNG，`scripts/matte.py` 從實拍摳，或者從高畫質照片摳）。模板會自己量出頭在哪，把人放在中間、字分在頭兩側。
- 引數：`img`（必填）`words:['5.2','萬億']`（兩組，每組 1–4 個字）`color`（他公司的顏色：身後染色的織物、那團光、巨字的漸變都跟著它）`brow` `flip:[{at, words}]`（同一個人換一個說法）`cards:[{at, label, value}]`（他說到的小數在肩旁冒出來，巨字退一步）`from:{img, at}`（人身後換背景：先放原照片，at 那一刻換成舞臺 + 巨字；摳圖和原照片要同尺寸）`glow:false`（不要那團光，只留染色的織物）`tone`（寫了 navy/charcoal/wine 就不染品牌色，用這個底）`h` `top`。
- 別用：只有照片沒有摳圖（用 `profile` 的 `photo`，或者 `discs` 的照片圓盤）。
```js
{scene:'person', until:'@d05', says:'英偉達 = 全球市值第一',
 img:'assets/cut/jensen.png', color:'nvidia', words:['5.2','萬億'], brow:'英偉達 · 市值',
 flip:[{at:'@d04:全世界', words:['全球','第一']}]}
```
換下一個人用 `enter:'push'`（橫推換人）。

### profile：人物第一次出場　`gallery/profile.jpg`
- 說的是：一個關鍵人物第一次出現：左邊是他的摳像（或照片圓盤；都沒有就是品牌色實心盤 + 全名），右邊名字、英文名、身份，兩三條要緊的事一條條冒出來。
- 別用：這個人只出現一次、不重要（一句話帶過）；已經出場過（之後用 `discs` 的照片圓盤，或者 `person`）。
- 引數：`name`（必填）`title`（身份：`'英偉達創始人、CEO'`，按影片釋出那天查過再寫）`img`（人像摳圖，透明 PNG）或 `photo`（照片，放進圓盤）`color`（他公司的顏色）`facts:[{text, at}]`（最多 3 條，每條 16 字以內；不寫 `at` 就一條條自己冒）`tag:{label, value}`（名字下面一個價籤，比如身家）`en`（英文名）。
```js
{scene:'profile', until:'@e04', says:'英偉達的創始人黃仁勳：從遊戲顯示卡做起，幹了三十多年',
 name:'黃仁勳', en:'Jensen Huang', title:'英偉達創始人、CEO', img:PH+'person.png', color:'nvidia',
 facts:[{text:'1993 年和兩位朋友創立英偉達', at:'@e03:一九九三'}, {text:'從遊戲顯示卡做起', at:'@e03:遊戲顯示卡'}, {text:'當了三十多年 CEO', at:'@e03:三十多年'}]}
```

### quote：當事人的原話　`gallery/quote.jpg`
- 說的是：左邊他的照片圓盤（名字、身份寫在盤下），右邊一句中文原話，關鍵幾個字刷金；下面可以有一行英文原文和出處。
- 別用：有原聲畫面（用 `footage` 放原聲更真，前面一句做鋪墊）；話太長（壓到 30 字以內，超過 36 字 `--check` 提醒）。
- 引數：`text`（必填，中文原話）`who:{name, title, photo, color}`（沒有 `photo` 就是品牌色實心盤 + 名字）`hl`（要刷金的那幾個字，必須原樣出現在 `text` 裡，不然報錯）`hlAt`（刷金的時刻，預設這一鏡過了一半）`orig`（英文原文，可省）`source`（出處一短句，可省）。
- 原話要查得到出處，翻譯不改意思。`orig` 是一行英文小字（一幀的英文小字最多這一行），`source` 寫一短句（"誰 · 哪一場"）。
```js
{scene:'quote', until:'@e05', says:'他自己說：買得越多，省得越多',
 text:'買得越多，省得越多。', hl:'省得越多', hlAt:'@e04:省得',
 who:{name:'黃仁勳', title:'英偉達 CEO', photo:PH+'face_a.jpg', color:'nvidia'},
 orig:'The more you buy, the more you save.', source:'2023 年臺北電腦展主題演講'}
```

## 各場景：真畫面和證據

### footage：全屏實拍　`gallery/footage.jpg`
- 說的是：實拍就是在講的東西。全屏、乾淨、不壓字，鏡頭朝一個點慢推。
- 別用：畫面裡認不出是誰、是什麼（換一段有臉、logo、標題的）；想在上面加字（字只用 `person` 的巨字，或 `montage`/`title`/`statement` 退成底）。
- 引數：`img` 或 `clip`（`footage.py extract` 抽的幀序列名）`from`（從第幾秒開始）`rate`（播放速度，最慢 0.8）`push:[1,1.06]`（慢推的起止倍數）`focus:[x,y]`（往哪一點推）`settle`（接 frames 推滿屏）`badge:{name, color, at}`（上一鏡的圓盤縮成徽章釘在左上角，底下的實拍在換）。
- 實拍至少停 1.5 秒（不到 `--check` 提醒）；畫面裡要認得出是誰、是什麼（logo、人臉、標題）。原片燒進去的字幕和臺標，抽幀時放大裁掉。

### montage：釘住一個東西，底下換實拍　`gallery/montage.jpg`
- 說的是：這件事 = 這些畫面。前景釘一個視線落點（一個數、一個標題、一個圓盤），底下的實拍壓暗去色，0.42 秒一換。
- 別用：前景沒有視線落點（那就別快切）；底下的實拍要觀眾看清（用 `footage`）。
```js
{scene:'montage', until:'@d19', says:'這七千多億 = 這些樓和晶片',
 pin:{value:'$7250億', brow:'一年'}, items:['assets/img/dc1.jpg', 'assets/img/dc2.jpg', {clip:'site'}]}
```
`items` 至少 3 段不同的實拍（少於 3 段 `--check` 提醒）；實拍段可以寫 `{clip, from, rate}`，同一段輪到第二次時接著往後放，不從頭放。`step` 幾秒一換，`br` `sat` 調底下的亮度和飽和（預設 0.36、0.5）。

### frames：畫框並列　`gallery/frames.jpg`
- 說的是：兩三樣有畫面的東西並列，實拍裝進白邊畫框，唸到一樣甩進來一樣，各帶一箇中文標籤。`pin` 在上面釘一個數，線分到各個畫框（一個數分成兩路）；`fill` 把其中一個推滿屏，下一鏡接同一份素材的 `footage`（寫 `settle:true`）。
- 別用：只有一樣（用 `footage` 全屏）；超過 3 樣（太碎）。
```js
{scene:'frames', until:'@d04', says:'錢的大頭流向晶片和資料中心', pin:{value:'$7250億'},
 items:[{img:'assets/img/chip.jpg', label:'晶片', at:'@d03:晶片'}, {img:'assets/img/dc.jpg', label:'資料中心', at:'@d03:資料中心'}],
 fill:{i:0, at:'@d03:END-0.1'}}
```

### article：原文出處　`gallery/article.jpg`
- 說的是：可能被質疑的數先給出處。原文截圖攤在織物上（略斜、四周壓暗，不是整屏白網頁）：先看整頁上半，認出是哪家、哪天；鏡頭再推向那一句，熒光筆（正片疊底的黃）從左往右刷過。
- 別用：原文要讀很久（壓成一句再刷）；數沒核實過；有好幾篇要一起看（用 `desk`）。
- 有截圖：`img` + `hl`（要刷黃的框 `[x,y,w,h]`；折行就寫兩個：`[[…],[…]]`）。座標：`snap_news.mjs` 列印的框（也寫在 `docs/news.json` 的 `rects` 裡）原樣抄，它截的圖是 3200 寬、框是 1600 寬的網頁座標，模板會換算；別的截圖按圖片畫素量；對不上再寫 `cssW`（hl 按多寬的網頁座標算）。
- 截不到原文：`mock:{source, date, title, body:[...], mark}`，用核實過的文字排一頁通用樣式：不放任何真實網站的標誌和名字（`source` 寫"報道""外媒報道"這類），`mark` 要原樣出現在標題或正文裡。
- 時刻：`zoom` 是鏡頭開始推向刷黃處的時刻（預設這一鏡過了三成）；`hlAt` 是熒光筆刷過的時刻（預設 `zoom` 後 0.6 秒，鏡頭快推到位的時候）。`tilt`：截圖斜幾度（預設 -1.2，0 = 擺正）。
- 刷黃以後要清楚地停 1 秒以上：`until` 至少比刷黃晚 1.5 秒（刷 0.45 秒 + 停 1 秒），不夠 `--check` 提醒。
```js
{scene:'article', until:'@d06:淨燒', says:'虧損的數有出處',
 mock:{source:'報道', date:'2026-10-02', title:'OpenAI 預計 2030 年前累計燒錢約 2780 億美元',
  body:['（示例排版：截不到原文時，用核實過的文字排一頁通用樣式，不放任何真實網站的標誌。）','報道稱，這家公司在算力上的投入會繼續增加，收入的增長暫時追不上支出。'],
  mark:'2780 億美元'},
 zoom:'@d06:從今年'}
```
有真截圖時這樣寫（谷歌那條的雅虎財經截圖，框是 `snap_news.mjs` 列印的"$20 billion"）：
```js
{scene:'article', until:'@b03', says:'兩百億是官司裡翻出來的，有出處',
 img:'assets/docs/yahoo200.png', hl:[783.6, 139, 139.9, 34], zoom:'@b02:兩百億'}
```

### desk：新聞桌面　`gallery/desk.jpg`
- 說的是：幾篇真新聞的截圖攤在織物桌面上（透視，每張略斜）。唸到哪篇，鏡頭沿桌面滑過去（0.5 秒），那篇亮起來；`all` 抬高機位看全部；`read` 唸到證據時桌面抬平、推近看那一張，刷黃它的 `hl`。原版"四家各砸多少"、谷歌那條"兩百億的報道"都是它。
- 別用：截圖上的字太小、看不出是哪家（換截圖，或者用 `discs`）；只有一篇（用 `article`）。
- 引數：`items:[{img, at, hl, cssW}]`（必填，2–5 張，用 `snap_news.mjs` 截；`hl` 是這張上要刷黃的框，座標和 `article` 一樣）`all`（抬高看全部的時刻）`read:{i, at}`（唸到證據、抬平看第 i 張，從 0 數；那張要寫 `hl`）`tilt`（桌面傾角，預設 54，50–58 最像）`docW`（每張截圖攤在桌上多寬，預設 1280）。截圖的標題裡要看得出是哪家、多少錢。
- `read` 以後要留夠時間：`until` 比 `read.at` 晚 2 秒以上（抬平、刷黃，再停 1 秒），不夠 `--check` 提醒。
- 講完了還要留作底：下一鏡寫 `enter:'flat'`，接 `number`（金額立在倒下去的桌面上）。
```js
{scene:'desk', until:'@d17:追著問', says:'各家還在加碼',
 items:[{img:PH+'news_a.jpg', at:'@d16:各家'}, {img:PH+'news_b.jpg', at:'@d16:最近', hl:[176,306,272,80]}, {img:PH+'news_c.jpg', at:'@d16:新聞'}, {img:PH+'news_d.jpg'}],
 all:'@d16:還都', read:{i:1, at:'@d16:加碼'}}
```

### popup：反應窗 / 證據小卡　`gallery/popup.jpg`
- 說的是：從上一鏡裡拎出一份證據或一句原聲：上一鏡凍住壓暗，從 `from:[x,y,w,h]` 撐開一個視窗到 `to`（預設 1120×630），到 `back` 縮回。
- 別用：在 board 系列裡（用 `pop` 步驟，舞臺不凍住）；證據要細讀很久（給全屏 `footage` / `article`）；第一鏡（沒有上一鏡可凍）。
- 原聲反應梗也用它，前面一句要做鋪墊（"難怪黃仁勳總愛說這句："）。
```js
{scene:'popup', until:'@d18', says:'連新聞臺都在問',
 img:PH+'tv.jpg', back:'@d17:END'}
```
這一鏡從上一鏡（desk）的 `until` 開始，也就是念到"追著問"的時候：桌面凍住壓暗，視窗撐開。

### headlines：標題牆 → 一句　`gallery/headlines.jpg`
- 說的是：各家都在說：6–12 條新聞標題平鋪開（像攤開的剪報，平的，不斜、不疊；5 條以內一列，10 條以內兩列，再多三列），一條條很快出來；唸到 `pick` 那一刻，只亮起最要緊的那一條，其餘壓暗、退到遠一層，鏡頭推近、刷黃。
- 用在：開頭鉤子或轉折："說法很多，但有一句最要緊"。
- 別用：標題編不出真的（每條都要來自核實過的報道，外文的翻成中文）；只有兩三條（用 `desk` 放真截圖）。
- 引數：`items:[{src, title, date}]`（必填，6–12 條，少於 6 條 `--check` 提醒；`title` 30 字以內，最多折兩行，超了提醒）`pick:{i, at}`（亮起第幾條，從 0 開始）`mark`（被亮起那條裡要刷黃的字，必須原樣出現在它的 `title` 裡，不然報錯）`every`（一條條出來的間隔秒數，預設 0.08；0 = 一起出來）。
- 這是自己排的版，不是截圖：`src` 寫類別（"資訊""評論""問答"），不寫真實媒體的名字、不仿它們的樣式；出處寫進影片簡介。有真截圖就用 `desk`。
```js
{scene:'headlines', until:'@e09', says:'說法很多，要緊的只有一句：什麼時候賺回來',
 items:[
  {src:'示例 · 資訊', date:'10-02', title:'AI 晶片還要排多久的隊'},
  {src:'示例 · 評論', date:'10-05', title:'資料中心的電從哪裡來'},
  {src:'示例 · 資訊', date:'10-08', title:'大模型價格戰打到了幾分錢'},
  {src:'示例 · 問答', date:'10-11', title:'這錢什麼時候能賺回來？'},
  {src:'示例 · 影片', date:'10-13', title:'一年砸七千億，到底值不值'},
  {src:'示例 · 資訊', date:'10-16', title:'算力租金還在漲'},
  {src:'示例 · 討論', date:'10-20', title:'AI 應用到底誰在用'},
  {src:'示例 · 資訊', date:'10-24', title:'各家都說明年還要加碼'},
 ],
 pick:{i:3, at:'@e08:最要緊'}, mark:'什麼時候能賺回來'}
```

### device：產品介面　`gallery/device.jpg`
- 說的是：介面截圖裝進正面擺著的手機（或電腦）外框，不轉不斜；鏡頭推近到要看的那一塊，金色細框框出來，旁邊一個短標籤（手機寫在右邊，電腦寫在框上方），推近時標籤一起框進來。
- 別用：截圖上沒有要看的東西（用 `footage` 放錄屏）；有官方的產品實拍（用 `footage`，真東西更好）。
- 引數：`img`（必填，介面截圖：手機直式或電腦橫式，最好是自己截的真介面）`kind:'phone'`（預設）`|'laptop'` `hl:[x,y,w,h]`（截圖上要框出來的那一塊）`zoom`（推近到 `hl` 的時刻；不寫就這一鏡過了四成）`label`（短標籤，2–8 個字；寫了 `label` 就要寫 `hl`，不然 `--check` 提醒）`cssW`。
- `hl` 的座標：按截圖原圖的畫素量；`snap_news.mjs` 截的網頁圖（3200 寬）按 1600 寬的網頁座標，也可以寫 `cssW` 指定。截圖和螢幕比例不一樣時，截圖按鋪滿螢幕、頂對齊放，`hl` 跟著換算，不用自己算。
```js
{scene:'device', until:'@e10', enter:'through', says:'錢要從應用裡賺回來：看有沒有人掏錢',
 img:PH+'app.jpg', hl:[48,1150,984,250], zoom:'@e09:願不願意', label:'掏錢的人（示意）'}
```

## 各場景：結構和包裝

### title：片名 / 章節卡　`gallery/title.jpg`
- 說的是：這支片（這一段）要回答什麼問題。字是主角，底下的實拍壓暗退成底（`items`），不給就是舞臺。
- 別用：片名前面空等（第一句話說完就進）；一支片超過 3 張章節卡。
- 引數：`title`（必填）`brow`（片名上面，常是剛數出來的那個數）`en`（下面一行英文）`items`（底下壓暗去色的實拍：只給一段就連續放，一段實拍退成底；給幾段就 `step` 秒一換，預設 0.42，同一段輪到第二次時接著往後放）`br`（底下實拍的亮度，預設 0.34）`kind:'chapter'` + `num:'階段一'` `year:'2022'`（章節卡，一支片最多 3 張，多了 `--check` 提醒）。
- 不帶 `items` 的片名可以接 `enter:'flat'`（立在倒下去的上一鏡上）；帶 `items` 的不行。
- 片名放在鉤子之後。

### agenda：目錄 / 章節進度　`gallery/agenda.jpg`
- 說的是：幾個章節排成一列（大號序號 01、02……），現在講到的那一章亮起來，左邊一道金線。
- 用在：3 分鐘左右的長片：開頭列目錄；每一章開頭回到目錄、亮起這一章（寫 `cur`）。
- 別用：一兩分鐘的短片（不用目錄）；超過 6 章。
- 引數：`items`（必填，3–6 章，每章一個短語）`title`（目錄上面一行）`at`（列目錄時每一章亮起的時刻，陣列，和 `items` 一樣多）`cur`（章節開頭回到目錄時寫：現在第幾章，從 0 開始；寫了 `cur` 就不用 `at`）。
- 接法用 `cut`：目錄鋪滿畫面，`enter:'flat'` 會和倒下去的上一鏡疊在一起。
```js
{scene:'agenda', until:'@e02', says:'這支片要講四件事',
 title:'AI 這筆錢，分四段講', items:['錢從哪來','錢去哪了','誰在賺錢','能不能賺回來'],
 at:['@e01:錢從哪來','@e01:錢去哪了','@e01:誰在賺錢','@e01:能不能']}
```

### statement：金句　`gallery/statement.jpg`
- 說的是：一句判斷壓成一兩行大字，關鍵詞刷金，最後一行下面一道金線。結尾，或者一大段講完收一句。
- 別用：放一段話（只放一兩行、每行 10 字左右，超過 12 個字寬 `--check` 提醒）；每段都來一句（一支片最多三次）。
- 引數：`lines`（必填，一兩行）`hl`（要刷金的詞，陣列）`at`（每一行出來的時刻，陣列；不寫就一起出來）`brow`（上面一行小字：`'所以'` `'說到底'`）`items`（底下壓暗的實拍，可省：只給一段就連續放，幾段就 0.6 秒一換）`br`（底下實拍的亮度，預設 0.3）`color:'gold'`（預設）`|'red'`。一支片超過 3 句金句 `--check` 提醒。
- 結尾的金句，底下用開頭那段實拍最好：首尾呼應。谷歌那條的結尾就是一段 Safari 實拍壓暗退成底，寫成 `items:[{clip:'safari'}]`。不帶 `items` 的金句可以接 `enter:'flat'`。
```js
{scene:'statement', says:'結論：賣鏟子的最賺錢',
 brow:'說到底', lines:['賣鏟子的','最賺錢'], hl:['最賺錢'], at:['@e10:賣鏟子','@e10:最賺錢'],
 items:[PH+'site.jpg', PH+'servers.jpg', PH+'chip.jpg']}
```

### flash：開頭關鍵詞快閃　`gallery/flash.jpg`
- 說的是：一個關鍵詞釘在正中，周圍的出處每 5 幀換一張 = "全網都在說"。
- 別用：話題不熱（編不出真的出處）；關鍵詞超過 4 個字；不是開頭。
- 引數：`keyword`（2–4 個字）`items:[{cat, left, right, sum}]`（至少 8 條：左半句 + 關鍵詞 + 右半句）`every`（幾幀換一張，預設 5）。
- 內容來自核實過的報道或開放式問題；不編資料、不模擬實網站。閃到第一個具體物件出現為止（不到 2 秒最好），下一鏡可以 `enter:'through'` 衝進去。

### custom：手寫一鏡
`render:(t, c) => HTML`。`c.t0` `c.t1` `c.at('@b05:詞')` `c.bg(t, 機位, 上一幀機位, {tone})`（tone 只用 navy、charcoal、wine）`c.prev`（上一鏡，畫它最後一刻用 `MV.still(c.prev, c.t0-.01)`）；工具：`S25`（`camPath` `L` `mega`……）、`MV`（手法庫）、`KIT`（`disc` `card` `bignum` `brow` `chrome` `appear` `camSeq` `fit`，截圖座標換算 `cssScale`，按寬度折行 `wrapLines`……）。手寫也要過 `references/motion.md` 的三句話，也要守 `references/rules.md`：不做滿屏 3D、不加顏色光、實拍上不壓字。

## 檢查和出圖

```
node scripts/render.mjs --dir <影片> --check        # 鏡頭表：每鏡的時間、場景、接法、says，加上要看一眼的提醒（幾秒鐘）
node scripts/render.mjs --dir <影片> --sheet        # 每鏡開頭/中間/末尾三幀拼一張圖（out/sheet.png）
node scripts/render.mjs --dir <影片> --video --h 720
```

報錯必須改。提醒不是禁令，每一條都要答得上"為什麼這裡就該這樣"。提醒和怎麼改（對應的規則編號見 `references/rules.md`）：

**寫法**

| 提醒 | 怎麼改 |
|---|---|
| 某個詞找不到 | 詞要和 script.json 原句一字不差；重複的詞用 `#2` |
| 沒寫 says | 寫清這一鏡讓觀眾多懂了什麼；寫不出來就重想這一鏡 |
| 還在用佔位素材 | 成片之前全部換成真素材 |

**節奏**

| 提醒 | 怎麼改 |
|---|---|
| 第一句幾秒才開口 / pre 太大 | 0.5 秒內開口：`script.json` 的 `pre` 不超過 0.35 |
| 第一鏡到 8 秒以後才換 | 開頭要快：第一句話說完就進主體 |
| 第一幀是空的 / 第一幀只有眉題 | 加 `pre:'gray'`，或者讓第一樣東西一開場就在 |
| 只有幾秒，至少要幾秒觀眾才看得清 | 這一鏡太短：併到前後鏡裡，或者把 `until` 往後挪（實拍至少 1.5 秒） |
| 刷黃以後只停了幾秒就切走 | 證據至少停 1 秒：`article` 的 `zoom`/`hlAt`、`desk` 的 `read.at` 提前，或者 `until` 往後 |
| 一鏡 6.5 秒以上沒有新的落點 | 拆成兩鏡，或者加一兩個 step（board 系列） |
| 連著三個同樣的場景 | 能合成一個場景的幾個 steps 就合 |
| 全片只用了幾種場景 | 40 秒以上的影片至少 4 種 |

**接法**

| 提醒 | 怎麼改 |
|---|---|
| 連著用同一種 enter | 換一種，或者直接切 |
| 用了 push | 橫推只說"換一個人"：兩鏡都是 `person` 才用 |
| `flat` 只給站在桌面上的場景用 | 改成 `cut` 或 `blur`；要倒成桌面，就換成 `number`、`chart`、`equation`、`change`、`stats`，或不帶 `items` 的 `title`、`statement` |

**畫風**

| 提醒 | 怎麼改 |
|---|---|
| 真素材的鏡頭只有幾成 | 不到四成就是"全是圖形"：把能用真東西說的鏡頭換成 `footage`、`person`、`desk`、`article`（截圖）、`frames`、`montage`…… |
| tone 不再當整屏底色 | 只用 `navy`、`charcoal`、`wine` |
| 全片幾段酒紅底 | 只留"算總賬 / 虧錢"那一段，其餘用 `navy` |
| 開了 glow | 刪掉：顏色光只給 `person` |
| 浮塵已經去掉了 | 刪掉 `dust` / `K.dust` |
| 同一家公司用了幾種顏色 | 每一鏡的 `color` 都寫公司名，同一家公司每鏡的名字也寫成一樣 |

**字**

| 提醒 | 怎麼改 |
|---|---|
| 圓盤 / 節點 / 卡片 / 表頭寫了 en | 刪掉：英文小字只跟著眉題和片名 |
| 整張圖的 brow 和 num 節點的 brow 同時寫了 | 一幀最多一組眉題，留一個 |
| 眉題太長 / 巨字超過 4 個字 / 金句一行太長 / 原話太長 / 標題超過 30 字 | 壓短：眉題"誰 · 什麼"，巨字一兩個詞，金句每行 10 字左右，原話 30 字以內 |

**數量**

| 提醒 | 怎麼改 |
|---|---|
| 全片幾處滾數 | 只留"累加"本身就是意思的一兩處（`number.roll`、`chart.total`、board 的 `roll` 一起數） |
| 全片幾句金句 / 幾張章節卡 | 金句、章節卡各不超過 3 |
| 場景自己的數量（frames 1–3 個、desk 2–5 張、cards3d 3–9 張、compare 4 行以內、headlines 至少 6 條、flash 至少 8 條、montage 至少 3 段……） | 按提醒加減；數量對不上，多半是場景選錯了，回 `rules.md` 的決策表 |

`--check` 過了不等於好看：再跑 `--sheet` 看圖，渲 720p 以後和 `examples/ai-burn-money/frames_1fps.jpg` 並排比（`references/review.md`）。

## 檔案

| 檔案 | 是什麼 |
|---|---|
| `kit.css` | 字型、顏色、零件樣式（圓盤、卡片、大數字、價籤、畫框、圖表卡、原文頁……）。改風格改這一份 |
| `kit.js` | 鏡頭表、時刻、接法、自動機位、狀態隨時間變、整片提醒 |
| `scenes.js` | 場景模板（每個場景的 `says/use/avoid/help` 就是它的說明書） |
| `assets/` | 舞臺織物紋理（`fabric.jpg`）、顆粒；`worldmap.png` 點陣世界地圖；`ph/` 是佔位素材（成片裡不能出現）；`make.py` 重新生成它們 |
| `demo/` | 示例片的 `film.js` 和 `script.json`（前 22 個場景） |
| `demo2/` | 示例片二（後加的 11 個場景） |
| `gallery/` | 每個場景的樣子：`<場景名>.jpg`（640×360）+ 總覽 `00_sheet.jpg`。kit 改了畫風就重出：`python kit/gallery/make.py <demo 目錄> <demo2 目錄>`（截哪一刻寫在 make.py 的 `AT` 裡） |
| `gallery/gif/` | 動圖（560 寬、每秒 12 幀，從示例片 720p 截的）：`flat_roll` 圓盤倒成桌面、數立起來滾到總數 · `article_chart` 原文刷黃 → 倒下、圖表立起來 · `network` 錢在三家之間轉一圈 · `bars` 柱子長出來、鏡頭沿著差距走 · `map` 地圖上飛一段 · `change` 數從多少變成多少 · `headlines` 標題牆裡拎出一句刷黃 |

字幕樣式不在 kit 裡，在影片自己的 `film.css`（新片從 `starter/film.css` 拷：MiSans Medium 60px、白字帶柔陰影、盒子頂在 y=936，和原版一樣）。`new_film.mjs --sync` 只更新 `lib/` 和 `assets/kit/`，不動 `film.css`：老影片要新字幕，手動從 `starter/film.css` 拷。
