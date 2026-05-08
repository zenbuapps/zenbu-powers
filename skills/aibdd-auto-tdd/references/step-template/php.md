# step-template × PHP — N/A

此語言變體**不需要**本 stage，因為：
PHPUnit 沒有 step-by-step 的 Gherkin runner（不像 SpecFlow / Cucumber 用屬性 / regex 對映 step），測試方法本身就是「scenario 級別」的單位。因此 PHP IT 變體把「step-template」與「test-skeleton」合併為一個階段——直接在 test-skeleton 階段生成完整的 `test_*` 方法骨架（含 Given/When/Then 註解 + assertion stub），不需要先生獨立的 step 骨架再組合。

## 替代路徑

- 若你想做「從 .feature 生成測試骨架」 → 改用 `references/test-skeleton/php.md`（PHP 把兩 stage 合併為一）。
- 若你想做「step → handler 路由分析」 → 改用 `aibdd-handlers (handler=…, lang=php)`（handler 路由由 aibdd-handlers skill 負責，與 step-template 階段分離）。
- 若你想做「紅燈實作測試」 → 直接進入 `references/red/php.md`，red 階段會引用 `aibdd-handlers (handler=…, lang=php)` 載入 handler 樣板。

## 為何此 stage 在此語言不存在

- **PHPUnit 測試方法 = scenario 單位**：一個 `public function test_user_can_subscribe_course()` 方法直接對映一個 Gherkin scenario，不需要拆成多個 step 函數；step 內容寫在方法 body 裡（搭配 `// Given:` / `// When:` / `// Then:` 註解）。
- **無 regex 對映層**：SpecFlow 用 `[Given(@"^用戶 \"([^\"]*)\" 已訂閱課程 (\d+)$")]` 把 step 字串對應到 C# 方法；Cucumber 用 `Given(/^.../, fn)`。PHPUnit 沒有這層機制，因此沒有「step template」的概念。
- **handler 路由仍存在**：雖然沒有 step-template 階段，但「step 句型 → handler 類型」的邏輯仍由 `aibdd-handlers` skill 處理；只是觸發點移到 test-skeleton（生骨架時順帶標註 `[Handler: xxx]`）與 red（實作時載入 handler 樣板）兩階段。
