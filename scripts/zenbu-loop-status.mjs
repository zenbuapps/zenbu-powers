#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const stateFile = join('.claude', 'zenbu-loop.local.md');
const envEnabled = process.env.ZENBU_HOOKS_ENABLED === '1';
const autoStatus = envEnabled ? 'ON（max=10）' : 'OFF（未設 ZENBU_HOOKS_ENABLED=1）';

if (!existsSync(stateFile)) {
	console.log(`zenbu-loop 狀態:

Manual Loop:  OFF（無 state file，等同未啟動）
Auto Loop:    ${autoStatus}

${envEnabled
		? '  → Stop hook 自動跑 evaluator，max 10 輪 FAIL 升級用戶'
		: '  → Stop hook 不觸發；要用品質 loop 請：\n    1. 設 ZENBU_HOOKS_ENABLED=1（自動 10 輪）\n    2. 或跑 /zenbu-powers:zenbu-loop <task>（顯式，max 自訂）'}
`);
	process.exit(0);
}

const content = readFileSync(stateFile, 'utf8');
const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

if (!fm) {
	console.log(`zenbu-loop 狀態: state file 格式異常（無合法 frontmatter）

Stop hook 偵測到損毀檔會 fallback ${envEnabled ? 'Auto Loop（ZENBU_HOOKS_ENABLED=1, max=10）' : 'OFF（env 未設）'}。

修復: rm ${stateFile} → 回到「無檔案 = fallback env」狀態
重啟: /zenbu-powers:zenbu-loop <task>

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

const statusMatch = yaml.match(/^status:\s*([a-z]+)/m);
const status = statusMatch ? statusMatch[1] : 'enabled';

if (status === 'disabled') {
	console.log(`zenbu-loop 狀態:

Manual Loop:  EXPLICIT DISABLED（用戶顯式取消，覆蓋 env）
Auto Loop:    ${autoStatus}（被 state file 強制壓制）

實際行為:    Stop hook 一律放行，不派 evaluator
Cancelled at: ${get('cancelled_at')}
Previous:     round ${get('previous_round_count')} / ${get('previous_max_iterations')}
State file:   ${stateFile}

重新啟用: /zenbu-powers:zenbu-loop <task>
手動清檔（回到 env fallback）: rm ${stateFile}
`);
	process.exit(0);
}

// status: enabled / missing / unknown → Manual ON
console.log(`zenbu-loop 狀態:

Manual Loop:  ON（status: ${status}）
Auto Loop:    ${autoStatus}

Mode:               ${get('mode')}
Round count:        ${get('round_count')} / ${get('max_iterations')}
Started at:         ${get('started_at')}
State file:         ${stateFile}

任務:
${body.trim()}

注意：Manual Loop 優先於 Auto Loop——只要 state file 存在且非 disabled，hook 走 Manual 設定的 max。

取消（一律 OFF）: /zenbu-powers:zenbu-loop-cancel
`);
