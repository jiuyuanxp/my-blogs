package com.blog.controller;

import com.blog.dto.RoleDto;
import com.blog.service.RoleService;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "角色管理", description = "角色 CRUD、权限分配")
@RestController
@Validated
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @Operation(summary = "角色列表")
    @GetMapping
    public ResponseEntity<List<RoleDto>> list() {
        return ResponseEntity.ok(roleService.list());
    }

    @Operation(summary = "角色详情", description = "含权限 ID 列表")
    @GetMapping("/{id}")
    public ResponseEntity<RoleDto> getById(@Parameter(description = "角色 ID") @PathVariable Long id) {
        return ResponseEntity.ok(roleService.getById(id));
    }

    @Operation(summary = "创建角色")
    @PostMapping
    public ResponseEntity<RoleDto> create(@Valid @RequestBody CreateRoleRequest request) {
        RoleDto created = roleService.create(request.code(), request.name(), request.description());
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/roles/" + created.getId()))
                .body(created);
    }

    @Operation(summary = "更新角色")
    @PutMapping("/{id}")
    public ResponseEntity<RoleDto> update(
            @Parameter(description = "角色 ID") @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(roleService.update(id, request.name(), request.description()));
    }

    @Operation(summary = "分配权限")
    @PutMapping("/{id}/permissions")
    public ResponseEntity<Void> assignPermissions(
            @Parameter(description = "角色 ID") @PathVariable Long id,
            @Valid @RequestBody AssignPermissionsRequest request) {
        roleService.assignPermissions(id, request.permissionIds());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "删除角色")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Parameter(description = "角色 ID") @PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Schema(description = "创建角色请求")
    public record CreateRoleRequest(
            @NotBlank @Size(max = 50) @Schema(description = "角色编码") String code,
            @NotBlank @Size(max = 100) @Schema(description = "角色名称") String name,
            @Size(max = 255) @Schema(description = "描述") String description) {}

    @Schema(description = "更新角色请求")
    public record UpdateRoleRequest(
            @Size(max = 100) @Schema(description = "角色名称") String name,
            @Size(max = 255) @Schema(description = "描述") String description) {}

    @Schema(description = "分配权限请求")
    public record AssignPermissionsRequest(
            @Schema(description = "权限 ID 列表") List<Long> permissionIds) {}
}
