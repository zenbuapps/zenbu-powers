---
name: knowledge-sources
description: >
  Claude Code 審查員的知識來源設定：以本 skill 內建的 reference 為主要依據，
  WebFetch 官方文件為補強來源。所有審查意見都必須有出處。
---

# 知識來源（依優先順序）

## 1. 內建 Reference（主要來源）

本 skill 的 `references/` 目錄已內建 9 大領域的審查重點清單與官方規範依據：

| Reference 檔案 | 涵蓋範圍 |
|---------------|---------|
| `references/audit-scope.md` | 9 大領域審查重點：CLAUDE.md / Agent / Skill / Settings / Rules / MCP / Hooks / Commands / Plugin Manifest |
| `references/audit-workflow.md` | 完整審查流程、報告格式、嚴重性分級標準 |
| `references/knowledge-sources.md` | 本檔——知識來源優先順序與備援機制 |

**使用方式**：執行 audit 時直接參照 reference 中的審查重點清單，逐項比對用戶設定。
所有判斷依據都來自 reference 內建規範，不依賴外部即時查詢。

## 2. 官方文件網站（補強來源）

當 reference 未涵蓋某項規範、或需要驗證最新官方說法時，使用 WebFetch 查閱官方文件：

| 主題 | URL |
|------|-----|
| 總覽 | `https://docs.anthropic.com/en/docs/claude-code/overview` |
| CLAUDE.md / Memory | `https://docs.anthropic.com/en/docs/claude-code/memory` |
| Sub-agents | `https://docs.anthropic.com/en/docs/claude-code/sub-agents` |
| Custom Skills | `https://docs.anthropic.com/en/docs/claude-code/skills` |
| Settings | `https://docs.anthropic.com/en/docs/claude-code/settings` |
| MCP Servers | `https://docs.anthropic.com/en/docs/claude-code/mcp-servers` |
| Hooks | `https://docs.anthropic.com/en/docs/claude-code/hooks` |
| Security | `https://docs.anthropic.com/en/docs/claude-code/security` |

> **規則**：所有審查意見都必須有出處。優先引用 reference 內建審查重點，必要時補上官方文件 URL，**絕不憑記憶判斷**。

## 錯誤處理

### Reference 未涵蓋此規範

1. **告知用戶**：「此規範未在內建 reference 中，改用官方文件網站驗證」
2. **WebFetch 補強**：依上方表格 URL 查閱對應主題
3. **標注來源**：審查報告中標注「來源：官方網站 {URL}」

### WebFetch 也無法驗證

- 標注「🔵 官方未明確規範」
- 僅給予建議，不列為必須修正項目
- 在報告中明確告知用戶此項目無法驗證的原因
