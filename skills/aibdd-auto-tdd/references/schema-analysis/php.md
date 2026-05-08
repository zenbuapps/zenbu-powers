# schema-analysis × PHP — N/A

此語言變體**不需要**本 stage，因為：
PHP IT 在 WordPress plugin 既有結構上跑，schema 由 WP API 動態決定，無 schema 推導需求。ERM 已由 plugin 內既有 model（含既有 `wp_*` 表與 plugin custom table）體現，不需要在紅燈前再做一次 schema 對齊檢查。

## 替代路徑

- 若你想做「測試前置環境檢查」 → 改用 `references/test-skeleton/php.md`（PHP 變體把 schema 對齊責任合併進 test-skeleton 階段）。
- 若你想做「紅燈三步驟流程」 → 直接進入下一 stage：`references/red/php.md`。
- 若你想做「migration / 資料庫變更」 → 屬 plugin 開發本身的工作，由 wp-env 前置流程或 plugin activation hook 處理，本 skill 不涉入。

## 為何此 stage 在此語言不存在

- **schema 來源不同**：csharp / typescript 需要對照 `api.yml` + `erm.dbml` 與生產碼（EF Core Migration / Zod Schema）的差異；PHP plugin 在 WordPress 框架內，schema 多以 `register_rest_route` + custom table SQL 表達，本就由 plugin code 驅動。
- **無「先生 schema、後寫測試」的工作流**：WordPress plugin 慣例是「DB 結構先在 `activate` hook 寫好，測試直接驗 plugin code 的對外行為」，沒有獨立 schema-analysis 階段。
- **wp-env 已負責環境就緒**：資料庫連線、WP 核心、必要 plugin 等由 wp-env 處理；測試環境就緒檢查屬 starter 範疇而非 schema-analysis（PHP 也無 starter，由 wp-env 前置流程處理）。
