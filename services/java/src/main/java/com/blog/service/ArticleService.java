package com.blog.service;

import com.blog.model.Article;
import com.blog.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    public List<Article> getAllPublishedArticles() {
        return articleRepository.findByPublishedTrueOrderByCreatedAtDesc();
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article getArticleById(Long id) {
        return articleRepository.findById(id).orElse(null);
    }

    @Transactional
    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }

    @Transactional
    public Article updateArticle(Long id, Article article) {
        Article existingArticle = articleRepository.findById(id).orElse(null);
        if (existingArticle == null) {
            return null;
        }
        existingArticle.setTitle(article.getTitle());
        existingArticle.setContent(article.getContent());
        existingArticle.setSummary(article.getSummary());
        existingArticle.setPublished(article.getPublished());
        return articleRepository.save(existingArticle);
    }

    @Transactional
    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }
}
