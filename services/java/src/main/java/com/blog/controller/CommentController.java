package com.blog.controller;

import com.blog.dto.CommentDto;
import com.blog.dto.PageResponse;
import com.blog.service.CommentService;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "评论管理", description = "评论列表、创建、软删除")
@RestController
@Validated
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "评论列表", description = "articleId 时返回该文章评论；否则分页查询，includeDeleted 需认证")
    @GetMapping
    public ResponseEntity<?> list(
            @Parameter(description = "文章 ID") @RequestParam(required = false) Long articleId,
            @Parameter(description = "分类 ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "是否包含已删除") @RequestParam(required = false, defaultValue = "false") boolean includeDeleted,
            @Parameter(description = "页码") @RequestParam(required = false, defaultValue = "1") int page,
            @Parameter(description = "每页条数") @RequestParam(required = false, defaultValue = "20") int pageSize) {
        if (articleId != null && categoryId == null && !includeDeleted) {
            List<CommentDto> list = commentService.listByArticle(articleId);
            return ResponseEntity.ok(list);
        }
        PageResponse<CommentDto> result =
                commentService.list(articleId, categoryId, includeDeleted, page, pageSize);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "创建评论")
    @PostMapping
    public ResponseEntity<CommentDto> create(@Valid @RequestBody CreateCommentRequest request) {
        CommentDto created =
                commentService.create(request.articleId(), request.authorName(), request.content());
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/comments/" + created.getId()))
                .body(created);
    }

    @Operation(summary = "删除评论", description = "软删除")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "评论 ID") @PathVariable Long id) {
        commentService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @Schema(description = "创建评论请求")
    public record CreateCommentRequest(
            @NotNull @Schema(description = "文章 ID") Long articleId,
            @NotBlank @Size(max = 50) @Schema(description = "作者昵称") String authorName,
            @NotBlank @Size(max = 2000) @Schema(description = "评论内容") String content) {}
}
