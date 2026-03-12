#!/usr/bin/env bash
# 从项目根目录加载 .env 后启动 Spring Boot
# 用法: ./run-with-env.sh [profile]
# 示例: ./run-with-env.sh local

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
PROFILE="${1:-local}"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

export SPRING_PROFILES_ACTIVE="$PROFILE"
exec "$SCRIPT_DIR/mvnw" spring-boot:run
