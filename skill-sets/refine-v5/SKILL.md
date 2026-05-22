---
name: refine-v5
description: >
  Refine framework v5 的完整技術參考。Refine 是 headless 的 React meta-framework，
  用於快速建構 CRUD 應用（admin panel、dashboard、B2B 工具、內部後台）。
  涵蓋 @refinedev/core 所有 hooks、components、5 大 provider（data / auth / router /
  notification / live / access-control / audit / i18n）、Ant Design 與 shadcn/ui 整合，
  以及 v4 → v5 完整遷移注意事項。
  當程式碼涉及 Refine 或相關 import 時，必須使用此 skill 而不是去搜尋 web。
  即使用戶沒有明確說出「Refine」，只要任務涉及以下關鍵字也應使用此 skill：
  @refinedev/core、@refinedev/antd、@refinedev/react-hook-form、@refinedev/react-table、
  @refinedev/simple-rest、@refinedev/react-router、<Refine>、useTable、useForm、useList、
  useOne、useCreate、useUpdate、useDelete、useShow、useSelect、useMany、useInfiniteList、
  dataProvider、authProvider、routerProvider、liveProvider、useGo、useResourceParams、
  useMenu、useLogin、useLogout、useCan、refineCore、tableProps、formProps、saveButtonProps。
  此 skill 提供的資訊對應 Refine v5（@refinedev/core ^5.x、@refinedev/antd ^6.x），
  v5 移除了 v4 的所有 deprecated API、升級至 TanStack Query v5、支援 React 18/19，
  與 v4 有大量 breaking changes（return type 重構、metaData→meta、queryResult→query 等），
  v4 的 snippet 無法直接套用，遇到 v4 專案先確認版本。
---

# Refine v5

> **適用版本**：`@refinedev/core` ^5.x ｜ `@refinedev/antd` ^6.x ｜ `@refinedev/react-hook-form` ^5.x ｜ `@refinedev/react-table` ^6.x ｜ `@refinedev/react-router` ^2.x
> **依賴**：React 18 或 19、TanStack Query v5、TypeScript 5.x
> **文件來源**：https://refine.dev/core/docs/ ｜ **最後更新**：2026-05

Refine 是一個 **headless 的 React meta-framework**，專注於資料密集型應用（admin panel、dashboard、內部後台、B2B 工具）。它將 **business logic（資料抓取、認證、路由、權限、即時同步）** 與 **UI** 完全解耦：core 套件不含任何樣式，可搭配 Ant Design、shadcn/ui、Tailwind 或自訂 UI。所有功能透過 **hook-based API** + **可插拔的 provider 系統** 提供。

## 核心心智模型

Refine 應用由 5 個概念組成：

1. **`<Refine>` component** — 應用入口，掛載所有 provider 與 `resources`。
2. **Resource** — 代表一個資料實體（如 `products`、`posts`），綁定 `list` / `create` / `edit` / `show` 4 個 action 的路由。
3. **Providers** — 可插拔的適配器：`dataProvider`（API 通訊）、`authProvider`（認證）、`routerProvider`（路由整合）、`notificationProvider`（通知）、`liveProvider`（即時）、`accessControlProvider`（權限）、`auditLogProvider`、`i18nProvider`。
4. **Data hooks** — `useList` / `useOne` / `useCreate` 等，底層用 TanStack Query，呼叫 dataProvider 對應方法。
5. **Higher-level hooks** — `useForm` / `useTable` / `useSelect` 由 data hooks 組合而成，處理表單與表格的完整生命週期。

```tsx
import { Refine } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Routes, Route } from "react-router";

const App = () => (
  <BrowserRouter>
    <Refine
      dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
      routerProvider={routerProvider}
      resources={[
        {
          name: "products",
          list: "/products",
          create: "/products/create",
          edit: "/products/edit/:id",
          show: "/products/show/:id",
          meta: { label: "Products", canDelete: true },
        },
      ]}
      options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
    >
      <Routes>{/* 路由由你的 router library 定義，不再放在 resource 裡 */}</Routes>
    </Refine>
  </BrowserRouter>
);
```

## ⚠️ v5 最關鍵的 breaking change：Data/Mutation hook return type 重構

v5 把所有 data/mutation hook 的回傳值重新分組。**這是 v4→v5 最常踩雷的點**：

| | v4 | v5 |
|---|---|---|
| Query hooks（useList / useOne / useMany / useInfiniteList / useShow） | `{ data, isLoading, isError }`，資料在 `data.data` / `data.total` | `{ result, query }`，資料在 `result.data` / `result.total`，query state 在 `query.isLoading` 等 |
| Mutation hooks（useCreate / useUpdate / useDelete / ...） | `{ mutate, isPending, isError }` | `{ mutate, mutation }`，mutation state 在 `mutation.isPending` 等 |
| useForm / useShow / useSelect 的 `queryResult` | `queryResult` | `query` |
| useTable 的 `tableQueryResult` | `tableQueryResult` | `tableQuery` |

```tsx
// ❌ v4
const { data, isLoading } = useList({ resource: "products" });
const products = data?.data;

// ✅ v5
const { result, query } = useList({ resource: "products" });
const products = result?.data;
const isLoading = query.isLoading;
```

```tsx
// ❌ v4
const { mutate, isPending } = useUpdate();

// ✅ v5
const { mutate, mutation } = useUpdate();
const isPending = mutation.isPending; // 注意：mutation 用 isPending，不是 isLoading
```

完整遷移清單（含 codemod 指令、metaData→meta、sorter→sorters、`config` 物件移除、router/auth provider 遷移、`ThemedLayoutV2`→`ThemedLayout` 等）見 `references/migration-4x-to-5x.md`。**遇到 v4 專案先跑 codemod**：`npx @refinedev/codemod@latest refine4-to-refine5`。

## 核心 API 速查

### Data Hooks（`@refinedev/core`）

```tsx
import { useList, useOne, useMany, useInfiniteList,
         useCreate, useUpdate, useDelete, useCustom } from "@refinedev/core";

// 列表
const { result, query } = useList<IProduct>({
  resource: "products",
  pagination: { currentPage: 1, pageSize: 10, mode: "server" },
  sorters: [{ field: "id", order: "desc" }],
  filters: [{ field: "material", operator: "eq", value: "Wooden" }],
});
const products = result.data;   // IProduct[]
const total = result.total;     // number

// 單筆
const { result: product, query } = useOne<IProduct>({ resource: "products", id: 123 });
// v5: result 直接就是該筆記錄（v4 需要 data.data）

// 多筆
const { result } = useMany<IProduct>({ resource: "products", ids: [1, 2, 3] });

// 建立 / 更新 / 刪除
const { mutate: create, mutation } = useCreate();
create({ resource: "products", values: { name: "New", material: "Wood" } });

const { mutate: update } = useUpdate();
update({ resource: "products", id: 1, values: { price: 100 }, mutationMode: "optimistic" });

const { mutate: remove } = useDelete();
remove({ resource: "products", id: 1 });
```

### Higher-level Hooks

```tsx
import { useForm, useTable, useSelect, useShow } from "@refinedev/core";

// useForm：自動處理 create/edit/clone + 抓取既有資料 + redirect + invalidation
const { onFinish, query, formLoading } = useForm<IProduct>({
  resource: "products", action: "edit", id: 1, redirect: "show",
});

// useTable：headless 表格，含分頁/排序/篩選
const { result, currentPage, setCurrentPage, sorters, setSorters,
        filters, setFilters, tableQuery } = useTable<IProduct>({ resource: "products" });

// useSelect：給 <select> 用的選項，自動抓取 + 預設值
const { options, query, onSearch } = useSelect<ICategory>({ resource: "categories" });

// useShow：詳情頁，從路由 infer id
const { result: record, query } = useShow<IProduct>();
```

### Routing / Resource Hooks

```tsx
import { useGo, useBack, useResourceParams, useNavigation } from "@refinedev/core";

const go = useGo();
go({ to: { resource: "posts", action: "edit", id: 1 }, type: "push" });
go({ to: "/posts", query: { foo: "bar" }, type: "replace" });

const back = useBack();             // 回上一頁
const { id, action, resource, identifier, formAction, setId } = useResourceParams();
```

### Auth Hooks

```tsx
import { useLogin, useLogout, useGetIdentity, useIsAuthenticated,
         usePermissions, Authenticated } from "@refinedev/core";

const { mutate: login } = useLogin();
login({ email: "a@b.com", password: "x" });

const { mutate: logout } = useLogout();
const { data: identity } = useGetIdentity();

<Authenticated key="auth" fallback={<Navigate to="/login" />}>
  <ProtectedRoutes />
</Authenticated>
```

## 常用模式

### 1. 列表頁 + 表格（headless）

```tsx
import { useTable } from "@refinedev/core";

const ProductList = () => {
  const { result, tableQuery, currentPage, setCurrentPage, pageCount } =
    useTable<IProduct>({ resource: "products", pagination: { pageSize: 10 } });

  if (tableQuery.isLoading) return <div>Loading...</div>;

  return (
    <>
      {result.data.map((p) => <div key={p.id}>{p.name}</div>)}
      <button disabled={currentPage < 2} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
      <button disabled={currentPage === pageCount} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
    </>
  );
};
```

### 2. 編輯表單 + 關聯 select

```tsx
import { useForm, useSelect } from "@refinedev/core";

const EditPage = () => {
  const { onFinish, query, formLoading } = useForm<IProduct>({
    resource: "products", action: "edit", id: 1,
  });
  const product = query?.data?.data;
  const { options } = useSelect<ICategory>({
    resource: "categories", defaultValue: product?.category.id,
  });
  // 用 onFinish(values) 提交；query 取得既有資料
};
```

### 3. Mutation mode（樂觀更新 / 可復原）

```tsx
useForm({ mutationMode: "undoable" }); // "pessimistic"(預設) | "optimistic" | "undoable"
useUpdate().mutate({ id: 1, values, mutationMode: "optimistic" });
```

- `pessimistic`：等 API 回應才更新 UI（預設）。
- `optimistic`：立即更新 UI，失敗則 rollback。
- `undoable`：立即更新 + 倒數計時通知，期間可按「undo」取消。

## 注意事項與陷阱

| 嚴重度 | 陷阱 | 說明 |
|--------|------|------|
| 🔴 高 | mutation 用 `isPending` 不是 `isLoading` | v5 mutation hook 的 loading state 是 `mutation.isPending`；query hook 才是 `query.isLoading` |
| 🔴 高 | 資料路徑改變 | v5 query hook 資料在 `result.data`（不是 `data.data`）；`useOne` 的 `result` 直接是記錄本身 |
| 🔴 高 | `metaData` 全面改名 `meta` | 所有 hook 的 `metaData` 參數在 v5 移除，改用 `meta` |
| 🔴 高 | resource 的 `list` 只能是字串路由 | v5 不再支援把 React component 當 `list`；路由必須定義在 router 裡。`list.path` 也移除 |
| 🟠 中 | `sort`/`sorter` → `sorters` | useList/useTable/useSelect 的排序參數統一叫 `sorters` |
| 🟠 中 | `config` 物件移除 | useList/useInfiniteList 的 `config: { pagination, filters, ... }` 已扁平化，直接放在頂層 |
| 🟠 中 | `pagination.current` → `currentPage`、`setCurrent` → `setCurrentPage` | 分頁屬性全面改名 |
| 🟠 中 | `useResource` 移除 | 改用 `useResourceParams`；`useNavigation` 的 `push/replace/goBack` 移除，改用 `useGo` / `useBack` |
| 🟠 中 | Type 改名 | `AuthBindings`→`AuthProvider`、`RouterBindings`→`RouterProvider`、`ITreeMenu`→`TreeMenuItem` |
| 🟠 中 | `ThemedLayoutV2` → `ThemedLayout` | 所有 UI 套件的 V2 layout 元件去掉 V2 後綴 |
| 🟡 低 | TanStack Query v5 必裝 | Refine v5 強制依賴 `@tanstack/react-query@5`，升級時需一併安裝 |
| 🟡 低 | `legacyRouterProvider` / `legacyAuthProvider` 完全移除 | v5 不再向後相容 v3 router/auth；`v3LegacyAuthProviderCompatible` 旗標移除 |

## References 導引

| 需求 | 參閱檔案 |
|------|---------|
| 查 data/mutation hook 完整參數、型別、回傳值 | `references/data-hooks.md` |
| 查 useForm / useTable / useSelect / useShow（core 版） | `references/data-hooks.md` |
| 查 `<Refine>` component 所有 props、`options` 設定 | `references/refine-component.md` |
| 查 dataProvider 介面、自訂 data provider、內建套件 | `references/data-provider.md` |
| 查 authProvider 介面與全部 auth hooks / `<Authenticated>` | `references/auth-provider.md` |
| 查 accessControlProvider、`useCan`、`<CanAccess>` | `references/auth-provider.md` |
| 查 routerProvider、`useGo` / `useBack` / `useResourceParams` / `<Link>`、router 整合 | `references/router.md` |
| 查 notification / live(realtime) / audit-log / i18n provider 與其 hooks | `references/providers-misc.md` |
| 查 core utility hooks（useMenu / useBreadcrumb / useImport / useExport / useModal / button hooks） | `references/core-hooks.md` |
| 查 `@refinedev/react-hook-form` 與 `@refinedev/react-table` 套件 | `references/packages.md` |
| 查 Ant Design 整合（useForm/useTable/useSelect/CRUD views/buttons/AuthPage/ThemedLayout） | `references/ui-antd.md` |
| 查 shadcn/ui 整合（registry、DataTable、views、auth 元件） | `references/ui-shadcn.md` |
| 完整 v4 → v5 遷移清單與 codemod | `references/migration-4x-to-5x.md` |
| 完整 TypeScript interface 定義（CrudFilter / HttpError / BaseRecord 等） | `references/types.md` |
| guides & concepts（資料抓取/表單/表格/路由的設計理念） | `references/guides-concepts.md` |
