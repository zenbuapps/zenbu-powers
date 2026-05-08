# test-skeleton × C# — N/A

此語言變體**不需要**本 stage，因為：
SpecFlow 從 `.feature` 自動對映 step 到 C# 方法（透過 `[Given/When/Then(@regex)]` 屬性），不需要額外生成測試骨架檔案。每個 `.feature` 對應一個由 SpecFlow.Tools.MsBuild.Generation 自動生成的 `.feature.cs`，scenario 自動展開為 `[Test]` 方法，無需 AI 介入。

## 替代路徑

- 若你想做「從 .feature 生成 step 骨架」 → 改用 `references/step-template/csharp.md`（C# 變體把測試骨架責任放在 step-template）。
- 若你想做「建立 SpecFlow 專案結構」 → 改用 `references/starter/csharp.md`（一次性，建立 .csproj / SpecFlow 設定 / FeatureFiles 目錄）。
- 若你想做「紅燈實作測試」 → 直接進入 `references/red/csharp.md`，red 階段會引用 `aibdd-handlers (handler=…, lang=csharp)` 載入 handler 樣板。

## 為何此 stage 在此語言不存在

- **SpecFlow 自動代碼生成**：`.feature` 檔在 build 時由 `SpecFlow.Tools.MsBuild.Generation` 自動轉為 `.feature.cs`（含所有 scenario 的 `[Test]` 方法骨架），不需要 AI 預先寫測試類別檔案。
- **step 對映用屬性 regex**：`[Given(@"^用戶 \"([^\"]*)\" 已訂閱課程 (\d+)$")]` 直接寫在 step definition 方法上；step-template 階段已負責生成這些屬性與方法簽名。
- **無「測試類別骨架 → 測試方法骨架」兩層結構**：PHP 因為 PHPUnit 一個 method = 一個 scenario，需要 test-skeleton 預生 method body 框架；C# 的「測試方法」由 SpecFlow 自動生成，AI 只需處理「step definition 類別」（屬於 step-template 範疇）。
