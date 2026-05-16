#!/usr/bin/env node
// skill-link.mjs — symlink matched skill-sets into cwd .claude/skills/
// usage: node skill-link.mjs [--force] [--dry-run]
// env: CLAUDE_PLUGIN_ROOT (plugin root containing skill-sets/)

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force') || args.has('-f');
const DRY = args.has('--dry-run') || args.has('-n');

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT
  || path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const skillSetsDir = path.join(pluginRoot, 'skill-sets');
const cwd = process.cwd();
const targetDir = path.join(cwd, '.claude', 'skills');

// skill name → npm package names (for non-obvious cases)
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

function loadDeps() {
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ]);
}

function stripVersionSuffix(name) {
  return name.replace(/-v[\d-]+$/, '');
}

function candidatesFor(skillName) {
  const list = ALIAS[skillName] ? [...ALIAS[skillName]] : [];
  list.push(skillName);
  const stripped = stripVersionSuffix(skillName);
  if (stripped !== skillName) list.push(stripped);
  return list;
}

function listSkillSets() {
  if (!fs.existsSync(skillSetsDir)) {
    console.error(`skill-sets dir not found: ${skillSetsDir}`);
    process.exit(1);
  }
  return fs.readdirSync(skillSetsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function ensureDir(dir) {
  if (DRY) return;
  fs.mkdirSync(dir, { recursive: true });
}

function isExistingLink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
}

function pathExists(p) {
  try { fs.lstatSync(p); return true; } catch { return false; }
}

function createLink(src, dest) {
  if (DRY) return 'dry-run';
  if (pathExists(dest)) {
    if (!FORCE) return 'exists';
    fs.rmSync(dest, { recursive: true, force: true });
  }
  // 'dir' type required on Windows for directory symlinks
  fs.symlinkSync(src, dest, 'dir');
  return 'linked';
}

const deps = loadDeps();
if (!deps) {
  console.error('package.json not found in cwd. nothing to match.');
  process.exit(1);
}

const skills = listSkillSets();
const results = [];

for (const skill of skills) {
  const cands = candidatesFor(skill);
  const hit = cands.find((c) => deps.has(c));
  if (!hit) { results.push({ skill, status: 'no-match' }); continue; }
  const src = path.join(skillSetsDir, skill);
  const dest = path.join(targetDir, skill);
  ensureDir(targetDir);
  let status;
  try { status = createLink(src, dest); }
  catch (e) { status = `error: ${e.code || e.message}`; }
  results.push({ skill, matched: hit, status });
}

const matched = results.filter((r) => r.matched);
const linked = matched.filter((r) => r.status === 'linked');
const skipped = matched.filter((r) => r.status === 'exists');
const errored = matched.filter((r) => String(r.status).startsWith('error'));

console.log(`plugin root: ${pluginRoot}`);
console.log(`cwd: ${cwd}`);
console.log(`target: ${targetDir}`);
console.log(`mode: ${DRY ? 'DRY-RUN' : (FORCE ? 'FORCE' : 'NORMAL')}`);
console.log('');
console.log(`matched ${matched.length} / ${skills.length} skill-sets`);
console.log(`  linked:  ${linked.length}`);
console.log(`  exists:  ${skipped.length}  (use --force to replace)`);
console.log(`  errors:  ${errored.length}`);
console.log('');
for (const r of matched) {
  console.log(`  [${r.status.padEnd(8)}] ${r.skill}  ←  dep "${r.matched}"`);
}
if (errored.length) {
  console.log('');
  console.log('errors detail:');
  for (const r of errored) console.log(`  ${r.skill}: ${r.status}`);
  console.log('windows: enable Developer Mode or run as admin for symlink permission');
}
