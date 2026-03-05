package com.blog.controller;

import com.blog.dto.ArticleDto;
import com.blog.dto.PageResponse;
import com.blog.model.Article;
import com.blog.service.ArticleService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<PageResponse<ArticleDto>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "false") boolean all,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int pageSize) {
        PageResponse<ArticleDto> result =
                articleService.list(categoryId, status, all, page, pageSize);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDto> getById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean incrementView,
            jakarta.servlet.http.HttpServletRequest request) {
        Boolean authenticated = (Boolean) request.getAttribute("authenticated");
        boolean requirePublished = authenticated == null || !authenticated;
        ArticleDto dto =
                incrementView
                        ? articleService.getByIdAndIncrementView(id)
                        : articleService.getById(id, requirePublished);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<ArticleDto> create(@Valid @RequestBody CreateArticleRequest request) {
        Article article = new Article();
        article.setCategoryId(request.categoryId());
        article.setTitle(request.title());
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setStatus(request.status() != null ? request.status() : "draft");
        article.setIsPinned(request.isPinned() != null ? request.isPinned() : 0);
        ArticleDto created = articleService.create(article);
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/articles/" + created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleDto> update(
            @PathVariable Long id, @Valid @RequestBody UpdateArticleRequest request) {
        Article article = new Article();
        article.setCategoryId(request.categoryId());
        article.setTitle(request.title());
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setStatus(request.status());
        article.setIsPinned(request.isPinned());
        ArticleDto updated = articleService.update(id, article);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record CreateArticleRequest(
            @NotNull(message = "分类不能为空") Long categoryId,
            @NotBlank @Size(max = 200) String title,
            @Size(max = 500) String summary,
            @NotBlank String content,
            String status,
            Integer isPinned) {}

    public record UpdateArticleRequest(
            Long categoryId,
            @Size(max = 200) String title,
            @Size(max = 500) String summary,
            String content,
            String status,
            Integer isPinned) {}
}
