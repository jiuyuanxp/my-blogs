package com.blog.dto;

import com.blog.model.Comment;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {

    private Long id;
    private Long articleId;
    private String articleTitle;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;

    public static CommentDto from(Comment c, String articleTitle) {
        return CommentDto.builder()
                .id(c.getId())
                .articleId(c.getArticleId())
                .articleTitle(articleTitle)
                .authorName(c.getAuthorName())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .deletedAt(c.getDeletedAt())
                .build();
    }

    public static CommentDto fromSimple(Comment c) {
        return CommentDto.builder()
                .id(c.getId())
                .articleId(c.getArticleId())
                .authorName(c.getAuthorName())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
