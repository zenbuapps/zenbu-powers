# success-failure — PHP Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 PHP 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | PHP 8.1+ |
| Test Base | `IntegrationTestCase`（自訂，繼承 `\Yoast\WPTestUtils\WPIntegration\TestCase`） |
| Result Source | `$this->lastError`（由 command / query handler 寫入） |
| Helpers | `assert_operation_*` 系列（基類提供） |

## 任務

使用 `IntegrationTestCase` 基類提供的 `assert_operation_*` helper methods，對 `$this->lastError` 進行驗證。

## 實作流程

1. **判斷 Then 類型**：成功 / 失敗 / 錯誤訊息 / 例外類型。
2. **呼叫對應 helper**：
   - 成功 → `assert_operation_succeeded()`
   - 失敗 → `assert_operation_failed()`
   - 訊息 → `assert_operation_failed_with_message(...)`
   - 例外類型 → `assert_operation_failed_with_type(...)`
3. **組合使用**：失敗 + 訊息 + 例外類型可同時檢查。

## 成功驗證

```gherkin
Then 操作成功
```

```php
$this->assert_operation_succeeded();
```

## 失敗驗證

```gherkin
Then 操作失敗
```

```php
$this->assert_operation_failed();
```

## 錯誤訊息驗證

```gherkin
And 錯誤訊息應為 "進度不可倒退"
```

```php
$this->assert_operation_failed_with_message('進度不可倒退');
```

## 例外類型驗證

```gherkin
Then 應拋出 InvalidStateException 例外
```

```php
$this->assert_operation_failed_with_type(\App\Exceptions\InvalidStateException::class);
```

## 組合驗證（失敗 + 訊息 + 型別）

```gherkin
Then 操作失敗，原因為 "權限不足"，例外型別為 UnauthorizedException
```

```php
$this->assert_operation_failed();
$this->assert_operation_failed_with_type(\App\Exceptions\UnauthorizedException::class);
$this->assert_operation_failed_with_message('權限不足');
```

## 搭配前序 When + Command

```gherkin
When 用戶 "Alice" 更新課程 1 的影片進度為 30%
Then 操作失敗
And 錯誤訊息應為 "進度不可倒退"
```

```php
// When（由 command handler 產出）
$userId = $this->ids['Alice'];
try {
    $this->services->lesson->updateVideoProgress($userId, 1, 30);
} catch (\Throwable $e) {
    $this->lastError = $e;
}

// Then（由 success-failure handler 產出）
$this->assert_operation_failed();
$this->assert_operation_failed_with_message('進度不可倒退');
```

## IntegrationTestCase Helper Methods（關鍵參考）

所有 helper 定義在基類，開箱即用：

```php
abstract class IntegrationTestCase extends \Yoast\WPTestUtils\WPIntegration\TestCase
{
    protected ?\Throwable $lastError = null;

    protected function assert_operation_succeeded(): void
    {
        $this->assertNull(
            $this->lastError,
            'Expected operation to succeed, but got: ' . ($this->lastError?->getMessage() ?? '')
        );
    }

    protected function assert_operation_failed(): void
    {
        $this->assertNotNull($this->lastError, 'Expected operation to fail, but it succeeded');
    }

    protected function assert_operation_failed_with_type(string $exceptionType): void
    {
        $this->assertNotNull($this->lastError);
        $this->assertInstanceOf($exceptionType, $this->lastError);
    }

    protected function assert_operation_failed_with_message(string $expectedMessage): void
    {
        $this->assertNotNull($this->lastError);
        $this->assertStringContainsString($expectedMessage, $this->lastError->getMessage());
    }
}
```

## 對應表（句型 → helper）

| Then 語句類型 | Helper 方法 | 底層資料來源 |
|---|---|---|
| 操作成功 | `assert_operation_succeeded()` | `$this->lastError === null` |
| 操作失敗 | `assert_operation_failed()` | `$this->lastError !== null` |
| 錯誤訊息 | `assert_operation_failed_with_message($msg)` | `$this->lastError->getMessage()` 含 `$msg` |
| 例外型別 | `assert_operation_failed_with_type($class)` | `$this->lastError instanceof $class` |

## PHP 特化規則

- **PHP-R1（純狀態驗證）**：只驗成功/失敗、錯誤訊息、例外型別；**不驗業務資料**。
- **PHP-R2（禁重呼 Service）**：禁止在 Then 中再次呼叫 Service 或 Repository。
- **PHP-R3（訊息為子字串）**：`assert_operation_failed_with_message` 採 `assertStringContainsString`，只需匹配關鍵子字串即可。
- **PHP-R4（Helper 專用）**：一律使用 `assert_operation_*` helper，避免直接 `assertNull($this->lastError)` 等裸斷言，維持全專案一致性。
- **PHP-R5（例外型別 FQN）**：`assert_operation_failed_with_type` 必須傳入完整命名空間類別名（如 `\App\Exceptions\InvalidStateException::class`）。

## 完成條件

- [ ] Then 語句均使用 `assert_operation_*` helper
- [ ] 失敗驗證可組合使用 `failed` + `failed_with_message` + `failed_with_type`
- [ ] 例外類別採 `::class` FQN 形式
- [ ] 無直接讀取 `$this->lastError` 的裸斷言
- [ ] 無任何 Service / Repository 呼叫
- [ ] 無業務資料斷言（屬其他 handler）
