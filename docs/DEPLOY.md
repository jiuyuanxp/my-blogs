# 远程服务器部署指南

基于 **GitHub → 服务器拉取 → 构建运行** 的部署流程。

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
cd blogs

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
| `NEXT_PUBLIC_SITE_NAME` | 站点名称 | `jiuyuan.blog` |
| `PORT` | 监听端口（默认 3000） | `3000` |

## Nginx 反向代理（可选）

若通过 Nginx 提供 HTTPS 并反向代理到 Next.js：

```nginx
server {
    listen 80;
    server_name blog.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name blog.example.com;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 常用 PM2 命令

```bash
pm2 list              # 查看进程
pm2 logs blogs-web    # 查看日志
pm2 restart blogs-web # 重启
pm2 stop blogs-web    # 停止
pm2 delete blogs-web  # 删除
pm2 save && pm2 startup  # 开机自启
```
