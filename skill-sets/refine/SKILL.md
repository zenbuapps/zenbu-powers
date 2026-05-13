---
name: refine
description: >
  Refine.dev 完整 API 參考。**版本路由先**：開工前 Read package.json 判斷
  @refinedev/core pin 的 major 版本——pin ^4.x 載入 references/v4/REFERENCE.md；
  pin ^5.x 載入 references/v5/REFERENCE.md。
  ⚠️ resource / dataProvider / authProvider 等核心 API v4/v5 演進差異大，
  不可單憑名稱觸發，必須先確認版本。
  本 skill 額外提供專案級 rule（refine-vX.rule.md）安裝腳本，見 scripts/。
---

# Refine — React CRUD Meta-Framework Hub

> **版本路由先**：使用前先 Read 專案 `package.json`，依 `@refinedev/core` major 版本載入對應 reference。

## 版本判斷

| pin 範圍 | 載入 | 對應週邊 |
|---|---|---|
| `@refinedev/core ^4.x` | `references/v4/REFERENCE.md` | antd ^5、react-router ^1、TanStack Query v4 |
| `@refinedev/core ^5.x` | `references/v5/REFERENCE.md` | antd ^6、react-router ^2、TanStack Query v5 |

⚠️ `useList` / `useForm` / `useTable` / `dataProvider` / `authProvider` 等 API 名稱 v4/v5 共用，但回傳結構與參數命名差異大（v4 `{ data }` / `metaData` / `sort`；v5 `{ result }` / `meta` / `sorters`）——禁止單憑 hook 名觸發本 skill。

完整 v4↔v5 差異與遷移細節：`references/v5/migration-v4-to-v5.md`。

## 專案規則安裝腳本

依偵測版本執行對應 script，將 Refine 開發規範寫入 `.claude/rules/`：

```bash
# v4 專案
bash ~/.claude/skills/refine/scripts/install-v4-rule.sh /path/to/project
# v5 專案
bash ~/.claude/skills/refine/scripts/install-v5-rule.sh /path/to/project
```

安裝目標檔名 `refine-v4.rule.md` / `refine-v5.rule.md` 維持不變（已部署契約）。

## Hand-off / Next Agent

- 本 skill 為 Phase 2 React 跨版本合一交付物，路徑 `skills/refine/`
- v4 / v5 references / rule.md / scripts 已搬遷完成；下游引用已切至此 hub
- `skills/refine-v4/`、`skills/refine-v5/` 已 stub 化
