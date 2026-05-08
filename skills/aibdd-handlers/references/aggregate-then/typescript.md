# aggregate-then — TypeScript / React IT

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 TypeScript 特化內容。
>
> **語意翻轉**：前端沒有「儲存層」可查，aggregate-then 的角色變為「驗證 MSW 攔截到的 request payload」——確認前端送出了正確的資料給 API。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | TypeScript 5+ |
| Mock API | MSW (Mock Service Worker) |
| Test Library | @testing-library/react |
| Helper | `captureMswRequest()`（自製） |

## 抽象角色：States Verify

從 MSW 攔截的 request 中取得送出的 payload → Assert payload 欄位值。

### 為什麼要驗 Request Payload？

在前端整合測試中，「系統狀態」的改變發生在後端。前端能驗證的是：**它送出了正確的資料給 API**。這等同於後端測試中的「從 Repository 查詢 DB 狀態」。

## 實作流程

1. 在 Command 執行前，使用 `captureMswRequest()` 設定 MSW spy handler。
2. Command handler 執行 user-event 互動 → 觸發 API call。
3. MSW spy handler 攔截 request，將 payload 存入 ref。
4. Assert `ref.current` 不為 null（確認 API 被呼叫）。
5. Assert `ref.current` 的欄位值。

## 驗證單一屬性

```gherkin
When 用戶 "Alice" 更新課程 1 的影片進度為 80%
Then 用戶 "Alice" 在課程 1 的進度應為 80%
```

```typescript
import { captureMswRequest } from '@/test/helpers/msw-utils';
import { screen, waitFor } from '@testing-library/react';
import { createUser } from '@/test/helpers/user-event';

// Setup MSW spy（必須在 Command 互動之前）
const requestRef = captureMswRequest('post', '/api/v1/lessons/:lessonId/progress');

// Command: user interaction
const user = createUser();
await user.clear(screen.getByRole('spinbutton', { name: /進度/i }));
await user.type(screen.getByRole('spinbutton', { name: /進度/i }), '80');
await user.click(screen.getByRole('button', { name: /更新/i }));

// 等 API call 完成
await waitFor(() => {
  expect(requestRef.current).not.toBeNull();
});

// aggregate-then: Verify request payload
expect(requestRef.current).toMatchObject({
  progress: 80,
});
```

## 驗證多個屬性

```gherkin
Then 用戶 "Alice" 在課程 1 的進度應為 80%，狀態應為 "進行中"
```

```typescript
await waitFor(() => {
  expect(requestRef.current).not.toBeNull();
});

expect(requestRef.current).toMatchObject({
  progress: 80,
  status: 'IN_PROGRESS',
});
```

## 驗證 DELETE 請求被發送

```gherkin
Then 課程 1 應被刪除
```

```typescript
const deleteRef = captureMswRequest('delete', '/api/v1/lessons/:lessonId');

// ... (Command interaction: click delete button)

await waitFor(() => {
  expect(deleteRef.current).not.toBeNull();
});
// DELETE request 通常無 body，能驗證它被呼叫即可
```

## DataTable 驗證

```gherkin
Then 批量更新應包含以下變更：
  | productId | quantity |
  | PROD-001  | 3        |
  | PROD-002  | 1        |
```

```typescript
await waitFor(() => {
  expect(requestRef.current).not.toBeNull();
});

const items = (requestRef.current as { items: Array<{ productId: string; quantity: number }> }).items;
expect(items).toHaveLength(2);
expect(items).toContainEqual({ productId: 'PROD-001', quantity: 3 });
expect(items).toContainEqual({ productId: 'PROD-002', quantity: 1 });
```

## captureMswRequest 工具

依賴 `src/test/helpers/msw-utils.ts` 中的 `captureMswRequest()`：

```typescript
const ref = captureMswRequest('post', '/api/v1/endpoint');
// ref.current 初始為 null
// API 被呼叫後，ref.current 為 request body (JSON parsed)
```

**關鍵**：必須在 Command 互動**之前**呼叫，否則無法攔截。

## TypeScript 特化規則

- **TS-R1（captureMswRequest 必須在 Command 之前）**：否則錯過攔截。
- **TS-R2（先 not null 再驗 payload）**：確認 API 確實被呼叫，再驗欄位。
- **TS-R3（waitFor 包裹 assert）**：API call 是非同步的。
- **TS-R4（欄位名 = api.yml request schema）**：前端送出的 key 與 api.yml 一致。

## 與其他 Then handler 的差異

| | aggregate-then | readmodel-then | success-failure |
|---|---|---|---|
| 抽象角色 | States Verify | Result Verifier (資料) | Result Verifier (成敗) |
| 驗證對象 | MSW 攔截的 request payload | 畫面顯示的內容 | 成功/失敗 UI 回饋 |
| 前提操作 | Command（寫入操作） | Query（讀取操作） | Command（寫入操作） |
| 用途 | 驗證「前端送出正確資料」 | 驗證「前端顯示正確資料」 | 驗證「操作成功或失敗」 |
