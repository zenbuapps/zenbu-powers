# Refine v5 — TypeScript Interface Reference

> 套件：`@refinedev/core` ｜ 來源：https://refine.dev/core/docs/core/interface-references/
> 所有型別均可從 `@refinedev/core` 匯入。

## 目錄

- [基礎型別](#基礎型別)
- [Filter / Sorter / Pagination](#filter--sorter--pagination)
- [錯誤型別](#錯誤型別)
- [Resource 型別](#resource-型別)
- [Provider 型別](#provider-型別)
- [Meta / GraphQL 型別](#meta--graphql-型別)
- [Notification / 權限型別](#notification--權限型別)

---

## 基礎型別

```ts
type BaseKey = string | number;

type BaseRecord = {
  id?: BaseKey;
  [key: string]: any;
};

type MutationMode = "pessimistic" | "optimistic" | "undoable";
```

---

## Filter / Sorter / Pagination

```ts
type CrudFilters = CrudFilter[];
type CrudFilter = LogicalFilter | ConditionalFilter;

type LogicalFilter = {
  field: string;
  operator: Exclude<CrudOperators, "or" | "and">;
  value: any;
};

type ConditionalFilter = {
  key?: string;
  operator: Extract<CrudOperators, "or" | "and">;
  value: (LogicalFilter | ConditionalFilter)[];
};
```

### CrudOperators

```ts
type CrudOperators =
  | "eq"          // 等於
  | "ne"          // 不等於
  | "eqs"         // 等於（大小寫敏感）
  | "nes"         // 不等於（大小寫敏感）
  | "lt"          // 小於
  | "gt"          // 大於
  | "lte"         // 小於等於
  | "gte"         // 大於等於
  | "in"          // 在陣列中
  | "nin"         // 不在陣列中
  | "ina"         // column 含陣列中每個元素
  | "nina"        // column 不含陣列中每個元素
  | "contains"    // 包含
  | "ncontains"   // 不包含
  | "containss"   // 包含（大小寫敏感）
  | "ncontainss"  // 不包含（大小寫敏感）
  | "between"     // 介於
  | "nbetween"    // 不介於
  | "null"        // 為 null
  | "nnull"       // 不為 null
  | "startswith"  // 開頭為
  | "nstartswith" // 開頭不為
  | "startswiths" // 開頭為（大小寫敏感）
  | "nstartswiths"
  | "endswith"    // 結尾為
  | "nendswith"
  | "endswiths"   // 結尾為（大小寫敏感）
  | "nendswiths"
  | "or"          // 邏輯 OR
  | "and";        // 邏輯 AND
```

> 大部分 data provider 整合的 `eq` / `ne` 為大小寫敏感。明確的 `eqs` / `nes` 主要供自訂 data provider 使用。

複合 filter 範例（巢狀 and/or）：

```ts
const filters: CrudFilters = [
  {
    operator: "and",
    value: [
      { field: "material", operator: "eq", value: "wooden" },
      { field: "category.id", operator: "eq", value: 45 },
    ],
  },
  {
    operator: "or",
    value: [
      { field: "price", operator: "gte", value: 1000 },
      { field: "price", operator: "lte", value: 2000 },
    ],
  },
];
```

### Sorter

```ts
type CrudSorting = CrudSort[];
type CrudSort = {
  field: string;
  order: "asc" | "desc";
};
```

### Pagination

```ts
type Pagination = {
  currentPage?: number;            // 頁碼（v5；v4 是 current）
  pageSize?: number;               // 每頁筆數
  mode?: "client" | "server" | "off"; // 是否使用 server side 分頁
};

type SyncWithLocationParams = {
  pagination: { currentPage?: number; pageSize?: number };
  sorters: CrudSorting;
  filters: CrudFilters;
};
```

---

## 錯誤型別

```ts
type HttpError = {
  message: string;
  statusCode: number;
  errors?: ValidationErrors;
  [key: string]: any;
};

type ValidationErrors = {
  [field: string]:
    | string                              // 單一錯誤訊息
    | string[]                            // 多個錯誤訊息
    | boolean                             // true 表示該欄位有錯
    | { key: string; message: string };   // 帶 i18n key 與預設訊息
};
```

`errors` 欄位用於 server-side validation：dataProvider 回傳含 `errors` 的 reject 時，useForm 自動把錯誤套到對應 form field。

---

## Resource 型別

```ts
type ResourceProps = {
  name: string;
  identifier?: string;
  meta?: ResourceMeta;
  list?: string;
  create?: string;
  edit?: string;
  show?: string;
};

type ResourceMeta = {
  label?: string;              // resource 的顯示名稱
  hide?: boolean;              // 是否從 menu 隱藏（被 <Sider /> 用）
  dataProviderName?: string;   // 此 resource 專用的 data provider 名稱
  parent?: string;             // 巢狀於另一個 resource
  canDelete?: boolean;         // resource 是否有刪除能力
  audit?: ResourceAuditLogPermissions[]; // 允許 audit log 的 action
  icon?: ReactNode;            // menu 與 breadcrumb 的圖示
  [key: string]: any;
};

type ResourceAuditLogPermissions = "create" | "update" | "delete" | string;
```

---

## Provider 型別

```ts
type DataProvider = {
  getList: <TData extends BaseRecord = BaseRecord>(params: GetListParams) => Promise<GetListResponse<TData>>;
  getMany?: <TData extends BaseRecord = BaseRecord>(params: GetManyParams) => Promise<GetManyResponse<TData>>;
  getOne: <TData extends BaseRecord = BaseRecord>(params: GetOneParams) => Promise<GetOneResponse<TData>>;
  create: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: CreateParams<TVariables>) => Promise<CreateResponse<TData>>;
  createMany?: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: CreateManyParams<TVariables>) => Promise<CreateManyResponse<TData>>;
  update: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: UpdateParams<TVariables>) => Promise<UpdateResponse<TData>>;
  updateMany?: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: UpdateManyParams<TVariables>) => Promise<UpdateManyResponse<TData>>;
  deleteOne: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: DeleteOneParams<TVariables>) => Promise<DeleteOneResponse<TData>>;
  deleteMany?: <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: DeleteManyParams<TVariables>) => Promise<DeleteManyResponse<TData>>;
  getApiUrl: () => string;
  custom?: <TData extends BaseRecord = BaseRecord, TQuery = unknown, TPayload = unknown>(params: CustomParams<TQuery, TPayload>) => Promise<CustomResponse<TData>>;
};
```

> v5：`AuthProvider`（前 `AuthBindings`）、`RouterProvider`（前 `RouterBindings`）、`AccessControlProvider`、`LiveProvider`、`NotificationProvider`、`AuditLogProvider`、`I18nProvider` 皆從 `@refinedev/core` 匯入。

### LiveEvent / LiveModeProps

```ts
type LiveEvent = {
  channel: string;
  type: "deleted" | "updated" | "created" | "*" | string;
  payload: { ids?: BaseKey[]; [x: string]: any };
  date: Date;
  meta?: MetaQuery & { dataProviderName?: string };
};

type LiveModeProps = {
  liveMode?: "auto" | "manual" | "off";
  onLiveEvent?: (event: LiveEvent) => void;
  liveParams?: { ids?: BaseKey[]; [key: string]: any };
};
```

---

## Meta / GraphQL 型別

```ts
type MetaQuery = {
  queryContext?: Omit<QueryFunctionContext, "meta">;
  [key: string]: any;
} & QueryBuilderOptions & GraphQLQueryOptions;

type GraphQLQueryOptions = {
  gqlQuery?: DocumentNode;       // import { DocumentNode } from "graphql"
  gqlMutation?: DocumentNode;
  gqlVariables?: { [key: string]: any };
};

type QueryBuilderOptions = {
  operation?: string;
  fields?: Array<string | object | NestedField>;
  variables?: VariableOptions;
};

type NestedField = {
  operation: string;
  variables: QueryBuilderOptions[];
  fields: Array<string | object | NestedField>;
};

type VariableOptions = {
  type?: string;
  name?: string;
  value: any;
  list?: boolean;
  required?: boolean;
  [key: string]: any;
};
```

---

## Notification / 權限型別

```ts
type SuccessErrorNotification<TData = unknown, TError = unknown, TVariables = unknown> = {
  successNotification?:
    | OpenNotificationParams
    | false
    | ((data?: TData, values?: TVariables, resource?: string) => OpenNotificationParams | false);
  errorNotification?:
    | OpenNotificationParams
    | false
    | ((error?: TError, values?: TVariables, resource?: string) => OpenNotificationParams | false);
};

type OpenNotificationParams = {
  key?: string;                                  // 通知 key，用於管理通知狀態
  message: string;                               // 通知標題
  type: "success" | "error" | "progress";        // 通知類型
  description?: string;                          // 通知描述
  cancelMutation?: () => void;                   // undoable 通知的取消函式
  undoableTimeout?: number;                      // undoable 通知的自動關閉毫秒數
};

type CanParams = {
  resource: string;                              // resource 名稱
  action: string;                                // 意圖執行的 action 名稱
  params?: {
    resource?: IResourceItem;                    // 可推得的 resource item
    id?: BaseKey;                                // 針對特定記錄檢查時的 id
    [key: string]: unknown;
  };
};

type CanResponse = {
  can: boolean;
  reason?: string;
  [key: string]: unknown;
};

type UseImportInputPropsType = {
  type: "file";
  accept: string;                                // 例如 ".csv"
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
```
