# Stop Hook Shell 邏輯規範（zenbu-powers，v3.15.0 封存）

> **⚠️ v3.15.0 封存**：本 spec 描述的 Stop hook driven acceptance loop 已於 v3.15.0 退場——`hooks/hooks.json` 不再註冊 Stop hook，`hooks/stop-hook` 腳本檔保留但不會被觸發。每對話自動驗收造成的延遲問題促使改採「主窗口完成 → 直接交付用戶 / opt-in evaluator」流程。本檔保留供未來驗收機制重新設計時參考。

歷史說明（v3.13 - v3.14 設計）：由 `hooks/hooks.json` 的 Stop hook 在每次 Claude Code 嘗試結束 session 時觸發 polyglot 腳本 `hooks/stop-hook` 執行。本檔是該 shell 腳本的邏輯說明書，腳本邏輯改動不需重啟 session，下一次 Stop 觸發即生效。

## 觸發機制

主窗口 Claude 嘗試 stop（用戶結束、自然完成、API 終止）→ Claude Code 觸發 Stop hook → 透過 `run-hook.cmd` 執行 `bash hooks/stop-hook` → 腳本自 stdin 讀 hook input JSON 跑邏輯 → 輸出 decision JSON 決定是否 block。

> **Loop 機制本質**：當腳本輸出 `{"decision": "block", "reason": "<text>"}`，Claude Code 會把 reason 當下一輪 user message 餵回主窗口繼續對話——loop 是 hook decision 機制天然產生的，不需外部排程。
>
> **H2 重構後關鍵差異**：reason 內含 `[ZENBU_LOOP_DISPATCH]` token，主窗口 reflex 第 11 條會據此**自動派 acceptance-evaluator sub-agent** 完成驗收（reflex 第 11 條 hook 觸發為主路徑——orchestrator 不主動 dispatch）。Stop hook 本身不再 spawn agent（先前 agent type 的內嵌 prompt 已移除），純 shell 完成 state machine 的 deterministic 部分。

## Hook Input Data Schema（從 stdin 讀取）

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

## Dispatch Reason 格式（H2 後定稿）

當腳本判定需要繼續 loop 時，組裝以下 reason 並輸出 `{"decision":"block","reason":"<reason>"}`：

```
[ZENBU_LOOP_DISPATCH] mode=<auto|manual> session=<session_id> round=<r>/<max> task=<truncated_to_500_chars>

請依 reflex 第 11 條派 @zenbu-powers:acceptance-evaluator 對齊上述 task 進行驗收。evaluator PASS 時自行重置 ~/.claude/data/zenbu-loop-state.json 該 session_id 為 0、刪除 .claude/zenbu-loop.local.md（若存在）後才 stop。
```

關鍵 token：`[ZENBU_LOOP_DISPATCH]`——reflex 第 11 條依此偵測並觸發 evaluator dispatch。task 文字截斷到 500 字元以避免 reason 過長。

## 兩種啟用方式（Auto vs Manual）

| 維度 | **Auto Loop**（自動） | **Manual Loop**（顯式） |
|---|---|---|
| 啟用條件 | `ZENBU_HOOKS_ENABLED=1` 環境變數設定 | 跑 `/zenbu-loop <task>` |
| 觸發 source | env 變數 + transcript 第一個 user message 當 task | `.claude/zenbu-loop.local.md` state file 存在 |
| max_rounds | **10**（hard-coded） | state file `max_iterations`（預設 10，0 = unlimited） |
| 任務來源 | transcript 第一個 user message | state file body 的 task 全文（更可靠） |
| PASS 處理 | evaluator 重置 round_count | evaluator 重置 + 刪除 state file（自動退出 Manual Loop） |
| 終止路徑 | evaluator PASS / 達 10 輪 FAIL 升級 | evaluator PASS / 達 max FAIL 升級 / `/zenbu-loop-cancel` 手動取消 |

**啟用優先順序**：state file 存在時走 Manual Loop（不檢查 env）；否則檢查 env 決定是否走 Auto Loop；都不滿足則 hook allow stop（不跑驗收）。

**設計原則**：終止判定**只信 evaluator**——主窗口無法靠輸出特定字串提早跳過驗收（避免 LLM 自證式偷懶）。所有退出路徑均經 evaluator 把關或 orchestrator 介入。

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

JSON schema：`{<session_id>: <round_count>}`。腳本以 `$HOME/.claude/data/zenbu-loop-state.json` 讀寫；不存在視為空 `{}`，寫回時若目錄不存在會先 `mkdir -p`。

---

## 責任邊界（H2 重構後三方分工）

| 責任方 | 負責項目 |
|---|---|
| **shell 腳本（`hooks/stop-hook`）** | Step 0 啟用判定 / Step 2 stop_hook_active 防無限循環 / Step 4 上限檢查與升級 systemMessage / round_count++ 寫回 / 組 dispatch reason 並 block |
| **主窗口 Claude（reflex 第 11 條）** | 偵測 reason 內 `[ZENBU_LOOP_DISPATCH]` token → dispatch `@zenbu-powers:acceptance-evaluator` sub-agent，傳遞 task 文字、session_id、round 等 dispatch context |
| **acceptance-evaluator agent** | 跑驗收方法論輸出 verdict；PASS 時**自行**重置 `~/.claude/data/zenbu-loop-state.json` 該 session_id = 0、刪除 `.claude/zenbu-loop.local.md`（若存在），完成後在報告中標明「state 已重置」 |
| **batch protocol v2 處理** | 主窗口收到 evaluator 輸出後，依 reflex 第 10 條 Read full_report 修缺陷；下一次 stop 再次觸發本 hook 走相同流程 |

> **為什麼把 PASS state 重置從 hook 移到 evaluator**：H2 前 hook 是 agent type，能解析 evaluator 輸出 + 寫檔；改成 command type 後 shell 沒有 LLM 判斷力（不知道 evaluator verdict 是 PASS 還是 FAIL）。讓 evaluator 自己負責清理 state 是最簡單的單一責任分工——hook 只管「啟動 loop 與計數」，evaluator 只管「驗收與終止 loop」。

---

## 執行步驟（shell 腳本演算法）

> 完整實作見 `hooks/stop-hook`，本節為偽碼說明對應位置。

### Step 0：啟用判定（雙條件）

```bash
if [ -f ".claude/zenbu-loop.local.md" ]; then
    mode="manual"
    max_rounds=$(grep ^max_iterations: ... | extract)
elif [ "$ZENBU_HOOKS_ENABLED" = "1" ]; then
    mode="auto"
    max_rounds=10
else
    echo '{}'; exit 0   # plugin 未啟用，allow stop
fi
```

### Step 2：stop_hook_active 防無限循環

```bash
if [ "$stop_hook_active" = "true" ]; then
    echo '{}'; exit 0
fi
```

### Step 4：上限檢查

讀 `~/.claude/data/zenbu-loop-state.json` 取本 session 的 round_count（key = `session_id`，預設 0）。

```bash
if [ "$max_rounds" != "0" ] && [ "$round_count" -ge "$max_rounds" ]; then
    # Manual Loop → "已達 max_iterations <N> 輪未 PASS..."
    # Auto Loop  → "已達 10 輪自動驗收上限..."
    echo '{"systemMessage":"<升級訊息>"}'; exit 0
fi
```

### Step 5：抽 task summary（≤ 500 字元）

- **Manual Loop**：從 state file body 抽（YAML frontmatter 結束後的內容，最可靠）
- **Auto Loop**：從 `transcript_path` 第一個 user JSONL entry 抽 content
- 兩者皆失敗 → fallback「未取得任務需求，請依當前 session 上下文推導」

### Step 6：round_count++ 寫回

```bash
new_round=$((round_count + 1))
# 寫回 ~/.claude/data/zenbu-loop-state.json[session_id] = new_round
# Manual Loop 額外 sed 同步 .claude/zenbu-loop.local.md 的 round_count 欄位
```

### Step 7：組 dispatch reason 並 block

```bash
reason="[ZENBU_LOOP_DISPATCH] mode=$mode session=$session_id round=$new_round/$max_rounds task=$task_summary

請依 reflex 第 11 條派 @zenbu-powers:acceptance-evaluator..."

echo "{\"decision\":\"block\",\"reason\":<jq -Rs reason>}"
```

### Step 8：安全失敗（catch-all）

`set -uo pipefail` + `trap 'exit 0' ERR` → 任何錯誤都 allow stop。**絕對不 block** 主流程造成卡死。

---

## Edge Cases

| 情境 | 處理 |
|---|---|
| `ZENBU_HOOKS_ENABLED` 未設且無 state file | Step 0 直接 `echo '{}'` allow stop（plugin 預設不啟用） |
| 無 jq 工具 | 退到 sed/grep + bash 參數替換做 JSON escape（fallback path 已內建） |
| state file YAML 格式異常（無 max_iterations） | 預設 max_rounds=10 繼續執行（不安全失敗） |
| transcript 找不到 / 為空 | Step 5 fallback「未取得任務需求，請依當前 session 上下文推導」 |
| Auto Loop 中 first user message 是聊天而非 task | shell 無法判斷，仍丟給 evaluator；evaluator 萃取 testable criteria 時會看 transcript 上下文 |
| max_iterations = 0 (Manual Loop only) | unlimited，Step 4 跳過上限檢查；只能靠 evaluator PASS 或 `/zenbu-loop-cancel` 終止 |
| 主窗口收到 reason 但忽略（沒派 evaluator 直接 stop） | 下一次 stop hook 再觸發、round_count++、繼續餵 reason；最終達 max_rounds 升級用戶介入 |
| `.claude/` 目錄不存在 | Auto Loop 照常運作（state file 在 home dir）；Manual Loop 不會啟動（setup script 會建目錄） |
| session state file 寫失敗 | trap 攔截，繼續執行；下次重新計數（保守 fallback） |
| 舊 state file 帶 `completion_promise` 欄位 | 略過該欄位（hook 不解析）；下次 setup 重寫時會清掉 |
| evaluator dispatch 失敗 / sub-agent timeout | 由主窗口處理（非 hook 範疇）；下次 stop 重新觸發 |
| stop_hook_active=true（hook 處理迴圈中） | 立即輸出 `{}` allow stop |
| evaluator PASS 但忘記重置 state | 下一次 stop hook 仍會把 round_count++ 並 block；用戶察覺後手動清 state file 或執行 `/zenbu-loop-cancel` |

---

## 維護備註

- 此規範對應 `hooks/stop-hook` shell 腳本邏輯。修改腳本後**無需重啟 session**，下次 Stop 觸發即生效。
- 修改 hook 觸發時機 / decision JSON / state file schema / reason 格式 / `[ZENBU_LOOP_DISPATCH]` token 等外部介面時，須同步：
  - `commands/zenbu-loop*.md`、`scripts/zenbu-loop-*.mjs`、`skills/using-zenbu-powers/references/acceptance-loop.md`、`README.md` 對應章節
  - `agents/acceptance-evaluator.agent.md` 內「PASS 後 state 重置責任」段
  - `hooks/reflex-dictionary.txt` 第 11 條
- **batch protocol v2 處理**：reason 含 `.claude/zenbu-loop-reports/<...>.md` 路徑時的 fetch / Read 邏輯由 evaluator 寫入 full_report、主窗口透過 reflex 第 10 條主動 Read。本 hook **不解析** evaluator 輸出，也不寫 batch state 檔——這部分責任在 evaluator 與主窗口（H2 後分工）。
- **設計決策**：刻意未提供「Claude 自喊完成訊號」——終止只走 evaluator PASS / 上限升級 / 用戶 cancel 三條路，避免 LLM 在 evaluator 之外開後門自證完成。
- **設計決策**：Auto Loop 的 `ZENBU_HOOKS_ENABLED` guard 與 SessionStart / UserPromptSubmit hook 一致；Manual Loop（state file 存在）優先於 env guard，讓未啟 env 的用戶仍能用 `/zenbu-loop` 進入品質 loop。
- **H2 重構後架構優勢**：
  - command type 比 agent type 啟動成本低、無 sub-agent spawn 固定開銷
  - shell 腳本可單元測試（mock stdin JSON、檢查 stdout）
  - 不依賴 `${CLAUDE_PLUGIN_ROOT}` 在 agent prompt 內的替換行為（command type 由 hooks.json 直接展開）
  - 不依賴 agent type 的 experimental 介面
- **H2 重構後職責切換**：PASS 時的 state 清理責任從 hook 移到 evaluator agent。原因見上方「責任邊界」段——shell 沒有 LLM 判斷力解析 evaluator verdict，分工由「能寫 code 的腳本管 deterministic state machine、能讀 LLM 輸出的 agent 管 verdict-driven 清理」更乾淨。

---

## Hand-off / Next Agent

**H2 完成範圍**：
- Stage B：新建 `hooks/stop-hook` polyglot bash 腳本
- Stage C：`hooks/hooks.json` Stop entry 從 agent type 改 command type；reflex 第 11 條新增；user-prompt-submit / aibdd-mode-prompt 註解 10→11
- Stage D：本檔重寫；`agents/acceptance-evaluator.agent.md` 追加「PASS 後 state 重置責任」段

**Stage E（用戶手動測試）**：
1. `export ZENBU_HOOKS_ENABLED=1` 開啟 Auto Loop
2. 跑一個 dummy task（如「請寫個 hello.py」），等主窗口 stop
3. 觀察主窗口應收到含 `[ZENBU_LOOP_DISPATCH]` 的 user message → 自動派 evaluator
4. evaluator PASS → 應重置 `~/.claude/data/zenbu-loop-state.json` 該 session_id = 0
5. Manual Loop 同步測試：`/zenbu-loop <task>` → 走完同流程 + 確認 PASS 時 `.claude/zenbu-loop.local.md` 被刪

**回傳 orchestrator**：本任務由 sub-agent 完成 Stage B+C+D 三段；後續手動測試與 commit 由用戶決定。
