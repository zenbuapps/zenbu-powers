# readmodel-then — C# Integration Test

> 主 SKILL.md 已涵蓋：trigger 辨識、決策樹、共用規則 R1-R9、中文狀態對應表。本檔僅提供 C# 特化內容。

## 技術 stack

| 項目 | 技術 |
|---|---|
| Language | C# 12 / .NET 8+ |
| BDD | SpecFlow 3.9+ |
| HTTP | WebApplicationFactory + HttpClient |
| JSON | System.Text.Json |
| Assertion | FluentAssertions 6+ |

## 任務

讀取 When 階段儲存的 `HttpResponseMessage`（`_ctx["LastResponse"]`），驗證 Query API 回傳的 Response Body 內容。

## 實作流程

1. 從 `_ctx` 取出 `HttpResponseMessage`（key: `"LastResponse"`）。
2. `await response.Content.ReadAsStringAsync()` 取得 body 字串。
3. `JsonSerializer.Deserialize<JsonElement>(body)` 解析 JSON。
4. 處理 envelope（若 API 包裝在 `data` / `items` 欄位下）。
5. 用 FluentAssertions 驗證欄位與值（欄位名必須符合 `api.yml` response schema）。

## 基本 Step Class 結構

```csharp
using System.Text.Json;
using FluentAssertions;
using TechTalk.SpecFlow;

namespace ProjectName.IntegrationTests.Steps.Lesson.ReadModelThen;

[Binding]
public class LessonProgressReadModelSteps
{
    private readonly ScenarioContext _ctx;
    public LessonProgressReadModelSteps(ScenarioContext ctx) => _ctx = ctx;
}
```

## 單一欄位驗證

```csharp
[Then(@"查詢結果應包含進度 (.*)，狀態為 ""(.*)""")]
public async Task ThenResultContains(int progress, string status)
{
    var response = _ctx.Get<HttpResponseMessage>("LastResponse");
    var body = await response.Content.ReadAsStringAsync();
    var data = JsonSerializer.Deserialize<JsonElement>(body);

    var statusMap = new Dictionary<string, string>
    {
        ["進行中"] = "IN_PROGRESS",
        ["已完成"] = "COMPLETED",
        ["未開始"] = "NOT_STARTED"
    };
    var expectedStatus = statusMap.GetValueOrDefault(status, status);

    data.GetProperty("progress").GetInt32().Should().Be(progress,
        "預期進度 {0}", progress);
    data.GetProperty("status").GetString().Should().Be(expectedStatus,
        "預期狀態 {0}", expectedStatus);
}
```

## List 數量驗證（含 envelope 處理）

```csharp
[Then(@"查詢結果應包含 (.*) 筆記錄")]
public async Task ThenResultCount(int expectedCount)
{
    var response = _ctx.Get<HttpResponseMessage>("LastResponse");
    var body = await response.Content.ReadAsStringAsync();
    var data = JsonSerializer.Deserialize<JsonElement>(body);

    var items = ExtractArray(data);
    items.GetArrayLength().Should().Be(expectedCount);
}

private static JsonElement ExtractArray(JsonElement root)
{
    if (root.ValueKind == JsonValueKind.Array) return root;
    if (root.TryGetProperty("data", out var d) && d.ValueKind == JsonValueKind.Array) return d;
    if (root.TryGetProperty("items", out var i) && i.ValueKind == JsonValueKind.Array) return i;
    if (root.TryGetProperty("results", out var r) && r.ValueKind == JsonValueKind.Array) return r;
    throw new InvalidOperationException("Response 不含可識別的陣列欄位（data / items / results）");
}
```

## DataTable 逐列驗證

```csharp
[Then(@"查詢結果應包含以下記錄：")]
public async Task ThenResultContainsRecords(Table table)
{
    var response = _ctx.Get<HttpResponseMessage>("LastResponse");
    var body = await response.Content.ReadAsStringAsync();
    var data = JsonSerializer.Deserialize<JsonElement>(body);
    var items = ExtractArray(data);

    items.GetArrayLength().Should().BeGreaterThanOrEqualTo(table.RowCount,
        "Response 陣列長度 {0}，Gherkin 預期至少 {1}", items.GetArrayLength(), table.RowCount);

    foreach (var row in table.Rows)
    {
        var matched = items.EnumerateArray().Any(item =>
            table.Header.All(header =>
                item.TryGetProperty(header, out var prop) &&
                prop.ToString() == row[header]
            ));

        matched.Should().BeTrue(
            "找不到符合 Gherkin row 的項目: {0}",
            string.Join(", ", table.Header.Select(h => $"{h}={row[h]}")));
    }
}
```

## 巢狀物件驗證

```csharp
[Then(@"用戶 ""(.*)"" 的購物車總金額應為 (.*)")]
public async Task ThenCartTotalShouldBe(string userName, decimal expectedTotal)
{
    var response = _ctx.Get<HttpResponseMessage>("LastResponse");
    var body = await response.Content.ReadAsStringAsync();
    var data = JsonSerializer.Deserialize<JsonElement>(body);

    // 假設 response shape: { "summary": { "total": 1234.5 } }
    var total = data.GetProperty("summary").GetProperty("total").GetDecimal();
    total.Should().Be(expectedTotal);
}
```

## 欄位不存在驗證

```csharp
[Then(@"查詢結果不應包含 ""(.*)"" 欄位")]
public async Task ThenResultNotContainField(string fieldName)
{
    var response = _ctx.Get<HttpResponseMessage>("LastResponse");
    var body = await response.Content.ReadAsStringAsync();
    var data = JsonSerializer.Deserialize<JsonElement>(body);

    data.TryGetProperty(fieldName, out _).Should().BeFalse(
        "Response 不應含有 {0} 欄位（敏感欄位過濾）", fieldName);
}
```

## JsonElement 型別安全取值

```csharp
// 整數
var id = data.GetProperty("id").GetInt32();
var count = data.GetProperty("count").GetInt64();

// 字串
var name = data.GetProperty("name").GetString();

// 小數
var price = data.GetProperty("price").GetDecimal();

// 布林
var isActive = data.GetProperty("isActive").GetBoolean();

// 可選欄位（Safe）
var description = data.TryGetProperty("description", out var desc)
    ? desc.GetString() : null;
```

## 欄位名慣例

C# / ASP.NET Core 預設 JSON 序列化為 **camelCase**（`lessonId`, `newLeadsThisMonth`）。`api.yml` 中的 schema 欄位名應保持一致。

```csharp
// ✅ camelCase（與 api.yml 一致）
data.GetProperty("lessonId").GetInt32()

// ❌ snake_case（.NET 預設不會這樣序列化）
data.GetProperty("lesson_id").GetInt32()
```

若後端明確使用 `snake_case`（透過 `JsonNamingPolicy.SnakeCaseLower`），測試中也要對應。

## C# 特化規則

- **C-R1（不重新呼叫 API）**：使用 When 中儲存的 `_ctx["LastResponse"]`。
- **C-R2（處理 envelope）**：若 API 回傳 `{"data": [...]}`，需先解包；用 `ExtractArray` helper。
- **C-R3（使用 JsonElement 型別安全 API）**：`GetInt32()` / `GetString()` 等，不要用字串 parse。
- **C-R4（可選欄位用 TryGetProperty）**：避免 `KeyNotFoundException`。
- **C-R5（List 驗證要查數量 AND 內容）**：不能只看 count，要逐項確認。

## 完成條件

- 所有 Gherkin Then（readmodel 類型）已實作
- 欄位名與 `api.yml` response schemas 完全一致
- Envelope 處理邏輯抽取為 helper（避免重複）
- DataTable 驗證支援逐列比對
- 測試訊息具診斷價值
