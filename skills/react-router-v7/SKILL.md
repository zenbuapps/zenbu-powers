---
name: react-router-v7
description: >
  [DEPRECATED] 已合併至 zenbu-powers:react-router。
  本 skill 不再維護。請改用：
    - 主 skill：zenbu-powers:react-router
    - v7 完整 API：references/v7/SKILL.md
    - v7 子檔：api-components.md / api-hooks.md / api-router-config.md /
      examples.md / migration-v6-to-v7.md
deprecated: true
---

# [DEPRECATED] react-router-v7

> 本 skill 已於 2026-05 合併到統一的 `zenbu-powers:react-router`。

## 遷移指引

舊引用路徑：

    zenbu-powers:react-router-v7

新引用方式：

1. 主 skill：`zenbu-powers:react-router`（先 Read package.json，由主 skill 路由 v6/v7）
2. v7 主檔：`references/v7/SKILL.md`
3. v7 子檔（按需 Read）：
   - `references/v7/api-components.md` — Link / NavLink / Form / Outlet / Await 等元件 Props
   - `references/v7/api-hooks.md` — 所有 Hook 完整 TypeScript 簽名
   - `references/v7/api-router-config.md` — createBrowserRouter / RouteObject 完整屬性
   - `references/v7/examples.md` — 整合範例
   - `references/v7/migration-v6-to-v7.md` — v6 → v7 遷移步驟

關鍵辨識：v7 對應的 npm 套件為 `react-router`（**無** `-dom` 後綴），
DOM 相關（如 `RouterProvider`）從 `react-router/dom` 匯入。
若 package.json 中是 `react-router-dom` 且 pin `^6.x`，請改走 v6 reference。

## 何時刪除此 stub

3 個版本後（或 6 個月後）若 grep 全工作目錄無 `react-router-v7` 命中，可移除整個 skill 目錄（含舊 references/）。
