#!/usr/bin/env node
/**
 * PostToolUse Hook: 编辑 DTO/Controller 时自动生成 API 文档
 *
 * 当编辑 Java DTO 或 Controller 时，尝试从运行中的 Java 服务获取 OpenAPI，
 * 自动更新 packages/types、services/java/docs/api/ 接口清单。
 * 若服务未启动，则输出提醒。
 */

const path = require('path');
const { execSync } = require('child_process');

const MAX_STDIN = 1024 * 1024; // 1MB limit
let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  if (data.length < MAX_STDIN) {
    const remaining = MAX_STDIN - data.length;
    data += chunk.substring(0, remaining);
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';

    const isDto = /[\\/]dto[\\/].*\.java$/i.test(filePath);
    const isController = /[\\/]controller[\\/].*\.java$/i.test(filePath);

    if (isDto || isController) {
      const root = path.resolve(__dirname, '..', '..');
      const script = path.join(root, 'scripts', 'generate-api-docs.js');
      try {
        execSync(`node "${script}"`, {
          cwd: root,
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000,
        });
      } catch {
        console.error('[Hook] Java 服务未运行，无法自动生成。请先 pnpm dev 或 mvn spring-boot:run，再运行 pnpm docs:generate');
      }
    }
  } catch {
    // Invalid input — pass through
  }

  process.stdout.write(data);
  process.exit(0);
});
