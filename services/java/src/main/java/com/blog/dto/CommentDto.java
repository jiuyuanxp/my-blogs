package com.blog.dto;

import com.blog.model.Comment;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "评论 DTO")
public class CommentDto {

    @Schema(description = "评论 ID")
    private Long id;

    @Schema(description = "文章 ID")
    private Long articleId;

    @Schema(description = "文章标题")
    private String articleTitle;

    @Schema(description = "作者昵称")
    private String authorName;

    @Schema(description = "评论内容")
    private String content;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "软删除时间，null 表示未删除")
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
