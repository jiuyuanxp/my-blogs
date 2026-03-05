package com.blog.service;

import com.blog.model.Comment;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CommentRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema(description = "统计摘要")
    public static class StatsSummary {
        @Schema(description = "浏览量趋势")
        private List<DateCount> views;

        @Schema(description = "新增文章趋势")
        private List<DateCount> adds;

        @Schema(description = "删除文章趋势")
        private List<DateCount> deletes;

        @Schema(description = "评论量趋势")
        private List<DateCount> comments;
    }

    @Schema(description = "日期-数量")
    public record DateCount(
            @Schema(description = "日期") String date,
            @Schema(description = "数量") int count) {}

    @Schema(description = "热门文章（按浏览量）")
    public record PopularArticleDto(
            @Schema(description = "文章 ID") Long id,
            @Schema(description = "文章标题") String title,
            @Schema(description = "浏览次数") Integer views) {}

    @Schema(description = "热门文章（按评论数）")
    public record PopularCommentDto(
            @Schema(description = "文章 ID") Long id,
            @Schema(description = "文章标题") String title,
            @Schema(description = "评论数量") int commentCount) {}
}
