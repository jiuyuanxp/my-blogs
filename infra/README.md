# Infra 基础设施

Docker 配置、Nginx、部署相关文件。

## 文件同步规则

**服务器上的配置文件应通过本地上传覆盖，而非在服务器上直接修改。**

### 原则

- 本地为配置的唯一来源
- 保证本地与服务器配置一致
- 便于版本控制和回溯

### 上传方式

```bash
# 上传 docker-compose.yml 覆盖服务器
scp infra/docker/docker-compose.yml root@<服务器IP>:~/blogs/docker-compose.yml

# 上传 nginx 配置（若服务器有对应路径）
scp infra/nginx/nginx.conf root@<服务器IP>:~/blogs/nginx.conf
```

### 上传后操作

在服务器上执行，使配置生效：

```bash
ssh root@<服务器IP>
cd ~/blogs
docker compose up -d <服务名> --force-recreate   # 如 postgres、nginx
```

### 目录说明

| 路径 | 说明 |
|------|------|
| `docker/` | Dockerfile、docker-compose.yml |
| `nginx/` | Nginx 配置 |
