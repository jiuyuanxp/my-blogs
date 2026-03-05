package com.blog.controller;

import com.blog.dto.CommentDto;
import com.blog.dto.PageResponse;
import com.blog.service.CommentService;
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

@RestController
@Validated
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) Long articleId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "false") boolean includeDeleted,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int pageSize) {
        if (articleId != null && categoryId == null && !includeDeleted) {
            List<CommentDto> list = commentService.listByArticle(articleId);
            return ResponseEntity.ok(list);
        }
        PageResponse<CommentDto> result =
                commentService.list(articleId, categoryId, includeDeleted, page, pageSize);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<CommentDto> create(@Valid @RequestBody CreateCommentRequest request) {
        CommentDto created =
                commentService.create(request.articleId(), request.authorName(), request.content());
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/comments/" + created.getId()))
                .body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commentService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    public record CreateCommentRequest(
            @NotNull Long articleId,
            @NotBlank @Size(max = 50) String authorName,
            @NotBlank @Size(max = 2000) String content) {}
}
