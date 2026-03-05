# 服务器部署文档

适用于阿里云 2C2G 轻量服务器，纯 Docker 部署 web + admin（Phase 1）。

## 一、架构说明

### 1.1 部署方式

- **纯 Docker**：Nginx、web（Next.js）、admin（静态）均在容器内运行
- **GitHub Actions 构建**：镜像在 push 到 `main` 时由 CI 构建并推送到阿里云 ACR，服务器只拉取并运行
- **Phase 1**：仅 web + admin，后续再增加 PostgreSQL、Redis、Java/Node/Go 后端

### 1.2 架构图

```
                    阿里云 2C2G 轻量服务器
    ┌─────────────────────────────────────────────────────┐
    │                                                       │
    │   用户请求 (IP:80)                                     │
    │        │                                               │
    │        ▼                                               │
    │   ┌─────────────┐                                      │
    │   │   nginx     │  :80                                 │
    │   │  (容器)     │                                      │
    │   └──────┬──────┘                                      │
    │          │                                              │
    │    ┌─────┴─────┐                                       │
    │    │           │                                        │
    │    ▼           ▼                                        │
    │  /admin     /web                                       │
    │  (静态)     (反向代理)                                   │
    │    │           │                                        │
    │    │           ▼                                        │
    │    │     ┌──────────┐                                  │
    │    │     │   web    │  Next.js :3000                   │
    │    │     │  (容器)  │                                   │
    │    │     └──────────┘                                  │
    │    │                                                    │
    │    └── admin 静态文件已打包进 nginx 镜像                  │
    └─────────────────────────────────────────────────────┘
```

### 1.3 路由说明

| 路径 | 处理方式 |
|------|----------|
| `/` | 重定向到 `/web/zh` |
| `/web`、`/web/*` | 反向代理到 web 容器（Next.js） |
| `/admin` | 重定向到 `/admin/` |
| `/admin/`、`/admin/*` | Nginx 直接提供 admin 静态文件 |

---

## 二、前置要求

### 2.1 服务器

- 阿里云轻量应用服务器 2C2G
- 系统：Ubuntu 24.04 LTS
- 开放端口：80（HTTP）

### 2.2 GitHub 仓库配置

- 在仓库 Settings → Secrets 中配置 `ACR_USERNAME`、`ACR_PASSWORD`（用于 CI 推送镜像）

---

## 三、服务器初始化（首次部署）

### 3.1 安装 Docker

**方式一：官方脚本（海外服务器）**

```bash
curl -fsSL https://get.docker.com | sh
```

**方式二：阿里云镜像（国内服务器推荐）**

若官方脚本出现 `Connection reset by peer` 或超时，使用阿里云镜像：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y ca-certificates curl gnupg

# 添加 Docker GPG 密钥（阿里云镜像）
sudo curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 添加 Docker 软件源
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动并设置开机自启
sudo systemctl enable docker
sudo systemctl start docker
```

**安装后（两种方式通用）**

```bash
# 将当前用户加入 docker 组（root 可跳过）
sudo usermod -aG docker $USER
# 重新登录或执行 newgrp docker 使组生效

# 验证
docker --version
docker compose version
```

> 若提示 `group 'docker' does not exist`，说明 Docker 尚未安装成功。

### 3.2 创建部署目录

```bash
mkdir -p ~/blogs
cd ~/blogs
```

---

## 四、构建与部署流程

### 4.1 方式 A：GitHub Actions 构建（推荐）

镜像由 `.github/workflows/build-push-acr.yml` 在 push 到 `main` 时自动构建并推送到阿里云 ACR。

**步骤 1：配置 GitHub Secrets**

在仓库 Settings → Secrets and variables → Actions 中添加：

- `ACR_USERNAME`：阿里云 ACR 登录名
- `ACR_PASSWORD`：阿里云 ACR 密码

**步骤 2：推送代码触发构建**

```bash
git push origin main
```

或手动触发：GitHub → Actions → Build and Push to ACR → Run workflow

**步骤 3：服务器拉取并启动**

```bash
# SSH 登录服务器
ssh root@你的服务器IP

# 登录 ACR
docker login crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com

# 拉取镜像
docker pull crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com/jiuyaun/blogs-nginx:latest
docker pull crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com/jiuyaun/blogs-web:latest

# 打回本地标签
docker tag crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com/jiuyaun/blogs-nginx:latest blogs-nginx:latest
docker tag crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com/jiuyaun/blogs-web:latest blogs-web:latest

# 上传 docker-compose（首次或配置变更时）
# 从本机执行：scp infra/docker/docker-compose.yml root@你的服务器IP:~/blogs/

# 启动
cd ~/blogs
docker compose up -d
```

> ACR 地址以实际为准，含个人信息的完整命令见 `docs/DEPLOY_ACR_COMMANDS.md`（已加入 .gitignore）。

### 4.2 方式 B：本地构建（备用）

若需本地构建（如调试 Dockerfile）：

```bash
pnpm docker:build
# 或：docker compose -f infra/docker/docker-compose.yml build
```

Mac（Apple Silicon）构建 amd64 会走 QEMU 模拟，耗时长且可能不稳定，建议使用 GitHub Actions。

**推送到 ACR**：登录后 `docker tag` + `docker push`，或导出 `docker save` 后 `scp` 上传、服务器 `docker load`。

---

## 五、访问验证

部署成功后：

- 主站：`http://你的服务器IP/web` 或 `http://你的服务器IP/`（会跳转到 `/web/zh`）
- 管理后台：`http://你的服务器IP/admin`

---

## 六、常用命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f
docker compose logs -f web
docker compose logs -f nginx

# 停止
docker compose down

# 重启
docker compose restart

# 更新后拉取新镜像并启动
docker compose pull && docker compose up -d
```

---

## 七、更新部署

### 7.1 代码更新后（GitHub Actions）

1. `git push origin main` 触发 CI 构建并推送
2. 服务器执行：`docker compose pull && docker compose up -d`（若 compose 中引用 ACR 地址）或按「四、4.1 步骤 3」拉取后 `docker compose up -d`

### 7.2 仅修改 Nginx 配置

需重新构建 nginx 镜像（配置已打包进镜像），修改后 push 到 main 触发 CI 即可。

---

## 八、目录与文件说明

| 路径 | 说明 |
|------|------|
| `.github/workflows/build-push-acr.yml` | GitHub Actions：构建并推送到 ACR |
| `infra/docker/Dockerfile.web` | Next.js web 镜像 |
| `infra/docker/Dockerfile.nginx` | Nginx + admin 静态镜像 |
| `infra/docker/docker-compose.yml` | Phase 1 编排 |
| `infra/nginx/nginx.conf` | Nginx 配置（打包进 nginx 镜像） |
| `.dockerignore` | 构建时排除的文件 |

---

## 九、后续阶段规划（Phase 2+）

Phase 2 将增加：

- PostgreSQL（Docker）
- Redis（Docker）
- Java/Node/Go 后端服务（Docker）

届时会更新 `docker-compose.yml` 与本文档，并设置各服务内存限制，避免 2C2G 内存不足。

---

## 十、故障排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 502 Bad Gateway | web 容器未启动或崩溃 | `docker compose logs web` 查看日志 |
| 404 on /admin | admin 构建失败或路径错误 | 检查 nginx 镜像构建，确认 dist 已复制 |
| 无法访问 | 防火墙未放行 80 | 阿里云控制台 → 防火墙 → 放行 80 |
| 构建失败 | 依赖或网络问题 | 检查 `.dockerignore`，确保 `node_modules` 等被排除 |
| exec format error | Mac(ARM) 构建的镜像在 x86 服务器运行 | 重新构建，Dockerfile 已含 `--platform=linux/amd64` |
