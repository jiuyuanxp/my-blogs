package com.blog.dto;

import com.blog.model.Article;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDto {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String summary;
    private String content;
    private String status;
    private Integer views;
    private Integer isPinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ArticleDto from(Article a, String categoryName) {
        return ArticleDto.builder()
                .id(a.getId())
                .categoryId(a.getCategoryId())
                .categoryName(categoryName)
                .title(a.getTitle())
                .summary(a.getSummary())
                .content(a.getContent())
                .status(a.getStatus())
                .views(a.getViewCount())
                .isPinned(a.getIsPinned())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
