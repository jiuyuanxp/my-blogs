package com.blog.controller;

import com.blog.dto.PageResponse;
import com.blog.dto.UserDto;
import com.blog.service.UserService;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户管理", description = "用户 CRUD、重置密码")
@RestController
@Validated
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户列表", description = "分页查询")
    @GetMapping
    public ResponseEntity<PageResponse<UserDto>> list(
            @Parameter(description = "页码") @RequestParam(required = false, defaultValue = "1") int page,
            @Parameter(description = "每页条数") @RequestParam(required = false, defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(userService.list(page, pageSize));
    }

    @Operation(summary = "用户详情")
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getById(@Parameter(description = "用户 ID") @PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @Operation(summary = "创建用户")
    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserRequest request) {
        UserDto created = userService.create(
                request.username(),
                request.password(),
                request.nickname(),
                request.roleId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/users/" + created.getId()))
                .body(created);
    }

    @Operation(summary = "更新用户")
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> update(
            @Parameter(description = "用户 ID") @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request.nickname(), request.roleId(), request.status()));
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Parameter(description = "用户 ID") @PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "重置密码")
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Parameter(description = "用户 ID") @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(id, request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @Schema(description = "创建用户请求")
    public record CreateUserRequest(
            @NotBlank @Size(max = 50) @Schema(description = "用户名") String username,
            @NotBlank @Size(min = 6, max = 100) @Schema(description = "密码") String password,
            @Size(max = 100) @Schema(description = "昵称") String nickname,
            @NotNull @Schema(description = "角色 ID") Long roleId) {}

    @Schema(description = "更新用户请求")
    public record UpdateUserRequest(
            @Size(max = 100) @Schema(description = "昵称") String nickname,
            @Schema(description = "角色 ID") Long roleId,
            @Schema(description = "状态：active/disabled") String status) {}

    @Schema(description = "重置密码请求")
    public record ResetPasswordRequest(
            @NotBlank @Size(min = 6, max = 100) @Schema(description = "新密码") String newPassword) {}
}
