# Refactor #2 — AIBDD Handlers 合併前 Audit (Stage A)

> **產出時間**：2026-05-08
> **目的**：在合併 18 個 `aibdd.auto.{csharp,php,ts}.it.handlers.*` SKILL.md 為單一主 skill + 18 個 reference 之前，盤點待刪檔案、下游引用、命名範圍決策。
> **本階段**：純讀取，未修改任何 SKILL.md。

---

## 表 1：18 個待刪 SKILL.md 清單

| Skill 路徑 | 行數 | description 摘要（首句） | 主要章節（H2） |
|---|---:|---|---|
| `skills/aibdd.auto.csharp.it.handlers.aggregate-given/SKILL.md` | 154 | 當在 Gherkin 測試中進行「Aggregate 初始狀態建立」，「只能」使用此指令。 | 測試框架；Trigger 辨識；與 Command Handler 的區別；實作流程；程式碼模式；關鍵模式；共用規則 |
| `skills/aibdd.auto.csharp.it.handlers.aggregate-then/SKILL.md` | 173 | 當在 Gherkin 測試中驗證「Aggregate 最終狀態」，務必參考此規範。 | 測試框架；Trigger 辨識；與 ReadModel-Then 的區別；實作流程；程式碼模式；關鍵模式；共用規則；完成條件 |
| `skills/aibdd.auto.csharp.it.handlers.command/SKILL.md` | 153 | 當在 Gherkin 中撰寫寫入操作步驟（Given 已完成 / When 執行中），務必參考此規範。 | 測試框架；Trigger 辨識；與 Query Handler 的區別；Given vs When 的 Command 差異；實作流程；程式碼模式；API 呼叫模式；共用規則 |
| `skills/aibdd.auto.csharp.it.handlers.query/SKILL.md` | 145 | 當在 Gherkin 中撰寫 Query 操作步驟時，務必參考此規範。 | 測試框架；Trigger 辨識；與 Command Handler 的區別；實作流程；程式碼模式；API 呼叫模式；共用規則 |
| `skills/aibdd.auto.csharp.it.handlers.readmodel-then/SKILL.md` | 178 | 當在 Gherkin 測試中驗證「Query 回傳結果」時，「只能」使用此指令。 | 測試框架；Trigger 辨識；與 Aggregate-Then 的區別；實作流程；程式碼模式；關鍵模式；共用規則；完成條件 |
| `skills/aibdd.auto.csharp.it.handlers.success-failure/SKILL.md` | 183 | 當在 Gherkin 測試中驗證操作成功或失敗時，參考此規範。 | 測試框架；Trigger 辨識；實作流程；程式碼模式；關鍵模式；共用規則；完成條件 |
| `skills/aibdd.auto.php.it.handlers.aggregate-given/SKILL.md` | 113 | 處理 Given 步驟中建立 Aggregate 初始狀態的 handler 參考文件。 | Trigger 辨識；任務；與其他 Handler 的區別；實作流程；BDD 模式與程式碼範例；中文狀態對應表；共用規則 R1-R8；完成條件 |
| `skills/aibdd.auto.php.it.handlers.aggregate-then/SKILL.md` | 112 | 處理 Then 步驟中驗證 Aggregate 屬性狀態（透過 Repository 查 DB）的 handler 參考文件。 | Trigger 辨識；任務；與其他 Handler 的區別；實作流程；BDD 模式與程式碼範例；中文狀態對應表；共用規則 R1-R6；完成條件 |
| `skills/aibdd.auto.php.it.handlers.command/SKILL.md` | 140 | 處理 Given/When 步驟中執行寫入操作（Command）的 handler 參考文件。 | Trigger 辨識；任務；與其他 Handler 的區別；實作流程；BDD 模式與程式碼範例；IntegrationTestCase 基類（參考）；共用規則 R1-R7；完成條件 |
| `skills/aibdd.auto.php.it.handlers.query/SKILL.md` | 135 | 處理 When 步驟中執行讀取操作（Query）的 handler 參考文件。 | Trigger 辨識；任務；與其他 Handler 的區別；實作流程；BDD 模式與程式碼範例；IntegrationTestCase 基類（參考）；共用規則 R1-R6；完成條件 |
| `skills/aibdd.auto.php.it.handlers.readmodel-then/SKILL.md` | 133 | 處理 Then 步驟中驗證 Query 回傳結果（`$this->queryResult`）的 handler 參考文件。 | Trigger 辨識；任務；與其他 Handler 的區別；實作流程；BDD 模式與程式碼範例；中文狀態對應表；共用規則 R1-R6；完成條件 |
| `skills/aibdd.auto.php.it.handlers.success-failure/SKILL.md` | 138 | 處理 Then 步驟中驗證操作成功或失敗的 handler 參考文件。 | Trigger 辨識；任務；與其他 Handler 的區別；實作流程；BDD 模式與程式碼範例；IntegrationTestCase Helper Methods（關鍵參考）；對應表；共用規則 R1-R5；完成條件 |
| `skills/aibdd.auto.ts.it.handlers.aggregate-given/SKILL.md` | 108 | 當在 React IT Gherkin 測試中進行「系統初始狀態設定」時，「只能」使用此指令。 | Trigger 辨識；任務；與 Command Handler（Given 用法）的區別；實作流程；程式碼範例；中文狀態映射；共用規則 |
| `skills/aibdd.auto.ts.it.handlers.aggregate-then/SKILL.md` | 117 | 當在 React IT Gherkin 測試中驗證「API 被正確呼叫」時，「只能」使用此指令。 | Trigger 辨識；任務；與其他 Then Handler 的區別；實作流程；程式碼範例；captureMswRequest 工具；中文狀態映射；共用規則 |
| `skills/aibdd.auto.ts.it.handlers.command/SKILL.md` | 127 | 當在 React IT Gherkin 中撰寫使用者互動步驟（click, type, submit）時，「只能」使用此指令。 | Trigger 辨識；任務；與 Query Handler 的區別；Given vs When 的 Command 差異；實作流程；程式碼範例；Element 查找優先級；共用規則 |
| `skills/aibdd.auto.ts.it.handlers.query/SKILL.md` | 102 | 當在 React IT Gherkin 中撰寫資料讀取步驟（render component, waitFor data）時，「只能」使用此指令。 | Trigger 辨識；任務；與 Command Handler 的區別；實作流程；程式碼範例；載入等待策略；共用規則 |
| `skills/aibdd.auto.ts.it.handlers.readmodel-then/SKILL.md` | 120 | 當在 React IT Gherkin 測試中驗證「頁面顯示內容」時，「只能」使用此指令。 | Trigger 辨識；任務；與 aggregate-then 的區別；關鍵原則；實作流程；程式碼範例；中文顯示 vs Enum 值；Query 優先級；共用規則 |
| `skills/aibdd.auto.ts.it.handlers.success-failure/SKILL.md` | 104 | 當在 React IT Gherkin 測試中驗證操作成功或失敗的 UI 回饋時，「只能」使用此指令。 | Trigger 辨識；任務；與其他 Then Handler 的區別；實作流程；程式碼範例；MSW 錯誤回應設定；共用規則 |

**小計**：18 個檔案、共 **2 435 行**（C# 6 檔 986 行；PHP 6 檔 771 行；TS 6 檔 678 行）。

### 觀察

- 三語言章節結構不一致（C# 用「測試框架/共用規則」；PHP 用「任務/共用規則 R1-Rn/完成條件」；TS 用「任務/共用規則」）→ 主 skill 統一抽出語言無關的「Trigger 辨識 + 與其他 handler 的區別」決策樹後，各語言 reference 只需保留差異化的「實作流程 + 程式碼範例 + 共用規則」三段。
- C# 多了「測試框架」段落（SpecFlow + xUnit + Testcontainers），可整合進主 skill 的「測試基礎建設前置條件」段落。
- 「中文狀態對應表/中文狀態映射」三語言都有，內容大致雷同 → 主 skill 可定義一份共用表，reference 只列差異。

---

## 表 2：下游引用清單（外部命中）

> **過濾規則**：排除 18 個 handler SKILL.md 自身 frontmatter 的 `name:` 行（self-reference）。每筆顯示「行內容（trim）」與「取代建議」。

### 2.1 `agents/test-creator.agent.md`（6 處）

| 行號 | 行內容 | 取代建議 |
|---:|---|---|
| 39 | `- "zenbu-powers:aibdd.auto.php.it.handlers.aggregate-given"` | 整段 6 行替換為單一條目：`- "zenbu-powers:aibdd-handlers"` |
| 40 | `- "zenbu-powers:aibdd.auto.php.it.handlers.aggregate-then"` | 同上（合併刪除） |
| 41 | `- "zenbu-powers:aibdd.auto.php.it.handlers.command"` | 同上 |
| 42 | `- "zenbu-powers:aibdd.auto.php.it.handlers.query"` | 同上 |
| 43 | `- "zenbu-powers:aibdd.auto.php.it.handlers.readmodel-then"` | 同上 |
| 44 | `- "zenbu-powers:aibdd.auto.php.it.handlers.success-failure"` | 同上 |

### 2.2 `skills/aibdd.auto.csharp.it.step-template/SKILL.md`（17 處）

| 行號 | 行內容（節錄） | 取代建議 |
|---:|---|---|
| 31 | `\| Given \| ...「…的…為」 \| aggregate-given \| /zenbu-powers:aibdd.auto.csharp.it.handlers.aggregate-given \|` | 改為 `/zenbu-powers:aibdd-handlers`（決策樹路由）；handler 名以「**aggregate-given**」標示 reference 路徑 `references/aggregate-given/csharp.md` |
| 32 | 同上（`...handlers.command`） | 同上策略，handler = command |
| 33 | 同上（When 寫入動作 → `handlers.command`） | 同上 |
| 34 | 同上（When 讀取動作 → `handlers.query`） | 同上 |
| 35 | 同上（Then DB 驗證 → `handlers.aggregate-then`） | 同上 |
| 36 | 同上（Then 結果驗證 → `handlers.readmodel-then`） | 同上 |
| 37 | 同上（Then 操作成功失敗 → `handlers.success-failure`） | 同上 |
| 54 | `/// TODO: 參考 /zenbu-powers:aibdd.auto.csharp.it.handlers.aggregate-given 實作` | 改為 `/// TODO: 參考 /zenbu-powers:aibdd-handlers (handler=aggregate-given, lang=csharp) 實作` |
| 67 | 同 54（aggregate-given） | 同上 |
| 92 | 同 54（command） | 同上 |
| 106 | `// TODO: 參考 /zenbu-powers:aibdd.auto.csharp.it.handlers.aggregate-given 實作（DataTable 版本）` | 同上 |
| 159 | `\| aggregate-given \| /zenbu-powers:aibdd.auto.csharp.it.handlers.aggregate-given \| AggregateGiven/ \|` | 改為 `\| aggregate-given \| /zenbu-powers:aibdd-handlers (csharp) \| AggregateGiven/ \|` |
| 160-164 | 同 159（command/query/aggregate-then/readmodel-then/success-failure） | 同上 |

### 2.3 `skills/aibdd.auto.csharp.code-quality/SKILL.md`（2 處）

| 行號 | 行內容 | 取代建議 |
|---:|---|---|
| 178 | `- // TODO: 參考 /zenbu-powers:aibdd.auto.csharp.it.handlers.xxx 實作` | 改為 `/zenbu-powers:aibdd-handlers (lang=csharp)` |
| 194 | `// TODO: 參考 /zenbu-powers:aibdd.auto.csharp.it.handlers.aggregate-given 實作` | 同上策略 |

### 2.4 `skills/aibdd.auto.csharp.it.red/SKILL.md`（2 處）

| 行號 | 行內容 | 取代建議 |
|---:|---|---|
| 44 | `- 引用對應 /zenbu-powers:aibdd.auto.csharp.it.handlers.{type}` | 改為 `/zenbu-powers:aibdd-handlers`（主 skill 內依 type 路由） |
| 78 | `2. 引用對應 handler skill（例如 /zenbu-powers:aibdd.auto.csharp.it.handlers.command）` | 改為 `引用 /zenbu-powers:aibdd-handlers，handler=command` |

### 2.5 `skills/aibdd.auto.php.it.red/SKILL.md`（6 處）

| 行號 | 行內容（節錄） | 取代建議 |
|---:|---|---|
| 305 | `\| Given 狀態描述 \| /zenbu-powers:aibdd.auto.php.it.handlers.aggregate-given \|` | 改為 `/zenbu-powers:aibdd-handlers (handler=aggregate-given)` |
| 306 | `\| Given 已完成動作 / When 寫入操作 \| ...handlers.command \|` | 同上策略 |
| 307 | `\| When 讀取操作 \| ...handlers.query \|` | 同上 |
| 308 | `\| Then DB 狀態驗證 \| ...handlers.aggregate-then \|` | 同上 |
| 309 | `\| Then Response/ReadModel 驗證 \| ...handlers.readmodel-then \|` | 同上 |
| 310 | `\| Then 操作成功/失敗 \| ...handlers.success-failure \|` | 同上 |

### 2.6 `skills/aibdd.auto.php.it.refactor/SKILL.md`（5 處）

| 行號 | 行內容 | 取代建議 |
|---:|---|---|
| 92 | `2. 刪除所有 // [Handler: xxx] 參考 /zenbu-powers:aibdd.auto.php.it.handlers.xxx 標註` | 改為「刪除所有 `// [Handler: xxx] 參考 /zenbu-powers:aibdd-handlers` 標註」 |
| 106 | `// [Handler: aggregate-given] 參考 /zenbu-powers:aibdd.auto.php.it.handlers.aggregate-given` | 改為 `/zenbu-powers:aibdd-handlers` |
| 115 | `// [Handler: command] ...handlers.command` | 同上 |
| 123 | `// [Handler: success-failure] ...handlers.success-failure` | 同上 |
| 127 | `// [Handler: aggregate-then] ...handlers.aggregate-then` | 同上 |

### 2.7 `skills/aibdd.auto.php.it.test-skeleton/SKILL.md`（10 處）

| 行號 | 行內容 | 取代建議 |
|---:|---|---|
| 90 | `// [Handler: aggregate-given] 參考 /zenbu-powers:aibdd.auto.php.it.handlers.aggregate-given` | 改為 `/zenbu-powers:aibdd-handlers` |
| 93 | `// [Handler: command] ...handlers.command` | 同上 |
| 96 | `// [Handler: success-failure] ...handlers.success-failure` | 同上 |
| 99 | `// [Handler: aggregate-then] ...handlers.aggregate-then` | 同上 |
| 111 | `// [Handler: aggregate-given] ...handlers.aggregate-given` | 同上 |
| 114 | `// [Handler: command] ...handlers.command` | 同上 |
| 117 | `// [Handler: success-failure] ...handlers.success-failure` | 同上 |
| 191 | `// [Handler: aggregate-given] ...handlers.aggregate-given` | 同上 |
| 194 | `// [Handler: command] ...handlers.command` | 同上 |
| 197 | `// [Handler: success-failure] ...handlers.success-failure` | 同上 |

### 2.8 `skills/aibdd.auto.php.it.code-quality/SKILL.md`（1 處）

| 行號 | 行內容 | 取代建議 |
|---:|---|---|
| 219 | `- // 參考 /zenbu-powers:aibdd.auto.php.it.handlers.xxx 連結提示` | 改為 `/zenbu-powers:aibdd-handlers` |

### 2.9 `skills/aibdd.auto.ts.it.red/SKILL.md`（2 處）

| 行號 | 行內容 | 取代建議 |
|---:|---|---|
| 29 | `→ 讀 /zenbu-powers:aibdd.auto.ts.it.handlers.{type}/SKILL.md` | 改為 `→ 讀 /zenbu-powers:aibdd-handlers/references/{type}/typescript.md` 或主 skill 自動路由 |
| 56 | `2. Read /zenbu-powers:aibdd.auto.ts.it.handlers.{type}/SKILL.md（若尚未載入）` | 改為「Read `/zenbu-powers:aibdd-handlers/references/{type}/typescript.md`」 |

### 2.10 `skills/aibdd.auto.ts.it.step-template/SKILL.md`（6 處）

| 行號 | 行內容（節錄） | 取代建議 |
|---:|---|---|
| 156 | `\| Aggregate（初始狀態）\| States Prepare \| /zenbu-powers:aibdd.auto.ts.it.handlers.aggregate-given \|` | 改為 `/zenbu-powers:aibdd-handlers (handler=aggregate-given)` |
| 157 | `\| Command \| Operation Invocation \| ...handlers.command \|` | 同上 |
| 158 | `\| Query \| Operation Invocation \| ...handlers.query \|` | 同上 |
| 159 | `\| 操作成功/失敗 \| Operation Result Verifier \| ...handlers.success-failure \|` | 同上 |
| 160 | `\| Aggregate（狀態驗證）\| States Verify \| ...handlers.aggregate-then \|` | 同上 |
| 161 | `\| Read Model（顯示驗證）\| Operation Result Verifier \| ...handlers.readmodel-then \|` | 同上 |

### 2.11 範圍 A 統計

| 檔案類別 | 檔案數 | 引用處數 |
|---|---:|---:|
| `agents/*.agent.md` | 1 | 6 |
| `skills/aibdd.auto.csharp.*/SKILL.md`（非 handler） | 3 | 21 |
| `skills/aibdd.auto.php.*/SKILL.md`（非 handler） | 4 | 22 |
| `skills/aibdd.auto.ts.*/SKILL.md`（非 handler） | 2 | 8 |
| **合計（範圍 A 外部引用）** | **10** | **57** |

> 說明：另有 18 處為 18 個 handler SKILL.md 自身 frontmatter `name:` 行的 self-reference，刪除來源檔即一併消失，不計入待改點。
> grep 全域命中總計 75 處（包含 self-reference 18 + 外部引用 57）。

---

## 表 3：命名範圍決策建議

> 全 grep `aibdd\.auto\.(csharp|php|ts)\.it\.` 共 **176 處 / 44 檔**。
> 扣除 18 個 handler SKILL.md 之外，仍有 14 個 `aibdd.auto.{lang}.it.{starter,test-skeleton,schema-analysis,step-template,red,green,refactor,code-quality,control-flow}` SKILL.md 採點號命名。

### 3.1 影響檔案數對比

| 維度 | 方案 A：僅 handlers | 方案 B：全系列 |
|---|---:|---:|
| 待刪除 SKILL.md | 18 | 18（不變） |
| 待改名（路徑）SKILL.md | 0 | ~13（其他 .it.* skill） |
| 跨檔引用待改 | 57 處 / 10 檔 | ~145 處 / ~13 檔 |
| 主 skill 新增 | 1（`aibdd-handlers`） | 1（`aibdd-handlers`）+ 連帶調整其他 skill name |
| README/agents 異動 | 1（test-creator.agent.md） | 多處（test-creator + 其他 agent + README L555） |

### 3.2 風險對比

| 維度 | 方案 A | 方案 B |
|---|---|---|
| **Reviewer 工作量** | 低：只審 18 deletion + 1 主 skill + 10 個外部引用調整。 | 高：另需審 13 個 skill 改名 + ~88 處新增變更。一個 PR 內混雜兩種重構，風險升高。 |
| **使用者感知中斷** | 低：使用者只可能直呼 `/aibdd.auto.php.it.handlers.*`（標為 non-user-invocable，理論上不會），其他 `/aibdd.auto.{lang}.it.{red,green,...}` 命令保留原命名，不影響日常使用。 | 中：若使用者在 muscle memory 用 `/aibdd.auto.php.it.red`，改名後需同步切換；hooks/settings 也可能引用舊命名。 |
| **未竟業（debt）** | 中：點號 vs 連字號命名不一致仍存在於 14 個 skill。需安排 Refactor #3 收尾。 | 低：一次清乾淨，命名規則統一為連字號。 |
| **回滾成本** | 低（變更面小） | 中（變更面大，git revert 牽動更多檔案） |
| **Migration 文件** | 1 段 mapping（18 → 1+18 references） | 1 段 mapping + 13 條 skill 改名表 |

### 3.3 最終建議

**採方案 A（僅遷移 handlers 命名）；方案 B 留作 Refactor #3 獨立 PR**——核心理由是「一次重構只做一件事」：本次的價值主張是「18 個 handler 合併以降低 skill 列表雜訊」，命名統一是順手附帶的好處而非主目的，硬合進來會稀釋 reviewer 對主議題的注意力，且若任何外部引用漏改即同時破壞兩個面向。

---

## Hand-off / Next Agent

- 本檔案為 Stage A 唯一交付物，路徑：`docs/refactor-2-audit.md`
- 本次未修改任何 SKILL.md / agent.md / README
- **交還 orchestrator**：請依 planner 規劃推進 Stage B（建立 `skills/aibdd-handlers/SKILL.md` 主 skill 與 18 個 reference 檔），其取代清單即本檔表 2 的 57 處外部引用 + 18 個 handler SKILL.md 刪除動作
- Stage B 開始前建議先確認本檔案表 3 的「方案 A」決策是否被採納；若採方案 B，需在 Stage B 中追加 13 個 skill 改名與相應的 ~88 處引用替換
