# 初始化脚本

本目录用于存放部署/初始化脚本。以下脚本**不提交 Git**，仅本地使用。

## 超级管理员初始化

**脚本文件**：`init-super-admin.sh` 或 `init-super-admin.sql`（需自行创建）

### 用途

首次部署时在数据库中创建 `super_admin` 角色及超级管理员用户。

### 创建方式

1. 参考 [docs/design/RBAC_DESIGN.md](../../../docs/design/RBAC_DESIGN.md) 第三节「超级管理员」中的 SQL 示例
2. 使用 Java 生成 BCrypt 哈希：`BCryptPasswordEncoder().encode("你的密码")`
3. 创建 `init-super-admin.sh` 或 `.sql`，填入生成的哈希
4. 执行脚本前务必修改默认密码

### 执行示例

```bash
# 若为 .sh 脚本（需连接数据库并执行 SQL）
./init-super-admin.sh

# 若为 .sql 文件
psql -h localhost -U bloguser -d blogdb -f init-super-admin.sql
```

### 安全说明

- `init-super-admin.sh`、`init-super-admin.sql` 已加入 `.gitignore`，不会上传
- 部署后请立即修改超级管理员密码
