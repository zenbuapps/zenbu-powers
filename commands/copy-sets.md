---
description: 偵測 cwd 技術棧，將 zenbu-powers skill-sets/ 與 agent-sets/ 內配對的項目直接複製到專案 .claude/skills/ 與 .claude/agents/
allowed-tools: Bash(node *)
disable-model-invocation: true
argument-hint: "[--force] [--dry-run] [--set <name> ...]"
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/copy-sets.mjs" $ARGUMENTS`

執行結果以上方腳本輸出為準（配對到的 skill-set 複製至 `.claude/skills/`、agent-set 複製至 `.claude/agents/`；`--dry-run` 只預覽不寫入）。

## 配對機制

- **library set** — 比對 cwd `package.json` 的 npm 依賴名稱（含 ALIAS 與去版號；去版號後的基底名稱也會回查 ALIAS，例如 `refine-v4` / `refine-v5` 共用 `refine` 的 alias `@refinedev/core`）
  - **版本判別**：set 名稱帶 `-vN` 後綴時，會比對依賴版號的相容前綴——major ≥1 只比 major（`refine-v4` 配 `^4.x`）、major 0 比到 minor（`drizzle-orm-v0-38` 配 `^0.38.x`）。版號無法解析（`workspace:*`、`latest` 等）視為未知、照樣複製；版本不符的 set 會以 `[ver-skip]` 列出
  - **Monorepo / 多套件佈局支援**（turborepo / pnpm / nx / 前後端分離）：自 cwd 起遞迴掃描**所有**子目錄的 `package.json`（不限固定清單——`frontend/`、`client/`、`web/`、`apps/**`、`packages/**`、`src/**`、`lib/**` 等任意佈局皆涵蓋），合併全部依賴
  - 自動跳過 `node_modules`、`.git`、`dist`、`build`、`.next`、`.turbo`、`coverage`、`.cache`、`out` 與 dotfile 目錄
  - 遞迴深度上限 6 層；任一 `package.json` JSON 無效會印 warning 後跳過該檔，不中止流程
- **WordPress set** — 比對 cwd 是否為 WordPress 專案。涵蓋 `wordpress` agent-set（wordpress-master / wordpress-reviewer）、6 個 WP skill-set，以及既有 wp-* 參考 set
  - 強訊號（任一即判定）：`composer.json` 含 WP 套件、`*.php` 含 `Plugin Name:`、`style.css` 含 `Theme Name:`、`wp-content/` 目錄、cwd 路徑位於 `wp-content/plugins|themes`
  - 弱訊號（需 ≥2 才判定）：`README.md` / `CLAUDE.md` / `.claude/CLAUDE.md` 內文提及 WordPress

## 旗標

- `--dry-run` 先預覽不寫入（含 WordPress 偵測結果與命中訊號）
- `--force` 覆蓋既有同名項目
- `--set <name>`（可重複，亦支援 `--set=<name>`）——跳過自動配對，明確複製指定的 skill-set / agent-set（例如 `--set docker-compose`、`--set line-pay`）。名稱不存在時列出全部可用 set 並以非零碼結束
- 直接複製檔案，不使用 symlink（不需 Developer Mode 或 admin 權限）
