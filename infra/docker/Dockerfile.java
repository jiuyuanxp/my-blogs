# Spring Boot 博客服务 - 多阶段构建
# 构建在本地/CI 执行，服务器只运行镜像

# syntax=docker/dockerfile:1
# Stage 1: Maven 构建
FROM --platform=linux/amd64 eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# 复制 Maven 配置
COPY services/java/mvnw services/java/.mvn/ services/java/.mvn/
COPY services/java/pom.xml services/java/

# 下载依赖（利用 Docker 层缓存，加速后续构建）
RUN cd services/java && ./mvnw dependency:resolve dependency:resolve-plugins -B

# 复制源码并构建
COPY services/java/ services/java/
RUN cd services/java && ./mvnw package -DskipTests -B

# Stage 2: 运行
FROM --platform=linux/amd64 eclipse-temurin:21-jre-alpine
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

# 从构建阶段复制 jar
COPY --from=builder /build/services/java/target/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 4300

ENTRYPOINT ["java", "-jar", "app.jar"]
