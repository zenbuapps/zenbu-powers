# refactor — TypeScript（後端 Node.js IT + 前端 React IT 合併）

> **流程骨架見 `_stage-flow.md`**（重構觸發定義、兩階段循環、安全規則 R1–R7、邊界、完成條件骨架）。本檔僅提供 TypeScript 兩個變體（後端 Node.js + 前端 React）的特化內容。
> 完整品質規則見 `references/refactor/code-quality-core.md` + `references/code-quality/typescript.md`。

在測試保護下，小步驟改善程式碼品質。

## 入口

### 被 control-flow 調用
接收 `FEATURE_FILE` 參數，直接進入重構流程。

### 獨立使用
詢問目標範圍（特定 Feature 或全域），確認綠燈後進入重構流程。

---

## 變體判定

| 訊號 | 變體 |
|------|------|
| `package.json` 含 `cucumber-js` + `drizzle-orm` + `supertest` | **後端 Node.js IT** |
| `package.json` 含 `vitest` + `@testing-library/react` + `msw` | **前端 React IT** |

兩變體共用本檔，但測試命令、目錄結構、重構模式有差異——以下分節說明。

---

## 兩階段工作流（共用）

```
執行測試（確認綠燈）
    │
    ▼
【Phase A】重構測試碼
    │
    ▼
執行測試（確認仍然綠燈）
    │
    ▼
【Phase B】重構生產碼
    │
    ▼
執行測試（確認仍然綠燈）
    │
    ▼
完成
```

**關鍵**：Phase 順序不可顛倒。每個 Phase 結束跑測試，Phase 內每次小步驟也跑測試。

---

## 後端 (Node.js + Express)

### 測試命令

```bash
# 每次重構後必須執行
npx cucumber-js --tags "not @ignore"
```

### Linter / Formatter

```bash
npx tsc --noEmit                  # TypeScript 型別檢查
npx prettier --write .            # 格式化
```

### Phase A：測試程式碼重構（後端）

#### 範圍
- `features/steps/**/*.ts`（Cucumber step definitions）
- `features/support/**/*.ts`（World、hooks）
- `features/steps/helpers/**/*.ts`（共用 helpers）

#### 常見任務

1. **Step Definition 整理** — 提取共用的 Given 步驟到 helpers
2. **狀態映射 const 集中** — `this.ids` 的使用模式抽 `getUserId(world, name)` helper
3. **消除重複的 status mapping** 邏輯
4. **改善 DataTable 解析的可讀性**

### Phase B：生產程式碼重構（後端）

#### 範圍
- `src/routes/**/*.ts`（Express Routes）
- `src/services/**/*.ts`（Business Logic）
- `src/repositories/**/*.ts`（Data Access / Drizzle）
- `src/schemas/**/*.ts`（Zod Schemas）

#### 常見重構模式

##### Type 收窄（Type Narrowing）

```typescript
// 重構前
function process(input: string | number) {
  const result = (input as string).toUpperCase();
}

// 重構後
function process(input: string | number) {
  if (typeof input === 'string') {
    return input.toUpperCase();
  }
  return input.toString();
}
```

##### Discriminated Unions

```typescript
// 重構前
interface Result {
  success: boolean;
  data?: any;
  error?: string;
}

// 重構後
type Result =
  | { success: true; data: unknown }
  | { success: false; error: string };
```

##### Const Assertions（替代 Enum）

```typescript
// 重構前
enum Status { IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED' }

// 重構後（const object + type inference）
const Status = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

type Status = typeof Status[keyof typeof Status];
```

##### Zod Schema 收斂

```typescript
// 重構前：散落的 inline 驗證
if (!body.lessonId || typeof body.lessonId !== 'number') {
  throw new BusinessError('lessonId is required');
}

// 重構後：集中 Zod schema
import { z } from 'zod';

const UpdateVideoProgressSchema = z.object({
  lessonId: z.number(),
  progress: z.number().min(0).max(100),
});
```

##### Import 排序

```typescript
// 1. Node.js 內建
import assert from 'assert/strict';

// 2. 第三方套件
import { Given, When, Then } from '@cucumber/cucumber';
import { eq, and } from 'drizzle-orm';
import supertest from 'supertest';

// 3. 本地模組
import { TestWorld } from '../../support/world';
import { lessonProgress } from '../../../src/db/schema';
```

#### 常見重構方向

- **Step Definition 層**：提取共用 Given 步驟、統一 `this.ids` 使用模式、消除重複 status mapping、改善 DataTable 解析
- **Service 層**：提取業務規則為獨立方法、消除過長方法、統一異常處理（`BusinessError` hierarchy）、Early Return / Guard Clause
- **Route 層**：統一回應格式、提取共用驗證邏輯（Zod schema middleware）、async error wrapper
- **Repository 層**：方法命名一致性、查詢優化（使用 Drizzle relational queries）

---

## 前端 (React + Vitest)

### 測試命令

```bash
# 每次重構後必須執行
npx vitest run

# 特定測試檔（快速迭代）
npx vitest run src/__tests__/{feature-slug}.integration.test.tsx
```

### Linter / Formatter

```bash
npx tsc --noEmit
npx eslint src/
npx prettier --check src/
```

### 安全規則補充（前端特有）

- **禁止自動抽 helpers** — 除非使用者明確要求，不新增 helper、不搬移測試結構
- **禁止跨檔搬動** — 優先在原檔案內做最小改善（移除 TODO、補 JSDoc、調整命名/縮排）
- **如果真的要抽共用** — 必須先徵詢確認，一次只抽一個小片段，每次變更後跑測試

### Phase A：測試程式碼重構（前端）

#### 範圍
- `src/__tests__/**/*.integration.test.tsx`（測試檔）
- `src/test/helpers/**/*.ts(x)`（render helper, user-event helper, msw-utils）
- `src/test/factories/**/*.ts`（test data factories）
- `src/test/mocks/**/*.ts`（MSW handlers, server）

#### 常見任務

1. **移除 TODO 註解** → 替換為有意義的 JSDoc

```typescript
// 重構前
it('進度從 70% 更新到 80%', async () => {
  // TODO: [States Prepare: aggregate-given] MSW handler for LessonProgress
  // TODO: [Operation Invocation: command] user-event
  // ...
});

// 重構後
it('進度從 70% 更新到 80%', async () => {
  // 前置狀態：Alice 在課程 1 的進度為 70%
  server.use(...);
  // 使用者互動：填寫 80, 點擊更新
  // ...
});
```

2. **改善查詢選擇器** → 從 `getByText` / `getByTestId` 升級為 `getByRole`

```typescript
// 重構前
screen.getByTestId('submit-btn');

// 重構後
screen.getByRole('button', { name: /送出|更新/i });
```

3. **抽取重複 MSW setup** → 提升到 `beforeEach`（若重複 3+ 次）

```typescript
// 重構前（重複 3 次）
it('case 1', async () => {
  server.use(http.get('/api/v1/auth/me', () => HttpResponse.json(...)));
  // ...
});
it('case 2', async () => {
  server.use(http.get('/api/v1/auth/me', () => HttpResponse.json(...)));
  // ...
});

// 重構後
beforeEach(() => {
  server.use(http.get('/api/v1/auth/me', () => HttpResponse.json(...)));
});
```

4. **類型標註完整** → `const requestRef = captureMswRequest(...)` 確保泛型明確
5. **簡化測試邏輯** → 減少巢狀、使用 Early Return

### Phase B：生產程式碼重構（前端）

#### 範圍
- `src/app/**/*.tsx`（頁面 / layout）
- `src/components/**/*.tsx`（React 元件）
- `src/hooks/**/*.ts`（自定義 hooks）
- `src/lib/api/**/*.ts`（API client functions）
- `src/lib/types/**/*.ts`（Zod schemas）

#### 常見重構模式

##### 抽取 Custom Hook（資料邏輯從 Component 分離）

```tsx
// 重構前
export default function LessonProgressPage({ params }) {
  const { data, isPending } = useQuery({
    queryKey: ['lesson-progress', params.id],
    queryFn: () => getLessonProgress(Number(params.id)),
  });
  const mutation = useMutation({
    mutationFn: (progress: number) => updateLessonProgress(Number(params.id), { progress }),
  });
  // ...
}

// 重構後
function useLessonProgress(lessonId: number) {
  const query = useQuery({
    queryKey: ['lesson-progress', lessonId],
    queryFn: () => getLessonProgress(lessonId),
  });
  const mutation = useMutation({
    mutationFn: (progress: number) => updateLessonProgress(lessonId, { progress }),
  });
  return {
    progress: query.data,
    isPending: query.isPending,
    update: mutation.mutate,
    updateStatus: mutation.status,
  };
}

export default function LessonProgressPage({ params }: { params: { id: string } }) {
  const { progress, isPending, update } = useLessonProgress(Number(params.id));
  // ...
}
```

##### Component 組合（拆分過大的元件）

```tsx
// 重構前：一個 Component 處理 display + form + validation
export default function LessonProgressPage() {
  return <div>{/* 100+ lines */}</div>;
}

// 重構後：職責分離
export default function LessonProgressPage({ params }) {
  return (
    <>
      <ProgressDisplay lessonId={Number(params.id)} />
      <ProgressUpdateForm lessonId={Number(params.id)} />
    </>
  );
}
```

##### Early Return / Guard Clause

```tsx
// 重構前
function Component({ data }) {
  if (data) {
    if (data.isValid) {
      return <div>{data.content}</div>;
    }
  }
  return null;
}

// 重構後
function Component({ data }: { data: Data | null }) {
  if (!data) return null;
  if (!data.isValid) return null;
  return <div>{data.content}</div>;
}
```

##### 型別加強（移除 `any`，改用 Zod infer）

```typescript
// 重構前
type LessonProgress = {
  userId: string;
  lessonId: number;
  progress: any;  // ❌
};

// 重構後
import { z } from 'zod';

export const LessonProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.number(),
  progress: z.number().min(0).max(100),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;
```

##### 命名清晰

`process` → `updateVideoProgress`

### React 特有重構模式

- **Extract Custom Hook**：資料取得邏輯從 Component 分離，提升可測試性與可重用性
- **Component Composition**：用 `children` / render props 取代繼承或條件分支
- **Props Interface Simplification**：不傳整個物件，只傳需要的欄位

```tsx
// ❌ 傳整個物件
<UserCard user={user} />

// ✅ 只傳需要的欄位
<UserCard name={user.name} avatar={user.avatar} />
```

### Critical Rules（前端）

1. **每個 Phase 與每個小步驟後都跑測試**
2. **一次只做一個小重構**
3. **只抽取重複 3+ 次的邏輯**
4. **保持 Component 簡潔**
5. **不改變測試行為**
6. **移除所有 TODO 註解**
7. **遵守安全規則**（不自動抽 helpers、不跨檔搬動）

---

## 重構邊界（後端 + 前端共用）

- 不加新功能
- 不改測試行為（除非重構測試程式碼本身）
- 不改 API 契約（`api.yml`）
- 不改 Zod schemas 的對外型別（可內部改善結構）
- 不做效能優化（除非明顯問題）
- 不改 DB schema（後端）

---

## 完成條件

### 後端
- [ ] `npx cucumber-js --tags "not @ignore"` 全數通過
- [ ] `npx tsc --noEmit` 通過
- [ ] 所有 TODO/META 標記已清除
- [ ] Step Definition 組織符合分層（subdomain + handler 類型）

### 前端
- [ ] `npx vitest run` 全數通過（零失敗、零 warnings）
- [ ] `npx tsc --noEmit` 通過
- [ ] `npx eslint src/` 通過（或僅剩無害警告）
- [ ] 所有 TODO/META 標記已清除
- [ ] Meta 清理完成（無殘留樣板階段的註解）
- [ ] 測試輸出乾淨（無 `act(...)` warnings、無 MSW unhandled request）

---

## 品質規範

完整 TypeScript 程式碼品質規範詳見 `references/code-quality/typescript.md`（含後端 Node.js / 前端 React 兩節）。核心面向：

1. SOLID for TypeScript（一元件/類別一職責、依賴 hooks/Repository 抽象）
2. 測試框架最佳實踐（後端：Cucumber.js + Drizzle；前端：Testing-Library + MSW）
3. TypeScript 嚴格型別（禁 `any`，使用 Zod / Drizzle inference）
4. 測試檔案組織
5. 架構分層（後端：routes/services/repositories；前端：app/components/hooks/lib）
6. Meta 清理（移除所有 TODO）
