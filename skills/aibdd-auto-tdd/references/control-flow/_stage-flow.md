# control-flow — Stage Flow（語言無關核心）

> 本檔抽出 control-flow stage 的**語言無關核心流程**。語言特化內容（測試命令、phase 數、骨架檢查訊號）見 `csharp.md` / `php.md` / `typescript.md`。
>
> **載入時機**：上游觸發 stage=control-flow 後，先讀本檔建立流程骨架，再讀對應 lang 的 reference 取得語言參數。

---

## 觸發辨識

下列訊號之一出現即啟用 control-flow stage：

| 訊號類型 | 範例 |
|---|---|
| 用戶 prompt | 「control-flow」「批次執行」「跑 BDD 自動化」「TDD 批次」「BDD pipeline」「批次跑 BDD」 |
| 上游委派 | `/aibdd-specformula` Phase 02 |
| 主 SKILL 觸發 | 用戶說「跑 BDD 全自動」並推斷 stage=control-flow |

---

## 核心哲學

掃描 feature 檔案 → 建立 TodoWrite 任務清單 → 逐一執行 phase 串接（red → green → refactor，部分變體加 schema-analysis / step-template）。

---

## Step 0：環境前置檢查

驗證專案骨架與測試基礎建設是否就緒。

| 變體 | 檢查項目（lang 特化見對應 reference） |
|---|---|
| 通用 | 專案根目錄存在語言對應的 manifest（package.json / *.csproj / composer.json） |
| 通用 | 測試框架已安裝（命令在 lang reference 內） |

**檢查未通過**：詢問使用者是否先執行對應 starter（或 test-skeleton for php）→ 使用者確認後觸發 → 完成後再繼續本流程。

**檢查通過**：直接進入 Step 1。

---

## Step 1：掃描 Feature 檔案 + 排序

讀取 features 目錄（路徑變數見 lang reference），找出所有 `.feature` 檔案。

### 排序策略

1. **若 `${FEATURES_DIR}` 下存在 `句型.md`**（由 `aibdd-form-bdd-analysis` 產出）
   → 讀取其中的「覆蓋矩陣」或「操作清單」
   → 以該文件列出的操作順序作為 feature 排序依據（通常反映業務流程依賴：核心 → 延伸）

2. **若無 `句型.md`**，依以下啟發規則排序：
   - 掃描每個 feature 的 Background / Given 步驟，識別前置依賴（哪些操作假設已存在）
   - 無前置依賴的排最前，依賴最多的排最後
   - 同等依賴數量時，command（`@command`）優先於 query（`@query`）

3. **排序結果展示給使用者確認**後再建立任務清單。

---

## Step 2：建立 TodoWrite 任務清單

對每個 feature 檔案，依該語言變體的 phase 數展開：

| 變體 phase 數 | 任務展開 |
|---|---|
| 3-phase（多數後端 IT） | `Red` → `Green` → `Refactor` |
| 5-phase（前端 React IT、含 schema-analysis 的 IT 變體） | `Schema Analysis` → `Step Template` → `Red` → `Green` → `Refactor` |
| 4-phase（PHP IT 變體） | `Test Skeleton` → `Red` → `Green` → `Refactor` |

實際 phase 數見對應 `{lang}.md` 的「變體路由」段落。

```
TodoWrite([
  { content: "{feature} — Red",      status: "pending" },
  { content: "{feature} — Green",    status: "pending" },
  { content: "{feature} — Refactor", status: "pending" },
  ...（依變體展開所有 features）
])
```

---

## Step 3：逐一執行 phase 串接

```
標記 → in_progress
    ↓
Read 同 skill 對應 stage reference（references/{stage}/{lang}.md）
    ↓
依 reference 完成條件執行
    ↓
標記 → completed
    ↓
前進到下一個 pending（一次只一個 in_progress）
```

### Stage Reference 路由（同 skill 內部）

| 任務 phase | Read 路徑 |
|---|---|
| Schema Analysis | `references/schema-analysis/{lang}.md` |
| Step Template | `references/step-template/{lang}.md` |
| Test Skeleton（PHP only） | `references/test-skeleton/php.md` |
| Red | `references/red/{lang}.md` |
| Green | `references/green/{lang}.md` |
| Refactor | `references/refactor/{lang}.md` |

> **注意**：Red reference 內部可能已包含 Schema Analysis / Step Template 的內隱委派，但 control-flow **顯式拆為多個 phase** 以便中途暫停與進度觀察。

---

## Step 4：最終回歸測試

所有任務 completed 後，執行完整回歸測試（命令見 lang reference 的「測試命令」段落）。

- **通過** → 全部完成
- **失敗** → 閱讀錯誤、修正、重新執行（不退回 control-flow，直接在當前狀態下修復）

---

## 規則

1. **不要停下來問問題。** 遇到問題自己修正；只在「真正不可逆且未明示授權」時停下。
2. **不要跳過任何任務。** 每個 feature 的所有 phase 都必須完成。
3. **一次只有一個 in_progress。** 嚴格序列化。
4. **Reference 是 lazy loading。** 每次 phase 切換時 Read 該 phase reference，不受 compaction 影響。
5. **測試保護下推進。** Red 階段必須看到失敗，Green 階段必須看到通過，Refactor 階段測試保持綠燈。
6. **嚴格順序（CR3）。** 派發迴圈時嚴格依語言變體的 phase 順序展開，不得跳階；每階段未通過完成條件不得進入下一階段。

---

## 完成條件

- [ ] 所有 feature 的所有 phase 都 completed
- [ ] 回歸測試全數通過
- [ ] 型別 / lint 檢查通過（命令見 lang reference）
- [ ] 無殘留 TODO 註解

---

## 異常處理

| 異常情境 | 處置 |
|---|---|
| 某 feature 在 Red 階段卡住（無法正常失敗） | 暫停該 feature，標 `pending`，繼續下一個 feature；最後一併處理 |
| 某 feature 在 Green 階段超過合理嘗試次數仍無法通過 | 暫停，記錄失敗模式，請求 user 介入 |
| 中途 compaction | TodoWrite 狀態保留；恢復後從 `in_progress` 任務繼續 |
| 環境問題（Docker daemon / DB 連線） | 暫停，先修環境（不算 Red 合格失敗） |

---

## 跨 stage 串接

`control-flow` 不直接呼叫其他 skill；每個 phase 透過 Read 同 skill 的 `references/{stage}/{lang}.md` 完成。語言特化的 phase 串接細節見對應 `{lang}.md`。
