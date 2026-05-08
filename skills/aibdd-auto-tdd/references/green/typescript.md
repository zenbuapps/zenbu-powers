# green — TypeScript

> 主 SKILL.md 已涵蓋：trigger 辨識、綠燈定義、最小增量原則。
> 語言無關核心循環、失敗模式骨架、Docker 檢查、迭代策略統一在同 skill `references/green/_stage-flow.md`，請先 Read 該檔再讀本檔。
> 本檔涵蓋 TypeScript 兩個變體：**後端 (Node.js + Express)** 與 **前端 (React + Vitest)**。依專案上下文選讀對應段落。

---

## 變體選擇

| 變體 | 訊號 | 載入段落 |
|---|---|---|
| 後端 (Node.js + Express) | `package.json` 含 `express` / `cucumber-js`；features 目錄是後端 IT | `## 後端 (Node.js + Express)` |
| 前端 (React + Vitest) | `package.json` 含 `react` / `vitest` / `@testing-library/react` / `msw`；測試是 `*.integration.test.tsx` | `## 前端 (React + Vitest)` |

> 兩變體可同時存在於 monorepo；以「當前 phase 處理的 feature 所屬專案」為準。

---

## 後端 (Node.js + Express)

> 對應原 `aibdd-auto-green/references/variants/nodejs-it.md`。後端 IT 變體：Cucumber + Express + Drizzle + Testcontainers。

### 測試命令

```bash
# 開發階段：執行特定 Feature 檔案（快速迭代）
npx cucumber-js ${NODE_TEST_FEATURES_DIR}/01-增加影片進度.feature

# 開發階段：執行特定 Scenario（最快）
npx cucumber-js ${NODE_TEST_FEATURES_DIR}/01-增加影片進度.feature --name "成功增加影片進度"

# 完成階段：執行所有已完成紅燈的測試（總回歸測試）
npx cucumber-js --tags "not @ignore"
```

**為什麼使用 `--tags "not @ignore"`？**
- 只執行已完成紅燈實作的 features（已移除 `@ignore` 標籤）
- 避免執行尚未實作的 features 造成混淆
- 確保回歸測試的範圍清晰明確

### 實作目標

```
Zod Schemas → Services → Express Routes → Route 註冊
```

### 實作順序

根據測試錯誤訊息逐步實作：

1. 執行測試 → `npx cucumber-js ${NODE_TEST_FEATURES_DIR}/xxx.feature`
2. 看錯誤訊息（HTTP 404? 500? 400?）
3. 根據錯誤補充最少的程式碼（schemas → services → routes → 註冊路由）
4. 再次執行測試
5. 循環直到特定測試通過
6. 執行總回歸測試 → `npx cucumber-js --tags "not @ignore"`

### 最小增量範例

```typescript
// 做太多了（測試沒要求）
router.post('/lesson-progress/update-video-progress', jwtAuth, async (req, res) => {
  validateInventory();        // 沒測試
  sendEmailNotification();    // 沒測試
  logAuditTrail();           // 沒測試
  const result = await service.updateProgress(req.body);
  res.json(result);
});

// 剛好夠（只實作測試要求的）
router.post('/lesson-progress/update-video-progress', jwtAuth, async (req, res) => {
  const result = await service.updateProgress(req.body);
  res.json(result);
});
```

### 框架 API

#### Express Route 建立

```typescript
// ${NODE_ROUTES_DIR}/lesson-progress.ts
import { Router } from 'express';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { jwtAuth, AuthRequest } from '../middleware/jwt-auth';
import { LessonProgressService } from '../services/lesson-progress-service';
import { LessonProgressRepository } from '../repositories/lesson-progress-repository';

export function lessonProgressRoutes(db: NodePgDatabase): Router {
  const router = Router();
  const repository = new LessonProgressRepository(db);
  const service = new LessonProgressService(repository);

  router.post('/lesson-progress/update-video-progress', jwtAuth, async (req: AuthRequest, res, next) => {
    try {
      const result = await service.updateVideoProgress(req.userId!, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
```

#### 路由註冊

```typescript
// ${NODE_ROUTES_DIR}/index.ts
import { Router } from 'express';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { lessonProgressRoutes } from './lesson-progress';

export function routes(db: NodePgDatabase): Router {
  const router = Router();
  router.use(lessonProgressRoutes(db));
  return router;
}
```

#### 檔案建立順序

```
步驟 1: 建立 schemas（如果需要）
→ ${NODE_SCHEMAS_DIR}/lesson-progress.ts
→ 定義 Zod validation schemas

步驟 2: 建立 services
→ ${NODE_SERVICES_DIR}/lesson-progress-service.ts
→ 實作業務邏輯

步驟 3: 建立 routes
→ ${NODE_ROUTES_DIR}/lesson-progress.ts
→ 定義路由和 HTTP 處理

步驟 4: 在 routes/index.ts 中註冊路由
→ ${NODE_ROUTES_DIR}/index.ts
→ 將 route 加入 Express router
```

### 常見錯誤修復

#### HTTP 404 Not Found
**原因**：API Endpoint 不存在
**修復**：
1. 在 `${NODE_ROUTES_DIR}/` 中建立 route
2. 在 `${NODE_ROUTES_DIR}/index.ts` 中註冊 route

#### HTTP 500 Internal Server Error
**原因**：後端程式碼有錯誤
**修復**：
1. 檢查錯誤訊息
2. 修正 Service/Repository 的邏輯

#### HTTP 400 Bad Request
**原因**：業務規則驗證失敗
**修復**：
1. 確認業務規則正確實作
2. 調整 Zod schema 或驗證邏輯

#### HTTP 401 Unauthorized
**原因**：JWT Token 驗證失敗
**修復**：
1. 確認 `${NODE_MIDDLEWARE_DIR}/jwt-auth.ts` 中的驗證邏輯正確
2. 確認 JWT 密鑰與測試用的 JwtHelper 一致

### 迭代策略（後端）

#### 開發循環（快速迭代）

```
1. 執行特定測試 → npx cucumber-js ${NODE_TEST_FEATURES_DIR}/xxx.feature
2. 看錯誤訊息 → 理解失敗原因
3. 寫最少的程式碼修正這個錯誤
4. 再次執行特定測試
5. 還有錯誤？回到步驟 2
6. 特定測試通過？進入完成驗證
```

#### 完成驗證（回歸測試）

```
7. 執行所有已完成紅燈的測試 → npx cucumber-js --tags "not @ignore"
8. 所有測試通過？完成綠燈！
9. 有測試失敗？回到步驟 2，修復破壞的測試
```

### Docker / 環境（後端）

#### 執行前確認

```bash
# 1. 確認 Docker Desktop 是否在運行
docker ps

# 2. 確認 Docker Daemon 正常響應
docker info
```

#### 常見錯誤訊息與解法

| 錯誤訊息 | 原因 | 解法 |
|---------|------|------|
| `Could not find a working container runtime strategy` | Docker Desktop 未啟動 | 啟動 Docker Desktop |
| `Error response from daemon: pull access denied` | 無法下載 PostgreSQL image | 確認網路連線，或執行 `docker pull postgres:16` |
| `ECONNREFUSED 127.0.0.1:5432` | Testcontainers 初始化失敗 | 確認 Docker Desktop 已啟動，重新執行測試 |

### 後端完成條件

- [ ] 執行特定測試 `npx cucumber-js ${NODE_TEST_FEATURES_DIR}/xxx.feature` 通過
- [ ] 執行總回歸測試 `npx cucumber-js --tags "not @ignore"` 所有測試通過
- [ ] 沒有破壞既有功能
- [ ] 程式碼簡單直接
- [ ] 未引入任何測試未要求的功能

---

## 前端 (React + Vitest)

> 對應原 `aibdd-auto-green/references/variants/ts-it.md` + `aibdd-auto-tdd/references/green/typescript.md` 既有內容。前端 IT 變體：Vitest + jsdom + MSW + @testing-library/react。

以失敗測試為驅動，迭代實作 React 元件至所有測試通過。

### 實作目標

```
Component rendering → data fetching hooks → event handlers → form logic → validation feedback
```

### 核心循環

```
while 測試未全部通過:
    1. 執行測試 → 讀取第一個失敗
    2. 分析失敗原因（element not found? text mismatch? waitFor timeout?）
    3. 寫最小增量程式碼修復該失敗
    4. 重新執行測試
    5. 若新失敗出現 → 回到 2
    6. 若全部通過 → 結束
```

### 失敗模式對照表（前端）

| 失敗模式 | 原因 | 修復方向 |
|---------|------|---------|
| `TestingLibraryElementError: Unable to find element` | Component 未 render 預期元素 | 加入對應的 JSX 元素 |
| `expect(element).toHaveTextContent(...)` 不符 | 資料綁定錯誤 | 修正 component 的 data binding |
| `waitFor` timeout | API fetch 未完成或未觸發 | 檢查 MSW handler + useEffect/useQuery 邏輯 |
| `user.click()` 無反應 | 事件 handler 未綁定 | 加入 `onClick` / `onSubmit` |
| `user.type()` 無反應 | input 非 controlled 或 readOnly | 檢查 value/onChange binding |
| MSW unhandled request warning | API client URL 與 MSW handler 不符 | 修正 client URL 或 MSW pattern |
| `act(...)` warning | state update 未被包裹 | 在 `waitFor` 或 `findBy` 中驗證 |
| `expect(requestRef.current).not.toBeNull()` 失敗 | API call 未被觸發 | 檢查事件 handler 是否呼叫 API client function |

### 最小增量範例

#### 範例 1：Component 未 render 元素

**失敗**：`Unable to find an element with the role "spinbutton" and name "進度"`

**修復（最小）**：
```tsx
// src/app/lessons/[id]/progress/page.tsx
'use client';

export default function LessonProgressPage() {
  return (
    <form>
      <label htmlFor="progress">進度</label>
      <input id="progress" type="number" />
      <button type="submit">更新</button>
    </form>
  );
}
```

#### 範例 2：資料未顯示

**失敗**：`Unable to find text "80%"`

**修復（最小）**：加入 data fetching

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { getLessonProgress } from '@/lib/api/lesson-progress';

export default function LessonProgressPage({ params }: { params: { id: string } }) {
  const { data } = useQuery({
    queryKey: ['lesson-progress', params.id],
    queryFn: () => getLessonProgress(Number(params.id)),
  });

  if (!data) return <div>Loading...</div>;

  return <div>{data.progress}%</div>;
}
```

#### 範例 3：Event handler 未觸發 API

**失敗**：`expect(requestRef.current).not.toBeNull()` timeout

**修復（最小）**：
```tsx
const mutation = useMutation({
  mutationFn: (progress: number) =>
    updateLessonProgress(Number(params.id), { progress }),
});

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const progress = Number(formData.get('progress'));
  mutation.mutate(progress);
};

return <form onSubmit={handleSubmit}>...</form>;
```

### 框架 API（前端）

#### Component 實作（綠燈）

紅燈階段的 `<div>TODO</div>` → 綠燈改為實際 rendering：

```tsx
// src/app/lessons/[id]/progress/page.tsx
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { getLessonProgress, updateLessonProgress } from '@/lib/api/lesson-progress';

export default function LessonProgressPage({ params }: { params: { id: string } }) {
  const lessonId = Number(params.id);

  const { data, isPending } = useQuery({
    queryKey: ['lesson-progress', lessonId],
    queryFn: () => getLessonProgress(lessonId),
  });

  const mutation = useMutation({
    mutationFn: (progress: number) => updateLessonProgress(lessonId, { progress }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const progress = Number(formData.get('progress'));
    mutation.mutate(progress);
  };

  if (isPending) return <div>Loading...</div>;
  if (mutation.isSuccess) return <div role="status">更新成功</div>;
  if (mutation.isError) return <div role="alert">{String(mutation.error)}</div>;

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="progress">進度</label>
      <input id="progress" name="progress" type="number" defaultValue={data?.progress} />
      <button type="submit">更新</button>
    </form>
  );
}
```

#### API Client 實作（綠燈）

```typescript
// src/lib/api/lesson-progress.ts
import type { LessonProgress } from '@/lib/types/schemas';

export async function getLessonProgress(lessonId: number): Promise<LessonProgress> {
  const res = await fetch(`/api/v1/lessons/${lessonId}/progress`);
  if (!res.ok) throw new Error('Failed to fetch');
  const json = await res.json();
  return json.data;
}

export async function updateLessonProgress(
  lessonId: number,
  payload: { progress: number },
): Promise<void> {
  const res = await fetch(`/api/v1/lessons/${lessonId}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Update failed');
  }
}
```

### 最小增量原則（前端）

- 每次只修一個失敗
- **不預先實作**其他測試還沒要求的功能
- 不做「順便」的重構（那是 Refactor 階段的事）

#### 反例：過度實作

```tsx
// ❌ 測試只要求能更新進度，但加了一堆未測試的功能
export default function LessonProgressPage() {
  const [history, setHistory] = useState([]);           // 測試沒要求
  const [isSharing, setIsSharing] = useState(false);    // 測試沒要求
  const [achievements, setAchievements] = useState([]); // 測試沒要求
  // ...
}
```

#### 正例：剛好夠

```tsx
// ✅ 只實作測試需要的
export default function LessonProgressPage({ params }) {
  const { data } = useQuery({ ... });
  const mutation = useMutation({ ... });
  return (
    <form onSubmit={handleSubmit}>
      <input name="progress" />
      <button>更新</button>
    </form>
  );
}
```

### 測試執行命令（前端）

```bash
# 開發階段：執行特定測試檔
npx vitest run src/__tests__/{feature-slug}.integration.test.tsx

# 開發階段：執行特定 Scenario
npx vitest run src/__tests__/{feature-slug}.integration.test.tsx -t "scenario name"

# Watch mode（TDD 建議）
npx vitest src/__tests__/{feature-slug}.integration.test.tsx

# 完成階段：執行所有整合測試
npx vitest run
```

### 迭代策略（前端）

```
1. 執行測試 → npx vitest run {test-file}
2. 看到 `Unable to find element` → 加對應 JSX
3. 看到 `waitFor timeout` → 檢查 MSW handler + data fetching
4. 看到 `requestRef.current is null` → 加 event handler + API call
5. 通過 → 下一個 scenario
```

### 常見失敗與解決（前端）

#### `MSW: Received request but no handler matched`
→ 檢查 API Client 的 URL 是否與 MSW handler 的 URL pattern 一致。
MSW v2 的 URL pattern 規則：`:param` 而非 `{param}`。

#### `act(...) warning`
→ 將觸發 state update 的操作用 `await` 包裹：
```typescript
await user.click(button);  // ✅
// 而非 user.click(button);
```

#### QueryClient 快取汙染
→ `renderWithProviders` 每次建立新的 QueryClient instance（已在模板中實作）。

#### Next.js App Router `useRouter` 錯誤
→ 在測試中 mock `next/navigation`：
```typescript
import { vi } from 'vitest';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: '1' }),
  useSearchParams: () => new URLSearchParams(),
}));
```

### Docker / 環境（前端）

**不需要 Docker / Testcontainers / 真實 DB / 真實 API Server。**

- Vitest 使用 jsdom environment（Node.js 內模擬 DOM）
- MSW `setupServer` 攔截所有 fetch 請求
- 所有 API mock data 透過 MSW handlers 提供

### 前端完成條件

- [ ] 所有 React Component 已實作（不只是 stub）
- [ ] 所有 API Client functions 已實作
- [ ] 測試命令全數通過（零失敗）
- [ ] 未引入任何測試未要求的功能
- [ ] 無 MSW unhandled request 警告
- [ ] 無 `act(...)` warnings
- [ ] `npx tsc --noEmit` 通過
