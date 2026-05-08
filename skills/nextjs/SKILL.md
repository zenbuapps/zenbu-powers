---
name: nextjs
description: >
  Next.js 完整 API 參考。**版本路由先**：開工前 Read package.json 判斷
  next pin 的 major 版本——pin ^15.x 載入 references/v15/SKILL.md；
  pin ^16.x 載入 references/v16/SKILL.md。
  涵蓋 App Router file conventions、Server / Client Components、Data Fetching、
  Server Actions、Route Handlers、Middleware（v15）/ proxy.ts（v16）、Caching &
  Revalidation、Cache Components（"use cache"）、Metadata API、Image、ISR、
  React 19 / 19.2 整合等所有 API。
  ⚠️ App Router、useRouter、metadata 等 API v15/v16 演進差異大（async request
  APIs 是否強制、middleware → proxy、cacheComponents、Turbopack 預設等），
  不可單憑名稱觸發本 skill，必須先確認版本。v15 與 v16 行為不相容，
  snippets 無法跨版互通。
---

# Next.js

> **本 skill 是版本無關的入口**。從 package.json 判斷專案使用的 Next.js 主版本，再載入對應 reference。

---

## 版本路由（必讀）

1. **Read package.json**（cwd 最近的優先；monorepo 多 package.json 時，先試 cwd 最近的，再試 git root）。
2. 比對 `dependencies` / `devDependencies` 中 `next` pin 的 major 版本：
   - **`^15.x`**（或 `~15.x` / `15.x.x`）→ Read `references/v15/SKILL.md`
   - **`^16.x`**（或 `~16.x` / `16.x.x`）→ Read `references/v16/SKILL.md`
3. **輔助訊號**（pin 不明時參考）：
   - 存在 `middleware.ts` 且使用 `experimental.ppr` / `experimental.dynamicIO` → 多半 v15
   - 存在 `proxy.ts` 或 `cacheComponents: true` 設定 → v16
   - `next.config.mjs` + webpack config 為主 → 多半 v15
   - `next.config.ts` + Turbopack 為預設 → 多半 v16
   - 同步存取 `cookies()` / `headers()` / `params` 的程式碼 → v15（v16 強制 async）
4. **找不到 / 同時存在兩版本** → 詢問用戶，不要猜。

---

## 共用設計理念（version-agnostic）

以下概念跨 v15 / v16 共用，不依賴特定版本：

- **App Router 為主**：`app/` 目錄下的 file conventions（`layout.tsx`、`page.tsx`、`loading.tsx`、`error.tsx`、`not-found.tsx`、`route.ts`）。
- **Server Components by default**：所有元件預設在 Server 執行；`'use client'` 標註 serialization 邊界，應盡量「下沉」至互動葉節點。
- **Server Actions**：`'use server'` 函數可被 `<form action>` 或 Client Component 的事件呼叫，需在每個 action 內驗證 auth/authz。
- **Route Handlers**：`route.ts` 提供 `GET` / `POST` 等 HTTP method export，與 `page.tsx` 在同層級互斥。
- **Metadata API**：`metadata` export 與 `generateMetadata` 同步演進；OG / Twitter image 透過 file convention（`opengraph-image.tsx`）。
- **next/image / next/link / next/font**：跨版本維持核心 API，僅預設值與最佳化策略微調。
- **React 19 整合**：`use()` hook、`useActionState`、async Server Components 為兩版本共用基石。

---

## 重大版本差異（觸發路由的關鍵 anchor）

| 維度 | v15 | v16 |
|---|---|---|
| Request APIs | `cookies()` / `headers()` / `params` 已轉 async（仍提供同步 fallback warning） | 完全移除同步存取，只能 `await` |
| Middleware | `middleware.ts` + Edge runtime | `proxy.ts`（Node.js only，Edge 不支援） |
| Caching 模型 | 隱式 caching；fetch 預設不 cache（v14 → v15 變更） | `cacheComponents: true` opt-in；所有 data 預設 dynamic，靠 `"use cache"` opt in |
| `"use cache"` | 實驗性（`experimental.dynamicIO`） | 正式 API（`cacheLife` / `cacheTag` / `updateTag`） |
| `revalidateTag` | `revalidateTag('tag')`（單參數） | `revalidateTag('tag', 'profile')`（必須 profile） |
| Bundler | webpack 為預設，Turbopack 透過 flag | Turbopack 預設，webpack 需 `--webpack` opt out |
| Config 檔 | `next.config.mjs` 為主 | `next.config.ts` 為主 |
| Parallel routes `default.js` | 可選 | **必填**，否則 build 失敗 |
| PPR | `experimental.ppr` + `experimental_ppr` route export | 自動隨 `cacheComponents` 啟用，舊 flag 移除 |
| React 版本 | React 19 | React 19.2（含 React Compiler、`<Activity>`） |
| `next lint` | 內建 | 移除，改用 ESLint CLI |

詳細 API 與 v15 ↔ v16 完整對照：見 `references/v15/SKILL.md` 與 `references/v16/SKILL.md`（v16 另含 `migration-from-v15.md` 與 `cache-components-migration.md`）。

---

## Hand-off / Next Agent

- 本 skill 為 **Phase 2 第 4 對 hub 合併交付物**之一，路徑 `skills/nextjs/`。
- 同步交付：`references/v15/SKILL.md` + 5 份子 references（`advanced-routing` / `api-functions` / `cache-components` / `image-and-metadata` / `routing-and-config`），`references/v16/SKILL.md` + 7 份子 references（`advanced-routing` / `api-functions` / `cache-components-migration` / `image-and-metadata` / `migration-from-v15` / `proxy-and-config` / `react-and-tooling`）。
- 本階段**未修改**任何下游引用（README.md、agent.md 等）。
- 舊 `skills/nextjs-v15/` 與 `skills/nextjs-v16/` 已 stub 化（`deprecated: true`），references/ 目錄保留原樣供過渡期回查。
- **交還 orchestrator**：等所有 hub 合併完成後一起進 Stage C（下游引用切換）。
