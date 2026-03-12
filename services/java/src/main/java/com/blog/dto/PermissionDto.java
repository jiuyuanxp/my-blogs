package com.blog.dto;

import com.blog.model.Permission;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "权限信息")
public class PermissionDto {

    @Schema(description = "权限 ID")
    private Long id;

    @Schema(description = "权限编码")
    private String code;

    @Schema(description = "权限名称")
    private String name;

    @Schema(description = "类型：menu/button")
    private String type;

    @Schema(description = "父权限 ID")
    private Long parentId;

    @Schema(description = "排序")
    private Integer sortOrder;

    @Schema(description = "子权限")
    private List<PermissionDto> children;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    public static PermissionDto from(Permission p) {
        return PermissionDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .type(p.getType())
                .parentId(p.getParentId())
                .sortOrder(p.getSortOrder())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
