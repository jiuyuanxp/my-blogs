package com.blog.dto;

import com.blog.model.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "分类 DTO")
public class CategoryDto {

    @Schema(description = "分类 ID")
    private Long id;

    @Schema(description = "父分类 ID，0 表示顶级")
    private Long parentId;

    @Schema(description = "分类名称")
    private String name;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "子分类列表")
    @Builder.Default
    private List<CategoryDto> children = new ArrayList<>();

    public static CategoryDto from(Category c) {
        return CategoryDto.builder()
                .id(c.getId())
                .parentId(c.getParentId())
                .name(c.getName())
                .createdAt(c.getCreatedAt())
                .children(new ArrayList<>())
                .build();
    }

    public static CategoryDto fromWithChildren(Category c, List<CategoryDto> children) {
        return CategoryDto.builder()
                .id(c.getId())
                .parentId(c.getParentId())
                .name(c.getName())
                .createdAt(c.getCreatedAt())
                .children(children != null ? children : new ArrayList<>())
                .build();
    }
}
