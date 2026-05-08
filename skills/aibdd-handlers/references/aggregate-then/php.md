# aggregate-then — PHP Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 PHP 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | PHP 8.1+ |
| Test Base | `\Yoast\WPTestUtils\WPIntegration\TestCase` |
| Repository | `$this->repos->xxx->find*()` |
| Assertion | PHPUnit |

## 任務

透過 `$this->repos->xxx->findXxx()` 從 WordPress DB 取回當前 Aggregate 狀態，然後使用 PHPUnit 斷言驗證屬性值。**不重查 Service，不存取 `$this->queryResult`**（那屬於 readmodel-then）。

## 實作流程

1. **從 `$this->ids` 取得主體 ID**：`$userId = $this->ids['Alice'];`
2. **透過 Repository 查詢**：`$progress = $this->repos->lessonProgress->findByUserAndLesson($userId, 1);`
3. **先 assertNotNull**：確認查得到記錄，避免後續 NPE。
4. **屬性斷言**：`assertSame`（嚴格型別比對）為主，集合用 `assertCount`。
5. **中文狀態轉 Enum**：依共用對應表比對 enum 字串值。

## 單一 Aggregate 屬性驗證

```gherkin
Then 用戶 "Alice" 在課程 1 的進度應為 80%，狀態應為 "進行中"
```

```php
$userId = $this->ids['Alice'];
$progress = $this->repos->lessonProgress->findByUserAndLesson($userId, 1);
$this->assertNotNull($progress, '找不到課程進度');
$this->assertSame(80, $progress->getProgress());
$this->assertSame('IN_PROGRESS', $progress->getStatus());
```

## 訂單金額驗證

```gherkin
Then 訂單 "ORD-001" 的總金額應為 90000，狀態應為 "已付款"
```

```php
$orderId = $this->ids['ORD-001'];
$order = $this->repos->order->findById($orderId);
$this->assertNotNull($order, '找不到訂單');
$this->assertSame(90000, $order->getTotalAmount());
$this->assertSame('PAID', $order->getStatus());
```

## DataTable 批量驗證

```gherkin
Then 用戶 "Alice" 的購物車應包含以下商品:
  | 商品 ID   | 數量 |
  | PROD-001 | 2    |
  | PROD-002 | 1    |
```

```php
$userId = $this->ids['Alice'];
$expected = [
    ['商品 ID' => 'PROD-001', '數量' => 2],
    ['商品 ID' => 'PROD-002', '數量' => 1],
];
foreach ($expected as $row) {
    $item = $this->repos->cartItem->findByUserAndProduct($userId, $row['商品 ID']);
    $this->assertNotNull($item, "找不到商品 {$row['商品 ID']}");
    $this->assertSame((int) $row['數量'], $item->getQuantity());
}
```

## 不存在性驗證

```gherkin
Then 用戶 "Alice" 的購物車應不包含商品 "PROD-001"
```

```php
$userId = $this->ids['Alice'];
$item = $this->repos->cartItem->findByUserAndProduct($userId, 'PROD-001');
$this->assertNull($item);
```

## 集合數量驗證

```gherkin
Then 用戶 "Alice" 的購物車應有 3 個商品
```

```php
$userId = $this->ids['Alice'];
$items = $this->repos->cartItem->findByUser($userId);
$this->assertCount(3, $items);
```

## PHP 特化規則

- **PHP-R1（透過 Repository）**：驗證來源必須為 `$this->repos->xxx`，禁止直連 `$wpdb`、禁用 Service、禁讀 `$this->queryResult`。
- **PHP-R2（assertNotNull 先行）**：讀取後先確認非 null，再取屬性斷言，避免 NPE 噪音。
- **PHP-R3（assertSame 為主）**：型別敏感比對用 `assertSame`；數值比大小用 `assertGreaterThan` 等；字串包含用 `assertStringContainsString`。
- **PHP-R4（getter 取值）**：強型別 Model 用 `getXxx()`，禁止以陣列 key 讀取物件屬性。

## 完成條件

- [ ] 所有驗證均透過 `$this->repos->xxx` 進行
- [ ] 每次 Repository 查詢後皆有 `assertNotNull` / `assertNull`
- [ ] 中文狀態已轉為 Enum 常數比對
- [ ] 複合主鍵完整提供
- [ ] 無任何 `$wpdb`、Service 呼叫、寫入操作
- [ ] 無讀取 `$this->queryResult`（屬 readmodel-then）
