#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HELP = `zenbu-loop — 啟動 Manual Loop（顯式調用 Stop hook 驗收，PASS 才停）

用法:
  /zenbu-loop <task> [--max <n>]

選項:
  --max-iterations, --max, -m <n>    最大迭代上限（預設 10，0 = unlimited）
  -h, --help                          顯示說明

範例:
  /zenbu-loop 把 acceptance-loop.md 重寫成 reference 結構
  /zenbu-loop 把 plugin 升到 v4 --max 30
  /zenbu-loop 重構 PR #123 -m 50

行為:
  1. 寫 .claude/zenbu-loop.local.md 進入 Manual Loop（state file 優先於 ZENBU_HOOKS_ENABLED env）
  2. Stop hook 每次觸發 → 跑 @zenbu-powers:acceptance-evaluator
  3. PASS → 任務完成，自動退出 Manual Loop（刪除 state file，回到 Auto Loop 或關閉）
  4. FAIL → 餵回缺陷清單繼續推進，達 max-iterations 才升級

對比 Auto Loop（ZENBU_HOOKS_ENABLED=1 自動觸發，max=10）：
  Manual 適合：明確 task 範圍 / 需要自訂 max / 沒設 env 也想用品質 loop
  Auto 適合：env 已開，所有 session 自動受 evaluator 把關（10 輪保護）

取消: /zenbu-loop-cancel
查狀態: /zenbu-loop-status
`;

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
	process.stdout.write(HELP);
	process.exit(args.length === 0 ? 1 : 0);
}

let maxIterations = 10;
const promptParts = [];

for (let i = 0; i < args.length; i++) {
	const a = args[i];
	if (a === '--max-iterations' || a === '--max' || a === '-m') {
		const n = args[++i];
		if (!/^\d+$/.test(n ?? '')) {
			console.error(`zenbu-loop: ${a} 需要 0 或正整數，得到: ${n}`);
			process.exit(1);
		}
		maxIterations = Number(n);
	} else if (a === '--completion-promise') {
		console.error('zenbu-loop: --completion-promise 已移除（LLM 自喊完成會繞過 evaluator），忽略此選項及其值');
		i++; // skip its value
	} else {
		promptParts.push(a);
	}
}

const prompt = promptParts.join(' ').trim();
if (!prompt) {
	console.error('zenbu-loop: 未提供任務描述');
	console.error('範例: /zenbu-loop 把 X 改成 Y --max 20');
	process.exit(1);
}

const stateDir = '.claude';
const stateFile = join(stateDir, 'zenbu-loop.local.md');

let prevStatus = null;
if (existsSync(stateFile)) {
	const existing = readFileSync(stateFile, 'utf8');
	const statusMatch = existing.match(/^status:\s*([a-z]+)/m);
	prevStatus = statusMatch ? statusMatch[1] : 'enabled';

	if (prevStatus === 'enabled') {
		console.error(`zenbu-loop: 已有 Manual Loop 啟動中（${stateFile}, status: enabled）`);
		console.error('先取消: /zenbu-powers:zenbu-loop-cancel');
		process.exit(1);
	}
	// status: disabled or other → 用戶 explicit 想重啟，覆寫繼續
}

mkdirSync(stateDir, { recursive: true });

const startedAt = new Date().toISOString();

const content = `---
status: enabled
active: true
mode: loop
round_count: 0
max_iterations: ${maxIterations}
started_at: "${startedAt}"
---

${prompt}
`;

writeFileSync(stateFile, content, 'utf8');

const maxLabel = maxIterations === 0 ? 'unlimited（危險，無上限保護，只能靠 evaluator PASS 或 /zenbu-loop-cancel 終止）' : `${maxIterations}`;
const envEnabled = process.env.ZENBU_HOOKS_ENABLED === '1';
const reactivatedNote = prevStatus === 'disabled'
	? '（從 explicit DISABLED 狀態重新啟用，已覆寫為 status: enabled）'
	: '';
const envNote = envEnabled
	? '（同時 Auto Loop 也啟用，但 Manual Loop 設定優先）'
	: '（Auto Loop 未啟用，僅 Manual Loop 跑）';

console.log(`zenbu-loop Manual Loop 已啟動 ${envNote}${reactivatedNote ? '\n' + reactivatedNote : ''}

任務: ${prompt.length > 100 ? prompt.slice(0, 97) + '...' : prompt}
Max iterations: ${maxLabel}
State file: ${stateFile}

接下來每次 session 嘗試 exit 時，Stop hook 會：
  1. 跑 @zenbu-powers:acceptance-evaluator 驗收當前產出
  2. PASS → 自動退出 Manual Loop
  3. FAIL → 餵回缺陷清單繼續推進
  4. 達 ${maxIterations === 0 ? 'unlimited' : maxIterations} 輪仍 FAIL → 升級用戶裁決

取消: /zenbu-loop-cancel
查狀態: /zenbu-loop-status
`);
