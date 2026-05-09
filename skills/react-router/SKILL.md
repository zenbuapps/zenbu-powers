---
name: react-router
description: >
  React Router 完整 API 參考。**版本路由先**：開工前 Read package.json 判斷——
  pin `react-router-dom` ^6.x 載入 references/v6/REFERENCE.md；
  pin `react-router` ^7.x 載入 references/v7/REFERENCE.md（注意：v7 套件名變了，
  不是 react-router-dom）。
  涵蓋兩版本所有核心 API：createBrowserRouter / RouterProvider /
  HashRouter / BrowserRouter / Routes / Route / Outlet / useNavigate /
  useParams / useSearchParams / useLocation / useLoaderData / useActionData /
  useNavigation / useFetcher / useMatches / useRouteError / useOutletContext /
  Link / NavLink / Form / Await / ScrollRestoration / Navigate /
  isRouteErrorResponse / loader / action / errorElement / ErrorBoundary /
  HydrateFallback / lazy route / layout route / deferred data 等。
  ⚠️ 多個 hook 名稱（useNavigate / useParams / Link / useLocation 等）v6/v7 共用，
  但底層行為與 import 來源不同——不可單憑 hook 名稱觸發本 skill，
  必須先確認專案版本。v6 與 v7 的套件名、import 路徑、API 細節有 breaking changes，
  snippets 無法跨版互通。
---

# React Router

> **本 skill 是版本無關的入口**。從 package.json 判斷專案使用的 React Router 主版本，再載入對應 reference。

---

## 版本路由（必讀）

1. **Read package.json**（cwd 最近的優先；monorepo 多 package.json 時，先試 cwd 最近的，再試 git root）。
2. 比對 `dependencies` / `devDependencies`：
   - 含 **`react-router-dom`** pin `^6.x`（或 `~6.x` / `6.x.x`）→ Read `references/v6/REFERENCE.md`（單檔含 v6 完整 API + cheatsheet；如需深入遷移細節再 Read `references/v6/v6-to-v7-migration.md`）
   - 含 **`react-router`** pin `^7.x`（或 `~7.x` / `7.x.x`）→ Read `references/v7/REFERENCE.md` 主檔；按需要再 Read 5 份子檔（`api-components.md` / `api-hooks.md` / `api-router-config.md` / `examples.md` / `migration-v6-to-v7.md`）
   - **注意 v7 套件名變了**：v6 是 `react-router-dom`（含 `-dom` 後綴），v7 改回 `react-router`（無後綴）。光看 `react-router-dom` 必為 v6；光看 `react-router` 多半為 v7。
3. **輔助訊號**（pin 不明時參考）：
   - 程式碼 `import { ... } from "react-router-dom"` → v6
   - 程式碼 `import { RouterProvider } from "react-router/dom"` 或 `from "react-router"` → v7
   - 使用 `json()` / `defer()` helper 包裝 loader 回傳 → 多半 v6（v7 已棄用兩者）
   - `navigation.formMethod === "post"`（小寫）→ v6；`=== "POST"`（大寫）→ v7
4. **找不到 / 同時存在兩版本** → 詢問用戶，不要猜。

---

## 共用設計理念（version-agnostic）

以下概念跨 v6 / v7 共用，不依賴特定版本：

- **Two routing styles**：兩版本都同時支援「Declarative」（`<BrowserRouter>` + `<Routes>` + `<Route>`，無 data API）與「Data Mode」（`createBrowserRouter` + `<RouterProvider>`，解鎖 loader / action / errorElement）。一個 app 內擇一，不要混用。
- **Route 樹**：路由為樹狀結構，子路由透過 `<Outlet />` 渲染進父 layout 的對應位置。
- **Loader / Action 模式**：data router 透過 `loader` 提前抓資料、`action` 處理表單提交，元件用 `useLoaderData` / `useActionData` 讀回；錯誤丟到最近的 `errorElement` / `ErrorBoundary`。
- **Hooks 命名重疊**：`useNavigate`、`useParams`、`useLocation`、`useSearchParams`、`useOutletContext`、`useRouteError` 等在兩版本中名稱相同；但 **import 路徑不同**，且部分行為（formMethod 大小寫、splat 路徑解析等）有變化。
- **Link / NavLink**：宣告式導航元件，命名與基本 props 一致；NavLink 自動套 `aria-current="page"`。
- **`isRouteErrorResponse(error)`**：兩版本都用此 type guard 區分 thrown `Response` 與隨機 `Error`，配合 `errorElement` / `ErrorBoundary` 使用。

---

## 重大版本差異（觸發路由的關鍵 anchor）

| 維度 | v6 | v7 |
|---|---|---|
| 套件名稱 | `react-router-dom` | `react-router`（DOM 元件從 `react-router/dom` 匯入） |
| 主要 import | `from "react-router-dom"` | `from "react-router"` / `from "react-router/dom"` |
| `json()` helper | 可用（推薦給需要狀態碼的 thrown response） | 已棄用 / 移除 |
| `defer()` helper | 可用 | 已棄用，loader 直接回傳含 Promise 的物件 |
| `formMethod` 大小寫 | 小寫 `"post"` / `"get"`（除非開啟 `v7_normalizeFormMethod`） | 大寫 `"POST"` / `"GET"` |
| Multi-segment splat | `path="dashboard/*"` 可一次寫到底 | 必拆：父 `"dashboard"` + 子 `"*"` |
| SSR fallback | `<RouterProvider fallbackElement={...} />` | 每路由 `HydrateFallback` / `hydrateFallbackElement` |
| Future flags | 多個 `v7_*` 旗標供漸進切換 | 全部已成預設行為，無需旗標 |
| Node baseline | 18+ | 20+ |

詳細 API 與遷移步驟：見 `references/v6/REFERENCE.md`、`references/v7/REFERENCE.md` 與其 `migration-v6-to-v7.md`。

---

## Hand-off / Next Agent

- 本 skill 為 **Phase 2 第 2 對 hub 合併交付物**之一，路徑 `skills/react-router/`。
- 同步交付：`references/v6/REFERENCE.md` + `references/v6/v6-to-v7-migration.md`；`references/v7/REFERENCE.md` + 5 份子檔（`api-components.md` / `api-hooks.md` / `api-router-config.md` / `examples.md` / `migration-v6-to-v7.md`）。
- 本階段**未修改**任何下游引用（agent / README / 其他 skill 等）。
- 舊 `skills/react-router-v6/` 與 `skills/react-router-v7/` 已 stub 化（`deprecated: true`），舊 references/ 目錄保留原樣，不刪除。
- **交還 orchestrator**：等所有 5 對 hub 合併完成後一起進 Stage C（下游引用切換）。
