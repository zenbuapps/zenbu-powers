# Refine v4 — 認證 / 授權 / 路由 / 通知 / i18n / realtime / audit Hooks 與 Components

> 來源：https://refine.dev/docs/4.xx.xx/{authentication,authorization,routing,notification,i18n,realtime,audit-logs,core}/*

## 目錄

- [認證 hooks](#認證-hooks)
- [`<Authenticated>` 元件](#authenticated-元件)
- [授權 hooks 與 `<CanAccess>`](#授權-hooks-與-canaccess)
- [路由 hooks](#路由-hooks)
- [通知 / i18n / realtime / audit hooks](#通知--i18n--realtime--audit-hooks)
- [核心工具 hooks](#核心工具-hooks)

---

## 認證 hooks

全部呼叫 `authProvider` 的對應方法，回傳 TanStack Query `useMutation` / `useQuery` 結果。

| Hook | 對應 authProvider 方法 | 型別 | 說明 |
|------|----------------------|------|------|
| `useLogin` | `login` | mutation | 登入。 |
| `useLogout` | `logout` | mutation | 登出。 |
| `useRegister` | `register` | mutation | 註冊。 |
| `useForgotPassword` | `forgotPassword` | mutation | 忘記密碼。 |
| `useUpdatePassword` | `updatePassword` | mutation | 更新密碼。 |
| `useIsAuthenticated` | `check` | query | 認證狀態檢查，`data: { authenticated: boolean }`。 |
| `useGetIdentity` | `getIdentity` | query | 取得目前使用者，`data` 為自訂形狀。 |
| `usePermissions` | `getPermissions` | query | 取得權限，`data` 為自訂形狀。 |
| `useOnError` | `onError` | mutation | 觸發 auth 錯誤處理。 |

mutation 回傳 `{ mutate, mutateAsync, isLoading, isSuccess, isError, data, error }`；`data` 為 `AuthActionResponse`（`{ success, redirectTo?, error?, successNotification? }`）。

```tsx
import { useLogin, useLogout, useGetIdentity, usePermissions, useIsAuthenticated } from "@refinedev/core";

// 登入
const { mutate: login } = useLogin<{ email: string; password: string }>();
login({ email: "john@mail.com", password: "secret" });

// 登出
const { mutate: logout } = useLogout();
<button onClick={() => logout()}>Logout</button>;

// 取得使用者
const { data: identity } = useGetIdentity<{ name: string; email: string }>();

// 權限
const { data: permissions } = usePermissions<string[]>();

// 認證狀態
const { data: auth } = useIsAuthenticated();
if (auth?.authenticated) { /* ... */ }
```

> 用 v3 legacy auth 時，hook 要加 `v3LegacyAuthProviderCompatible: true`。

---

## `<Authenticated>` 元件

保護路由——依認證狀態條件渲染。

| Prop | 型別 | 說明 |
|------|------|------|
| `key` | `string` | **必填**。同層多個 `<Authenticated>` 必須給不同 `key`，否則 React 不會 unmount/remount，認證邏輯會錯。 |
| `children` | `ReactNode` | 已認證時渲染。 |
| `fallback` | `ReactNode` | 未認證時渲染（給了就不會自動導向）。 |
| `loading` | `ReactNode` | 檢查中渲染。 |
| `params` | `any` | 傳給 `authProvider.check` 的額外參數。 |
| `redirectOnFail` | `string \| boolean` | 認證失敗導向路徑（預設用 provider 的 `redirectTo`）。 |
| `appendCurrentPathToQuery` | `boolean` | 導向 URL 是否帶上目前路徑（預設 `true`）。 |

```tsx
import { Authenticated } from "@refinedev/core";
import { Navigate, Outlet } from "react-router";

// 受保護的 routes 群組
<Route element={
  <Authenticated key="authenticated-routes" fallback={<Navigate to="/login" />}>
    <ThemedLayoutV2><Outlet /></ThemedLayoutV2>
  </Authenticated>
}>
  <Route path="/posts" element={<PostList />} />
</Route>

// 公開 routes（已登入則導向首頁）
<Route element={
  <Authenticated key="auth-pages" fallback={<Outlet />}>
    <Navigate to="/" />
  </Authenticated>
}>
  <Route path="/login" element={<AuthPage type="login" />} />
</Route>
```

---

## 授權 hooks 與 `<CanAccess>`

### useCan

呼叫 `accessControlProvider.can`。

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `resource` | `string` | ✓ | — |
| `action` | `string` | ✓ | `"list"`/`"create"`/`"edit"`/`"show"`/`"delete"`… |
| `params` | `{ resource?; id?; [k]: any }` | | ABAC 用的額外 context。 |
| `queryOptions` | `UseQueryOptions` | | 快取設定（建議設 `staleTime` 降低檢查頻率）。 |

**回傳**：`useQuery` 結果，`data` 形狀 `{ can: boolean; reason?: string }`。

```tsx
import { useCan } from "@refinedev/core";
const { data } = useCan({
  resource: "posts", action: "create",
  queryOptions: { staleTime: 5 * 60 * 1000 },
});
if (data?.can) { /* 有權限 */ }
```

### `<CanAccess>`

`useCan` 的包裝元件。

| Prop | 型別 | 說明 |
|------|------|------|
| `resource` | `string` | 預設從路由推斷。 |
| `action` | `string` | 預設從路由推斷。 |
| `params` | `object` | 額外參數。 |
| `fallback` | `ReactNode` | 無權限時渲染。 |
| `onUnauthorized` | `({ resource, action, reason, params }) => void` | 檢查失敗 callback。 |
| `queryOptions` | `UseQueryOptions` | — |
| `children` | `ReactNode` | 有權限時渲染。 |

```tsx
import { CanAccess } from "@refinedev/core";

<CanAccess resource="posts" action="delete"
  fallback={<div>Access Denied</div>}
  onUnauthorized={({ resource, action }) => console.log(`Cannot ${action} ${resource}`)}>
  <DeleteButton recordItemId={record.id} />
</CanAccess>
```

> 所有 Refine 按鈕（`EditButton` 等）內建 access control——透過 `accessControlProvider.options.buttons` 全域控制 disable 或隱藏，或 per-button 用 `accessControl` prop。

---

## 路由 hooks

| Hook | 用途 |
|------|------|
| `useGo` | 程式化導航（推薦，現代化）。 |
| `useBack` | 上一頁。 |
| `useParsed` | 解析目前路由（resource/id/action/params）。 |
| `useResource` | 取得目前 resource 物件與 action。 |
| `useResourceParams` | 取得 resource + id + action（合併）。 |
| `useNavigation` | 舊式導航 API（resource-aware 的 list/create/edit/show/clone）。 |
| `useLink` | 取得 Link 元件。 |
| `useGetToPath` | 把 resource+action 轉成路徑字串。 |

### useGo

```tsx
import { useGo } from "@refinedev/core";
const go = useGo();

// 用 resource + action + id
go({ to: { resource: "posts", action: "edit", id: "1" }, type: "push" });

// 用路徑字串
go({ to: "/custom-page", query: { foo: "bar" }, type: "push" });

// type: "path" 回傳路徑字串而非導航
const path = go({ to: { resource: "posts", action: "list" }, type: "path" });
```
參數：`to`（路徑字串或 `{ resource, action, id, meta }`）、`query`、`hash`、`type`（`"push"|"replace"|"path"`）、`options.keepQuery`、`options.keepHash`。

### useNavigation（舊式）

回傳 resource-aware 導航函式：
```ts
{
  list:   (resource: string, type?: HistoryType, meta?) => void;
  create: (resource: string, type?: HistoryType, meta?) => void;
  edit:   (resource: string, id: BaseKey, type?: HistoryType, meta?) => void;
  show:   (resource: string, id: BaseKey, type?: HistoryType, meta?) => void;
  clone:  (resource: string, id: BaseKey, type?: HistoryType, meta?) => void;
  push:   (path: string, ...rest) => void;
  replace:(path: string, ...rest) => void;
  goBack: () => void;
  // URL 產生（不導航）
  listUrl:   (resource: string, meta?) => string;
  createUrl: (resource: string, meta?) => string;
  editUrl:   (resource: string, id: BaseKey, meta?) => string;
  showUrl:   (resource: string, id: BaseKey, meta?) => string;
  cloneUrl:  (resource: string, id: BaseKey, meta?) => string;
}
```

```tsx
import { useNavigation } from "@refinedev/core";
const { list, edit, showUrl } = useNavigation();
list("posts");
edit("posts", "1");
const url = showUrl("posts", "1");  // "/posts/show/1"
```
> 官方建議新程式碼用 `useGo` + `useGetToPath` 取代 `useNavigation`。

### useParsed / useResource / useResourceParams

```tsx
import { useParsed, useResource, useResourceParams } from "@refinedev/core";

const { resource, id, action, params, pathname } = useParsed();
const { resource, resources, action } = useResource();
const { id, resource, action } = useResourceParams();
```

---

## 通知 / i18n / realtime / audit hooks

### useNotification

```tsx
import { useNotification } from "@refinedev/core";
const { open, close } = useNotification();
open?.({ type: "success", message: "Saved", description: "...", key: "save-key" });
close?.("save-key");
```

### useTranslation

```tsx
import { useTranslation } from "@refinedev/core";
const { translate, changeLocale, getLocale } = useTranslation();
const label = translate("posts.fields.title", "Title");  // (key, defaultMessage)
changeLocale("de");
const locale = getLocale();
```

### usePublish / useSubscription

```tsx
import { usePublish, useSubscription } from "@refinedev/core";

const publish = usePublish();
publish?.({ channel: "resources/posts", type: "created", payload: { ids: [1] }, date: new Date() });

useSubscription({
  channel: "resources/posts",
  types: ["created", "updated"],
  onLiveEvent: (event) => console.log(event),
});
```

### useLog / useLogList

```tsx
import { useLog, useLogList } from "@refinedev/core";

const { log, rename } = useLog();
log?.mutate({ resource: "posts", action: "create", data: { id: 1 }, meta: {} });

const { data } = useLogList({ resource: "posts", action: "update" });
```

---

## 核心工具 hooks

### useMenu

從 `resources` 定義產生選單項目（支援多層）。

| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `hideOnMissingParameter` | `boolean` | `true` | 缺 URL 參數時隱藏該項。 |
| `meta` | `Record<string, unknown>` | `{}` | 產生含動態片段的 URL 用。 |

**回傳**：
```ts
{
  selectedKey: string | undefined;
  menuItems: TreeMenuItem[];      // IResourceItem & { key; route?; icon?; label?; children }
  defaultOpenKeys: string[];
}
```
```tsx
import { useMenu } from "@refinedev/core";
const { menuItems, selectedKey, defaultOpenKeys } = useMenu();
```

### useBreadcrumb

產生麵包屑：`const { breadcrumbs } = useBreadcrumb();`——`breadcrumbs` 為 `{ label; href?; icon? }[]`。

### useImport / useExport

```tsx
import { useImport, useExport } from "@refinedev/core";

// 匯入 CSV
const { inputProps, isLoading } = useImport({ resource: "posts" });
<input type="file" {...inputProps} />

// 匯出 CSV
const { triggerExport, isLoading: exporting } = useExport({ resource: "posts" });
<button onClick={triggerExport}>Export</button>
```

### useModal（core）

`const { visible, show, close } = useModal();`——純開關狀態（不綁 UI 函式庫）。
