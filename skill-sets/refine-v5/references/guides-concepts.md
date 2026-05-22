# Refine v5 — Guides & Concepts（設計理念）

> 來源：https://refine.dev/core/docs/guides-concepts/
> 此檔說明 Refine 的核心概念與設計理念，供理解整體架構。API 細節見其他 reference。

## 目錄

- [General Concepts](#general-concepts)
- [Data Fetching](#data-fetching)
- [Forms](#forms)
- [Tables](#tables)
- [Routing](#routing)
- [Authentication / Authorization](#authentication--authorization)
- [UI Libraries](#ui-libraries)

---

## General Concepts

Refine 是可擴充的 React framework，用於快速建構 web 應用，採 hook-based 架構 + 可插拔 provider 系統 + 強健的狀態管理。

**Headless 概念**：Refine 不限於一組預先樣式化的元件，而是提供 helper hook / component / provider 的集合。business logic 與 UI 完全解耦 → 可無拘束客製 UI（TailwindCSS、自訂樣式，或 Ant Design / shadcn 整合）。

**Resource 概念**：resource 是核心概念，代表一個資料實體（如 `products`、`blogPosts`、`orders`），把應用各面向綁在一起。透過各 provider 與 UI 整合，把複雜操作抽象成簡單 action。

```tsx
import { Refine } from "@refinedev/core";

<Refine
  resources={[
    {
      name: "products",
      list: "/my-products",
      show: "/my-products/:id",
      edit: "/my-products/:id/edit",
      create: "/my-products/new",
    },
  ]}
/>
```

**Provider 概念**：provider 是 Refine 的建構塊，管理應用不同面向 — `dataProvider`（API 通訊）、`authProvider`、`routerProvider`、`notificationProvider`、`liveProvider`、`accessControlProvider`、`auditLogProvider`、`i18nProvider`。

---

## Data Fetching

Refine 需要 `dataProvider`（實作 `DataProvider` 介面的函式）與 API 通訊。提供 data provider 後，可用 data hooks（`useOne`、`useList`、`useUpdate` 等）管理來自 REST / GraphQL / RPC / SOAP 的資料。支援多個 data provider。

CRUD data hook 與 dataProvider 方法對應：

| Hook | 方法 |
|------|------|
| `useOne` | `getOne` |
| `useUpdate` | `update` |
| `useCreate` | `create` |
| `useDelete` | `deleteOne` |
| `useList` / `useInfiniteList` | `getList` |
| `useApiUrl` | `getApiUrl` |
| `useCustom` | `custom` |
| `useMany` | `getMany` |
| `useCreateMany` / `useDeleteMany` / `useUpdateMany` | `createMany` / `deleteMany` / `updateMany` |

**Refine 如何對待資料與狀態**：
- **Resource-Based**：圍繞 resource（資料實體 / API endpoint）組織資料。
- **Invalidation**：mutation 成功後自動 invalidate 資料，確保 UI 更新。
- **Caching**：快取資料以提升效能、去重 API 呼叫（底層 TanStack Query）。
- **Optimistic Updates**：可在 API 完成前樂觀更新 UI。
- **CRUD Hooks**：基礎 hook（useList/useCreate/useUpdate/useDelete）+ 進階組合 hook（useForm/useTable/useSelect）。
- **Realtime Updates**：透過 liveProvider 反映資料變更。

**meta 用法**：`meta` 是特殊屬性，可從應用任何地方傳額外資訊給 data provider 方法（額外 headers/參數、產生 GraphQL query、multi-tenancy 傳 tenant id）。

**GraphQL**：`meta` 的 `gqlQuery` / `gqlMutation` 欄位接受 graphql 的 `DocumentNode`：

```tsx
import gql from "graphql-tag";
import { useOne } from "@refinedev/core";

const GET_PRODUCT_QUERY = gql`
  query GetProduct($id: ID!) {
    product(id: $id) { id title category { title } }
  }
`;
useOne({ resource: "products", id: 1, meta: { gqlQuery: GET_PRODUCT_QUERY } });
```

**錯誤處理**：Refine 期待錯誤 extends `HttpError`。一致的錯誤介面帶來自動通知、server-side validation、optimistic update rollback。

**關聯資料**：用 data hooks 組合處理 one-to-one / one-to-many / many-to-many。例如 one-to-many 用 `useOne` 抓主記錄 + `useList`（加 filter）抓子記錄；many-to-many 用 `useMany`。常搭配 `queryOptions: { enabled: !!product }` 做依賴抓取。

---

## Forms

`useForm` hook 內部編排 `useOne`、`useUpdate`、`useCreate`，提供單一表單處理介面。edit/clone 時用 `useOne` 抓既有值；create 用 `useCreate`；update 用 `useUpdate`。

`@refinedev/core` 的 useForm 是基礎，`@refinedev/antd`、`@refinedev/react-hook-form`、`@refinedev/mantine` 提供擴充版。

**3 種 action mode**：`create`（預設）、`edit`（需 `id`）、`clone`（需 `id`，抓既有記錄當初始值再 create）。

**Router 整合**：有 router 整合時，多數情況下 useForm 能從當前路由 infer `resource`、`action`、`id`。

**Redirection**：useForm 用 router 整合在 mutation 成功後跳轉（預設 list 頁），可用 `redirect` prop（`"list"|"edit"|"show"|false`）或 `<Refine>` 的 `options.redirect` 客製。

**Unsaved Changes**：useForm 內建離開頁面前確認對話框。需用 router 套件的 `<UnsavedChangesNotifier />` 並設 `warnWhenUnsavedChanges: true`。

**3 種 Mutation Mode**：
- `pessimistic`（預設）：mutation 立即執行，完成前 loading。
- `optimistic`：立即執行並當作成功處理，UI 樂觀更新 list/many/detail query 快取；失敗則 revert。
- `undoable`：mutation 延遲指定時間、同時當作成功處理，倒數通知期間可 undo。

**Invalidation**：mutation 成功後預設 invalidate — create/clone 動作 invalidate `list` + `many`；edit 額外 invalidate `detail`。可用 `invalidates` prop 客製（傳 `false` 完全停用，改用 `useInvalidate` 手動處理）。

**Optimistic Updates**：optimistic / undoable 模式下，預設用表單值更新快取記錄；可用 `optimisticUpdateMap` 客製各 query set 的更新邏輯。

**Server Side Validation**：data provider 正確回傳含 `errors` 欄位（特定格式）的錯誤時，useForm 自動把錯誤傳遞到對應 form field。

**Auto Save**：`autoSave: { enabled, debounce, invalidateOnUnmount }`。core useForm 需手動觸發 `onFinishAutoSave`；其他套件擴充版自動觸發。搭配 `<AutoSaveIndicator>` 顯示狀態。

**Save and Continue**：建立後可 redirect 到 edit 頁。設 `redirect: false` 後手動呼叫 `redirect("edit", data.id)`（僅 pessimistic 模式可取得 id）。

---

## Tables

`useTable` 依 sorter / filter / pagination 狀態抓資料，底層用 `useList`，headless 設計。整合：
- TanStack Table（Headless、Chakra、Mantine）— `@refinedev/react-table`
- Ant Design Table — `@refinedev/antd`
- Material UI DataGrid — `@refinedev/mui`

`@refinedev/core` 的 useTable 是所有 useTable 實作的基礎。

**Pagination**：`pagination` 物件含 `currentPage`、`pageSize`、`mode`（`"server"`/`"client"`/`"off"`）。

**Filtering**：`filters` 物件含 `initial`（可被 `setFilters` 改）、`permanent`（不可改）、`defaultBehavior`（`"merge"`/`"replace"`）、`mode`。狀態為 `CrudFilters` 型別。

**Sorting**：`sorters` 物件含 `initial`、`permanent`。狀態為 `CrudSorter` 型別。用 `setSorters` 改變。

**Search**：`onSearch` + `searchFormProps` 連接搜尋表單到表格 filter。

**Sync with Location**：`syncWithLocation` 把表格狀態（排序/篩選/分頁）編碼進 URL query，方便分享/書籤特定表格視圖。

---

## Routing

Refine 是 router agnostic — headless 架構讓你用任何 router solution。內建整合：React Router、Next.js、Remix。

整合好處：hook/component 自動參數偵測、mutation/認證後自動跳轉、導航 utility component/hook。

```tsx
import { BrowserRouter, Routes } from "react-router";
import routerProvider from "@refinedev/react-router";

<BrowserRouter>
  <Refine routerProvider={routerProvider}>
    <Routes>{/* 你的路由定義 */}</Routes>
  </Refine>
</BrowserRouter>
```

**Resource 與 Route 的關係**：Refine 能從當前路由 infer 當前 resource、action、id（依 resource 定義），免去手動傳參數。定義好 resource 與其路由即可：

```tsx
<Refine resources={[{
  name: "products",
  list: "/my-products",
  show: "my-products/:id",
  create: "/my-products/new",
  edit: "/my-products/:id/edit",
  clone: "/my-products/:id/clone",
}]} />
```

之後 `useShow()` / `useList()` 可省略 `resource` 與 `id`：

```tsx
import { useShow, useGo } from "@refinedev/core";

const ProductShow = () => {
  const { result, query } = useShow();   // 從路由 infer resource + id
  const go = useGo();
  if (query.isLoading) return <div>Loading...</div>;
  return (
    <>
      <h1>{result?.name}</h1>
      <button onClick={() => go({ to: { resource: "products", action: "list" } })}>
        Go to Products list
      </button>
    </>
  );
};
```

---

## Authentication / Authorization

**Authentication**：透過 `authProvider` 處理。pass authProvider 給 `<Refine>` 後可用 auth hooks（`useLogin`、`useRegister`、`useIsAuthenticated` 等）。支援 Google、Cognito、Okta、Auth0，或自訂。

```tsx
import { useRegister, useLogin } from "@refinedev/core";

const { mutate: register } = useRegister();
const { mutate: login } = useLogin();

// 表單提交時
const onSubmit = (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.currentTarget).entries());
  login(formData); // 或 register(formData)
};
```

**Authorization**：透過 `accessControlProvider` 處理（agnostic API，整合 RBAC/ABAC/ACL 與 Casbin/CASL/Cerbos）。用 `<CanAccess>` 包裹受保護路由、`useCan` 檢查權限。

詳見 `auth-provider.md`。

---

## UI Libraries

Refine 核心 headless，但提供 UI library 整合套件加速開發。**v5 範圍內**：
- **Ant Design**（`@refinedev/antd` ^6.x）— 見 `ui-antd.md`
- **shadcn/ui**（registry 系統）— 見 `ui-shadcn.md`

整合套件提供連接 Refine 功能的元件與 hook（如 `useTable` 回傳與 `<Table>` 相容的 props），但不取代底層 UI library。

> Material UI、Chakra UI、Mantine 也有官方整合（`@refinedev/mui`、`@refinedev/chakra-ui`、`@refinedev/mantine`），但不在此 SKILL 範圍。
