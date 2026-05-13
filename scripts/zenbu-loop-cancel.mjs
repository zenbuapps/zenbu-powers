#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const stateDir = '.claude';
const stateFile = join(stateDir, 'zenbu-loop.local.md');
const envEnabled = process.env.ZENBU_HOOKS_ENABLED === '1';

let prevRound = '0';
let prevMax = '?';
let prevStatus = 'enabled';

if (existsSync(stateFile)) {
	const existing = readFileSync(stateFile, 'utf8');
	const roundMatch = existing.match(/^round_count:\s*(\d+)/m);
	const maxMatch = existing.match(/^max_iterations:\s*(\d+)/m);
	const statusMatch = existing.match(/^status:\s*([a-z]+)/m);
	if (roundMatch) prevRound = roundMatch[1];
	if (maxMatch) prevMax = maxMatch[1];
	if (statusMatch) prevStatus = statusMatch[1];
}

if (prevStatus === 'disabled') {
	console.log('zenbu-loop: 已是 explicit DISABLED 狀態，無需重複取消');
	console.log(`State file: ${stateFile}`);
	console.log('Stop hook 持續略過 evaluator 驗收（不論 ZENBU_HOOKS_ENABLED）');
	console.log('重新啟用: /zenbu-powers:zenbu-loop <task>');
	process.exit(0);
}

mkdirSync(stateDir, { recursive: true });

const cancelledAt = new Date().toISOString();
const content = `---
status: disabled
cancelled_at: "${cancelledAt}"
previous_round_count: ${prevRound}
previous_max_iterations: ${prevMax}
---

zenbu-loop 已由用戶顯式取消（/zenbu-powers:zenbu-loop-cancel）。

Stop hook 偵測到 \`status: disabled\` 將立即放行 stop，不再派 @zenbu-powers:acceptance-evaluator 驗收——
此狀態覆蓋 ZENBU_HOOKS_ENABLED env，達成「一律 OFF」語意。

持久性：
  - 範圍：當前 project（cwd-relative .claude/）
  - 生命週期：持續到下次 /zenbu-powers:zenbu-loop 覆寫為 status: enabled
  - 跨 session：同 cwd 開新 Claude session 仍生效
  - 手動清除：rm .claude/zenbu-loop.local.md → 回到「無檔案 = fallback env」

重新啟用: /zenbu-powers:zenbu-loop <task>
`;

writeFileSync(stateFile, content, 'utf8');

console.log(`zenbu-loop 已顯式 DISABLED（曾跑 ${prevRound}/${prevMax} 輪）`);
console.log(`State file: ${stateFile}（status: disabled）`);
console.log('');
console.log('Stop hook 持續略過 evaluator 驗收——此狀態覆蓋 ZENBU_HOOKS_ENABLED env');
if (envEnabled) {
	console.log('  （ZENBU_HOOKS_ENABLED=1 仍存在，但 state file 優先 → 一律 OFF）');
}
console.log('');
console.log('重新啟用: /zenbu-powers:zenbu-loop <task>');
console.log('手動清檔（回到 env fallback）: rm .claude/zenbu-loop.local.md');
