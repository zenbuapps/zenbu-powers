# aggregate-then — C# Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 C# 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | C# 12 / .NET 8+ |
| BDD | SpecFlow 3.9+ |
| ORM | Entity Framework Core 8+ |
| Database | PostgreSQL 16（Testcontainers） |
| Assertion | FluentAssertions 6+ |
| Test Command | `dotnet test --filter "Category!=Ignore"` |

## 實作流程

1. 從 `_ctx` 取得 `AppDbContext`。
2. **Clear ChangeTracker** 確保讀到的是資料庫最新狀態（而非 EF 快取）。
3. 使用 LINQ 查詢（通常透過複合 Key）。
4. 用 FluentAssertions 先驗證 `NotBeNull`，再驗證屬性值。
5. 中文狀態需映射到 C# enum 值。

## 基本 Step Class 結構

```csharp
using FluentAssertions;
using TechTalk.SpecFlow;
using ProjectName.Data;
using ProjectName.Models;

namespace ProjectName.IntegrationTests.Steps.Lesson.AggregateThen;

[Binding]
public class LessonProgressThenSteps
{
    private readonly ScenarioContext _ctx;

    public LessonProgressThenSteps(ScenarioContext ctx) => _ctx = ctx;

    private Dictionary<string, object> Ids => _ctx.Get<Dictionary<string, object>>("Ids");
}
```

## 單一 Entity 驗證

```csharp
[Then(@"用戶 ""(.*)"" 在課程 (.*) 的進度應為 (.*)%")]
public void ThenProgressShouldBe(string userName, int lessonId, int expectedProgress)
{
    var userId = Ids[userName].ToString()!;
    var dbContext = _ctx.Get<AppDbContext>("DbContext");

    // 清除 EF 快取，確保讀到資料庫最新值
    dbContext.ChangeTracker.Clear();

    var entity = dbContext.LessonProgresses
        .FirstOrDefault(e => e.UserId == userId && e.LessonId == lessonId);

    entity.Should().NotBeNull("找不到用戶 {0} 在課程 {1} 的進度紀錄", userName, lessonId);
    entity!.Progress.Should().Be(expectedProgress,
        "預期進度 {0}%，實際 {1}%", expectedProgress, entity.Progress);
}
```

## 中文狀態映射（Then 用）

```csharp
[Then(@"用戶 ""(.*)"" 在課程 (.*) 的狀態應為 ""(.*)""")]
public void ThenStatusShouldBe(string userName, int lessonId, string expectedStatus)
{
    var userId = Ids[userName].ToString()!;
    var dbContext = _ctx.Get<AppDbContext>("DbContext");
    dbContext.ChangeTracker.Clear();

    var statusMap = new Dictionary<string, string>
    {
        ["進行中"] = "IN_PROGRESS",
        ["已完成"] = "COMPLETED",
        ["未開始"] = "NOT_STARTED"
    };
    var mappedStatus = statusMap.GetValueOrDefault(expectedStatus, expectedStatus);

    var entity = dbContext.LessonProgresses
        .FirstOrDefault(e => e.UserId == userId && e.LessonId == lessonId);

    entity.Should().NotBeNull("找不到課程進度");
    entity!.Status.ToString().Should().Be(mappedStatus);
}
```

## DataTable 批次驗證

```csharp
[Then(@"系統中應有以下購物車項目：")]
public void ThenCartItemsShouldBe(Table table)
{
    var dbContext = _ctx.Get<AppDbContext>("DbContext");
    dbContext.ChangeTracker.Clear();

    foreach (var row in table.Rows)
    {
        var userId = Ids[row["userName"]].ToString()!;
        var productId = row["productId"];
        var expectedQuantity = int.Parse(row["quantity"]);

        var entity = dbContext.CartItems
            .FirstOrDefault(e => e.UserId == userId && e.ProductId == productId);

        entity.Should().NotBeNull($"找不到用戶 {row["userName"]} 的商品 {productId}");
        entity!.Quantity.Should().Be(expectedQuantity);
    }
}
```

## 驗證實體「不存在」（刪除確認）

```csharp
[Then(@"用戶 ""(.*)"" 的購物車中不應存在商品 ""(.*)""")]
public void ThenCartItemShouldNotExist(string userName, string productId)
{
    var userId = Ids[userName].ToString()!;
    var dbContext = _ctx.Get<AppDbContext>("DbContext");
    dbContext.ChangeTracker.Clear();

    var entity = dbContext.CartItems
        .FirstOrDefault(e => e.UserId == userId && e.ProductId == productId);

    entity.Should().BeNull($"預期商品 {productId} 已被刪除，但仍存在於資料庫中");
}
```

## 驗證記錄數量

```csharp
[Then(@"用戶 ""(.*)"" 的購物車中應有 (.*) 項商品")]
public void ThenCartShouldHaveItems(string userName, int expectedCount)
{
    var userId = Ids[userName].ToString()!;
    var dbContext = _ctx.Get<AppDbContext>("DbContext");
    dbContext.ChangeTracker.Clear();

    var count = dbContext.CartItems.Count(e => e.UserId == userId);
    count.Should().Be(expectedCount);
}
```

## 複合主鍵查詢樣板

```csharp
// 單一 Key
entity = dbContext.Users.FirstOrDefault(e => e.Id == userId);

// 複合 Key（FirstOrDefault 彈性較高）
entity = dbContext.LessonProgresses
    .FirstOrDefault(e => e.UserId == userId && e.LessonId == lessonId);

// 複合 Key via Find（需依 HasKey 順序傳入）
entity = dbContext.LessonProgresses.Find(userId, lessonId);
```

## ChangeTracker 清理的重要性

EF Core 會快取實體。若在同一 DbContext 中先寫入再查詢，可能讀到記憶體快取而非 DB 實際值。

```csharp
// ❌ 可能讀到過期快取
var entity = dbContext.LessonProgresses.FirstOrDefault(...);

// ✅ 確保讀到 DB 最新值
dbContext.ChangeTracker.Clear();
var entity = dbContext.LessonProgresses.FirstOrDefault(...);

// ✅ 替代方案：AsNoTracking
var entity = dbContext.LessonProgresses
    .AsNoTracking()
    .FirstOrDefault(e => e.UserId == userId && e.LessonId == lessonId);
```

## C# 特化規則

- **C-R1（Clear ChangeTracker 或 AsNoTracking）**：避免 EF 快取影響驗證結果。
- **C-R2（先 NotBeNull 再驗屬性）**：避免 `NullReferenceException`。
- **C-R3（FluentAssertions 訊息描述）**：使用 `.Should().Be(..., "失敗時的訊息")` 提升診斷清晰度。
- **C-R4（純讀取）**：Then handler 絕對不可寫入 DB。

## 完成條件

- 所有 Gherkin Then 步驟對應的 step definition 已實作
- 每個斷言都使用 FluentAssertions `.Should().Be()` / `.NotBeNull()`
- 所有查詢前都呼叫 `ChangeTracker.Clear()` 或使用 `AsNoTracking()`
- 中文狀態映射表與 aggregate-given 一致
- 測試失敗時的錯誤訊息具診斷價值
