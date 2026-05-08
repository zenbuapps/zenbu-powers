# query — C# Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 C# 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | C# 12 / .NET 8+ |
| BDD | SpecFlow 3.9+ |
| HTTP Client | WebApplicationFactory + HttpClient |
| Auth | JWT |
| Test Command | `dotnet test --filter "Category!=Ignore"` |

## 任務

使用 HttpClient（來自 WebApplicationFactory）發送 HTTP GET 請求，執行資料讀取操作，response 存入 `_ctx["LastResponse"]`。

## 實作流程

1. 從 `Ids` 字典取得用戶 ID。
2. 使用 `_jwtHelper.GenerateToken(userId)` 產生 JWT Token。
3. 設定 `Authorization` header（`Bearer` token）。
4. 構建 URL（含 path parameters 和 query parameters）。
5. 執行 `_client.GetAsync(url)`。
6. 儲存 response 到 `_ctx["LastResponse"]`。
7. **不驗證結果** — 驗證交給 readmodel-then handler。

## 共用基礎設施（Constructor Injection）

```csharp
[Binding]
public class QuerySteps
{
    private readonly ScenarioContext _ctx;
    private readonly HttpClient _client;
    private readonly AppDbContext _dbContext;
    private readonly JwtHelper _jwtHelper;

    public QuerySteps(ScenarioContext ctx)
    {
        _ctx = ctx;
        _client = ctx.Get<HttpClient>("HttpClient");
        _dbContext = ctx.Get<AppDbContext>("DbContext");
        _jwtHelper = ctx.Get<JwtHelper>("JwtHelper");
    }

    private Dictionary<string, object> Ids => _ctx.Get<Dictionary<string, object>>("Ids");
}
```

## 基本查詢（Path Parameters）

```csharp
[When(@"用戶 ""(.*)"" 查詢課程 (.*) 的進度")]
public async Task WhenQueryProgress(string userName, int lessonId)
{
    var userId = Ids[userName].ToString()!;
    var token = _jwtHelper.GenerateToken(userId);
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);
    var response = await _client.GetAsync($"/api/v1/lessons/{lessonId}/progress");
    _ctx["LastResponse"] = response;
}
```

## 帶 Query Parameters 的查詢

使用 `QueryHelpers.AddQueryString()`（`Microsoft.AspNetCore.WebUtilities`）處理 query params：

```csharp
[When(@"用戶 ""(.*)"" 查詢旅程 (.*) 中第 (.*) 章的所有課程")]
public async Task WhenQueryLessonsByChapter(string userName, int journeyId, int chapterId)
{
    var userId = Ids[userName].ToString()!;
    var token = _jwtHelper.GenerateToken(userId);
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);
    var url = QueryHelpers.AddQueryString(
        $"/api/v1/journeys/{journeyId}/lessons",
        new Dictionary<string, string?> { ["chapterId"] = chapterId.ToString() });
    var response = await _client.GetAsync(url);
    _ctx["LastResponse"] = response;
}
```

## 列表查詢（無額外參數）

```csharp
[When(@"用戶 ""(.*)"" 查詢購物車中的所有商品")]
public async Task WhenQueryCartItems(string userName)
{
    var userId = Ids[userName].ToString()!;
    var token = _jwtHelper.GenerateToken(userId);
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);
    var response = await _client.GetAsync("/api/v1/cart/items");
    _ctx["LastResponse"] = response;
}
```

## 多重 Query Parameters

```csharp
[When(@"用戶 ""(.*)"" 搜尋價格 (.*) 到 (.*) 的商品")]
public async Task WhenSearchProducts(string userName, int minPrice, int maxPrice)
{
    var userId = Ids[userName].ToString()!;
    var token = _jwtHelper.GenerateToken(userId);
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);
    var url = QueryHelpers.AddQueryString("/api/v1/products/search",
        new Dictionary<string, string?>
        {
            ["minPrice"] = minPrice.ToString(),
            ["maxPrice"] = maxPrice.ToString()
        });
    var response = await _client.GetAsync(url);
    _ctx["LastResponse"] = response;
}
```

## API 呼叫模式

| 項目 | 模式 |
|---|---|
| HTTP Client | `_client`（HttpClient，來自 WebApplicationFactory） |
| Auth | `_jwtHelper.GenerateToken(userId)` → `new AuthenticationHeaderValue("Bearer", token)` |
| GET | `await _client.GetAsync(url)` |
| Path Params | C# 字串插值：`$"/api/v1/lessons/{lessonId}/progress"` |
| Query Params | `QueryHelpers.AddQueryString(basePath, paramDict)` |
| Response 儲存 | `_ctx["LastResponse"] = response` |

## URL 構建規則

- **Path Parameters**：直接嵌入 URL 路徑，使用 C# 字串插值 `$"/api/v1/lessons/{lessonId}"`。
- **Query Parameters**：使用 `QueryHelpers.AddQueryString()` 安全附加，自動處理 URL encoding。
- **路徑來源**：從 `api.yml` paths 讀取，不自行編造。

## C# 特化規則

- **C-R1（Query 不修改狀態）**：GET 請求不應有副作用，不可在 query step 中寫入資料庫。
- **C-R2（Response 型別）**：`_ctx["LastResponse"]` 型別為 `HttpResponseMessage`。
- **C-R3（URL = api.yml paths）**：路徑從 `api.yml` 讀取，不自行編造端點。
- **C-R4（不驗證結果）**：query step 只負責發送請求並儲存 response，驗證交給 readmodel-then。
