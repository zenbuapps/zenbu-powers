# Refine v5 — Data Hooks API Reference

> 套件：`@refinedev/core` ｜ 來源：https://refine.dev/core/docs/data/hooks/
> 所有 hook 底層使用 TanStack Query v5。Query hook 回傳 `{ result, query, overtime }`，Mutation hook 回傳 `{ mutate, mutateAsync, mutation, overtime }`。

## 目錄

- [共用型別參數](#共用型別參數)
- [Query hooks：useList / useOne / useMany / useInfiniteList](#query-hooks)
- [Mutation hooks：useCreate / useUpdate / useDelete + Many 變體](#mutation-hooks)
- [useCustom / useCustomMutation](#usecustom--usecustommutation)
- [Higher-level hooks：useForm / useTable / useSelect / useShow](#higher-level-hooks)
- [useInvalidate / useApiUrl / useDataProvider](#工具-hooks)

---

## 共用型別參數

所有 data hook 都接受泛型：

| 參數 | 說明 | 預設 |
|------|------|------|
| `TQueryFnData` / `TData`（query function 結果） | 由 query function 回傳的資料，需 extends `BaseRecord` | `BaseRecord` |
| `TError` | 自訂錯誤物件，需 extends `HttpError` | `HttpError` |
| `TVariables`（mutation） | mutation function 的 values 型別 | `{}` |

```tsx
useList<IProduct, HttpError>({ resource: "products" });
useUpdate<IProduct, HttpError, IProductFormValues>();
```

所有 hook 共用屬性：`resource`、`meta`、`dataProviderName`、`successNotification`、`errorNotification`、`overtimeOptions`。Query hook 另有 `queryOptions`、`liveMode`、`onLiveEvent`、`liveParams`。Mutation hook 另有 `mutationOptions`。

---

## Query hooks

### useList

> 對應 `dataProvider.getList`。抓取列表資料（支援分頁、排序、篩選）。是 `useTable`、`useSelect` 的底層。

```tsx
import { useList, HttpError } from "@refinedev/core";

const { result, query } = useList<IProduct, HttpError>({
  resource: "products",
  pagination: { currentPage: 1, pageSize: 10, mode: "server" },
  sorters: [{ field: "name", order: "asc" }],
  filters: [{ field: "material", operator: "eq", value: "Cotton" }],
});

const products = result.data ?? []; // IProduct[]
const total = result.total;          // number
if (query.isLoading) return <Spinner />;
if (query.isError) return <Error msg={query.error?.message} />;
```

| 屬性 | 型別 | 說明 | 預設 |
|------|------|------|------|
| `resource` ﹡ | `string` | 資源名稱（或 identifier） | — |
| `pagination` | `Pagination` | `{ currentPage?, pageSize?, mode? }`，`mode`：`"server"`/`"client"`/`"off"` | `{ currentPage: 1, pageSize: 10, mode: "server" }` |
| `sorters` | `CrudSort[]` | `[{ field, order: "asc"|"desc" }]` | — |
| `filters` | `CrudFilter[]` | 篩選條件，支援 `and`/`or` 巢狀 | — |
| `queryOptions` | `UseQueryOptions` | TanStack Query 的 useQuery options（如 `enabled`、`retry`） | — |
| `meta` | `MetaQuery` | 傳給 dataProvider 的額外資訊（headers、gqlQuery 等） | — |
| `dataProviderName` | `string` | 多 data provider 時指定使用哪個 | `"default"` |
| `liveMode` | `"auto"|"manual"|"off"` | 即時更新模式（需 liveProvider） | `"off"` |
| `successNotification` / `errorNotification` | `false | OpenNotificationParams | fn` | 自訂通知（需 notificationProvider） | — |

**回傳**：`{ result: { data: TData[], total: number }, query: QueryObserverResult, overtime: { elapsedTime? } }`

### useOne

> 對應 `dataProvider.getOne`。抓取單筆記錄。

```tsx
const { result: product, query } = useOne<IProduct>({ resource: "products", id: 123 });
// 注意：v5 的 result 直接就是該筆記錄（v4 是 data.data）
const name = product?.name;
```

| 屬性 | 型別 | 說明 |
|------|------|------|
| `resource` ﹡ | `string` | 資源名稱 |
| `id` ﹡ | `BaseKey` | 記錄 id（`string | number`） |
| `queryOptions` | `UseQueryOptions` | 常用 `enabled: !!someValue` 做條件抓取 |

**回傳**：`{ result: TData, query: QueryObserverResult, overtime }`

### useMany

> 對應 `dataProvider.getMany`。一次抓多筆記錄。若 dataProvider 無 `getMany`，會 fallback 逐筆呼叫 `getOne`（不推薦）。

```tsx
const { result, query } = useMany<IProduct>({ resource: "products", ids: [1, 2, 3] });
const products = result?.data ?? [];
```

| 屬性 | 型別 | 說明 |
|------|------|------|
| `resource` ﹡ | `string` | 資源名稱 |
| `ids` ﹡ | `BaseKey[]` | 要抓取的記錄 id 陣列 |

**回傳**：`{ result: { data: TData[] }, query, overtime }`

### useInfiniteList

> 對應 `dataProvider.getList`，提供無限捲動 / 分頁載入。

```tsx
const { result, query } = useInfiniteList<IProduct>({ resource: "products" });
const products = result.data; // 攤平後的全部資料
const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
```

**回傳**：`{ result: { data, total, pageParams }, query: InfiniteQueryObserverResult, overtime }`。`query` 含 `fetchNextPage`、`hasNextPage`、`fetchPreviousPage`。

---

## Mutation hooks

所有 mutation hook：state 在 `mutation` 物件下（`mutation.isPending`、`mutation.isError`、`mutation.data`、`mutation.error`）。參數可在 hook 層當預設值，或在 `mutate()` 層覆寫。

### useCreate

> 對應 `dataProvider.create`。成功後 invalidate `list` + `many`。

```tsx
import { useCreate } from "@refinedev/core";

const { mutate, mutateAsync, mutation } = useCreate<IProduct, HttpError, IProductForm>();

mutate({
  resource: "products",
  values: { name: "New Product", material: "Wood" },
  successNotification: (data, values, resource) => ({
    message: "建立成功", type: "success",
  }),
});

if (mutation.isPending) { /* loading */ }
```

| Mutation 參數 | 型別 | 說明 | 預設 |
|------|------|------|------|
| `resource` ﹡ | `string` | 資源名稱 | — |
| `values` ﹡ | `TVariables` | 要建立的資料 | `{}` |
| `meta` | `MetaQuery` | dataProvider 額外資訊 | `{}` |
| `dataProviderName` | `string` | — | `"default"` |
| `invalidates` | `("all"|"resourceAll"|"list"|"many"|"detail")[] | false` | 完成後 invalidate 的 query 範圍 | `["list", "many"]` |
| `successNotification` / `errorNotification` | — | 自訂通知 | — |

### useUpdate

> 對應 `dataProvider.update`。成功後 invalidate `list` + `many` + `detail`。支援 mutation mode。

```tsx
const { mutate, mutation } = useUpdate<IProduct>();

mutate({
  resource: "products",
  id: 1,
  values: { price: 100 },
  mutationMode: "optimistic",        // "pessimistic"(預設) | "optimistic" | "undoable"
  undoableTimeout: 5000,             // undoable 模式下倒數秒數
  onCancel: (cancelMutation) => { /* 自訂 undo */ },
  optimisticUpdateMap: { list: true, many: true, detail: false },
});
```

| Mutation 參數（額外於 useCreate） | 型別 | 說明 | 預設 |
|------|------|------|------|
| `id` ﹡ | `BaseKey` | 要更新的記錄 id | — |
| `mutationMode` | `"pessimistic"|"optimistic"|"undoable"` | 變更執行模式 | `"pessimistic"` |
| `undoableTimeout` | `number` | undoable 模式延遲毫秒 | `5000` |
| `onCancel` | `(cancelMutation: () => void) => void` | undoable 模式下取得取消函式（定義後不自動顯示 undo 通知） | — |
| `optimisticUpdateMap` | `{ list, many, detail }` | 各 query set 是否/如何樂觀更新；可傳 `true`/`false` 或 `(previous, values, id) => newData` | 全 `true` |
| `invalidates` | — | — | `["list", "many", "detail"]` |

### useDelete

> 對應 `dataProvider.deleteOne`。成功後 invalidate `list` + `many`。支援 mutation mode。

```tsx
const { mutate, mutation } = useDelete();
mutate({ resource: "products", id: 1, mutationMode: "undoable" });
```

Mutation 參數：`resource` ﹡、`id` ﹡、`mutationMode`、`undoableTimeout`、`onCancel`、`meta`、`dataProviderName`、`invalidates`（預設 `["list", "many"]`）、通知。

### useCreateMany / useUpdateMany / useDeleteMany

> 對應 `dataProvider.createMany` / `updateMany` / `deleteMany`。批次操作，pattern 與單筆版相同。

```tsx
const { mutate: createMany } = useCreateMany();
createMany({ resource: "products", values: [{ name: "A" }, { name: "B" }] });

const { mutate: updateMany } = useUpdateMany();
updateMany({ resource: "products", ids: [1, 2], values: { status: "active" } });

const { mutate: deleteMany } = useDeleteMany();
deleteMany({ resource: "products", ids: [1, 2, 3] });
```

- `useUpdateMany` / `useDeleteMany` 用 `ids: BaseKey[]`（非 `id`）。
- `useCreateMany` 的 `values` 是陣列。
- 同樣支援 `mutationMode`、`invalidates`、通知。

---

## useCustom / useCustomMutation

> 對應 `dataProvider.custom`。送出 RESTful CRUD 以外的自訂請求。**注意：不會 invalidate query、不會更新 application state**。建立/更新/刪除資源請改用 useCreate/useUpdate/useDelete。

### useCustom（自訂 query）

```tsx
import { useCustom, useApiUrl } from "@refinedev/core";

const apiUrl = useApiUrl();
const { query } = useCustom<{ isAvailable: boolean }>({
  url: `${apiUrl}/posts-unique-check`,
  method: "get",
  config: {
    headers: { "x-custom-header": "foo-bar" },
    query: { title: "Foo bar" },
    filters: [{ field: "title", operator: "contains", value: "Foo" }],
    sorters: [{ field: "title", order: "asc" }],
  },
});
```

| 屬性 | 型別 | 說明 |
|------|------|------|
| `url` ﹡ | `string` | 請求 URL |
| `method` ﹡ | `"get"|"delete"|"head"|"options"|"post"|"put"|"patch"` | HTTP method |
| `config` | `{ headers?, query?, payload?, filters?, sorters? }` | 請求設定 |
| `queryOptions` | `UseQueryOptions` | 可傳 `queryKey` 以便後續 invalidate |

**回傳**：`{ query, overtime }`。手動 invalidate 用 `queryClient.invalidateQueries(["custom-key"])`。

### useCustomMutation（自訂 mutation）

```tsx
const { mutate, mutation } = useCustomMutation<ICategory>();
mutate({
  url: `${apiUrl}/categories`,
  method: "post",
  values: { title: "New Category" },
  config: { headers: { "x-custom-header": "foo-bar" } },
});
```

Mutation 參數：`url` ﹡、`method` ﹡（`post`/`put`/`patch`/`delete`）、`values` ﹡、`config`、`meta`、`dataProviderName`、通知。

---

## Higher-level hooks

### useForm（`@refinedev/core`）

> 編排 `useOne`（抓取既有資料）+ `useCreate`/`useUpdate`（提交）。處理 create/edit/clone 三種 action、redirect、invalidation、auto-save、server-side validation。

```tsx
import { useForm } from "@refinedev/core";

const { onFinish, query, mutation, formLoading, redirect, autoSaveProps } =
  useForm<IProduct, HttpError, IProductFormValues>({
    resource: "products",
    action: "edit",         // "create" | "edit" | "clone"，可從路由 infer
    id: 1,                  // edit/clone 必填，可從路由 infer
    redirect: "show",       // "list"|"edit"|"show"|"create"|false
    mutationMode: "pessimistic",
    invalidates: ["list", "many", "detail"],
    warnWhenUnsavedChanges: true,
    autoSave: { enabled: true, debounce: 2000, invalidateOnUnmount: true },
    onMutationSuccess: (data, variables, context) => { /* ... */ },
    onMutationError: (error, variables, context) => { /* ... */ },
    successNotification: (data, values, resource) => ({ message: "成功", type: "success" }),
  });

// 提交：呼叫 onFinish(values)
const handleSubmit = (e) => { e.preventDefault(); onFinish(formValues); };

// query 取得既有資料（edit/clone）：query?.data?.data
// formLoading：表單載入或提交中的 boolean
```

| 屬性 | 型別 | 說明 | 預設 |
|------|------|------|------|
| `action` | `"create"|"edit"|"clone"` | 表單動作，可從路由 infer | route 推斷 / `create` |
| `resource` | `string` | 資源名稱，可從路由 infer | route 推斷 |
| `id` | `BaseKey` | edit/clone 必填，可從路由 infer | route 推斷 |
| `redirect` | `"list"|"edit"|"show"|"create"|false` | 提交後跳轉 | `"list"` |
| `mutationMode` | `MutationMode` | 變更模式 | `"pessimistic"` |
| `invalidates` | `string[]|false` | 提交成功後 invalidate 範圍 | create/clone: `["list","many"]`；edit: `+["detail"]` |
| `onMutationSuccess` / `onMutationError` | `fn` | 提交回呼 | — |
| `autoSave` | `{ enabled, debounce, invalidateOnUnmount }` | 自動儲存設定 | `{ enabled: false, debounce: 1000 }` |
| `warnWhenUnsavedChanges` | `boolean` | 離開頁面前確認（需 `<UnsavedChangesNotifier />`） | `false` |
| `optimisticUpdateMap` | — | 同 useUpdate | — |

**回傳**：`{ onFinish, query, mutation, formLoading, redirect, autoSaveProps, id, setId, ... }`。

UI 套件版（`@refinedev/antd`、`@refinedev/react-hook-form`）會把 core 參數放在 `refineCoreProps` 裡，core 回傳值放在 `refineCore` 裡 — 見 `ui-antd.md` / `packages.md`。

### useTable（`@refinedev/core`）

> headless 表格 hook，底層用 `useList`。處理分頁、排序、篩選、搜尋、與路由同步。

```tsx
import { useTable } from "@refinedev/core";

const {
  result, tableQuery,
  currentPage, setCurrentPage, pageSize, setPageSize, pageCount,
  sorters, setSorters,
  filters, setFilters,
  searchFormProps,           // 連接搜尋表單
} = useTable<IProduct, HttpError, ISearchValues>({
  resource: "products",
  pagination: { currentPage: 1, pageSize: 10, mode: "server" },
  sorters: { initial: [{ field: "id", order: "desc" }], permanent: [] },
  filters: {
    initial: [{ field: "category.id", operator: "eq", value: "1" }],
    permanent: [{ field: "price", operator: "lte", value: "200" }],
    defaultBehavior: "merge",  // "merge" | "replace"
    mode: "server",            // "server" | "off"
  },
  syncWithLocation: true,
  onSearch: (values) => [{ field: "name", operator: "contains", value: values.name }],
});

const products = result.data; // IProduct[]
```

| 屬性 | 型別 | 說明 |
|------|------|------|
| `resource` | `string` | 資源名稱，可從路由 infer |
| `pagination` | `{ currentPage?, pageSize?, mode? }` | 分頁設定 |
| `sorters` | `{ initial?, permanent? }` | `initial` 可被 `setSorters` 改；`permanent` 不可改 |
| `filters` | `{ initial?, permanent?, defaultBehavior?, mode? }` | `defaultBehavior`：`setFilters` 預設行為 |
| `syncWithLocation` | `boolean` | 將表格狀態同步至 URL query string |
| `onSearch` | `(values) => CrudFilters` | 搜尋表單提交時轉成 filters |

**回傳**：`result`、`tableQuery`、`currentPage`/`setCurrentPage`、`pageSize`/`setPageSize`、`pageCount`、`sorters`/`setSorters`、`filters`/`setFilters`、`searchFormProps`、`overtime`。

### useSelect（`@refinedev/core`）

> 給 `<select>` / React Select 用的選項 hook，底層用 `useList`，自動處理預設值（用 `useMany` 抓 defaultValue 對應的記錄）。

```tsx
import { useSelect } from "@refinedev/core";

const { options, query, defaultValueQuery, onSearch } = useSelect<ICategory>({
  resource: "categories",
  optionLabel: "title",       // 預設 "title"
  optionValue: "id",          // 預設 "id"
  defaultValue: [1, 2],       // 預先選取的值
  filters: [{ field: "status", operator: "eq", value: "active" }],
  sorters: [{ field: "title", order: "asc" }],
  pagination: { mode: "server" },
  onSearch: (value) => [{ field: "title", operator: "contains", value }],
});

// options: { label: string; value: BaseKey }[]
<select>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
```

**回傳**：`{ options, query, defaultValueQuery, onSearch, overtime }`。

### useShow（`@refinedev/core`）

> 詳情頁 hook，底層用 `useOne`，從路由自動 infer `resource` 與 `id`。

```tsx
import { useShow } from "@refinedev/core";

const { result: record, query } = useShow<IProduct>({
  resource: "products",  // 可省略，從路由 infer
  id: 1,                 // 可省略，從路由 infer
});
if (query.isLoading) return <Spinner />;
```

**回傳**：`{ result: TData, query, overtime }`。

---

## 工具 hooks

### useInvalidate

> 手動 invalidate 特定 resource / dataProvider 的 query 快取。Refine 內部於 mutation 成功時呼叫。

```tsx
import { useInvalidate } from "@refinedev/core";

const invalidate = useInvalidate();

invalidate({ resource: "posts", invalidates: ["list", "many"] });
invalidate({ resource: "posts", invalidates: ["detail"], id: 1 });
invalidate({ dataProviderName: "second", invalidates: ["all"] });
invalidate({ resource: "posts", invalidates: ["resourceAll"] });
```

`invalidates` 範圍：`"all"`（所有 resource 的所有 state）、`"resourceAll"`（單一 resource 全部）、`"list"`、`"detail"`（需 `id`）、`"many"`。回傳 async function。

### useApiUrl

> 取得目前 dataProvider 的 API URL（呼叫 `dataProvider.getApiUrl`）。

```tsx
import { useApiUrl } from "@refinedev/core";
const apiUrl = useApiUrl();              // 目前 resource 的 dataProvider URL
const otherUrl = useApiUrl("other");     // 指定 dataProvider 的 URL
```

### useDataProvider

> 取得傳給 `<Refine>` 的 dataProvider。多 data provider 時用來存取特定一個。

```tsx
import { useDataProvider } from "@refinedev/core";
const dataProvider = useDataProvider();
const defaultDP = dataProvider();          // 預設 data provider
const secondDP = dataProvider("second");   // 名為 "second" 的 data provider
```
