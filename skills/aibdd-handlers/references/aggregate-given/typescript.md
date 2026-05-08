# aggregate-given — TypeScript / React IT

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 TypeScript 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | TypeScript 5+ |
| Test Runner | Jest / Vitest |
| React | React 18+ |
| Mock API | MSW (Mock Service Worker) |
| Test Library | @testing-library/react |
| User Interaction | @testing-library/user-event |
| Factory | 自製 mockXxx() helpers |

## 抽象角色：States Prepare

建立 Factory Test Data → 透過 `server.use()` 設定 MSW Handler → 使 Component fetch 到預設資料。

## 實作流程

1. 識別 Aggregate 名稱（從 TODO 標註或 Gherkin 語意）。
2. 從 `api.yml` 找到對應的 API endpoint 和 response schema。
3. 使用 Factory 函數建立 type-safe test data（如 `mockLessonProgress({...})`）。
4. 使用 `server.use()` 註冊 MSW handler，回傳 factory data。
5. 若後續步驟需要引用此實體的 ID，將 ID 儲存到 `describe` scope 的 `let` 變數。

## 單一 Aggregate

```gherkin
Given 用戶 "Alice" 在課程 1 的進度為 70%，狀態為 "進行中"
```

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockLessonProgress } from '@/test/factories';

const lessonProgress = mockLessonProgress({
  userId: 'alice-id',
  lessonId: 1,
  progress: 70,
  status: 'IN_PROGRESS',
});

server.use(
  http.get('/api/v1/lessons/:lessonId/progress', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: lessonProgress,
    });
  })
);
```

## DataTable 批量建立

```gherkin
Given 系統中有以下用戶：
  | userId | name  | email           |
  | 1      | Alice | alice@test.com  |
  | 2      | Bob   | bob@test.com    |
```

```typescript
const users = [
  mockUser({ id: '1', name: 'Alice', email: 'alice@test.com' }),
  mockUser({ id: '2', name: 'Bob', email: 'bob@test.com' }),
];

server.use(
  http.get('/api/v1/users', () => {
    return HttpResponse.json({ success: true, data: users });
  })
);
```

## 多 Endpoint 前置

```gherkin
Given 用戶 "Alice" 已登入
And 課程 1 的名稱為 "物件導向基礎"
```

```typescript
server.use(
  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({ success: true, data: mockUser({ name: 'Alice' }) });
  }),
  http.get('/api/v1/lessons/:lessonId', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: mockLesson({ id: Number(params.lessonId), name: '物件導向基礎' }),
    });
  })
);
```

## TypeScript 特化規則

- **TS-R1（Factory 函數）**：用 `mockXxx({...})` 建立 type-safe data，不手動拼 JSON。
- **TS-R2（MSW handler 透過 server.use() 註冊）**：每個 test 的 `afterEach` 會 `resetHandlers()`，handler 不會跨測試殘留。
- **TS-R3（Response shape 符合 api.yml）**：含 envelope（如 `{ success: true, data: ... }`）。
- **TS-R4（跨步驟 ID 用 describe scope let）**：`let userId: string;` 由前一步寫入、後一步讀取。
- **TS-R5（多 Aggregate 同 server.use）**：`server.use(handler1, handler2, handler3)` 一次註冊多個。

## 與 Command（Given 用法）的差異

| | aggregate-given | command（Given 用法） |
|---|---|---|
| 目的 | 設定 MSW mock 回傳預設資料（繞過 UI 操作） | 透過 user-event 執行 UI 操作 |
| 層級 | MSW Handler 層 | UI 互動層 |
| 適用時機 | 純前置資料設定（「系統中有某些資料」） | 測試需要經過完整 UI 流程（「用戶已完成某操作」） |
| 語態 | 現在式/存在式（「有」「為」「包含」） | 過去式/完成式（「已訂閱」「已建立」） |
