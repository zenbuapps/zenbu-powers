---
name: aibdd-form-activity
description: >
  Activity 視圖的 Spec Skill（Reconciler）。從 idea 推導 Activity Diagram desired state（.mmd 或 .activity 格式）
  並連動產生所有綁定檔案（.feature/.md）骨架，不確定處標記便條紙。
  以 desired-state reconciliation 模式運作：讀取現有 .activity 檔（若存在）→ 推導 desired state →
  計算 diff → 增量更新；Greenfield 時 current = 空，等同於從零建立骨架。
  可被 /discovery 調用，也可獨立使用。支援兩種格式：.mmd（Mermaid flowchart，預設）與 .activity（自訂 DSL）。
user-invocable: true
---

## I/O

| 方向 | 內容 |
|------|------|
| Input | User idea (raw text) &#124; existing `.mmd`/`.activity` files (current state) &#124; Execution Plan scope |
| Output | `activities/*.mmd`（或 `*.activity`）, `features/**/*.feature` (skeleton), `specs/**/*.md` (skeleton) |

# 角色

管理 Activity 視圖。以 reconciler 模式從 idea 推導 Activity Diagram，並連動更新所有綁定檔案的骨架。

**Reconciler 合約**：本 skill 採 desired-state reconciliation 模式。啟動時必須 **Read** `aibdd-core/references/reconciler-contract.md` 全文，並按其 Step 1-6 流程執行。本檔僅描述本 skill 的特化邏輯。

## References 導覽

| 檔案 | 何時載入 | 內容 |
|------|---------|------|
| `references/syntax-mermaid.md` | Step 1 Derive / Step 5 Apply（`.mmd` 格式） | Mermaid flowchart 語法 |
| `references/syntax-activity.md` | Step 1 Derive / Step 5 Apply（`.activity` 格式） | 自訂 DSL 語法 |
| `references/cic-format.md` | Step 1 Derive / Step 5 Apply | 便條紙格式與品質標準 |

---

# Entry 條件

**獨立調用時**，先詢問：
- 規格根目錄路徑（預設 `${SPECS_ROOT_DIR}`）
- Activity 格式：`.mmd`（預設）或 `.activity`

**被 `/zenbu-powers:aibdd-discovery` 調用時**，由協調器提供以上資訊（含 `${ACTIVITY_EXT}`） + Execution Plan scope，不再詢問。

依當前格式 LOAD 對應的 syntax reference 後再進入 Reconciliation 流程。

---

# Reconciliation 流程

## Step 1: Derive Desired State

從 idea（與相關 clarify session）推導「Activity Diagram 應該長什麼樣」：完整的 Actor / STEP / DECISION / FORK 清單，以及每個 STEP 應綁定的 .feature / .md 路徑。

### 1.1 識別 Actor

從 idea 找出所有參與者。每個 Actor 對應一個 Actor 宣告行，綁定 `specs/actors/<Actor名>.md`。

**Actor 合法性規則依 `/zenbu-powers:aibdd-discovery` 定義。** 摘要：僅允許「外部使用者」和「第三方系統」作為 Actor，禁止內建系統邏輯作為 Actor。

### 1.2 推斷 STEP 序列

從 idea 的業務動詞依序抽出主線步驟：
- 步驟數以「完成業務目標的端到端完整性」為準，不人為壓縮
- 主線 STEP 純數字遞增（1、2、3 …）
- 每個 STEP 的 `@Actor`、label、`{binding}` 皆為選用（sf parser 允許省略），但建議盡量提供以維持可讀性

### 1.3 識別 DECISION / FORK

**DECISION**（條件分支）：步驟結果有多種走向時加入。
- id = 上一個 STEP 數字 + 字母後綴（如 STEP:3 後的第一個分支為 `DECISION:3a`）
- Guard 必須窮舉所有條件，不可使用 `_`

**FORK**（並行）：多個動作可同時進行時加入。
- id = 同規則（如 STEP:4 後的第一個並行為 `FORK:4a`）

### 1.4 綁定規則

每個 STEP 綁定一個檔案：

| STEP 性質 | 綁定格式 | Feature Tag |
|-----------|---------|-------------|
| Actor 執行改變狀態的操作 | `features/<domain>/<功能名>.feature` | `@ignore @command` |
| Actor 讀取 / 查詢資料 | `features/<domain>/<功能名>.feature` | `@ignore @query` |
| 純 UI 展示 / 頁面呈現 | `specs/ui/<頁面名>.md` | — |

`[ACTOR]` 行統一綁定 `specs/actors/<Actor名>.md`。
同一個 `.feature` 可被多個 STEP 共用（路徑相同即視為同一功能）。

### 1.5 標記便條紙

依 `references/cic-format.md` 定義，於需求存在歧義或缺失處標記：

| 代碼 | 何時標記 |
|------|---------|
| `AMB` | 需求存在多種合理解讀（含分支條件可能不完整） |
| `ASM` | AI 做了一個未經確認的選擇 |
| `GAP` | 資訊完全缺失，無法確定該步驟的詳細行為 |
| `CON` | 同一流程中前後文衝突 |
| `BDY` | 範圍邊界不明確（含存在其他可行路徑但暫時未建模） |

註解前綴依格式而異（`.activity` 直接行末；`.mmd` 使用 `%%` 前綴）。

## Step 2: Read Current State

讀取 `activities/*.mmd`（或 `*.activity`）。

- **不存在**（greenfield）→ current = 空集，全部 desired 元素都是 `create`，進入 Step 3
- **存在** → parse 出：
  - Actor 清單（含其綁定路徑）
  - STEP id 列表（含 `@Actor`、label、`{binding}`）
  - DECISION 分支條件與 id
  - FORK 並行分支與 id

格式異常（Mermaid 不合法、DSL parse 失敗）時，依 contract Failure Handling 視為 empty current 但 REPORT 警告。

## Step 3: Compute Diff

依以下單位比對 desired vs current：

| 類型 | 條件 | 範例 |
|------|------|------|
| modify | STEP id 相同但 label / `@Actor` / `{binding}` 不同 | STEP:3 改名 + 換綁 lead.feature |
| modify | DECISION id 相同但 Guard 條件改變 | DECISION:3a 加第三條分支 |
| modify | Actor 名稱相同但綁定路徑變更 | `[ACTOR] 銷售 → specs/actors/Sales.md` |
| create | STEP / DECISION / FORK / Actor 不存在於 current | 全新 STEP:5、新 Actor「客戶」 |
| create | 新綁定檔案（.feature / .md 骨架不存在） | 全新 features/lead/scoring.feature 骨架 |
| delete | current 中有但 desired 中無 | 移除廢棄 STEP（永遠需確認） |

**綁定檔案的 diff 與 STEP 連動**：STEP create → 對應 .feature/.md 骨架 create；STEP modify 且綁定路徑變更 → 舊 .feature 視為 delete（需確認），新 .feature create。

## Step 4: Preview

依 contract 通用格式展示 diff，分區列出：

- Activity 檔案層級的 modify / create / delete（STEP / DECISION / FORK / Actor）
- 連動的 .feature / .md 骨架 modify / create / delete

使用者選 (P) Proceed / (E) Edit scope / (Q) Question。

## Step 5: Apply with Clarify

**先改後增**：modify → create → delete（需確認）。

### Apply 細則

1. **modify**：
   - 更新 Activity 檔對應行（`.mmd` 格式需同時更新「節點定義」與「邊定義」兩個區段）
   - 若 STEP 綁定路徑改變，同步更新對應 .feature / .md
2. **create**：
   - 寫入新 STEP / DECISION / FORK / Actor
   - 同步建立綁定的 .feature / .md 骨架（若不存在）
3. **delete**：
   - 展示每個待刪除元素及其下游依賴（綁定檔案、引用該 STEP 的其他 Activity）
   - 使用者逐一確認後才執行；reconciler 不可自動刪除

### 衝突解決（依 contract 優先序）

- 既有 .activity 中已有 `# CiC(...)` 標記的元素 → 強制走 clarify-loop（`AMB` / `GAP` / `ASM` / `CON` / `BDY`）
- 收到澄清後：解決對應便條紙（每次只刪除「已被澄清的那一張」），其他便條紙不動
- 衝突未決 → 保留 current 不動，於 Step 6 change_summary 末追加「衝突未決」條目

### 綁定檔案骨架格式

**`.feature` 骨架**：先有「如果」（Rule），再有「例如」（Example）。推理深度嚴格受組成分析的完整度約束：

| 組成分析結果 | .feature 骨架寫法 |
|-------------|-----------------|
| Rule 已知 | 寫出 `Rule: ...` |
| Rule 推論 | 寫出 `Rule: ...` + `# CiC(ASM): 推論依據` |
| Rule 缺失 | `Rule: (待澄清)  # CiC(GAP): 使用者未提及` |
| Example 使用者有給 | 寫出完整 `Example:` + Given/When/Then |
| Example 使用者沒給 | **不寫 Example**，在 Rule 上標記 `# CiC(GAP): 尚無具體案例` |
| Data 部分已知 | 已知欄位填入，未知用 `(待澄清)` |

```gherkin
@ignore @command
Feature: <功能名>

  Background:
    Given 系統中有以下<主要 Aggregate>：
      | <key欄位> | <欄位1> | <欄位2> |
      | (待澄清)  | (待澄清) | (待澄清) |

  Rule: 前置（狀態）- <使用者提及的約束>  # CiC(ASM): 推論依據：原文「...」

  Rule: 後置（狀態）- <使用者提及的後置效果>  # CiC(GAP): 後置狀態細節？

  # ⚠ Example 區段：使用者未提供具體案例，暫不生成。待澄清後補充。
```

**`.md` 骨架**（Actor / UI）：

```markdown
# <Actor名 / 頁面名>

CiC(GAP): <不確定的核心特徵>

## 描述
(待澄清)

## 關鍵屬性
- (待澄清)
```

### 澄清紀錄

將問答內容寫入 `clarify/<YYYY-MM-DD-HHMM>.md`。

## Step 6: Output

寫入更新後的 Activity 檔（與連動的 .feature / .md 骨架）+ 回傳 change_summary（含 IMPL_IMPACT）。

### IMPL_IMPACT 產出規則

每個 **modify** 操作評估對下游 spec / implementation 的影響（格式見 `aibdd-core/references/impl-impact.md`）：

| Activity Diff | Impact Type | Phase | 影響目標 |
|---------------|-------------|-------|---------|
| STEP 綁定路徑變更（換 .feature） | `SENTENCE_PATTERN` | 02-04 | bdd-analysis 須重評該 domain 句型 |
| STEP label 變更（業務動詞改名） | `SENTENCE_PATTERN` | 02-04 | 連動 .feature 句型 + 下游 Step Def |
| DECISION 分支增刪 | `NEW_OPERATION` / `SENTENCE_PATTERN` | 02-04, 07 | bdd-analysis 須補/減句型；Test Plan 結構變更 |
| Actor 改名 | `SENTENCE_PATTERN` | 02-04, 05 | 句型主詞變更；Step Def 可能斷裂 |
| 新 STEP / DECISION / Actor（create） | `NEW_OPERATION` | 下游所有 Phase | 完整 derive-feature → bdd-analysis → api-spec 流程 |

**關鍵判斷**：Activity 是上游 reconciler，其 IMPL_IMPACT 主要透過下游 reconciler 傳播（activity → bdd-analysis → api-spec），最終才落到 Phase 05+。

### Scope 表達式

```yaml
scope:
  unit: "step"
  items:
    - "STEP:3"
    - "DECISION:3a"
  impl_impact_from: []   # Activity 是上游 reconciler，通常不從更上游接收 IMPL_IMPACT
```

---

# 完成條件

- 所有 Activity 檔案無未解便條紙（Grep `CiC\(` 結果為空，或剩餘便條紙均經使用者明示保留）
- 所有綁定的 .feature / .md 骨架已建立（或已 modify 至 desired state）
- change_summary 正確反映實際操作（含 IMPL_IMPACT）
- 若 Step 5 中斷，`.reconciler-state.json` 已寫入以供下次 resume

---

## Hand-off / Next Agent

完成後交還 orchestrator。所有 form skill 重構（#4）完成後，將與 api-spec / bdd-analysis 一同送入 acceptance-evaluator 驗收 reconciler 一致性與 greenfield 行為等價性。
