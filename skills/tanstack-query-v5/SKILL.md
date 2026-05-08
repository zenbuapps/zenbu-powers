---
name: tanstack-query-v5
description: >
  [DEPRECATED] 已合併至 zenbu-powers:tanstack-query。
  本 skill 不再維護。請改用：
    - 主 skill：zenbu-powers:tanstack-query
    - v5 專屬內容：references/v5/SKILL.md（含 api-reference / best-practices / examples / migration-v4-to-v5）
deprecated: true
---

# [DEPRECATED] tanstack-query-v5

> 本 skill 已於 2026-05 合併到統一的 `zenbu-powers:tanstack-query`（版本路由 hub）。

## 遷移指引

舊引用路徑：

    zenbu-powers:tanstack-query-v5

新引用方式：

1. 主 skill：`zenbu-powers:tanstack-query`（hub 會自動依 package.json 路由到 v5 reference）
2. v5 主體：`references/v5/SKILL.md`
3. v5 詳細子檔：
   - `references/v5/api-reference.md`
   - `references/v5/best-practices.md`
   - `references/v5/examples.md`
   - `references/v5/migration-v4-to-v5.md`

詳見新主 skill 的 Hand-off 段。

## 何時刪除此 stub

3 個版本後（或 6 個月後）若 grep 全工作目錄無 `tanstack-query-v5` 命中，可移除整個 skill 目錄（含 `references/`）。
