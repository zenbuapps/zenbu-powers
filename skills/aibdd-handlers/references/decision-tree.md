# Decision Tree：從 Gherkin 句型推導 Handler

> 本檔詳述主 SKILL.md 中精簡決策樹的每個分支，含關鍵詞、反例與三語言差異備註。
> 載入順序：上游 skill → 主 `aibdd-handlers` SKILL.md → 本檔 → 各語言 reference。

---

## 整體流程

```
1. 看 Gherkin keyword（Given / When / Then）→ 縮小候選
2. 看時態與動詞語意（過去式 / 現在式；寫入 / 讀取 / 驗證）
3. 看驗證對象（DB / queryResult / response / DOM / payload）
4. 決定 handler，再依語言載入 references/{handler}/{language}.md
```

---

## 分支 1：Given 過去式 + 修改狀態 → command

**關鍵詞**：`已訂閱`、`已建立`、`已新增`、`已完成`、`已更新`、`已刪除`、`已註冊`、`已添加`

**句型範例**：
- 「用戶 Alice **已訂閱**課程 1」
- 「訂單 ORD-001 **已建立**」
- 「管理者 **已新增**商品 PROD-001」

**為何用 command 而非 aggregate-given？**
- 「已訂閱」隱含完整業務流程（建立 subscription、扣額度、發通知…），透過 Service 而非直接寫 DB 才能驗證業務正確性。
- 若僅需要「subscription 紀錄存在」這個事實，且不在乎流程正確性，可改用 aggregate-given（速度更快、繞過業務邏輯）。

**語言差異**：
- **C#**：`HttpClient.PostAsync()` + JWT，response 存 `_ctx["LastResponse"]`。
- **PHP**：`$this->services->xxx->method()`，**Given 不包 try/catch**（前置失敗代表測試環境壞了）。
- **TypeScript**：`user-event` 完成 UI 流程；同樣不預期失敗。

**反例**：
- 「用戶 Alice **的**角色**為** administrator」→ 描述狀態而非動作 → aggregate-given。
- 「用戶 Alice **存在於**系統中」→ 純存在性 → aggregate-given。

---

## 分支 2：Given 過去式 + 直接資料注入 → aggregate-given

**關鍵詞**：`為`（屬性 = 值）、`包含`、`存在`、`有`、`系統中有`、`包括`

**句型範例**：
- 「用戶 Alice 在課程 1 的進度**為** 50%，狀態**為** "進行中"」
- 「系統中**有**以下用戶」
- 「課程 1 **包含** 5 個章節」
- 「用戶 Alice **存在**且角色為 administrator」

**判斷要訣**：句子在「描述世界的初始狀態」而非「描述某人做了某動作」。沒有業務動詞，只有屬性與值。

**語言差異**：
- **C#**：`dbContext.Set<T>().Add()` + `SaveChanges()`，使用 EF Core Entity；自然鍵 → ID 存 `Ids` 字典。
- **PHP**：`$this->factory()->user->create()` 取得 WP ID，再 `new Model(...)` + `$this->repos->xxx->save()`。
- **TypeScript**：`server.use(http.get(...))` 註冊 MSW handler 回傳 factory data；不直接「寫入」任何儲存層，而是「設定 mock」。

**反例**：
- 「用戶 Alice **已建立**訂單」→ 業務動作 → command（除非確定要繞過業務流程）。
- 「用戶 Alice **登入**」→ 是動作不是狀態描述 → command。

---

## 分支 3：When 現在式 + 修改狀態 → command

**關鍵詞**：`更新`、`建立`、`新增`、`刪除`、`提交`、`取消`、`完成`、`移除`、`添加`

**句型範例**：
- 「用戶 Alice **更新**課程 1 的影片進度為 80%」
- 「管理者 **建立**新商品 PROD-002」
- 「用戶 Alice **提交**訂單」

**和「Given + command」的差別**：
- **Given + command**：前置操作，**不預期失敗**，PHP 不包 try/catch。
- **When + command**：測試目標，**可能成功或失敗**，PHP 必須 try/catch 把錯誤存 `$this->lastError`，C# 不需 catch（HttpResponseMessage 自然攜帶 status code）。

**語言差異**：
- **C#**：HTTP method 對應動詞——POST / PUT / PATCH / DELETE，按 `api.yml` 路徑。
- **PHP**：When 必包 try/catch，錯誤存 `$this->lastError` 供 `success-failure` 驗證。
- **TypeScript**：`user.click()` / `user.type()` / `user.selectOptions()` 模擬 UI 互動；後續用 `waitFor` 等 loading 消失。

---

## 分支 4：When 現在式 + 讀取 → query

**關鍵詞**：`查詢`、`取得`、`列出`、`搜尋`、`檢視`、`獲取`、`讀取`、`瀏覽`

**句型範例**：
- 「用戶 Alice **查詢**課程 1 的進度」
- 「用戶 Alice **列出**購物車中的所有商品」
- 「用戶 Alice **搜尋**關鍵字 "React" 的課程」

**判斷要訣**：動作不修改系統狀態（無副作用）；後續一定會有 Then 驗證查到的資料。

**語言差異**：
- **C#**：`HttpClient.GetAsync()` + `QueryHelpers.AddQueryString()` 處理 query params，response 存 `_ctx["LastResponse"]`。
- **PHP**：`$this->services->xxx->getXxx()`，結果存 `$this->queryResult`；同時包 try/catch 處理「Query 也可能失敗」（如權限不足）。
- **TypeScript**：以 `renderWithProviders(<Page />)` 觸發 Component fetch；`waitFor` 等 loading indicator 消失。**沒有顯式「呼叫 query 函數」這個步驟**——render 即是 query。

**反例**：
- 「用戶 Alice **更新**進度」→ 修改狀態 → command。
- 「用戶 Alice **點擊**查詢按鈕」→ 是 UI 動作但若觸發的是 GET，仍是 query；TypeScript 場景下用 user-event 模擬 click 後再 waitFor。

---

## 分支 5：Then 驗證返回值（成敗） → success-failure

**關鍵詞**：`操作成功`、`操作失敗`、`應成功`、`應失敗`、`錯誤訊息應為`、`應拋出`、`原因為`、`應回傳錯誤`、`未授權`、`禁止`

**句型範例**：
- 「**操作成功**」
- 「**操作失敗**」
- 「**錯誤訊息應為** "進度不可倒退"」
- 「**應拋出** `InvalidStateException` 例外」（PHP）
- 「應回傳 **HTTP 狀態碼** 401」（C#）

**判斷要訣**：句子只關心「成 / 敗」與「錯誤訊息」，不關心具體業務資料。

**語言差異**：
- **C#**：驗 `HttpResponseMessage.StatusCode` 是否 2xx / 4xx；錯誤訊息從 ProblemDetails (`detail` / `title`) 或自訂格式 (`message` / `error`) 抽。
- **PHP**：呼叫基類 helper —— `assert_operation_succeeded()` / `assert_operation_failed()` / `assert_operation_failed_with_message()` / `assert_operation_failed_with_type()`；資料來源是 `$this->lastError`。
- **TypeScript**：找 UI 上的成功 / 失敗指標——toast、`role="alert"`、error message text、disabled 狀態變化；用 `waitFor` 等待出現。

**反例**：
- 「查詢結果應包含 3 筆」→ 驗具體資料 → readmodel-then。
- 「用戶的進度應為 80%」→ 驗 Aggregate 屬性 → aggregate-then。

---

## 分支 6a：Then 驗證儲存層狀態（後端）→ aggregate-then

**關鍵詞**：`應為`、`的…為`、`數量應為`、`應包含 N 個`、`應不包含`、`應存在`、`應不存在`

**句型範例**：
- 「用戶 Alice 在課程 1 的進度**應為** 80%，狀態**應為** "進行中"」
- 「訂單 ORD-001 的總金額**應為** 90000」
- 「用戶 Alice 的購物車**應有** 3 個商品」
- 「用戶 Alice 的購物車**應不包含**商品 PROD-001」

**前提**：本分支是 Command（寫入）後驗證 DB 持久化結果，非 Query。

**語言差異**：
- **C#**：`dbContext.Set<T>().FirstOrDefault(...)` + FluentAssertions；**必先 `ChangeTracker.Clear()` 或用 `AsNoTracking()`** 避免快取。
- **PHP**：`$this->repos->xxx->findXxx()` + PHPUnit `assertSame` / `assertNotNull` / `assertCount`；**禁讀 `$this->queryResult`**（那屬 readmodel-then）。
- **TypeScript**：**非典型用法**——前端沒有「儲存層」，所以 aggregate-then 退化為「驗證 MSW 攔截到的 request payload」（`captureMswRequest()` + `requestRef.current`），檢查前端是否送出了正確的資料。

---

## 分支 6b：Then 驗證 Query 回傳結果 → readmodel-then

**關鍵詞**：`查詢結果應`、`應顯示`、`應回傳`、`第 N 個應為`、`應為空`、`頁面應顯示`、`應包含`（針對 Query 結果而非 DB）

**句型範例**：
- 「**查詢結果應**包含進度 80，狀態為 "進行中"」
- 「查詢結果**應包含** 2 筆記錄」
- 「**第一個**商品的 ID **應為** "PROD-001"」
- 「查詢結果**應為空**」
- 「**頁面應顯示** "物件導向基礎"」（TS）

**前提**：本分支是 Query（讀取）後驗證回傳資料，非 Command。

**語言差異**：
- **C#**：從 `_ctx["LastResponse"]` 讀 `HttpResponseMessage`，`ReadAsStringAsync()` + `JsonSerializer.Deserialize<JsonElement>()`，處理 `data` / `items` / `results` envelope；用 `JsonElement.GetInt32()` / `GetString()` 等型別安全 API。
- **PHP**：直接讀 `$this->queryResult`（強型別 Model 物件或陣列），用 getter（`getProgress()`）取值；列表先 `assertIsArray` 再 `assertCount`。
- **TypeScript**：用 Testing Library queries（`screen.getByText` / `getByRole` / `within`）驗 DOM；UI 顯示中文時**不需**反向映射 enum，直接 `getByText('進行中')`。

**和 aggregate-then 的差別**：
- 後端：aggregate-then 重新查 DB，readmodel-then 讀 cached response。
- 前端：aggregate-then 驗送出的 request payload，readmodel-then 驗顯示的內容。

---

## 多語言差異備註

### 後端 (PHP / C#) vs 前端 (TS) 的 aggregate-then 語意翻轉

> 後端：「驗證儲存層的最終資料」=> 重新查 DB。
> 前端：「驗證系統狀態變更」=> 沒有 DB 可查，改驗「前端送出了正確的 payload」（即 `captureMswRequest`）。

兩者抽象角色相同（都是「States Verify」），實作差異很大。讀對應語言的 reference 才會看到正確樣板。

### Query 對應的 Then 在前端是 DOM 而非物件

- 後端 readmodel-then 讀 `$this->queryResult` / `_ctx["LastResponse"]`（物件 / JSON）。
- 前端 readmodel-then 讀 DOM（畫面顯示什麼就驗什麼）。

這是因為前端的「Query」其實是「render Component → Component 內部 fetch → 顯示資料」，使用者看到的是 DOM 結果。

### 「已訂閱」在前端對應 UI 訂閱通知，與後端不同？

注意：前端的「已訂閱」幾乎一定還是 command（透過 user-event 完成 UI 訂閱流程），而非「設定 MSW mock 說某 user 已訂閱」。除非真的只是想 mock 一個列表 endpoint 顯示「Alice 已訂閱」，那才是 aggregate-given。判斷依據是「這個事實是否需要透過業務流程產生」。

---

## 邊緣情況

### Given 同時描述狀態與動作

例：「用戶 Alice **已建立**訂單 ORD-001，**包含**商品 PROD-001 數量 2」

拆成兩個 step：
- 「已建立訂單 ORD-001」→ command（Given）
- 「包含商品 PROD-001 數量 2」可能由 `services->order->create()` 一次處理，不需要再寫 aggregate-given step。

實作時通常合併為一個 command 呼叫，並把 `$orderId` 存進 `$this->ids['ORD-001']`。

### Then 同時驗 DB 和 response

例：
```gherkin
When 用戶 "Alice" 提交訂單
Then 操作成功
And 訂單 ORD-001 的狀態應為 "已付款"
And 查詢結果應包含訂單 ID
```

- 「操作成功」→ success-failure
- 「訂單 ORD-001 的狀態應為 已付款」→ aggregate-then（重新查 DB）
- 「查詢結果應包含訂單 ID」→ readmodel-then（讀 response）

三個 Then 各自獨立，分別由三個 handler 實作。
