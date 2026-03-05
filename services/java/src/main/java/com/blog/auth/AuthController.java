package com.blog.auth;

import com.blog.exception.BusinessException;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证", description = "登录、校验、登出")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TokenService tokenService;

    @Operation(summary = "登录", description = "返回 token，用于后续请求 Authorization 头")
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        if (!tokenService.validatePassword(request.password())) {
            throw new BusinessException("invalid_password", "密码错误");
        }
        String token = tokenService.createToken();
        return ResponseEntity.ok(Map.of("token", token));
    }

    @Operation(summary = "校验 Token", description = "检查当前 Token 是否有效")
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> check(
            @Parameter(description = "Authorization: Bearer {token}") @RequestHeader(value = "Authorization", required = false) String auth) {
        String token = extractToken(auth);
        boolean valid = token != null && tokenService.isValid(token);
        if (!valid) {
            throw new BusinessException("invalid_token", "Token 无效或已过期");
        }
        return ResponseEntity.ok(Map.of("valid", true));
    }

    @Operation(summary = "登出", description = "使当前 Token 失效")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Parameter(description = "Authorization: Bearer {token}") @RequestHeader(value = "Authorization", required = false) String auth) {
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

    @Schema(description = "登录请求")
    public record LoginRequest(
            @NotBlank(message = "密码不能为空") @Schema(description = "管理员密码") String password) {}
}
