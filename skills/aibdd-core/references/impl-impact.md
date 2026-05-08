# IMPL_IMPACT：Spec → Implementation 影響標記

從 `reconciler-contract.md` 拆出。所有 spec reconciler（Phase 02-04）改動 spec artifact 時，可能影響已存在的 implementation artifacts（Phase 05-08）。Reconciler **不直接讀取或修改** implementation artifacts（無職責汙染），但在 change_summary 中標記影響，由 Execution Plan 傳播給下游 Phase。

---

## Impact Types

| 類型 | 觸發條件 | 影響的 Implementation |
|------|---------|----------------------|
| `SENTENCE_PATTERN` | Gherkin 句型（Given/When/Then 文字）變更 | Step Definition regex/pattern 可能斷裂 |
| `DATATABLE_SCHEMA` | DataTable 欄位增刪改 | Step Definition 的 table 解析邏輯 |
| `FIELD_CHANGE` | erm.dbml 欄位增刪改型 | Domain Model + DB Migration |
| `ENUM_CHANGE` | erm.dbml Enum 值域變更 | Domain Model enum 定義 |
| `ENDPOINT_SCHEMA` | api.yml request/response schema 變更 | Backend Endpoint + Frontend API Layer + MSW Handler |
| `ENDPOINT_ROUTE` | api.yml path 或 method 變更 | Backend route + Frontend fetch URL + MSW Handler |
| `NEW_OPERATION` | 全新 feature/endpoint（create） | 需要完整 TDD cycle，不是定向修復 |

---

## change_summary 擴充格式

```markdown
## Change Summary
| 操作 | 目標 | 說明 |
|------|------|------|
| modify | Lead table | +source:varchar |
| create | Journey table | 4 fields |

## IMPL_IMPACT
| Phase | 影響目標 | Impact Type | 說明 |
|-------|---------|-------------|------|
| 05 | step_defs/lead_steps | DATATABLE_SCHEMA | Given datatable +source column |
| 05 | models/lead | FIELD_CHANGE | +source:varchar |
| 05 | migrations/ | FIELD_CHANGE | Lead table +source column |
| 06 | mocks/handlers/ | ENDPOINT_SCHEMA | GET /leads response +source |
| 06 | pages/lead/ | ENDPOINT_SCHEMA | Lead 列表顯示 +source |
```

---

## 產出規則

1. **每個 modify 操作必須評估 IMPL_IMPACT**：create 操作產出 `NEW_OPERATION`（需完整實作），modify 才產出具體 impact type
2. **只標記可推論的影響**：從 spec diff 能推論出的（如「欄位加了 → model 要加」），不猜測實作細節
3. **Phase 歸屬**：
   - Step Definitions / Models / Endpoints / Migrations → Phase 05
   - MSW Handlers / Frontend Pages → Phase 06
   - Test Plan → Phase 07（當 Activity 結構變更時）
   - Integration → Phase 08（當 Phase 05 或 06 有影響時自動觸發重驗）
4. **Greenfield 不產出 IMPL_IMPACT**：全部是 create → 全部是 `NEW_OPERATION` → Phase 05-08 正常走 one-shot 流程

---

## 下游消費方式

Phase 05-08 從 Execution Plan 讀取 IMPL_IMPACT hints：

| 模式 | 觸發條件 | 行為 |
|------|---------|------|
| **One-shot**（正常） | Execution Plan 中該 Phase 只有 `NEW_OPERATION` 或無 IMPL_IMPACT | 走完整 TDD / Build 流程 |
| **Targeted Fix**（定向修復） | Execution Plan 中該 Phase 有具體 impact type | 定位受影響的 implementation artifact → 定向修復 → 跑回歸測試 |

---

## 跨 Reconciler 的 IMPL_IMPACT 傳播

當 discovery 連續呼叫多個 reconciler（如 activity → bdd-analysis → api-spec），上游 reconciler 標記的 IMPL_IMPACT 會影響下游 reconciler 的 scope：

- 上游 reconciler 的 change_summary 中若有 `IMPL_IMPACT` 條目，下游 reconciler 在 Step 1 Derive 時應檢視這些條目
- 下游應主動評估上游的 IMPL_IMPACT 是否擴張自己的 desired state（例如：activity 標記某 STEP 變更 → bdd-analysis 須重新評估該 STEP 綁定的 .feature 句型）
- 下游若因上游 IMPL_IMPACT 而擴張 scope，必須在自己的 change_summary 中註明 `triggered_by: <upstream_reconciler>`

詳見 `reconciler-contract.md` 的「跨 Reconciler 一致性」章節。
