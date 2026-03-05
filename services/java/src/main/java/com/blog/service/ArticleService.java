package com.blog.service;

import com.blog.dto.ArticleDto;
import com.blog.dto.PageResponse;
import com.blog.exception.ResourceNotFoundException;
import com.blog.model.Article;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CategoryRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;

    private static final int MAX_PAGE_SIZE = 100;

    @Transactional(readOnly = true)
    public PageResponse<ArticleDto> list(
            Long categoryId, String status, boolean all, int page, int pageSize) {
        int size = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
        Pageable pageable =
                PageRequest.of(Math.max(page - 1, 0), size, Sort.by("isPinned").descending().and(Sort.by("createdAt").descending()));

        String effectiveStatus = status;
        if (effectiveStatus == null && !all) {
            effectiveStatus = "published";
        }

        Page<Article> articlePage =
                articleRepository.findByCategoryAndStatus(categoryId, effectiveStatus, pageable);

        Map<Long, String> categoryNames = loadCategoryNames(articlePage.getContent());
        List<ArticleDto> dtos =
                articlePage.getContent().stream()
                        .map(a -> ArticleDto.from(a, categoryNames.getOrDefault(a.getCategoryId(), "")))
                        .collect(Collectors.toList());

        return PageResponse.of(articlePage, dtos);
    }

    @Transactional(readOnly = true)
    public ArticleDto getById(Long id, boolean requirePublished) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            throw new ResourceNotFoundException("文章不存在");
        }
        if (requirePublished && !"published".equals(article.getStatus())) {
            throw new ResourceNotFoundException("文章不存在");
        }
        String categoryName =
                categoryRepository.findById(article.getCategoryId()).map(c -> c.getName()).orElse("");
        return ArticleDto.from(article, categoryName);
    }

    @Transactional
    public ArticleDto getByIdAndIncrementView(Long id) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            throw new ResourceNotFoundException("文章不存在");
        }
        if (!"published".equals(article.getStatus())) {
            throw new ResourceNotFoundException("文章不存在");
        }
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);
        String categoryName =
                categoryRepository.findById(article.getCategoryId()).map(c -> c.getName()).orElse("");
        return ArticleDto.from(article, categoryName);
    }

    @Transactional
    public ArticleDto create(Article article) {
        if (categoryRepository.findById(article.getCategoryId()).isEmpty()) {
            throw new com.blog.exception.BusinessException("category_not_found", "分类不存在");
        }
        Article saved = articleRepository.save(article);
        String categoryName =
                categoryRepository.findById(saved.getCategoryId()).map(c -> c.getName()).orElse("");
        return ArticleDto.from(saved, categoryName);
    }

    @Transactional
    public ArticleDto update(Long id, Article article) {
        Article existing =
                articleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("文章不存在"));
        if (article.getTitle() != null) {
            existing.setTitle(article.getTitle());
        }
        if (article.getSummary() != null) {
            existing.setSummary(article.getSummary());
        }
        if (article.getContent() != null) {
            existing.setContent(article.getContent());
        }
        if (article.getStatus() != null) {
            existing.setStatus(article.getStatus());
        }
        if (article.getCategoryId() != null) {
            if (categoryRepository.findById(article.getCategoryId()).isEmpty()) {
                throw new com.blog.exception.BusinessException("category_not_found", "分类不存在");
            }
            existing.setCategoryId(article.getCategoryId());
        }
        if (article.getIsPinned() != null) {
            existing.setIsPinned(article.getIsPinned());
        }
        Article saved = articleRepository.save(existing);
        String categoryName =
                categoryRepository.findById(saved.getCategoryId()).map(c -> c.getName()).orElse("");
        return ArticleDto.from(saved, categoryName);
    }

    @Transactional
    public void delete(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("文章不存在");
        }
        articleRepository.deleteById(id);
    }

    private Map<Long, String> loadCategoryNames(List<Article> articles) {
        List<Long> categoryIds =
                articles.stream().map(Article::getCategoryId).distinct().collect(Collectors.toList());
        return categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(com.blog.model.Category::getId, com.blog.model.Category::getName));
    }
}
