# Refactor #3 — AIBDD ×3 語言變體合併前 Audit (Stage A)

> **產出時間**：2026-05-09
> **目的**：在合併 22 個 `aibdd.auto.{csharp,php,ts}.(it.)?{stage}` SKILL.md 為單一主 skill + 24 references（含 5 個 N/A stub）之前，盤點檔案結構、下游引用、跨 stage 自我引用密度。
> **本階段**：純讀取，未修改任何 SKILL.md。
> **承前**：本檔承接 `docs/refactor-2-audit.md`（handler 合併），格式對齊。

---

## 表 1：22 個 in-scope SKILL.md 行數與結構

| Stage | Lang | 路徑 | 行數 | description 摘要（首句） | 主要章節（H2） |
|---|---|---|---:|---|---|
| code-quality | csharp | `skills/aibdd.auto.csharp.code-quality/SKILL.md` | 477 | C# Integration Test 程式碼品質規範合集。 | 1. SOLID 設計原則；2. Step Definition 組織規範；3. Meta 註記清理；4. 日誌實踐；5. 程式架構規範；6. 程式碼品質；檢查清單 |
| code-quality | php | `skills/aibdd.auto.php.it.code-quality/SKILL.md` | 500 | PHP WordPress 整合測試程式碼品質規範。 | 1. SOLID；2. Test Class 組織；3. IntegrationTestCase 基類；4. Meta 清理；5. WP 安全規範；6. 3 層架構；7. 程式碼品質；8. 檢查清單 |
| code-quality | ts | `skills/aibdd.auto.ts.it.code-quality/SKILL.md` | 364 | React Integration Test 程式碼品質規範合集。 | 1. SOLID；2. Testing-Library 最佳實踐；3. TypeScript 嚴格型別；4. 測試檔案組織；5. MSW Handler 品質；6. Component 品質；7. Meta 清理；檢查清單 |
| control-flow | csharp | `skills/aibdd.auto.csharp.it.control-flow/SKILL.md` | 134 | C# IT 全自動批次迴圈。 | Step 0 環境檢查；Step 1 掃描；Step 2 TodoWrite；Step 3 逐一執行；Step 4 回歸；規則；測試命令；完成條件 |
| control-flow | php | `skills/aibdd.auto.php.it.control-flow/SKILL.md` | 270 | PHP IT 全自動批次迴圈。 | 角色定位；4-Phase 循環；Phase 0 環境；Step 1 掃描；Step 2 TodoWrite；Step 3 執行；Step 4 回歸；規則；與 Java/Python 差異；Troubleshooting；起始/結束訊息 |
| control-flow | ts | `skills/aibdd.auto.ts.it.control-flow/SKILL.md` | 134 | React IT 全自動批次迴圈。 | Step 0 環境檢查；Step 1 掃描；Step 2 TodoWrite；Step 3 逐一執行；Step 4 回歸；變體路由；規則；完成條件 |
| green | csharp | `skills/aibdd.auto.csharp.it.green/SKILL.md` | 303 | C# IT Stage 3：綠燈階段。 | 入口；測試命令；實作順序；迭代迴圈；框架 API；常見錯誤修復表；Docker/環境；迭代策略；完成條件 |
| green | php | `skills/aibdd.auto.php.it.green/SKILL.md` | 407 | PHP IT Stage 3：綠燈階段。 | 角色定位；核心循環；失敗模式對照表；實作順序；WP DB Repository（5 模式）；Service 業務邏輯；Custom Exceptions；測試命令；最小增量原則；R1-R7；完成條件 |
| green | ts | `skills/aibdd.auto.ts.it.green/SKILL.md` | 203 | React IT Stage 4：綠燈階段。 | 實作目標；核心循環；失敗模式對照表；最小增量範例；最小增量原則；測試命令；常見失敗與解決；完成條件 |
| red | csharp | `skills/aibdd.auto.csharp.it.red/SKILL.md` | 209 | C# IT 紅燈實作執行器。 | 紅燈定義；預期失敗模式；三步驟流程；共用規則 R1-R9；Docker 檢查；測試命令；完成條件 |
| red | php | `skills/aibdd.auto.php.it.red/SKILL.md` | 419 | PHP IT Stage 2：紅燈生成器。 | 角色定位；雙模式入口；紅燈定義；三步流程；Step 1 IntegrationTestCase；Step 2 Stub 建立；Step 3 Test Method 實作；Handler 路由表；測試執行驗證；R1-R7；完成條件 |
| red | ts | `skills/aibdd.auto.ts.it.red/SKILL.md` | 135 | React IT Stage 3：紅燈實作執行器。 | 紅燈定義；三步驟流程；共用規則 R1-R9；測試執行命令；環境前置檢查；完成條件 |
| refactor | csharp | `skills/aibdd.auto.csharp.it.refactor/SKILL.md` | 301 | C# IT Stage 4：重構階段。 | 入口；Workflow；測試命令；Formatter；Phase A 測試碼；Phase B 生產碼；安全規則；重構粒度；品質規範；完成條件 |
| refactor | php | `skills/aibdd.auto.php.it.refactor/SKILL.md` | 380 | PHP IT Stage 4：重構階段。 | 1. 角色定位；2. 前置條件；3. 兩階段工作流；4. Phase A；5. Phase B；6. 測試命令；7. 安全規則 R1-R7；8. 重構邊界；9. 完成條件 |
| refactor | ts | `skills/aibdd.auto.ts.it.refactor/SKILL.md` | 231 | React IT Stage 5：重構階段。 | 入口；兩階段工作流；安全規則；Phase A；Phase B；測試命令；重構邊界；完成條件；品質規範 |
| schema-analysis | csharp | `skills/aibdd.auto.csharp.it.schema-analysis/SKILL.md` | 244 | C# IT Schema Analysis。 | 角色；輸入；分析步驟；GO/NO-GO 決策表；修復流程；EF Core 特化規則；DBML→EF Core 對照；完成條件 |
| schema-analysis | ts | `skills/aibdd.auto.ts.it.schema-analysis/SKILL.md` | 118 | React IT 的 Schema Analysis。 | 目的；與後端的差異；分析 Checklist；GO/NO-GO 決策；自動修正流程；輸出；完成條件 |
| starter | csharp | `skills/aibdd.auto.csharp.it.starter/SKILL.md` | 142 | C# IT 專案骨架生成器。 | 角色；互動流程；產出目錄結構；驗證命令；範本檔案清單；關鍵規則 R1-R6；與其他 skill 關係；完成條件 |
| starter | ts | `skills/aibdd.auto.ts.it.starter/SKILL.md` | 84 | React IT 專案環境初始化。 | 前置條件；流程 Step 1-5；模板檔案；完成條件 |
| step-template | csharp | `skills/aibdd.auto.csharp.it.step-template/SKILL.md` | 226 | C# IT Step Template 生成器。 | 角色；輸入；前置檢查；句型分類決策樹；骨架格式；檔案組織規則；SpecFlow 參數對應；關鍵規則 R1-R8；完成條件 |
| step-template | ts | `skills/aibdd.auto.ts.it.step-template/SKILL.md` | 172 | React IT Stage 2：從 Gherkin Feature 生成 Vitest 整合測試骨架。 | 目的；流程 Step 0-3；測試檔骨架範例；命名規則；Handler 路由對照表；完成條件 |
| test-skeleton | php | `skills/aibdd.auto.php.it.test-skeleton/SKILL.md` | 286 | PHP IT Stage 1：從 Gherkin .feature 檔案生成 PHPUnit 測試類別骨架。 | 1. 角色定位；2. 雙模式入口；3. 前置檢查；4. 骨架格式；5. Handler 判定決策樹；6. Scenario Outline；7. 命名規則；8. R1-R7；9. 完成條件 |

**小計**：22 個檔案，共 **5 739 行**。
- C# 8 檔：477 + 134 + 303 + 209 + 301 + 244 + 142 + 226 = **2 036 行**
- PHP 6 檔：500 + 270 + 407 + 419 + 380 + 286 = **2 262 行**
- TS 8 檔：364 + 134 + 203 + 135 + 231 + 118 + 84 + 172 = **1 441 行**

### 結構觀察

#### 三語言章節結構一致性

| Stage | 結構一致度 | 觀察 |
|---|---|---|
| code-quality | **中** | 三語言都按「SOLID → 組織 → Meta 清理 → 程式碼品質 → 檢查清單」骨架，但內容各有特色：C# 有「日誌實踐」「DI 註冊」、PHP 有「WordPress 安全（5.1-5.6）」與「3 層架構」、TS 有「Testing-Library 最佳實踐」「MSW Handler 品質」。SOLID 與 Meta 清理章節幾乎可共用 prose（語言例子可抽到 reference）。 |
| control-flow | **高** | C# / TS 結構幾乎完全一致（Step 0-4 + 規則 + 完成條件，134 行對 134 行）；PHP 270 行為大宗（多了「角色定位」「與 Java/Python 差異」「Troubleshooting」「執行起始/結束訊息範本」）。共用骨架（環境檢查 → 掃描 → TodoWrite → 執行 → 回歸）可抽到主 skill；語言特化的 phase 數、測試命令、Skill 路由表放 reference。 |
| green | **中** | 共用「核心循環」「最小增量原則」「失敗模式對照表」三段；PHP 額外有 5 種 WP DB Repository pattern（最龐大）、C# 有 ASP.NET Core Controller / Service / Repository 三層完整範例、TS 範例最少（聚焦 Component + hook）。差異主因為 production code stack 截然不同。 |
| red | **中** | 共用「紅燈定義（環境正常 + Value Difference）」「三步驟流程（schema/skeleton → step-template → red implementation）」「R1-R9 共用規則」框架。差異在錯誤類型：C# 用 `NotImplementedException`/HTTP 404、PHP 用 `BadMethodCallException`、TS 用 `TestingLibraryElementError`。PHP 額外多了「IntegrationTestCase 基類建立」「Stub 建立」「Test Method 實作」三段詳細流程，篇幅最長。 |
| refactor | **高** | 三語言結構高度一致：「兩階段工作流（Phase A 測試碼 → Phase B 生產碼）」「安全規則 R1-R7」「測試命令」「重構邊界」「品質規範引用 code-quality」。Phase A/B 的範例對照差異大但結構一致。安全規則 R1-R7 prose 可主 skill 共用 80%。 |
| schema-analysis | **N/A** | csharp 244 行 vs ts 118 行；csharp 重資料庫（EF Core Entity / Migrations / DBML 對照），ts 重前端 API 層（Zod / API client / MSW）。性質完全不同——PHP 因為 schema 可由 WP API 動態決定，沒有此 stage（合理）。合併後此 reference 應分兩份完全獨立的內容，不強行對齊。 |
| starter | **中** | csharp 142 行 vs ts 84 行；都是「templates/ 樣板填字 → 寫入專案」流程，但 csharp 多了 13 個 .cs 樣板對照表 + dotnet/Docker 驗證命令，ts 只有 8 個 vitest/MSW 樣板。PHP 因為 wp-env 已由前置流程處理，沒有此 stage。共用骨架（前置 → 樣板讀取 → 路徑替換 → 驗證）可抽。 |
| step-template | **中** | csharp 226 行 vs ts 172 行；都包含「掃描現有檔案 → 句型分類決策樹 → 骨架格式 → 命名規則 → Handler 路由對照表」。csharp 額外有 SpecFlow regex 對照表、Subdomain/HandlerType 目錄組織。ts 額外有 `expect.fail()` placeholder 與 `describe/it/it.each` 對應。Handler 決策樹邏輯可共用主 skill；具體骨架程式碼放 reference。 |
| test-skeleton | **N/A** | 僅 PHP 獨有（286 行）。其他語言由 BDD 框架（SpecFlow / Cucumber）自動對映，不需此 stage。合併後此 reference 為 PHP 專用，主 skill 不需共用 prose。 |

#### 共用 prose 可抽出比例（粗估）

- **可抽到主 skill**：trigger 辨識、紅燈/綠燈定義、TDD 三 phase 哲學、SOLID 通用條目、Meta 清理通用規則、最小增量原則、安全規則框架（R1-R7 條列） → 估 25-30%
- **必留各語言 reference**：程式碼範例（Repository/Service/Controller/Component/Hook）、框架特定 API、測試命令、錯誤訊息字面值、Stack 特化規則 → 估 70-75%

---

## 表 2：下游引用清單

> **過濾規則**：排除 22 個 in-scope SKILL.md 自身 frontmatter 的 `name:` 行（共 22 處 self-reference，刪除來源檔即一併消失）；排除 `docs/refactor-2-audit.md` 既有歷史記錄（11 處，與本次合併無關）。

### 2.1 自我引用（22 個 SKILL.md 內部互相 cross-link）

#### 2.1.1 `skills/aibdd.auto.csharp.it.control-flow/SKILL.md`（6 處）

| 行號 | 行內容（trim） | 引用類型 | 取代建議 |
|---:|---|---|---|
| 23 | `**不存在** → 詢問使用者「偵測到尚未建立 C# IT 骨架，是否先執行 `/zenbu-powers:aibdd.auto.csharp.it.starter`？」→ ...` | 自我引用 → starter | 改為 `/zenbu-powers:aibdd-auto-tdd (stage=starter, lang=csharp)` 或 `references/starter/csharp.md` |
| 79 | `\| Schema Analysis \| `/zenbu-powers:aibdd.auto.csharp.it.schema-analysis` \|` | 自我引用 → schema-analysis | 同上策略，stage=schema-analysis |
| 80 | `\| Step Template \| `/zenbu-powers:aibdd.auto.csharp.it.step-template` \|` | 自我引用 → step-template | 同上 |
| 81 | `\| Red \| `/zenbu-powers:aibdd.auto.csharp.it.red` \|` | 自我引用 → red | 同上 |
| 82 | `\| Green \| `/zenbu-powers:aibdd.auto.csharp.it.green` \|` | 自我引用 → green | 同上 |
| 83 | `\| Refactor \| `/zenbu-powers:aibdd.auto.csharp.it.refactor` \|` | 自我引用 → refactor | 同上 |

#### 2.1.2 `skills/aibdd.auto.csharp.it.starter/SKILL.md`（2 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 122 | `使用者呼叫 /zenbu-powers:aibdd.auto.csharp.it.starter` | 自我引用（本檔） | 合併後改為 `references/starter/csharp.md` 內部章節指引 |
| 126 | `後續由 /zenbu-powers:aibdd.auto.csharp.it.control-flow 驅動：` | 自我引用 → control-flow | 改為 `§control-flow 章節` 錨點 |

#### 2.1.3 `skills/aibdd.auto.csharp.it.red/SKILL.md`（4 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 6 | `當 /aibdd.auto.csharp.it.control-flow 呼叫紅燈階段，...` | 自我引用 → control-flow | description 改為主 skill 的 description（「合併後由 aibdd-auto-tdd 路由」） |
| 36 | `Step 1: Schema Analysis → 引用 /zenbu-powers:aibdd.auto.csharp.it.schema-analysis` | 自我引用 → schema-analysis | 改為 `§schema-analysis (lang=csharp) 章節` |
| 39 | `Step 2: Step Template → 引用 /zenbu-powers:aibdd.auto.csharp.it.step-template` | 自我引用 → step-template | 同上 |
| 52 | `引用 `/zenbu-powers:aibdd.auto.csharp.it.schema-analysis`。` | 自我引用 → schema-analysis | 同上 |
| 62 | `引用 `/zenbu-powers:aibdd.auto.csharp.it.step-template`。` | 自我引用 → step-template | 同上 |

實際命中 5 處，第 6 行雖在 description 但仍計入。

#### 2.1.4 `skills/aibdd.auto.csharp.it.refactor/SKILL.md`（4 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 5 | `嚴格遵守 /aibdd.auto.csharp.code-quality 規範。` | 自我引用 → code-quality（注意此處缺 `it.`） | description 改為主 skill 的 description |
| 77 | `**移除 TODO 註解**（見 `/zenbu-powers:aibdd.auto.csharp.code-quality` §3）` | 自我引用 → code-quality | 改為 `§code-quality (lang=csharp) §3 章節` |
| 292 | `完整 C# 品質規範見 `/zenbu-powers:aibdd.auto.csharp.code-quality`。` | 自我引用 → code-quality | 同上 |
| 298 | `- [ ] 程式碼符合 `/zenbu-powers:aibdd.auto.csharp.code-quality` 檢查清單` | 自我引用 → code-quality | 同上 |

#### 2.1.5 `skills/aibdd.auto.csharp.code-quality/SKILL.md`（1 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 10 | `供 `/zenbu-powers:aibdd.auto.csharp.it.refactor` 重構階段嚴格遵守。` | 自我引用 → refactor | 改為 `§refactor (lang=csharp) 章節` |

#### 2.1.6 `skills/aibdd.auto.php.it.control-flow/SKILL.md`（10 處）

| 行號 | 行內容（節錄） | 引用類型 | 取代建議 |
|---:|---|---|---|
| 25 | `使用者直接呼叫 `/zenbu-powers:aibdd.auto.php.it.control-flow`` | 自我引用（本檔） | 改為 `/zenbu-powers:aibdd-auto-tdd (stage=control-flow, lang=php)` |
| 33 | `Phase 1: /zenbu-powers:aibdd.auto.php.it.test-skeleton ...` | 自我引用 → test-skeleton | 改為 `§test-skeleton (lang=php) 章節` |
| 35 | `Phase 2: /zenbu-powers:aibdd.auto.php.it.red ...` | 自我引用 → red | 同上 |
| 37 | `Phase 3: /zenbu-powers:aibdd.auto.php.it.green ...` | 自我引用 → green | 同上 |
| 39 | `Phase 4: /zenbu-powers:aibdd.auto.php.it.refactor ...` | 自我引用 → refactor | 同上 |
| 89 | `將由 `/zenbu-powers:aibdd.auto.php.it.red` 自動建立` | 自我引用 → red | 同上 |
| 165 | `\| Test Skeleton \| `/zenbu-powers:aibdd.auto.php.it.test-skeleton` \| ...` | 自我引用 → test-skeleton | 同上 |
| 166 | `\| Red \| `/zenbu-powers:aibdd.auto.php.it.red` \| ...` | 自我引用 → red | 同上 |
| 167 | `\| Green \| `/zenbu-powers:aibdd.auto.php.it.green` \| ...` | 自我引用 → green | 同上 |
| 168 | `\| Refactor \| `/zenbu-powers:aibdd.auto.php.it.refactor` \| ...` | 自我引用 → refactor | 同上 |
| 174 | `Skill /zenbu-powers:aibdd.auto.php.it.test-skeleton specs/features/...` | 自我引用 → test-skeleton（範例） | 範例改為 `aibdd-auto-tdd (stage=test-skeleton, lang=php, feature=...)` |
| 179 | `Skill /zenbu-powers:aibdd.auto.php.it.red specs/features/...` | 自我引用 → red（範例） | 同上 |
| 227 | `需額外 `/zenbu-powers:aibdd.auto.php.it.test-skeleton` 產生 PHPUnit 骨架` | 自我引用 → test-skeleton | 同上 |

實際命中 13 處（首列 25 已含 self），由於 25 行屬於本檔自我說明性質，可選擇保留或同步改寫。

#### 2.1.7 `skills/aibdd.auto.php.it.test-skeleton/SKILL.md`（3 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 7 | `可被 /aibdd.auto.php.it.control-flow 調用，也可獨立使用。` | 自我引用 → control-flow（description） | description 改為主 skill 描述 |
| 31 | `上游 skill（`/zenbu-powers:aibdd.auto.php.it.control-flow`）會傳入：` | 自我引用 → control-flow | 改為 `§control-flow 章節` |
| 285 | `下一步：建議執行 `/zenbu-powers:aibdd.auto.php.it.red`（Stage 2）` | 自我引用 → red | 改為 `§red (lang=php) 章節` |

#### 2.1.8 `skills/aibdd.auto.php.it.red/SKILL.md`（5 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 8 | `可被 /aibdd.auto.php.it.control-flow 調用，也可獨立使用。` | 自我引用 → control-flow（description） | description 改為主 skill 描述 |
| 17 | `接手 Stage 1（`/zenbu-powers:aibdd.auto.php.it.test-skeleton`）...` | 自我引用 → test-skeleton | 改為 `§test-skeleton (lang=php) 章節` |
| 31 | `由 `/zenbu-powers:aibdd.auto.php.it.control-flow` 批次呼叫，...` | 自我引用 → control-flow | 改為 `§control-flow 章節` |
| 34 | `/zenbu-powers:aibdd.auto.php.it.red specs/features/01-lesson-progress.feature` | 自我引用（本檔範例） | 範例改為 `aibdd-auto-tdd (stage=red, lang=php, feature=...)` |
| 418 | `綠燈完成，可進入 Stage 4 重構階段（`/zenbu-powers:aibdd.auto.php.it.green`）」` | 自我引用 → green（注意：行內為 green，非 refactor） | 改為 `§green (lang=php) 章節` |

#### 2.1.9 `skills/aibdd.auto.php.it.green/SKILL.md`（4 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 7 | `可被 /aibdd.auto.php.it.control-flow 調用，也可獨立使用。` | 自我引用 → control-flow（description） | description 改寫 |
| 16 | `接手 Stage 2（`/zenbu-powers:aibdd.auto.php.it.red`）...` | 自我引用 → red | 改為 `§red (lang=php) 章節` |
| 376 | `留給 `/zenbu-powers:aibdd.auto.php.it.refactor`。` | 自我引用 → refactor | 改為 `§refactor (lang=php) 章節` |
| 406 | `綠燈完成，可進入 Stage 4 重構階段（`/zenbu-powers:aibdd.auto.php.it.refactor`）」` | 自我引用 → refactor | 同上 |

#### 2.1.10 `skills/aibdd.auto.php.it.refactor/SKILL.md`（5 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 6 | `嚴格遵守 /aibdd.auto.php.it.code-quality 規範。` | 自我引用 → code-quality（description） | description 改寫 |
| 7 | `可被 /aibdd.auto.php.it.control-flow 調用，也可獨立使用。` | 自我引用 → control-flow（description） | description 改寫 |
| 25 | `**嚴格遵守** `/zenbu-powers:aibdd.auto.php.it.code-quality` 規範...` | 自我引用 → code-quality | 改為 `§code-quality (lang=php) 章節` |
| 35 | `已載入 `/zenbu-powers:aibdd.auto.php.it.code-quality` 規範` | 自我引用 → code-quality | 同上 |
| 193 | `詳細規範請載入 `/zenbu-powers:aibdd.auto.php.it.code-quality`。` | 自我引用 → code-quality | 同上 |
| 367 | `符合 `/zenbu-powers:aibdd.auto.php.it.code-quality` 所有檢查項` | 自我引用 → code-quality | 同上 |

實際命中 6 處（含 description 兩處）。

#### 2.1.11 `skills/aibdd.auto.php.it.code-quality/SKILL.md`（2 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 6 | `由 /aibdd.auto.php.it.refactor 載入作為重構依據。非 user-invocable。` | 自我引用 → refactor（description） | description 改寫 |
| 11 | `作為 `/zenbu-powers:aibdd.auto.php.it.refactor` 的重構依據。` | 自我引用 → refactor | 改為 `§refactor (lang=php) 章節` |

#### 2.1.12 `skills/aibdd.auto.ts.it.control-flow/SKILL.md`（6 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 22 | `**不存在** → 詢問使用者「偵測到尚未建立 React IT 測試基礎建設，是否先執行 `/zenbu-powers:aibdd.auto.ts.it.starter`？」` | 自我引用 → starter | 改為 `§starter (lang=ts) 章節` 或 `aibdd-auto-tdd (stage=starter, lang=ts)` |
| 78 | `\| Schema Analysis \| `/zenbu-powers:aibdd.auto.ts.it.schema-analysis` \|` | 自我引用 → schema-analysis | 同上策略 |
| 79 | `\| Step Template \| `/zenbu-powers:aibdd.auto.ts.it.step-template` \|` | 自我引用 → step-template | 同上 |
| 80 | `\| Red \| `/zenbu-powers:aibdd.auto.ts.it.red` \|` | 自我引用 → red | 同上 |
| 81 | `\| Green \| `/zenbu-powers:aibdd.auto.ts.it.green` \|` | 自我引用 → green | 同上 |
| 82 | `\| Refactor \| `/zenbu-powers:aibdd.auto.ts.it.refactor` \|` | 自我引用 → refactor | 同上 |

#### 2.1.13 `skills/aibdd.auto.ts.it.red/SKILL.md`（5 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 6 | `當 /aibdd.auto.ts.it.control-flow 呼叫紅燈階段，...` | 自我引用 → control-flow（description） | description 改寫 |
| 25 | `Step 1: Schema Analysis → 呼叫 /zenbu-powers:aibdd.auto.ts.it.schema-analysis` | 自我引用 → schema-analysis | 改為 `§schema-analysis (lang=ts) 章節` |
| 26 | `Step 2: Step Template → 呼叫 /zenbu-powers:aibdd.auto.ts.it.step-template` | 自我引用 → step-template | 同上 |
| 36 | `呼叫 `/zenbu-powers:aibdd.auto.ts.it.schema-analysis`。` | 自我引用 → schema-analysis | 同上 |
| 45 | `呼叫 `/zenbu-powers:aibdd.auto.ts.it.step-template`。` | 自我引用 → step-template | 同上 |
| 121 | `委派 `/zenbu-powers:aibdd.auto.ts.it.starter` 補齊。` | 自我引用 → starter | 改為 `§starter (lang=ts) 章節` |

實際命中 6 處。

#### 2.1.14 `skills/aibdd.auto.ts.it.green/SKILL.md`（1 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 6 | `當 /aibdd.auto.ts.it.control-flow 呼叫綠燈階段，...` | 自我引用 → control-flow（description） | description 改寫 |

#### 2.1.15 `skills/aibdd.auto.ts.it.refactor/SKILL.md`（3 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 5 | `嚴格遵守 /aibdd.auto.ts.it.code-quality 規範。` | 自我引用 → code-quality（description） | description 改寫 |
| 6 | `當 /aibdd.auto.ts.it.control-flow 呼叫重構階段，...` | 自我引用 → control-flow（description） | description 改寫 |
| 223 | `完整 React IT 程式碼品質規範詳見 `/zenbu-powers:aibdd.auto.ts.it.code-quality`。` | 自我引用 → code-quality | 改為 `§code-quality (lang=ts) 章節` |

### 2.2 跨 skill 引用（外部，需 Stage C 更新）

#### 2.2.1 `skills/aibdd-auto-control-flow/SKILL.md`（1 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 24 | `\| typescript \| it \| `npx vitest run` \| 5 phases；委派 standalone `/zenbu-powers:aibdd.auto.ts.it.control-flow` \|` | 跨 skill | 改為「委派 `/zenbu-powers:aibdd-auto-tdd (stage=control-flow, lang=ts)`」 |
| 28 | `**TypeScript IT 變體（React 前端）有完整 5 phase 流程（schema-analysis → step-template → red → green → refactor），由 standalone skill set `/zenbu-powers:aibdd.auto.ts.it.*` 處理。**` | 跨 skill | 改為「由 `aibdd-auto-tdd` 主 skill 的 ts 變體 reference 處理」 |

#### 2.2.2 `skills/aibdd-auto-red/SKILL.md`（2 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 32 | `\| typescript \| it \| （standalone: `/zenbu-powers:aibdd.auto.ts.it.red`）\| UI element not found ...` | 跨 skill | 改為 `aibdd-auto-tdd (stage=red, lang=ts)` |
| 36 | `**特殊路由**：`typescript + it` 組合對應 React **前端**整合測試...由獨立的 standalone skill set `/zenbu-powers:aibdd.auto.ts.it.*` 處理。統一核心 Red 階段會直接委派 `/zenbu-powers:aibdd.auto.ts.it.red`。` | 跨 skill | 改為「委派 `aibdd-auto-tdd (stage=red, lang=ts)`」 |

#### 2.2.3 `agents/test-creator.agent.md`（6 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 32 | `- "zenbu-powers:aibdd.auto.php.it.control-flow"` | 跨 skill | 整段 6 行替換為單一條目：`- "zenbu-powers:aibdd-auto-tdd"`（合併刪除）；類似 refactor-2 的處理方式 |
| 33 | `- "zenbu-powers:aibdd.auto.php.it.test-skeleton"` | 跨 skill | 同上 |
| 34 | `- "zenbu-powers:aibdd.auto.php.it.red"` | 跨 skill | 同上 |
| 35 | `- "zenbu-powers:aibdd.auto.php.it.green"` | 跨 skill | 同上 |
| 36 | `- "zenbu-powers:aibdd.auto.php.it.refactor"` | 跨 skill | 同上 |
| 37 | `- "zenbu-powers:aibdd.auto.php.it.code-quality"` | 跨 skill | 同上 |

#### 2.2.4 `README.md`（1 處）

| 行號 | 行內容 | 引用類型 | 取代建議 |
|---:|---|---|---|
| 555 | `2. **`@tdd-coordinator`** 接管，依序執行 `aibdd.auto.ts.it.red` → `green` → `refactor`` | 跨 skill | 改為 `aibdd-auto-tdd (lang=ts) red → green → refactor`，或單純文字描述「依 red → green → refactor 三階段」 |

### 2.3 範圍統計

| 檔案類別 | 檔案數 | 引用處數 |
|---|---:|---:|
| **自我引用**（22 in-scope SKILL.md 內部） | 15 | ~67 |
| **跨 skill 引用**（外部） | 4 | 10 |
| **合計（待 Stage B/C 處理）** | **19** | **~77** |

> **說明**：自我引用合計 67 處主要分布在 control-flow（17）、red（11）、refactor（13）、code-quality（3）、test-skeleton（3）、green（5）、starter（2）、step-template（3）；自我引用會隨 SKILL.md 被 stub 化或刪除而自動消失或重寫，計入「待寫」工作量但不算 reviewer 跨檔審核點。
> **跨 skill 引用** 10 處才是 Stage C 真正要替換的目標：`aibdd-auto-control-flow` 1+2、`aibdd-auto-red` 2、`test-creator.agent.md` 6、`README.md` 1。
> grep 全域命中總計 ~99 處（含 22 個 self frontmatter `name:` 行 + 11 處 docs/refactor-2-audit.md 歷史記錄 + 67 自我引用 + 10 跨 skill 引用 - 重複計算）；扣除 frontmatter 與歷史 audit 後，實際待處理 77 處。

---

## 表 3：跨 stage 自我引用密度分析（合併內部 cross-link 矩陣）

> 本表是 22 個 in-scope SKILL.md 內部的「stage → stage」引用密度。Stage B 合併後 references 內部交叉引用要從 `/zenbu-powers:aibdd.auto.X.Y.Z` 改為 reference 內 `§stage 章節` 錨點，本表即重寫對照表。

### 3.1 「會引用哪些其他 stage」（出度）

| 起點 stage | 引用的 stage（C# / PHP / TS） | 用途 |
|---|---|---|
| **control-flow** (csharp) | starter, schema-analysis, step-template, red, green, refactor | 環境檢查 + 路由表 |
| **control-flow** (php) | test-skeleton, red, green, refactor | 4-phase 路由表 |
| **control-flow** (ts) | starter, schema-analysis, step-template, red, green, refactor | 環境檢查 + 路由表 |
| **starter** (csharp) | control-flow | 後續流程指引 |
| **starter** (ts) | （不引用其他 stage） | — |
| **schema-analysis** (csharp) | （不引用其他 stage，被 red 引用） | — |
| **schema-analysis** (ts) | （不引用其他 stage，被 red 引用） | — |
| **step-template** (csharp) | （不引用其他 stage，被 red 引用） | — |
| **step-template** (ts) | （不引用其他 stage，被 red 引用） | — |
| **test-skeleton** (php) | control-flow, red | 上游/下游指引 |
| **red** (csharp) | control-flow（description）, schema-analysis, step-template | 三步驟流程 |
| **red** (php) | control-flow（description）, test-skeleton, green（在 418 行末段） | 上下游指引 |
| **red** (ts) | control-flow（description）, schema-analysis, step-template, starter | 三步驟流程 + 缺骨架時委派 |
| **green** (csharp) | （不引用其他 stage） | — |
| **green** (php) | control-flow（description）, red, refactor | 上下游指引 |
| **green** (ts) | control-flow（description） | description only |
| **refactor** (csharp) | code-quality | 載入規範 |
| **refactor** (php) | control-flow（description）, code-quality, code-quality, code-quality, code-quality | 重複載入 code-quality 規範 |
| **refactor** (ts) | control-flow（description）, code-quality（description）, code-quality | 重複載入 code-quality 規範 |
| **code-quality** (csharp) | refactor | 「供 refactor 載入」 |
| **code-quality** (php) | refactor（description）, refactor | 「供 refactor 載入」 |
| **code-quality** (ts) | （不引用其他 stage） | — |

### 3.2 「被哪些其他 stage 引用」（入度）

| 終點 stage | 被引用次數 | 引用來源（去重） |
|---|---:|---|
| **control-flow** | 12 | starter (csharp), test-skeleton (php), red (3 langs description), green (php / ts), refactor (php / ts), step-template、red 範例段落 |
| **starter** | 3 | control-flow (csharp), control-flow (ts), red (ts) |
| **schema-analysis** | 4 | control-flow (csharp), control-flow (ts), red (csharp), red (ts) |
| **step-template** | 4 | control-flow (csharp), control-flow (ts), red (csharp), red (ts) |
| **test-skeleton** | 3 | control-flow (php), red (php) |
| **red** | 7 | control-flow (3 langs), test-skeleton (php), green (php), starter (csharp，間接) |
| **green** | 5 | control-flow (3 langs), red (php), refactor 提及（PHP green 末段） |
| **refactor** | 6 | control-flow (3 langs), green (php), code-quality (csharp / php) |
| **code-quality** | 9 | refactor (csharp 4 處), refactor (php 5 處), refactor (ts 3 處) |

### 3.3 矩陣解讀（合併後 reference 重寫對照）

最高密度節點：
- **control-flow ↔ 各 stage**：control-flow 是 hub，引用 6 stage、被 6 stage 引用 → 合併後 `references/control-flow/{lang}.md` 內所有 cross-link 改為 `§stage X 章節 (lang=Y)` 錨點，或統一改為 `aibdd-auto-tdd (stage=X, lang=Y)` 自我路由
- **red ↔ schema-analysis + step-template**：red 在三語言都引用 schema/step-template 作為 step 1+2 → 合併後 `references/red/{lang}.md` 開頭三步驟改為 `§schema-analysis (lang=Y)` 與 `§step-template (lang=Y)`
- **refactor ↔ code-quality**：refactor 在三語言都重度引用 code-quality（PHP 5 處 / TS 3 處 / C# 4 處）→ 合併後 `references/refactor/{lang}.md` 內改為 `§code-quality (lang=Y) §章節` 錨點；考慮把 code-quality 定位為 refactor 的 sub-reference 而非平行 stage，可降低 reviewer 心智負擔

低密度節點（可獨立）：
- **starter / schema-analysis / step-template / test-skeleton / code-quality** 出度低 → 合併後可作為「葉節點 reference」由 control-flow 或 red 路由匯入即可
- **green** 出度幾乎為零（僅 description 提及 control-flow + PHP green 提一次 refactor）→ 可獨立

---

## 額外觀察 / Stage B 注意事項

### 1. 各語言內容差異最大的 stage

- **green**：差異最大（C# Controller/Service/Repository 三層，PHP 5 種 WP DB pattern，TS 4-5 個 Component/hook 範例）→ 主 skill 不要強行抽 prose；只共用「核心循環」「最小增量原則」「失敗模式對照表骨架」三段，剩下 70%+ 留各語言 reference
- **schema-analysis**：性質完全不同（C# 重 EF Core / Migration，TS 重 Zod / API client）→ reference 各自獨立；PHP 沒有此 stage（合理）
- **starter**：技術 stack 不同（C# 13 個 .cs templates，TS 8 個 ts templates）→ reference 各自獨立；PHP 沒有此 stage（wp-env 由前置流程處理）

### 2. 80%+ 雷同可共用主 skill prose 的 stage

- **refactor**：三語言「兩階段工作流（Phase A 測試碼 → Phase B 生產碼）」結構完全一致，「安全規則 R1-R7」條列字面接近（一次一件事 / 每步測試 / 不改外部行為 / 三次以上才抽 / 不強行重構），可主 skill 共用 80%；reference 只放 Phase A/B 的範例對照與測試命令
- **red**：三語言「紅燈定義（環境正常 + Value Difference）」「三步驟流程」「R1-R9 規則框架」結構一致，可主 skill 共用 60-70%；reference 只放錯誤類型差異（NotImplementedException vs BadMethodCallException vs TestingLibraryElementError）與骨架程式碼
- **control-flow**：C# / TS 結構完全一致（Step 0-4），PHP 多了 troubleshooting 與差異說明；可主 skill 共用 70%；reference 放 Skill 路由表 + 測試命令 + 環境前置檢查清單

### 3. 命名不齊（csharp 缺 `it.`）的歷史殘留

- `aibdd.auto.csharp.code-quality` 是唯一缺 `it.` 的 skill；refactor 引用它 4 次，code-quality 自己引用 refactor 1 次
- 合併後路徑統一為 `references/code-quality/csharp.md`，舊命名透過 stub 重定向（與 refactor-2 採用的方案 A 一致）
- Stage D（清理舊 SKILL.md）時可以考慮在 `aibdd.auto.csharp.code-quality/SKILL.md` 留下「已搬遷至 aibdd-auto-tdd」的 stub frontmatter，並在 description 添加重定向提示

### 4. arguments.yml 路由

- 全域 grep 找不到 `arguments.yml` 實體檔案；該詞只出現在 description（如「透過 arguments.yml 自動路由語言變體」）與 `aibdd-auto-control-flow` / `aibdd-auto-red` / `aibdd-auto-green` / `aibdd-auto-refactor` 的內部設定（推測為 frontmatter description 修辭）
- 合併後若主 skill 命名為 `aibdd-auto-tdd`，原本 `aibdd-auto-control-flow` 的「typescript+it 變體委派 standalone」行為改為「委派 `aibdd-auto-tdd (stage=control-flow, lang=ts)`」即可；不需新增 yml 設定檔
- **建議**：合併後讓 `aibdd-auto-{control-flow,red,green,refactor}` 主 skill 直接吸收 csharp/php/ts 三語言變體（取代既有的「standalone 委派」機制）；或保留原語意但把 standalone 換成新主 skill 路由

### 5. 與 refactor-2 的銜接

- refactor-2 已將 18 個 handler skill 合併為 `aibdd-handlers` + 18 個 reference
- 本次（refactor-3）22 個 in-scope SKILL.md 中，**13 個** 已在內容中引用 `aibdd-handlers (handler=…, lang=…)` 模式（已採新格式，例如 `csharp.it.step-template` 159 行、`php.it.refactor` 92/106-127 行、`ts.it.red` 29/56 行）→ 表示 refactor-2 Stage C 已完成更新
- 合併時要保留這些 `aibdd-handlers` 跨 skill 引用，**不要**把它們也合進主 skill；它們指向獨立的 handlers skill 是正確設計

### 6. 主 skill 命名與結構建議

- 主 skill 名稱建議：`aibdd-auto-tdd`（語意：「AIBDD 自動 TDD 工作流」），對齊 `aibdd-handlers` 的命名風格
- description 應同時觸發 9 個 stage（code-quality / control-flow / green / red / refactor / schema-analysis / starter / step-template / test-skeleton）×3 lang 的所有關鍵字，避免 trigger 失靈
- 9 個 stage × 3 lang = **27 格**，扣除 5 個 N/A（schema-analysis × php、starter × php、step-template × php、test-skeleton × csharp、test-skeleton × ts），實際 22 格 → **22 個 reference + 5 個 N/A stub reference = 27 個 reference 檔**（如規劃文件所述 24 references 是不含 stub 的計算；含 stub 應為 27）
- N/A stub 內容建議：簡短說明「此語言 / stage 組合不適用，請改用 §另一 stage」，例如 `references/test-skeleton/csharp.md` 內容為「C# 由 SpecFlow 自動對映 .feature，無此 stage；請見 §step-template/csharp.md」

---

## Hand-off / Next Agent

- 本檔案為 Stage A 唯一交付物，路徑：`docs/refactor-3-audit.md`
- 本次未修改任何 SKILL.md / agent.md / README
- **交還 orchestrator**：請依規劃推進 Stage B（建立 `skills/aibdd-auto-tdd/SKILL.md` 主 skill 與 24 references + 3 N/A stub references；總計 27 個 reference 檔）
  - 主 skill 內容應抽取本檔表 1「結構觀察」段落判定的可共用 prose（refactor 80%、red 60-70%、control-flow 70%、其他 stage 各語言內容獨立）
  - 24 references 取代清單即本檔表 2「自我引用」67 處的內容拆分
- **Stage C 預告**：依本檔表 2.2 的 10 處跨 skill 引用，將：
  - `aibdd-auto-control-flow/SKILL.md` 行 24/28 改為 `aibdd-auto-tdd` 路由
  - `aibdd-auto-red/SKILL.md` 行 32/36 改為 `aibdd-auto-tdd` 路由
  - `agents/test-creator.agent.md` 行 32-37 整段改為單一 `zenbu-powers:aibdd-auto-tdd`
  - `README.md` 行 555 改為新名稱或泛化描述
- **Stage D 預告**：將 22 個舊 SKILL.md 改為 stub 重定向（保留 frontmatter `name:` + description「已搬遷至 aibdd-auto-tdd (stage=…, lang=…)」）或刪除；尤其 `aibdd.auto.csharp.code-quality` 命名歷史殘留可一併清理
- 開始 Stage B 前建議確認：
  - 主 skill 命名是否採用建議的 `aibdd-auto-tdd`
  - 是否將 N/A 組合（5 格）建立 stub reference（建議建立，總計 27 個 reference 檔；不建則 22 個）
  - 與 refactor-2 的 `aibdd-handlers` 之間的引用保留不變（13 處跨 skill 引用維持）
