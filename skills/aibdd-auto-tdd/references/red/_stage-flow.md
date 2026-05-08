# Red Stage — 流程骨架（語言無關）

> 本檔提供 **Red 階段共用流程定義**，所有語言 reference（csharp / php / typescript）共享。
> 語言特化內容（紅燈失敗模式判斷、測試命令、環境檢查工具）見 `references/red/{language}.md`。
>
> **觸發來源**：
> - 使用者直接 prompt：「紅燈」「red」「跑紅燈」「實作測試」
> - 上游 stage：`aibdd-auto-tdd（stage=control-flow）` 內部展開 stage=red
> - 主 SKILL.md 路由到 (stage=red, lang=…) 後，先 Read 本檔再 Read `red/{lang}.md`

---

## 紅燈定義（兩條件都成立才算合格紅燈）

### (a) 環境正常
- 測試 runner 能執行（pytest / vitest / xunit / phpunit）
- imports / namespaces 解析正確
- 外部依賴可達（DB 可連、API route 已註冊、MSW server 啟動、Container render 不 crash）
- **失敗訊息不能是環境問題**：例如 `Cannot find module`、`ReferenceError`、`Connection refused`、`MSW unhandled request`、`namespace not found`

### (b) Value Difference
- 測試預期某個值（HTTP response、UI 文字、DB 狀態），但系統回傳的值不對（或尚未實作）
- 例：HTTP response status 不符預期、`screen.getByText` 找不到元素、`assertEquals` 失敗

> **環境的 Difference ≠ 紅燈。Value 的 Difference = 紅燈。** 兩者都符合才算正式進入 Red。
> 若失敗訊息為「環境問題」，必須先修環境，不算合格紅燈。

---

## 三步驟流程

```
Step 1: Schema Analysis    → 環境就緒（條件 a）
Step 2: Step Template      → 系統無關的測試骨架生成
Step 3: Red Implementation → 對每個 TODO step:
                              → 讀 TODO 取得 handler type
                              → 載入對應 handler reference
                              → 搭配語言特化模式
                              → 實作測試程式碼
                              → 驗證紅燈（條件 b）
```

---

## Step 1: Schema Analysis（子章節）

> **目的**：在 Red 開始前，分析 `.feature` + `api.yml` + `erm.dbml`，確保現有資料模型（ORM/Entity/Migration）與規格一致。

### 分析 Checklist

#### 1. 讀取規格檔案
- `.feature` — 需要的 Aggregate 和欄位
- `api.yml` — API 契約（路徑、Request/Response schemas）
- `erm.dbml` — Entity 結構定義（Table、Column、FK、enum）

#### 2. 比對現有程式碼
- 掃描現有 ORM Models / Entities（語言特化：Drizzle / TypeORM / EF Core / Eloquent）
- 掃描現有 DB Migrations
- 識別差異：新增欄位、改名、新 Aggregate、enum 變更

#### 3. GO / NO-GO 決策

| 狀態 | 行動 |
|------|------|
| 全部一致 | GO — 直接進入 Step 2 |
| 有差異但可自動修正 | 修正後 GO |
| 有衝突需人工判斷 | 暫停，報告差異 |

### 修正流程

#### 新增 Aggregate
1. 根據 DBML 定義建立新的 Model/Entity
2. 建立對應 Repository
3. 建立 DB Migration

#### 新增/修改欄位
1. 更新 Model/Entity 的欄位定義
2. 建立新的 Migration（ALTER TABLE）
3. 更新 Repository 的 finder 方法（如需要）

#### Enum 變更
1. 更新 enum 定義
2. 建立 Migration（如 DB 層需要）

### 輸出
- 更新後的 ORM Models / Entities（若有變更）
- 新的 DB Migrations（若需要）
- GO / NO-GO 報告

> **TypeScript 前端 IT 變體**：本步驟調整為「確認 Zod Schemas / API Client / MSW Handlers / Component Stubs 齊全」。若缺失則委派 `/zenbu-powers:aibdd-auto-frontend-msw-api-layer` 補齊。詳見 `red/typescript.md`。

---

## Step 2: Step Template（子章節）

> **目的**：從 Gherkin Feature File 生成 Step Definition 骨架（樣板），識別事件風暴部位，標註對應的 Handler 類型，供 Step 3 逐一實作。
> 產出僅為「樣板」——裝飾器/describe + 函數簽名 + TODO 註解 + 空方法體（pending），不包含實作邏輯。

### 流程

#### Step 0: Feature File 同步
僅在測試目錄尚未有對應 feature file 時執行：
- 建立 symbolic link（非複製），以 `${FEATURE_SPECS_DIR}` 為唯一 source of truth
- Link 必須使用**相對路徑**

#### Step 1: 掃描現有 Step Definitions
**永遠不覆蓋已存在的 Step Definition！**
1. 掃描 `${STEPS_DIR}/` 所有已存在的 step patterns
2. 解析目標 .feature 需要的所有 Given/When/Then/And 步驟
3. 對比找出「缺少的步驟清單」
4. 只為缺少的步驟產生樣板

#### Step 2: 句型分類（Handler Type 判定）

對每個缺少的步驟，用決策樹判定 handler type。

**精簡版決策樹**（快速分類用）：

```
Given → 狀態描述（「有」「為」「包含」） → aggregate-given
Given → 已完成動作（「已訂閱」「已建立」）  → command
When  → 寫入操作（「更新」「建立」「刪除」）→ command
When  → 讀取操作（「查詢」「取得」「列出」）→ query
Then  → 成功/失敗                         → success-failure
Then  → DB 狀態驗證（需額外查詢）          → aggregate-then
Then  → Response 驗證（用已拿到的資料）     → readmodel-then
And   → 繼承前一個 Then 的判斷
```

完整決策規則（含 4 抽象角色框架、判斷口訣、區別表）見：
`bdd-analysis/references/web-backend/句型分析方針.md`

#### Step 3: 產生樣板
每個步驟產出含以下資訊的骨架：
- 裝飾器或 `describe/it` block（依語言慣例）+ 完整 Gherkin pattern
- 函數簽名（`context` / `world` 為第一參數，依語言而定）
- TODO 標註：`[事件風暴部位: {TYPE} - {Name}]`
- TODO 標註：`參考 bdd-analysis/references/web-backend/handlers/{type}.md 實作`
- TODO 標註：`參考 Aggregate/Table: {Name}`（若為 DB 相關）
- 空方法體（`pass` / `throw new Error('pending')` / `expect.fail('TODO')` 視語言而定）

### 模板規則

#### 檔案組織
- **一個 Step Pattern 對應一個檔案**
- 先按 subdomain 分目錄（lesson/, order/, product/, role/）
- 再按 handler 類型分子目錄（aggregate_given/, commands/, query/, aggregate_then/, readmodel_then/）
- `common_then/` 為跨 subdomain 共用（操作成功/失敗等）

#### 命名規則
- 語意化檔名（`lesson-progress.steps.ts` / `lesson_progress.py`）
- 避免 `steps.ts` / `steps.py` 大雜燴

#### 參數規則
- 從 pattern 解析的參數依語言慣例傳入
- 不使用 fixtures 參數

### Handler 路由表

| 事件風暴部位 | 抽象角色 | Handler Reference |
|------------|---------|------------------|
| Aggregate（初始狀態） | States Prepare | `bdd-analysis/references/web-backend/handlers/aggregate-given.md` |
| Command（寫入操作） | Operation Invocation | `bdd-analysis/references/web-backend/handlers/command.md` |
| Query（讀取操作） | Operation Invocation | `bdd-analysis/references/web-backend/handlers/query.md` |
| 操作成功/失敗 | Operation Result Verifier | `bdd-analysis/references/web-backend/handlers/success-failure.md` |
| Aggregate（DB 驗證） | States Verify | `bdd-analysis/references/web-backend/handlers/aggregate-then.md` |
| Read Model（Response 驗證） | Operation Result Verifier | `bdd-analysis/references/web-backend/handlers/readmodel-then.md` |

> **TypeScript 前端 IT 變體**：handler reference 路徑改為 `/zenbu-powers:aibdd-handlers/references/{type}/typescript.md`。事件風暴部位類型相同，差異僅在 MSW handler 而非 Repository。

### 完成條件

- [ ] 已掃描現有 Step Definitions，避免覆蓋
- [ ] 每個新增步驟都有正確的 Handler 類型標註
- [ ] 一個 step 一個 module/class
- [ ] 所有函數簽名正確
- [ ] 所有方法體為空（pending）

---

## Step 3: Red Implementation

對每個含 TODO 的 step / `it()` 區塊：

1. 讀取 TODO 標註 → 取得 handler type
2. Read 對應的 handler reference（若尚未載入）
3. 搭配當前語言模式（`red/{lang}.md`）的程式碼樣板
4. 將空方法體（`pass` / `throw new Error('pending')` / `expect.fail`）替換為完整測試程式碼
5. 處理下一個 step（handler reference 可切換）

同時產出基礎建設（若不存在）：
- 後端：ORM Models / Entities、Repository 介面/類別（置於 production code 目錄，非 test 目錄）
- 前端：Component stubs（置於 `src/app/` 或 `src/components/`，非 test 目錄）、test factories（置於 `src/test/factories/`）、per-feature MSW handler overrides

---

## 共用規則 R1–R9（跨 handler、跨語言）

### R1: Command 不驗 Response / UI Feedback
Command handler 只執行寫入操作（後端）或 user-event 互動（前端），不做 assertion。驗證交給 Then handler。

### R2: 欄位名必須與 api.yml 一致
Request/Response 欄位名以 `api.yml` schemas 為唯一真相來源。前端 Zod schemas 從 api.yml 推導。

### R3: 跨步驟 ID 儲存到共享狀態
- 後端：建立實體後，將 ID 存入 `context.ids` / `ScenarioContext`
- 前端：使用 `let` 宣告在 describe scope，例如 `let aliceId: string;`

### R4: 基礎建設置於 production code 目錄
- 後端：ORM Models / Repositories 放在 app 目錄（`src/`、`app/`），非 test 目錄
- 前端：Component stubs 放在 `src/app/` 或 `src/components/`，非 `src/__tests__/`

### R5: 不實作業務邏輯
Red 階段只定義介面：
- 後端：API endpoint / Service 方法體留空
- 前端：Component 只回傳 `<div>TODO</div>` 等最小 stub

### R6: 測試將失敗（紅燈）
這是 TDD 紅燈階段的本質。失敗原因必須是 Value Difference：
- 後端：HTTP response 值不符預期（非 connection refused / 500）
- 前端：`screen.getByText` 找不到預期元素（非 module 載入錯誤）

### R7: 真實依賴（非 mock 整層）
- 後端 IT：Testcontainers PostgreSQL（或同等真實資料庫）驗證 Repository / API 端對端流程
- 前端 IT：jsdom + MSW `setupServer`，無需 Docker、Playwright、真實 API server

### R8: Data Table 逐欄對應
Feature 的 Data Table 欄位與 `api.yml` / `erm.dbml` / Zod schema 欄位 1:1 對應。

### R9: API Endpoint Path = api.yml 定義
HTTP 路徑從 `api.yml` paths 讀取，後端 route / 前端 MSW handler URL 與之一致。不自行編造。

---

## Docker 環境檢查（後端 IT only）

Red 執行前確認：
1. `docker info` → Docker daemon 運行中
2. `docker ps` → 無殘留 Testcontainers
3. PostgreSQL image 可用

> 前端 IT（jsdom + MSW）不需 Docker，本檢查跳過；改為確認 vitest / msw 已安裝。

---

## 完成條件

- [ ] 環境正常 — 條件 (a)
  - 後端：Docker/DB 可連、API route 已註冊
  - 前端：Vitest 能執行、MSW server 啟動、imports 解析正確
- [ ] 測試執行後失敗，失敗原因是 Value Difference — 條件 (b)
  - 後端：HTTP response 值不符預期（非 connection refused / 500）
  - 前端：`TestingLibraryElementError: Unable to find an element` 等 Value Difference
- [ ] 所有 step definitions / `it()` 已從空方法體替換為完整測試程式碼
- [ ] 基礎建設完整：
  - 後端：ORM Models / Entities + Repository 介面
  - 前端：Component stubs + Test data factories + Zod schemas
- [ ] 欄位名與 `api.yml` schemas 一致
