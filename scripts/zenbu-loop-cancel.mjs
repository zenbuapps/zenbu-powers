#!/usr/bin/env node
import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const stateFile = join('.claude', 'zenbu-loop.local.md');
const envEnabled = process.env.ZENBU_HOOKS_ENABLED === '1';

if (!existsSync(stateFile)) {
	console.log('zenbu-loop: 未啟動 Manual Loop，無需取消');
	if (envEnabled) {
		console.log('Auto Loop（ZENBU_HOOKS_ENABLED=1）仍會自動跑 evaluator max 10 輪');
	} else {
		console.log('Auto Loop 也未啟用（ZENBU_HOOKS_ENABLED 未設）');
	}
	process.exit(0);
}

const content = readFileSync(stateFile, 'utf8');
const roundMatch = content.match(/^round_count:\s*(\d+)/m);
const maxMatch = content.match(/^max_iterations:\s*(\d+)/m);
const round = roundMatch ? roundMatch[1] : '?';
const max = maxMatch ? maxMatch[1] : '?';

unlinkSync(stateFile);

console.log(`zenbu-loop Manual Loop 已取消（曾跑 ${round}/${max} 輪）`);
if (envEnabled) {
	console.log('Stop hook 回到 Auto Loop（ZENBU_HOOKS_ENABLED=1，max=10）');
} else {
	console.log('Stop hook 不再觸發（ZENBU_HOOKS_ENABLED 未設）');
}
