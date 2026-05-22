# Refine v5 — `@refinedev/react-hook-form` & `@refinedev/react-table` Reference

> 來源：https://refine.dev/core/docs/packages/

這兩個套件是 headless 表單/表格整合，不綁定 UI library，適合搭配 shadcn/ui 或 Tailwind 自訂 UI。

## 目錄

- [@refinedev/react-hook-form — useForm](#refinedevreact-hook-form--useform)
- [useModalForm / useStepsForm](#usemodalform--usestepsform)
- [@refinedev/react-table — useTable](#refinedevreact-table--usetable)
- [@refinedev/cli](#refinedevcli)

---

## `@refinedev/react-hook-form` — useForm

> v5：`@refinedev/react-hook-form` ^5.x。整合 React Hook Form 與 Refine 的 useForm。

```bash
npm i @refinedev/react-hook-form react-hook-form
```

```tsx
import { useForm } from "@refinedev/react-hook-form";
import { useSelect } from "@refinedev/core";

const PostEdit = () => {
  const {
    refineCore: { onFinish, formLoading, query, redirect, id, setId, autoSaveProps },
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm({
    refineCoreProps: {            // Refine core useForm 的所有參數放這裡
      resource: "posts",
      action: "edit",            // "create" | "edit" | "clone"，可從路由 infer
      id: 1,                     // edit/clone 必填，可從路由 infer
      redirect: "show",          // "list"|"edit"|"show"|"create"|false
      onMutationSuccess: (data, variables, context, isAutoSave) => {},
      warnWhenUnsavedChanges: true,
      autoSave: { enabled: true, interval: 1000 },
    },
  });

  const { options } = useSelect({
    resource: "categories",
    defaultValue: query?.data?.data.category.id,
  });

  return (
    <form onSubmit={handleSubmit(onFinish)}>
      <input {...register("title", { required: true })} />
      {errors.title && <span>必填</span>}
      <select {...register("category.id", { required: true })}
              defaultValue={query?.data?.data.category.id}>
        {options?.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <input type="submit" disabled={formLoading} value="Submit" />
    </form>
  );
};
```

**關鍵設計**：
- Refine core useForm 的參數放在 `refineCoreProps`；core 回傳值放在 `refineCore`。
- React Hook Form 的所有 API（`register`、`handleSubmit`、`formState`、`control`、`watch`、`reset`、`resetField` 等）直接從 useForm 回傳值取得。
- 提交：`<form onSubmit={handleSubmit(onFinish)}>`，`onFinish` 來自 `refineCore`。
- `refineCore` 含：`onFinish`、`formLoading`、`query`、`mutation`、`redirect`、`id`、`setId`、`autoSaveProps`、`onFinishAutoSave`。

修改資料後再提交：

```tsx
const { refineCore: { onFinish }, handleSubmit } = useForm();
const onFinishHandler = (data) => {
  onFinish({ fullName: `${data.name} ${data.surname}` });
};
<form onSubmit={handleSubmit(onFinishHandler)}>...</form>
```

> 此 useForm 會在表單值變更時**自動觸發 auto-save**（core 版需手動）。

### Server-side validation

dataProvider 回傳含 `errors` 的 reject（`HttpError`）時，自動把錯誤套到 `formState.errors` 對應欄位。

```tsx
// dataProvider create 回傳：
return Promise.reject({
  message: "This is an error from the server",
  statusCode: 400,
  errors: {
    name: "Name should be at least 3 characters long",
    material: "Material should start with a capital letter",
  },
} as HttpError);
// → errors.name、errors.material 自動填入
```

---

## useModalForm / useStepsForm

`@refinedev/react-hook-form` 也匯出：

### useModalForm

在 modal / drawer 中顯示表單（路由參數可能不在 URL）。

```tsx
import { useModalForm } from "@refinedev/react-hook-form";

const {
  refineCore: { onFinish, formLoading, query },
  modal: { visible, show, close, title },
  register, handleSubmit, formState: { errors },
} = useModalForm({
  refineCoreProps: { action: "create", resource: "posts" },
  syncWithLocation: true,
});

<button onClick={() => show()}>新增</button>
{visible && (
  <Modal title={title} onClose={close}>
    <form onSubmit={handleSubmit(onFinish)}>{/* ... */}</form>
  </Modal>
)}
```

`modal` 物件：`visible`、`show(id?)`、`close`、`title`、`submit`。

### useStepsForm

多步驟（wizard）表單。

```tsx
import { useStepsForm } from "@refinedev/react-hook-form";

const {
  refineCore: { onFinish },
  steps: { currentStep, gotoStep },
  register, handleSubmit, trigger,
} = useStepsForm({
  refineCoreProps: { action: "create", resource: "posts" },
  stepsProps: { isBackValidate: false },
});

// steps: { currentStep: number, gotoStep: (step: number) => void }
```

---

## `@refinedev/react-table` — useTable

> v5：`@refinedev/react-table` ^6.x。整合 TanStack Table 與 Refine。底層用 `useList`，headless。

```bash
npm i @refinedev/react-table @tanstack/react-table
```

```tsx
import React from "react";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";

interface IPost { id: number; title: string; status: string; }

const PostList = () => {
  const columns = React.useMemo<ColumnDef<IPost>[]>(() => [
    { id: "id", header: "ID", accessorKey: "id" },
    { id: "title", header: "Title", accessorKey: "title" },
    { id: "status", header: "Status", accessorKey: "status" },
  ], []);

  const {
    reactTable: {
      getHeaderGroups, getRowModel, getState,
      setPageIndex, getCanPreviousPage, getCanNextPage,
      getPageCount, nextPage, previousPage, setPageSize,
    },
    refineCore: { filters, setFilters, sorters, setSorters, currentPage, setCurrentPage, tableQuery },
  } = useTable({
    columns,
    refineCoreProps: {                 // Refine core useTable 參數放這裡
      resource: "posts",
      pagination: { pageSize: 10, mode: "server" },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      filters: { initial: [] },
      syncWithLocation: true,
    },
  });

  return (
    <table>
      <thead>
        {getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

**關鍵設計**：
- `columns` 用 TanStack Table 的 `ColumnDef`。
- ⚠️ **v5 breaking change**：TanStack Table 的所有 API（`getHeaderGroups`、`getRowModel`、`setPageIndex`、`getState` 等）歸到 **`reactTable`** 物件下（v4 是攤平在頂層）。
- Refine core 的功能（`filters`、`sorters`、`currentPage`、`setFilters` 等）在 `refineCore` 物件下。
- 所有 TanStack Table 的範例可直接複製貼上，不需修改。
- 分頁預設 server side；`pagination.mode: "client"` 改 client side、`"off"` 停用；啟用 `syncWithLocation` 同步至 URL。

---

## `@refinedev/cli`

開發工具 CLI。常用指令：

```bash
npm run refine update      # 更新 Refine 套件至最新版（含 v4→v5 升級協助）
npm run refine swizzle     # 把套件元件/provider 原始碼複製進專案以深度客製
npm run refine dev         # 開發模式（整合 devtools）
npm run refine build       # 建置
npm run refine start       # production 啟動
npm create refine-app@latest             # 建立新專案（互動式 scaffolder）
npm create refine-app@latest my-app -- --preset vite-shadcn  # 用預設組合建立
```

`@refinedev/codemod`：自動遷移（見 `migration-4x-to-5x.md`）：

```bash
npx @refinedev/codemod@latest refine4-to-refine5
```

`@refinedev/devtools`（v5 ^2.x）：開發時的 panel，檢視 query、mutation、resource 等狀態。
