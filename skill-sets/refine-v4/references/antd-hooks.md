# Refine v4 — `@refinedev/antd` Hooks 完整參考

> 來源：https://refine.dev/docs/4.xx.xx/ui-integrations/ant-design/hooks/*
> 安裝：`npm i @refinedev/antd antd`

## 目錄

- [共通說明](#共通說明)
- [useTable](#usetable)
- [useForm](#useform)
- [useSelect](#useselect)
- [useModalForm](#usemodalform)
- [useDrawerForm](#usedrawerform)
- [useStepsForm](#usestepsform)
- [useEditableTable](#useeditabletable)
- [useSimpleList](#usesimplelist)
- [useCheckboxGroup / useRadioGroup](#usecheckboxgroup--useradiogroup)
- [useModal](#usemodal)
- [useImport](#useimport)

---

## 共通說明

- `@refinedev/antd` 的 hooks 在 `@refinedev/core` 同名 hook 之上，額外產生「可直接 spread 進 Ant Design 元件的 props 物件」（`tableProps`、`formProps`、`selectProps`、`modalProps`…）。
- 參數與 core 版大致相同（見 `core-hooks.md`），此處只列差異與 AntD 專屬欄位。
- **v4 命名陷阱**：回傳值用 `tableQueryResult`/`queryResult`/`mutationResult`（v4 主名稱）。v4 後期文件引入 `tableQuery`/`query`/`mutation` 作為 alias，但早期 4.x 沒有——**不確定時用 `...Result` 結尾的名稱**。v5 已移除舊名。
- `notificationProvider` 用 `useNotificationProvider`（`import { useNotificationProvider } from "@refinedev/antd"`）。

---

## useTable

包裝 core `useTable`，產生 AntD `<Table>` 的 props。

**參數**：同 core `useTable`（`resource`、`pagination`、`sorters`、`filters`、`syncWithLocation`、`queryOptions`、`meta`、`dataProviderName`、`liveMode`、通知…），另有：
- `onSearch?: (values: TSearchVariables) => CrudFilters | Promise<CrudFilters>`——搜尋表單送出處理器。

**回傳**：
```ts
{
  tableProps: {           // spread 進 <Table>
    dataSource: TData[];
    loading: boolean;
    pagination: { current; pageSize; total; ... } | false;
    scroll: { x: true };
    onChange: (pagination, filters, sorter) => void;
  };
  searchFormProps: {      // spread 進搜尋用 <Form>
    form: FormInstance;
    onFinish: (values) => void;
    layout: string;
  };
  tableQueryResult: QueryObserverResult<GetListResponse<TData>>;  // v4 主名稱
  tableQuery: ...;        // v4 後期 alias
  sorters: CrudSorting; setSorters: (s: CrudSorting) => void;
  filters: CrudFilters; setFilters: (f, behavior?) => void;
  current?: number; setCurrent?: (p: number) => void;
  pageSize?: number; setPageSize?: (s: number) => void;
  pageCount?: number;
  createLinkForSyncWithLocation: (params) => string;
  overtime: { elapsedTime?: number };
}
```

**完整範例**：
```tsx
import { HttpError } from "@refinedev/core";
import { List, useTable, FilterDropdown, TagField, EditButton } from "@refinedev/antd";
import { Table, Form, Input, Radio, Button } from "antd";

interface IPost { id: number; title: string; status: "published" | "draft" | "rejected"; }
interface ISearch { title: string; }

export const PostList: React.FC = () => {
  const { tableProps, searchFormProps, sorters, filters } = useTable<IPost, HttpError, ISearch>({
    pagination: { pageSize: 20 },
    sorters: { initial: [{ field: "id", order: "desc" }] },
    filters: { initial: [{ field: "status", operator: "eq", value: "published" }] },
    onSearch: (values) => [{ field: "title", operator: "contains", value: values.title }],
    syncWithLocation: true,
  });

  return (
    <List>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="title"><Input placeholder="Search by title" /></Form.Item>
        <Button onClick={searchFormProps.form?.submit}>Search</Button>
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" sorter />
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column dataIndex="status" title="Status"
          render={(value: string) => <TagField value={value} />}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Radio.Group>
                <Radio value="published">Published</Radio>
                <Radio value="draft">Draft</Radio>
              </Radio.Group>
            </FilterDropdown>
          )} />
        <Table.Column<IPost> title="Actions"
          render={(_, record) => <EditButton hideText size="small" recordItemId={record.id} />} />
      </Table>
    </List>
  );
};
```

---

## useForm

包裝 core `useForm`，產生 AntD `<Form>` 與 save 按鈕的 props。

**參數**：同 core `useForm`，另有：
- `submitOnEnter?: boolean`（預設 `false`）——按 Enter 送出。
- `defaultFormValues?: TVariables | (() => TVariables | Promise<TVariables>)`——初始欄位值。
- `warnWhenUnsavedChanges?: boolean`。
- `autoSave?: { enabled; debounce?; ... }`。

**回傳**：
```ts
{
  form: FormInstance<TVariables>;
  formProps: {            // spread 進 <Form>
    onFinish: (values) => Promise<void>;
    onValuesChange; onKeyUp; initialValues; layout?;
  };
  saveButtonProps: { disabled: boolean; loading: boolean; onClick: () => void };
  formLoading: boolean;
  defaultFormValuesLoading: boolean;
  queryResult: QueryObserverResult<...>;   // v4 主名稱（edit/clone）
  mutationResult: UseMutationResult<...>;  // v4 主名稱
  query / mutation: ...;                   // v4 後期 alias
  onFinish: (values?: TVariables) => Promise<CreateResponse | UpdateResponse | void>;
  redirect: (to: "list"|"edit"|"show"|"create"|false, id?: BaseKey) => void;
  id?: BaseKey; setId: (id: BaseKey) => void;
  overtime: { elapsedTime?: number };
  autoSaveProps: { data?; error?; status: "idle"|"loading"|"success"|"error" };
}
```

**完整範例**（Edit 頁）：
```tsx
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

interface IPost { id: number; title: string; content: string; status: string; }

export const PostEdit: React.FC = () => {
  const { formProps, saveButtonProps, formLoading, queryResult } = useForm<IPost>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Content" name="content" rules={[{ required: true }]}>
          <Input.TextArea rows={6} />
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
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
> `formProps` 必須 spread 進 `<Form>` 才能運作。`action`/`id` 預設由路由推斷。

---

## useSelect

包裝 core `useSelect`，產生 AntD `<Select>` 的 props。

**參數**：同 core `useSelect`（`resource`、`optionLabel`、`optionValue`、`searchField`、`sorters`、`filters`、`defaultValue`、`debounce`、`onSearch`、`pagination`、`queryOptions`…）。

**回傳**：
```ts
{
  selectProps: {          // spread 進 <Select>
    options: { label: string; value: any }[];
    loading: boolean;
    onSearch: (value: string) => void;
    filterOption: boolean;
    notFoundContent: ReactNode;
  };
  queryResult: QueryObserverResult<...>;             // v4 主名稱
  defaultValueQueryResult: QueryObserverResult<...>;  // v4 主名稱
  overtime: { elapsedTime?: number };
}
```

```tsx
import { useSelect } from "@refinedev/antd";
import { Select } from "antd";

interface ICategory { id: number; title: string; }

export const CategorySelect: React.FC = () => {
  const { selectProps } = useSelect<ICategory>({
    resource: "categories",
    optionLabel: "title",
    optionValue: "id",
    onSearch: (value) => [{ field: "title", operator: "contains", value }],
    sorters: [{ field: "title", order: "asc" }],
    defaultValue: 1,
  });
  return <Select placeholder="Select a category" style={{ width: 300 }} {...selectProps} />;
};
```

---

## useModalForm

`useForm` + modal 狀態管理。在 AntD `<Modal>` 內做 create/edit/clone。

**參數**：同 `useForm`，另有：
- `defaultVisible?: boolean`（預設 `false`）——modal 初始開啟。
- `syncWithLocation?: boolean | { key: string; syncId?: boolean }`——可見狀態 / id 同步進 URL。
- `autoSubmitClose?: boolean`（預設 `true`）——成功送出後關閉。
- `autoResetForm?: boolean`（預設 `true`）——送出後清空欄位。
- `autoResetFormWhenClose?: boolean`（預設 `true`）——關閉時重置。
- `warnWhenUnsavedChanges?: boolean`。

**回傳**（v4）：
```ts
{
  modalProps: {           // spread 進 <Modal>
    title; okText; cancelText; width; forceRender;
    open: boolean; onOk: () => void; onCancel: (e) => void;
    okButtonProps: { loading; disabled; onClick };
  };
  formProps: { onFinish; onValuesChange; initialValues; onFieldsChange; form };
  form: FormInstance<TVariables>;
  show: (id?: BaseKey) => void;
  close: () => void;
  submit: () => void;
  open: boolean;
  formLoading: boolean;
  defaultFormValuesLoading: boolean;
  id?: BaseKey; setId: (id: BaseKey) => void;
  queryResult: QueryObserverResult<...>;   // v4 主名稱
  mutationResult: UseMutationResult<...>;  // v4 主名稱
  saveButtonProps: { disabled; loading; onClick };
  overtime: { elapsedTime?: number };
  autoSaveProps: { data?; error?; status };
}
```

```tsx
import { useModalForm, useTable, List, EditButton } from "@refinedev/antd";
import { Modal, Form, Input, Select, Table } from "antd";

export const PostList: React.FC = () => {
  const { tableProps } = useTable<IPost>();
  const { modalProps, formProps, show } = useModalForm<IPost>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  return (
    <>
      <List>
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column dataIndex="title" title="Title" />
          <Table.Column<IPost> title="Actions"
            render={(_, record) => (
              <EditButton hideText size="small" onClick={() => show(record.id)} />
            )} />
        </Table>
      </List>
      <Modal {...modalProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select options={[
              { label: "Published", value: "published" },
              { label: "Draft", value: "draft" },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
```

---

## useDrawerForm

`useForm` + drawer 狀態管理。同 `useModalForm` 但用 AntD `<Drawer>`。

**參數**：同 `useModalForm`（`action`、`syncWithLocation`、`autoSave`、`defaultFormValues`、`warnWhenUnsavedChanges`…）。

**回傳**：
```ts
{
  drawerProps: {          // spread 進 <Drawer>
    open: boolean; onClose: () => void;
    width: string;        // 預設 "500px"
    forceRender: boolean; // 預設 true
  };
  formProps; saveButtonProps;
  show: (id?: BaseKey) => void; close: () => void; submit: () => void;
  open: boolean; id?: BaseKey;
  formLoading; defaultFormValuesLoading;
  overtime; autoSaveProps;
}
```

```tsx
import { Create, List, useDrawerForm, useTable } from "@refinedev/antd";
import { Drawer, Form, Input, Select, Table } from "antd";

export const PostList: React.FC = () => {
  const { tableProps } = useTable<IPost>();
  const { formProps, drawerProps, show, saveButtonProps } = useDrawerForm<IPost>({
    action: "create",
  });
  return (
    <>
      <List canCreate createButtonProps={{ onClick: () => show() }}>
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column dataIndex="title" title="Title" />
        </Table>
      </List>
      <Drawer {...drawerProps}>
        <Create saveButtonProps={saveButtonProps}>
          <Form {...formProps} layout="vertical">
            <Form.Item label="Title" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        </Create>
      </Drawer>
    </>
  );
};
```

---

## useStepsForm

`useForm` + 多步驟精靈（搭配 AntD `<Steps>`）。

**參數**：同 `useForm`，另有：
- `defaultCurrent?: number`——初始步驟（從 0 起算）。
- `total?: number`——最大步驟數。
- `isBackValidate?: boolean`——往回切步驟時是否驗證。
- `submitOnEnter?: boolean`、`autoSave?`、`overtimeOptions?`。

**回傳**：
```ts
{
  current: number;                       // 目前步驟 index（0-based）
  gotoStep: (step: number) => void;      // 跳到指定步驟
  stepsProps: { current; onChange };     // spread 進 <Steps>
  formProps; saveButtonProps;
  submit: () => void;
  formLoading: boolean;
  overtime; autoSaveProps;
  queryResult; mutationResult;
}
```

```tsx
import { Create, useStepsForm, SaveButton } from "@refinedev/antd";
import { Button, Form, Input, Steps } from "antd";

export const PostCreate: React.FC = () => {
  const { current, gotoStep, stepsProps, formProps, saveButtonProps } = useStepsForm();
  const formList = [
    <Form.Item key="title" label="Title" name="title"><Input /></Form.Item>,
    <Form.Item key="content" label="Content" name="content"><Input.TextArea /></Form.Item>,
  ];
  return (
    <Create footerButtons={
      <>
        {current > 0 && <Button onClick={() => gotoStep(current - 1)}>Previous</Button>}
        {current < formList.length - 1 && <Button onClick={() => gotoStep(current + 1)}>Next</Button>}
        {current === formList.length - 1 && <SaveButton {...saveButtonProps} />}
      </>
    }>
      <Steps {...stepsProps}>
        <Steps.Step title="About" />
        <Steps.Step title="Content" />
      </Steps>
      <Form {...formProps} layout="vertical" style={{ marginTop: 30 }}>
        {formList[current]}
      </Form>
    </Create>
  );
};
```
> 預設只驗證目前步驟；`isBackValidate: true` 才在往回時驗證。

---

## useEditableTable

`useTable` + 行內編輯（inline edit）。

**參數**：同 `useTable`，另有 `autoSubmitClose?: boolean`（預設 `true`）、`mutationMode`、`redirect`。

**回傳**：
```ts
{
  tableProps;             // spread 進 <Table>
  formProps;              // spread 進包住 <Table> 的 <Form>
  saveButtonProps: { disabled; onClick };
  cancelButtonProps: { onClick };
  editButtonProps: (id: BaseKey) => { onClick: () => void };
  setId: (id: BaseKey) => void;       // 進入該列編輯模式
  isEditing: (id: BaseKey) => boolean;
  id?: BaseKey;
  form: FormInstance;
  tableQueryResult; queryResult; mutationResult;
}
```

```tsx
import { List, useEditableTable, SaveButton, EditButton, TextField } from "@refinedev/antd";
import { Table, Form, Input, Button, Space } from "antd";

export const PostList: React.FC = () => {
  const { tableProps, formProps, isEditing, setId, saveButtonProps, cancelButtonProps, editButtonProps }
    = useEditableTable<IPost>();
  return (
    <List>
      <Form {...formProps}>
        <Table {...tableProps} rowKey="id"
          onRow={(record) => ({
            onClick: (e: any) => { if (e.target.nodeName === "TD") setId?.(record.id); },
          })}>
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column<IPost> dataIndex="title" title="Title"
            render={(value, record) =>
              isEditing(record.id)
                ? <Form.Item name="title" style={{ margin: 0 }}><Input /></Form.Item>
                : <TextField value={value} />
            } />
          <Table.Column<IPost> title="Actions"
            render={(_, record) =>
              isEditing(record.id)
                ? <Space>
                    <SaveButton {...saveButtonProps} size="small" />
                    <Button {...cancelButtonProps} size="small">Cancel</Button>
                  </Space>
                : <EditButton {...editButtonProps(record.id)} size="small" />
            } />
        </Table>
      </Form>
    </List>
  );
};
```

---

## useSimpleList

產生 AntD `<List>`（非 Table）元件的 props，含分頁/排序/篩選。

**參數**：同 core `useTable`（`resource`、`pagination`、`sorters`、`filters`、`syncWithLocation`、`queryOptions`、`onSearch`…）。

**回傳**：
```ts
{
  listProps: { dataSource: TData[]; loading: boolean; pagination: PaginationConfig };
  searchFormProps: FormProps;
  queryResult: QueryObserverResult<...>;  // v4 主名稱
  sorters: CrudSorting; setSorters;
  filters: CrudFilters; setFilters;
  current?: number; setCurrent?;
  pageSize?: number; setPageSize?;
  pageCount?: number;
}
```

```tsx
import { useSimpleList } from "@refinedev/antd";
import { List as AntdList } from "antd";

const { listProps } = useSimpleList<IProduct>({
  filters: { initial: [{ field: "name", operator: "contains", value: "Awesome" }] },
});
return <AntdList {...listProps} renderItem={(item) => <AntdList.Item>{item.name}</AntdList.Item>} />;
```

---

## useCheckboxGroup / useRadioGroup

產生 AntD `<Checkbox.Group>` / `<Radio.Group>` 的 props。

**參數**：`resource`、`optionLabel`（預設 `"title"`）、`optionValue`（預設 `"id"`）、`filters`、`sorters`、`queryOptions`、`meta`、`defaultValue`。

**回傳**：
- `useCheckboxGroup` → `{ checkboxGroupProps: { options }, queryResult }`
- `useRadioGroup` → `{ radioGroupProps: { options }, queryResult }`

```tsx
import { useCheckboxGroup, useRadioGroup } from "@refinedev/antd";
import { Checkbox, Radio, Form } from "antd";

const { checkboxGroupProps } = useCheckboxGroup({ resource: "tags", optionLabel: "title" });
const { radioGroupProps } = useRadioGroup({ resource: "languages", optionLabel: "title" });

<Form.Item name="tags"><Checkbox.Group {...checkboxGroupProps} /></Form.Item>
<Form.Item name="language"><Radio.Group {...radioGroupProps} /></Form.Item>
```

---

## useModal

純 modal 開關狀態（不含表單）。

**回傳**：`{ show: () => void; close: () => void; modalProps: ModalProps; visible: boolean }`

```tsx
import { useModal } from "@refinedev/antd";
import { Modal, Button } from "antd";

const { show, modalProps } = useModal();
<Button onClick={show}>Show Modal</Button>
<Modal {...modalProps}><p>Modal Content</p></Modal>
```

---

## useImport

CSV 匯入。回傳 `{ inputProps, isLoading, mutationResult }`，搭配 `<ImportButton>`。

```tsx
import { useImport, ImportButton } from "@refinedev/antd";

const importProps = useImport<IPost>({ resource: "posts" });
<ImportButton {...importProps} />
```
