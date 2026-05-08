# starter × PHP — N/A

此語言變體**不需要**本 stage，因為：
PHP plugin 的環境初始化由 `@wordpress/env` (wp-env) 前置流程處理——啟動 docker-compose、安裝 WP 核心與依賴 plugin、套用 `.wp-env.json` 設定。本 skill 不重複造輪子，也不替代 WP 生態的標準工作流。

## 替代路徑

- 若你需要「初始化 WP plugin 開發環境」 → 在 plugin 根目錄執行 `npx wp-env start`（或專案約定的等價命令）；具體設定見專案 `.wp-env.json`。
- 若你需要「初始化 PHPUnit 測試骨架」 → 直接進入下一 stage：`references/test-skeleton/php.md`。
- 若你需要「初始化新 plugin 的整體骨架」（plugin header / composer / 目錄結構）→ 屬 plugin 開發本身的工作，不在 TDD pipeline 內，由其他 skill（如 `wp-plugin-development`）或手動處理。
- 若你需要「跑 control-flow 批次測試」 → 直接進入 `references/control-flow/php.md`，control-flow 內會檢查 wp-env 是否已啟動。

## 為何此 stage 在此語言不存在

- **wp-env 是 WordPress 生態的標準**：每個 WP plugin 專案幾乎都採用 `@wordpress/env`，提供 docker-compose 化的測試環境（含 WP core + MySQL + 必要 plugin）。重新發明一個 starter 反而違反慣例。
- **PHP IT 沒有 scaffolding 樣板**：csharp / typescript starter 的核心工作是「從 templates/ 複製樣板檔案」（13 個 `.cs` / 8 個 `.ts`）；PHP IT 直接用 plugin 既有目錄結構（`includes/` / `tests/` / `src/`），無樣板複製需求。
- **責任邊界**：plugin 本身的 scaffolding（plugin header、composer 設定、autoload）屬於 plugin 開發前置工作，不屬於 BDD 測試 pipeline；本 skill 只管 BDD pipeline。
