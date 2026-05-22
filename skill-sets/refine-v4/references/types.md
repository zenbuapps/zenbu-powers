# Refine v4 — 核心型別定義參考

> 來源：https://refine.dev/docs/4.xx.xx/core/interface-references/
> 全部 import 自 `@refinedev/core`。

## 目錄

- [基礎型別](#基礎型別)（`BaseKey`、`BaseRecord`、`HttpError`、`ValidationErrors`）
- [篩選（Filter）型別](#篩選filter型別)（`CrudFilter`、`CrudOperators` 全運算子）
- [排序（Sort）型別](#排序sort型別)
- [分頁（Pagination）型別](#分頁pagination型別)
- [meta 型別](#meta-型別)
- [DataProvider 方法的回應型別](#dataprovider-方法的回應型別)
- [Resource 型別](#resource-型別)
- [通知型別](#通知型別)
- [認證型別](#認證型別)
- [授權型別](#授權型別)
- [即時型別](#即時型別)
- [泛型慣例](#泛型慣例)

## 基礎型別

```ts
// 主鍵
type BaseKey = string | number;

// 記錄基底（所有 entity 的最低要求）
type BaseRecord = {
  id?: BaseKey;
  [key: string]: any;
};

// HTTP 錯誤——dataProvider 拋出的錯誤須符合此形狀
type HttpError = {
  message: string;
  statusCode: number;
  errors?: ValidationErrors;   // 驅動表單欄位驗證
  [key: string]: any;
};

// 表單欄位驗證錯誤
type ValidationErrors = {
  [field: string]:
    | string
    | string[]
    | boolean
    | { key: string; message: string };
};
```

## 篩選（Filter）型別

```ts
type CrudFilters = CrudFilter[];

type CrudFilter = LogicalFilter | ConditionalFilter;

// 一般篩選（欄位 + 運算子 + 值）
type LogicalFilter = {
  field: string;
  operator: Exclude<CrudOperators, "or" | "and">;
  value: any;
};

// 條件篩選（and / or 邏輯組合，可巢狀）
type ConditionalFilter = {
  key?: string;
  operator: Extract<CrudOperators, "or" | "and">;
  value: (LogicalFilter | ConditionalFilter)[];
};
```

### CrudOperators 全運算子

```ts
type CrudOperators =
  // 相等
  | "eq"          // 等於
  | "ne"          // 不等於
  // 比較
  | "lt"          // 小於
  | "gt"          // 大於
  | "lte"         // 小於等於
  | "gte"         // 大於等於
  // 陣列成員
  | "in"          // 在陣列中
  | "nin"         // 不在陣列中
  | "ina"         // 在陣列中（含特定語意，依 provider）
  | "nina"        // 不在陣列中
  // 字串包含
  | "contains"    // 包含（不分大小寫）
  | "ncontains"   // 不包含（不分大小寫）
  | "containss"   // 包含（區分大小寫）
  | "ncontainss"  // 不包含（區分大小寫）
  // 區間
  | "between"     // 介於（value 為 [min, max]）
  | "nbetween"    // 不介於
  // 空值
  | "null"        // 為 null
  | "nnull"       // 非 null
  // 字串開頭
  | "startswith"  // 開頭為（不分大小寫）
  | "nstartswith" // 開頭不為（不分大小寫）
  | "startswiths" // 開頭為（區分大小寫）
  | "nstartswiths"// 開頭不為（區分大小寫）
  // 字串結尾
  | "endswith"    // 結尾為（不分大小寫）
  | "nendswith"   // 結尾不為（不分大小寫）
  | "endswiths"   // 結尾為（區分大小寫）
  | "nendswiths"  // 結尾不為（區分大小寫）
  // 邏輯組合（只能用於 ConditionalFilter）
  | "or"          // 任一條件成立
  | "and";        // 全部條件成立
```

**篩選範例**：
```ts
// 一般篩選
const filters: CrudFilters = [
  { field: "status", operator: "eq", value: "published" },
  { field: "title", operator: "contains", value: "refine" },
  { field: "createdAt", operator: "between", value: ["2024-01-01", "2024-12-31"] },
  { field: "categoryId", operator: "in", value: [1, 2, 3] },
];

// 條件組合（status = published 或 draft）
const conditionalFilters: CrudFilters = [
  {
    operator: "or",
    value: [
      { field: "status", operator: "eq", value: "published" },
      { field: "status", operator: "eq", value: "draft" },
    ],
  },
];
```

> **注意**：實際支援哪些運算子取決於 dataProvider 的實作。並非所有後端 / data provider 套件都支援全部運算子。

## 排序（Sort）型別

```ts
type CrudSorting = CrudSort[];

type CrudSort = {
  field: string;
  order: "asc" | "desc";
};
```

```ts
const sorters: CrudSorting = [
  { field: "createdAt", order: "desc" },
  { field: "title", order: "asc" },
];
```

## 分頁（Pagination）型別

```ts
type Pagination = {
  current?: number;       // 目前頁碼，預設 1
  pageSize?: number;      // 每頁筆數，預設 10
  mode?: "client" | "server" | "off";  // 預設 "server"
};
```

- `"server"`：分頁交給後端，每次狀態變更觸發請求。
- `"client"`：一次抓全部，前端分頁。
- `"off"`：不分頁，一次抓全部。

## meta 型別

```ts
type MetaQuery = {
  queryContext?: Omit<QueryFunctionContext, "meta">;
  // GraphQL 用
  gqlQuery?: DocumentNode;
  gqlMutation?: DocumentNode;
  operation?: string;
  fields?: any[];
  variables?: any;
  [key: string]: any;     // 自訂欄位（headers、tenant id 等）
};
```

`meta` 會原封不動傳給 dataProvider 方法——用途：自訂 headers、GraphQL query 規格、多租戶識別、API 專屬設定。

## DataProvider 方法的回應型別

```ts
type GetListResponse<TData = BaseRecord> = {
  data: TData[];
  total: number;
  [key: string]: any;
};

type GetOneResponse<TData = BaseRecord>    = { data: TData };
type GetManyResponse<TData = BaseRecord>   = { data: TData[] };
type CreateResponse<TData = BaseRecord>    = { data: TData };
type CreateManyResponse<TData = BaseRecord>= { data: TData[] };
type UpdateResponse<TData = BaseRecord>    = { data: TData };
type UpdateManyResponse<TData = BaseRecord>= { data: TData[] };
type DeleteOneResponse<TData = BaseRecord> = { data: TData };
type DeleteManyResponse<TData = BaseRecord>= { data: TData[] };
type CustomResponse<TData = BaseRecord>    = { data: TData };
```

## Resource 型別

```ts
type ResourceProps = {
  name: string;
  identifier?: string;
  list?:   string | React.ComponentType | RouteablePath;
  create?: string | React.ComponentType | RouteablePath;
  edit?:   string | React.ComponentType | RouteablePath;
  show?:   string | React.ComponentType | RouteablePath;
  clone?:  string | React.ComponentType | RouteablePath;
  meta?: {
    label?: string;
    icon?: React.ReactNode;
    canDelete?: boolean;
    parent?: string;
    dataProviderName?: string;
    hide?: boolean;
    audit?: string[];
    [key: string]: any;
  };
};

type RouteablePath = { component: React.ComponentType; path: string };

// 解析後的 resource 項目（useResource / parse 回傳）
type IResourceItem = ResourceProps & { key?: string };
```

## 通知型別

```ts
type OpenNotificationParams = {
  key?: string;
  message: string;
  type: "success" | "error" | "progress";
  description?: string;
  cancelMutation?: () => void;
  undoableTimeout?: number;
};

type SuccessErrorNotification<TData = any, TError = any, TVariables = any> = {
  successNotification?:
    | false
    | OpenNotificationParams
    | ((data?: TData, values?: TVariables, resource?: string) => OpenNotificationParams);
  errorNotification?:
    | false
    | OpenNotificationParams
    | ((error?: TError, values?: TVariables, resource?: string) => OpenNotificationParams);
};
```

## 認證型別

```ts
type AuthActionResponse = {
  success: boolean;
  redirectTo?: string;
  error?: Error;
  successNotification?: { message: string; description?: string };
  [key: string]: unknown;
};

type CheckResponse = {
  authenticated: boolean;
  redirectTo?: string;
  logout?: boolean;
  error?: Error;
};

type OnErrorResponse = {
  redirectTo?: string;
  logout?: boolean;
  error?: Error;
};
```

## 授權型別

```ts
type CanParams = {
  resource?: string;
  action: string;
  params?: {
    resource?: IResourceItem;
    id?: BaseKey;
    [key: string]: any;
  };
};

type CanResponse = {
  can: boolean;
  reason?: string;   // 顯示於按鈕 tooltip
};
```

## 即時型別

```ts
type LiveEvent = {
  channel: string;
  type: "deleted" | "updated" | "created" | "*" | string;
  payload: { ids?: BaseKey[]; [key: string]: any };
  date: Date;
  meta?: MetaQuery;
};

type LiveModeProps = {
  liveMode?: "auto" | "manual" | "off";
  onLiveEvent?: (event: LiveEvent) => void;
  liveParams?: { ids?: BaseKey[]; [key: string]: any };
};
```

## 泛型慣例

多數 data hook 簽名：
```ts
useXxx<
  TQueryFnData extends BaseRecord = BaseRecord,  // dataProvider 回傳的原始資料型別
  TError extends HttpError = HttpError,          // 錯誤型別
  TData extends BaseRecord = TQueryFnData,        // 經 select 轉換後的型別
>
```

mutation hook：
```ts
useXxx<
  TData extends BaseRecord = BaseRecord,    // mutation 回傳型別
  TError extends HttpError = HttpError,
  TVariables = {},                          // 送出的資料型別
>
```
