# success-failure — TypeScript / React IT

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 TypeScript 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | TypeScript 5+ |
| Test Library | @testing-library/react |
| Helper | `overrideMswError()`（自製：注入 MSW 錯誤回應） |

## 抽象角色：Operation Result Verifier — 成敗

從 UI 上尋找成功/失敗的視覺回饋 → Assert 其存在或內容。

## 實作流程

### 成功

1. 使用 `waitFor` 等待成功指標出現。
2. 常見成功指標：
   - Toast 通知：`screen.getByText(/成功|完成/i)`
   - Alert role：`screen.getByRole('alert')` with success content
   - 頁面導航：URL 變更
   - 表單重置：輸入欄位清空
   - 按鈕狀態變更：disabled → enabled

### 失敗

1. 使用 `waitFor` 等待失敗指標出現。
2. 常見失敗指標：
   - Error message：`screen.getByText(/失敗|錯誤/i)`
   - Alert role：`screen.getByRole('alert')` with error content
   - 表單驗證錯誤：`screen.getByText(errorMessage)`
   - 按鈕仍可點擊（未被 disabled）

## 操作成功

```gherkin
Then 操作成功
```

```typescript
import { screen, waitFor } from '@testing-library/react';

await waitFor(() => {
  // 方式 1：Toast 通知
  expect(screen.getByText(/成功|已更新|已建立/i)).toBeInTheDocument();

  // 方式 2：Alert role
  // const alert = screen.getByRole('alert');
  // expect(alert).toHaveTextContent(/成功/i);

  // 方式 3：Success status
  // expect(screen.getByRole('status')).toHaveTextContent(/成功/i);
});
```

## 操作失敗

```gherkin
Then 操作失敗
```

```typescript
await waitFor(() => {
  expect(screen.getByRole('alert')).toBeInTheDocument();
  // 或
  // expect(screen.getByText(/失敗|錯誤|無法/i)).toBeInTheDocument();
});
```

## 失敗 + 錯誤訊息

```gherkin
Then 操作失敗
And 錯誤訊息應為 "進度不可倒退"
```

```typescript
await waitFor(() => {
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
expect(screen.getByText('進度不可倒退')).toBeInTheDocument();
```

## 表單驗證失敗

```gherkin
Then 顯示驗證錯誤 "名稱不可為空"
```

```typescript
await waitFor(() => {
  expect(screen.getByText('名稱不可為空')).toBeInTheDocument();
});
// 確認表單仍可編輯
expect(screen.getByRole('button', { name: /送出/i })).toBeEnabled();
```

## MSW 錯誤回應設定

成功/失敗的 UI 回饋通常取決於 API 回傳的 status code。需要在 aggregate-given 或 test 內設定對應的 MSW handler：

```typescript
import { overrideMswError } from '@/test/helpers/msw-utils';

// 設定 API 回傳失敗
overrideMswError('post', '/api/v1/lessons/:lessonId/progress', {
  message: '進度不可倒退',
}, 400);
```

## TypeScript 特化規則

- **TS-R1（只驗成功/失敗）**：不驗資料內容（那是 readmodel-then 的事）。
- **TS-R2（使用 waitFor）**：成功/失敗回饋通常是非同步出現。
- **TS-R3（通用步驟可跨 Feature 共用）**：「操作成功」「操作失敗」是 common assertions。
- **TS-R4（錯誤訊息完全匹配）**：使用 `getByText(exactString)` 不用 regex（除非確實是 OR 條件）。
- **TS-R5（Alert role 優先）**：若有 `role="alert"`，優先使用 `getByRole('alert')`。
- **TS-R6（觸發失敗用 overrideMswError）**：在測試中明確注入 MSW 錯誤回應，而非依賴自然失敗。

## 與其他 Then Handler 的差異

| | success-failure | aggregate-then | readmodel-then |
|---|---|---|---|
| 驗證對象 | UI 回饋（toast / alert / error message） | MSW request payload | rendered content |
| 資料來源 | DOM 元素 | 攔截的 HTTP request | DOM 元素 |
| 前提操作 | Command | Command | Query |
| 驗證深度 | 只看成敗 | 看發送的資料 | 看顯示的資料 |
