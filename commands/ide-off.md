---
description: 關閉 IDE MCP（阻擋 VS Code selection / diagnostics / 檔案讀取）
allowed-tools: Bash(node *)
disable-model-invocation: true
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/ide-toggle.mjs" off`

執行結果以上方腳本輸出為準。若顯示切換成功，請 /exit 後重啟 claude session 讓設定生效。
