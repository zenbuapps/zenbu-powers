# Refactor Stage — 流程骨架（語言無關）

> 本檔提供 **Refactor 階段共用流程定義**，所有語言 reference（csharp / php / typescript）共享。
> 語言特化內容（測試命令、變體工作流、refactor 模式範例）見 `references/refactor/{language}.md`。
> 完整品質規則集見 `references/refactor/code-quality-core.md` + `references/code-quality/{language}.md`。
>
> **觸發來源**：
> - 使用者直接 prompt：「重構」「refactor」「清理程式碼」
> - 上游 stage：`aibdd-auto-tdd（stage=control-flow）` 內部展開 stage=refactor
> - 主 SKILL.md 路由到 (stage=refactor, lang=…) 後，先 Read 本檔再 Read `refactor/{lang}.md`

---

## 重構觸發定義

在「綠燈通過」的前提下，以小步驟改善程式碼品質——不加新功能、不改外部行為。

**進入條件**：
- 對應 `.feature` 的所有測試已通過（綠燈）
- 由 control-flow 在綠燈完成後派發，或使用者主動觸發

**不應進入的情況**：
- 還有測試未通過（先回到 green stage）
- 程式碼已清晰且無重複（YAGNI——保持原樣）

---

## 入口模式

### 被 control-flow 調用
接收 `FEATURE_FILE` 參數，直接進入重構流程。

### 獨立使用
詢問目標範圍（特定 Feature 或全域），確認綠燈後進入重構流程。

---

## 核心循環（兩階段：Phase A 測試碼 → Phase B 生產碼）

```
執行測試（確認起始綠燈）
    │
    ▼
【Phase A】重構測試碼（test files / step definitions / helpers / factories / mocks）
    │
    ▼
執行測試（確認仍然綠燈）
    │
    ▼
【Phase B】重構生產碼（routes / services / repositories / components / hooks / api client）
    │
    ▼
執行測試（確認仍然綠燈）
    │
    ▼
完成
```

**關鍵**：
- Phase 順序不可顛倒（A → B）
- 每個 Phase 結束跑測試，Phase 內每次小步驟也跑測試
- 失敗立即還原，換另一個改善點

### 內部小步驟循環

```
1. 確認測試全數通過（起始綠燈）
2. 識別一個改善點（依 code-quality 規則優先級）
3. 執行小步驟重構
4. 重新測試 → 仍全通過？
   ├─ 是 → 回到 2
   └─ 否 → 還原，換另一個改善點
5. 無更多改善點 → 結束此 Phase
```

---

## 安全規則 R1–R7

### R1: 兩段式順序不可顛倒
Phase A → 綠燈 → Phase B → 綠燈。不允許先動生產碼再回頭整理測試碼。

### R2: 每步測試
每次小重構後立即執行測試命令（語言特化，見 `refactor/{lang}.md`），失敗立即還原。

### R3: 一次一件事
不同時重構多個部分。識別改善點 → 執行 → 跑測試 → 提交（或還原）。

### R4: 不改外部行為
重構不加新功能、不改 API 契約（`api.yml`）、不改 DB schema、不改 Zod schemas 對外型別。

### R5: 禁止自動抽 helpers
除非使用者明確要求，否則不新增共用模組、不搬移測試結構。

### R6: 禁止跨檔搬動
優先在原檔案內做最小改善（移除 TODO、補 JSDoc、調整命名/縮排）。跨檔需先徵詢確認。

### R7: 三次以上再抽
重複兩次可接受，三次以上才抽取共用方法 / hook / helper。

---

## 品質規則集索引

完整規則由兩層構成：

1. **語言無關核心** → `references/refactor/code-quality-core.md`
   - SOLID 原則總覽
   - DRY、架構分層、命名清晰、Step Definition 整理、Meta 清理通用規則
   - 小步驟循環

2. **語言特化規則** → `references/code-quality/{csharp|php|typescript}.md`
   - 該語言的 SOLID 範例（含 before/after）
   - 測試框架最佳實踐（Testing-Library、SpecFlow、PHPUnit 等）
   - 型別系統規範（TypeScript 嚴格型別、PHP 8.1+ readonly、C# nullable reference types）
   - 日誌實踐
   - 架構分層的具體目錄結構
   - 檢查清單

> **載入順序**：先 Read core，再 Read 對應語言。語言特化規則優先於 core（衝突時以 language-specific 為準）。

### 核心面向（語言通用）

1. **SOLID 原則** — S（單一職責）、O（開放封閉）、L（里氏替換）、I（介面隔離）、D（依賴反轉）
2. **DRY** — 消除重複，但不過度抽象（YAGNI）
3. **架構分層** — Controller/Route → Service → Repository → Model
4. **命名清晰** — 函數名表達意圖，不用縮寫
5. **Step Definition 整理** — 檔案組織、import 排序、共用 helper 提取
6. **Meta 清理** — 移除 TODO 註解、保留業務註解
7. **日誌實踐** — 結構化 key=value、正確日誌等級

---

## 重構邊界（不在重構期做的事）

- 不加新功能
- 不改測試行為（除非重構測試程式碼本身）
- 不改 API 契約（`api.yml`）或 DB schema（`erm.dbml`）
- 不改 Zod schemas 的對外型別（可內部改善結構）
- 不做效能優化（除非有明顯效能問題）
- 不做架構大規模重組（屬於 plan 級任務，需先徵詢）

---

## 完成條件

- [ ] 測試仍全數通過（零失敗、零 warnings）
- [ ] 對應語言的 type checker / linter 通過：
  - csharp：`dotnet build` 無 warnings
  - php：`composer phpstan` / `phpcs` 通過
  - typescript：`npx tsc --noEmit` + `npx eslint` 通過
- [ ] code-quality 規則主要面向已檢查（SOLID、DRY、命名、分層）
- [ ] 無殘留 TODO / META 註解（樣板階段遺留已清除）
- [ ] 測試輸出乾淨（無 deprecation notices、無 `act(...)` warnings、無 MSW unhandled request）
