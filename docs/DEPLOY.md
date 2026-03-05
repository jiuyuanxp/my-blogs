# 服务器部署文档

适用于阿里云 2C2G 轻量服务器，纯 Docker 部署 web + admin（Phase 1）。

## 一、架构说明

### 1.1 部署方式

- **纯 Docker**：Nginx、web（Next.js）、admin（静态）均在容器内运行
- **本地/CI 构建**：镜像在本地或 CI 构建，服务器只拉取并运行，不在服务器上构建
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

### 2.2 本地/CI 环境

- Docker
- 可访问本仓库（用于构建镜像）

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

### 4.1 方式 A：本地构建 → 推镜像 → 服务器拉取

**步骤 1：本地构建镜像**

在项目根目录执行：

```bash
# 进入项目
cd /path/to/blogs

# 构建镜像（构建在本地执行，不占用服务器资源）
pnpm docker:build
# 或：docker compose -f infra/docker/docker-compose.yml build

# 可选：打标签并推送到镜像仓库（阿里云容器镜像服务 / Docker Hub 等）
# docker tag blogs-nginx:latest your-registry/blogs-nginx:latest
# docker tag blogs-web:latest your-registry/blogs-web:latest
# docker push your-registry/blogs-nginx:latest
# docker push your-registry/blogs-web:latest
```

**步骤 2：上传到服务器**

**方式 A：阿里云 ACR（推荐，服务器同地域拉取快）**

1. 开通 [阿里云容器镜像服务 ACR](https://cr.console.aliyun.com/)，创建个人版实例
2. 在控制台创建命名空间（如 `blogs`）和镜像仓库（如 `nginx`、`web`）
3. 获取镜像仓库地址，格式一般为 `registry.cn-<地域>.aliyuncs.com` 或 `crpi-xxxx.cn-<地域>.personal.cr.aliyuncs.com`

```bash
# 本地：登录并推送
docker login --username=你的登录名 registry.cn-<地域>.aliyuncs.com
# 或新个人版：docker login crpi-xxxx.cn-<地域>.personal.cr.aliyuncs.com

docker tag blogs-nginx:latest registry.cn-<地域>.aliyuncs.com/blogs/nginx:latest
docker tag blogs-web:latest registry.cn-<地域>.aliyuncs.com/blogs/web:latest
docker push registry.cn-<地域>.aliyuncs.com/blogs/nginx:latest
docker push registry.cn-<地域>.aliyuncs.com/blogs/web:latest
```

```bash
# 服务器：登录并拉取（阿里云同地域内网拉取更快）
docker login --username=你的登录名 registry.cn-<地域>.aliyuncs.com
docker pull registry.cn-<地域>.aliyuncs.com/blogs/nginx:latest
docker pull registry.cn-<地域>.aliyuncs.com/blogs/web:latest

# 打回本地标签，供 docker compose 使用
docker tag registry.cn-<地域>.aliyuncs.com/blogs/nginx:latest blogs-nginx:latest
docker tag registry.cn-<地域>.aliyuncs.com/blogs/web:latest blogs-web:latest
```

**方式 B：导出镜像文件（无需镜像仓库）**

```bash
# 本地导出
docker save blogs-nginx:latest blogs-web:latest -o blogs-images.tar

# 上传到服务器
scp blogs-images.tar root@你的服务器IP:~/blogs/

# 服务器上加载
ssh root@你的服务器IP
cd ~/blogs
docker load -i blogs-images.tar
```

**步骤 3：上传 docker-compose 与配置**

```bash
# 从本地上传
scp -r infra/docker/docker-compose.yml root@你的服务器IP:~/blogs/
# 若修改了 nginx 配置，需重新构建 nginx 镜像
```

**步骤 4：服务器启动**

```bash
ssh root@你的服务器IP
cd ~/blogs
docker compose -f docker-compose.yml up -d

# 查看状态
docker compose ps
```

### 4.2 方式 B：服务器拉代码 + 本地构建产物上传

若服务器上有代码但不适合在服务器构建，可：

1. 本地执行 `docker compose build` 得到镜像
2. 用 `docker save` 导出，`scp` 上传，服务器 `docker load`
3. 在服务器放置 `docker-compose.yml` 后执行 `docker compose up -d`

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

# 更新后重新构建并启动
docker compose build --no-cache && docker compose up -d
```

---

## 七、更新部署

### 7.1 代码更新后

1. 本地重新构建：`docker compose -f infra/docker/docker-compose.yml build`
2. 按「四、构建与部署流程」上传镜像或导出后上传
3. 服务器执行：`docker compose down && docker compose up -d`

### 7.2 仅修改 Nginx 配置

需重新构建 nginx 镜像（配置已打包进镜像）：

```bash
docker compose build nginx --no-cache
docker compose up -d nginx
```

---

## 八、Mac 构建部署到 x86 服务器

若在 **Mac（Apple Silicon）** 上构建，部署到 **阿里云 x86 服务器**，需指定平台 `linux/amd64`。当前 Dockerfile 已包含 `--platform=linux/amd64`，直接构建即可：

```bash
pnpm docker:build
```

**构建耗时说明**：Mac 上构建 amd64 镜像会走 QEMU 模拟，首次约 8–15 分钟属正常。Dockerfile 已启用 pnpm store 缓存，二次构建会更快。

**加速方案**：用 GitHub Actions 在 `ubuntu-latest`（amd64）上构建并推送，可省去模拟，约 3–5 分钟完成。见 `.github/workflows/build-push-acr.yml`。需在 GitHub 仓库 Settings → Secrets 添加 `ACR_USERNAME`、`ACR_PASSWORD`。

---

## 九、目录与文件说明

| 路径 | 说明 |
|------|------|
| `infra/docker/Dockerfile.web` | Next.js web 镜像 |
| `infra/docker/Dockerfile.nginx` | Nginx + admin 静态镜像 |
| `infra/docker/docker-compose.yml` | Phase 1 编排 |
| `infra/nginx/nginx.conf` | Nginx 配置（打包进 nginx 镜像） |
| `.dockerignore` | 构建时排除的文件 |

---

## 十、后续阶段规划（Phase 2+）

Phase 2 将增加：

- PostgreSQL（Docker）
- Redis（Docker）
- Java/Node/Go 后端服务（Docker）

届时会更新 `docker-compose.yml` 与本文档，并设置各服务内存限制，避免 2C2G 内存不足。

---

## 十一、故障排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 502 Bad Gateway | web 容器未启动或崩溃 | `docker compose logs web` 查看日志 |
| 404 on /admin | admin 构建失败或路径错误 | 检查 nginx 镜像构建，确认 dist 已复制 |
| 无法访问 | 防火墙未放行 80 | 阿里云控制台 → 防火墙 → 放行 80 |
| 构建失败 | 依赖或网络问题 | 检查 `.dockerignore`，确保 `node_modules` 等被排除 |
| exec format error | Mac(ARM) 构建的镜像在 x86 服务器运行 | 重新构建，Dockerfile 已含 `--platform=linux/amd64` |
