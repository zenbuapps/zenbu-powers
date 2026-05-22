# Refine v5 — Core Utility Hooks & Components Reference

> 套件：`@refinedev/core`
> 來源：https://refine.dev/core/docs/core/

## 目錄

- [useMenu](#usemenu)
- [useBreadcrumb](#usebreadcrumb)
- [useModal](#usemodal)
- [useImport](#useimport)
- [useExport](#useexport)
- [Button hooks](#button-hooks)
- [`<AutoSaveIndicator>`](#autosaveindicator)
- [`<Inferencer>`](#inferencer)

---

## useMenu

從 `resources` 衍生 menu items（含 dashboard 連結與使用者定義的 resource 連結），支援多層巢狀。各 UI 套件的 `<Sider/>` 以此為基礎。

> ⚠️ v5：`@refinedev/antd` / `@refinedev/mui` 的 `useMenu` 已 deprecated，改用 `@refinedev/core` 的 `useMenu`。

```tsx
import { useMenu, TreeMenuItem } from "@refinedev/core";
import { Link } from "react-router";

const Layout = ({ children }) => {
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();

  const renderItems = (items: TreeMenuItem[]) =>
    items.map(({ key, name, label, icon, route, children }) => (
      <li key={name}>
        <Link to={route} style={{ fontWeight: key === selectedKey ? "bold" : "normal" }}>
          {icon}<span>{label ?? name}</span>
        </Link>
        {children.length > 0 && <ul>{renderItems(children)}</ul>}
      </li>
    ));

  return <div><ul>{renderItems(menuItems)}</ul>{children}</div>;
};
```

回傳：`menuItems`（`TreeMenuItem[]`，每項有 `key`、`name`、`label`、`icon`、`route`、`children`）、`selectedKey`（當前 resource 的 key，從路由 infer）、`defaultOpenKeys`（預設展開的 menu key）。

多層 menu：在 resource 用 `meta.parent` 巢狀化即可遞迴渲染。

> ⚠️ v5：`TreeMenuItem` 取代 v4 的 `ITreeMenu`；`list` 永遠是字串路由（`route` 直接用）。

---

## useBreadcrumb

回傳當前頁面的 breadcrumb 陣列。

```tsx
import { useBreadcrumb } from "@refinedev/core";

const Breadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  return (
    <ul>
      {breadcrumbs.map(({ label, href, icon }) => (
        <li key={label}>{icon}{href ? <a href={href}>{label}</a> : label}</li>
      ))}
    </ul>
  );
};
```

`breadcrumbs` 型別 `BreadcrumbsType[]`：`{ label: string; href?: string; icon?: ReactNode }`。

- breadcrumb 由 resource 定義建立。list 頁顯示 resource label；create/edit 頁額外加上 action label。
- 巢狀 resource（`meta.parent`）會顯示父層。
- 任一 resource 有 `list: "/"` 時會渲染 home 圖示（可用 `showHome: false` 隱藏）。
- i18n：無 `label` 時用 `useTranslate` 翻譯 name；action 用 `translate(\`actions.${action}\`)`。

---

## useModal

headless modal 管理 hook，回傳 `show`/`close` 函式與 `visible` 狀態（UI 自行處理）。

```tsx
import { useModal } from "@refinedev/core";

const PostList = () => {
  const { visible, show, close } = useModal({ defaultVisible: false });
  return (
    <>
      <button onClick={show}>Show Modal</button>
      {visible && (
        <YourModal>
          <p>內容</p>
          <button onClick={close}>Close</button>
        </YourModal>
      )}
    </>
  );
};
```

- 參數：`defaultVisible?: boolean`（預設 `false`）。
- 回傳：`visible: boolean`、`show: () => void`、`close: () => void`。

---

## useImport

從 CSV 檔匯入資料。每一列呼叫 dataProvider 的 `create`（`batchSize: 1`）或 `createMany`（`batchSize > 1`）。底層用 Papa Parse。

```tsx
import { useImport } from "@refinedev/core";

interface IPostFile { title: string; categoryId: string; }

const PostList = () => {
  const { inputProps, isLoading, handleChange, mutation } = useImport<IPostFile>({
    resource: "posts",                    // 預設從路由讀取
    mapData: (data) => ({                 // 送出前轉換資料
      ...data,
      category: { id: data.categoryId },
    }),
    paparseOptions: { header: true },     // Papa Parse 選項
    batchSize: 1,                         // 預設 Number.MAX_SAFE_INTEGER
    meta: { foo: "bar" },
    dataProviderName: "default",
    onProgress: ({ totalAmount, processedAmount }) => {
      console.log((processedAmount / totalAmount) * 100);
    },
    onFinish: (result) => {
      result.succeeded.forEach((item) => console.log(item)); // 成功的回應
      result.errored.forEach((item) => console.log(item));   // 失敗的回應
    },
  });

  return <input {...inputProps} />; // inputProps: { type: "file", accept: ".csv", onChange }
};
```

> ⚠️ v5：`resourceName` 改名為 `resource`、`metaData` 改名為 `meta`。

回傳：`inputProps`（含 `type: "file"`、`accept: ".csv"`、`onChange`）、`handleChange({ file })`、`isLoading`、`mutation`（useCreate 或 useCreateMany 的結果）。

---

## useExport

把資料匯出成 CSV。

```tsx
import { useExport } from "@refinedev/core";

const { triggerExport, isLoading } = useExport<IPost>({
  resource: "posts",
  sorters: [{ field: "title", order: "asc" }],
  filters: [{ field: "status", operator: "eq", value: "published" }],
  meta: { foo: "bar" },
  mapData: (item) => ({ id: item.id, title: item.title }),
  maxItemCount: 1000,
  pageSize: 20,
  unparseConfig: {},          // v5：取代 v4 的 exportOptions
  dataProviderName: "default",
  onError: (error) => console.error(error),
});

<button onClick={triggerExport} disabled={isLoading}>Export</button>
```

> ⚠️ v5：`resourceName`→`resource`、`sorter`→`sorters`、`metaData`→`meta`、`exportOptions`→`unparseConfig`。

---

## Button hooks

Refine UI 套件的按鈕（導航、刪除、refresh）背後都由 core hook 驅動，可用於自訂按鈕。

| Hook | 用途 |
|------|------|
| `useListButton` | 導航至 list view |
| `useCreateButton` | 導航至 create view |
| `useShowButton` | 導航至 show view（需 `id`） |
| `useEditButton` | 導航至 edit view（需 `id`） |
| `useCloneButton` | 導航至 clone view（需 `id`） |

```tsx
import { useEditButton } from "@refinedev/core";

const { to, label, title, hidden, disabled, LinkComponent } = useEditButton({
  resource: "posts",       // 不傳則從路由 infer
  id: 1,                   // 不傳則從路由 infer
  accessControl: { enabled: true, hideIfUnauthorized: false },
  meta: { authorId: 2 },   // 路徑額外參數
});

// 用回傳值組自訂按鈕
<LinkComponent to={to} hidden={hidden}>
  <button disabled={disabled} title={title}>{label}</button>
</LinkComponent>
```

回傳值：`to`（導航路徑）、`label`（按鈕文字）、`title`（disabled 時的原因）、`hidden`、`disabled`、`LinkComponent`（router provider 提供的 Link 元件）。

> ⚠️ v5：button 的 `resourceNameOrRouteName` 改名為 `resource`；`ignoreAccessControlProvider` 改用 `accessControl={{ enabled: false }}`。

---

## `<AutoSaveIndicator>`

顯示表單 auto-save 狀態的視覺指示器。

```tsx
import { AutoSaveIndicator, useForm } from "@refinedev/core";

const EditPage = () => {
  const { autoSaveProps, onFinishAutoSave, onFinish, query } = useForm({
    autoSave: { enabled: true, interval: 1000 },
  });
  // autoSaveProps: { status: "loading"|"error"|"idle"|"success", error: HttpError|null, data?: UpdateResponse }

  return (
    <div>
      <AutoSaveIndicator {...autoSaveProps} />
      <form
        onChange={(e) => {
          // core 的 useForm 不自動觸發 auto-save，需手動呼叫 onFinishAutoSave
          const formData = new FormData(e.currentTarget);
          onFinishAutoSave(Object.fromEntries(formData.entries()));
        }}
        onSubmit={(e) => { e.preventDefault(); onFinish(values); }}
      >
        {/* ... */}
      </form>
    </div>
  );
};
```

> `@refinedev/core` 的 useForm **不自動觸發** auto-save — 需手動呼叫 `onFinishAutoSave`。`@refinedev/antd`、`@refinedev/react-hook-form` 的 useForm 會在表單值變更時自動觸發。`<AutoSaveIndicator>` 只負責顯示狀態，不含觸發邏輯。

---

## `<Inferencer>`

`@refinedev/inferencer` 套件：依 API 回傳資料自動推斷並產生 list/show/create/edit 頁面的程式碼骨架（開發用 scaffolding 工具）。

```tsx
import { AntdInferencer } from "@refinedev/inferencer/antd";

<Route path="/posts" element={<AntdInferencer resource="posts" action="list" />} />
```

各 UI 套件有對應 Inferencer：`AntdInferencer`（`@refinedev/inferencer/antd`）等。產生的程式碼可複製到專案中再客製。主要用於快速起步，非 production 元件。
