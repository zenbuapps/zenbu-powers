#!/usr/bin/env node
// copy-sets.mjs — copy matched skill-sets/ and agent-sets/ into cwd .claude/
// usage: node copy-sets.mjs [--force] [--dry-run] [--set <name> ...]
// env: CLAUDE_PLUGIN_ROOT (plugin root containing skill-sets/ and agent-sets/)
//
// matching:
//   - library sets  → matched by cwd package.json npm dependency names
//   - WordPress sets → matched by WordPress-project detection of cwd (see WP_SETS)
//   - --set <name>  → explicitly copy the named set(s), skipping auto-matching
//                     (repeatable; also accepts --set=<name>)

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const args = new Set(argv);
const FORCE = args.has('--force') || args.has('-f');
const DRY = args.has('--dry-run') || args.has('-n');

// --set <name> / --set=<name>：明確指定要複製的 set（可重複）
const EXPLICIT_SETS = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--set') {
    const name = argv[i + 1];
    if (!name || name.startsWith('-')) {
      console.error('error: --set requires a set name (e.g. --set docker-compose)');
      process.exit(1);
    }
    EXPLICIT_SETS.push(name);
    i += 1;
  } else if (argv[i].startsWith('--set=')) {
    const name = argv[i].slice('--set='.length);
    if (!name) {
      console.error('error: --set requires a set name (e.g. --set=docker-compose)');
      process.exit(1);
    }
    EXPLICIT_SETS.push(name);
  }
}

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT
  || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillSetsDir = path.join(pluginRoot, 'skill-sets');
const agentSetsDir = path.join(pluginRoot, 'agent-sets');
const cwd = process.cwd();
const skillsTarget = path.join(cwd, '.claude', 'skills');
const agentsTarget = path.join(cwd, '.claude', 'agents');

// set name → npm package names (for non-obvious library-set cases).
// keys may also be a version-stripped base name (e.g. 'refine' covers refine-v4 / refine-v5).
const ALIAS = {
  'nextjs': ['next'],
  'antd-v5': ['antd'],
  'antd-toolkit': ['antd-toolkit', '@org/antd-toolkit'],
  'ant-design-pro-v2': ['@ant-design/pro-components', '@ant-design/pro-form', '@ant-design/pro-table'],
  'better-auth-v1-4': ['better-auth'],
  'blocknote-v0-30': ['@blocknote/core', '@blocknote/react', '@blocknote/mantine', '@blocknote/shadcn', '@blocknote/ariakit'],
  'bullmq-v5': ['bullmq'],
  'cloudflare-pages-wrangler': ['wrangler'],
  'drizzle-orm-v0-38': ['drizzle-orm'],
  'i18next-v25': ['i18next', 'react-i18next'],
  'jotai-v2': ['jotai'],
  'line-liff': ['@line/liff', '@line/liff-cli'],
  'line-message-api': ['@line/bot-sdk'],
  // 其餘 line-* / telegram-api / whatsapp-api 無明確對應 npm 套件
  // （telegram-api 走 Telethon、whatsapp-api 為 Cloud API 官方文件），
  // 不自動配對，需以 --set <name> 手動複製。
  'next-intl-v4': ['next-intl'],
  'pdf-lib-v1-17': ['pdf-lib'],
  'powerhouse-v3-3': ['@powerhousedao/reactor-api', '@powerhousedao/builder-tools'],
  'react-flow-v12': ['@xyflow/react', 'reactflow'],
  'react-hook-form-v7': ['react-hook-form'],
  'refine': ['@refinedev/core'],
  'stripe-node-v22': ['stripe'],
  'tiptap-v2': ['@tiptap/core', '@tiptap/react', '@tiptap/pm'],
  'typeorm-v0-3': ['typeorm'],
  'vidstack-hls-v1': ['vidstack', '@vidstack/react'],
};

// sets matched by WordPress-project detection instead of npm deps.
// covers WP agent-sets, WP skill-sets, and the version-pinned wp-* reference sets.
const WP_SETS = new Set([
  // agent-sets
  'wordpress',
  // WP skill-sets (moved from skills/)
  'wordpress-master', 'wordpress-router', 'wordpress-standards',
  'wp-phpstan', 'wp-project-triage', 'wp-testing',
  // existing wp-* reference skill-sets
  'vite-for-wp-v0-12', 'woocommerce-hpos', 'wp-abilities-api',
  'wp-block-development', 'wp-block-themes', 'wpds',
  'wp-interactivity-api', 'wp-mcp-adapter', 'wp-performance',
  'wp-playground', 'wp-plugin-development', 'wp-rest-api',
  'wp-wpcli-and-ops',
]);

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.turbo', 'coverage', '.cache', 'out']);
const MONOREPO_MAX_DEPTH = 6;

function readPkgDeps(pkgPath, into, sources) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const [name, range] of Object.entries(pkg[field] || {})) {
        if (!into.has(name)) into.set(name, new Set());
        into.get(name).add(String(range));
      }
    }
    sources.push(path.relative(cwd, pkgPath) || 'package.json');
    return true;
  } catch (e) {
    console.log(`warning: invalid JSON at ${path.relative(cwd, pkgPath)} (${e.message}) — skipped`);
    return false;
  }
}

function walkForPackageJson(dir, into, sources, depth = 0) {
  if (depth > MONOREPO_MAX_DEPTH) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  const pkgHere = entries.find((e) => e.isFile() && e.name === 'package.json');
  if (pkgHere) readPkgDeps(path.join(dir, 'package.json'), into, sources);
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
    walkForPackageJson(path.join(dir, e.name), into, sources, depth + 1);
  }
}

function loadDeps() {
  const into = new Map(); // dep name → Set of version ranges
  const sources = [];
  // walk the whole project from cwd: reads ./package.json, then recurses into
  // every non-skipped subdir (frontend/, client/, web/, apps/**, packages/**, …)
  // up to MONOREPO_MAX_DEPTH. SKIP_DIRS + dotfile skip keep node_modules etc. out.
  walkForPackageJson(cwd, into, sources);

  if (sources.length === 0) return { deps: null, sources };
  return { deps: into, sources };
}

// --- WordPress project detection -------------------------------------------
// strong signal → cwd is a WP project on its own.
// weak signal   → only counts when >=2 weak signals hit (avoids false positive
//                 from a non-WP repo that merely mentions WordPress in a README).

function readHead(file, bytes = 2048) {
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(bytes);
    const n = fs.readSync(fd, buf, 0, bytes, 0);
    fs.closeSync(fd);
    return buf.toString('utf8', 0, n);
  } catch { return ''; }
}

function detectComposerWp() {
  const p = path.join(cwd, 'composer.json');
  if (!fs.existsSync(p)) return false;
  try {
    const json = JSON.parse(fs.readFileSync(p, 'utf8'));
    const keys = [
      ...Object.keys(json.require || {}),
      ...Object.keys(json['require-dev'] || {}),
    ].join(' ').toLowerCase();
    return /wordpress|woocommerce|wpackagist|johnpbloch|roots\/|wp-cli/.test(keys);
  } catch { return false; }
}

function detectPathMarker() {
  const norm = cwd.replace(/\\/g, '/');
  return /wp-content\/(plugins|themes)/.test(norm);
}

function detectWpContentDir() {
  try { return fs.statSync(path.join(cwd, 'wp-content')).isDirectory(); }
  catch { return false; }
}

function detectPluginHeader() {
  try {
    const phpFiles = fs.readdirSync(cwd, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.php'))
      .slice(0, 20)
      .map((d) => path.join(cwd, d.name));
    return phpFiles.some((f) => /^[\s*]*Plugin Name:/m.test(readHead(f)));
  } catch { return false; }
}

function detectThemeHeader() {
  const p = path.join(cwd, 'style.css');
  if (!fs.existsSync(p)) return false;
  return /^[\s*]*Theme Name:/m.test(readHead(p));
}

function detectGuidanceMention() {
  const files = ['README.md', 'CLAUDE.md', path.join('.claude', 'CLAUDE.md')];
  let hits = 0;
  for (const rel of files) {
    const p = path.join(cwd, rel);
    if (!fs.existsSync(p)) continue;
    try {
      if (/wordpress|woocommerce/i.test(fs.readFileSync(p, 'utf8'))) hits += 1;
    } catch { /* ignore */ }
  }
  return hits;
}

function isWordPressProject() {
  const signals = [];
  if (detectComposerWp()) signals.push('composer.json WP package');
  if (detectPathMarker()) signals.push('cwd path under wp-content/');
  if (detectWpContentDir()) signals.push('wp-content/ directory');
  if (detectPluginHeader()) signals.push('php "Plugin Name:" header');
  if (detectThemeHeader()) signals.push('style.css "Theme Name:" header');

  const strong = signals.length > 0;
  const weakHits = detectGuidanceMention();
  if (weakHits >= 1) signals.push(`${weakHits} guidance file(s) mention WordPress`);

  // strong signal alone decides; weak signals alone need >=2 to count.
  const isWp = strong || weakHits >= 2;
  return { isWp, signals };
}

// --- copy --------------------------------------------------------------------

function stripVersionSuffix(name) {
  return name.replace(/-v[\d-]+$/, '');
}

function candidatesFor(setName) {
  const list = ALIAS[setName] ? [...ALIAS[setName]] : [];
  list.push(setName);
  const stripped = stripVersionSuffix(setName);
  if (stripped !== setName) {
    // version-pinned set (e.g. refine-v4) inherits the base-name alias (ALIAS['refine'])
    if (ALIAS[stripped]) list.push(...ALIAS[stripped]);
    list.push(stripped);
  }
  return list;
}

// set name version suffix → significant numeric segments for compatibility check.
// semver rule: major >=1 → only major is breaking ('better-auth-v1-4' → [1]);
//              major 0   → minor is breaking too ('drizzle-orm-v0-38' → [0, 38]).
function setVersionSegments(setName) {
  const m = setName.match(/-v([\d-]+)$/);
  if (!m) return null;
  const seg = m[1].split('-').map(Number);
  return seg[0] === 0 ? seg.slice(0, 2) : seg.slice(0, 1);
}

// version range → numeric segments of the first version token: '^4.56.0' → [4, 56, 0].
// returns null for unparseable ranges ('workspace:*', 'latest', ...) → treated as version-unknown.
function rangeSegments(range) {
  const m = String(range).match(/\d+(?:\.\d+)*/);
  if (!m) return null;
  return m[0].split('.').map(Number);
}

// find the dep that matches this set. version-pinned sets additionally require the
// dep's version range to prefix-match the set's version segments (unknown ranges pass).
function depMatch(setName, deps) {
  const verSeg = setVersionSegments(setName);
  let versionMiss = null;
  for (const c of candidatesFor(setName)) {
    const ranges = deps.get(c);
    if (!ranges) continue;
    if (!verSeg) return { dep: c };
    for (const r of ranges) {
      const seg = rangeSegments(r);
      if (!seg || verSeg.every((v, i) => seg[i] === v)) return { dep: c, range: r };
    }
    versionMiss = { dep: c, ranges: [...ranges] };
  }
  return versionMiss ? { versionMiss } : null;
}

function listSets(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function ensureDir(dir) {
  if (DRY) return;
  fs.mkdirSync(dir, { recursive: true });
}

function pathExists(p) {
  try { fs.lstatSync(p); return true; } catch { return false; }
}

function copySet(src, dest) {
  if (DRY) return 'dry-run';
  if (pathExists(dest)) {
    if (!FORCE) return 'exists';
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.cpSync(src, dest, { recursive: true });
  return 'copied';
}

function processKind(label, sourceDir, targetDir, deps, isWp) {
  const sets = listSets(sourceDir);
  const results = [];
  const versionSkipped = [];
  for (const set of sets) {
    let matchedBy = null;
    if (WP_SETS.has(set)) {
      if (isWp) matchedBy = 'WordPress project';
    } else {
      const m = depMatch(set, deps);
      if (m?.versionMiss) {
        versionSkipped.push({ set, ...m.versionMiss });
        results.push({ set, status: 'no-match' });
        continue;
      }
      if (m) matchedBy = m.range ? `${m.dep}@${m.range}` : m.dep;
    }
    if (!matchedBy) { results.push({ set, status: 'no-match' }); continue; }
    const src = path.join(sourceDir, set);
    const dest = path.join(targetDir, set);
    ensureDir(targetDir);
    let status;
    try { status = copySet(src, dest); }
    catch (e) { status = `error: ${e.code || e.message}`; }
    results.push({ set, matched: matchedBy, status });
  }

  const matched = results.filter((r) => r.matched);
  const copied = matched.filter((r) => r.status === 'copied');
  const skipped = matched.filter((r) => r.status === 'exists');
  const errored = matched.filter((r) => String(r.status).startsWith('error'));

  console.log(`[${label}] source: ${sourceDir}`);
  console.log(`[${label}] target: ${targetDir}`);
  console.log(`[${label}] matched ${matched.length} / ${sets.length} sets`);
  console.log(`[${label}]   copied: ${copied.length}`);
  console.log(`[${label}]   exists: ${skipped.length}  (use --force to replace)`);
  console.log(`[${label}]   errors: ${errored.length}`);
  for (const r of matched) {
    const via = r.matched === 'WordPress project'
      ? '←  WordPress project detected'
      : `←  dep "${r.matched}"`;
    console.log(`[${label}]   [${String(r.status).padEnd(8)}] ${r.set}  ${via}`);
  }
  for (const v of versionSkipped) {
    console.log(`[${label}]   [ver-skip] ${v.set}  ←  dep "${v.dep}" installed as ${v.ranges.join(', ')} (version mismatch)`);
  }
  if (errored.length) {
    console.log(`[${label}] errors detail:`);
    for (const r of errored) console.log(`[${label}]   ${r.set}: ${r.status}`);
  }
  console.log('');
}

// --set 明確模式：只複製指定 set，不做 npm / WordPress 自動配對。
function processExplicit(setNames) {
  const skillSets = new Set(listSets(skillSetsDir));
  const agentSets = new Set(listSets(agentSetsDir));
  let hadError = false;
  for (const name of setNames) {
    const kinds = [
      { label: 'skills', sourceDir: skillSetsDir, targetDir: skillsTarget, present: skillSets.has(name) },
      { label: 'agents', sourceDir: agentSetsDir, targetDir: agentsTarget, present: agentSets.has(name) },
    ].filter((k) => k.present);
    if (kinds.length === 0) {
      hadError = true;
      console.log(`[--set]   [not-found] ${name}  ←  not in skill-sets/ or agent-sets/`);
      continue;
    }
    for (const { label, sourceDir, targetDir } of kinds) {
      ensureDir(targetDir);
      let status;
      try { status = copySet(path.join(sourceDir, name), path.join(targetDir, name)); }
      catch (e) { status = `error: ${e.code || e.message}`; }
      if (String(status).startsWith('error')) hadError = true;
      console.log(`[${label}]   [${String(status).padEnd(8)}] ${name}  ←  --set explicit`);
    }
  }
  if (hadError) {
    console.log('');
    console.log(`available skill-sets: ${[...skillSets].join(', ')}`);
    console.log(`available agent-sets: ${[...agentSets].join(', ')}`);
    process.exitCode = 1;
  }
}

console.log(`plugin root: ${pluginRoot}`);
console.log(`cwd: ${cwd}`);
console.log(`mode: ${DRY ? 'DRY-RUN' : (FORCE ? 'FORCE' : 'NORMAL')}`);

if (EXPLICIT_SETS.length > 0) {
  console.log(`explicit sets: ${EXPLICIT_SETS.join(', ')}`);
  console.log('');
  processExplicit(EXPLICIT_SETS);
} else {
  const { deps: loadedDeps, sources: depSources } = loadDeps();
  const deps = loadedDeps ?? new Map();
  const { isWp, signals } = isWordPressProject();

  console.log(`npm deps: ${deps.size} package(s) from ${depSources.length} package.json file(s)`);
  if (depSources.length > 1) {
    const preview = depSources.slice(0, 8).join(', ');
    const tail = depSources.length > 8 ? `, +${depSources.length - 8} more` : '';
    console.log(`  monorepo sources: ${preview}${tail}`);
  }
  console.log(`WordPress project: ${isWp ? 'YES' : 'no'}${signals.length ? `  (${signals.join('; ')})` : ''}`);
  console.log('');

  processKind('skills', skillSetsDir, skillsTarget, deps, isWp);
  processKind('agents', agentSetsDir, agentsTarget, deps, isWp);
}
