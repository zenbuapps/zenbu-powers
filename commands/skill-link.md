---
description: 掃 cwd package.json 依賴，將 zenbu-powers skill-sets/ 內配對的 skill 以 symlink 連到專案 .claude/skills/
allowed-tools: Bash(node *)
disable-model-invocation: true
argument-hint: "[--force] [--dry-run]"
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/skill-link.mjs" $ARGUMENTS`

完成。已將配對到的 skill-set symlink 至 `.claude/skills/`。

- `--dry-run` 先預覽不寫入
- `--force` 覆蓋既有同名項目
- Windows 需 Developer Mode 或 admin 權限才能建 symlink
