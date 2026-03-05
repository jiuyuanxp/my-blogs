package com.blog.dto;

import com.blog.model.Category;
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
public class CategoryDto {

    private Long id;
    private Long parentId;
    private String name;
    private LocalDateTime createdAt;
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
