# aggregate-given — C# Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 C# 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | C# 12 / .NET 8+ |
| BDD | SpecFlow 3.9+（Cucumber Expressions） |
| HTTP Client | WebApplicationFactory\<Program\> + HttpClient |
| ORM | Entity Framework Core 8+ |
| Database | PostgreSQL 16（Testcontainers for .NET） |
| DI | Microsoft.Extensions.DependencyInjection（BoDi for SpecFlow） |
| Assertion | FluentAssertions 6+ |
| JSON | System.Text.Json |
| Auth | JWT（System.IdentityModel.Tokens.Jwt） |
| Test Runner | xUnit |
| Test Command | `dotnet test --filter "Category!=Ignore"` |

## 實作流程

1. 從 `ScenarioContext` 取得 `AppDbContext`（`_ctx.Get<AppDbContext>("DbContext")`）。
2. 從 DBML 提取屬性、型別、複合 Key、enum。
3. 建立 EF Core Entity instance，使用 `dbContext.Add()`。
4. 呼叫 `dbContext.SaveChanges()` 持久化。
5. 將 ID 存入共享狀態：`Ids["{natural_key}"] = entity.Id`。

## 共用基礎設施（Constructor Injection）

```csharp
[Binding]
public class AggregateGivenSteps
{
    private readonly ScenarioContext _ctx;
    private readonly HttpClient _client;
    private readonly AppDbContext _dbContext;
    private readonly JwtHelper _jwtHelper;

    public AggregateGivenSteps(ScenarioContext ctx)
    {
        _ctx = ctx;
        _client = ctx.Get<HttpClient>("HttpClient");
        _dbContext = ctx.Get<AppDbContext>("DbContext");
        _jwtHelper = ctx.Get<JwtHelper>("JwtHelper");
    }

    private Dictionary<string, object> Ids => _ctx.Get<Dictionary<string, object>>("Ids");
}
```

## 單一 Entity 建立

```csharp
[Given(@"用戶 ""(.*)"" 的購物車中商品 ""(.*)"" 的數量為 (.*)")]
public void GivenCartItem(string userName, string productId, int quantity)
{
    var userId = Ids[userName].ToString()!;
    var dbContext = _ctx.Get<AppDbContext>("DbContext");
    var cartItem = new CartItem
    {
        UserId = userId,
        ProductId = productId,
        Quantity = quantity
    };
    dbContext.CartItems.Add(cartItem);
    dbContext.SaveChanges();
}
```

## DataTable 批量建立

```csharp
[Given(@"系統中有以下用戶：")]
public void GivenUsersExist(Table table)
{
    var dbContext = _ctx.Get<AppDbContext>("DbContext");
    foreach (var row in table.Rows)
    {
        var user = new User
        {
            Id = row["userId"],
            Name = row["name"],
            Email = row["email"]
        };
        dbContext.Users.Add(user);
        Ids[row["name"]] = user.Id;
    }
    dbContext.SaveChanges();
}
```

## DocString（多行文字）

```csharp
[Given(@"用戶 ""(.*)"" 的個人簡介為：")]
public void GivenUserBio(string userName, string docString)
{
    var userId = Ids[userName].ToString()!;
    var dbContext = _ctx.Get<AppDbContext>("DbContext");
    var profile = dbContext.UserProfiles.First(p => p.UserId == userId);
    profile.Bio = docString;
    dbContext.UserProfiles.Update(profile);
    dbContext.SaveChanges();
}
```

## 複合主鍵推斷（從 Gherkin 關係詞）

| 關係詞 | Gherkin 範例 | 複合 Key |
|---|---|---|
| 在 | 用戶 "Alice" 在課程 1 | (UserId, LessonId) |
| 對 | 用戶 "Alice" 對訂單 "ORDER-123" | (UserId, OrderId) |
| 與 | 用戶 "Alice" 與用戶 "Bob" | (UserIdA, UserIdB) |
| 於 | 商品 "MacBook" 於商店 "台北店" | (ProductId, StoreId) |

## 中文狀態映射（C# 慣例）

C# 專案多使用 PascalCase enum；建議用 `Dictionary<string,string>` 集中管理：

```csharp
private static readonly Dictionary<string, string> StatusMap = new()
{
    ["進行中"] = "InProgress",
    ["已完成"] = "Completed",
    ["未開始"] = "NotStarted",
    ["已付款"] = "Paid",
    ["待付款"] = "Pending"
};
```

> 主 SKILL.md 共用表為 `IN_PROGRESS` 等 SCREAMING_SNAKE_CASE。C# 專案視 backend enum 命名慣例選用，與 `aggregate-then` / `readmodel-then` 保持一致。

## C# 特化規則

- **C-R1（DbContext.Update 處理 upsert）**：若資料可能已存在，使用 `Update()` 避免重複插入失敗。
- **C-R2（強型別 Entity）**：禁用 anonymous object / Dictionary 作為 Entity；必須使用 EF Core Entity class。
- **C-R3（Ids 字典型別）**：`Dictionary<string, object>`，從 `_ctx.Get<...>("Ids")` 取得；取值用 `.ToString()!`。
