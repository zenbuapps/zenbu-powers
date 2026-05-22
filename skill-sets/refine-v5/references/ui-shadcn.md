# Refine v5 — shadcn/ui 整合

> 來源：https://refine.dev/core/docs/ui-integrations/shadcn/

Refine 透過 **registry 系統** 整合 shadcn/ui。與傳統套件安裝不同，shadcn/ui 元件以原始碼形式複製進專案（`@/components/refine-ui/...`），你完全掌控樣式與行為，無套件相依。底層用 Radix UI（無障礙）+ Tailwind CSS。

## 目錄

- [安裝](#安裝)
- [Registry 元件清單](#registry-元件清單)
- [`<DataTable>`](#datatable)
- [Forms（react-hook-form + Zod）](#formsreact-hook-form--zod)
- [View 元件](#view-元件)
- [Button 元件](#button-元件)
- [ThemeProvider](#themeprovider)
- [Auth 元件](#auth-元件)
- [主題（CSS variables）](#主題css-variables)

---

## 安裝

最快方式 — 用 Refine CLI scaffold 新專案：

```bash
npm create refine-app@latest my-app -- --preset vite-shadcn
```

既有專案手動加入：

```bash
# 1. 先依 React framework（Vite / Next.js）安裝 shadcn/ui
# 2. 從 Refine registry 加入元件
npx shadcn@latest add https://ui.refine.dev/r/auto-save-indicator.json
npx shadcn@latest add https://ui.refine.dev/r/views.json
npx shadcn@latest add https://ui.refine.dev/r/data-table.json
npx shadcn@latest add https://ui.refine.dev/r/theme-provider.json
```

元件安裝後位於專案 `@/components/refine-ui/...`，CLI 自動安裝依賴（`@tanstack/react-table`、`react-day-picker` 等）。

---

## Registry 元件清單

| 類別 | 元件 |
|------|------|
| Form | `Forms`（完整表單）、`AutoSaveIndicator` |
| Data | `DataTable`（含 sorter / filter / pagination 子元件） |
| Auth | `SignInForm`、`SignUpForm`、`ForgotPassword` |
| Layout | `Layout 01`（完整 layout + sider）、`ThemeProvider` |
| View | `CreateView`、`EditView`、`ListView`、`ShowView` |
| Button | `CreateButton`、`EditButton`、`DeleteButton`、`ShowButton`、`ListButton`、`CloneButton`、`RefreshButton` |
| Utility | `ErrorComponent`、`NotificationProvider` |

---

## `<DataTable>`

建構於 TanStack Table，直接整合 Refine 的 `@refinedev/react-table` 的 `useTable`，提供 server-side 排序/篩選/分頁。

```tsx
import { useMemo } from "react";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { DataTableSorter } from "@/components/refine-ui/data-table/data-table-sorter";
import {
  DataTableFilterDropdownText,
  DataTableFilterDropdownNumeric,
  DataTableFilterCombobox,
} from "@/components/refine-ui/data-table/data-table-filter";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { EditButton, DeleteButton, ShowButton } from "@/components/refine-ui/buttons";

type Post = { id: number; title: string; status: string };

export default function PostList() {
  const columns = useMemo<ColumnDef<Post>[]>(() => [
    {
      id: "id",
      accessorKey: "id",
      size: 80,
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>ID</span>
          <DataTableSorter column={column} />
          <DataTableFilterDropdownNumeric defaultOperator="eq" column={column} table={table} placeholder="Filter by ID" />
        </div>
      ),
    },
    {
      id: "title",
      accessorKey: "title",
      size: 300,
      header: ({ column, table }) => (
        <div className="flex items-center gap-1">
          <span>Title</span>
          <DataTableFilterDropdownText defaultOperator="contains" column={column} table={table} placeholder="Filter by title" />
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <ShowButton recordItemId={row.original.id} />
          <EditButton recordItemId={row.original.id} />
          <DeleteButton recordItemId={row.original.id} />
        </div>
      ),
    },
  ], []);

  const table = useTable<Post>({
    columns,
    refineCoreProps: { resource: "posts" },
  });

  return (
    <ListView>
      <ListViewHeader title="Posts" />
      <DataTable table={table} />
    </ListView>
  );
}
```

- `<DataTable table={table} />`：`table` 來自 `useTable`（`@refinedev/react-table`）。
- column `header` 用 render function 嵌入 `<DataTableSorter>` / `<DataTableFilterDropdownText|Numeric|Combobox>`。
- filter / sort / pagination 子元件自動連接 Refine core 狀態。

---

## Forms（react-hook-form + Zod）

shadcn 表單用 `@refinedev/react-hook-form` + `@hookform/resolvers` + `zod` + shadcn 的 Form 元件。

```bash
npm install @refinedev/react-hook-form @hookform/resolvers zod
npx shadcn@latest add form input button select textarea
```

```tsx
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateView, CreateViewHeader } from "@/components/refine-ui/views/create-view";
import { BaseRecord, HttpError } from "@refinedev/core";

const postSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  status: z.enum(["draft", "published", "rejected"]),
});
type PostFormData = z.infer<typeof postSchema>;

export default function CreatePost() {
  const {
    refineCore: { onFinish, formLoading },
    ...form                                    // form: react-hook-form 的所有 API
  } = useForm<BaseRecord, HttpError, PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", status: "draft" },
    refineCoreProps: { resource: "posts", action: "create" },
  });

  const onSubmit = (data: PostFormData) => onFinish(data);

  return (
    <CreateView>
      <CreateViewHeader title="Create New Post" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Enter post title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={formLoading}>Submit</Button>
        </form>
      </Form>
    </CreateView>
  );
}
```

整合鏈：`useForm`（@refinedev/react-hook-form）橋接 React Hook Form（表單狀態/驗證）+ Refine core（data provider CRUD）+ shadcn/ui（UI）+ Zod（型別安全 schema）。自動處理：提交至後端、loading 狀態、錯誤處理、edit 表單資料抓取、optimistic update、cache invalidation。

Edit 表單把 `action` 改成 `"edit"`、加 `id`；用 `query` 取得既有資料填入 `defaultValues`。

---

## View 元件

頁面 layout 包裝（含標題、麵包屑、action 按鈕）。

```tsx
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { CreateView, CreateViewHeader } from "@/components/refine-ui/views/create-view";
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";

<ListView>
  <ListViewHeader title="Posts" />
  <DataTable table={table} />
</ListView>

<EditView>
  <EditViewHeader title="Edit Post" />
  <Form {...form}>{/* ... */}</Form>
</EditView>
```

---

## Button 元件

```tsx
import {
  CreateButton, EditButton, DeleteButton, ShowButton,
  ListButton, CloneButton, RefreshButton,
} from "@/components/refine-ui/buttons";

<CreateButton resource="posts" />
<EditButton recordItemId={1} />
<DeleteButton recordItemId={1} />   {/* 內建確認對話框 */}
<ShowButton recordItemId={1} />
```

---

## ThemeProvider

light / dark / system 主題切換，自動存 localStorage。

```bash
npx shadcn@latest add https://ui.refine.dev/r/theme-provider.json
```

```tsx
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { ThemeSelect } from "@/components/refine-ui/theme/theme-select";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="refine-ui-theme">
      {/* app 內容 */}
    </ThemeProvider>
  );
}

// 主題控制
<ThemeToggle />   {/* 點擊循環 light → dark → system */}
<ThemeSelect />   {/* 下拉選單明確選擇 */}

// 自訂控制
const { theme, setTheme } = useTheme();
setTheme("dark"); // "light" | "dark" | "system"
```

| ThemeProvider Prop | 型別 | 預設 |
|--------------------|------|------|
| `defaultTheme` | `"light"|"dark"|"system"` | `"system"` |
| `storageKey` | `string` | `"refine-ui-theme"` |

`useTheme` 回傳 `{ theme, setTheme }`。

---

## Auth 元件

```tsx
import { SignInForm } from "@/components/refine-ui/auth/sign-in-form";
import { SignUpForm } from "@/components/refine-ui/auth/sign-up-form";
import { ForgotPasswordForm } from "@/components/refine-ui/auth/forgot-password";

<Route path="/login" element={<SignInForm />} />
<Route path="/register" element={<SignUpForm />} />
<Route path="/forgot-password" element={<ForgotPasswordForm />} />
```

這些元件已內建驗證，連接 Refine 的 `useLogin` / `useRegister` / `useForgotPassword`（authProvider）。

`NotificationProvider`（registry）：toast 通知系統，掛載至 `<Refine notificationProvider={...} />`。

---

## 主題（CSS variables）

主題用 shadcn/ui 的 CSS 自訂屬性（HSL 色值），在 `globals.css`：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... */
}
```

加額外主題：

```css
[data-theme="blue"]  { --primary: 221.2 83.2% 53.3%; --primary-foreground: 210 40% 98%; }
[data-theme="green"] { --primary: 142.1 76.2% 36.3%; --primary-foreground: 355.7 100% 97.3%; }
```

由於元件原始碼在專案內，可完全掌控樣式。可用 shadcn/ui theme editor 或 TweakCN Theme Editor 產生自訂主題。
