#!/usr/bin/env node
/**
 * AGENTS.md 自动化校验
 * 校验：快速命令存在、SSOT 文档路径存在、包级 AGENTS.md 引用有效
 * 用法：node scripts/validate-agents-md.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let hasError = false;

function fail(msg) {
  console.error(`❌ ${msg}`);
  hasError = true;
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

// 1. 校验 package.json 中的脚本
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const scripts = Object.keys(pkg.scripts || {});

const requiredScripts = ['dev', 'build', 'lint', 'test', 'typecheck', 'docs:generate'];
for (const s of requiredScripts) {
  if (scripts.includes(s)) ok(`package.json 含脚本: ${s}`);
  else fail(`package.json 缺少脚本: ${s}`);
}

// 2. 校验 docs/ SSOT 路径
const ssotPaths = [
  'docs/README.md',
  'docs/tech-stack.md',
  'docs/api-contract.md',
  'docs/deployment-plan.md',
  'docs/active-task.md',
];
for (const p of ssotPaths) {
  const full = path.join(ROOT, p);
  if (fs.existsSync(full)) ok(`SSOT 存在: ${p}`);
  else fail(`SSOT 缺失: ${p}`);
}

// 3. 校验根 AGENTS.md
const rootAgents = path.join(ROOT, 'AGENTS.md');
if (fs.existsSync(rootAgents)) ok('根 AGENTS.md 存在');
else fail('根 AGENTS.md 缺失');

// 4. 校验包级 AGENTS.md 及其引用
const packageAgents = [
  { dir: 'apps/web', ref: '../../AGENTS.md' },
  { dir: 'apps/admin', ref: '../../AGENTS.md' },
  { dir: 'services/java', ref: '../../AGENTS.md' },
];
for (const { dir, ref } of packageAgents) {
  const agentsPath = path.join(ROOT, dir, 'AGENTS.md');
  const refPath = path.join(ROOT, dir, ref);
  if (fs.existsSync(agentsPath)) ok(`包级 AGENTS.md 存在: ${dir}`);
  else fail(`包级 AGENTS.md 缺失: ${dir}`);
  if (fs.existsSync(refPath)) ok(`引用有效: ${dir} -> ${ref}`);
  else fail(`引用无效: ${dir} -> ${ref}`);
}

// 5. 校验 AGENTS.md 含 last updated
const agentsContent = fs.readFileSync(rootAgents, 'utf8');
if (/最后更新|last updated/i.test(agentsContent)) ok('AGENTS.md 含 last updated');
else fail('AGENTS.md 缺少 last updated 日期');

if (hasError) {
  process.exit(1);
}
console.log('\n✅ AGENTS.md 校验通过');
