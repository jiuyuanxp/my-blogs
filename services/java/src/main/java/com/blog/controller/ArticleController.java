package com.blog.controller;

import com.blog.model.Article;
import com.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        if (all) {
            return ResponseEntity.ok(articleService.getAllArticles());
        }
        return ResponseEntity.ok(articleService.getAllPublishedArticles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        if (article == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "文章不存在");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(article);
    }

    @PostMapping
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        Article createdArticle = articleService.createArticle(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdArticle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(
            @PathVariable Long id,
            @RequestBody Article article) {
        Article updatedArticle = articleService.updateArticle(id, article);
        if (updatedArticle == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "文章不存在");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(updatedArticle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}
