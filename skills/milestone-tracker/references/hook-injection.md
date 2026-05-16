# Hook 注入規範

`hooks/user-prompt-submit` 偵測 cwd 內有 `specs/milestones/STATUS.md` 時，自動注入 `<MILESTONE_STATUS>` 區塊給 AI——每輪 prompt 都看到當前進度。

## 為什麼用 hook 而不是 SKILL.md

| 方案 | 優 | 缺 | 選 |
|------|----|----|----|
| 靠 SKILL.md 描述「AI 開工前要 Read STATUS.md」 | 純文件、無 hook 依賴 | AI 可能忘、可能漏讀、context 沒注入就不會主動跑 | ✗ |
| **hook 自動注入（本方案）** | 強制注入、token 可控、與 reflex 同層 | 增加一段 shell 邏輯 | ✓ |
| 寫成 MCP server | 動態 query 強 | 重型、跨平台麻煩、user 要設 .mcp.json | ✗ |

## 注入區塊規格

### 區塊格式

```
<MILESTONE_STATUS>
{STATUS.md head -40 內容}

Active doing/:
  - M01-ingestion-hardening.md
  - M02-billing-stripe.md (if any)
</MILESTONE_STATUS>
```

### 注入條件（AND 邏輯）

1. `ZENBU_HOOKS_ENABLED=1`（與 reflex 共用 outer guard）
2. cwd 內 `specs/milestones/STATUS.md` 存在
3. 環境變數 `ZENBU_MILESTONE_TRACKER_DISABLED` 未設為 `1`
4. override keyword 未命中（與 reflex / aibdd-mode 共用 override 邏輯）

### Token 預算

STATUS.md head -40 約 200-400 tokens；`ls doing/` 約 20-50 tokens。**總計 < 500 tokens**——可接受。

若 STATUS.md 異常大（>50KB），fallback 只注入頁首 5 行 + Section 1 標題。

## 在 user-prompt-submit hook 中的注入位置

`hooks/user-prompt-submit` 現有結構：

```bash
# 1. Override 偵測（命中即整段跳過）
# 2. AIBDD trigger 偵測（命中 → aibdd_active=1）
# 3. Read reflex dictionary
# 4. Build merged_content（reflex + optional aibdd-mode）
# 5. Emit JSON
```

**插入位置**：步驟 4 之內、嵌進 merged_content 末（reflex / aibdd-mode 之後）。

### 偽程式碼

```bash
# 新增：milestone status 區塊
milestone_block=""
if [ "${ZENBU_MILESTONE_TRACKER_DISABLED:-}" != "1" ]; then
    if [ -f "$PWD/specs/milestones/STATUS.md" ]; then
        status_head=$(head -40 "$PWD/specs/milestones/STATUS.md" 2>/dev/null)
        doing_list=$(ls -1 "$PWD/specs/milestones/doing/" 2>/dev/null | sed 's/^/  - /')
        if [ -n "$status_head" ]; then
            milestone_block=$'<MILESTONE_STATUS>\n'"$status_head"$'\n\nActive doing/:\n'"$doing_list"$'\n</MILESTONE_STATUS>'
        fi
    fi
fi

# 修改 merged_content 組合：
if [ -n "$milestone_block" ]; then
    merged_content="${merged_content}"$'\n\n'"${milestone_block}"
fi
```

## 與 reflex / aibdd-mode 的順序

三段同時注入時排序：

```
<ZENBU_REFLEX>...</ZENBU_REFLEX>

<ZENBU_AIBDD_MODE>...</ZENBU_AIBDD_MODE>   # 若 AIBDD trigger 命中

<MILESTONE_STATUS>...</MILESTONE_STATUS>   # 若 STATUS.md 存在
```

**為何 milestone 最後**：reflex 是行為紀律（讀規矩），aibdd-mode 是 dispatch 路由（看路），milestone status 是當前 context（看地圖）——閱讀順序符合「規矩 → 路 → 地圖」。

## 關閉方式（user override）

| 關閉方式 | 範圍 |
|---------|------|
| `unset ZENBU_HOOKS_ENABLED` | 關掉所有 hook 注入（reflex + aibdd + milestone） |
| `export ZENBU_MILESTONE_TRACKER_DISABLED=1` | 只關 milestone 注入 |
| prompt 含 override keyword（直接 / 自己來 / 跳過 skill 等） | 該輪全部跳過（與 reflex / aibdd-mode 一致） |
| 專案內無 `specs/milestones/` | 自動不注入（不污染） |

## Debug

### 確認 hook 有跑

```bash
# 跑一輪 dummy prompt 看 stdout 有沒有 MILESTONE_STATUS 區塊
echo '{"prompt":"test"}' | ZENBU_HOOKS_ENABLED=1 PWD=/your/project/with/milestones \
  bash hooks/user-prompt-submit | jq '.hookSpecificOutput.additionalContext' | grep MILESTONE_STATUS
```

### 確認 STATUS.md 路徑

注入失敗最常見原因：hook 看到的 `$PWD` 與用戶實際 cwd 不同。

Claude Code hook 環境變數 `$PWD` 由 Claude Code 設定為當前工作目錄。若異常，可改用 hook stdin JSON 內的 `.cwd` 欄位：

```bash
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)
[ -n "$cwd" ] && PWD="$cwd"
```

### Token 監控

若 STATUS.md 增長過多，head -40 可能含 KPI 表後段截斷。建議：

- 將 STATUS.md 設計為「最重要的在前 40 行」（Section 1 + Section 2 開頭）
- KPI 表 / 詳細風險清單放後段，hook 不注入

## 限制與已知問題

1. **跨平台 PWD**：Windows 走 `run-hook.cmd` → Git Bash，`$PWD` 通常 OK。若異常使用 stdin `.cwd` fallback。
2. **STATUS.md 編碼**：必須 UTF-8（hook 直接 head 不轉碼）
3. **多 worktree**：worktree 各自有 `specs/milestones/`，hook 看當前 cwd 對應的，互不影響
4. **CI 環境**：CI 常無 `specs/milestones/` 或不啟 hook，無注入——OK
5. **`doing/` 為空時**：`ls` 輸出空，`Active doing/:` 段為空——這時 AI 也應該知道「沒在做的事」
