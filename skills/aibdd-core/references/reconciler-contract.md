# Reconciler Contract

所有 form skill 共用的 desired-state reconciliation 合約。

## 核心思想

**每個 artifact 操作都是 delta：current state → desired state。**
Greenfield 是 current = 空的退化情況，不是特殊模式。

---

## 合約

```
Input:
  1. spec_inputs      — 推導 desired state 的來源（features, erm.dbml 等）
  2. current_artifact  — 現有 artifact 檔案（不存在 = greenfield）
  3. scope            — Execution Plan 中本 Phase 的區段（affected targets）

Output:
  1. updated_artifact  — 更新後的 artifact
  2. change_summary    — 實際執行的操作清單
```

---

## 流程（6 步）

### Step 1: Derive Desired State

從 spec_inputs 推導「artifact 應該長什麼樣」。

- 只處理 scope 範圍內的 targets
- 推導邏輯 = 各 skill 現有的「create」邏輯，不變

### Step 2: Read Current State

讀取 current_artifact。

- **不存在**（greenfield）→ current = 空集，進入 Step 3
- **存在** → parse 結構，提取可比較的元素

### Step 3: Compute Diff

```
diff(desired, current) → operations[]
```

Operations 分三類：

| 類型 | 定義 | 範例 |
|------|------|------|
| **modify** | 既有元素需更新 | Lead table 加 score 欄位 |
| **create** | 新元素不存在於 current | Journey table 新增 |
| **delete** | current 中有但 desired 中無 | 舊 endpoint 移除 |

**Greenfield 時**：current = 空 → 所有 desired 元素都是 create → 跟現有行為一致。

### Step 4: Preview

展示 diff 給使用者審查。格式：

```
══════════════════════════════════
Reconciliation Preview
══════════════════════════════════

modify (先改):
  • Lead table: +score:int, +score_updated_at:timestamp
  • Lead features: +Rule「後置 - 分數計算」

create (後增):
  • Journey table: id, lead_id, stage, created_at
  • Journey features: 3 new features

delete (需確認):
  • (無)

══════════════════════════════════
(P) Proceed  (E) Edit scope  (Q) Question
══════════════════════════════════
```

- **(P)** → 進入 Step 5
- **(E)** → 使用者調整 scope，回到 Step 3
- **(Q)** → 回答問題，重新展示 Preview

### Step 5: Apply with Clarify

**嚴格按順序執行**：

```
1. modify（先改）
   → 更新既有元素
   → 遇到衝突 → clarify-loop 解決
   → 每次 apply 後驗證 artifact 結構一致性

2. create（後增）
   → 新增元素（可引用已更新的既有元素）
   → 遇到模稜兩可 → clarify-loop

3. delete（最後，需確認）
   → 展示每個待刪除元素及其下游依賴
   → 使用者逐一確認
   → 清理引用
```

**先改後增原則**：modify 先於 create，因為新元素可能引用被修改的既有元素。

### Step 6: Output

- 寫入 updated artifact
- 回傳 change_summary：

```markdown
## Change Summary
| 操作 | 目標 | 說明 |
|------|------|------|
| modify | Lead table | +score:int |
| create | Journey table | 4 fields |
```

---

## Required SKILL.md sections

所有 reconciler skill 的 SKILL.md **主流程章節必須使用以下標題與層級**，使下游讀者能用同一份心智模型對映任何 reconciler：

```
## Reconciliation 流程
### Step 1: Derive Desired State
### Step 2: Read Current State
### Step 3: Compute Diff
### Step 4: Preview
### Step 5: Apply with Clarify
### Step 6: Output
```

### 規則

1. **通用流程在本 contract 定義**，skill 內各 Step 章節**只寫該 skill 的特化邏輯**（如 api-spec 的 endpoint 推導表、bdd-analysis 的句型分類規則），不重複描述通用流程。
2. **不可省略任何 Step 章節**，即便 skill 對某 Step 沒有特化邏輯，也須保留章節並寫「依 contract 通用流程，無特化邏輯」一行。
3. **嵌套式 reconciler**（如 bdd-analysis 三階段：系統抽象 / 句型模型 / Examples）允許前綴 `Phase N - Step M` 形式：
   ```
   ## Reconciliation 流程
   ### Phase 1 - Step 1: Derive Desired State（系統抽象）
   ### Phase 1 - Step 2: Read Current State（系統抽象.md）
   ### Phase 1 - Step 3: Compute Diff
   ...
   ### Phase 2 - Step 1: Derive Desired State（句型模型）
   ...
   ```
   每個 Phase 必須完整走完 6 步才進入下一個 Phase。
4. **Skill front-matter description 必須包含 `(Reconciler)` 字樣**，並聲明「以 desired-state reconciliation 模式運作」一句，使 orchestrator 易於識別。
5. **Skill 啟動時 Read 本 contract**：每個 reconciler skill 在執行流程開始前必須 `Read aibdd-core/references/reconciler-contract.md`。

---

## 衝突解決優先序

當 reconciler 計算出的 desired state 與既有 artifact 衝突時，依以下順序判斷：

1. **使用者直接 input 的 idea 改動 > AI 推導結果**
   使用者本輪明確要求的變更（例如「把 Lead 改名為 Prospect」），永遠勝過從其他 spec 推導出的 desired state。
2. **既有 artifact 中已有便條紙（CiC / Concerns in Context）的元素 → 強制走 clarify-loop**
   即便 desired state 看似明確，若 current 該位置帶有 `# CiC(...)` 標記，視為「使用者已表達不確定」，不可自動覆寫；必須觸發 clarify-loop 取得明示授權後才修改。
3. **delete 永遠需要使用者確認**
   即便推導結果顯示「current 中有，desired 中無」→ delete，仍須在 Step 5 展示該元素及其下游依賴，由使用者逐一確認。reconciler **不可自動刪除任何 artifact 元素**。
4. **若仍衝突，標記為 IMPL_IMPACT 並在 Step 6 Output 階段透明回報**
   無法判斷或多方都合理時，保留 current 不動，於 change_summary 末追加「衝突未決」條目，並產出對應 IMPL_IMPACT 標記，由下游 phase 或 orchestrator 處理。

---

## Failure Handling

各 step 失敗時的標準處理策略：

| Step | 失敗情境 | 處理策略 |
|------|---------|---------|
| Step 1 Derive | input 解析失敗（spec 損毀、語法錯誤） | 立即停止，REPORT 給 orchestrator，不動既有 artifact |
| Step 2 Read | 既有 artifact 格式異常（YAML 損毀、Mermaid 不合法） | 視為 empty current（greenfield 模式），但 REPORT 警告 |
| Step 3 Diff | scope 衝突（多個 input 對同一 target 給出矛盾的 desired state） | 走 clarify-loop 取得使用者裁決 |
| Step 4 Preview | 用戶取消（選 Q 後決定不繼續、或 E 後改變主意） | 保留 current 不動，rollback session 級變更（暫存的 desired state） |
| Step 5 Apply | 中途失敗（寫檔失敗、apply 第 N 個操作時 crash） | 寫 `.reconciler-state.json` 記錄已 apply 的操作清單與剩餘佇列，下次同 skill 啟動時讀取並接續 |
| Step 6 Output | report / change_summary 生成失敗 | 仍 commit 已 apply 的 artifact 變更（因為已落盤），但回報「output 損毀，請手動檢查 artifact 與 IMPL_IMPACT」 |

### `.reconciler-state.json` 結構（Step 5 中斷恢復用）

```json
{
  "skill": "aibdd-form-api-spec",
  "started_at": "2026-05-08T10:00:00Z",
  "scope": { "unit": "endpoint", "items": ["POST /leads", "GET /leads"] },
  "applied": [
    { "op": "modify", "target": "POST /leads", "at": "2026-05-08T10:00:05Z" }
  ],
  "remaining": [
    { "op": "create", "target": "GET /leads/{id}" }
  ],
  "last_error": "EACCES: write to api.yml"
}
```

下次啟動時，skill 必須先檢查同目錄下是否存在 `.reconciler-state.json`，若存在則進入「resume 模式」直接從 remaining 接續，跳過 Step 1-4。

---

## 跨 Reconciler 一致性

當 discovery（或其他主流程）連續呼叫多個 reconciler 時，必須維持以下一致性原則：

### 1. Scope 必須一致

第一個 reconciler 確立的 scope（如 endpoint 清單、domain 清單）會被後續 reconciler 繼承。**後續 reconciler 不可自行擴張或縮減 scope**，除非觸發 IMPL_IMPACT 傳播（見下）。

### 2. IMPL_IMPACT 傳播

任一 reconciler 在 Step 6 輸出 IMPL_IMPACT 標記時，後續 reconciler 必須在 Step 1 Derive 時讀取上游的 change_summary：

- 若上游 IMPL_IMPACT 涉及自己的 artifact，下游 reconciler 必須將該影響納入自己的 desired state
- 下游若因上游 IMPL_IMPACT 而擴張了 scope，須在自己的 change_summary 中註明 `triggered_by: <upstream_reconciler>`
- 詳細傳播規則見 `references/impl-impact.md`

### 3. Scope 表達式格式（minimal schema）

讓各 skill 自定義 scope unit，但統一外層格式以便 orchestrator 解析：

```yaml
scope:
  unit: "endpoint"           # 該 reconciler 的最小操作單位
                             # api-spec: "endpoint"
                             # bdd-analysis: "sentence_pattern" / "domain"
                             # activity: "step"
  items:                     # 受影響的 unit 清單
    - "POST /leads"
    - "GET /leads"
  impl_impact_from:          # 上游已標 IMPL_IMPACT 的 reconciler 名稱
    - "aibdd-form-api-spec"
```

### 4. 串接時的執行順序原則

- **activity → bdd-analysis → api-spec**（discovery 預設順序）
- 上游完成 Step 6（含 change_summary 與 IMPL_IMPACT）後，下游才能進入 Step 1
- 若上游 Step 5 中斷（`.reconciler-state.json` 存在），orchestrator 必須先恢復上游再繼續下游

---

## 冪等性

同一組 `(spec_inputs, current_artifact)` 多次執行 → 產出相同結果。

已經是 desired state 的元素 → diff = 空 → 不動。

這使得 reconciler 可以安全地「重跑」— 中斷後重新執行不會產生副作用。

---

## 各 Skill 的職責分工

| 層級 | 誰做 | 做什麼 |
|------|------|--------|
| **跨 artifact** | Phase 01 (Execution Plan) | 判斷哪些 Phase 有工作、為什麼 |
| **單一 artifact** | Form Skill (Reconciler) | 計算精確 diff、執行 apply |

Execution Plan 提供 **scope**（哪些 targets 受影響）。
Reconciler 提供 **precision**（具體怎麼改）。

---

## Skill 遷移指南

將現有 form skill 遷移為 reconciler：

1. **現有的 create 邏輯 → Step 1**（Derive Desired State）— 不用改
2. **新增 Step 2**（Read Current）— 加一個「讀取現有 artifact」的步驟
3. **新增 Step 3**（Compute Diff）— 比較 desired vs current
4. **現有的 clarify 邏輯 → Step 5**（Apply with Clarify）— 包一層 diff-aware
5. **新增 Step 4 + 6**（Preview + Output）— UI 層
6. **對齊 SKILL.md 章節結構**（見上「Required SKILL.md sections」）

最小改動：**加 Step 2 + 3**，其餘包裝現有邏輯。

---

## IMPL_IMPACT：Spec → Implementation 影響標記

Spec Reconciler（Phase 02-04）改動 spec artifact 時，可能影響已存在的 implementation artifacts（Phase 05-08）。Reconciler **不直接讀取或修改** implementation artifacts，但在 change_summary 中標記影響，由 Execution Plan 傳播給下游 Phase。

**詳細規則、Impact Types 表、change_summary 格式、產出規則、下游消費方式 → 見 `references/impl-impact.md`。**

簡略要點：
- 每個 modify 操作必須評估 IMPL_IMPACT；create 操作一律標 `NEW_OPERATION`
- Greenfield 不產出 IMPL_IMPACT
- 下游 phase 依 IMPL_IMPACT 決定走 One-shot 或 Targeted Fix

---

## 限制

- Reconciler 不處理跨 artifact 依賴（那是 Execution Plan 的責任）
- Reconciler 不自行決定 scope（從 Execution Plan 讀取）
- Reconciler 不直接讀取或修改 implementation artifacts（IMPL_IMPACT 是標記，不是操作）
- delete 操作永遠需要使用者確認，不可自動刪除
