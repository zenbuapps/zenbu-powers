# query — PHP Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 PHP 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | PHP 8.1+ |
| Test Base | `\Yoast\WPTestUtils\WPIntegration\TestCase` |
| Service | `$this->services->xxx`（讀取方法） |
| Test Runner | PHPUnit |

## 任務

呼叫 Service 的讀取方法，將結果存入 `$this->queryResult`，供後續 Then 步驟驗證。**必須 try/catch**，錯誤仍存入 `$this->lastError`（可能的 Query 失敗情境如權限不足）。

## 實作流程

1. **從 `$this->ids` 取得查詢主體 ID**：`$userId = $this->ids['Alice'];`
2. **呼叫 Service query 方法**：回傳結果賦值給 `$this->queryResult`。
3. **try/catch 錯誤儲存**：失敗時 `$this->queryResult = null`，錯誤存入 `$this->lastError`。
4. **不做斷言**：斷言交給 readmodel-then / success-failure handler。

## 單一記錄查詢

```gherkin
When 用戶 "Alice" 查詢課程 1 的進度
```

```php
$userId = $this->ids['Alice'];
try {
    $this->queryResult = $this->services->lesson->getProgress($userId, 1);
} catch (\Throwable $e) {
    $this->lastError = $e;
    $this->queryResult = null;
}
```

## List Query（列表查詢）

```gherkin
When 用戶 "Alice" 查詢購物車中的所有商品
```

```php
$userId = $this->ids['Alice'];
try {
    $this->queryResult = $this->services->cart->listItems($userId);
} catch (\Throwable $e) {
    $this->lastError = $e;
    $this->queryResult = null;
}
```

## Query with 多重參數

```gherkin
When 用戶 "Alice" 查詢第 1 章的所有課程
```

```php
$userId = $this->ids['Alice'];
try {
    $this->queryResult = $this->services->lesson->listByChapter($userId, chapterId: 1);
} catch (\Throwable $e) {
    $this->lastError = $e;
    $this->queryResult = null;
}
```

## Search Query（含 filter）

```gherkin
When 用戶 "Alice" 搜尋關鍵字 "React" 的課程
```

```php
$userId = $this->ids['Alice'];
try {
    $this->queryResult = $this->services->course->search(
        keyword: 'React',
        userId: $userId,
    );
} catch (\Throwable $e) {
    $this->lastError = $e;
    $this->queryResult = null;
}
```

## Query 帶分頁

```gherkin
When 用戶 "Alice" 查詢第 2 頁的訂單（每頁 10 筆）
```

```php
$userId = $this->ids['Alice'];
try {
    $this->queryResult = $this->services->order->listByUser(
        userId: $userId,
        page: 2,
        perPage: 10,
    );
} catch (\Throwable $e) {
    $this->lastError = $e;
    $this->queryResult = null;
}
```

## IntegrationTestCase 基類（參考）

```php
abstract class IntegrationTestCase extends \Yoast\WPTestUtils\WPIntegration\TestCase
{
    protected ?\Throwable $lastError = null;
    protected mixed $queryResult = null;  // ← Query 結果存這裡
    protected array $ids = [];
    protected object $repos;
    protected object $services;

    abstract protected function configure_dependencies(): void;

    public function set_up(): void {
        parent::set_up();
        $this->lastError = null;
        $this->queryResult = null;
        $this->ids = [];
        $this->repos = new \stdClass();
        $this->services = new \stdClass();
        $this->configure_dependencies();
    }
}
```

## PHP 特化規則

- **PHP-R1（唯讀）**：Query 絕對不修改系統狀態，禁止呼叫任何 `createXxx`、`updateXxx`、`deleteXxx`。
- **PHP-R2（結果儲存）**：結果必須存入 `$this->queryResult`，為後續 readmodel-then 使用。
- **PHP-R3（錯誤雙存）**：catch 時 `$this->queryResult = null` 且 `$this->lastError = $e`；供 success-failure 驗證錯誤。
- **PHP-R4（Service 讀取方法）**：僅使用 `getXxx`、`listXxx`、`findXxx`、`searchXxx`。
- **PHP-R5（不重查）**：一個 When + Query 僅執行一次查詢，不得重複呼叫覆蓋 `$this->queryResult`。

## 完成條件

- [ ] Service query 方法已呼叫，結果存入 `$this->queryResult`
- [ ] try/catch 完整，錯誤同時存入 `$this->lastError`
- [ ] 查詢參數皆從 `$this->ids` 或 Gherkin 實值取得
- [ ] 無任何 assert 斷言
- [ ] 無任何寫入操作
