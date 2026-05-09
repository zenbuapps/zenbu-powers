---
name: audit-workflow
description: >
  Claude Code 設定審查的完整工作流程：模式判定、環境掃描、逐項審查、
  報告格式模板、嚴重性分級標準、修正執行協議。
---

# 審查工作流程

## Phase 0：模式判定

根據用戶輸入判斷審查模式：

| 模式 | 觸發方式 | 行為 |
|------|---------|------|
| **全面審查** | 「檢查設定」、「audit config」、「全面審查」 | 掃描所有 9 種設定類型 |
| **單項審查** | 「檢查 CLAUDE.md」、「審查 agents」、「看看 MCP 設定」 | 只審查指定類型 |
| **即時審查** | 「這樣寫對嗎？」+ 貼上設定片段 | 針對貼上的內容即時比對規範 |

## Phase 1：環境掃描

偵測專案中存在哪些設定檔：

```bash
# 掃描所有 Claude Code 相關設定檔（依專案類型擇一或全掃）
# 1. CLAUDE.md
ls CLAUDE.md .claude/CLAUDE.md 2>/dev/null

# 2. Agent 定義
ls agents/*.agent.md 2>/dev/null         # plugin 路徑
ls .claude/agents/*.md 2>/dev/null       # project 路徑

# 3. Skill 定義（plugin / project / user 三層；不掃 .github/skills，非官方路徑）
ls skills/*/SKILL.md 2>/dev/null         # plugin 路徑
ls .claude/skills/*/SKILL.md 2>/dev/null # project 路徑

# 4. Settings
ls .claude/settings.json .claude/settings.local.json 2>/dev/null

# 5. Rules
ls .claude/rules/*.md 2>/dev/null

# 6. MCP
ls .mcp.json 2>/dev/null

# 7. Hooks
ls .claude/hooks.json hooks/hooks.json 2>/dev/null

# 8. Commands
ls commands/*.md .claude/commands/*.md 2>/dev/null

# 9. Plugin Manifest（zenbu-powers 等 plugin 專案）
ls .claude-plugin/plugin.json .claude-plugin/marketplace.json 2>/dev/null
```

將掃描結果整理為清單，告知用戶：
```
📋 偵測到以下 Claude Code 設定檔：
- CLAUDE.md ✅
- agents/*.agent.md ✅ (N 個)
- skills/*/SKILL.md ✅ (N 個)
- .claude/settings.json ✅
- .claude/rules/*.md ✅ (N 個)
- .mcp.json ✅
- hooks/hooks.json ✅
- commands/*.md ✅ (N 個)
- .claude-plugin/plugin.json ✅

即將開始逐項審查...
```

## Phase 2：逐項審查

對每種存在的設定類型，執行以下步驟：

1. **讀取設定檔內容** — 使用 Read 工具讀取完整內容
2. **載入對應審查重點** — 從 `references/audit-scope.md` 找到對應領域的審查重點清單
3. **逐項比對** — 對照審查重點清單，逐項檢查實際設定是否符合規範
4. **必要時補強** — 若某項規範在 reference 中未明確涵蓋，使用 WebFetch 查詢 `references/knowledge-sources.md` 列出的官方文件 URL
5. **產出意見** — 記錄每個發現的問題，標注嚴重性等級與依據出處

> **重要**：所有審查意見必須有明確出處——**優先引用 reference 內建審查重點**（標注 `audit-scope.md` 對應條目），必要時補上官方文件 URL。**禁止憑記憶判斷**。

## Phase 3：產出審查報告

### 報告格式

```markdown
# 🔍 Claude Code 設定審查報告

審查時間：{日期}
審查範圍：{全面 / 單項}
知識來源：zenbu-powers:claude-manager skill 內建 reference（必要時補 WebFetch 官方文件）

---

## 📊 總覽

| 嚴重性 | 數量 |
|--------|------|
| 🔴 必須修正 | N |
| 🟡 建議改善 | N |
| 🟢 符合規範 | N |

---

## 🔴 必須修正

### [1] {問題標題}

**檔案**：`{檔案路徑}`
**問題**：{問題描述}
**依據**：{引用 audit-scope.md 對應審查重點條目，或官方文件 URL（如有 WebFetch 補強）}

**Before:**
```{語言}
{目前的內容}
```

**After:**
```{語言}
{建議修正後的內容}
```

---

## 🟡 建議改善

### [1] {問題標題}

**檔案**：`{檔案路徑}`
**問題**：{問題描述}
**依據**：{引用來源}

**Before:**
```{語言}
{目前的內容}
```

**After:**
```{語言}
{建議修正後的內容}
```

---

## 🟢 符合規範

- ✅ {通過項目描述}
- ✅ {通過項目描述}
```

### 嚴重性分級標準

| 等級 | 定義 | 一般範例 |
|------|------|---------|
| 🔴 **Critical（必須修正）** | 違反官方規範的硬性問題，可能導致功能異常或安全風險 | frontmatter 違反字元規則、權限過度寬鬆、敏感資訊硬編碼 |
| 🟡 **Major（建議改善）** | 不違反規範但會誤導讀者或影響觸發效率，改善後能提升 Claude 表現 | description 觸發關鍵字不足、未承認 frontmatter 欄位、tools 未限制 |
| 🔵 **Minor（可選優化）** | 結構性建議或維護成本問題，不影響功能 | 公因式可抽出、檔名易混淆、文件統計不一致 |
| 🟢 **符合規範** | 已符合官方最佳實踐（不列入問題清單） | 格式正確、內容適當、設定合理 |

### 具體判例（自動升級規則）

下列發現一律自動套用對應嚴重度，無需個別判斷：

**🔴 Critical 自動升級**
- MCP / Hooks 環境變數硬編碼敏感資訊（API Key / Token / Password）
- Hook 指令含破壞性操作（`rm -rf`、`git push --force`、未防護的資料庫操作）
- SKILL.md `name` 或目錄名違反字元規則（含 `.`、`_`、大寫、超過 64 字元）
- SKILL.md > 500 行（官方上限）
- Reference 檔案內 ground truth 錯誤（如 audit 工具自身的審查路徑寫錯）

**🟡 Major 自動升級**
- 真 skill 入口（非 references/ 子檔）含未承認 frontmatter 欄位（如 `enable_by_default`）
- Plugin agent 設定 `hooks` / `mcpServers` / `permissionMode`（會被忽略，等於死碼）
- Read-only agent（reviewer / evaluator）未設 `tools` 限制
- `permissionMode: bypassPermissions` 或 `dontAsk` 用法存疑（與 agent 行為描述矛盾）
- description 缺乏觸發關鍵字（< 5 個觸發詞或無中英對照）
- SKILL.md > 200 行（內部建議）但 ≤ 500 行（官方上限）
- `description` + `when_to_use` 接近 1,536 字元上限（>90%）

**🔵 Minor 自動升級**
- references/ 子檔含未承認 frontmatter 欄位（純註解，無功能影響）
- Hub-spoke 子 SKILL.md 命名易混淆（建議 `references/<topic>.md` 或 `REFERENCE.md`）
- Reference 檔案內公因式重複（同段落重複 ≥ 3 次）
- README 統計數字與實際不符（agent / skill 數量、版本號）
- 散落判例未集中（規則寫在多個檔案不同位置）

## Phase 4：執行修正（需用戶確認）

審查報告產出後，**停下來等待用戶指示**。

用戶可能的回應與對應行為：

| 用戶回應 | 行為 |
|---------|------|
| 「全部套用」 | 逐一修正所有 🔴 和 🟡 項目 |
| 「只改 🔴」 | 只修正 🔴 項目 |
| 「改第 1、3、5 項」 | 只修正指定項目 |
| 「不改」 | 結束，不做任何修改 |
| 「這項我不同意」 | 記錄用戶意見，從報告中移除 |

修正時：
- 每修正一個檔案，顯示 before/after diff 確認
- 修正完成後，重新掃描該檔案確認格式正確
- 全部修正完畢後，輸出修正摘要

---

## 錯誤處理

### 設定檔不存在

- 不存在的設定檔不算問題，但可以建議是否應該建立
- 例如：「未偵測到 `.claude/hooks.json`。如果需要在工具執行前後加入自訂邏輯，可以考慮設定 hooks。」

### 無法判斷的設定

- 某些設定的「正確性」取決於專案需求，無法一概而論
- 這類項目標注為 🟢 但附上備註：「此設定取決於專案需求，無通用規範」
