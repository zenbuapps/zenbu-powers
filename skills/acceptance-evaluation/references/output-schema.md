# Output Schema：zenbu-loop Batch Protocol v2（v3.15.0 封存）

> **v3.15.0 變更**：本 schema 原為 Stop hook + zenbu-loop driven evaluator 設計的「批次 JSON 輸出協定」（讓 hook 機械解析 verdict 並組裝下輪 reason）。v3.15.0 起 Stop hook 已從 `hooks/hooks.json` 移除，evaluator 改為 opt-in 模式直接被用戶 / orchestrator 喚醒並回報 **markdown 報告**，不再強制輸出 JSON block。本檔保留供未來重新設計時參考。

> 本檔抽自 `hooks/zenbu-loop-batch-protocol.md` Section 1（同樣封存）。
> 該檔為協定 single source of truth；本檔僅作為 evaluator agent 撰寫報告結尾 JSON block 時的快速查表與 worked examples。
> 若兩檔語意衝突，**以 `hooks/zenbu-loop-batch-protocol.md` 為準**。

---

## 1. 何時需要輸出此 JSON

> **v3.15.0 起非必須**——保留 schema 供未來驗收機制重新設計時參考。

歷史設計（v3.13 - v3.14）：當 acceptance-evaluator 在 zenbu-loop 體系內被 dispatch（無論是否明示 zenbu-loop session），**報告結尾必須輸出**符合本 schema 的 fenced JSON code block。stop-hook 會從 transcript 抽 last fenced JSON 以判定 verdict 並組裝下輪 reason。

不在 zenbu-loop 體系內的單次驗收也建議輸出，反正 stop-hook 沒抓到就忽略，無副作用。

---

## 2. JSON Schema（v2）

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
| `next_batch_token` | string \| null | 選填 | 格式 `<session_id>:<round>:<served_count>`。**evaluator 一律填 `null`**，由 stop-hook 計算填入 |
| `full_report_path` | string \| null | 選填 | 完整報告的**絕對路徑**。**evaluator 一律填 `null`**，由 stop-hook 寫檔後填入 |

### evaluator 可控 vs stop-hook 接管

| 欄位 | evaluator 負責 | stop-hook 負責 |
|---|---|---|
| `schema_version` / `verdict` / `total_defects` / `batch_size` / `batch_index` | ✅ 必填 | — |
| `items` | ✅ 必填（按 severity desc 取 top 3）| — |
| `next_batch_token` | 一律填 `null` | ✅ 寫檔後計算填入 |
| `full_report_path` | 一律填 `null` | ✅ 寫檔後填入 |

> 為什麼 evaluator 不寫 `full_report_path`：避免 evaluator 與 stop-hook 雙重寫檔導致路徑不一致。evaluator 只負責產生 markdown 報告主體 + JSON metadata，檔案落地由 stop-hook 統一處理。

### Schema 驗證規則

- `verdict="FAIL"` 時 `total_defects ≥ 1` 且 `items` 非空
- `verdict="PASS"` 時 `total_defects=0` 且 `items=[]`
- `items.length ≤ batch_size`（即 ≤ 3）
- `items[].id` 全域唯一、與 full_report 編號對應
- `items` 按 `severity` 降序排列（high → medium → low）

---

## 3. Worked Examples

### Example A：PASS（無缺陷）

評估結論一切達標，所有 nullable 欄位填 `null`、`items` 為空陣列：

```json
{
  "schema_version": 2,
  "verdict": "PASS",
  "total_defects": 0,
  "batch_size": 3,
  "batch_index": 1,
  "items": [],
  "next_batch_token": null,
  "full_report_path": null
}
```

stop-hook 收到 PASS 後直接 allow stop，不送 reason、不寫 batch state。

---

### Example B：FAIL，12 缺陷只回 top 3

evaluator 識別出 12 項缺陷，按 severity 降序取前 3 塞 `items`，剩餘 9 項由 stop-hook 寫到 full_report：

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
    },
    {
      "id": "D2",
      "severity": "high",
      "summary": "登入後未跳轉至 dashboard，停留在 /login",
      "fix_hint": "src/pages/LoginPage.tsx onSubmit 成功後 navigate('/dashboard')"
    },
    {
      "id": "D3",
      "severity": "medium",
      "summary": "密碼欄位未做 8 字元最低長度驗證",
      "fix_hint": "src/schemas/auth.ts password 加 z.string().min(8)"
    }
  ],
  "next_batch_token": null,
  "full_report_path": null
}
```

注意：
- `items` 雖只有 3 筆，但 markdown 報告主體仍要列出 D1..D12 完整資訊（讓 stop-hook 寫進 full_report）
- `total_defects=12` 告訴 stop-hook 必須寫 full_report 並計算 next_batch_token
- D4..D12 不會塞進此 JSON，主窗口透過 Read full_report_path 取得

---

### Example C：邊界 — 不合法的 schema（反例）

以下情境 evaluator **絕對不可**輸出，stop-hook 會視為 schema 錯誤並 fallback v1：

#### C1：`verdict="FAIL"` 但 `items=[]`

```json
{
  "schema_version": 2,
  "verdict": "FAIL",
  "total_defects": 0,
  "batch_size": 3,
  "batch_index": 1,
  "items": [],
  "next_batch_token": null,
  "full_report_path": null
}
```

❌ FAIL 但無缺陷 → 自相矛盾。若評估結論是 FAIL，至少要有 1 筆 item；若沒缺陷，verdict 應為 PASS。

#### C2：severity 全 low 但 verdict=FAIL

技術上合法（low 嚴重度也可能組合導致 FAIL），但須在 markdown 報告主體說明「為何 low severity 累積仍判 FAIL」，否則容易被誤判為過度敏感。

```json
{
  "schema_version": 2,
  "verdict": "FAIL",
  "total_defects": 5,
  "batch_size": 3,
  "batch_index": 1,
  "items": [
    {"id": "D1", "severity": "low", "summary": "...", "fix_hint": "..."},
    {"id": "D2", "severity": "low", "summary": "...", "fix_hint": "..."},
    {"id": "D3", "severity": "low", "summary": "...", "fix_hint": "..."}
  ],
  "next_batch_token": null,
  "full_report_path": null
}
```

✅ Schema 合法，但建議重新檢視：是否真的需要 FAIL，或可降為 PASS + 改善建議。

---

## 4. 常見格式錯誤（反例）

下列三種錯誤會讓 stop-hook 解析失敗並 fallback v1，evaluator 必須避免：

### 反例 1：缺必填欄位

```json
{
  "schema_version": 2,
  "verdict": "FAIL",
  "items": [{"id": "D1", "severity": "high", "summary": "...", "fix_hint": "..."}]
}
```

❌ 缺 `total_defects`、`batch_size`、`batch_index`。stop-hook 必填欄位驗證失敗 → fallback v1。

修正：補齊所有必填欄位（即使值為 `null` 也要寫，不可省略）。

---

### 反例 2：型別錯誤

```json
{
  "schema_version": "2",
  "verdict": "FAIL",
  "total_defects": "12",
  "batch_size": 3,
  "batch_index": 1,
  "items": [
    {"id": 1, "severity": "high", "summary": "...", "fix_hint": "..."}
  ],
  "next_batch_token": null,
  "full_report_path": null
}
```

❌ `schema_version` / `total_defects` 應為 integer 不是 string；`items[].id` 應為 string `"D1"` 不是 integer `1`。

修正：
- `schema_version: 2`（不加引號）
- `total_defects: 12`（不加引號）
- `items[].id: "D1"`（加引號，且必須是 `D` + 序號格式）

---

### 反例 3：JSON 不在 fenced code block 內

````
評估結論如下：

{
  "schema_version": 2,
  "verdict": "PASS",
  ...
}

以上為本輪驗收結果。
````

❌ stop-hook 用 ```` ```json ```` fenced code block 抽 last JSON，純文字 JSON 不會被抽到 → fallback v1。

修正：用 fenced code block 包起來：

````
評估結論如下：

```json
{
  "schema_version": 2,
  "verdict": "PASS",
  ...
}
```

以上為本輪驗收結果。
````

---

## 5. 與 markdown 報告主體的關係

evaluator 的輸出結構（從上到下）：

```
# 驗收評估報告
（依 references/report-template.md 標準格式撰寫的 markdown 主體
 — 含反向訊號掃描結果、Phase 完成度矩陣、4 維度評估、改善建議...）

## JSON Block（給 stop-hook 解析）

```json
{ <符合本 schema 的 JSON> }
```
```

要點：
- markdown 主體列出**所有**缺陷（D1..D<total_defects>），不只 top 3——讓 stop-hook 寫進 full_report
- JSON 區塊只放 top 3（`items.length ≤ 3`）——降壓給主窗口
- JSON 必須是輸出最後一段，且包在 fenced code block 內
- 同一份 markdown 中不可有第二個 fenced JSON（stop-hook 抓 last，多個 JSON 會抓錯）
