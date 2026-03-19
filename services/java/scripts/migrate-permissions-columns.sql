-- 为 permissions 表添加 route_path、component、is_hidden 列
-- 当 Entity 新增字段但 ddl-auto: update 未生效时手动执行
-- 用法: psql -h localhost -p 5433 -U bloguser -d blogdb -f migrate-permissions-columns.sql

-- 若列已存在会报错，可忽略或先 DROP COLUMN 再执行
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS route_path VARCHAR(200);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS component VARCHAR(200);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;
