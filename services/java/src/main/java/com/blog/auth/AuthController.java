package com.blog.auth;

import com.blog.exception.BusinessException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        if (!tokenService.validatePassword(request.password())) {
            throw new BusinessException("invalid_password", "密码错误");
        }
        String token = tokenService.createToken();
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> check(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String token = extractToken(auth);
        boolean valid = token != null && tokenService.isValid(token);
        if (!valid) {
            throw new BusinessException("invalid_token", "Token 无效或已过期");
        }
        return ResponseEntity.ok(Map.of("valid", true));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String token = extractToken(auth);
        if (token != null) {
            tokenService.invalidate(token);
        }
        return ResponseEntity.noContent().build();
    }

    private String extractToken(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return null;
        }
        return auth.substring(7).trim();
    }

    public record LoginRequest(@NotBlank(message = "密码不能为空") String password) {}
}
