---
name: acceptance-loop
description: Acceptance evaluation 完整規格——dispatch 規格、Agent Loop 細節、驗收責任邊界、evaluator 判定條件、與 reviewer agents 的職責邊界。當執行 acceptance evaluation 或 agent loop FAIL 處理時載入。
---

# Acceptance Evaluation 完整規格

## Dispatch 規格

派 `@zenbu-powers:acceptance-evaluator` 時，prompt 必須含：

1. 用戶原始任務需求摘要（避免 evaluator 失焦）
2. 可驗收的具體標準（testable criteria）—— 從用戶任務萃取；未提供時 evaluator 會自行推導並標明來源
3. 待評估的 agent 產出與產物路徑
4. 上游 sub-agent 的回報摘要（如有）

**缺任一項時，重新組織 prompt 後再 dispatch，不要傳空值。**

## Agent Loop（FAIL 回饋路徑）

evaluator 判定 FAIL → 主窗口讀報告 → 依不達標項目重派原 agent（傳遞 evaluator 的具體缺陷清單）→ 修正後再 spawn evaluator 複審。

**最多 3 輪。** 第 3 輪仍 FAIL 時主動升級用戶，格式：

> 已迭代 3 輪未達標。問題：[TOP 缺陷]。建議方向：A. {方案}、B. {方案}、C. {方案}，請使用者裁決。

**在 PASS 之前，不得將 agent 產出直接回報用戶**——這是核心紀律。

## 驗收責任邊界（Who Verifies What）

驗收責任屬於 **orchestrator + agent loop**，不可轉嫁給用戶。

- **evaluator 未 PASS** → 主窗口自行 loop（重派原 agent → 再 evaluate）直到 PASS，**不得詢問用戶代為驗收**
- **evaluator PASS 後** → 才向用戶呈現成果，邀請用戶做最終確認（可選）
- **3 輪 FAIL 升級** → 走前述 FAIL 升級格式，請使用者裁決方向；這是「請用戶決策」而非「請用戶驗收」

**禁止行為**（在 evaluator 尚未 PASS 時）：

- ❌ 「成果交給你，麻煩看一下對不對」
- ❌ 「你幫我驗證一下這樣有沒有符合需求」
- ❌ 「不確定有沒有 cover 完整，你檢查看看」
- ❌ 「方案 A/B/C 你想用哪個」（除屬「用戶獨有資訊」窄門外）

這類話術 = 把 evaluator 的責任偷塞給用戶。**用戶只該做最終確認，不該做品質把關，更不該被當成決策代工**——品質把關是 `@zenbu-powers:acceptance-evaluator` 與 orchestrator 的工作，技術選擇是 sub-agent 與 orchestrator 的責任。

**dispatch 觸發點**：Stop hook（reflex 第 11 條）為主；orchestrator 在 reflex 第 5 條兩個窄門下可中段補派，不取代 hook 那次最終驗收。

## Evaluator 判定條件（補強）

`@zenbu-powers:acceptance-evaluator` 在意圖對齊評估時，**以下情況一律判 FAIL**：

- Sub-agent 報告中將技術選擇丟給用戶（「方案 A/B/C 請選」）→ 任務未完成
- Sub-agent 未做出明確決策、未說明 trade-off → 自主決策授權違反
- Orchestrator 在 evaluator dispatch 之前已將選擇題轉發給用戶 → 流程違反

evaluator 偵測到此類情況時，FAIL 報告中標明「**自主決策違反**」，主窗口須重派 agent 並在 prompt 中強制要求自選一個方案。

輕量任務（orchestrator 自 eval）同樣適用：自評未 PASS 前不得詢問用戶驗收。

## 與 reviewer 的職責邊界

`@zenbu-powers:acceptance-evaluator` 與 `*-reviewer` agents **正交不重疊**：

- **acceptance-evaluator** 審：用戶意圖對齊、需求覆蓋度、邊界完整性、off-topic 偵測、基本可用門檻
- **`*-reviewer`** 審：code 品質、最佳實踐、安全、效能

evaluator 在意圖對齊評估中若發現 reviewer 該抓但漏掉的品質問題，會在「Out-of-Scope 觀察」標示，主窗口可酌情補派 reviewer 二審該局部，不影響本輪 PASS/FAIL 判定。

WEB / 桌面 / CLI / 純文件等不同專案類型的驗收手法分流，由 evaluator 依 `zenbu-powers:acceptance-evaluation` skill 自動處理。

## Loop 模式（Auto vs Manual）

Stop hook 兩種啟用方式，**底層共用同一 evaluator-driven loop 機制**：

- **Auto Loop**——`ZENBU_HOOKS_ENABLED=1` 啟用後每次 session stop 自動跑 evaluator，max=10
- **Manual Loop**——跑 `/zenbu-loop <task>` 寫 state file → max 由 cli 設定（預設 10）

未啟 env 也未下命令時 hook **不觸發**（與 SessionStart / UserPromptSubmit 一致，預設不啟用）。

### Mode 對照

| 維度 | Auto Loop | Manual Loop（zenbu-loop） |
|---|---|---|
| 啟用條件 | `ZENBU_HOOKS_ENABLED=1` env | `/zenbu-loop <task>` 寫 state file |
| State 載體 | `~/.claude/data/zenbu-loop-state.json`（per-session round_count） | 同左 + `.claude/zenbu-loop.local.md`（per-project mode flag） |
| max_rounds | **10**（hard-coded） | `--max`（alias: `--max-iterations` / `-m`）指定，預設 10，0 = unlimited |
| 任務來源 | transcript 第一個 user message（不可靠時 fallback 推導） | state file body 的 task 全文（最可靠） |
| PASS 後 | 重置 round_count | 重置 + 刪除 state file（自動退出 Manual Loop） |
| 終止路徑 | evaluator PASS / 達 10 輪 FAIL 升級 | evaluator PASS / 達 max FAIL 升級 / `/zenbu-loop-cancel` 手動取消 |
| 適用 | 一般 session 全程品質把關 | 明確 task 範圍 / 需自訂 max / 長時間重構 |

**啟用優先順序**：state file 存在 → Manual（不檢查 env）；否則檢查 env → Auto；都不滿足 → hook 不觸發。讓沒設 env 的用戶仍能透過 `/zenbu-loop` 用品質 loop。

**設計原則**：終止判定**只信 evaluator**——Claude 主窗口不能靠輸出特定字串提早跳過驗收（避免 LLM 自證式偷懶）。所有退出路徑均經 evaluator 把關或 orchestrator 介入。

### Slash Commands

- `/zenbu-loop <task> [--max <n>]` — 啟動 Manual Loop
- `/zenbu-loop-cancel` — 取消 Manual Loop（刪除 state file，視 env 回到 Auto Loop 或關閉）
- `/zenbu-loop-status` — 查看當前 Auto / Manual 狀態 + round_count

### State File Schema（Manual Loop 才有）

`.claude/zenbu-loop.local.md`（YAML frontmatter + body）：

```yaml
---
active: true
mode: loop
round_count: 0          # Stop hook 維護
max_iterations: 10      # cli 設定，0 = unlimited
started_at: "2026-05-08T12:34:56Z"
---

<原始 task prompt 全文>
```

Stop hook agent 在每次觸發時：
1. 啟用判定：state file 存在 → Manual；否則讀 `ZENBU_HOOKS_ENABLED` env → Auto；都無 → allow stop 結束
2. dispatch `@zenbu-powers:acceptance-evaluator` 跑驗收
3. PASS → Manual 刪 state file / Auto 重置 round_count；FAIL → round_count++ 同步寫回，未達 max 繼續餵回缺陷清單

實作位置：`hooks/hooks.json` Stop section、`hooks/stop-hook-spec.md`、`commands/zenbu-loop*.md`、`scripts/zenbu-loop-*.mjs`。

### 注意事項

- **state file 不入 git**：`.claude/zenbu-loop.local.md` 已加進 plugin 根 `.gitignore`（命名含 `.local.` 為本機獨有約定）；用戶專案若 fork 此 plugin 邏輯到自家專案，須自行同步 ignore。
- **與 ralph-wiggum 不相容**：兩 plugin 都註冊 Stop hook，同時啟用會雙觸發、decision 互相覆蓋（任一 block 都會 block）。請擇一啟用，或在 `~/.claude/settings.json` 暫時 disable 另一個 plugin。本 plugin 與 ralph-wiggum 的關鍵差異：max-iterations 動態配置、整合 acceptance-evaluator 智能驗收、**刻意不提供 `<promise>` 自喊完成機制**（避免 LLM 在 evaluator 之外開後門）；ralph 適合機械重塞 prompt 場景，本 plugin 適合品質驅動 loop。
- **per-project 綁 cwd**：state file 寫於當前工作目錄的 `.claude/`。若在 monorepo 子目錄起 session 而 `.claude/` 在上層，Manual Loop 觸發判定會失敗。請於 project root 啟動 session 後再 `/zenbu-loop`。
- **ZENBU_HOOKS_ENABLED guard 與其他 hook 一致**：Stop hook 跟 SessionStart / UserPromptSubmit 一樣，預設不啟用 Auto 行為；用戶顯式設 env 才開 Auto Loop，或下 `/zenbu-loop` 顯式調用 Manual Loop。
