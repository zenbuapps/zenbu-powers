# Refine v4 — `@refinedev/antd` Components 完整參考

> 來源：https://refine.dev/docs/4.xx.xx/ui-integrations/ant-design/components/*

## 目錄

- [View 元件：List / Create / Edit / Show](#view-元件)
- [Button 元件](#button-元件)
- [Field 元件](#field-元件)
- [Layout：ThemedLayoutV2](#layout-themedlayoutv2)
- [AuthPage](#authpage)
- [FilterDropdown](#filterdropdown)
- [AutoSaveIndicator](#autosaveindicator)
- [其他](#其他)

---

## View 元件

四個 view 元件提供頁面版型（標題、麵包屑、動作按鈕區），**不含業務邏輯**——邏輯由 hooks 提供。

### `<List>`

| Prop | 型別 | 預設 | 說明 |
|------|------|------|------|
| `title` | `ReactNode` | resource 複數名 | 頁面標題。 |
| `resource` | `string` | 從路由推斷 | — |
| `canCreate` | `boolean` | create 元件存在則 `true` | 顯示 create 按鈕。 |
| `createButtonProps` | `ButtonProps & { resourceName?: string }` | — | create 按鈕客製。 |
| `breadcrumb` | `ReactNode \| false` | AntD Breadcrumb | — |
| `wrapperProps` | `DivProps` | — | 外層 div。 |
| `headerProps` | `PageHeaderProps` | — | header。 |
| `contentProps` | `DivProps` | — | 內容 wrapper。 |
| `headerButtons` | `ReactNode \| ({ defaultButtons }) => ReactNode` | CreateButton | header 動作按鈕。 |
| `headerButtonProps` | `SpaceProps` | — | header 按鈕容器。 |

### `<Create>`

| Prop | 型別 | 預設 | 說明 |
|------|------|------|------|
| `title` | `ReactNode` | `"Create {resource}"` | — |
| `resource` | `string` | 從路由推斷 | — |
| `saveButtonProps` | `SaveButtonProps` | — | 儲存按鈕（由 `useForm` 提供）。 |
| `isLoading` | `boolean` | `false` | — |
| `goBack` | `ReactNode` | — | 自訂返回按鈕。 |
| `breadcrumb` | `ReactNode \| false` | — | — |
| `headerButtons` / `footerButtons` | `ReactNode \| renderFn` | footer 預設 `<SaveButton>` | — |
| `headerButtonProps` / `footerButtonProps` | `SpaceProps` | — | — |
| `wrapperProps` / `headerProps` / `contentProps` | — | — | `contentProps` 是 `CardProps`。 |

### `<Edit>`

`<Create>` 的所有 props，另加：
| Prop | 型別 | 說明 |
|------|------|------|
| `recordItemId` | `BaseKey` | 路由讀不到 id 時手動指定。 |
| `canDelete` | `boolean` | 顯示 delete 按鈕。 |
| `deleteButtonProps` | `DeleteButtonProps` | delete 按鈕客製。 |
| `mutationMode` | `"pessimistic" \| "optimistic" \| "undoable"` | — |

### `<Show>`

| Prop | 型別 | 說明 |
|------|------|------|
| `title` | `ReactNode` | 預設 `"Show {resource}"`。 |
| `resource` | `string` | — |
| `recordItemId` | `BaseKey` | — |
| `canEdit` | `boolean` | 顯示 edit 按鈕。 |
| `canDelete` | `boolean` | 顯示 delete 按鈕。 |
| `isLoading` | `boolean` | — |
| `goBack` | `ReactNode` | — |
| `headerButtons` / `footerButtons` | — | — |

```tsx
import { Show, TextField, MarkdownField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

export const PostShow: React.FC = () => {
  const { queryResult } = useShow<IPost>();
  const record = queryResult.data?.data;
  return (
    <Show isLoading={queryResult.isLoading}>
      <Typography.Title level={5}>Title</Typography.Title>
      <TextField value={record?.title} />
      <Typography.Title level={5}>Content</Typography.Title>
      <MarkdownField value={record?.content} />
    </Show>
  );
};
```

---

## Button 元件

全部基於 AntD `<Button>`，整合 `useNavigation`、access control。

**共通 props**（多數按鈕通用）：
- `resource?: string`——目標 resource。
- `recordItemId?: BaseKey`——目標記錄 id。
- `hideText?: boolean`——只顯示 icon。
- `accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean }`——權限控制。
- `meta?: Record<string, unknown>`——路由參數覆寫。
- 其餘 AntD `ButtonProps`（`size`、`type`、`icon`、`onClick`…）。

| 元件 | 用途 | 專屬 props |
|------|------|-----------|
| `<CreateButton>` | 導向 create 頁 | — |
| `<EditButton>` | 導向 edit 頁 | `recordItemId` |
| `<ShowButton>` | 導向 show 頁 | `recordItemId` |
| `<ListButton>` | 導向 list 頁 | — |
| `<CloneButton>` | 導向 clone 頁 | `recordItemId` |
| `<DeleteButton>` | 刪除記錄（含確認 popconfirm） | `recordItemId`、`onSuccess?: (value) => void`、`mutationMode?`、`confirmTitle?`、`confirmOkText?`、`confirmCancelText?`、`successNotification?`、`errorNotification?`、`invalidates?` |
| `<SaveButton>` | 送出表單（由 `useForm` 提供 props） | — |
| `<RefreshButton>` | 重新載入記錄 | `recordItemId`、`dataProviderName?` |
| `<ImportButton>` | CSV 匯入（搭配 `useImport`） | `useImport` 回傳的 `inputProps` |
| `<ExportButton>` | CSV 匯出（搭配 `useExport`） | `loading?`、`onClick` |

```tsx
import { EditButton, DeleteButton, ShowButton } from "@refinedev/antd";
import { Space } from "antd";

<Space>
  <ShowButton hideText size="small" recordItemId={record.id} />
  <EditButton hideText size="small" recordItemId={record.id} />
  <DeleteButton hideText size="small" recordItemId={record.id}
    mutationMode="undoable"
    onSuccess={() => console.log("deleted")} />
</Space>
```

---

## Field 元件

唯讀顯示元件，主要用於 `<Table.Column>` 的 `render` 與 `<Show>` 頁。

| 元件 | Props | 說明 |
|------|-------|------|
| `<TextField>` | `value: ReactNode` + AntD `Text` props（`strong`、`code`…） | 基本文字（`Typography.Text`）。 |
| `<NumberField>` | `value: ReactNode`、`locale?: string \| string[]`、`options?: Intl.NumberFormatOptions` | 數字格式化（`Intl.NumberFormat`）。 |
| `<DateField>` | `value: string \| number \| Date \| Dayjs`、`locales?: string`、`format?: string`（預設 `"L"`） | 日期格式化。 |
| `<BooleanField>` | `value`、`valueLabelTrue?`（預設 `"true"`）、`valueLabelFalse?`（預設 `"false"`）、`trueIcon?`（預設 `CheckOutlined`）、`falseIcon?`（預設 `CloseOutlined`） | 布林（含 Tooltip）。 |
| `<EmailField>` | `value: string` | mailto 連結。 |
| `<UrlField>` | `value: string`、`title?: string` + AntD `Link` props | 超連結。 |
| `<TagField>` | `value: ReactNode` + AntD `Tag` props（`color`…） | 標籤。 |
| `<MarkdownField>` | `value: string` | 渲染 Markdown。 |
| `<ImageField>` | `value: string`、`imageTitle?: string` + AntD `Image` props（`width`、`title`…） | 圖片（含預覽）。 |
| `<FileField>` | `src: string`、`title?: string` + AntD `Link` props | 檔案下載連結。 |

```tsx
import { DateField, NumberField, BooleanField, TagField, ImageField } from "@refinedev/antd";

<Table.Column dataIndex="createdAt" title="Created"
  render={(v) => <DateField value={v} format="YYYY-MM-DD" />} />
<Table.Column dataIndex="price" title="Price"
  render={(v) => <NumberField value={v} options={{ style: "currency", currency: "USD" }} />} />
<Table.Column dataIndex="isActive" title="Active"
  render={(v) => <BooleanField value={v} valueLabelTrue="啟用" valueLabelFalse="停用" />} />
<Table.Column dataIndex="status" title="Status"
  render={(v) => <TagField value={v} color="blue" />} />
<Table.Column dataIndex="avatar" title="Avatar"
  render={(v) => <ImageField value={v} width={48} />} />
```

---

## Layout：ThemedLayoutV2

響應式版型（header + sider + content）。

**`<ThemedLayoutV2>` props**：
| Prop | 型別 | 說明 |
|------|------|------|
| `Sider` | `React.FC` | 替換側欄。 |
| `Header` | `React.FC` | 替換 header。 |
| `Title` | `React.FC` | 替換標題。 |
| `Footer` | `React.FC` | footer（無預設）。 |
| `OffLayoutArea` | `React.FC` | 版型外的內容。 |
| `initialSiderCollapsed` | `boolean` | 側欄初始收合狀態。 |
| `onSiderCollapsed` | `(collapsed: boolean) => void` | 收合 callback。 |
| `children` | `ReactNode` | 頁面內容。 |

**子元件**：
- `<ThemedSiderV2>`：`Title`、`render`、`meta`、`fixed`、`activeItemDisabled`、`onSiderCollapsed`。
- `<ThemedHeaderV2>`：`sticky`。
- `<ThemedTitleV2>`：`collapsed`、`icon`、`text`。

```tsx
import { ThemedLayoutV2, ThemedHeaderV2, ThemedSiderV2, ThemedTitleV2 } from "@refinedev/antd";
import { Outlet } from "react-router";

<ThemedLayoutV2
  initialSiderCollapsed={false}
  Header={() => <ThemedHeaderV2 sticky />}
  Sider={() => <ThemedSiderV2 fixed />}
  Title={({ collapsed }) => <ThemedTitleV2 collapsed={collapsed} text="My App" />}
>
  <Outlet />
</ThemedLayoutV2>
```
> `useThemedLayoutContext()` 可在任意子元件程式化控制側欄收合。

---

## AuthPage

開箱即用的認證頁面，與 `authProvider` 整合。

**`<AuthPage>` props**：
| Prop | 型別 | 說明 |
|------|------|------|
| `type` | `"login" \| "register" \| "forgotPassword" \| "updatePassword"` | 頁面類型（預設 `"login"`）。 |
| `providers` | `OAuthProvider[]` | 第三方登入選項（`{ name, label, icon }`）。 |
| `rememberMe` | `ReactNode \| false` | 記住我（`false` 隱藏）。 |
| `registerLink` | `ReactNode \| false` | 前往註冊連結。 |
| `loginLink` | `ReactNode \| false` | 前往登入連結。 |
| `forgotPasswordLink` | `ReactNode \| false` | 前往忘記密碼連結。 |
| `wrapperProps` | `DivProps` | 外層樣式。 |
| `contentProps` | `CardProps` | card 樣式。 |
| `formProps` | `FormProps` | 表單設定。 |
| `title` | `ReactNode` | 自訂標題。 |
| `hideForm` | `boolean` | 隱藏表單只顯示 providers。 |
| `renderContent` | `(content: ReactNode, title: ReactNode) => ReactNode` | 自訂內容渲染。 |

```tsx
import { AuthPage } from "@refinedev/antd";

export const LoginPage = () => (
  <AuthPage
    type="login"
    providers={[{ name: "google", label: "Sign in with Google" }]}
    registerLink={<a href="/register">Register</a>}
  />
);
```

---

## FilterDropdown

橋接 AntD `<Table>` column 的 `filterDropdown` prop 與 Refine 的 filter 系統——把子元件的值同步進 table filter 狀態。

**props**（多數來自 AntD `filterDropdown` context）：`selectedKeys`、`setSelectedKeys`、`confirm`、`clearFilters`，外加：
- `mapValue?: (selectedKeys: React.Key[], event: "onChange" | "value") => any`——值轉換。當子元件的資料型別與 Refine filter 不同時用（如 string↔number、Dayjs↔ISO 字串）。

`FilterDropdown` 自動渲染「篩選」與「清除」兩個按鈕。

```tsx
import { FilterDropdown, getDefaultFilter } from "@refinedev/antd";
import { Select, Radio } from "antd";

<Table.Column dataIndex="status" title="Status"
  defaultFilteredValue={getDefaultFilter("status", filters, "eq")}
  filterDropdown={(props) => (
    <FilterDropdown {...props}>
      <Radio.Group>
        <Radio value="published">Published</Radio>
        <Radio value="draft">Draft</Radio>
      </Radio.Group>
    </FilterDropdown>
  )} />
```

日期區間搭配 `rangePickerFilterMapper`（Dayjs ↔ ISO 8601）：
```tsx
import { FilterDropdown, rangePickerFilterMapper } from "@refinedev/antd";
import { DatePicker } from "antd";

<FilterDropdown {...props} mapValue={(keys, event) => rangePickerFilterMapper(keys, event)}>
  <DatePicker.RangePicker />
</FilterDropdown>
```

---

## AutoSaveIndicator

顯示 `useForm` 自動儲存狀態的指示器。

**props**：`autoSaveProps`（直接傳 `useForm` 回傳的 `autoSaveProps`），含 `{ status: "idle" | "loading" | "success" | "error" }`。

```tsx
import { Edit, useForm, AutoSaveIndicator } from "@refinedev/antd";

const { formProps, saveButtonProps, autoSaveProps } = useForm({
  autoSave: { enabled: true, debounce: 2000 },
});
<Edit saveButtonProps={saveButtonProps}
  headerButtons={<AutoSaveIndicator {...autoSaveProps} />}>
  {/* ... */}
</Edit>
```

---

## 其他

- **`<ErrorComponent>`**：404 / 錯誤頁，放在 catch-all route。
- **`<Breadcrumb>`**：麵包屑導航，可獨立使用。
- **Inferencer**（`@refinedev/inferencer/antd`）：根據 API 回應自動生成 list/show/edit/create 元件骨架（開發加速用，正式環境應替換為手寫元件）。
- **`RefineThemes`**：預設主題集（`RefineThemes.Blue`、`.Purple`、`.Magenta`、`.Red`、`.Orange`、`.Yellow`、`.Green`），傳入 AntD `<ConfigProvider theme={...}>`。
