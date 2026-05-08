---
name: react-router-v6
description: >
  [DEPRECATED] 已合併至 zenbu-powers:react-router。
  本 skill 不再維護。請改用：
    - 主 skill：zenbu-powers:react-router
    - v6 完整 API：references/v6/SKILL.md
    - v6 → v7 遷移細節：references/v6/v6-to-v7-migration.md
deprecated: true
---

# [DEPRECATED] react-router-v6

> 本 skill 已於 2026-05 合併到統一的 `zenbu-powers:react-router`。

## 遷移指引

舊引用路徑：

    zenbu-powers:react-router-v6

新引用方式：

1. 主 skill：`zenbu-powers:react-router`（先 Read package.json，由主 skill 路由 v6/v7）
2. v6 完整 API：`references/v6/SKILL.md`
3. v6 → v7 遷移補充：`references/v6/v6-to-v7-migration.md`

關鍵辨識：v6 對應的 npm 套件為 `react-router-dom`（含 `-dom` 後綴）。
若 package.json 中是 `react-router`（無後綴）且 pin `^7.x`，請改走 v7 reference。

## 何時刪除此 stub

3 個版本後（或 6 個月後）若 grep 全工作目錄無 `react-router-v6` 命中，可移除整個 skill 目錄（含舊 references/）。
