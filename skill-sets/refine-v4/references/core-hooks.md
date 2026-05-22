# Refine v4 — `@refinedev/core` Data Hooks 完整參考

> 來源：https://refine.dev/docs/4.xx.xx/data/hooks/*

## 目錄

- [共通說明](#共通說明)
- [查詢 hooks](#查詢-hooks)
  - [useList](#uselist)
  - [useInfiniteList](#useinfinitelist)
  - [useOne](#useone)
  - [useMany](#usemany)
  - [useShow](#useshow)
  - [useCustom](#usecustom)
- [變更 hooks](#變更-hooks)
  - [useCreate / useCreateMany](#usecreate--usecreatemany)
  - [useUpdate / useUpdateMany](#useupdate--useupdatemany)
  - [useDelete / useDeleteMany](#usedelete--usedeletemany)
  - [useCustomMutation](#usecustommutation)
- [核心 useForm / useTable / useSelect](#核心-useform--usetable--useselect)
- [工具 hooks](#工具-hooks)

---

## 共通說明

- **泛型**：多數 hook 簽名為 `useXxx<TQueryFnData = BaseRecord, TError = HttpError, TData = TQueryFnData>`。
- **查詢 hook 回傳**：TanStack Query `useQuery` 的全部回傳值（`data`/`isLoading`/`isFetching`/`isError`/`error`/`refetch`/`status` 等）+ `overtime: { elapsedTime?: number }`。
- **變更 hook 回傳**：TanStack Query `useMutation` 的全部回傳值（`mutate`/`mutateAsync`/`isLoading`/`isSuccess`/`isError`/`data`/`error`/`reset` 等）+ `overtime`。
- **`overtimeOptions`**：`{ interval: number; onInterval: (elapsedInterval: number) => void }`——請求過久時的 callback。
- **`liveMode`**：`"auto" | "manual" | "off"`（需 `liveProvider`）。`"auto"` 收到 live event 自動 invalidate + refetch；`"manual"` 只觸發 `onLiveEvent`。
- **`successNotification` / `errorNotification`**：`false`（停用）或 `OpenNotificationParams` 或 callback `(data, params, resource) => OpenNotificationParams`。
- **`meta`**：`MetaQuery`——傳給 dataProvider 方法的自訂資料（headers、GraphQL query 等）。

---

## 查詢 hooks

### useList

對應 `dataProvider.getList`。回傳清單。

| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `resource` | `string` | — | 必填（或從路由推斷）。 |
| `dataProviderName` | `string` | `"default"` | 多 provider 時指定。 |
| `filters` | `CrudFilter[]` | — | 篩選條件。 |
| `sorters` | `CrudSort[]` | — | 排序條件。 |
| `pagination` | `{ current?: number; pageSize?: number; mode?: "off" \| "client" \| "server" }` | `{ current: 1, pageSize: 10, mode: "server" }` | 分頁。 |
| `queryOptions` | `UseQueryOptions` | — | TanStack Query 選項（`enabled`/`retry`/`staleTime`/`select`…）。 |
| `meta` | `MetaQuery` | — | 傳給 dataProvider 的自訂資料。 |
| `successNotification` / `errorNotification` | `false \| OpenNotificationParams \| fn` | — | 通知設定。 |
| `liveMode` | `"auto" \| "manual" \| "off"` | `"off"` | 即時模式。 |
| `onLiveEvent` | `(event: LiveEvent) => void` | — | live event callback。 |
| `liveParams` | `{ ids?: BaseKey[]; [k: string]: any }` | — | 訂閱參數。 |
| `overtimeOptions` | `UseLoadingOvertimeCoreOptions` | — | 過久請求 callback。 |

**回傳**：`useQuery` 結果，`data` 形狀為 `{ data: TData[]; total: number }`。

```tsx
import { useList, HttpError } from "@refinedev/core";

interface IProduct { id: number; name: string; material: string; }

const { data, isLoading, isError } = useList<IProduct, HttpError>({
  resource: "products",
  pagination: { current: 1, pageSize: 10 },
  filters: [{ field: "material", operator: "eq", value: "Cotton" }],
  sorters: [{ field: "name", order: "asc" }],
});
const products = data?.data ?? [];
const total = data?.total ?? 0;
```

### useInfiniteList

對應 `getList`，是 TanStack `useInfiniteQuery` 的擴充——無限捲動。

參數同 `useList`（`queryOptions` 為 `UseInfiniteQueryOptions`）。

**回傳**：`useInfiniteQuery` 結果 + `overtime`：
```ts
{
  data: { pages: GetListResponse<TData>[]; pageParams: unknown[] };
  fetchNextPage: () => Promise<...>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean; isError: boolean; error: TError | null;
  overtime: { elapsedTime?: number };
}
```

```tsx
import { useInfiniteList } from "@refinedev/core";

const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteList({
  resource: "posts",
  pagination: { pageSize: 10 },
});
const allItems = data?.pages.flatMap((p) => p.data) ?? [];
```

游標式分頁：在 `queryOptions` 覆寫 `getNextPageParam`：
```tsx
useInfiniteList({
  resource: "posts",
  queryOptions: {
    getNextPageParam: (lastPage) => lastPage.data.at(-1)?.id,
  },
});
```

### useOne

對應 `dataProvider.getOne`。取單筆。

| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `resource` | `string` | — | 必填。 |
| `id` | `BaseKey` | — | 必填。 |
| `dataProviderName` | `string` | `"default"` | — |
| `queryOptions` | `UseQueryOptions` | — | — |
| `meta` | `MetaQuery` | — | — |
| `successNotification` / `errorNotification` | `false \| OpenNotificationParams \| fn` | — | — |
| `liveMode` / `onLiveEvent` / `liveParams` | — | — | 同上 |
| `overtimeOptions` | — | — | — |

**回傳**：`useQuery` 結果，`data` 形狀 `{ data: TData }`。

```tsx
const { data, isLoading } = useOne<IProduct, HttpError>({
  resource: "products",
  id: 1,
  queryOptions: { enabled: true },
});
const product = data?.data;
```

### useMany

對應 `dataProvider.getMany`（缺則 fallback 多次 `getOne`）。

| 參數 | 型別 | 說明 |
|------|------|------|
| `resource` | `string` | 必填。 |
| `ids` | `BaseKey[]` | 必填。 |
| 其餘 | — | 同 `useOne`。 |

**回傳**：`data` 形狀 `{ data: TData[] }`。
```tsx
const { data } = useMany<IProduct, HttpError>({ resource: "products", ids: [1, 2, 3] });
```

### useShow

`useOne` 的包裝，**自動從目前 URL 讀取 `resource` 與 `id`**。

| 參數 | 型別 | 說明 |
|------|------|------|
| `resource` | `string` | 預設從 URL 推斷。 |
| `id` | `BaseKey` | 預設從 URL 推斷。 |
| `meta` / `dataProviderName` / `queryOptions` / `successNotification` / `errorNotification` / `liveMode` / `onLiveEvent` / `liveParams` / `overtimeOptions` | — | 同 `useOne`。 |

**回傳**（v4）：
```ts
{
  queryResult: QueryObserverResult<GetOneResponse<TData>>;  // v4 主名稱
  query: QueryObserverResult<...>;        // v4 後期新增的 alias（早期 4.x 無）
  showId: BaseKey | undefined;
  setShowId: (id: BaseKey) => void;
  overtime: { elapsedTime?: number };
}
```
> 寫 v4 用 `queryResult` 最保險（早期 4.x 只有它）。v5 改為 `query`。

```tsx
const { queryResult, showId, setShowId } = useShow<IProduct>();
const { data, isLoading } = queryResult;
const product = data?.data;
```

### useCustom

對應 `dataProvider.custom`。用於非標準端點的 **查詢**（非 mutation）。

| 參數 | 型別 | 說明 |
|------|------|------|
| `url` | `string` | 必填。請求端點。 |
| `method` | `"get" \| "delete" \| "head" \| "options" \| "post" \| "put" \| "patch"` | 必填。 |
| `config` | `{ headers?: object; query?: object; payload?: object; filters?: CrudFilter[]; sorters?: CrudSort[] }` | 請求設定。 |
| `queryOptions` | `UseQueryOptions` | — |
| `meta` / `dataProviderName` / `successNotification` / `errorNotification` / `overtimeOptions` | — | 同上。 |

**回傳**：`useQuery` 結果，`data` 形狀 `{ data: TData }`。

```tsx
import { useCustom, useApiUrl } from "@refinedev/core";
const apiUrl = useApiUrl();
const { data } = useCustom<{ isAvailable: boolean }>({
  url: `${apiUrl}/posts-unique-check`,
  method: "get",
  config: { query: { title: "Foo bar" }, headers: { "x-custom": "v" } },
});
```

---

## 變更 hooks

### useCreate / useCreateMany

對應 `create` / `createMany`。

**`mutate` 參數**：
| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `resource` | `string` | ✓ | — |
| `values` | `TVariables`（`useCreateMany` 為 `TVariables[]`） | ✓ | 建立的資料。 |
| `meta` | `MetaDataQuery` | | — |
| `dataProviderName` | `string` | | 預設 `"default"`。 |
| `successNotification` / `errorNotification` | `SuccessErrorNotification` | | — |
| `invalidates` | `("all" \| "resourceAll" \| "list" \| "many" \| "detail")[] \| false` | | 預設 `["list", "many"]`。 |
| `mutationOptions` | `UseMutationOptions` | | hook 層傳入（非 mutate 層）。 |

```tsx
import { useCreate, useCreateMany } from "@refinedev/core";

const { mutate } = useCreate();
mutate({ resource: "products", values: { name: "P1", material: "Wood" } });

const { mutate: mutateMany } = useCreateMany();
mutateMany({ resource: "products", values: [{ name: "A" }, { name: "B" }] });
```

### useUpdate / useUpdateMany

對應 `update` / `updateMany`。**支援 mutationMode**。

**`mutate` 參數**：
| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `resource` | `string` | ✓ | — |
| `id`（`useUpdateMany` 為 `ids: BaseKey[]`） | `BaseKey` | ✓ | — |
| `values` | `TVariables` | ✓ | 更新的欄位。 |
| `mutationMode` | `"pessimistic" \| "optimistic" \| "undoable"` | | 預設 `"pessimistic"`。 |
| `undoableTimeout` | `number` | | 預設 `5000`（ms）。 |
| `onCancel` | `(cancelMutation: () => void) => void` | | undoable 模式取消 callback。 |
| `meta` / `dataProviderName` / `successNotification` / `errorNotification` | — | | — |
| `optimisticUpdateMap` | `{ list?; many?; detail? }` | | optimistic/undoable 模式自訂快取更新。 |
| `invalidates` | 同上 | | 預設 `["list", "many", "detail"]`。 |

```tsx
import { useUpdate } from "@refinedev/core";
const { mutate } = useUpdate();
mutate({
  resource: "products", id: 1,
  values: { name: "Updated" },
  mutationMode: "optimistic",
});
```

### useDelete / useDeleteMany

對應 `deleteOne` / `deleteMany`。**支援 mutationMode**。

**`mutate` 參數**：`resource`(✓)、`id` / `ids`(✓)、`mutationMode`、`undoableTimeout`、`onCancel`、`meta`、`dataProviderName`、`successNotification`、`errorNotification`、`invalidates`（預設 `["list", "many"]`）、`values`（可選，傳給 dataProvider）。

```tsx
import { useDelete } from "@refinedev/core";
const { mutate } = useDelete();
mutate({
  resource: "products", id: 1,
  mutationMode: "undoable", undoableTimeout: 10000,
});
```

### useCustomMutation

對應 `dataProvider.custom`，用於自訂 **mutation**。

**`mutate` 參數**：
| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `url` | `string` | ✓ | — |
| `method` | `"post" \| "put" \| "patch" \| "delete"` | ✓ | — |
| `values` | `TVariables` | ✓ | request body。 |
| `config` | `{ headers?: Record<string, any> }` | | — |
| `meta` / `dataProviderName` / `successNotification` / `errorNotification` | — | | — |

```tsx
import { useCustomMutation } from "@refinedev/core";
const { mutate } = useCustomMutation();
mutate({
  url: `${API_URL}/categories`,
  method: "post",
  values: { title: "New Category" },
  config: { headers: { "x-custom-header": "foo-bar" } },
});
```

---

## 核心 useForm / useTable / useSelect

> 這是 `@refinedev/core` 的 **headless** 版本。`@refinedev/antd` 的同名 hook 在此之上額外產生 AntD props（見 `antd-hooks.md`）。

### useForm（core）

管理 create/edit/clone 表單，內部協調 `useOne` + `useCreate`/`useUpdate`。

**主要參數**：
| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `action` | `"create" \| "edit" \| "clone"` | 從路由推斷 | 表單模式。 |
| `resource` | `string` | 從路由推斷 | — |
| `id` | `BaseKey` | 從路由推斷 | edit/clone 用。 |
| `redirect` | `"list" \| "edit" \| "show" \| "create" \| false` | `"list"` | 送出後導向。 |
| `onMutationSuccess` | `(data, variables, context, isAutoSave?) => void` | — | 成功 callback。 |
| `onMutationError` | `(error, variables, context, isAutoSave?) => void` | — | 失敗 callback。 |
| `mutationMode` | `"pessimistic" \| "optimistic" \| "undoable"` | `"pessimistic"` | — |
| `successNotification` / `errorNotification` | — | 自動產生 | — |
| `meta` / `queryMeta` / `mutationMeta` | `MetaQuery` | — | 分別給整體 / `useOne` / mutation。 |
| `dataProviderName` | `string` | — | — |
| `invalidates` | `(...)[]` | 依 action | — |
| `queryOptions` | `UseQueryOptions` | — | `useOne` 的選項。 |
| `createMutationOptions` / `updateMutationOptions` | `UseMutationOptions` | — | — |
| `warnWhenUnsavedChanges` | `boolean` | `false` | — |
| `undoableTimeout` | `number` | `5000` | — |
| `optimisticUpdateMap` | `{ list?; many?; detail? }` | 全 `true` | — |
| `autoSave` | `{ enabled: boolean; debounce?: number; invalidateOnUnmount?: boolean }` | 停用 | edit 模式自動儲存。 |
| `liveMode` / `onLiveEvent` / `liveParams` / `overtimeOptions` | — | — | — |

**回傳**（v4）：
```ts
{
  onFinish: (values: TVariables) => Promise<TData | void>;  // 送出表單
  onFinishAutoSave: (values: TVariables) => void;           // 觸發自動儲存（edit）
  formLoading: boolean;
  queryResult: QueryObserverResult<...>;     // v4 主名稱（edit/clone 的 useOne）
  mutationResult: UseMutationResult<...>;    // v4 主名稱
  query / mutation: ...;                     // v4 後期 alias
  id?: BaseKey; setId: (id: BaseKey) => void;
  redirect: (to: "list" | "edit" | "show" | "create" | false, id?: BaseKey) => void;
  overtime: { elapsedTime?: number };
  autoSaveProps: { data?; error?; status: "idle" | "loading" | "success" | "error" };
}
```

```tsx
import { useForm } from "@refinedev/core";
const { onFinish, formLoading, queryResult } = useForm({
  resource: "products", action: "edit", redirect: "show",
});
// onFinish(values) 觸發送出
```

### useTable（core）

內部包裝 `useList`，管理分頁/排序/篩選狀態。

**主要參數**：
| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `resource` | `string` | 從路由推斷 | — |
| `dataProviderName` | `string` | — | — |
| `pagination` | `{ current?: number; pageSize?: number; mode?: "off" \| "client" \| "server" }` | `{ current: 1, pageSize: 10, mode: "server" }` | — |
| `sorters` | `{ initial?: CrudSorting; permanent?: CrudSorting; mode?: "server" \| "off" }` | `mode: "server"` | `initial` 可被使用者改；`permanent` 不可改。 |
| `filters` | `{ initial?: CrudFilters; permanent?: CrudFilters; defaultBehavior?: "merge" \| "replace"; mode?: "server" \| "off" }` | `defaultBehavior: "merge"`, `mode: "server"` | — |
| `syncWithLocation` | `boolean` | `false` | 狀態編碼進 URL query。 |
| `queryOptions` / `meta` / `successNotification` / `errorNotification` / `liveMode` / `onLiveEvent` / `liveParams` / `overtimeOptions` | — | — | — |

**回傳**（v4）：
```ts
{
  tableQueryResult: QueryObserverResult<GetListResponse<TData>>;  // v4 主名稱
  tableQuery: ...;                                                // v4 後期 alias
  current?: number; setCurrent?: (page: number) => void;
  pageSize?: number; setPageSize?: (size: number) => void;
  pageCount?: number;
  sorters: CrudSorting; setSorters: (s: CrudSorting) => void;
  filters: CrudFilters;
  setFilters: ((f: CrudFilters, behavior?: "merge" | "replace") => void)
            | ((setter: (prev: CrudFilters) => CrudFilters) => void);
  createLinkForSyncWithLocation: (params: SyncWithLocationParams) => string;
  overtime: { elapsedTime?: number };
}
```

### useSelect（core）

內部用 `useList`，產生 select/dropdown 的 options。headless。

**主要參數**：
| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `resource` | `string` | — | 必填。 |
| `optionLabel` | `string \| (item) => string` | `"title"` | 顯示文字（支援 dot-notation）。 |
| `optionValue` | `string \| (item) => string` | `"id"` | 值（支援 dot-notation）。 |
| `searchField` | `string` | `optionLabel` | `onSearch` 用的欄位。 |
| `sorters` / `filters` | — | — | — |
| `defaultValue` | `BaseKey \| BaseKey[]` | — | 預選項（觸發獨立 `useMany`）。 |
| `selectedOptionsOrder` | `"in-place" \| "selected-first"` | `"in-place"` | — |
| `debounce` | `number` | `300` | `onSearch` 延遲（ms）。 |
| `queryOptions` / `defaultValueQueryOptions` | `UseQueryOptions` | — | — |
| `pagination` | `{ current?; pageSize?; mode? }` | — | — |
| `onSearch` | `(value: string) => CrudFilter[]` | — | 搜尋時覆寫 filters。 |
| `meta` / `dataProviderName` / `successNotification` / `errorNotification` / `liveMode` / `onLiveEvent` / `liveParams` / `overtimeOptions` | — | — | — |

**回傳**（v4）：
```ts
{
  options: { label: string; value: string }[];
  onSearch: (value: string) => void;
  queryResult: QueryObserverResult<...>;             // v4 主名稱
  defaultValueQueryResult: QueryObserverResult<...>;  // v4 主名稱
  overtime: { elapsedTime?: number };
}
```

```tsx
import { useSelect } from "@refinedev/core";
const { options, onSearch } = useSelect({
  resource: "categories",
  optionLabel: "title", optionValue: "id",
  onSearch: (value) => [{ field: "title", operator: "contains", value }],
});
```

---

## 工具 hooks

### useDataProvider

取得 dataProvider 函式。
```tsx
import { useDataProvider } from "@refinedev/core";
const dataProvider = useDataProvider();
const defaultProvider = dataProvider();        // 預設
const second = dataProvider("second");          // 具名
```

### useApiUrl

`(dataProviderName?: string) => string`——回傳 dataProvider 的 `getApiUrl()`。
```tsx
const apiUrl = useApiUrl();           // 目前 resource 的 provider
const otherUrl = useApiUrl("other");  // 具名 provider
```

### useInvalidate

回傳一個 async `invalidate` 函式，手動使 React Query 快取失效。

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `resource` | `string` | | 實體名稱。 |
| `id` | `BaseKey` | | 失效 `"detail"` 時用。 |
| `dataProviderName` | `string` | | 預設 `"default"`。 |
| `invalidates` | `("all" \| "resourceAll" \| "list" \| "detail" \| "many")[] \| [false]` | ✓ | 失效範圍。 |
| `invalidationFilters` | `InvalidateQueryFilters` | | 預設 `{ type: "all", refetchType: "active" }`。 |
| `invalidationOptions` | `InvalidateOptions` | | 預設 `{ cancelRefetch: false }`。 |

```tsx
import { useInvalidate } from "@refinedev/core";
const invalidate = useInvalidate();
invalidate({ resource: "posts", invalidates: ["list", "many"] });
invalidate({ resource: "posts", invalidates: ["detail"], id: 1 });
invalidate({ resource: "posts", invalidates: ["resourceAll"] });
```
