#!/usr/bin/env bash
# 远程服务器部署脚本：拉取代码、构建、重启 PM2
# 用法：在项目根目录执行 ./scripts/deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_NAME="${PM2_APP_NAME:-blogs-web}"

cd "$REPO_ROOT"

echo ">>> 拉取最新代码..."
git pull

echo ">>> 安装依赖..."
pnpm install --frozen-lockfile

echo ">>> 构建 Web 应用..."
pnpm --filter web build

echo ">>> 重启 PM2 进程..."
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME"
  echo ">>> 已重启 $APP_NAME"
else
  pm2 start "pnpm --filter web start" --name "$APP_NAME" --cwd "$REPO_ROOT"
  echo ">>> 已启动 $APP_NAME"
fi

echo ">>> 部署完成"
