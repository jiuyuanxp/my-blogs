# 远程服务器部署指南

基于 **GitHub → 服务器拉取 → 构建运行** 的部署流程。

> **当前范围**：本文档仅覆盖 **Web 前端**（`apps/web`）的部署。后续将补充 blog-service（Java）、admin 管理后台等服务的部署说明。

## 前置要求

服务器需安装：

- **Node.js** >= 18
- **pnpm** >= 8（`corepack enable && corepack prepare pnpm@latest --activate`）
- **Git**

## 部署流程

### 1. 首次部署

```bash
# 克隆仓库
git clone https://github.com/<你的用户名>/blogs.git
cd ~/blogs/my-blogs

# 安装依赖
pnpm install

# 构建 Web 应用
pnpm --filter web build

# 启动（前台运行，测试用）
pnpm --filter web start
```

### 2. 使用 PM2 常驻运行（推荐）

```bash
# 安装 PM2（若未安装）
npm install -g pm2

# 首次或更新后启动
cd /path/to/blogs
git pull
pnpm install
pnpm --filter web build

# 启动或重启
pm2 start "pnpm --filter web start" --name blogs-web --cwd /path/to/blogs

# 或重启已有进程
pm2 restart blogs-web
```

### 3. 一键部署脚本

项目已包含 `scripts/deploy.sh`，在服务器项目根目录执行：

```bash
chmod +x scripts/deploy.sh   # 首次需添加执行权限
./scripts/deploy.sh
```

将自动完成：拉取代码 → 安装依赖 → 构建 → 重启 PM2。

## 环境变量（可选）

在 `apps/web` 目录或服务器环境设置：

| 变量 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 站点 URL（SEO、sitemap） | `https://blog.example.com` |
| `NEXT_PUBLIC_SITE_NAME` | 站点名称 | `blog.example.com` |
| `PORT` | 监听端口（默认 3000） | `3000` |

## Nginx 反向代理（可选）

项目配置见 `infra/nginx/nginx.production.conf`。Nginx 可：

- **80 端口代理**：访问 `http://IP` 自动转发到 3000，无需写 `:3000`
- **HTTP → HTTPS 跳转**：配置 SSL 后，80 自动 301 跳转到 443

### 1. 安装 Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 2. 使用项目配置（仅 HTTP 代理）

```bash
# 复制配置（替换 <项目路径> 为实际路径，如 /root/blogs/my-blogs）
sudo cp <项目路径>/infra/nginx/nginx.production.conf /etc/nginx/sites-available/blogs
sudo ln -sf /etc/nginx/sites-available/blogs /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # 移除默认站点（可选）
sudo nginx -t && sudo systemctl reload nginx
```

配置后访问 `http://<服务器IP>` 即可，无需 `:3000`。安全组需放行 **80** 端口。

### 3. 配置 HTTPS 与自动跳转

1. 申请 SSL 证书（如 [Let's Encrypt](https://letsencrypt.org/)）：
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d <你的域名>
   ```

2. 编辑 `infra/nginx/nginx.production.conf`，取消 HTTPS 相关注释，将 `server_name _` 改为你的域名，并注释掉仅 HTTP 的 `server` 块。

3. 或使用 certbot 自动生成的配置，通常已包含 80→443 跳转。

## 本地构建 + 上传部署（低配服务器推荐）

> 仅适用于 **Web 前端**（`apps/web`）。2GB 及以下内存的服务器在本地构建时容易 OOM，可改为**本地构建 → 打包 → 上传 → 服务器解压运行**。

### 前置要求

- **本地**：Node.js >= 18、pnpm >= 8
- **服务器**：Node.js >= 18（仅运行，不构建）、PM2

### 1. 本地打包

在项目根目录执行：

```bash
# 构建
pnpm --filter web build

# 复制 static 和 public 到 standalone（Next.js standalone 需手动复制）
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/
cp -r apps/web/public apps/web/.next/standalone/apps/web/

# 打包（产物在项目根目录 web-standalone.tar.gz）
cd apps/web/.next/standalone && tar -czvf ../../../../web-standalone.tar.gz . && cd ../../../..
```

### 2. 上传到服务器

```bash
# 替换为你的服务器地址和路径
scp web-standalone.tar.gz root@<服务器IP>:/root/blogs/
```

### 3. 服务器首次部署

```bash
cd /root/blogs
mkdir -p standalone
tar -xzvf web-standalone.tar.gz -C standalone
pm2 delete blogs-web 2>/dev/null || true
pm2 start apps/web/server.js --name blogs-web --cwd /root/blogs/standalone
pm2 save
pm2 startup   # 可选：按提示执行以开机自启
```

### 4. 服务器更新部署

```bash
cd /root/blogs
tar -xzvf web-standalone.tar.gz -C standalone
pm2 restart blogs-web
```

### 目录结构说明

| 路径 | 说明 |
|------|------|
| `standalone/apps/web/server.js` | Next.js 入口 |
| `standalone/apps/web/.next/static` | 静态资源（需从构建产物复制） |
| `standalone/apps/web/public` | 公共文件（需从构建产物复制） |

Monorepo 的 standalone 输出中，`server.js` 位于 `apps/web/` 下，PM2 的 `--cwd` 需指向 standalone 根目录。

## 常用 PM2 命令

```bash
pm2 list              # 查看进程
pm2 logs blogs-web    # 查看日志
pm2 restart blogs-web # 重启
pm2 stop blogs-web    # 停止
pm2 delete blogs-web  # 删除
pm2 save && pm2 startup  # 开机自启
```

## 提交前检查（避免隐私泄露）

文档会上传 GitHub，提交前确认：

- [ ] 无真实服务器 IP、域名
- [ ] 无 `root@` 等具体用户名（使用 `<服务器IP>`、`<用户名>` 占位符）
- [ ] 无数据库密码、API 密钥等敏感配置
- [ ] 敏感信息仅放在本地 `docs/SECURITY.md`（已 gitignore）
