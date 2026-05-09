#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const stateFile = join('.claude', 'zenbu-loop.local.md');
const envEnabled = process.env.ZENBU_HOOKS_ENABLED === '1';
const autoStatus = envEnabled ? 'ON（max=10）' : 'OFF（未設 ZENBU_HOOKS_ENABLED=1）';

if (!existsSync(stateFile)) {
	console.log(`zenbu-loop 狀態:

Manual Loop:  OFF（未啟動 /zenbu-loop）
Auto Loop:    ${autoStatus}

${envEnabled
	? '  → Stop hook 自動跑 evaluator，max 10 輪 FAIL 升級用戶'
	: '  → Stop hook 不觸發；要用品質 loop 請：\n    1. 設 ZENBU_HOOKS_ENABLED=1（自動 10 輪）\n    2. 或跑 /zenbu-loop <task>（顯式，max 自訂）'}
`);
	process.exit(0);
}

const content = readFileSync(stateFile, 'utf8');
const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

if (!fm) {
	console.log(`zenbu-loop 狀態: Manual Loop ON（state file 格式異常）

原始內容:
${content}
`);
	process.exit(0);
}

const [, yaml, body] = fm;
const get = (k) => {
	const m = yaml.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'));
	return m ? m[1].trim().replace(/^"(.*)"$/, '$1') : '?';
};

console.log(`zenbu-loop 狀態:

Manual Loop:  ON（顯式啟動）
Auto Loop:    ${autoStatus}

Mode:               ${get('mode')}
Round count:        ${get('round_count')} / ${get('max_iterations')}
Started at:         ${get('started_at')}
State file:         ${stateFile}

任務:
${body.trim()}

注意：Manual Loop 優先於 Auto Loop——只要 state file 存在，hook 走 Manual 設定的 max。

取消: /zenbu-loop-cancel
`);
