# Stop Hook 驗收規範（zenbu-powers）

由 `hooks/hooks.json` 的 Stop hook agent 在每次 Claude Code 嘗試結束 session 時讀取並執行。本檔是該 agent 的執行說明書，邏輯改動不需重啟 session，下一次 Stop 觸發即生效。

## 觸發機制

主窗口 Claude 嘗試 stop（用戶結束、自然完成、API 終止）→ Claude Code 觸發 Stop hook → spawn agent 並把 `hooks.json` 內 `prompt` 字串作為 user message 傳入 → agent 讀本檔依規範跑驗收 → 輸出 decision JSON 決定是否 block。

> Loop 機制本質：當 hook 輸出 `{"decision": "block", "reason": "<text>"}`，Claude Code 會把 reason 當下一輪 user message 餵回主窗口繼續對話——loop 是 hook decision 機制天然產生的，不需外部排程。

## Hook Input Data Schema

`$ARGUMENTS` placeholder 會被替換為 Stop hook 的 stdin JSON 字串（官方規範），欄位：

| 欄位 | 類型 | 用途 |
|---|---|---|
| `session_id` | string | 本次 Claude Code session ID，作為 round_count key |
| `transcript_path` | string | JSONL 對話記錄絕對路徑 |
| `cwd` | string | Claude Code 啟動時的工作目錄 |
| `permission_mode` | string | 權限模式（default / plan / auto / ...） |
| `hook_event_name` | string | 永遠是 `"Stop"` |
| `stop_hook_active` | boolean | true 表示已在 hook 處理迴圈中，必須 allow stop 避免無限循環 |

## Decision JSON 輸出格式（官方規範）

| 行為 | JSON |
|---|---|
| Allow stop（讓 session 正常結束） | `{}` 或不輸出任何 JSON |
| Block stop（阻止結束、把 reason 餵回讓主窗口繼續） | `{"decision": "block", "reason": "<text>"}` |
| 附加用戶可見訊息（不影響 decision） | `{"systemMessage": "<text>"}`，可與其他欄位組合 |

## 兩種啟用方式（Auto vs Manual）

| 維度 | **Auto Loop**（自動） | **Manual Loop**（顯式） |
|---|---|---|
| 啟用條件 | `ZENBU_HOOKS_ENABLED=1` 環境變數設定 | 跑 `/zenbu-loop <task>` |
| 觸發 source | env 變數 + transcript 第一個 user message 當 task | `.claude/zenbu-loop.local.md` state file 存在 |
| max_rounds | **10**（hard-coded） | state file `max_iterations`（預設 10，0 = unlimited） |
| 任務來源 | transcript 第一個 user message | state file body 的 task 全文（更可靠） |
| PASS 處理 | 重置 round_count | 重置 + 刪除 state file（自動退出 Manual Loop） |
| 終止路徑 | evaluator PASS / 達 10 輪 FAIL 升級 | evaluator PASS / 達 max FAIL 升級 / `/zenbu-loop-cancel` 手動取消 |

**啟用優先順序**：state file 存在時走 Manual Loop（不檢查 env）；否則檢查 env 決定是否走 Auto Loop；都不滿足則 hook allow stop（不跑驗收）。這設計讓「沒啟 env 的用戶仍能透過 `/zenbu-loop` 用品質 loop」。

**設計原則**：終止判定**只信 evaluator**——Claude 主窗口無法靠輸出特定字串提早跳過驗收（避免 LLM 自證式偷懶）。所有退出路徑均經 evaluator 把關或 orchestrator 介入。

## State File（Manual Loop 才有）

### 1. `.claude/zenbu-loop.local.md`（per-project，cwd 相對路徑）

存在 = Manual Loop 啟用。Schema：

```yaml
---
active: true
mode: loop
round_count: 0           # FAIL 時 hook 同步 +1 寫回（讓 /zenbu-loop-status 看得到進度）
max_iterations: 10       # cli 設定，0 = unlimited
started_at: "..."
---

<原始任務 prompt 全文>
```

### 2. Session 級 round_count（兩模式共用）

- Windows：`%USERPROFILE%\.claude\data\zenbu-loop-state.json`
- Unix：`~/.claude/data/zenbu-loop-state.json`

JSON schema：`{<session_id>: <round_count>}`。請用 Read 工具的絕對路徑讀；不存在視為空 `{}`，寫回時若目錄不存在須先 mkdir。

---

## 執行步驟（演算法）

### Step 0：啟用判定（雙條件）

1. 讀 `.claude/zenbu-loop.local.md`：
   - **存在** → Manual Loop 啟用，max_rounds = state file 的 `max_iterations`（0 表示 unlimited，跳過 Step 4 上限檢查）→ 跳到 Step 1
2. 不存在 → 用 Bash 工具執行 `echo "${ZENBU_HOOKS_ENABLED:-}"`：
   - 輸出 **`1`** → Auto Loop 啟用，max_rounds = 10 → 跳到 Step 1
   - 輸出其他值（含空字串）→ **plugin hook 未啟用**，立即輸出 `{}` allow stop 結束

### Step 1：時限自我約束

整段邏輯總時限 240 秒（hook timeout 300 秒留 60 秒緩衝）。任何步驟超時 → 跳到 Step 7 安全失敗。

### Step 2：無限迴圈防護

解析 `$ARGUMENTS` JSON 取 `stop_hook_active`。為 `true` → 立即輸出 `{}` allow stop，結束。

### Step 3：（保留編號，邏輯已併入 Step 0）

模式判定已於 Step 0 完成，本步驟為佔位以保持後續編號穩定。

### Step 4：上限檢查

讀 session state file 取本 session 的 round_count（key = `session_id`，預設 0）。

若 max_rounds > 0 且 round_count >= max_rounds：
- Manual Loop → 輸出 `{"systemMessage": "已達 max_iterations <N> 輪未 PASS，請主 orchestrator 走升級格式回報用戶並決定續派 / 調整方向 / /zenbu-loop-cancel 取消 Manual Loop"}` allow stop
- Auto Loop → 輸出 `{"systemMessage": "已達 10 輪自動驗收上限，請主 orchestrator 走 10 輪 FAIL 升級格式回報用戶"}` allow stop

結束。

### Step 5：Dispatch acceptance-evaluator

呼叫 `@zenbu-powers:acceptance-evaluator`，傳遞：
- 用戶原始任務需求摘要：
  - **Manual Loop**：從 state file body 抽（最可靠）
  - **Auto Loop**：從 transcript 第一個 user message 抽；若該 message 內容明顯非任務描述（純打招呼、單純詢問），fallback 從近 5 輪 user messages 推導實際任務
- 全鏈 sub-agent 產出的關鍵檔案路徑與摘要
- 「未提供 testable criteria 時請自行萃取並標明來源」指示

### Step 6：處理 evaluator 回報

#### PASS
1. 重置 session round_count = 0 寫回 session state file
2. Manual Loop → 刪除 `.claude/zenbu-loop.local.md`（任務完成自動退出 Manual Loop）
3. 輸出 `{}` allow stop

#### FAIL
1. round_count++ 寫回 session state file
2. Manual Loop → 同步把 round_count 寫回 `.claude/zenbu-loop.local.md` 的 `round_count` 欄位（讓 `/zenbu-loop-status` 看得到進度）
3. 輸出 `{"decision": "block", "reason": "<evaluator 報告中前 3 條缺陷清單，編號列出>"}` 阻止 stop 讓主窗口繼續修正

### Step 7：安全失敗（catch-all）

任何錯誤（檔案讀寫失敗、evaluator dispatch 失敗、transcript 解析失敗、超過 240 秒時限）→ 輸出 `{}` allow stop。**絕對不要 block** 主流程造成卡死。

---

## Edge Cases

| 情境 | 處理 |
|---|---|
| `ZENBU_HOOKS_ENABLED` 未設且無 state file | Step 0 直接 allow stop（plugin 預設不啟用 hook，與 SessionStart / UserPromptSubmit 一致） |
| Bash 工具讀 env 失敗（無 bash 環境） | 視為未啟用，allow stop（保守 fallback） |
| state file YAML 格式異常 | 安全失敗 allow stop（不刪檔，讓用戶手動處理） |
| transcript 找不到 / 為空 | Step 5 用 fallback「未取得任務需求，請依當前 session 上下文推導」 |
| Auto Loop 中 first user message 是聊天而非 task | Step 5 fallback 從近 5 輪推導 |
| max_iterations = 0 (Manual Loop only) | unlimited，Step 4 不檢查上限；只能靠 evaluator PASS 或 `/zenbu-loop-cancel` 終止 |
| evaluator 子 agent 卡 timeout | Step 7 安全失敗，allow stop，session state 不變 |
| `.claude/` 目錄不存在 | Auto Loop 照常運作（state file 在 home dir）；Manual Loop 不會啟動（setup script 會建目錄） |
| session state file 寫失敗 | 不阻塞，繼續執行；下次重新計數 |
| 舊 state file 帶 `completion_promise` 欄位 | 略過該欄位（hook 不解析）；下次 setup 重寫時會清掉 |

---

## 維護備註

- 此規範由 `hooks/hooks.json` Stop hook agent 在每次觸發時 `Read` 一次。
- 修改規範後**無需重啟 session**，下次 Stop 觸發即生效。
- 修改 hook 觸發時機 / decision JSON / state file schema 等外部介面時，須同步：
  - `commands/zenbu-loop*.md`、`scripts/zenbu-loop-*.mjs`、`skills/using-zenbu-powers/references/acceptance-loop.md`、`README.md` 對應章節
- 若日後改為 command type Stop hook + script（方案 A），這份規範可直接成為 script 邏輯的單元測試對照表。
- **設計決策**：刻意未提供「Claude 自喊完成訊號」（曾考慮的 `--completion-promise` ralph 機制）——終止只走 evaluator PASS / 上限升級 / 用戶 cancel 三條路，避免 LLM 在 evaluator 之外開後門自證完成。
- **設計決策**：Auto Loop 的 ZENBU_HOOKS_ENABLED guard 與 SessionStart / UserPromptSubmit hook 一致；Manual Loop（state file 存在）優先於 env guard，讓未啟 env 的用戶仍能用 `/zenbu-loop` 進入品質 loop。
- **Stability warning**：`agent` type Stop hook 在 Claude Code 官方文檔（plugins-reference 截至 2026-05）標為 experimental——介面可能變更。`${CLAUDE_PLUGIN_ROOT}` 在 agent prompt 內的替換行為官方亦未明文保證（`hooks.json` Stop hook prompt 內已備援 Glob fallback）。日後若 hook 觸發失靈，**優先檢查此鏈路**：variable substitution / `$ARGUMENTS` 結構 / agent type prompt 傳遞語義。
