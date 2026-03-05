package com.blog.dto;

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
public class PageResponse<T> {

    private List<T> data;
    private PageMeta meta;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageMeta {
        private long total;
        private int page;
        private int pageSize;
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
