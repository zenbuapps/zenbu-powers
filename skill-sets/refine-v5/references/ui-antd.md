# Refine v5 — Ant Design 整合 (`@refinedev/antd`)

> 套件：`@refinedev/antd` ^6.x（v5 生態）｜ peer：`antd` ^5.x
> 來源：https://refine.dev/core/docs/ui-integrations/ant-design/

`@refinedev/antd` 提供把 Refine 與 Ant Design 元件連接的 hooks 與 components。它不取代 `antd` — 仍可正常使用所有 Ant Design 功能。

## 目錄

- [安裝與設定](#安裝與設定)
- [useForm](#useform)
- [useTable](#usetable)
- [useSelect](#useselect)
- [useModalForm / useDrawerForm / useStepsForm](#usemodalform--usedrawerform--usestepsform)
- [useEditableTable / useSimpleList](#useeditabletable--usesimplelist)
- [CRUD View 元件](#crud-view-元件)
- [Button 元件](#button-元件)
- [Field 元件](#field-元件)
- [ThemedLayout / AuthPage / 其他](#themedlayout--authpage--其他)

> ⚠️ v5：`@refinedev/antd` v5→v6。`ThemedLayoutV2`→`ThemedLayout`、`ThemedTitleV2`→`ThemedTitle`、`ThemedSiderV2`→`ThemedSider`、`ThemedHeaderV2`→`ThemedHeader`。`useMenu` 從 antd 套件 deprecated，改用 `@refinedev/core` 的。

---

## 安裝與設定

```bash
npm i @refinedev/antd antd
```

```tsx
import { Refine, Authenticated } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import routerProvider, { NavigateToResource } from "@refinedev/react-router";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router";
import { ErrorComponent, RefineThemes, ThemedLayout, useNotificationProvider, AuthPage } from "@refinedev/antd";
import { App as AntdApp, ConfigProvider } from "antd";
import "@refinedev/antd/dist/reset.css";

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
            authProvider={authProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              { name: "products", list: "/products", show: "/products/:id",
                edit: "/products/:id/edit", create: "/products/create" },
            ]}
            options={{ syncWithLocation: true }}
          >
            <Routes>
              <Route element={
                <Authenticated key="auth" fallback={<Navigate to="/login" />}>
                  <ThemedLayout><Outlet /></ThemedLayout>
                </Authenticated>
              }>
                <Route path="/products">
                  <Route index element={<ProductList />} />
                  <Route path="create" element={<ProductCreate />} />
                  <Route path=":id" element={<ProductShow />} />
                  <Route path=":id/edit" element={<ProductEdit />} />
                </Route>
              </Route>
              <Route path="/login" element={<AuthPage type="login" />} />
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}
```

需用 `<ConfigProvider>` 包裹（提供 theme），`<AntdApp>` 提供 message/notification context。引入 `@refinedev/antd/dist/reset.css`。

---

## useForm

整合 Ant Design `<Form>`，從驗證到提交。擴充自 core 的 useForm。

```tsx
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

const PostEdit = () => {
  const { formProps, saveButtonProps, query, formLoading } = useForm<IPost>({
    action: "edit",          // "create" | "edit" | "clone"，可從路由 infer
    resource: "posts",       // 可從路由 infer
    id: 1,                   // edit/clone 必填
    redirect: "list",
    mutationMode: "pessimistic",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Select options={[
            { label: "Published", value: "published" },
            { label: "Draft", value: "draft" },
          ]} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
```

回傳：`formProps`（傳給 `<Form>`）、`saveButtonProps`（傳給提交按鈕，含自動 loading 狀態）、`query`、`mutation`、`formLoading`、`redirect`、`onFinish`、`id`、`setId`、`result`（v5 新增，含 `data`/`total`）。`<Edit>` / `<Create>` 元件接收 `saveButtonProps` 渲染儲存按鈕。

---

## useTable

回傳與 Ant Design `<Table>` 相容的 props。排序/篩選/分頁開箱即用。擴充自 core useTable。

```tsx
import { List, TagField, useTable, getDefaultSortOrder, FilterDropdown } from "@refinedev/antd";
import { Table, Input } from "antd";

const PostList = () => {
  const { tableProps, sorters, filters, searchFormProps } = useTable<IPost, HttpError>({
    resource: "posts",
    syncWithLocation: true,
    sorters: { initial: [{ field: "id", order: "desc" }] },
    pagination: { pageSize: 10, mode: "server" },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id" title="ID"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorters)}
        />
        <Table.Column dataIndex="title" title="Title" sorter={{ multiple: 1 }} />
        <Table.Column
          dataIndex="status" title="Status"
          render={(value: string) => <TagField value={value} />}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Filter status" />
            </FilterDropdown>
          )}
        />
      </Table>
    </List>
  );
};
```

- `tableProps`：傳給 `<Table>`，含 `dataSource`、`pagination`、`loading`、`onChange`。
- `tableProps.pagination`：可覆寫，如 `pagination={{ ...tableProps.pagination, position: ["bottomCenter"], size: "small" }}`。
- 排序：`<Table.Column>` 加 `sorter` prop；多重排序用 `sorter={{ multiple: N }}`；用 `getDefaultSortOrder("field", sorters)` 設預設。排序 key 取 `<Column>` 的 `key`，無則用 `dataIndex`。
- 篩選：`<Table.Column>` 的 `filterDropdown` + `<FilterDropdown>` 元件。
- `searchFormProps`：搭配 `onSearch` 連接搜尋表單。
- `result`（v5 新增）：`{ data, total }`。

`getDefaultSortOrder` / `getDefaultFilter` 為 `@refinedev/antd` 匯出的輔助函式。

---

## useSelect

管理 Ant Design `<Select>`，把 resource 記錄當選項。底層用 `useList`。

```tsx
import { useSelect } from "@refinedev/antd";
import { Select } from "antd";

const PostCreate = () => {
  const { selectProps, query } = useSelect<ICategory>({
    resource: "categories",
    optionLabel: "title",        // 預設 "title"，支援 nested path "nested.title" 與 function
    optionValue: "id",           // 預設 "id"
    searchField: "title",        // onSearch 搜尋的欄位
    filters: [{ field: "status", operator: "eq", value: "active" }],
    sorters: [{ field: "title", order: "asc" }],
  });

  return <Select placeholder="Select a category" style={{ width: 300 }} {...selectProps} />;
};
```

- `selectProps`：傳給 `<Select>`，含 `options`、`onSearch`、`loading`、`filterOption`。
- ⚠️ `useSelect` 只管資料抓取（options/loading/分頁），**不管 controlled state**。獨立使用 `<Select>` 時需自己用 `useState` 管 value/onChange，或用 `<Form.Item>`。
- `optionLabel`/`optionValue` 可傳 function：`optionLabel: (item) => \`${item.firstName} ${item.lastName}\``。

---

## useModalForm / useDrawerForm / useStepsForm

在 modal / drawer / 多步驟中顯示表單。

```tsx
import { useModalForm, useDrawerForm, useStepsForm, Edit, Create } from "@refinedev/antd";
import { Modal, Drawer, Form, Input } from "antd";

// Modal
const { formProps, modalProps, show, saveButtonProps } = useModalForm<IPost>({
  action: "create",
  syncWithLocation: true,
});
<Button onClick={() => show()}>新增</Button>
<Modal {...modalProps}>
  <Form {...formProps} layout="vertical">{/* ... */}</Form>
</Modal>

// Drawer
const { formProps, drawerProps, show, saveButtonProps } = useDrawerForm<IPost>({ action: "edit" });
<Drawer {...drawerProps}>
  <Form {...formProps}>{/* ... */}</Form>
</Drawer>

// Steps（多步驟 wizard）
const { formProps, stepsProps, current, gotoStep, saveButtonProps, formLoading } =
  useStepsForm<IPost>({ action: "create" });
<Steps {...stepsProps}>
  <Steps.Step title="Step 1" />
  <Steps.Step title="Step 2" />
</Steps>
```

`useModalForm` 回傳 `modalProps`、`show(id?)`、`close`；`useDrawerForm` 回傳 `drawerProps`；`useStepsForm` 回傳 `stepsProps`、`current`、`gotoStep`。

---

## useEditableTable / useSimpleList

```tsx
// useEditableTable：行內可編輯表格
import { useEditableTable } from "@refinedev/antd";
const {
  tableProps, formProps, isEditing, setId, saveButtonProps, cancelButtonProps, editButtonProps,
} = useEditableTable<IPost>();
// editButtonProps(id) 開啟某列的編輯；saveButtonProps 儲存；cancelButtonProps 取消

// useSimpleList：搭配 Ant Design <List>（卡片式清單，非表格）
import { useSimpleList } from "@refinedev/antd";
import { List as AntdList } from "antd";
const { listProps, query } = useSimpleList<IProduct>({ resource: "products" });
<AntdList {...listProps} renderItem={(item) => <AntdList.Item>{item.name}</AntdList.Item>} />
```

> v5：`useSimpleList` 回傳新增 `query`（取代 `queryResult`）與 `result`。

`useCheckboxGroup` / `useRadioGroup`：管理 `<Checkbox.Group>` / `<Radio.Group>`，回傳 `checkboxGroupProps` / `radioGroupProps`，用法類似 `useSelect`。

---

## CRUD View 元件

`<List>` / `<Create>` / `<Edit>` / `<Show>` 提供頁面 layout（標題、麵包屑、action 按鈕），不含邏輯。

```tsx
import { List, Create, Edit, Show } from "@refinedev/antd";

<List
  title="Custom Title"          // 預設用 resource 名稱複數
  resource="posts"              // 預設從路由讀取
  canCreate={true}              // 顯示 create 按鈕
  createButtonProps={{ size: "small" }}
  headerButtons={({ defaultButtons }) => <>{defaultButtons}<CustomButton /></>}
>
  <Table {...tableProps} rowKey="id">{/* ... */}</Table>
</List>

<Create saveButtonProps={saveButtonProps}>
  <Form {...formProps}>{/* ... */}</Form>
</Create>

<Edit saveButtonProps={saveButtonProps} canDelete deleteButtonProps={{...}}>
  <Form {...formProps}>{/* ... */}</Form>
</Edit>

<Show isLoading={query?.isLoading}>
  {/* 詳情內容 */}
</Show>
```

共用 props：`title`、`resource`、`headerButtons`、`headerProps`、`wrapperProps`、`breadcrumb`、`goBack`。`<Edit>`/`<Create>`/`<Show>` 接收 `saveButtonProps`/`isLoading`。

---

## Button 元件

導航/操作按鈕，內建 access control、確認對話框、i18n、從路由 infer 參數。

```tsx
import {
  CreateButton, EditButton, DeleteButton, ShowButton, ListButton,
  CloneButton, RefreshButton, SaveButton, ExportButton, ImportButton,
} from "@refinedev/antd";

<EditButton resource="posts" recordItemId={1} />
<DeleteButton
  resource="posts" recordItemId={1}
  confirmTitle="確定刪除？"
  onSuccess={() => {}}
  accessControl={{ enabled: true }}
/>
<CreateButton resource="posts" />
<ShowButton recordItemId={1} hideText />   // hideText 只顯示圖示
```

> ⚠️ v5：button 的 `resourceNameOrRouteName` 改名為 `resource`；`ignoreAccessControlProvider` 改用 `accessControl={{ enabled: false }}`。

`DeleteButton` 用 `useDelete`，內建確認 Popconfirm。`SaveButton` 通常從 `useForm` 的 `saveButtonProps` 取得。

---

## Field 元件

唯讀資料顯示元件（show 頁常用）。

```tsx
import {
  TextField, TagField, BooleanField, DateField, NumberField,
  EmailField, UrlField, ImageField, FileField, MarkdownField,
} from "@refinedev/antd";

<TextField value={record?.title} />
<TagField value={record?.status} />
<DateField value={record?.createdAt} format="YYYY-MM-DD" />
<NumberField value={record?.price} options={{ style: "currency", currency: "USD" }} />
<BooleanField value={record?.isActive} />
<EmailField value={record?.email} />
<UrlField value={record?.website} />
<ImageField value={record?.thumbnail} width={200} />
<MarkdownField value={record?.content} />
```

---

## ThemedLayout / AuthPage / 其他

```tsx
import { ThemedLayout, ThemedTitle, ThemedSider, ThemedHeader,
         AuthPage, ErrorComponent, RefineThemes, Breadcrumb,
         AutoSaveIndicator, useNotificationProvider } from "@refinedev/antd";

// 預設 layout（含 sider + header）
<ThemedLayout Title={({ collapsed }) => <ThemedTitle collapsed={collapsed} text="My App" />}>
  <Outlet />
</ThemedLayout>

// 認證頁（login/register/forgotPassword/resetPassword/updatePassword）
<AuthPage type="login" />
<AuthPage type="register" />
<AuthPage type="forgotPassword" />

// 錯誤頁
<ErrorComponent />

// 主題
<ConfigProvider theme={RefineThemes.Blue}>  {/* Blue/Purple/Magenta/Red/Orange/Yellow/Green */}
```

> ⚠️ v5：`ThemedLayoutV2`→`ThemedLayout`（去掉 V2 後綴），`ThemedTitleV2`/`ThemedSiderV2`/`ThemedHeaderV2` 同理。

`<AuthPage>` 的 `type`：`"login"`、`"register"`、`"forgotPassword"`、`"resetPassword"`、`"updatePassword"`。可用 `formProps`、`providers`（社群登入）、`renderContent` 客製。
