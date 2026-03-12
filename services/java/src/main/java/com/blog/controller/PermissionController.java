package com.blog.controller;

import com.blog.dto.PermissionDto;
import com.blog.service.PermissionService;
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

@Tag(name = "权限管理", description = "权限 CRUD")
@RestController
@Validated
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @Operation(summary = "权限列表", description = "type=menu|button 时返回扁平列表，否则返回树形")
    @GetMapping
    public ResponseEntity<List<PermissionDto>> list(
            @Parameter(description = "类型：menu/button") @RequestParam(required = false) String type) {
        return ResponseEntity.ok(permissionService.list(type));
    }

    @Operation(summary = "权限详情")
    @GetMapping("/{id}")
    public ResponseEntity<PermissionDto> getById(@Parameter(description = "权限 ID") @PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getById(id));
    }

    @Operation(summary = "创建权限")
    @PostMapping
    public ResponseEntity<PermissionDto> create(@Valid @RequestBody CreatePermissionRequest request) {
        PermissionDto created = permissionService.create(
                request.code(),
                request.name(),
                request.type(),
                request.parentId(),
                request.sortOrder());
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/permissions/" + created.getId()))
                .body(created);
    }

    @Operation(summary = "更新权限")
    @PutMapping("/{id}")
    public ResponseEntity<PermissionDto> update(
            @Parameter(description = "权限 ID") @PathVariable Long id,
            @Valid @RequestBody UpdatePermissionRequest request) {
        return ResponseEntity.ok(permissionService.update(id, request.name(), request.type(), request.parentId(), request.sortOrder()));
    }

    @Operation(summary = "删除权限")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Parameter(description = "权限 ID") @PathVariable Long id) {
        permissionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Schema(description = "创建权限请求")
    public record CreatePermissionRequest(
            @NotBlank @Size(max = 100) @Schema(description = "权限编码") String code,
            @NotBlank @Size(max = 100) @Schema(description = "权限名称") String name,
            @Schema(description = "类型：menu/button") String type,
            @Schema(description = "父权限 ID") Long parentId,
            @Schema(description = "排序") Integer sortOrder) {}

    @Schema(description = "更新权限请求")
    public record UpdatePermissionRequest(
            @Size(max = 100) @Schema(description = "权限名称") String name,
            @Schema(description = "类型：menu/button") String type,
            @Schema(description = "父权限 ID") Long parentId,
            @Schema(description = "排序") Integer sortOrder) {}
}
