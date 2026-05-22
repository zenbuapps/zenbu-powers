---
name: refine-v4
description: >
  Refine v4 完整技術參考。Refine 是 React 的 CRUD meta-framework，用於內部工具、
  admin panel、dashboard、B2B 應用。涵蓋 @refinedev/core 全部 data / auth / routing /
  access-control / notification / i18n / realtime / audit hooks 與 providers，
  以及 @refinedev/antd（Ant Design UI 整合）的 hooks 與 components。
  當程式碼涉及 refine、@refinedev/core、@refinedev/antd、@refinedev/react-router、
  @refinedev/nextjs-router、或以下任一識別字時，必須使用此 skill 而非搜尋 web：
  <Refine>、Refine component、dataProvider、authProvider、routerProvider、
  accessControlProvider、liveProvider、notificationProvider、i18nProvider、
  auditLogProvider、useList、useOne、useMany、useInfiniteList、useCreate、useUpdate、
  useDelete、useCreateMany、useUpdateMany、useDeleteMany、useCustom、useCustomMutation、
  useShow、useTable、useForm、useSelect、useModalForm、useDrawerForm、useStepsForm、
  useEditableTable、useSimpleList、useCheckboxGroup、useRadioGroup、useLogin、useLogout、
  useRegister、usePermissions、useGetIdentity、useIsAuthenticated、useCan、
  <CanAccess>、<Authenticated>、<AuthPage>、<List>/<Create>/<Edit>/<Show>、
  <ThemedLayoutV2>、useGo、useNavigation、useInvalidate、useNotification、useTranslation、
  resources、mutationMode、CrudFilter、CrudSort、HttpError。
  此 skill 對應 Refine v4（@refinedev/core ^4.x），不適用於 v5——v5 的 hook 回傳值
  屬性名稱、provider 簽名有 breaking changes（見 references/migration.md）。
---

# Refine v4

> **適用版本**：`@refinedev/core` ^4.x、`@refinedev/antd` ^5.x（搭配 antd ^5.x） | **文件來源**：https://refine.dev/docs/4.xx.xx/ | **最後更新**：2026-05-22

Refine 是 React 的 **CRUD-heavy meta-framework**：透過「providers」（資料、認證、路由、權限、通知、i18n、即時、稽核）與「hooks」抽象掉重複的 CRUD 樣板。它是 **headless** 的——核心 `@refinedev/core` 不含 UI；UI 由整合套件（本 skill 聚焦 `@refinedev/antd`）或自訂元件提供。

核心心智模型：
1. **`<Refine>` component** 是根，掛載所有 providers 與 `resources`。
2. **`resources`** 把 API endpoint 宣告為實體，並綁定 list/create/edit/show/clone 的路由路徑。
3. **data hooks** 對應 dataProvider 方法（`useList`→`getList`、`useOne`→`getOne`、`useCreate`→`create`…）。
4. data hooks 是 **TanStack Query 的擴充**——回傳值含 `isLoading`/`isError`/`refetch` 等 React Query 屬性，外加 `overtime`。
5. UI 整合 hooks（`@refinedev/antd` 的 `useTable`/`useForm`/`useSelect`）在 core hook 之上產生「可直接 spread 進 AntD 元件的 props 物件」。

> **v4 vs v5 命名陷阱**：v4 部分 hook 回傳值有「新名稱」與「deprecated 舊名稱」並存。本 skill 標注兩者，**寫 v4 程式碼時優先用新名稱**（見下方各 hook 與 `references/core-hooks.md`）。

## 安裝與最小設定

```bash
npm i @refinedev/core @refinedev/react-router react-router
# Ant Design 整合：
npm i @refinedev/antd antd
```

```tsx
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import dataProvider from "@refinedev/simple-rest";
import { ConfigProvider, App as AntdApp } from "antd";
import { RefineThemes, ThemedLayoutV2, useNotificationProvider, ErrorComponent } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

const App = () => (
  <BrowserRouter>
    <ConfigProvider theme={RefineThemes.Blue}>
      <AntdApp>
        <Refine
          dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
          routerProvider={routerProvider}
          notificationProvider={useNotificationProvider}
          resources={[
            {
              name: "posts",
              list: "/posts",
              create: "/posts/create",
              edit: "/posts/edit/:id",
              show: "/posts/show/:id",
              meta: { canDelete: true },
            },
          ]}
          options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
        >
          <Routes>
            <Route element={<ThemedLayoutV2><Outlet /></ThemedLayoutV2>}>
              <Route path="/posts" element={<PostList />} />
              <Route path="/posts/create" element={<PostCreate />} />
              <Route path="/posts/edit/:id" element={<PostEdit />} />
              <Route path="/posts/show/:id" element={<PostShow />} />
            </Route>
            <Route path="*" element={<ErrorComponent />} />
          </Routes>
        </Refine>
      </AntdApp>
    </ConfigProvider>
  </BrowserRouter>
);
```

> CLI 起手式：`npm create refine-app@latest`（互動式選 build tool / UI / data provider / auth）。

## `<Refine>` component 核心 props

| Prop | 型別 | 說明 |
|------|------|------|
| `dataProvider` | `DataProvider \| Record<string, DataProvider>` | 必填。單一或多個（具名）資料來源。 |
| `routerProvider` | `RouterProvider` | 路由綁定（react-router / nextjs / remix）。 |
| `resources` | `ResourceProps[]` | 實體定義（見下）。 |
| `authProvider` | `AuthProvider` | 認證流程。 |
| `accessControlProvider` | `AccessControlProvider` | 授權 / 權限。 |
| `notificationProvider` | `NotificationProvider \| (() => NotificationProvider)` | 通知顯示。`@refinedev/antd` 傳 `useNotificationProvider`。 |
| `i18nProvider` | `I18nProvider` | 多語系。 |
| `liveProvider` | `LiveProvider` | 即時更新。 |
| `auditLogProvider` | `AuditLogProvider` | 稽核日誌。 |
| `options` | `IRefineOptions` | 全域設定（見下）。 |
| `onLiveEvent` | `(event: LiveEvent) => void` | 全域 live event callback。 |

**`resources` 陣列項目形狀**：
```ts
{
  name: string;                       // API endpoint 識別字
  identifier?: string;                // 同名 resource 的區分鍵
  list?:   string | Component | { component: Component; path: string };
  create?: string | Component | { component: Component; path: string };
  edit?:   string | Component | { component: Component; path: string };
  show?:   string | Component | { component: Component; path: string };
  clone?:  string | Component | { component: Component; path: string };
  meta?: {
    label?: string; icon?: ReactNode; canDelete?: boolean;
    parent?: string;            // 父 resource → 多層選單
    dataProviderName?: string;  // 指定此 resource 用哪個 data provider
    hide?: boolean;             // 從選單隱藏
    audit?: string[];           // 哪些 action 觸發稽核（如 ["create"]）
  };
}
```

**`options` 重要欄位**（預設值）：
```ts
{
  mutationMode: "pessimistic",          // | "optimistic" | "undoable"
  undoableTimeout: 5000,                // undoable 模式的等待毫秒數
  syncWithLocation: false,              // table/list 狀態同步進 URL query
  warnWhenUnsavedChanges: false,        // 表單未儲存時警告
  liveMode: "off",                      // | "auto" | "manual"
  disableTelemetry: false,
  redirect: { afterCreate: "list", afterClone: "list", afterEdit: "list" },
  reactQuery: { clientConfig?: QueryClientConfig | QueryClient },
  textTransformers: { humanize?, plural?, singular? },
  title: { icon?: ReactNode; text?: ReactNode },
  useNewQueryKeys: false,
}
```

> **v3→v4 deprecated `<Refine>` props**：`LoginPage`/`DashboardPage`/`catchAll`/`ReadyPage`/`Sider`/`Header`/`Footer`/`Layout`/`Title`/`OffLayoutArea` 全部移除——改用 routes + `<ThemedLayoutV2>` + `<AuthPage>`。

## 核心 data hooks 速查（`@refinedev/core`）

所有 data hook 都是 TanStack Query 的擴充：query hooks 回傳 `{ data, isLoading, isError, error, refetch, ... , overtime }`；mutation hooks 回傳 `{ mutate, mutateAsync, isLoading, isError, isSuccess, ... , overtime }`。

| Hook | dataProvider 方法 | 用途 |
|------|------------------|------|
| `useList` | `getList` | 取清單（分頁/排序/篩選），`data.data` 是陣列、`data.total` 是總數 |
| `useInfiniteList` | `getList` | 無限捲動，`data.pages` + `fetchNextPage`/`hasNextPage` |
| `useOne` | `getOne` | 取單筆，`data.data` 是物件 |
| `useMany` | `getMany` | 依 `ids` 取多筆 |
| `useShow` | `getOne` | `useOne` 包裝，自動從 URL 讀 `resource`/`id` |
| `useCreate` | `create` | 建立單筆 |
| `useCreateMany` | `createMany` | 建立多筆 |
| `useUpdate` | `update` | 更新單筆（支援 mutationMode） |
| `useUpdateMany` | `updateMany` | 更新多筆 |
| `useDelete` | `deleteOne` | 刪除單筆（支援 mutationMode） |
| `useDeleteMany` | `deleteMany` | 刪除多筆 |
| `useCustom` | `custom` | 自訂 GET-like 請求（query 用，非 mutation） |
| `useCustomMutation` | `custom` | 自訂 mutation 請求 |
| `useDataProvider` | — | 取得 dataProvider 函式 |
| `useApiUrl` | `getApiUrl` | 取得 API base URL |
| `useInvalidate` | — | 手動使快取失效 |

```tsx
import { useList, useCreate, HttpError } from "@refinedev/core";

interface IPost { id: number; title: string; status: "published" | "draft"; }

// 查詢
const { data, isLoading } = useList<IPost, HttpError>({
  resource: "posts",
  pagination: { current: 1, pageSize: 10 },
  sorters: [{ field: "id", order: "desc" }],
  filters: [{ field: "status", operator: "eq", value: "published" }],
});
const posts = data?.data ?? [];

// 變更
const { mutate } = useCreate<IPost>();
mutate({ resource: "posts", values: { title: "New", status: "draft" } });
```

> 完整參數表（`queryOptions`/`meta`/`successNotification`/`liveMode`/`invalidates` 等）見 `references/core-hooks.md`。

## 常用模式

### 1. List 頁（Ant Design `useTable`）
`@refinedev/antd` 的 `useTable` 回傳 `tableProps`，直接 spread 進 AntD `<Table>`。
```tsx
import { List, useTable, EditButton, DeleteButton, TagField } from "@refinedev/antd";
import { Table, Space } from "antd";

export const PostList = () => {
  const { tableProps, sorters, filters } = useTable<IPost>({
    sorters: { initial: [{ field: "id", order: "desc" }] },
    syncWithLocation: true,
  });
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" sorter />
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column dataIndex="status" title="Status"
          render={(v) => <TagField value={v} />} />
        <Table.Column<IPost> title="Actions" render={(_, record) => (
          <Space>
            <EditButton hideText size="small" recordItemId={record.id} />
            <DeleteButton hideText size="small" recordItemId={record.id} />
          </Space>
        )} />
      </Table>
    </List>
  );
};
```

### 2. Create / Edit 頁（Ant Design `useForm`）
`formProps` spread 進 `<Form>`、`saveButtonProps` 進 `<Create>`/`<Edit>`。
```tsx
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const PostEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IPost>();
  const { selectProps } = useSelect({ resource: "categories", optionLabel: "title" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Category" name={["category", "id"]} rules={[{ required: true }]}>
          <Select {...selectProps} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
```
> `action`（create/edit/clone）與 `id` 預設由路由推斷。edit/clone 會用 `useOne` 載入既有資料填表。

### 3. Show 頁
```tsx
import { useShow } from "@refinedev/core";
import { Show, TextField, MarkdownField } from "@refinedev/antd";
import { Typography } from "antd";

export const PostShow = () => {
  const { queryResult } = useShow<IPost>();   // v4 回傳 queryResult
  const record = queryResult.data?.data;
  return (
    <Show isLoading={queryResult.isLoading}>
      <Typography.Title level={5}>Title</Typography.Title>
      <TextField value={record?.title} />
      <MarkdownField value={record?.content} />
    </Show>
  );
};
```

### 4. 認證保護
```tsx
import { Authenticated } from "@refinedev/core";

<Route element={<Authenticated key="protected" fallback={<Navigate to="/login" />}>
  <ThemedLayoutV2><Outlet /></ThemedLayoutV2>
</Authenticated>}>
  {/* 受保護的 routes */}
</Route>
```

### 5. 權限控制
```tsx
import { CanAccess } from "@refinedev/core";
<CanAccess resource="posts" action="create" fallback={<div>無權限</div>}>
  <CreateButton />
</CanAccess>
```

## 注意事項與陷阱

- **【高】v4 vs v5 hook 回傳名稱**：v4 的 `useShow`/`useForm` 回傳 `queryResult`/`mutationResult`，`useTable` 回傳 `tableQueryResult`。v4 後期文件同時引入新名 `query`/`mutation`/`tableQuery`（`tableQueryResult` 等標為 deprecated alias）。**寫 v4 時兩者都可用，但若專案 pin `@refinedev/core` 較早的 4.x，只有舊名可用**——不確定時用 `queryResult`/`mutationResult`/`tableQueryResult` 最保險。v5 已完全移除舊名。
- **【高】套件命名**：v4 全面從 `@pankod/refine-*` 改為 `@refinedev/*`。任何 `@pankod/...` import 都是 v3 殘留。
- **【高】v3 API 已改名**：`sort`→`sorters`、`metaData`→`meta`、`hasPagination`→`pagination.mode`、`initialCurrent`/`initialPageSize`→`pagination: { current, pageSize }`。`useList`/`useInfiniteList` 的 `config` prop 已移除。
- **【中】mutationMode**：`pessimistic`（預設，等 server 回應）/ `optimistic`（先更新 UI、失敗回滾）/ `undoable`（延遲 `undoableTimeout` 毫秒，可在通知列按 undo）。只有 `useUpdate`/`useUpdateMany`/`useDelete`/`useDeleteMany` 與表單支援。
- **【中】`<Authenticated>` 的 `key` prop**：同層多個 `<Authenticated>` 必須給不同 `key`，否則 React 不會 unmount/remount 導致認證邏輯錯亂。
- **【中】快取失效**：mutation 預設失效 `["list", "many"]`（`useUpdate`/`useForm` edit 另含 `"detail"`）。用 `invalidates` 覆寫，`false` 表示自行處理。
- **【中】legacy providers**：v3 的 `routerProvider`/`authProvider` 以 `legacyRouterProvider`/`legacyAuthProvider` 提供向後相容；用 legacy auth 時 auth hooks 要加 `v3LegacyAuthProviderCompatible: true`。建議遷移。
- **【低】第三方 import**：AntD、React Table、React Hook Form 等須直接從各自套件 import，不可從 `@refinedev/*` import。
- **【低】HttpError 形狀**：dataProvider 拋錯須符合 `{ message: string; statusCode: number; errors?: ValidationErrors }`，才能驅動通知與表單欄位驗證。

## References 導引

| 需求 | 參閱檔案 |
|------|---------|
| 完整 data hooks 參數表（`useList`/`useOne`/`useCreate`/`useCustom` 等所有參數、回傳值） | `references/core-hooks.md` |
| Providers 完整介面（dataProvider 全方法簽名、authProvider、routerProvider、accessControl、notification、i18n、live、audit） | `references/providers.md` |
| `@refinedev/antd` 全部 hooks（`useTable`/`useForm`/`useSelect`/`useModalForm`/`useDrawerForm`/`useStepsForm`/`useEditableTable`/`useSimpleList`） | `references/antd-hooks.md` |
| `@refinedev/antd` 全部 components（views、buttons、fields、ThemedLayoutV2、AuthPage、FilterDropdown） | `references/antd-components.md` |
| 認證 / 授權 / 路由 hooks（`useLogin` 系列、`useCan`、`<CanAccess>`、`<Authenticated>`、`useGo`/`useNavigation` 等） | `references/auth-routing.md` |
| 型別定義（`CrudFilter` 全 operators、`CrudSort`、`HttpError`、`MetaQuery`、`BaseRecord`） | `references/types.md` |
| v3→v4 遷移、CLI、guides 概念 | `references/migration.md` |
