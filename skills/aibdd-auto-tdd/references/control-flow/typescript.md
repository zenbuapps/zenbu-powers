# control-flow — TypeScript IT（後端 + 前端）

> 主 SKILL.md 已涵蓋：批次執行哲學、TodoWrite 一次只一個 in_progress、Skill 路由語意、最小增量原則。
> 語言無關核心流程（觸發辨識、Step 0–4 骨架、規則、異常處理）統一在同 skill `references/control-flow/_stage-flow.md`，請先 Read 該檔再讀本檔。
> 本檔分兩節：**後端 (Node.js + Express + Cucumber)** 與 **前端 (React + Vitest + MSW)**，依專案類型載入對應段落。

掃描 feature 檔案 → 建立 TodoWrite 任務清單 → 逐一執行 phase。

---

## 後端 (Node.js + Express + Cucumber)

### 環境前置檢查

驗證後端專案是否已初始化（與 `references/starter/typescript.md` 後端段對齊）：
- `package.json` 含 `@cucumber/cucumber`、`drizzle-orm`、`express`
- `.cucumber.js` 設定檔存在
- `features/` 目錄存在於後端專案根

**不存在** → 詢問使用者是否先執行 `references/starter/typescript.md` 後端 starter 流程。

### Features 路徑

讀取 `${BACKEND_FEATURES_DIR}`（通常是 `backend/features/` 或 `specs/features/backend/`）。

### 測試命令

```bash
npx cucumber-js
```

### Phase 數

5 phase（schema-analysis → step-template → red → green → refactor），同前端結構。

> **與前端共用**：排序策略（句型.md / 啟發規則）、TodoWrite 任務建立邏輯、逐一執行流程、最終回歸驗證——皆見 `_stage-flow.md`。本節只標明後端特有的命令與路徑差異。

---

## 前端 (React + Vitest + MSW)

### Step 0：環境前置檢查

驗證前端專案是否已初始化：
- `package.json` 含 vitest, @testing-library/react, msw
- `vitest.config.ts` 存在
- `src/test/setup.ts` 存在

**不存在** → 詢問使用者「偵測到尚未建立 React IT 測試基礎建設，是否先執行 `references/starter/typescript.md` 的初始化流程？」→ 使用者確認後觸發，完成後再繼續。

**存在** → 直接進入 Step 1。

---

## Step 1：掃描 Feature 檔案

讀取 `${FRONTEND_FEATURES_DIR}`（通常是 `specs/features/` 或 `frontend/specs/features/`），找出所有 `.feature` 檔案。

### 排序策略

**若 `${FRONTEND_FEATURES_DIR}` 下存在 `句型.md`**，讀取其中的「覆蓋矩陣」或「操作清單」，以該文件列出的操作順序作為 feature 排序依據。此順序通常反映業務流程的依賴關係（核心功能 → 延伸功能）。

**若無 `句型.md`**，依以下啟發規則排序：
1. 掃描每個 feature 的 Background / Given 步驟，識別前置依賴
2. 無前置依賴的排最前，依賴最多的排最後
3. 同等依賴數量時，command（寫入）優先於 query（讀取）

**排序結果展示給使用者確認後再建立任務清單。**

---

## Step 2：建立 TodoWrite 任務清單

對每個 feature 檔案，建立 **5 個任務**：

```
TodoWrite([
  { content: "{feature} — Schema Analysis", status: "pending" },
  { content: "{feature} — Step Template",   status: "pending" },
  { content: "{feature} — Red",             status: "pending" },
  { content: "{feature} — Green",           status: "pending" },
  { content: "{feature} — Refactor",        status: "pending" },
  ...
])
```

---

## Step 3：逐一執行

```
標記 → in_progress
    ↓
載入對應 stage reference（帶入 feature file 路徑作為 args）
    ↓
標記 → completed
    ↓
前進到下一個 pending
```

### Stage Reference 對照表

| 任務 phase | Reference 檔 |
|-----------|-------------|
| Schema Analysis | `references/schema-analysis/typescript.md` |
| Step Template | `references/step-template/typescript.md` |
| Red | `references/red/typescript.md` |
| Green | `references/green/typescript.md` |
| Refactor | `references/refactor/typescript.md` |

**注意**：Red reference 內部已包含 Schema Analysis 和 Step Template 的委派調用，但 control-flow 將它們顯式拆為 5 個 phase，以便在中途可暫停和觀察進度。

---

## Step 4：最終回歸測試

所有任務 completed 後，執行完整回歸測試：

```bash
npx vitest run
```

- 通過 → 全部完成
- 失敗 → 閱讀錯誤、修正、重新執行

---

## 變體路由

此 reference 是 TypeScript + IT 變體：

| tech_stack | test_strategy | 測試命令 | phase 數 |
|-----------|---------------|---------|----------|
| typescript | it | `npx vitest run` | 5（含 schema-analysis + step-template） |

語言無關的 phase 串接邏輯與規則見同 skill `references/control-flow/_stage-flow.md`；本檔只負責 TypeScript IT 特有的命令、目錄、phase 數設定。

---

## 規則

1. **不要停下來問問題。** 遇到問題自己修正。
2. **不要跳過任何任務。** 每個 feature 的 5 phase 都必須完成。
3. **一次只有一個 in_progress。**
4. **Reference 是 lazy loading。** 每次呼叫都完整載入該 phase 規則，不受 compaction 影響。
5. **測試保護下推進。** Red 階段必須看到失敗，Green 階段必須看到通過，Refactor 階段測試保持綠燈。

---

## 完成條件

- [ ] 所有 feature 的 5 phase 都 completed
- [ ] `npx vitest run` 回歸測試全數通過
- [ ] `npx tsc --noEmit` 型別檢查通過
- [ ] 無殘留 TODO 註解
