package com.blog.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordHashUtilTest {

    @Test
    void bcryptEncodeAndVerify() {
        String password = "test-password-123";
        String hash = new BCryptPasswordEncoder(12).encode(password);
        assertTrue(new BCryptPasswordEncoder().matches(password, hash));
        assertFalse(new BCryptPasswordEncoder().matches("wrong-password", hash));
    }
}
