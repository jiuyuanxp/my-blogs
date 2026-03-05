package com.blog.dto;

import com.blog.model.Article;
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
@Schema(description = "文章 DTO")
public class ArticleDto {

    @Schema(description = "文章 ID")
    private Long id;

    @Schema(description = "分类 ID")
    private Long categoryId;

    @Schema(description = "分类名称")
    private String categoryName;

    @Schema(description = "标题")
    private String title;

    @Schema(description = "摘要")
    private String summary;

    @Schema(description = "正文内容")
    private String content;

    @Schema(description = "状态：draft-草稿，published-已发布")
    private String status;

    @Schema(description = "浏览次数")
    private Integer views;

    @Schema(description = "是否置顶：0-否，1-是")
    private Integer isPinned;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
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
