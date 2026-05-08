# code-quality — TypeScript（後端 Node.js IT + 前端 React IT 合併）

> **語言無關核心規則見 `references/refactor/code-quality-core.md`**（重構原則、SOLID 表、DRY、架構分層、命名清晰、Step Definition 整理、Meta 清理、小步驟循環、不做的事）。本檔僅提供 TypeScript 特化內容。
>
> 本檔分兩節：
> - **Part A：前端 (React + Vitest + MSW)** — 詳見 §1–§7
> - **Part B：後端 (Node.js + Express + Drizzle + Cucumber)** — 詳見 §B1–§B6
>
> 兩節皆供 `references/refactor/typescript.md` 重構階段嚴格遵守。
> 共用面向：SOLID、TypeScript 嚴格型別（禁 `any`）、Meta 清理、Early Return / Guard Clause、命名清晰、DRY 三次以上才抽。
> 差異面向：測試框架（Vitest vs Cucumber）、目錄結構、Repository / Hook 抽象層、日誌實踐（Cucumber 無 React 等價）。

---

## 前端 (React + Vitest + MSW)

涵蓋 SOLID for React、Testing-Library 最佳實踐、TypeScript 嚴格型別、測試組織、MSW Handler 品質、Component 品質。

---

## 1. SOLID 設計原則

### S — 單一職責（Single Responsibility）

- 每個 React component 僅負責一件事
- 若 component 同時處理資料擷取 + 渲染 + 驗證，必須拆分
- Custom hooks 應將資料擷取邏輯從 component 中抽離

❌ Bad — Component 同時做資料擷取、狀態管理、渲染：

```tsx
function LessonProgressPage({ userId }: { userId: string }) {
  const [data, setData] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}/progress`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <ul>{data.map((d) => <li key={d.id}>{d.lessonId}</li>)}</ul>;
}
```

✅ Good — Component 僅渲染，資料擷取交給 custom hook：

```tsx
function LessonProgressPage({ userId }: { userId: string }) {
  const { data, isLoading, error } = useLessonProgress(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  return <LessonProgressList items={data ?? []} />;
}
```

### O — 開放封閉（Open/Closed）

- 透過組合擴展（props、children、render props），而非修改原 component

```tsx
// 可透過 children 擴展而不修改 Card
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}
```

### L — 里氏替換（Liskov Substitution）

- Component 介面（props）必須可互相替換
- 若 `ButtonPrimary` 與 `ButtonSecondary` 皆宣告繼承 `ButtonProps`，則兩者必須可在同樣的上下文中互換

### I — 介面隔離（Interface Segregation）

- Props 介面必須最小化——僅需 2 個欄位時不要傳整個物件

❌ Bad:

```tsx
function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatarUrl} alt={user.displayName} />;
}
```

✅ Good:

```tsx
interface UserAvatarProps {
  avatarUrl: string;
  displayName: string;
}

function UserAvatar({ avatarUrl, displayName }: UserAvatarProps) {
  return <img src={avatarUrl} alt={displayName} />;
}
```

### D — 依賴反轉（Dependency Inversion）

- Components 依賴 hooks（抽象），而非直接呼叫 API
- Custom hooks 抽象資料擷取與狀態管理

```tsx
// hooks/useLessonProgress.ts
export function useLessonProgress(userId: string) {
  return useQuery({
    queryKey: ['lessonProgress', userId],
    queryFn: () => apiClient.getLessonProgress(userId),
  });
}

// components/LessonProgressPage.tsx — 不直接觸碰 fetch/axios
function LessonProgressPage({ userId }: { userId: string }) {
  const { data } = useLessonProgress(userId);
  return <LessonProgressList items={data ?? []} />;
}
```

---

## 2. Testing-Library 最佳實踐

### Query 優先級

依序使用：

1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByDisplayValue`
6. `getByAltText`
7. `getByTitle`
8. `getByTestId`(最後手段)

### 互動

- 使用 `userEvent`（而非 `fireEvent`）——更貼近真實使用者行為
- 使用 `userEvent.setup()` 以保證事件順序正確
- `await user.click(button)`，而非 `fireEvent.click(button)`

```tsx
import userEvent from '@testing-library/user-event';

it('submits form', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/email/i), 'user@example.com');
  await user.type(screen.getByLabelText(/password/i), 'secret');
  await user.click(screen.getByRole('button', { name: /log in/i }));

  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});
```

### 非同步

- 使用 `waitFor` 處理依賴非同步操作的斷言
- 使用 `findBy*` 處理非同步出現的元素
- 絕不使用 `setTimeout` 或固定延遲
- `waitFor` 預設逾時為 1000ms，僅在有正當理由時才延長

```tsx
// ✅ 等待非同步出現的元素
expect(await screen.findByText(/success/i)).toBeInTheDocument();

// ✅ 自訂條件
await waitFor(() => {
  expect(screen.getByRole('status')).toHaveTextContent(/complete/i);
});
```

### screen 的使用

- 永遠使用 `screen.getByRole()` 等（不要解構 render 回傳值）
- 使用 `within()` 將查詢限縮於特定容器

```tsx
const row = screen.getByRole('row', { name: /lesson 1/i });
expect(within(row).getByText(/completed/i)).toBeInTheDocument();
```

---

## 3. TypeScript 嚴格型別

- 禁止 `any`——必要時使用 `unknown` + type guard
- API 型別由 Zod schema 推導：`type Foo = z.infer<typeof FooSchema>`
- Custom hooks 必須有明確的回傳型別
- Component props 介面以 `interface` 定義（而非 `type`）
- Generic factory function 必須搭配適當的型別參數

```ts
// ✅ Zod schema 推導
const LessonProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.number(),
  progress: z.number(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
});
export type LessonProgress = z.infer<typeof LessonProgressSchema>;

// ✅ Hook 明確回傳型別
export function useLessonProgress(
  userId: string,
): UseQueryResult<LessonProgress[], Error> {
  return useQuery({ ... });
}

// ✅ Props 使用 interface
interface LessonCardProps {
  lessonId: number;
  title: string;
  progress: number;
}
```

---

## 4. 測試檔案組織

- 每個 `.feature` 對應一個測試檔
- 檔名：`{feature}.integration.test.tsx`
- `describe()` block 對應 Feature / Rule 結構
- `it()` block 對應 Examples
- 共用 setup 置於 `beforeEach`，不在各個 `it()` 重複
- Helper function 集中於 `src/__tests__/helpers/`
- Factory function 集中於 `src/__tests__/factories/`
- MSW 測試 handler 與測試檔同層，或集中於 `src/__tests__/mocks/`

### Import 排序

1. React / framework imports
2. Testing libraries（`@testing-library/*`、`vitest`、`msw`）
3. 待測 component
4. Test helpers、factories、mocks
5. 型別

```ts
// 1. framework
import React from 'react';

// 2. testing libraries
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

// 3. component under test
import { LessonProgressPage } from '@/pages/LessonProgressPage';

// 4. test helpers
import { renderWithProviders } from '@/test/helpers/render';
import { createUser } from '@/test/helpers/user-event';
import { mockLessonProgress } from '@/test/factories/lesson-progress.factory';
import { server } from '@/test/mocks/server';

// 5. types
import type { LessonProgress } from '@/lib/types/schemas';
```

---

## 5. MSW Handler 品質

- Request/response body 型別安全
- Happy path 的預設 handler 置於 `handlers.ts`
- 單一測試的 override 以 `server.use()` 處理，並於 `afterEach` 重置
- 使用 MSW v2 API（`http.get()`、`http.post()` 等）
- Response body 需符合 Zod schema 型別
- 為失敗情境提供 error handler

```ts
import { http, HttpResponse } from 'msw';
import type { LessonProgress } from '@/lib/types/schemas';

export const handlers = [
  http.get('/api/users/:userId/progress', () => {
    const body: LessonProgress[] = [];
    return HttpResponse.json(body);
  }),
];
```

---

## 6. Component 品質（Production Code）

### 架構分層

```
pages/          (routing + layout)
  └── components/   (UI rendering)
        └── hooks/       (data fetching + state)
              └── lib/api/    (API client functions)
```

- Pages 僅負責組合 component 與提供路由 context
- Components 依 props 渲染 UI
- Hooks 管理資料擷取、mutation、狀態
- API client function 為 fetch/axios 的薄包裝

### 命名

- Components：PascalCase（`LessonProgressCard`）
- Hooks：camelCase 以 `use` 為前綴（`useLessonProgress`）
- Event handlers：以 `handle` 為前綴（`handleSubmit`、`handleProgressUpdate`）
- Boolean props：以 `is` / `has` / `can` 為前綴（`isLoading`、`hasError`）

### Early Return / Guard Clause

```tsx
function LessonProgressPage({ userId }: { userId: string }) {
  const { data, isLoading, error } = useLessonProgress(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data || data.length === 0) return <EmptyState />;

  return <LessonProgressList items={data} />;
}
```

---

## 7. Meta 清理

### 刪除

- `// TODO: [States Prepare: ...]`
- `// TODO: [Operation Invocation: ...]`
- `// TODO: [Result Verifier: ...]`
- `// TODO: [States Verify: ...]`
- 任何開發階段的臨時註記

### 保留

- 說明業務邏輯的 JSDoc 註解
- 必要的技術註解

---

## 檢查清單（前端）

- [ ] 每個 component 只負責一件事（SRP）
- [ ] Component 透過 custom hooks 取得資料（DIP）
- [ ] 測試使用 `getByRole` 優先（Testing-Library best practice）
- [ ] 使用 `userEvent`，非 `fireEvent`
- [ ] 使用 `waitFor` / `findBy*` 處理非同步
- [ ] 無 `any` 型別
- [ ] Zod schema inference 用於 API 型別
- [ ] 所有 TODO/META 標記已清除
- [ ] Import 排序正確
- [ ] MSW handlers 型別安全
- [ ] `afterEach` 重置 MSW handlers
- [ ] 命名清晰表達用途

---

## 後端 (Node.js + Express + Drizzle + Cucumber)

涵蓋 SOLID for Node.js Service / Repository、Cucumber Step Definition 組織、日誌實踐、程式架構分層、TypeScript 嚴格型別。

## B1. SOLID 設計原則（後端）

### S — 單一職責

每個類別/函式只負責一件事。

```typescript
// ❌ Service 做太多事
class AssignmentService {
  async submitAssignment(userId: string, content: string) {
    this.checkPermission(userId);
    await this.repository.save({ userId, content });
    await this.sendEmail(userId);
  }
}

// ✅ 職責分離
class AssignmentService {
  constructor(
    private assignmentRepo: AssignmentRepository,
    private permissionValidator: PermissionValidator,
    private notificationService: NotificationService,
  ) {}

  async submitAssignment(userId: string, content: string) {
    this.permissionValidator.validate(userId);
    await this.assignmentRepo.save({ userId, content });
    await this.notificationService.notify(userId);
  }
}
```

### O — 開放封閉

對擴展開放，對修改封閉。新增功能時透過擴展（interface、策略模式）而非修改現有程式碼。

### L — 里氏替換

子類別/實作可安全替換介面。

### I — 介面隔離

不強迫實作不需要的方法。使用 TypeScript interface 定義精簡的契約。

### D — 依賴反轉

高層模組不依賴低層模組。Service 透過建構子注入 Repository。

```typescript
// ✅ DI
class LessonProgressService {
  constructor(
    private lessonProgressRepo: LessonProgressRepository,
    private journeySubscriptionRepo: JourneySubscriptionRepository,
  ) {}
}
```

---

## B2. Step Definition 組織規範（Cucumber）

### 組織原則

- 一個 Step Pattern 對應一個 TypeScript module（`.ts` 檔案）
- 使用目錄分類（`aggregate_given/`, `commands/`, `query/` 等）
- 語意化檔名（避免 `steps.ts` 大雜燴）

### 目錄結構

```
features/steps/
├── {subdomain}/
│   ├── aggregate_given/
│   │   ├── lesson-progress.ts
│   │   └── user.ts
│   ├── commands/
│   │   └── update-video-progress.ts
│   ├── query/
│   │   └── get-lesson-progress.ts
│   ├── aggregate_then/
│   │   └── lesson-progress.ts
│   └── readmodel_then/
│       └── progress-result.ts
├── common_then/
│   ├── success.ts
│   ├── failure.ts
│   └── error-message.ts
└── helpers/
    ├── status-mapping.ts
    └── context-helpers.ts
```

### 共用邏輯

```typescript
// steps/helpers/status-mapping.ts
export const STATUS_MAP: Record<string, string> = {
  '進行中': 'IN_PROGRESS',
  '已完成': 'COMPLETED',
  '未開始': 'NOT_STARTED',
};

export function mapStatus(chinese: string): string {
  return STATUS_MAP[chinese] ?? chinese;
}
```

```typescript
// steps/helpers/context-helpers.ts
import { TestWorld } from '../../support/world';

export function getUserId(world: TestWorld, userName: string): string | number {
  const id = world.ids[userName];
  if (id === undefined) {
    throw new Error(`找不到用戶 '${userName}' 的 ID，請先建立用戶`);
  }
  return id;
}
```

---

## B3. Meta 註記清理（後端）

### 刪除

- `// TODO: [事件風暴部位: ...]`
- `// TODO: 參考 xxx-Handler.md 實作`
- `// [生成參考 Prompt: ...]`
- 其他開發過程臨時標記

### 保留

- 必要的業務邏輯註解
- JSDoc 文件
- 必要的技術註解

### 範例

```typescript
// 重構前
Given('...', async function (this: TestWorld, ...) {
  // TODO: [事件風暴部位: Aggregate - LessonProgress]
  // TODO: 參考 Aggregate-Given-Handler.md 實作
  // ...
});

// 重構後
Given('...', async function (this: TestWorld, ...) {
  /** 建立用戶的課程進度初始狀態 */
  // ...
});
```

---

## B4. 日誌實踐

### 框架

小型專案使用 `console` 結構化輸出，中大型專案使用 pino。

```typescript
// 小型專案
console.info('[LessonProgressService] Progress updated: userId=%s, lessonId=%d', userId, lessonId);

// 大型專案（使用 pino）
import pino from 'pino';
const logger = pino({ name: 'LessonProgressService' });
logger.info({ userId, lessonId }, 'Progress updated');
```

### 等級規則

| 等級 | 用途 | 範例 |
|------|------|------|
| error | 未預期錯誤，含 stack trace | `console.error('Unexpected:', err)` |
| warn | 認證失敗、權限不足 | `console.warn('Expired JWT for %s %s', method, path)` |
| info | 業務關鍵操作（寫入完成） | `console.info('Order created: orderNumber=%s', ...)` |
| debug | 詳細流程、查詢結果數量 | `console.debug('Fetching order=%s for userId=%s', ...)` |

### 格式規則

- 使用 `%s`/`%d` 佔位符或結構化物件
- 使用 `key=value` 格式（方便 grep 搜尋）
- 訊息前加事件描述（`Order created:`, `Payment submitted:`）

### 禁止

- ❌ `console.log()` 用於生產程式碼（除 debug 外）
- ❌ 在迴圈中用 `console.info`
- ❌ 記錄敏感資訊（密碼、JWT token 全文）

---

## B5. 程式架構規範（後端）

### 分層

```
src/
├── routes/          # Express Routes（HTTP 轉換）
├── services/        # Business Logic
├── repositories/    # Data Access（Drizzle ORM）
├── db/
│   ├── schema.ts    # Drizzle Schema（Table 定義）
│   ├── index.ts     # DB Connection
│   └── migrations/  # SQL Migration Files
├── schemas/         # Zod Validation Schemas
├── middleware/      # Express Middleware（JWT, Error Handler）
├── errors.ts        # Custom Error Classes
└── app.ts           # Express App Factory
```

### 各層職責

| 層 | 負責 | 不負責 |
|----|------|--------|
| Routes | 路由、解析 Request、構建 Response、套用 middleware | 業務邏輯、資料存取 |
| Service | 業務規則、協調 Repository、拋業務異常 | HTTP 處理、直接操作 DB |
| Repository | Drizzle CRUD、封裝查詢 | 業務規則 |

### 依賴注入

Service 透過建構子接收 Repository，Route factory 建立 Service。

```typescript
// routes/orders.ts
export function orderRoutes(db: NodePgDatabase): Router {
  const repository = new OrderRepository(db);
  const service = new OrderService(repository);
  // ...
}
```

### 常見錯誤

- ❌ 業務邏輯寫在 Route handler
- ❌ Service 直接使用 `db.select()` 繞過 Repository
- ❌ Domain 程式碼放在 `features/` 測試目錄

---

## B6. 程式碼品質（後端）

### Early Return

```typescript
// ❌ 深層巢狀
function process(data: Data | null) {
  if (data) {
    if (data.isValid()) {
      return processData(data);
    }
  }
}

// ✅ Guard Clause
function process(data: Data | null) {
  if (!data) throw new NotFoundError('Data not found');
  if (!data.isValid()) throw new BusinessError('Invalid data');
  return processData(data);
}
```

### Const Object 替代 Magic String

```typescript
// ❌ 每次調用都創建
function process(status: string) {
  const mapping: Record<string, string> = { A: '狀態A', B: '狀態B' };
  return mapping[status];
}

// ✅ Module-level const
const STATUS_MAPPING = { A: '狀態A', B: '狀態B' } as const;

function process(status: string) {
  return STATUS_MAPPING[status as keyof typeof STATUS_MAPPING];
}
```

### DRY

重複 3+ 次的邏輯提取共用方法。

### 命名

- 函數名表達意圖（`updateVideoProgress` 而非 `process`）
- 布林變數用 `is`/`has`/`can` 開頭
- 使用 kebab-case 檔名（`lesson-progress-service.ts`）

### TypeScript 型別（後端特有）

- 所有 public 函式參數與回傳值加上型別標註
- 避免 `any`，使用 `unknown` + type narrowing
- 用 Drizzle `$inferInsert` / `$inferSelect` 推導 Entity 型別
- 避免過度使用型別 assertion（`as`）

---

## 檢查清單（後端）

- [ ] 每個類別/函式只負責一件事（SRP）
- [ ] Service 透過建構子注入 Repository（DIP）
- [ ] 一個 Step Pattern 一個 module
- [ ] 所有 TODO/META 標記已清除
- [ ] 日誌使用結構化格式 + key=value
- [ ] Routes/Services/Repositories 在正確的 `src/` 子目錄
- [ ] 使用 Early Return 減少巢狀
- [ ] 重複資料提升為 module-level const
- [ ] 命名清晰表達用途
- [ ] 檔名使用 kebab-case
- [ ] 無 `any` 型別（除非有明確理由）
