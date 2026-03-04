#!/usr/bin/env node
/**
 * Web 前端打包脚本（本地构建 + 上传部署用）
 *
 * 自动完成：构建 → 复制 static/public → 打包 tar.gz
 *
 * 用法：pnpm run package:web  或  node scripts/package-web.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WEB_APP = path.join(ROOT, 'apps/web');
const STANDALONE = path.join(WEB_APP, '.next/standalone');
const OUTPUT = path.join(ROOT, 'web-standalone.tar.gz');

function run(cmd, opts = {}) {
  console.log(`\n>>> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

function main() {
  console.log('=== Web 前端打包 ===\n');

  // 1. 构建
  run('pnpm --filter web build');

  // 2. 复制 static 和 public 到 standalone
  const staticSrc = path.join(WEB_APP, '.next/static');
  const staticDst = path.join(STANDALONE, 'apps/web/.next/static');
  const publicSrc = path.join(WEB_APP, 'public');
  const publicDst = path.join(STANDALONE, 'apps/web/public');

  if (!fs.existsSync(staticSrc)) {
    console.error('错误: 构建产物不存在，请先执行 pnpm --filter web build');
    process.exit(1);
  }

  fs.cpSync(staticSrc, staticDst, { recursive: true });
  console.log('>>> 已复制 .next/static');

  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDst, { recursive: true });
    console.log('>>> 已复制 public');
  }

  // 3. 打包
  run(`tar -czvf web-standalone.tar.gz -C apps/web/.next/standalone .`);

  console.log(`\n>>> 完成: ${OUTPUT}`);
  console.log('\n上传: scp web-standalone.tar.gz root@<服务器IP>:/root/blogs/\n');
}

main();
