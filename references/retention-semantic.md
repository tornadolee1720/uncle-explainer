# v1.1 語意審查與留存風險

新建工程的 .retention-required 為 2；原 v1 工程標記 1 仍可使用，會明示未進行 v1.1 審查。舊工程要升級可手動將標記改為 2。不得以刪除或降級標記繞過審查。

先寫好 script.json、retention.json、timeline.json，執行：
```
node scripts/retention-review.mjs <影片目錄>
```
這只會輸出 fingerprint、metrics 與 risks，**不會自動批准**。配音變更、文案改字或台帳更新後必須重新執行並重新審查，不可僅換指紋。正式 render --check / --video 都檢查。

在影片目錄寫 retention-review.json，格式：
```json
{
 "version":1,"fingerprint":"使用 CLI 的實際輸出",
 "reviewer":{"type":"ai","name":"實際審查者名稱"},
 "reviewedAt":"實際 ISO 日期時間","decision":"pass",
 "promise":{"decision":"pass","reason":"具體解釋哪句如何兌現承諾","refs":[{"lineId":"價值段句子ID","quote":"逐字原句片段"}]},
 "safety":{"decision":"pass","reason":"說明適用界線或為何不適用","refs":[{"lineId":"實際句子ID","quote":"逐字原句片段"}]},
 "evidence":{"decision":"pass","reason":"記錄實際查證來源或非事實示例理由","refs":[{"lineId":"實際句子ID","quote":"逐字原句片段"}]},
 "cta":{"decision":"pass","reason":"說明單一行動或自然結尾","refs":[{"lineId":"實際句子ID","quote":"逐字原句片段"}]},
 "values":{"價值段首句ID":{"decision":"pass","reason":"說明與前段不同的具體新資訊","refs":[{"lineId":"該段實際句子ID","quote":"逐字原句片段"}]}},
 "loops":{"懸念ID":{"decision":"pass","reason":"解釋答案如何回答前段問題","refs":[{"lineId":"回收段實際句子ID","quote":"逐字原句片段"}]}},
 "risks":{"CLI輸出的風險ID":{"decision":"accept","reason":"具體說明不可刪除的敘事或安全理由"}}
}
```
這是欄位示意，不得複製虛構 pass。每個價值段、每個懸念均需獨立記錄；沒有風險用空物件。逐句做刪句測試，判斷是否有新資訊、情感、情境或必要安全界線；先修稿，再重建指紋。不要僅改台帳迎合檢查。審查可由 AI 或真人執行，須誠實標示，不可假稱獨立真人批准。證據查核仍需依原 SKILL 留原始來源，這個檢查器不會確認醫學事實或讀懂答案。

初版風險門檻（秒）：UGC 鉤子1/價值10/懸念8/空窗8；short 1/8/12/10；explainer 3/12/25/15；long 5/20/60/35。從旁白段落起點計算，不能推斷首幀或段內實際視覺價值。是可解釋的製作假設，非平台最佳值。相似度用字元二元組，不能判斷真正語意；合理重複、故事鋪陳與安全說明可記錄例外。不可犧牲理解與安全以達門檻。報告在 out/retention-check.json。
