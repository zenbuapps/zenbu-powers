# Refine v5 — Data Provider API Reference

> 套件：`@refinedev/core`、`@refinedev/simple-rest` 等
> 來源：https://refine.dev/core/docs/data/data-provider/

Data provider 是 Refine 的資料層：發送 HTTP 請求、封裝資料取得方式。data hooks 透過它與 API 通訊。Refine 內建多種熱門 API 的 data provider。

## 目錄

- [DataProvider 介面](#dataprovider-介面)
- [必要方法](#必要方法)
- [選用方法（含 bulk）](#選用方法含-bulk)
- [錯誤格式](#錯誤格式)
- [多 data provider](#多-data-provider)
- [內建 data provider 套件](#內建-data-provider-套件)
- [自訂與覆寫 data provider](#自訂與覆寫-data-provider)

---

## DataProvider 介面

```ts
import { DataProvider } from "@refinedev/core";

const dataProvider: DataProvider = {
  // 必要方法
  getList:   ({ resource, pagination, sorters, filters, meta }) => Promise,
  getOne:    ({ resource, id, meta }) => Promise,
  create:    ({ resource, variables, meta }) => Promise,
  update:    ({ resource, id, variables, meta }) => Promise,
  deleteOne: ({ resource, id, variables, meta }) => Promise,
  getApiUrl: () => "",
  // 選用方法
  getMany:    ({ resource, ids, meta }) => Promise,
  createMany: ({ resource, variables, meta }) => Promise,
  updateMany: ({ resource, ids, variables, meta }) => Promise,
  deleteMany: ({ resource, ids, variables, meta }) => Promise,
  custom:     ({ url, method, filters, sorters, payload, query, headers, meta }) => Promise,
};
```

所有方法回傳 Promise（async）。各方法對應的 data hook 見下表：

| 方法 | data hook | HTTP（simple-rest 預設） |
|------|-----------|--------------------------|
| `getList` | `useList` / `useInfiniteList` | GET |
| `getOne` | `useOne` | GET |
| `getMany` | `useMany` | GET |
| `create` | `useCreate` | POST |
| `update` | `useUpdate` | PATCH |
| `deleteOne` | `useDelete` | DELETE |
| `createMany` | `useCreateMany` | — |
| `updateMany` | `useUpdateMany` | — |
| `deleteMany` | `useDeleteMany` | — |
| `custom` | `useCustom` / `useCustomMutation` | 由 `method` 決定 |
| `getApiUrl` | `useApiUrl` | — |

---

## 必要方法

### getList

取得列表，支援排序/篩選/分頁。**必須回傳 `data` 與 `total` 兩個欄位**。

```ts
getList: async ({ resource, pagination, sorters, filters, meta }) => {
  const { currentPage = 1, pageSize = 10, mode = "server" } = pagination ?? {};
  const response = await apiClient.get(`/${resource}`, {
    params: { _page: currentPage, _limit: pageSize },
  });
  // total 來源因 API 而異：REST 常用 x-total-count header；GraphQL 用 pageInfo.total
  const total = response.headers["x-total-count"] ?? response.data.length;
  return { data: response.data, total };
};
```

參數：`resource: string`、`pagination?: Pagination`、`sorters?: CrudSorting`、`filters?: CrudFilters`、`meta?: MetaQuery`。

> `getList` 也支援 cursor-based pagination（見 useInfiniteList 文件）。

### getOne / create / update / deleteOne

```ts
getOne:    async ({ resource, id, meta }) => ({ data }),
create:    async ({ resource, variables, meta }) => ({ data }),
update:    async ({ resource, id, variables, meta }) => ({ data }),
deleteOne: async ({ resource, id, variables, meta }) => ({ data }),
```

- `id: BaseKey`、`variables: TVariables`（建立/更新的資料）。
- 全部回傳 `{ data }`。

### getApiUrl

```ts
getApiUrl: () => apiUrl,  // 回傳 API base URL 字串
```

---

## 選用方法（含 bulk）

`getMany` / `createMany` / `updateMany` / `deleteMany` 為選用 — 未實作時 Refine 會 fallback 用單筆方法逐一呼叫（效能較差，建議實作）。

```ts
getMany:    async ({ resource, ids, meta }) => ({ data }),       // ids: BaseKey[]
createMany: async ({ resource, variables, meta }) => ({ data }), // variables: TVariables[]
updateMany: async ({ resource, ids, variables, meta }) => ({ data }),
deleteMany: async ({ resource, ids, variables, meta }) => ({ data }),
```

### custom

處理非標準 REST 端點或外部資源連線。

```ts
custom: async ({ url, method, filters, sorters, payload, query, headers, meta }) => {
  return { data };
};
```

參數：`url: string`、`method: "get"|"delete"|"head"|"options"|"post"|"put"|"patch"`、`sorters?`、`filters?`、`payload?`、`query?`、`headers?`、`meta?`。

---

## 錯誤格式

Refine 期待錯誤 extends `HttpError`（`{ message, statusCode, errors? }`）。一致的錯誤介面讓 server-side validation、通知等正常運作。

```ts
import { DataProvider, HttpError } from "@refinedev/core";

getOne: async ({ resource, id }) => {
  try {
    const response = await fetch(`https://api.example.com/${resource}/${id}`);
    if (!response.ok) {
      const error: HttpError = { message: response.statusText, statusCode: response.status };
      return Promise.reject(error);
    }
    return { data: await response.json() };
  } catch (error) {
    const httpError: HttpError = {
      message: error?.message || "Something went wrong",
      statusCode: error?.status || 500,
    };
    return Promise.reject(httpError);
  }
}
```

用 Axios interceptor 統一轉換錯誤：

```ts
import axios from "axios";
import { HttpError } from "@refinedev/core";

const axiosInstance = axios.create();
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError: HttpError = {
      ...error,
      message: error.response?.data?.message,
      statusCode: error.response?.status,
    };
    return Promise.reject(customError);
  },
);
```

Server-side validation：dataProvider 回傳 reject 含 `errors` 欄位（`ValidationErrors` 型別），useForm 會自動把錯誤套到對應 form field。

---

## 多 data provider

`dataProvider` prop 傳物件，**`default` key 為必填**：

```tsx
<Refine
  dataProvider={{
    default: dataProvider("https://api.fake-rest.refine.dev"),
    fineFoods: dataProvider("https://api.finefoods.refine.dev"),
  }}
  resources={[
    { name: "posts", list: "/posts" },                       // 用 default
    { name: "products", meta: { dataProviderName: "fineFoods" } }, // 用 fineFoods
  ]}
/>
```

兩種選擇方式：
1. data hook 的 `dataProviderName` prop：`useList({ resource: "posts", dataProviderName: "default" })`
2. resource config 的 `meta.dataProviderName`（當預設，hook 可覆寫）

---

## 內建 data provider 套件

| 套件 | API |
|------|-----|
| `@refinedev/simple-rest` | 標準 REST API（基於 json-server） |
| `@refinedev/graphql` | GraphQL |
| `@refinedev/nestjsx-crud` | NestJS CRUD |
| `@refinedev/nestjs-query` | Nestjs-Query（GraphQL，完整支援 `gqlQuery`/`gqlMutation`） |
| `@refinedev/airtable` | Airtable |
| `@refinedev/strapi-v4` | Strapi v4 |
| `@refinedev/supabase` | Supabase |
| `@refinedev/hasura` | Hasura |
| `@refinedev/appwrite` | Appwrite |
| `@refinedev/medusa` | Medusa |

社群維護：Firebase、Directus、Sanity、PocketBase、PostgREST、JSON:API、SQLite 等。

### Simple REST 用法

```tsx
import dataProvider from "@refinedev/simple-rest";
import axios from "axios";

const httpClient = axios.create(); // 選用：自訂 axios instance 做認證/錯誤處理

<Refine dataProvider={dataProvider("https://api.fake-rest.refine.dev", httpClient)} />
```

Simple REST URL 設計：

| 方法 | URL | Query / Body |
|------|-----|--------------|
| getList | `apiUrl/resource` | query: pagination/sorters/filters |
| getOne | `apiUrl/resource/id` | — |
| getMany | `apiUrl/resource` | query: `id` |
| create | `apiUrl/resource` | body: variables |
| update | `apiUrl/resource/id` | body: variables |
| deleteOne | `apiUrl/resource/id` | body: `data: variables` |

透過 `meta.method` 覆寫 HTTP method、`meta.headers` 加自訂 header：

```tsx
useUpdate().mutate({ resource: "posts", id: 1, values: {...}, meta: { method: "put" } });
useOne({ resource: "posts", id: 1, meta: { headers: { "X-Custom": "value" } } });
```

---

## 自訂與覆寫 data provider

### 覆寫單一方法（spread syntax）

```tsx
import dataProvider from "@refinedev/simple-rest";

const simpleRest = dataProvider("API_URL");
const myDataProvider = {
  ...simpleRest,
  update: async ({ resource, id, variables }) => {
    const { data } = await httpClient.put(`${apiUrl}/${resource}/${id}`, variables);
    return { data };
  },
};

<Refine dataProvider={myDataProvider} />
```

### swizzle（把 data provider 原始碼複製進專案以深度客製）

```bash
npm run refine swizzle
# 選 @refinedev/simple-rest，編輯 /rest-data-provider/index.ts
```

### 完整自訂 data provider（含 filter/sorter/pagination 轉換）

```ts
import {
  DataProvider, HttpError, Pagination, CrudSorting, CrudFilters, CrudOperators,
} from "@refinedev/core";
import { stringify } from "query-string";
import axios, { AxiosInstance } from "axios";

const axiosInstance = axios.create();

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance,
): DataProvider => ({
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    const url = `${apiUrl}/${resource}`;
    const { currentPage = 1, pageSize = 10, mode = "server" } = pagination ?? {};
    const query: Record<string, any> = {};
    if (mode === "server") {
      query._start = (currentPage - 1) * pageSize;
      query._end = currentPage * pageSize;
    }
    if (sorters && sorters.length > 0) {
      query._sort = sorters.map((s) => s.field).join(",");
      query._order = sorters.map((s) => s.order).join(",");
    }
    const { data, headers } = await httpClient.get(
      `${url}?${stringify(query)}&${stringify(generateFilter(filters))}`,
    );
    return { data, total: +headers["x-total-count"] || data.length };
  },
  getOne: async ({ resource, id }) => {
    const { data } = await httpClient.get(`${apiUrl}/${resource}/${id}`);
    return { data };
  },
  create: async ({ resource, variables }) => {
    const { data } = await httpClient.post(`${apiUrl}/${resource}`, variables);
    return { data };
  },
  update: async ({ resource, id, variables }) => {
    const { data } = await httpClient.patch(`${apiUrl}/${resource}/${id}`, variables);
    return { data };
  },
  deleteOne: async ({ resource, id, variables }) => {
    const { data } = await httpClient.delete(`${apiUrl}/${resource}/${id}`, { data: variables });
    return { data };
  },
  getApiUrl: () => apiUrl,
});

const mapOperator = (operator: CrudOperators): string => {
  switch (operator) {
    case "ne": case "gte": case "lte": return `_${operator}`;
    case "contains": return "_like";
    case "eq": default: return "";
  }
};

const generateFilter = (filters?: CrudFilters) => {
  const queryFilters: Record<string, string> = {};
  filters?.forEach((filter) => {
    if (filter.operator === "or" || filter.operator === "and") {
      throw new Error("This data provider does not support nested filters");
    }
    if ("field" in filter) {
      queryFilters[`${filter.field}${mapOperator(filter.operator)}`] = filter.value;
    }
  });
  return queryFilters;
};
```
