package com.blog.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * 生成 BCrypt 哈希，用于初始化超级管理员等场景。
 * 生成: printf '%s' '密码' > /tmp/pw && ./mvnw exec:java -Dexec.mainClass="com.blog.util.PasswordHashUtil" -Dexec.args=/tmp/pw
 * 验证: ./mvnw exec:java -Dexec.mainClass="com.blog.util.PasswordHashUtil" -Dexec.args="verify" -Dexec.args="密码" -Dexec.args="哈希"
 */
public class PasswordHashUtil {

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("用法: PasswordHashUtil <密码|文件路径>");
            System.err.println("  验证: PasswordHashUtil verify <密码> <哈希>");
            System.exit(1);
        }
        if ("verify".equals(args[0])) {
            if (args.length < 3) {
                System.err.println("验证用法: PasswordHashUtil verify <密码> <哈希>");
                System.exit(1);
            }
            String pwd = args[1];
            if (Files.exists(Path.of(pwd))) {
                pwd = Files.readString(Path.of(pwd)).trim();
            }
            boolean ok = new BCryptPasswordEncoder().matches(pwd, args[2]);
            System.out.println(ok ? "匹配" : "不匹配");
            System.exit(ok ? 0 : 1);
        }
        String password = args[0];
        if (Files.exists(Path.of(password))) {
            password = Files.readString(Path.of(password)).trim();
        }
        String hash = new BCryptPasswordEncoder(12).encode(password);
        System.out.println(hash);
    }
}
