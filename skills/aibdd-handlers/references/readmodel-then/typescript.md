# readmodel-then — TypeScript / React IT

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 TypeScript 特化內容。
>
> **語意對應**：前端的 readmodel-then 驗證的是「畫面 DOM」，而非後端的「response object」。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | TypeScript 5+ |
| Test Library | @testing-library/react |
| Queries | `screen.getBy*` / `getAllBy*` / `queryBy*` / `findBy*`、`within()` |

## 抽象角色：Operation Result Verifier — 資料

使用 Testing Library 的 screen queries → Assert DOM 上的文字、數值、元素。

## 關鍵原則

**不重新 render** — 使用 Query handler 步驟中已 render 的 Component 畫面。

## 實作流程

1. 畫面已由 Query handler render 並載入完成。
2. 使用 `screen.getByText()`, `screen.getByRole()` 等查詢 DOM。
3. 根據 Gherkin 語意 assert 對應的文字或元素。
4. 列表驗證要同時驗筆數和內容。

## 驗證單一記錄

```gherkin
When 用戶 "Alice" 查詢課程 1 的進度
Then 操作成功
And 查詢結果應包含進度 80，狀態為 "進行中"
```

```typescript
import { screen } from '@testing-library/react';

// 畫面已由 query handler render 完成
expect(screen.getByText('80%')).toBeInTheDocument();
expect(screen.getByText('進行中')).toBeInTheDocument();
// 或更精確地限定範圍：
// const progressSection = screen.getByTestId('progress-info');
// expect(within(progressSection).getByText('80%')).toBeInTheDocument();
```

## 驗證列表筆數

```gherkin
Then 查詢結果應包含 2 個商品
```

```typescript
import { screen, within } from '@testing-library/react';

const list = screen.getByRole('list');
const items = within(list).getAllByRole('listitem');
expect(items).toHaveLength(2);
```

## 驗證列表內容

```gherkin
And 第一個商品的 ID 應為 "PROD-001"，數量為 2
```

```typescript
const list = screen.getByRole('list');
const items = within(list).getAllByRole('listitem');
expect(within(items[0]).getByText('PROD-001')).toBeInTheDocument();
expect(within(items[0]).getByText('2')).toBeInTheDocument();
```

## DataTable 驗證

```gherkin
Then 查詢結果應包含以下課程：
  | lessonId | name        | progress |
  | 1        | 物件導向基礎 | 80       |
  | 2        | 設計模式     | 50       |
```

```typescript
const table = screen.getByRole('table');
const rows = within(table).getAllByRole('row');
// rows[0] is header, data starts at rows[1]
expect(rows).toHaveLength(3); // header + 2 data rows

expect(within(rows[1]).getByText('物件導向基礎')).toBeInTheDocument();
expect(within(rows[1]).getByText('80')).toBeInTheDocument();

expect(within(rows[2]).getByText('設計模式')).toBeInTheDocument();
expect(within(rows[2]).getByText('50')).toBeInTheDocument();
```

## 空結果驗證

```gherkin
Then 查詢結果應為空
```

```typescript
expect(screen.getByText(/沒有資料|暫無|找不到/i)).toBeInTheDocument();
// 或
const list = screen.queryByRole('list');
if (list) {
  expect(within(list).queryAllByRole('listitem')).toHaveLength(0);
}
```

## 使用 within() 限定範圍

```typescript
// 驗證特定區塊內的內容
const card = screen.getByTestId('lesson-progress-card');
expect(within(card).getByText('80%')).toBeInTheDocument();
expect(within(card).getByText('進行中')).toBeInTheDocument();
```

## 中文顯示 vs Enum 值（重要差異）

UI 上顯示的是中文（如「進行中」），**不需要做 enum 反向映射**。直接用 `screen.getByText('進行中')` 驗證。

只有在 Gherkin 使用引號包裝的值（如 `"進行中"`）才需要確認 UI 確實顯示該中文文字。

> 對比後端：後端 readmodel-then 要把中文 `"進行中"` map 到 enum 值 `IN_PROGRESS` 後再比對 response。前端不需要。

## Query 優先級

```
getByRole      → 語意化查詢（table, list, listitem, heading, button）
getByText      → 文字內容查詢
within()       → 限定搜尋範圍
getAllByRole   → 批量查詢（列表、表格行）
queryByText    → 預期可能不存在時使用（回傳 null 而非拋錯）
```

## TypeScript 特化規則

- **TS-R1（不重新 render）**：使用 Query handler 已 render 的畫面。
- **TS-R2（優先語意化查詢）**：`getByRole` > `getByText` > `getByTestId`。
- **TS-R3（使用 within() 限定範圍）**：避免全域搜尋匹配到錯誤元素。
- **TS-R4（中文直接驗）**：UI 顯示什麼就驗什麼，不做 enum 映射。
- **TS-R5（列表驗證要同時驗筆數和內容）**：不只驗 length，也驗每列資料。
- **TS-R6（DataTable 考慮 header row）**：table 的 row[0] 通常是 header。
