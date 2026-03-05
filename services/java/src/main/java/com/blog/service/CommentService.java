package com.blog.service;

import com.blog.dto.CommentDto;
import com.blog.dto.PageResponse;
import com.blog.exception.BusinessException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.model.Comment;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CategoryRepository;
import com.blog.repository.CommentRepository;
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
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;

    private static final int MAX_PAGE_SIZE = 100;

    @Transactional(readOnly = true)
    public PageResponse<CommentDto> list(
            Long articleId, Long categoryId, boolean includeDeleted, int page, int pageSize) {
        int size = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by("createdAt").descending());

        Page<Comment> commentPage;
        if (articleId != null) {
            commentPage = commentRepository.findByArticleId(articleId, includeDeleted, pageable);
        } else if (categoryId != null) {
            commentPage = commentRepository.findByCategoryId(categoryId, includeDeleted, pageable);
        } else {
            commentPage = commentRepository.findAll(includeDeleted, pageable);
        }

        List<Long> articleIds =
                commentPage.getContent().stream().map(Comment::getArticleId).distinct().collect(Collectors.toList());
        Map<Long, String> articleTitles =
                articleRepository.findAllById(articleIds).stream()
                        .collect(Collectors.toMap(com.blog.model.Article::getId, com.blog.model.Article::getTitle));

        List<CommentDto> dtos =
                commentPage.getContent().stream()
                        .map(c -> CommentDto.from(c, articleTitles.getOrDefault(c.getArticleId(), "")))
                        .collect(Collectors.toList());

        return PageResponse.of(commentPage, dtos);
    }

    @Transactional(readOnly = true)
    public List<CommentDto> listByArticle(Long articleId) {
        List<Comment> comments = commentRepository.findByArticleIdAndDeletedAtIsNullOrderByCreatedAtDesc(articleId);
        String title = articleRepository.findById(articleId).map(com.blog.model.Article::getTitle).orElse("");
        return comments.stream().map(c -> CommentDto.from(c, title)).collect(Collectors.toList());
    }

    @Transactional
    public CommentDto create(Long articleId, String authorName, String content) {
        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("文章不存在");
        }
        var article = articleRepository.findById(articleId).orElseThrow();
        if (!"published".equals(article.getStatus())) {
            throw new ResourceNotFoundException("文章不存在或未发布");
        }
        Comment comment = new Comment();
        comment.setArticleId(articleId);
        comment.setAuthorName(authorName);
        comment.setContent(content);
        Comment saved = commentRepository.save(comment);
        return CommentDto.fromSimple(saved);
    }

    @Transactional
    public void softDelete(Long id) {
        Comment comment =
                commentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("评论不存在"));
        comment.setDeletedAt(java.time.LocalDateTime.now());
        commentRepository.save(comment);
    }
}
