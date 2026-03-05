package com.blog.controller;

import com.blog.dto.CategoryDto;
import com.blog.model.Category;
import com.blog.service.CategoryService;
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

@RestController
@Validated
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getTree() {
        return ResponseEntity.ok(categoryService.getTree());
    }

    @PostMapping
    public ResponseEntity<CategoryDto> create(@Valid @RequestBody CreateCategoryRequest request) {
        Category created = categoryService.create(request.name(), request.parentId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/categories/" + created.getId()))
                .body(CategoryDto.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> update(
            @PathVariable Long id, @Valid @RequestBody UpdateCategoryRequest request) {
        Category updated = categoryService.update(id, request.name(), request.parentId());
        return ResponseEntity.ok(CategoryDto.from(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record CreateCategoryRequest(
            @NotBlank @Size(max = 100) String name, Long parentId) {}

    public record UpdateCategoryRequest(
            @NotBlank @Size(max = 100) String name, Long parentId) {}
}
