# Multi-Approach Trade-off Framework

Templates for proposing 2–3 approaches with structured trade-offs and a clear recommendation. Used after clarifying questions have established purpose / constraints / success criteria.

---

## When to dispatch parallel agents vs single-orchestrator analysis

| 情境 | 策略 |
|---|---|
| 功能複雜度低，方案差異一眼可見 | Orchestrator 單獨列 2–3 方案 |
| 跨 layer（DB schema + API + UI）的中大型功能 | 派 2–3 agents 平行探索 |
| 需要深度調研既有 codebase pattern | 派 agents（每個 focus 一個方向） |
| 重構既有系統 | 派 agents（minimal / clean-slate / pragmatic 各一） |

---

## Orthogonal-Dimension Matrix

3 個方案**必須**至少在 2 個正交維度上有差異，否則只是「同一架構的微調」，違反多方案探索的本意。

常見正交維度：

| 維度 | 軸的兩端 |
|---|---|
| 變更幅度 | minimal patch ←→ clean-slate redesign |
| 抽象層級 | concrete utility ←→ generic framework |
| 同步模式 | synchronous request/response ←→ async queue / event |
| 資料局部性 | server-side compute ←→ client-side compute |
| 耦合方向 | 依附既有系統 ←→ 獨立可替換模組 |
| 一致性策略 | strong consistency ←→ eventual consistency |
| 部署單位 | 同一進程 ←→ 拆成獨立 service |
| 測試粒度 | end-to-end first ←→ unit-test first |

**檢查清單**：列出 3 方案後，問自己「這三個方案分別落在哪兩個維度的哪一端？」如果三個都落在同一維度的不同點上（例：都是 minimal patch、只是 patch 大小不同），就是失敗的探索——回頭重想。

---

## Approach Comparison Table — Schema

```markdown
## 方案比較

| 維度 | A: <Minimal> | B: <Clean-slate> | C: <Pragmatic> |
|---|---|---|---|
| 預估工時 | Xh | Yh | Zh |
| 變更範圍 | 1–2 檔 | 多檔 + 新模組 | 中等 |
| 對現有測試影響 | 低 | 高（需重寫） | 中 |
| 長期維護成本 | 中（技術債累積） | 低（架構乾淨） | 中 |
| 風險點 | <具體風險> | <具體風險> | <具體風險> |
| 適合條件 | <何時選 A> | <何時選 B> | <何時選 C> |
```

可依專案需要新增列：performance、accessibility、HPOS 相容、SEO 影響、i18n 成本、相依套件數量。

---

## Three Canonical Approaches (派 agent 平行探索時的預設角色分工)

### A. Minimal approach
**焦點**：smallest change, maximum reuse of existing architecture
- 找出能複用的既有 hook / service / component
- 變更檔案數應最少
- 不引入新依賴
- 適合：時程壓力大、既有架構穩定、功能屬於既有模式的延伸

### B. Clean-slate approach
**焦點**：redesign for clarity and long-term maintainability
- 假設可以打掉重練，怎麼設計最乾淨
- 評估抽象、命名、責任分配
- 接受較高一次性成本換長期收益
- 適合：既有架構已成技術債、團隊有時間做正確的事、此模組會持續演化

### C. Pragmatic approach
**焦點**：balance speed and quality
- 在 A 與 B 之間找平衡
- 哪些部分用 minimal、哪些部分順手清理
- 通常是最終推薦
- 適合：大多數真實情境

---

## Parallel Agent Dispatch Template

派 agent 時，每個 agent 的指令大致長這樣：

```
Task: 為「<功能描述>」探索 <Minimal | Clean-slate | Pragmatic> 方向的解法。

Context:
- 既有專案結構：<貼相關目錄樹片段>
- 既有 patterns：<貼 .claude/rules 重點>
- 限制：<時程 / 相容性 / 團隊技能>

Output (回給 orchestrator)：
1. 你建議的具體做法（檔案異動清單 + 關鍵設計決策）
2. 預估工時
3. 主要風險與假設
4. 你的方向 vs 另外兩個方向的一段話比較

不要寫實作程式碼，只回設計大綱。
```

Orchestrator 收 3 份回覆後，**整合**為單一比較表（用上面的 schema），再產出 recommendation。

---

## Recommendation Template

最終推薦使用以下句式，確保推理鏈可被檢視：

> Based on **[codebase maturity / team size / timeline / 該專案具體情境]**, recommend **[Approach X]** because **[reason 1]**, **[reason 2]** outweigh trade-offs of **[Approach Y/Z]**.

**完整範例**：

> Based on the codebase already having a mature WooCommerce extension layer and the user's 1-week deadline, recommend **Approach A (Minimal)** because **reusing the existing `wc_get_orders` service** and **avoiding new dependencies** outweigh the long-term cleanliness benefits of Approach B (Clean-slate). Approach C (Pragmatic) was close, but its proposed extraction of a new `OrderQueryService` adds 2 days without clear payoff for a feature unlikely to expand.

**寫作守則**：
- 推薦理由必須是**具體**的（不要寫「比較好維護」，要寫「避免在 5 個 controller 重複 capability check」）
- 必須點出被淘汰方案的**具體 trade-off**，不是抽象地說「不夠好」
- 必須引用使用者**先前回答過**的限制條件（時程、團隊規模、相容性）作為決策錨點

---

## Trade-off Framing Anti-Patterns

避免以下寫法：

| 反例 | 為何不好 | 改寫 |
|---|---|---|
| 「A 比較簡單，B 比較完整」 | 抽象、無資訊量 | 「A 改 1 檔 50 行；B 新增 3 檔 + 改 4 檔，約 200 行」 |
| 「B 長期較好」 | 沒講 horizon 與成本 | 「若這模組未來 6 個月還會新增 3 個 entity，B 一次到位省 2 週重構」 |
| 「我推薦 A」 | 沒給推薦理由 | 用 Recommendation Template，至少 2 條具體理由 |
| 「都可以，看你」 | 把決策推回給使用者 | 必須有預設推薦，再讓使用者推翻 |
