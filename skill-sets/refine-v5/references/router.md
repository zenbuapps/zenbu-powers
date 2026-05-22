# Refine v5 — Router Provider & Routing API Reference

> 套件：`@refinedev/core`、`@refinedev/react-router`、`@refinedev/nextjs-router`、`@refinedev/remix-router`
> 來源：https://refine.dev/core/docs/routing/

Refine 透過 `routerProvider` 與 router library 通訊：從路由 infer resource、傳遞/解析/同步 query 參數、處理導航。`routerProvider` 為**選用**但強烈建議使用。

> ⚠️ v5：型別 `RouterBindings` 改名為 `RouterProvider`。`legacyRouterProvider` 已**完全移除**。React Router 整合套件 `@refinedev/react-router-v6` 改名為 `@refinedev/react-router`，且 `react-router-dom` 被 `react-router`（v7）取代。

## 目錄

- [RouterProvider 介面](#routerprovider-介面)
- [Router 整合套件](#router-整合套件)
- [Routing Hooks](#routing-hooks)
- [`<Link>` 元件](#link-元件)
- [React Router v6 → v7 遷移](#react-router-v6--v7-遷移)

---

## RouterProvider 介面

```ts
const routerProvider: {
  go?: () => (config: {
    to?: string;
    query?: Record<string, unknown>;
    hash?: string;
    options?: { keepQuery?: boolean; keepHash?: boolean };
    type?: "push" | "replace" | "path";
  }) => void | string;
  back?: () => () => void;
  parse?: () => () => {
    resource?: IResourceItem;
    id?: BaseKey;
    action?: Action;
    pathname?: string;
    params?: {
      filters?: CrudFilters;
      sorters?: CrudSorting;
      currentPage?: number;
      pageSize?: number;
      [key: string]: any;
    };
  };
  Link?: React.ComponentType<{ to: string; children?: React.ReactNode }>;
};
```

- `go`：導航。`type` 為 `"path"` 時回傳路徑字串（不改 history）；`"push"`/`"replace"` 執行導航。
- `back`：回上一頁。
- `parse`：解析當前路徑，回傳 resource / id / action / pathname / params。
- `Link`：建立連結，僅供 Refine 內部與 UI 套件使用。

---

## Router 整合套件

```tsx
// React Router v7
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter } from "react-router";

const App = () => (
  <BrowserRouter>
    <Refine routerProvider={routerProvider}>{/* ... */}</Refine>
  </BrowserRouter>
);
```

| 套件 | router library |
|------|----------------|
| `@refinedev/react-router` | React Router v7（`react-router`） |
| `@refinedev/nextjs-router` | Next.js（App Router 與 Pages Router） |
| `@refinedev/remix-router` | Remix |

各整合套件還匯出：`NavigateToResource`（導向 resource 的預設頁）、`UnsavedChangesNotifier`（未儲存變更提醒）、`DocumentTitleHandler`（自動設定頁面標題）。

```tsx
import routerProvider, {
  NavigateToResource, UnsavedChangesNotifier, DocumentTitleHandler,
} from "@refinedev/react-router";

<Refine routerProvider={routerProvider} options={{ warnWhenUnsavedChanges: true }}>
  <Routes>{/* ... */}</Routes>
  <UnsavedChangesNotifier />   {/* 放在 <Refine> 內 */}
  <DocumentTitleHandler />
</Refine>
```

---

## Routing Hooks

全部來自 `@refinedev/core`。

### useGo（推薦的導航 hook）

```tsx
import { useGo } from "@refinedev/core";

const go = useGo();

// 以路徑導航
go({
  to: "/posts",
  query: { filters: [{ field: "title", operator: "contains", value: "Refine" }] },
  hash: "#section",
  options: { keepQuery: true, keepHash: false },
  type: "push", // "push" | "replace" | "path"
});

// 以 resource 導航（routerProvider 會轉成路徑）
go({
  to: { resource: "posts", action: "edit", id: "1" },
  type: "push",
});
```

`to`（resource 物件型別）：

```ts
type ToWithResource = {
  resource: string;                              // resource 名稱或 identifier
  action: "list" | "create" | "edit" | "show" | "clone";
  id?: BaseKey;                                  // action 為 edit/show/clone 時必填
  meta?: Record<string, unknown>;                // 路徑有額外參數時用
};
```

- `type: "path"` 回傳路徑字串（不改 history），可用於 link/redirect。
- `to` 留空 → 導航至當前路徑（用於更新 query 參數）。

### useBack

```tsx
import { useBack } from "@refinedev/core";
const back = useBack();
<Button onClick={() => back()}>Go Back</Button>
```

### useParsed

解析當前 URL，取得 resource / action / id / pathname / params。

```tsx
import { useParsed } from "@refinedev/core";

const {
  resource, action, id, pathname,
  params: { filters, sorters, currentPage, pageSize, ...restParams },
} = useParsed<MyParams>();
```

- `resource` / `action`：由當前路由與 `<Refine>` 的 resource 定義 match，無 match 為 `undefined`。
- `id`：URL 中的 id 參數。
- `params`：包含 URL 參數 + query 參數；`filters`/`sorters`/`currentPage`/`pageSize` 用於 useTable 的 `syncWithLocation`。

### useResourceParams

> v5 取代 v4 的 `useResource`。存取當前 resource 的 `resource`/`id`/`action`，並提供 `formAction` 與 `setId`。

```tsx
import { useResourceParams } from "@refinedev/core";

const {
  id, setId,         // 記錄 id 與設定函式
  resource,          // IResourceItem
  identifier,        // resource 的 identifier 或 name
  action,            // "list"|"create"|"edit"|"show"|"clone"，可從路由 infer
  formAction,        // "create"|"edit"|"clone"（非表單 action 時 fallback 為 "create"）
  resources,         // <Refine> 定義的所有 resource
  select,            // (name, force?) => { resource, identifier }
} = useResourceParams({
  id,        // 顯式設定，否則從路由 infer
  action,    // 顯式設定，否則從路由 infer
  resource,  // 顯式設定，否則從路由 infer
});
```

`id` 從路由 infer 的條件：無顯式 `resource`，或顯式 `resource` 與當前路由相符（避免從不同 resource 誤推）。

### useGetToPath

回傳一個函式，依 resource + action + meta 組出 URL。

```tsx
import { useGetToPath, useGo } from "@refinedev/core";

// resource `posts` 的 edit action 路徑為 /:authorId/posts/:id/edit
const getToPath = useGetToPath();
const go = useGo();

go({
  to: getToPath({
    resource: { name: "posts" },
    action: "edit",
    meta: { id: 1, authorId: 2 }, // 額外參數
  }),
});
```

### useNavigation（legacy，不推薦）

> legacy hook（未 deprecated 但不建議）。自訂導航請用 router library 的 hook；resource/action 導航請用 `useGo` + `useGetToPath`。

```tsx
import { useNavigation } from "@refinedev/core";

const { list, create, edit, show, clone,
        listUrl, createUrl, editUrl, showUrl, cloneUrl } = useNavigation();

list("posts");           // → /posts
create("posts");         // → /posts/create
edit("posts", "1");      // → /posts/edit/1
show("posts", "1");      // → /posts/show/1
clone("posts", "1");     // → /posts/clone/1
const url = editUrl("posts", "1"); // 回傳 URL 字串

// 導航方法可帶 type: "push"|"replace" 與 meta 參數
```

---

## `<Link>` 元件

導航元件，底層用 `routerProvider.Link`；無 routerProvider 時降級為 `<a>`。

```tsx
import { Link } from "@refinedev/core";

// 簡單用法
<Link to="/posts">Posts</Link>

// 進階：用 go prop（接受 useGo.go 的所有參數）
<Link
  go={{
    to: { resource: "posts", action: "list" },
    query: {
      // syncWithLocation 為 true 時，useTable/useDataGrid 自動套用這些 filter
      filters: [{ operator: "eq", value: "published", field: "status" }],
    },
  }}
>
  Published Posts
</Link>
```

- `to`：導航的 URL。提供 `to` 時 `go` 會被忽略。
- `go`：用 `useGo` 組 URL，需 routerProvider。
- 接受 `routerProvider.Link` 與 `<a>` 的所有 props。

型別支援（用 generic 取得特定 router library 的 props 型別）：

```tsx
import type { LinkProps } from "react-router";
import { Link } from "@refinedev/core";

<Link<Omit<LinkProps, "to">>
  replace={true}
  preventScrollReset={true}
  go={{ to: { resource: "posts", action: "list" } }}
>
  Posts
</Link>
```

---

## React Router v6 → v7 遷移

> Refine 本身除套件改名外無 breaking change。詳見 React Router v7 官方遷移指南。

套件改名：`@refinedev/react-router-v6` → `@refinedev/react-router`；`react-router-dom` 被 `react-router` v7 取代。

```bash
npm uninstall @refinedev/react-router-v6 react-router-dom react-router
npm install @refinedev/react-router react-router
```

```diff
- "@refinedev/react-router-v6": "^4.6.0"
+ "@refinedev/react-router": "^1.0.1"   # v5 生態下為 ^2.x
- "react-router-dom": "^6.8.1"
- "react-router": "^6.8.1"
+ "react-router": "^7.0.2"
```

import 改變（所有元件改從 `react-router` 匯入）：

```diff
  import routerProvider, { NavigateToResource, UnsavedChangesNotifier, DocumentTitleHandler }
- from "@refinedev/react-router-v6";
+ from "@refinedev/react-router";

- import { RouterProvider } from "react-router-dom";
+ import { RouterProvider } from "react-router";
```

codemod 自動更新 import：

```bash
npx @refinedev/codemod@latest refine-react-router-v6-to-refine-react-router
npx @refinedev/codemod@latest react-router-dom-to-react-router
```
