# Refine v5 — Auth Provider & Access Control API Reference

> 套件：`@refinedev/core`
> 來源：https://refine.dev/core/docs/authentication/ ｜ /authorization/

## 目錄

- [AuthProvider 介面](#authprovider-介面)
- [必要方法：login / check / logout / onError](#必要方法)
- [選用方法：register / forgotPassword / updatePassword / getPermissions / getIdentity](#選用方法)
- [Auth Hooks](#auth-hooks)
- [`<Authenticated>` 元件](#authenticated-元件)
- [Access Control Provider](#access-control-provider)
- [`useCan` / `<CanAccess>`](#usecan--canaccess)

---

## AuthProvider 介面

> ⚠️ v5：型別從 `AuthBindings` 改名為 `AuthProvider`。`legacyAuthProvider` 與 `v3LegacyAuthProviderCompatible` 旗標已**完全移除**。

```ts
import type { AuthProvider } from "@refinedev/core";

const authProvider: AuthProvider = {
  // 必要方法
  login:   async (params) => ({ success: true, redirectTo: "/" }),     // AuthActionResponse
  check:   async (params) => ({ authenticated: true }),                // CheckResponse
  logout:  async (params) => ({ success: true, redirectTo: "/login" }),// AuthActionResponse
  onError: async (error)  => ({}),                                     // OnErrorResponse
  // 選用方法
  register:       async (params) => ({ success: true }),
  forgotPassword: async (params) => ({ success: true }),
  updatePassword: async (params) => ({ success: true }),
  getPermissions: async (params) => null,
  getIdentity:    async (params) => null,
};
```

掛載：`<Refine authProvider={authProvider} />`。authProvider 非必填；不提供時 app 無認證能力，無法使用任何 auth hook / component。

回傳型別：

```ts
type AuthActionResponse = {
  success: boolean;
  redirectTo?: string;
  error?: Error;
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

---

## 必要方法

### login

驗證使用者。對應 `useLogin` hook。

```ts
login: async ({ email, password }) => {
  const user = mockUsers.find((u) => u.email === email);
  if (user) {
    localStorage.setItem("auth", JSON.stringify(user));
    return { success: true, redirectTo: "/" };
  }
  return {
    success: false,
    error: { name: "Invalid email or password", message: "Login Error" },
  };
}
```

### check

檢查使用者是否已認證。使用者導航至需認證頁面時內部自動呼叫。對應 `useIsAuthenticated`。

```ts
check: async () => {
  const user = localStorage.getItem("auth");
  if (user) return { authenticated: true };
  return {
    authenticated: false,
    logout: true,
    redirectTo: "/login",
    error: { name: "Unauthorized", message: "Check failed" },
  };
}
```

### logout

登出。對應 `useLogout`。

```ts
logout: async () => {
  localStorage.removeItem("auth");
  return { success: true, redirectTo: "/login" };
}
```

### onError

API 回傳錯誤時呼叫。可用於 token refresh、強制登出等。對應 `useOnError`。

```ts
onError: async (error) => {
  if (error.status === 401 || error.status === 403) {
    return { logout: true, redirectTo: "/login", error };
  }
  return {};
}
```

---

## 選用方法

### register

註冊新使用者（介面與 login 類似）。對應 `useRegister`。回傳 `AuthActionResponse`。

### forgotPassword

寄送密碼重設連結。對應 `useForgotPassword`。回傳 `AuthActionResponse`。

### updatePassword

更新密碼。對應 `useUpdatePassword`。回傳 `AuthActionResponse`。

### getPermissions

取得使用者權限。對應 `usePermissions`。

```ts
getPermissions: async (params) => {
  const user = localStorage.getItem("auth");
  if (user) return JSON.parse(user).roles; // 例如 ["admin"]
  return null;
}
```

> 簡單授權可用 `usePermissions`；複雜授權邏輯建議用 `accessControlProvider`。

### getIdentity

取得使用者身分資料。對應 `useGetIdentity`。

```ts
getIdentity: async () => {
  const user = localStorage.getItem("auth");
  if (user) {
    const { email, roles } = JSON.parse(user);
    return { id: 1, fullName: "Jane Doe", email, roles };
  }
  return null;
}
```

---

## Auth Hooks

全部來自 `@refinedev/core`。

| Hook | 對應方法 | 型別 | 用途 |
|------|---------|------|------|
| `useLogin` | `login` | mutation | 登入 |
| `useLogout` | `logout` | mutation | 登出 |
| `useRegister` | `register` | mutation | 註冊 |
| `useForgotPassword` | `forgotPassword` | mutation | 寄送重設連結 |
| `useUpdatePassword` | `updatePassword` | mutation | 更新密碼 |
| `useOnError` | `onError` | mutation | 錯誤處理 |
| `useIsAuthenticated` | `check` | query | 檢查是否已認證 |
| `useGetIdentity` | `getIdentity` | query | 取得使用者身分 |
| `usePermissions` | `getPermissions` | query | 取得權限 |

```tsx
import {
  useLogin, useLogout, useRegister, useForgotPassword, useUpdatePassword,
  useOnError, useIsAuthenticated, useGetIdentity, usePermissions,
} from "@refinedev/core";

// 登入
const { mutate: login } = useLogin();
login({ email: "john@mail.com", password: "123456" });
// login 方法會收到 mutation 的參數作為引數

// 登出
const { mutate: logout } = useLogout();
logout({ userId: "123" });

// 註冊
const { mutate: register } = useRegister();
register({ email, password });

// 取得使用者身分（query hook，回傳 react-query 的 useQuery 結果）
const { data: identity } = useGetIdentity<IIdentity>();
// <span>{identity?.fullName}</span>

// 取得權限
const { data: permissions } = usePermissions();
if (permissions?.includes("admin")) { /* ... */ }

// 檢查認證
const { data, isSuccess, isLoading, isError } = useIsAuthenticated();

// 錯誤處理
const { mutate: onError } = useOnError();
fetch("http://example.com/payment").catch((error) => onError(error));
```

---

## `<Authenticated>` 元件

包裝元件，依認證狀態渲染 children 或 fallback。需 `key` prop 以正確 re-render。

```tsx
import { Authenticated } from "@refinedev/core";
import { Navigate, Outlet } from "react-router";

// 保護路由
<Route
  element={
    <Authenticated key="protected" fallback={<Navigate to="/login" />}>
      <Outlet />
    </Authenticated>
  }
>
  {/* 受保護的路由 */}
</Route>

// 含 loading 狀態
<Authenticated key="page" loading={<Spinner />} fallback={<LoginForm />}>
  <Dashboard />
</Authenticated>
```

| Prop | 型別 | 說明 |
|------|------|------|
| `key` ﹡ | `string` | 唯一識別，路由變更時用 |
| `fallback` | `ReactNode` | 未認證時渲染 |
| `loading` | `ReactNode` | 認證檢查中渲染 |
| `children` | `ReactNode` | 已認證時渲染 |

---

## Access Control Provider

提供 agnostic API 管理權限控制，可整合 RBAC / ABAC / ACL，及 Casbin / CASL / Cerbos / AccessControl.js 等函式庫。

```tsx
import type { CanParams, CanResponse } from "@refinedev/core";

const accessControlProvider = {
  can: async ({ resource, action, params }: CanParams): Promise<CanResponse> => {
    if (resource === "posts" && action === "edit") {
      return { can: false, reason: "Unauthorized" };
    }
    return { can: true };
  },
  options: {
    buttons: {
      enableAccessControl: true,   // 預設 true
      hideIfUnauthorized: false,   // 預設 false（無權限時 disable 而非隱藏）
    },
    queryOptions: { /* 全域 react-query 選項 */ },
  },
};

<Refine accessControlProvider={accessControlProvider} />
```

`can` 方法簽名：`({ resource, action, params }: CanParams) => Promise<CanResponse>`

```ts
type CanParams = {
  resource: string;
  action: string;     // 如 "list" | "create" | "edit" | "show" | "delete"
  params?: { resource?: IResourceItem; id?: BaseKey; [key: string]: unknown };
};
type CanResponse = { can: boolean; reason?: string; [key: string]: unknown };
```

> ⚠️ 提供 `accessControlProvider` 本身不會強制權限控制 — 必須用 `<CanAccess />` 包裹受保護路由 / 元件。

**ABAC（Attribute Based）**：`can` 方法可存取傳給 `<Refine/>` 的 resource 物件，依 `params.resource.meta` 的欄位值授權：

```ts
can: async ({ resource, action, params }) => {
  const resourceName = params?.resource?.name;
  const meta = params?.resource?.meta?.yourUsefulMeta;
  if (resourceName === "posts" && meta === true && action === "edit") {
    return { can: false, reason: "Unauthorized" };
  }
  return { can: true };
}
```

`reason` 屬性：若 button 因無權限而 disable，`reason` 會顯示在 tooltip。

---

## `useCan` / `<CanAccess>`

### useCan

底層用 react-query 的 useQuery 包裝 `can`。

```tsx
import { useCan } from "@refinedev/core";

const { data } = useCan({
  resource: "posts",
  action: "edit",
  params: { id: 1 },
  queryOptions: { staleTime: 5 * 60 * 1000 }, // 快取以提升效能
});

if (data?.can) { /* 有權限 */ }
```

回傳 `UseQueryResult<CanResponse>`。權限檢查點多時，用 `staleTime` / `gcTime` 快取以避免效能損耗（特別是 `can` 涉及遠端端點時）。

### `<CanAccess>`

包裝元件，`can` 回 `true` 渲染 children，否則渲染 `fallback`。

```tsx
import { CanAccess } from "@refinedev/core";

<CanAccess
  resource="posts"
  action="edit"
  params={{ id: 1 }}
  fallback={<CustomFallback />}
  queryOptions={{ staleTime: 25000 }}
>
  <EditPostButton />
</CanAccess>
```
