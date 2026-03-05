package com.blog.service;

import com.blog.model.Comment;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CommentRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ArticleRepository articleRepository;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public StatsSummary getSummary(String period) {
        LocalDateTime start = switch (period != null ? period : "day") {
            case "month" -> LocalDateTime.now().minusMonths(12);
            case "year" -> LocalDateTime.now().minusYears(2);
            default -> LocalDateTime.now().minusDays(30);
        };

        String dateFormat = switch (period != null ? period : "day") {
            case "month" -> "yyyy-MM";
            case "year" -> "yyyy";
            default -> "yyyy-MM-dd";
        };

        return StatsSummary.builder()
                .views(new ArrayList<>())
                .adds(getArticleAdds(start, dateFormat))
                .deletes(new ArrayList<>())
                .comments(getCommentAdds(start, dateFormat))
                .build();
    }

    private List<DateCount> getArticleAdds(LocalDateTime start, String dateFormat) {
        var articles = articleRepository.findAll().stream()
                .filter(a -> a.getCreatedAt().isAfter(start))
                .collect(Collectors.groupingBy(a -> formatDate(a.getCreatedAt(), dateFormat)));
        return articles.entrySet().stream()
                .map(e -> new DateCount(e.getKey(), e.getValue().size()))
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .toList();
    }

    private List<DateCount> getCommentAdds(LocalDateTime start, String dateFormat) {
        var comments = commentRepository.findAll().stream()
                .filter(c -> c.getCreatedAt().isAfter(start) && c.getDeletedAt() == null)
                .collect(Collectors.groupingBy(c -> formatDate(c.getCreatedAt(), dateFormat)));
        return comments.entrySet().stream()
                .map(e -> new DateCount(e.getKey(), e.getValue().size()))
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .toList();
    }

    private String formatDate(LocalDateTime dt, String format) {
        return switch (format) {
            case "yyyy-MM" -> dt.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            case "yyyy" -> dt.format(DateTimeFormatter.ofPattern("yyyy"));
            default -> dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        };
    }

    @Transactional(readOnly = true)
    public List<PopularArticleDto> getPopularViews(int limit) {
        return articleRepository.findAll().stream()
                .filter(a -> "published".equals(a.getStatus()))
                .sorted((a, b) -> Integer.compare(b.getViewCount(), a.getViewCount()))
                .limit(limit)
                .map(a -> new PopularArticleDto(a.getId(), a.getTitle(), a.getViewCount()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PopularCommentDto> getPopularComments(int limit) {
        return commentRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .collect(Collectors.groupingBy(Comment::getArticleId))
                .entrySet().stream()
                .map(e -> {
                    var article = articleRepository.findById(e.getKey());
                    String title = article.map(a -> a.getTitle()).orElse("");
                    return new PopularCommentDto(e.getKey(), title, e.getValue().size());
                })
                .sorted((a, b) -> Integer.compare(b.commentCount(), a.commentCount()))
                .limit(limit)
                .toList();
    }

    @Data
    @Builder
    public static class StatsSummary {
        private List<DateCount> views;
        private List<DateCount> adds;
        private List<DateCount> deletes;
        private List<DateCount> comments;
    }

    public record DateCount(String date, int count) {}

    public record PopularArticleDto(Long id, String title, Integer views) {}

    public record PopularCommentDto(Long id, String title, int commentCount) {}
}
