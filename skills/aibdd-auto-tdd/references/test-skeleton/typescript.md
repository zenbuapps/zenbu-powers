# test-skeleton × TypeScript — N/A

此語言變體**不需要**本 stage，因為：
Cucumber + Vitest 從 `.feature` 自動對映 step 到 TypeScript 函數（透過 `defineFeature` / `Given/When/Then` callback），不需要額外生成獨立的測試骨架檔。step-template 階段已產出 `.steps.ts` 含 `defineFeature(...)` 結構與所有 step callback 簽名，scenario 由 Cucumber 自動展開為 Vitest `test` block，無需 AI 預先寫測試類別。

## 替代路徑

- 若你想做「從 .feature 生成 step 骨架」 → 改用 `references/step-template/typescript.md`（TS 變體把測試骨架責任放在 step-template，含 `defineFeature` + `expect.fail()` placeholder）。
- 若你想做「初始化 React IT 測試基礎建設」 → 改用 `references/starter/typescript.md`（一次性，建立 vitest.config / MSW server / `renderWithProviders` helper）。
- 若你想做「紅燈實作測試」 → 直接進入 `references/red/typescript.md`，red 階段會引用 `aibdd-handlers (handler=…, lang=typescript)` 載入 handler 樣板。

## 為何此 stage 在此語言不存在

- **Cucumber 由 .feature 直接驅動**：`defineFeature(loadFeature('xxx.feature'), test => { test('Scenario name', ({ given, when, then }) => { … }) })` 的結構，scenario 自動展開為 Vitest test block，AI 只需在 step-template 階段寫好 callback 簽名。
- **無「測試類別骨架 → 測試方法骨架」兩層結構**：PHP 因 PHPUnit method = scenario，需要 test-skeleton 預生 method body；TS 的測試方法由 Cucumber callback 動態組合，AI 只需處理 step definitions（屬 step-template 範疇）。
- **Component render 即是測試 entry**：React IT 的 scenario 透過 `renderWithProviders(<Page />)` 啟動，無需另外建立「測試類別」概念；step callback 直接持有 render 後的 `screen` / `user` 進行互動，不需要骨架預先封裝。
