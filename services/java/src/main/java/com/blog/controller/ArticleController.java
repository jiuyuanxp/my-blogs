package com.blog.controller;

import com.blog.dto.ArticleDto;
import com.blog.dto.PageResponse;
import com.blog.model.Article;
import com.blog.service.ArticleService;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "文章管理", description = "文章 CRUD、分页、详情")
@RestController
@Validated
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

        private final ArticleService articleService;

        @Operation(summary = "文章列表", description = "分页查询，支持按分类、状态筛选；all=true 需认证")
        @GetMapping
        public ResponseEntity<PageResponse<ArticleDto>> list(
                        @Parameter(description = "分类 ID") @RequestParam(required = false) Long categoryId,
                        @Parameter(description = "状态：draft/published") @RequestParam(required = false) String status,
                        @Parameter(description = "是否包含草稿，需认证") @RequestParam(required = false, defaultValue = "false") boolean all,
                        @Parameter(description = "页码") @RequestParam(required = false, defaultValue = "1") int page,
                        @Parameter(description = "每页条数") @RequestParam(required = false, defaultValue = "20") int pageSize) {
                PageResponse<ArticleDto> result = articleService.list(categoryId, status, all, page, pageSize);
                return ResponseEntity.ok(result);
        }

        @Operation(summary = "文章详情", description = "incrementView=true 时增加浏览次数")
        @GetMapping("/{id}")
        public ResponseEntity<ArticleDto> getById(
                        @Parameter(description = "文章 ID") @PathVariable Long id,
                        @Parameter(description = "是否增加浏览次数") @RequestParam(required = false, defaultValue = "false") boolean incrementView,
                        @Parameter(hidden = true) jakarta.servlet.http.HttpServletRequest request) {
                Boolean authenticated = (Boolean) request.getAttribute("authenticated");
                boolean requirePublished = authenticated == null || !authenticated;
                ArticleDto dto = incrementView
                                ? articleService.getByIdAndIncrementView(id)
                                : articleService.getById(id, requirePublished);
                return ResponseEntity.ok(dto);
        }

        @Operation(summary = "创建文章")
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

        @Operation(summary = "更新文章")
        @PutMapping("/{id}")
        public ResponseEntity<ArticleDto> update(
                        @Parameter(description = "文章 ID") @PathVariable Long id,
                        @Valid @RequestBody UpdateArticleRequest request) {
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

        @Operation(summary = "删除文章")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(
                        @Parameter(description = "文章 ID") @PathVariable Long id) {
                articleService.delete(id);
                return ResponseEntity.noContent().build();
        }

        @Schema(description = "创建文章请求")
        public record CreateArticleRequest(
                        @NotNull(message = "分类不能为空") @Schema(description = "分类 ID") Long categoryId,
                        @NotBlank @Size(max = 200) @Schema(description = "标题") String title,
                        @Size(max = 500) @Schema(description = "摘要") String summary,
                        @NotBlank @Schema(description = "正文") String content,
                        @Schema(description = "状态：draft/published") String status,
                        @Schema(description = "是否置顶：0/1") Integer isPinned) {}

        @Schema(description = "更新文章请求")
        public record UpdateArticleRequest(
                        @Schema(description = "分类 ID") Long categoryId,
                        @Size(max = 200) @Schema(description = "标题") String title,
                        @Size(max = 500) @Schema(description = "摘要") String summary,
                        @Schema(description = "正文") String content,
                        @Schema(description = "状态：draft/published") String status,
                        @Schema(description = "是否置顶：0/1") Integer isPinned) {}
}
