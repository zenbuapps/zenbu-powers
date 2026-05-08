---
name: aibdd-handlers
description: >
  AIBDD step handler 統一參考。從 .feature step 句型推導應該用哪一類 handler，
  載入對應語言（C#/PHP/TypeScript）的程式碼範例。
  6 種 handler 類型：aggregate-given / aggregate-then / command / query / readmodel-then / success-failure。
  當 aibdd-auto-tdd（stage=red 或 stage=step-template）在處理 Given/When/Then 步驟時觸發。
---

# AIBDD Handlers 統一參考

> **本 skill 是語言無關的決策中心**。從 .feature 步驟句型決定 handler 類型，再依語言（csharp / php / typescript）載入對應的程式碼範例。
>
> **非 user-invocable**：由 `aibdd-auto-tdd（stage=red 或 stage=step-template）` 等上游 skill 載入；使用者不直接呼叫。

---

## Trigger 辨識（何時用 handler 系列）

當你（或上游 skill）正在做以下其中一件事時，載入本 skill：

1. **Step Template 階段**：把 `.feature` 的 Gherkin steps 展開為「TODO 骨架」時，需要決定每個 step 該由哪個 handler 實作。
2. **Red 階段**：實作測試方法時，需要查 handler 對應的程式碼樣板。
3. **Refactor 階段**：清理 `[Handler: xxx]` 註解前要確認當初分類正確。

**輸入訊號**（任一即可觸發）：
- 看到 Gherkin 的 `Given` / `When` / `Then`，要決定 handler 類型。
- TODO 註解寫了 `[Handler: aggregate-given]` 但實作尚未完成。
- 上游 skill 的 prompt 引用 `aibdd-handlers (handler=…, lang=…)`。

---

## 6 種 handler 類型概覽

| Handler | 階段 | 一句話定位 |
|---|---|---|
| **aggregate-given** | Given | 建立測試前置資料（fixture），繞過業務流程直接寫入儲存層。 |
| **command** | Given / When | 執行寫入操作（修改系統狀態），透過 API / Service / UI 觸發。 |
| **query** | When | 執行讀取操作（不修改狀態），結果暫存供 Then 驗證。 |
| **aggregate-then** | Then | 驗證儲存層的最終狀態（DB / MSW request payload）。 |
| **readmodel-then** | Then | 驗證 Query 的回傳結果（HTTP response / queryResult / DOM）。 |
| **success-failure** | Then | 驗證操作是否成功 / 失敗，不檢查具體資料內容。 |

---

## 決策樹（核心）

詳細決策邏輯與每個分支的關鍵詞、反例請參考：

→ **`references/decision-tree.md`**

精簡版決策樹：

```
Given 過去式 + 修改狀態（已訂閱、已建立、已完成）
   ├─ 後端（PHP/C#）→ command（Service / API 呼叫）
   └─ 前端（TS）   → command（user-event 互動）

Given 過去式 + 直接資料注入（的…為、有、包含、存在）
   → aggregate-given（Repository.save / DbContext.Add / MSW server.use）

When 現在式 + 修改狀態（更新、建立、刪除、提交）
   → command

When 現在式 + 讀取（查詢、取得、列出、搜尋）
   → query

Then 驗證返回值（操作成功、操作失敗、錯誤訊息）
   → success-failure

Then 驗證儲存層狀態（…應為、的…應為、應包含 N 個）
   ├─ 後端 → aggregate-then（Repository / DbContext 查 DB）
   └─ 前端 → aggregate-then（驗證 MSW 攔截到的 request payload）

Then 驗證 Query 回傳結果（查詢結果應、應顯示、頁面應顯示）
   → readmodel-then
```

---

## 共用規則 R1-R9（語言無關）

這些規則跨三語言適用；語言特化的 R 規則放在各 reference。

1. **R1（必查 spec）**：handler 內所有欄位名、型別、主鍵必須對照 spec 來源（`erm.dbml` 給後端 entity；`api.yml` 給 API 欄位 / 前端送出 payload），禁止憑空猜測。
2. **R2（強型別物件）**：建立資料一律使用強型別 Model / Entity / Factory 函數，不可使用 anonymous object、純 Dictionary、`stdClass` 或手拼 JSON。
3. **R3（透過抽象層）**：寫入透過 Repository / DbContext / MSW handler；不可繞過抽象層直連底層儲存（例如 raw SQL、`$wpdb->insert`）。
4. **R4（中文 → Enum 映射）**：Gherkin 中的中文業務術語（「進行中」「已完成」等）須映射為 enum 值，全專案共用映射表。
5. **R5（複合主鍵完整提供）**：缺少任一 key 欄位會導致寫入失敗或查到錯誤記錄。
6. **R6（自然鍵 → ID 映射）**：建立後將 ID 存入共享狀態（`Ids` / `$this->ids` / `let userId`），key 為 Gherkin 可讀的自然鍵；後續 step 只能透過此映射取得 ID，不得硬編。
7. **R7（依賴 ID 檢查）**：建立含外鍵的實體前，先確認依賴的 ID 已存在於映射；前端則確認對應的 MSW handler 已註冊。
8. **R8（責任分離）**：Command / Query 不做 assertion，僅執行操作並儲存 response；assertion 一律交給 Then handler。Then handler 不修改狀態（無 save / delete / write）。
9. **R9（API 不重複呼叫）**：Then handler 使用 When 階段已儲存的結果（`LastResponse` / `$this->queryResult` / `requestRef.current` / 已 render 的畫面），不重新發 API。

---

## 中文狀態對應表（共用）

三語言共用以下映射；若某語言有額外場景（如 TS 的 UI 顯示中文不映射），記在該語言的 reference。

| 中文 | Enum 值 | 適用情境 |
|---|---|---|
| 進行中 | `IN_PROGRESS` | Progress, Status |
| 已完成 | `COMPLETED` | Progress, Status |
| 未開始 | `NOT_STARTED` | Progress, Status |
| 已付款 | `PAID` | Order |
| 待付款 | `PENDING` | Order |
| 已取消 | `CANCELLED` | Order |

> **C# 變體**：部分舊 spec 使用 PascalCase（`InProgress` / `Completed`），由各語言 reference 註明採用慣例。
> **TS 例外**：UI 上顯示的中文（readmodel-then 用 `screen.getByText('進行中')`）**不需要**反向映射為 enum；只有送出 API 的 payload 與 fixture 才需轉 enum。

---

## 載入語言特化範例

決定好 handler 類型後，依專案語言 Read 對應的 reference：

| 語言 | reference 路徑 |
|---|---|
| C# (.NET 8 / EF Core / SpecFlow) | `references/{handler}/csharp.md` |
| PHP (WordPress / Yoast WPTestUtils) | `references/{handler}/php.md` |
| TypeScript (React / MSW / Testing Library) | `references/{handler}/typescript.md` |

`{handler}` 取自決策樹結果，為下列 6 個之一：
`aggregate-given` / `aggregate-then` / `command` / `query` / `readmodel-then` / `success-failure`

例如：後端 PHP 的 Given 寫入操作 → `references/command/php.md`。

每份 reference 包含：
- 該語言的技術 stack（測試框架、HTTP / DB / Mock 工具）
- 完整程式碼樣板（基本、DataTable、邊緣情況）
- 語言特有的 R 規則（補充共用 R1-R9）
- API 呼叫 / 元素查找 / 攔截工具的細節

---

## 對應關係速查（C# / PHP / TS 三語言映射）

| 概念 | C# (Integration) | PHP (Integration) | TypeScript (React IT) |
|---|---|---|---|
| 共享狀態 | `ScenarioContext _ctx` + `Ids` 字典 | `$this->ids[]` | `describe` scope `let` 變數 |
| 寫入抽象 | `AppDbContext.Add()` / `HttpClient` | `Repository.save()` / `Service.xxx()` | `server.use()` / `user-event` |
| 讀取抽象 | LINQ / `HttpClient.GetAsync()` | `Repository.find*()` / `Service.get*()` | `screen.getBy*` / `renderWithProviders` |
| 結果暫存 | `_ctx["LastResponse"]` | `$this->queryResult` / `$this->lastError` | `requestRef.current` / 已 render 畫面 |
| 斷言庫 | FluentAssertions | PHPUnit | Jest + Testing Library |
| 中文狀態 | `Dictionary<string,string>` map | match expression | object literal map |

---

## Hand-off / Next Agent

- 本 skill 為 **Stage B 交付物**之一，路徑 `skills/aibdd-handlers/`。
- 同步交付：`skills/aibdd-handlers/references/decision-tree.md` 及 18 份 `references/{handler}/{lang}.md`。
- 本階段**未刪除**舊 18 個 `aibdd.auto.{lang}.it.handlers.*` skill，**未修改**任何下游引用（`aibdd-auto-tdd`、`test-creator.agent.md`、其他 step-template / refactor / red 等）。
- **交還 orchestrator**：請推進 Stage C（依 `docs/refactor-2-audit.md` 表 2 的 57 處外部引用，將 `aibdd.auto.{lang}.it.handlers.{type}` 替換為 `aibdd-handlers (handler=…, lang=…)` 的路由形式）。
- Stage D 再處理舊 18 個 SKILL.md 的 stub 化或刪除。
