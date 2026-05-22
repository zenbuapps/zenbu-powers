# Refine v4 — v3→v4 遷移、CLI、概念補充

> 來源：https://refine.dev/docs/4.xx.xx/migration-guide/* 、 /packages/cli/ 、 /guides-concepts/*

## v3 → v4 重大變更（Breaking Changes）

### 1. 套件命名：`@pankod` → `@refinedev`

所有套件從 `@pankod` 組織遷移到 `@refinedev`。
```bash
npm uninstall @pankod/refine-core @pankod/refine-antd @pankod/refine-react-router-v6
npm install @refinedev/core @refinedev/antd @refinedev/react-router-v6
```
> 任何 `@pankod/...` import 都是 v3 殘留，必須改寫。

### 2. routerProvider 重新設計 + resources 路由化

v3 的 routerProvider 改為更彈性的綁定式介面。**resources 改用 action-based 路徑定義**（取代 component-based）：
```tsx
// v4 寫法——resource 直接綁路徑字串
resources={[{
  name: "products",
  list: "/products",
  create: "/products/create",
  edit: "/products/edit/:id",
  show: "/products/show/:id",
}]}
```
v3 的舊 router 以 `legacyRouterProvider` 提供向後相容，但建議遷移。

### 3. authProvider 新形狀

v3 的 authProvider 以 `legacyAuthProvider` 提供。v4 新 authProvider 的方法回傳 **結構化物件**（`{ success, redirectTo, error }`）而非 resolve/reject Promise。用 legacy 版時，auth hooks 需加 `v3LegacyAuthProviderCompatible: true`。

### 4. Hook 參數標準化

| v3 | v4 |
|----|----|
| `sort` | `sorters` |
| `metaData` | `meta` |
| `hasPagination: false` | `pagination: { mode: "off" }` |
| `initialCurrent` / `initialPageSize` | `pagination: { current, pageSize }` |
| `initialSorter` | `sorters: { initial: [...] }` |
| `initialFilter` | `filters: { initial: [...] }` |
| `permanentSorter` | `sorters: { permanent: [...] }` |
| `permanentFilter` | `filters: { permanent: [...] }` |
| `useList` / `useInfiniteList` 的 `config` prop | 移除——`filters`/`sorters`/`pagination` 提升為頂層參數 |

### 5. 第三方 import 限制

AntD、Material UI、React Table、React Hook Form 等套件須**直接從各自套件 import**，不可從 `@refinedev/*` import。需個別安裝這些相依套件。
```tsx
// v3（錯）：import { Table } from "@pankod/refine-antd";
// v4（對）：
import { Table } from "antd";
import { useTable, List } from "@refinedev/antd";
```

### 6. `<Refine>` props 移除

`LoginPage`、`DashboardPage`、`catchAll`、`ReadyPage`、`Sider`、`Header`、`Footer`、`Layout`、`Title`、`OffLayoutArea` 全部移除——改用 routes + `<ThemedLayoutV2>` + `<AuthPage>` + `<ErrorComponent>`。

### 7. v4 hook 回傳值命名（v4 內部演進）

v4 早期回傳 `queryResult`/`mutationResult`/`tableQueryResult`。v4 後期版本引入新名 `query`/`mutation`/`tableQuery` 作為 alias（舊名標為 deprecated）。**v5 已完全移除舊名**。
- 寫 v4 程式碼：用 `queryResult`/`mutationResult`/`tableQueryResult` 最保險（全 4.x 版本都有）。
- 若專案 pin 較新的 4.x，新舊名皆可。

---

## `@refinedev/cli`

CLI 工具。安裝後在 `package.json` scripts 加 `"refine": "refine"`。
```bash
npm i @refinedev/cli
```

| 指令 | 用途 |
|------|------|
| `npm run refine dev` | 開發模式啟動。 |
| `npm run refine build` | 生產建置。 |
| `npm run refine start` | 啟動生產伺服器（Next.js / Remix）。 |
| `npm run refine add resource` | 為新 resource 產生 CRUD 元件。 |
| `npm run refine add provider [type]` | 新增 auth/data/live/notification provider。 |
| `npm run refine add integration` | 整合 UI 框架或路由。 |
| `npm run refine swizzle` | 把 Refine 套件內的元件 / 函式「彈出」到專案內，供客製化。 |
| `npm run refine update` | 互動式更新 Refine 套件。 |
| `npm run refine check-updates` | 列出可更新的套件。 |
| `npm run refine whoami` | 顯示開發環境資訊。 |

**Swizzle**：把預設元件（如 `<List>`、`<Edit>`）的原始碼匯出到專案內，讓你直接修改——「Swizzle Ready」的元件都支援。

**起手式**：`npm create refine-app@latest`——互動式精靈選 build tool（Vite/Next.js/Remix）、UI library、data provider、auth。

---

## Guides & Concepts 概念補充

### 資料抓取（Data Fetching）

data hook 與 dataProvider 方法一對一對應：

| Hook | dataProvider 方法 |
|------|------------------|
| `useOne` / `useShow` | `getOne` |
| `useList` / `useInfiniteList` / `useTable` | `getList` |
| `useMany` | `getMany` |
| `useCreate` / `useCreateMany` | `create` / `createMany` |
| `useUpdate` / `useUpdateMany` | `update` / `updateMany` |
| `useDelete` / `useDeleteMany` | `deleteOne` / `deleteMany` |
| `useCustom` / `useCustomMutation` | `custom` |

**多個 dataProvider**：
```tsx
<Refine dataProvider={{
  default: restProvider("https://api.example.com"),
  graphql: graphqlProvider("https://gql.example.com"),
}} />
// hook 用 dataProviderName 指定：
useList({ resource: "posts", dataProviderName: "graphql" });
```
也可在 `resources` 的 `meta.dataProviderName` 綁定特定 resource。

**關聯資料模式**：
- 一對一：連續 `useOne`（用 `queryOptions.enabled` 控制依賴）。
- 一對多：用 `useList` 加父 id 的 filter。
- 多對多：對 junction 資料多次 `useMany`。

### 表單（Forms）

`useForm` 內部協調 `useOne`（載入）+ `useCreate`/`useUpdate`（送出）。三種 action：
- **create**：不需 id，`useCreate`。
- **edit**：需 id，`useOne` 載入既有值填表 → `useUpdate`。
- **clone**：`useOne` 載入來源 → 用該值做 `useCreate`。

**伺服器端驗證**：dataProvider 拋出的 `HttpError.errors` 會自動對應到表單欄位顯示。
```ts
// dataProvider 拋錯時：
throw {
  message: "Validation failed",
  statusCode: 422,
  errors: {
    title: "Title is required",
    content: { key: "form.error.content", message: "Content too short" },
  },
} satisfies HttpError;
```

**redirect**：送出後預設導向 resource 的 list；用 `redirect` prop 改（`"show"`/`"edit"`/`"create"`/`false`），或全域 `options.redirect`。

### 表格（Tables）

`useTable` 管理分頁/排序/篩選狀態，內部包 `useList`。

**篩選 mode**：
- `filters.mode: "server"`——篩選送後端。
- `filters.mode: "off"`——前端篩選。

**篩選 defaultBehavior**：
- `"merge"`（預設）——新篩選與既有合併。
- `"replace"`——新篩選取代既有。

**`syncWithLocation`**：把分頁/篩選/排序狀態編碼進 URL query，產生可分享、可加書籤的表格狀態。

### Mutation Mode（變更模式）

| 模式 | 行為 |
|------|------|
| `pessimistic`（預設） | 立即送 API，UI 等 server 回應後才更新。資料一致但有延遲感。 |
| `optimistic` | 本地 state 立即更新（視為成功），API 同步進行。失敗則回滾並顯示錯誤。 |
| `undoable` | UI 立即更新，API 呼叫延遲 `undoableTimeout` 毫秒，期間使用者可在通知列按 undo 取消。 |

全域設定：`<Refine options={{ mutationMode: "optimistic" }} />`。
per-hook 設定優先於全域：
```tsx
const { mutate } = useUpdate();
mutate({ resource: "categories", id: "2", values: {...}, mutationMode: "optimistic" });
```
支援的 hook：`useUpdate`、`useUpdateMany`、`useDelete`、`useDeleteMany`，以及 `useForm` 系列。

### Headless 架構

`@refinedev/core` 完全不含 UI——只提供 hooks、providers、邏輯元件。UI 由整合套件（`@refinedev/antd`、`@refinedev/mui`、`@refinedev/chakra-ui`、`@refinedev/mantine`）或自訂元件（TailwindCSS、純 HTML）提供。本 skill 聚焦 `@refinedev/antd`。

### Enterprise Edition

付費版提供額外功能：Okta auth provider、Refine Devtools、進階 multitenancy。社群版（本 skill 涵蓋範圍）已足以涵蓋絕大多數 CRUD 應用。
