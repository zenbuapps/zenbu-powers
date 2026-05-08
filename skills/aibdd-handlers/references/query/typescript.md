# query — TypeScript / React IT

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 TypeScript 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | TypeScript 5+ |
| Test Library | @testing-library/react |
| Helper | `renderWithProviders()`（自製：含 QueryClient + Router 包裝） |
| Mock | MSW handler（由 aggregate-given 設定） |

## 抽象角色：Operation Invocation — Query

Render React Component → Component 觸發 API fetch → MSW 攔截並回傳 mock data → 等待載入完成。

**注意**：前端的「Query」沒有顯式呼叫 query function 的步驟——render 即是 query。Component 內部用 useQuery / useEffect / fetch 觸發 API call。

## 實作流程

1. 確認 MSW handler 已設定（由 aggregate-given 步驟完成）。
2. 使用 `renderWithProviders()` render 目標 Component。
3. 傳入必要的 props（route params, query params 等）。
4. 使用 `waitFor` / `findBy*` 等待資料載入完成。
5. **不驗證結果** — 驗證交給 readmodel-then handler。

## 基本查詢

```gherkin
When 用戶 "Alice" 查詢課程 1 的進度
```

```typescript
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/helpers/render';
import LessonProgressPage from '@/app/lessons/[id]/progress/page';

renderWithProviders(<LessonProgressPage params={{ id: '1' }} />);

// 等待資料載入完成
await waitFor(() => {
  expect(screen.queryByText(/loading|載入中/i)).not.toBeInTheDocument();
});
```

## 列表查詢

```gherkin
When 用戶 "Alice" 查詢購物車中的所有商品
```

```typescript
import CartPage from '@/app/cart/page';

renderWithProviders(<CartPage />);

await waitFor(() => {
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
```

## 帶篩選條件的查詢

```gherkin
When 用戶 "Alice" 查詢第 1 章的所有課程
```

```typescript
import ChapterLessonsPage from '@/app/chapters/[id]/lessons/page';

renderWithProviders(<ChapterLessonsPage params={{ id: '1' }} />);

await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

## 導航後查詢（Component 已 render，需要頁面導航）

```gherkin
When 用戶 "Alice" 進入課程 1 的頁面
```

```typescript
const user = createUser();
await user.click(screen.getByRole('link', { name: /課程 1/i }));

await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

## 載入等待策略

### 策略 1：Loading indicator 消失
```typescript
await waitFor(() => {
  expect(screen.queryByText(/loading|載入中/i)).not.toBeInTheDocument();
});
```

### 策略 2：目標內容出現（推薦）
```typescript
await screen.findByRole('heading', { name: /課程進度/i });
```

### 策略 3：Skeleton 消失
```typescript
await waitFor(() => {
  expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
});
```

**優先使用策略 2**（findBy 語意最清晰），策略 1 為通用備選。

## TypeScript 特化規則

- **TS-R1（Query 不修改狀態）**：只 render 和載入資料。
- **TS-R2（MSW handler 必須已設定）**：由 aggregate-given 步驟完成。
- **TS-R3（使用 renderWithProviders）**：確保 React Context（QueryClient, Router 等）正確包裝。
- **TS-R4（等待載入完成）**：用 `waitFor` 或 `findBy*`，避免在 loading 狀態下做 readmodel-then 驗證。
- **TS-R5（不驗證結果）**：驗證交給 readmodel-then handler。
- **TS-R6（Props 從 Gherkin 推斷）**：route params、query params 等。
