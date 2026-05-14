# zenbu-loop FAIL 缺陷分批協定（v2，v3.15.0 封存）

> **⚠️ v3.15.0 封存**：本協定為 Stop hook driven acceptance loop 設計（解決 evaluator FAIL 時把整份缺陷清單塞回主窗口導致 context 爆炸）。v3.15.0 起 Stop hook 退場、evaluator 改 opt-in markdown 報告，本協定不再運作。檔案保留供未來重新設計時參考。

> **歷史狀態**：已實作（commit 213c34f）。Stage A 設計 / Stage B evaluator schema 對齊（acceptance-evaluator.agent.md + acceptance-evaluation/references/output-schema.md）/ Stage C stop-hook Step 6 + reflex 第 10 條全部完成。
> **歷史目的**：解決 evaluator FAIL 時把整份缺陷清單塞回主窗口導致 4-5 輪後 context 爆炸、後續輪次模型遺漏缺陷的問題。
> **歷史核心策略**：每輪 reason 字串只放 top 3 高優先級缺陷當「降壓 summary」，完整報告寫到檔案讓主窗口主動 Read。同一輪不分批（不增加 loop 總輪數），但每輪餵回主窗口的 token 量降到上限。

---

## 1. JSON Schema（v2）

evaluator 在報告結尾必須輸出符合此 schema 的 JSON 區塊（用 fenced code block ```json ... ``` 包起來，stop-hook 從 transcript 抽 last fenced JSON）。

```json
{
  "schema_version": 2,
  "verdict": "FAIL",
  "total_defects": 12,
  "batch_size": 3,
  "batch_index": 1,
  "items": [
    {
      "id": "D1",
      "severity": "high",
      "summary": "註冊頁面未實作 /register 路由",
      "fix_hint": "在 src/router.tsx 加入 <Route path=\"/register\"/> 並建立 RegisterPage 元件"
    }
  ],
  "next_batch_token": "abc123:1:3",
  "full_report_path": "C:\\Users\\user\\DEV\\zenbu\\zenbu-powers\\.claude\\zenbu-loop-reports\\abc123-r1.md"
}
```

### 欄位定義

| 欄位 | 型別 | 必填 | 語意 |
|---|---|---|---|
| `schema_version` | integer | 必填 | 永遠是 `2`。stop-hook 用此判斷協定版本，不是 2 走 v1 fallback |
| `verdict` | string enum | 必填 | `"PASS"` \| `"FAIL"`。PASS 時 `items` 必為 `[]`、`total_defects=0` |
| `total_defects` | integer | 必填 | 本輪 evaluator 識別的缺陷總數（不是本批，是全部）|
| `batch_size` | integer | 必填 | 本批塞進 `items` 的缺陷數，固定上限 `3`（協定常數，evaluator 不可自訂）|
| `batch_index` | integer | 必填 | 從 `1` 起算。v2 第一輪固定為 `1`（同一輪不分批，所以恆為 1；保留欄位給未來「同輪內多批」擴充）|
| `items` | array | 必填 | top-N（按 severity desc 排序）缺陷摘要陣列。長度 ≤ `batch_size`。PASS 時為 `[]` |
| `items[].id` | string | 必填 | `D1`/`D2`/...，與 full_report 中的編號嚴格一致 |
| `items[].severity` | string enum | 必填 | `"high"` \| `"medium"` \| `"low"` |
| `items[].summary` | string | 必填 | 單行（≤ 80 字元），不換行不含 markdown 控制字元 |
| `items[].fix_hint` | string | 必填 | 具體修復方向（≤ 160 字元）。寫得到「改哪個檔案的什麼」就寫，純空話（「再仔細看」）禁止 |
| `next_batch_token` | string \| null | 選填 | 格式 `<session_id>:<round>:<served_count>`。served_count = items 已餵出的數量。`total_defects ≤ batch_size` 時為 `null` |
| `full_report_path` | string | 必填 | 完整報告的**絕對路徑**。即使 PASS 也建議寫（保留 audit trail），但 PASS 時 stop-hook 不引用 |

### Schema 驗證規則

- `verdict="FAIL"` 時 `total_defects ≥ 1` 且 `items` 非空
- `verdict="PASS"` 時 `total_defects=0` 且 `items=[]`
- `items.length ≤ batch_size`
- `items[].id` 全域唯一、與 full_report 編號對應

---

## 2. Report 檔案路徑規則

### 命名 Convention

```
<project_root>/.claude/zenbu-loop-reports/<session_id>-r<round>.md
```

- `<project_root>`：以 hook 收到的 `cwd` 為根（與 `.claude/zenbu-loop.local.md` 同源）
- `<session_id>`：取 hook input data 的 `session_id`（UUID 或 hash 字串，evaluator 由 dispatch prompt 取得）
- `<round>`：從 1 起算的本輪 round_count（FAIL 後 ++ 之**後**的值，與 state file 一致）
- 副檔名 `.md`，UTF-8 無 BOM

### 為什麼放在 `.claude/` 而非 `~/.claude/data/`

- 與 `.claude/zenbu-loop.local.md`（Manual Loop state file）同目錄，符合「per-project 任務級資料放 project，跨 session 全域資料放 home」的既有切分
- 主窗口 Read 時用相對路徑或相對 cwd 的絕對路徑都直觀

### 檔案格式

完整 markdown，至少包含以下 sections（evaluator 寫入時遵循）：

```markdown
# 驗收評估報告 r<round>

**Session**: <session_id>
**Round**: <round> / <max_rounds>
**Verdict**: FAIL
**Total Defects**: <N>

---

## 缺陷清單

### D1 [high] 註冊頁面未實作

**Summary**: 註冊頁面未實作 /register 路由
**Fix Hint**: 在 src/router.tsx 加入 <Route path="/register"/> 並建立 RegisterPage 元件
**對應 Criterion**: C2
**Full Evidence**:
- 檔案 `src/router.tsx` 第 12-45 行只定義了 /login、/dashboard
- playwright 訪問 /register 回 404
- 用戶任務 step 3 明確提到「同時實作註冊」

### D2 [high] ...
（每項缺陷一個 ### 區塊，含 id/severity/summary/fix_hint/對應 criterion/full evidence）

---

## 反向訊號掃描結果

（沿用既有 report-template.md 的 Reality Check 區塊）

---

## JSON Block（給 stop-hook 解析）

```json
{ <符合 §1 schema 的 JSON> }
```
```

### 清理策略

| 時機 | 動作 |
|---|---|
| PASS 時（任意 round） | **不刪**該 session 的所有 r<round>.md。保留至少 7 天 audit trail，由用戶手動清理或未來補 GC script |
| 達 max_rounds 升級時 | 不刪，作為升級給用戶查證的證物 |
| 同一 session 重跑 | r<round>.md 以 `<round>` 為唯一鍵覆寫；舊輪報告保留 |
| 跨 session | 不互相影響（檔名以 session_id 隔離）|

> **設計取捨**：刻意不自動刪。同一專案 7 天內若累積過多（> 50 個檔），由用戶 / 未來 maintenance script 處理。debug zenbu-loop 失敗時這些檔案是關鍵證物。

---

## 3. Main Agent fetch-next-batch 流程偽碼

主窗口收到 stop-hook 餵回的 reason 字串時的處理（reflex 第 N 條約束的具體實作）。

```
INPUT: reason 字串（含「待修缺陷（top 3 / total <N>）」+ 缺陷編號清單 + full_report_path）

1. 解析 reason 字串前綴，識別出 full_report_path 與 total_defects
2. 立即修復 reason 內列出的 top 3 缺陷（D1/D2/D3）
   - 派對應 master agent 修
   - 修完跑相關測試 / lint / build 確認沒回退
3. 若 total_defects > 3：
   a. Read full_report_path 取完整缺陷清單
   b. 對 D4..D<total_defects> 逐項修復（同步驟 2）
   c. 修完所有項才允許進入下一狀態
4. 修復完成後 stop（不主動回報用戶——讓 stop-hook 重派 evaluator 複審）
5. evaluator 複審若 PASS → 流程結束；若仍 FAIL → 下一輪 reason 又給 top 3，重複流程
```

### Anti-pattern（禁止行為）

- ❌ 只修 top 3 就 stop，期待下一輪 evaluator 自己再給剩下的
  - 後果：每輪 evaluator 都從 D1..D<N> 重排序，剩餘缺陷排序可能變動，造成「永遠只修前 3 項、後面缺陷飢餓」
- ❌ 把整份 full_report.md 內容貼回對話讓自己複習
  - 違背降壓初衷，等同於沒分批
- ❌ 看到 reason 提到「top 3 / total 12」就打斷流程問用戶「要不要繼續修剩下的」
  - 違反 reflex 第 7 條「不中途停下」

---

## 4. v1 ↔ v2 相容矩陣

| 場景 | evaluator 輸出 | stop-hook 解析行為 | 餵回主窗口的 reason | 結果 |
|---|---|---|---|---|
| 完整 v2 | 含 schema_version=2 的 JSON block + report 寫檔成功 | 解析成功 → 取 items + full_report_path | `[v2] 待修缺陷（top 3 / total <N>）：\nD1 ... \nD2 ... \nD3 ... \n完整清單見 <full_report_path>` | 分批降壓正常 |
| evaluator 未升級（v1 純文字） | 沒有 JSON block，純 markdown | 偵測不到 fenced JSON → fallback v1 | 既有行為：「<evaluator 報告中前 3 條缺陷清單，編號列出>」（從 markdown 自行截斷） | 降級正常 |
| schema_version=1（明示舊版） | 含 JSON 但 version=1 | 識別為 v1 → 走 v1 fallback | 同上 | 降級正常 |
| JSON 格式錯誤 | 不合 §1 schema（missing required field、type 錯） | parse 失敗 → log warning → fallback v1 | 同 v1 | 不卡死 |
| `verdict="FAIL"` 但 `items=[]` | schema 自相矛盾 | 視為 schema 錯誤 → fallback v1 | 同 v1 | 不卡死 |
| evaluator 完全空回應 | `""` 或全空白 | 無從解析 | `evaluator 無回報，視為驗收失敗，請主 orchestrator 重新檢查產出後再次 stop` | 不卡死，下輪重審 |
| `verdict="PASS"` | items=[] | 走既有 PASS 流程（重置 round_count、刪 Manual state file） | 不送 reason（allow stop） | 正常結束 |
| full_report_path 寫檔失敗 | JSON 有但檔案不存在 | stop-hook 自己 Write 一份 minimal report 含 items | reason 改指向 stop-hook 補寫的 path | 容錯 |
| full_report_path 路徑非法（非 .claude/zenbu-loop-reports/） | JSON 內容可疑 | 視為 schema 錯誤 → fallback v1 | 同 v1 | 防注入 |

### v1 fallback 詳細邏輯（沿用既有）

stop-hook 偵測不到 v2 JSON 時：
1. 讀 evaluator markdown 報告
2. 抓「## 不達標項目摘要」表格的前 3 列（既有 stop-hook-spec.md Step 6 的隱性行為）
3. 包成 reason 餵回
4. 不寫 batch state file（v1 不分批）

---

## 5. 狀態檔設計

### 新增檔案

```
Windows: %USERPROFILE%\.claude\data\zenbu-loop-batch-state.json
Unix:    ~/.claude/data/zenbu-loop-batch-state.json
```

### Schema

```json
{
  "<session_id>": {
    "round": 1,
    "total_defects": 12,
    "served_count": 3,
    "report_path": "C:\\Users\\user\\DEV\\proj\\.claude\\zenbu-loop-reports\\abc123-r1.md",
    "last_updated": "2026-05-08T14:23:11+08:00"
  }
}
```

| 欄位 | 型別 | 語意 |
|---|---|---|
| `round` | integer | 與 zenbu-loop-state.json 同 session 的 round_count 一致；用作 cross-check |
| `total_defects` | integer | 本輪 evaluator 報告的總缺陷數 |
| `served_count` | integer | v2 設計上同一輪不分批 = `min(batch_size, total_defects)`，目前恆等於 `items.length`。保留欄位給未來「同輪內多批」擴充 |
| `report_path` | string | 本輪完整報告絕對路徑 |
| `last_updated` | string | ISO 8601 時間戳 |

### 寫入時機

| 時機 | 動作 |
|---|---|
| stop-hook Step 6 FAIL 處理時，成功解析 v2 JSON | 寫入該 session 的 entry（覆寫舊輪資料）|
| stop-hook Step 6 FAIL 但 fallback v1 | **不寫**（v1 沒有 batch 概念）|
| stop-hook Step 6 PASS | 刪除該 session 的 entry（清理）|
| stop-hook Step 4 達上限升級 | 刪除該 session 的 entry |
| stop-hook Step 7 安全失敗 | 不動該檔（避免雙重失敗）|

### 與 zenbu-loop-state.json 的職責分工

| 維度 | `zenbu-loop-state.json` | `zenbu-loop-batch-state.json` |
|---|---|---|
| 用途 | round_count 計數（決定何時升級）| 本輪 batch 進度（給主窗口/debug 工具看哪批服務了多少）|
| 生命週期 | session 級，PASS 後重置 | session 級，PASS 後刪除 entry |
| 相依性 | 必存在（核心邏輯）| 選填（v2 才寫；v1 / 失敗時不寫，主流程不依賴此檔）|
| 失敗處理 | 寫失敗繼續執行 | 寫失敗繼續執行 |

> **為什麼分檔不合一**：避免 v1 路徑碰 v2 schema、避免單檔過大（同時記計數與快照）、避免一次寫失敗污染兩種職責。檔名 `-batch-` 明確標示用途。

---

## 6. reflex-dictionary 補強

在 `hooks/reflex-dictionary.txt` 既有第 10 條後（或視 numbering 排序插入）追加：

```
10. **zenbu-loop FAIL reason 含 full_report_path 時**：必須立即 Read 該檔案取完整缺陷清單；reason 字串內的 top 3 只是降壓 summary，不是任務全集。修完前 3 項後若 total_defects > 3，繼續修 D4..D<N> 才能 stop；禁止只處理 top 3 就停手等下輪 evaluator 重排。
```

### 與其他 reflex 的關係

- 第 5 條（驗收紀律）：本條延伸——驗收 FAIL 後的修復也要走完整覆蓋
- 第 7 條（不中途停下）：本條的具體場景化——分批 reason 不是天然 phase 邊界，禁問「要不要繼續修剩下的」

---

## 7. 已知限制

### 7.1 不解決根本問題

本協定**只降壓不根治**：
- 主窗口 LLM 仍可能「健忘」忘記去 fetch full_report_path
- reflex 是軟約束，模型在長對話中仍可能無視
- 真正根治需要在 hook 層強制（例如：偵測到主窗口連續多輪沒 Read full_report_path 就 systemMessage 警示），但這超出本協定 scope，留給未來 Stage D

### 7.2 同一輪不分批 → loop 總輪數不變

- v2 沒有「一輪內多批」邏輯，每輪 evaluator 仍跑一次完整評估
- 如果有 12 個缺陷，主窗口仍需在**單一輪內**全部修完（top 3 + 從 full_report 撈 D4..D12）
- 改善的只是「reason 字串塞入主窗口的 token 量」，不是「主窗口要做的工作量」
- 結果：loop 總輪數與 v1 接近（理想狀況下都應該 1-2 輪 PASS），但 context 累積壓力降低

### 7.3 v1 fallback 仍會 context pollution

- evaluator 沒升級時走 v1 fallback，行為與現況一致
- 只有 evaluator 已升級到 v2 報告格式時才享受降壓收益
- Stage B 升級 evaluator 後即生效

### 7.4 主窗口忽略 reflex 的失敗模式

- 若主窗口直接修完 top 3 就 stop 不去 Read full_report_path：
  - evaluator 複審必然 FAIL（剩餘缺陷還在）
  - 下一輪 reason 又給 top 3（可能與上輪重疊或重排）
  - 最壞情況：模型每輪都修同一批，剩餘缺陷飢餓，達 max_rounds 升級
- 緩解：reflex 第 10 條 + Stage D 的 hook 層強制（未來工作）

### 7.5 evaluator 自評 severity 的可信度

- v2 要求 evaluator 對每項缺陷標 high/medium/low 並按降序取 top 3
- evaluator 可能 severity 評估失準 → 真正阻擋的缺陷被排到 D4 以後
- 緩解：full_report.md 完整列出所有缺陷，主窗口走 §3 流程仍會修到全部

### 7.6 跨 session 的 session_id 不可預測

- session_id 由 Claude Code 提供，主窗口無從預測
- evaluator 寫 full_report_path 時必須由 stop-hook dispatch prompt 把 session_id 傳給 evaluator
- evaluator 若拿不到 session_id 就無法決定路徑 → 退回 v1 fallback（這在 §4 有覆蓋）

---

## Hand-off / Next Agent

**本檔結束於設計階段，實作分兩階段交回 orchestrator 派發**：

### Stage B：升級 acceptance-evaluator
- 改 `agents/acceptance-evaluator.agent.md`：報告結尾必須輸出 §1 schema 的 JSON block
- 改 `skills/acceptance-evaluation/references/report-template.md`：模板末尾加 JSON block 範例 + full_report 寫檔指示
- 取得 dispatch prompt 中的 `session_id` 與 `round`，據此計算 `full_report_path`
- 接受人：負責 evaluator agent 設計的 maintainer（建議 orchestrator 派 markdown / agent design 工）

### Stage C：升級 stop-hook
- 改 `hooks/stop-hook-spec.md` Step 6 FAIL 分支：
  - 從 transcript 抽 evaluator 最後一個 fenced JSON
  - 依 §4 矩陣決定 v2 / v1 / 空回應 / 錯誤路徑
  - v2 路徑寫 `zenbu-loop-batch-state.json`、組裝新格式 reason
- 改 `hooks/reflex-dictionary.txt`：新增 §6 條文
- 接受人：負責 hook 邏輯實作的 maintainer

### 同步更新（兩 stage 完成後）
- `commands/zenbu-loop*.md`、`README.md`、`scripts/zenbu-loop-*.mjs` 中提及 reason 格式 / report 檔案的章節對齊新協定
- 補一份 manual smoke test：刻意製造 5+ 缺陷的任務，觀察 r1.md 至 r3.md 的累積與主窗口 Read 行為
