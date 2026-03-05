package com.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "分页响应")
public class PageResponse<T> {

    @Schema(description = "数据列表")
    private List<T> data;

    @Schema(description = "分页元信息")
    private PageMeta meta;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "分页元信息")
    public static class PageMeta {
        @Schema(description = "总记录数")
        private long total;

        @Schema(description = "当前页码")
        private int page;

        @Schema(description = "每页条数")
        private int pageSize;

        @Schema(description = "总页数")
        private int totalPages;
    }

    public static <T> PageResponse<T> of(Page<?> page, List<T> content) {
        return PageResponse.<T>builder()
                .data(content)
                .meta(
                        new PageMeta(
                                page.getTotalElements(),
                                page.getNumber() + 1,
                                page.getSize(),
                                page.getTotalPages()))
                .build();
    }
}
