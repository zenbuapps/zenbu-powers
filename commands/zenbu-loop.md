---
description: 啟動 Manual Loop（顯式調用，max 自訂）——持續呼叫 acceptance-evaluator 直到 PASS 或達 max-iterations
argument-hint: "<task> [--max <n>]"
allowed-tools: Bash(node *)
disable-model-invocation: true
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/zenbu-loop-setup.mjs" $ARGUMENTS`

zenbu-loop Manual Loop 已就緒。後續行為：

1. **PASS 才停**——每次 session 嘗試 exit 時 Stop hook 會跑 `@zenbu-powers:acceptance-evaluator` 驗收當前產出；通過即任務完成、自動退出 Manual Loop。
2. **FAIL 餵回**——驗收失敗時把 evaluator 缺陷清單塞回主窗口，orchestrator 依清單修正後再嘗試。
3. **上限保護**——達 `--max`（預設 10）仍 FAIL 才升級用戶裁決，不會無限循環。
4. **State file 優先**——Manual Loop 不論 `ZENBU_HOOKS_ENABLED` 是否啟用都會運作（state file 存在即觸發 hook）。Auto Loop 預設啟用後 Manual Loop 仍優先處理（state file 判定先於 env）。

主窗口請依 task 描述開工，不必等用戶確認；驗收 PASS 前不要主動講「收工 / 完成」（也不能靠輸出特定字串繞過 evaluator——終止只認 evaluator PASS / 上限升級 / `/zenbu-loop-cancel` 三條路）。

取消: `/zenbu-loop-cancel` ・ 查狀態: `/zenbu-loop-status`
