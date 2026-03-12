package com.blog.auth;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final Map<String, TokenInfo> tokens = new ConcurrentHashMap<>();

    @Value("${app.auth.token-ttl-hours:168}")
    private long tokenTtlHours;

    @Value("${app.auth.token-ttl-remember-me-hours:720}")
    private long tokenTtlRememberMeHours;

    public String createToken(Long userId, boolean rememberMe) {
        long hours = rememberMe ? tokenTtlRememberMeHours : tokenTtlHours;
        long expiresAt = System.currentTimeMillis() + Duration.ofHours(hours).toMillis();
        String token = UUID.randomUUID().toString().replace("-", "");
        tokens.put(token, new TokenInfo(userId, expiresAt));
        return token;
    }

    public Long getUserId(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        TokenInfo info = tokens.get(token);
        if (info == null) {
            return null;
        }
        if (System.currentTimeMillis() > info.getExpiresAt()) {
            tokens.remove(token);
            return null;
        }
        return info.getUserId();
    }

    public boolean isValid(String token) {
        return getUserId(token) != null;
    }

    public void invalidate(String token) {
        if (token != null) {
            tokens.remove(token);
        }
    }
}
