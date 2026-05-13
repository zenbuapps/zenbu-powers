---
description: 取消 zenbu-loop 驗收（一律 OFF，覆蓋 ZENBU_HOOKS_ENABLED env）——寫入 status: disabled，Stop hook 一律放行，直到下次 /zenbu-powers:zenbu-loop 重新啟用
allowed-tools: Bash(node *)
disable-model-invocation: true
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/zenbu-loop-cancel.mjs"`
