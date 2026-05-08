# aggregate-given — PHP Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 PHP 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | PHP 8.1+ |
| BDD | PHPUnit + Gherkin parser（自製整合） |
| Test Base | `\Yoast\WPTestUtils\WPIntegration\TestCase` |
| WP Factories | `$this->factory()->user/post/term/category/attachment->create([...])` |
| Repository | `$this->repos->xxx` |
| Service | `$this->services->xxx` |
| Test Runner | PHPUnit |

## 任務

使用 **WP Factory Methods** + **Repository.save()** 將資料寫入真實 WordPress DB，並把自然鍵 → WP ID 映射存入 `$this->ids`，供後續步驟引用。

## 實作流程

1. **查 DBML**：先確認 entity 的欄位、型別、複合主鍵，禁止猜測欄位名。
2. **建立 WP 實體（如有）**：若需要 User / Post / Term，用 `$this->factory()->xxx->create([...])` 取得 ID。
3. **記錄自然鍵 → ID**：`$this->ids['Alice'] = $userId;`
4. **組裝 Plain PHP Model 物件**：`new LessonProgress($userId, 1, 50, 'IN_PROGRESS')`。
5. **呼叫 Repository.save()**：透過 Repository 抽象層（禁止直接 `$wpdb->insert`）。
6. **處理 DataTable**：若有表格資料，逐列 loop 處理。

## 單一實體建立

```gherkin
Given 用戶 "Alice" 在課程 1 的進度為 50%，狀態為 "進行中"
```

```php
$userId = $this->factory()->user->create(['display_name' => 'Alice']);
$this->ids['Alice'] = $userId;

$progress = new LessonProgress($userId, 1, 50, 'IN_PROGRESS');
$this->repos->lessonProgress->save($progress);
```

## WP Factory Methods（內建於 WPTestUtils）

| Factory | 回傳 | 常用參數 |
|---|---|---|
| `$this->factory()->user->create([...])` | User ID | `display_name`, `user_login`, `user_email`, `role` |
| `$this->factory()->post->create([...])` | Post ID | `post_title`, `post_type`, `post_status`, `post_author` |
| `$this->factory()->term->create([...])` | Term ID | `name`, `slug`, `taxonomy` |
| `$this->factory()->category->create([...])` | Category ID | `name`, `slug` |
| `$this->factory()->attachment->create([...])` | Attachment ID | `post_title`, `post_parent` |

## DataTable 批量建立

```gherkin
Given 系統中有以下用戶:
  | 姓名  | 角色          |
  | Alice | administrator |
  | Bob   | subscriber    |
```

```php
$users = [
    ['姓名' => 'Alice', '角色' => 'administrator'],
    ['姓名' => 'Bob',   '角色' => 'subscriber'],
];
foreach ($users as $row) {
    $userId = $this->factory()->user->create([
        'display_name' => $row['姓名'],
        'role'         => $row['角色'],
    ]);
    $this->ids[$row['姓名']] = $userId;
}
```

## 含依賴關係的 DataTable

```gherkin
Given 用戶 "Alice" 的購物車中有以下商品:
  | 商品 ID   | 數量 |
  | PROD-001 | 2    |
  | PROD-002 | 1    |
```

```php
$userId = $this->ids['Alice'];
$items = [
    ['商品 ID' => 'PROD-001', '數量' => 2],
    ['商品 ID' => 'PROD-002', '數量' => 1],
];
foreach ($items as $row) {
    $item = new CartItem($userId, $row['商品 ID'], (int) $row['數量']);
    $this->repos->cartItem->save($item);
}
```

## PHP 特化規則

- **PHP-R1（Plain PHP Model）**：使用強型別 Model 物件，非陣列亦非 `stdClass`。
- **PHP-R2（Repository 抽象）**：一律透過 `$this->repos->xxx->save()`，禁止直接 `$wpdb`。
- **PHP-R3（upsert 語意）**：`save()` 方法應處理 insert/update 雙情境，避免重複資料。
- **PHP-R4（WP Factory 取 ID 後立即記錄）**：`$this->factory()->xxx->create()` 回傳的 ID 必須先存入 `$this->ids`，再用於後續 Model 建構。

## 完成條件

- [ ] 所有 Given 狀態語句都有對應的 Factory + Repository.save() 實作
- [ ] 自然鍵 → WP ID 已存入 `$this->ids`
- [ ] 中文狀態已轉為對應 Enum 常數
- [ ] Model 欄位已對照 DBML 驗證
- [ ] DataTable 已完整逐列處理
- [ ] 無任何直接 `$wpdb` 操作
