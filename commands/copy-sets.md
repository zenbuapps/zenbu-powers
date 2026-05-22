---
description: 偵測 cwd 技術棧，將 zenbu-powers skill-sets/ 與 agent-sets/ 內配對的項目直接複製到專案 .claude/skills/ 與 .claude/agents/
allowed-tools: Bash(node *)
disable-model-invocation: true
argument-hint: "[--force] [--dry-run]"
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/copy-sets.mjs" $ARGUMENTS`

完成。已將配對到的 skill-set 複製至 `.claude/skills/`、agent-set 複製至 `.claude/agents/`。

## 配對機制

- **library set** — 比對 cwd `package.json` 的 npm 依賴名稱（含 ALIAS 與去版號）
- **WordPress set** — 比對 cwd 是否為 WordPress 專案。涵蓋 `wordpress` agent-set（wordpress-master / wordpress-reviewer）、6 個 WP skill-set，以及既有 wp-* 參考 set
  - 強訊號（任一即判定）：`composer.json` 含 WP 套件、`*.php` 含 `Plugin Name:`、`style.css` 含 `Theme Name:`、`wp-content/` 目錄、cwd 路徑位於 `wp-content/plugins|themes`
  - 弱訊號（需 ≥2 才判定）：`README.md` / `CLAUDE.md` / `.claude/CLAUDE.md` 內文提及 WordPress

## 旗標

- `--dry-run` 先預覽不寫入（含 WordPress 偵測結果與命中訊號）
- `--force` 覆蓋既有同名項目
- 直接複製檔案，不使用 symlink（不需 Developer Mode 或 admin 權限）
