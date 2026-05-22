# Refine v5 — `<Refine>` Component API Reference

> 套件：`@refinedev/core` ｜ 來源：https://refine.dev/core/docs/core/refine-component/

`<Refine>` 是 Refine app 的入口，掛載所有 provider 與 `resources`，是最高層級的設定點。

## 目錄

- [基本用法](#基本用法)
- [Provider props](#provider-props)
- [resources](#resources)
- [options 設定](#options-設定)

---

## 基本用法

```tsx
import { Refine } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Routes, Route } from "react-router";

const App = () => (
  <BrowserRouter>
    <Refine
      dataProvider={dataProvider("https://api.example.com")}
      routerProvider={routerProvider}
      authProvider={authProvider}
      resources={[
        {
          name: "posts",
          list: "/posts",
          create: "/posts/create",
          edit: "/posts/edit/:id",
          show: "/posts/show/:id",
          meta: { label: "Blog Posts", canDelete: true },
        },
      ]}
      options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
    >
      <Routes>{/* 路由由 router library 定義 */}</Routes>
    </Refine>
  </BrowserRouter>
);
```

## Provider props

| Prop | 型別 | 必填 | 說明 |
|------|------|------|------|
| `dataProvider` | `DataProvider | DataProviders` | ﹡ | 與 API 通訊。多個時傳物件，需有 `default` key |
| `routerProvider` | `RouterProvider` | — | 路由整合（推薦）。`@refinedev/react-router` / `@refinedev/nextjs-router` / `@refinedev/remix-router` |
| `authProvider` | `AuthProvider` | — | 認證邏輯（login/logout/check 等） |
| `liveProvider` | `LiveProvider` | — | 即時 / Realtime 支援 |
| `notificationProvider` | `NotificationProvider | (() => NotificationProvider)` | — | 通知邏輯 |
| `accessControlProvider` | `AccessControlProvider` | — | 權限控制 |
| `auditLogProvider` | `AuditLogProvider` | — | 資料變更追蹤 |
| `i18nProvider` | `i18nProvider` | — | 國際化支援 |
| `resources` | `ResourceProps[]` | — | 資源定義（非必填，但用於路由偵測與建立） |
| `onLiveEvent` | `(event: LiveEvent) => void` | — | 處理所有 live event 的全域回呼 |
| `options` | `IRefineOptions` | — | app 設定 |

多 data provider 範例：

```tsx
<Refine
  dataProvider={{
    default: defaultDataProvider,   // `default` key 必須定義
    example: exampleDataProvider,
  }}
/>
```

> **Legacy router**：v4 之前 `routerProvider` 是必填且介面不同。v5 中 `routerProvider` 為選用。`legacyRouterProvider` / `legacyAuthProvider` 在 v5 已**完全移除**。

## resources

`resources` 是 Refine app 的主要建構塊。每個 resource 代表 API 的一個實體，當作 API 資料與 app 頁面之間的橋樑。

```tsx
resources={[
  {
    name: "posts",                    // ﹡ 識別 API 中的資源（決定 endpoint）
    identifier: "featured-posts",     // 主要 matching key，用來區分同名 resource
    list: "/posts",                   // list action 路由
    create: "/posts/create",          // create action 路由
    edit: "/posts/edit/:id",          // edit action 路由（可加額外參數如 /:authorId/posts/:id）
    show: "/posts/show/:id",          // show action 路由
    meta: {
      label: "Blog Posts",            // menu 顯示名稱（預設為 resource name 複數）
      icon: <PostIcon />,             // menu 圖示
      canDelete: true,                // CRUD view 是否顯示 delete button
      parent: "categories",           // 巢狀於另一個 resource（用於 useMenu / useBreadcrumb）
      dataProviderName: "typicode",   // 此 resource 專用的 data provider
      hide: true,                     // 在 Sider 隱藏（也會被 useMenu 過濾掉）
      audit: ["list", "create"],      // audit log 權限
    },
  },
]}
```

### Resource 欄位

| 欄位 | 型別 | 說明 |
|------|------|------|
| `name` ﹡ | `string` | 識別 API 資源的字串，決定 endpoint（如 `/posts`、`/posts/1`） |
| `identifier` | `string` | 主要 matching key，用來區分多個同名但不同 `meta` 的 resource |
| `list` / `create` / `edit` / `show` | `string`（v5）| 對應 action 的路由路徑。**v5 只能是字串**，不可再放 React component |
| `meta` | `ResourceMeta` | 額外資訊。**v5 從 `options` 改名為 `meta`**，`canDelete` 也移入 meta |

> ⚠️ **v5 breaking change**：v4 可在 `list` 等放 React component，v5 不再支援。路由/元件必須定義在 router library 裡。`list.path` 也移除。同名 resource 用 `identifier` 區分。

取得目前 resource：用 `useResourceParams` hook（v5；v4 的 `useResource` 已移除）。

## options 設定

`options` prop（型別 `IRefineOptions`）用來設定整個 app：

```tsx
options={{
  syncWithLocation: true,
  warnWhenUnsavedChanges: true,
  mutationMode: "optimistic",
  undoableTimeout: 3500,
  liveMode: "auto",
  disableServerSideValidation: false,
  disableTelemetry: false,
  disableRouteChangeHandler: false,
  useNewQueryKeys: true,
  redirect: { afterCreate: "show", afterClone: "edit", afterEdit: false },
  reactQuery: {
    clientConfig: { defaultOptions: { queries: { staleTime: Infinity } } },
  },
  textTransformers: {
    humanize: (text) => text,
    plural: (text) => text,
    singular: (text) => text,
  },
  title: { icon: <CustomIcon />, text: "Custom App Name" },
  breadcrumb: <CustomBreadcrumb />,   // 或 false 停用
  overtime: { enabled: true, interval: 1000, onInterval: (ms, ctx) => {} },
}}
```

| Option | 型別 | 說明 | 預設 |
|--------|------|------|------|
| `syncWithLocation` | `boolean` | 列表頁狀態（分頁/排序/篩選）同步至 URL query | `false` |
| `warnWhenUnsavedChanges` | `boolean` | 有未儲存變更時離開頁面顯示確認（需 `<UnsavedChangesNotifier />`） | `false` |
| `mutationMode` | `"pessimistic"|"optimistic"|"undoable"` | 全域變更模式（useUpdate/useDelete） | `"pessimistic"` |
| `undoableTimeout` | `number` | undoable 模式倒數毫秒（hook 層可覆寫） | `5000` |
| `liveMode` | `"auto"|"manual"|"off"` | 全域即時更新模式 | `"off"` |
| `disableServerSideValidation` | `boolean` | 停用「dataProvider 回傳 `errors` 時 useForm 自動設 field 錯誤」的行為 | `false` |
| `disableTelemetry` | `boolean` | 停用使用統計遙測 | `false` |
| `disableRouteChangeHandler` | `boolean` | 停用 route change 的 side effect（auth check 與 redirect） | `false` |
| `useNewQueryKeys` | `boolean` | 改用 v4.35+ 的新結構化 query/mutation keys（未來預設） | `false` |
| `redirect` | `{ afterCreate, afterClone, afterEdit }` | 各 form action 成功後的跳轉行為（值為 `"show"|"edit"|"list"|false`） | 皆 `"list"` |
| `reactQuery.clientConfig` | `QueryClientConfig | QueryClient` | TanStack Query client 設定，或直接傳自己的 `QueryClient` | `refetchOnWindowFocus: false`、`keepPreviousData: true` |
| `textTransformers` | `{ humanize, plural, singular }` | 客製化 UI 上 resource 名稱的轉換函式 | humanize-string / pluralize |
| `title` | `{ icon?: ReactNode, text?: ReactNode }` | 全域 app 標題（layout 與 auth 元件用） | Refine logo / "Refine Project" |
| `breadcrumb` | `ReactNode | false` | 客製化或停用 breadcrumb | 各 UI 套件的 `<Breadcrumb />` |
| `overtime` | `{ enabled, interval, onInterval }` | loading overtime 偵測（請求過久時的回呼） | `enabled: false`, `interval: 1000` |

`overtime.onInterval` 回呼接收 `(elapsedInterval: number, context: { resource?, resourceName?, id?, action? })`。
