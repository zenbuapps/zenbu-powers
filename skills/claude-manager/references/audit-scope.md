---
name: audit-scope
description: >
  Claude Code 設定審查的 9 大範圍：CLAUDE.md、Agent、Skill、Settings、Rules、MCP、Hooks、Commands、Plugin Manifest。
  每種類型包含檔案路徑、審查重點清單與重點補充。所有審查意見必須引用具體條目。
---

# 審查範圍

依優先順序逐項審查。每種設定類型都有對應的審查重點，配合 `audit-workflow.md` 的嚴重度判定標準產出報告。

---

## 通用審查依據協議（適用所有 9 大範圍）

每項問題的依據必須來自下列至少一個來源：

1. **首要**：本檔案對應條目（標注「audit-scope.md §`<段號>`.`<項目>`」）
2. **補強**：必要時 WebFetch 對應官方 URL（見每節 **官方 URL** 欄；完整清單見 `knowledge-sources.md`）
3. **報告**：問題出處必須能定位到具體行號或條目

各節僅列「**官方 URL**」+「**審查重點**」+ 必要時的「**重點補充**」（不重複本協議）。
嚴重度判定標準與報告格式統一於 `audit-workflow.md`。

---

## 1. CLAUDE.md

**檔案路徑**：`CLAUDE.md`、`.claude/CLAUDE.md`、`~/.claude/CLAUDE.md`

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/memory`

**審查重點**：
- 結構是否清晰（分區明確、有標題層級）
- 內容密度是否適當（不過長、不過短，避免塞入整份教學）
- 是否包含專案關鍵資訊（建構指令、測試指令、程式碼風格、架構概述）
- 語氣是否面向 AI Agent（精準、指令式），而非人類教學
- 是否有過時或與程式碼不一致的內容
- 是否有不該放在 CLAUDE.md 的內容（應拆分到 `.claude/rules/` 的 glob-specific 規則）

---

## 2. Agent 定義

**檔案路徑**：`agents/*.agent.md`（plugin / 此專案）、`.claude/agents/*.md`（project）、`~/.claude/agents/*.md`（user）

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/sub-agents`

**審查重點**：

**A. 必填欄位**
- frontmatter 必填僅 `name` + `description`（兩者皆 Required: Yes）
- `name` 字元規則：lowercase letters + hyphens（官方原文：「Unique identifier using lowercase letters and hyphens」）

**B. 觸發與分流**
- `description` 應包含明確觸發關鍵字（中英並列效果更好），可加 "use proactively" 鼓勵自動委派
- 至少 5 個觸發詞、涵蓋同義詞、import 關鍵字（若適用）
- `model` 合理性：opus（深度推理）/ sonnet（常規）/ haiku（輕量低成本任務如 git commit）/ inherit（預設）

**C. 工具與權限（容易漏的重點）**
- `tools` 欄位若省略 = 繼承所有工具，違背「Limit tool access」最佳實踐——read-only agent 應顯式限制
- `disallowedTools` 用於 denylist（與 tools 並用時 disallowed 先行，再用 tools 過濾剩餘池）
- `permissionMode` 風險檢查：
  - `bypassPermissions`：必列警告（官方原文有 ⚠️）
  - `dontAsk`：是「**自動拒絕**」（容易誤解為自動允許，與 push 類動作描述會矛盾）
  - `acceptEdits`：較合理的「自動允許檔案編輯」選項

**D. Plugin 場景特殊規則（zenbu-powers 適用）**
- ⚠️ Plugin 載入路徑下，下列三欄位**會被忽略**：`hooks` / `mcpServers` / `permissionMode`
- 官方原文：「For security reasons, plugin subagents do not support these fields. These fields are ignored when loading agents from a plugin.」
- 上述三項在 plugin agent 上設定 = 死碼，應移除或移到專案級 `settings.json` / `.mcp.json`

**E. 預載 Skills 與 MCP**
- `skills:` 引用是否存在於本 plugin / user / project（全字串對照）
- `mcpServers` 重複性：只在「非 plugin」場景才需檢查與全域 `.mcp.json` 是否重複

**F. 內容組織**
- body 結構清晰、無過度冗長
- 無與其他 agent 功能重疊
- description 是否含明確自動委派關鍵字

**G. 其他官方支援欄位**（依需要審查）
- `disallowedTools` / `maxTurns` / `memory` / `background` / `isolation` / `color` / `initialPrompt` / `effort` / `disabled`

---

## 3. Skill 定義

**檔案路徑**（依專案類型擇一或全掃）：
- Plugin 專案：`skills/*/SKILL.md`（從 plugin 根目錄；本 zenbu-powers 專案）
- 一般專案：`.claude/skills/*/SKILL.md`
- 個人共用：`~/.claude/skills/*/SKILL.md`
- Managed：`.claude/skills/managed/*/SKILL.md`（系統管理）

**注意**：`*/references/*/SKILL.md` 是 hub-spoke 模式的 reference 檔，**不是真正的 skill**，不會被 skill loader 註冊。審查時：
- 不單獨列 frontmatter 違規（不影響 loader 解析）
- 仍可檢查內容品質與命名混淆（建議改為 `references/<topic>/REFERENCE.md` 或 `references/<topic>.md`）

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/skills`

**審查重點**：

**A. Frontmatter 與基本格式**
- 必填僅 `description`（推薦），`name` 可省略由目錄名 fallback
- `name`（若顯式設定）字元規則：**lowercase letters / numbers / hyphens only**，max 64 chars，**不能含 `.`、`_`、大寫**
- 目錄名同樣受上述字元規則約束（因為它是 fallback name）
- `name` 與目錄名若同時存在，必須一致（避免引用混淆）
- `description` + `when_to_use` 合計上限 **1,536 字元**（超過會被截斷，最關鍵觸發詞放最前面）
- 官方未承認的欄位（如 `enable_by_default`）會被忽略，應移除避免誤導
  - 若意圖是「不讓 Claude 自動觸發」，應改用官方 `disable-model-invocation: true`
- `allowed-tools` 是否適當限制（accepts space-separated string 或 YAML list）
- 是否善用 `$ARGUMENTS` / `$N` / `$name` 動態替換（須先在 `arguments:` frontmatter 宣告）
- 完整官方欄位：`name` / `description` / `when_to_use` / `argument-hint` / `arguments` / `disable-model-invocation` / `user-invocable` / `allowed-tools` / `model` / `effort` / `context` / `agent` / `hooks` / `paths` / `shell`

**B. SKILL.md 是「目錄」不是「教科書」（核心心法）**
- 行數限制：
  - **官方上限：500 行**（官方原文 "Keep SKILL.md under 500 lines"）
  - **本專案內部建議：200 行**（更嚴格的內部標準，目標是 entry point 不是內容庫）
- 大型內容（範例、完整文件、教學）拆分至 `references/` 子目錄
- SKILL.md 應只回答三件事：「**什麼時候用**、**做什麼**、**去哪找詳細資訊**」

**C. 能力導向 vs 工具導向（設計哲學）**
- skill 切分按「**開發時實際做的事情**」（能力導向），而非按「工具/套件」（工具導向）
- 反模式：每個套件一個 skill（`react-skill` / `tailwind-skill` / `typescript-skill`）= 百科全書，不能組合
- 正確模式：按能力切（如 `ui-styling` 整合 react + tailwind + typescript）
- 工具導向 skill 容易 context 爆炸，能力導向天然避免

**D. Description 觸發成功率（vector search 機制）**
- `description` 是 **vector search** 找 skill 的依據——籠統 = 觸發失敗
- **最關鍵的觸發詞必須放最前面**（被截斷時優先保留前段）
- 適時加入 **"CRITICAL" / "MANDATORY"** 等加權詞，提升 agent selection 邏輯權重
- description 應含具體技術名詞、使用情境、import 關鍵字，而非抽象描述
- 觸發詞列表過長時抽到 `when_to_use` 欄位（兩者合計仍受 1,536 字元上限）

**E. Token 預算管理**
- 次要 skills 透過 `skillOverrides` 設為 `"name-only"`，只列名稱不附描述，釋放預算給核心 skills
- 必要時調高 `SLASH_COMMAND_TOOL_CHAR_BUDGET` 環境變數提高上限

**F. 計算性工作 / 固定行為移到腳本（核心心法）**
- 能交給程式做的，**絕對不要塞進 SKILL.md 讓模型「讀著做」**
- 反例：讓 LLM 用生成 token 的方式排序 list（效率差到爆）
- 正例：用 Python 腳本從 PDF 抽 form fields——整個過程不用把腳本或 PDF 載入 context
- 排序、解析、抽取、計算、批次處理、固定流程 → 一律打包成 skill 內附腳本

**G. 內容風格**
- 內容面向 AI Agent（精準密集），而非人類教學

**重點檢查清單**：
1. 計算 SKILL.md 行數（>200 行 → 🟡，>500 行 → 🔴）
2. 判讀 skill 切分邏輯（按工具切 = 反模式；按能力切 = 正確）
3. description 第一句必須含核心觸發關鍵字（截斷風險最低）
4. 檢查 frontmatter `name` / 目錄名字元規則
5. 檢查未承認欄位（`enable_by_default` 等）
6. 檢查是否有可腳本化但塞在 SKILL.md 的計算流程

---

## 4. Claude 設定

**檔案路徑**：`.claude/settings.json`、`.claude/settings.local.json`、`~/.claude/settings.json`

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/settings`

**審查重點**：
- 權限設定是否合理（`permissions.allow` / `permissions.deny`）
- 是否有過度寬鬆的權限（如允許所有 Bash 指令）
- 安全性設定是否適當
- 是否有廢棄或無效的設定項
- env 變數設定是否合理（避免敏感資訊硬編碼）

---

## 5. 專案規則

**檔案路徑**：`.claude/rules/*.md`、`~/.claude/rules/*.md`

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/memory`

**審查重點**：
- 每個 rule 檔案是否有 `globs` frontmatter（指定適用檔案範圍）
- rule 內容是否與 CLAUDE.md 衝突或重複
- rule 是否太過通用（應放在 CLAUDE.md）或太過具體（應放在程式碼註解）
- 命名是否語義化

**參考**：文末「特殊場景處理 §CLAUDE.md vs Rules 的分工」

---

## 6. MCP 設定

**檔案路徑**：`.mcp.json`、`~/.claude/.mcp.json`

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/mcp-servers`

**審查重點**：
- MCP server 設定格式是否正確（`type` / `command` / `args` / `env`）
- 環境變數是否硬編碼敏感資訊（API Key / Token 應使用 env 引用）
- server 指令路徑是否正確
- 是否有未使用或重複的 MCP server
- stdio vs sse vs http 類型是否正確使用

**重點判例**：環境變數硬編碼敏感資訊 → 自動列為 🔴（依 `audit-workflow.md` 嚴重度表）

---

## 7. Hooks 設定

**檔案路徑**：`.claude/hooks.json`、`hooks/hooks.json`（plugin）

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/hooks`

**審查重點**：
- hook 事件類型是否正確（`PreToolUse` / `PostToolUse` / `Notification` / `SessionStart` / `UserPromptSubmit` / `Stop` 等）
- hook 指令是否安全（不應有破壞性指令）
- hook 是否有合理的超時設定
- 是否有不必要的 hook 影響效能

**重點判例**：hook 指令含破壞性操作（`rm -rf` / `git push --force` 等）→ 自動列為 🔴

---

## 8. Commands（自訂指令）

**檔案路徑**：`commands/*.md`（plugin）、`.claude/commands/*.md`（project）、`~/.claude/commands/*.md`（user）

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/skills`（Custom commands 段：「commands have been merged into skills」）

**審查重點**：
- frontmatter 是否正確（與 skill frontmatter 大致相同，但功能更聚焦）
- 是否與同名 skill 重複（同名時 skill 優先；commands/foo.md 與 skills/foo/SKILL.md 並存會造成混淆）
- 命令命名是否語義化、無衝突
- 是否該升級為 skill（若內容已超出單一指令範圍）

---

## 9. Plugin Manifest（zenbu-powers 適用）

**檔案路徑**：`.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json`

**官方 URL**：`https://docs.anthropic.com/en/docs/claude-code/plugins-reference`

**審查重點**：
- `name` / `version` / `description` / `author` 必填
- `homepage` / `repository` URL 是否仍有效
- `keywords` 是否反映最新功能（避免 README 與 manifest 不同步）
- `version` 是否與 README 顯示版本、agent / skill 數量一致
- `license` 欄位是否設定

---

## 特殊場景處理

### 審查 Agent 的 model 選擇

| model | 適用場景 |
|-------|---------|
| `opus` | 需要深度推理、複雜分析、跨多檔案理解的任務 |
| `sonnet` | 常規開發、程式碼生成、文件更新等日常任務 |
| `haiku` | 簡單查詢、格式化、分類等輕量任務（如 git-commit） |
| `inherit` | 預設值，跟隨主對話模型 |

### 審查 Agent 的 mcpServers（非 plugin 場景）

- 如果 MCP server 已在全域 `.mcp.json` 設定，agent 中的 `mcpServers` 宣告可能多餘
- 但某些 agent 明確需要特定 MCP（如 `serena` 用於程式碼分析），此時宣告合理
- 對照全域 `.mcp.json` 與 agent 的 `mcpServers`，檢查是否不必要的重複

### Plugin 場景下三欄位被忽略（zenbu-powers 適用）

- Plugin 載入路徑下，agent frontmatter 的 `hooks` / `mcpServers` / `permissionMode` **會被忽略**
- 上述設定在 plugin agent 上等於死碼，應：
  1. 移除（若不需要）
  2. 改放專案級設定（`settings.json` / `.mcp.json`）
  3. 留在原處作為「給 user 自行 install 為 project agent 時的備用」——但須在 agent body 中註記

### Hub-spoke Skill 模式

- 主 SKILL.md 用 Read 載入 `references/v15/REFERENCE.md` 等子檔（如 nextjs / react-router / refine / tailwindcss / tanstack-query）
- 子檔不命名為 `SKILL.md` 避免與真 skill 入口混淆；本專案統一採用 `references/<topic>/REFERENCE.md` 或 `references/<topic>.md`
- 子檔不需 frontmatter，或 frontmatter 違規不算問題（不會被 loader 解析）

### Skill 引用一致性

- agent 的 `skills:` 欄位每一項都應對應實際存在的 skill
- plugin context 下引用需用 `<plugin-name>:<skill-name>` 完整形式（如 `zenbu-powers:react-master`）
- skill 改名 / 刪除時必須全域掃描所有 agent 與 commands 的引用點同步更新

### CLAUDE.md vs Rules 的分工

- **CLAUDE.md**：全專案通用的資訊（建構指令、架構概述、程式碼風格）
- **Rules**：針對特定檔案類型的規則（透過 `globs` 限定適用範圍）
- 如果 CLAUDE.md 中有只適用於特定檔案類型的規則，建議遷移到 `.claude/rules/`
