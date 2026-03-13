#!/usr/bin/env node
/**
 * 从 OpenAPI 规范自动生成：
 * 1. packages/types 中的 TypeScript 类型
 * 2. services/java/docs/api/README.md 中的接口清单表
 *
 * 用法：
 *   node scripts/generate-api-docs.js           # 从 localhost:8080 获取
 *   node scripts/generate-api-docs.js <url>     # 从指定 URL 获取
 *   node scripts/generate-api-docs.js <file>    # 从本地 JSON 文件读取
 *
 * 前置条件：Java 服务需已启动（或提供 openapi.json 文件）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_URL = 'http://localhost:8080/v3/api-docs';
const OPENAPI_TEMP = path.join(ROOT, '.openapi-temp.json');
const TYPES_OUTPUT = path.join(ROOT, 'packages/types/src/api-generated.d.ts');
const API_README = path.join(ROOT, 'services/java/docs/api/README.md');
const SPECS_DIR = path.join(ROOT, 'specs');
const SPECS_OUTPUT = path.join(SPECS_DIR, 'openapi.json');

// 路径前缀 -> 模块名
const PATH_TO_MODULE = {
  '/api/auth': '认证',
  '/api/categories': '分类',
  '/api/articles': '文章',
  '/api/comments': '评论',
  '/api/stats': '统计',
};

function getModule(pathStr) {
  for (const [prefix, name] of Object.entries(PATH_TO_MODULE)) {
    if (pathStr.startsWith(prefix)) return name;
  }
  return '其他';
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) resolve(data);
          else reject(new Error(`HTTP ${res.statusCode}`));
        });
      })
      .on('error', reject);
  });
}

async function getOpenApiSpec(input) {
  if (!input || input === '') input = DEFAULT_URL;

  if (input.startsWith('http://') || input.startsWith('https://')) {
    console.error('[generate-api-docs] 从 URL 获取 OpenAPI:', input);
    const data = await fetchUrl(input);
    return JSON.parse(data);
  }

  const filePath = path.isAbsolute(input) ? input : path.resolve(ROOT, input);
  if (fs.existsSync(filePath)) {
    console.error('[generate-api-docs] 从文件读取:', filePath);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  throw new Error(`无法获取 OpenAPI：${input}`);
}

function generateInterfaceTable(spec) {
  const paths = spec.paths || {};
  const rows = [];

  for (const [pathStr, pathItem] of Object.entries(paths)) {
    if (typeof pathItem !== 'object') continue;

    for (const method of ['get', 'post', 'put', 'delete']) {
      const op = pathItem[method];
      if (!op) continue;

      const methodUpper = method.toUpperCase();
      const module = getModule(pathStr);
      const summary = op.summary || op.operationId || '-';
      const hasSecurity = !!(
        (op.security && op.security.length > 0) ||
        (spec.security && spec.security.length > 0)
      );
      const auth = hasSecurity ? '是' : '否';

      rows.push({ module, method: methodUpper, path: pathStr, auth, summary });
    }
  }

  rows.sort((a, b) => {
    const order = ['认证', '分类', '文章', '评论', '统计', '其他'];
    const ai = order.indexOf(a.module);
    const bi = order.indexOf(b.module);
    if (ai !== bi) return ai - bi;
    return a.path.localeCompare(b.path);
  });

  const lines = [
    '| 模块 | 方法   | 路径                          | 认证  | 说明         |',
    '| ---- | ------ | ----------------------------- | ----- | ------------ |',
    ...rows.map(
      (r) =>
        `| ${r.module} | ${r.method.padEnd(6)} | \`${r.path}\` | ${r.auth.padEnd(6)} | ${r.summary} |`
    ),
  ];
  return lines.join('\n');
}

function updateApiReadme(spec) {
  const content = fs.readFileSync(API_README, 'utf8');
  const table = generateInterfaceTable(spec);

  const replaced = content.replace(
    /(## 接口清单\n\n)[\s\S]*?(\n## 通用规范)/,
    `$1${table}\n$2`
  );

  if (replaced === content) {
    console.error('[generate-api-docs] 未找到可替换的接口清单，跳过');
    return;
  }

  fs.writeFileSync(API_README, replaced, 'utf8');
  console.error('[generate-api-docs] 已更新 services/java/docs/api/README.md');
}

function generateTypes(spec) {
  fs.writeFileSync(OPENAPI_TEMP, JSON.stringify(spec, null, 2), 'utf8');

  try {
    execSync(
      `npx openapi-typescript@7 ${OPENAPI_TEMP} -o ${TYPES_OUTPUT} --export-type`,
      {
        cwd: ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
      }
    );
    console.error('[generate-api-docs] 已生成 packages/types/src/api-generated.d.ts');
  } finally {
    if (fs.existsSync(OPENAPI_TEMP)) fs.unlinkSync(OPENAPI_TEMP);
  }
}

async function main() {
  const input = process.argv[2] || DEFAULT_URL;

  try {
    const spec = await getOpenApiSpec(input);
    generateTypes(spec);
    updateApiReadme(spec);
    // 输出到 specs/ 供 @reapi/mcp-openapi 使用
    if (!fs.existsSync(SPECS_DIR)) fs.mkdirSync(SPECS_DIR, { recursive: true });
    fs.writeFileSync(SPECS_OUTPUT, JSON.stringify(spec, null, 2), 'utf8');
    console.error('[generate-api-docs] 已输出 specs/openapi.json（供 MCP 使用）');
    console.error('[generate-api-docs] 完成');
  } catch (err) {
    console.error('[generate-api-docs] 失败:', err.message);
    if (input === '' || input === DEFAULT_URL) {
      console.error('[generate-api-docs] 请先启动 Java 服务: pnpm dev 或 cd services/java && mvn spring-boot:run');
    }
    process.exit(1);
  }
}

main();
