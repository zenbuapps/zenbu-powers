# Refine v4 — Providers 完整介面參考

> 來源：https://refine.dev/docs/4.xx.xx/{data,authentication,routing,authorization,notification,i18n,realtime,audit-logs}/*

## 目錄

- [DataProvider](#dataprovider)
- [AuthProvider](#authprovider)
- [RouterProvider](#routerprovider)
- [AccessControlProvider](#accesscontrolprovider)
- [NotificationProvider](#notificationprovider)
- [I18nProvider](#i18nprovider)
- [LiveProvider](#liveprovider)
- [AuditLogProvider](#auditlogprovider)

---

## DataProvider

資料抽象層——Refine 與後端 API 溝通的唯一介面。data hooks 全部呼叫此處的方法。

### 必要方法

```ts
import { DataProvider, HttpError } from "@refinedev/core";

// getList — 對應 useList / useInfiniteList / useTable
getList: async ({ resource, pagination, sorters, filters, meta }) => {
  // pagination: { current?: number; pageSize?: number; mode?: "off"|"client"|"server" }
  // sorters:    CrudSort[]
  // filters:    CrudFilter[]
  return { data: T[], total: number };
}

// getOne — 對應 useOne / useShow
getOne: async ({ resource, id, meta }) => {
  // id: BaseKey
  return { data: T };
}

// create — 對應 useCreate
create: async ({ resource, variables, meta }) => {
  // variables: TVariables
  return { data: T };
}

// update — 對應 useUpdate
update: async ({ resource, id, variables, meta }) => {
  return { data: T };
}

// deleteOne — 對應 useDelete
deleteOne: async ({ resource, id, variables, meta }) => {
  return { data: T };
}

// getApiUrl — 對應 useApiUrl
getApiUrl: () => string;
```

### 選用方法

未實作時，Refine 會 fallback 到對應的單筆方法（多次呼叫）。

```ts
// getMany — 對應 useMany；缺則 fallback 多次 getOne
getMany: async ({ resource, ids, meta }) => {
  // ids: BaseKey[]
  return { data: T[] };
}

// createMany — 對應 useCreateMany；缺則 fallback 多次 create
createMany: async ({ resource, variables, meta }) => {
  // variables: TVariables[]
  return { data: T[] };
}

// updateMany — 對應 useUpdateMany；缺則 fallback 多次 update
updateMany: async ({ resource, ids, variables, meta }) => {
  return { data: T[] };
}

// deleteMany — 對應 useDeleteMany；缺則 fallback 多次 deleteOne
deleteMany: async ({ resource, ids, variables, meta }) => {
  return { data: T[] };
}

// custom — 對應 useCustom / useCustomMutation
custom: async ({ url, method, filters, sorters, payload, query, headers, meta }) => {
  // method: "get"|"delete"|"head"|"options"|"post"|"put"|"patch"
  return { data: T };
}
```

### 自訂 DataProvider 完整範例

```ts
import { DataProvider, HttpError } from "@refinedev/core";

export const dataProvider = (apiUrl: string): DataProvider => ({
  getList: async ({ resource, pagination, sorters, filters }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};
    const response = await fetch(
      `${apiUrl}/${resource}?_page=${current}&_limit=${pageSize}`,
    );
    const total = parseInt(response.headers.get("x-total-count") ?? "0", 10);
    return { data: await response.json(), total };
  },
  getOne: async ({ resource, id }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`);
    return { data: await response.json() };
  },
  create: async ({ resource, variables }) => {
    const response = await fetch(`${apiUrl}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
    });
    if (!response.ok) {
      const error: HttpError = {
        message: response.statusText,
        statusCode: response.status,
      };
      throw error;
    }
    return { data: await response.json() };
  },
  update: async ({ resource, id, variables }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
    });
    return { data: await response.json() };
  },
  deleteOne: async ({ resource, id }) => {
    await fetch(`${apiUrl}/${resource}/${id}`, { method: "DELETE" });
    return { data: {} as any };
  },
  getApiUrl: () => apiUrl,
});
```

> **錯誤處理**：拋出的錯誤須符合 `HttpError`（`{ message: string; statusCode: number; errors?: ValidationErrors }`），才能驅動通知、表單欄位驗證與 optimistic 回滾。

> **官方 data provider 套件**：`@refinedev/simple-rest`、`@refinedev/graphql`、`@refinedev/strapi-v4`、`@refinedev/supabase`、`@refinedev/airtable`、`@refinedev/appwrite`、`@refinedev/hasura`、`@refinedev/nestjs-query`、`@refinedev/nestjsx-crud`。

---

## AuthProvider

管理認證流程。v4 的 authProvider（v3 版以 `legacyAuthProvider` 提供）。

### 方法簽名

**必要**：`login`、`check`、`logout`、`onError`
**選用**：`getPermissions`、`getIdentity`、`register`、`forgotPassword`、`updatePassword`

所有「動作型」方法回傳 `AuthActionResponse`：
```ts
type AuthActionResponse = {
  success: boolean;
  redirectTo?: string;
  error?: Error;
  successNotification?: { message: string; description?: string };
  [key: string]: unknown;
};
```

`check` 回傳 `CheckResponse`：
```ts
type CheckResponse = {
  authenticated: boolean;
  redirectTo?: string;
  logout?: boolean;
  error?: Error;
};
```

`onError` 回傳 `OnErrorResponse`：
```ts
type OnErrorResponse = {
  redirectTo?: string;
  logout?: boolean;
  error?: Error;
};
```

### 完整範例

```ts
import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      localStorage.setItem("auth", JSON.stringify(user));
      return { success: true, redirectTo: "/" };
    }
    return {
      success: false,
      error: { name: "LoginError", message: "Invalid email or password" },
    };
  },
  check: async () => {
    const user = localStorage.getItem("auth");
    if (user) return { authenticated: true };
    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
      error: { name: "Unauthorized", message: "Check failed" },
    };
  },
  logout: async () => {
    localStorage.removeItem("auth");
    return { success: true, redirectTo: "/login" };
  },
  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true, redirectTo: "/login", error };
    }
    return {};
  },
  getPermissions: async () => {
    const user = localStorage.getItem("auth");
    return user ? JSON.parse(user).roles : null;
  },
  getIdentity: async () => {
    const user = localStorage.getItem("auth");
    return user ? JSON.parse(user) : null;
  },
  register: async ({ email }) => {
    if (mockUsers.find((u) => u.email === email)) {
      return {
        success: false,
        error: { name: "RegisterError", message: "User already exists" },
      };
    }
    mockUsers.push({ email, roles: ["editor"] });
    return { success: true, redirectTo: "/login" };
  },
  forgotPassword: async ({ email }) => ({ success: true, redirectTo: "/login" }),
  updatePassword: async ({ password }) => ({ success: true, redirectTo: "/login" }),
};
```

> `login`/`register` 若 `success: false`，會顯示通知；`onError` callback 不會在 `success: false` 時觸發。

---

## RouterProvider

讓 Refine 與路由函式庫互動。**選用但強烈建議**。

### bindings

```ts
type RouterProvider = {
  // 導航
  go?: () => (params: {
    to?: string;
    query?: Record<string, unknown>;
    hash?: string;
    options?: { keepQuery?: boolean; keepHash?: boolean };
    type?: "push" | "replace" | "path";  // "path" 回傳路徑字串而非導航
  }) => void | string;

  // 上一頁
  back?: () => () => void;

  // 解析目前路由 → resource / id / action / params
  parse?: () => () => {
    resource?: IResourceItem;
    id?: BaseKey;
    action?: "create" | "edit" | "show" | "list" | "clone";
    pathname?: string;
    params?: {
      filters?: CrudFilters;
      sorters?: CrudSorting;
      current?: number;
      pageSize?: number;
      [key: string]: any;
    };
  };

  // Link 元件
  Link?: React.ComponentType<{ to: string; children?: React.ReactNode }>;
};
```

### 整合套件設定

**React Router**（`@refinedev/react-router`，搭配 `react-router`）：
```tsx
import routerProvider from "@refinedev/react-router";
import { BrowserRouter } from "react-router";

<BrowserRouter>
  <Refine routerProvider={routerProvider} /* ... */ />
</BrowserRouter>
```

**Next.js**（`@refinedev/nextjs-router`）：
```tsx
// Pages Router：
import routerProvider from "@refinedev/nextjs-router/pages";
// App Router：
import routerProvider from "@refinedev/nextjs-router/app";

<Refine routerProvider={routerProvider} /* ... */ />
```

**Remix**（`@refinedev/remix-router`）：
```tsx
import routerProvider from "@refinedev/remix-router";
import { Outlet } from "@remix-run/react";

<Refine routerProvider={routerProvider}>
  <Outlet />
</Refine>
```

> query 參數以 `qs` 函式庫處理（支援巢狀物件）。`parse` 用 `matchResourceFromRoute` 比對 resource。

---

## AccessControlProvider

授權 / 權限控制。

```ts
import { AccessControlProvider } from "@refinedev/core";

type CanParams = {
  resource?: string;
  action: string;             // "list"|"create"|"edit"|"show"|"delete"|"clone"|...
  params?: { resource?: IResourceItem; id?: BaseKey; [key: string]: any };
};
type CanResponse = { can: boolean; reason?: string };  // reason 顯示於按鈕 tooltip

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }: CanParams): Promise<CanResponse> => {
    if (resource === "posts" && action === "edit") {
      return { can: false, reason: "Unauthorized to edit posts" };
    }
    return { can: true };
  },
  options: {
    buttons: {
      enableAccessControl: true,    // 預設 true：啟用按鈕權限檢查
      hideIfUnauthorized: false,    // 預設 false：無權限時 disable（true 則隱藏）
    },
    queryOptions: { staleTime: 5 * 60 * 1000 },  // 權限檢查的 React Query 設定
  },
};
```

> 與 `useCan` hook、`<CanAccess>` 元件、所有 Refine 按鈕的 `accessControl` prop 整合（見 `auth-routing.md`）。

---

## NotificationProvider

通知顯示邏輯。`@refinedev/antd` 提供 `useNotificationProvider`。

```ts
type OpenNotificationParams = {
  key?: string;
  message: string;
  type: "success" | "error" | "progress";
  description?: string;
  cancelMutation?: () => void;   // undoable mutation 的取消函式
  undoableTimeout?: number;      // undoable 倒數秒數
};

type NotificationProvider = {
  open: (params: OpenNotificationParams) => void;
  close: (key: string) => void;
};
```

**react-toastify 實作範例**：
```ts
import { toast } from "react-toastify";
import { NotificationProvider } from "@refinedev/core";

export const notificationProvider: NotificationProvider = {
  open: ({ message, key, type, undoableTimeout, cancelMutation }) => {
    if (type === "progress") {
      if (toast.isActive(key as string)) {
        toast.update(key as string, {
          progress: undoableTimeout && (undoableTimeout / 10) * 2,
          render: message,
          type: "default",
        });
      } else {
        toast(message, { toastId: key, autoClose: false, closeButton: false });
      }
    } else {
      if (toast.isActive(key as string)) {
        toast.update(key as string, { render: message, type, autoClose: 5000 });
      } else {
        toast(message, { toastId: key, type });
      }
    }
  },
  close: (key) => toast.dismiss(key),
};
```

> `useNotification` hook 回傳 `{ open, close }` 供程式化呼叫。

---

## I18nProvider

多語系。

```ts
import { I18nProvider } from "@refinedev/core";

type I18nProvider = {
  translate: (key: string, options?: any, defaultMessage?: string) => string;
  changeLocale: (lang: string, options?: any) => Promise<any> | any;
  getLocale: () => string;
};
```

**react-i18next 整合範例**：
```ts
import { I18nProvider } from "@refinedev/core";
import i18n from "./i18n";

export const i18nProvider: I18nProvider = {
  translate: (key, options, defaultMessage) =>
    i18n.t(key, defaultMessage ?? key, options),
  changeLocale: (lang) => i18n.changeLanguage(lang),
  getLocale: () => i18n.language,
};
```

> `useTranslation` hook 回傳 `{ translate, changeLocale, getLocale }`（`translate` 別名 `t`）。

---

## LiveProvider

即時 / realtime 更新。

```ts
type LiveProvider = {
  subscribe: (params: {
    channel: string;
    types: LiveEvent["type"][];   // ["created","updated","deleted","*"]
    params?: { ids?: BaseKey[]; [key: string]: any };
    callback: (event: LiveEvent) => void;
    meta?: MetaQuery;
    dataProviderName?: string;
  }) => any;                       // 回傳 subscription 物件供 unsubscribe
  unsubscribe: (subscription: any) => void;
  publish?: (event: LiveEvent) => void;
};

type LiveEvent = {
  channel: string;
  type: "deleted" | "updated" | "created" | "*" | string;
  payload: { ids?: BaseKey[]; [key: string]: any };
  date: Date;
  meta?: MetaQuery;
};
```

**liveMode**（全域 `<Refine options>` 或 per-hook）：
- `"auto"`：相關 query 自動 invalidate + refetch。
- `"manual"`：只觸發 `onLiveEvent`，不自動 refetch。
- `"off"`：停用。

```tsx
<Refine liveProvider={liveProvider} options={{ liveMode: "auto" }} />
// 或 per-hook：
useList({ resource: "posts", liveMode: "auto" });
```

相關 hooks：`useSubscription`（自訂訂閱）、`usePublish`（程式化廣播，client 端通常應避免）。
官方整合：Ably、Supabase、Appwrite、Hasura。

---

## AuditLogProvider

稽核日誌——記錄 mutation 與使用者動作。

```ts
type AuditLogProvider = {
  create: (params: {
    resource: string;
    action: string;            // "create"|"update"|"delete"|"createMany"|...
    data?: any;
    author?: { name?: string; [key: string]: any };
    previousData?: any;
    meta?: Record<string, any>;
  }) => void;
  get: (params: {
    resource: string;
    action?: string;
    meta?: Record<string, any>;
    author?: Record<string, any>;
  }) => Promise<any>;
  update: (params: { id: BaseKey; name: string }) => Promise<any>;
};
```

- `create`：mutation 成功時自動呼叫，記錄事件。
- `get`：被 `useLogList` 用於顯示活動歷史。
- `update`：依 ID 更新既有稽核事件（如改名）。

**per-resource 控制哪些 action 記錄**：
```tsx
resources={[{ name: "posts", meta: { audit: ["create"] } }]}
```

相關 hooks：`useLog`（手動觸發 `log()`）、`useLogList`（分頁查詢稽核日誌）。
