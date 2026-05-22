# Refine v4 → v5 遷移指南

> 來源：https://refine.dev/core/docs/migration-guide/4x-to-5x/

## 動機

Refine v5 移除所有 v4 deprecated API 與 legacy 系統、升級至 TanStack Query v5、新增 React 19 支援。結果是更乾淨、更快、DX 更好的程式碼。

> ⚠️ 升級到 v5 前，必須先升級到 v4.x。若仍在 v3.x，先走 3x→4x 遷移。

## 目錄

- [Step 1：升級依賴](#step-1升級依賴)
- [Step 2：移除 deprecated API（codemod）](#step-2移除-deprecated-apicodemod)
- [Step 3：Router Provider](#step-3router-provider)
- [Step 4：Auth Provider](#step-4auth-provider)
- [Step 5：TanStack Query v5](#step-5tanstack-query-v5)
- [Step 6：React 19（選用）](#step-6react-19選用)
- [Data/Mutation hook return type 重構](#datamutation-hook-return-type-重構)
- [所有 breaking changes 清單](#所有-breaking-changes-清單)

---

## Step 1：升級依賴

所有 Refine 套件以協調式發佈一起跳大版號（整個 v5 生態作為完整套件一起測試）：

| 套件 | v4 版本 | v5 版本 |
|------|---------|---------|
| `@refinedev/core` | 4.x.x | **5.x.x** |
| `react` | 17 / 18 | 18 / 19 |
| `@tanstack/react-query` | 4.x.x | **5.x.x** |
| `@refinedev/antd` | 5.x.x | **6.x.x** |
| `@refinedev/mui` | 6.x.x | 7.x.x |
| `@refinedev/mantine` | 2.x.x | 3.x.x |
| `@refinedev/chakra-ui` | 2.x.x | 3.x.x |
| `@refinedev/react-hook-form` | 4.x.x | **5.x.x** |
| `@refinedev/react-table` | 5.x.x | **6.x.x** |
| `@refinedev/react-router` | 1.x.x | **2.x.x** |
| `@refinedev/nextjs-router` | 6.x.x | 7.x.x |
| `@refinedev/remix-router` | 3.x.x | 4.x.x |
| `@refinedev/inferencer` | 5.x.x | 6.x.x |
| `@refinedev/devtools` | 1.x.x | 2.x.x |

用 Refine CLI 升級：

```bash
npm run refine update
```

> ⚠️ React Query v5 是 Refine v5 的必要依賴，升級時務必安裝：
> ```bash
> npm i @tanstack/react-query@5
> ```

---

## Step 2：移除 deprecated API（codemod）

所有 v4 標記為 deprecated 待移除的 API 在 v5 全數移除。

**自動遷移（推薦）**：`@refinedev/codemod` 套件自動處理大部分 breaking changes。

```bash
# cd 到專案根目錄（package.json 所在處）
npx @refinedev/codemod@latest refine4-to-refine5
```

> 👉 codemod 會更新大部分標準情況，但可能遺漏複雜的 destructuring、條件邏輯或自訂 wrapper。使用這些 pattern 時請手動檢查 [return type breaking changes](#datamutation-hook-return-type-重構)。

### codemod 無法處理、需手動更新的部分

#### `useNavigation` → `useGo`

```diff
- import { useNavigation } from "@refinedev/core";
+ import { useGo } from "@refinedev/core";

- const { replace, push } = useNavigation();
- replace("/tasks/new");
+ const go = useGo();
+ go({ to: "/tasks/new", type: "replace" });
+ go({ to: "/tasks/new", type: "push" });
```

backward navigation（`goBack`）改用 router 原生 API：

```diff
- import { useNavigation } from "@refinedev/core";
+ import { useNavigate } from "react-router";

- const { goBack } = useNavigation();
+ const navigate = useNavigate();
- goBack();
+ navigate(-1);
```

#### `ITreeMenu` → `TreeMenuItem` 與 `list` 欄位變更

`ITreeMenu` 移除 → 改用 `TreeMenuItem`（codemod 會處理）。`list` 現在永遠是字串路由，`list.path` 移除、`list` 不再是 function。

原因：v4 可在 `<Refine />` resource 的 `list` 放 React component，v5 不再支援，路由/元件必須定義在 router 裡。

```diff
- const { menuItems, selectedKey } = useMenu();
- menuItems.map((item: ITreeMenu) => {
-   const { key, list } = item;
-   const route =
-     typeof list === "string" ? list
-       : typeof list !== "function" ? list?.path : key;
- });
+ const { menuItems, selectedKey } = useMenu();
+ menuItems.map((item: TreeMenuItem) => {
+   const { list } = item;
+   const route = list ?? key; // 現在永遠是字串路由
+ });
```

---

## Step 3：Router Provider

若專案仍用 `legacyRouterProvider`，必須遷移到新 router 系統（v5 完全移除 legacy router）。參考：
- 3x→4x router provider 遷移指南
- React Router v6 → v7 遷移

---

## Step 4：Auth Provider

若仍用 legacy auth provider（`legacyAuthProvider`）或帶 `v3LegacyAuthProviderCompatible: true` 的 auth hooks，必須遷移到 modern auth provider 結構（v5 完全移除這些）。

```diff
useLogin({
-    v3LegacyAuthProviderCompatible: true,
});

<Refine
-    legacyAuthProvider={legacyAuthProvider}
+    authProvider={authProvider}
/>
```

---

## Step 5：TanStack Query v5

從 TanStack Query v4 升級到 v5，參考 TanStack Query 官方遷移指南。

---

## Step 6：React 19（選用）

Refine v5 同時支援 React 18 與 19。可選擇升級到 React 19 以使用最新功能。

---

## Data/Mutation hook return type 重構

🚨 影響：**所有 data 與 mutation hook**（useList、useTable、useInfiniteList、useOne、useMany、useForm、useCreate、useUpdate 等）。

v5 把 return type 重構以求清晰一致：
- **Query state**（`isLoading`、`isError`、`error` 等）統一歸到 `query` 物件下。
- **Mutation state**（`isPending`、`isError`、`error` 等）統一歸到 `mutation` 物件下。
- **正規化資料**（`data`、`total` 等）歸到 `result` 物件下。

效果：統一所有 hook 的 return shape、消除巢狀屬性存取（`data?.data`）、提升型別安全。

### useList

```diff
const {
-   data,
-   isLoading,
-   isError,
+   result,
+   query: { isLoading, isError },
} = useList();

- const posts = data.data
- const total = data.total
+ const posts = result.data;
+ const total = result.total;
```

### useOne / useMany / useShow

三個 hook 都用同一個 `query` + `result` 模式：

```diff
const {
-   data,
-   isLoading,
+   result,
+   query: { isLoading, isError },
} = useOne({ resource: "users", id: 1 });

- const user = data.data;
+ const user = result; // 注意：useOne 的 result 直接是記錄本身
```

### useInfiniteList

```diff
const {
-  data,
-  isLoading,
-  fetchNextPage,
-  hasNextPage,
+  result,
+  query: { isLoading, isError, fetchNextPage, hasNextPage },
} = useInfiniteList({ resource: "posts" });

- const posts = data?.data;
+ const posts = result.data;
```

### Mutation hooks（useCreate / useUpdate / useDelete / useCreateMany / useUpdateMany / useDeleteMany / useCustomMutation）

```diff
const {
-  isPending,
-  isError,
   mutate,
   mutateAsync,
+  mutation: { isPending, isError },
} = useUpdate({ resource: "posts" });
```

### `useTable`（@refinedev/react-table）

TanStack Table 屬性現在歸到 `reactTable` 物件下：

```diff
const {
-   getHeaderGroups,
-   getRowModel,
-   setOptions,
-   getState,
-   setPageIndex,
+   reactTable: {
+       getHeaderGroups, getRowModel, setOptions, getState, setPageIndex,
+   },
    refineCore: { filters, setCurrentPage, setFilters },
} = useTable({ columns });
```

### `useTable`（@refinedev/core / @refinedev/antd）、`useDataGrid`、`useSimpleList`

✅ **無 breaking change**，但新增 `result` 屬性以求一致：

```diff
const {
    tableProps, // 或 tableQuery / dataGridProps / listProps
+   result: { data, total },
} = useTable();
```

---

## 所有 breaking changes 清單

### `metaData` → `meta`

影響：所有 data hooks、useForm、useTable、useDataGrid、useSelect 等。

```diff
useList({
-    metaData: { foo: "bar" },
+    meta: { foo: "bar" },
})
```

### `AuthBindings` → `AuthProvider`（型別 import）

```diff
- import { type AuthBindings } from "@refinedev/core";
+ import { type AuthProvider } from "@refinedev/core";
```

### `RouterBindings` → `RouterProvider`（型別 import）

```diff
- import type { RouterBindings } from "@refinedev/core";
+ import type { RouterProvider } from "@refinedev/core";
```

### `sorter` / `sort` → `sorters`

影響：useList、useInfiniteList、useTable、useDataGrid、useSelect。

```diff
useList({
-    sort: [{ field: "title", order: "asc" }],
+    sorters: [{ field: "title", order: "asc" }],
})

useTable({
-    initialSorter: [{ field: "createdAt", order: "desc" }],
+    sorters: { initial: [{ field: "createdAt", order: "desc" }] },
})
```

### filters 更新

filter 設定簡化、移出 `config` 物件：

```diff
useList({
-    config: { filters: [{ field: "status", operator: "eq", value: "published" }] },
+    filters: [{ field: "status", operator: "eq", value: "published" }],
})

useTable({
-    initialFilter: [{ field: "category", operator: "eq", value: "tech" }],
-    permanentFilter: [{ field: "status", operator: "eq", value: "active" }],
+    filters: {
+        initial: [{ field: "category", operator: "eq", value: "tech" }],
+        permanent: [{ field: "status", operator: "eq", value: "active" }],
+    },
})
```

### pagination 更新

```diff
useList({
-    hasPagination: false,
+    pagination: { mode: "off" },
})

useTable({
-    initialCurrent: 1,
-    initialPageSize: 20,
-    hasPagination: false,
+    pagination: { mode: "off", currentPage: 1, pageSize: 20 },
})
```

#### `pagination.current` → `pagination.currentPage`

影響：useTable、useDataGrid、useSimpleList、useSubscription、useList、useCheckboxGroup、useSelect。

```diff
useTable({
-   pagination: { current: 1 },
+   pagination: { currentPage: 1 },
})
```

#### `setCurrent` → `setCurrentPage`

影響：useTable、useDataGrid、useSimpleList。

```diff
const {
-    setCurrent,
-    current,
+    currentPage,
+    setCurrentPage,
} = useTable();
```

### Resource `options` → `meta`

```diff
<Refine resources={[
  {
    name: "posts",
-    options: {
-        label: "Blog Posts",
-        icon: <PostIcon />,
-        route: "my-posts",
-        auditLog: { permissions: ["list", "create"] },
-        hide: false,
-        dataProviderName: "default",
-    },
-    canDelete: true,
+    meta: {
+        label: "Blog Posts",
+        icon: <PostIcon />,
+        parent: "categories",
+        canDelete: true,
+        audit: ["list", "create"],
+        hide: false,
+        dataProviderName: "default",
+    },
  },
]} />
```

### `resourceName` / `resourceNameOrRouteName` → `resource`

影響：useImport、useExport、所有 Button component。

```diff
useImport({
-    resourceName: "posts",
+    resource: "posts",
})

<CreateButton
-    resourceNameOrRouteName="posts"
+    resource="posts"
/>
```

### `config` 物件移除

影響：useList、useInfiniteList。`config` 參數扁平化到頂層：

```diff
useList({
-    config: {
-        pagination: { currentPage: 1, pageSize: 10 },
-        sorters: [{ field: "title", order: "asc" }],
-        filters: [{ field: "status", operator: "eq", value: "published" }],
-        hasPagination: false,
-        metaData: { foo: "bar" },
-    },
+    pagination: { currentPage: 1, pageSize: 10, mode: "off" },
+    sorters: [{ field: "title", order: "asc" }],
+    filters: [{ field: "status", operator: "eq", value: "published" }],
+    meta: { foo: "bar" },
})
```

### `queryResult` → `query`

影響：useForm、useSelect、useShow、useSimpleList、useMany。

```diff
const {
-    queryResult,
+    query,
} = useShow(); // 同樣適用 useForm 等
```

### `defaultValueQueryResult` → `defaultValueQuery`（useSelect）

```diff
const {
-    defaultValueQueryResult,
+    defaultValueQuery,
} = useSelect();
```

### `tableQueryResult` → `tableQuery`（useTable / useDataGrid）

```diff
const {
-    tableQueryResult,
+    tableQuery,
} = useTable();
```

### `mutationResult` → `mutation`

影響：useCreate、useUpdate、useDelete、useCreateMany、useUpdateMany、useDeleteMany、useCustomMutation。

```diff
const {
-    mutationResult,
+    mutation,
} = useForm();
```

### `isLoading` → `isPending`（mutation hooks）

影響：useCreate、useUpdate、useDelete、useCreateMany、useUpdateMany、useDeleteMany、useCustomMutation。

```diff
const { mutate, mutation: { isPending } } = useCreate();
- if (isLoading) return <Spinner />;
+ if (isPending) return <Spinner />;
```

### `useResource` → `useResourceParams`

`useResource` 移除，改用 `useResourceParams`（功能相同 + 新增功能 + 更精簡 API）。

```diff
- import { useResource } from "@refinedev/core";
+ import { useResourceParams } from "@refinedev/core";

- useResource("posts");
+ useResourceParams({ resource: "posts" });
```

### `ignoreAccessControlProvider` → `accessControl`（Button）

```diff
<CreateButton
-    ignoreAccessControlProvider
+    accessControl={{ enabled: false }}
-    resourceNameOrRouteName="posts"
+    resource="posts"
/>
```

### DataProvider `getList` 與 `custom` 方法更新

```diff
export const dataProvider = {
    getList: ({
        resource,
        pagination: {
+            mode: "off" | "server" | "client",
        },
-        hasPagination,
+        sorters,
-        sort,
        filters,
+        meta,
-        metaData,
    }) => { /* ... */ },

    custom: ({
+        sorters,
-        sort,
    }) => { /* ... */ },
};
```

### `useImport` / `useExport` 更新

```diff
useImport({
-    resourceName: "posts",
+    resource: "posts",
-    metaData: { foo: "bar" },
+    meta: { foo: "bar" },
})

useExport({
-    resourceName: "posts",
+    resource: "posts",
-    sorter: [{ field: "title", order: "asc" }],
+    sorters: [{ field: "title", order: "asc" }],
-    metaData: { foo: "bar" },
+    meta: { foo: "bar" },
-    exportOptions: {},
+    unparseConfig: {},
})
```

### `queryKeys` → `keys`

影響：使用 Refine helper 做自訂實作的情況。

```diff
- import { queryKeys } from "@refinedev/core";
+ import { keys } from "@refinedev/core";

- queryKeys.data().resource("posts").action("list").get();
+ keys().data().resource("posts").action("list").get();
```

### `ThemedLayoutV2` → `ThemedLayout`

影響：所有 UI 套件（@refinedev/antd、@refinedev/mui、@refinedev/mantine、@refinedev/chakra-ui）的 layout 元件。

V2 後綴全數移除：
- `ThemedLayoutV2` → `ThemedLayout`
- `ThemedTitleV2` → `ThemedTitle`
- `ThemedSiderV2` → `ThemedSider`
- `ThemedHeaderV2` → `ThemedHeader`

```diff
- import { ThemedLayoutV2, ThemedTitleV2, ThemedSiderV2, ThemedHeaderV2 } from "@refinedev/antd";
+ import { ThemedLayout, ThemedTitle, ThemedSider, ThemedHeader } from "@refinedev/antd";
```
