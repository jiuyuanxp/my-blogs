package com.blog.controller;

import com.blog.dto.CategoryDto;
import com.blog.model.Category;
import com.blog.service.CategoryService;
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

@Tag(name = "分类管理", description = "分类树形结构 CRUD")
@RestController
@Validated
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "获取分类树", description = "返回完整分类树，含子分类")
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getTree() {
        return ResponseEntity.ok(categoryService.getTree());
    }

    @Operation(summary = "创建分类")
    @PostMapping
    public ResponseEntity<CategoryDto> create(@Valid @RequestBody CreateCategoryRequest request) {
        Category created = categoryService.create(request.name(), request.parentId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/categories/" + created.getId()))
                .body(CategoryDto.from(created));
    }

    @Operation(summary = "更新分类")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> update(
            @Parameter(description = "分类 ID") @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        Category updated = categoryService.update(id, request.name(), request.parentId());
        return ResponseEntity.ok(CategoryDto.from(updated));
    }

    @Operation(summary = "删除分类")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "分类 ID") @PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Schema(description = "创建分类请求")
    public record CreateCategoryRequest(
            @NotBlank @Size(max = 100) @Schema(description = "分类名称") String name,
            @Schema(description = "父分类 ID，0 或 null 表示顶级") Long parentId) {}

    @Schema(description = "更新分类请求")
    public record UpdateCategoryRequest(
            @NotBlank @Size(max = 100) @Schema(description = "分类名称") String name,
            @Schema(description = "父分类 ID") Long parentId) {}
}
