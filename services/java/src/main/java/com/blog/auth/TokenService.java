package com.blog.auth;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    @Value("${app.auth.admin-password:admin}")
    private String adminPassword;

    @Value("${app.auth.token-ttl-hours:168}")
    private long tokenTtlHours;

    public boolean validatePassword(String password) {
        String expected = System.getenv("ADMIN_PASSWORD");
        if (expected == null || expected.isBlank()) {
            expected = adminPassword;
        }
        return expected.equals(password);
    }

    public String createToken() {
        String token = UUID.randomUUID().toString().replace("-", "");
        long expiresAt = System.currentTimeMillis() + Duration.ofHours(tokenTtlHours).toMillis();
        tokens.put(token, expiresAt);
        return token;
    }

    public boolean isValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Long expiresAt = tokens.get(token);
        if (expiresAt == null) {
            return false;
        }
        if (System.currentTimeMillis() > expiresAt) {
            tokens.remove(token);
            return false;
        }
        return true;
    }

    public void invalidate(String token) {
        tokens.remove(token);
    }
}
