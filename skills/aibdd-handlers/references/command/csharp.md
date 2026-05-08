# command — C# Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 C# 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | C# 12 / .NET 8+ |
| BDD | SpecFlow 3.9+（Cucumber Expressions） |
| HTTP Client | WebApplicationFactory\<Program\> + HttpClient |
| JSON | System.Text.Json |
| Auth | JWT（System.IdentityModel.Tokens.Jwt） |
| Test Command | `dotnet test --filter "Category!=Ignore"` |

## 任務

使用 HttpClient（來自 WebApplicationFactory）發送 HTTP 寫入請求（POST / PUT / PATCH / DELETE），執行系統狀態變更操作。

## 實作流程

1. 從 `Ids` 字典取得用戶 ID（`Ids[userName].ToString()!`）。
2. 使用 `_jwtHelper.GenerateToken(userId)` 產生 JWT Token。
3. 構建 Request Body（欄位名 = `api.yml` schemas）。
4. 使用 `JsonSerializer.Serialize()` 序列化為 JSON。
5. 建立 `StringContent`（指定 `application/json`）。
6. 設定 `Authorization` header（`Bearer` token）。
7. 執行 HTTP 請求（`PostAsync` / `PutAsync` / `PatchAsync` / `DeleteAsync`）。
8. 儲存 response 到 `_ctx["LastResponse"]`。
9. **不做 assertion** — 驗證交給 Then handler。

## 共用基礎設施（Constructor Injection）

```csharp
[Binding]
public class CommandSteps
{
    private readonly ScenarioContext _ctx;
    private readonly HttpClient _client;
    private readonly AppDbContext _dbContext;
    private readonly JwtHelper _jwtHelper;

    public CommandSteps(ScenarioContext ctx)
    {
        _ctx = ctx;
        _client = ctx.Get<HttpClient>("HttpClient");
        _dbContext = ctx.Get<AppDbContext>("DbContext");
        _jwtHelper = ctx.Get<JwtHelper>("JwtHelper");
    }

    private Dictionary<string, object> Ids => _ctx.Get<Dictionary<string, object>>("Ids");
}
```

## When + Command（單一操作）

```csharp
[When(@"用戶 ""(.*)"" 更新課程 (.*) 的影片進度為 (.*)%")]
public async Task WhenUpdateProgress(string userName, int lessonId, int progress)
{
    var userId = Ids[userName].ToString()!;
    var token = _jwtHelper.GenerateToken(userId);
    var requestBody = new { lessonId, progress };
    var content = new StringContent(
        JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);
    var response = await _client.PostAsync(
        "/api/v1/lesson-progress/update-video-progress", content);
    _ctx["LastResponse"] = response;
}
```

## DataTable + Command（批量操作）

```csharp
[When(@"用戶 ""(.*)"" 批量更新以下商品數量：")]
public async Task WhenBatchUpdate(string userName, Table table)
{
    var userId = Ids[userName].ToString()!;
    var token = _jwtHelper.GenerateToken(userId);
    var items = table.Rows.Select(row => new {
        productId = row["productId"],
        quantity = int.Parse(row["quantity"])
    }).ToList();
    var content = new StringContent(
        JsonSerializer.Serialize(new { items }), Encoding.UTF8, "application/json");
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);
    var response = await _client.PostAsync("/api/v1/cart/batch-update", content);
    _ctx["LastResponse"] = response;
}
```

## Given + Command（前置操作）

```csharp
[Given(@"用戶 ""(.*)"" 已訂閱課程 (.*)")]
public async Task GivenUserSubscribed(string userName, int courseId)
{
    var userId = Ids[userName].ToString()!;
    var token = _jwtHelper.GenerateToken(userId);
    var requestBody = new { courseId };
    var content = new StringContent(
        JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);
    var response = await _client.PostAsync("/api/v1/subscriptions", content);
    _ctx["LastResponse"] = response;
}
```

## API 呼叫模式

| 項目 | 模式 |
|---|---|
| HTTP Client | `_client`（HttpClient，來自 WebApplicationFactory） |
| Auth | `_jwtHelper.GenerateToken(userId)` → `new AuthenticationHeaderValue("Bearer", token)` |
| POST | `await _client.PostAsync(url, content)` |
| PUT | `await _client.PutAsync(url, content)` |
| PATCH | `await _client.PatchAsync(url, content)` |
| DELETE | `await _client.DeleteAsync(url)` |
| Path Params | C# 字串插值：`$"/api/v1/lessons/{lessonId}"` |
| Request Body | `JsonSerializer.Serialize(new { ... })` → `new StringContent(..., Encoding.UTF8, "application/json")` |
| Response 儲存 | `_ctx["LastResponse"] = response` |

## DELETE 帶 Body 的特殊情況

```csharp
var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/v1/items/{itemId}")
{
    Content = new StringContent(
        JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
};
var response = await _client.SendAsync(request);
_ctx["LastResponse"] = response;
```

## C# 特化規則

- **C-R1（Command 不驗 Response）**：只儲存到 `_ctx["LastResponse"]`，assertion 交給 Then handler。
- **C-R2（欄位名 camelCase）**：Request Body 的 property name 必須與 `api.yml` schemas 一致（camelCase）。
- **C-R3（Response 型別）**：`_ctx["LastResponse"]` 型別為 `HttpResponseMessage`。
- **C-R4（Given Command 不需 try/catch）**：HTTP 框架本身就會用 status code 表達失敗，C# 不需像 PHP 那樣手動 catch。
